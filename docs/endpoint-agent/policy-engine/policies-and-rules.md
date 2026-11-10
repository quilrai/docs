---
sidebar_position: 3
sidebar_label: "Policies and rules"
sidebar_custom_props:
  icon: ListChecks
description: "What an Endpoint Agent policy and rule are made of, every rule step, response and risk level, starter policies, the Code view and size limits, with steps to create a policy."
console_path: []
aliases: [endpoint policy, endpoint rule, policy editor, create policy, add rule, starter policies, policy templates, for some people, exclude people, only when, response and risk, risk level, block, require a reason, ask for a reason, warn and continue, record only, quilrql, code view]
---

# Policies and rules

Updated on 10 November 2026.

A policy tells the Endpoint Agent what to check when people use AI apps and coding tools on their devices, and what to do when a check matches.

Open **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector, then open **Desktop > Controls > All policies**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Desktop', 'Controls', 'All policies']} />

## Key terms

| Term | Meaning |
| --- | --- |
| **AI app** | An AI chat or assistant app, such as ChatGPT or Gemini, used in a browser or as a desktop app. |
| **Coding tool** | An AI coding agent that runs on the device, such as Claude Code, Cursor or Codex CLI. |
| **Policy** | A named set of one or more rules that share one **Priority**. |
| **Priority** | Decides which policy's response is used when rules from several policies apply. With **Default**, the stricter response wins. See [How policies are evaluated](./how-policies-are-evaluated). |
| **Request** | One prompt, paste, upload, file read or coding-tool action that the Endpoint Agent checks. |
| **Finding** | A recorded request that needs review, such as a blocked prompt. See [Findings & Interactions](../../console/observe/findings-and-interactions). |

## How a rule is built

Each rule has four steps:

- **Who**: who the rule applies to, such as everyone except Finance.
- **Where**: AI apps, coding tools or both, such as ChatGPT and Gemini, in any program.
- **Looks for**: the content to detect, such as at least 5 Social Security Numbers.
- **Response and risk**: what happens and how risky it is, such as Block, risk High.

Two parts are optional: **Only when** adds extra conditions, and **For some people** gives some covered people a different response or risk.

Every policy is checked on every request. When several rules apply, the stricter response wins unless **Priority** says otherwise.

## Create a policy

You need the **Update policies** permission.

