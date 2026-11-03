---
sidebar_position: 12
sidebar_label: "Tool lists"
sidebar_custom_props:
  icon: ListChecks
description: "Per-server switches that send AI apps a server's most-used tools in full and keep the rest one search away, plus optional run_code scripts; off by default and controllable from the Policy Engine."
aliases: [tool list, most-used tools, smart tool lists, short tool list, run_code, code mode]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tool lists

Updated on 3 November 2026.

Send AI apps a short tool list: a server's most-used tools in full, with every other tool one search away.

Every turn, an AI app sends the model the full description of every tool on every connected server, including tools nobody uses. A server with 60 tools can add 8,500 tokens to every turn even when people only ever call three of them. Tool lists cut that down per server:

| Switch | What AI apps get |
|--------|------------------|
| **List most-used tools** | The tools your people use most, listed in full, plus `find_relevant_tools` (finds any other tool) and `call_tool` (runs a found tool). |
| **Add Code mode** | `run_code`: the AI writes a short script that calls the server's tools and returns only the answer, instead of calling tools one by one and reading every result. |

Both switches are **off by default**. With them off, AI apps get every tool, exactly as before.

:::note Nothing is blocked
A short list only changes what is listed up front. Every tool stays callable by name, through `call_tool` or from a `run_code` script, and every call runs through the same tool permissions, guardrails, approvals, quotas and logs as a direct call.
:::

## How it works

<StepFlow
  steps={[
    { label: "Measure", items: ["Tool calls from the last 30 days", "Ranked hourly, per server"] },
    { label: "Listed in full", items: ["Tools that cover about 90% of calls", "3 to 15 tools, plus pins"] },
    { label: "One search away", items: ["find_relevant_tools finds the rest", "call_tool runs it"] },
    { label: "Still governed", items: ["✓ Same rules, guardrails and logs", "✓ Nothing blocked"] },
  ]}
/>

- **Which tools are listed.** The gateway ranks each server's tools by how often your people called them in the last 30 days (recent calls count more) and lists the few that cover about 90% of calls, between 3 and 15 tools. Pinned tools are always listed. The ranking refreshes every hour, so the list follows how people actually work.
- **Small lists stay as they are.** If a server's full list is already short, the gateway sends it unchanged.
- **Stable during a chat.** An AI app picks up a changed list when it starts a new chat.

### Where the short list applies

| Where | With **List most-used tools** on |
|-------|----------------------------------|
| The server's own address (`<YOUR_MCP_BASE_URL>/<server-slug>/mcp`) | The server sends its most-used tools, `find_relevant_tools` and `call_tool`. With **Add Code mode** on too, it also sends `run_code`. |
| [OneMCP](../get-started/onemcp) with dynamic tool calling on | The server's most-used tools are listed directly next to OneMCP's own tools, named `<server-slug>_<tool>` (for example `crm_search_records`). Its other tools stay reachable through `find_relevant_tools` and `call_tool`. `run_code` is offered when any server the person can use has **Add Code mode** on. |
| [Workflow Agents](../../workflow-agents) | Not affected. An agent's tools are chosen when it is built, so agents always get them in full. |
| [Local MCP](../local-mcp/overview) servers | Not affected. Local servers always send their full list, and the setting is not shown for them. |

