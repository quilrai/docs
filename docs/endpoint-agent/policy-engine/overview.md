---
sidebar_position: 1
sidebar_label: "Overview"
sidebar_custom_props:
  icon: ListChecks
description: "What the Endpoint Agent Policy Engine controls on employee devices, where to find it, its on, off and paused states, how changes go live and reach devices, and who can make them."
console_path: /policy/engine/endpoint-agent
aliases: [endpoint agent policy engine, endpoint agent policies, endpoint policies, desktop policies, device policies, desktop controls, endpoint controls, policy engine endpoint agent]
---

# Endpoint Agent Policy Engine

Updated on 10 November 2026.

The Endpoint Agent Policy Engine is where you decide what people can do with AI on company devices. The Endpoint Agent is the QuilrAI program installed on employees' Windows and macOS devices. It checks what people send to AI apps and what coding tools do, then applies the policies and controls you set here.

To open it, go to **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector at the top right, then select **Desktop** under the page title.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent']} />

## Key terms

| Term | Meaning |
| --- | --- |
| **AI app** | An AI chat or assistant application, such as ChatGPT, Claude or Gemini, in a browser or as a desktop app. |
| **Coding tool** | An AI coding agent on the device, such as Claude Code, Cursor or Codex CLI. |
| **Policy** and **rule** | A policy is a named set of rules. Each rule says who it covers, where it checks, what it looks for and what happens when it matches. |
| **Response** | What happens when a rule matches: **Block**, **Require a reason**, **Ask for a reason** (**Warn and continue** in coding tools) or **Record only**. See [Responses](./policies-and-rules#responses). |
| **Draft** | Your unpublished changes to Sensitive data and Files policies. Devices never follow a draft. |
| **Version** | A numbered copy of your Sensitive data and Files policies, created by each publish, restore, Turn on, pause and resume. Devices follow the live version. |
| **Previous Endpoint settings** | The per-app settings that devices follow while the Policy Engine is off: **Guardrails**, **File Restrictions** and **Group & User Rules**, in Console V1 under **Settings > Endpoint**. The status strip calls them existing settings. See [What your previous Endpoint settings become](./turn-on-off-and-pause#what-your-previous-endpoint-settings-become). |

## What the Policy Engine controls

- **What people share**
  - **Sensitive data**: sensitive data in prompts, pastes and uploads to AI apps, and in coding-tool prompts, file reads and commands.
  - **Files**: file types and sensitivity labels in files uploaded to AI apps. These rules do not apply in coding tools.
- **What coding tools do**
  - **Commands & tools**: shown as **Not available**. To limit a Sensitive data rule to certain commands or MCP (Model Context Protocol) tools, use **Narrow to specific actions** in that rule.
  - **Skills**: which skills (reusable sets of instructions) Claude Code can run.
  - **Packages**: whether packages that Claude Code installs are checked for known vulnerabilities. You set this in **Settings > Endpoint Agent**.
- **What runs and signs in**
  - **Apps**: which applications can run on devices.
  - **Accounts**: which accounts and workspaces people can sign in to in AI apps.

Only Sensitive data and Files use policies. Skills, Apps and Accounts have their own editors, and Packages is set in **Settings > Endpoint Agent**. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

:::note
Policies and controls apply only to the AI apps and browsers chosen under **Application Monitoring** in **Settings > Endpoint Agent**. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).
:::

## How the page is laid out

1. **Desktop** | **Browser** switch. **Browser** holds the separate Browser Extension controls, which save at once with no draft or version. See [Browser Extension policy engine](../../browser-extension/policy-engine/overview).
2. **Status strip.** Shows whether the Policy Engine is on, off or paused. It holds **Turn on** while it is off, and the **More** menu while it is on. See [Policy Engine states](#policy-engine-states).
3. **Controls** tab. Its menu lists **Overview** (one card per area), **All policies**, one item per area, and **Endpoint settings**, which opens **Settings > Endpoint Agent**. **All policies** shows every policy and holds **Priority policies**, an ordered list of policies that win over other matching policies.
4. **Test** tab. Shows what your live or unpublished Sensitive data and Files rules would decide, without changing anything on devices, for a request you describe (**Try a situation**) or for recent recorded requests (**Replay activity**). See [Test your changes](./draft-test-publish-and-history#test-your-changes).
5. **History** tab. Lists published versions to compare or restore. A restore does not change Skills, Apps, Accounts or package checks. See [Review version history](./draft-test-publish-and-history#review-version-history).
6. **Draft bar.** Appears at the bottom while you have unpublished changes, with **Discard** and **Review & publish**.

## Policy Engine states

| State | Status strip shows | What devices follow | What you can do |
| --- | --- | --- | --- |
| Off | **Policy Engine off · existing settings active** | Your previous Endpoint settings. Published policies are kept but do not apply. | Select **Turn on**. You can edit the draft and use **Test** and **History**, but you cannot publish or restore. |
| On | **Policy Engine on** | Your published policies. In coding tools, file-type rules still come from your previous Endpoint settings. | From **More**, select **Pause enforcement…** or **Turn off Policy Engine (use previous settings)…**. |
| Paused | **Policy Engine on**, with **Enforcement: Paused** on an amber strip | Your published policies, but Sensitive data and Files rules only record matches: no block, warning or reason request. Some coding-tool checks switch off. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused). | From **More**, select **Resume enforcement…**. |

While the console reads the state, the strip shows **Checking Policy Engine status…**. If it cannot read the state, it shows **Policy Engine status unavailable**. Neither offers actions, and the page checks again every 30 seconds.

:::note Turning off after you make changes
You can turn off the Policy Engine only while the running version was converted from your previous Endpoint settings alone. After anyone publishes, restores, pauses or resumes, **Turn off Policy Engine (use previous settings)…** stays greyed out and only QuilrAI support can turn it off. To stop blocking, use **Pause enforcement**. See [Who can turn off](./turn-on-off-and-pause#who-can-turn-off).
:::

:::warning Endpoint Agent off for the tenant
While the Endpoint Agent is off for your tenant, devices apply no policies or controls, whatever the Policy Engine state. Admins with **Read Endpoint Agent** see **Endpoint Agent: Off for this tenant** in the status strip and a banner. Turn the agent back on in **Settings > Endpoint Agent**.
:::

## Get started

1. Open **Govern > Policy Engine**, select **Endpoint Agent**, then **Desktop**, and read the status strip.
2. If it reads **Policy Engine off · existing settings active**, select **Turn on**, read the dialog, then select **Turn on** again. Your previous Endpoint settings become policies. See [Turn on the Policy Engine](./turn-on-off-and-pause#turn-on-the-policy-engine).
3. In **All policies**, review the converted policies. Switch on a starter policy or create your own. See [Policies and rules](./policies-and-rules).
4. In **Test**, try a few situations against your unpublished changes.
5. On the draft bar, select **Review & publish**. Check the changes, wait for the safety check to pass, then select **Publish changes**. See [Review and publish](./draft-test-publish-and-history#review-and-publish).
6. Check the results in [Findings & Interactions](../../console/observe/findings-and-interactions).

## How changes go live

| Control | How a change goes live | In History |
| --- | --- | --- |
| **Sensitive data**, **Files**, **Priority policies** | Saved to your draft. Goes live when it passes the safety check and you select **Publish changes** in **Review & publish**. | Yes, as a new version |
| **Skills**, **Apps**, **Accounts** | Changes save at once, with no draft. | No |
| **Packages** and other device settings | Changes save at once in **Settings > Endpoint Agent**. | No |

Your draft exists only in your current browser tab: no other admin, tab or browser sees it, and closing the tab or signing out deletes it. See [Where your draft is kept](./draft-test-publish-and-history#where-your-draft-is-kept).

If a newer version goes live before you publish, you can no longer publish your draft. This happens, for example, when another admin publishes or a change to your previous Endpoint settings regenerates the converted policies. To recover your changes, see [When a newer version goes live](./draft-test-publish-and-history#when-a-newer-version-goes-live).

## How changes reach devices

| Control | When devices apply a change |
| --- | --- |
| **Sensitive data**, **Files** | On the next request: QuilrAI, not the device, checks each one against the live version. |
| **Skills**, **Apps**, **Accounts** and other controls | When the device next syncs with QuilrAI, within minutes. An offline device applies changes when it reconnects. |

The console does not confirm that a device applied a change; check for its new activity in Findings & Interactions. For timings, see [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).

## Permissions

Without the permission it needs, a control is greyed out or hidden, with a reason such as **Needs Policy update access**. See [Roles and permissions](../../console/settings-organization/roles-and-permissions).

| Task | Permissions needed |
| --- | --- |
| See policies, **Test** and **History** | **Policy** page and **Read policies** |
| Edit the draft, publish, restore, turn on, turn off, pause or resume | **Policy** page and **Update policies**. Turn off works only while the converted version runs; otherwise only QuilrAI support can turn it off. See [Policy Engine states](#policy-engine-states). |
| See **Skills**, **Apps**, **Accounts** and dependency scanning | **Endpoint Agent** page and **Read Endpoint Agent** |
| Change **Skills**, **Apps**, **Accounts** and dependency scanning | **Manage Endpoint Agent** |

These are Access Control V2 permissions. With V1 roles, **Compliance** covers policies: **Read** to see them, **Update** for every policy task, including turn off. **Endpoint Agent** (**Tenant**) **Read** and **Update** cover **Skills** and **Accounts**. Changing **Apps** needs **App Management** (**Tenant**) **Update**.

## Notes and limits

- Skills, Apps and Accounts rules, and package checks, apply whether the Policy Engine is on or off. While enforcement is paused, Skills rules, package checks and some coding-tool Accounts checks are off. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).
- Policy Engine actions never start or stop the Endpoint Agent on devices; use the **Endpoint Agent** switch in **Settings > Endpoint Agent** for that.

## Related pages

- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [Policies and rules](./policies-and-rules)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Agent settings](../configure/agent-settings)
- [Agent kill switch](../deploy-and-operate/agent-kill-switch)
- [Policy Engine overview](../../console/govern/policy-engine) for the LLM Gateway and MCP Gateway
- [Smart Groups](../../console/settings-organization/smart-groups)
- [Detection Models](../../console/govern/detection-models) for the data types rules look for
- [Findings & Interactions](../../console/observe/findings-and-interactions)
- [Inventory](../../console/observe/inventory)
- [Deployment and status](../deploy-and-operate/deployment-and-status)
