---
sidebar_position: 8
sidebar_label: "Limits and behavior"
sidebar_custom_props:
  icon: Gauge
description: "Size limits, supported tools, condition caveats, timing, fail-open behavior and differences from previous Endpoint settings that affect Endpoint Agent Policy Engine results."
console_path: []
aliases: [policy limits, size limits, rule limit, "200 policies", "500 rules", rule settings limit, fail open, policy timing, conversion differences, endpoint settings differences, known limitations]
---

# Limits and behavior to know

Updated on 10 November 2026.

This page lists the fixed limits of the Endpoint Agent Policy Engine and the behavior that can change a result without an error message. Each item says what happens and why. Where it helps, an item also says what to do. Read this page before you turn on the Policy Engine, while you plan policies, and when a result isn't what you expected.

## Key terms

| Term | Meaning |
|---|---|
| **AI app** | An AI chat or assistant application, such as ChatGPT, Claude or Gemini, that people use in a browser or as a desktop app. In a rule, **AI apps** covers their chat, upload and API traffic. |
| **Coding tool** | An AI coding agent that runs on the device, such as Claude Code, Cursor or Codex CLI. |
| **Hook** | A setting the Endpoint Agent adds to a coding tool so that the tool asks the agent before each prompt or action. |
| **Where** | The step of a rule that chooses whether it checks AI apps, coding tools or both. |
| **Priority** | A policy's position relative to other policies: **Default**, **In Priority policies**, **Always loses** or **Custom order**. See [How policies are evaluated](./how-policies-are-evaluated#step-1-priority). |
| **Stored rule** | One `request` block in a policy's QuilrQL code. QuilrQL is the text form of a policy that the Code view shows. One rule in the editor can become several stored rules. |
| **Previous Endpoint settings** | The per-app **Guardrails**, **File Restrictions** and **Group & User Rules** that decide on devices while the Policy Engine is off. You manage them in Console V1 under **Settings > Endpoint**. See [Console V1 settings](../../console/legacy-v1/administration/settings). |
| **Converted policies** | The policies that **Turn on** writes from your previous Endpoint settings. |
| **Starter policies** | Four policies from QuilrAI that **Turn on** adds, switched off. See [Starter policies](./policies-and-rules#starter-policies). |
| **Detection Policy** | A separate rules engine in Console V1, under **Settings > Detection Policy**. Its rules are not converted into policies. |
| **Application Monitoring** | The setting in **Settings > Endpoint Agent** that decides which AI apps, and which browsers, the Endpoint Agent monitors. Policies apply only to monitored apps. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app). |

## Size limits

These limits apply to all Endpoint Agent policies together, including converted policies, starter policies and policies that are turned off. QuilrAI checks them when you save and when you publish. A save or publish that goes over a limit is refused, and the live version doesn't change.

