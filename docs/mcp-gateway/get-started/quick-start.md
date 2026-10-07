---
sidebar_position: 2
sidebar_label: "Quick start"
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

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
      "Tools: enable what agents may call",
      "Guardrails, rules, access",
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
      "Analytics, Activity, Health",
    ],
  },
]} />

## Video walkthrough

<VideoEmbed
  src="https://www.youtube.com/embed/QxDvZjOwF9o"
  poster="/img/mcp-gateway/video/admin-overview.jpg"
  title="MCP Gateway: administrator overview"
  duration="4:59"
  description="Registering servers, governing which tools agents can call, reading the audit trail, and handing the gateway to your users."
/>

The rest of the series: the [user dashboard](./onemcp) for the people who will use the MCPs, and local setup for [administrators](../local-mcp/admin-setup) and for [users](../local-mcp/connect-your-ai-app).

## 1. Add an MCP

Go to **Settings > AI Gateway > MCP Gateway**.

![MCP Gateway page with the Library and Add MCP server buttons in the header](/img/mcp-gateway/ui/mcp-gateway-page.png)

| To add | Do this |
|--------|---------|
| A ready-made integration | Click **Library**, search, then click **Install** (or **Set up** when it asks for a key or OAuth app). See [MCP Library](../servers-and-connections/mcp-library). |
| Your own remote server | Click **Add MCP server**, choose **Remote server**, enter its **Transport URL** and click **Probe and continue**. See [Adding MCP Servers](../servers-and-connections/adding-mcp-servers). |
| A REST API | Click **Add MCP server**, then choose **API**. See [API to MCP](../servers-and-connections/api-to-mcp). |
| A package that runs on the user's computer | Click **Add MCP server**, then choose **Local package (CLI MCP)**. See [Local MCP](../local-mcp/admin-setup). |

If the server uses OAuth, a banner asks for an administrator connection. Click **Review all** (or **Connect OAuth** on the card) and sign in once so the gateway can discover its tools.

## 2. Configure

After you add a server, its settings open. Its tools stay off until you enable them.

| Section | Set |
|---------|-----|
| **Tools** | Turn on the tools agents may call. See [Tools Management](../protect/tool-visibility). |
| **Guardrails** | Block or redact sensitive data in tool arguments and results. See [Security Guardrails](../protect/security-guardrails). |
| **General > Access control** | Limit the server to agents, smart groups or users. See [Access Control](../protect/server-access). |
| **Group & User Rules** | Set different tools or guardrails for one group or user. See [Group & User Rules](../protect/group-and-user-rules). |
| **Token saving** | Compress tool results. See [Token Saving](../protect/token-saving). |

Click **Save settings** before you close the drawer. For every section, see the [Overview](./overview#settings-sections).

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

Click **Overall analytics**, or **Logs** on a server card.

![Analytics tab of the MCP Gateway workspace with tool call, blocked and guardrail tiles above calls over time](/img/mcp-gateway/ui/workspace-analytics.png)

| Tab | Check |
|-----|-------|
| **Analytics** | Tool calls, blocked calls, guardrail flags and tokens saved |
| **Activity** | Each tool call with its user, agent and guardrail outcome |
| **Health** | Rejected requests, access denials and upstream server errors |

To send logs to your own data platform, use the [Log Export API](../api-reference/log-export-api).

## Related

- [Overview](./overview) - the MCP Gateway page, server card and workspace.
- [Adding MCP Servers](../servers-and-connections/adding-mcp-servers) - every way to add a server.
- [Agent Custom Instructions](./agent-instructions) - configure clients to use the OneMCP discovery flow.
