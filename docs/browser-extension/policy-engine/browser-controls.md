---
sidebar_position: 2
sidebar_label: "Browser controls"
sidebar_custom_props:
  icon: ListChecks
description: "Find, add, edit, duplicate, delete and export Browser Extension controls, resolve conflicts with existing controls, and see which permissions each task needs."
console_path: /policy/engine/endpoint-agent/browser
aliases: [policy, policies, rules, controls, enforcement rules, DLP policies, browser policy, browser controls, export controls, browser extension controls, add control, duplicate control, delete control, restore control]
---

# Browser controls

Updated on 10 November 2026.

A browser control is one rule for the QuilrAI Browser Extension. It names the activity to watch for, when the rule applies, and what happens on a match.

Open **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector, then select **Browser** under the page title. **Desktop** holds the [Endpoint Agent's own policies](../../endpoint-agent/policy-engine/overview).

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Browser']} />

:::note Saves apply immediately
Browser controls have no draft, test or publish step. Every save, mode change, status change and delete is live at once. Browsers apply it at their next sync, about every 2 minutes. Only controls that are turned on reach browsers.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Use case** | The activity a control watches for, chosen from the QuilrAI catalog, for example "A user is uploading sensitive data". |
| **Posture** | The risk area the use case belongs to, for example **Data Risks**. |
| **Risk behavior** | The kind of risky activity the use case belongs to, for example **Users Uploading Data**. It decides [which control wins](./how-controls-are-evaluated#which-control-wins-when-several-match) when several match. |
| **Mode** | **Monitor** records a match without interrupting the user. **Enforce** also applies the control's **Just in Time** action (an in-browser popup or redaction), if it has one. |
| **Criticality** | How serious a match is, **Very Low** to **Very High**. It breaks ties between matching controls whose risk behaviors have the same rank. It is not the finding's severity. |
| **Status** | Whether the control runs (**Enabled** in the editor). A control that is off is kept. |
| **System** and **Custom** | Controls supplied by QuilrAI, and controls your admins create. |

## The controls list {#controls-table}

The **Browser Extension controls** list shows your controls, except deleted ones and a few built-in controls, such as those that block apps marked **Blocked** in [Inventory](../../console/observe/inventory). Hidden controls still run. See [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).

- **Control** shows the name and use case, with a **System** tag on System controls. Select the name to open the control.
- **Criticality** shows the level. **Mode** and **Status** are switches you can [change in the row](#change-mode-or-status-from-the-list).
- **Smart groups** lists the groups in user **Smart Group** conditions as **Includes** or **Excludes**. Open the control to see how conditions are joined.
- **Actions** lists top-level actions only, not further actions under an outcome.
- **Updated** and **Created** show who last changed and who created the control, and when.

Each row has **Edit** (**View** if you cannot make changes) and a **⋯** menu with **Duplicate** and **Delete** (System controls have no **Delete**).

Use **Search controls**, **Filters** (**Posture** and **Type**) and the sort menu to find a control. Clearing the filters also clears the search.

### Change mode or status from the list

The **Mode** switch and the **Status** toggle save at once, with no confirmation. Changing a System control this way also stops QuilrAI updates to it. See [Notes and limits](#notes-and-limits).

**Undo** is offered for 8 seconds. It saves a reverse change, so a browser that synced in between applies the first change until its next sync. If the change fails, the row returns to its previous value and **Change rolled back** gives the reason.

## Add a control {#add-or-edit-a-control}

1. Select **Add control**.
2. Fill in [Control details](#control-details).
3. In **When this happens**, [choose the use case](#choose-the-use-case).
4. Review any **Mandatory conditions** the use case adds, then [add conditions](#conditions) to narrow the control. Some use cases require at least one.
5. Optional: select **Perform action** to [add actions](#actions).
6. Select **Create control**, check the **Create this control?** summary, and confirm with **Create control**. Turn on **Enabled** in the summary to run the control as soon as it is saved.
7. QuilrAI checks that no other control covers the same use case and conditions. If none does, **Control created** appears. Otherwise, see [Resolve a conflict](#resolve-a-conflict).

If **Create control** is unavailable, see [If you cannot save](#if-you-cannot-save).

:::tip Start in Monitor
Start a new or changed control in **Monitor**, scoped to a pilot Smart Group. Review its correct and unwanted matches in [Findings & Interactions](../../console/observe/findings-and-interactions) for a week or two, then switch it to **Enforce**. If it matches too much or too little, check its conditions, [Smart Groups](../../console/settings-organization/smart-groups) and [Detection Models](../../console/govern/detection-models).
:::

### Control details

- **Control name** is required, up to 200 characters, and unique in your tenant. Names that differ only in letter case or punctuation count as the same. It cannot be changed after the control is created.
- **Criticality** defaults to **High**.
- **Description** is optional and must stay on one line. A line break makes the save fail.
- **Mode** starts on **Monitor** and **Enabled** is off. Leave both as they are while you set the control up.

### Choose the use case

Find a use case with **Search use cases**, or filter by **Posture** and **Risk behavior**, then select it. It sets the posture and risk behavior and adds its mandatory conditions. **Remove** clears it and every condition and action below it. The use case cannot be changed after the control is created.

### Conditions

**Mandatory conditions** come with the use case and carry a **Required** tag. You cannot remove them, but where the use case allows, you can change their attribute, operator or value. **Additional conditions** are the ones you add to narrow the control. Some use cases require at least one; the editor then shows a warning under the use case.

To add an additional condition:

1. Select **Add condition**.
2. Set the **Attribute type** (shown only when there is more than one), **Attribute**, **Operator** and **Value**, for example **User**, **Smart Group**, **is not in**, Finance.
3. From the second additional condition on, choose **AND** or **OR** to join it to the conditions above. The first one always joins any mandatory conditions with **AND**.
4. To combine conditions in one card, select **Add condition to group**. Groups cannot be nested.

For attributes and operators, see [Narrow the control with conditions](./conditions-and-actions#conditions).

:::warning Put OR inside a group
Browsers ignore a control whose top-level condition cards are joined by **OR**. Use **AND** between cards, and put "this or that" inside one group. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
:::

### Actions

1. Select **Perform action**.
2. Choose the **Action type**, then the **Action**. The use case decides which are offered. **Just in Time** actions run in the browser; **Remediation Action** and **Activate Agent** actions run afterwards on the QuilrAI backend.
3. Fill in the action's fields. **Activate Agent** requires a **Policy**, the organizational policy the agent answers from, and offers an optional **Tone**. Some **Just in Time** actions offer [Prompt frequency](./conditions-and-actions#prompt-frequency), which limits how often the popup appears. It works only for visits and sign-ins.
4. Optional: if the action lists outcomes, select **Add further action** under an outcome to add an action that follows it.

A control can have one **Just in Time** action, and it cannot be a further action. **Just in Time** and **Activate Agent** actions run only in **Enforce** mode. See [Which action types you can use](./conditions-and-actions#action-types).

An **Activate Agent** action needs an agent summary, which is QuilrAI's description of what the agent will do. Select **Generate agent summary**, and select **Update agent summary** after any later change, even to **Tone**. Until the summary is current, the action shows **Needs summary** and the control cannot be saved. If **Summary unavailable** appears, remove the action to save the rest.

## Edit a control

1. Select **Edit** on the row, or select the control name.
2. Make your changes and select **Save changes**.
3. Confirm the **Save this control?** summary.

The name and use case are fixed. To change them, [duplicate the control](#duplicate-a-control) or add a new one.

## Duplicate a control

1. On the row, select **⋯ > Duplicate**. A copy named "Copy - *original name*" opens with the same settings and **Enabled** off.
2. Change at least one condition or the use case. Otherwise the copy conflicts with its source.
3. Select **Create control** and confirm.

A copy of a System control is a Custom control.

## Resolve a conflict {#resolve-a-conflict}

Two controls cannot share a use case and equivalent conditions, in any order or grouping. When you save, QuilrAI compares your control with active and inactive controls, and with controls deleted with **Delete control, keep findings**. The **Control already exists** dialog lists each matching control:

| Matching control | Option | Result |
|---|---|---|
| **Active** | None | "Disable the active control before replacing it." |
| **Inactive** | **Re-enable existing** | Your draft is discarded and the match is turned on. |
| **Deleted and disabled** | **Restore existing** | Your draft is discarded and the match returns to the list, turned off. Turn on its **Status** to run it. |

Confirm with **Abandon draft and enable** or **Abandon draft and restore**. To keep your draft instead, select **Return to draft** and change its conditions.

To replace matches with your control, close the panel, delete the matching active and inactive controls, and add yours again. When only deleted controls match, adding or duplicating (not editing) offers **Replace deleted controls**. Confirm with **Delete conflicts and create**, which permanently deletes them and their findings, then creates yours.

## Delete a control

1. On the row, select **⋯ > Delete**.
2. Choose an option:
   - **Delete control, keep findings**: the control leaves the list, its findings stay, and its name stays reserved, so no other control can use it.
   - **Delete control and findings**: both are deleted permanently.
   - **Delete control** (no findings): the control is deleted permanently.

System controls cannot be deleted; turn them off instead.

To bring back a control deleted with **Delete control, keep findings**, add one with the same use case and conditions under another name, then select **Restore existing**. Permanently deleted controls cannot be restored.

## Export the list

**Export** opens a new **Policy Engine** export in [Export Center](../../console/settings-data/export-center), limited to Browser Extension controls and the list's current search, filters and sort. Review it there, then create it. The export's search also matches descriptions, so it can include more rows than the list.

## Permissions

These [Access Control V2 permissions](../../console/settings-organization/roles-and-permissions) are in the **Policy** area unless stated.

| Task | Permissions |
|---|---|
| See the list, **View** | **Policy** page access and **Read policies** |
| **Add control**, **Duplicate**, **Restore existing**, **Replace deleted controls** | **Create policies** and **Update policies** |
| **Edit**, **Mode**, **Status**, **Re-enable existing** | **Update policies** |
| **Delete** | **Delete policies**, plus **Update policies** if the control is on |
| **Export** | **Read policies**, **Dashboards** page access, **Read dashboards**, and **Outputs** > **Preview exports** and **Create exports** (**Download exports** for the file) |

Without read access, **Browser** shows "You don't have permission to view Browser Extension policies." Without change access, the list shows **Needs policy management access**. Tenants on V1 roles use the role's Browser Extension and control permissions instead.

## If you cannot save

**Create control** (or **Save changes**) stays unavailable until the control is complete. A missing name or use case does not disable it. Selecting it shows the error next to the field. Otherwise, the footer says why:

- **Finish the open condition or action to enable saving.** Complete or remove it, including an **Activate Agent** action without a current summary.
- **Add at least one more condition to enable saving.** The use case requires a complete additional condition.
- No hint: your role cannot save controls. See [Permissions](#permissions).

If a save fails, the footer shows the reason:

- **The control conflicts with existing policy**: the name is taken (also by a control deleted with **Delete control, keep findings**), or someone saved a matching control after your check. Choose another name, or save again to see the matching control.
- **controlDescription is invalid**: remove line breaks and tabs from the **Description**.
- **The policy service rejected the request**: check each field and save again.
- **Access is restricted by Access Control V2 (no route capability allowed)**: your role is missing a [permission](#permissions).
- **The control could not be saved.** Try again later.

## Notes and limits

- **Changing a System control stops QuilrAI updates to it**, including a **Mode** or **Status** change from the list. See [System controls and Custom controls](./conditions-and-actions#system-controls-and-custom-controls).
- **Without a Just in Time action, recording differs by browser in Enforce mode.** A control with no actions still records matches in **Monitor**. See [Enforce controls without a Just in Time action](./limits-and-browser-differences#enforce-controls-without-a-just-in-time-action).

## Related pages

- [Browser Extension policy engine](./overview)
- [Conditions and actions](./conditions-and-actions)
- [How controls are evaluated](./how-controls-are-evaluated)
- [App posture and access requests](./app-posture-and-access)
- [Limits and browser differences](./limits-and-browser-differences)
