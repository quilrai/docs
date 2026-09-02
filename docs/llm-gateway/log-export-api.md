---
sidebar_position: 10
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

The endpoint also serves an aggregated executive dashboard view. Add `view=metrics`
to receive a single summary JSON document instead of the per-request NDJSON stream.
See [Metrics View](#metrics-view).

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
| `limit` | Maximum request rows to export in this response. Default `1000`. Values above `5000` are silently clamped to `5000`. Values below `1` or non-integer values return `400`. |
| `view` | Response shape. `logs` (default) streams per-request NDJSON events. `metrics` returns one aggregated JSON document — see [Metrics View](#metrics-view). Any other value returns `400`. |

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

When an initial request (no `cursor` supplied) returns zero rows, the API returns a checkpoint cursor pinned to the effective end time. This lets exporters store one cursor value even for empty windows.

When a request with a `cursor` returns zero rows, `checkpoint.next_cursor` echoes the inbound cursor unchanged and `has_more` is `false`. Re-poll later with the same cursor.

## Coverage

The export covers LLM Gateway traffic for the selected export scope, including:

| Traffic type | Exported |
|--------------|----------|
| OpenAI-compatible chat completions | Yes |
| Anthropic Messages | Yes |
| OpenAI Responses | Yes |
| OpenAI Realtime session logs | Yes |
| OpenAI speech-to-text | Yes |
| OpenAI text-to-speech | Yes |
| Embeddings | Yes |
| Rerank | Yes |
| AWS Bedrock Runtime boto3 | Yes |
| Vertex AI Gemini | Yes |
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
| `app_name` | string or null | LLM Gateway app name for a single-key export, or `""` if that app has no configured name. `null` for all-apps exports because the export spans multiple apps; the concrete per-request app name is on each `llmgateway.request` event at `app.name`. |
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
| `error_message` | string or null | Error message when the request failed. Credential-shaped substrings are redacted before export. |

#### `tokens`

| Field | Type | Description |
|-------|------|-------------|
| `request` | number or null | Input token count. |
| `response` | number or null | Output token count. |
| `cache_read` | number | Tokens read from provider prompt cache. `0` when the provider did not report a cache read. |
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

[Guardian Agent](./features/guardian-agent) findings are included in these same prediction arrays with `match_type: "guardian"`. Guardian request and response categories are also available under `metadata.extra_data.guardian_agent` when present.

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
| `user_email` | string or null | User email associated with the request, when identity-aware tracking is configured. Also present in `extra_data` when populated. |
| `conversation_id` | string or null | Conversation ID from `X-Conversation-Id`, when provided. Also present in `extra_data` when populated. |
| `client_ip` | string or null | Client IP observed by the gateway. Also present in `extra_data` when populated. |
| `extra_data` | object | Additional request metadata. The hoisted fields above (`user_email`, `conversation_id`, `client_ip`) are not removed from this object. The `jwt_claims` field is always stripped. |
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

## Metrics View

Add `view=metrics` to aggregate the whole export window server-side and return one
JSON document shaped for executive, security, and governance dashboards. Use this
when you want headline numbers rather than a copy of every request row.

```http
GET https://guardrails.quilr.ai/llmgateway/logs/export?view=metrics
```

```http
Content-Type: application/json
```

This view uses the same endpoint, the same export key, and the same window rules as
the default logs view: the 15-minute export lag, the 15-day retention limit, and
`start_time` / `end_time` clamping all behave identically. Two differences:

- The response is **one JSON object**, not an NDJSON stream. There are no
  `export_started`, `llmgateway.request`, or `checkpoint` events, and no pagination.
- `cursor` and `limit` are accepted but ignored, because the whole window is
  aggregated in a single response.

```bash
curl -H "X-Quilr-Log-Export-Key: sk-export-..." \
  "https://guardrails.quilr.ai/llmgateway/logs/export?view=metrics&start_time=2026-05-07T00:00:00Z"
```

### Counting Model

Every count is **request-level**: one request contributes at most one to a given
metric, no matter how many findings of that kind it carried. A single request that
trips four separate PII rules counts once toward `pii_phi_pci_violations.total`.

Findings are classified by matching the category identifiers recorded on each
request, so tenant-defined custom categories roll up into the standard buckets when
their identifiers contain the relevant marker (for example a custom category whose
id contains `jailbreak` counts toward `jailbreak_attempts`).

### Example Response

```json
{
  "type": "llmgateway.executive_metrics",
  "schema_version": "v1",
  "scope": "all_apps",
  "window": {
    "effective_start_time": "2026-05-07T00:00:00.000Z",
    "effective_end_time": "2026-05-14T10:45:00.000Z",
    "max_exportable_time": "2026-05-14T10:45:00.000Z",
    "end_time_clamped": false
  },
  "security_metrics": {
    "prompt_injection_attempts": 40,
    "jailbreak_attempts": 18,
    "secrets_exposure_events": 9,
    "pii_phi_pci_violations": {
      "total": 88,
      "pii": 28,
      "phi": 0,
      "pci": 60,
      "pfi": 0
    },
    "blocked_requests": 67,
    "high_severity_incidents": 67
  },
  "risk_metrics": {
    "top_applications_by_violations": [
      {
        "name": "internal-assistant",
        "count": 87
      },
      {
        "name": "support-bot",
        "count": 68
      }
    ],
    "users_with_repeated_violations": [
      {
        "name": "a@corp.com",
        "count": 100
      },
      {
        "name": "b@corp.com",
        "count": 46
      },
      {
        "name": "c@corp.com",
        "count": 9
      }
    ],
    "top_violation_categories": [
      {
        "name": "Protected Card Information (PCI)",
        "count": 60
      },
      {
        "name": "prompt_injection_direct",
        "count": 40
      },
      {
        "name": "Personally Identifiable Information (PII)",
        "count": 28
      },
      {
        "name": "jailbreak_roleplay",
        "count": 18
      },
      {
        "name": "auth_secrets_api_key",
        "count": 9
      }
    ],
    "client_data_exposure_attempts": 88
  },
  "governance_metrics": {
    "total_requests": 1245,
    "traffic_share_by_app": [
      {
        "name": "support-bot",
        "requests": 768,
        "percent": 61.69
      },
      {
        "name": "internal-assistant",
        "requests": 387,
        "percent": 31.08
      },
      {
        "name": "batch-summarizer",
        "requests": 90,
        "percent": 7.23
      }
    ],
    "integrated_applications": {
      "count": 4,
      "names": [
        "batch-summarizer",
        "internal-assistant",
        "legacy-classifier",
        "support-bot"
      ],
      "active_in_window": [
        "batch-summarizer",
        "internal-assistant",
        "support-bot"
      ]
    },
    "applications_without_traffic_in_window": [
      "legacy-classifier"
    ],
    "guardrail_effectiveness": {
      "detections_total": 155,
      "blocked": 67,
      "anonymized": 28,
      "monitored_only": 60,
      "prevented_percent": 61.29
    }
  },
  "executive_kpis": {
    "critical_events_prevented": 67,
    "secrets_blocked": 9,
    "prompt_injection_attempts_blocked": 40,
    "jailbreak_attempts_blocked": 18,
    "sensitive_records_protected": 28
  },
  "coverage": {
    "scanned_requests": 1245,
    "complete": true,
    "max_scan_rows": 250000
  }
}
```

### `security_metrics`

| Field | Type | Description |
|-------|------|-------------|
| `prompt_injection_attempts` | number | Requests where a prompt-injection category was detected. |
| `jailbreak_attempts` | number | Requests where a jailbreak category was detected. |
| `secrets_exposure_events` | number | Requests where a secret or credential category was detected. |
| `pii_phi_pci_violations.total` | number | Requests with any data-risk detection. Less than or equal to the sum of the breakdown, since one request can carry several data types. |
| `pii_phi_pci_violations.pii` | number | Requests with a PII detection. |
| `pii_phi_pci_violations.phi` | number | Requests with a PHI detection. |
| `pii_phi_pci_violations.pci` | number | Requests with a PCI detection. |
| `pii_phi_pci_violations.pfi` | number | Requests with a PFI detection. |
| `blocked_requests` | number | Requests the gateway blocked outright. |
| `high_severity_incidents` | number | Requests carrying prompt-injection, jailbreak, security-exploit, or secrets detections. |

### `risk_metrics`

| Field | Type | Description |
|-------|------|-------------|
| `top_applications_by_violations` | array | Up to 10 `{name, count}` entries, highest first, for apps with at least one violation. |
| `users_with_repeated_violations` | array | Up to 10 `{name, count}` entries for users with 2 or more violations, taken from `extra_data.user_email`. Empty when identity headers are not in use. |
| `top_violation_categories` | array | Up to 10 `{name, count}` entries by category display name. |
| `client_data_exposure_attempts` | number | Requests with any data-risk detection. |

### `governance_metrics`

| Field | Type | Description |
|-------|------|-------------|
| `total_requests` | number | Every request that reached the gateway in the window. |
| `traffic_share_by_app` | array | `{name, requests, percent}` per application, highest first, ties broken by name. |
| `integrated_applications.count` | number | Number of apps configured under this export scope. |
| `integrated_applications.names` | array | All configured app names. |
| `integrated_applications.active_in_window` | array | Configured apps that served at least one request in the window. |
| `applications_without_traffic_in_window` | array | Configured apps that served no traffic in the window. |
| `guardrail_effectiveness.detections_total` | number | Requests that were blocked, anonymized, or flagged by a monitoring rule. |
| `guardrail_effectiveness.blocked` | number | Requests blocked. |
| `guardrail_effectiveness.anonymized` | number | Requests anonymized. |
| `guardrail_effectiveness.monitored_only` | number | Requests flagged but allowed through. |
| `guardrail_effectiveness.prevented_percent` | number \| null | Blocked plus anonymized, as a percentage of `detections_total`. `null` when there were no detections. |

`percent` in `traffic_share_by_app` is each app's share of `total_requests`, so the
values describe how gateway traffic is distributed across your applications and sum
to approximately 100 (individual values are rounded to two decimals). Applications
with no traffic are omitted from this array and listed in
`applications_without_traffic_in_window` instead.

This is deliberately a share of traffic that reached the gateway, not a share of all
AI usage in your organisation. The gateway can only observe requests routed through
it, so it cannot measure traffic that bypasses it.

### `executive_kpis`

| Field | Type | Description |
|-------|------|-------------|
| `critical_events_prevented` | number | Blocked requests carrying prompt-injection, jailbreak, security-exploit, or secrets detections. |
| `secrets_blocked` | number | Blocked requests carrying a secrets detection. |
| `prompt_injection_attempts_blocked` | number | Blocked requests carrying a prompt-injection detection. |
| `jailbreak_attempts_blocked` | number | Blocked requests carrying a jailbreak detection. |
| `sensitive_records_protected` | number | Requests where data-risk content was blocked or anonymized. |

### `coverage`

| Field | Type | Description |
|-------|------|-------------|
| `scanned_requests` | number | Requests aggregated for this response. |
| `complete` | boolean | `false` when the window exceeded the scan cap and the numbers are therefore partial. Narrow the window and retry. |
| `max_scan_rows` | number | Maximum rows a single metrics response will scan. |

Always check `coverage.complete`. When it is `false`, the figures cover only the
first `max_scan_rows` requests in the window and should not be reported as totals.

### Metrics View Errors

Unlike the logs view, metrics errors are returned as a plain JSON object rather
than NDJSON, because no stream has started.

| Status | Code | Cause |
|--------|------|-------|
| `400` | `invalid_view` | `view` was neither `logs` nor `metrics`. |
| `500` | `metrics_failed` | Aggregation failed. Retry, and narrow the window if it persists. |

All authentication and time-window errors behave exactly as they do for the logs
view.

## Redaction

The export endpoint applies a best-effort credential scrub before emitting any row. Expect the following to be missing or rewritten in exported events:

- `extra_data.jwt_claims` is removed from every row.
- Any object key named `headers`, `request_headers`, `response_headers`, or `http_headers` is replaced with the string `[REDACTED_HEADERS]`.
- Object keys that name a credential (such as `authorization`, `api_key`, `x_api_key`, `quilr_api_key`, `access_token`, `refresh_token`, `client_secret`, `password`, `private_key`, AWS credential field names) and any key suffixed with `_api_key`, `_apikey`, `_access_token`, `_refresh_token`, `_client_secret`, or `_private_key` are replaced with `[REDACTED]`.
- String values are scanned for common credential patterns. Matches are rewritten to placeholders such as `[REDACTED_API_KEY]`, `[REDACTED_QUILR_API_KEY]`, `[REDACTED_LOG_EXPORT_KEY]`, or `Bearer [REDACTED]`.

Redaction is applied recursively to `payload.request_text`, `payload.response_text`, `guardrails.actions_and_categories`, `guardrails.request_predictions`, `guardrails.response_predictions`, `metadata.extra_data`, `metadata.sdk`, `telemetry.processing_times`, `telemetry.chunk_funnel`, and the top-level `error_message` field. This is a safety layer, not a formal DLP pass over exported payloads.

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

Errors before streaming starts return an HTTP error status with a single NDJSON `error` line as the response body. Errors after streaming has started return HTTP `200` and emit an `error` event line in the body because the HTTP response has already been committed.
