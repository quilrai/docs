---
sidebar_position: 6
sidebar_label: "OAuth permissions"
sidebar_custom_props:
  icon: KeyRound
---

# OAuth Permissions

Choose which OAuth scopes a server asks for when users sign in. Grant only the scopes your users need; tools that depend on an excluded scope are hidden and blocked.

The **Permissions** section ("OAuth scopes this connection requests") appears only on OAuth servers that publish selectable scopes, such as **Microsoft Office 365 V3**. On the server card, under **Configure**, click **General**, then choose **Permissions**. The subtitle shows what is granted, for example **All 31 scopes (default)** or **12 of 31 scopes granted**.

![Permissions section for Microsoft Office 365 V3 with the search box, Grant all (default), scope groups with counts, and one group expanded to show a scope and the tools it unlocks](/img/mcp-gateway/ui/settings-permissions.png)

## Pick scopes

Scopes are grouped by area, for example **Mail**, **Calendar**, **Teams meetings**, **Teams chats**, **OneDrive files**, **SharePoint** and **Contacts**. Each group shows how many of its scopes are granted, for example **3 / 4**.

| Control | Use |
|---------|-----|
| Group checkbox | Grant or remove every scope in the area. |
| Arrow beside a group | Expand it to see each scope, its description and **Unlocks N tools** with the tool names. |
| Scope checkbox | Grant or remove one scope. |
| **Search permissions or tools** | Find a scope by area, scope name or tool name, for example `mail`, `send` or `calendar`. Matching tools are highlighted. |
| **Grant all (default)** | Restore the server's full default set. |

Example: expand **Teams meetings** and find `OnlineMeetings.ReadWrite`, which **Unlocks 3 tools**: `save_teams_meeting`, `get_teams_meeting` and `delete_teams_meeting`. Clear it and those tools are no longer available.

Sign-in (`User.Read`) and offline access are always included. At least one scope must stay selected.

Below the groups, **Always available** lists tools that need no specific scope, and **Cross-area tools** lists search, lookup, batch and sync tools that work across whichever areas are granted.

## Save and reconnect

Click **Save settings** in the footer, then connect (or reconnect) for the change to take effect.

People who already connected keep their previous permissions until they reconnect. New sign-ins ask for exactly the scopes you selected.

## Related

- [OAuth Connect](./oauth-connect) - connect OAuth servers.
- [Tool visibility](../protect/tool-visibility) - turn individual tools on or off.
- [Access control](../protect/server-access) - limit who can use the server.
