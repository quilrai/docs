---
sidebar_position: 3
sidebar_custom_props:
  icon: GitBranch
---

# GitHub

Use a GitHub OAuth app when a GitHub MCP integration asks for a GitHub Client ID and Client Secret.

See [Overview](./overview) for prerequisites and secret-handling guidance.

## Create The GitHub OAuth App

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

## Keep In Mind

- GitHub OAuth apps support one callback URL. Create a separate OAuth app for each QuilrAI environment that has a different callback URL.
- GitHub OAuth scopes are requested during authorization, not configured on the app record.
- Use only public information in the OAuth app fields. GitHub advises against entering sensitive or internal URLs, so use a public homepage URL.
- If your GitHub organization restricts OAuth apps, an organization owner may need to approve the app before users can authorize it.
- GitHub recommends GitHub Apps for many new integrations, but use an OAuth app when the MCP integration specifically asks for OAuth Client ID and Client Secret.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `invalid_client` or `bad_client_secret` | Wrong Client ID, wrong secret, or a deleted secret. | Copy the GitHub Client ID and Client Secret again, update QuilrAI, and retry. |
| Organization authorization blocked | The GitHub organization restricts OAuth apps. | Ask a GitHub organization owner to approve the OAuth app. |

## References

- [GitHub: Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [GitHub: Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
