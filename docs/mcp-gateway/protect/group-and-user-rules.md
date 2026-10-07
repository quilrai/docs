---
sidebar_position: 2
sidebar_label: "Group and user rules"
sidebar_custom_props:
  icon: UserCog
---

# Group & User Rules

Give a smart group or a single person different settings on one MCP server. A rule can turn tools on or off, require confirmation, change guardrail actions and enable or disable token saving without changing other users' settings.

Go to **Settings > AI Gateway > MCP Gateway**, then click **Configure > Group & User Rules** on the server card. The section reads: "Rules override the base settings for a smart group or a single user. User rules apply after group rules." The card's **Scoped rules** chip shows how many rules the server has.

![Group & User Rules section with Add rule, Applies to A smart group or A single user, Smart group picker, Rule active switch and Tool overrides](/img/mcp-gateway/ui/settings-group-user-rules.png)

:::note Policy Engine
When the Policy Engine is on, group and user policies apply instead and this section is read-only. **Edit anyway** changes the values used only if the Policy Engine is turned off. See [MCP Gateway policies](../../console/govern/policy-engine).
:::

## Add a rule

1. Click **Add rule**.
2. Under **Applies to**, select **A smart group** and choose the **Smart group**, or select **A single user** and enter the **User email**.
3. Leave **Rule active** on. Turning it off stops applying this override; it does not block the server.
4. Set only the overrides you need. Anything left at **Inherit** keeps the server's base setting.
5. Click **Save rule**.

Each saved rule shows a **Smart group** or **User** tag, a summary of what it overrides, and **Rule active** or **Rule inactive**. Use **Edit** or **Delete** to change it.

To decide who may use the server at all, use [Access control](./server-access) instead.

## What a rule can override

![Tool overrides list with Enabled, Confirmation and Justification set to Inherit for each tool](/img/mcp-gateway/ui/settings-group-user-rules-tool-overrides.png)

| Section | Settings | Options |
|---------|----------|---------|
| **Tool overrides** | **Enabled**, **Confirmation**, **Justification** for each tool | **Inherit** / **On** / **Off** |
| **Token saving overrides** | **Smart JSON compression**, **HTML to text**, **Markdown to text**, **Text compression** | **Inherit** / **On** / **Off** |
| **Guardrail overrides** | **Request action**, **Response action** | **Inherited** / **Monitor** / **Redact** / **Block** |
| **Data risk categories**, **Adversarial risk categories** | **Enabled**, **Request**, **Response** for each category | **Inherit** / **On** / **Off** and **Inherited** / **Monitor** / **Redact** / **Block** |

With **Justification** on, the user must type a reason to approve a confirmed call; denying a call does not require one. Setting **Confirmation** to **On** also sets **Justification** to **On**. **Justification** needs **Confirmation**. See [Tools Management](./tool-visibility) for how confirmation works.

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

## Related

- [Access control](./server-access) - allow or deny groups and users on the server.
- [Security Guardrails](./security-guardrails) - the base guardrail settings rules override.
- [Token Saving](./token-saving) - the base token saving strategies.
- [Tools Management](./tool-visibility) - base tool settings and confirmation.
