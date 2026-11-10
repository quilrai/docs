---
sidebar_position: 4
sidebar_label: "How controls are evaluated"
sidebar_custom_props:
  icon: Scale
description: "How the Browser Extension checks controls when a user visits a site, signs in, submits a prompt, posts into a chatbot, copies, pastes or uploads, which control wins when several match, and what happens on timeouts, offline and after a change."
console_path: []
aliases: [control precedence, which control wins, control priority, control ranking, criticality tie-break, monitor versus enforce, system controls on by default, prompt frequency, browser control timeout, extension offline, control sync time]
---

# How controls are evaluated

Updated on 10 November 2026.

This page explains what the Browser Extension does when a user acts in the browser: which controls it checks, how it picks one control when several match, and what can change the result. You create and edit the controls under **Govern > Policy Engine > Endpoint Agent > Browser**. See [Browser controls](./browser-controls).

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Browser']} />

## Key terms

| Term | Meaning |
|---|---|
| **Control** | One browser rule. It names the activity to watch for, the conditions that must hold, a mode, and the actions to take. |
| **System control** | A control that QuilrAI supplies. It shows the **System** tag. Controls that you and other admins create are **Custom** controls. |
| **Use case** | The activity a control watches for, for example **A user is pasting sensitive data**. You choose it when you create the control. It sets the control's mandatory conditions and its risk behavior. |
| **Risk behavior** | The kind of risky activity a use case belongs to, for example **Users Pasting Data**. Each risk behavior has a fixed rank, built into the extension, that decides which control wins when several match. |
| **Criticality** | How serious a match is: **Very High**, **High**, **Moderate**, **Low** or **Very Low**. It breaks ties between matching controls whose risk behaviors have the same rank. |
| **Mode** | **Monitor** records a match without interrupting the user. **Enforce** applies the control's Just in Time action in the browser. |
| **Just in Time action** | The only action type that runs in the browser, at the moment the user acts. Examples are a block, a Justify popup that asks the user for a business reason, and a Prompt notice that the user acknowledges. See [What users see](./conditions-and-actions#what-users-see). The other action types, **Remediation Action** and **Activate Agent**, run on the QuilrAI backend after the activity is recorded. |
| **Browser Utility** | A small desktop program installed with the extension on Windows and macOS. It gives the extension the content of copied text and uploaded files. The deployment guides call it the Browser Agent. |
| **Match** | A control matches an action when all of its conditions are true for that action. |

## How the extension decides, step by step

The extension makes every decision inside the browser. It downloads controls, app settings and popup wording from QuilrAI, sends text and files to QuilrAI to check for sensitive data, and sends a record of each match.

1. **Download the controls.** When the extension starts, and then every 2 minutes, it downloads every enabled control in your organization. System and Custom controls are downloaded and treated the same way.
2. **Detect the action.** When the user opens a page, signs in, submits a prompt, posts into a chatbot, copies, pastes or uploads a file, the extension checks only the controls written for that kind of action. See [Which controls are checked for each action](#which-controls-are-checked-for-each-action).
3. **Check the conditions.** For each of those controls, the extension checks whether all of its conditions are true. When a condition depends on content, such as sensitive data in a prompt or a file, QuilrAI checks the content first, using your [Detection Models](../../console/govern/detection-models).
4. **Remove controls that do not apply here.** From the matching controls, the extension removes the ones that are excused for this app or this person, for example a detection you turned off for the app or an action an admin approved for this person. It also removes controls whose popup has already appeared as often as their prompt frequency allows. See [What changes the outcome for an app or a person](#what-changes-the-outcome-for-an-app-or-a-person) and [How prompt frequency affects the result](#how-prompt-frequency-affects-the-result).
5. **Pick one winner.** The extension ranks the remaining controls by risk behavior, then by criticality. It applies only the first control. See [Which control wins when several match](#which-control-wins-when-several-match).
6. **Apply the winner.**
   - If the winner is in **Monitor**, the action goes ahead and a finding is recorded.
   - If the winner is in **Enforce**, the extension applies its Just in Time action. If the user already gave a reason on a Justify popup, or acknowledged a Prompt notice, for the same risk behavior in the same tab and on the same site, the action goes ahead without a popup.
   - If the winner is in **Enforce** but has no Just in Time action, the user is not interrupted. Chrome, Edge, other Chromium-based browsers and Firefox record a finding. Safari records nothing. See [Enforce controls without a Just in Time action](./limits-and-browser-differences#enforce-controls-without-a-just-in-time-action).

When a finding is recorded, it names the winning control in [Findings & Interactions](../../console/observe/findings-and-interactions). The QuilrAI backend keeps the extension's decision and does not rank the controls again.

## Which controls are checked for each action

The extension checks each user action only against the controls whose use case covers that action. Controls for different kinds of action do not compete. For example, a paste control is not checked when the user submits a prompt, and a prompt control is not checked when the user pastes. The one exception is a post into a chatbot, shown in the table below.

| When the user... | The extension checks controls on use cases such as |
|---|---|
| Opens a page | **AI application blocked by organisation**, **SaaS application blocked by organisation**, **A user is visiting an application**, **A user is visiting an unapproved AI app** |
| Signs in or signs up | **A user signing in and signing up to an application**, **A user is using an unapproved AI app**, **A user is using shared credentials**, and the weak, compromised and reused password use cases |
| Submits a prompt | **A user shares sensitive data with an AI application**, **A user posting data with an AI application**, **A user shares sensitive data with non-AI application**, **A user posting data with a non-AI application** |
| Posts into a chatbot on a website | **A user posting data into a chatbot**, **A user posting sensitive data into a chatbot**. When the post is checked for sensitive data, controls of the **Users Leaking Sensitive Data** risk behavior can match too. |
| Copies text | **A user is copying to clipboard**, **A user is copying sensitive data** |
| Pastes text | **A user is pasting from clipboard**, **A user is pasting sensitive data**, **A user is copy-pasting data from one app to another** |
| Uploads a file | **A user is uploading data**, **A user is uploading sensitive data**, **A user is uploading a labeled document**, **A user is uploading an encrypted file** |

The extension watches an action only when at least one enabled control covers it. For example, if no paste control is enabled, the extension does not intercept pastes at all.

Conditions about copied text and file contents work only when the Browser Utility is running on the device, because it supplies the copied text and the file contents. See [Clipboard monitoring](../capabilities/clipboard-monitoring) and [File indexing](../capabilities/file-indexing).

## How conditions are checked

- A control matches only when its mandatory conditions and all of its additional conditions are true.
- Text comparisons ignore upper and lower case.
- A condition that uses **is in** matches when the value equals any value in the list.
- Inside a group, rows are combined in order, from top to bottom. **AND** does not take precedence over **OR**. See [How conditions combine](./conditions-and-actions#how-conditions-combine).

:::warning Join top-level condition cards with AND
Every browser ignores a control whose top-level condition cards are joined with **OR**. The console still saves the control and shows it as enabled, but the control never runs and never creates a finding. Put the alternatives inside one group card instead. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
:::

## Which control wins when several match

The extension ranks the matching controls in two steps:

1. **Risk behavior rank.** Each risk behavior has a fixed rank that is built into the extension. You cannot change it in the console. The control whose risk behavior ranks higher wins.
2. **Criticality.** Between controls of the same rank, the higher criticality wins, in this order: **Very High**, **High**, **Moderate**, **Low**, **Very Low**.

If two controls have the same rank and the same criticality, which one wins is not defined. Give overlapping controls different criticality values.

The rank matters only between controls that can match the same action. Rank 1 is the highest.

| Action | Rank | Risk behavior |
|---|---|---|
| Opens a page | 1 | **Blocked AI Applications** |
| | 2 | **Blocked SaaS Applications** |
| | 3 | **Unapproved AI Applications Used**, **Visiting SaaS app**, **Newly Introduced AI Apps**, **Newly Introduced AI Users** (same rank) |
| Signs in or signs up | 1 | **SignIn and SignUp to Applications** |
| | 2 | **Unapproved AI Applications Used** |
| | 3 | **Credential Sharing** |
| | 4 | **Password Reuse** |
| | 5 | **Compromised Password** |
| | 6 | **Weak Password** |
| Posts into a chatbot on a website | 1 | **Users Posting Data to a Chatbot** |
| | 2 | **Users Leaking Sensitive Data** |

Copy, paste and upload each have one risk behavior (**Users Copying Data**, **Users Pasting Data** and **Users Uploading Data**), so criticality alone decides between their controls.

Prompts are not in the table, because their two risk behaviors never compete. A prompt is checked against **Users Posting Data** controls or against **Users Leaking Sensitive Data** controls, never both:

- If a **Users Posting Data** control applies to the user on that app, the extension applies it without checking the prompt for sensitive data. **Users Leaking Sensitive Data** controls do not run there, whatever their mode or criticality. This happens even when the **Users Posting Data** control is in **Monitor**.
- Otherwise, the extension checks the prompt for sensitive data, and criticality decides between the matching **Users Leaking Sensitive Data** controls.

Do not use **Users Posting Data** and **Users Leaking Sensitive Data** controls for the same people and apps.

While a user types a password on a sign-up form, the extension checks only **Unapproved AI Applications Used**, **Password Reuse**, **Compromised Password** and **Weak Password** controls, and an **Enforce** winner shows a notice only, whatever its action. Each control's own action applies when the user submits the form.

### A Monitor control can silence an Enforce control

:::warning
The extension picks the winner before it looks at the mode. If the winner is in **Monitor**, the action goes ahead and is only recorded, even when a lower-ranked **Enforce** control would have blocked it.

To make sure an Enforce control applies:

- Give it a higher criticality than every Monitor control of the same rank that matches the same action.
- If a Monitor control of a higher rank matches the same action, narrow that control's conditions or turn it off. Criticality cannot overcome rank.
:::

### System controls compete too

System controls are ranked exactly like Custom controls. Ten System controls are on by default, all in **Monitor**:

| Control | Risk behavior | What it matches | Criticality |
|---|---|---|---|
| **Preventing The Leakage Of Sensitive Data Via An AI App** | **Users Leaking Sensitive Data** | A prompt with sensitive data on a Generative AI app | **Moderate** |
| **Tracking Usage Of An Unapproved AI App** | **Unapproved AI Applications Used** | A sign-in or sign-up on an Unapproved Generative AI app | **Moderate** |
| **Discovering New AI App** | **Newly Introduced AI Apps** | A visit to a Generative AI app that is new in your organization | **Low** |
| **Discovering a new AI user** | **Newly Introduced AI Users** | A visit to a Generative AI app by a user who has no account on any AI app | **Low** |
| **User is copying sensitive data** | **Users Copying Data** | A copy of sensitive text on a Generative AI app | **Low** |
| **User is pasting sensitive data** | **Users Pasting Data** | A paste of sensitive text into a Generative AI app | **Low** |
| **copy-paste data from one app to another** | **Users Pasting Data** | A paste from one app to another | **Low** |
| **User is trying to upload sensitive data** | **Users Uploading Data** | An upload of sensitive content to a Generative AI app | **Low** |
| **Logging into SaaS applications using shared credentials of another non admin user** | **Credential Sharing** | A sign-in with another person's credentials, where that account's owner is not in the Admins Smart Group | **Low** |
| **Logging into SaaS applications using credentials of another admin user** | **Credential Sharing** | A sign-in with another person's credentials, where that account's owner is in the Admins Smart Group | **Very Low** |

A Custom **Enforce** control needs a higher criticality than every System control of the same rank that matches the same action. For example, **Preventing The Leakage Of Sensitive Data Via An AI App** matches every sensitive prompt on an AI application at **Moderate** criticality. A Custom **Enforce** control on the same use case therefore needs **High** or **Very High** to win. At **Moderate** the result is not defined, and at **Low** or **Very Low** the System control wins and users see no popup.

Criticality cannot help against a System control of a higher rank. On unapproved AI apps, **Tracking Usage Of An Unapproved AI App** outranks every password and shared-credential control. To enforce those controls there, narrow or turn off that System control. In the same way, when a sign-in uses another person's credentials, the two shared-credential System controls outrank every password control.

Use the **Type** filter in the controls list to show System controls. Where one overlaps your own control, raise your control's criticality, or edit or turn off the System control.

Visits to apps you mark **Blocked** in [Inventory](../../console/observe/inventory) are stopped by built-in block controls. These run in every browser at **Low** criticality, and they are not shown in the controls list. The built-in block already records a finding for each blocked visit. Do not add your own control on **AI application blocked by organisation** or **SaaS application blocked by organisation**. These use cases offer no Just in Time action, so your control cannot block. If its criticality is above **Low**, it outranks the built-in block, and the users it matches are no longer blocked. At **Low**, which of the two wins is not defined.

:::note The save check is not a ranking
When you save a control, the console refuses it if another control in the same use case has equivalent conditions. This check compares conditions only. It does not consider rank, mode or criticality, and it does not compare controls in different use cases.

The check includes System controls and controls that are turned off. To replace a System control with your own, add a condition that makes yours different, or edit the System control. See [Resolve a conflict](./browser-controls#resolve-a-conflict).
:::

## What changes the outcome for an app or a person

These settings and actions change which control can win. Most of them remove controls before ranking (step 4), and the allowed domains list stops the extension from checking at all. Because a removed control cannot win, a lower-ranked control can win instead. A one-time pass from a popup works differently: it applies after ranking, to the winning control only (step 6).

| Setting | Where you set it | Effect | Applies to |
|---|---|---|---|
| A detection turned off for an app | **Inventory** > app > **Controls & configuration** > **Detection behaviors** | Removes every control of that risk behavior on that app. | Every user of the app |
| App marked **Blocked** | **Inventory** > app > **Controls & configuration** | The built-in block controls match every visit to the app. | Every user of the app |
| App **Approval status** | **Inventory** > app > **Controls & configuration** | Changes nothing by itself. It matters only to controls that test the app's status, for example **A user is visiting an unapproved AI app**. | Every user of the app |
| An approved action request | **Govern > Action Requests** | Removes every control for that action (for example **Upload**) for that person on that app, including its content checks. | One person, one app, one action |
| A reason given on a Justify popup, or a Prompt notice acknowledged | In the browser | The next time the same risk behavior wins in the same tab, on the same site, the action goes ahead without a popup, once. For password and shared-credential controls, the pass lasts until the tab closes, for the same account and password. **Users Copying Data**, **Users Uploading Data** and **Users Posting Data** controls ask every time. Giving a reason in the [sensitive data window](./conditions-and-actions#sensitive-data-window) does not skip the next popup. | One browser tab, one site |
| Site on the allowed domains list | **Settings > Browser Extension > Whitelist Domain & Pattern** | The extension does not run on the site, so no control applies there. | Every user |

See [App posture and access requests](./app-posture-and-access), [Action requests](../../console/govern/action-requests) and [Allowed domains and patterns](../configure/allowed-domains-and-patterns).

## How prompt frequency affects the result

**Prompt frequency** is a setting on some Prompt and Justify actions. It limits how often the popup appears. For what each **Frequency** option does, see [Conditions and actions](./conditions-and-actions#prompt-frequency). The extension applies it as follows:

- It applies only to controls on page visits and sign-ins. For prompts, copies, pastes and uploads, the popup appears every time the control wins, whatever the setting.
- The count is kept for each app. Controls with the same risk behavior share one count on that app.
- It is counted separately in each browser. A different browser, or a new installation, starts counting again.
- A control that prompt frequency hides is removed before ranking (step 4), so a lower-ranked control can win instead.

## When nothing matches

If no control matches, or every matching control was removed in step 4, the action goes ahead. Nothing is shown to the user, and no finding names a control.

If you expected a control to apply, check:

- The control is enabled, and it was saved more than 2 minutes ago.
- Its top-level condition cards are joined with **AND**.
- No Monitor control of a higher rank, or of the same rank and a higher criticality, matches the same action. This includes System controls.
- The detection is not turned off for the app, and the action is not approved for the person.
- The site is not on **Whitelist Domain & Pattern**.
- Prompt frequency has not already hidden the popup, and the user did not just give a reason or acknowledge a notice for the same risk behavior in the same tab.
- The extension is turned on for the user, and it has linked the browser to that user. See [Extension settings](../configure/extension-settings).
- For a **Users Leaking Sensitive Data** control, no **Users Posting Data** control applies to the same user and app.
- For copied text and file content, the Browser Utility is running on the device.

## When a check times out or the extension is offline

The extension is designed not to block work when it cannot get an answer. If a content check is slow or QuilrAI cannot be reached, the action goes ahead and the content is treated as not sensitive. If the extension cannot download controls, it keeps using the controls it last downloaded. For each case and its time limit, see [When a check takes too long](./limits-and-browser-differences#when-a-check-takes-too-long) and [When a browser cannot reach QuilrAI](./limits-and-browser-differences#when-a-browser-cannot-reach-quilrai).

## How quickly changes take effect

Browser controls have no drafts or versions. A save applies immediately in QuilrAI, and each browser picks it up on its own schedule: a control change within about 2 minutes, and an app setting or an action request decision usually within about 5 minutes. For every change, see [How long changes take](./limits-and-browser-differences#how-long-changes-take).

## Worked example

alice@example.com is in the Finance [Smart Group](../../console/settings-organization/smart-groups), and bob@example.com is not. Both use an AI chat application in Chrome, and the Browser Utility is installed. These controls are enabled:

| Control | Use case | Mode and action | Criticality | Additional condition |
|---|---|---|---|---|
| **Preventing The Leakage Of Sensitive Data Via An AI App** (System, enabled by default) | **A user shares sensitive data with an AI application** | **Monitor** | **Moderate** | None |
| **User is pasting sensitive data** (System, enabled by default) | **A user is pasting sensitive data** | **Monitor** | **Low** | None |
| Finance prompt review (Custom) | **A user shares sensitive data with an AI application** | **Enforce**, **Allow original prompt with mandatory justification** | **High** | **Smart Group** **is in** Finance |
| Finance paste block (Custom) | **A user is pasting sensitive data** | **Enforce**, **Block user pasting sensitive data** | **High** | **Smart Group** **is in** Finance |

1. Alice pastes a customer list into the prompt box. The extension checks only the paste controls. Finance paste block and **User is pasting sensitive data** both match and have the same risk behavior, so criticality decides: **High** beats **Low**. The paste is blocked. The prompt controls are not checked.
2. Alice types a customer's card number instead and submits the prompt. The extension checks only the prompt controls. Finance prompt review and **Preventing The Leakage Of Sensitive Data Via An AI App** both match, and **High** beats **Moderate**. Alice sees the sensitive data window, gives a reason, and the prompt is sent. The finding names Finance prompt review.
3. Bob submits the same prompt. Only the System control matches. It is in **Monitor**, so the prompt is sent without a popup and a finding is recorded.
4. If Finance prompt review were set to **Moderate**, it would tie with the System control, and either control could win. At **Low**, the System control would always win, and Alice would see no popup.

## Related pages

- [Browser Extension policy engine](./overview)
- [Browser controls](./browser-controls)
- [Conditions and actions](./conditions-and-actions)
- [App posture and access requests](./app-posture-and-access)
- [Limits and browser differences](./limits-and-browser-differences)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
- [Detection Models](../../console/govern/detection-models)
- [How Endpoint Agent policies are evaluated](../../endpoint-agent/policy-engine/how-policies-are-evaluated): the Endpoint Agent uses a different model.
