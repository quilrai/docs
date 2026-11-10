---
sidebar_position: 5
sidebar_label: "App posture and access"
sidebar_custom_props:
  icon: ShieldCheck
description: "Set a web app's approval status, criticality and block for the Browser Extension, turn off detections for one app, give people their own access, and handle their access requests."
console_path: /inventory/personal-settings
aliases: [app posture, approval status, approve app, unapprove app, unapproved app, tolerated app, needs review, block app, unblock app, blocked app, app criticality, critical app, app license, app owners, bulk actions, personal settings, personal browser app settings, app exceptions, access exceptions, allow access, block access, app access, set for people, detection behaviors, disable detection, app whitelist, request approval, access request, "controls & configuration", "posture & access"]
---

# App posture and access requests

Updated on 10 November 2026.

Every web app the Browser Extension has seen has a settings page in [Inventory](../../console/observe/inventory). On it you set the app's posture, which is whether your organization approves the app, treats it as critical, or blocks it. You can also turn off a detection for that app, or give one person access or approval that differs from everyone else's. When a control blocks someone, they can ask for access, and you approve or reject the request.

<ConsolePath console="QuilrAI Console" path={['Observe', 'Inventory']} />

## Where each setting lives

| Setting | Where in the console | Who it affects |
|---|---|---|
| App posture: **Approval status**, **Criticality**, **License**, **Blocked** | **Inventory** > open an app > **Controls & configuration** > **App settings** | Everyone who uses the app |
| Approval status or block for many apps at once | **Inventory** > select rows > **Bulk actions** | Everyone who uses the selected apps |
| Detections turned off for one app | **Inventory** > open an app > **Controls & configuration** > **Detection behaviors** | Everyone who uses the app |
| Personal settings | **Inventory** > **Personal settings**, an app's **Controls & configuration**, or **Users** > a person > **App access** | One person on one app |
| Access requests | **Govern** > **Action Requests** | One person, one app, one action |

## Key terms

| Term | Meaning |
|---|---|
| **Posture** | The organization-wide settings for an app: its approval status, criticality, license and block. Posture applies to everyone in your organization who uses the app. A control's **Posture** (for example **Data Risks**) is a different setting: it is the control's risk area. |
| **App record** | One app as the Browser Extension identifies it, with its own ID and domain. One Inventory row can combine several app records with the same name, for example the same app on two domains. Each record has its own settings. |
| **Control** | One browser rule. It names the activity to watch for, the conditions that must hold, a mode, and the actions to take. See [Browser controls](./browser-controls). |
| **Detection** | A risk behavior, such as **Users Uploading Data**. Each control has one risk behavior, set by its use case. |
| **Personal setting** | An access or approval value for one person on one app. It replaces the organization's value for that person. |
| **Action request** | A request a person sends from a block message to be allowed to do the blocked action. |

## Set an app's posture

1. Open **Observe** > **Inventory** and select the app's row. The asset drawer opens.
2. Select **Controls & configuration**. This page appears only for apps the Browser Extension has seen.
3. Under **App settings**, find the card for the app record you want to change. If the row has several records, each card is headed with the record's name and domain.
4. Under **Posture & access**, change the value:
   - **Approval status** and **Owners** apply as soon as you choose them.
   - **Criticality**, **License** and the **Blocked** switch open a confirmation (**Change criticality?**, **Confirm license change** or **Confirm no-license change**, **Block app access?** or **Unblock app access?**). Select **Confirm**.
5. A message confirms the change, for example **App blocked**. If the change fails, the value returns to what it was and **Change rolled back** shows the reason.

The drawer header also shows **Browser approval** and **Browser criticality**. Choosing a value there changes every app record in the row at once. **Mixed** means the records have different values.

The same card has **Classification**, where you set the app's **Category**, **Sub-category**, **Business category** and **App type** (**Public AI**, **Private AI**, **Embedded AI**, **Hybrid AI** or **Non AI**). A classification change is saved as soon as you choose a value, with no confirmation.

### What each posture value does

