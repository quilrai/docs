---
sidebar_position: 1
sidebar_label: "Overview"
sidebar_custom_props:
  icon: BookOpen
description: "How Browser Extension controls work from save to finding: where you set each part, how browsers download and apply controls, Monitor and Enforce, and how long changes take."
console_path: []
aliases: [browser extension policy engine, browser policy engine, browser policy, browser enforcement, how browser controls work, monitor and enforce, browser control propagation]
---

# Browser Extension policy engine

Updated on 10 November 2026.

The Browser Extension policy engine decides what the QuilrAI Browser Extension does when people use web apps, for example when someone pastes customer data into an AI app. You define the rules, called controls, in the QuilrAI Console. The extension downloads them and applies them inside each user's browser.

To open the controls, go to **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector at the top right, then select **Browser** under the page title.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Browser']} />

## Key terms

| Term | Meaning |
|---|---|
| **Control** | One browser rule. It names the activity to watch for, the conditions that must hold, a mode, and the actions to take. |
| **Use case** | The activity a control watches for, chosen from the QuilrAI catalog, for example "A user is uploading sensitive data". You choose it under **When this happens** when you create the control. |
| **Risk behavior** | The kind of risky activity a use case belongs to, for example **Users Pasting Data**. Each risk behavior has a fixed rank, built into the extension, that decides which control wins when several match. |
| **Criticality** | How serious a match is, from **Very Low** to **Very High**. It breaks ties between matching controls whose risk behaviors have the same rank. It is not the finding's severity. |
| **Mode** | **Monitor** or **Enforce**. **Monitor** records a match without interrupting the user. **Enforce** applies the control's Just in Time action in the browser. |
| **Just in Time action** | The only action type that runs in the browser, at the moment the user acts, for example asking for a business reason or blocking. |
| **Remediation Action** | An action type that runs on the QuilrAI backend after a match is recorded. It sends an alert to Microsoft Sentinel. |
| **Activate Agent** | An action type that runs on the QuilrAI backend after a match is recorded. It starts a Quilly agent that follows up with the user in Slack or Microsoft Teams. |
| **System control** | A control that QuilrAI supplies. It shows the **System** tag. Several are switched on by default in **Monitor**, so matches can appear in Findings & Interactions before you create any control. They compete with your own controls. You can edit them or switch them off, but you cannot delete them. Controls your admins create are **Custom** controls. |
| **Persona** | The extension's record of which work user is using this browser. The extension creates it by registering the user's work email with QuilrAI. Without a persona, the extension downloads no controls. |
| **Browser Utility** | A small desktop program installed with the extension on Windows and macOS. It gives the extension the content of copied text and uploaded files. The deployment guides call it the Browser Agent. |

## How browser policy works

<StepFlow steps={[
  { label: "Save", items: ["In the console", "Live at once"] },
  { label: "Download", items: ["Every browser", "Every 2 minutes"] },
  { label: "Check", items: ["In the browser", "Sensitive data scan"] },
  { label: "Respond", items: ["Monitor: record only", "Enforce: popup or block"] },
  { label: "Report", items: ["Findings & Interactions"] },
]} />

1. **You save a control.** When you create or change a control on **Browser**, the save is live at once. Browser controls have no draft, test, publish step or version history, and the page shows **Saves apply immediately.**
2. **The extension downloads the controls.** Each browser downloads all switched-on controls every 2 minutes and keeps a copy, so a change reaches an open browser within about 2 minutes. A switched-off control is not sent to browsers. If a download fails, the extension keeps using the copy it already has.
3. **The extension checks each action in the browser.** When a user opens an app, signs in, submits a prompt to an AI app, sends an email in Gmail, copies or pastes text, or uploads a file, the extension compares the action with its controls. The decision is made in the browser. When several controls match the same action, the extension ranks them by risk behavior, then by criticality, and applies only the first one. It does not pick the strictest control. See [How controls are evaluated](./how-controls-are-evaluated).
4. **The extension checks content for sensitive data.** For prompts, Gmail messages and messages to chatbots embedded in websites, the extension sends the text to QuilrAI. QuilrAI reports which sensitive data types it found, based on your [Detection Models](../../console/govern/detection-models), and the extension applies its controls to that result. The send waits up to 3 seconds for this check. If QuilrAI does not answer in time, the text is sent. Copied text and uploaded files are checked the same way when the Browser Utility runs on the device.
5. **The user sees the result.** In **Monitor**, the user sees no popup and the action goes ahead. In **Enforce**, the control's Just in Time action decides what the user sees:
   - a notice that does not stop the action
   - a request for a business reason before the action continues
   - a block screen
   - for AI prompts, Gmail messages and chatbot messages that contain sensitive data, a review window that shows the data found
   - for AI prompts, automatic redaction of the sensitive data, with a short message

   A block screen can offer **Request Approval**, which sends the user's reason to [Action requests](../../console/govern/action-requests) for an admin to decide. You set the wording and branding of these popups in [User Interaction Hub](../../console/settings-sensors/user-interaction-hub). See [What users see](./conditions-and-actions#what-users-see).
6. **The extension reports the result.** The extension sends a record of each match to QuilrAI. The record appears in [Findings & Interactions](../../console/observe/findings-and-interactions) with the control that matched. **Monitor** matches are recorded too. After the record reaches QuilrAI, the control's **Remediation Action** and **Activate Agent** actions run. **Activate Agent** runs only when the control is in **Enforce**. When no control matches, the action goes ahead, and in most cases nothing is recorded.

## Where each part lives in the console

