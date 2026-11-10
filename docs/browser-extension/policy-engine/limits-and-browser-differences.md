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

The Browser Extension applies most controls the same way in every browser. This page lists the exceptions and limits. You create Browser Extension controls under **Govern > Policy Engine > Endpoint Agent > Browser** (see [Browser controls](./browser-controls)).

## Key terms

| Term | Meaning |
|---|---|
| **Browser Utility** | A desktop program installed with the extension on Windows and macOS that passes copied text and uploaded files to the extension. Deployment guides call it the Browser Agent. |
| **Mode** | **Monitor** records a match without interrupting the user. **Enforce** applies the control's Just in Time action. |
| **Just in Time action** | The only action type that runs in the browser, such as a block or a Justify popup, which asks the user for a business reason. **Remediation Action** and **Activate Agent** run on the QuilrAI backend. |
| **System control** | A control that QuilrAI supplies, tagged **System**. Ten are on by default, all in **Monitor**. |
| **Top-level condition card** | A condition card that is not inside a **Group condition** (a card with several rows). Cards and rows after the first have an **AND** / **OR** menu. |

## What each browser supports

The extension has separate builds for Chromium-based browsers (Chrome, Edge and others), Firefox, and Safari on macOS. All builds check the same activity and run controls the same way, except an **Enforce** control with no **Just in Time** action.

### Enforce controls without a Just in Time action

Only a **Just in Time** action can act in the browser, so an **Enforce** control with only **Remediation Action** or **Activate Agent** actions never shows a popup, and the user's activity goes ahead:

- **Chromium-based browsers and Firefox** run the control as **Monitor**. They record the match as a finding in [Findings & Interactions](../../console/observe/findings-and-interactions), so the follow-up actions run.
- **Safari** runs the control as saved and records nothing, so the follow-up actions never run.

Give every **Enforce** control a **Just in Time** action. To only record activity, use **Monitor** mode, which records the same way in every browser but does not run **Activate Agent**.

### Content checks need the Browser Utility

The extension cannot read the clipboard or local files itself. Without a running Browser Utility:

- Conditions on copied content or on **Copied From Process** (the desktop app the text came from) cannot match. Controls that act on any copy or paste still work.
- Copy controls still show their popup, but a block does not clear the clipboard, and a request for a reason does not lock pastes. With the Browser Utility, pastes are blocked in every tab until the user gives a reason, and closing the popup clears the clipboard.
- An upload control that checks file content lets the upload continue unscanned after about 3 seconds.

Deploy the Browser Utility to every device that needs content checks. In **Observe > Users > Browser deployment**, a **Utility** value of **Not connected** or **Off** means content checks do not run for that user. The column appears only with a Browser Utility license. See [Clipboard monitoring](../capabilities/clipboard-monitoring), [File indexing](../capabilities/file-indexing) and [Validate the deployment](../deploy/validate-deployment).

## Controls that do not run as saved

The console saves these controls without a warning.

### OR between top-level condition cards

Every browser ignores a control whose top-level condition cards are joined by **OR**. The control shows as on, but never acts or creates a finding. Put the alternatives in one **Group condition** instead:

1. In **Add to this control**, select **Add condition** and fill in the first condition.
2. On that card, select **Add condition to group**. The button appears once the condition is complete. The card becomes a **Group condition** with a second row.
3. Set the second row's **AND** / **OR** menu to **OR**, then fill in the row.
4. Keep the menu between top-level cards at **AND**.

To match several values of one attribute, use **is in**, for example **Name** **is in** ChatGPT, Gemini. Each attribute can be used only once in a control's additional conditions, except **URL**.

### Other controls that run differently

