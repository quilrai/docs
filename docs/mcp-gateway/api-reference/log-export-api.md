---
sidebar_position: 1
sidebar_label: "Log export API"
sidebar_custom_props:
  icon: ClipboardList
description: "Export server-scoped or tenant-scoped MCP tool call logs as newline-delimited JSON with cursor pagination, a 15-minute export lag, and a 15-day retention window."
---

# MCP Gateway Log Export API

Use the Log Export API to read MCP Gateway tool call logs from your own data platform, SIEM, warehouse, or scheduled export job.

The API returns newline-delimited JSON. Each response line is one complete JSON object, so clients can stream, parse, and checkpoint logs incrementally.

```http
GET https://<your-gateway-host>/mcpgateway/logs/export
```

Response content type:

```http
Content-Type: application/x-ndjson
```

## Authentication

Pass a log export key from MCP Gateway:

```http
X-Quilr-Log-Export-Key: sk-export-...
```

Do not use your MCP API token or admin API key as the request credential for this endpoint. The log export key is separate from tool-call authentication and management API authentication.

MCP Gateway exposes two export scopes:

| Export key | Scope |
|------------|-------|
| `log_export_key` | Exports logs only for the MCP backend it belongs to. |
| `tenant_log_export_key` | Exports logs for all MCP backends in the tenant. |

Both scopes use the same endpoint, header, query parameters, pagination model, and response format. In tenant-scoped exports, each `mcpgateway.tool_call` event still includes the concrete backend in `backend.id` and `backend.name`.

Admin backend management responses include `log_export_key` for each backend and `tenant_log_export_key` for the tenant. Treat both as bearer secrets. They cannot call MCP tools, but they can read exportable tool call logs for their scope.

## Query Parameters

All query parameters are optional.

| Parameter | Description |
|-----------|-------------|
| `start_time` | ISO 8601 lower bound for exported logs. Naive timestamps are treated as UTC. |
| `end_time` | ISO 8601 upper bound for exported logs. Naive timestamps are treated as UTC. |
| `cursor` | Opaque cursor from the previous `checkpoint.next_cursor`. When provided, it wins over `start_time`. |
| `limit` | Maximum tool call rows to export in this response. Default `1000`, maximum `5000`. |

Logs are available for a maximum of 15 days. Choose `start_time` within that retention window when backfilling. Requests with an effective `start_time`, `end_time`, or cursor timestamp before the retention window fail with `400`.

If neither `start_time` nor `cursor` is provided, the API exports a default 24-hour window ending at the effective export end time.

## Export Lag

The API does not export logs newer than 15 minutes. Gateway logs and prediction payloads are written asynchronously, so this lag keeps exported rows stable.

If `end_time` is newer than `now - 15 minutes`, the server clamps it to the maximum exportable time. The request still succeeds. The `export_started` and `checkpoint` events include the effective export bounds.

## Request Examples

Start a backend-scoped export window, here the hour that ended two hours ago (logs are kept for 15 days, so fixed dates go stale):

```bash
# macOS (BSD date) first, GNU date as fallback
START=$(date -u -v-3H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '3 hours ago' +%Y-%m-%dT%H:%M:%SZ)
END=$(date -u -v-2H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '2 hours ago' +%Y-%m-%dT%H:%M:%SZ)

curl -N \
  -H "X-Quilr-Log-Export-Key: sk-export-..." \
  "https://<your-gateway-host>/mcpgateway/logs/export?start_time=$START&end_time=$END&limit=1000"
```

Start a tenant-scoped export window:

```bash
curl -N \
  -H "X-Quilr-Log-Export-Key: sk-exportl-..." \
  "https://<your-gateway-host>/mcpgateway/logs/export?start_time=$START&end_time=$END&limit=1000"
```

Resume from the previous checkpoint:

```bash
curl -N \
  -H "X-Quilr-Log-Export-Key: sk-export-..." \
  "https://<your-gateway-host>/mcpgateway/logs/export?cursor=<next_cursor>"
```

When resuming with `cursor`, you do not need to pass `start_time` or `end_time`.

## Pagination

Rows are ordered by:

```sql
started_at ASC, id ASC
```

The cursor is opaque. Store it exactly as returned in `checkpoint.next_cursor` and send it back as the `cursor` query parameter on the next request.

