---
sidebar_position: 1
sidebar_label: "Server access"
sidebar_custom_props:
  icon: Lock
description: "Allow or deny each MCP server by agent, smart group and user, and how those lists take precedence."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Server access

Updated on 3 November 2026.

Choose which AI agents, Smart Groups and people can connect to an MCP server. Connection access is separate from permission to list or call its tools.

Choose the instructions for the mode that governs your MCP Gateway. See [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what happens to stored settings when the engine is on.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="General"
  note="Scroll to the Access control card."
/>

![Access control card with Allowed agents, Allowed smart groups, Denied smart groups, Allowed users and Denied users pickers](/img/mcp-gateway/ui/settings-access-control.png)

| Setting | What it does |
|---------|--------------|
| **Allowed agents** | AI clients that may connect to this server, matched by their User-Agent keyword. Built-in agents and any custom agent from **Allowed Agents** are listed. |
| **Allowed smart groups** | When set, only members of these smart groups may use the server. Leave empty to allow every group. |
| **Denied smart groups** | Members of these smart groups are denied access, unless they are listed in **Allowed users**. |
| **Allowed users** | Email addresses that are allowed access even if one of their smart groups is denied. This list does not restrict anyone by itself. |
| **Denied users** | Email addresses that are always denied access. |

Adding a group or person to one side removes it from the opposite list. Click **Save settings** in the footer to apply your changes.

To manage agents across every server at once, use the **Allowed Agents** button in the MCP Gateway header. It edits the same agent list. See [Allowed Agents](../servers-and-connections/allowed-agents).

## Precedence

The card reads: "Denied users take precedence. An explicitly allowed user can override a denied smart group; user rules are matched case-insensitively."

The gateway checks each person in this order and stops at the first match:

| Order | If the person is... | Result |
|-------|---------------------|--------|
| 1 | In **Denied users** | Denied |
| 2 | In **Allowed users** | Allowed |
| 3 | In a **Denied smart group** | Denied |
| 4 | Not in any **Allowed smart group** (when that list is set) | Denied |
| 5 | Anyone else | Allowed |

Emails match regardless of case, so `Jane@Example.com` and `jane@example.com` match the same email address.

**Allowed agents** is checked separately. A request from a client whose User-Agent matches no allowed agent is denied regardless of the user.

The User-Agent identifies a client but does not authenticate it, so treat **Allowed agents** as steering, and rely on the user and group lists for access decisions. See [Allowed Agents](../servers-and-connections/allowed-agents#what-this-control-does-and-does-not-do).

:::note Gateway traffic only
These rules apply to calls that go through the MCP Gateway. They do not stop someone from connecting to an MCP server directly from their own client. To find and close those paths, see [An MCP server outside the gateway](../../console/observe/inventory#example-an-mcp-server-outside-the-gateway).
:::

### Example

| Setting | Value |
|---------|-------|
| Denied smart groups | `Contractors` |
| Allowed users | `lead@example.com` |
| Denied users | `former.admin@example.com` |

- A contractor is denied access.
- `lead@example.com` is allowed even though they are in `Contractors`.
- `former.admin@example.com` is denied access even if they are in an allowed group.

### How it relates to other settings

| Feature | Scope | Use it to |
|---------|-------|-----------|
| **Access control** (this page) | One server | Decide who and which agents may use this server at all. |
| [Allowed Agents](../servers-and-connections/allowed-agents) | Every server, per agent | See and change which servers each agent gets. |
| [Group and user rules](./group-and-user-rules) | One server, per group or user | Configure what authorized users can access: tools, guardrails, token saving and confirmation. |

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine

Open **Govern > Policy Engine > MCP Gateway > Controls > MCP Server Access**. The panel shows what happens today, recipes, configured rules, and an **Activity** tab.

| Section | Use it to | When no rule sets it |
|---|---|---|
| **Server access** | Allow or deny a connection by server, person, Smart Group, agent, route, identity provider, or network. | The connection is denied. |
| **Hidden from OneMCP** | Deny access through OneMCP while letting the other rules decide direct access. | There is no additional OneMCP-only restriction. |

1. Choose a recipe such as **Let a team connect to a server** or **Keep someone off a server**, or start a blank rule in the section.
2. Choose the servers and callers under **Applies to**, and set the outcome.
3. Check **Reads as**, then **Save to draft**.
4. Use **Test > Try a situation** to check an allowed and a denied caller, then [review and publish](../../console/govern/author-simulate-and-publish).

For both sections, the highest numeric priority wins; **Deny** wins only when priorities tie. A higher-priority Allow can therefore override a lower-priority Deny. Scope suggests a starting priority; it does not replace the stored priority of an existing rule.

Allowing a connection does not allow its tools. Configure **Invocation & Discovery** for what is listed, what can run, and which results return. See [Tool visibility](./tool-visibility).

**OneMCP Features**, in the same **Who can connect?** group, controls dynamic tools, memory, and [short tool lists](./tool-lists).

</TabItem>
</Tabs>

## Related

- [Allowed Agents](../servers-and-connections/allowed-agents) - register custom agents and set servers per agent.
- [Group and user rules](./group-and-user-rules) - override settings for a smart group or a single user.
- [Claims forwarding](./claims-forwarding) - pass the signed-in user's identity to the server.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