1. Open **All policies** and select **Create policy**.
2. At **Start from**, choose **Blank** or a [starter policy](#starter-policies), then select **Continue to Name and description**.
3. Enter a **Name** and, optionally, a **Description**.
4. Select **Continue to rule 1** (**Continue to Rules** when the policy has more than one rule) and complete each rule. See [Add a rule](#add-a-rule).
5. On **Priority**, keep **Default** unless this policy must win or lose against others.
6. On **Check and save**, fix each item under **Things to fix**. **Go to** opens the step to fix.
7. Select **Create policy** to save to your draft, or **Save & publish** to also open the publish review.

Devices get the policy only after you publish. See [Draft, test, publish and restore](./draft-test-publish-and-history).

:::warning Your draft is kept only in this browser tab
Closing the tab or signing out before you publish loses the new policy. See [Where your draft is kept](./draft-test-publish-and-history#where-your-draft-is-kept).
:::

To change a policy, select its row, open the **Edit** tab, and select **Save changes**.

## Add a rule

1. On the **Rules** step, select **Add rule**.
2. Optionally, enter a **Rule name (optional)**; otherwise the rule shows as "Rule N".
3. Complete **Who**, **Where**, **Looks for** and **Response and risk**.
4. Select **Done with rule N**, then save the policy.

A new rule covers **Everyone** in **AI apps** (**All apps**, **In any program**), with **Coding tools** off and nothing else set.

Rules inside one policy share its **Priority**, the stricter response among them wins, and their order changes nothing. To give one rule a different priority, use **Move to its own policy…** in the rule row's ⋯ menu.

## Who: choose who the rule covers

Choose **Everyone**, **Only these people** or **Everyone except**. **Everyone** and **Everyone except** also cover devices where nobody is signed in to the Endpoint Agent; **Only these people** doesn't. With **Only these people**, select **Exclude some of them** to leave some of those people out, under **Excluded (this rule doesn't apply to them)**. For example, add Engineering, then exclude Contractors.

Add names in **Search people, Smart Groups or departments**. A person matches when they are any one of the names:

- **A person** matches by email address. You can type any full email, even one not in the directory.
- **A Smart Group** matches by membership. Smart Groups hold people, not devices. See [Smart Groups](../../console/settings-organization/smart-groups).
- **A department** matches the person's department in your directory as of their last sign-in to the Endpoint Agent. A person with no department never matches.

A deleted or turned-off Smart Group shows **Smart group not found** and matches, or excludes, nobody.

Excluded people are out of the rule completely. To keep them covered with another response or risk, use [For some people](#for-some-people-give-some-people-a-different-response-or-risk).

## Where: choose AI apps, coding tools or both

Turn on **AI apps**, **Coding tools**, or both. Each place that is on gets its own response.

### AI apps

**AI apps** checks chat, uploads and API traffic from browsers and desktop apps. Choose the apps (**All apps**, **Only these apps** or **All apps except**) and the program that sent the request (**In any program**, **Only in these programs** or **Not in these programs**). For a program, pick a browser preset or type the file name, such as `chatgpt.exe`, not the path.

macOS reports only the first 31 characters of a program name, so a longer name never matches on a Mac, and **Not in these programs** doesn't exclude it. Add its first 31 characters as well.

:::note Application Monitoring
A rule applies only to apps and browsers turned on under **Application Monitoring** in **Settings > Endpoint Agent**. The policy list tags a policy **Monitoring off** only when it names an app that is off, so policies for **All apps** or **All apps except**, including the starters, never show the tag. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).
:::

### Coding tools

**Coding tools** checks prompts and the files a coding tool reads or sends. Choose **All coding tools** (including tools supported later), **Only these tools** or **All tools except**. Coding agents of AI apps, such as Codex CLI for ChatGPT, are checked here, not under **AI apps**.

If **AI apps** uses **Only these apps** and a named app has its own coding agent, turning on **Coding tools** starts at **Only these tools** with those agents. Change it to check every coding tool.

**Narrow to specific actions** adds conditions that must also be true:

- **Tool action** (Run a shell command, Fetch a web page) and **Command**: checked only when the action also reads or sends a readable file. **Command** is the program name only, such as `curl`, so `rm -rf` or a URL never matches.
- **MCP server** and **MCP tool**: reported by Claude Code, Codex CLI, Qoder and QoderWork, and checked only when a readable file is involved.
- **AI model**: reported by Cursor and Codex CLI, not by Claude Code.
- **Project folder name**, **Project folder path** and **Device OS** are also available.

## Looks for: choose what the rule detects

**Looks for** has two optional parts: **Data and attacks** and **Files**. If **Looks for** and **Only when** are both empty, the rule applies to every request in its **Where**. The editor warns you.

### Data and attacks

Use **Search data types or detections** to add data types, whole categories, attack types or your custom detections. See [Detection Models](../../console/govern/detection-models).

- **Match**, for two or more items: **Any one is enough** (the default) or **All must be found**.
- **Add a group of data types** adds a group that combines the opposite way from **Match**, one level deep, with at least two data types. For example, Personally Identifiable Information (PII) with **All must be found**, plus a group of **Any one of these** (Social Security Number, Credit/Debit Card), matches PII and either number.
- **Counts**: **Any amount**, **At least** or **More than**, from 1 to 100,000, for each message, upload or file. Counts don't apply to whole categories.

### Files

**Add a file condition** adds a **File type** or **Sensitivity label** condition. A rule with a file condition checks AI apps only, and **Coding tools** can't be turned on. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

### Only when: add extra conditions

**Only when** adds conditions that must also be true. Select **Add an Only when condition**, or press `/`. You can add:

- **Recipes**: ready-made conditions, such as **Only allow these models…**. **Commands containing…** checks only the program name. **Uploads of at least …** counts readable text (at most about 5,000 words), not file size, so values above a few tens of KB rarely match.
- **Fields**: a condition on one detail, such as the AI model or project folder. Each field shows which places report it, for example "Reported by coding tools · not by AI apps". Fields that the rule's places don't report are listed under **Not reported here**.
- **Plain English**, such as "model isn't claude sonnet". Your browser reads it by fixed rules (**Plain English · no AI**), and nothing is sent to an AI model.

Group conditions into **Either of these** (one line is enough), **All of these** (every line must be true) and **But not when** (any true line stops the rule), up to two levels deep.

- A request that does not report a field never matches **is any of**, but does match negative operators such as **is none of** or **is not one of**. To match only when the field is reported, use **isn't (when reported)**. See [When a detail is missing from the request](./how-policies-are-evaluated#when-a-detail-is-missing-from-the-request) and [Conditions that depend on what the device reports](./limits-and-behavior#conditions-that-depend-on-what-the-device-reports).
- A condition you choose on people moves to **Who**, unless **Who** is **Only these people** and the condition adds people; then it stays an **Only when** line. A condition on apps moves to **Where** when the rule checks AI apps only. A message says where it went, with **Undo**.
- Warnings such as **Never matches** don't block saving.

:::warning Device OS and hostname in AI apps
Only coding-tool requests report **Device OS** and **Device hostname**. Conditions on them, including **Only on Windows** and **Only on macOS**, never match or exclude AI-app requests, and the editor doesn't warn. Limit AI-app rules with **Who** or **Where** instead.
:::

## Response and risk: choose what happens

Choose a response under **What happens in AI apps** and **What happens in coding tools**.

### Responses

Listed strictest first:

| AI apps | Coding tools | What the person experiences |
| --- | --- | --- |
| **Block** | **Block** | The request or action is stopped. Coding tools that can't block show a warning instead. Coding-tool rules don't check prompts typed into Copilot; an AI-app rule for GitHub Copilot does. |
| **Require a reason** | Not offered | A popup asks for a reason. With no reason before it times out, the request is blocked. |
| **Ask for a reason** | **Warn and continue** | The same response, named differently in each place. AI apps: a popup asks for a reason; the person can skip it, and the request goes through. Coding tools: a warning shows and the action continues. |
| **Record only** | **Record only** | The request is allowed, with no message. A finding is recorded only when the rule finds a data type or matches a file, command, tool action or MCP condition. |

Older rules may show **Notify and continue**, which is no longer offered. In AI apps, people can continue but the request is recorded as blocked. In coding tools it blocks, and the rule can't be saved until you change it.

### Risk levels

**Risk level on findings** labels the finding and never changes the response. Choose **No risk set** (the starting value), **Low**, **Medium**, **High** or **Critical**. Older rules may show **Very low** or **Very critical**.

- The finding gets the highest risk any applying rule sets, whatever the Priority, even from a rule whose response was not used.
- While **Policy risk** is on in **Triage center > Severity & due dates**, the risk sets the finding's severity, even over your severity rules. See [Severity](./what-users-see-and-findings#severity).

### For some people: give some people a different response or risk

1. On **Response and risk**, select **Different response or risk for some people**.
2. Add people, Smart Groups or departments, for example Finance. **Except some of them** leaves some of them out of the row, so they get the rule's own response and risk, or a later row's.
3. Choose a response under **Response in AI apps** and **Response in coding tools** (or **Response** when only one place is on). The first choice, **Same as the rule**, shows the rule's current response, such as **(now Block)**, and follows later changes to it.
4. Choose a **Risk**, such as **No risk for these people** or **Same as the rule**, which also follows later changes.

- Rows are checked top to bottom, and a person gets the first row that names them. Reorder with the arrows. One name can be in only one row.
- A row changes only this rule. Other rules still apply to its people.
- A row can't lower the finding's risk below what another applying rule sets.
- Each row counts toward the 500-rule limit. See [How rules are counted](./limits-and-behavior#how-rules-are-counted).

## Turn a rule or policy off

Turning a rule or policy off changes your draft, and devices change after you publish. Off rules still count toward the size limits.

- **One rule**: the **On/Off** switch on its row.
- **A policy, in the editor**: **Policy on** switches every rule, including rules written as code. Turning it on also turns on rules you turned off one by one.
- **A policy, from the list**: the **On** column switches only rules the form can show. Rules **Written as code** keep their state, so any that are on keep running. Use **Policy on** in the editor to switch them.

To delete a policy, use **Remove policy** in its ⋯ menu. It stays live until you publish.

## Starter policies

Choose a starter at **Start from**. It becomes an ordinary policy that you can change, and QuilrAI never changes it. Choosing a starter again adds a second copy.

| Starter | Looks for (Any one is enough) | AI apps | Coding tools | Risk |
| --- | --- | --- | --- | --- |
| **Keep secrets out of AI** | API Key, AWS Credentials, Access Token, Other Secret, Password | Block | Block | High |
| **Ask before sharing ID numbers, card or health data** | Aadhaar Number, Bank Account Number, CA Social Insurance Number, Driver's License Number, IBAN Number, National ID Number, PAN Card Number, Passport Number, Protected Card Information (PCI), Protected Health Information (PHI), Social Security Number, UK National Insurance Number | Ask for a reason | Record only | Medium |
| **Stop prompt injection and jailbreaks**, rule 1 | Jailbreak Techniques, Prompt Injection Techniques | Block | Block | Critical |
| **Stop prompt injection and jailbreaks**, rule 2 | Prompt Context Corruption, Semantic Adversarial Prompts, Social Engineering Prompts, System, Guardrail & Security Disclosure | Record only | Record only | Medium |
| **Block bulk personal data** | At least 5 of: Bank Account Number, Credit/Debit Card, National ID Number, Passport Number, Social Security Number. At least 50 of: Email Address, Phone Number | Block | Block | Critical |

All four use **Who: Everyone**, **Priority: Default** and **All coding tools**. They check every AI app except LM Studio, Ollama and Slack. To cover those apps, edit **Where**.

If your tenant turned on the Policy Engine from earlier Endpoint Agent settings, the starters may already be in your list, turned off. See [Turn on, turn off and pause](./turn-on-off-and-pause).

## Edit a policy as code (QuilrQL)

QuilrQL is the policy language behind every policy. The **Form | Code** switch on the **Rules** step shows the open policy as QuilrQL text. Use **Code** to read exactly what a policy does or to write what the form can't.

### What the Code view shows

The **Keep secrets out of AI** starter as code:

```text
policy keep_secrets_out_of_ai priority 100 {
  request where
    surface.kind == "endpoint_proxy"
    and application.group_key not in ["lm_studio", "ollama", "slack"]
  data_type (any("API Key", "AWS Credentials", "Access Token", "Other Secret", "Password"))
  then {
    endpoint.action = block;
    risk.level = high;
  }
  request where
    surface.kind == "endpoint_hooks"
  data_type (any("API Key", "AWS Credentials", "Access Token", "Other Secret", "Password"))
  then {
    endpoint.action = block;
    risk.level = high;
  }
}
```

- `priority`: 100 is Default. A higher number wins, from 0 to 999,999. Numbers above 999,999 are reserved for Pause enforcement, and a publish that uses one is refused.
- `request where`: one block for each place a rule checks. `endpoint_proxy` is AI apps and `endpoint_hooks` is coding tools. Each **For some people** row adds blocks.
- `data_type`: `any(…)` is **Any one is enough** and `all(…)` is **All must be found**. `"Social Security Number" count >= 5` means at least 5.
- `endpoint.action`: `block`, `justification_mandatory` (**Require a reason**), `justification_optional` (**Ask for a reason**) or `monitor` (**Record only**).
- `risk.level`: `low`, `medium`, `high` or `critical`.

### How the Code view works

- The Code view holds one policy.
- The technical name after `policy` is fixed at the first save, so the history stays linked. To rename a policy, change **Name**.
- A save from Code keeps your text exactly. If you add or remove `request` blocks, each block then opens as its own rule, and optional rule names are dropped.
- A rule the form can't show appears as a **Written as code** card.

## Size limits

A save over a limit is refused. The ones you meet most often are 128 values in one list, 64 data types per rule, about 30 conditions per rule (with no warning first), and 200 policies and 500 rules in total. See [Size limits](./limits-and-behavior#size-limits).

## Fix a save that is blocked

When you save, QuilrAI checks your whole draft with this policy in it. A problem anywhere in it blocks every save, with "This policy can't be saved yet:" and the reason. For example, if a custom detection that a rule names is deleted, every save fails with "This policy can't be saved yet: unknown data type '*name*'" until that rule is fixed.

## Permissions

To view policies, you need access to the **Policy** page and the **Read policies** permission. To create, edit, turn off, remove or save policies to your draft, you also need **Update policies**. For every task, see [Permissions](./overview#permissions).

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Smart Groups](../../console/settings-organization/smart-groups)
- [Detection Models](../../console/govern/detection-models)
