---
sidebar_position: 6
sidebar_custom_props:
  icon: Layers
---

# Figma

**Figma** is a QuilrAI-built MCP available in the MCP Store. It exposes design context, comment, and Code Connect tools. The MCP is multi-tenant and does not ship a shared Figma OAuth app, so each connection must use its own Figma OAuth Client ID and Client Secret created at the Figma developer portal.

Use this guide when you install **Figma** from the MCP Store and the QuilrAI setup screen asks for a Figma Client ID and Client Secret.

See [Overview](./overview) for prerequisites and secret-handling guidance.

## What This MCP Can Do

| Capability | Tools | Access |
|------------|-------|--------|
| Read account and session info | `whoami`, `get_defaults`, `set_defaults` | Read and write |
| Read design nodes and layouts | `get_design_context`, `get_metadata`, `get_screenshot` | Read only |
| Read design tokens and libraries | `get_variable_defs`, `get_libraries`, `search_design_system` | Read only |
| Read FigJam boards | `get_figjam` | Read only |
| Read and manage comments | `get_comments`, `add_comment`, `delete_comment` | Read and write |
| Read and write Code Connect mappings | `get_code_connect_map`, `get_code_connect_suggestions`, `get_context_for_code_connect`, `add_code_connect_map`, `send_code_connect_mappings` | Read and write |
| Upload assets | `upload_assets` | Write |

`delete_comment` can only delete comments posted by the connected Figma account. `get_variable_defs` returns results only on Enterprise workspaces.

## Required OAuth Scopes

Enable all of these when creating the app. The MCP rejects tokens that are missing any of them.

| Scope | Why it is needed |
|-------|------------------|
| `current_user:read` | Identify the connected Figma account. |
| `file_content:read` | Read file nodes, layout, fills, typography, and render images. |
| `file_metadata:read` | Read file and component metadata, including library components and styles. |
| `file_comments:read` | Read comments on a file. |
| `file_comments:write` | Post and delete comments. |
| `file_dev_resources:read` | Read Code Connect mappings. |
| `file_dev_resources:write` | Create and update Code Connect mappings. |

Do not request `projects:read`. It requires Figma's approval and is not available to unapproved third-party OAuth apps.

## Create The Figma OAuth App

1. Open the [Figma developer portal](https://www.figma.com/developers/apps) and click **Create new app**. Give it a name and choose the organization that should own the integration.
2. Under **Redirect URIs**, click **Add URI** and paste the QuilrAI callback URL shown on the **Figma** MCP setup screen. It must match exactly.
3. Enable the seven scopes from [Required OAuth Scopes](#required-oauth-scopes).
4. Click **Save**, then copy the **Client ID** and **Client Secret**.
5. Paste the Client ID and Client Secret into the QuilrAI manual OAuth setup screen, click **Connect**, and authorize Figma. Grant all requested scopes at the Figma consent screen.
6. On first use, the assistant will ask you to paste a Figma file URL (for example, `https://www.figma.com/design/aBcDeFgHiJkL/My-Design-System`). The assistant saves it as your default for all future sessions. To switch files, tell it "use this file: [URL]".

## Keep In Mind

- **`projects:read` is not available to third-party OAuth apps.** Figma restricts this scope — the assistant cannot browse projects or list files. Users must paste a Figma file URL directly; the assistant extracts the file key from the URL automatically.
- **Design variables require an Enterprise workspace.** `get_variable_defs` returns design tokens only when the Figma workspace is on the Enterprise plan. On Free and Professional workspaces the tool returns an empty result.
- **Node IDs use `:` not `-`.** Figma URLs encode node IDs with hyphens (for example `?node-id=1-23`). When passing a node ID to `get_design_context` or `get_screenshot`, replace `-` with `:` (for example `1:23`).
- **FigJam boards use a different tool.** For FigJam files, use `get_figjam` instead of `get_design_context`. The design context tools do not work on FigJam boards.
- **Redirect URI must match exactly.** Figma rejects the OAuth flow if the redirect URI in the app does not match the QuilrAI callback URL character-for-character. Create a separate Figma OAuth app for each QuilrAI environment whose callback URL differs.
- **Each tenant brings its own credentials.** This MCP is multi-tenant by design. There is no shared QuilrAI-owned Figma app, so isolation comes from each connection using its own Figma OAuth app.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch` | The redirect URI in the Figma app does not match the QuilrAI callback URL. | Copy the callback URL from the MCP setup screen again, update the Figma app's redirect URI, save, and retry. |
| `invalid_client` | Wrong Client ID, wrong secret, or a deleted secret. | Copy the Figma Client ID and Client Secret again, update QuilrAI, and retry. |
| `client_id and redirect_uri are required` or `Figma OAuth client_id and client_secret are required` | The gateway was not supplied OAuth credentials. | Confirm the Figma Client ID and Client Secret are configured in the QuilrAI MCP setup screen and retry. |
| `OAuth app with client id X doesn't exist` | Client ID is invalid, or the Figma app is scoped to a specific organization. | Verify the app exists at figma.com/developers/apps and that the signing-in user belongs to the same Figma organization. |
| `403 Forbidden` on team endpoints | Free or Professional plan restriction. | Upgrade the Figma workspace, or use file-scoped tools instead of team-scoped ones. |
| `404 Not Found` on project files | `projects:read` is not available to unapproved third-party OAuth apps. | Provide a direct Figma file URL instead of browsing by project. |

## References

- [Figma: Manage OAuth applications](https://www.figma.com/developers/apps)
- [Figma REST API: OAuth 2.0](https://www.figma.com/developers/api#oauth2)
- [Figma REST API reference](https://www.figma.com/developers/api)
- [Figma: Code Connect](https://www.figma.com/developers/code-connect)
