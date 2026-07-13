import asyncio
import json
import logging
import os
import time

import httpx

logger = logging.getLogger(__name__)

DEFAULT_KEY_NAME = "__quilr_synthetic_health_v2__"
DEFAULT_LLM_MODEL = "quilr-synthetic-fast"
DEFAULT_STREAM_MODEL = "quilr-synthetic-slow"
MAX_ERROR_SUMMARY_LENGTH = 240


def _env_bool(name, default=False):
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _base_url(name, default):
    return os.environ.get(name, default).rstrip("/")


def _headers(token=None, tenant_id=None, subscriber_id=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if tenant_id:
        headers["tenant"] = tenant_id
    if subscriber_id:
        headers["subscriberid"] = subscriber_id
    return headers


def _now_ms(start):
    return int((time.perf_counter() - start) * 1000)


def build_failure_probe_result(component, scenario, error, duration_ms=None):
    error_summary = str(error)
    return {
        "component": component,
        "scenario": scenario,
        "status": "failure",
        "duration_ms": duration_ms,
        "error_summary": error_summary[:MAX_ERROR_SUMMARY_LENGTH],
        "metadata": {"error_type": type(error).__name__},
    }


def collect_stream_chunks(lines):
    content = []
    chunk_count = 0
    saw_done = False

    for line in lines:
        if isinstance(line, bytes):
            line = line.decode("utf-8")
        line = line.strip()
        if not line or not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if data == "[DONE]":
            saw_done = True
            continue
        try:
            payload = json.loads(data)
        except json.JSONDecodeError:
            logger.debug("Ignoring non-JSON SSE data: %s", data)
            continue
        choices = payload.get("choices") or []
        delta = choices[0].get("delta", {}) if choices else {}
        piece = delta.get("content")
        if piece:
            content.append(piece)
            chunk_count += 1

    return {
        "content": "".join(content),
        "chunk_count": chunk_count,
        "saw_done": saw_done,
    }


async def _record_probe(client, mcp_base_url, internal_token, result):
    response = await client.post(
        f"{mcp_base_url}/internal/gateway-health/probe-results",
        headers=_headers(token=internal_token),
        json=result,
    )
    response.raise_for_status()
    return response.json()


async def _ensure_llm_key(client, llm_gateway_url, llm_base_url, tenant_id, subscriber_id):
    headers = _headers(tenant_id=tenant_id, subscriber_id=subscriber_id)
    listed = await client.get(f"{llm_gateway_url}/api-keys/list", headers=headers)
    listed.raise_for_status()
    for key in listed.json().get("api_keys", []):
        settings = key.get("quilr_api_key_settings") or {}
        if settings.get("key_name") == DEFAULT_KEY_NAME:
            return key.get("quilr_api_key")

    created = await client.post(
        f"{llm_gateway_url}/api-keys/create",
        headers=headers,
        json={
            "provider_name": "general",
            "api_key": "synthetic-health-provider-key",
            "base_url": llm_base_url,
            "quilr_api_key_settings": {
                "key_name": DEFAULT_KEY_NAME,
                "selected_models": [DEFAULT_LLM_MODEL, DEFAULT_STREAM_MODEL],
            },
        },
    )
    created.raise_for_status()
    return created.json()["api_key"]


async def _bootstrap_mcp(client, mcp_base_url, internal_token, tenant_id, subscriber_id, transport_url):
    response = await client.post(
        f"{mcp_base_url}/internal/gateway-health/bootstrap",
        headers=_headers(token=internal_token),
        json={
            "tenant_id": tenant_id,
            "subscriber_id": subscriber_id,
            "synthetic_mcp_transport_url": transport_url,
        },
    )
    response.raise_for_status()
    return response.json()


async def _probe_llm_models(client, llm_gateway_url, api_key):
    start = time.perf_counter()
    response = await client.get(
        f"{llm_gateway_url}/openai_compatible/v1/models",
        headers={"Authorization": f"Bearer {api_key}"},
    )
    response.raise_for_status()
    models = response.json().get("data", [])
    return {
        "component": "llm",
        "scenario": "models",
        "status": "success",
        "duration_ms": _now_ms(start),
        "metadata": {"model_count": len(models)},
    }


async def _probe_llm_chat(client, llm_gateway_url, api_key):
    start = time.perf_counter()
    response = await client.post(
        f"{llm_gateway_url}/openai_compatible/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": DEFAULT_LLM_MODEL,
            "messages": [{"role": "user", "content": "health ping"}],
            "stream": False,
        },
    )
    response.raise_for_status()
    return {
        "component": "llm",
        "scenario": "chat",
        "status": "success",
        "duration_ms": _now_ms(start),
    }


async def _probe_llm_stream(client, llm_gateway_url, api_key):
    start = time.perf_counter()
    first_token_ms = None
    lines = []
    async with client.stream(
        "POST",
        f"{llm_gateway_url}/openai_compatible/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": DEFAULT_STREAM_MODEL,
            "messages": [{"role": "user", "content": "health stream"}],
            "stream": True,
        },
    ) as response:
        response.raise_for_status()
        async for line in response.aiter_lines():
            if first_token_ms is None and line.startswith("data:") and "[DONE]" not in line:
                first_token_ms = _now_ms(start)
            lines.append(line)

    stream = collect_stream_chunks(lines)
    if not stream["saw_done"] or stream["chunk_count"] == 0:
        raise RuntimeError("stream did not emit content chunks and [DONE]")
    return {
        "component": "llm",
        "scenario": "streaming",
        "status": "success",
        "duration_ms": _now_ms(start),
        "first_token_ms": first_token_ms,
        "chunk_count": stream["chunk_count"],
    }


