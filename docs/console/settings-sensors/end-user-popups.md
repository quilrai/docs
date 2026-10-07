---
sidebar_position: 1
sidebar_label: "End-user popups"
sidebar_custom_props:
  icon: MessageSquareText
---

# End-user popups

When Quilr intervenes, for example to coach a user, ask for a justification or block an action, the user sees a popup. The **User Interaction Hub** controls how those popups look and what they say.

<ConsolePath console="QuilrAI Console" path={['Settings', 'User Interaction Hub']} />

The page has two tabs: **Visual Style** and **Customize Content**.

## Visual Style

Branding and links shown on every popup. A **Preview** shows the result as you edit.

### Footer logo

Choose **QuilrAI** or upload a custom logo. Use your organization's logo so users recognise the popup as an official company message.

### Policy links

Link popups to your written policies, for example your AI acceptable-use policy.

1. Turn on **Use URLs in popups**.
2. Select **Add link**.
3. Enter a **Label** (the text users see), choose the **Posture** the link belongs to, and enter the **Link** URL.
4. Repeat for each posture and check the preview.

## Customize Content

The message library: one row per combination of posture, use case and control.

| Column | Shows |
|---|---|
| Posture | The risk area, for example Data Risks |
| Use case | The scenario the control covers |
| Control | The control that raises the popup |
| Action | What the popup asks for, for example Justify |
| Template | The message template in use |
| Created by / Updated by | Who created and last changed it |

Use search, filters and bulk actions to find messages. Select **Edit** on a row to change its wording. A good message names the behaviour, the reason, and who to contact. For **Justify** popups, the justification options you offer become the choices users pick from.

:::tip
Write messages for the person who was just stopped. Short, specific and non-accusatory messages get better justifications and fewer support tickets.
:::

## Related

- [Action requests](../govern/action-requests) - where justification requests arrive
- [Organizational policies](../settings-organization/organizational-policies)
- [Browser controls](../../browser-extension/configure/browser-controls)
