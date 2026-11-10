---
sidebar_position: 6
sidebar_label: "Limits and browser differences"
sidebar_custom_props:
  icon: Gauge
description: "What differs between Chrome, Edge, Firefox and Safari, which Browser Extension controls do not run as saved, how long changes take, what happens when a check is slow or a browser is offline, and the size limits."
console_path: []
aliases: [browser differences, safari, firefox, chrome, edge, browser limits, control limits, fail open, browser timing, control sync time, extension offline, browser utility required, or between conditions, controls not running]
---

# Limits and browser differences

Updated on 10 November 2026.

The Browser Extension applies most controls the same way in every browser. This page lists the exceptions and limits: what each browser supports, which controls do not run as you saved them, how long changes take to reach browsers, what happens when a check is slow or a browser is offline, and the size limits.

Each item in **What each browser supports** and **Controls that do not run as saved** says what you see, why it happens, and what to do. The other sections are reference tables.

You create Browser Extension controls under **Govern > Policy Engine > Endpoint Agent > Browser**. See [Browser controls](./browser-controls).

## Key terms

| Term | Meaning |
| --- | --- |
| **Browser Utility** | A small desktop program installed with the extension on Windows and macOS. It gives the extension the content of copied text and uploaded files. The deployment guides call it the Browser Agent. |
| **Mode** | **Monitor** records a match without interrupting the user. **Enforce** applies the control's Just in Time action in the browser. |
| **Just in Time action** | The only action type that runs in the browser, for example a block, a request for a business reason, or a sensitive-data review. The other action types, **Remediation Action** and **Activate Agent**, run on the QuilrAI backend. |
| **Top-level condition card** | A condition card in **Additional conditions** that is not inside a **Group condition**. Each card after the first has an **AND** / **OR** menu. |
| **Group condition** | A condition card that holds several rows. You create one with **Add condition to group**. Each row after the first has its own **AND** / **OR** menu. |
| **Fail open** | When a check cannot finish in time, the action continues and is treated as containing no sensitive data. |

## What each browser supports

The extension has one build for Chrome, Edge and other Chromium-based browsers, one for Firefox, and one for Safari on macOS. All builds check the same activity. The only difference in how they run controls is an **Enforce** control with no **Just in Time** action.

| Behavior | Chrome, Edge and other Chromium-based browsers | Firefox | Safari on macOS |
| --- | --- | --- | --- |
| **Enforce** control with a **Just in Time** action | Enforced as saved | Enforced as saved | Enforced as saved |
| **Enforce** control with no **Just in Time** action | Runs as **Monitor**: the action continues and is recorded | Runs as **Monitor**: the action continues and is recorded | The action continues with no popup, and nothing is recorded |
| **Monitor** control | Recorded only | Recorded only | Recorded only |
| Control with **OR** between its top-level condition cards | Ignored | Ignored | Ignored |
| Prompts, Gmail sends, chatbot posts, site visits and sign-ins | Checked | Checked | Checked |
| Copy, paste and upload checks that look at content | Need the Browser Utility | Need the Browser Utility | Need the Browser Utility |

