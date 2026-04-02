---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get up and running with MCP Gateway in 4 steps.

<StepFlow steps={[
  {
    label: "Add MCP",
    items: [
      "Source: MCP Library",
      "Server: GitHub MCP",
      "Transport: SSE",
    ],
  },
  {
    label: "Configure",
    items: [
      "Tools: 12 enabled",
      "Guardrails: PII detection ON",
      "Access: Cursor, Claude",
    ],
  },
  {
    label: "Connect Agent",
    items: [
      "url: mcp.quilr.ai/github/mcp",
      "auth: Bearer <token>",
      "mcpuser: user@company.com",
    ],
  },
  {
    label: "Monitor",
    items: [
      "Tool calls: 3,421",
      "Agents: 4 connected",
      "Blocked: 12 requests",
    ],
  },
]} />

## 1. Add an MCP Server

Go to the **MCP Gateway** tab and install from the **MCP Library** for one-click pre-built integrations, or click **Add MCP** to register any server by its transport URL (ending in `/sse` or `/mcp`).

OAuth MCPs will prompt you to authorize; token-based MCPs receive API tokens automatically.

## 2. Configure Your MCP

Open **Settings** on any MCP card to fine-tune its behavior. Sensible defaults are applied automatically.

| Setting | Description |
|---------|-------------|
| **[Tools Management](./features/tools-management)** | Enable/disable tools by category (read-only, write, destructive) |
| **[Security Guardrails](./features/security-guardrails)** | PII/PHI/PCI detection, adversarial blocking |
| **[Access Control](./features/access-control)** | Restrict which AI agents can use this MCP |
| **[Web Search Policy](./features/web-search-policy)** | Domain exclusions via firewall integrations |
| **[OAuth Connect](./features/oauth-connect)** | One-click OAuth authorization flow |
| **[Agents Configuration](./features/agents-configuration)** | Define and manage AI agent profiles |

## 3. Connect Your Agent

Point your AI agent or client to the **MCP endpoint URL** shown on the card. Use **Authorization: Bearer &lt;token&gt;** and **mcpuser** headers for token-based MCPs. OAuth MCPs use the Connect flow instead.

```json
{
  "mcpServers": {
    "quilr-mcp": {
      "url": "https://mcp.quilr.ai/<your-mcp-id>/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>",
        "mcpuser": "user@company.com"
      }
    }
  }
}
```

See the [Integration Guide](./integration-guide) for more client examples.

## 4. Monitor Tool Calls

Every tool call through the gateway is logged with **tool name, parameters, guardrail actions, and user identity**. Check your **Logs** tab to verify requests are flowing through.
