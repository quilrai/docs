---
sidebar_position: 6
sidebar_custom_props:
  icon: KeyRound
---

# API Tokens

Issue a direct-connection token so a script, service or AI client can call one MCP server through the gateway without signing in.

Go to **Settings > AI Gateway > MCP Gateway**, click **Configure** on the server card and open **API tokens** ("Direct-connection tokens"). The section reads: "Clients call this MCP with an access token in the Authorization header plus their own `mcpuser` email header."

![API tokens section with the Create a token card (Token name, Agent, Add agent, Create token) and the Tokens table with Name, Agent, Created and Revoke](/img/mcp-gateway/ui/settings-api-tokens.png)

API tokens are not offered on OAuth servers, where each person signs in with their own account. A token works only for the server it was created on.

## Create a token

1. Under **Create a token**, enter a **Token name**, for example `reporting-service`.
2. Select the **Agent** the token is for. Choose a built-in agent or a custom agent registered in **Allowed Agents**. To add a new one, click **Add agent**.
3. Click **Create token**.
4. Copy the **Generated MCP token** and click **Done**.

:::warning
The token is shown once. Save it now; it cannot be revealed later. If you lose it, revoke it and create a new one.
:::

## Manage tokens

The **Tokens** table lists every active token with its **Name**, **Agent** and **Created** time. Click **Revoke** to revoke access immediately.

## Use a token

Send the token and the email of the user making the call on every request to the server's gateway endpoint (shown as **QUILR GATEWAY** on the server card):

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <your-api-token>` |
| `mcpuser` | Email of the person making the call, for example `jane@example.com` |

The gateway applies [Access control](./access-control), [Group & User Rules](./group-user-rules) and guardrails for the person named in `mcpuser`, and records the calls against them. Requests without a valid `mcpuser` email are rejected.

```bash
curl https://mcpgateway.quilr.ai/<your-mcp-slug>/mcp \
  -H "Authorization: Bearer <your-api-token>" \
  -H "mcpuser: jane@example.com" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Most MCP clients let you set these as custom headers in their server configuration:

```json
{
  "mcpServers": {
    "github": {
      "url": "https://mcpgateway.quilr.ai/<your-mcp-slug>/mcp",
      "headers": {
        "Authorization": "Bearer <your-api-token>",
        "mcpuser": "jane@example.com"
      }
    }
  }
}
```

API tokens only identify the client to the gateway. The credentials the gateway uses to reach the upstream server are set on the server itself, under **General > Upstream authentication**.

## Related

- [Allowed Agents](./agents-configuration) - register a custom agent for a token.
- [Access control](./access-control) - limit which people can use the server.
- [Integration guide](../integration-guide) - connect AI clients to the gateway.