For the account chooser that some sign-ins show in Chromium-based browsers, see [Other behavior to plan for](#other-behavior-to-plan-for).

### Enforce controls without a Just in Time action

**What you see.** An **Enforce** control with only **Remediation Action** or **Activate Agent** actions never shows a popup. In Chrome, Edge and Firefox, its matches are recorded and appear in [Findings & Interactions](../../console/observe/findings-and-interactions). In Safari, its matches do not appear at all, and its **Remediation Action** and **Activate Agent** actions never run, because no match is recorded.

**Why.** Only a **Just in Time** action can act in the browser. Chrome, Edge and Firefox keep a control in **Enforce** only when it has a **Just in Time** action, and run every other control as **Monitor**. Safari runs controls exactly as saved, so it finds no browser action to take, lets the action continue, and records nothing.

**What to do.** Give every **Enforce** control a **Just in Time** action. If you only want to record activity, set **Mode** to **Monitor**, which records the same way in every browser. If you want only a follow-up action, keep in mind that it runs for Chrome, Edge and Firefox users but not for Safari users. **Monitor** mode records matches but does not run **Activate Agent**.

### Content checks need the Browser Utility

**What you see.** Copy, paste and upload controls that look at content, for example "the uploaded file contains financial data", do not match on some devices.

**Why.** The extension cannot read the clipboard or local files itself. The Browser Utility supplies the copied text and the file contents for scanning. When the Browser Utility is missing, turned off or not running, the extension behaves like this:

| Activity | With the Browser Utility | Without the Browser Utility |
| --- | --- | --- |
| Copy or paste control that checks content | The content is scanned | Conditions on the copied content or on the desktop app it was copied from (**Copied From Process**) cannot match. Controls that act on any copy or paste still work. |
| Copy control that blocks | Popup, and the clipboard is cleared | Popup only. The clipboard keeps the text. |
| Copy control that asks for a reason | Pastes are blocked in every tab until the user gives a reason. If the user closes the popup instead, the clipboard is cleared. | Popup only |
| Upload control that checks file content | The file is scanned | The upload continues after about 3 seconds without a scan |

**What to do.** Deploy the Browser Utility to every device where you use content checks. On **Observe > Users > Browser deployment**, check the **Utility** column for each user. **Not connected** means none of the user's browsers reports a connected Browser Utility, and **Off** means the Browser Utility is turned off. In both cases, content checks do not run. The column appears when your organization is licensed for the Browser Utility. See [Clipboard monitoring](../capabilities/clipboard-monitoring), [File indexing](../capabilities/file-indexing) and [Validate the deployment](../deploy/validate-deployment).

## Controls that do not run as saved

The console saves these controls without a warning, but the extension runs them differently from how they read.

### OR between top-level condition cards

**What you see.** A control saves and shows as on, but it never acts in any browser and never produces a finding.

**Why.** The extension does not support **OR** between top-level condition cards. Rather than guess what such a control means, every browser skips it. The console does not warn you.

**What to do.** Put the alternatives inside one **Group condition**:

1. In **Add to this control**, select **Add condition** and fill in the first condition (**Attribute type**, **Attribute**, **Operator** and **Value**).
2. On that card, select **Add condition to group**. The button appears once the condition is complete. The card becomes a **Group condition** with a second row.
3. Set the second row's **AND** / **OR** menu to **OR**, then fill in the row.
4. Keep the menu between top-level cards at **AND**.

| Built as | What browsers do |
| --- | --- |
| Card 1 **Category** **is equal to** Generative AI, then card 2 joined with **OR**: **Status** **is equal to** Unapproved | Ignore the whole control |
| One **Group condition**: **Category** **is equal to** Generative AI, **OR** **Status** **is equal to** Unapproved | Run the control. It matches activity in Generative AI apps and in unapproved apps. |

To match several values of one attribute, such as two app names, you do not need a group. Use one condition, for example **Name** **is in** ChatGPT, Gemini. Each attribute can be used only once in a control's additional conditions, so you cannot add two **Name** rows.

### AND and OR mixed in one group

**What you see.** A **Group condition** matches more activity than its wording suggests.

**Why.** The extension reads the rows of a group in order, from top to bottom. **AND** does not take precedence over **OR**, so "A AND B OR C" is read as "(A AND B) OR C", not "A AND (B OR C)". For example, a group with the rows **Category** is Generative AI, **AND** **Sensitive** is Yes, **OR** **Status** is Unapproved matches activity in every unapproved app, with or without sensitive data.

**What to do.** Use one kind of join inside each group: all **AND** or all **OR**. See [How conditions combine](./conditions-and-actions#how-conditions-combine).

### Prompt frequency on controls other than visits and sign-ins

**What you see.** You set **Prompt frequency** to **First occurrence** on a control for prompts or pastes, but the popup still appears every time.

**Why.** The extension applies **Prompt frequency** only to controls that act when a user visits a site or signs in. The console also offers the setting on other **Just in Time** actions, where it has no effect.

**What to do.** Use **Prompt frequency** only on visit and sign-in controls. See [How prompt frequency affects the result](./how-controls-are-evaluated#how-prompt-frequency-affects-the-result).

### More than one control matches

**What you see.** A control in **Enforce** mode matches an action, but the user sees no popup.

**Why.** When several controls match the same action, the extension applies only one of them. If the control it picks is in **Monitor** mode, the action is only recorded, even when another matching control is in **Enforce** mode. On Chrome, Edge and Firefox this includes **Enforce** controls that have no **Just in Time** action, because those browsers run them as **Monitor**. System controls that are on in **Monitor** by default also take part.

**What to do.** Avoid overlapping **Monitor** and **Enforce** controls for the same activity. See [A Monitor control can silence an Enforce control](./how-controls-are-evaluated#a-monitor-control-can-silence-an-enforce-control) and [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).

### An exception or approval skips the control

**What you see.** A control acts for most users, but not for one person, or not on one app.

**Why.** Before the extension picks a control, it removes the controls that an exception rules out: a detection turned off for the app, or an approved action request for that person. A personal access or approval value also replaces the organization's value for that person.

**What to do.** Open the app in [Inventory](../../console/observe/inventory) and check **Controls & configuration** for turned-off detections and for people with their own settings. Check [Action requests](../../console/govern/action-requests) for approvals. See [What changes the outcome for an app or a person](./how-controls-are-evaluated#what-changes-the-outcome-for-an-app-or-a-person).

## How long changes take

Browser Extension controls do not use drafts or versions. The banner on the controls page says **Saves apply immediately.** This means your change is saved in QuilrAI at once. Each browser applies it the next time it checks in:

| Change | Where you make it | When browsers apply it |
| --- | --- | --- |
| Create, edit, turn on, turn off or delete a control, or change its mode | **Govern > Policy Engine > Endpoint Agent > Browser** | Within about 2 minutes |
| An app's **Blocked** setting, **Approval status** or **Criticality**, a detection turned off, or a personal setting | **Observe > Inventory** | Usually within about 5 minutes. A browser keeps an app's details for 3 minutes. The first page load after that refreshes them in the background, and the next page load applies the change. **Bulk actions** add about 3 minutes while the queue runs. |
| Approve or revoke an action request | **Govern > Action Requests** | The same as an app setting: the approval reaches the browser with the app's details. The user may need to reload the page and try the action again. |
| Popup wording | [User Interaction Hub](../../console/settings-sensors/user-interaction-hub) | Within about 3 minutes |
| Logo and policy links in User Interaction Hub, and **Show icon on prompt** in **Settings > Browser Extension** | **Settings > User Interaction Hub**, **Settings > Browser Extension** | Within about 3 minutes, on pages loaded after that |
| **Whitelist Domain & Pattern** | **Settings > Browser Extension** | Within about 10 minutes. Pages already open keep the old setting until they reload. |
| Turn the extension on or off for a person | **Observe > Users > Browser deployment** | Within about 2 minutes |

These times assume the browser is open and online. A browser whose extension is turned off downloads no controls until it is turned back on.

:::tip Retest after a change
After you change a [detection model](../../console/govern/detection-models), retest with different text, or wait 5 minutes. The extension reuses a scan result for the same text for 5 minutes. After you change a control, wait about 2 minutes for browsers to download it.
:::

## When a check takes too long

The extension holds an action only for a limited time while it waits for a scan. If the scan does not answer in time, the action fails open: it continues and is treated as containing no sensitive data.

| Activity | Time limit | What happens at the limit |
| --- | --- | --- |
| Prompt, Gmail send or chatbot post | 3 seconds. The send is held while the text is scanned. | The message is sent. A result that arrives later is not applied. |
| Prompt, Gmail send or chatbot post while the extension is still starting | Up to three more 3-second holds | The message is sent |
| Copy or paste content scan | 10 seconds for the first scan result | The copy or paste is treated as having no sensitive data |
| File upload content scan | 4 minutes per file for the first scan result, and about 5.5 minutes for the whole upload | The files are treated as having no sensitive data |
| Upload while the Browser Utility is not running | About 3 seconds | The upload goes ahead without a content check |

Uploads are held only when a matching control could block the upload or ask for a reason. Other uploads continue without delay. While the Browser Utility scans a held upload, a **Scanning your files** popup blocks the page until the scan ends. The user can work in other tabs. Closing the tab cancels the upload, and the user must upload the files again.

:::note Files that cannot be fully scanned count as sensitive
Failing open does not apply to files the Browser Utility cannot fully scan. Examples are archives with password-protected entries, archives that exceed size or nesting limits, and file types the Browser Utility cannot read. These files count as containing sensitive data, so upload controls that act on sensitive data act on them. A file that is itself password-protected, such as a password-protected document, matches the **Encrypted** condition instead.

What to do: if users must upload such files, narrow the control with conditions, for example a **Smart Group** condition, or approve their requests in [Action requests](../../console/govern/action-requests).
:::

## When a browser cannot reach QuilrAI

| Situation | What happens |
| --- | --- |
| The device is offline, or the QuilrAI backend cannot be reached for a sensitive-data check | Content scans cannot run, so prompts, copies and uploads are treated as containing no sensitive data. Controls that do not check content still apply. |
| The extension cannot download controls | It keeps applying the controls it last downloaded, and tries again at the next 2-minute sync. Popups use the last wording it downloaded. |
| The extension has never downloaded controls, for example on a new installation with no network | No control matches, so every action goes ahead. |
| The extension has not yet linked the browser to a person (see [Extension settings](../configure/extension-settings)) | It does not download controls, so it checks nothing. |
| The extension is turned off for the user (**Observe > Users > Browser deployment**) or for your organization (**Settings > Browser Extension**) | It checks nothing and stops downloading controls. |

Activity records wait in a retry queue. A record that still fails after 5 retries, or that is older than 24 hours, is dropped. A device that stays offline for a long time can therefore leave gaps in [Findings & Interactions](../../console/observe/findings-and-interactions).

## Other behavior to plan for

- **Restored controls come back off.** If you save a control whose conditions match a deleted control, the **Control already exists** dialog offers **Restore existing**. The restored control comes back turned off. What to do: turn on its **Status** in the controls list to run it. See [Resolve a conflict](./browser-controls#resolve-a-conflict).
- **The Endpoint Agent Policy Engine does not affect Browser controls.** Turning the Endpoint Agent Policy Engine on or off, or pausing it, leaves every Browser Extension control as it is. What to do: to stop Browser controls, turn them off in the controls list, or turn the extension off in **Settings > Browser Extension**. See [Turn on, turn off and pause](../../endpoint-agent/policy-engine/turn-on-off-and-pause).
- **A device can be checked by both products.** The Endpoint Agent can also monitor browsers. On a device that runs both the Endpoint Agent and the Browser Extension, one prompt can be checked by each product, and each can show its own popup and create its own finding. What to do: to leave a browser to the Browser Extension, turn that browser off for the app under **Application Monitoring** in **Settings > Endpoint Agent**. See [Limits and behavior to know](../../endpoint-agent/policy-engine/limits-and-behavior#behavior-that-can-change-a-result-without-a-message).
- **Email controls cover Gmail only.** The extension checks email sends in Gmail in the browser. Other webmail sites are not checked. What to do: to control other webmail sites, create a control on **A user is visiting an application** with a **Domain** or **Name** condition for those sites, and choose a block or justify action.
- **Some sign-ins always show an account chooser.** In Chrome, Edge and other Chromium-based browsers, users who sign in to ChatGPT with Google, or to Microsoft Copilot or Microsoft 365 with a Microsoft account, always see the provider's account chooser, even with one signed-in account. The extension asks for the chooser so it can see which account is used. This happens whether or not you have sign-in controls. What to do: no action is needed. Tell users to expect the chooser.

## Limits

| Item | Limit |
| --- | --- |
| Control name | 1 to 200 characters |
| Conditions per control | 500 |
| Group depth | One level. A **Group condition** cannot contain another group. |
| Actions per control | 200 |
| **Just in Time** actions per control | 1 |
| **Occurrence count** (in **Prompt frequency**) | 1 to 10 |
| **Self-resolution period** (in **Prompt frequency**) | **24 hours**, **7 days** or **30 days** |
| Reason typed in a Justify popup (a popup that asks the user for a business reason) | 20 to 140 characters |
| Reason typed after **Request Approval** on a Block popup | At least 20 characters |
| Copied content the Browser Utility passes to the extension for scanning | Up to 10 KB. See [Clipboard monitoring](../capabilities/clipboard-monitoring). |
| **Whitelist Domain & Pattern** | 500 entries. Each entry up to 512 characters, each description up to 500 characters. |

## Related pages

- [Browser Extension policy engine](./overview): how Browser Extension controls work.
- [Browser controls](./browser-controls): create, edit and maintain controls.
- [Conditions and actions](./conditions-and-actions): what each condition and action does.
- [How controls are evaluated](./how-controls-are-evaluated): which control wins when several match.
- [App posture and access requests](./app-posture-and-access): app status, exceptions and approvals.
- [Allowed domains and patterns](../configure/allowed-domains-and-patterns): sites the extension does not monitor.
- [Users](../../console/observe/users): extension and Browser Utility status per user.
