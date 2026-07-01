---
sidebar_position: 4
sidebar_custom_props:
  icon: Network
---

# OneMCP

OneMCP exposes the MCPs a user is allowed to access through one endpoint. Agents can discover MCP groups, find relevant tools, call tools, and use native memory tools without connecting to each backend separately.

## Endpoint

For most environments, the OneMCP base domain is one of:

```text
https://mcpgateway.quilr.ai
https://mcpgateway.quilrai.com
```

The base domain may vary by environment. Copy the full OneMCP URL from the self-service user dashboard for MCPs before configuring an AI client.

```text
https://<base-domain>/quilrone/mcp
```

For example:

```text
https://mcpgateway.quilr.ai/quilrone/mcp
https://mcpgateway.quilrai.com/quilrone/mcp
```

OneMCP accepts gateway-issued OneMCP OAuth proxy tokens.

## Smart Tools

When smart mode is enabled, OneMCP returns a compact set of gateway tools:

| Tool | Purpose |
|------|---------|
| `list_tool_groups` | Lists MCP tool groups available to the user and includes connection status metadata. Call this first. |
| `list_mcp_connections` | Lists all visible MCPs with `connected`, `connect_required`, `auth_status`, and `connect_url` fields. |
| `find_relevant_tools` | Searches within one tool group and returns matching backend tools. |
| `call_tool` | Calls a tool returned by `find_relevant_tools`. |

The usual flow is:

1. Call `list_tool_groups`.
2. Pick a `tool_group`.
3. Call `find_relevant_tools` with a short task description.
4. Call `call_tool` with the selected tool name and arguments.

## Native Memory Tools

OneMCP includes native memory tools for user-scoped context:

| Tool | Purpose |
|------|---------|
| `save_or_update_memories` | Creates or updates one or more memories. Owned memories can be updated by `id`; when no `id` is provided, the user's owned memory with the same title is updated. |
| `search_memories` | Searches memories visible to the user by query, id, tag, source, or batch query. Returns metadata and snippets by default. |
| `delete_memories` | Deletes one or more memories owned by the user. Shared memories cannot be deleted by non-owners. |

Memory records are scoped to the current user. Each memory can include:

| Field | Description |
|-------|-------------|
| `title` | Required name for the memory. Titles are unique per user. |
| `content` | Free-form memory text. |
| `tags` | String labels for filtering. |
| `source` | Optional source identifier. |
| `expires_at` | Optional ISO-8601 expiration timestamp. Expired memories are not returned by normal OneMCP search. |
| `shared_with` | Optional read/write ACL for users or smart groups. |

Example:

```json
{
  "title": "Preferred CRM account",
  "content": "Use Acme Corp's enterprise account when creating sales reports.",
  "tags": ["crm", "sales"],
  "source": "user"
}
```

## Inline OAuth Recovery

OneMCP can show OAuth-protected MCPs before the current user has connected them. Discovery responses include connection metadata so the agent can guide the user through authorization instead of hiding the MCP.

When a user is missing an upstream OAuth connection:

- `list_tool_groups` and `list_mcp_connections` include `_meta.quilr.oauth_connect_required_mcps`.
- Each entry includes `backend_id`, `backend_name`, `tool_group`, `auth_status`, `connect_required`, `connect_url`, and `connect_url_expires_at`.
- `tools/call` returns a tool-visible `isError: true` result with a connect URL when the selected MCP needs authorization.

The user opens the connect URL, completes the upstream provider authorization, returns to the AI client, and retries the same request. The gateway stores the upstream token for that user and uses it on later OneMCP calls.

## Visibility Rules

OneMCP shows MCPs that are available to the user by organization policy, user preferences, and agent access controls. It does not include OAuth passthrough MCPs, because passthrough clients must own the upstream OAuth flow and provide the upstream bearer token directly to the per-MCP endpoint.

## Operational Notes

- Connect URLs are short-lived and should be treated as sensitive links.
- If an OAuth MCP requires manual client credentials and none are configured, the connect flow cannot complete until an admin adds those credentials.
- OneMCP `GET` streams and `DELETE` session termination are not supported; use `POST` JSON-RPC requests.
