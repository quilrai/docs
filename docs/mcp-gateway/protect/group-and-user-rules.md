---
sidebar_position: 2
sidebar_label: "Group and user rules"
sidebar_custom_props:
  icon: UserCog
description: "Override tools, confirmation, guardrails and token saving for a smart group or a single user, and preview a user's effective settings."
---

# Group and user rules

Give a smart group or a single person different settings on one MCP server. A rule can turn tools on or off, require confirmation, change guardrail actions and enable or disable token saving without changing other users' settings.

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Group & User Rules"
/>

The section reads: "Rules override the base settings for a smart group or a single user. User rules apply after group rules." The card's **Scoped rules** chip shows how many rules the server has.

![Group & User Rules section with Add rule, Applies to A smart group or A single user, Smart group picker, Rule active switch and Tool overrides](/img/mcp-gateway/ui/settings-group-user-rules.png)

### Add a rule

1. Click **Add rule**.
2. Under **Applies to**, select **A smart group** and choose the **Smart group**, or select **A single user** and enter the **User email**.
3. Leave **Rule active** on. Turning it off stops applying this override; it does not block the server.
4. Set only the overrides you need. Anything left at **Inherit** keeps the server's base setting.
5. Click **Save rule**.

Each saved rule shows a **Smart group** or **User** tag, a summary of what it overrides, and **Rule active** or **Rule inactive**. Use **Edit** or **Delete** to change it.

To decide who may use the server at all, use [Server access](./server-access) instead.

## What a rule can override

![Tool overrides list with Enabled, Confirmation and Justification set to Inherit for each tool](/img/mcp-gateway/ui/settings-group-user-rules-tool-overrides.png)

| Section | Settings | Options |
|---------|----------|---------|
| **Tool overrides** | **Enabled**, **Confirmation**, **Justification** for each tool | **Inherit** / **On** / **Off** |
| **Token saving overrides** | **Smart JSON compression**, **HTML to text**, **Markdown to text**, **Text compression** | **Inherit** / **On** / **Off** |
| **Guardrail overrides** | **Request action**, **Response action** | **Inherited** / **Monitor** / **Redact** / **Block** |
| **Data risk categories**, **Adversarial risk categories** | **Enabled**, **Request**, **Response** for each category | **Inherit** / **On** / **Off** and **Inherited** / **Monitor** / **Redact** / **Block** |

With **Justification** on, the user must type a reason to approve a confirmed call; denying a call does not require one. Setting **Confirmation** to **On** also sets **Justification** to **On**. **Justification** needs **Confirmation**. See [Human approval](./human-approval) for how confirmation works.

## How rules combine

A person can belong to several smart groups. Their settings are built in three steps:

| Step | Applies | When rules disagree |
|------|---------|---------------------|
| 1 | Server base settings | - |
| 2 | Every active rule for a smart group the person is in | The most restrictive setting takes precedence. |
| 3 | The active rule for that person's email | Replaces the result of step 2 for every field it sets. |

"Strictest" means, for each field:

| Field | Result when groups disagree |
|-------|-----------------------------|
| Tool **Enabled** | Off if any group turns it off. |
| **Confirmation**, **Justification** | On if any group turns it on. |
| Guardrail actions | The most restrictive action takes precedence (**Block** over **Redact** over **Monitor**). |
| Guardrail categories | On if any group turns it on. |
| Token saving strategies | On if any group turns it on. |

A user rule takes precedence, so it can make a group setting less restrictive.

## Effective settings preview

Review one user's effective settings after all rules apply.

1. Under **Effective settings preview**, enter a **User email**.
2. Click **Resolve**.

The preview lists the tools, any hidden tools, token saving and the guardrail actions for that person. Click **Show full settings** to see everything.

## Going further with the Policy Engine

When the Policy Engine is on for the MCP Gateway, this section turns read-only and published policies apply instead. **Edit anyway** changes the stored values, which are used only if the Policy Engine is disabled. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

The Policy Engine has no separate rules list. Every rule can match on the caller (**user email**, **smart groups**, identity provider, client IP), so a group or user override becomes a rule on the card that owns the setting:

| Override here | Card in **Govern > Policy Engine > MCP Gateway** |
|---------------|-----------------------------------------------|
| Tool **Enabled** | **Invocation** (stage 3, Request) to refuse calls, and **Discovery Visibility** (stage 2) to hide the tool |
| **Confirmation**, **Justification** | **Human Approval** |
| Guardrail actions and categories | **Data & Adversarial Risks** |
| Token saving strategies | **Token Savings** |

The **Invocation** card decides whether a tool call may run. Its effect is **Tool call access**: allow or deny. Scenarios it covers that group and user rules cannot:

- **Combine caller and tool conditions.** Deny destructive tools (the tool's `destructive` annotation, tags or risk) for one smart group across every server, instead of switching tools off server by server.
- **Condition on the agent or route.** Allow a write tool from one agent but not another, or only when the call comes through OneMCP (**route kind** `onemcp`).
- **Cover a class of servers.** Match MCP **tags**, auth type or system MCP instead of adding the same rule to each server.

<PolicyCard
  name="contractors_no_destructive_tools"
  stage="request"
  priority={800}
  when={[
    { field: "Smart groups", op: "includes (ignoring case)", value: "Contractors" },
    { field: "Tool is destructive", op: "is", value: "true" },
  ]}
  then={[{ effect: "Tool call access", value: "deny" }]}
/>

Overlapping policies resolve differently from this section: a deny is never undone by a more permissive rule, and priority settles single values. A person-specific allow therefore cannot loosen a group deny the way a user rule can here. See the [Policy Engine overview](../../console/govern/policy-engine), and simulate before you [publish](../../console/govern/author-simulate-and-publish).

## Related

- [Server access](./server-access) - allow or deny groups and users on the server.
- [Security guardrails](./security-guardrails) - the base guardrail settings rules override.
- [Token saving](./token-saving) - the base token saving strategies.
- [Tool visibility](./tool-visibility) - base tool settings and confirmation.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
