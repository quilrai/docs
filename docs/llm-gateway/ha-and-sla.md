---
sidebar_position: 3
sidebar_custom_props:
  icon: Activity
---

# HA & SLA

High availability endpoints, retry strategy, and latency guarantees for the QuilrAI LLM Gateway.

## Gateway Endpoints

All endpoints are fully interchangeable - same API surface, same features, same API keys. The only difference is geographic proximity to your application.

| Endpoint | Region | Base URL |
|----------|--------|----------|
| **Global (auto-routed)** | Nearest | `https://guardrails.quilr.ai` |
| **USA 1** | US Central West | `https://guardrails-usa-1.quilr.ai` |
| **USA 2** | US East | `https://guardrails-usa-2.quilr.ai` |
| **India** | Mumbai | `https://guardrails-india-1.quilr.ai` |

Append the API format path to any base URL - for example, `https://guardrails-usa-1.quilr.ai/openai_compatible/`. See the [Integration Guide](./integration-guide) for all supported formats.

For production traffic, choose the location-specific endpoint closest to your application as the primary base URL. Use `guardrails.quilr.ai` only when you explicitly want global auto-routing.

:::info Expanding regions
This list will continue to grow as we bring new regions online. Check this page or the [Integration Guide](./integration-guide) for the latest endpoints.
:::

## Routing Architecture

If you use `guardrails.quilr.ai`, it automatically routes to the nearest available gateway server based on your geographic location. For predictable production routing, use a regional endpoint directly.

```mermaid
flowchart TD
    A["Your Application"] --> B["guardrails.quilr.ai"]
    B --> C{"Auto-route to<br/>nearest server"}
    C -->|"US Central West traffic"| D["guardrails-usa-1.quilr.ai"]
    C -->|"US East traffic"| E["guardrails-usa-2.quilr.ai"]
    C -->|"India traffic"| F["guardrails-india-1.quilr.ai"]
    C -->|"Future regions"| H["..."]
    D --> G["LLM Providers"]
    E --> G
    F --> G
    H --> G
```

Each regional server runs the full QuilrAI pipeline - validation, scanning, transformation, routing, and observability - so there is no functional difference between endpoints.

## Recommended Retry Strategy

<StepFlow steps={[
  {
    label: "Attempt 1",
    items: [
      "→ guardrails-usa-2.quilr.ai",
      "Direct to US East server ✓",
      "Primary regional endpoint ✓",
    ],
  },
  {
    label: "Attempt 2",
    items: [
      "→ guardrails-usa-1.quilr.ai",
      "Direct to US Central West server ✓",
      "Host-level redundancy ✓",
    ],
  },
  {
    label: "Attempt 3",
    items: [
      "→ guardrails-india-1.quilr.ai",
      "Direct to India server ✓",
      "Geographic redundancy ✓",
    ],
  },
]} />

For production retry logic, use explicit regional endpoints. Start with the location-specific endpoint closest to your application, then fail over to other regional hosts. Do not include the global auto-routed endpoint in the retry chain.

Example order for a US East deployment:

1. **First attempt** - `guardrails-usa-2.quilr.ai` - Direct connection to the nearest regional server.
2. **Second attempt** - `guardrails-usa-1.quilr.ai` - Direct connection to another US server for host-level redundancy.
3. **Third attempt** - `guardrails-india-1.quilr.ai` - Targets a geographically distinct server for maximum redundancy.

### Why retry with regional endpoints?

Explicit regional fallbacks protect against edge cases that auto-routing alone cannot cover:

- **DNS or routing-layer issues** - Direct regional URLs bypass the global routing layer entirely.
- **Deterministic failover** - Retrying with an explicit regional URL immediately targets a different host instead of letting the auto-router choose.
- **Regional propagation delays** - A server that has just recovered may not yet be visible to the auto-router. Hitting it directly avoids propagation lag.
- **Geographic redundancy** - Retrying across regions ensures your request reaches an entirely independent infrastructure stack, eliminating single points of failure.

The overhead is minimal - two additional fallback URLs in your retry logic - but the resilience improvement is significant.

We recommend **one retry per QuilrAI host**. If a request fails on a given endpoint, move on to the next one rather than retrying the same host. This maximizes the chance of hitting a healthy server quickly.

### Code Example

