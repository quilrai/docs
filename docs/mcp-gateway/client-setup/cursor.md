---
title: "Cursor"
sidebar_label: "Cursor"
sidebar_position: 6
sidebar_custom_props:
  icon: PenTool
description: "Configure Cursor with Quilr OneMCP, distribute the endpoint, apply enterprise controls, and verify user authentication."
---

# Cursor

Replace `<YOUR_MCP_BASE_URL>` in the examples with your deployment's HTTPS base URL, without a trailing slash. This can be `https://mcpgateway.quilr.ai`, `https://mcpgateway.quilrai.com`, or another exact hostname assigned under `quilrai.com`. Copy the base from your Quilr dashboard; the placeholder includes `https://`.

Use `<YOUR_MCP_BASE_URL>/quilrone/mcp` for OneMCP. Confirm the [administrator checklist](./overview) before rollout.

**Documentation checked: 15 October 2026.** Validate this setup against your client version and deployment; the guide does not represent a completed live connection test.

## Add the server

Cursor supports remote Streamable HTTP and OAuth. Use `.cursor/mcp.json` for a project or `~/.cursor/mcp.json` for the user. Merge this entry into any existing configuration. [Cursor MCP reference](https://cursor.com/docs/mcp).

```json
{
  "mcpServers": {
    "quilr-onemcp": {
      "url": "<YOUR_MCP_BASE_URL>/quilrone/mcp"
    }
  }
}
```

Use `/quilrone/mcp` on your assigned gateway hostname. Quilr resolves the organization from the signed-in account. For one server use its direct gateway URL. Keep the endpoint and OAuth issuer from the same deployment.

Open **Customize**, enable the server, and complete the offered OAuth sign-in. Review the available tools and approvals before using them. [Cursor server management](https://cursor.com/docs/mcp).

For Quilr OneMCP, begin with the URL-only configuration so the client discovers registration. Do not add an `auth.CLIENT_SECRET` or copy an upstream provider's credentials into this file. Gateway DCR returns a public client without a secret. See [authentication](./authentication) for current protocol and token-lifecycle limitations.

## Administrator distribution and restrictions

Cursor distinguishes distribution from policy. Team servers are managed in **Dashboard > Plugins & MCPs**; existing team servers can be linked to a team marketplace. Enterprise MCP allowlists are configured in **Team Settings > MCP Configuration**. URL entries approve remote endpoints; allowing one does not install it. [Cursor enterprise controls](https://cursor.com/docs/mcp#enterprise-admin-controls).

For a Quilr rollout:

1. Distribute the exact approved URL, never an administrator's token or personal connection.
2. Set the enterprise URL rule to match that endpoint. Match `/quilrone/mcp` for OneMCP or the exact backend path for a direct server.
3. Allow the actual Cursor runtime under Quilr Allowed Agents and configure the permitted user groups and tools.
4. Have users authenticate with their own company accounts and connect required upstream services.
5. Validate IDE, CLI, and cloud runtimes separately if the organization enables them. Endpoint distribution alone does not establish credentials or network reachability in each runtime.

Tool auto-run policy controls confirmation behavior in Cursor. Gateway authorization remains responsible for whether the user may access a backend or invoke a tool. Review both layers for write-capable operations.

## Direct API-token option

For an eligible non-OAuth backend only, an administrator can issue a gateway API token and require both `Authorization` and `mcpuser`. Use environment interpolation rather than committing the secret. Cursor supports `${env:NAME}` in headers. [Cursor configuration interpolation](https://cursor.com/docs/mcp#config-interpolation).

```json
{
  "mcpServers": {
    "quilr-direct": {
      "url": "<YOUR_MCP_BASE_URL>/<backend-id>/mcp",
      "headers": {
        "Authorization": "Bearer ${env:QUILR_MCP_TOKEN}",
        "mcpuser": "employee@customer.example"
      }
    }
  }
}
```

Make the variable available to the process launching Cursor through your approved secret-management mechanism. Replace the backend and employee placeholders. The token must be issued for that backend and the matching client identity. This configuration is not valid for OneMCP. The supplied email is trusted caller attribution rather than proof of employee SSO.

## Validate and troubleshoot

Run the [shared validation procedure](./troubleshooting): list connectors, discover a read-only tool, invoke it, and verify employee attribution in gateway logs. Test a second user's visibility and restart/reconnect behavior.

| Symptom | Check |
| --- | --- |
| Server absent | Correct user/project file, valid JSON, managed distribution and enterprise allowlist |
| Sign-in unavailable or loops | Exact URL, discovery response, chosen registration mode, browser return path |
| Server connected but upstream call fails | User's provider connection, Allowed Agents, server/tool access, effective policy |
| Token connection rejected | Direct backend URL, environment variable available to Cursor, allowed `mcpuser` domain, agent binding |
| Tools missing | OneMCP dynamic mode, client catalog refresh, connector visibility |

Removing the local entry stops that client configuration. Revoke the relevant gateway credential or connection separately when access must end.
