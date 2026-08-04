---
sidebar_position: 10
sidebar_custom_props:
  icon: LayoutGrid
---

# Google Workspace

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">GMAIL + CALENDAR + DRIVE</span><h2>Three Workspace products. One governed connection.</h2><p>Thirteen tools for communication, scheduling, and file discovery with customer-owned Google OAuth.</p></div>

<McpDecision
  officialTitle="Choose official for product-native breadth"
  official="Use Google's separate preview endpoints when the agent needs first-party product depth or access to Workspace surfaces such as Chat and People."
  officialPoints={['Provider-native endpoints', 'Additional Chat and People coverage']}
  quilrTitle="Choose one combined connection"
  quilr="Use Quilr when Gmail, Calendar, and Drive should share customer-owned OAuth, one gateway boundary, and thirteen consistent tools."
  quilrPoints={['Three products, one connection', 'Governed communication and scheduling writes']}
  verdict="Official endpoints maximize Workspace breadth; Quilr minimizes connection and policy sprawl for the three most common workflows."
/>

| Capability | Gmail | Calendar | Drive |
|---|:---:|:---:|:---:|
| Search and read | ✅ | ✅ | ✅ |
| Batch or list workflows | ✅ | ✅ | ✅ |
| Create | Drafts | Events | - |
| Update | - | Events | - |
| Irreversible action | Send email | - | - |
| Shared-drive discovery | - | - | ✅ |
| Export Google files | - | - | ✅ |

Google's official Workspace MCPs are separate product endpoints in Developer Preview and additionally cover Chat and People. Quilr is the combined, gateway-managed option for Gmail, Calendar, and Drive.

See [Google Workspace setup](../mcp-gateway/mcp-provider-setup/google-workspace) for APIs, all eight OAuth scopes, verification, and troubleshooting.
