---
sidebar_position: 14
sidebar_custom_props:
  icon: Activity
---

# Agent Monitoring

Correlate every gateway LLM call with the agent run, trace, workflow, or conversation that produced it - using standard distributed-tracing headers, Quilr agent headers, or provider request-body metadata. No Quilr SDK required.

## How It Works

<StepFlow steps={[
  {
    label: "Agent Makes a Call",
    items: [
      "traceparent: 00-0af7...-b7ad...-01",
      "X-Quilr-Agent-Run-Id: run-123",
      "metadata: { workflow: triage }",
    ],
  },
  {
    label: "Gateway Normalizes",
    items: [
      "trace_id, span_id extracted",
      "agent / workflow IDs captured",
      "Secrets + raw headers dropped ✓",
    ],
  },
  {
    label: "Correlate in Logs",
    items: [
      "extra_data.observability",
      "Join calls by trace_id / run_id",
      "Included in log export",
    ],
  },
]} />

1. **Your agent makes a call** through the gateway, carrying tracing context on the request - in headers, in the provider request body, or both.
2. **The gateway normalizes** the recognized signals into one stable shape and discards everything it does not recognize. Raw headers, raw baggage, and secrets are never stored.
3. **You correlate** related calls in the request logs and log export by their shared `trace_id`, `agent_run_id`, `conversation_id`, or `workflow_run_id`.

The capture is non-blocking. Malformed or unrecognized tracing data is dropped silently - it never rejects or delays a request.

## What Gets Captured

Recognized signals are normalized into a single `observability` object stored under each request's `extra_data` (`schema_version` `1.0`). The object is included in the [Log Export API](../log-export-api) response as `metadata.extra_data.observability`.

Only known, bounded, sanitized values are copied. The gateway does **not** persist raw request headers, raw baggage, or secrets.

```json
{
  "observability": {
    "schema_version": "1.0",
    "trace": {
      "source": "w3c",
      "trace_id": "0af7651916cd43dd8448eb211c80319c",
      "incoming_parent_span_id": "b7ad6b7169203331",
      "trace_flags": "01",
      "sampled": true
    },
    "correlation": { "conversation_id": "thread-123", "external_request_id": "client-req-123" },
    "agent": { "run_id": "run-123", "name": "Support Agent", "framework": "langgraph" },
    "workflow": { "id": "support-triage", "run_id": "workflow-run-123" },
    "baggage": { "agent.run_id": "run-123", "agent.framework": "langgraph" },
    "gateways": { "helicone": { "session_id": "sess-1" } },
    "request": { "metadata": { "workflow": "support-triage" }, "user": "end-user-7" },
    "upstream": { "provider": "openai", "request_id": "req_abc123" }
  }
}
```

## Correlation Channels

Real agent frameworks split correlation between HTTP headers and the provider request body, so the gateway reads both.

### W3C Trace Context

The primary, recommended channel. Send the standard headers and the gateway extracts the trace and the incoming caller span.

```
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
tracestate: vendorname=opaqueValue
```

| Header | Captured as |
|--------|-------------|
| `traceparent` | `trace.trace_id`, `trace.incoming_parent_span_id`, `trace.trace_flags`, `trace.sampled` |
| `tracestate` | `trace.tracestate` (stored bounded) |

The incoming `span_id` is the caller's span - it is stored as `incoming_parent_span_id`. Malformed or all-zero values are dropped.

### Vendor Tracing Headers

If you already run a different tracing system, send its headers and the gateway normalizes them into the same `trace` shape, keeping the original values under `vendor_trace_context` for debugging.

| System | Headers |
|--------|---------|
| **Zipkin / B3** | `b3`, `x-b3-traceid`, `x-b3-spanid`, `x-b3-parentspanid`, `x-b3-sampled`, `x-b3-flags` |
| **Datadog** | `x-datadog-trace-id`, `x-datadog-parent-id`, `x-datadog-sampling-priority`, `x-datadog-origin`, `x-datadog-tags` |
| **AWS X-Ray** | `x-amzn-trace-id` |
| **Google Cloud Trace** | `x-cloud-trace-context` |
| **Sentry** | `sentry-trace` |

