---
title: "ChatGPT and Codex"
sidebar_label: "ChatGPT and Codex"
sidebar_position: 7
sidebar_custom_props:
  icon: Sparkles
description: "Connect ChatGPT hosted MCP integrations and Codex local clients to Quilr, with separate admin controls and OAuth validation."
---

# ChatGPT and Codex

Choose the runtime before configuring access. A hosted ChatGPT custom MCP integration and a local Codex MCP server definition are separate setup paths. Use the exact dashboard URL on `https://mcpgateway.quilr.ai` or your assigned `quilrai.com` hostname.

**Documentation checked: 15 October 2026.** OpenAI product names and administration surfaces evolve. Follow the current official links if a menu has moved, and complete a deployment-specific pilot. This page does not claim a live interoperability test.

## ChatGPT hosted custom MCP integration

The current official flow starts at [ChatGPT Plugins](https://chatgpt.com/plugins): select **+ > Add custom MCP server**, enter a name and description, choose the public endpoint connection, configure authentication, then **Create as a plugin**. Review the discovered tools, install the result, and select it with `@` in a new conversation. Account and workspace policies control availability. [OpenAI connection and testing guide](https://developers.openai.com/plugins/deploy/connect-chatgpt).

| Field | Quilr configuration |
| --- | --- |
| Name | `Quilr OneMCP` |
| Description | The approved business tasks provided by your configured MCPs |
| Connection | Public HTTPS endpoint for an externally reachable deployment |
| Server URL | Dashboard-provided full URL, for example `https://mcpgateway.quilr.ai/quilrone/mcp` |
| Authentication | OAuth using gateway discovery and dynamic registration |
| Client ID / secret | Let DCR supply the public client ID; no OneMCP client secret is issued |

For a tenant-scoped deployment, use the supplied `/quilrone/<quilr-tenant-id>/mcp` path. The Quilr tenant identifier is not the ChatGPT workspace ID. Complete user sign-in and then connect any upstream services that require personal authorization.

### Workspace administrator tasks

1. Confirm that the intended workspace allows adding and using a custom MCP integration. If the add action is missing, resolve the account role/workspace policy through the current OpenAI administration documentation.
2. Use a pilot audience and approved tool set. A descriptive name does not restrict access; configure the actual permissions in Quilr.
3. Confirm that the hosted runtime can reach the gateway's public HTTPS endpoint and OAuth metadata. A private corporate browser route is not enough.
4. Test fresh authentication and a read-only operation with two different users. Verify their separate identities in gateway logs.
5. Review write-tool confirmation behavior and any workspace distribution controls before wider sharing.

OpenAI also documents Secure MCP Tunnel for private servers. That is a separate networking integration, not something this guide configures or verifies. An externally reachable Quilr deployment does not require a tunnel. [OpenAI endpoint requirements](https://developers.openai.com/plugins/deploy/connect-chatgpt).

### Refresh and connection recovery

After tool descriptions, schemas, authentication, or UI resources change, refresh the custom server connection, inspect the new metadata, and retest in a new conversation. Published plugins have a separate review/update lifecycle. [OpenAI metadata refresh](https://developers.openai.com/plugins/deploy/connect-chatgpt).

Quilr OneMCP does not issue downstream refresh tokens, signed ID tokens, or confidential-client secrets. Do not add `offline_access` or invent a refresh URL to resolve a required-field error. If the workspace's integration flow insists on unsupported authentication properties, stop the rollout and review compatibility with the gateway operator. The [authentication reference](./authentication) distinguishes actual behavior from advertised metadata.

## Codex CLI and local clients

Codex supports Streamable HTTP with OAuth and stores server definitions in `~/.codex/config.toml`, or `.codex/config.toml` for a trusted project. Local clients on the same Codex host share this configuration; do not assume a separate cloud host has inherited it. [OpenAI MCP configuration](https://developers.openai.com/codex/mcp).

Add this table to the existing file:

```toml
[mcp_servers.quilr_onemcp]
url = "https://mcpgateway.quilr.ai/quilrone/mcp"
```

Or use the CLI with your assigned endpoint:

```bash
codex mcp add quilr_onemcp --url 'https://mcpgateway.quilr.ai/quilrone/mcp'
codex mcp login quilr_onemcp
codex mcp list
```

Complete the browser sign-in, then use `/mcp` in the terminal UI to inspect active servers. A saved definition does not establish authentication or tool access. [OpenAI MCP guide](https://developers.openai.com/codex/mcp).

Current Codex chooses registration based on server metadata. If you need to explicitly test the gateway's DCR path and your installed version supports the option:

```bash
codex mcp login quilr_onemcp --oauth-client-registration dcr
```

Do not configure `auth = "chatgpt"` for Quilr; that mode targets trusted first-party session authentication. For static client registration, Codex shows the actual callback to register. Use the callback emitted by the installed client rather than guessing a fixed port. [OpenAI OAuth configuration](https://developers.openai.com/codex/mcp).

### Administrative controls

Distribute only the server definition. Keep each user's credentials local to their authentication flow. Review managed configuration and server/tool restrictions for the deployed Codex host. Client-side tool selection and approval controls do not replace Quilr's server and tool authorization.

When adding an enabled-tool allowlist, account for OneMCP dynamic mode: allowing `call_tool` is not a per-backend authorization policy. Restrict the underlying servers/tools in Quilr and validate the resulting access as an ordinary user.

### Direct non-OAuth backend with an API token

For an eligible direct backend, use an environment-backed bearer token and the required identity header:

```toml
[mcp_servers.quilr_direct]
url = "https://mcpgateway.quilr.ai/<backend-id>/mcp"
bearer_token_env_var = "QUILR_MCP_TOKEN"
http_headers = { "mcpuser" = "employee@customer.example" }
```

Codex documents these HTTP configuration keys in its [MCP reference](https://developers.openai.com/codex/mcp). Supply the environment variable through your approved secret mechanism to the process running Codex. Replace the backend ID and email; issue the token for the actual client identity. Do not use this configuration for OneMCP or paste an upstream API key into the bearer variable.

## Acceptance and troubleshooting

Use the [shared checks](./troubleshooting) to verify tool discovery, read-only execution, employee attribution, denied access, and restart/reconnect. Include the exact product surface and runtime in your test record.

| Symptom | Administrator action |
| --- | --- |
| ChatGPT custom MCP action unavailable | Check active workspace, role, policy, and current OpenAI UI instructions |
| Hosted integration cannot reach gateway | Check external HTTPS reachability and authentication endpoints from the vendor runtime |
| Codex server exists but is unauthenticated | Run `codex mcp login`, inspect its error and the gateway discovery response |
| One local client sees a server but another does not | Check host, user, configuration scope, project trust, and managed restrictions |
| Browser login succeeds but tools fail | Check gateway policy, actual client identity, user upstream credentials and OneMCP discovery mode |
| Secret, refresh, PKCE, or ID-token requirement blocks connection | Compare against the gateway compatibility limits; escalate rather than fabricate values |
| Tools remain stale after changes | Refresh the custom integration or reload the local connection and start a new conversation |

See [administrator checklist](./overview) for rollout ownership and [authentication](./authentication) for issuer and UserInfo fields.