| Part | Where | What you do there | Documented in |
|---|---|---|---|
| Browser controls | **Govern > Policy Engine > Endpoint Agent > Browser** | Create, edit and duplicate controls, switch them on or off, change their mode, and delete them. | [Browser controls](./browser-controls) |
| App posture | **Observe > Inventory**, open an app, then **Controls & configuration** | Set the app's **Approval status** and **Criticality**, and block the app with the **Blocked** switch. Controls can use approval status and criticality as conditions. | [App posture and access requests](./app-posture-and-access), [Inventory](../../console/observe/inventory) |
| Extension settings | **Settings > Browser Extension** | Turn the extension on or off for your organization, set **Persona Creation**, and list sites the extension stays out of on the **Whitelist Domain & Pattern** tab. | [Extension settings](../configure/extension-settings), [Allowed domains and patterns](../configure/allowed-domains-and-patterns) |
| Per-user switch | **Observe > Users > Browser deployment** | Turn the extension on or off for selected people, and check which browsers report to QuilrAI. | [Users](../../console/observe/users) |
| Popups | **Settings > User Interaction Hub** | Set the wording, logo and policy links of the popups users see. | [User Interaction Hub](../../console/settings-sensors/user-interaction-hub) |
| Access requests | **Govern > Action Requests** | Approve or reject the requests users send from a block screen. | [Action requests](../../console/govern/action-requests) |
| Sensitive data types | **Govern > Detection Models** | Choose which kinds of sensitive data QuilrAI detects. | [Detection Models](../../console/govern/detection-models) |
| Results | **Observe > Findings & Interactions** | Review each recorded match, its outcome, and the control that matched. | [Findings & Interactions](../../console/observe/findings-and-interactions) |

:::note Desktop and Browser are separate
The **Endpoint Agent** workspace has a **Desktop** | **Browser** switch. **Desktop** is the [Endpoint Agent Policy Engine](../../endpoint-agent/policy-engine/overview), which uses drafts and publishing. The two sides do not affect each other: turning the Endpoint Agent Policy Engine on or off, or pausing it, does not change Browser controls. See [Turn on, turn off and pause](../../endpoint-agent/policy-engine/turn-on-off-and-pause).
:::

## Monitor and Enforce

Each control has a **Mode**. You set it in the control form or in the **Mode** column of the controls list. A mode change is saved at once.

- **Monitor** records the match. The user is not interrupted, and **Activate Agent** does not run.
- **Enforce** applies the control's Just in Time action in the browser when the conditions match, and lets **Activate Agent** run.

An **Enforce** control with no Just in Time action never interrupts the user, and Safari does not record its matches at all. Give every **Enforce** control a Just in Time action. See [Enforce controls without a Just in Time action](./limits-and-browser-differences#enforce-controls-without-a-just-in-time-action).

:::tip Start in Monitor
Start new controls in **Monitor**, review their findings, then switch them to **Enforce**. While a new control is in **Monitor**, it can stop an existing **Enforce** control from acting on the same activity, because the extension picks one winning control before it checks the mode. System controls that are on by default in **Monitor** can do the same. See [A Monitor control can silence an Enforce control](./how-controls-are-evaluated#a-monitor-control-can-silence-an-enforce-control).
:::

## How long changes take to reach browsers

Saves are live in QuilrAI at once. Each browser picks up a change on its own schedule: a control change within about 2 minutes, and an app's posture or an access request decision usually within about 5 minutes. For every change, see [How long changes take](./limits-and-browser-differences#how-long-changes-take).

## Notes and limits

- The extension applies controls only after it has a persona for the user. Persona options are on [Extension settings](../configure/extension-settings).
- The extension does not run on sites listed on **Whitelist Domain & Pattern**, so no control applies there. See [Allowed domains and patterns](../configure/allowed-domains-and-patterns).
- Every browser ignores a control whose top-level condition cards are joined with **OR**, although the console saves it and shows it as on. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
- Content checks for copied text and uploaded files need the Browser Utility on the device. See [Content checks need the Browser Utility](./limits-and-browser-differences#content-checks-need-the-browser-utility).
- If the Endpoint Agent also monitors an AI app in the same browser, both products can check the same prompt, and each records its own result. See [Other behavior to plan for](./limits-and-browser-differences#other-behavior-to-plan-for).

## Where each part is documented

The table in [Where each part lives in the console](#where-each-part-lives-in-the-console) links the page for each console screen. These pages cover the other topics.

| Topic | Page |
|---|---|
| Use cases, conditions and action types | [Conditions and actions](./conditions-and-actions) |
| Which control applies when several match | [How controls are evaluated](./how-controls-are-evaluated) |
| What each browser can enforce, timing and known limits | [Limits and browser differences](./limits-and-browser-differences) |
| Groups of people that conditions can target | [Smart Groups](../../console/settings-organization/smart-groups) |
| The Browser Utility (Browser Agent): content checks, switching it off, and checking the installation | [Clipboard monitoring](../capabilities/clipboard-monitoring), [File indexing](../capabilities/file-indexing), [Agent kill switch](../capabilities/agent-kill-switch), [Validate deployment](../deploy/validate-deployment) |
| Endpoint Agent policies | [Endpoint Agent Policy Engine](../../endpoint-agent/policy-engine/overview) |
| LLM Gateway and MCP Gateway policies | [Policy Engine overview](../../console/govern/policy-engine) |

## Related pages

- [Browser controls](./browser-controls)
- [Conditions and actions](./conditions-and-actions)
- [How controls are evaluated](./how-controls-are-evaluated)
- [App posture and access requests](./app-posture-and-access)
- [Limits and browser differences](./limits-and-browser-differences)
