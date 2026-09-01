---
sidebar_position: 21
sidebar_custom_props:
  icon: Presentation
---

# Gamma

Gamma's official MCP server lets an agent read, create, and export Gamma presentations, documents, webpages, and social posts, and read engagement analytics for them.

Gamma supports Dynamic Client Registration, so there is no Gamma application to create and no Client ID or Client Secret to store. Gamma is not yet in the [MCP Library](../features/mcp-library), so an administrator registers it as a custom MCP by URL.

See [Overview](./overview) for shared prerequisites and secret-handling guidance.

## Connection Details

| Field | Value |
|-------|-------|
| MCP URL | `https://mcp.gamma.app/mcp` |
| Transport | Streamable HTTP |
| Auth | OAuth 2.0 with Dynamic Client Registration (RFC 7591) |
| Resource metadata | Protected Resource Metadata (RFC 9728) |
| Client ID and Secret | Not required |
| Tools | 17 |

:::warning Do not select OAuth credentials
Gamma advertises DCR, so the gateway registers itself automatically. Select **Auto-detect** and there is no redirect URI to paste into Gamma. Selecting **OAuth credentials** will ask you for values you cannot obtain.
:::

## Prerequisites

- A Gamma account. The MCP server is available on all Gamma plans, with no add-on SKU.
- Credit budget, if you intend to enable the generation or export tools. They charge Gamma credits against the authorizing user's account.
- A QuilrAI administrator to register the server and set tool scope before rollout.

## Add Gamma To QuilrAI

1. In QuilrAI, go to **Settings** > **AI Gateway** > **MCP Gateway**.

2. Click **Add MCP server**.

3. Enter the following values:

| Field | Value |
|-------|-------|
| Name | `Gamma` |
| Slug | A unique value such as `gamma` |
| Transport URL | `https://mcp.gamma.app/mcp` |
| Description | Optional, for example `Gamma presentations and documents` |
| Authentication | **Auto-detect (recommended)** |

4. Click **Probe and continue**. The gateway probes the endpoint, reads Gamma's protected resource metadata, and reports that OAuth with Dynamic Client Registration is available.

5. Create the MCP connection.

6. Click **Connect**, sign in to Gamma, review the requested permissions, and approve access.

7. Refresh capabilities. The server should expose 17 tools.

Each additional user repeats step 6 for their own Gamma account. Until a user connects, they see the server but no tools.

## Tools

Twelve tools are read-only. Five change state in Gamma or spend credits.

### Read-only tools

| Tool | What it does |
|------|--------------|
| `get_gammas` | Browse or search existing gammas and templates |
| `read_gamma` | Read the full content of an existing gamma |
| `get_gamma_comments` | List comment threads on an existing gamma |
| `get_generation_status` | Check the status of a generation job |
| `get_image_generation_status` | Check status and retrieve a generated image URL |
| `get_export_status` | Check export status and retrieve a download link |
| `get_themes` | Browse or search the Gamma theme library |
| `get_folders` | Browse or search Gamma folders |
| `get_gamma_analytics` | Engagement summary analytics for a gamma |
| `get_gamma_card_analytics` | Card-by-card engagement metrics |
| `get_gamma_viewer_analytics` | List the people who viewed a gamma |
| `get_gamma_viewer_detail_analytics` | A specific viewer's detailed engagement |

### Tools that write or spend credits

| Tool | What it does |
|------|--------------|
| `generate` | Create a presentation, document, webpage, or social post |
| `generate_multi_page_gamma` | Create a multi-page gamma with distinct pages under one URL |
| `generate_from_template` | Create a new gamma by adapting an existing template |
| `generate_image` | Generate a standalone image from a text prompt |
| `export_gamma` | Export an existing gamma to PDF, PPTX, or PNG |

:::warning The viewer analytics tools return named individuals
`get_gamma_viewer_analytics` and `get_gamma_viewer_detail_analytics` return who opened a gamma and how long they engaged with it. When the gamma was shared externally, that is third-party personal data arriving through the gateway. Decide deliberately whether agents need it, and apply [security guardrails](../features/security-guardrails) if you enable it.
:::

## Recommended Read-Only Rollout

Use [Tools Management](../features/tools-management) to disable the five writing tools before the first agent reaches the server.

1. Disable `generate`, `generate_multi_page_gamma`, `generate_from_template`, `generate_image`, and `export_gamma`.
2. Consider also disabling `get_generation_status`, `get_image_generation_status`, and `get_export_status`. They are read-only, but they are only useful alongside the tools you just disabled, and leaving them enabled produces confusing behaviour where an agent polls for a job it was never able to start.
3. Decide on the four analytics tools separately from the content tools. They are the ones carrying personal data.
4. Widen to `generate` only once someone owns the Gamma credit budget, and set a rate limit on the server first.

## Verify The Connection

Start with a read-only request that spends nothing:

```
Use the Gamma MCP. List up to five of my existing gammas and show the available
themes. Do not generate, export, or create anything, and do not read viewer
analytics.
```

Confirm that:

- the gammas returned belong to the workspace you intended to authorize;
- themes and folders return without a scope error;
- no credits were consumed against the Gamma account;
- the MCP client reports the expected tools instead of remaining at **Loading tools**.

## Reconnecting

- Users reconnect after revoking the Gamma grant, after the latest refresh token is lost, or after the gateway connection is deleted.
- Because registration is dynamic, there is no client secret to rotate.
- A Gamma plan change does not require a reconnect, but it can change credit availability and therefore whether the generation tools succeed.

## Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| Probe reports no auth requirement | The transport URL is wrong, or a proxy returned a generic response | Confirm the URL is exactly `https://mcp.gamma.app/mcp`, then probe again |
| Probe asks for a Client ID and Secret | **OAuth credentials** was selected instead of **Auto-detect** | Recreate the server with **Auto-detect**. Gamma supports DCR and needs no application |
| Connected but zero tools | OAuth was not completed, or capabilities were never refreshed | Complete **Connect**, refresh capabilities, then restart or toggle the entry in the client |
| A generation tool fails with a credit error | The authorizing user's Gamma credit balance is exhausted | Top up in Gamma, or keep the generation tools disabled |
| An export returns a link the agent cannot fetch | Expected. `export_gamma` returns a download URL, it does not stream bytes through the MCP | Hand the link to the user, or fetch it through an approved path |
| Analytics tools return empty results | The gamma has no recorded views, or the user lacks workspace analytics permission | Confirm the sharing and role settings in Gamma |
| An agent polls a status tool indefinitely | A status tool is enabled while its matching generation tool is disabled | Disable the orphaned status tools, or enable the pair together |

## Security Notes

- There is no Gamma client secret in this integration. If someone asks you to paste one, the server was registered with the wrong auth mode.
- Keep the five writing tools disabled until a named owner has approved both write access and the credit spend.
- Treat viewer analytics as personal data about people who may not be your employees.
- `generate` sends the agent's prompt content to Gamma, so anything an agent summarizes into a deck leaves your environment. Guardrail the request path, not only the response.
- Restrict the server with [Access Control](../features/access-control) if only part of the organization should reach it.

## References

- [Gamma: Set up the MCP server](https://developers.gamma.app/mcp/gamma-mcp-server)
- [Gamma: MCP tools reference](https://developers.gamma.app/mcp/mcp-tools-reference)
- [QuilrAI: OAuth Connect](../features/oauth-connect)
- [QuilrAI: Tools Management](../features/tools-management)
- [QuilrAI: Security Guardrails](../features/security-guardrails)