When more than one trace system is present, the primary `trace` is chosen by precedence - W3C, then B3, Datadog, AWS X-Ray, Google Cloud Trace, Sentry - and the rest are retained in `vendor_trace_context`.

### Quilr Agent Headers

There is no universal HTTP standard for agent/run identity, so the gateway defines a canonical `X-Quilr-Agent-*` set and accepts short `X-Agent-*` aliases for compatibility. Both forms map to the same fields.

| Canonical header | Alias | Captured as |
|------------------|-------|-------------|
| `X-Quilr-Agent-Run-Id` | `X-Agent-Run-Id` | `agent.run_id` |
| `X-Quilr-Agent-Id` | `X-Agent-Id` | `agent.id` |
| `X-Quilr-Agent-Name` | `X-Agent-Name` | `agent.name` |
| `X-Quilr-Agent-Version` | `X-Agent-Version` | `agent.version` |
| `X-Quilr-Agent-Framework` | `X-Agent-Framework` | `agent.framework` |
| `X-Quilr-Agent-Thread-Id` | `X-Agent-Thread-Id` | `agent.thread_id` |
| `X-Quilr-Agent-Span-Id` | `X-Agent-Span-Id` | `agent.span_id` |
| `X-Quilr-Agent-Parent-Span-Id` | `X-Agent-Parent-Span-Id` | `agent.parent_span_id` |
| `X-Quilr-Agent-Step-Name` | `X-Agent-Step-Name` | `agent.step_name` |
| `X-Quilr-Agent-Step-Type` | `X-Agent-Step-Type` | `agent.step_type` |
| `X-Quilr-Workflow-Id` | `X-Workflow-Id` | `workflow.id` |
| `X-Quilr-Workflow-Run-Id` | `X-Workflow-Run-Id` | `workflow.run_id` |

### Conversation, Correlation, and Session

Lightweight correlation IDs for grouping and idempotency. Conversation IDs remain backward compatible with [Conversation Grouping](./conversation-grouping).

| Header(s) | Captured as |
|-----------|-------------|
| `X-Conversation-Id`, `Conversation-Id`, `conversation_id` | `correlation.conversation_id` (also top-level `extra_data.conversation_id`) |
| `X-Request-Id`, `Request-Id` | `correlation.external_request_id` |
| `X-Correlation-Id`, `Correlation-Id` | `correlation.correlation_id` |
| `X-Session-Id`, `Session-Id` | `correlation.session_id` |
| `Idempotency-Key`, `X-Idempotency-Key` | `correlation.idempotency_key` |

The gateway's own internal `request_id` is never overwritten - inbound request IDs are stored only as external correlation.

### W3C Baggage

The gateway parses the `baggage` header but stores **only allowlisted keys** - raw baggage is never persisted, and any key containing a sensitive term is dropped.

```
baggage: agent.run_id=run-123,agent.framework=langgraph,workflow.id=claims-review
```

Allowlisted keys:

- `agent.run_id`, `agent.id`, `agent.name`, `agent.version`, `agent.framework`, `agent.thread_id`, `agent.step.name`, `agent.step.type`
- `workflow.id`, `workflow.run_id`
- `session.id`, `session.previous_id`
- `user.id`, `user.email`, `conversation.id`

OpenTelemetry GenAI semantic-convention correlation keys (IDs and names only - never the content-bearing `gen_ai.*` message or argument attributes):

- `gen_ai.conversation.id`, `gen_ai.agent.id`, `gen_ai.agent.name`, `gen_ai.data_source.id`, `gen_ai.tool.name`, `gen_ai.tool.call.id`

### Request Body Correlation - the no-header path

Most agent frameworks (LangChain/LangGraph, LlamaIndex, CrewAI, OpenAI Agents) do not put correlation in HTTP headers on the provider call. When a developer sets it, it lands in provider-native request-body fields. The gateway parses these too, so a stock OpenAI or Anthropic SDK call through the gateway can correlate with zero custom headers.

