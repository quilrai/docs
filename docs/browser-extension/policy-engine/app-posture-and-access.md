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

Every web app the Browser Extension has seen has settings in [Inventory](../../console/observe/inventory). There you set the app's posture, turn off detections, and give one person different access or approval. When a [control](./browser-controls) blocks someone, they can request access, and you decide.

<ConsolePath console="QuilrAI Console" path={['Observe', 'Inventory']} />

## Key terms

| Term | Meaning |
|---|---|
| **Posture** | An app's organization-wide **Approval status**, **Criticality**, **License** and **Blocked** setting. Not the same as a control's **Posture** field (for example **Data Risks**), which is its risk area. |
| **App record** | One app as the Browser Extension identifies it, with its own ID, domain and settings. An Inventory row can combine several same-named records, such as one app on two domains. |
| **Detection** | A risk behavior, such as **Users Uploading Data**. Each control has one. |
| **Personal setting** | An access or approval value for one person on one app. It replaces the organization's value for that person. |

## Set an app's posture

1. Open **Observe** > **Inventory** and select the app's row.
2. In the drawer, select **Controls & configuration**.
3. Under **App settings**, find the card for the app record. If the row has several records, each card is headed with the record's name and domain.
4. Under **Posture & access**, change the value. **Approval status** and **Owners** apply at once; **Criticality**, **License** and **Blocked** ask you to **Confirm**.

If a change fails, the value reverts and **Change rolled back** shows why. **Browser approval** and **Browser criticality** in the drawer header change every record in the row; **Mixed** means the records differ. **Classification** on the card (**Category**, **Sub-category**, **Business category**, **App type**) saves without confirmation.

### What each posture value does

| Setting | Values | Effect |
|---|---|---|
| **Approval status** | **Approved**, **Unapproved**, **Needs review** (default for new apps), **Tolerated** | None on its own. Controls test it with the **Status** condition. |
| **Criticality** | **Critical**, **Not critical** | None on its own. Controls test it with the **Criticality** condition, for example the system password and MFA controls. A control's own **Criticality** (Very Low to Very High) is separate and rates a finding. |
| **Blocked** | **Blocked**, **Not blocked** (default for new apps) | A full-screen block page on every visit. Controls can test it with **Block status**. |

**License** (shown only if the app already has a value) and **Owners** (up to 50 people) are for your records; no control uses them.

Blocking keeps the approval status, so it applies again when you unblock the app.

:::note Criticality that was never set
An app whose criticality was never set shows **Not critical**, but a **Criticality** **is equal to** **Not Critical** condition may not match it. To match every non-critical app, use **Criticality** **is not equal to** **Critical**.
:::

### What people see on a blocked app