async def _probe_mcp_direct(client, mcp_base_url, bootstrap):
    backend = bootstrap["backend"]
    start = time.perf_counter()
    response = await client.post(
        f"{mcp_base_url}/{backend['slug']}/mcp",
        headers={
            "Authorization": f"Bearer {bootstrap['api_token']}",
            "mcpuser": bootstrap["mcp_user_email"],
            "Content-Type": "application/json",
        },
        json={
            "jsonrpc": "2.0",
            "id": "health-direct",
            "method": "tools/call",
            "params": {
                "name": "health_echo",
                "arguments": {"message": "direct"},
            },
        },
    )
    response.raise_for_status()
    return {
        "component": "mcp",
        "scenario": "direct",
        "status": "success",
        "duration_ms": _now_ms(start),
        "metadata": {"backend_id": backend["id"]},
    }


async def _probe_onemcp(client, mcp_base_url, tenant_id, bootstrap):
    start = time.perf_counter()
    response = await client.post(
        f"{mcp_base_url}/quilrone/{tenant_id}/mcp",
        headers={
            "Authorization": f"Bearer {bootstrap['onemcp_proxy_token']}",
            "Content-Type": "application/json",
        },
        json={
            "jsonrpc": "2.0",
            "id": "health-onemcp",
            "method": "tools/call",
            "params": {"name": "list_mcp_connections", "arguments": {}},
        },
    )
    response.raise_for_status()
    body = response.json()
    if "error" in body:
        raise RuntimeError(body["error"].get("message") or "OneMCP health probe failed")
    return {
        "component": "mcp",
        "scenario": "onemcp",
        "status": "success",
        "duration_ms": _now_ms(start),
        "metadata": {"backend_id": bootstrap["backend"]["id"]},
    }


# Real LLM Gateway regions, same set as the QuilrAI Infrastructure tab's ping (index.js) - reachability only, not a completion.
LLM_REGIONS = [
    ("usa-1", "https://guardrails-usa-1.quilr.ai"),
    ("usa-2", "https://guardrails-usa-2.quilr.ai"),
    ("india-1", "https://guardrails-india-1.quilr.ai"),
]


async def _probe_region(client, region_id, url):
    start = time.perf_counter()
    await client.get(url, follow_redirects=True)
    return {
        "component": "llm-region",
        "scenario": region_id,
        "status": "success",
        "duration_ms": _now_ms(start),
    }


async def run_once():
    internal_token = os.environ["GATEWAY_HEALTH_INTERNAL_TOKEN"]
    tenant_id = os.environ["GATEWAY_HEALTH_TENANT_ID"]
    subscriber_id = os.environ["GATEWAY_HEALTH_SUBSCRIBER_ID"]
    timeout = float(os.environ.get("GATEWAY_HEALTH_TIMEOUT_SECONDS", "10"))
    llm_gateway_url = _base_url("LLM_GATEWAY_BASE_URL", "http://127.0.0.1:8000")
    mcp_base_url = _base_url(
        "MCP_GATEWAY_BASE_URL",
        os.environ.get("GATEWAY_BASE_URL", "http://127.0.0.1:8005"),
    )
    llm_base_url = _base_url("SYNTHETIC_LLM_BASE_URL", "http://127.0.0.1:8010/v1")
    mcp_transport_url = os.environ.get("SYNTHETIC_MCP_TRANSPORT_URL", "http://127.0.0.1:8011/mcp")

    async with httpx.AsyncClient(timeout=timeout) as client:
        api_key = await _ensure_llm_key(client, llm_gateway_url, llm_base_url, tenant_id, subscriber_id)
        bootstrap = await _bootstrap_mcp(client, mcp_base_url, internal_token, tenant_id, subscriber_id, mcp_transport_url)
        probes = [
            ("llm", "models", lambda: _probe_llm_models(client, llm_gateway_url, api_key)),
            ("llm", "chat", lambda: _probe_llm_chat(client, llm_gateway_url, api_key)),
            ("llm", "streaming", lambda: _probe_llm_stream(client, llm_gateway_url, api_key)),
            ("mcp", "direct", lambda: _probe_mcp_direct(client, mcp_base_url, bootstrap)),
            ("mcp", "onemcp", lambda: _probe_onemcp(client, mcp_base_url, tenant_id, bootstrap)),
        ] + [
            ("llm-region", region_id, lambda region_id=region_id, url=url: _probe_region(client, region_id, url))
            for region_id, url in LLM_REGIONS
        ]
        for component, scenario, factory in probes:
            start = time.perf_counter()
            try:
                result = await factory()
            except Exception as exc:
                logger.error("Gateway health probe failed: %s/%s: %s", component, scenario, exc)
                result = build_failure_probe_result(component, scenario, exc, _now_ms(start))
            await _record_probe(client, mcp_base_url, internal_token, result)


async def run_loop():
    if not _env_bool("GATEWAY_HEALTH_ENABLED", default=True):
        logger.info("Gateway health worker disabled")
        return
    interval = int(os.environ.get("GATEWAY_HEALTH_INTERVAL_SECONDS", "60"))
    while True:
        await run_once()
        await asyncio.sleep(interval)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_loop())
