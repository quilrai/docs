---
sidebar_position: 1
sidebar_label: "User Interaction Hub"
description: "Brand the popups people see when Quilr steps in on risky activity, link them to your policies, and edit each popup's message and justification options."
sidebar_custom_props:
  icon: MessageSquareText
console_path: [/settings/user-interaction-hub, /settings/user-interaction-hub/visual-styling, /settings/user-interaction-hub/popup-content]
aliases: [user interaction hub, end-user popups, popups, popup branding, popup templates, custom logo, footer logo, policy links, interventions, justification options, pre-defined justifications, message templates]
---

# User Interaction Hub

When Quilr steps in on risky activity, for example to ask for a reason or to block an action, the person sees a popup from the Browser Extension or Endpoint Agent. User Interaction Hub controls how those popups look and what they say.

<ConsolePath console="QuilrAI Console" path={['Settings', 'User Interaction Hub']} />

## What you can do

- Show your company logo on every popup.
- Link popups to your policies, such as your AI acceptable use policy.
- Rewrite the message for each popup.
- Choose the reasons people can pick when a popup asks them to justify an action.

The page has two tabs. **Visual Style** sets the logo and links for all popups. **Customize Content** sets the wording of each popup.

## Before you start

- To open the page, your role needs access to the **User Interaction Hub settings** page and the **Read policies** permission. To make changes, it also needs **Update policies**. Without it, you can view the settings but not change them. See [Roles and permissions](../settings-organization/roles-and-permissions).
- If **User Interaction Hub** is missing from **Settings**, your role doesn't include it or the feature isn't turned on for your organization. Ask your Quilr admin.

## Visual Style

Settings on this tab apply to every popup. Select **Preview** at the top right to jump to the live preview.

### Add your company logo

The logo appears in the popup footer. Your own logo helps people recognize the popup as an official company message.

1. Under **Use company logo**, select **Custom logo**.
2. Select **Choose PNG** and pick your logo file.
3. In the **Crop logo** dialog, drag across the image to choose the area to keep. Switch between **Light** and **Dark** to check it on both backgrounds.
4. Select **Use crop**.
5. Check the logo in the live preview, then select **Save changes**.

You see **Logo settings saved**, and the new logo appears on every popup.

Logo requirements:

- PNG only. A transparent background works best.
- At least 128 × 128 px. 256 × 256 px or larger is recommended.
- 2 MB or smaller.
- The longest edge of the saved crop is limited to 512 px.

To go back to the QuilrAI logo, select **Reset to QuilrAI**, then **Save changes**.

### Link popups to your policies

Policy links let people open your written policies straight from a popup. Each link is tied to a posture, the risk area it covers, for example Data Risks.

1. Turn on **Use URLs in popups**. This saves right away.
2. Under **Policy links**, select **Add link**. A new row appears at the top of the table.
3. Enter a **Label**. This is the text people see, for example "AI acceptable use policy".
4. Choose the **Posture** the link belongs to.
5. Enter the **Link**, a full `http://` or `https://` URL.
6. Select the check icon, or press **Enter**, to save the row. Press **Esc** to cancel.

You see **Link added**. Repeat for each policy you want to share.

To change a link, select the pencil icon on its row. To remove one, select the trash icon, then **Delete link**. Deleting a link only removes it from popups. Your policy document is not changed.

To hide all links without deleting them, turn off **Use URLs in popups**.

### Check the live preview

**Live preview** at the bottom of the tab shows a sample popup with your logo and links. It includes unsaved logo changes, so you can check a logo before you save it. When **Use URLs in popups** is on, the preview lists all your links under **Related policies**, whatever their posture.

## Customize Content

This tab lists every popup template. There is one template for each combination of posture, use case and control.

### Find a template

| Column | Shows |
|---|---|
| **Posture** | The risk area, with a **Customized** or **QuilrAI default** tag |
| **Use case** | The scenario the control covers |
| **Control** | The control that shows the popup |
| **Action** | What the popup asks for, for example **Justify** |
| **Template** | The template name |
| **Created by** / **Updated by** | Who created and last changed the template |
| **First created** / **Last modified** | When the template was created and last changed |

Use the search box to find a template by use case, control or template name. To narrow the list by posture, select **Filters**, then **Postures**. You can also filter by **Use cases** and **Actions**.

### Edit a popup message

1. Select **Edit** on the template's row.
2. Edit the **Message header**. This is the bold line people read first. Up to 50 characters.
3. Edit the **Message body**. Up to 200 characters. Say what happened, why it matters, and who to contact.
4. For **Justify** templates, add the reasons people can choose under **Pre-defined justifications**. Type a reason in **Justification option** and select **Add**. To remove a reason, select the X on it.
5. Check the preview, then select **Save content**.
6. In **Apply content changes?**, select **Apply changes**.

You see **Popup content saved**. The new wording appears wherever this template is used for its control and use case, and the template is tagged **Customized**.

:::tip Formatting the message body
Press **Enter** for a new line. For emphasis or a link, use basic HTML tags: `<b>`, `<strong>`, `<i>`, `<em>` and `<a href="...">`. Other tags are removed when you save. The editor preview shows tags as plain text.
:::

### Restore the QuilrAI default

You can undo your changes to one template or to many at once.

- **One template:** open it with **Edit** and select **Revert to QuilrAI default**. This is only available for **Customized** templates.
- **Several templates:** select their checkboxes, then select **Actions** and **Revert to QuilrAI default**. You can restore up to 100 templates at a time.

:::warning
Restoring starts as soon as you select it, with no confirmation step. Copy any wording you want to keep first.
:::

### Add links for several postures at once

Add policy links for the postures of the templates you select, without leaving the tab.

1. Select the templates' checkboxes.
2. Select **Actions**, then **Customize links**. The dialog shows a card for each posture in your selection.
3. On each card, enter the link identifier (the text people see) and the **URL**. Select **Add another** to add more links for that posture.
4. Select **Save links**.

You see **Policy links added**. In this dialog, each posture can have up to three links, counting the links it already has. Postures that already have three are not shown. Every row must be filled in before you can save, so remove rows you don't need with the trash icon.

To edit or remove existing links, use [Policy links](#link-popups-to-your-policies) on the **Visual Style** tab.

## Write messages that work

Write for the person who was just stopped:

- Say what they did and why it matters.
- Tell them who to contact.
- Keep it short, specific and non-accusatory.

Clear messages get better justifications and fewer support tickets.

## Limits

| Item | Limit |
|---|---|
| Logo | PNG, 2 MB or smaller, at least 128 × 128 px. Saved crop up to 512 px on the longest edge. |
| Policy link label | 3 to 100 characters |
| Policy link URL | A valid `http://` or `https://` URL with no username or password, up to 2,048 characters |
| Message header | 50 characters |
| Message body | 200 characters |
| Pre-defined justifications | 50 per template, 50 characters each |
| Restore defaults in bulk | 100 templates at a time |
| Links per posture in **Customize links** | 3 |

## Related

- [Action requests](../govern/action-requests) - review the reasons people give when they justify an action
- [Browser controls](../../browser-extension/configure/browser-controls) - the controls that show popups
- [Organizational policies](../settings-organization/organizational-policies)
- [Roles and permissions](../settings-organization/roles-and-permissions)
