---
sidebar_position: 4
sidebar_custom_props:
  icon: Plug
---

# Zoho

Zoho Cliq exposes its MCP server through the Zoho MCP console. Unlike Slack and GitHub, you do **not** create an OAuth app or provide a Client ID and Client Secret for Zoho.

## How Zoho Differs

- **No custom OAuth credentials.** Zoho handles authorization on its side, so there is no Client ID or Client Secret to create or paste into QuilrAI.
- **No single shared URL.** Zoho does not publish one fixed MCP endpoint. You generate your own MCP server URL in the Zoho MCP console, so the URL has to be added to QuilrAI manually.

## Connect Zoho

1. Configure a Zoho Cliq MCP server in the Zoho MCP console ([mcp.zoho.com](https://mcp.zoho.com)). Follow Zoho's guide: [Configure Zoho Cliq MCP](https://www.zoho.com/cliq/help/platform/configure-zoho-cliq-mcp.html).
2. Make sure you have valid, authenticated credentials for every Zoho (and third-party) service the MCP server uses, and a plan that allows creating integrations.
3. Copy the generated MCP server URL from the Zoho MCP console.
4. In QuilrAI, **Add MCP** and paste that URL manually, then authorize when prompted.

## References

- [Zoho: Configure Zoho Cliq MCP](https://www.zoho.com/cliq/help/platform/configure-zoho-cliq-mcp.html)