| Setting | Values | What the Browser Extension does |
|---|---|---|
| **Approval status** | **Approved**, **Unapproved**, **Needs review**, **Tolerated** | Nothing on its own. Controls can test it with the app **Status** condition, for example a control that blocks unapproved AI apps. A newly discovered app is **Needs review**. |
| **Criticality** | **Critical**, **Not critical** | Nothing on its own. Controls can test it with the **Criticality** condition, for example the system password and MFA controls for critical apps. |
| **License** | **Licensed**, **Not licensed** | Nothing. License is for your records and no control uses it. The field appears only for apps that already have a license value. |
| **Blocked** switch | **Blocked**, **Not blocked** | Shows a full-screen block page on every visit to the app. Controls can also test it with the **Block status** condition. A newly discovered app is **Not blocked**. |
| **Owners** | Up to 50 people | Nothing. Owners record who is responsible for the app. |

Approval status and the **Blocked** switch are independent. Blocking an app keeps its approval status, so when you unblock the app, its earlier approval status still applies.

:::note Two kinds of criticality
The app's **Criticality** (**Critical** or **Not critical**) describes the app. A control's own **Criticality** (Very Low to Very High) describes how serious a finding is. They are separate settings.
:::

:::note Apps whose criticality was never set
An app whose criticality was never set shows **Not critical** in Inventory, but a **Criticality** **is equal to** **Not Critical** condition may not match it. To match every app that is not critical, use **Criticality** **is not equal to** **Critical**.
:::

### What people see on a blocked app

