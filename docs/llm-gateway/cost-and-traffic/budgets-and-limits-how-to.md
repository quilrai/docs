---
sidebar_position: 3
sidebar_label: "Budgets and limits: how-to"
sidebar_custom_props:
  icon: ClipboardList
description: "Step-by-step recipes for LLM Gateway and MCP Gateway budgets, rate limits, exceptions, exemptions and usage, plus how spend and identity are counted."
---

# Budgets and limits: how-to

Short recipes for the questions admins ask most: how to cap spend for an app, a person or a group, how to smooth bursts, how to give someone a different limit, and how to see who is close to a limit. For every setting on the card, see [Rate, token and budget limits](./rate-token-and-budget-limits#budgets--usage-limits-card).

All LLM Gateway recipes start in the same place:

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Govern', 'Policy Engine', 'LLM Gateway']}
  action="Budgets & Usage Limits > Configure"
/>

The card opens with **Quick add** at the top: pick what you want (level one), then who it covers and how it is counted (level two), and a form opens with those choices filled in. Everything you add joins the shared draft and applies once you [publish a revision](../../console/govern/author-simulate-and-publish).

![Budgets & Usage Limits card with Quick add above the Budgets & rate limits, Request guards, Alerts & response, Exemptions, Model prices and Usage tabs](/img/policy/budgets-card-overview.png)

![Quick add level one: Set a spending budget, Set a request or token limit, Smooth bursts, Exempt someone from all limits, Cap prompt size or provider timeout](/img/policy/budgets-quick-add.png)

| Quick add card | Use it for | Starts as |
|---|---|---|
| **Set a spending budget** | Cap dollars over a day, week or month. | Spend ($), Monthly |
| **Set a request or token limit** | Cap requests or tokens over a day, week or month. | Requests, Daily |
| **Smooth bursts** | Cap requests or tokens per minute or hour. | Requests, Per minute |
| **Exempt someone from all limits** | Let a person, group or app skip every budget and rate limit, with a reason. | Exemptions tab |
| **Cap prompt size or provider timeout** | Per-request guards that apply before any budget. | Request guards tab |

:::note Budgets need the Policy Engine
Spend budgets, per-person limits and exemptions exist only in the Policy Engine. Budgets and rate limits are enforced only while the engine is on for the LLM Gateway.
:::

## Set a $500/month budget for one app

1. In Quick add, choose **Set a spending budget**, then **A specific app**.
2. Under **Which apps?**, pick the app.
3. Set **Limit** to `500`. **Resets** is already **Monthly** (the 1st of each month, 00:00 UTC).
4. Check the **Reads as** line under the form: it states the budget in one sentence.
5. Review the **pricing check** below the form: every model the app can reach needs a price. Fill any gaps in place (see [How spend is counted](#how-spend-is-counted)).
6. Select **Add to draft**, then review and publish.

![New budget form for A specific app with Limit 500, Resets Monthly, the Reads as line and the pricing check](/img/policy/budgets-new-budget-app.png)

One app, one pool: every person and key in the app draws from the same $500. To give every app its own $500 instead, choose **Each app gets its own**.

## Give each person in an app their own budget

1. Choose **Set a spending budget**, then **Each person in an app**.
2. Under **Which apps?**, pick the app and set the **Limit**, for example `50` for $50 per person per month.
3. **Add to draft** and publish.

Each person who calls the app gets a separate counter. A person is identified by their email; see [How the gateway knows who a person is](#how-the-gateway-knows-who-a-person-is).

Per-person limits skip requests with no identified person. Those requests still count toward organization, app, key and model budgets. If an app must never send anonymous traffic, turn on **Require identity** on the [Identity & Network Trust card](../protect/identity-and-network-trust#identity-aware-in-the-policy-engine-v2-console).

Other per-person shapes:

| Level two choice | Who gets a counter |
|---|---|
| **Each person** | Every person, across all apps combined. |
| **Each person in a group** | Every member of the smart groups you pick. |
| **Each person in a group, inside an app** | Every member of the groups you pick, only in the apps you pick. |
| **Each person in each app** | Every person, separately in every app. |
| **Specific models, per person** | Every person, only on the models you pick. |

## Give each group in an app its own budget

1. Choose **Set a spending budget**, then **Each group in an app**.
2. Pick the app under **Which apps?**.
3. Under **Which groups each get their own pool?**, pick the smart groups (at most 32).
4. Set the limit, **Add to draft** and publish.

Each chosen group gets its own budget with the same limit. A person counts against **every** chosen group they belong to, so one request by someone in both Sales and EMEA is charged to both pools. People in none of the chosen groups are not limited by these budgets.

![New budget form for Each group in an app with an app and three smart groups selected](/img/policy/budgets-each-group-in-app.png)

Related shapes: **Each group gets its own pool** (every app), **A group inside an app** (one shared pool for the group), and **Each group in each app**.

:::tip Older per-group budgets
A budget saved before per-group budgets existed may count each request against only the one smart group the directory ranks first. Such rows show **Convert to per-group**. Converting gives each chosen group its own pool; the new budgets start at zero usage.
:::

## Set a rate limit of N requests per minute

1. Choose **Smooth bursts**, then who it covers, for example **Each person** or **A specific app**.
2. **Measure** is **Requests**. Set **Limit** to N. **Resets** is **Per minute** (a rolling minute).
3. To also cap the day, select **+ Stack another window** and add, for example, `2000` **Per day**. Every window applies: 60 a minute and 2,000 a day both hold.
4. **Add to draft** and publish.

![New rate limit form with 60 requests per minute and a stacked 2,000 per day window](/img/policy/budgets-rate-limit.png)

Rate limits can also count **Input tokens**, **Output tokens** or **Total tokens**. Token counts are added when the response finishes; requests are counted when they start.

To stay under a provider account's own quota, choose **Each provider credential**.

## Give one person a higher limit, or no limit

Use **Exceptions** inside the budget. Open the budget with **Edit** (or set them while creating it):

1. Under **Exceptions**, select **+ Person** (or **+ Smart group**, **+ Application**) and pick who.
2. In **How they're limited**, choose:
   - **Own limit** and enter their amount, for example $1,000 a month for a lead engineer. Their own limit starts at zero.
   - **No limit** to leave them out of this budget entirely ("Unlimited (not counted)").
3. Save, then publish.

![Exceptions table in a budget form: one person with Own limit $1,000 / person, one with No limit, and the Paste people box open](/img/policy/budgets-exceptions.png)

For many people at once, select **Paste people…** and paste one `email, amount` per line. Leave the amount empty, or write `exempt`, for no limit:

```
ana@example.com, 250
lee@example.com, exempt
```

Exceptions are local to one budget. Every other matching budget still counts the person; the form names those budgets so you can add the same exception there. The budget row lists its exceptions after **EXCEPT**.

## Exempt a person, group or app from every limit

Use an exemption when someone must skip limits entirely, for example a production service app or an on-call incident responder.

1. In Quick add, choose **Exempt someone from all limits**, then **Specific people**, **Specific groups** or **Specific apps**. Or open the **Exemptions** tab and select **+ Add exemption**.
2. Pick **Who is exempt**.
3. Choose what they skip: **Everything**, **Budgets**, **Rate limits** or **Chosen ones** (then pick the budgets and rate limits).
4. Enter a **Reason** (recorded with the exemption) and, optionally, **Expires after** a date (the end of that day, UTC).
5. **Add to draft** and publish.

![Exemptions tab with the Add exemption form for an application, Everything selected, a reason and an expiry date, and the Never counted today panel below](/img/policy/budgets-exemptions-tab.png)

The tab also lists what is **Never counted today**. These are how the gateway behaves, not settings:

- **Requests with no identified person.** Per-person budgets and rate limits skip them. Organization, application, key and model budgets still count them.
- **Self-service parent keys.** A bare self-service parent key carries no person, so per-person budgets skip it.
- **SDK and Copilot Studio traffic.** Never counted against a budget or rate limit.
- **Policy engine switched off.** Budgets and rate limits are enforced only while the engine is on for the LLM Gateway.

## Only let one group use an app

This is an access rule, not a budget. In **Policy Engine > LLM Gateway**, open **Gateway Access > Configure** and in Quick add choose **Only let certain groups use an app**. In the rule form that opens, pick the app and the groups that keep access. Everyone outside the groups you pick is denied the app before any model is called. See [Gateway access and allowed models](../protect/gateway-access-and-allowed-models#gateway-access-card).

![Gateway Access Quick add with Only let certain groups use an app selected and an app plus one smart group picked](/img/policy/gateway-access-only-groups.png)

## See who is close to a limit

Open the **Usage** tab on the Budgets & Usage Limits card, or select **Usage** in the LLM Gateway header of the Policy Engine. Usage lists every published budget and rate limit with its current use, the people, groups or apps closest to their limit, and when each one resets.

![Usage tab on the Budgets & Usage Limits card listing budgets with usage meters and the people closest to each limit](/img/policy/budgets-usage-tab.png)

![Policy Engine LLM Gateway header with the Usage button highlighted](/img/policy/llm-gateway-usage-button.png)

Each row in the **Budgets & rate limits** tab also shows a live reading: the amount used of the limit for a shared pool, or the **Highest** percentage and a **Closest to limit** list for a per-person, per-group or per-app budget. A budget you have not published yet shows no usage.

To be told before anyone is blocked, add **Alerts** to the budget (see [What happens when a limit is hit](#what-happens-when-a-limit-is-hit)). To see the effect of a new budget before it is live, the draft review shows who would have been blocked on recent traffic and which requests the budget cannot cover (no signed-in person).

## What happens when a limit is hit

Each budget and rate limit has a **When reached** setting:

| Mode | Behaviour |
|---|---|
| **Enforce** (default) | Blocks matching requests once the limit is reached. |
| **Alert only** | Never blocks. Usage is counted and threshold alerts still fire. Use it to trial a budget. |
| **Paused** | Never blocks and sends no alerts. Usage keeps counting, so resuming continues the same total. |

A blocked request gets HTTP `429` with code `quota_exceeded` and never reaches the provider. It stays blocked until the period resets, or, for a rolling window, until older usage rolls out of it. Budgets that reset daily or later also tell clients not to retry and send a `Retry-After` header.

Tokens and spend are counted when each response finishes, so requests already running can push usage past a limit.

### Alerts

On a budget, pick the **Alerts** thresholds: 50%, 80%, 100% or a custom percentage, up to five. Alerts go to every enabled webhook under **Alerts & response > Alert destinations**; with no destination they are recorded but not delivered.

### The message people see

**Alerts & response > When a limit blocks a request** sets, for everyone:

- **Message**, up to 300 characters, with `{budget}`, `{limit}` and `{reset}` filled in. Leave it empty for the gateway's own wording, for example "Monthly budget 'Org-wide monthly cap' reached ($2,500.00). Resets Nov 1, 00:00 UTC."
- **Help link**, an `https://` page appended to the message and also sent as `help_url` and a `Link` header.
- **Tell clients not to retry**, which adds `x-should-retry: false` so short rate limits are not retried either.

The preview shows the exact `429` for OpenAI, Anthropic, Claude Code, Bedrock and Vertex clients.

![Alerts & response tab with one webhook destination and the block message form with its OpenAI 429 preview](/img/policy/budgets-alerts-response.png)

## How spend is counted

- **Provider-reported tokens.** Spend uses the token counts the provider returns for each response, including cached input (cache read and cache write) and reasoning tokens. Each token class is priced at its own rate.
- **Prices come from the policy.** The **Model prices** tab holds the prices spend budgets use. They are filled in from **Settings › Models** first, then the **Quilr catalog**; a token class you leave blank uses the Quilr catalog rate. When you add a spend budget, the pricing check lists every model it can reach and offers to fill missing prices.
- **Estimates only as a fallback.** When a provider reports no usage for a response, the gateway estimates the tokens so the request is still counted.
- **Speech counts $0.** Text-to-speech, speech-to-text and Sarvam requests add $0 to spend budgets. Cap them with a **Requests** limit instead.
- **Catalog list price vs your price.** Quilr catalog rates are providers' public list prices. If you have negotiated or committed-use pricing, edit the model's row in **Model prices** (or set the price in **Settings › Models**) so budgets track what you actually pay.
- **Models without a price.** Choose **Block the request** (the default; spend is never under-counted) or **Count it as $0** (the request goes through and the log marks it unpriced).

{/* TODO(screenshot): budgets-model-prices.png - see SHOT_LIST.md #12 */}
![Model prices tab with Input, Cache read, Cache write, Output and Reasoning columns, source tags From Quilr catalog and From Settings › Models, and the Models without a price setting](/img/policy/budgets-model-prices.png)

## How the gateway knows who a person is

Per-person budgets, rate limits, exceptions and exemptions all key on the person's email. The gateway takes identity from the first source present, in this order:

1. A **verified JWT** (when JWT authentication is on for the app).
2. A **self-service key** issued to that person.
3. The **`X-User-Email`** header. It is always captured, but not verified, so send it only from a trusted backend.
4. Forwarded **identity-token headers** from supported clients.

**Allowed user domains** apply to every source: an email outside them is rejected. Configure the sources per app in **Settings > AI Gateway > LLM Gateway > your app > Settings > Identity Aware**; see [Identity and network trust](../protect/identity-and-network-trust).

Email and smart group matching ignores case: `Ana@Example.com` and `ana@example.com` are one person, and an exception for the `Contractors` group covers members of `contractors`.

## MCP Gateway: limit tool calls and concurrency

MCP limits live on the **Usage Quotas & Concurrency** card in **Govern > Policy Engine > MCP Gateway** (stage 3, Request). Its Quick add offers:

| Quick add | Level two choices |
|---|---|
| **Limit calls** (per minute, hour or day) | **Each person**, **Each person on each server**, **Each tool**, **Each group**, **Whole organization** |
| **Limit simultaneous calls** | **Each person**, **Each server** |

- **Calls per server.** Choose **Each person on each server**, or scope the rule to one MCP server so the whole organization shares one count for it.
- **Calls per agent.** Scope the rule to an agent name, or count it by `agent` in the advanced editor, so an automated agent gets a lower ceiling than people.
- **Concurrency.** **Simultaneous calls** caps how many calls run at once. A call that would cross any limit is refused and nothing is charged.

{/* TODO(screenshot): mcp-usage-quotas-quick-add.png - see SHOT_LIST.md #13 */}
![MCP Usage Quotas & Concurrency card with Quick add showing Limit calls and Limit simultaneous calls and their level two choices](/img/policy/mcp-usage-quotas-quick-add.png)

See [Usage quotas and concurrency](../../mcp-gateway/protect/usage-quotas-and-concurrency) for every setting.

## Related

- [Rate, token and budget limits](./rate-token-and-budget-limits) - every setting on the card.
- [Identity and network trust](../protect/identity-and-network-trust) - identity sources and requirements.
- [Smart groups](../../console/settings-organization/smart-groups) - the groups budgets can target.
- [Costs and savings](../../console/observe/costs-and-savings) - spend across sources.
