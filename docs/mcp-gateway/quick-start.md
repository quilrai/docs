---
sidebar_position: 1
---

# Quick Start

Get up and running with MCP Gateway in 3 steps.

## 1. Add an MCP Server

- **Install from the MCP Library** — browse the catalog and one-click install pre-built integrations
- Or click **"Add MCP"** to register a custom server by providing its transport URL (ending in `/sse` or `/mcp`)
- OAuth MCPs will prompt you to authorize; token-based MCPs get API tokens

## 2. Configure Settings

Open **Settings** on the MCP card and configure what you need:

| Setting | Description |
|---------|-------------|
| **Tools** | Enable/disable individual tools by category (read-only, write, destructive) |
| **Guardrails** | Data risk detection (PII/PHI/PCI), adversarial risk blocking on tool calls |
| **Access Control** | Restrict which AI agents can use this MCP |
| **Web Search Policy** | Domain exclusions via Zscaler/Palo Alto/Fortinet/Cisco (Web Search MCP only) |

## 3. Connect Your Agent

- Point your AI agent/client to the **MCP endpoint URL** shown on the card
- Use `Authorization: Bearer <token>` + `mcpuser: user@email.com` headers for token-based MCPs
- For OAuth MCPs, authorization happens via the Connect flow

---

**Next step:** See the [Integration Guide](./integration-guide) for endpoint details, authentication methods, and connection examples.

