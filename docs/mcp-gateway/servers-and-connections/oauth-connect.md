---
sidebar_position: 5
sidebar_label: "OAuth connect"
sidebar_custom_props:
  icon: Link
description: "Add OAuth servers, connect them as an administrator, how users connect, and how OAuth passthrough differs."
---

# OAuth Connect

Connect MCP servers that sign in with OAuth. An administrator connects once so the gateway can discover the server's tools, then each user connects their own account.

<StepFlow steps={[
  {
    label: "Add the server",
    items: [
      "Auto-detect finds OAuth",
      "Client ID and secret if needed",
    ],
  },
  {
    label: "Admin connects once",
    items: [
      "Review all or Connect OAuth",
      "Gateway discovers the tools",
    ],
  },
  {
    label: "Users connect",
    items: [
      "On mcpgateway.quilr.ai",
      "Or inline in OneMCP",
    ],
  },
]} />

## Add an OAuth server

Add the server with **Add MCP server** > **Remote server** and **Auto-detect (recommended)**, or install it from the [MCP Library](./mcp-library). When the server reports OAuth, the **Connect with OAuth** step opens.

| The server | You enter |
|------------|-----------|
| Registers its own client | Nothing. **OAuth client ID** and **OAuth client secret** are optional. |
| Needs a custom OAuth app | **OAuth client ID** and **OAuth client secret** from an app you created with the provider. Register the **OAuth callback URL** shown in that app. |

For provider steps, see [MCP Provider Setup](../provider-setup/overview).

## Connect as an administrator

Until an administrator signs in, the server shows **Awaiting connection** and has no tools.

1. Click **Review all** on the page banner (or **Connect** and the server name), or **Connect OAuth** on the server card.
2. In **General**, under **Connect OAuth to discover tools**, click **Connect to fetch capabilities** and sign in.
3. If you already signed in, click **Already connected? Refresh**.

**General** then reads **OAuth is connected and the gateway has discovered N tools.** Enable the tools you want in **Settings > Tools**.

This sign-in is administrator-only. It does not connect anyone else's account.

## Choose the scopes

For OAuth servers with selectable scopes, such as Microsoft Office 365, the **Permissions** section sets which scopes the connection requests and shows which tools each scope enables. See [OAuth Permissions](./oauth-permissions).

## How users connect

Each user connects their own account the first time they use the server:

- On the user dashboard at `mcpgateway.quilr.ai`, by connecting the MCP there.
- Inline in [OneMCP](../get-started/onemcp#inline-authentication): the AI app shows an **Available connectors** card or a connect link, the user signs in, then retries the request.

The gateway stores and refreshes each user's token. Calls run as that user.

## OAuth passthrough

Choose **OAuth passthrough** under **How the gateway signs in** when the AI client must sign in to the provider itself. The gateway forwards each client's bearer token unchanged and holds no credential.

| | Gateway OAuth | OAuth passthrough |
|--|---------------|-------------------|
| Who holds the token | The gateway, per user | The AI client |
| Admin connection | Required once | Not used |
| Available in OneMCP | Yes | No. Direct connection only. |
| Connect on the user dashboard | Yes | No |

## Related

- [Adding MCP Servers](./adding-mcp-servers) - every sign-in mode.
- [OAuth Permissions](./oauth-permissions) - choose the scopes a connection requests.
- [OneMCP](../get-started/onemcp) - inline connection in the AI app.
