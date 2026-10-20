---
title: GitHub Copilot
sidebar_label: GitHub Copilot
sidebar_position: 3
sidebar_custom_props:
  icon: Bot
description: "Configure Quilr MCP Gateway for GitHub Copilot in VS Code, Copilot CLI, and repository cloud agents, with administrator authentication and rollout checks."
---

# GitHub Copilot

Replace `<YOUR_MCP_BASE_URL>` in the examples with your deployment's HTTPS base URL, without a trailing slash. This can be `https://mcpgateway.quilr.ai`, `https://mcpgateway.quilrai.com`, or another exact hostname assigned under `quilrai.com`. Copy the base from your Quilr dashboard; the placeholder includes `https://`.

Use browser OAuth for interactive Copilot clients connecting to OneMCP. GitHub's repository cloud agent and code review require a separate token-based setup. These are different clients with different configuration and authentication capabilities.

**Documentation checked: October 15, 2026.** This guide combines the gateway's documented behavior with official client documentation. Complete the pilot below against your assigned deployment before organization-wide rollout; these instructions are not a live interoperability certification.

## Administrator preparation

Get the exact MCP URL from the Quilr dashboard and substitute its base URL in the examples below.

| Required item | Administrator action |
|---|---|
| Interactive endpoint | Use `<YOUR_MCP_BASE_URL>/quilrone/mcp`, after substituting your deployment base URL. |
| Individual connector | Use `<YOUR_MCP_BASE_URL>/<backend-id>/mcp` for a single MCP. Copy the backend ID rather than inferring it from a display name. |
| Quilr permissions | Permit the pilot users and actual client under server access control and Allowed Agents. Complete upstream connections for the pilot account. |
| Network | Allow HTTPS from the runtime running MCP and from the browser used for sign-in to the assigned gateway and its advertised authentication endpoints. A successful browser visit alone does not prove a remote development environment can connect. |
| Client entitlement | Confirm users can use the chosen Copilot product and that organization/enterprise MCP policies allow the gateway. |

See [client overview](./overview) and [authentication](./authentication) for endpoint selection, token types, and upstream credentials. A GitHub PAT used to sign in to Copilot is not a Quilr gateway credential.

## Copilot in VS Code

### Add the gateway

1. Open a trusted workspace in a current supported VS Code installation with Copilot enabled.
2. Run **MCP: Add Server** from the Command Palette, select HTTP, paste the gateway MCP URL, and name the server `quilr-onemcp`.
3. Select user configuration for personal access or workspace configuration for a reviewed team setup. The equivalent workspace file is `.vscode/mcp.json`:

```json
{
  "servers": {
    "quilr-onemcp": {
      "type": "http",
      "url": "<YOUR_MCP_BASE_URL>/quilrone/mcp"
    }
  }
}
```

Replace `<YOUR_MCP_BASE_URL>` before saving. Merge this entry into an existing file instead of replacing unrelated servers. The VS Code format uses `servers`; portable Copilot configurations use `mcpServers`. [Configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).

