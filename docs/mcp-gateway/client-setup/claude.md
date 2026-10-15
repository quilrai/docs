---
sidebar_position: 5
sidebar_label: "Claude and Claude Code"
sidebar_custom_props:
  icon: MessageSquareText
description: "Administrator setup for Quilr MCP Gateway in Claude web, Desktop, and Claude Code, including OAuth registration, managed configuration, network requirements, and rollout checks."
---

# Claude and Claude Code

Connect Claude to the **Quilr gateway URL** copied from your dashboard. This guide covers hosted Claude custom connectors and a separately configured Claude Code HTTP connection. Use the [client overview](./overview) to choose an endpoint and the [authentication reference](./authentication) for the gateway's supported flows.

Official client documentation checked **15 October 2026**. These instructions combine the documented client setup with Quilr's implementation; they are not a record of a live customer interoperability test. Complete the pilot checks below before a broad rollout.

## Administrator handoff

Give the person configuring Claude these values:

| Item | Value to provide |
| --- | --- |
| Display name | For example, `Quilr OneMCP` |
| Server URL | Exact HTTPS URL from Quilr, including its full path |
| Shared deployment | `https://mcpgateway.quilr.ai` |
| Customer deployment | Exact assigned hostname under `quilrai.com`; never enter `*.quilrai.com` as a server URL |
| Tenant OneMCP path | `/quilrone/<quilr-tenant-id>/mcp` |
| Dashboard OneMCP alternative | `/quilrone/mcp`, when this is the URL Quilr supplies |
| Single-server path | `/<backend-id>/mcp` |
| Transport | Streamable HTTP |
| Recommended gateway authentication | Interactive OAuth with automatic client registration |
| OAuth client secret | None for the gateway's public DCR client |
| Sign-in identity | The user's authorized company account |
| Support details | Quilr tenant ID, endpoint owner, approved upstream connectors, permitted tools, and pilot users |

Copy the whole endpoint. Do not substitute a Microsoft Entra tenant ID for the Quilr tenant ID or guess a backend ID from its display name. Keep the same hostname throughout discovery and sign-in. Upstream connector client secrets belong in Quilr's provider configuration and are not Claude credentials.

## Claude web and Desktop

### Access and organization setup

Custom connectors support Free (one connector), Pro, Max, Team, and Enterprise. Team requires an Owner/Primary Owner; Enterprise also allows a custom role with **Manage access to Libraries**. Members connect individually. [Anthropic custom connector guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).

1. For Team or Enterprise, open **Organization settings > Connectors > Add > Custom > Web**. For an individual account, open **Customize > Connectors** and add a custom connector.
2. Enter `Quilr OneMCP` and the supplied gateway endpoint.
3. Review detected authentication. Select **Sign in now** and OAuth client **Register automatically**.
4. Add the connector. Members open **Customize > Connectors**, select it, and click **Connect**.
5. Complete company sign-in. Enable the connector in the conversation through **+ > Connectors**. [Anthropic setup instructions](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).

**Register automatically** selects the DCR path used by this Quilr configuration. Claude also offers its published client identity and a customer-supplied OAuth client. Do not switch to either merely because it appears recommended in Claude's generic dialog; compatibility of those alternatives with the deployed Quilr endpoint needs separate confirmation.

Do not select **No sign in** for OneMCP, paste a gateway API token into the URL, or enter an upstream application's secret. If Claude demands a secret, check that you selected automatic registration and the correct endpoint before changing authentication.

### Network and Desktop distinctions

Remote connectors call from Anthropic's cloud, including Desktop and Cowork. Employee VPN access does not establish reachability. `claude_desktop_config.json` is for local servers; do not paste the remote HTTP example into it. [Anthropic network requirements](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).