If `checkpoint.has_more` is `true`, call the endpoint again immediately with `cursor=<next_cursor>`.

If `checkpoint.has_more` is `false`, there are no more rows in the current effective window. Store `next_cursor` and poll later with that cursor to continue incremental export.

When an initial request returns zero rows, the API still returns a checkpoint cursor pinned to the effective end time. This lets exporters store one cursor value even for empty windows.

## A reliable collector

A minimal Python collector (standard library only) that you can run on a schedule or as a service. It:

- stores rows and the cursor in **one SQLite transaction**, so the cursor only advances after the page is safely written;
- writes idempotently (`INSERT OR IGNORE` on a unique id), so a replayed page never creates duplicates;
- treats a mid-stream `error` event or a stream without a `checkpoint` as a failed page, and retries it with exponential backoff and jitter;
- stops on `400`, `401` and `403`, which retrying cannot fix.

```python title="collector.py"
"""Minimal MCP Gateway log collector: cursor checkpoint, retries, idempotent writes."""
import json, os, random, sqlite3, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

URL = os.environ["EXPORT_URL"]  # https://<your-gateway-host>/mcpgateway/logs/export
KEY = os.environ["QUILR_LOG_EXPORT_KEY"]
EVENT = "mcpgateway.tool_call"
row_id = lambda e: str(e["request"]["log_id"])  # unique per tool call log row

db = sqlite3.connect("quilr_logs.db")
db.execute("CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, ts TEXT, body TEXT)")
db.execute("CREATE TABLE IF NOT EXISTS state (k TEXT PRIMARY KEY, v TEXT)")

def saved_cursor():
    row = db.execute("SELECT v FROM state WHERE k = 'cursor'").fetchone()
    return row[0] if row else None

def fetch_page(params):
    """Return (events, checkpoint) for one complete page, or raise."""
    req = urllib.request.Request(URL + "?" + urllib.parse.urlencode(params),
                                 headers={"X-Quilr-Log-Export-Key": KEY})
    events, checkpoint = [], None
    with urllib.request.urlopen(req, timeout=300) as r:  # raises HTTPError on 4xx/5xx
        for line in r:
            if not line.strip():
                continue
            msg = json.loads(line)
            if msg["type"] == "error":  # can arrive after HTTP 200
                raise RuntimeError(f"export error: {msg['error']}")
            if msg["type"] == EVENT:
                events.append(msg)
            elif msg["type"] == "checkpoint":
                checkpoint = msg
    if checkpoint is None:
        raise RuntimeError("stream ended without a checkpoint")
    return events, checkpoint

def with_retries(fn, *args, attempts=6):
    for n in range(attempts):
        try:
            return fn(*args)
        except urllib.error.HTTPError as e:
            if e.code in (400, 401, 403) or n == attempts - 1:
                raise  # fix the key or the window; retrying will not help
        except (OSError, RuntimeError, ValueError):  # network, mid-stream error, truncation
            if n == attempts - 1:
                raise
        time.sleep(min(60, 2 ** n) + random.random())  # backoff with jitter

def run_once():
    cursor = saved_cursor()
    if cursor:
        params = {"cursor": cursor, "limit": 1000}
    else:  # first run: start one hour back, well inside the 15-day retention
        start = datetime.now(timezone.utc) - timedelta(hours=1)
        params = {"start_time": start.strftime("%Y-%m-%dT%H:%M:%SZ"), "limit": 1000}
    while True:
        events, checkpoint = with_retries(fetch_page, params)
        with db:  # one transaction: rows and cursor commit together
            db.executemany(
                "INSERT OR IGNORE INTO events VALUES (?, ?, ?)",
                [(row_id(e), e["request"]["started_at"], json.dumps(e)) for e in events])
            db.execute("INSERT OR REPLACE INTO state VALUES ('cursor', ?)",
                       (checkpoint["next_cursor"],))
        print(f"stored {checkpoint['rows']} rows up to {checkpoint['effective_end_time']}")
        if not checkpoint["has_more"]:
            return
        params = {"cursor": checkpoint["next_cursor"], "limit": 1000}

if __name__ == "__main__":
    while True:
        run_once()
        time.sleep(300)  # new rows appear about 15 minutes after the request
```

