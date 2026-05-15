---
sidebar_position: 9
sidebar_custom_props:
  icon: ClipboardList
---

# LLM Gateway Log Export API

Use the Log Export API to read LLM Gateway request logs from your own data platform, SIEM, warehouse, or scheduled export job.

The API returns newline-delimited JSON. Each response line is one complete JSON object, so clients can stream, parse, and checkpoint logs incrementally.

```http
GET https://guardrails.quilr.ai/llmgateway/logs/export
```

Response content type:

```http
Content-Type: application/x-ndjson
```

## Authentication

Pass a log export key from the QuilrAI LLM Gateway UI:

```http
X-Quilr-Log-Export-Key: sk-export-...
```

Do not use your QuilrAI gateway API key as the request credential for this endpoint. The log export key is separate from model-call authentication.

The UI exposes two export scopes:

| Export key | Scope |
|------------|-------|
| `log_export_key` | Exports logs only for the underlying QuilrAI API key it belongs to. |
| `all_apps_log_export_key` | Exports logs for all active, non-expired LLM Gateway apps in the tenant. |

Both scopes use the same endpoint, header, query parameters, pagination model, and response format. In all-apps exports, each `llmgateway.request` event still includes the concrete app name in `app.name`.

## Query Parameters

All query parameters are optional.

| Parameter | Description |
|-----------|-------------|
| `start_time` | ISO 8601 lower bound for exported logs. Naive timestamps are treated as UTC. |
| `end_time` | ISO 8601 upper bound for exported logs. Naive timestamps are treated as UTC. |
| `cursor` | Opaque cursor from the previous `checkpoint.next_cursor`. When provided, it wins over `start_time`. |
| `limit` | Maximum request rows to export in this response. Default `1000`, maximum `5000`. |

Logs are available for a maximum of 15 days. Choose `start_time` within that retention window when backfilling. Requests with an effective `start_time`, `end_time`, or cursor timestamp before the retention window fail with `400`.

If neither `start_time` nor `cursor` is provided, the API exports a default 24-hour window ending at the effective export end time.

## Export Lag

The API does not export logs newer than 15 minutes. Gateway logs and prediction payloads are written asynchronously, so this lag keeps exported rows stable.

If `end_time` is newer than `now - 15 minutes`, the server clamps it to the maximum exportable time. The request still succeeds. The `export_started` and `checkpoint` events include the effective export bounds.

## Request Examples

Start an export window:

```bash
curl -N \
  -H "X-Quilr-Log-Export-Key: sk-export-..." \
  "https://guardrails.quilr.ai/llmgateway/logs/export?start_time=2026-05-14T00:00:00Z&end_time=2026-05-14T01:00:00Z&limit=1000"
```

Resume from the previous checkpoint:

```bash
curl -N \
  -H "X-Quilr-Log-Export-Key: sk-export-..." \
  "https://guardrails.quilr.ai/llmgateway/logs/export?cursor=<next_cursor>"
```

When resuming with `cursor`, you do not need to pass `start_time` or `end_time`.

## Pagination

Rows are ordered by:

```sql
timestamp ASC, request_id ASC
```

The cursor is opaque. Store it exactly as returned in `checkpoint.next_cursor` and send it back as the `cursor` query parameter on the next request.

If `checkpoint.has_more` is `true`, call the endpoint again immediately with `cursor=<next_cursor>`.

If `checkpoint.has_more` is `false`, there are no more rows in the current effective window. Store `next_cursor` and poll later with that cursor to continue incremental export.

When an initial request returns zero rows, the API still returns a checkpoint cursor pinned to the effective end time. This lets exporters store one cursor value even for empty windows.

## Coverage

The export covers LLM Gateway traffic for the selected export scope, including:

| Traffic type | Exported |
|--------------|----------|
| OpenAI-compatible chat completions | Yes |
| Anthropic Messages | Yes |
| OpenAI Responses | Yes |
| OpenAI Realtime session logs | Yes |
| Embeddings | Yes |
| Rerank | Yes |
| AWS Bedrock Runtime boto3 | Yes |
| Streaming requests | Yes |
| SDK mode checks | Yes |
| Copilot Studio checks | Yes |

