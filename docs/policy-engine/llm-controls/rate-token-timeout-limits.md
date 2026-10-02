---
sidebar_position: 10
sidebar_custom_props:
  icon: Gauge
---

# Rate, Token & Timeout Limits

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Cap concurrency, request rate, token volume, tokens per request and provider timeout, for a scope or per model. Limits are enforced at the gateway before the provider call.

![Rate, Token & Timeout Limits card collapsed with the Application limits and Per-model limits summary rows](/img/policy-engine/llm-limits-card.png)

## How limits combine

Limits do **not** resolve by priority. For each limit, the **strictest** matching value wins, so a narrower row can tighten a broader one but never loosen it. Window limits compare per second, so 1,000 per minute is stricter than 100,000 per day.

![Rate, Token & Timeout Limits card expanded with an application limits row, an empty Per-model limits section and Add configuration](/img/policy-engine/llm-limits-expanded.png)

## Sections

| Section | What it does | Empty state |
|---|---|---|
| **Application limits** | Concurrency, request rate, token windows, tokens per request and provider timeout for a scope. **Add limits**. | No limit. |
| **Per-model limits** | The same limits keyed by model, or by provider credential and model. **Add model limit** (scope first, then the editor). | No model carries its own limit. |

Both apply on `assistants`, `bedrock`, `chat`, `embeddings`, `realtime`, `rerank`, `responses`, `stt`, `text`, `tts` and `vertex`. For limits keyed on an API key, request metadata or content size, use **Add configuration** and finish in the full editor.

## Limit settings

Switch on only the limits you want. A limit left off keeps the value from a broader configuration.

![New application limits dialog with all six limits switched on: Concurrency, Requests per minute, Input tokens per hour, Output tokens per hour, Tokens per request and Timeout](/img/policy-engine/llm-limits-dialog.png)

| Setting | Unit | Window options | Notes |
|---|---|---|---|
| Applies to | - | - | Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Source network, Except... Default Everyone. |
| Concurrency | Requests in flight | - | |
| Requests | Requests | per minute (default), per hour, per day | |
| Input tokens | Tokens | per minute, per hour (default), per day | |
| Output tokens | Tokens | per minute, per hour (default), per day | |
| Tokens per request | Input tokens | - | Ceiling for one request. |
| Timeout | Seconds | - | How long the gateway waits for the provider response. |
| Severity | - | - | Not set (default) to Very critical. Reported only. |

## Examples

<PolicyCard
  name="support_copilot_limits"
  stage="request"
  priority={500}
  when={[{ field: "Application", op: "is", value: "Support Copilot" }]}
  then={[
    { effect: "Concurrency limit", value: "50" },
    { effect: "Rate limit", value: "1,000 per minute" },
    { effect: "Input token limit", value: "100,000 per day" },
    { effect: "Output token limit", value: "200,000 per day" },
    { effect: "Tokens per request", value: "80,000" },
    { effect: "Timeout", value: "30s" },
  ]}
/>

<PolicyCard
  name="contractors_tighter_rate"
  stage="request"
  priority={600}
  when={[
    { field: "Application", op: "is", value: "Support Copilot" },
    { field: "Smart groups", op: "includes (ignoring case)", value: "Contractors" },
  ]}
  then={[{ effect: "Rate limit", value: "100 per minute" }]}
/>

Contractors get 100 requests a minute; everyone else in the app keeps 1,000. A narrower row asking for 5,000 per minute would have no effect, because the stricter value always wins.

## Scoping and precedence

- Strictest value wins per limit, regardless of priority.
- Limits cannot be scoped by Prompt complexity, Prompt text or Tool.
- For USD caps or allowances that reset on a calendar, use [Budgets & Usage Limits](./budgets-and-usage-limits).

## Legacy app setting

[Rate and Token Limits](../../llm-gateway/features/rate-limits) in the app's settings.