```bash
export EXPORT_URL='https://<your-gateway-host>/mcpgateway/logs/export'
export QUILR_LOG_EXPORT_KEY='sk-export-...'
python3 collector.py
```

To forward to a SIEM instead of SQLite, replace the `with db:` block with your sink's write, and persist `next_cursor` only after the sink acknowledges the batch. If the collector is down for longer than the 15-day retention, the saved cursor fails with `400`; delete it to restart from a recent `start_time`.

### Verify delivery

1. Call one tool through an MCP covered by the export key and note the time and tool name.
2. After at least 15 minutes, run the collector once.
3. Check that the row arrived: `sqlite3 quilr_logs.db "SELECT id, ts, json_extract(body, '$.tool.name') FROM events ORDER BY ts DESC LIMIT 5"`.


## Coverage

The export covers MCP Gateway tool call traffic for the selected export scope, including:

| Data type | Exported |
|-----------|----------|
| Tool call request metadata | Yes |
| Tool name | Yes |
| Tool arguments | Yes, with credential redaction |
| Tool response content | Yes, with credential redaction |
| Input guardrail outcome and predictions | Yes, with credential redaction |
| Output guardrail outcome and predictions | Yes, with credential redaction |
| User email | Yes |
| Agent identity from `User-Agent` | Yes |
| Extra metadata | Yes, with credential redaction |
| Raw bearer tokens | No |
| Raw request headers | No |
| Backend transport URLs | No |

## Response Events

Every successful response starts with `export_started`, contains zero or more `mcpgateway.tool_call` events, and ends with `checkpoint`.

### `export_started`

The first line describes the export scope and effective export window.

