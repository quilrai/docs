---
sidebar_position: 7
sidebar_custom_props:
  icon: Activity
---

# Datadog

Datadog exposes its MCP server through an OAuth flow tied to your Datadog organization. Unlike Slack and GitHub, you do **not** create a separate OAuth app or supply a Client ID and Client Secret. Instead, you register the QuilrAI callback URL in Datadog's organization settings and then add your site-specific Datadog MCP server URL to QuilrAI.

## How Datadog Differs

- **No custom OAuth credentials.** Datadog handles authorization using your existing org login — no Client ID or Client Secret to create.
- **Site-specific MCP URL.** Each Datadog site (US1, US3, US5, EU1, AP1, AP2) has its own MCP endpoint. You copy your endpoint from the [Datadog MCP Server setup page](https://docs.datadoghq.com/mcp_server/setup/) after selecting your site.
- **Redirect URL allowlist.** Datadog requires you to explicitly trust the QuilrAI callback URL before the OAuth flow will succeed.

## Connect Datadog

### 1. Add the QuilrAI Redirect URL to Datadog

1. Log in to Datadog and go to **Organization Settings**.
2. Navigate to **Security** > **Preferences** (URL: `https://<your-site>.datadoghq.com/organization-settings/preferences`).
3. Scroll to the **MCP OAuth Redirect URLs** section.
4. In the URL input, enter `https://mcpgateway.quilrai.com/oauth/callback` or `https://mcpgateway.quilr.ai/oauth/callback` and click **Add URL**.

![Datadog MCP OAuth Redirect URLs settings showing the QuilrAI callback URL added to the allowlist](/img/datadog-mcp-redirect-urls.png)

:::note
The QuilrAI callback URL must appear in the allowlist before you authorize the MCP connection. If it is missing, the OAuth redirect will be rejected by Datadog.
:::

### 2. Get Your MCP Server Endpoint URL

1. Open the [Datadog MCP Server setup page](https://docs.datadoghq.com/mcp_server/setup/).
2. Use the **Datadog Site selector** (top-right of the page) to select your site — for example `us5.datadoghq.com`.
3. The page updates and shows your site-specific MCP endpoint URL. Copy it.

| Site | Example endpoint |
|------|-----------------|
| US1 (datadoghq.com) | Shown after selecting US1 in the site selector |
| US5 (us5.datadoghq.com) | Shown after selecting US5 in the site selector |
| EU1 (datadoghq.eu) | Shown after selecting EU1 in the site selector |

### 3. Add Datadog MCP to QuilrAI

1. In QuilrAI, go to **MCP Gateway** and click **Add MCP**.
2. Paste the Datadog MCP endpoint URL you copied above.
3. Authorize when prompted — Datadog's OAuth flow opens and asks you to approve access.
4. After authorization, QuilrAI connects and fetches available tools.

## Required Datadog Permissions

The Datadog user authorizing the connection needs:

- **`mcp_read`** — allows read-only tool use (metrics, logs, dashboards, monitors).
- **`mcp_write`** — required for tools that create or update Datadog resources.

Grant only the roles your agents actually need.

## Toolset Query Parameters

You can append query parameters to the MCP endpoint URL to control which tools are available:

| Parameter | Example | Effect |
|-----------|---------|--------|
| `toolsets` | `?toolsets=apm,llmobs` | Enable only the listed toolsets |
| `omit_tools` | `?omit_tools=create_monitor` | Remove specific tools |
| `toolsets=all` | `?toolsets=all` | Enable all generally available toolsets |

Restricting toolsets reduces context window usage and limits blast radius for write-capable tools.

## References

- [Datadog: MCP Server Setup](https://docs.datadoghq.com/mcp_server/setup/)
- [Datadog: MCP Server Overview](https://docs.datadoghq.com/mcp_server/)
