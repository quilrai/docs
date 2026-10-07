---
sidebar_position: 4
sidebar_label: "Integration guide"
sidebar_custom_props:
  icon: Plug
---

# Integration Guide

MCP endpoints, authentication methods, and connection examples for integrating AI agents with MCP Gateway.

## MCP Endpoint URL

Each MCP gets a unique endpoint URL, shown as **Quilr gateway** on its server card in **Settings > AI Gateway > MCP Gateway** and on the user dashboard at `mcpgateway.quilr.ai`. Point your AI agent to this URL to connect. The base domain is typically `https://mcpgateway.quilr.ai` or `https://mcpgateway.quilrai.com`, but it can vary by environment.

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

- Create API tokens in the server's **Settings > API tokens** (not shown on OAuth servers). See [API Tokens](../servers-and-connections/api-tokens).
- Each token is scoped to a specific agent
- The `mcpuser` header identifies the end user for per-user tracking
- The `mcpuser` email must belong to an allowed company domain

#### Gateway OAuth Proxy Tokens

OAuth-capable MCP clients can authenticate to the gateway through the gateway's OAuth endpoints. After the user signs in, the token endpoint returns a stable proxy token. The proxy token is scoped to the MCP server, or to OneMCP for the `/quilrone/mcp` endpoint.

#### OAuth Passthrough

In OAuth passthrough mode, the gateway advertises or relays the upstream OAuth metadata and the AI client obtains an upstream access token itself. The gateway accepts that upstream Bearer token on the direct per-MCP endpoint, forwards it to the upstream MCP server, and uses token claims such as `email`, `preferred_username`, `upn`, or `sub` for logging when available.

OAuth passthrough MCPs are not exposed through OneMCP and do not use gateway token storage, refresh, user dashboard connections, or proxy tokens.

### Gateway to Upstream MCP

| Upstream Auth Mode | Description |
|--------------------|-------------|
| **No auth** | The upstream MCP does not require authentication. The gateway still authenticates and authorizes clients before forwarding calls. |
| **OAuth - Dynamic Client Registration (DCR)** | The gateway registers as an OAuth client with the MCP server and manages per-user upstream tokens. |
| **OAuth - Manual credentials** | An admin enters an **OAuth client ID** and **OAuth client secret** in the **Connect with OAuth** step. Use this for providers that do not support DCR. |
| **OAuth passthrough** | The client manages upstream OAuth and sends the upstream Bearer token through the gateway. |
| **Upstream API key** | An admin stores an upstream key, shared by the whole tenant or brought by each user. The gateway sends it as a bearer header, custom header, or query parameter when calling the upstream MCP. Change it in **Settings > General > Upstream authentication**. |

To choose a mode when you add a server, see [Adding MCP Servers](../servers-and-connections/adding-mcp-servers). For manual OAuth setup steps, see [MCP Provider Setup](../provider-setup/overview). For OneMCP unified access, memory tools, and inline authentication, see [OneMCP](./onemcp).

Non-OAuth MCPs can also receive the authenticated Quilr user identity in a gateway-generated `X-User-Claims` JSON header. Turn it on with **Forward user claims** in the server's **Settings > General**. It works for direct MCP and OneMCP requests and is off by default. See [Claims forwarding](../protect/claims-forwarding) for configuration, schema, and trust requirements.

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

With OneMCP, use `find_relevant_tools` for task-based discovery and `call_tool` to execute the selected tool. Use `list_mcp_connections` for connector inventory, authentication, and reconnection. Compatible clients such as ChatGPT render that result as an in-chat connector card; other clients use URL or text guidance.

## Agent Configuration

- Each AI agent (OpenAI, Claude, Cursor, etc.) connects to the **Quilr gateway** URL shown on the server card, or to OneMCP
- The gateway identifies agents by their **User-Agent** header keyword
- Choose which MCPs each agent can reach with **Allowed Agents** on the MCP Gateway page (see [Agents Configuration](../servers-and-connections/allowed-agents)), or per server in **Settings > General > Access control** (see [Access Control](../protect/server-access))
