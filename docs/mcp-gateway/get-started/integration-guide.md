---
sidebar_position: 4
sidebar_label: "Integration guide"
sidebar_custom_props:
  icon: Plug
description: "MCP endpoint URLs, client-to-gateway authentication, gateway-to-upstream auth modes, user claims forwarding, and connection examples."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

## Connect an AI client

Use the **OneMCP URL** from the user dashboard (for example `https://mcpgateway.quilr.ai/quilrone/mcp`) to get every gateway-managed MCP through one connection, or a single MCP's **Quilr gateway** URL. OAuth passthrough MCPs are only available on their own URL (see [OneMCP](./onemcp#visibility-rules)).

The gateway speaks MCP over Streamable HTTP. Clients authenticate with OAuth: on the first request the gateway answers `401` with a pointer to its OAuth metadata, the client registers itself, and your browser opens to sign in with your company account. There is no token to copy. Before an MCP's tools work, connect it once on the user dashboard (or through the [in-chat connector card](./onemcp#inline-authentication)).

<Tabs groupId="mcp-client">
<TabItem value="cursor" label="Cursor" default>

### Connect Cursor

Add the server to `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` in a project:

```json
{
  "mcpServers": {
    "quilr-onemcp": {
      "url": "https://mcpgateway.quilr.ai/quilrone/mcp"
    }
  }
}
```

Open Cursor's MCP settings, start the sign-in for `quilr-onemcp`, and complete it in the browser.

</TabItem>
<TabItem value="claude" label="Claude Desktop / Claude.ai">

### Connect Claude Desktop and Claude.ai

Remote MCP servers are added as connectors, not in `claude_desktop_config.json` (that file is for local servers).

1. In Claude, open **Settings > Connectors** and add a custom connector.
2. Paste the OneMCP URL and save.
3. Click **Connect** and sign in when the browser opens.

A connector added on Claude.ai is also available in Claude Desktop for the same account.

</TabItem>
<TabItem value="vscode" label="VS Code">

### Connect VS Code

Add the server to `.vscode/mcp.json` in a workspace (or run **MCP: Add Server** for your user profile):

```json
{
  "servers": {
    "quilr-onemcp": {
      "type": "http",
      "url": "https://mcpgateway.quilr.ai/quilrone/mcp"
    }
  }
}
```

Start the server from the file or the MCP server list, and sign in when prompted.

</TabItem>
<TabItem value="claude-code" label="Claude Code">

### Connect Claude Code

```bash
claude mcp add --transport http quilr-onemcp https://mcpgateway.quilr.ai/quilrone/mcp
```

Then run `/mcp` in Claude Code, select `quilr-onemcp` and authenticate.

</TabItem>
<TabItem value="other" label="Other clients">

### Connect other MCP clients

Any client that supports remote MCP servers over Streamable HTTP with OAuth (protected resource metadata and dynamic client registration) can connect with just the URL.

| Item | Value |
|------|-------|
| URL | The OneMCP URL or an MCP's **Quilr gateway** URL |
| Transport | Streamable HTTP (`POST` JSON-RPC; `GET` opens an event stream for session-capable clients) |
| `MCP-Protocol-Version` | `2025-03-26`, `2025-06-18` or `2025-11-25`. Other values are rejected with `400`. |
| Auth | OAuth. Without a token, the gateway returns `401` with `WWW-Authenticate: Bearer resource_metadata="..."`. |

Clients without OAuth can call a single non-OAuth MCP's URL with an [API token](#api-token-authentication) and the `mcpuser` header. OneMCP accepts only tokens from the OAuth sign-in, not API tokens.

</TabItem>
</Tabs>

### Check the connection

1. Without signing in, confirm the URL is right. A `401` with a `WWW-Authenticate` header that contains `resource_metadata` means you reached the gateway:

   ```bash
   curl -i -X POST https://mcpgateway.quilr.ai/quilrone/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
   ```

2. After signing in, list the client's tools. With OneMCP and [dynamic tool calling](./onemcp#smart-tools) on, expect `list_mcp_connections`, `find_relevant_tools` and `call_tool`, plus the memory tools when **Memories enabled** is on. With it off, expect each allowed MCP's tools, prefixed with the MCP's name.
3. Ask the client to list available connectors. MCPs under **Connection needed** still need a one-time connect.

If sign-in succeeds but calls are refused, check that the client is allowed under [Allowed Agents](../servers-and-connections/allowed-agents) and that you can reach the MCP under [access control](../protect/server-access).

## Agent Configuration

- Each AI agent (OpenAI, Claude, Cursor, etc.) connects to the **Quilr gateway** URL shown on the server card, or to OneMCP
- The gateway identifies agents by their **User-Agent** header keyword
- Choose which MCPs each agent can reach with **Allowed Agents** on the MCP Gateway page (see [Agents Configuration](../servers-and-connections/allowed-agents)), or per server in **Settings > General > Access control** (see [Access Control](../protect/server-access))
