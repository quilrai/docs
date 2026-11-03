---
sidebar_position: 2
sidebar_label: "Quick start"
sidebar_custom_props:
  icon: Rocket
description: "Set up the MCP Gateway in 4 steps - add an MCP, configure tools and guardrails, connect an agent, and monitor."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quick Start

Updated on 3 November 2026.

Add an MCP server, choose what agents may call, connect an AI app and review the first tool calls.

<StepFlow steps={[
  {
    label: "Add an MCP",
    items: [
      "Library: Install or Set up",
      "Or Add MCP server",
    ],
  },
  {
    label: "Configure",
    items: [
      "Policy Engine or classic settings",
      "Tools, guardrails and access",
    ],
  },
  {
    label: "Connect your AI app",
    items: [
      "OneMCP URL",
      "Or the server's Quilr gateway URL",
    ],
  },
  {
    label: "Monitor",
    items: [
      "Insights and individual tool calls",
    ],
  },
]} />

## Video walkthrough

<VideoEmbed id="mcp-admin-overview" />

The rest of the series: the [user dashboard](./onemcp) for the people who will use the MCPs, and local setup for [administrators](../local-mcp/admin-setup) and for [users](../local-mcp/connect-your-ai-app).

## 1. Add an MCP

Go to **Settings > AI Gateway > MCP Gateway**.

![MCP Gateway page with the Library, Tool updates and Add MCP server actions in the header](/img/gateway-updates-2026-11/mcp-gateway-servers.jpg)

| To add | Do this |
|--------|---------|
| A ready-made integration | Click **Library**, search, then click **Install** (or **Set up** when it asks for a key or OAuth app). See [MCP Library](../servers-and-connections/mcp-library). |
| Your own remote server | Click **Add MCP server**, choose **Remote server**, enter its **Transport URL** and click **Probe and continue**. See [Adding MCP Servers](../servers-and-connections/adding-mcp-servers). |
| A REST API | Click **Add MCP server**, then choose **API**. See [API to MCP](../servers-and-connections/api-to-mcp). |
| A package that runs on the user's computer | Click **Add MCP server**, then choose **Local package (CLI MCP)**. See [Local MCP](../local-mcp/admin-setup). |

If the server uses OAuth, a banner asks for an administrator connection. Click **Review all** (or **Connect OAuth** on the card) and sign in once so the gateway can discover its tools.

## 2. Configure

After you add a server, review who can connect and which tools they may call before connecting users. Choose the mode that governs your MCP Gateway.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

With the MCP Gateway Policy Engine off, configure the server directly. New servers' tools stay off until you enable them.

| Section | Set |
|---------|-----|
| **Tools** | Turn on the tools agents may call. See [Tool visibility](../protect/tool-visibility). |
| **Guardrails** | Block or redact sensitive data in tool arguments and results. See [Security Guardrails](../protect/security-guardrails). |
| **General > Access control** | Limit the server to agents, smart groups or users. See [Access Control](../protect/server-access). |
| **Group & User Rules** | Set different tools or guardrails for one group or user. See [Group & User Rules](../protect/group-and-user-rules). |
| **Token saving** | Compress tool results. See [Token Saving](../protect/token-saving). |

Click **Save settings** before you close the drawer. For every section, see the [Overview](./overview#settings-sections).

</TabItem>
<TabItem value="policy" label="Policy Engine">

With the engine on, open **Govern > Policy Engine > MCP Gateway** and review the matching rules:

1. **MCP Server Access** decides who may connect.
2. **Invocation & Discovery** decides which tools are listed, may run and may return results. Select a recipe such as **Allow selected tools** and choose the server and tools.
3. **Data & Adversarial Risks** selects checks and actions for tool arguments and results. Use **Human Confirmation** where a caller must approve a tool call.
4. Save changes to the shared draft, use **Test**, then **Review & publish**.

Check existing matching rules before adding new ones. Published policies govern the marked settings sections; editing their classic values does not change live policy behavior. See [Author, simulate and publish](../../console/govern/author-simulate-and-publish) and [Tool visibility](../protect/tool-visibility).

</TabItem>
</Tabs>

## 3. Connect your AI app

Users sign in at `mcpgateway.quilr.ai`, connect their accounts and copy a URL from there.

| URL | Use it for |
|-----|-----------|
| OneMCP, `https://mcpgateway.quilr.ai/quilrone/mcp` | Every MCP the user may use, through one connection. See [OneMCP](./onemcp). |
| Quilr gateway URL from the server card, `https://mcpgateway.quilr.ai/<slug>/mcp` | One server only |

The base domain can differ by environment. Copy the exact URL from the server card or the user dashboard.

OAuth-capable clients such as Claude and ChatGPT sign in when they first connect. For a client that sends a token instead, create one in the server's **Settings > API tokens** (see [API Tokens](../servers-and-connections/api-tokens)) and send it with the user's email:

```json
{
  "mcpServers": {
    "quilr-mcp": {
      "url": "https://mcpgateway.quilr.ai/<your-mcp-slug>/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>",
        "mcpuser": "user@company.com"
      }
    }
  }
}
```

See the [Integration Guide](./integration-guide) for more client examples.

## 4. Monitor

Select **Overall analytics** to open **MCP Gateway Insights**.

![MCP Gateway Insights Overview showing the reporting period, server and AI-client selectors, and gateway activity](/img/gateway-updates-2026-11/mcp-insights-overview.jpg)

| Tab | Check |
|-----|-------|
| **Overview** | Calls, people, failures, detections and attention items |
| **Usage** | Adoption and new or returning users |
| **Data & security** | What AI touched or changed and flagged content |
| **Reliability** | Failure causes, affected tools and input problems |
| **Servers & tools** | Server health, tool use and savings |

For an individual call, return to a server card and select **Inspect > Logs**. The operational **Activity > Tool calls** view shows its user, agent and outcome. Select a call for its details. See [Analytics and insights](../monitor/analytics-and-insights) for the full tour.

To send logs to your own data platform, use the [Log Export API](../api-reference/log-export-api).

## Related

- [Overview](./overview) - the MCP Gateway page, server card and workspace.
- [Analytics and insights](../monitor/analytics-and-insights) - adoption, protection, reliability and tool savings.
- [Adding MCP Servers](../servers-and-connections/adding-mcp-servers) - every way to add a server.
- [Agent Custom Instructions](./agent-instructions) - configure clients to use the OneMCP discovery flow.
