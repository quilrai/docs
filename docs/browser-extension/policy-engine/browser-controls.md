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

A browser control is one rule for the QuilrAI Browser Extension. It says which activity to watch for, such as a user uploading sensitive data, when the rule applies, and what happens when the activity matches. This page shows how to find, create, change and remove controls. For how the pieces fit together, see [Browser Extension policy engine](./overview).

Open **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector, then select **Browser** under the page title. **Desktop**, on the other side of the switch, holds the Endpoint Agent's own policies. See [Endpoint Agent Policy Engine](../../endpoint-agent/policy-engine/overview).

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Browser']} />

:::note Saves apply immediately
Browser controls have no draft, test or publish step. Every save, mode change, status change and delete takes effect on the live control at once. Browsers apply the change at their next sync, about every 2 minutes. Only controls that are turned on reach browsers.
:::

## Key terms

| Term | Meaning |
|---|---|
| **Use case** | The activity a control watches for, chosen from the QuilrAI catalog, for example "A user is uploading sensitive data". The editor shows it under **When this happens**. |
| **Posture** | The risk area the use case belongs to, for example **Data Risks** or **AI Risks**. The use case sets it. |
| **Risk behavior** | The kind of risky activity a use case belongs to, for example **Users Uploading Data**. The use case sets it, and it decides which control wins when several match. |
| **Mandatory conditions** | Conditions the use case adds for you. You cannot remove them. |
| **Additional conditions** | Conditions you add to narrow the control, for example to a Smart Group or an application. Some use cases require at least one. |
| **Action** | What happens when the control matches. A **Just in Time** action runs in the browser, for example a popup that blocks the activity. A **Remediation Action** or an **Activate Agent** action runs afterwards, on the QuilrAI backend. See [Actions](#actions). |
| **Mode** | **Monitor** records a match without interrupting the user. **Enforce** applies the control's Just in Time action in the browser. An **Enforce** control without a Just in Time action does not interrupt the user. |
| **Criticality** | How serious a match is, from **Very Low** to **Very High**. It breaks ties between matching controls whose risk behaviors have the same rank. Findings from the control display it. It is not the finding's severity. |
| **Status** | Whether the control is turned on. The editor and the summary dialog call this **Enabled**. A control that is off is kept but does not run. |
| **System** and **Custom** | **System** controls are supplied by QuilrAI. **Custom** controls are created by your admins. |

A control with no actions still records matching activity while it is in **Monitor** mode. For an **Enforce** control without a **Just in Time** action, what is recorded differs by browser. See [Enforce controls without a Just in Time action](./limits-and-browser-differences#enforce-controls-without-a-just-in-time-action).

:::note Changing a System control
When you change a **System** control in any way, including its **Mode** or its **Status** from the list, QuilrAI no longer updates that control for your organization. See [How System controls differ from Custom controls](./conditions-and-actions#system-controls-and-custom-controls).
:::

For how conditions and actions work in detail, see [Conditions and actions](./conditions-and-actions). For which control wins when several match, see [How controls are evaluated](./how-controls-are-evaluated#which-control-wins-when-several-match).

## The controls list {#controls-table}

The **Browser Extension controls** list shows your tenant's controls, except deleted controls and a few built-in controls that QuilrAI manages. These hidden controls include the ones that block apps you mark **Blocked** in [Inventory](../../console/observe/inventory). They still run in every browser. See [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).

| Column | What it shows |
|---|---|
| **Control** | The control name and, under it, the use case. **System** controls carry a **System** tag. Select the name to open the control. |
| **Criticality** | **Very High**, **High**, **Moderate**, **Low** or **Very Low**. |
| **Mode** | A **Monitor** / **Enforce** switch. |
| **Status** | An on/off toggle. |
| **Smart groups** | The Smart Groups used in the control's user **Smart Group** conditions. **Includes** lists groups used with "is equal to" or "is in"; **Excludes** lists groups used with "is not equal to" or "is not in". The column does not show how conditions are joined, so open the control to read the full logic. |
| **Actions** | The control's top-level actions, by type and name. Further actions set under an action's outcomes are not listed here. |
| **Updated** and **Created** | Who last changed the control and who created it, and how long ago. For **System** controls, QuilrAI is shown as the creator. |

Each row ends with **Edit** (or **View** if you cannot make changes) and a **⋯** menu with **Duplicate** and **Delete**. **System** controls have no **Delete**.

### Find a control

- **Search controls** matches any part of a control name. Letter case does not matter.
- **Filters** narrows the list to one **Posture**, and to a **Type** of **System** or **Custom**. Clearing the filters also clears the search.
- The sort menu orders the list by **Recently modified** (the default), **Oldest modified**, **Recently created** or **Oldest created**.
- Each page shows 10 rows by default. You can show up to 50.

The page URL keeps your search, filters, sort and page, so you can bookmark or share a view of the list.

If the list cannot load, a banner with **Try again** replaces it.

### Change mode or status from the list

Select **Monitor** or **Enforce** in the **Mode** column, or use the **Status** toggle. The change saves at once, without a confirmation step. A message confirms the change and offers **Undo** for 8 seconds.

- **Undo** makes a second change that reverses the first. A browser that synced in between applies the first change until its next sync.
- After a status change, **Undo** appears only if your role can also make the reverse change.
- If a change fails, the row returns to its previous value and a **Change rolled back** message gives the reason.

## Add a control {#add-or-edit-a-control}

1. Select **Add control**. The **Add control** panel opens. A progress bar at the top lists the sections; select a section to jump to it.
2. In **Control details**, enter a **Control name**, choose the **Criticality** and add a **Description** if you want one. While you set the control up, leave **Mode** on **Monitor** and **Enabled** off. See [Control details](#control-details).
3. In **When this happens**, choose a use case. See [Choose the use case](#choose-the-use-case).
4. Review **Mandatory conditions**, if the use case adds any.
5. Select **Add condition** to narrow the control. Some use cases require at least one additional condition; the editor then shows a warning under the use case. See [Conditions](#conditions).
6. Optional: select **Perform action** to set what happens when the control matches. See [Actions](#actions).
7. Select **Create control**. The **Create this control?** summary opens. Check it and select **Create control**. See [Review the summary](#review-the-summary). If **Create control** is unavailable, see [If you cannot save](#if-you-cannot-save).
8. QuilrAI checks that no other control already covers the same use case and conditions. If none does, the control is saved and a **Control created** message appears. If one does, the **Control already exists** dialog opens. See [Resolve a conflict](#resolve-a-conflict).

The name and the use case cannot be changed after you create the control. See [Edit a control](#edit-a-control).

To close the panel without saving, select **Cancel**. If you have unsaved changes, the console asks you to confirm with **Discard changes**. Select **Keep editing** to go back.

### Control details

| Field | What to know |
|---|---|
| **Control name** | Required, up to 200 characters. Names must be unique in your tenant. Names that differ only in letter case or punctuation count as the same name. |
| **Criticality** | **Very Low** to **Very High**. The default is **High**. |
| **Description** | Optional. Keep it on one line: a line break makes the save fail. |
| **Mode** | **Monitor** (the default) or **Enforce**. See **Mode** in [Key terms](#key-terms). |
| **Enabled** | Off by default. An inactive control is saved but does not run, so you can review it first. |

### Choose the use case

The use case decides what the control is about. Find one with **Search use cases**, or filter the catalog by **Posture** and **Risk behavior**, then select it.

Choosing a use case also sets its posture and risk behavior and adds its mandatory conditions. You cannot choose the risk behavior on its own.

**Remove** clears the use case and every condition and action below it.

### Conditions

**Mandatory conditions** come from the use case and carry a **Required** tag. You cannot remove them. Where the use case allows it, you can change a mandatory condition's attribute, operator or value.

**Additional conditions** narrow the control further: it applies only where these conditions also hold. To add one:

1. Select **Add condition**.
2. Set the **Attribute type**, for example **User**. It is shown only when there is more than one.
3. Set the **Attribute** (for example **Smart Group**), the **Operator** (for example **is not in**) and the **Value** (for example Finance). Each field appears once the field before it is set.
4. From the second additional condition on, use the **AND** / **OR** menu to choose how each one joins the conditions above it.
5. To combine several conditions in one card, select **Add condition to group** on a finished condition. A group cannot contain another group.

Use **Remove condition**, **Remove group** or **Remove all** to take conditions out. **Remove all** keeps the mandatory conditions. For the attributes, operators and how conditions combine, see [Narrow the control with conditions](./conditions-and-actions#conditions).

:::warning Put OR inside a group
Browsers ignore a control whose top-level condition cards are joined by **OR**. Join top-level cards with **AND**, and put "this or that" inside one group. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
:::

### Actions

To add an action:

1. Select **Perform action**. An action card opens.
2. Choose the **Action type**, then the **Action**. The action types are **Just in Time**, **Remediation Action** and **Activate Agent**. The use case decides which types and actions are offered.
3. Fill in the fields the action shows:
   - **Policy**: required for **Activate Agent**. It is the organizational policy the agent answers from.
   - **Tone**: optional, for **Activate Agent**.
   - **Prompt frequency**: shown for some **Just in Time** actions. It limits how often the popup appears, and it applies only to visits and sign-ins. See [Limit how often a popup appears](./conditions-and-actions#prompt-frequency).

   For each field in detail, see [Choose what happens when the control matches](./conditions-and-actions#actions).
4. If the action lists outcomes, you can select **Add further action** under an outcome to add another action that follows it.

To delete an action, select **Remove action**. A control can have one **Just in Time** action, and it cannot be a further action. In **Monitor** mode, **Just in Time** and **Activate Agent** actions do not run. They run once you switch the control to **Enforce**. For what each action type and action does, see [Which action types you can use](./conditions-and-actions#action-types).

Each action card shows a status tag:

| Tag | Meaning |
|---|---|
| **Ready** | The action is complete. |
| **Incomplete** | Fields are missing. |
| **Needs summary** | An **Activate Agent** action is complete but has no current agent summary. |

An **Activate Agent** action is the only action you confirm yourself. When its fields are complete, select **Generate agent summary**. QuilrAI summarizes what the agent will do and the action turns **Ready**. Any later change to that action, even to **Tone**, sets it back to **Needs summary**; select **Update agent summary** to confirm it again.

If a summary cannot be created, a **Summary unavailable** message gives the reason. You cannot save the control until a summary is created. To save your other changes without it, remove the **Activate Agent** action.

### Review the summary

The **Create this control?** dialog (**Save this control?** when you edit) lists what will be saved: **Control name**, **Description**, **Criticality**, **Mode**, **When this happens**, **Posture**, **Risk behavior**, **Conditions** and **Actions**. **Conditions** shows the total and how many the use case requires, for example "3 (1 required by the use case)". A group counts as one condition.

- Turn on **Enabled** here if the control should run as soon as it is saved.
- **Back** returns to the panel. Confirming runs the conflict check and saves the control.

:::tip Start in Monitor
Start a new or changed control in **Monitor** mode, scoped to a pilot group with a Smart Group condition. Review its findings in [Findings & Interactions](../../console/observe/findings-and-interactions) for a week or two, checking both correct and unwanted matches, then switch it to **Enforce**.
:::

## Edit a control

1. Select **Edit** on the row, or select the control name.
2. Change what you need, then select **Save changes**.
3. Review the **Save this control?** summary and confirm. A **Control updated** message appears.

You can change the description, criticality, mode, conditions, actions and **Enabled**.

The **Control name**, use case, posture and risk behavior are fixed once the control exists. To use a different name or use case, [duplicate the control](#duplicate-a-control) and change the copy, or add a new control.

If your role can read but not change controls, the row shows **View** instead of **Edit**, and the panel says it cannot save changes.

## Duplicate a control

1. On the row, select **⋯ > Duplicate**. The **Duplicate control** panel opens with a copy named "Copy - *original name*". The copy has the same description, criticality, mode, use case, conditions and actions, with **Enabled** off.
2. Rename the copy if you want, and change at least one condition or the use case.
3. Select **Create control** and confirm the summary.

A copy with the same use case and conditions as its source conflicts with it, so change something before you save. Duplicating a **System** control creates a **Custom** control.

## Resolve a conflict {#resolve-a-conflict}

QuilrAI does not keep two controls with the same use case and conditions that mean the same thing. The order and grouping of the conditions do not matter. When you save, QuilrAI compares your control with active and inactive controls, and with controls deleted with **Delete control, keep findings**. If it finds a match, the **Control already exists** dialog lists each matching control with its state and your options:

| State | Option | What happens |
|---|---|---|
| **Active** | None | The dialog says "Disable the active control before replacing it." |
| **Inactive** | **Re-enable existing** | Your draft is discarded and the existing control is turned on. |
| **Deleted and disabled** | **Restore existing** | Your draft is discarded and the existing control comes back to the list, turned off. |

**Re-enable existing** and **Restore existing** ask you to confirm with **Abandon draft and enable** or **Abandon draft and restore**. Select **Keep draft** to go back.

:::warning A restored control stays off
After **Restore existing**, the control is back in the list but turned off. Turn it on with its **Status** toggle when you want it to run.
:::

The dialog also offers:

- **Return to draft** goes back to the panel without saving.
- **Replace deleted controls** appears when you add or duplicate a control and every matching control is deleted. Confirm with **Delete conflicts and create**: QuilrAI permanently deletes those controls and their findings, then creates yours. This cannot be undone.

Choose the outcome you want:

- **To keep the existing control**, select **Re-enable existing** or **Restore existing**. Your draft is discarded.
- **To keep your draft**, select **Return to draft** and change its conditions so they no longer match an existing control.
- **To replace an existing control with yours**, close the panel without saving, delete the matching active and inactive controls from the list, then add your control again. When every match left is a deleted control, the dialog offers **Replace deleted controls**.

When you edit a control, **Replace deleted controls** is not offered. Change the conditions so they no longer match an existing control.

## Delete a control

1. On the row, select **⋯ > Delete**. A dialog opens and counts the control's findings.
2. Choose how to delete it:

| Button | Shown when | Result |
|---|---|---|
| **Delete control, keep findings** | The control has findings | The control leaves the list. Its findings are not deleted. |
| **Delete control and findings** | The control has findings | The control and its findings are deleted permanently. |
| **Delete control** | The control has no findings | The control is deleted permanently. |

- If the control is on, the console turns it off before deleting it. If the delete then fails, the control is turned back on.
- **System** controls cannot be deleted. Turn them off instead.
- After **Delete control, keep findings**, the control's name stays reserved, so saving a new control with that name fails with **The control conflicts with existing policy**. Use a different name. After a permanent delete, the name is free again.
- To bring back a control deleted with **Delete control, keep findings**, add a control with the same use case and conditions under a different name. The **Control already exists** dialog then offers **Restore existing** for the deleted control. See [Resolve a conflict](#resolve-a-conflict).

## Export the list

Select **Export**. [Export Center](../../console/settings-data/export-center) opens with a new **Policy Engine** export, already limited to Browser Extension controls and to the list's current search, **Posture** and **Type** filters and sort. Review the export there, then create it.

In the export, the search also matches control descriptions, so the export can include more rows than the list showed.

**Export** is unavailable when the list is empty.

## Check a control's results

- Find matching activity in [Findings & Interactions](../../console/observe/findings-and-interactions). A finding raised by a control has an **Open control** link that opens the control on this page.
- People see the popups that **Just in Time** actions show. You brand and word them in [User Interaction Hub](../../console/settings-sensors/user-interaction-hub).
- When a Block popup offers **Request Approval**, the requests people send appear in [Action requests](../../console/govern/action-requests).
- If a control matches too much or too little, check its use case and conditions, the [Smart Groups](../../console/settings-organization/smart-groups) it names, and the [Detection Models](../../console/govern/detection-models) settings that decide what counts as sensitive data.
- Control changes are recorded in [Audit logs](../../console/settings-organization/audit-logs).

## Permissions

Permission names come from [Roles and permissions](../../console/settings-organization/roles-and-permissions) (Access Control V2), in the **Policy** area unless the table names another area.

| Task | Permissions needed |
|---|---|
| See the controls list and open controls with **View** | Access to the **Policy** page, and **Read policies** |
| **Add control** and **Duplicate** | **Create policies** and **Update policies** |
| **Edit**, change **Mode**, turn **Status** on or off, **Re-enable existing** | **Update policies** |
| **Restore existing** and **Replace deleted controls** | **Create policies** and **Update policies** |
| **Delete** | **Delete policies**, plus **Update policies** when the control is on |
| **Export** | **Read policies**, plus what Export Center needs: access to the **Dashboards** page, **Read dashboards**, and in the **Outputs** area **Preview exports** and **Create exports** (**Download exports** to download the file) |

**Browser** shows for everyone. Without read access, it shows "You don't have permission to view Browser Extension policies." instead of the list.

If your role cannot change controls, the list shows **Needs policy management access**. Buttons you cannot use are unavailable or hidden. Many unavailable buttons explain why when you point to them.

This table applies to Access Control V2. If your tenant still uses V1 roles, the role's Browser Extension and control permissions decide access instead.

## If you cannot save

**Create control** (or **Save changes**) stays unavailable until the control is complete. The footer says why:

| Footer hint | What to do |
|---|---|
| **Finish the open condition or action to enable saving.** | Complete or remove the unfinished condition or action. An **Activate Agent** action without a current agent summary also counts as unfinished. |
| **Add at least one more condition to enable saving.** | This use case requires at least one complete additional condition, so the control does not disrupt work too broadly. Add one. |
| No hint | Your role cannot save controls. See [Permissions](#permissions). |

**Add condition** is unavailable while a condition is unfinished, and **Perform action** while an action is unfinished. A missing name or use case does not make the button unavailable: selecting it shows the error next to the field. **Smart Assist** in the footer opens help for this form.

When a save does not go through, the message appears in the panel footer:

| Message | Meaning | What to do |
|---|---|---|
| **The control conflicts with existing policy** | Another control already uses this name, including one deleted with **Delete control, keep findings**. Or someone saved a matching control after your check. | Choose another name, or save again to see the matching control. |
| **controlDescription is invalid** | The **Description** contains a line break or a tab. | Put the description on one line and save again. |
| **The policy service rejected the request** | QuilrAI did not accept the control as entered. | Check each field and try again. |
| **Access is restricted by Access Control V2 (no route capability allowed)** | Your role is missing a permission. | See [Permissions](#permissions). |
| **The control could not be saved.** | QuilrAI could not complete the save. | Try again later. |

## Related pages

- [Browser Extension policy engine](./overview)
- [Conditions and actions](./conditions-and-actions)
- [How controls are evaluated](./how-controls-are-evaluated)
- [App posture and access requests](./app-posture-and-access)
- [Limits and browser differences](./limits-and-browser-differences)
