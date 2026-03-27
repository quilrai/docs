---
sidebar_position: 6
---

# API Tokens

Generate and manage Bearer tokens for programmatic MCP access.

## Overview

API tokens provide programmatic access to MCP servers that don't use OAuth. Each token is scoped to an agent and must be sent as `Authorization: Bearer <token>` along with a `mcpuser: user@email.com` header identifying the end user.

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

## Security

- Tokens are displayed **only once** at creation - copy and store them securely
- Revoke any token instantly from the Settings panel
- Each token tracks its last usage timestamp for auditing
- Tokens are scoped to a specific agent - a token created for OpenAI cannot be used by Claude
