# Copilot instructions

## Quilr OneMCP tool usage

You have access to Quilr OneMCP, a gateway that exposes MCP tools through a discovery layer. For anything that needs external data or actions, use these tools instead of guessing:

1. If a listed tool fits the task (for example a server's most-used tools, named `<server>_<tool>`), call it directly. Otherwise call `find_relevant_tools` with a short description of the task before concluding a capability is unavailable.
2. Call `call_tool` with the exact tool name and arguments returned by the search.
3. If a tool reports it needs authentication or a connection, call `list_mcp_connections` so the user can connect or reconnect, then retry the request.
4. Use `save_or_update_memories` and `search_memories` to store and recall durable user context.

Only act on results returned by these tools. Never invent tool output.
