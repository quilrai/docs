---
sidebar_position: 5
sidebar_custom_props:
  icon: Lock
---

# Access Control

Choose which AI agents, smart groups and people can use one MCP server. Everyone else is denied access before any tool is listed or called.

Go to **Settings > AI Gateway > MCP Gateway**, click **Configure > General** on the server card and scroll to **Access control**.

![Access control card with Allowed agents, Allowed smart groups, Denied smart groups, Allowed users and Denied users pickers](/img/mcp-gateway/ui/settings-access-control.png)

## Settings

| Setting | What it does |
|---------|--------------|
| **Allowed agents** | AI clients that may connect to this server, matched by their User-Agent keyword. Built-in agents and any custom agent from **Allowed Agents** are listed. |
| **Allowed smart groups** | When set, only members of these smart groups may use the server. Leave empty to allow every group. |
| **Denied smart groups** | Members of these smart groups are denied access, unless they are listed in **Allowed users**. |
| **Allowed users** | Email addresses that are allowed access even if one of their smart groups is denied. This list does not restrict anyone by itself. |
| **Denied users** | Email addresses that are always denied access. |

Adding a group or person to one side removes it from the opposite list. Click **Save settings** in the footer to apply your changes.

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

## Example

| Setting | Value |
|---------|-------|
| Denied smart groups | `Contractors` |
| Allowed users | `lead@example.com` |
| Denied users | `former.admin@example.com` |

- A contractor is denied access.
- `lead@example.com` is allowed even though they are in `Contractors`.
- `former.admin@example.com` is denied access even if they are in an allowed group.

## How it relates to other settings

| Feature | Scope | Use it to |
|---------|-------|-----------|
| **Access control** (this page) | One server | Decide who and which agents may use this server at all. |
| [Allowed Agents](./agents-configuration) | Every server, per agent | See and change which servers each agent gets. It edits the same agent list as **Allowed agents** here. |
| [Group & User Rules](./group-user-rules) | One server, per group or user | Configure what authorized users can access: tools, guardrails, token saving and confirmation. |

## Related

- [Allowed Agents](./agents-configuration) - register custom agents and set servers per agent.
- [Group & User Rules](./group-user-rules) - override settings for a smart group or a single user.
- [User Claims Forwarding](./user-claims-forwarding) - pass the signed-in user's identity to the server.