Built-in controls show the block page for every blocked app, so you do not need to create a control. People can [request access](#let-people-request-access) from it. Change its wording in [User Interaction Hub](../../console/settings-sensors/user-interaction-hub).

:::warning Do not add a control to watch blocked apps
A **Monitor** or **Enforce** control on **AI application blocked by organisation** or **SaaS application blocked by organisation** can outrank the built-in block and unblock the people it matches. The built-in block already records each visit. See [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).
:::

### When the card is read-only

- **This app is read-only ...**: another source manages it, such as the Endpoint Agent, or it is a custom AI app. You cannot change its posture, detections or personal settings here.
- **You can view this app’s classification, ownership, and posture, but ...**: your role cannot change it. See [Permissions](#permissions).
- **No managed app**: no Browser Extension app record is behind this row.

## Change many apps at once

1. In **Inventory**, select rows. Only apps the Browser Extension has seen can be changed.
2. Select **Bulk actions (N)** and choose an action.
   - **Approval status**: **Approve**, **Unapprove**, **Mark as needs review**, **Tolerate**.
   - **Access**: **Block**, **Unblock**.
   - **Set for people**: [personal settings](#give-one-person-their-own-access-or-approval) for up to 1,000 rows.
3. Review the confirmation. Records already in that state, or that do not support the action, are unselected. To skip a row, clear its checkbox; this skips every record in that row.
4. Select the action button, for example **Block**.

One submit queues up to 100 apps, which update in the background in about 3 minutes. The Inventory header shows **N app updates in progress**, and then **All app updates are complete**, only when you open Inventory while updates are still pending. They usually do not appear on the page where you submitted.

## Turn off a detection for one app

Turning off a detection skips every control with that **Risk behavior** on this app, for everyone. This includes controls you created. Use it for a detection that does not fit the app, such as a known false positive. To exempt only some people, narrow the control instead, for example with a [Smart Group](../../console/settings-organization/smart-groups) condition.

| Detection | Offered for |
|---|---|
| Compromised Password, Weak Password, Credential Sharing, Users Copying Data, Users Pasting Data, Users Uploading Data, MFA (one switch for weak MFA, no MFA, and apps without MFA support) | All apps |
| Unapproved AI Applications Used | Apps with an AI **Category**, **Sub-category** or **Business category**, such as Generative AI |

1. Open the app's **Controls & configuration**.
2. Under **Detection behaviors**, if the row has several records, choose one in **Application**.
3. Turn off the switch, for example **Weak Password detection**, and select **Confirm**. For **Credential Sharing**, first set **Reason**: **False Positive** (default), **MFA Detection Not Required** or **Authorized Use Case**.

## Give one person their own access or approval

A personal setting replaces the app's **Blocked** setting or **Approval status** for one person on one app. For example, set **Block access** for one person on an app everyone else may use, or **Allow access** on a blocked app. Access and approval are separate fields; changing one keeps the other.

### Set a personal value for people

1. In the app's **Controls & configuration**, the **People with their own settings for ...** section lists that app's personal settings. Select **Set for people** there, or in **Bulk actions**.
2. In **Choose people**, select up to 100 people and select **Review apps and settings**.
3. In **Set browser app settings for people**, check the summary. Rows with no app record you can manage are skipped, with a warning.
4. Choose a **Decision**. Optionally, enter an **Audit reason (optional)** of up to 1,000 characters.
5. Select **Apply**.

If the change cannot be fully confirmed, select **Retry same selection**; a retry never applies it twice. One change covers up to 100 people, 1,000 apps and 2,000 person-and-app pairs.

| Decision | Sets for the person |
|---|---|
| **Allow access** or **Block access** (**Enable** or **Block** on **App access**) | Access, replacing the organization's **Blocked** setting. |
| **Approve**, **Unapprove**, **Mark as needs review**, **Tolerate** | The approval status that controls test. |
| **Reset access to organization default**, **Reset approval to organization default** | Removes that personal value; the organization's value applies again. |
| **Re-apply saved settings** | Sends the saved settings again unchanged. |

### Change one person's settings on App access

1. In **Observe** > **Users**, select **Full profile** on the person's card, then **App access**. It appears for people the Browser Extension has seen or been deployed to.
2. Choose **All apps (N)** or **Used by this person (N)** and find the app.
3. Turn the access switch (**Enabled** or **Blocked**), choose an approval value, or select a reset.
4. In **Set browser app settings for people**, select **Apply**.

Each value shows **Set for this person** or **Organization default**. Turn on **Set for this person** to show only personal values.

**Change selected** changes selected rows; **Change all matching apps** changes every app matching the search and filters (up to 1,000).

### Read the personal settings list

**Inventory** > **Personal settings** opens **Personal browser app settings**, which lists every personal setting in your organization. Each row shows **Personal access**, **Personal approval**, **Enforcement** and **Last changed**, with **Re-apply**, **Reset access** and **Reset approval**; **Change selected settings** changes several rows.

| Enforcement | Meaning |
|---|---|
| **Confirmed** | Saved and available to browsers. |
| **Organization default** | No personal setting; the posture applies. |
| **Needs re-apply** | Saved, but QuilrAI could not confirm it is ready for browsers. Select **Re-apply**. |
| **Status unavailable** | QuilrAI could not check it. Do not assume it is in effect. Select **Re-apply** or check later. |

**Unconfirmed change** marks a recent change, including a reset, not yet confirmed.

## Let people request access

1. On a block message, including a blocked app's page, the person selects **Request Approval**, writes a justification of at least 20 characters, and selects **Request for approval**.
2. In **Govern** > **Action Requests** > **Pending**, read the justification and linked finding, then select **Approve** or **Reject**.

An approval covers one person, one app and one action (**Login**, **Signup**, **Prompt**, **Copy**, **Paste**, **Upload** or **Visit**): that action's controls stop applying to them on that app. It lasts until you revoke it. Browsers apply it usually within about 5 minutes, on a page load; the person may need to reload and try again. See [Action requests](../../console/govern/action-requests) for filters, bulk decisions, revoking and email.

## How these settings affect controls

Posture and personal settings change the values controls test. A turned-off detection or an approved request removes matching controls before the Browser Extension picks the winning control. See [How controls are evaluated](./how-controls-are-evaluated#what-changes-the-outcome-for-an-app-or-a-person).

## Permissions

These are Access Control V2 permissions in the **Browser** area of [Roles and permissions](../../console/settings-organization/roles-and-permissions). If your tenant uses V1 roles, the equivalent V1 permissions apply.

| Task | Permission |
|---|---|
| View **Controls & configuration** and personal settings | **Read browser applications** |
| Change posture, classification, owners and personal settings; **Bulk actions**; view or change **Detection behaviors** | **Manage browser applications** |
| Action requests | **Policy** page access and **Read Browser Extension** to view; add **Manage Browser Extension** to decide. See [Before you start](../../console/govern/action-requests#before-you-start). |

## Notes and limits

- **Browser only.** Desktop applications need an [Apps rule](../../endpoint-agent/policy-engine/files-skills-packages-apps-accounts#apps) in the Endpoint Agent Policy Engine.
- **One record per card.** To block every record in a row, block each card or use **Bulk actions**.
- **Unmatched sites** have no posture until QuilrAI matches them to an app.
- **Timing.** Browsers apply changes usually within about 5 minutes, on a page load after app details refresh; bulk changes start after the queue finishes. Inventory lists and metrics can lag the drawer by a few minutes. See [How long changes take](./limits-and-browser-differences#how-long-changes-take).

## Related pages

- [Browser Extension policy engine](./overview)
- [Browser controls](./browser-controls)
- [Conditions and actions](./conditions-and-actions)
- [How controls are evaluated](./how-controls-are-evaluated)
- [Limits and browser differences](./limits-and-browser-differences)
- [Action requests](../../console/govern/action-requests)
- [Inventory](../../console/observe/inventory)
- [Users](../../console/observe/users)