## Response Events

Every successful response starts with `export_started`, contains zero or more `llmgateway.request` events, and ends with `checkpoint`.

### `export_started`

The first line describes the effective export window.

```json
{
  "type": "export_started",
  "schema_version": "v1",
  "scope": "app",
  "app_name": "my-app",
  "app_count": 1,
  "effective_start_time": "2026-05-14T00:00:00.000Z",
  "effective_end_time": "2026-05-14T01:00:00.000Z",
  "max_exportable_time": "2026-05-14T10:45:00.000Z",
  "end_time_clamped": false,
  "limit": 1000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `export_started`. |
| `schema_version` | string | Event schema version. Current value is `v1`. |
| `scope` | string | `app` for a single-key export, or `all_apps` for a tenant-wide all-apps export. |
| `app_name` | string or null | LLM Gateway app name for a single-key export. `null` for all-apps exports. |
| `app_count` | number | Number of active, non-expired apps included in the export scope. |
| `effective_start_time` | string | ISO 8601 timestamp where this export starts. |
| `effective_end_time` | string | ISO 8601 timestamp where this export ends. |
| `max_exportable_time` | string | Newest timestamp eligible for export after the 15-minute lag. |
| `end_time_clamped` | boolean | `true` when the requested `end_time` was newer than `max_exportable_time`. |
| `limit` | number | Maximum request rows returned in this response. |

For all-apps export, the first line uses this scope shape:

```json
{
  "type": "export_started",
  "schema_version": "v1",
  "scope": "all_apps",
  "app_name": null,
  "app_count": 3,
  "effective_start_time": "2026-05-14T00:00:00.000Z",
  "effective_end_time": "2026-05-14T01:00:00.000Z",
  "max_exportable_time": "2026-05-14T10:45:00.000Z",
  "end_time_clamped": false,
  "limit": 1000
}
```

### `llmgateway.request`

Each request row is emitted as one `llmgateway.request` event.

```json
{
  "type": "llmgateway.request",
  "schema_version": "v1",
  "cursor": "<opaque-cursor>",
  "app": {
    "name": "my-app"
  },
  "request": {
    "id": "request-id",
    "timestamp": "2026-05-14T00:00:01.123Z",
    "endpoint": "/openai_compatible/v1/chat/completions",
    "model": "gpt-4.1",
    "provider": "openai",
    "stream": false,
    "status_code": 200,
    "error_type": null,
    "error_message": null
  },
  "tokens": {
    "request": 100,
    "response": 200,
    "cache_read": 0,
    "cache_write": null,
    "reasoning": null,
    "max_requested": 1000
  },
  "latency_ms": {
    "upstream": 800,
    "quilr_processing": 120,
    "guardrails": 90,
    "first_response": 920,
    "total": 950
  },
  "guardrails": {
    "outcome": "normal",
    "is_blocked": false,
    "is_anonymized": false,
    "actions_and_categories": {},
    "request_predictions": [],
    "response_predictions": []
  },
  "payload": {
    "hydration_status": "complete",
    "request_text": {},
    "response_text": {}
  },
  "metadata": {
    "user_email": null,
    "conversation_id": null,
    "client_ip": "203.0.113.10",
    "extra_data": {},
    "sdk": null
  },
  "routing": {
    "group_id": null,
    "mode": null
  },
  "telemetry": {
    "processing_times": null,
    "chunk_funnel": null
  }
}
```

#### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `llmgateway.request`. |
| `schema_version` | string | Event schema version. Current value is `v1`. |
| `cursor` | string | Opaque cursor for this request row. |
| `app` | object | App metadata. |
| `request` | object | Gateway request metadata. |
| `tokens` | object | Token counts and token limits. |
| `latency_ms` | object | Latency measurements in milliseconds. |
| `guardrails` | object | Guardrail outcome and prediction metadata. |
| `payload` | object | Hydrated request and response payloads when available. |
| `metadata` | object | User, client, SDK, and extra request metadata. |
| `routing` | object | Routing group metadata when routing is used. |
| `telemetry` | object | Additional processing telemetry. |

#### `app`

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | LLM Gateway app name. |

#### `request`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique request ID. |
| `timestamp` | string | Request timestamp in ISO 8601 format. |
| `endpoint` | string | Gateway endpoint path used by the request. |
| `model` | string or null | Requested model or routing group name. |
| `provider` | string or null | Provider selected for the request. |
| `stream` | boolean | Whether the request used a streaming response mode. |
| `status_code` | number or null | HTTP status code returned to the client. |
| `error_type` | string or null | Error category when the request failed. |
| `error_message` | string or null | Error message when the request failed. |

#### `tokens`

| Field | Type | Description |
|-------|------|-------------|
| `request` | number or null | Input token count. |
| `response` | number or null | Output token count. |
| `cache_read` | number or null | Tokens read from provider prompt cache, when available. |
| `cache_write` | number or null | Tokens written to provider prompt cache, when available. |
| `reasoning` | number or null | Reasoning token count, when reported by the provider. |
| `max_requested` | number or null | Maximum output tokens requested by the client. |

#### `latency_ms`

| Field | Type | Description |
|-------|------|-------------|
| `upstream` | number or null | Time spent waiting on the upstream provider. |
| `quilr_processing` | number or null | Time spent in QuilrAI gateway processing. |
| `guardrails` | number or null | Time spent evaluating guardrails. |
| `first_response` | number or null | Time to first response token or first response byte, when available. |
| `total` | number or null | Total gateway request duration. |

#### `guardrails`

| Field | Type | Description |
|-------|------|-------------|
| `outcome` | string or null | Final guardrail outcome, such as `normal`, `blocked`, or another configured outcome. |
| `is_blocked` | boolean | Whether the request or response was blocked. |
| `is_anonymized` | boolean | Whether anonymization was applied. |
| `actions_and_categories` | object | Guardrail actions grouped by detected categories. |
| `request_predictions` | array | Request-side prediction results. |
| `response_predictions` | array | Response-side prediction results. |

#### `payload`

| Field | Type | Description |
|-------|------|-------------|
| `hydration_status` | string | `complete` when payload data is available, or `missing_prediction` when the request log exists but payload hydration is unavailable. |
| `request_text` | object, array, string, or null | Hydrated request payload. The field name matches the dashboard concept and is not limited to plain strings. |
| `response_text` | object, array, string, or null | Hydrated response payload. The field name matches the dashboard concept and is not limited to plain strings. |

When hydration is unavailable, the payload object uses this shape:

```json
{
  "hydration_status": "missing_prediction",
  "request_text": null,
  "response_text": null
}
```

#### `metadata`

| Field | Type | Description |
|-------|------|-------------|
| `user_email` | string or null | User email associated with the request, when identity-aware tracking is configured. |
| `conversation_id` | string or null | Conversation ID from `X-Conversation-Id`, when provided. |
| `client_ip` | string or null | Client IP observed by the gateway. |
| `extra_data` | object | Additional request metadata. |
| `sdk` | object or null | SDK metadata when the request came from SDK mode or a tracked SDK client. |

#### `routing`

| Field | Type | Description |
|-------|------|-------------|
| `group_id` | string or null | Routing group identifier when request routing is used. |
| `mode` | string or null | Routing mode used for the request. |

#### `telemetry`

| Field | Type | Description |
|-------|------|-------------|
| `processing_times` | object or null | Additional internal processing timings, when available. |
| `chunk_funnel` | object or null | Streaming chunk telemetry, when available. |

### `checkpoint`

The final line on a successful response is a checkpoint.

```json
{
  "type": "checkpoint",
  "schema_version": "v1",
  "next_cursor": "<opaque-cursor>",
  "rows": 1000,
  "has_more": true,
  "effective_end_time": "2026-05-14T01:00:00.000Z",
  "max_exportable_time": "2026-05-14T10:45:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `checkpoint`. |
| `schema_version` | string | Event schema version. Current value is `v1`. |
| `next_cursor` | string | Opaque cursor to store and use on the next request. |
| `rows` | number | Number of `llmgateway.request` events emitted in this response. |
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
