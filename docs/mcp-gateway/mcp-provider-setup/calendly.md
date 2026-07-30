---
sidebar_position: 9
sidebar_custom_props:
  icon: CalendarDays
---

# Calendly Custom MCP

Connect the QuilrAI-built Calendly MCP with a customer-owned Calendly OAuth
application. A Calendly administrator creates the application and supplies its
**Client ID** and **Client Secret** to the QuilrAI MCP Gateway. Each Calendly
user then authorizes their own account through the normal browser consent flow.

:::warning Custom MCP only
These instructions are for the QuilrAI custom Calendly MCP at
`https://calendly-custom.mcp.quilr.ai/mcp`. Calendly's official MCP uses Dynamic
Client Registration and does not accept manually provisioned OAuth app
credentials. Do not use the official `https://mcp.calendly.com/` endpoint with
this setup.
:::

See [Provider Setup Overview](./overview) for shared prerequisites and
secret-handling guidance.

## What You Need

| Item | Requirement |
|------|-------------|
| Calendly developer account | Create one using GitHub or Google. Calendly documents this as separate from your normal Calendly user account. |
| Application owner | A customer administrator responsible for credential storage, rotation, and scope approval. |
| Environment | Start with **Sandbox**. Create a separate **Production** application before using customer data. |
| Redirect URI | Copy the exact callback URL displayed by QuilrAI. Production normally uses `https://mcpgateway.quilr.ai/oauth/callback`; pre-production uses `https://mcpgateway.quilrai.dev/oauth/callback`. |
| Scopes | Select only the Calendly permissions required by the tools you intend to enable. |

## Create The Calendly OAuth Application

