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

Besides sensitive-data rules ([Policies and rules](./policies-and-rules)), the **Controls** tab governs file uploads to AI apps, skills and packages in coding tools, which applications run, and which AI accounts are allowed.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Desktop', 'Controls']} />

## Key terms

- **AI app**: an AI chat or assistant application, such as ChatGPT, Claude or Gemini, in a browser or desktop app.
- **Coding tool**: an AI coding agent on the device, such as Claude Code, Cursor or Codex CLI.
- **Sensitivity label**: a classification tag stored inside a document, such as "Confidential".
- **Skill**: a folder of instructions a coding agent can run, often as a slash command such as `/review`.

## Where to find these controls

1. Open **Govern > Policy Engine** and select **Endpoint Agent** in the workspace selector.
2. Select **Desktop**, then the **Controls** tab.
3. Choose an area from the left menu. **Packages** opens [**Settings > Endpoint Agent**](../configure/agent-settings).

## How each control goes live

- **Files**: saved to your draft. Devices use it only after **Review & publish**. See [Draft, test, publish and restore](./draft-test-publish-and-history).
- **Skills**, **Apps**, **Accounts** and **Packages**: saved at once and applied when each device next downloads its settings. They have no draft and are not part of a policy version: **Test** does not evaluate them, **History** does not list them, and restore and **Turn off** do not change them. See [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).

While enforcement is paused, file rules in AI apps only monitor. Skills rules, Packages checks, file-type rules in coding tools and the Accounts checks that coding tools make themselves are off. Apps and other Accounts checks keep applying. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).

## Files

A file rule checks the type or sensitivity label of a file that someone uploads or attaches to an AI app. It is a Policy Engine rule with a file condition, built and published like a sensitive-data rule, and applies only while the Policy Engine is on.

**Files** lists every rule with a file condition, across all policies. A row's **Status** switch turns the rule on or off in your draft.

