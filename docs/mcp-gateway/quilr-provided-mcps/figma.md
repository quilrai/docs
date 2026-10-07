---
sidebar_position: 11
sidebar_custom_props:
  icon: Layers
---

# Figma

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">DESIGN SYSTEM OPERATIONS</span><h2>Design context with the integration controls included.</h2><p>Nineteen tools spanning context, variables, screenshots, comments, assets, libraries, and Code Connect.</p></div>

Figma is a Quilr-built MCP in the Library for design context, comments and Code Connect. There is no shared Quilr-owned Figma app: each tenant connects with its own Figma OAuth app, which keeps tenants isolated.

## Tools

| Capability | Tools | Access |
|------------|-------|--------|
| Account and session | `whoami`, `get_defaults`, `set_defaults` | Read and write |
| Design nodes and layouts | `get_design_context`, `get_metadata`, `get_screenshot` | Read only |
| Design tokens and libraries | `get_variable_defs`, `get_libraries`, `search_design_system` | Read only |
| FigJam boards | `get_figjam` | Read only |
| Comments | `get_comments`, `add_comment`, `delete_comment` | Read and write |
| Code Connect mappings | `get_code_connect_map`, `get_code_connect_suggestions`, `get_context_for_code_connect`, `add_code_connect_map`, `send_code_connect_mappings` | Read and write |
| Assets | `upload_assets` | Write |

Keep in mind:

- **No project browsing.** Figma does not grant `projects:read` to unapproved third-party apps, so users paste a Figma file URL. On first use the assistant saves it as the default file; say "use this file: [URL]" to switch.
- **Variables need Enterprise.** `get_variable_defs` returns design tokens only on Enterprise workspaces and is empty on Free and Professional.
- **Node IDs use `:`.** Figma URLs write `?node-id=1-23`; pass `1:23` to `get_design_context` or `get_screenshot`.
- **FigJam uses its own tool.** Use `get_figjam` for FigJam files; the design context tools do not work there.
- `delete_comment` can only delete comments posted by the connected Figma account.

## Setup

### 1. Create the Figma OAuth app

1. Open the [Figma developer portal](https://www.figma.com/developers/apps), click **Create new app**, name it and choose the organization that should own it.
2. Under **Redirect URIs**, click **Add URI** and paste the **OAuth callback URL** shown on the Figma setup screen in QuilrAI. It must match exactly. Use a separate Figma app for each QuilrAI environment with a different callback URL.
3. Enable all seven scopes below. The MCP rejects tokens that are missing any of them.
4. Click **Save**, then copy the **Client ID** and **Client Secret**.

| Scope | Why it is needed |
|-------|------------------|
| `current_user:read` | Identify the connected Figma account. |
| `file_content:read` | Read file nodes, layout, fills, typography and render images. |
| `file_metadata:read` | Read file and component metadata, including library components and styles. |
| `file_comments:read` | Read comments on a file. |
| `file_comments:write` | Post and delete comments. |
| `file_dev_resources:read` | Read Code Connect mappings. |
| `file_dev_resources:write` | Create and update Code Connect mappings. |

Do not request `projects:read`. It needs Figma's approval and is not available to unapproved apps.

### 2. Install from the Library

1. Go to **Settings > AI Gateway > MCP Gateway**, click **Library** and find **Figma**.
2. Click **Set up**, enter the **OAuth client ID** and **OAuth client secret**, and click **Install**.
3. [Connect OAuth once as an administrator](../servers-and-connections/adding-mcp-servers#connect-an-oauth-server-as-an-administrator) and grant every requested scope at the Figma consent screen.
4. Enable the tools you need in [Tool visibility](../protect/tool-visibility).

### Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch` | The Figma app's redirect URI differs from the QuilrAI callback URL. | Copy the callback URL again, update the Figma app, save and retry. |
| `invalid_client` | Wrong client ID or secret, or a deleted secret. | Copy both values again and update QuilrAI. |
| `Figma OAuth client_id and client_secret are required` | The gateway has no OAuth credentials for this server. | Enter the client ID and secret on the setup screen. |
| `OAuth app with client id X doesn't exist` | Invalid client ID, or the app is limited to another Figma organization. | Check the app exists and the signing-in user belongs to that organization. |
| `403 Forbidden` on team endpoints | Free or Professional plan restriction. | Upgrade, or use file-scoped tools. |
| `404 Not Found` on project files | `projects:read` is unavailable. | Paste a direct Figma file URL. |

References: [Manage OAuth apps](https://www.figma.com/developers/apps), [Figma REST API OAuth](https://www.figma.com/developers/api#oauth2), [Code Connect](https://www.figma.com/developers/code-connect).

## Compared with the official server

<McpDecision
  officialTitle="Choose official for canvas creation"
  official="Use Figma's server when the agent should create or modify designs natively on the canvas with first-party product context."
  officialPoints={['Canvas-native creation', 'Deep design context and variables']}
  quilrTitle="Choose Quilr for API operations"
  quilr="Use Quilr for governed review, asset upload, comments, library search, and Code Connect mapping administration."
  quilrPoints={['Nineteen explicit tools', 'Saved defaults and gateway policy']}
  verdict="Creative canvas work favors Figma's official MCP; repeatable design-system and review operations favor Quilr."
/>

| Capability | Figma Official MCP | Quilr Figma |
|---|:---:|:---:|
| Design context and metadata | ✅ | ✅ |
| Screenshots and variables | ✅ | ✅ |
| Code Connect-aware generation | ✅ | ✅ |
| Native canvas creation/modification | ✅ | - |
| Saved default file | - | ✅ |
| Comment create/delete | - | ✅ |
| Code Connect mapping administration | Limited | ✅ |
| Asset upload | - | ✅ |
| Design-system library search | ✅ | ✅ |

Use Figma's official server for canvas-native creation. Use Quilr for API-oriented review, asset, comment, and mapping workflows under gateway policy.
