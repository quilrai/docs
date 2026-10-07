---
sidebar_position: 1
sidebar_label: "Introduction"
sidebar_custom_props:
  icon: BookOpen
description: "The MCP Gateway page in the console - summary tiles, banners, server cards, the workspace tabs and the settings sections."
---

# Introduction to the MCP Gateway

The MCP Gateway sits between your AI apps and the MCP servers they call. Users connect their AI app to a Quilr gateway URL instead of the server itself, and every tool call is checked against your tool rules and guardrails, then logged with the user, the agent and the result.

<StepFlow steps={[
  {
    label: "Your AI app",
    items: [
      "Claude, ChatGPT, Cursor, VS Code",
      "Connects to a Quilr gateway URL",
    ],
  },
  {
    label: "QuilrAI MCP Gateway",
    items: [
      "Tool rules and guardrails",
      "Access by agent, group and user",
      "Logs, analytics, health",
    ],
  },
  {
    label: "MCP servers",
    items: [
      "Remote servers from the MCP Library",
      "Your own servers and APIs",
      "Local packages on the user's computer",
    ],
  },
]} />

## Key concepts

| Term | What it is |
|------|------------|
| **MCP server** | The unit you configure. It holds its connection, sign-in, tools, guardrails and rules. Add one with **Add MCP server** or from the **Library**. |
| **Quilr gateway URL** | The address agents call for one server, for example `https://mcpgateway.quilr.ai/github/mcp`. The gateway calls the server's upstream URL. |
| **OneMCP** | One URL that serves every MCP a user may use. See [OneMCP](./onemcp). |
| **Allowed agent** | An AI client, matched by its user-agent keyword. You choose which servers each agent may reach. See [Agents Configuration](../servers-and-connections/allowed-agents). |
| **User dashboard** | Where users sign in at `mcpgateway.quilr.ai`, connect their accounts and copy their URLs. |

New servers start with their tools turned off, so nothing is reachable until you enable it.

## The MCP Gateway page

Go to **Settings > AI Gateway > MCP Gateway**.

![MCP Gateway page with the Overall analytics, OneMCP endpoint, Library, Allowed Agents and Add MCP server buttons above four summary tiles and the OAuth and quick-fix banners](/img/mcp-gateway/ui/mcp-gateway-page.png)

