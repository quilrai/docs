"""Public, unauthenticated hourly-rollup API for the docs status page's Gateway Health tab."""

import math
import os
import sqlite3
import time
from datetime import datetime, timezone

import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

HOUR_MS = 3_600_000
DB_PATH = os.environ["GATEWAY_HEALTH_DB_PATH"]  # path to the MCP Gateway's gateway.db - not defaulted, this repo is public

# Allowlist of what's exposed publicly; "group" partitions rows in the frontend.
PUBLIC_ROLLUP_COMPONENTS = [
    {
        "id": "mcp-direct",
        "group": "mcp",
        "component": "mcp",
        "scenario": "direct",
        "label": "MCP Gateway",
        "kind": "Backend",
        "note": "Live check through a real backend connection.",
    },
    {
        "id": "mcp-onemcp",
        "group": "mcp",
        "component": "mcp",
        "scenario": "onemcp",
        "label": "OneMCP Router",
        "kind": "Router",
        "note": "Live check through the OneMCP aggregation router.",
    },
    # Real reachability check against production regions, same hosts as the QuilrAI Infrastructure tab's ping.
    {
        "id": "llm-region-usa-1",
        "group": "llm",
        "component": "llm-region",
        "scenario": "usa-1",
        "label": "US Central West",
        "kind": "Region",
        "host": "guardrails-usa-1.quilr.ai",
        "note": "Live HTTPS reachability against the real production host.",
    },
    {
        "id": "llm-region-usa-2",
        "group": "llm",
        "component": "llm-region",
        "scenario": "usa-2",
        "label": "US East",
        "kind": "Region",
        "host": "guardrails-usa-2.quilr.ai",
        "note": "Live HTTPS reachability against the real production host.",
    },
    {
        "id": "llm-region-india-1",
        "group": "llm",
        "component": "llm-region",
        "scenario": "india-1",
        "label": "India · Mumbai",
        "kind": "Region",
        "host": "guardrails-india-1.quilr.ai",
        "note": "Live HTTPS reachability against the real production host.",
    },
    # Deep functional checks: full request pipeline including real guardrails/DLP scanning.
    {
        "id": "llm-chat",
        "group": "llm",
        "component": "llm",
        "scenario": "chat",
        "label": "Chat Completions",
        "kind": "Completions",
        "note": "Exercises the full request pipeline, including guardrails/DLP scanning.",
    },
    {
        "id": "llm-streaming",
        "group": "llm",
        "component": "llm",
        "scenario": "streaming",
        "label": "Streaming",
        "kind": "Completions",
        "note": "Exercises the same pipeline through the streaming response path.",
    },
    {
        "id": "llm-models",
        "group": "llm",
        "component": "llm",
        "scenario": "models",
        "label": "Model Listing",
        "kind": "Metadata",
        "note": "Verifies authentication and the model registry lookup.",
    },
]

_CACHE_TTL_SECONDS = 30
_cache = {}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _rows_since(since_iso, components):
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    try:
        placeholders = ",".join("?" for _ in components)
        cursor = conn.execute(
            f"""
            SELECT component, scenario, status, health, duration_ms, created_at
            FROM gateway_health_probe_runs
            WHERE created_at >= ? AND component IN ({placeholders})
            ORDER BY created_at ASC
            """,
            (since_iso, *components),
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def _hour_bucket_ms(created_at):
    dt = datetime.fromisoformat(created_at)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp() * 1000) // HOUR_MS * HOUR_MS


def _hourly_rollup(rows, component, scenario, window_start_ms, window_end_ms):
    """Bucket raw probe rows into UTC hourly buckets; empty hours are 'nodata', not fabricated as healthy."""
    by_hour = {}
    for row in rows:
        if row["component"] != component or row["scenario"] != scenario:
            continue
        try:
            hour_ms = _hour_bucket_ms(row["created_at"])
        except ValueError:
            continue
        by_hour.setdefault(hour_ms, []).append(row)

    buckets = []
    t = window_start_ms
    while t <= window_end_ms:
        hour_rows = by_hour.get(t)
        if not hour_rows:
            buckets.append({"t": t, "state": "nodata", "p95": None, "errorRate": 0, "requests": 0, "incidentId": None})
        else:
            total = len(hour_rows)
            failures = sum(1 for r in hour_rows if r["status"] == "failure")
            slow = sum(1 for r in hour_rows if r["status"] == "slow")
            durations = sorted(
                r["duration_ms"] for r in hour_rows if r["duration_ms"] is not None and r["status"] in ("success", "slow")
            )
            if failures == total:
                state = "major"
            elif failures > 0:
                state = "partial"
            elif slow > 0:
                state = "degraded"
            else:
                state = "operational"
            p95 = None
            if durations:
                idx = max(0, math.ceil(0.95 * len(durations)) - 1)
                p95 = durations[idx]
            buckets.append(
                {
                    "t": t,
                    "state": state,
                    "p95": p95,
                    "errorRate": round((failures / total) * 100, 2),
                    "requests": total,
                    "incidentId": None,
                }
            )
        t += HOUR_MS
    return buckets


@app.get("/api/public/gateway-health/rollup")
async def get_public_gateway_health_rollup(days: int = Query(default=14, ge=1, le=90)):
    now_ts = time.time()
    cached = _cache.get(days)
    if cached and (now_ts - cached["computed_at"]) < _CACHE_TTL_SECONDS:
        return cached["payload"]

    now = datetime.utcnow()
    window_end_ms = int(datetime(now.year, now.month, now.day, now.hour, tzinfo=timezone.utc).timestamp() * 1000)
    window_start_ms = window_end_ms - (days * 24 - 1) * HOUR_MS
    since_iso = datetime.utcfromtimestamp(window_start_ms / 1000).isoformat()

    wanted_components = sorted({c["component"] for c in PUBLIC_ROLLUP_COMPONENTS})
    rows = _rows_since(since_iso, wanted_components)

    components_payload = [
        {
            "id": comp_def["id"],
            "group": comp_def["group"],
            "label": comp_def["label"],
            "kind": comp_def["kind"],
            "host": comp_def.get("host"),
            "note": comp_def["note"],
            "buckets": _hourly_rollup(rows, comp_def["component"], comp_def["scenario"], window_start_ms, window_end_ms),
        }
        for comp_def in PUBLIC_ROLLUP_COMPONENTS
    ]

    payload = {
        "generated_at": datetime.utcnow().isoformat(),
        "window_start": window_start_ms,
        "window_end": window_end_ms,
        "components": components_payload,
    }
    _cache[days] = {"payload": payload, "computed_at": now_ts}
    return payload


if __name__ == "__main__":
    port = int(os.environ.get("GATEWAY_HEALTH_ROLLUP_PORT", "8099"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
