---
sidebar_position: 2
sidebar_label: "Rate, token and budget limits"
sidebar_custom_props:
  icon: Gauge
---

# Rate and Token Limits

Cap how long calls run, how many run at once, how many requests an app makes and how many tokens it spends. All limits are enforced at the gateway, before the request reaches the provider.

Open the app's **Settings > Rate and Token Limits** (under **Protection**). New apps have no limits set. Leave a field empty to keep it unlimited.

![Rate and Token Limits section with Timeout, Concurrency per minute, and the Application rate limit with a Minute, Hour or Day window](/img/llm-gateway/ui/app-rate-token-limits.png)

:::note Policy Engine
When the Policy Engine is on, rate and token limit policies (the **Rate, Token & Timeout Limits** card) apply instead. See [App settings under the Policy Engine](../../console/govern/policy-engine#app-settings-under-the-policy-engine).
:::

## Settings

| Group | Setting | What it limits |
|-------|---------|----------------|
| Request limits | **Timeout (seconds)** | How long one call may run before the gateway ends it. |
| Request limits | **Concurrency per minute** | Calls in flight for the whole app, per minute. |
| Application rate limit | **Requests** per **Minute / Hour / Day** | Requests the app may make in a rolling window. Turn on **Enabled** to apply it. |
| Token limits | **Max tokens per request** | Tokens in a single request. |
| Token limits | **Input token limit** per Minute / Hour / Day | Input tokens in a rolling window. |
| Token limits | **Output token limit** per Minute / Hour / Day | Output tokens in a rolling window. |
| Per-model limits | Any of the above for one provider's model | Overrides the app limits for that model. Models without an override use the app limits. |

Limits apply to the whole app, across all of its Quilr keys. To limit individual people or groups, or to cap spend in USD, use Policy Engine policies (**Rate, Token & Timeout Limits** and **Budgets & Usage Limits**).

## When a limit is hit

The gateway rejects the call with HTTP `429` without contacting the provider. A `429` from the gateway means one of these limits was reached. Raise the limit or wait for the window to roll forward.

## Related

- [Applications and keys](../apps-and-providers/applications-and-keys) - key expiry is set on each Quilr key, not here.
- [Alerts](../monitor/alerts) - get notified when calls start failing.
