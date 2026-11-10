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

The Endpoint Agent Policy Engine is where you decide what people can do with AI on company devices. The Endpoint Agent is the QuilrAI program installed on employees' Windows and macOS devices. It checks what people send to AI apps and what coding tools do on the device, then applies the policies and controls you set here.

To open it, go to **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector at the top right, then select **Desktop** under the page title.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent']} />

## Key terms

| Term | Meaning |
| --- | --- |
| **AI app** | An AI chat or assistant application, such as ChatGPT, Claude or Gemini, that people use in a browser or as a desktop app. |
| **Coding tool** | An AI coding agent that runs on the device, such as Claude Code, Cursor or Codex CLI. |
| **Policy** | A named set of one or more rules. Sensitive data and Files are controlled by policies. |
| **Rule** | One part of a policy. It says who it covers, where it checks, what it looks for and what happens when it matches. |
| **Response** | What happens on the device when a rule matches: **Block**, **Require a reason**, **Ask for a reason** (called **Warn and continue** in coding tools) or **Record only**. See [Responses](./policies-and-rules#responses). |
| **Draft** | Your unpublished changes to Sensitive data and Files policies. Devices never follow a draft. |
| **Version** | A numbered, saved copy of your Sensitive data and Files policies. Each publish, restore, Turn on, pause and resume creates one. **History** keeps every version, and devices follow the live version. |
| **Previous Endpoint settings** | The per-app settings that decide on devices while the Policy Engine is off: **Guardrails**, **File Restrictions** and **Group & User Rules**. You manage them in Console V1 under **Settings > Endpoint**. The status strip calls them existing settings. **Turn on** converts them into policies. See [What your previous Endpoint settings become](./turn-on-off-and-pause#what-your-previous-endpoint-settings-become). |
| **Smart Group** | A named group of people that rules can target. See [Smart Groups](../../console/settings-organization/smart-groups). |
| **Finding** | A recorded request that needs review, for example a prompt that a rule blocked. See [Findings & Interactions](../../console/observe/findings-and-interactions). |

## What the Policy Engine controls

The controls are grouped by the question they answer: what people share, what coding tools do, and what runs and signs in on the device.

| Area | Group | What it controls | Example |
| --- | --- | --- | --- |
| **Sensitive data** | **What people share** | Sensitive data in the prompts, pastes and uploads people send to AI apps, and in the prompts, file reads and commands of coding tools. | Block secrets such as API keys in prompts to any AI app. |
| **Files** | **What people share** | File types and sensitivity labels in files people upload to AI apps. These rules do not apply in coding tools. | Ask for a reason before someone uploads a file labelled Confidential. |
| **Commands & tools** | **What coding tools do** | Shown as **Not available**. To limit a Sensitive data rule to certain commands or MCP (Model Context Protocol) tools, use **Narrow to specific actions** in that rule. | - |
| **Skills** | **What coding tools do** | Which skills Claude Code can run. A skill is a reusable set of instructions that Claude Code can load. | Block one skill for alice@example.com. |
| **Packages** | **What coding tools do** | Whether packages that Claude Code installs are checked for known vulnerabilities. You set this in **Settings > Endpoint Agent**. | Block installing a package version with a known vulnerability. |
| **Apps** | **What runs and signs in** | Which applications can run on devices. | Block an unapproved AI desktop app for everyone, and allow it for the Research Smart Group. |
| **Accounts** | **What runs and signs in** | Which accounts and workspaces people can sign in to in AI apps. | In ChatGPT, allow only your company workspace. |

Only Sensitive data and Files are Policy Engine policies. Skills, Apps, Accounts and Packages have their own editors. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

:::note
Policies and controls apply only to the AI apps and browsers that the Endpoint Agent monitors. You choose them under **Application Monitoring** in **Settings > Endpoint Agent**. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).
:::

## How the page is laid out

From top to bottom, the page has these parts:

1. **Desktop** | **Browser** switch. **Desktop** is the Endpoint Agent Policy Engine described here. **Browser** holds the Browser Extension's controls, which are separate: they save at once and have no drafts or versions. See [Browser Extension policy engine](../../browser-extension/policy-engine/overview).
2. **Status strip.** Shows whether the Policy Engine is on, off or paused, and when it last changed. It also holds **Turn on**, or the **More** menu while the Policy Engine is on. See [Policy Engine states](#policy-engine-states).
3. **Controls**, **Test** and **History** tabs, described below.
4. **Draft bar.** Appears at the bottom of the page while you have unpublished changes, with **Discard** and **Review & publish**.

### Controls

**Controls** has a menu on the left:

| Menu item | What it shows |
| --- | --- |
| **Overview** | One card per area with its current state, for example how many rules are on. Select a card to open that area. |
| **All policies** | Every policy in one list, with search and filters. It also holds **Priority policies**, an ordered list of policies that win over other matching policies. |
| **Sensitive data**, **Files** | The rules in each area. Your changes go to the draft. |
| **Commands & tools** | Not available. |
| **Skills**, **Apps**, **Accounts** | The editor for each area. Changes save at once. |
| **Packages** | Opens **Dependency scanning** in **Settings > Endpoint Agent**. |
| **Endpoint settings** (bottom of the menu) | Opens **Settings > Endpoint Agent**. |

### Test

**Test** shows what your Sensitive data and Files rules would decide, without changing anything on devices. **Try a situation** checks a request that you describe. **Replay activity** checks recent recorded requests. You can test the live rules or your unpublished changes. See [Test your changes](./draft-test-publish-and-history#test-your-changes).

### History

**History** lists every published version. You can compare two versions, or restore an earlier one as a new version. Skills, Apps, Accounts and package checks are not part of a version, so a restore does not change them. See [Review version history](./draft-test-publish-and-history#review-version-history).

## Policy Engine states

The Policy Engine is always in one of three states. The status strip shows which one.

| State | Status strip shows | What devices follow | What you can do |
| --- | --- | --- | --- |
| Off | **Policy Engine off · existing settings active** | Your previous Endpoint settings. Published policies are kept but do not apply. | Select **Turn on**. You can still edit the draft and use **Test** and **History**, but you cannot publish or restore a version. |
| On | **Policy Engine on** | Your published Sensitive data and Files policies. In coding tools, file-type rules still come from your previous Endpoint settings. | From **More**, select **Pause enforcement…** or **Turn off Policy Engine (use previous settings)…**. |
| Paused | **Policy Engine on**, with **Enforcement: Paused** on an amber strip | Your published policies, but Sensitive data and Files rules only monitor: matches are recorded and nothing is blocked. Some coding-tool checks switch off. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused). | From **More**, select **Resume enforcement…**. |

While the console reads the state, the strip shows **Checking Policy Engine status…**. If it cannot read the state, it shows **Policy Engine status unavailable**. Neither offers any actions. The page checks again every 30 seconds, or you can reload it.

Skills, Apps and Accounts rules, and package checks, apply whether the Policy Engine is on or off. None of the Policy Engine actions starts or stops the Endpoint Agent on devices. That is the **Endpoint Agent** switch in **Settings > Endpoint Agent**. For what each action does, see [Turn on, turn off and pause](./turn-on-off-and-pause).

:::note Turning off after you make changes
You can turn off the Policy Engine yourself only while the running version was converted from your previous Endpoint settings alone. After anyone publishes, restores a version, or pauses or resumes enforcement, **Turn off Policy Engine (use previous settings)…** is greyed out and only QuilrAI support can turn it off. This stays true after you resume. To stop blocking without turning off, use **Pause enforcement**. See [Who can turn off](./turn-on-off-and-pause#who-can-turn-off).
:::

:::warning Endpoint Agent off for the tenant
If the Endpoint Agent is off for your tenant, devices apply no policies or controls, whatever the Policy Engine state. Admins with the **Read Endpoint Agent** permission see **Endpoint Agent: Off for this tenant** in the status strip and a banner on the page. Turn the agent back on in **Settings > Endpoint Agent**.
:::

## Get started

1. Open **Govern > Policy Engine**, select **Endpoint Agent**, then **Desktop**, and read the status strip.
2. If it reads **Policy Engine off · existing settings active**, select **Turn on**, read the dialog, then select **Turn on** to confirm. Your previous Endpoint settings become policies. See [Turn on the Policy Engine](./turn-on-off-and-pause#turn-on-the-policy-engine).
3. Open **All policies** and review the converted policies. Switch on a starter policy or create your own. See [Policies and rules](./policies-and-rules).
4. Open **Test** and try a few situations against your unpublished changes.
5. In the draft bar, select **Review & publish**. Check the changes and the safety check, then select **Publish changes**. See [Review and publish](./draft-test-publish-and-history#review-and-publish).
6. Check the results in [Findings & Interactions](../../console/observe/findings-and-interactions).

## How changes go live

Changes go live in one of two ways, depending on the control.

| Control | How a change goes live | Added to History |
| --- | --- | --- |
| **Sensitive data**, **Files**, **Priority policies** | Saved to your draft. It goes live when you open **Review & publish**, pass the safety check and select **Publish changes**. | Yes, as a new version |
| **Skills**, **Apps**, **Accounts** | Saves at once. There is no draft and no **Review & publish** step. | No |
| **Packages** and other device settings | Save at once in **Settings > Endpoint Agent**. | No |

Your draft is kept in your current browser tab only. Other admins, other tabs and other browsers do not see it, and closing the tab or signing out deletes it. If a newer version goes live before you publish, your draft can no longer be published. See [Where your draft is kept](./draft-test-publish-and-history#where-your-draft-is-kept) and [When a newer version goes live](./draft-test-publish-and-history#when-a-newer-version-goes-live).

## How changes reach devices

QuilrAI, not the device, decides Sensitive data and Files policies. For each prompt, paste, upload or coding-tool action, the Endpoint Agent asks QuilrAI what to do, and QuilrAI checks the request against the live version. So a publish or restore applies to the next request.

Other controls, such as Skills, Apps and Accounts, reach a device when it next syncs with QuilrAI, within minutes. A device that is offline applies changes when it reconnects. The console does not confirm that a device has applied a change: look for the device's new activity in [Findings & Interactions](../../console/observe/findings-and-interactions).

For how long each change takes, see [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).

## Permissions

Access comes from the permissions in [Roles and permissions](../../console/settings-organization/roles-and-permissions). Without the permission it needs, a control is greyed out or hidden, and the console shows the reason, for example **Needs Policy update access**.

| Task | Permissions needed |
| --- | --- |
| See policies, **Test** and **History** | **Policy** page and **Read policies** |
| Edit the draft, publish, restore a version, turn on, pause or resume enforcement | **Policy** page and **Update policies** |
| Turn off the Policy Engine | **Policy** page and **Update policies**, while the converted version runs. Otherwise only QuilrAI support can turn it off. |
| See **Skills**, **Apps**, **Accounts** and dependency scanning | **Endpoint Agent** page and **Read Endpoint Agent** |
| Change **Skills**, **Apps**, **Accounts** and dependency scanning | **Manage Endpoint Agent** |

These are Access Control V2 permissions. If your tenant still uses V1 roles, the **Compliance** permission covers policies: **Read** to see them, and **Update** for every policy task above, including Turn off. **Endpoint Agent** (**Tenant**) **Read** and **Update** cover **Skills** and **Accounts**. Changing **Apps** needs **App Management** (**Tenant**) **Update**.

## Where each part is documented

| Topic | Page |
| --- | --- |
| Turn the Policy Engine on or off, and pause or resume enforcement | [Turn on, turn off and pause](./turn-on-off-and-pause) |
| Create policies and rules: who, where, what to look for and the response | [Policies and rules](./policies-and-rules) |
| Which rule wins when several match, priority and risk | [How policies are evaluated](./how-policies-are-evaluated) |
| File rules, skill rules, package checks, app blocking, account restrictions and Commands & tools | [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts) |
| Drafts, Test, Review & publish, History and restore | [Draft, test, publish and restore](./draft-test-publish-and-history) |
| What people see on their device, and the findings each decision creates | [What users see and findings](./what-users-see-and-findings) |
| Size limits, timing and behavior to know before you rely on a control | [Limits and behavior to know](./limits-and-behavior) |
| Browser controls (the **Browser** side of the switch) | [Browser Extension policy engine](../../browser-extension/policy-engine/overview) |
| The **Endpoint Agent** switch for the tenant, and **Application Monitoring** | [Agent settings](../configure/agent-settings) |
| Stop the agent on one device or across the tenant | [Agent kill switch](../deploy-and-operate/agent-kill-switch) |

## Related pages

- [Policy Engine overview](../../console/govern/policy-engine) for the LLM Gateway and MCP Gateway
- [Smart Groups](../../console/settings-organization/smart-groups)
- [Detection Models](../../console/govern/detection-models) for the data types rules look for
- [Findings & Interactions](../../console/observe/findings-and-interactions)
- [Inventory](../../console/observe/inventory)
- [Deployment and status](../deploy-and-operate/deployment-and-status)
