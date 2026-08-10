---
sidebar_position: 14
sidebar_custom_props:
  icon: ListChecks
---

# Asana

Asana's MCP server lets an agent read and act on your Asana Work Graph - finding tasks, creating and updating work, and summarizing project status through natural language.

The current server is **V2**, which requires OAuth 2.0 with a Client ID and Client Secret you register yourself. Asana does not support Dynamic Client Registration, so creating an Asana app is mandatory - you cannot connect with [OAuth Connect](../features/oauth-connect) alone.

See [Overview](./overview) for shared prerequisites and secret-handling guidance.

## Connection Details

| Field | Value |
|-------|-------|
| MCP URL | `https://mcp.asana.com/v2/mcp` |
| Redirect URL (production) | `https://mcpgateway.quilrai.com/oauth/callback` |
| Transport | Streamable HTTP |
| Auth | OAuth 2.0 with manual Client ID and Client Secret |

:::warning V1 is retired
The V1 beta server (`https://mcp.asana.com/sse`) was deprecated and scheduled to shut down on 5 August 2026. Use the V2 URL for every configuration.
:::

## Prerequisites

- An Asana account with access to the workspace you want to connect.
- Permission to create an app in the Asana developer console for that account.
- The QuilrAI callback URL. Copy it from the MCP setup screen when you click **Add MCP**; production is normally `https://mcpgateway.quilrai.com/oauth/callback`.

## Create The Asana MCP App

This produces the Client ID and Client Secret that every V2 connection requires.

1. Go to the Asana developer console at [app.asana.com/0/my-apps](https://app.asana.com/0/my-apps) and sign in.
2. Click **Create new app**.
3. Enter a name, for example `QuilrAI MCP`.
4. Select **MCP app** as the app type. This matters - tokens issued to an MCP app only work with the MCP server.
5. Click **Create app**, then copy the **Client ID** and **Client secret** shown.

:::warning Handle the secret carefully
The Client Secret is a credential. Never commit it to version control or paste it into a shared document. You can rotate it at any time from the **OAuth** tab of the app in the developer console.
:::

### Set The OAuth Redirect URL

In the app's left sidebar, click **OAuth** and add the QuilrAI callback URL exactly as QuilrAI displays it. A mismatch here is the most common cause of a failed authorization.

| Environment | Redirect URL |
|-------------|--------------|
| QuilrAI production gateway | `https://mcpgateway.quilrai.com/oauth/callback` |

### Configure Workspace Distribution

1. In the left sidebar, click **Manage distribution**.
2. Choose **Specific workspaces** or **Any workspace**.
3. If you chose **Specific workspaces**, add at least one workspace. Leaving it empty causes a "This app is not available to your Asana workspace" error.
4. Click **Save changes**.

## Add Asana MCP To QuilrAI

1. In QuilrAI, go to **MCP Gateway** and click **Add MCP**.
2. Paste the Asana MCP endpoint URL: `https://mcp.asana.com/v2/mcp`
3. Set **Auth Mode** to **Auto-detect**.
4. Paste the **Client ID** and **Client Secret** from the Asana app.
5. Click **Create** to start Asana's OAuth flow. A new screen opens and asks you to approve access.
6. After authorization, QuilrAI connects and fetches the available tools.

![QuilrAI MCP Gateway showing the connected Asana MCP with its gateway URL, OAuth auth mode, and fetched tool count](/img/asana-mcp-connected.png)

The installed MCP card shows the QuilrAI gateway URL your agents point at, the original Asana MCP URL behind it, and the tool count fetched from Asana. Give this gateway URL - not `https://mcp.asana.com/v2/mcp` - to your MCP clients so traffic passes through the gateway's controls.

## Keep In Mind

- **No Dynamic Client Registration.** Asana V2 always needs a provider-owned app with a manually entered Client ID and Client Secret.
- **Use the MCP app type.** Tokens from a standard Asana OAuth app do not work against the MCP server.
- **One app per environment.** Create a separate Asana app for each QuilrAI tenant or environment whose callback URL differs, so rotation and testing stay isolated.
- **Access follows the authorizing user.** Each user authorizes individually, and tools operate with that user's own Asana permissions.
- **Restrict write tools before rollout.** The MCP can create and update tasks and projects. Use [Tools Management](../features/tools-management), [Access Control](../features/access-control), and [Security Guardrails](../features/security-guardrails) to limit which operations agents can reach.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch` or failed callback | The redirect URL on the Asana app's **OAuth** tab does not match the QuilrAI callback URL exactly. | Copy the callback URL from QuilrAI again, update the Asana app, save, and retry. |
| "This app is not available to your Asana workspace" | **Manage distribution** is set to **Specific workspaces** with no workspace added, or without the workspace you are authorizing from. | Add the workspace (or switch to **Any workspace**), click **Save changes**, and retry. |
| `invalid_client` or `bad_client_secret` | Wrong Client ID, wrong secret, or a rotated secret that QuilrAI does not have. | Copy the Client ID and Client Secret again from the developer console, update QuilrAI, and retry. |
| Connection fails against `https://mcp.asana.com/sse` | The V1 beta endpoint is retired. | Use `https://mcp.asana.com/v2/mcp`. |
| Wrong app type was selected | Tokens issued to a non-MCP Asana app are rejected by the MCP server. | Create a new app with **MCP app** as the type and reconnect with its credentials. |
| `invalid_grant` when refreshing | The user revoked authorization, or the Client Secret was rotated. | Reconnect to re-authorize. After rotating the secret, update the manual OAuth credentials in QuilrAI. |

## References

- [Asana developer console (My apps)](https://app.asana.com/0/my-apps)
- [Asana: MCP server](https://developers.asana.com/docs/using-asanas-mcp-server)
- [OAuth Connect](../features/oauth-connect)
