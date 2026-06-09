---
sidebar_position: 4
sidebar_custom_props:
  icon: KeyRound
---

# OAuth Client Credentials

Create provider-owned OAuth apps for MCP servers that need a manual **Client ID** and **Client Secret**.

## When You Need This

Use this guide when an MCP server does not support Dynamic Client Registration and the QuilrAI setup flow asks for OAuth credentials.

For DCR-compatible MCP servers, you do not need to create a provider app. Use [OAuth Connect](./features/oauth-connect) and authorize directly.

## Before You Start

Have these values ready:

| Value | Where to get it |
|-------|-----------------|
| QuilrAI callback URL | The gateway displays it on the MCP setup screen when you **Add MCP** or install one from the library. Copy it from there. |
| Provider scopes | Use the scopes requested by the MCP integration. Start with the least privileged scopes that support the tools you plan to enable. |
| App owner | Use the Slack workspace, GitHub organization, or GitHub account that should own the integration. |

:::tip
Create a separate OAuth app for each QuilrAI tenant or environment if the callback URL is different. This keeps rotation, testing, and production authorization separate.
:::

## Slack

Use a Slack app when a Slack MCP integration asks for a Slack Client ID and Client Secret.

1. Open the [Slack app dashboard](https://api.slack.com/apps) and click **Create New App**.
2. Choose **From scratch**, enter an app name, and select the workspace that should own the app.
3. Open **Agents & AI Apps** and turn on the **Model Context Protocol** feature.

   ![Slack app settings showing the Model Context Protocol feature toggle](/img/slack-mcp-feature.png)

4. Open **OAuth & Permissions**.
5. Under **Redirect URLs**, click **Add New Redirect URL**, paste the QuilrAI callback URL, and save.
6. Under **User Token Scopes**, add the scopes required by the Slack MCP tools you plan to enable.
7. If you also run an in-Slack bot experience, add those bot scopes separately under **Bot Token Scopes**. Slack MCP tool permissions are granted on the user token.
8. Open **Basic Information**.
9. Under **App Credentials**, copy the **Client ID** and **Client Secret**.
10. Paste those values into the QuilrAI manual OAuth setup screen, then click **Connect** and authorize Slack.

Slack MCP user-token scopes:

| Slack MCP tool | User scopes |
|----------------|-------------|
| Search messages and channels | `search:read.public`, `search:read.private`, `search:read.mpim`, `search:read.im` |
| Search files | `search:read.files` |
| Read files | `files:read` |
| Search emoji | `emoji:read` |
| Search users | `search:read.users` |
| Send messages | `chat:write` |
| Read channels and threads | `channels:history`, `groups:history`, `mpim:history`, `im:history` |
| Create conversations or channels | `channels:write`, `groups:write`, `im:write`, `mpim:write` |
| Add reactions | `reactions:write` |
| Create or update canvases | `canvases:read`, `canvases:write` |
| Read user profile and email | `users:read`, `users:read.email` |
| List channel members | `channels:read`, `groups:read`, `mpim:read` |

Keep these Slack details in mind:

- Use **Client Secret**, not **Signing Secret**. The signing secret is for verifying Slack events and is not used as the OAuth client secret.
- Slack requires MCP clients to be backed by a registered Slack app. Only internal apps or Slack Marketplace-published apps can use MCP; unlisted apps cannot use MCP.
- Slack's MCP server uses user tokens for tool access. Add only the scopes needed by the tools you enable in QuilrAI.
- For a single internal workspace, the app can stay private to that workspace.
- If the same Slack app must be installed across multiple workspaces, configure Slack app distribution before sharing the install flow.
- Slack redirect URLs must match the URL used by the OAuth flow. If QuilrAI shows a new callback URL later, add it to Slack before reconnecting.

## GitHub

Use a GitHub OAuth app when a GitHub MCP integration asks for a GitHub Client ID and Client Secret.

1. Decide whether the OAuth app should be owned by a user account or an organization.
2. In GitHub, open **Settings**.
3. Open **Developer settings**.
4. Open **OAuth Apps** and click **New OAuth App**.
5. Enter an **Application name**.
6. Enter a **Homepage URL**. This field is informational only and is not part of the OAuth flow, so use any public URL such as your company website.
7. In **Authorization callback URL**, paste the QuilrAI callback URL. This is the gateway redirect URL and must match exactly.
8. Leave **Enable Device Flow** unchecked. The QuilrAI gateway uses the standard authorization-code flow with the callback URL above.
9. Click **Register application**.
10. Copy the **Client ID**.
11. Click **Generate a new client secret** and copy the secret immediately.
12. Paste the Client ID and Client Secret into the QuilrAI manual OAuth setup screen, then click **Connect** and authorize GitHub.

Keep these GitHub details in mind:

- GitHub OAuth apps support one callback URL. Create a separate OAuth app for each QuilrAI environment that has a different callback URL.
- GitHub OAuth scopes are requested during authorization, not configured on the app record.
- Use only public information in the OAuth app fields. GitHub advises against entering sensitive or internal URLs, so use a public homepage URL.
- If your GitHub organization restricts OAuth apps, an organization owner may need to approve the app before users can authorize it.
- GitHub recommends GitHub Apps for many new integrations, but use an OAuth app when the MCP integration specifically asks for OAuth Client ID and Client Secret.

## Store And Rotate Secrets

- Store Client Secrets only in QuilrAI and your approved secret-management system.
- Do not send Client Secrets through email, chat, client-side code, public repositories, or tickets.
- Rotate the provider secret if it is exposed or if ownership changes.
- After rotating a secret, update the MCP's manual OAuth credentials in QuilrAI and reconnect if the provider invalidates existing tokens.
- Remove unused OAuth apps from Slack or GitHub so stale credentials cannot be reused.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch`, `bad_redirect_uri`, or failed callback | Provider app callback URL does not match the QuilrAI callback URL. | Copy the callback URL from QuilrAI again, update the provider app, save, and retry. |
| `invalid_client` or `bad_client_secret` | Wrong Client ID, wrong secret, deleted secret, or Slack Signing Secret pasted instead of Client Secret. | Copy the provider Client ID and Client Secret again, update QuilrAI, and retry. |
| Slack MCP access denied | The Slack app is not enabled for MCP, is not an internal or Marketplace-published app, or lacks required user-token scopes. | Turn on **Model Context Protocol** under **Agents & AI Apps**, confirm the app is eligible for MCP, add missing **User Token Scopes**, and reconnect. |
| Slack `invalid_scope` | The Slack app does not include a user-token scope requested by the MCP integration. | Add the missing scope in **OAuth & Permissions**, save, and reconnect. |
| GitHub organization authorization blocked | The GitHub organization restricts OAuth apps. | Ask a GitHub organization owner to approve the OAuth app. |
| Consent succeeds but tools are missing | The MCP was authorized with narrower scopes than the tools need. | Add the missing provider scopes, reconnect, and re-fetch capabilities. |

## Provider References

- [Slack: Slack MCP Server](https://docs.slack.dev/ai/slack-mcp-server/)
- [Slack: Developing with the Slack MCP Server](https://docs.slack.dev/ai/slack-mcp-server/developing/)
- [Slack: Installing with OAuth](https://api.slack.com/authentication/oauth-v2)
- [Slack: OAuth security best practices](https://api.slack.com/docs/oauth-safety)
- [GitHub: Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [GitHub: Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
