---
sidebar_position: 8
sidebar_custom_props:
  icon: Video
---

# Zoom

Use a Zoom OAuth app when a Zoom MCP integration asks for a Zoom Client ID and Client Secret.

See [Overview](./overview) for prerequisites and secret-handling guidance.

## Create The Zoom OAuth App

1. Decide which Zoom account should own the integration. You need developer or admin authorization on that account to create and activate the app.
2. Log in to the Zoom App Marketplace at [marketplace.zoom.us](https://marketplace.zoom.us) as a developer or admin.
3. Click **Develop**, then **Build App**.
4. Select **General App** and click **Create**. A General App uses user-managed OAuth 2.0, which is the authorization model Zoom's remote MCP servers use.
5. Open **Basic Information**. Under **App Credentials**, locate the **Client ID** and **Client Secret**. Zoom provides separate Development and Production credentials, so use the set that matches your environment.
6. Under **OAuth Information**, paste the QuilrAI callback URL into the **OAuth Redirect URL** field, then add the same URL to the **OAuth Allow List**. Copy the callback URL from the QuilrAI MCP setup screen and match it exactly.
7. Open **Scopes** and add the granular scopes the Zoom MCP integration requests, for example meeting, cloud recording, and chat scopes. Start with the least privileged scopes that support the tools you plan to enable. The main Zoom MCP server, the Docs server, and the Whiteboard server each expose a different scope set, so add scopes for the specific server you are enabling.
8. Activate the app. Zoom cannot issue tokens for an app that is not activated.
9. Copy the **Client ID** and **Client Secret** from **App Credentials**.
10. Paste the Client ID and Client Secret into the QuilrAI manual OAuth setup screen, then click **Connect** and authorize Zoom. Zoom completes the OAuth 2.1 authorization-code flow with PKCE, and access is scoped to the authorizing user's own Zoom permissions.

## Keep In Mind

- Zoom remote MCP servers do not support Dynamic Client Registration, so you must create a provider-owned OAuth app and enter the Client ID and Client Secret manually.
- A General App uses user-managed OAuth. Each user authorizes individually, and access is limited to that user's own Zoom permissions, so per-user authorization is enforced by Zoom rather than by a single shared service identity.
- Zoom apps provide separate Development and Production credentials and redirect URLs. Create a separate app, or use the matching credential set, for each QuilrAI environment whose callback URL differs.
- The app must be activated in Zoom before tokens can be issued. If the app is later deactivated, existing tokens stop working.
- If your Zoom account restricts app installs, an account admin may need to approve the app before users can authorize it.
- For account-level automation that runs without a signed-in user, create a Server-to-Server OAuth app instead and use the account-credentials flow. The standard MCP path is the user-managed General App described above.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch`, `invalid_redirect`, or failed callback | The Zoom OAuth Redirect URL or OAuth Allow List entry does not match the QuilrAI callback URL. | Copy the callback URL from QuilrAI again, update both the Redirect URL and the OAuth Allow List in Zoom, save, and retry. |
| `invalid_client` or `bad_client_secret` | Wrong Client ID, wrong secret, mismatched Development and Production credentials, or app not activated. | Copy the Zoom Client ID and Client Secret again for the correct environment, confirm the app is activated, update QuilrAI, and retry. |
| Consent succeeds but tools are missing | The app was authorized with narrower scopes than the tools need. | Add the missing Zoom scopes, reconnect, and re-fetch capabilities. |
| `invalid_grant` when refreshing | The user revoked authorization, or the Client Secret was rotated. | Reconnect to re-authorize. After rotating the secret, update the QuilrAI manual OAuth credentials. |

## References

- [Zoom: Connect to Zoom MCP servers](https://developers.zoom.us/docs/mcp/servers/connect-to-zoom-mcp-servers/)
- [Zoom: MCP at Zoom (getting started)](https://developers.zoom.us/docs/mcp/)
- [Zoom: Server-to-Server OAuth](https://developers.zoom.us/docs/internal-apps/s2s-oauth/)
