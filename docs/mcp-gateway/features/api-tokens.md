---
sidebar_position: 6
sidebar_custom_props:
  icon: KeyRound
---

# API Tokens

Generate and manage Bearer tokens for programmatic MCP access.

## Overview

API tokens provide programmatic access to MCP servers that don't use OAuth. Each token is scoped to an agent and must be sent as `Authorization: Bearer <token>` along with a `mcpuser: user@email.com` header identifying the end user.

API tokens authenticate the client to the gateway. They are separate from upstream MCP credentials. If the upstream MCP needs a fixed API key, an admin configures static upstream auth on the MCP; the gateway injects that upstream secret when forwarding calls.

## Key Features

- **Create named API tokens** for non-OAuth MCPs
- **Assign each token to a specific agent** (OpenAI, Claude, Cursor, or custom)
- **Token shown once at creation** - copy immediately
- **Revoke tokens at any time** from the Settings panel
- **Track last-used date** per token for auditing

## Usage

Include the following headers in every request to the MCP endpoint:

```
Authorization: Bearer <your-api-token>
mcpuser: user@company.com
```

| Header | Purpose |
|--------|---------|
| `Authorization` | Bearer token for authentication |
| `mcpuser` | Identifies the end user for per-user tracking |

## Static Upstream API Keys

Some MCP servers require a fixed upstream credential instead of per-user OAuth. Configure that credential on the MCP, not in the client. The gateway can inject the upstream secret as:

| Placement | Example |
|-----------|---------|
| Bearer token | `Authorization: Bearer <upstream-secret>` |
| Custom header | `x-api-key: <upstream-secret>` |
| Query parameter | `?api_key=<upstream-secret>` |

Client requests still use the gateway API token and `mcpuser` header. Gateway/client auth headers are stripped before the request is sent upstream.

## Security

- Tokens are displayed **only once** at creation - copy and store them securely
- Revoke any token instantly from the Settings panel
- Each token tracks its last usage timestamp for auditing
- Tokens are scoped to a specific agent - a token created for OpenAI cannot be used by Claude
