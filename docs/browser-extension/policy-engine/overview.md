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
| **Control** | One browser rule: the activity to watch for, the conditions that must hold, a mode, and actions. |
| **Use case** | The activity a control watches for, chosen from the QuilrAI catalog under **When this happens**, for example "A user is uploading sensitive data". |
| **Risk behavior** | The kind of risky activity a use case belongs to, for example **Users Pasting Data**. Its fixed rank decides which control wins when several match. |
| **Criticality** | How serious a match is, from **Very Low** to **Very High**. It breaks ties when matching controls have risk behaviors of the same rank. It is not the finding's severity. |
| **Mode** | **Monitor** or **Enforce**. **Monitor** records a match without interrupting the user. **Enforce** also applies the control's Just in Time action. |
| **Just in Time action** | The only action type that runs in the browser, when the user acts, for example asking for a business reason or blocking. |
| **Remediation Action**, **Activate Agent** | Action types that run on the QuilrAI backend after a match is recorded. **Remediation Action** sends an alert to [Microsoft Sentinel](../../integrations/send-logs-and-alerts/microsoft-sentinel), if you connected it. **Activate Agent** starts a Quilly agent that follows up with the user in Slack or Microsoft Teams. |
| **System control** | A control that QuilrAI supplies, tagged **System**. Several are on by default in **Monitor**, so findings can appear before you create any control. You can edit or switch them off, but not delete them. Controls your admins create are **Custom**. |
| **Persona** | The extension's record of the work user on this browser, created by registering the user's work email with QuilrAI. |
| **Browser Utility** | A desktop program, installed with the extension on Windows and macOS, that passes copied text and uploaded files to the extension. Deployment guides call it the Browser Agent. |

## How browser policy works

<StepFlow steps={[
  {label: "Save", items: ["In the console", "Live at once"]},
  {label: "Download", items: ["Every browser", "Every 2 minutes"]},
  {label: "Check", items: ["In the browser", "Sensitive data scan"]},
  {label: "Respond", items: ["Monitor: record only", "Enforce: popup or block"]},
  {label: "Report", items: ["Findings & Interactions"]},
]} />

