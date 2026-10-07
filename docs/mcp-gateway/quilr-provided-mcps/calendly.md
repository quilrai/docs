---
sidebar_position: 12
sidebar_custom_props:
  icon: CalendarDays
---

# Calendly

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">SCHEDULING OPERATIONS</span><h2>Enterprise-owned OAuth for the full scheduling lifecycle.</h2><p>Forty tools across event types, availability, meetings, routing, webhooks, organizations, and compliance.</p></div>

The Quilr-built Calendly MCP connects with a Calendly OAuth application that your organization owns. A Calendly administrator creates the application and gives its **Client ID** and **Client Secret** to the MCP Gateway. Each Calendly user then authorizes their own account in the browser.

:::warning Custom MCP only
These steps are for the Quilr Calendly MCP at `https://calendly-custom.mcp.quilr.ai/mcp`. Calendly's official MCP (`https://mcp.calendly.com/`) uses Dynamic Client Registration and does not accept manually created OAuth credentials.
:::

## Tools

The MCP exposes 40 tools when the full scope set below is enabled, across event types, availability, meetings, routing, webhooks, organizations and compliance. Some tools also depend on the Calendly plan and the authorizing user's role: routing forms need a qualifying Teams plan, and direct scheduling needs a paid plan.

Keep write and external-action tools off in [Tool visibility](../protect/tool-visibility) until they are approved.

## Setup

| Item | Requirement |
|------|-------------|
| Calendly developer account | Create one with GitHub or Google at the developer portal. It is separate from your normal Calendly account. |
| Application owner | An administrator responsible for credential storage, rotation and scope approval. |
| Environment | Start with **Sandbox**. Create a separate **Production** application before using real data. |
| Redirect URI | The exact **OAuth callback URL** QuilrAI shows. Production is normally `https://mcpgateway.quilr.ai/oauth/callback`. |

### 1. Create the Calendly OAuth application

