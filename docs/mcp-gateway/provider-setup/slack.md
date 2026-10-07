---
sidebar_position: 2
sidebar_custom_props:
  icon: MessageSquareText
---

# Slack

Use a Slack app when a Slack MCP integration asks for a Slack Client ID and Client Secret.

See [Overview](./overview) for prerequisites and secret-handling guidance.

## Create The Slack App

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

## User-Token Scopes

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

## Keep In Mind

- Use **Client Secret**, not **Signing Secret**. The signing secret is for verifying Slack events and is not used as the OAuth client secret.
- Slack requires MCP clients to be backed by a registered Slack app. Only internal apps or Slack Marketplace-published apps can use MCP; unlisted apps cannot use MCP.
- Slack's MCP server uses user tokens for tool access. Add only the scopes needed by the tools you enable in QuilrAI.
- For a single internal workspace, the app can stay private to that workspace.
- If the same Slack app must be installed across multiple workspaces, configure Slack app distribution before sharing the install flow.
- Slack redirect URLs must match the URL used by the OAuth flow. If QuilrAI shows a new callback URL later, add it to Slack before reconnecting.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `invalid_client` or `bad_client_secret` | Wrong Client ID, wrong secret, or the Slack Signing Secret pasted instead of the Client Secret. | Copy the Slack Client ID and Client Secret again, update QuilrAI, and retry. |
| Slack MCP access denied | The Slack app is not enabled for MCP, is not an internal or Marketplace-published app, or lacks required user-token scopes. | Turn on **Model Context Protocol** under **Agents & AI Apps**, confirm the app is eligible for MCP, add missing **User Token Scopes**, and reconnect. |
| `invalid_scope` | The Slack app does not include a user-token scope requested by the MCP integration. | Add the missing scope in **OAuth & Permissions**, save, and reconnect. |

## References

- [Slack: Slack MCP Server](https://docs.slack.dev/ai/slack-mcp-server/)
- [Slack: Developing with the Slack MCP Server](https://docs.slack.dev/ai/slack-mcp-server/developing/)
- [Slack: Installing with OAuth](https://api.slack.com/authentication/oauth-v2)
- [Slack: OAuth security best practices](https://api.slack.com/docs/oauth-safety)