| Limit | Value | Notes |
|---|---|---|
| Policies | 200 | One is kept for **Pause enforcement**, so you can publish up to 199. **All policies** warns at 90%: "You're close to the limit of 200 policies." See [Room kept for Pause enforcement](#room-kept-for-pause-enforcement). |
| Stored rules | 500, across all policies | One is kept for **Pause enforcement**, so you can publish up to 499. Stored rules can be more than the rules you see in the editor. See [How rules are counted](#how-rules-are-counted). |
| Rule settings | 2,000, across all policies | Each response, risk or alert that a stored rule sets counts as one setting. One is kept for **Pause enforcement**. |
| Policy text | 400,000 bytes | The size of all policies as QuilrQL. A small amount is kept for **Pause enforcement**. |
| Values in one list | 128 | People, apps, programs, coding tools or condition values. The editor says "One list can hold up to 128 values." |
| Data types in one rule | 64 | The editor says "A rule can look for up to 64 data types." All policies together can name up to 256 different data types. |
| Groups of data types | One level; at least two data types each; at most 64 ways to combine | |
| Conditions in one rule | About 30 | See [Too many conditions in one rule](#too-many-conditions-in-one-rule). |
| **Only when** nesting | 2 group levels | The editor says "Groups go two levels deep. Add it as its own condition instead." |
| Programs in one rule | 128 | File names only, such as `chatgpt.exe`, up to 255 characters each. |
| Policy name | 120 characters | Must be unique, ignoring case. A description can have up to 500 characters. |
| Rule name | 120 characters | |
| Priority number | 0 to 999,999 | 1,000,000 is reserved for **Pause enforcement**. |
| Count | 1 to 100,000 | The amount in **At least** and **More than**. |

### How rules are counted

The 500 limit counts stored rules, not the rules you see in the editor. The editor saves one rule as several stored rules:

- One for each of AI apps and coding tools that the rule checks under **Where**.
- When **Looks for** has two or more items and uses **Any one is enough**: built-in data types count once, attack types count once, and each custom detection and each group of data types counts once more. With **All must be found**, or a single item, they count once.
- Each of these is multiplied by one plus the number of **For some people** rows.

Rules that are turned off still count.

For example, a rule that checks AI apps and coding tools, looks for data types and attacks with **Any one is enough**, and has two **For some people** rows counts as 12 stored rules: 2 (AI apps and coding tools) × 2 (data types and attacks) × 3 (the rule plus its two rows). If you add three custom detections to that rule, it counts as 30: 2 × 5 × 3.

### Too many conditions in one rule

One rule can join about 30 conditions. Everything the rule requires counts: the line for AI apps or coding tools, the apps or tools you choose, the people under **Who**, one line for each kind of name (people, Smart Groups, departments) in each **For some people** row, file conditions and **Only when** lines.

The editor doesn't count conditions while you edit. When a rule has too many, saving fails with "This policy can't be saved yet: expression exceeds depth 32". To fix it, move some **For some people** rows or people into a rule or policy of their own, or name fewer kinds of names in each row.

### Room kept for Pause enforcement

**Pause enforcement** adds one policy with one rule and one rule setting. So that you can always pause, every publish keeps room for it. A publish that would use that room is refused with "Endpoint keeps room for Pause enforcement under the Policy Engine's size limits, and this draft would use it up (...). Remove a policy or rule, then publish." This is why you can publish up to 199 policies, 499 stored rules and 1,999 rule settings.

A pause is refused only when the running version is already at a limit, for example a version that **Turn on** converted from a large set of previous Endpoint settings. The message is "The policies are at the Policy Engine's size limit (...), so the pause does not fit. Remove a policy, then pause." In that case, remove a policy, publish, then pause. A version that is already at a limit still accepts a publish that doesn't use more of that limit.

## What the Policy Engine covers

### Only Sensitive data and Files are policies

Sensitive data and Files rules are Policy Engine policies. Skills, Apps and Accounts have their own editors and apply when you save. Packages are set in **Settings > Endpoint Agent > Dependency scanning**, and **Commands & tools** has no editor: to limit a Sensitive data rule to certain commands or MCP tools, use **Narrow to specific actions** in that rule.

So **Test**, **History** and restoring an earlier version cover Sensitive data and Files only. See [How each control goes live](./files-skills-packages-apps-accounts#how-each-control-goes-live).

### Coding tools

The Endpoint Agent runs on Windows and macOS. See [Requirements](../get-started/requirements).

Coding-tool rules check Claude Code, Cursor, Codex CLI, Copilot CLI, Copilot in the IDE, Qoder, QoderWork, Antigravity and ZCode. **All coding tools** also covers other coding tools that the Endpoint Agent checks.

Two coding tools don't send every prompt for checking:

- Coding-tool rules don't check prompts typed into Copilot. A rule for the GitHub Copilot AI app can check them.
- Antigravity doesn't send typed prompts for checking. Coding-tool rules check its file and tool actions only.

Coding tools can't ask for a reason, so **Require a reason** is not offered for them, and **Ask for a reason** is called **Warn and continue**. Tools that can't block a step show a warning instead. See [Responses](./policies-and-rules#responses) and [Differences between coding tools](./what-users-see-and-findings#differences-between-coding-tools).

### Files

Policy Engine file rules check uploads to AI apps only. For how **File type** and **Sensitivity label** conditions match there, see [File conditions](./files-skills-packages-apps-accounts#file-conditions).

In coding tools, file checks come from the **File Restrictions** in your previous Endpoint settings, and they behave differently:

- They keep applying while the Policy Engine is on. **Pause enforcement** turns them off.
- The file type is read from the file's contents. For plain-text formats, such as CSV, YAML or Python files, the extension in the file name is used.
- A file with no detected type or label matches every negative condition, such as is not one of or does not contain. In AI apps, such a file matches none of them.
- Changes to File Restrictions can stop being accepted while the Policy Engine is on. See [Differences from Endpoint settings](#differences-from-endpoint-settings).

### Codex

Codex belongs to the ChatGPT app. There is no separate **Application Monitoring** switch for Codex: turning ChatGPT off also stops monitoring Codex. In policies, a rule for ChatGPT in AI apps also covers Codex in the browser and desktop app. For the Codex coding agent, choose **Codex CLI** under coding tools.

## Conditions that depend on what the device reports

A condition can only use a value that the device sends with the request. When a value is missing, **is any of** doesn't match and **is none of** does. To leave out values only on requests that report the field, use **isn't (when reported)** instead of **is none of**. To require the field to be reported, use **has a value**.

| Condition | Reported for | What to know |
|---|---|---|
| **Who**, Email, Smart Group, Department | People signed in to the Endpoint Agent | A device where nobody is signed in has no person. **Everyone** and **Everyone except** cover it; **Only these people** doesn't. Departments come from your directory as of the person's last agent sign-in. A Smart Group that was deleted or turned off matches nobody. Under **Everyone except** or **Excluded**, it excludes nobody. The editor marks it **Smart group not found**. |
| Device name, Device hostname, Device OS, **Only on these devices…**, **Only on Windows**, **Only on macOS** | Coding tools | Use device conditions in coding-tool rules. AI-app requests don't report the device OS or hostname, so those conditions never match in an AI-app rule and never exclude anything under **But not when**. The editor doesn't warn about this. |
| **Program** | AI apps only | Type the file name, such as `chatgpt.exe`, not a path. macOS reports only the first 31 characters of a program name, so for a Mac type the first 31. A request whose program isn't known never matches **Only in these programs** and always matches **Not in these programs**. |
| **Command**, **Tool action** | Coding tools | **Command** holds only the program that ran, such as `curl`, `git` or `powershell`, never its arguments. A value such as `rm -rf` or a URL never matches. Both are checked only when the action also reads or sends a readable file. |
| **MCP server**, **MCP tool** | Claude Code, Codex CLI, Qoder and QoderWork | Checked only when a readable file is involved. |
| **AI model** | Some AI apps, Cursor and Codex CLI | Claude Code doesn't report the model. |
| **Repository** | Some AI-app requests | No coding tool reports it. |
| Fields under **Not reported here** | Not reported for the AI apps or coding tools the rule checks | The condition picker lists these fields last. A condition on one of them always sees a missing value. |

Smart Groups hold people, not devices. To target devices in coding tools, use **Only on these devices…**: a name ending in `*` matches every name that starts with it, for example `EXEC-*`.

## Behavior that can change a result without a message

| What you see | Why | What to do |
|---|---|---|
| A rule doesn't apply, although the request contained data it looks for. | When a rule uses **All must be found**, every data type it names must be checked. If one data-type check is unavailable for a request, the rule is skipped, unless what was found already decides it. The editor notes: "If one of these checks is unavailable, this rule is skipped." With **Any one is enough**, built-in data types, attack types and each custom detection are checked separately, so an unavailable check affects only its own part of the rule. If no other rule decides, the finding can show **Some rules not checked**. | Use **Any one is enough** where it fits, and keep **All must be found** rules to the data types they need. See [Why rules were not checked](./what-users-see-and-findings#why-rules-were-not-checked). |
| A rule acts on every request in its apps or tools. | The rule has nothing under **Looks for** or **Only when**, so it applies to every request in its **Where**. With **Record only**, it records nothing in Findings by itself. | Add a data type, file, command or other condition. The editor warns when a rule doesn't look at content. |
| A repeated test in an AI app shows no popup and no new finding. | In AI apps, the device treats identical content within 2 minutes as a repeat. It may not show the popup again, may reuse a reason the person already gave, and may not record a new finding. Coding-tool requests are decided again each time. | When you test in an AI app, change the content or wait 2 minutes between attempts. |
| One browser prompt shows two popups or two findings. | The browser is on for that app under **Application Monitoring**, and the Browser Extension also runs in that browser. Each product checks the prompt with its own policies and records its own finding. | To leave that browser to the Browser Extension, turn the browser off for the app under **Application Monitoring** in **Settings > Endpoint Agent**. |

## When a device can't get a decision

QuilrAI makes each Policy Engine decision when the request happens. The device doesn't decide on its own. If it can't get a decision, it lets the request continue (fails open), so an outage doesn't stop people's work.

| Situation | AI apps | Coding tools |
|---|---|---|
| No answer in time | Allowed after at most 5 seconds | Allowed after at most 7.5 seconds |
| The device is offline or can't reach QuilrAI | Allowed. Identical content that was blocked in the last 2 minutes stays blocked. | Allowed |
| A **Require a reason** popup can't be shown | Blocked | Not used in coding tools |

## How long changes take to reach devices

QuilrAI decides Sensitive data and Files rules when each request happens, so a publish applies to the next request. Other controls reach a device when it next checks for changes. A device that is offline applies changes when it reconnects.

The console doesn't confirm when each device has a change: **History** says "agents pick it up on their next poll. Device-level confirmation is not available." To confirm a change, look for new findings from the devices you care about.

| Change | When devices apply it |
|---|---|
| Publish, restore, **Pause enforcement** or **Resume enforcement**: Sensitive data rules (AI apps and coding tools) and file rules (AI apps) | On the next request. In AI apps, identical content that was just blocked can stay blocked for up to 2 minutes. |
| **Turn on** or **Turn off** | AI apps: on the next request. Within about 2 minutes, devices also update which apps they send for a decision. Coding tools: within about 4 minutes. |
| Skill rules, and File Restrictions in coding tools | Within about 4 minutes. |
| Apps rules | At the device's next sync, usually within about 1 minute. |
| **Accounts** | AI apps: within about 2 minutes. Checks that coding tools make themselves: within about 15 minutes. |
| Package checks | Within about 15 minutes. |
| **Application Monitoring**: turning an app on or off | Within about 4 minutes. |
| **Application Monitoring**: a browser change | Within about 2 minutes. |
| A person's department | After their next sign-in to the Endpoint Agent. |

For what keeps applying while enforcement is paused, see [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).

## Moving from Endpoint settings

### What Turn on converts

**Turn on** reads your previous Endpoint settings as they are at that moment and writes them as converted policies. For what each setting becomes, see [What your previous Endpoint settings become](./turn-on-off-and-pause#what-your-previous-endpoint-settings-become). The table below lists only what can surprise you.

| Topic | What happens | What to do |
|---|---|---|
| No preview and no conflict check | **Turn on** doesn't show a preview. The dialog says: "Turning on doesn't check these policies for rule conflicts first. Once it's on, the Policies list and History show any rules that lose to others." | Review **All policies** and test the people and apps that matter most right after you turn on. |
| Size limits | If your previous Endpoint settings convert into more than the [size limits](#size-limits) allow, **Turn on** is refused with the reason, and nothing changes. | Remove Group & User Rules or app settings you no longer need, then try again. If it still fails, contact QuilrAI support. |
| Large app policies | A converted app policy with many rules is split into parts, such as **ChatGPT** and **ChatGPT (part 2)**. Each part counts as a policy. | No action needed. |
| Starter policies | Added switched off, so they change nothing until you switch one on. **Turn on** never fails because of them. If they can't be added alongside your converted policies, for example because of the size limits, Turn on goes ahead without them and says: "Quilr's starter policies weren't added: they didn't pass the safety check alongside your policies. You can still start a new policy from one." | Start a new policy from a starter when you need one. |
| Responses the editor doesn't offer, such as Redact | They become rules written as code. The editor says why, for example "It uses the Redact response, which the builder doesn't offer." In AI apps, a Redact response blocks the request: devices don't send a redacted version. | To let people continue instead, change the rule's response in its code, for example to `justification_optional` for **Ask for a reason**. See [Edit a policy as code (QuilrQL)](./policies-and-rules#edit-a-policy-as-code-quilrql). |
| Coding tools of converted apps | A converted app policy also applies to that app's coding tool, even when **Coding tools** is off in the rule. For example, ChatGPT also covers Codex CLI, Claude covers Claude Code, GitHub Copilot covers Copilot CLI and Copilot in the IDE, and Cursor covers the Cursor agent. The rule shows, for example, "This rule also covers Codex CLI, even with Coding tools off below." | To limit the rule to AI apps, select **Apply to AI apps only** on the rule. |
| Apps with **Guardrails** off | No policy is written. The app's traffic is now captured, and any policy that covers the app checks it, such as a policy for all AI apps. | To stop monitoring an app, turn it off under **Application Monitoring**. |
| **Detection Policy** | Not converted. **Turn on** is blocked: "Detection Policy decides this tenant's endpoint traffic; Turn on is blocked so it keeps working." | See [Before you turn on](./turn-on-off-and-pause#before-you-turn-on). |
| Dependency scanning, **Application Monitoring**, findings and inventory | Unchanged. Dependency scanning stays in **Settings > Endpoint Agent > Dependency scanning**. | No action needed. |

### Differences from Endpoint settings

These are the known differences between converted policies and your previous Endpoint settings.

#### When Group & User Rules became separate policies

Usually, **Turn on** writes Group & User Rules as separate exception policies for each app, such as **ChatGPT · For Smart Groups**, **ChatGPT · For people** and their versions **by activity**. These policies show **Custom order** in **All policies**. The rows below apply only to this case.

If any Group & User Rule sets File Restrictions, or Language Blocking is on for any app or exception, Turn on writes the exceptions inside the app's own policies at **Default** Priority instead, and these rows don't apply.

| What you see | Why | What to do |
|---|---|---|
| A new policy at **Default** doesn't change the result for people named in Group & User Rules. | Converted Smart Group and person exceptions have a higher Priority than **Default**, so they decide first for the people they name, even when your new policy is stricter. **All policies** notes that these settings "also decide before other policies, for the people they name." | Add the new policy to **Priority policies**, which decides before them, or edit the converted policy. |
| A person in several Smart Groups gets a different response than before. | Your previous Endpoint settings applied the setting of the person's top-ranked Smart Group. The Policy Engine checks every group the person is in, picks by Priority first and, at the same Priority, uses the strictest response. The result can be stricter or weaker. | In **Test**, use **Try a situation** with each combination of groups that matters, then adjust the converted policies. |
| People who had a category or **Guardrails** turned off for them in Group & User Rules are checked again. | The app's converted policy has no exception for them, so its rules still check and decide for those people. | In **Test**, use **Try a situation** for those people. Then edit the converted policy: exclude them under **Everyone except**, or give them **Record only** under **For some people**. |

#### In every case

| What you see | Why | What to do |
|---|---|---|
| Changes to your previous Endpoint settings no longer update the policies. | While the converted version runs, a change to your previous Endpoint settings updates the converted policies. After anyone publishes, restores, pauses or resumes, or **Turn on** keeps policies or a pause from an earlier version, a change that would alter the converted policies is refused. The **Pause enforcement** dialog warns about this: "from then on settings changes no longer update the policies, even after you resume." | Make the change in the Policy Engine. File-type rules for coding tools come only from File Restrictions and can't be changed in the Policy Engine. To change them, contact QuilrAI support. |
| After **Turn off**, devices don't follow your Policy Engine edits. | Edits in the Policy Engine are never copied back into your previous Endpoint settings. Turn off returns devices to the previous Endpoint settings as they are now. | Review your previous Endpoint settings in Console V1 before you turn off. |
| After you turn on again, edits to converted policies are gone. | **Turn on** converts your current Endpoint settings again, so edits to converted policies aren't kept. Policies you wrote are kept. | Open the earlier version in **History** to see the edits, then make them again. |
| **Turn off** is disabled. | After you publish, restore, pause or resume: "The policies running now aren't the ones converted from your Endpoint settings, so only Quilr support can turn off Policy Engine." | Use **Pause enforcement** to stop blocking, and contact QuilrAI support to turn off. See [Turn on, turn off and pause](./turn-on-off-and-pause). |

## Testing limits

**Try a situation** uses only the details you choose: it doesn't scan text or files, and it doesn't look up a person's Smart Groups or department. **Replay activity** has no department and counts some specific data types as unavailable. Neither covers Skills, Apps or Accounts, or applies **Application Monitoring**. See [Test your changes](./draft-test-publish-and-history#test-your-changes).

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [Policies and rules](./policies-and-rules)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts)
- [What users see and findings](./what-users-see-and-findings)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
- [Agent settings](../configure/agent-settings)
- [Requirements](../get-started/requirements)
- [Smart Groups](../../console/settings-organization/smart-groups)
- [Console V1 settings](../../console/legacy-v1/administration/settings)
- [Browser Extension policy engine](../../browser-extension/policy-engine/overview)