When someone opens a blocked app, the Browser Extension shows a full-screen block page and they cannot use the app from it. The block comes from built-in controls that run for every blocked app, so you do not need to create a control. People can ask for access from the block page. See [Let people request access](#let-people-request-access). To change the wording of block messages, use [User Interaction Hub](../../console/settings-sensors/user-interaction-hub).

:::warning Do not add a control to watch blocked apps
A control on **AI application blocked by organisation** or **SaaS application blocked by organisation**, in **Monitor** or **Enforce**, can outrank the built-in block, and the people it matches are then no longer blocked. The built-in block already records each blocked visit. See [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).
:::

### When the card is read-only

| What the card shows | What it means |
|---|---|
| **This app is read-only: it is managed by its source channel ... and cannot be edited here.** | This app cannot be managed from Inventory, for example because the Endpoint Agent found it or it is a custom AI app. You cannot change its posture, detections or personal settings here. |
| **You can view this app’s classification, ownership, and posture, but you don’t have permission to change them.** | Your role can view but not change browser apps. See [Permissions](#permissions). |
| **No managed app** | No app record the Browser Extension manages is behind this Inventory row. |

## Change many apps at once

Use **Bulk actions** to set the approval status or block for several apps in one step.

1. In **Inventory**, select the rows of the apps you want to change. Only applications the Browser Extension has seen can be changed.
2. Select **Bulk actions (N)**.
3. Choose an action. Each item shows how many of the selected rows it can apply to.
   - Under **Approval status**: **Approve**, **Unapprove**, **Mark as needs review** or **Tolerate**.
   - Under **Access**: **Block** or **Unblock**.
   - **Set for people** opens personal settings for the selected apps. See [Give one person their own access or approval](#give-one-person-their-own-access-or-approval).
4. Review the confirmation, for example **Block browser apps**. It lists each app record with its **ID**, **App name**, **Domain** and **Current status**. Records that are already in the chosen state, or that do not support the action, are unselected. To skip a row, clear its checkbox; this skips every record in that Inventory row.
5. Select the action button, for example **Block**.

The changes are queued and run in the background. The confirmation says they take about 3 minutes. While they run, the Inventory header shows **N app updates in progress**. When they finish, **All app updates are complete** appears and the list refreshes.

One submit can queue up to 100 apps. **Set for people** works with up to 1,000 selected rows.

## Turn off a detection for one app

Turning off a detection tells the Browser Extension to skip, on this app, every control whose **Risk behavior** is that detection. This applies to everyone in your organization and includes controls you created. Use it when a detection does not fit an app, for example a known false positive.

| Detection | Offered for |
|---|---|
| Compromised Password | All apps |
| Weak Password | All apps |
| Credential Sharing | All apps |
| Users Copying Data | All apps |
| Users Pasting Data | All apps |
| Users Uploading Data | All apps |
| Unapproved AI Applications Used | Apps whose **Category**, **Sub-category** or **Business category** is an AI category, such as Generative AI |
| MFA | All apps. One switch covers weak MFA, no MFA, and apps that do not support MFA. |

Each switch is named after its detection, for example **Weak Password detection**.

To turn off a detection:

1. Open the app in **Inventory** and select **Controls & configuration**.
2. Under **Detection behaviors**, if the row has several app records, choose one in **Application**.
3. Turn off the switch for the detection.
4. In the **Disable ... detection?** dialog, select **Confirm**. For **Credential Sharing**, keep or change the **Reason** first (**False Positive** is selected; the others are **MFA Detection Not Required** and **Authorized Use Case**).

A message confirms that the detection is disabled.

:::tip Exempt some people, not the whole app
A turned-off detection applies to everyone who uses the app. To exempt only some people, narrow the control instead, for example with a [Smart Group](../../console/settings-organization/smart-groups) condition. See [Conditions and actions](./conditions-and-actions).
:::

## Give one person their own access or approval

A personal setting gives one person a different access or approval value on one app. It takes precedence over the organization's posture for that person. For example, you can set **Block access** for one person on an app everyone else may use, or **Allow access** for one person on an app that is blocked for everyone else.

Access and approval are separate fields. One change sets one field and keeps the other as it was.

### Where to set personal settings

| Place | Use it to |
|---|---|
| **Inventory** > an app > **Controls & configuration** > **People with their own settings for ...** | See and change everyone's personal settings for one app, or add people with **Set for people** |
| **Inventory** > select rows > **Bulk actions** > **Set for people** | Set the same value for several people on several apps |
| **Inventory** > **Personal settings** | Open **Personal browser app settings**, which lists every personal setting in your organization |
| **Users** > open a person > **App access** | See every web app for one person and change their access or approval |

### Set a personal value for people

1. In an app's **People with their own settings for ...** section, or in **Inventory** > select rows > **Bulk actions**, select **Set for people**.
2. In **Choose people**, search by name or email and select up to 100 people. Select **Review apps and settings**.
3. In **Set browser app settings for people**, check the summary of people, apps and personal settings. Any selected row that has no app record you can manage is skipped, and a warning says so.
4. Choose a **Decision** (see the table below).
5. Optionally, enter an **Audit reason (optional)** of up to 1,000 characters.
6. Select **Apply**.

When the change is saved, a message says how many personal app settings were confirmed. If the change cannot be fully confirmed, the dialog keeps your selection. Select **Retry same selection**; a retry never applies the change twice.

One change covers up to 100 people, 1,000 apps and 2,000 person-and-app pairs.

| Decision | What it sets |
|---|---|
| **Allow access** (**Enable** on **App access**) | The person's access is allowed. It replaces the organization's **Blocked** setting for that person. |
| **Block access** (**Block** on **App access**) | The person's access is blocked. It replaces the organization's **Blocked** setting for that person. |
| **Approve**, **Unapprove**, **Mark as needs review**, **Tolerate** | The approval status that controls test for this person. |
| **Reset access to organization default** | Removes the personal access value. The organization's **Blocked** setting applies again. |
| **Reset approval to organization default** | Removes the personal approval value. The organization's **Approval status** applies again. |
| **Re-apply saved settings** | Sends the saved personal settings again without changing them. Use it for rows that show **Needs re-apply** or **Status unavailable**. |

### Change one person's settings on App access

1. Open **Observe** > **Users** and select **Full profile** on the person's card.
2. In the left navigation, select **App access**. It appears for people the Browser Extension has seen or been deployed to.
3. Choose **All apps (N)** or **Used by this person (N)**, and find the app.
4. Change the value on the app's row:
   - To change access, turn the access switch (**Enabled** or **Blocked**).
   - To change approval, choose a value in the approval list.
   - To go back to the organization's value, select **Reset access to organization default** or **Reset approval to organization default**.
5. In **Set browser app settings for people**, check the person, the app and the **Decision**, then select **Apply**.

Each value on the row is marked **Set for this person** or **Organization default**. Turn on **Set for this person** to show only personal values.

To change several apps for the person, select rows and choose **Change selected**. To apply one decision to every app that matches the current search and filters, choose **Change all matching apps** (up to 1,000 apps). Both open the same dialog.

### Read the personal settings list

The list shows **Person**, **Application** (on the **Personal browser app settings** page), **Personal access**, **Personal approval**, **Enforcement** and **Last changed**. A value of **Organization default** means the person has no personal value for that field. Use **Search app or email** and the **Enforcement** filter to find rows. Select rows and choose **Change selected settings** to change several at once, or use **Reset access**, **Reset approval** or **Re-apply** on a row.

| Enforcement | Meaning | What to do |
|---|---|---|
| **Confirmed** | QuilrAI saved the setting and made it available to browsers. | No action needed. |
| **Organization default** | The person has no personal setting. The organization's posture applies. | No action needed. |
| **Needs re-apply** | The setting is saved, but QuilrAI could not confirm it is ready for browsers. | Select **Re-apply**. |
| **Status unavailable** | QuilrAI could not check the setting. Do not assume it is in effect. | Select **Re-apply**, or check again later. |

**Unconfirmed change** under a status marks a recent change that is not confirmed yet. It stays visible, including when the change was a reset.

## Let people request access

When a control blocks an action, people can ask you to let them through.

<StepFlow steps={[
  { label: "Blocked", items: ["Block message", "Request Approval"] },
  { label: "Request", items: ["Justification", "20+ characters"] },
  { label: "Decide", items: ["Action Requests", "Approve or Reject"] },
  { label: "Applied", items: ["Next page load", "Usually within about 5 minutes"] },
]} />

What the person does:

1. On the block message, they select **Request Approval**. Block messages, including the block page of a blocked app, show this button.
2. They enter a justification of at least 20 characters and select **Request for approval**.
3. The message changes to **Done!** and confirms that the request was logged for an administrator to review.

What you do:

1. Open **Govern** > **Action Requests**. The request is on the **Pending** tab.
2. Read the justification and the linked finding, then select **Approve** or **Reject**.

An approval covers one person, one app and one action: **Login**, **Signup**, **Prompt**, **Copy**, **Paste**, **Upload** or **Visit**. From then on, controls for that action no longer apply to that person on that app. The approval does not expire; it lasts until you revoke it. Browsers apply it with the app's details, usually within about 5 minutes, on a page load after the details refresh. The person may need to reload the page and try the action again.

For filters, bulk decisions, revoking and email options, see [Action requests](../../console/govern/action-requests).

## How these settings affect controls

Posture and personal settings change the values that controls test, and a personal setting replaces the organization's value for that person. A turned-off detection or an approved action request removes the matching controls before the Browser Extension picks the one control that decides what happens. See [What changes the outcome for an app or a person](./how-controls-are-evaluated#what-changes-the-outcome-for-an-app-or-a-person).

## How long changes take

Browsers apply a change to **Blocked**, **Approval status**, **Criticality**, **Detection behaviors**, a personal setting or an action request usually within about 5 minutes, on a page load after the app's details refresh. Changes made with **Bulk actions** start only after the queue finishes (see [Change many apps at once](#change-many-apps-at-once)). See [How long changes take](./limits-and-browser-differences#how-long-changes-take).

In the console, the drawer shows your change at once. The Inventory list and metrics can take a few minutes to catch up.

## Permissions

Permission names come from [Roles and permissions](../../console/settings-organization/roles-and-permissions) (Access Control V2), in the **Browser** area. If your tenant still uses V1 roles, the equivalent V1 permissions apply.

| Task | Permission |
|---|---|
| View **Controls & configuration** and personal settings | **Read browser applications** |
| Change posture, classification and owners, run **Bulk actions**, and set personal settings | **Manage browser applications** |
| View and change **Detection behaviors** | **Manage browser applications** |
| View and decide action requests | Access to the **Policy** page and **Read Browser Extension** to view, plus **Manage Browser Extension** to decide. See [Action requests](../../console/govern/action-requests#before-you-start). |

## Notes and limits

- **Browser only.** The Browser Extension applies these settings. They do not block or allow desktop applications. To control a desktop application, use an Apps rule in the Endpoint Agent Policy Engine. See [Apps](../../endpoint-agent/policy-engine/files-skills-packages-apps-accounts#apps).
- **One app record at a time.** A card changes only its own app record. To block every record in a row, block each card or use **Bulk actions**, which change every record in the selected rows.
- **Sites must be matched to an app.** Posture applies to the sites QuilrAI has matched to an app. A newly seen site has no posture until QuilrAI matches it.

## Related pages

- [Browser Extension policy engine](./overview)
- [Browser controls](./browser-controls)
- [Conditions and actions](./conditions-and-actions)
- [How controls are evaluated](./how-controls-are-evaluated)
- [Limits and browser differences](./limits-and-browser-differences)
- [Action requests](../../console/govern/action-requests)
- [Inventory](../../console/observe/inventory)
- [Users](../../console/observe/users)
- [Smart Groups](../../console/settings-organization/smart-groups)
- [User Interaction Hub](../../console/settings-sensors/user-interaction-hub)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