1. **You save a control.** The save is live at once, and the page shows **Saves apply immediately.** There is no draft, test, publish step or version history.
2. **Browsers download the controls.** Each browser downloads all switched-on controls every 2 minutes and keeps a copy to use if a download fails.
3. **The extension checks each action in the browser.** It checks opening an app, signing in, submitting an AI prompt, sending a Gmail message, posting into a chatbot on a website, copying or pasting text, and uploading a file. If several controls match, it applies only the highest-ranked one (by risk behavior, then criticality), not the strictest. See [How controls are evaluated](./how-controls-are-evaluated).
4. **QuilrAI checks content for sensitive data.** The extension sends AI prompts, Gmail messages and chatbot posts to QuilrAI, which reports the sensitive data types found by your [Detection Models](../../console/govern/detection-models). The extension checks controls with sensitive-data conditions against this result before it picks the winning control. If QuilrAI does not answer within 3 seconds, the text is sent. Copied text and uploaded files are checked only when the [Browser Utility runs on the device](./limits-and-browser-differences#content-checks-need-the-browser-utility).
5. **The user sees the result.** In **Monitor**, the user sees nothing and the action goes ahead. In **Enforce**, the Just in Time action shows one of these (see [What users see](./conditions-and-actions#what-users-see)):
   - a notice that does not stop the action
   - a request for a business reason, after which the action continues
   - a block screen, which can offer **Request Approval** to send the user's reason to [Action requests](../../console/govern/action-requests)
   - a review window that shows the sensitive data found (AI prompts, Gmail messages and chatbot posts only)
   - automatic redaction of the sensitive data, with a short message (AI prompts only)
6. **The extension reports the result.** Each match, including **Monitor** matches, appears in [Findings & Interactions](../../console/observe/findings-and-interactions) with the control that matched. Then the control's **Remediation Action** runs, and **Activate Agent** runs in **Enforce** only. When no control matches, the action goes ahead and usually nothing is recorded.

## Where each part lives in the console

| Part | Where | What you do |
|---|---|---|
| [Browser controls](./browser-controls) | **Govern > Policy Engine > Endpoint Agent > Browser** | Create, edit, duplicate and delete controls, switch them on or off, and change their mode. |
| [App posture](./app-posture-and-access) | **Observe > Inventory**, open an app, then **Controls & configuration** | Set the app's **Approval status** and **Criticality** (controls can use both as conditions), and block the app with the **Blocked** switch. |
| [Extension settings](../configure/extension-settings) | **Settings > Browser Extension** | Turn the extension on or off for your organization, set **Persona Creation**, and list sites to skip on [**Whitelist Domain & Pattern**](../configure/allowed-domains-and-patterns). |
| [Per-user switch](../../console/observe/users) | **Observe > Users > Browser deployment** | Turn the extension on or off for selected people, and see which browsers report to QuilrAI. |
| [Popups](../../console/settings-sensors/user-interaction-hub) | **Settings > User Interaction Hub** | Set popup wording, logo and policy links. |
| [Access requests](../../console/govern/action-requests) | **Govern > Action Requests** | Approve or reject requests sent from a block screen. |
| [Sensitive data types](../../console/govern/detection-models) | **Govern > Detection Models** | Choose which sensitive data QuilrAI detects. |
| [Results](../../console/observe/findings-and-interactions) | **Observe > Findings & Interactions** | Review each match, its outcome and the matching control. |

:::note Desktop and Browser are separate
The **Endpoint Agent** workspace has a **Desktop** | **Browser** switch. **Desktop** is the [Endpoint Agent Policy Engine](../../endpoint-agent/policy-engine/overview), which uses drafts and publishing. Turning that engine on or off, or pausing it, does not change Browser controls.
:::

## Monitor and Enforce

Set a control's **Mode** in the control form or the **Mode** column of the controls list.

- **Monitor** records the match without interrupting the user. **Activate Agent** does not run.
- **Enforce** applies the Just in Time action and lets **Activate Agent** run.

Give every **Enforce** control a Just in Time action. Without one, the control never interrupts the user, and Safari does not record its matches. See [Enforce controls without a Just in Time action](./limits-and-browser-differences#enforce-controls-without-a-just-in-time-action).

:::tip Start in Monitor
Start new controls in **Monitor**, review their findings, then switch to **Enforce**. A **Monitor** control, including a default-on system control, can stop an **Enforce** control from acting on the same activity, because the extension picks one winning control before it checks the mode. See [A Monitor control can silence an Enforce control](./how-controls-are-evaluated#a-monitor-control-can-silence-an-enforce-control).
:::

## How long changes take to reach browsers

Browsers pick up a control change within about 2 minutes, and an app's posture or an access request decision usually within about 5 minutes. For every change, see [How long changes take](./limits-and-browser-differences#how-long-changes-take).

## Notes and limits

- The extension downloads no controls until it has a persona for the user. See [Extension settings](../configure/extension-settings).
- No control applies on sites listed on **Whitelist Domain & Pattern**.
- Every browser ignores a control whose top-level condition cards are joined with **OR**, although the console saves it and shows it as on. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
- If the Endpoint Agent also monitors an AI app in the same browser, both products can check the same prompt and record separate results. See [Other behavior to plan for](./limits-and-browser-differences#other-behavior-to-plan-for).

## Related pages

- [Browser controls](./browser-controls): create, change and remove controls.
- [Conditions and actions](./conditions-and-actions): use cases, conditions and action types.
- [How controls are evaluated](./how-controls-are-evaluated): which control applies when several match.
- [App posture and access requests](./app-posture-and-access): app approval status, criticality, blocking and access requests.
- [Limits and browser differences](./limits-and-browser-differences): browser differences, timing and known limits.
- [Smart Groups](../../console/settings-organization/smart-groups): groups of people that conditions can target.
- [Clipboard monitoring](../capabilities/clipboard-monitoring) and [File indexing](../capabilities/file-indexing): how the Browser Utility supplies copied text and uploaded files.
- [Agent kill switch](../capabilities/agent-kill-switch): switch the Browser Utility off and on.
- [Validate deployment](../deploy/validate-deployment): check that the extension and the Browser Utility are installed.
- [Policy Engine overview](../../console/govern/policy-engine): LLM Gateway and MCP Gateway policies.