```json
{
  "type": "export_started",
  "schema_version": "v1",
  "backend": {
    "id": "backend_a1b2c3",
    "name": "My Jira MCP"
  },
  "effective_start_time": "2026-05-14T00:00:00.000000Z",
  "effective_end_time": "2026-05-14T01:00:00.000000Z",
  "max_exportable_time": "2026-05-14T10:45:00.000000Z",
  "end_time_clamped": false,
  "limit": 1000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `export_started`. |
| `schema_version` | string | Event schema version. Current value is `v1`. |
| `backend` | object or omitted | MCP backend metadata for a backend-scoped export. Omitted for tenant-scoped exports. |
| `scope` | object or omitted | Tenant export scope metadata for a tenant-scoped export. Omitted for backend-scoped exports. |
| `effective_start_time` | string | ISO 8601 timestamp where this export starts. |
| `effective_end_time` | string | ISO 8601 timestamp where this export ends. |
| `max_exportable_time` | string | Newest timestamp eligible for export after the 15-minute lag. |
| `end_time_clamped` | boolean | `true` when the requested `end_time` was newer than `max_exportable_time`. |
| `limit` | number | Maximum tool call rows returned in this response. |

For tenant-scoped export, the first line uses this scope shape:

```json
{
  "type": "export_started",
  "schema_version": "v1",
  "scope": {
    "type": "tenant",
    "tenant_id": "tenant_abc123",
    "backend_count": 3
  },
  "effective_start_time": "2026-05-14T00:00:00.000000Z",
  "effective_end_time": "2026-05-14T01:00:00.000000Z",
  "max_exportable_time": "2026-05-14T10:45:00.000000Z",
  "end_time_clamped": false,
  "limit": 1000
}
```

#### `scope`

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `tenant` for tenant-scoped exports. |
| `tenant_id` | string | Tenant ID for the exported logs. |
| `backend_count` | number | Number of tenant backends included in the export scope. |

### `mcpgateway.tool_call`

Each tool call row is emitted as one `mcpgateway.tool_call` event.

```json
{
  "type": "mcpgateway.tool_call",
  "schema_version": "v1",
  "cursor": "<opaque-cursor>",
  "backend": {
    "id": "backend_a1b2c3",
    "name": "My Jira MCP"
  },
  "request": {
    "id": "jsonrpc-request-id",
    "log_id": 123,
    "started_at": "2026-05-14T00:00:01.123456Z",
    "completed_at": "2026-05-14T00:00:01.573456Z",
    "duration_ms": 450
  },
  "auth": {
    "mode": "token"
  },
  "tool": {
    "name": "create_issue"
  },
  "guardrails": {
    "input": {
      "outcome": "allowed",
      "is_blocked": false,
      "predictions": []
    },
    "output": {
      "outcome": "allowed",
      "is_blocked": false,
      "predictions": []
    }
  },
  "payload": {
    "tool_arguments": {},
    "response_content": {}
  },
  "response": {
    "success": true,
    "error_message": null
  },
  "metadata": {
    "user_email": "dev@company.com",
    "agent": "cursor",
    "extra_data": {}
  }
}
```

#### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `mcpgateway.tool_call`. |
| `schema_version` | string | Event schema version. Current value is `v1`. |
| `cursor` | string | Opaque cursor for this tool call row. |
| `backend` | object | MCP backend metadata. |
| `request` | object | JSON-RPC request and log metadata. |
| `auth` | object | Authentication mode used for the tool call. |
| `tool` | object | Tool metadata. |
| `guardrails` | object | Input and output guardrail outcomes and predictions. |
| `payload` | object | Tool arguments and response content, with credential redaction. |
| `response` | object | Tool call success and error metadata. |
| `metadata` | object | User, agent, and extra request metadata. |

#### `backend`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | MCP backend ID. |
| `name` | string | MCP backend display name. |

#### `request`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string or null | JSON-RPC request ID. |
| `log_id` | number | Internal log row ID used for stable pagination ordering. |
| `started_at` | string | Tool call start timestamp in ISO 8601 format. |
| `completed_at` | string or null | Tool call completion timestamp in ISO 8601 format. |
| `duration_ms` | number or null | Tool call duration in milliseconds. |

#### `auth`

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string or null | Authentication mode used by the gateway, such as `token` or OAuth-backed proxy auth. |

#### `tool`

| Field | Type | Description |
|-------|------|-------------|
| `name` | string or null | MCP tool name. |

#### `guardrails`

| Field | Type | Description |
|-------|------|-------------|
| `input` | object | Guardrail result for tool call arguments. |
| `output` | object | Guardrail result for tool response content. |

Each guardrail result uses this shape:

| Field | Type | Description |
|-------|------|-------------|
| `outcome` | string or null | Final guardrail outcome for that direction. |
| `is_blocked` | boolean | Whether that side of the tool call was blocked. |
| `predictions` | array or null | Prediction results, with credential fields redacted. |

#### `payload`

| Field | Type | Description |
|-------|------|-------------|
| `tool_arguments` | object, array, string, or null | Tool call arguments, with credential fields redacted. |
| `response_content` | object, array, string, or null | Tool response content, with credential fields redacted. |

The export redacts common credential fields and token patterns inside payloads, predictions, and metadata. Header-like objects are replaced with `[REDACTED_HEADERS]`.

#### `response`

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean or null | Whether the tool call completed successfully. |
| `error_message` | string or null | Error message when the tool call failed, with credential patterns redacted. |

#### `metadata`

| Field | Type | Description |
|-------|------|-------------|
| `user_email` | string or null | End-user email associated with the tool call, when provided. |
| `agent` | string or null | Agent identity extracted from the request `User-Agent` header. |
| `extra_data` | object | Additional request metadata, with credential fields redacted. |

### `checkpoint`

The final line on a successful response is a checkpoint.

```json
{
  "type": "checkpoint",
  "schema_version": "v1",
  "next_cursor": "<opaque-cursor>",
  "rows": 1000,
  "has_more": true,
  "effective_end_time": "2026-05-14T01:00:00.000000Z",
  "max_exportable_time": "2026-05-14T10:45:00.000000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `checkpoint`. |
| `schema_version` | string | Event schema version. Current value is `v1`. |
| `next_cursor` | string | Opaque cursor to store and use on the next request. |
| `rows` | number | Number of `mcpgateway.tool_call` events emitted in this response. |
| `has_more` | boolean | `true` when another page is available for the same effective export window. |
| `effective_end_time` | string | Effective upper bound used for this export response. |
| `max_exportable_time` | string | Newest timestamp eligible for export after the 15-minute lag. |

## Errors

Errors are returned as NDJSON too.

```json
{"type":"error","error":{"message":"<message>","code":"<code>"}}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `error`. |
| `error.message` | string | Human-readable error message. |
| `error.code` | string | Machine-readable error code. |

Errors before streaming starts use HTTP status codes. Errors after streaming has started are emitted as an `error` event line because the HTTP response has already been committed.