With both switches off on every server, OneMCP behaves exactly as described in [Smart Tools](../get-started/onemcp#smart-tools).

Choose the instructions for the mode that governs your MCP Gateway. See [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what happens to stored settings when the engine is on.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Tool list"
/>

The **What AI apps get** card holds the two switches. Turn on the ones you want, then click **Save tool list** in the footer. The section list shows the result: **Off**, **Most-used tools**, **Most-used + Code** or **Code only**.

![Tool list section with the What AI apps get card and the List most-used tools and Add Code mode switches](/img/mcp-gateway/ui/settings-tool-list.png)

| Setting | What it does |
|---------|--------------|
| **List most-used tools** | Sends the server's most-used tools in full and keeps every other tool one search away, on the server's own address and in OneMCP sessions with dynamic tool calling on. |
| **Add Code mode** | Lets AI apps run short `run_code` scripts that call this server's tools and return only the answer. Best for data-heavy servers. On the server's own address it comes with the most-used tools list. |
| **Pin** | Always list a tool in full, even when it is not among the most used. Pin from the **tools one search away** list or the **Most often found by search** list. Pinned tools show with a pin; click the **x** on a pinned tool to unpin it. |

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine

Open **Govern > Policy Engine > MCP Gateway > Controls > OneMCP Features**. The **Most-used tools listed** and **Scripts** sections govern short lists and `run_code` while the engine is on.

| Section | Effect | When no rule sets it |
|---|---|---|
| **Most-used tools listed** | `tool_list.top_tools` | The server's tool list is not shortened. |
| **Scripts** | `tool_list.code` | AI apps call tools one at a time. |

1. Start from a recipe in the section, or use its add control to create a blank rule.
2. Choose the **MCP server** under **Applies to**, along with any person, Smart Group, agent or route conditions.
3. Turn on the outcome you need, check **Reads as**, and **Save to draft**.
4. [Test and publish](../../console/govern/author-simulate-and-publish).

Each switch resolves independently. The highest numeric priority wins; On wins ties. An Off exception must outrank the rule that turns the switch on.

The server's Tool list switches show **Controlled by Policy Engine**. **Edit anyway** changes values saved for classic mode. **Pins always come from server settings**, so use the server's preview to pin important tools in either mode.

Use caller scope for a pilot group, or route scope to offer scripts through OneMCP only. Dynamic discovery and memory have separate sections on the same panel; see [OneMCP settings](../get-started/onemcp#onemcp-settings).

</TabItem>
</Tabs>

### Preview

The **Preview** card shows the short list this server sends with **List most-used tools** on, based on how your people used it recently. It works while the switch is off, so you can see the effect before you turn it on.

![Preview card showing 8.5k to 782 tokens per turn, a 91% cut, three tools covering 94% of calls, the listed tools with find_relevant_tools and call_tool, and 57 tools one search away](/img/mcp-gateway/ui/settings-tool-list-preview.png)

| Part | What it shows |
|------|---------------|
| Tokens per turn | The full list against the short list, with the cut (for example **8.5k → 782**, **-91%**). |
| Coverage | How many listed tools cover what share of your people's calls on this server. |
| **Listed in full** | The most-used and pinned tools, plus the tools the gateway adds (`find_relevant_tools`, `call_tool`, and `run_code` with Code mode). |
| **Tools one search away** | Every other tool, with its share of recent calls and a **Pin** button. |
| **Refresh usage** | Re-reads usage now instead of waiting for the hourly refresh. |

Once the server has served short lists, a **What the short list saved here** card adds the tokens not sent, the estimated cost avoided, the share of calls that went through search (under 10% means the listed tools fit the work; above it, consider pinning) and, with Code mode, the scripts run.

### Code mode (`run_code`)

`run_code` runs a short Python script in a sandbox. The script calls tools with `await call_tool(name, args)` and returns only what the AI needs, so large intermediate results never reach the model.

| Limit | Value |
|-------|-------|
| Run time | 60 seconds |
| Memory | 64 MiB |
| Tool calls per script | 50 |
| Files, network, imports | Not available |

Each tool call inside a script is a normal governed call: policies, approvals, guardrails and logs apply to it as if the AI had called the tool itself. If a script stops early, the result lists any tool calls that were still running and whether each one finished, so the AI does not repeat work by mistake.

## Find servers worth turning on

The MCP Gateway page shows a **Tool list savings** summary and, when there are opportunities, a **Review** action for servers that can send shorter lists.

![Savings opportunity card: 2 servers send AI apps tools nobody uses, 5.3M tokens a month, with a Review button](/img/mcp-gateway/ui/tool-list-savings-card.png)

Click **Review** to review servers that can send shorter tool lists. Each server shows its tokens per turn today and with the short list, the share of calls the listed tools cover, and the tokens a month you could stop sending. **Open settings** opens the server's Tool list section, and **Turn on** turns **List most-used tools** on for that server, keeping its pins and Code mode setting.

![Send AI apps shorter tool lists drawer listing example servers with tokens per turn before and after and Open settings buttons](/img/mcp-gateway/ui/tool-list-review.png)

A server is recommended when the short list saves at least 2,000 tokens per turn and the server had at least 50 calls in the last 30 days. When the Policy Engine is on, the drawer shows a note instead of **Turn on** (see [Going further with the Policy Engine](#going-further-with-the-policy-engine)).

## Where savings show

| Place | What you see |
|-------|--------------|
| Server card | A **Tool list** chip once a switch is on, for example **Most-used · -91%** or **Most-used · -91% + Code**. |
| Server settings > **Tool list** | The preview and, once used, **What the short list saved here**. |
| **Overall analytics > Servers & tools** | The **Tool list savings** panel in [MCP Gateway Insights](../monitor/analytics-and-insights). |

![Tool list savings panel with tokens not sent, estimated cost avoided, calls with a short list, savings with the recommended servers on, and a per-server table](/img/mcp-gateway/ui/insights-tool-list-savings.png)

| Column | Meaning |
|--------|---------|
| **Tool list** | The server's switches (**Off**, **Most-used tools**, **Most-used + Code**, **Code only**); **More to save** marks a recommended server. |
| **With a short list** | Share of the server's calls in the period made with a short list. |
| **Tokens per turn** | Full list against short list, with the cut. |
| **Est. saved (30 days)** | Tokens and cost not sent, or **/ month if turned on** for a server that is off. |
| **Through search** | Share of short-list calls that went through `find_relevant_tools` and `call_tool`. **pin more** means the listed tools miss common work; pin the tools found most often. |

### Measured and estimated

The savings figures are estimates built on real usage. They are not read from a model provider's bill.

| Part | Source |
|------|--------|
| Which calls were made with a short list, and through search or `run_code` | **Measured**: counted from the gateway's tool call logs. |
| Tool list size, full and short | **Measured** from the server's real tool descriptions, then converted to tokens at about four characters per token. |
| Tokens not sent | **Estimated**: the per-turn cut times the calls made with a short list, treating each tool call as one model turn. A chat that makes several calls in one turn, or many turns without calls, saves more or less than this. |
| Cost avoided | **Estimated** at a reference rate of $3 per million input tokens, not your provider's price or any caching it applies. |
| Recommended and "if turned on" figures | **Projected** from the last 30 days of calls made with the full list. |

Tool list savings show only in the places above. The **Tokens saved** figures on the MCP Gateway page and in Costs & Savings count [token saving](./token-saving) strategies.

## Related

- [OneMCP](../get-started/onemcp) - one endpoint with dynamic tool calling and smart tools.
- [Token saving](./token-saving) - shorten tool results; tool lists shorten what is sent before any call.
- [Tool visibility](./tool-visibility) - hide tools from AI apps entirely.
- [Group and user rules](./group-and-user-rules) - per-group overrides for server settings.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
