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

This page lists the fixed limits of the Endpoint Agent Policy Engine and behavior that can change a result without an error message.

## Key terms

| Term | Meaning |
|---|---|
| **AI app** | An AI chat app, such as ChatGPT, in a browser or desktop app. |
| **Coding tool** | An AI coding agent on the device, such as Claude Code. |
| **Stored rule** | One `request` block in a policy's QuilrQL code (the text form shown in the Code view). One editor rule can make several. |
| **Previous Endpoint settings** | Per-app **Guardrails**, **File Restrictions** and **Group & User Rules** in Console V1 **Settings > Endpoint**. They decide on devices while the Policy Engine is off; **Turn on** converts them into policies. |
| **Application Monitoring** | The **Settings > Endpoint Agent** setting that picks which AI apps and browsers are monitored. Policies apply only to monitored apps. |

## Size limits

Limits cover all Endpoint Agent policies, including turned-off ones. A save or publish over a limit is refused.

- **Policies:** 200. **All policies** warns at 90%.
- **Stored rules:** 500. See [How rules are counted](#how-rules-are-counted).
- **Rule settings** (responses, risks and alerts): 2,000.
- **Policy text**, all policies as QuilrQL: 400,000 bytes.
- **Values in one list:** 128.
- **Data types:** 64 per rule, 256 different ones across all policies.
- **Data-type groups:** one level, two or more data types each, 64 combinations at most.
- **Conditions in one rule:** about 30.
- **Only when** nesting: 2 group levels.
- **Policy or rule name:** 120 characters. Policy names must be unique, ignoring case.
- **Description:** 500 characters. **Program name:** 255 characters.

### How rules are counted

One editor rule makes A × B × C stored rules:

- **A:** 1 for each of AI apps and coding tools that it checks.
- **B:** with **Any one is enough** and two or more **Looks for** items: 1 for all built-in data types, 1 for all attack types, plus 1 for each custom detection and each data-type group. Otherwise 1.
- **C:** 1 plus the number of **For some people** rows.

Example: a rule that checks AI apps and coding tools, looks for data types and attacks with **Any one is enough**, and has two **For some people** rows counts as 2 × 2 × 3 = 12.

### Too many conditions in one rule

A rule can join about 30 conditions: the AI apps or coding tools line, chosen apps or tools, people under **Who**, each kind of name (people, Smart Groups, departments) per **For some people** row, file conditions and **Only when** lines. Past that, saving fails with "expression exceeds depth 32". Move some **For some people** rows or people to another rule, or name fewer kinds per row.

### Room kept for Pause enforcement

**Pause enforcement** needs one policy, rule and rule setting, so you can publish only 199 policies, 499 stored rules and 1,999 rule settings. A version already at a limit can still publish changes that don't add to that limit. A pause is refused only when the running version is already at a limit, such as after a large **Turn on**. Remove a policy, publish, then pause.

## What the Policy Engine covers

Only Sensitive data and Files rules are policies, so only they have **Test**, **History** and restore. See [How each control goes live](./files-skills-packages-apps-accounts#how-each-control-goes-live). **Commands & tools** has no editor: to limit a Sensitive data rule to certain commands or MCP tools, use **Narrow to specific actions** in that rule.

### Coding tools

Coding-tool rules check Claude Code, Cursor, Codex CLI, Copilot CLI, Copilot in the IDE, Qoder, QoderWork, Antigravity and ZCode. **All coding tools** also covers others the agent checks. Prompts typed into Copilot are checked only by a GitHub Copilot AI-app rule. In Antigravity, only file and tool actions are checked.

Codex in the browser and desktop app counts as ChatGPT in rules. For the Codex agent, choose **Codex CLI**. **Application Monitoring** has no Codex switch: turning ChatGPT off also covers Codex, including Codex CLI, with the same exceptions as any app that is off. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).

### Files

Policy Engine file rules check AI-app uploads only. In coding tools, your previous **File Restrictions** check files instead. They:

- Keep applying until **Pause enforcement** turns them off.
- Read the file type from the contents, or the extension for plain-text formats such as CSV.
- Match every negative condition, such as is not one of, for a file with no detected type or label. In AI apps, such a file matches none of them.
- Can't be changed in Console V1 after anyone publishes, restores, pauses or resumes. See [In every case](#in-every-case).

## Conditions that depend on what the device reports

A condition sees only values the device sends. A missing value never matches **is any of** and always matches **is none of**. To match only reported values, use **isn't (when reported)** or **has a value**.

- **Who**, Email, Smart Group, Department: signed-in people only. With nobody signed in, **Everyone** and **Everyone except** cover the device; **Only these people** doesn't.
- Device name, hostname and OS, **Only on these devices…**, **Only on Windows**, **Only on macOS**: coding tools only. AI-app rules never match or exclude on them, and the editor doesn't warn. In **Only on these devices…**, a name ending in `*` matches every name that starts with it, such as `EXEC-*`.
- **Program**: AI apps only. Use the file name, such as `chatgpt.exe`, not a path. macOS reports only the first 31 characters.
- **Command**, **Tool action**: coding tools, only when a readable file is read or sent. **Command** is the program, such as `curl`, never arguments such as `rm -rf` or a URL.
- **MCP server**, **MCP tool**: Claude Code, Codex CLI, Qoder and QoderWork, only with a readable file.
- **AI model**: some AI apps, Cursor and Codex CLI. **Repository**: some AI-app requests.
- Fields under **Not reported here** in the condition picker are always missing.

## Behavior that can change a result without a message

- **A rule doesn't apply although the data was there.** With **All must be found**, one unavailable data-type check skips the rule unless what was found decides it, and the finding can show **Some rules not checked**. **Any one is enough** skips only that part. See [Why rules were not checked](./what-users-see-and-findings#why-rules-were-not-checked).
- **A repeated AI-app test shows no popup or finding.** Identical AI-app content within 2 minutes can reuse the earlier answer and reason. Change the content or wait 2 minutes. Coding tools decide every request.
- **One browser prompt shows two popups or findings.** The Endpoint Agent monitors that browser for the app, and the Browser Extension runs in it too; each checks the prompt with its own policies. To leave the prompt to the Browser Extension, turn that browser off for the app under **Application Monitoring**.

## When a device can't get a decision

Without a decision from QuilrAI, the device lets the request continue (fails open):

- **No answer in time:** allowed after 5 seconds in AI apps and 7.5 seconds in coding tools.
- **Offline or can't reach QuilrAI:** allowed, except identical AI-app content blocked in the last 2 minutes.
- **A Require a reason popup can't be shown** (AI apps only): blocked.

## How long changes take to reach devices

Devices apply controls other than Sensitive data and Files rules at their next check for changes, or when they reconnect. The console doesn't confirm each device, so look for new findings.

| Change | Applied |
|---|---|
| Publish, restore, pause or resume of Sensitive data and Files rules | Next request. In AI apps, identical content just blocked can stay blocked for up to 2 minutes. |
| **Turn on** or **Turn off** | AI apps: next request; within about 2 minutes, devices also update which apps they send for a decision. Coding tools: about 4 minutes. |
| Skill rules, coding-tool File Restrictions, **Application Monitoring** app changes | About 4 minutes |
| **Accounts** in AI apps, **Application Monitoring** browser changes | About 2 minutes |
| Apps rules | About 1 minute |
| Packages, **Accounts** checks that coding tools make | About 15 minutes |
| A person's department | Their next Endpoint Agent sign-in |

## Moving from Endpoint settings

### What Turn on converts

**Turn on** converts your previous Endpoint settings as they are at that moment ([what each becomes](./turn-on-off-and-pause#what-your-previous-endpoint-settings-become)). Watch for:

- **No preview or conflict check.** Afterward, check **All policies** for rules that lose, and test key people and apps.
- **Over the size limits**, **Turn on** is refused. Remove Group & User Rules or app settings you don't need, or contact QuilrAI support.
- **Large app policies** split into parts, such as **ChatGPT (part 2)**, each counted as a policy.
- **Redact** and other responses the editor doesn't offer become code-only rules. In AI apps, Redact blocks. To let people continue, set `justification_optional` (**Ask for a reason**) in [the code](./policies-and-rules#edit-a-policy-as-code-quilrql).
- **App policies also cover their coding tool**, even with **Coding tools** off: ChatGPT covers Codex CLI, Claude covers Claude Code, GitHub Copilot covers Copilot CLI and Copilot in the IDE, and Cursor covers the Cursor agent. Select **Apply to AI apps only** to stop this.
- **Apps with Guardrails off** get no policy, but any policy covering them now checks their traffic. To stop it, turn the app off under **Application Monitoring**, with the exceptions in [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).

### Differences from Endpoint settings

#### When Group & User Rules became separate policies

Unless a Group & User Rule sets File Restrictions, or Language Blocking is on, **Turn on** writes these rules as separate exception policies per app, such as **ChatGPT · For Smart Groups**, at **Custom order**. Then:

- **A new Default policy doesn't change results for people in Group & User Rules.** Their exceptions have higher [Priority](./how-policies-are-evaluated#step-1-priority) and decide first. Add yours to **Priority policies**, or edit the exception.
- **People in several Smart Groups can get a different response.** Previous settings used the top-ranked group; the Policy Engine picks by Priority, then the strictest response. Test combinations with **Try a situation**.
- **People who had a category or Guardrails turned off in a Group & User Rule are checked again**, because the app's converted policy has no exception for them. Exclude them under **Everyone except**, or give them **Record only** under **For some people**.

#### In every case

- **After a publish, restore, pause or resume**, or a **Turn on** that keeps earlier policies or a pause, settings changes that would alter converted policies are refused and **Turn off** is disabled, even after you resume. Make changes in the Policy Engine, and pause to stop blocking. To turn off, or to change coding-tool file-type rules (only File Restrictions set them), contact QuilrAI support.
- **Turn off ignores Policy Engine edits**: devices return to your previous Endpoint settings as they are now.
- **Turning on again drops edits to converted policies** but keeps policies you wrote.

See [Who can turn off](./turn-on-off-and-pause#who-can-turn-off).

## Testing limits

**Try a situation** uses only the details you choose: it doesn't scan content or look up Smart Groups or departments. **Replay activity** has no department and treats some data types as unavailable. Neither covers Skills, Apps, Accounts or **Application Monitoring**. See [Test your changes](./draft-test-publish-and-history#test-your-changes).

## Related pages

- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [Policies and rules](./policies-and-rules)
- [Browser Extension policy engine](../../browser-extension/policy-engine/overview)
