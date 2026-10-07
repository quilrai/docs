---
sidebar_position: 2
sidebar_label: "Rate, token and budget limits"
sidebar_custom_props:
  icon: Gauge
---

# Rate, token and budget limits

Cap how long calls run, how many run at once, how many requests an app makes and how many tokens or dollars it spends. All limits are enforced at the gateway, before the request reaches the provider.

## Turn it on for an app

Open the app from **Settings > AI Gateway > LLM Gateway** and choose any **Configure** option to open the app workspace's **Settings** tab, then select **Rate and Token Limits** under **Protection**. New apps have no limits set. Leave a field empty to keep it unlimited.

![Rate and Token Limits section with Timeout, Concurrency per minute, and the Application rate limit with a Minute, Hour or Day window](/img/llm-gateway/ui/app-rate-token-limits.png)

| Group | Setting | What it limits |
|-------|---------|----------------|
| Request limits | **Timeout (seconds)** | How long one call may run before the gateway ends it. |
| Request limits | **Concurrency per minute** | Calls in flight for the whole app, per minute. |
| Application rate limit | **Requests** per **Minute / Hour / Day** | Requests the app may make in a rolling window. Turn on **Enabled** to apply it. |
| Token limits | **Max tokens per request** | Tokens in a single request. |
| Token limits | **Input token limit** per Minute / Hour / Day | Input tokens in a rolling window. |
| Token limits | **Output token limit** per Minute / Hour / Day | Output tokens in a rolling window. |
| Per-model limits | Any of the above for one provider's model | Overrides the app limits for that model. Models without an override use the app limits. |

App limits apply to the whole app, across all of its Quilr keys. Classic app settings have no USD budget and no per-person limit; both need the Policy Engine.

## When a limit is hit

The gateway rejects the call with HTTP `429` without contacting the provider. Raise the limit or wait for the window to roll forward. A reached budget returns `429 quota_exceeded` until its period resets.

## Going further with the Policy Engine

Two cards in **Policy Engine > LLM Gateway** cover limits: **Rate, Token & Timeout Limits** and **Budgets & Usage Limits**. When the engine is on for the LLM Gateway, the app's Rate and Token Limits settings freeze and the cards apply instead. See [Switching from classic settings](../../console/govern/switching-from-classic-settings).

Both cards apply on the `assistants`, `bedrock`, `chat`, `embeddings`, `realtime`, `rerank`, `responses`, `stt`, `text`, `tts` and `vertex` API surfaces.

### Rate, Token & Timeout Limits card

The same limits as the app settings (concurrency, requests, input and output token windows, tokens per request, timeout), in an **Application limits** section and a **Per-model limits** section keyed by model or by provider credential and model.

- Limits do **not** resolve by priority. For each limit, the **strictest** matching value wins, so a narrower row can tighten a broader one but never loosen it.
- Window limits compare per second, so 1,000 per minute is stricter than 100,000 per day.
- A limit left off keeps the value from a broader configuration.
- New limits default to a **per minute** window for **Requests** and **per hour** for **Input tokens** and **Output tokens**. **Tokens per request** counts input tokens in one request.

### Budgets & Usage Limits card

Cap spend in USD, or requests and tokens, over a reset period.

| Setting | Options | Default |
|---|---|---|
| What to count | Spend (USD), Requests, Input tokens, Output tokens, Total tokens | Spend (USD) |
| Limit | A number above zero | - |
| Counted | **Shared**, or **Separately for each** of Tenant ID, User ID, User email, Application key ID, Application key, Application method key, Application method type, Actual provider, Actual provider label, Actual model (pick several for one counter per combination) | Shared |
| Resets | Rolling minute to year, calendar day to year (calendar weeks start Monday), or Lifetime | Calendar month |
| Timezone | IANA timezone, calendar periods only | UTC |

- **Every matching budget applies.** A request must fit inside all of them, so the tightest one stops it first.
- **Requests count at the start; tokens and spend count at completion.** One in-flight request can carry a counter past its limit.
- Requests without a user email do not count toward a per-person budget.

:::warning The Budget ID matters
Each budget gets a generated ID that its usage is tracked against. Keep the ID when changing the amount and recorded usage carries over. Changing the measure, period, timezone or grouping after publishing needs a new unique ID and starts a fresh count.
:::

:::warning Spend budgets need prices
A spend budget prices usage with the rates in the card's **Model pricing** section (USD per 1M input and output tokens, per provider and model, optionally per credential). With the Policy Engine on, this section is the only price source: a model with no rate under a spend budget is rejected with `503 quota_price_unavailable`. Price every model the budget can reach, including [routing](./routing-and-fallbacks) fallbacks. Coverage is checked when you add the budget and before publishing. Every matching Model pricing configuration contributes its rates, so avoid pricing the same model differently in overlapping scopes.
:::

### Scenarios

- **Tighter rate for contractors.** Support Copilot allows 1,000 requests a minute; a narrower row for the Contractors Smart group sets 100. A narrower row asking for 5,000 would have no effect.
- **Monthly allowance per person.** Spend (USD) 500, Calendar month, counted separately for each user email, scoped to one application.
- **Team cap on top of personal caps.** Two budgets on the same scope, one Shared and one per user email.
- **Daily request allowance, no prices needed.** Each member of the Interns Smart group may send 200 requests a day.

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

Limits and budgets cannot be scoped by Prompt complexity, Prompt text or Tool. For limits keyed on an API key or request metadata, use **Add configuration** and finish in the full editor.

## Related

- [Applications and keys](../apps-and-providers/applications-and-keys) - key expiry is set on each Quilr key.
- [Providers and models](../apps-and-providers/providers-and-models) - model prices for cost reporting.
- [Costs and savings](../../console/observe/costs-and-savings) - spend across sources.
- [Alerts](../monitor/alerts) - get notified when calls start failing.