| Button | What it opens |
|--------|---------------|
| **Overall analytics** | The MCP Gateway workspace for all servers, on the Analytics tab |
| **OneMCP endpoint** | OneMCP settings. See [OneMCP](./onemcp#onemcp-settings). |
| **Library** | The [MCP Library](../servers-and-connections/mcp-library). A count shows pending install requests from users. |
| **Allowed Agents** | Which AI clients may connect, and which servers each one sees |
| **Add MCP server** | The Add MCP drawer. See [Adding MCP Servers](../servers-and-connections/adding-mcp-servers). |
| **...** | **Connections** (who has connected to which server) and **ZIA integration** (see [Web Search Policy](../protect/web-search-security)) |

| Summary tile | Shows |
|--------------|-------|
| **Tool calls** | Calls in the period, the share that came through OneMCP, people calling, tools called, success rate |
| **Estate** | Servers that are Serving, Awaiting connection or have No tools, and how many are enabled or disabled |
| **Tools reachable** | Tools agents can call, with Scoped rules, OAuth servers and the Library queue |
| **Stopped by guardrails** | Calls the gateway refused, Guardrail flags, Failed calls, p95 latency |

Click a row on a tile to filter the server list or open the matching view.

| Banner | Action |
|--------|--------|
| **N OAuth servers need an administrator connection before their tools can be discovered.** | **Review all** filters the list to those servers. With one server, the button reads **Connect** and the server name. |
| **N quick fixes could prevent failed tool calls** | **Review fixes** opens the quick fixes drawer. See [Input Aliases](../protect/input-aliases). |

Below the banners, **Elsewhere** links to **Inventory & analytics**, the **User dashboard** and this **Documentation**. The server list has **All**, **Local**, **Remote** and **API** tabs, **Search servers** and a **Filter** for state, auth, source and runtime.

## The server card

Each configured server has a card.

![MCP server card for GitHub with its gateway and upstream URLs, status, transport and auth, feature chips, and the Inspect and Configure button rows](/img/mcp-gateway/ui/server-card.png)

| Area | What it shows |
|------|---------------|
| Header | Name, **System**, **Library** or **Local package** tag, slug and description |
| Endpoints | **Quilr gateway** URL (copy it for clients) and the **Upstream** URL, with upstream p95 and failures |
| Status | **Serving**, **Awaiting connection**, **No tools found** or **Disabled**, plus transport and auth |
| Chips | **Tools**, **Guardrails**, **Scoped rules**, **Token saving**. Each opens that section. |
| Actions | **Show tools**, **Uninstall**, and the enable toggle |
| Traffic | Calls over time, users, tokens saved, top tools |
| **Inspect** | **Logs** (the server's activity), **Open in Inventory** |
| **Configure** | **General**, **API** (API servers only), **Guardrails**, **Token Saving**, **Tools**, **Group & User Rules** |

A server waiting for an administrator OAuth sign-in shows **Connect OAuth** on its card.

## The workspace

**Overall analytics** and every Inspect and Configure button open the **MCP Gateway workspace**. Select one or more servers with the server picker, and change the period at the top.

| Tab | What it shows |
|-----|---------------|
| **Analytics** | Tool calls, Blocked, Guardrail flags, Via OneMCP, Tokens saved, Success, P95 latency, Users, Servers; calls over time and usage by server |
| **Activity** | **Tool calls** (one row per call), **Interactions** (calls grouped into conversations), **Findings** (guardrail detections) |
| **Connections** | Which users have connected to which servers, and their tool calls |
| **Health** | Gateway verdict, Rejected requests, Access denied, Auth challenges, OAuth refreshes, Upstream server errors, and rejection reasons. Covers the whole gateway. |
| **Settings** | The server configuration. Available for one server at a time. |

![Analytics tab of the MCP Gateway workspace with tool call, blocked, guardrail, OneMCP and tokens-saved tiles above calls over time](/img/mcp-gateway/ui/workspace-analytics.png)

![Activity tab listing each tool call with its server, tool, user, agent and outcome](/img/mcp-gateway/ui/workspace-activity.png)

![Health tab with the gateway verdict, rejected request and upstream error tiles, and rejection reasons](/img/mcp-gateway/ui/workspace-health.png)

### Settings sections

Sections vary by server. Edits are drafts until you click **Save settings**.

| Section | What you set |
|---------|--------------|
| **General** | Name, upstream sign-in, custom headers, [Access Control](../protect/server-access), [Claims forwarding](../protect/claims-forwarding), [Web Search Policy](../protect/web-search-security) (QuilrAI Web Search only), Uninstall |
| **API** | Base URL, spec and access rules of an [API MCP](../servers-and-connections/api-to-mcp) |
| **Permissions** | [OAuth Permissions](../servers-and-connections/oauth-permissions): the scopes the connection requests (OAuth servers with selectable scopes) |
| **Tools** | [Tool visibility](../protect/tool-visibility), [Human approval](../protect/human-approval), [Tool Change Watch](../protect/tool-change-watch) |
| **Guardrails** | [Security Guardrails](../protect/security-guardrails) on tool arguments and tool results |
| **Token saving** | [Token Saving](../protect/token-saving) strategies |
| **Input aliases** | [Input Aliases](../protect/input-aliases): translate mismatched inputs from AI clients |
| **Group & User Rules** | [Group & User Rules](../protect/group-and-user-rules): overrides for a smart group or a single user |
| **API tokens** | [API Tokens](../servers-and-connections/api-tokens) for direct connections (not on OAuth servers) |

:::note Policy Engine
When the [Policy Engine](../../console/govern/policy-engine) is on, Settings shows **Policy Engine active** and marks Tools, Guardrails, Token saving and Group & User Rules with its icon. Those sections follow published policies instead of these settings. General and API tokens are still managed here.
:::

![Tools section showing the Controlled by Policy Engine banner with View policies and Edit anyway, and the Policy Engine active badge with its revision](/img/mcp-gateway/ui/settings-policy-engine-banner.png)

## Next steps

- [Quick Start](./quick-start): add a server and make a first tool call.
- [Adding MCP Servers](../servers-and-connections/adding-mcp-servers): remote servers, sign-in modes and the MCP Library.
- [API to MCP](../servers-and-connections/api-to-mcp): turn a REST API into tools.
- [OneMCP](./onemcp): one URL for every MCP a user may use.
- [Integration Guide](./integration-guide): URLs, tokens and client examples.
