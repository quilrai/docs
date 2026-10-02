---
sidebar_position: 10
sidebar_custom_props:
  icon: LayoutGrid
---

# Google Workspace

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">GMAIL + CALENDAR + DRIVE + DIRECTORY</span><h2>Four Workspace surfaces. One governed connection.</h2><p>Forty-two tools for communication, scheduling, file operations, and people lookups with customer-owned Google OAuth.</p></div>

<McpDecision
  officialTitle="Choose official for product-native breadth"
  official="Use Google's separate preview endpoints when the agent needs first-party product depth or a Workspace surface this MCP does not cover, such as Chat."
  officialPoints={['Provider-native endpoints', 'Google Chat coverage']}
  quilrTitle="Choose one combined connection"
  quilr="Use Quilr when Gmail, Calendar, Drive, and directory lookups should share customer-owned OAuth, one gateway boundary, and forty-two consistent tools."
  quilrPoints={['Four surfaces, one connection', 'Governed writes, sync, and destructive controls']}
  verdict="Official endpoints reach Chat; Quilr minimizes connection and policy sprawl across the four surfaces agents use most."
/>

| Capability | Gmail | Calendar | Drive | Directory |
|---|:---:|:---:|:---:|:---:|
| Search and read | ✅ | ✅ | ✅ | ✅ |
| Multi-item and thread reads | ✅ | ✅ | ✅ | ✅ |
| Attachment and file-content reads | ✅ | - | ✅ | - |
| Incremental sync | ✅ | ✅ | ✅ | - |
| Create | Drafts, labels | Events, calendars | Files, folders, comments | - |
| Update | Message labels, drafts | Events, calendars, RSVP | Metadata, copy, move | - |
| Availability lookup | - | ✅ | - | - |
| Permission visibility | - | - | ✅ | - |
| Move to trash, recoverable | ✅ | - | ✅ | - |
| Permanent delete | Labels, drafts | Events, calendars | - | - |
| Irreversible send | Send email | - | - | - |
| Change who can reach a file | - | - | Opt-in | - |

Seven destructive tools are enabled by default, each annotated and tagged so a client can confirm or refuse them as a class. Drive sharing is registered disabled and an operator must turn it on. Permanent deletion of mail and files is not available in any product, so nothing here bypasses Google's trash.

Directory lookups are backed by the People API and read only the signed-in user's own Workspace domain. They carry no administrator capability and do not use the Admin SDK.

Google's official Workspace MCPs are separate product endpoints in Developer Preview and additionally cover Google Chat. Quilr is the combined, gateway-managed option for Gmail, Calendar, Drive, and directory lookups.

See [Google Workspace setup](../mcp-gateway/mcp-provider-setup/google-workspace) for APIs, all fifteen OAuth scopes, verification, and troubleshooting.
