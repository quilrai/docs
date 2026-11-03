---
sidebar_position: 1
sidebar_label: "Analytics and insights"
sidebar_custom_props:
  icon: BarChart2
description: "Use MCP Gateway Insights to review adoption, data access, security, failures, servers, tools and token savings."
console_path: [/settings/mcp-gateway/insights, /settings/mcp-gateway/insights/overview, /settings/mcp-gateway/insights/usage, /settings/mcp-gateway/insights/security, /settings/mcp-gateway/insights/reliability, /settings/mcp-gateway/insights/servers]
aliases: [MCP analytics, MCP insights, overall analytics, tool usage, MCP reliability, tool list savings]
---

# Analytics and insights

Updated on 3 November 2026.

**MCP Gateway Insights** shows how AI clients use your servers, what they touch, and why calls fail. Open **Settings > AI Gateway > MCP Gateway**, then select **Overall analytics**.

Choose **All servers** or narrow the server scope, then select **All AI clients** or a particular client. Period choices are **3 days**, **7 days**, **30 days**, and **90 days**, compared with the previous period of the same length. Panels with their own fixed window state it next to the figures.

## Overview

Start with tool calls, active people, failures and detections, then follow an attention item or chart into its details.

![MCP Gateway Insights Overview with server and AI-client scope, headline metrics and activity panels](/img/gateway-updates-2026-11/mcp-insights-overview.jpg)

**Topics & what AI touched** summarizes topics classified from tool-call requests and responses, along with the coverage and the date classification began. A topic activity window is one person's activity in one six-hour UTC block. Classification coverage can differ from the full traffic count.

Use **Needs attention**, calls over time, top servers and active people to choose where to investigate. A monitored detection means the content was allowed through; it should not be counted as a prevented call.

## Usage

Use this tab to understand adoption and repeat use across people, servers and AI clients.

![Usage showing active people, new and returning usage, repeat use and servers per person](/img/gateway-updates-2026-11/mcp-insights-usage.jpg)

- **New vs returning** counts a person as new when their first-ever call falls in the selected period.
- **Came back** counts people active on two or more days in the period.
- **Servers per person**, weekly activity and adoption by server show how broadly people use the gateway.
- **Client × server** connects the AI clients people use with the servers they call.

Search the **People** table or filter it to **New**, **Came back**, **Struggling**, or **DLP flags**. Select a person or server for supporting details.

## Data & security

Review the resources tools touch, calls that change data, and flagged content moving in either direction.

![Data and security showing operation classifications, named resources, flagged content and an access map](/img/gateway-updates-2026-11/mcp-insights-data-security.jpg)

The page distinguishes **Read**, **Write**, **Execute**, and **Unclassified** calls. The classification considers the tool and its operation arguments; the resource view shows calls that name a repository, project, site, channel or similar resource.

Use the access map, **Changes made by AI**, and tools that changed data to trace activity. In the finding views, switch between **Responses → AI** and **Requests → tools**. Review categories, tools returning flagged content, prompt-injection sources and affected people, then inspect the calls behind them. See [Security guardrails](../protect/security-guardrails) to change protection.

## Reliability

Use this tab to understand failure causes and who can act on them.

![Reliability showing success rate, failure ownership, bad inputs and affected people](/img/gateway-updates-2026-11/mcp-insights-reliability.jpg)

Failures are grouped by causes such as **Agent input**, **Upstream service**, and **Other**. Select a cause to filter failure patterns, then review affected tools and people. **Struggling** identifies people whose failure rate is at least one in five across 20 or more calls.

**Fixes you can make at the gateway** can surface input-alias candidates. Review the evidence before accepting a mapping: similar argument names or success with an undeclared argument do not prove what the upstream tool expected. Reviewing analytics does not apply a fix. See [Input aliases](../protect/input-aliases) for that workflow.

## Servers & tools

Find unhealthy servers, unused tool definitions, and opportunities to shorten what AI clients receive.

![Servers and tools with health groups, tools used, definition size, token savings and server filters](/img/gateway-updates-2026-11/mcp-insights-servers-tools.jpg)

Switch between **Servers** and **Tools**. Filter by **Healthy**, **Has issues**, **Failing often**, **Low traffic**, or **Idle**, and by whether calls came through OneMCP or a direct connection. Server health comes from calls in scope; **Idle** means no calls in 30 days.

**Tool list savings** shows estimated tokens kept out of AI turns by shorter tool lists, plus potential savings on other servers. Its figures use the stated 30-day window. **Tokens returned to AI** highlights large tool results; select a tool to inspect **Overview**, **Output size**, and **Data protection**.

Keep the two kinds of savings separate:

| Figure | What it measures |
|---|---|
| **Tokens saved** from response transforms | Smaller tool results after token-saving strategies run. |
| **Tool list savings** | Estimated tool-description tokens not sent because a short list was used. |

See [Tool lists](../protect/tool-lists) and [Token saving](../protect/token-saving) for configuration and estimation details.

## Open individual calls and settings

**Overall analytics** opens Insights. For one server's call log, return to its card and select **Inspect > Logs**. The operational **Activity** view contains **Tool calls**, **Interactions**, and **Findings**. Select a call for its details.

Use the server card's **Configure** actions to change settings. The Insights tabs are for investigation; viewing a recommendation does not approve a tool, apply an input alias, or change policy.

## Related

- [MCP Gateway overview](../get-started/overview) - management actions and operational settings.
- [Tool change watch](../protect/tool-change-watch) - review tools added or changed upstream.
- [Human approval](../protect/human-approval) - review calls that require confirmation.
- [Log Export API](../api-reference/log-export-api) - send records to your own data platform.