```python
import time
import httpx

ENDPOINTS = [
    "https://guardrails-usa-2.quilr.ai",      # primary US East endpoint
    "https://guardrails-usa-1.quilr.ai",      # direct US Central West fallback
    "https://guardrails-india-1.quilr.ai",    # direct India fallback
]

def call_llm(payload: dict) -> dict:
    for base_url in ENDPOINTS:
        try:
            resp = httpx.post(
                f"{base_url}/openai_compatible/v1/chat/completions",
                headers={"Authorization": "Bearer sk-quilr-xxx"},
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json()
        except (httpx.RequestError, httpx.HTTPStatusError):
            time.sleep(0.3)  # optionally sleep slightly before retrying the next host
            continue
    raise RuntimeError("All gateway endpoints failed")
```

```python
import time
from openai import OpenAI

ENDPOINTS = [
    "https://guardrails-usa-2.quilr.ai/openai_compatible/v1",   # primary US East endpoint
    "https://guardrails-usa-1.quilr.ai/openai_compatible/v1",   # direct US Central West fallback
    "https://guardrails-india-1.quilr.ai/openai_compatible/v1", # direct India fallback
]

def call_llm(messages: list) -> str:
    for base_url in ENDPOINTS:
        try:
            client = OpenAI(base_url=base_url, api_key="sk-quilr-xxx")
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
            )
            return response.choices[0].message.content
        except Exception:
            time.sleep(0.3)  # optionally sleep slightly before retrying the next host
            continue
    raise RuntimeError("All gateway endpoints failed")
```

```javascript
const ENDPOINTS = [
  "https://guardrails-usa-2.quilr.ai",     // primary US East endpoint
  "https://guardrails-usa-1.quilr.ai",     // direct US Central West fallback
  "https://guardrails-india-1.quilr.ai",   // direct India fallback
];

async function callLLM(payload) {
  for (const baseUrl of ENDPOINTS) {
    try {
      const res = await fetch(
        `${baseUrl}/openai_compatible/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer sk-quilr-xxx",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 300)); // optionally sleep slightly before retrying the next host
      continue;
    }
  }
  throw new Error("All gateway endpoints failed");
}
```

## Data Residency Note

:::info Only LLM requests are routed across regions
When a request is routed to a different regional endpoint (either by auto-routing or your retry logic), **only the LLM API call itself** is forwarded to that region's gateway server. All other data - request logs, analytics, guardrail audit trails, prompt history, and dashboard metrics - remains stored in your account's primary region. Cross-region routing does not replicate or move any of your logged data to another geography.
:::

## SLA

### Uptime

QuilrAI guarantees **99.6% uptime** across all gateway endpoints. This is measured as the combined availability of the global and regional endpoints. With the recommended retry strategy across multiple hosts, effective availability from your application's perspective is significantly higher.

### Gateway Latency

The QuilrAI gateway adds **~40 ms** of processing latency for a typical 12,000-token request. This covers the full pipeline - authentication, guardrail scanning, transformation, routing, and logging.

| Metric | Value |
|--------|-------|
| **Gateway overhead** | ~40 ms per 12,000 tokens |
| **Overhead source** | Auth + guardrails + routing + logging |
| **LLM response time** | Improved by 2-5% due to server-side connection optimizations |

Gateway latency scales with token count. Shorter requests are faster; longer requests proportionally slower.

### Connection Pooling & Performance Under Load

The QuilrAI gateway maintains persistent connection pools to all configured LLM providers. This delivers meaningful performance benefits, especially under high concurrency:

- **Eliminates per-request TLS handshakes** - Connections to providers like OpenAI and Anthropic are kept warm, removing the 50-150 ms of handshake overhead that each cold connection would otherwise incur.
- **Reduces provider-side throttling** - Pooled connections present a stable, predictable traffic pattern that is less likely to trigger provider rate limits compared to bursts of new connections from distributed clients.
- **Handles connection backpressure** - Under high concurrency, the gateway queues and multiplexes requests across the pool rather than opening unbounded connections that providers may reject.
- **Centralized provider credentials** - A single connection pool per provider key avoids the "thundering herd" problem where many application instances each independently compete for connections.

For latency-sensitive workloads, the gateway's pooling layer can reduce effective end-to-end latency below what a direct provider connection achieves - particularly during traffic spikes when cold-start connection costs dominate.
