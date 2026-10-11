---
sidebar_position: 2
sidebar_label: "Rate, token and budget limits"
sidebar_custom_props:
  icon: Gauge
description: "App rate, token and timeout limits, and the Policy Engine Budgets & Usage Limits card for spend budgets, rate limits, request guards and model prices."
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

App limits apply to the whole app, across all of its Quilr keys. Classic app settings have no USD budget and no per-person limit; both need the Policy Engine (see [Budgets and limits: how-to](./budgets-and-limits-how-to)).

## When a limit is hit

The gateway rejects the call with HTTP `429` without contacting the provider. Raise the limit or wait for the window to roll forward. A reached budget returns `429 quota_exceeded` until its period resets. With the Policy Engine on you can set the message, a help link and retry behaviour; see [What happens when a limit is hit](./budgets-and-limits-how-to#what-happens-when-a-limit-is-hit).

## Going further with the Policy Engine

One card in **Policy Engine > LLM Gateway**, **Budgets & Usage Limits**, holds spend budgets, rate limits, request guards and model prices. It replaces the separate Rate, Token & Timeout Limits card. When the engine is on for the LLM Gateway, the app's Rate and Token Limits settings freeze and this card applies instead. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

For step-by-step recipes ($500 a month for one app, a budget per person or per group, N requests a minute, exceptions, exemptions), see [Budgets and limits: how-to](./budgets-and-limits-how-to).

The card applies on the `assistants`, `bedrock`, `chat`, `embeddings`, `realtime`, `rerank`, `responses`, `stt`, `text`, `tts` and `vertex` API surfaces.

### Budgets & Usage Limits card

{/* TODO(screenshot): budgets-list-row.png - see SHOT_LIST.md #14 */}
![Budgets & rate limits tab with a spend budget row (Budget and Spend tags, who it covers, EXCEPT tags, usage meter with Closest to limit) and a rate limit row with two stacked windows](/img/policy/budgets-list-row.png)

**Quick add** sits above the tabs: **Set a spending budget**, **Set a request or token limit**, **Smooth bursts**, **Exempt someone from all limits** and **Cap prompt size or provider timeout**. Each opens a form with the shape you picked already filled in. **Open advanced editor** at the bottom covers anything the forms cannot say, such as limits keyed on request metadata or each person x each model.

| Tab | What it holds |
|---|---|
| **Budgets & rate limits** | One list, each row tagged **Budget** or **Rate limit**, with who it covers, exceptions, alert thresholds and live usage. **Custom** opens a blank form. |
| **Request guards** | Per-request limits never counted over time: **Max prompt size** (estimated input tokens) and **Provider idle timeout** (seconds with no data from the provider; streams can run longer overall). |
| **Alerts & response** | **Alert destinations** (webhooks that receive budget alerts) and **When a limit blocks a request** (message, help link, retries). |
| **Exemptions** | People, groups or apps that skip every limit, budgets only, rate limits only, or chosen ones, with a reason and optional expiry. Also lists what is never counted. |
| **Model prices** | The prices spend budgets use, and what happens to **Models without a price**. |
| **Usage** | Current use of every published budget and rate limit, and who is closest to each limit. Also opened with **Usage** in the LLM Gateway header. |

#### Budget and rate limit settings

| Setting | Options | Default |
|---|---|---|
| Who | Whole organization, Each person, A specific app, Each app gets its own, Each group gets its own pool, Each person in a group, Each person in an app, A group inside an app, Each group in an app, Each person in a group inside an app, Each person in each app, Each group in each app, Specific models per person, Each provider credential (rate limits), Custom | From Quick add |
| Measure | Spend ($), Requests, Input tokens, Output tokens, Total tokens | Spend ($) for a spending budget, Requests otherwise |
| Limit | A number. `0` blocks everything in scope. | - |
| Resets | Daily, Weekly (Mondays), Monthly (the 1st), Per minute, Rolling hour, Rolling 24 h, Rolling 30 days, Every N hours or days, or a **One-time allowance** that never resets | Monthly for spend, Daily for usage, Per minute for rate limits |
| Stacked windows | **+ Stack another window** adds another limit and period; every window applies | - |
| Exceptions | People, smart groups or apps with **No limit** or an **Own limit** | - |
| When reached | **Enforce**, **Alert only**, **Paused** | Enforce |
| Alerts (budgets) | 50%, 80%, 100% or a custom percentage, up to five | None |

Calendar periods reset at 00:00 UTC.

- **Every matching budget and rate limit applies.** A request must fit inside all of them, so the tightest one stops it first.
- **Requests count at the start; tokens and spend count at completion.** One in-flight request can carry a counter past its limit.
- **Per-person limits skip requests with no identified person.** Organization, app, key and model limits still count them.
- **Changing the limit, scope or exceptions keeps the usage.** Changing what is measured, how it is counted or when it resets (**Change (starts fresh)** in the edit form) starts a new count at zero. A one-time allowance never resets; once used up, matching requests are rejected until an admin raises it.

:::warning Spend budgets need prices
A spend budget prices usage with the **Model prices** tab. Prices there are filled in from **Settings › Models**, then the Quilr catalog, and prices already in the policy are never replaced. A price for a specific provider credential beats a provider-wide price for that credential; among prices for the same model and credential, the highest priority wins. Under **Models without a price**, **Block the request** (the default) rejects requests to unpriced models while a spend budget applies; **Count it as $0** lets them through uncapped. See [How spend is counted](./budgets-and-limits-how-to#how-spend-is-counted).
:::

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

Limits and budgets cannot be scoped by Prompt complexity, Prompt text or Tool.

## Related

- [Budgets and limits: how-to](./budgets-and-limits-how-to) - recipes for common budgets and limits.
- [Applications and keys](../apps-and-providers/applications-and-keys) - key expiry is set on each Quilr key.
- [Providers and models](../apps-and-providers/providers-and-models) - model prices for cost reporting.
- [Costs and savings](../../console/observe/costs-and-savings) - spend across sources.
- [Alerts](../monitor/alerts) - get notified when calls start failing.
