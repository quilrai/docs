---
sidebar_position: 5
sidebar_label: "Files, Skills, Apps and more"
sidebar_custom_props:
  icon: LayoutGrid
description: "How the Endpoint Agent controls for files, skills, packages, apps and AI accounts work, where you set each one, and how changes reach devices."
console_path: []
aliases: [file rules, file type, sensitivity label, commands and tools, skills, skill rules, block a skill, packages, dependency scanning, vulnerable packages, apps, app access rules, block an app, application blocking, accounts, account access, approved workspaces, allowed plans, allowed models, tenant restrictions]
---

# Files, Skills, Packages, Apps and Accounts

Updated on 10 November 2026.

Most Endpoint Agent policies decide what sensitive data people may send to AI apps. The other areas of the **Controls** tab decide what else may happen on a device: which files people may upload to AI apps, which skills and packages coding tools may use, which applications may run, and which accounts people may use in AI apps. This page explains each of these areas. For sensitive-data rules, see [Policies and rules](./policies-and-rules).

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Desktop', 'Controls']} />

## Key terms

| Term | Meaning |
|---|---|
| **AI app** | An AI chat or assistant application, such as ChatGPT, Claude or Gemini, that people use in a browser or as a desktop app. |
| **Coding tool** | An AI coding agent that runs on the device, such as Claude Code, Cursor or Codex CLI. |
| **Hook** | A setting the Endpoint Agent adds to a coding tool so that the tool asks the agent before each prompt or action. |
| **Sensitivity label** | A classification tag stored inside a document, for example "Confidential". |
| **Skill** | A folder of instructions that a coding agent can run, often as a slash command such as `/review`. |
| **Package** | A software library that a coding agent installs, for example with `npm install` or `pip install`. |
| **Sync** | When the Endpoint Agent next downloads its settings from QuilrAI. Controls that save at once reach a device at its next sync. |

## Where to find these controls

1. Open **Govern > Policy Engine** and select **Endpoint Agent** in the workspace selector.
2. Select **Desktop**, then the **Controls** tab.
3. Choose an area from the left menu.

| Menu group | Area | What it decides |
|---|---|---|
| What people share | **Files** | Which file types and sensitivity labels people may upload to AI apps. |
| What coding tools do | **Commands & tools** | Not available. See [Commands & tools](#commands-and-tools). |
| What coding tools do | **Skills** | Which skills Claude Code may run. |
| What coding tools do | **Packages** | Whether packages that Claude Code installs are checked for vulnerabilities. This item opens **Settings > Endpoint Agent**. |
| What runs and signs in | **Apps** | Which installed applications may run on devices. |
| What runs and signs in | **Accounts** | Which accounts, workspaces, plans and models people may use in AI apps. |

The **Endpoint settings** link at the bottom of the menu opens [Agent settings](../configure/agent-settings).

## How each control goes live

The areas use two different saving models:

| Area | Where you set it | How a change goes live |
|---|---|---|
| Files | **Controls > Files** | Saved to your draft. Devices use it only after you publish with **Review & publish**. You can test it first and restore an earlier version later. See [Draft, test, publish and restore](./draft-test-publish-and-history). |
| Skills | **Controls > Skills** | Saves when you create or save a rule. |
| Packages | **Settings > Endpoint Agent > Dependency scanning** | Saves when you change a switch. |
| Apps | **Controls > Apps** | Saves when you create or save a rule. |
| Accounts | **Controls > Accounts** | Saves when you select **Save account access**. |

Areas that save at once have no draft and no **Review & publish** step. Devices pick up the change at their next sync. For how long each one takes, see [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).

:::note
Skills, Apps, Accounts and dependency scanning are not part of a policy version. **Test** does not evaluate them, **History** does not list their changes, and restoring an earlier version does not change them. They apply whether the Policy Engine is on or off.
:::

While enforcement is paused, file rules in AI apps only monitor, and skill rules, package checks, the account checks that coding tools make themselves, and the file-type rules in coding tools are off. Apps and every other account restriction keep applying. **Turn off** does not change Skills, Apps, Accounts or Packages. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).