4. Run **MCP: List Servers**, choose `quilr-onemcp`, and start it. Review any trust prompt.
5. Complete browser sign-in with the permitted company identity.
6. Open an agent chat with tools enabled, confirm the Quilr tools are available, and run the pilot checks below. [Server management](https://code.visualstudio.com/docs/agent-customization/mcp-servers).

### Authentication fields

For the normal OneMCP discovery flow, supply only the MCP URL. VS Code supports OAuth discovery and dynamic client registration. The client obtains the registration details and opens a browser for authorization. [VS Code authorization](https://code.visualstudio.com/api/extension-guides/ai/mcp#authorization).

OneMCP registration returns a public client with no client secret. Do not put an upstream Microsoft, Salesforce, or other connector's client secret into `mcp.json`. Do not enable an enterprise-managed identity assertion setting simply because the user's company uses Entra: that is a different protocol and requires separately confirmed server support.

### Optional direct-backend API-token configuration

Use this only when the gateway administrator has created an API token for an eligible non-OAuth/static-key MCP. This example does **not** work for OneMCP:

```json
{
  "servers": {
    "quilr-direct": {
      "type": "http",
      "url": "<YOUR_MCP_BASE_URL>/<backend-id>/mcp",
      "headers": {
        "Authorization": "Bearer ${input:quilr-api-token}",
        "mcpuser": "user@company.com"
      }
    }
  },
  "inputs": [
    {
      "id": "quilr-api-token",
      "type": "promptString",
      "description": "Quilr API token for this MCP",
      "password": true
    }
  ]
}
```

The `mcpuser` value must identify an allowed company user. The token and header are both required for this gateway path. Input prompts avoid committing the token to a repository. VS Code's Copilot harness forwarding excludes servers requiring interactive `${input:...}` values; validate the exact session/harness you use. [VS Code configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).

## Copilot CLI

Add a remote HTTP server from a terminal:

```bash
copilot mcp add --transport http quilr-onemcp \
  '<YOUR_MCP_BASE_URL>/quilrone/mcp'
```

After confirming the gateway hostname, launch `copilot` and inspect `/mcp`. If sign-in is required, run:

```text
/mcp auth quilr-onemcp
```

Finish the browser flow. `/mcp show quilr-onemcp` shows server status and tools. User configuration normally lives at `~/.copilot/mcp-config.json`; the CLI does not read `.vscode/mcp.json`. Its JSON format uses `mcpServers`. Organization registry and allowlist policies also apply to the CLI. [Adding CLI servers](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers).

For a `needs-auth` status, `/mcp auth quilr-onemcp` starts a fresh OAuth flow and reconnects. The CLI also documents a headless `client_credentials` mode, but current OneMCP supports authorization-code exchange, not that grant. Do not configure it for unattended OneMCP access. [CLI authentication reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#oauth-re-authentication).

## GitHub cloud agent and code review

GitHub currently excludes remote MCP OAuth from these repository features. Use a direct endpoint backed by an eligible gateway API token; OneMCP is not an API-token endpoint. Repository administrators configure **Settings > Copilot > MCP servers**. Enable an explicit tool allowlist because the agent can invoke tools without asking first. Code review additionally requires `annotations.readOnlyHint: true` in each tool's definition. [Repository MCP setup](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers).

Example template:

```json
{
  "mcpServers": {
    "quilr-direct": {
      "type": "http",
      "url": "<YOUR_MCP_BASE_URL>/<backend-id>/mcp",
      "headers": {
        "Authorization": "Bearer ${COPILOT_MCP_QUILR_TOKEN}",
        "mcpuser": "${COPILOT_MCP_QUILR_USER}"
      },
      "tools": ["REPLACE_WITH_APPROVED_READ_ONLY_TOOL"]
    }
  }
}
```

Create an Agents secret named `COPILOT_MCP_QUILR_TOKEN` and an Agents variable or secret named `COPILOT_MCP_QUILR_USER`. Replace the backend ID, host, and tool name before saving the repository configuration. GitHub only exposes names prefixed `COPILOT_MCP_` to this configuration. [Secret substitution and validation](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers).

For Quilr, use an explicitly approved automation identity and record its owner. This is a shared configured identity; it does not become each pull-request author's identity. Verify the token is scoped to the intended agent and backend, and that the email is allowed. If the server requires OAuth and cannot issue an API token, do not copy a browser token into a long-lived repository secret as a workaround; this integration needs an approved non-interactive authentication design.

## Pilot and acceptance checks

1. Connect as a normal allowed user, not only as a gateway administrator.
2. Verify the gateway audit records show the expected tenant, backend, user, and client.
3. List tools. OneMCP dynamic mode may expose router tools such as `list_mcp_connections`, `find_relevant_tools`, and `call_tool`; a short list does not necessarily mean upstream tools are missing. Servers with [tool lists](../protect/tool-lists) on also send only their most-used tools, with the rest one search away.
4. Perform one approved read-only operation against a test record the user is allowed to access. Verify its result against the upstream service.
5. Test a user without access and confirm rejection. Confirm an unapproved tool is unavailable or blocked.
6. Reconnect after restarting the client. Exercise token revocation and recovery in the pilot before documenting an operational procedure.
7. Record the client version, gateway deployment, configuration scope, test identity, expected tool names, and evidence. Repeat for each runtime, including remote development and repository cloud agents when used.

## Troubleshooting and removal

| Symptom | First checks |
|---|---|
| VS Code server missing | Confirm `.vscode/mcp.json` uses `servers`; check the active profile, workspace, and remote configuration. |
| CLI server missing | Confirm the CLI configuration uses `mcpServers`; inspect `/mcp` and enterprise allowlist restrictions. |
| No browser sign-in | Inspect the initial `401` and discovery metadata using [authentication checks](./authentication). Check the assigned host and browser popup restrictions. |
| Sign-in succeeds, tool call denied | Check Quilr Allowed Agents, user/group access, and the user's upstream connection. |
| Empty or stale tools | Reconnect; in VS Code use **MCP: Reset Cached Tools**. Check gateway visibility rules and OneMCP dynamic mode. |
| Repository cloud agent cannot connect to OneMCP | Remote OAuth is unsupported there. Use the eligible direct-backend setup above. |
| Code review omits a listed tool | Check the tool allowlist and the upstream tool's `readOnlyHint` annotation. |
| Token example gets `401` | Confirm this is a direct backend, the correct API token, and both required headers. |

Use **MCP: List Servers > Show Output** for VS Code diagnostics. Remove or disable the configuration when retiring access, and revoke the associated gateway credential as appropriate; removing a JSON entry alone does not revoke a credential. See [shared troubleshooting](./troubleshooting).
