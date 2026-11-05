---
sidebar_position: 2
sidebar_label: "Group and user rules"
sidebar_custom_props:
  icon: UserCog
description: "Override tools, confirmation, guardrails and token saving for a smart group or a single user, and preview a user's effective settings."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Group and user rules

Updated on 3 November 2026.

Give a smart group or a single person different settings on one MCP server. A rule can turn tools on or off, require confirmation, change guardrail actions and enable or disable token saving without changing other users' settings.

Choose the instructions for the mode that governs your MCP Gateway. See [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what happens to stored settings when the engine is on.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Configure it on the server

<ConsolePath
  console="WhiteMatter console"
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

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine

Caller scope belongs on the control that owns the outcome. Open **Govern > Policy Engine > MCP Gateway > Controls**, choose the control, then choose people or Smart Groups under **Applies to**. Use exclusions when a rule should apply to everyone except a group or person.

| Classic override | Policy control |
|---|---|
| Tool **Enabled** | **Invocation & Discovery**: listing, calls, and returned results. |
| **Confirmation**, **Justification** | **Human Confirmation**. |
| Guardrail actions and categories | **Data & Adversarial Risks**. |
| Token-saving strategies | **Token Savings**. |

Unlike classic overrides, there is no universal “user rule applies last” order. Each control explains **How rules combine** and **When no rule sets this**. Access decisions use the highest numeric priority, with Deny winning ties; confirmation and token-saving switches have their own tie rules. Data-risk actions have separate rules for detection actions and the scan profile.

For example, use **Invocation & Discovery > Block destructive tools**, scope it to a Smart Group, and check which listing, call, and result steps it changes. A more specific audience alone does not guarantee an override: compare its stored priority with the other matching rules.

**Policies** provides a searchable list of policies and their outcomes. For an effective decision, use **Test > Try a situation**, choose a person and server/tool, and inspect the result. **Replay activity** checks the candidate against recorded calls. [Review and publish](../../console/govern/author-simulate-and-publish) only after the intended and exempt cases behave as expected.

</TabItem>
</Tabs>

## Related

- [Server access](./server-access) - allow or deny groups and users on the server.
- [Security guardrails](./security-guardrails) - the base guardrail settings rules override.
- [Token saving](./token-saving) - the base token saving strategies.
- [Tool visibility](./tool-visibility) - base tool settings and confirmation.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
