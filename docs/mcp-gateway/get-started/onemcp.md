---
sidebar_position: 5
sidebar_label: "OneMCP"
sidebar_custom_props:
  icon: Network
description: "Unified OneMCP endpoint, smart discovery tools, native memory tools, and inline authentication through an in-chat connector card or connection-link fallback."
---

# OneMCP

OneMCP exposes the MCPs a user is allowed to access through one endpoint. Agents can discover MCP groups, find relevant tools, call tools, manage per-user connections, and use native memory tools without configuring each service as a separate MCP server.

:::tip
To steer Claude, ChatGPT, or GitHub Copilot to use the discovery flow reliably, see [Agent Custom Instructions](./agent-instructions) for copy-paste text and ready-to-use files.
:::

:::note Running an MCP on your own computer
OneMCP handles remote services and does not choose a computer automatically. To run an administrator-approved Python or Node MCP on a user's own machine, with the same gateway access checks, see [Local MCP](../local-mcp/overview).
:::

<VideoEmbed id="mcp-user-dashboard" />

## Endpoint

For most environments, the OneMCP base domain is one of:

```text
https://mcpgateway.quilr.ai
https://mcpgateway.quilrai.com
```

The base domain may vary by environment. Users copy the full OneMCP URL from the user dashboard at `mcpgateway.quilr.ai` before configuring an AI client.

```text
https://<base-domain>/quilrone/mcp
```

For example:

```text
https://mcpgateway.quilr.ai/quilrone/mcp
https://mcpgateway.quilrai.com/quilrone/mcp
```

OneMCP accepts gateway-issued OneMCP OAuth proxy tokens, which the AI client gets when the user signs in. There is no token to copy. For per-client steps (Cursor, Claude Desktop and Claude.ai, VS Code, Claude Code), see [Connect an AI client](./integration-guide#connect-an-ai-client).

## OneMCP settings

Go to **Settings > AI Gateway > MCP Gateway** and click **OneMCP endpoint**.

![OneMCP dialog with the Dynamic tool calling choices and the Memories enabled switch](/img/mcp-gateway/ui/onemcp-settings.png)

| Setting | Options |
|---------|---------|
| **Dynamic tool calling** | Whether OneMCP narrows the tool list per request (see [Smart Tools](#smart-tools)). **User preference**: each user chooses on their own OneMCP dashboard. **Always on**: on for everyone. **Always off**: off for everyone. |
| **Memories enabled** | Allow OneMCP and workflow agents to store and recall user memories for your organization (see [Native Memory Tools](#native-memory-tools)). |

Changes save as soon as you select them.

## Smart Tools

When dynamic tool calling is on, OneMCP returns a compact set of gateway tools:

| Tool | Purpose |
|------|---------|
| `list_mcp_connections` | Lists visible MCPs and their connection state. In compatible clients, it renders the in-chat connector card. |
| `find_relevant_tools` | Searches across available MCP tool groups and returns matching server tools. A call without a query returns the available groups and their connection state. |
| `call_tool` | Calls a tool returned by `find_relevant_tools`. |
| `quilr_platform_helper` | Tenant administrators only. Queries MCP Gateway usage and discovery data; with no arguments, returns a 7-day overview. |

The usual flow is:

1. Call `find_relevant_tools` with a short task description.
2. Call `call_tool` with the selected tool name and arguments.
3. If the user asks to view, connect, authenticate, or reconnect MCPs, call `list_mcp_connections`.

## Native Memory Tools

OneMCP includes native memory tools for user-scoped context. They are available while **Memories enabled** is on in [OneMCP settings](#onemcp-settings).

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

## Inline Authentication

OneMCP keeps policy-accessible MCPs visible before the current user has connected them. It can guide the user through an upstream OAuth flow or collection of a required per-user API key without making the user leave their AI workflow to find the right MCP settings.

### In-Chat Connector Card

MCP Apps-compatible clients, including ChatGPT, can render an **Available connectors** card directly in the conversation. Ask the client to show available connectors, connect an MCP, or reconnect an MCP. OneMCP routes that request to `list_mcp_connections` and attaches the card.

<StepFlow steps={[
  {
    label: "Show Connectors",
    items: [
      "Ask which MCPs are available",
      "OneMCP checks connection state",
      "Available connectors card opens",
    ],
  },
  {
    label: "Connect",
    items: [
      "Choose Connection needed",
      "Select Connect or Reconnect",
      "Complete provider authentication",
    ],
  },
  {
    label: "Resume",
    items: [
      "Return to the conversation",
      "Card confirms the connection",
      "Retry the original request",
    ],
  },
]} />

The card provides:

- **Connection needed** and **Connected** tabs.
- **Connect** or **Reconnect** actions for each MCP that needs user authentication.
- Connection-status checks after the user returns from the provider flow.
- A **Manage connectors** action that opens the user dashboard for adding or requesting MCPs.

Connection links remain private to the connector card in UI-capable sessions. Other OneMCP tools direct the client to `list_mcp_connections` when authentication is needed.

### Clients Without the Connector Card

- Clients that support URL elicitation can show the connection flow in a host-provided prompt.
- Other clients receive the existing tool error and short-lived connection-link guidance.

After authorization, retry the original request. For OAuth MCPs, the gateway stores and refreshes the upstream token for that user. Per-user API keys are also stored against that user's upstream connection.

## Visibility Rules

OneMCP shows MCPs that are available to the user by organization policy, user preferences, and agent access controls. It does not include OAuth passthrough MCPs, because passthrough clients must manage the upstream OAuth flow and provide the upstream bearer token directly to the per-MCP endpoint.

## Operational Notes

- Connect URLs are short-lived and should be treated as sensitive links.
- If a connect link expires, ask the client to refresh the connector list before trying again.
- If an OAuth MCP requires manual client credentials and none are configured, the connect flow cannot complete until an admin adds those credentials.
- Basic clients use stateless `POST` JSON-RPC requests. Clients that negotiate the richer OneMCP session capabilities can also use the supported event stream and session termination methods.
