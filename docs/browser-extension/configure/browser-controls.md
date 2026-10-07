---
sidebar_position: 3
sidebar_label: "Browser controls"
sidebar_custom_props:
  icon: Scale
description: "Browser Extension controls: the controls table, the add and edit form, what Enabled, Mark ready and Save changes do, and maintaining controls."
---

# Browser controls

A browser control tells the extension what to watch for and what to do when it happens, for example "a user shares sensitive data with an AI application". Controls live on the **Browser Extension** tab of the Policy Engine. For how the Policy Engine works across all surfaces, see [Policy Engine](../../console/govern/policy-engine).

<ConsolePath console="QuilrAI console" path={['Policy Engine', 'Browser Extension']} />

## Controls table

| Column | Meaning |
| --- | --- |
| **Control** | Control name and the use case it covers. |
| **Criticality** | How serious a match is, from Very Low to Very High. |
| **Mode** | **Monitor** records findings only. **Action** also applies the configured action to the user. |
| **Status** | Toggle to turn the control on or off. |
| **Updated by** / **Created by** | Who last changed the control and who created it. |

Use **Search**, the **Posture** filter (AI Risks, Data Risks, Device Risks, IT Support, MFA Risks, Password Hygiene, and more), and the **Type** filter to narrow the list. Sort by **Recently modified**. **Export** downloads the list. Each row menu has **Edit** and **Duplicate**.

## Add or edit a control

Select **Add control**, or **Edit** on a row. The form has these parts:

1. **Control details**: name, description, **Criticality** (Very Low to Very High), and **Mode** (Monitor or Action).
2. **When this happens**: the use case the control watches for (for example "A user is uploading data"). The use case, posture, and behavior are fixed once the control is created; to change them, duplicate the control.
3. **Mandatory conditions**: conditions that come with the use case. For a sensitive-data use case, these are typically that the application category is Generative AI and the data is sensitive.
4. **Additional conditions** (**Add condition**): optional conditions to narrow scope, for example to a user or smart group, an application, or a data type.
5. **Perform action**: what happens in Action mode. Depending on the use case, this can include just-in-time choices for the user (remove sensitive data and continue, continue with no, optional, or mandatory justification, or redact sensitive data), remediation such as sending an alert to syslog, or activating an AI agent for follow-up.

Then finish the form:

| Control | What it does |
| --- | --- |
| **Mark ready** | Appears on each action under **Perform action**. It commits that action once its required choices are set; for an AI agent action it also generates the task summary. Saving stays disabled while any action is not marked ready or any condition is unfinished, and the form says which. |
| **Enabled** | Whether the control runs. An inactive control is saved but does not run until it is enabled, so you can review it first. This is the same on/off state as the **Status** toggle in the table. |
| **Save changes** (or **Create control** for a new one) | Opens a **Save this control?** or **Create this control?** summary where you can still change **Enabled**. Confirm to save. **Cancel** discards your edits. |

To stage a control without running it, save it with **Enabled** off, review it, then turn it on from the **Status** toggle.

:::tip Monitor first
Start new or changed controls in **Monitor** mode, scoped to a pilot group. Review the findings for a week or two (true and false positives, affected users and apps) before you switch the control to **Action**.
:::

## What users see

In Action mode, the extension shows a popup that explains the decision. Word and brand these popups in [End-user popups](../../console/settings-sensors/end-user-popups). When a user justifies a blocked action, the request appears in [Action requests](../../console/govern/action-requests) for an admin to approve or reject.

## Maintain controls

| Task | How |
| --- | --- |
| Create a variant | Use **Duplicate**, then compare every condition and action before you enable it. |
| Retire a control | Turn off **Status** and confirm the expected findings stop. |
| Investigate unexpected results | Check the use case, conditions, [detection models](../../console/govern/detection-models), group membership, and whether the extension is reporting in **Users › Browser deployment**. |
| Confirm the outcome | Find the matching finding in [Findings and interactions](../../console/observe/findings-and-interactions) and check the control and outcome fields. |