1. Open the [Calendly developer portal](https://developer.calendly.com/) and
   sign in or create a developer account.
2. Create a new OAuth application.
3. Enter an identifiable application name, such as
   `QuilrAI Calendly - Sandbox`.
4. Select **Web** as the application kind.
5. Select **Sandbox** for testing or **Production** for live customer data.
6. In **Redirect URI**, paste the exact callback URL shown by the QuilrAI MCP
   setup screen.
7. Select the required scopes. Use the scope guidance below.
8. Create the application.
9. Copy the **Client ID** and **Client Secret** immediately and place them in
   your approved secret manager.

:::warning Copy the secret immediately
Calendly displays the Client Secret only when the OAuth application is created.
It is not shown again when you edit the application. Do not confuse the
**Webhook signing key** with the **Client Secret**.
:::

Calendly requires a specific redirect URI. Production applications require an
HTTPS URI. Do not add a trailing slash unless the callback shown in QuilrAI also
contains one.

## Choose Scopes

New Calendly OAuth applications receive no API access until scopes are selected
and approved. Start with the read-only set and add write scopes only for tools
that the customer has approved.

### Read-only tools

```text
users:read
organizations:read
event_types:read
availability:read
locations:read
scheduled_events:read
routing_forms:read
```

### Full custom MCP tool surface

The complete custom integration currently requests this union:

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

Calendly write scopes include the matching read permission within the same
domain. Do not add the redundant read scope unless it is also enabled on the
customer's Calendly OAuth application. The gateway requests every scope
advertised by the custom MCP, and Calendly rejects the complete authorization
request if even one advertised scope is not enabled for that application. Some
tools also depend on the Calendly plan and authorizing user's role. For example,
routing forms require a qualifying Teams plan, and direct scheduling requires a
paid plan.

## Add The Custom MCP To QuilrAI

1. In QuilrAI, go to **Settings** > **AI Gateway** > **MCP Gateway**.
2. Click **Add MCP**.
3. Enter the following values:

   | Field | Value |
   |-------|-------|
   | Name | `Calendly Custom` or another recognizable name |
   | Slug | A unique value such as `calendly-custom` |
   | Transport URL | `https://calendly-custom.mcp.quilr.ai/mcp` |
   | Auth mode | **Auto-detect** or **OAuth credentials** |
   | Client ID | The Client ID copied from Calendly |
   | Client Secret | The Client Secret copied from Calendly |

4. Confirm that QuilrAI is using the same callback URL configured in the
   Calendly application.
5. Create the MCP connection.
6. Click **Connect** or **Reconnect**, sign in to Calendly, review the requested
   permissions, and approve access.
7. Return to QuilrAI and refresh capabilities. The custom server should expose
   40 tools when the complete tool surface is enabled.

Do not select **OAuth DCR** or **OAuth passthrough** for this custom server. The
gateway owns the customer-provided OAuth application credentials, performs the
authorization-code flow with PKCE, stores and refreshes user tokens, and sends
only the resulting Calendly bearer token to the MCP service.

## Connect An MCP Client

Use the generated QuilrAI gateway URL, not the upstream custom server URL and
not Calendly's official MCP URL.

For Cursor, use a short server key because Cursor may filter tools when the
combined server and tool name exceeds its limit:

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

For Claude, add a custom connector and enter the same generated QuilrAI gateway
URL. Leave Claude's optional OAuth Client ID and Client Secret fields empty;
those credentials are already managed by the QuilrAI gateway.

## Verify The Connection

Start with a read-only request:

```text
Use the Calendly Custom MCP. Get my Calendly account context, list my active
event types, and show the first five available times for the first event type.
Do not create, update, cancel, invite, share, or book anything.
```

Confirm that:

- the returned Calendly user and organization are the account you intended to
  authorize;
- event types and availability are returned without a scope error;
- no write or external action occurs;
- the MCP client reports the expected tools instead of remaining at
  **Loading tools**.

## Credential Rotation And Redeployment

- A routine redeployment of the stateless Calendly MCP does not require users
  to authorize again.
- A gateway redeployment also preserves connections when its database,
  encryption key, public callback URL, backend record, and OAuth token state are
  retained.
- Update the saved Client ID and Client Secret in QuilrAI if the customer
  replaces the Calendly OAuth application or rotates its credentials.
- Reconnect users after the Calendly grant is revoked, required scopes change,
  the latest refresh token is lost, the gateway connection is deleted, or the
  public OAuth identity changes.
- Calendly uses rotating, single-use refresh tokens. QuilrAI must save the new
  refresh token after each successful refresh. Users normally do not handle
  this themselves.

## Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| `invalid_client` or authentication fails before consent | Incorrect Client ID or Client Secret, or the secret belongs to another Calendly application. | Re-enter the matching credentials from the correct Calendly application. If the secret was not saved when the app was created, issue replacement credentials according to the Calendly developer portal flow. |
| `invalid_scope` or “request scope is invalid, unknown, or malformed” | The custom MCP advertises a scope that is not enabled on the customer-owned Calendly OAuth application. | Make the enabled application scopes and the MCP's advertised scopes identical, then reconnect. Do not add a redundant read scope when the corresponding write scope already provides read access. |
| Redirect URI error | Calendly and QuilrAI have different callback values, environments, schemes, paths, or trailing slashes. | Copy the callback from QuilrAI, paste it into the Calendly application exactly, save, and reconnect. |
| `403` or missing-scope error | The OAuth application or existing user grant lacks a scope required by the selected tool. | Add the minimum missing scope, then reconnect so the user can approve it. |
| Connected account is unexpected | The browser authorized a different signed-in Calendly account. | Disconnect the gateway connection, sign out of the unintended Calendly account, and reconnect with the correct account. |
| No tools or `Loading tools` | The custom upstream URL is wrong, OAuth was not completed, capabilities were not refreshed, or the client is using Calendly's official endpoint with manual credentials. | Verify the two URLs, complete **Connect**, refresh capabilities, then restart or toggle the MCP entry in the client. |
| A routing, booking, or organization tool is unavailable | The Calendly subscription or authorizing user's role does not permit that API operation. | Confirm the customer's Calendly plan, role, organization access, and required scope. |
| Reconnect is requested after working previously | Grant revoked, refresh token invalidated, credentials rotated, gateway OAuth state lost, or callback/resource identity changed. | Preserve gateway state during deployment. Otherwise reconnect the affected user after correcting the underlying configuration. |

## Security Notes

- Never put the Calendly Client Secret in Cursor, Claude, ChatGPT, an MCP JSON
  file, source control, chat, email, or a support ticket.
- Do not place customer Client IDs, Client Secrets, access tokens, or refresh
  tokens in the custom MCP container environment. The gateway owns that state.
- Use separate Sandbox and Production OAuth applications.
- Keep write-capable and external-action tools disabled until explicitly
  approved through gateway policy.
- Rotate credentials immediately if a secret is exposed.

## References

- [Calendly: Creating an OAuth app](https://developer.calendly.com/creating-an-oauth-app)
- [Calendly: Authentication overview](https://developer.calendly.com/authentication)
- [Calendly: Authorization scopes](https://developer.calendly.com/scopes)
- [Calendly: Refresh token rotation](https://developer.calendly.com/refresh-token-rotation-guide)
- [Calendly: Official MCP server](https://developer.calendly.com/calendly-mcp-server)
- [QuilrAI: OAuth Connect](../features/oauth-connect)
