---
sidebar_position: 2
sidebar_label: "Costs & Savings"
sidebar_custom_props:
  icon: Coins
---

# Costs & Savings

Costs & Savings shows what your organisation spends on AI, how many tokens it
uses, how many tokens Quilr already saves, and which settings would save more.
Open it from **Observe > Costs & Savings**.

![Costs & Savings in the console](/img/console-v2/pages/costs-and-savings.jpg)

The header controls apply to every tab: the period, **Sources** (all sources
or one), **Compare: previous period**, and refresh.

:::note Estimates, not an invoice
Only the [LLM Gateway](../../llm-gateway) sees exact token counts, because
requests pass through it. Spend and tokens for other sources (MCP Gateway,
Endpoint Agent, Browser Extension and connected platforms) are **estimates**.
MCP Gateway, Endpoint Agent and Browser Extension figures are estimated at
four characters per token.
Estimates from different sources can overlap, so do not add them up as if
they were a bill. Use your provider invoices for the amount you actually pay.
The **Data coverage** table on the Overview tab shows what each source
contributes.
:::

## Overview

- **What you use**: spend in USD and tokens used, split by source.
- **What you save**: tokens saved and the estimated opportunity still
  available.
- **Needs attention**: recommendation cards, each with **Review**.
- **Daily trend**: spend, tokens or saved tokens per day.
- **Data coverage**: a table of what each source contributes.
- **Top drivers**: what accounts for most of the usage.

## Attribution

Who and what drives usage. Pick a metric (**Spend**, **Tokens** or **Tokens
saved**) and group by **Applications**, **Users**, **Models**, **Tools**,
**Agents**, **Departments**, **Smart Groups**, **Sources**, **Usage types**,
**Topics** or **Repositories**.

The table shows each entry with a daily pattern sparkline and its change in
spend. The **Unassigned usage** panel shows usage that could not be tied to a
person or app. Use **Filters** to narrow the table.

## Savings

- **Tokens saved** and their **Estimated value**.
- **Settings to change**: a ranked list of savings you could switch on, each
  with **Open settings** to go straight to the right configuration page.
- **Where saving came from**: savings per technique. LLM Gateway techniques
  include provider prompt cache, text compression, markdown-to-text and smart
  JSON. MCP Gateway techniques include smart JSON and HTML-to-text. The
  Endpoint Agent contributes Claude compression.
- **Per-app saving controls**: a matrix of which technique is on or off for
  each application.

To turn savings on, see
[LLM Gateway token saving](../../llm-gateway/cost-and-traffic/token-saving)
and [MCP Gateway token saving](../../mcp-gateway/protect/token-saving).

## Habits

Usage habits worth discussing with people, such as **Long sessions**,
**Session reuse after idle** and **Single sessions**. Each row shows the
impact, the person, the application, the habit, the evidence, the tokens
involved and details. Use it for coaching, not enforcement.

## Providers

Provider availability and its cost impact. For each provider: keys,
requests, outcomes (with the failed share), estimated blocked requests, the
last incident and status. Use it to see whether rate limits, auth failures or
provider errors are costing you traffic.
