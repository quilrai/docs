---
sidebar_position: 9
sidebar_custom_props:
  icon: ClipboardList
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

Start a backend-scoped export window:

```bash
curl -N \
  -H "X-Quilr-Log-Export-Key: sk-export-..." \
  "https://<your-gateway-host>/mcpgateway/logs/export?start_time=2026-05-14T00:00:00Z&end_time=2026-05-14T01:00:00Z&limit=1000"
```

Start a tenant-scoped export window:

```bash
curl -N \
  -H "X-Quilr-Log-Export-Key: sk-exportl-..." \
  "https://<your-gateway-host>/mcpgateway/logs/export?start_time=2026-05-14T00:00:00Z&end_time=2026-05-14T01:00:00Z&limit=1000"
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