## Files

### What file rules decide

A file rule decides what happens when someone uploads or attaches a file to an AI app, in a browser or a desktop app. It checks the file's type, its sensitivity label, or both.

File rules are ordinary Policy Engine rules with a file condition. They use the same **Who**, **Where** and **Response and risk** steps as sensitive-data rules, their policy has the same **Priority** setting, and you publish them the same way. They apply only while the Policy Engine is on.

The **Files** area lists every rule that has a file condition, across all policies. A rule that checks both data and files appears in **Sensitive data** and in **Files**. Use **Search rules**, the **Where** switch (**All**, **AI apps**, **Coding tools**) and **Filters** to narrow the list. In **Files**, **Coding tools** is greyed out while no file rule applies in coding tools, which is the usual case. The **Status** switch on a row turns that rule on or off in your draft.

:::note
Policy Engine file rules apply in AI apps only, not in coding tools. In coding tools, file checks come from the file restrictions in your previous Endpoint settings, which match a file's type or sensitivity label. When you turn on the Policy Engine, those file restrictions are converted into file rules for AI apps.
:::

### Create a file rule

1. In **Controls**, select **Files**, then **Create policy**. The policy editor opens at the **Start from** step, with a file condition already added to the first rule.
2. On **Start from**, keep **Blank** and select **Continue to Name and description**. Choosing a starter policy replaces the rules and removes the file condition.
3. Enter a **Name** and, optionally, a **Description**. Select **Continue to rule 1**.
4. On **Who**, choose **Everyone**, **Only these people** or **Everyone except**. You can choose people, [Smart Groups](../../console/settings-organization/smart-groups) and departments.
5. On **Where**, keep **AI apps** on and choose the apps. **Coding tools** is greyed out, because file rules apply in AI apps only.
6. On **Looks for**, under **Files**, set the file condition. Use **Add a file condition** to add another one.
7. On **Response and risk**, choose **What happens in AI apps**: **Record only**, **Ask for a reason**, **Require a reason** or **Block**. The responses are described in [Responses](./policies-and-rules#responses).
8. Complete the **Priority** and **Check and save** steps, then select **Create policy**. These steps are described in [Create a policy](./policies-and-rules#create-a-policy).
9. Test the policy and publish it with **Review & publish**. See [Draft, test, publish and restore](./draft-test-publish-and-history).

### File conditions

| Condition | Operators | How it matches |
|---|---|---|
| **File type** | is one of, is not one of | The type is read from the file's contents, not from its name. Plain-text files such as CSV, TXT or JSON may not be recognized. |
| **Sensitivity label** | is one of, is not one of, contains, does not contain | Matches the labels stored in the document. **is one of** compares whole labels and ignores case. Not every AI app sends labels: the editor warns you when an app in the rule's scope doesn't. |

- **is not one of** and **does not contain** match only files that have a detected type or label. A file with no detected type, or with no label, does not match them.
- Saved rules can also show **File kind**. It is no longer offered for new rules, but it keeps applying until you remove it.
- When several rules match the same upload, see [How policies are evaluated](./how-policies-are-evaluated).

### What the device does

When someone uploads or attaches a file to an AI app, the Endpoint Agent reads the file's type from its contents and reads any sensitivity labels stored in the document. It sends both with the upload check to QuilrAI. QuilrAI checks them against the live version and returns the response, and the Endpoint Agent applies it.

| Response | What happens to the upload |
|---|---|
| **Block** | The upload is stopped, and the person sees a block message. |
| **Require a reason** | The upload is held until the person gives a reason in a popup. If no reason is given in time, the upload is blocked. |
| **Ask for a reason** | The upload continues, and a reason popup appears. |
| **Record only** | The upload continues, with no message. |

Each upload that a file rule matches is recorded as a finding in [Findings & Interactions](../../console/observe/findings-and-interactions). The popups and messages are described in [What users see and findings](./what-users-see-and-findings). If the device can't get an answer in time, the upload continues. See [When a device can't get a decision](./limits-and-behavior#when-a-device-cant-get-a-decision).

## Commands & tools {#commands-and-tools}

**Commands & tools** is greyed out with the tag **Not available**. It has no editor of its own. To limit a Sensitive data rule to certain commands or MCP tools, use **Narrow to specific actions** under the rule's **Where** step. See [Policies and rules](./policies-and-rules).

## Skills

### What skill rules decide

Skill rules allow or block specific skills in Claude Code. They save at once.

The Endpoint Agent finds the skills installed for Claude Code on each device and reports them to QuilrAI. These are called discovered skills. **Choose a discovered skill** lists them, and a rule matches only a skill that the Endpoint Agent has found on the device.

There are two kinds of skill rule:

| | Rule for one person | Rule for everyone |
|---|---|---|
| Applies to | One person per rule | Everyone, including people who install the skill later |
| Coding tool | Claude Code | **Any coding tool**, **Claude Code**, **Codex**, **Cursor** or **Copilot CLI** |
| Response | **Block** or **Allow** | Always blocks |
| Identifies the skill by | Its exact folder (**Skill location**) | Its content (**This skill's content**) or its name (**Any skill with this name**) |
| What you can change later | **Block** or **Allow** only | Nothing. Remove the rule instead. |

Smart Groups are not available for skill rules. If the **Add skill rule** form shows no **Who** choice, rules for everyone are not available for your organization, and every rule applies to one person. Contact QuilrAI support if you need rules for everyone.

:::warning Not every rule for everyone is enforced
Devices enforce a rule for everyone when it matches by **This skill's content** and its **Coding tool** is **Claude Code** or **Any coding tool**. A rule that matches by **Any skill with this name**, or that names only Codex, Cursor or Copilot CLI, is saved but is not enforced on devices. To block a skill for everyone today, use content matching with **Claude Code** or **Any coding tool**.
:::

### Block or allow a skill for one person

1. In **Controls**, select **Skills**, then **Add skill rule**.
2. If **Who** is shown, choose **One person**.
3. In **Person**, choose the person.
4. In **Skill location**, select **Choose a discovered skill** to pick a skill found on people's devices, or type the folder exactly as the device reported it, for example `~/.claude/skills/review`. Wildcards are not allowed.
5. Optionally, enter a **Skill name**. It is a display name only: the location identifies the skill.
6. Under **Skill response**, choose **Block** or **Allow**.
7. Select **Create skill rule**.

The list shows "Skill rule saved. Devices pick it up at their next sync."

To change a person's rule later, select **Edit**. Only **Block** or **Allow** can change. To target another person or folder, create a separate rule.

### Block a skill for everyone

1. Select **Add skill rule**, then under **Who** choose **Everyone**.
2. Under **Match**, choose one of these:
   - **This skill's content** blocks the skill's exact content in any folder. Use **Choose a discovered skill** to fill **Discovered skill**.
   - **Any skill with this name** blocks every skill with this exact name, including unrelated skills that share it. Enter the **Skill name**.
3. Choose the **Coding tool**.
4. Select **Block for everyone**.

Removing a rule for everyone does not remove rules that block the same skill for individual people.

### What the device does

When Claude Code runs a skill, either through its Skill tool or because the person types `/name`, the Endpoint Agent checks the rules that match the signed-in person. If any matching rule says **Block**, the skill does not run. **Block** wins over **Allow**. With no matching rule, the skill runs.

**Allow** lets the skill run unless another matching rule blocks it. It does not override a **Block**. Because a skill with no matching rule also runs, you don't need an **Allow** rule to let a skill run.

- A rule matches only a skill that the Endpoint Agent has found on the device.
- Slash-command checks need Claude Code 2.1.116 or later. On older versions, only skills that Claude runs through its Skill tool are checked.

## Packages

### What dependency scanning decides

Dependency scanning checks each package that Claude Code installs for known vulnerabilities, such as CVEs (publicly listed security vulnerabilities), and for newer versions. It can stop a vulnerable install or tell the developer about a newer version.

Dependency scanning is a setting, not a policy. The **Packages** item in the Controls menu has the tag **Settings** and opens the **Dependency scanning** card in Endpoint Agent settings.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Endpoint Agent']} />

| Switch | What it does | Default |
|---|---|---|
| **Claude Code dependency scanning** | Records each package Claude Code installs, for [Inventory](../../console/observe/inventory). On its own it does not check or stop installs. Turn on a response below for that. | Off |
| **Block vulnerable dependencies** | Stops the install when the package version has known vulnerabilities. | Off |
| **Notify about newer dependency versions** | Tells the developer when a newer version of the package is available. The install continues. | Off |

### Turn on dependency scanning

1. Open **Settings > Endpoint Agent** and go to the **Dependency scanning** card.
2. Turn on **Claude Code dependency scanning**.
3. Turn on **Block vulnerable dependencies**, **Notify about newer dependency versions**, or both. These switches stay greyed out until scanning is on.

Each switch saves when you change it. Devices pick up the change within about 15 minutes.

### What the device does

The Endpoint Agent checks package install commands and supported manifest changes in npm, PyPI, crates.io, Go, RubyGems, NuGet, Packagist and Maven.

| Situation | Result |
|---|---|
| **Block vulnerable dependencies** is on and the version has known vulnerabilities | The install is stopped, with a summary of the vulnerabilities. |
| **Notify about newer dependency versions** is on and a newer version exists | The developer sees a notice. The install continues. |
| The package can't be assessed, or the check times out | The install is allowed. |

Policy Engine policies do not change this check.

:::note
Dependency scanning is supported in Claude Code only. If the card shows a row such as **Cursor install checks**, install checks were turned on for that tool earlier. Select **Turn off** to clear them. Dependency inventory is not affected.
:::

## Apps

### What app rules decide

An app rule decides whether an installed application may run on devices. You can block or allow an application for everyone, for a [Smart Group](../../console/settings-organization/smart-groups) or for one person. App rules save at once and are not Policy Engine policies.

### Block or allow an application

1. In **Controls**, select **Apps**, then **Add app access rule**.
2. In **Installed application**, search for and choose the application. The list shows applications your devices reported in the last 30 days, 30 at first. Type a name to find others.
3. In **Operating system**, choose **macOS and Windows**, **macOS** or **Windows**.
4. Under **Applies to**, choose **Everyone**, **A Smart Group** (then choose the **Smart Group**), or **One person** (then enter the **Person's work email**, the same email the person uses on their device).
5. Under **What should happen?**, choose **Block app from running** or **Allow app to run**. A new rule starts on **Block app from running**.
6. Optionally, enter a reason in **Reason (optional)**.
7. Select **Create app access rule**.

The list shows "App access rule saved. Devices pick it up at their next sync."

### Which rule wins

- A person's rule overrides the rules for their Smart Groups, and a Smart Group's rule overrides the rule for **Everyone**.
- For the same audience, a rule for one operating system overrides a rule for **macOS and Windows**.

Use **Allow app to run** to make an exception, for example to allow an application for one Smart Group while it is blocked for everyone else.

### Reading the list

- The **Response** column shows **Allow**, **Block** or **Block (existing)**. **Block (existing)** is an earlier rule that stops the app. When you edit it, it shows as **Keep existing block**. It does not isolate application files.
- Devices can report one application as several programs, such as the app itself, its helpers and earlier versions. The list shows them as one row with a parts tag. The rule covers every part, and **Edit** and **Remove** change all of them.
- **Unidentified app rules** lists rules that name an application only by its **App identifier**. They still apply on devices. You can remove them but not edit them.

### What the device does

When a blocked application runs, the Endpoint Agent ends it and its child processes. It never ends operating-system components. If the person started the application, they see a popup, and a finding is recorded. If the application starts again, the Endpoint Agent ends it again.

### Notes

- Audit-only app access is not available. A rule always blocks or allows.
- To change a rule's application, audience or operating system, add a separate rule. To change the response of an existing rule, use **Edit** on its row.
- Approval labels in [Inventory](../../console/observe/inventory), such as Approved, do not stop applications from running. Inventory's **Application configuration** card shows app rules read-only, with **Manage in Policy Engine** to open this area.

## Accounts

### What account restrictions decide

Account restrictions decide which accounts people may use in an AI app. For example, you can allow only your company's ChatGPT workspace, only the Enterprise plan, and only GPT-5 models. Restrictions apply to everyone in your organization. Per-person exceptions are not supported.

Account restrictions save at once and are not Policy Engine policies.

### Checks for each app

| App | Checks |
|---|---|
| ChatGPT (also covers Codex) | **Approved workspaces**, **Allowed plans**, **Allowed models** |
| Claude (also covers Claude Code) | **Approved organizations**, **Approved workspaces** (Anthropic workspaces), **Allowed plans**, **Allowed models** |
| Microsoft 365 (including Copilot) | **Approved organizations**, **Personal accounts and tenant policy** |
| Granola | **Approved workspaces**, **Allowed plans**, **Allowed models** |
| Cursor | **Approved teams**, **Allowed plans**, **Allowed models** |
| GitHub Copilot | **Allowed plans**, **Allowed models** |
| Antigravity | **Allowed plans**, **Allowed models** |
| Gemini | **Work accounts only**, **Approved domains** |

GitHub Copilot and Antigravity have no company account that the Endpoint Agent can check, so the console offers only plan and model checks for them. If the Endpoint Agent supports more checks for an app, they appear under **Other restrictions**.

:::note
Devices do not check **Allowed models** for Antigravity. You can save it, but it does not block anything. Use **Allowed plans** to restrict Antigravity.
:::

| Check | What it does | What you enter |
|---|---|---|
| **Approved workspaces**, **Approved organizations**, **Approved teams** | Allows only these company accounts. Prompts from other accounts are blocked. | IDs, one per line or separated by commas. Claude organization IDs are UUIDs, found in Claude under **Settings > Account > Organization ID**. Claude workspace IDs start with `wrkspc_`, found in the Claude Console under **Settings > Workspaces**. |
| **Allowed plans** | People signed in on any other subscription plan are blocked. | Pick a plan, or type a plan name or full plan ID the list doesn't show. |
| **Allowed models** | Messages that use any other model are blocked. | Model names. A name ending in `*` allows every model that starts with it, for example `gpt-5*`. A lone `*` allows all models. |
| **Approved organizations** (Microsoft 365) | People can sign in to Microsoft only with accounts from these organizations. | Organization domains (such as contoso.com) or tenant IDs, plus **Your company's Microsoft directory ID**, a GUID. |
| **Personal accounts and tenant policy** (Microsoft 365) | Applies Microsoft Tenant Restrictions v2 when people sign in to Microsoft. Choose **Block personal Microsoft accounts** or **Use a Cross-Tenant Access policy**. | For a policy: your Microsoft directory ID and tenant restrictions policy ID joined by a colon. Both are in Microsoft Entra under Cross-tenant access settings. |
| **Work accounts only** (Gemini) | Blocks prompts from personal Google accounts and from Gemini used without signing in. Other Google services, such as Gmail, are not affected. | Nothing. It is an on/off switch. |
| **Approved domains** (Gemini) | Allows only Google accounts on these email domains. A domain matches whole, so example.com does not allow mail.example.com. | Email domains, such as example.com. |

### Restrict accounts for an app

1. In **Controls**, select **Accounts**. Each row shows the application, **Who** (always **Everyone**) and its current **Account access**.
2. Select **Edit** on the application's row. If you can only view, the button reads **View**.
3. Under **Restrictions**, turn on each check you need and enter its values.
4. For ChatGPT or Claude, decide whether to keep **Also enforce at OpenAI** or **Also enforce at Anthropic** selected. See the next section.
5. Select **Save account access**.

The console shows a message with the name of the app you edited, for example "ChatGPT account access saved", and closes the form.

A check that you turn off keeps its saved values, so you can turn it back on later. To remove the values, select **Clear** on the turned-off card, then save.

### Enforcing at OpenAI or Anthropic

For ChatGPT and Claude, the approved-list card has a checkbox, **Also enforce at OpenAI** or **Also enforce at Anthropic**. It is selected by default.

| Checkbox | Result |
|---|---|
| Selected | The vendor also refuses every other workspace or organization itself, including at sign-in. For ChatGPT, this needs ChatGPT Enterprise. For Claude, it covers sign-in, Claude Code, the API and the Claude Console, and people see Anthropic's own "Access restricted by network policy" page. |
| Cleared | Only the Endpoint Agent checks prompts. Signing in and switching workspaces keep working, so a person can move to an approved account. |

### What the device does

- The Endpoint Agent checks most account restrictions when it inspects the app's network traffic. A few checks run inside the coding tool, through its hook: the Codex and Cursor model checks, and Claude Code's organization check when **Also enforce at Anthropic** is off. **Pause enforcement** turns off only these checks made inside coding tools.
- The Endpoint Agent checks each prompt against the saved restrictions. A prompt from an account, plan or model that is not allowed is blocked. The person sees a notice, **Workspace/Org ID not approved**, **Plan not approved** or **Model not approved**, and some apps also show a message inside the app. A finding is recorded.
- With vendor enforcement on, OpenAI or Anthropic also refuses other accounts. On claude.ai, when Anthropic refuses an organization, the Endpoint Agent switches the person to an approved organization where it can. Otherwise it signs them out, so they can sign in with an approved account.
- For Microsoft 365, Microsoft Entra refuses the sign-in. This affects sign-in to every Microsoft 365 app, not just Copilot.

The notices are described in [What users see and findings](./what-users-see-and-findings).

### Notes

- Restrictions apply only to app traffic that the Endpoint Agent inspects. Applications excluded from inspection are not covered. Browser Extension policies are separate.
- A check that is on with nothing saved allows everyone. The list tags it **On, nothing saved**. Add values, or turn the check off.
- The tag **Needs a current agent** means the check runs in the Endpoint Agent. Devices on an older agent allow these requests until they update.
- Separate values with commas or new lines.
- For Cursor, personal accounts have no team, so they stay allowed when **Approved teams** is on.
- For Gemini, turning on **Approved domains** also turns on **Work accounts only**. To allow personal Google accounts again, turn **Work accounts only** off.
- For Microsoft 365, if you use both cards, both restrictions are sent at sign-in. Once Tenant Restrictions v2 is in place, Microsoft recommends turning **Approved organizations** off.

## Permissions

| To | You need |
|---|---|
| View Skills, Apps, Accounts and dependency scanning | **Endpoint Agent** page and **Read Endpoint Agent** |
| Change Skills, Apps, Accounts and dependency scanning | **Manage Endpoint Agent** |
| View file rules | **Policy** page and **Read policies** |
| Change and publish file rules | **Policy** page and **Update policies** |

If your tenant still uses V1 roles, changing Apps needs the **App Management** permission (**Tenant**) with **Update**. The **Endpoint Agent** permission with **Update** is not enough for Apps. See [Permissions](./overview#permissions).

Skills, Apps and Accounts use Endpoint Agent access, so they stay available to people who cannot see Endpoint Agent policies. If you have **Read policies** but not **Update policies**, a **Needs Policy update access** bar shows above every Controls area. You can still change Skills, Apps and Accounts if you have **Manage Endpoint Agent**.

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Agent settings](../configure/agent-settings)
- [Inventory](../../console/observe/inventory)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
