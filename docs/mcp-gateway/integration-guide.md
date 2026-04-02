---
sidebar_position: 3
sidebar_custom_props:
  icon: Plug
---

# Integration Guide

MCP endpoints, authentication methods, and connection examples for integrating AI agents with MCP Gateway.

## MCP Endpoint URL

Each MCP gets a unique endpoint URL displayed on its card. Point your AI agent to this URL to connect.

```
https://mcp.quilr.ai/mcp/<your-mcp-slug>/
```

## Authentication Methods

MCP Gateway supports three authentication methods depending on the MCP server's requirements.

### Token-Based Authentication

The most common method. Send a Bearer token with a user identifier header for per-user tracking.

```
Authorization: Bearer <token>
mcpuser: user@company.com
```

- Create API tokens in **Settings → API Tokens**
- Each token is scoped to a specific agent
- The `mcpuser` header identifies the end user for per-user tracking

### OAuth - Dynamic Client Registration (DCR)

The gateway automatically registers as an OAuth client with the MCP server. No Client ID or Secret needed - just click **Connect** and authorize.

### OAuth - Manual

For MCP servers without DCR support. Provide your **Client ID** and **Client Secret** during MCP setup. The gateway uses these credentials for the authorization flow.

## Token-Based Connection Example

```bash
# Connect to MCP endpoint with token auth
curl -X POST https://mcp.quilr.ai/mcp/your-mcp-slug/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-token>" \
  -H "mcpuser: user@company.com" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

## Agent Configuration

- Each AI agent (OpenAI, Claude, Cursor, etc.) connects to the MCP endpoint URL shown on the MCP card
- The gateway identifies agents by their **User-Agent** header keyword
- Configure which MCPs each agent can access via [Agents Configuration](./features/agents-configuration) or per-MCP [Access Control](./features/access-control)
