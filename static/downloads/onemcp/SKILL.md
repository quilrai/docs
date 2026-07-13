---
name: quilr-onemcp
description: Discover and call MCP tools through Quilr OneMCP. Use whenever a task needs external data or actions and MCP tools are provided by Quilr OneMCP (find_relevant_tools, call_tool, list_mcp_connections), including connecting or reconnecting MCPs and managing durable user memories.
---

# Quilr OneMCP

Quilr OneMCP is a gateway that exposes many MCP tools through a compact discovery layer instead of listing every tool up front. Use its tools for anything that needs external data or actions.

## Flow

1. Call `find_relevant_tools` with a short description of the task before concluding a capability is unavailable. A call with no query returns the available MCP groups and their connection state.
2. Call `call_tool` with the exact tool name and arguments returned by the search.
3. If a tool reports it needs authentication or a connection, call `list_mcp_connections` so the user can connect or reconnect, then retry the original request.
4. Use `save_or_update_memories` and `search_memories` to store and recall durable user context; use `delete_memories` to remove memories the user owns.

## Rules

- Only act on results returned by `call_tool`. Never invent tool output.
- Prefer discovery over guessing: if you are unsure whether a capability exists, search first.
- Treat connection links surfaced by `list_mcp_connections` as sensitive and let the user complete any provider flow.
