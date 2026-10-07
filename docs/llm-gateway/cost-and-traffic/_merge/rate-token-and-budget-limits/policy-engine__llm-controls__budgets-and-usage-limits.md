---
sidebar_position: 9
sidebar_custom_props:
  icon: Coins
---

# Budgets & Usage Limits

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../../console/govern/author-simulate-and-publish) a revision.
:::

Cap spend in USD, or cap requests and tokens, over a reset period. Count it shared across everyone in scope, or separately per person, application, key, model or credential.

![Budgets & Usage Limits card collapsed with the Budgets and Model pricing summary rows](/img/policy-engine/llm-budgets-card.png)

## How budgets work

![Budgets & Usage Limits card expanded with the request-stage banner, an empty Budgets section, an empty Model pricing section and Add configuration](/img/policy-engine/llm-budgets-expanded.png)

- **Every matching budget applies.** Budgets do not resolve by priority. A request must fit inside all of them.
- **Requests count at the start; tokens and spend count at completion.** One in-flight request can carry a counter past its limit.
- **Once a budget is reached**, later matching requests get HTTP `429 quota_exceeded` until the period resets.
- **Spend needs prices.** A spend budget prices provider-reported usage with the rates in **Model pricing**. With the Policy Engine on, this card is the only price source (prices set under Settings > Models are not used): a model with no rate under a spend budget is rejected with HTTP `503 quota_price_unavailable`.
- With no budget configured, spend and usage are recorded but never capped.

## Sections

| Section | What it does | Applies on | Empty state |
|---|---|---|---|
| **Budgets** | Spend or usage counters with a limit and reset window. **Add budget**. | `assistants`, `bedrock`, `chat`, `embeddings`, `realtime`, `rerank`, `responses`, `stt`, `text`, `tts`, `vertex` | Spend and usage are recorded but never capped. |
| **Model pricing** | USD per 1 million input and output tokens, per provider and model. **Add pricing**. | Same | A spend budget cannot price any model until a rate is set. |

For a budget keyed on request metadata or an API key, use **Add configuration** at the bottom of the card and finish in the full editor.

## Budget settings

![New budget dialog with What to count, Limit, Counted, Resets, Reads as with the pricing coverage note, Severity and More options](/img/policy-engine/llm-budgets-new-budget-dialog.png)

| Setting | Options | Default | Notes |
|---|---|---|---|
| Applies to | Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Source network, Except... | Everyone | Or pick an application directly. Decides which requests count toward the budget. |
| What to count | Spend (USD), Requests, Input tokens, Output tokens, Total tokens | Spend (USD) | |
| Limit | A number above zero | - | USD for spend (for example 2500), a count otherwise (for example 1000000 tokens). |
| Counted | **Shared**, or **Separately for each** of: Tenant ID, User ID, User email, Application key ID, Application key, Application method key, Application method type, Actual provider, Actual provider label, Actual model | Shared | Pick several fields for one counter per combination, for example each person + each model. Requests without a user email do not count toward a per-person budget. |
| Resets | Rolling minute, hour, day, week, month or year; Calendar day, week, month or year; Lifetime (no reset) | Calendar month | Rolling looks back over the last period. Calendar resets on the boundary. |
| Timezone | IANA timezone | UTC | Calendar periods only. |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Reported only. Never changes the outcome. |
| More options | **Open in full editor** | - | Priority, extra rules, metadata and content conditions, raw QuilrQL. |

Each budget gets a generated ID that its usage is tracked against. See [The Budget ID matters](../../console/govern/policy-engine#budgets-and-spend) before changing a published budget's measure, period or grouping.

:::warning Price every reachable model first
For a **Spend (USD)** budget, Model pricing must cover every model the budget can reach, including fallback models from [routing](./routing-and-fallbacks), for the whole budget scope. Coverage is checked when you add the budget and again before publishing.
:::

## Budget groups

A budget group is the set of requests that share one counter. Two settings shape it:

| You want | Applies to | Counted |
|---|---|---|
| One pool for a whole app | Application | Shared |
| An allowance per person in an app | Application | Separately for each: User email |
| An allowance per person per model | Everyone | Separately for each: User email + Actual model |
| A cap per API key | Everyone | Separately for each: Application key ID |
| A team cap on top of personal caps | Two budgets on the same scope | One Shared, one per User email |

Because every matching budget applies, the tightest one stops the request first.

## Model pricing settings

The **Add pricing** dialog first asks who the rates apply to (same scope chips as a budget), then opens the editor to set the rates.

| Setting | Notes |
|---|---|
| Provider | The provider the rate is for. |
| Provider credential | Optional. Price one credential differently from the provider's other credentials. |
| Model | The model id as reported by the provider. |
| Input cost (USD per 1M tokens) | Required for spend budgets. |
| Output cost (USD per 1M tokens) | Required for spend budgets. |

Rates are scoped like any other setting. The simplest setup is one **Everyone** configuration listing every model you use.

## Examples

<PolicyCard
  name="support_copilot_budgets"
  stage="request"
  priority={500}
  when={[{ field: "Application", op: "is", value: "Support Copilot" }]}
  then={[
    {
      effect: "Budgets",
      value: "2 budgets",
      detail: [
        { label: "Budget 1", value: "Spend (USD), 500, Calendar month, UTC, separately for each User email" },
        { label: "Budget 2", value: "Total tokens, 10,000,000, Rolling week, shared" },
      ],
    },
    {
      effect: "Model pricing",
      value: "2 models",
      detail: [
        { label: "gpt-4.1", value: "input $2.00, output $8.00 per 1M tokens" },
        { label: "gpt-4.1-mini", value: "input $0.40, output $1.60 per 1M tokens" },
      ],
    },
  ]}
/>

Each person gets 500 USD a month, and the whole app shares 10M tokens a rolling week. A person under their own budget is still stopped once the team cap is reached.

<PolicyCard
  name="interns_daily_requests"
  stage="request"
  priority={600}
  when={[{ field: "Smart groups", op: "includes (ignoring case)", value: "Interns" }]}
  then={[
    { effect: "Budgets", value: "Requests, 200, Calendar day, separately for each User email", tone: "info" },
  ]}
/>

A usage allowance needs no prices: each intern may send 200 requests a day.

## Scoping and precedence

- Budgets add up; they never override each other.
- Every matching Model pricing configuration contributes its rates. Avoid pricing the same model differently in overlapping scopes.
- Budgets cannot be scoped by Prompt complexity, Prompt text or Tool.

## Legacy app setting

Classic app settings have no USD budget. App-wide request and token limits are in [Rate and Token Limits](./rate-token-and-budget-limits).
