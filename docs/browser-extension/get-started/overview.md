---
sidebar_position: 1
sidebar_label: "Browser Extension overview"
sidebar_custom_props:
  icon: Globe
---

# Browser Extension overview

The QuilrAI Browser Extension governs how people use AI in the browser. It runs in managed Chrome and Edge browsers, together with a small native component (the Browser Agent) that handles device-level tasks the extension cannot do on its own.

## What it sees and enforces

| Area | What the extension does |
| --- | --- |
| AI web apps | Detects use of AI applications in the browser and reports each interaction to the console. |
| Accounts | Tells personal accounts apart from corporate accounts, so you can treat a personal ChatGPT login differently from your company workspace. |
| Prompt DLP | Inspects prompts as they are submitted and matches them against your [detection models](../../console/govern/detection-models) (PII, secrets, financial data, custom detectors). |
| File uploads | Inspects files uploaded to AI apps and applies the same controls. |
| Actions | Each control runs in **Monitor** mode (record only) or **Action** mode, where it can ask the user to justify, redact sensitive data, or block. |
| User guidance | Shows popups that explain why an action was flagged and, where allowed, let the user justify and continue. |

The native Browser Agent also powers [clipboard monitoring](../capabilities/clipboard-monitoring), [file indexing](../capabilities/file-indexing) for upload scanning, and an [agent kill switch](../capabilities/agent-kill-switch).

## Where it shows up in the console

| Console area | What you do there |
| --- | --- |
| **Users › Browser deployment** | Track extension coverage (reporting or not), versions behind the latest, browsers in use, and Browser Utility status. See [Users](../../console/observe/users). |
| **Findings** | Review what the extension detected and the outcome (monitored, justified, redacted, blocked). See [Findings and interactions](../../console/observe/findings-and-interactions). |
| **Policy Engine › Browser Extension** | Create and tune the controls the extension enforces. See [Browser controls](../configure/browser-controls). |
| **Action Request** | Approve or reject justification requests raised when the extension blocked an action. See [Action requests](../../console/govern/action-requests). |
| **Settings › User Interaction Hub** | Brand and word the popups users see. See [End-user popups](../../console/settings-sensors/end-user-popups). |
| **Settings › Browser Extension** | Turn the extension on, choose which domains it monitors, and manage allowed domains. See [Extension settings](../configure/extension-settings). |

## Deployment path

<StepFlow steps={[
  { label: "Prepare", items: ["Tenant ID", "Extension policy file", "Browser Agent package"] },
  { label: "Deploy", items: ["Group Policy", "Microsoft Intune", "Jamf Pro"] },
  { label: "Validate", items: ["Browser policy applied", "Native process running", "Users › Browser deployment"] },
  { label: "Configure", items: ["Extension settings", "Browser controls (Monitor first)"] },
]} />

1. Check the [prerequisites](./prerequisites) and collect your tenant configuration.
2. Deploy with [Group Policy](../deploy/group-policy), [Microsoft Intune](../deploy/microsoft-intune), or [Jamf Pro](../deploy/jamf-pro).
3. [Validate the deployment](../deploy/validate-deployment) on a pilot group.
4. Configure [extension settings](../configure/extension-settings) and start [browser controls](../configure/browser-controls) in Monitor mode before moving to Action mode.