1. Open the [Calendly developer portal](https://developer.calendly.com/) and create a new OAuth application, for example `QuilrAI Calendly - Sandbox`.
2. Select **Web** as the application kind, and **Sandbox** or **Production**.
3. In **Redirect URI**, paste the exact callback URL from QuilrAI. Production applications require HTTPS. Do not add a trailing slash unless QuilrAI's URL has one.
4. Select the scopes below, then create the application.
5. Copy the **Client ID** and **Client Secret** immediately into your secret manager.

:::warning Copy the secret immediately
Calendly shows the Client Secret only when the application is created. Do not confuse it with the **Webhook signing key**.
:::

### 2. Choose scopes

New Calendly applications have no API access until scopes are selected. Read-only tools need:

```text
users:read
organizations:read
event_types:read
availability:read
locations:read
scheduled_events:read
routing_forms:read
```

The full tool surface requests this set:

```text
users:read
organizations:write
event_types:write
availability:write
locations:read
scheduled_events:write
scheduling_links:write
shares:write
routing_forms:read
```

Calendly write scopes include the matching read permission. The gateway requests every scope the MCP advertises, and Calendly rejects the whole authorization if any one of them is not enabled on your application, so keep the two lists identical. Do not add a redundant read scope next to its write scope.

### 3. Add the server to the MCP Gateway

1. Go to **Settings > AI Gateway > MCP Gateway** and click **Add MCP server**. Choose **Remote server**.
2. Enter a **Name** such as `Calendly Custom`, a **Slug** such as `calendly-custom`, and **Transport URL** `https://calendly-custom.mcp.quilr.ai/mcp`.
3. Keep **Auto-detect (recommended)** under **How the gateway signs in** and click **Probe and continue**.
4. In **Connect with OAuth**, confirm the **OAuth callback URL** matches the one in Calendly, enter the **OAuth client ID** and **OAuth client secret**, and click **Create MCP**.
5. [Connect OAuth once as an administrator](../servers-and-connections/adding-mcp-servers#connect-an-oauth-server-as-an-administrator), review the permissions in Calendly and approve.

Do not choose **OAuth passthrough** for this server. The gateway holds your application credentials, runs the authorization-code flow with PKCE, stores and refreshes each user's tokens, and sends only the resulting Calendly bearer token to the MCP.

### 4. Connect a client and verify

Point clients at the server's **Quilr gateway** URL, not the upstream URL or Calendly's official URL. In Cursor, use a short key because long combined server and tool names can be filtered:

```json
{
  "mcpServers": {
    "cal": {
      "type": "http",
      "url": "https://mcpgateway.quilr.ai/YOUR-CALENDLY-SLUG/mcp"
    }
  }
}
```

For Claude, add a custom connector with the same URL and leave its OAuth fields empty. Then run a read-only check:

```text
Use the Calendly Custom MCP. Get my Calendly account context, list my active
event types, and show the first five available times for the first event type.
Do not create, update, cancel, invite, share, or book anything.
```

Confirm the returned user and organization are the ones you intended, and that no scope error appears.

### Credential rotation

- Redeploying the Calendly MCP does not require users to reconnect. A gateway redeployment also keeps connections when its database, encryption key, public callback URL, backend record and OAuth token state are all retained.
- Update the saved client ID and secret if you replace the Calendly application or rotate its credentials.
- Users must reconnect after their grant is revoked, scopes change, their latest refresh token is lost, the gateway connection is deleted, or the public OAuth identity changes. Calendly refresh tokens are single-use and rotate; the gateway stores the new one after each refresh.

### Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| `invalid_client` before consent | Wrong client ID or secret, or a secret from another application | Re-enter the matching credentials. If the secret was not saved when the app was created, issue replacement credentials through the Calendly developer portal. |
| `invalid_scope` | The MCP advertises a scope not enabled on your application | Make the enabled and advertised scopes identical, then reconnect. |
| Redirect URI error | Callback differs in environment, scheme, path or trailing slash | Paste QuilrAI's callback exactly into Calendly and reconnect. |
| `403` or missing-scope error | The application or the user's grant lacks a scope | Add the minimum scope and reconnect. |
| Unexpected account connected | The browser was signed in to another Calendly account | Disconnect, sign out of that account and reconnect. |
| No tools, or **Loading tools** | Wrong upstream URL, OAuth not completed, or the client uses Calendly's official URL | Check both URLs, finish **Connect**, refresh tools and restart the client entry. |
| Reconnect requested after working previously | Grant revoked, refresh token invalidated, credentials rotated, gateway OAuth state lost, or callback/resource identity changed | Preserve gateway state during deployment. Otherwise fix the configuration and reconnect the affected user. |
| A routing, booking or organization tool fails | Plan or role does not permit the operation | Check the Calendly plan, role and scope. |

References: [Creating an OAuth app](https://developer.calendly.com/creating-an-oauth-app), [Scopes](https://developer.calendly.com/scopes), [Refresh token rotation](https://developer.calendly.com/refresh-token-rotation-guide).

## Compared with the official server

<McpDecision
  officialTitle="Choose official for DCR clients"
  official="Use Calendly's hosted server when your MCP client supports Dynamic Client Registration and provider-managed onboarding fits your environment."
  officialPoints={['Provider-hosted remote MCP', 'Modern DCR-native onboarding']}
  quilrTitle="Choose Quilr for owned credentials"
  quilr="Use Quilr when the enterprise must own the OAuth application or the client depends on pre-registered credentials."
  quilrPoints={['Customer-owned OAuth app', 'Forty lifecycle tools behind gateway policy']}
  verdict="The deciding factor is credential ownership and client compatibility, not scheduling feature coverage."
/>

| Capability | Calendly Official MCP | Quilr Calendly |
|---|:---:|:---:|
| Hosted remote MCP | ✅ | ✅ |
| Dynamic Client Registration | ✅ Required | - |
| Customer-owned OAuth application | - | ✅ |
| Pre-registered client credentials | - | ✅ |
| Scheduling read/write | ✅ | ✅ |
| Routing and availability | ✅ | ✅ |
| Webhook and organization workflows | ✅ | ✅ |
| Gateway guardrails and audit | Via gateway | ✅ Native deployment model |

Use Calendly's official server for modern DCR-compatible clients. Use Quilr when the organization must own the OAuth application or the client requires pre-registered credentials.