| Provider | Body field | Captured as |
|----------|-----------|-------------|
| OpenAI (Chat Completions / Responses) | `metadata` (object, up to 16 pairs) | `request.metadata` |
| OpenAI | `user` | `request.user` |
| OpenAI | `safety_identifier` | `request.safety_identifier` |
| OpenAI | `prompt_cache_key` | `request.prompt_cache_key` |
| Anthropic (Messages) | `metadata.user_id` | `request.metadata.user_id` |

```python
client.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    user="end-user-7",
    extra_body={"metadata": {"agent_run_id": "run-123", "workflow": "support-triage"}},
)
```

Body correlation is captured on the OpenAI-compatible, Anthropic Messages, OpenAI Responses, and Copilot Studio surfaces. Pairs whose **key** contains a sensitive term are dropped; opaque values such as `run-monkey-3` are kept. Only scalar values (string, number, boolean) are captured; nested objects are skipped.

### Migrating From Another Gateway

If you are moving from another LLM gateway, keep your existing instrumentation - the gateway captures the common inbound conventions under `gateways`, preserving provenance.

| Gateway | Headers |
|---------|---------|
| **Helicone** | `Helicone-Session-Id`, `Helicone-Session-Name`, `Helicone-Session-Path`, `Helicone-User-Id`, `Helicone-Request-Id` |
| **Portkey** | `x-portkey-trace-id`, `x-portkey-span-id`, `x-portkey-span-name`, `x-portkey-metadata` (JSON object, bounded) |
| **Cloudflare AI Gateway** | `cf-aig-metadata` (JSON object, bounded) |

### Upstream Provider Request IDs

For request-to-provider traceability, the gateway also records the upstream provider's response ID (for example OpenAI `x-request-id`, Anthropic `request-id`, Bedrock `x-amzn-requestid`) under `observability.upstream`. When a request makes more than one upstream call (preflight or retries), the most recent is kept flattened and a bounded list of recent calls is retained.

## Framework Guidance

| Framework | Lowest-friction correlation |
|-----------|-----------------------------|
| **LangGraph / LangChain** | Pass `extra_body={"metadata": {"agent_run_id": ..., "workflow": ...}}` and `user=...` on the model call. To use headers, map `thread_id` to `X-Conversation-Id` and the run ID to `X-Quilr-Agent-Run-Id`. |
| **OpenAI Agents SDK** | Propagate the run/trace IDs via W3C `traceparent` or `X-Quilr-Agent-*` headers. |
| **LlamaIndex** | Pass conversation/run IDs as headers on LLM calls routed through the gateway. |
| **CrewAI / custom** | Use W3C trace headers when available, and `X-Quilr-Agent-*` for run/agent identity. |

:::note Header correlation vs. full agent tracing
These signals let you correlate the **LLM calls** an agent makes. They do not capture the agent's own tool calls, retrieval steps, or memory operations - the gateway cannot infer those reliably from provider traffic. Use your framework's tracing exporter for those spans.
:::

## Limits and Safety

The capture is deliberately bounded and privacy-preserving:

- **Sensitive keys are dropped.** Any header, baggage key, or metadata key containing `authorization`, `auth`, `api_key`, `apikey`, `token`, `secret`, `cookie`, `password`, `credential`, `key`, or `jwt` is discarded.
- **Values are sanitized.** Stored values are ASCII-safe with NUL bytes removed, capped at 512 bytes each.
- **Maps are bounded.** Free-form metadata and JSON-header maps are capped at 16 key/value pairs.
- **Total size is capped at 8 KB.** If the normalized object would exceed this, the lowest-priority sections are dropped in order (vendor trace context, then competing-gateway data, then body metadata, then baggage) so the most valuable trace, correlation, and agent IDs are preserved.
- **Header lookup is case-insensitive**, and malformed tracing data is dropped rather than stored.
- **Identity is never trusted from telemetry.** Tenant, app, API key, and user authorization are always derived from gateway auth - never from inbound tracing headers or body fields.

## Related

- [Conversation Grouping](./conversation-grouping) - the `X-Conversation-Id` header reused here for conversation correlation.
- [Identity Aware](./identity-aware) - per-user identity that complements agent/run correlation.
- [Log Export API](../log-export-api) - where the `observability` object is delivered in `metadata.extra_data`.