Allow the exact gateway host and its OAuth discovery, registration, authorization, and token routes through the deployment's network controls. Consult Anthropic's linked IP reference instead of freezing an address range into a rollout checklist. Both the MCP host and discovered authorization server must be reachable. [Anthropic authentication and network reference](https://claude.com/docs/connectors/building/authentication).

Web and Desktop remain the primary setup path for custom connectors. Anthropic also documents mobile connector availability, with mobile installation in beta; pilot mobile separately if employees need it. [Connector availability](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities).

### OAuth and session behavior

The hosted Claude callback is `https://claude.ai/api/mcp/auth_callback`. Claude Code instead uses a local callback. If redirect policies are enforced, confirm the applicable callback from the actual authorization request. Claude requires a `401` challenge for discovery and expects the protected resource metadata to match the server URL. Its token exchange uses form-encoded data, whereas registration uses JSON. [Anthropic OAuth requirements](https://claude.com/docs/connectors/building/authentication).

Quilr's OneMCP flow does not issue a downstream refresh token. Do not promise that Claude can renew a revoked or invalid gateway token silently. Reconnect and complete interactive sign-in when necessary. Upstream token refresh handled by Quilr is a separate operation.

This guide does not configure Anthropic's Enterprise Managed Auth extension or assert support for it in Quilr. Organization-wide connector availability does not remove the per-user sign-in requirement in this setup.

## Claude Code

### Add the HTTP server

Use the exact dashboard URL in place of the example. `--scope user` makes this definition available to the current user across projects:

```bash
claude mcp add --transport http --scope user quilr-onemcp \
  'https://mcpgateway.quilr.ai/quilrone/<quilr-tenant-id>/mcp'
```

Run Claude Code and enter `/mcp`, select `quilr-onemcp`, and authenticate in the browser. Then inspect the saved definition and connection:

```bash
claude mcp get quilr-onemcp
claude mcp list
```

HTTP setup and the interactive authentication flow are covered in the [Claude Code MCP quickstart](https://code.claude.com/docs/en/mcp-quickstart). A successful add only saves configuration; it does not prove sign-in or a tool call succeeded.

Current Claude Code also supports `claude mcp login quilr-onemcp` from the terminal and `claude mcp logout quilr-onemcp` to clear stored credentials. If an older installed release lacks these commands, use `/mcp`. Do not supply `--client-secret` for Quilr's public-client DCR flow. [Claude Code authentication reference](https://code.claude.com/docs/en/mcp#authenticate-with-remote-mcp-servers).

### Choose the configuration scope

| Scope | Administrative use |
| --- | --- |
| `local` | Default: private to one user and project, stored in `~/.claude.json` |
| `user` | One user's definition across projects |
| `project` | Shared `.mcp.json` in the project root; users approve it in interactive sessions |

A project definition contains the endpoint, not users' tokens:

```json
{
  "mcpServers": {
    "quilr-onemcp": {
      "type": "http",
      "url": "https://mcpgateway.quilr.ai/quilrone/<quilr-tenant-id>/mcp"
    }
  }
}
```

Include `"type": "http"`; a URL alone is insufficient in Claude Code. Keep only the intended definition if the same server name appears in multiple scopes. [Claude Code scopes and configuration](https://code.claude.com/docs/en/mcp#mcp-installation-scopes).

### Managed rollout

Use the same JSON shape for a centrally deployed `managed-mcp.json`:

| Operating system | Managed file |
| --- | --- |
| macOS | `/Library/Application Support/ClaudeCode/managed-mcp.json` |
| Linux / WSL | `/etc/claude-code/managed-mcp.json` |
| Windows | `C:\Program Files\ClaudeCode\managed-mcp.json` |

This imposes an exclusive server configuration with documented exceptions, including host-provided in-process servers and managed additions. It can suppress users' other servers and connectors. Review those effects before deploying it. Distribute the endpoint through device management and let each user complete OAuth; never distribute an administrator's session token. [Managed MCP configuration](https://code.claude.com/docs/en/managed-mcp).

For additive deployment, current Claude Code provides `managedMcpServers` in managed settings, requiring version 2.1.259 or later. Its object format differs from Claude Desktop's setting of the same name. `allowedMcpServers` and `deniedMcpServers` support separate policy controls; an enforced allowlist also needs `allowManagedMcpServersOnly`. Consult the [managed MCP reference](https://code.claude.com/docs/en/managed-mcp) for policy precedence and session-specific exceptions.

Pilot the exact Claude Code release and launch surface you will distribute. A workstation CLI definition and a connector supplied by the Desktop app can be governed differently. Inspect `claude mcp list` and `/mcp` on a managed employee account before assuming policy took effect.

## Pilot acceptance checks

Use an ordinary employee account, an approved read-only tool, and a record the employee is allowed to access.

1. Confirm Claude reports the connector connected, or Claude Code reports a healthy server after OAuth.
2. Inspect available tools. OneMCP's dynamic mode can advertise routing tools such as `list_mcp_connections`, `find_relevant_tools`, and `call_tool`; it need not expose every upstream tool as a separate Claude tool.
3. Ask: **List my available Quilr MCP connections. Do not modify anything.**
4. If the selected upstream connection requires sign-in, complete it in Quilr. This is separate from signing Claude into the gateway.
5. Ask for one authorized read operation and verify the returned record. Confirm the matching gateway event has the expected user, client, backend, and outcome.
6. Check a second employee with different access. Confirm the visible connections and results follow that employee's permissions.
7. Restart the client, repeat the read, then test disconnect/reconnect. Record client version, host, tenant, timestamp, and result.

Checking connection status, advertised tools, and a real tool invocation follows Anthropic's [connector testing guidance](https://claude.com/docs/connectors/building/testing). These checks establish readiness for your deployment; successful discovery alone does not.

## Troubleshooting

| Symptom | Administrator checks |
| --- | --- |
| Add custom connector is unavailable | Verify the account plan, active organization, and connector-management role. |
| Works in a laptop browser but Claude cannot connect | Check cloud-origin reachability, TLS, firewall rules, and whether a WAF replaces discovery JSON or a `401` challenge with an HTML page. |
| Claude asks for an OAuth client secret | Confirm automatic registration, the full endpoint path, and the discovered authentication metadata. Do not use upstream provider secrets. |
| Authorization starts but does not return | Compare the actual callback and public host with deployment redirect policies; retain the timestamp and error for support. |
| Connected but no expected upstream tools | Check OneMCP dynamic mode, user upstream connection status, Quilr Allowed Agents, server access, and tool visibility. |
| Claude Code server exists only in one repository | Inspect the scope; default `local` is project-specific. |
| Shared `.mcp.json` is pending approval | Run Claude Code interactively in the project and review its trust and server prompts. |
| Managed rollout removes other servers | Review exclusive `managed-mcp.json` behavior and whether additive managed settings fit the intended policy. |
| Previously connected account now needs authentication | Reconnect interactively and check token revocation; do not assume a refresh token exists. |

For the shared diagnostic procedure and support evidence, see [Troubleshooting](./troubleshooting). Provide sanitized errors and timestamps, never access tokens, browser cookies, or authorization codes.
