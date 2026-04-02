---
sidebar_position: 2
sidebar_custom_props:
  icon: Wrench
---

# Tools Management

Control which MCP tools are available to AI agents, organized by risk level.

## How It Works

<StepFlow steps={[
  {
    label: "MCP Exposes Tools",
    items: [
      "get_repos → read",
      "create_issue → write",
      "delete_repo → destructive",
    ],
  },
  {
    label: "QuilrAI Categorizes",
    items: [
      "Low risk: 5 tools",
      "Medium risk: 3 tools",
      "High risk: 1 tool",
    ],
  },
  {
    label: "Admin Controls",
    items: [
      "get_repos: enabled ✓",
      "create_issue: enabled ✓",
      "delete_repo: disabled ✗",
    ],
  },
]} />

1. **MCP Exposes Tools** - The server declares its available tools
2. **Gateway Categorizes** - Tools are sorted by risk level automatically
3. **Admin Controls** - Enable or disable each tool individually

## Tool Categories

### Read Only - Low Risk

Tools that only read data. Safe to enable by default - no modifications to external systems.

Examples: `get_file`, `list_repos`, `search_docs`, `read_database`

### Write Access - Medium Risk

Tools that create or modify data. Review before enabling - changes can be undone but may have side effects.

Examples: `create_issue`, `update_record`, `send_message`, `write_file`

### Destructive - High Risk

Tools that delete or irreversibly modify data. Disabled by default - enable only when explicitly needed.

Examples: `delete_repo`, `drop_table`, `revoke_access`, `purge_data`

## Per-Tool Controls

Each tool shows its name, description, and an enable/disable toggle. Click **"View schema"** to inspect the tool's JSON input schema.

| Tool | Description | Status |
|------|-------------|--------|
| `search_documents` | Search the knowledge base | Enabled |
| `delete_workspace` | Permanently delete a workspace | Disabled |

## Seamless and Transparent

Disabled tools are **hidden from AI agents automatically**. When an agent calls `tools/list`, only enabled tools are returned. No code changes required on the agent side.