- **A group matches more than its wording suggests.** Rows are read top to bottom, and **AND** does not take precedence over **OR**: "A AND B OR C" means "(A AND B) OR C". Use only **AND** or only **OR** inside a group. See [How conditions combine](./conditions-and-actions#how-conditions-combine).
- **Prompt frequency works only on visit and sign-in controls.** The console also offers it on other **Just in Time** actions, but there the popup appears every time. See [How controls are evaluated](./how-controls-are-evaluated#how-prompt-frequency-affects-the-result).
- **An Enforce control matches but shows no popup.** When several controls match, only one applies. If that control is in **Monitor**, the action is only recorded. A **Monitor** control can win, for example a **System** control, or, in Chromium-based browsers and Firefox, an **Enforce** control with no **Just in Time** action. Avoid overlapping **Monitor** and **Enforce** controls. See [A Monitor control can silence an Enforce control](./how-controls-are-evaluated#a-monitor-control-can-silence-an-enforce-control) and [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).
- **A control skips one person or one app.** A detection turned off for the app, or an action request approved for that person, leaves the control out of evaluation. A person's own access or approval value replaces the organization's value. Check the app's **Controls & configuration** in [Inventory](../../console/observe/inventory) and approvals in [Action requests](../../console/govern/action-requests). See [What changes the outcome for an app or a person](./how-controls-are-evaluated#what-changes-the-outcome-for-an-app-or-a-person).

## How long changes take

The banner **Saves apply immediately.** means the change is saved in QuilrAI at once, because Browser Extension controls have no drafts or versions. Each open, online browser applies it the next time it checks in:

| Change | When browsers apply it |
|---|---|
| Any control change, or turning the extension on or off for a person in **Observe > Users > Browser deployment** | Within about 2 minutes |
| An app's **Blocked** setting, **Approval status** or **Criticality**, a turned-off detection, or a personal setting in **Observe > Inventory** | Usually within about 5 minutes. A browser keeps app details for 3 minutes. The first page load after that fetches the change, and the next page load applies it. **Bulk actions** add about 3 minutes. |
| Approve or revoke an action request in **Govern > Action Requests** | Like an app setting. The user may need to reload and retry. |
| Popup wording, logo and policy links in [User Interaction Hub](../../console/settings-sensors/user-interaction-hub), and **Show icon on prompt** in **Settings > Browser Extension** | Within about 3 minutes. Logo, link and icon changes need a page load. |
| **Whitelist Domain & Pattern** in **Settings > Browser Extension** | Within about 10 minutes. Open pages keep the old setting until they reload. |

:::tip Retest after a detection model change
The extension reuses a scan result for the same text for 5 minutes. After you change a [detection model](../../console/govern/detection-models), retest with different text or wait 5 minutes.
:::

## When a check takes too long

If a scan does not answer in time, the action fails open: it continues as if it contained no sensitive data.

| Activity | Time limit |
|---|---|
| Prompt, Gmail send or chatbot post | 3 seconds, while the send is held, or up to 12 seconds while the extension is still starting. A later result is not applied. |
| Copy or paste content scan | 10 seconds |
| File upload content scan | 4 minutes per file, about 5.5 minutes per upload |

An upload is held only when a matching control could block it or ask for a reason. During the scan, a **Scanning your files** popup blocks the page. Closing the tab cancels the upload.

:::note Files that cannot be fully scanned count as sensitive
Archives with password-protected entries or over size or nesting limits, and unreadable file types, do not fail open: upload controls that act on sensitive data act on them. A password-protected file matches the **Encrypted** condition instead. If users must upload such files, narrow the control with a condition such as **Smart Group**, or approve their [action requests](../../console/govern/action-requests).
:::

## When a browser cannot reach QuilrAI

| Situation | What happens |
|---|---|
| The device is offline, or QuilrAI cannot be reached for a sensitive-data check | Content is treated as not sensitive. Controls that do not check content still apply. |
| The extension cannot download controls | It keeps its last controls and popup wording, and retries every 2 minutes. |
| The extension has never downloaded controls, such as a new installation with no network | No control matches. |
| The browser is not yet linked to a person (see [Extension settings](../configure/extension-settings)), or the extension is turned off for the user (**Observe > Users > Browser deployment**) or in **Settings > Browser Extension** | No controls are downloaded, and nothing is checked. |

Activity records that fail to send are dropped after 5 retries or 24 hours, so a device that stays offline for long can leave gaps in [Findings & Interactions](../../console/observe/findings-and-interactions).

## Other behavior to plan for

- **Restored controls come back off.** When you save a control whose conditions match a deleted control, the **Control already exists** dialog offers **Restore existing**. The restored control is turned off. Turn on its **Status**. See [Resolve a conflict](./browser-controls#resolve-a-conflict).
- **The Endpoint Agent Policy Engine does not affect Browser controls.** Its on, off and pause actions, on **Govern > Policy Engine > Endpoint Agent > Desktop**, apply only to Endpoint Agent devices. To stop Browser controls, turn them off, or turn off the extension in **Settings > Browser Extension**. See [Turn on, turn off and pause](../../endpoint-agent/policy-engine/turn-on-off-and-pause).
- **A device can be checked by both products.** If the Endpoint Agent also monitors the browser, both can check the same prompt, each with its own popup and finding. To avoid this, turn that browser off for the app under **Application Monitoring** in **Settings > Endpoint Agent**. See [Limits and behavior to know](../../endpoint-agent/policy-engine/limits-and-behavior#behavior-that-can-change-a-result-without-a-message).
- **Email controls cover Gmail only.** To control other webmail sites, create a control on **A user is visiting an application** with a **Domain** or **Name** condition and a block or justify action.
- **Some sign-ins always show an account chooser.** In Chromium-based browsers, signing in to ChatGPT with Google, or to Microsoft Copilot or Microsoft 365 with a Microsoft account, always shows the account chooser, even without sign-in controls, so the extension can see the account. Tell users to expect it.

## Limits

| Item | Limit |
|---|---|
| Control name | 1 to 200 characters |
| Conditions per control | 500. A group cannot contain another group. |
| Actions per control | 200, with at most 1 **Just in Time** action |
| **Prompt frequency** | **Occurrence count** 1 to 10. **Self-resolution period** **24 hours**, **7 days** or **30 days**. |
| Reason the user types | 20 to 140 characters in a Justify popup. At least 20 after **Request Approval** on a Block popup. |
| Copied content passed for scanning | Up to 10 KB |
| **Whitelist Domain & Pattern** | 500 entries, each up to 512 characters, with descriptions up to 500 characters |

## Related pages

- [Browser Extension policy engine](./overview)
- [Browser controls](./browser-controls)
- [Conditions and actions](./conditions-and-actions)
- [How controls are evaluated](./how-controls-are-evaluated)
- [App posture and access requests](./app-posture-and-access)
- [Allowed domains and patterns](../configure/allowed-domains-and-patterns)
- [Users](../../console/observe/users)
