---
sidebar_position: 6
sidebar_custom_props:
  icon: MessageSquareText
---

# Agent Custom Instructions

OneMCP exposes many MCP tools through a compact discovery layer (`find_relevant_tools`, `call_tool`, `list_mcp_connections`). Add a short custom instruction so your AI client reliably uses that flow instead of stopping at "I don't have a tool for that."

These instructions steer client behavior. They do not connect OneMCP - an admin still adds the OneMCP endpoint to the client. See [OneMCP](./onemcp) for the discovery flow and the [Integration Guide](./integration-guide) for connection setup.

## The instructions

Paste this block into whichever custom-instruction surface your client supports (see placement below). It is under 10 lines and works the same across clients.

```text
You have access to Quilr OneMCP, a gateway that exposes MCP tools through a discovery layer.
For anything that needs external data or actions, use these tools instead of guessing:
1. Call find_relevant_tools with a short description of the task before concluding a capability is unavailable.
2. Call call_tool with the exact tool name and arguments returned by the search.
3. If a tool reports it needs authentication or a connection, call list_mcp_connections so the user can connect or reconnect, then retry the request.
4. Use save_or_update_memories and search_memories to store and recall durable user context.
Only act on results returned by call_tool. Never invent tool output.
```

## Ready-to-use files

If you prefer not to copy-paste, download the packaged versions:

- [Claude Skill (`SKILL.md`)](pathname:///downloads/onemcp/SKILL.md) or the [ready-to-upload `.zip`](pathname:///downloads/onemcp/quilr-onemcp-skill.zip) for organization provisioning.
- [`copilot-instructions.md`](pathname:///downloads/onemcp/copilot-instructions.md) to drop into a repo's `.github/` folder.

## Where to add it

### Claude

- **Per user:** Settings > Profile custom instructions, or a Project's instructions.
- **Org-wide (Team/Enterprise):** Organization settings > Organization and access > Organization instructions (max 3,000 characters), or provision the [Claude Skill](pathname:///downloads/onemcp/quilr-onemcp-skill.zip) as an organization Skill. Applies to all members and takes precedence over individual user instructions.

### ChatGPT

- **Per user:** Settings > Personalization > Custom instructions, or a Project's instructions.
- **Org-wide:** ChatGPT has no setting that pushes custom instructions to every user's chats. Publish a shared Project or a workspace GPT that carries the text; it applies only inside that Project or GPT.

### GitHub Copilot

- **Per repo (covers the IDE):** add [`.github/copilot-instructions.md`](pathname:///downloads/onemcp/copilot-instructions.md) with the text. Read by Copilot in VS Code, JetBrains, the CLI, and on github.com.
- **Org-wide (Business/Enterprise):** Organization Settings > Copilot > Custom instructions. This covers Copilot Chat on github.com, code review, and the coding agent only. It does not reach the VS Code / JetBrains IDE or the CLI, so ship `.github/copilot-instructions.md` in each repo for IDE and CLI coverage.

## Admin push at a glance

| Client | Org-level admin push | Surfaces covered |
|--------|----------------------|------------------|
| Claude | Organization instructions or org Skill (Team/Enterprise) | All member conversations |
| ChatGPT | None; use a shared Project or workspace GPT | Only that Project or GPT |
| GitHub Copilot | Org custom instructions (Business/Enterprise) | github.com chat, code review, coding agent - not the IDE or CLI |