:::note
File rules apply in AI apps only. In coding tools, file checks still come from **File Restrictions** in your previous Endpoint settings (Console V1), which match file type or sensitivity label. See [What your previous Endpoint settings become](./turn-on-off-and-pause#what-your-previous-endpoint-settings-become).
:::

### Create a file rule

1. In **Controls**, select **Files**, then **Create policy**. The first rule already has a file condition.
2. On **Start from**, keep **Blank** (a starter policy removes the file condition), continue, and enter a **Name**.
3. On **Who**, choose **Everyone**, **Only these people** or **Everyone except**, then people, [Smart Groups](../../console/settings-organization/smart-groups) or departments.
4. On **Where**, choose the AI apps. **Coding tools** is greyed out.
5. On **Looks for**, set the condition under **Files**. **Add a file condition** adds another.
6. On **Response and risk**, choose **What happens in AI apps**.
7. Complete **Priority** and **Check and save** ([Create a policy](./policies-and-rules#create-a-policy)), select **Create policy**, then test and publish.

### File conditions

| Condition | Operators | How it matches |
|---|---|---|
| **File type** | is one of, is not one of | Read from the file's contents, not its name. Plain-text files such as CSV, TXT or JSON may not be recognized. |
| **Sensitivity label** | is one of, is not one of, contains, does not contain | **is one of** compares whole labels, ignoring case. Not every AI app sends labels; the editor warns when one in scope doesn't. |

- **is not one of** and **does not contain** match only files with a detected type or label.
- Older rules can show **File kind**, which still applies until removed.
- When several rules match the same upload, see [How policies are evaluated](./how-policies-are-evaluated) for which response wins.

### What the device does

| Response | Upload result |
|---|---|
| **Block** | Stopped, with a block message. |
| **Require a reason** | Held until the person gives a reason; blocked if none comes in time. |
| **Ask for a reason** | Continues, with a reason popup. |
| **Record only** | Continues, with no message. |

Each matched upload is recorded in [Findings & Interactions](../../console/observe/findings-and-interactions). Without a decision in time, the upload [continues](./limits-and-behavior#when-a-device-cant-get-a-decision).

## Commands & tools {#commands-and-tools}

**Commands & tools** is tagged **Not available**. To limit a Sensitive data rule to commands or MCP tools, use **Narrow to specific actions** in its **Where** step.

## Skills

Skill rules allow or block skills in Claude Code. The Endpoint Agent reports the skills installed on each device (discovered skills), and a rule matches only a discovered skill. Smart Groups are not available.

- **Rule for one person**: blocks or allows a skill by its exact folder. **Edit** later changes only the response.
- **Rule for everyone**: always blocks, by content or name, also for people who install the skill later. To change it, remove it.

If **Add skill rule** shows no **Who** choice, rules for everyone are not enabled; contact QuilrAI support.

When Claude Code runs a skill, either through its Skill tool or because the person types `/name`, any matching **Block** rule that covers the signed-in person stops it. **Allow** never overrides **Block**; skills with no matching rule run. Slash-command checks need Claude Code 2.1.116 or later.

### Block or allow a skill for one person

1. In **Controls**, select **Skills**, then **Add skill rule**.
2. If **Who** is shown, choose **One person**, then the **Person**.
3. In **Skill location**, select **Choose a discovered skill**, or type the folder exactly as reported, such as `~/.claude/skills/review`. Wildcards are not allowed.
4. Optionally, enter a **Skill name** (display only).
5. Under **Skill response**, choose **Block** or **Allow**, then select **Create skill rule**.

### Block a skill for everyone

1. Select **Add skill rule**, then under **Who** choose **Everyone**.
2. Under **Match**, choose **This skill's content** (that content in any folder, picked with **Choose a discovered skill**) or **Any skill with this name** (every skill with that exact name, including unrelated ones).
3. Choose the **Coding tool**, then select **Block for everyone**.

:::warning
Devices enforce a rule for everyone only when it matches by **This skill's content** and its **Coding tool** is **Claude Code** or **Any coding tool**. Other rules for everyone, such as **Any skill with this name** rules, are saved but not enforced.
:::

Removing a rule for everyone does not remove per-person rules for the same skill.

## Packages

Dependency scanning checks each package (software library) that Claude Code installs for known vulnerabilities, such as CVEs (publicly listed vulnerabilities), and newer versions. It is a setting, not a policy.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Endpoint Agent']} />

| Switch (all off by default) | What it does |
|---|---|
| **Claude Code dependency scanning** | Records installed packages for [Inventory](../../console/observe/inventory). Alone, it does not check or stop installs. |
| **Block vulnerable dependencies** | Stops installs of versions with known vulnerabilities, with a summary. |
| **Notify about newer dependency versions** | Tells the developer a newer version exists. The install continues. |

Scanning covers install commands and supported manifest changes for npm, PyPI, crates.io, Go, RubyGems, NuGet, Packagist and Maven. If a package can't be assessed or the check times out, the install is allowed.

### Turn on dependency scanning

1. On the **Dependency scanning** card, turn on **Claude Code dependency scanning**.
2. Turn on one or both response switches. They stay greyed out until scanning is on.

:::note
Dependency scanning is supported in Claude Code only. A row such as **Cursor install checks** means checks were turned on for that tool earlier. Select **Turn off** to clear them. Dependency inventory is not affected.
:::

## Apps

An app rule blocks or allows an installed application for everyone, a Smart Group or one person. When a blocked application starts, the Endpoint Agent ends it and its child processes, but never operating-system components. If the person started it, they see a popup and a finding is recorded. If it starts again, the Endpoint Agent ends it again.

### Block or allow an application

1. In **Controls**, select **Apps**, then **Add app access rule**.
2. In **Installed application**, choose the application. It lists apps reported in the last 30 days; type to search.
3. In **Operating system**, choose **macOS and Windows**, **macOS** or **Windows**.
4. Under **Applies to**, choose **Everyone**, **A Smart Group** or **One person** (enter their **Person's work email**, as used on the device).
5. Under **What should happen?**, choose **Block app from running** (default) or **Allow app to run**.
6. Select **Create app access rule**.

### Which rule wins

- A person's rule overrides their Smart Groups' rules, which override the rule for **Everyone**.
- For the same audience, a rule for one operating system overrides one for **macOS and Windows**.

### Notes

- **Block (existing)** is an earlier blocking rule, shown as **Keep existing block** when edited. It stops the app but does not isolate its files.
- An app reported as several programs is one row with a parts tag. The rule, **Edit** and **Remove** cover every part.
- **Unidentified app rules** name an app only by **App identifier**. They still apply and can be removed but not edited.
- Audit-only app access is not available.
- **Edit** changes only the response. For another application, audience or operating system, add a rule.
- [Inventory](../../console/observe/inventory) approval labels, such as Approved, do not stop applications.

## Accounts

Account restrictions decide which accounts, plans and models people may use in an AI app. They apply to everyone, without per-person exceptions. Each check allows only the values you enter.

### Checks for each app

Supported apps are ChatGPT (also Codex), Claude (also Claude Code), Microsoft 365 (including Copilot), Granola, Cursor, GitHub Copilot, Antigravity and Gemini. Any extra checks appear under **Other restrictions**.

| Check | Apps | What you enter |
|---|---|---|
| **Approved workspaces** | ChatGPT, Claude (Anthropic workspaces), Granola | Workspace IDs. Claude's (`wrkspc_...`) are in the Claude Console under **Settings > Workspaces**. |
| **Approved organizations** | Claude | Organization IDs (UUIDs), in Claude under **Settings > Account > Organization ID**. |
| **Approved teams** | Cursor | Team IDs. Personal accounts have no team and are not blocked. |
| **Allowed plans** | All except Microsoft 365 and Gemini | A listed plan, or a plan name or full plan ID. |
| **Allowed models** | Same as **Allowed plans**. For Antigravity it can be saved but is not enforced; use **Allowed plans**. | Model names. `gpt-5*` allows every model starting with `gpt-5`; `*` alone allows all. |
| **Approved organizations** | Microsoft 365 | Domains (contoso.com) or tenant IDs allowed at Microsoft sign-in, plus **Your company's Microsoft directory ID** (a GUID). |
| **Personal accounts and tenant policy** | Microsoft 365 | Tenant Restrictions v2: **Block personal Microsoft accounts**, or **Use a Cross-Tenant Access policy** with `<directory ID>:<tenant restrictions policy ID>` from Microsoft Entra Cross-tenant access settings. |
| **Work accounts only** | Gemini | On/off. Blocks personal Google accounts and signed-out use; other Google services are unaffected. |
| **Approved domains** | Gemini | Email domains, matched whole (example.com does not allow mail.example.com). Also turns on **Work accounts only**. |

### Restrict accounts for an app

1. In **Controls**, select **Accounts**, then **Edit** on the app's row. **View** means read-only access.
2. Under **Restrictions**, turn on each check you need and enter its values, separated by commas or new lines.
3. For ChatGPT or Claude, keep or clear **Also enforce at OpenAI** or **Also enforce at Anthropic**.
4. Select **Save account access**.

A turned-off check keeps its values until you select **Clear** on its card and save.

### Enforcing at OpenAI or Anthropic

For ChatGPT and Claude, the approved-list card has an **Also enforce at OpenAI** or **Also enforce at Anthropic** checkbox:

- **Selected** (default): the vendor also refuses other workspaces or organizations, including at sign-in. For ChatGPT, this needs ChatGPT Enterprise. For Claude, it also covers Claude Code, the API and the Claude Console, and people see Anthropic's "Access restricted by network policy" page.
- **Cleared**: only the Endpoint Agent checks prompts, so people can still sign in and switch to an approved account.

### What the device does

A prompt from a disallowed account, plan or model is blocked with **Workspace/Org ID not approved**, **Plan not approved** or **Model not approved**, and a finding is recorded. See [What users see and findings](./what-users-see-and-findings).

- On claude.ai, if Anthropic refuses an organization, the agent switches the person to an approved one where possible, or signs them out.
- For Microsoft 365, Microsoft Entra refuses a disallowed account's sign-in, which blocks that account in every Microsoft 365 app, not just Copilot.

### Notes

- Only traffic the Endpoint Agent inspects is covered. Browser Extension policies are separate.
- A check that is on with no values allows everyone (tagged **On, nothing saved**).
- Checks tagged **Needs a current agent** are not enforced on older agents until they update.
- For Microsoft 365, if both cards are on, both restrictions are sent at sign-in. Once Tenant Restrictions v2 is in place, Microsoft recommends turning that app's **Approved organizations** off.

## Permissions

| Area | View | Change |
|---|---|---|
| Files | **Policy** page and **Read policies** | **Policy** page and **Update policies** |
| Skills, Apps, Accounts, Packages | **Endpoint Agent** page and **Read Endpoint Agent** | **Manage Endpoint Agent**. With V1 roles, Apps needs **App Management** (**Tenant**) **Update**. |

With **Read policies** but not **Update policies**, a **Needs Policy update access** bar shows above every Controls area. You can still change Skills, Apps and Accounts if you have **Manage Endpoint Agent**. See [Permissions](./overview#permissions).

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [Limits and behavior to know](./limits-and-behavior)
