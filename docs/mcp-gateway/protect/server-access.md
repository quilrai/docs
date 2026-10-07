---
sidebar_position: 1
sidebar_label: "Server access"
sidebar_custom_props:
  icon: Lock
---

# Server access

Choose which AI agents, smart groups and people can use one MCP server. Everyone else is denied access before any tool is listed or called.

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
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

## Going further with the Policy Engine

The same decision lives on the **MCP Server Access** card (stage 1, Session) in **Govern > Policy Engine > MCP Gateway**. Its effect is **MCP access**: allow or deny. Because it runs at session, a denied caller never sees the server's tools. Deny wins over allow, and a server that is not registered is denied by default. Edits join a shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

A rule can match on far more than the Access control card offers:

- **Block servers by name for everyone.** Match **MCP name** against a list, for example unapproved or legacy servers, and deny access across the tenant in one rule.
- **Gate by identity source or network.** Match the caller's **identity provider** or **client IP**, so a server is only reachable from accounts signed in through your corporate IdP or from known networks.
- **Gate by agent or route.** Match **agent name**, agent classification or **route kind** (`direct`, `onemcp`, `workflow`), for example allow a server through OneMCP but not as a direct connection.
- **Gate by server attributes.** Match MCP **tags**, **transport** or **auth type** instead of naming each server.

<PolicyCard
  name="block_unapproved_servers"
  stage="session"
  priority={900}
  when={[{ field: "MCP name", op: "is any of", values: ["Unapproved Notes", "Legacy CRM"] }]}
  then={[{ effect: "MCP access", value: "deny" }]}
/>

The **OneMCP Features** card sits in the same Session stage. It turns OneMCP dynamic tools and memory on or off per caller. See [OneMCP](../get-started/onemcp).

## Related

- [Allowed Agents](../servers-and-connections/allowed-agents) - register custom agents and set servers per agent.
- [Group and user rules](./group-and-user-rules) - override settings for a smart group or a single user.
- [Claims forwarding](./claims-forwarding) - pass the signed-in user's identity to the server.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
