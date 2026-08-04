---
sidebar_position: 4
sidebar_custom_props:
  icon: Database
---

# SharePoint

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">MICROSOFT CONTENT</span><h2>Six tools. The complete SharePoint workflow.</h2><p>Sites, document libraries, folders, files, lists, and list items without exposing the rest of Microsoft 365.</p></div>

## Capability Matrix

| Capability | Read | Write | Destructive |
|---|:---:|:---:|:---:|
| Search sites, files, folders, and list items | ✅ | - | - |
| Resolve SharePoint URLs | ✅ | - | - |
| List drives, folders, lists, and items | ✅ | - | - |
| Read file and list-item content | ✅ | - | - |
| Create folders, upload files, create list items | - | ✅ | - |
| Rename, move, replace content, update fields | - | ✅ | - |
| Delete files, folders, or list items | - | - | ✅ Confirmed |

The six consolidated tools are `find_sharepoint`, `list_sharepoint`, `get_sharepoint_item`, `create_sharepoint_item`, `update_sharepoint_item`, and `delete_sharepoint_item`.

## Why Choose It

- Smaller and easier to govern than the broad Microsoft 365 MCP.
- Existing SharePoint permissions remain authoritative through delegated OAuth.
- URL resolution lets an agent start from a human-shared SharePoint link.
- Deletes require explicit confirmation.

Use [Microsoft 365 v3](./microsoft-365-v3) when the workflow must also reach Outlook, Teams, OneDrive, OneNote, or the directory.
