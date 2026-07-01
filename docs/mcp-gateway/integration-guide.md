---
sidebar_position: 3
sidebar_custom_props:
  icon: Plug
---

# Integration Guide

MCP endpoints, authentication methods, and connection examples for integrating AI agents with MCP Gateway.

## MCP Endpoint URL

Each MCP gets a unique endpoint URL displayed on its card in the self-service user dashboard for MCPs. Point your AI agent to this URL to connect. The base domain is typically `https://mcpgateway.quilr.ai` or `https://mcpgateway.quilrai.com`, but it can vary by environment.

```
https://mcpgateway.quilr.ai/<your-mcp-slug>/mcp
```

## Authentication Methods

MCP Gateway separates the credential your AI client uses to reach the gateway from the credential the gateway uses to reach the upstream MCP server.

### Client to Gateway

| Method | Use When | Client Sends |
|--------|----------|--------------|
| **API token** | Programmatic access to non-OAuth or static-key MCPs. | `Authorization: Bearer <api-token>` plus `mcpuser: user@company.com`. |
| **Gateway OAuth proxy token** | The AI client supports OAuth with the gateway. | A gateway-issued Bearer token from the MCP OAuth authorize/token flow. |
| **OAuth passthrough** | The upstream MCP expects the client to perform OAuth directly with the upstream provider. | The upstream provider's Bearer token. |
| **OneMCP OAuth proxy token** | The client connects to the dashboard-provided OneMCP URL, such as `https://mcpgateway.quilr.ai/quilrone/mcp`. | A gateway-issued OneMCP Bearer token. |

#### API Token Authentication

Send a Bearer token with a user identifier header for per-user tracking.

```
Authorization: Bearer <token>
mcpuser: user@company.com
```

- Create API tokens in **Settings → API Tokens**
- Each token is scoped to a specific agent
- The `mcpuser` header identifies the end user for per-user tracking
- The `mcpuser` email must belong to an allowed company domain

#### Gateway OAuth Proxy Tokens

OAuth-capable MCP clients can authenticate to the gateway through the gateway's OAuth endpoints. After the user signs in, the token endpoint returns a stable proxy token. The proxy token is scoped to the MCP backend, or to OneMCP for the `/quilrone/mcp` endpoint.

#### OAuth Passthrough

In OAuth passthrough mode, the gateway advertises or relays the upstream OAuth metadata and the AI client obtains an upstream access token itself. The gateway accepts that upstream Bearer token on the direct per-MCP endpoint, forwards it to the upstream MCP server, and uses token claims such as `email`, `preferred_username`, `upn`, or `sub` for logging when available.

OAuth passthrough MCPs are not exposed through OneMCP and do not use gateway token storage, refresh, dashboard Connect, or proxy tokens.

### Gateway to Upstream MCP

| Upstream Auth Mode | Description |
|--------------------|-------------|
| **No auth** | The upstream MCP does not require authentication. The gateway still authenticates and authorizes clients before forwarding calls. |
| **OAuth - Dynamic Client Registration (DCR)** | The gateway registers as an OAuth client with the MCP server and manages per-user upstream tokens. |
| **OAuth - Manual credentials** | An admin provides an OAuth Client ID and Client Secret during setup. Use this for providers that do not support DCR. |
| **OAuth passthrough** | The client owns upstream OAuth and sends the upstream Bearer token through the gateway. |
| **Static upstream API key** | An admin stores a fixed upstream credential. The gateway injects it as a Bearer token, custom header, or query parameter when calling the upstream MCP. |

For manual OAuth setup steps, see [MCP Provider Setup](./mcp-provider-setup/overview). For OneMCP unified access, memory tools, and inline OAuth recovery, see [OneMCP](./onemcp).

## Token-Based Connection Example

```bash
# Connect to MCP endpoint with token auth
curl -X POST https://mcpgateway.quilr.ai/your-mcp-slug/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-token>" \
  -H "mcpuser: user@company.com" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

## OneMCP Connection Example

```json
{
  "mcpServers": {
    "quilr-onemcp": {
      "url": "https://mcpgateway.quilr.ai/quilrone/mcp",
      "headers": {
        "Authorization": "Bearer <onemcp-token>"
      }
    }
  }
}
```

With OneMCP, call `list_tool_groups` first, then `find_relevant_tools`, then `call_tool`. If a backend requires user OAuth, the response includes a short-lived connect URL that the user can open and retry.

## Agent Configuration

- Each AI agent (OpenAI, Claude, Cursor, etc.) connects to the MCP endpoint URL shown on the MCP card
- The gateway identifies agents by their **User-Agent** header keyword
- Configure which MCPs each agent can access via [Agents Configuration](./features/agents-configuration) or per-MCP [Access Control](./features/access-control)
