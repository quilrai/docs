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

A policy tells the Endpoint Agent what to check when people use AI apps and coding tools on their devices, and what to do when a check matches. This page explains every part of a policy and its rules, and how to create one.

Open **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector, then open **Desktop > Controls > All policies**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Desktop', 'Controls', 'All policies']} />

## Key terms

| Term | Meaning |
| --- | --- |
| **AI app** | An AI chat or assistant application, such as ChatGPT, Claude or Gemini, that people use in a browser or as a desktop app. |
| **Coding tool** | An AI coding agent that runs on the device, such as Claude Code, Cursor or Codex CLI. |
| **Policy** | A named set of one or more rules. It has a **Name**, an optional **Description**, its **Rules** and a **Priority**. |
| **Rule** | One part of a policy. It says who it covers, where it checks, what it looks for and what happens when it matches. |
| **Request** | One prompt, paste, upload, file read or coding-tool action that the Endpoint Agent checks. |
| **Response** | What happens on the device when a rule matches, for example **Block**. See [Responses](#responses). |
| **Risk** | A level that a rule sets on the finding. It never changes the response. See [Risk levels](#risk-levels). |
| **Finding** | A recorded request that needs review, for example a prompt that a rule blocked. Findings appear in [Findings & Interactions](../../console/observe/findings-and-interactions). |
| **QuilrQL** | The text form of a policy, shown in the **Code** view. See [Edit a policy as code (QuilrQL)](#edit-a-policy-as-code-quilrql). |

## How a rule is built

Each rule has four steps. Each step answers one question:

| Rule step | Question it answers | Example |
| --- | --- | --- |
| **Who** | Who does this rule apply to? | Everyone except the Finance department |
| **Where** | Should it check AI apps, coding tools, or both? | ChatGPT and Gemini, in any program |
| **Looks for** | What content should it look for? | At least 5 Social Security Numbers |
| **Response and risk** | What happens, and how risky is it? | Block, risk High |

Two optional parts make a rule more precise. **Only when**, at the bottom of **Looks for**, adds extra conditions such as an AI model or a project folder. **For some people**, at the bottom of **Response and risk**, gives some of the people the rule covers a different response or risk.

Written as one sentence, a rule reads like this:

> Everyone except Finance, in ChatGPT and Gemini, when a message contains at least 5 Social Security Numbers: Block, risk High. For Executives: risk Critical.

### How rules work together

- Every policy is checked on every request.
- When several rules apply to the same request, the stricter response is used, unless the policies' **Priority** says otherwise. Rules inside one policy always use the stricter response between them.
- The finding gets the highest risk that any applying rule sets.
- The order of rules inside a policy changes nothing. Rule numbers are only labels.

For the full precedence model, see [How policies are evaluated](./how-policies-are-evaluated).

## Create a policy

You need the **Update policies** permission. See [Permissions](#permissions).

1. Open **All policies** and select **Create policy**. The policy editor opens at the **Start from** step.
2. Choose **Blank** ("One empty rule to fill in.") or one of the four [starter policies](#starter-policies). Select **Continue to Name and description**.
3. Enter a **Name**. Your team sees it in the Policies list and in **Review & publish**. Optionally, enter a **Description**.
4. Select **Continue to rule 1** (or **Continue to Rules** when the policy has more than one rule), then complete each rule as described in [Add a rule](#add-a-rule).
5. On the **Priority** step, keep **Default** ("The stricter response wins.") unless this policy must win or lose against other policies. See [How policies are evaluated](./how-policies-are-evaluated).
6. On the **Check and save** step, fix every item under **Things to fix**. Each item has a **Go to** button that opens the step to fix.
7. Select **Create policy** to save the policy to your draft. To save it and go straight to the publish review, select **Save & publish** instead.

The policy is now in your draft. Devices get it only after you publish. See [Draft, test, publish and restore](./draft-test-publish-and-history).

:::warning Your draft is kept only in this browser tab
If you close the tab or sign out before you publish, the new policy is lost. See [Where your draft is kept](./draft-test-publish-and-history#where-your-draft-is-kept).
:::

To change an existing policy, select its row in the list, open the **Edit** tab, and save with **Save changes**.

## Add a rule

1. On the **Rules** step, select **Add rule**. On the last step of a rule page, you can also select **Add another rule**.
2. Optionally, enter a **Rule name (optional)**. The Policies list shows it. If you leave it empty, the list shows "Rule N".
3. Complete **Who**, **Where**, **Looks for** and **Response and risk**. Use **Continue to** to move between them. Each step is described below.
4. Select **Done with rule N** to return to the list of rules.
5. Save the policy with **Create policy** or **Save changes**.

A new rule starts with **Who** set to **Everyone**, **AI apps** on at **All apps** and **In any program**, **Coding tools** off, nothing under **Looks for**, and no response or risk. The rule page shows the rule as a sentence under **This rule, in one sentence**. Select a word in it to jump to that step.

Each rule row on the **Rules** step has a ⋯ menu:

| Menu item | What it does |
| --- | --- |
| **New rule with the same Who and Where** | Adds a rule that copies **Who** and **Where**. Everything else starts empty. |
| **Move to its own policy…** | Moves the rule into a new policy. Use it to give one rule a different **Priority**, because rules inside one policy have no priority of their own. |
| **Remove rule** | Removes the rule. It is not available on a policy's last rule; remove the policy instead. |

## Who: choose who the rule covers

**Who** answers "Who does this rule apply to?"

| Choice | Who the rule covers | Devices where nobody is signed in |
| --- | --- | --- |
| **Everyone** | Everyone | Covered |
| **Only these people** | Only the people, Smart Groups and departments you add | Not covered |
| **Everyone except** | Everyone except the people you add. The rule does not apply to them at all. | Covered |

With **Only these people**, select **Exclude some of them** to open **Excluded (this rule doesn't apply to them)**. Use it to build "group A except group B", for example Engineering, excluding Contractors.

Add names in the search box, **Search people, Smart Groups or departments**. A rule matches a person who is any one of the names you add.

| You can add | How it matches |
| --- | --- |
| A person | By email address. You can type any full email, even one the directory does not list. |
| A Smart Group | By the person's Smart Group membership. Smart Groups hold people, not devices. See [Smart Groups](../../console/settings-organization/smart-groups). |
| A department | By the department in your directory as of the person's last sign-in to the Endpoint Agent. Case and extra spaces are ignored. A person with no department never matches a department. |

Only people signed in to the Endpoint Agent can be matched by name.

If a Smart Group you named is deleted or turned off, its chip reads **Smart group not found**. The rule stays valid. The group matches nobody, and under **Everyone except** or **Excluded** it leaves nobody out. Saving and publishing still work.

Excluded people are taken out of the rule completely. To keep people covered but give them another response or risk, use [For some people](#for-some-people-give-some-people-a-different-response-or-risk) instead.

## Where: choose AI apps, coding tools or both

**Where** answers "Where should this rule check?" AI apps and Coding tools are the two places a rule can check. Turn on **AI apps**, **Coding tools**, or both. Each place that is on gets its own response under **Response and risk**.

### AI apps

**AI apps** checks "Chat, uploads and API traffic from browsers and desktop apps."

| Control | Choices |
| --- | --- |
| Which AI apps | **All apps**, **Only these apps**, **All apps except** |
| Program | **In any program**, **Only in these programs**, **Not in these programs** |

A program is the application that sent the request. The presets (Google Chrome, Microsoft Edge, Firefox, Brave, Opera and Safari) add every name Windows and macOS report for that browser. For any other program, type its file name, such as `chatgpt.exe`, not its path.

- A request whose program is unknown never matches **Only in these programs** and always matches **Not in these programs**.
- macOS reports only the first 31 characters of a program name, so a longer name never matches on a Mac. With **Not in these programs**, the rule still applies to that program on a Mac. Add the first 31 characters of the name as well. The editor warns you.

:::note Application Monitoring
A rule applies only to apps and browsers that are turned on under **Application Monitoring** in **Settings > Endpoint Agent**. The policy list tags a policy **Monitoring off** only when the policy names an app that is off. A policy whose rules use **All apps** or **All apps except** never gets this tag, even when an app it covers is off. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).
:::

### Coding tools

**Coding tools** checks "Prompts and the files a coding tool reads or sends." Choose **All coding tools**, **Only these tools** or **All tools except**. **All coding tools** also covers coding tools that are supported later.

**Narrow to specific actions** limits the rule to certain coding-tool activity. Select **Add a coding-tool condition** to add a row. Every row must also be true for the rule to apply.

| Field | Values | Note shown in the editor |
| --- | --- | --- |
| **Tool action** | Run a shell command, Fetch a web page | Checked only when the action also reads or sends a readable file. |
| **Command** | The program name only, such as `curl`, `git` or `powershell` | Checked only when the action also reads or sends a readable file. |
| **MCP server**, **MCP tool** | Typed names | Claude Code, Codex CLI, Qoder and QoderWork; only when a readable file is involved. |
| **AI model** | Typed names | Reported by Cursor and Codex CLI, not by Claude Code. |
| **Project folder name**, **Project folder path** | Text the name or path contains | |
| **Device OS** | macOS, Windows, Linux | |

- A **Command** value matches the program name only. Arguments are never compared, so a value such as `rm -rf` or a URL never matches.
- **is not one of** also matches an action that does not report the field.

### Coding agents of AI apps

Some AI apps have their own coding agent, for example Codex CLI for ChatGPT and Claude Code for Claude. **AI apps** checks browsers and desktop apps only. A coding agent is checked under **Coding tools**.

When **Only these apps** names an app whose coding agent the rule does not check, the editor shows a banner such as "Codex CLI isn't covered" with an **Also check** button. The button turns on **Coding tools** for that agent.

If **AI apps** uses **Only these apps** and an app has its own coding agent, turning on **Coding tools** starts at **Only these tools** with those agents, for example Codex CLI for ChatGPT. Change it if you want every coding tool.

### Files and coding tools

A rule with a file condition checks AI apps only. While a rule has a file condition, **Coding tools** is off and cannot be turned on. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

## Looks for: choose what the rule detects

**Looks for** answers "What should this rule look for? Both parts are optional." The two parts are **Data and attacks** and **Files**.

If you leave **Looks for** and **Only when** empty, the rule applies to every message, upload or file read in the places chosen under **Where**, whatever it contains. The editor warns you about this.

### Data and attacks

Use **Search data types or detections** to add what the rule looks for. The list shows specific types (such as Social Security Number) under their category, whole categories under **Sensitive data categories**, attack types under **Attacks and harmful content**, and your custom detections under **Your detections**. See [Detection Models](../../console/govern/detection-models) and [Custom detections and library](../../console/govern/custom-detections-and-library).

| Option | What it does |
| --- | --- |
| **Match** | Shown when you add two or more items. **Any one is enough** (the default) or **All must be found**. |
| **Add a group of data types** | Adds a group that combines the opposite way from **Match**. For example, a rule that looks for Personally Identifiable Information (PII) with **Match** set to **All must be found**, plus a group of **Any one of these** (Social Security Number, Credit/Debit Card), matches when a message has PII and either a Social Security Number or a card number. Groups go one level deep, and each group needs at least two data types. |
| **Counts** | "Only match when a message, upload or file has this many." Choose **Any amount**, **At least** or **More than**, from 1 to 100,000. Counts apply to specific types and custom detections, not to whole categories. |

Each message, upload or file read is counted on its own.

If QuilrAI could not scan the content for one of the data types the rule needs, the rule is skipped, unless the data types that were scanned already decide it. For example, with **Any one is enough**, one type that was found is enough. The editor notes this as "If one of these checks is unavailable, this rule is skipped."

### Files

**Add a file condition** adds a **File type** or **Sensitivity label** condition. File conditions work in AI apps only. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

### Only when: add extra conditions

**Only when** makes the rule apply only when extra conditions are also true, such as the AI model, the device or the project folder. Select **Add an Only when condition**, or press `/` on the rule page.

The **Add a condition** palette offers three ways to add a condition:

- **Recipes**: ready-made conditions such as **Only allow these models…**, **Block these models…**, **Only these MCP servers…**, **Commands containing…** and **Uploads of at least …**. Two of them check less than their names suggest:
  - **Commands containing…** checks only the program name, such as `curl`. A value such as `rm -rf` or a URL never matches.
  - **Uploads of at least …** counts the readable text in an upload, at most about 5,000 words, not its size on disk. A value above a few tens of KB rarely matches.
- **Fields**: grouped as Person, Device, App, Action, Code & workspace and File. Each field shows which places report it, for example "Reported by coding tools · not by AI apps". A field that none of the rule's places report is listed last, under **Not reported here**.
- **Plain English**: type what you mean, for example "model isn't claude sonnet". The tag **Plain English · no AI** means the text is read in your browser by fixed rules. Nothing is sent to an AI model, and nothing is added until you pick a reading.

You can group conditions into blocks, up to two levels deep:

| Block | Meaning |
| --- | --- |
| **Either of these** | One line is enough. |
| **All of these** | Every line must be true. Used inside an **Either of these** block. |
| **But not when** | If any line here is true, the rule doesn't apply. |

How conditions behave:

- A request that does not report a field never matches **is any of** on that field. It does match **is none of**, **doesn't contain**, **doesn't start with**, **doesn't end with** and **has no value**. To match only when the field is reported, use **isn't (when reported)**, or the option the editor offers on a negative line, such as **Only when the AI model is reported**. See [When a detail is missing from the request](./how-policies-are-evaluated#when-a-detail-is-missing-from-the-request), and for which fields each place reports, [Conditions that depend on what the device reports](./limits-and-behavior#conditions-that-depend-on-what-the-device-reports).
- Some picks move to the step where they belong. A pick of people, Smart Groups or departments goes to **Who**. While **Who** is **Only these people**, only a pick that leaves people out moves there; a pick that adds people stays an **Only when** line. A pick of apps goes to **Where** when the rule checks AI apps only. A message says where the condition went, with **Undo**.
- The editor marks lines that can never match, for example with **Never matches**. These warnings do not block saving.

:::warning Device OS and hostname in AI apps
Only coding-tool requests report **Device OS** and **Device hostname**. A condition that needs either field, including the **Only on Windows** and **Only on macOS** recipes, never matches AI-app requests, and under **But not when** it never leaves AI-app requests out. On a rule that checks both places, such a condition works in coding tools only. The editor does not warn about this.

Use Device OS and Device hostname conditions only in rules that check coding tools. To limit an AI-app rule, use **Who** or **Where** instead.
:::

## Response and risk: choose what happens

**Response and risk** answers "What happens when this rule applies?" Choose a response under **What happens in AI apps** and **What happens in coding tools**. Each place that is on needs a response.

### Responses

The editor lists responses strictest first.

| AI apps | Coding tools | What the person experiences |
| --- | --- | --- |
| **Block** | **Block** | AI apps: the request is stopped, with a block message. Coding tools: the action is stopped where the coding tool can block. Tools that can't block show a warning instead. Prompts typed into Copilot aren't checked. |
| **Require a reason** | Not offered | A popup asks for a reason. If none is given before it times out, the request is blocked. Coding tools can't ask for a reason, so use **Warn and continue** there. |
| **Ask for a reason** | **Warn and continue** | AI apps: a popup asks for a reason. The person can skip it and the request goes through. Coding tools: a warning shows in the coding tool and the action continues. |
| **Record only** | **Record only** | The request is allowed, with no message. |

**Ask for a reason** and **Warn and continue** are the same response. It has a different name in each place.

**Record only** records a finding only when the rule finds a data type it looks for, or matches a file, command, tool action or MCP condition. A rule with none of these records nothing by itself.

Rules saved earlier may show **Notify and continue**. It is no longer offered. In AI apps, people see a notice and can continue, but the request is recorded as blocked. In coding tools it blocks, and the rule can't be saved until you choose another response.

For popups, messages and findings, see [What users see and findings](./what-users-see-and-findings).

### Risk levels

The **Risk level on findings** field labels the finding. It never changes what happens on the device.

| Risk | Offered for new rules |
| --- | --- |
| **No risk set** | Yes. This is the starting value. |
| **Low**, **Medium**, **High**, **Critical** | Yes |
| **Very low**, **Very critical** | No. They appear only on rules saved earlier, with "Saved earlier. Choose another risk to change it." |

- **Highest wins.** When several rules apply to one request, the finding gets the highest risk any of them sets, whatever their policies' Priority. A rule whose response was not used still adds its risk.
- **Severity.** While **Policy risk** is on in **Triage center > Severity & due dates**, the risk sets the finding's severity, even where your severity rules would rate it higher. **Very low** counts as Low and **Very critical** as Critical. The editor links there with **Open Severity & due dates**. See [Severity](./what-users-see-and-findings#severity).
- **Suggestions.** The editor suggests a risk from the data types the rule looks for, never from its response. For example: "Suggested: High, because this rule looks for Bank Account Number and IBAN Number." Select **Use High** to accept it. Suggestions appear only on rules you create or change while the policy is open, and never on a starter rule you have not changed.

### For some people: give some people a different response or risk

Use **For some people** when some of the people a rule covers need another response or risk. For example, Executives get risk Critical, or Finance gets **Ask for a reason** instead of **Block**.

1. On **Response and risk**, select **Different response or risk for some people**. A row is added.
2. Add people, Smart Groups or departments to the row.
3. Optionally, select **Except some of them** to open **Not in this row**. People listed there get the rule's own response and risk, or a later row that names them. **Include them again** closes the list.
4. Choose a response under **Response in AI apps** and **Response in coding tools**, or under **Response** when only one place is on. The first choice, for example **Same as the rule (now Block)**, follows the rule's response even if you change it later.
5. Choose a **Risk**: **Same as the rule**, **No risk for these people**, **Low**, **Medium**, **High** or **Critical**. **Same as the rule** also follows later changes.

How rows work:

- Rows are checked top to bottom. A person gets the first row that names them. Use the arrows to change the order.
- People in a row stay covered by the rule. Only their response or risk changes.
- A row changes only this rule. Other rules still apply to these people.
- A row can set a lower risk than the rule. If another applying rule sets a higher risk, the finding still gets the higher one. The editor warns you about this.
- Each row adds to the rule count of the 500-rule limit. See [How rules are counted](./limits-and-behavior#how-rules-are-counted).

| You want to | Use |
| --- | --- |
| Take people out of the rule completely | **Who > Everyone except**, or **Only these people > Exclude some of them** |
| Keep people covered, with another response or risk | **For some people** |

## Turn a rule or policy off

Turning a rule or policy off changes your draft. Devices change only after you publish.

| To turn off | Use |
| --- | --- |
| One rule | The **On/Off** switch on the rule's row in the **Rules** step. "Off: this rule never applies." |
| A whole policy, in the editor | The **Policy on** switch at the top of the editor. It turns every rule in the policy on or off, including rules written as code. Turning it on also turns on rules you turned off one by one. |
| A whole policy, from the list | The switch in the **On** column of the policy list. It turns on or off only the rules the form can show. Rules written as code keep their state; open the policy to change them, or edit them in the [Code view](#edit-a-policy-as-code-quilrql). |

- While some rules are off, the editor shows "X of N rules off".
- An off policy shows "This policy is off in your draft: once you publish, none of its rules run." with a **Turn on** button.
- Rules and policies that are off still count toward the [size limits](./limits-and-behavior#size-limits).

To delete instead, use **Remove policy** in the policy's ⋯ menu. "It is removed from your draft. It stays live until you publish."

## Starter policies

QuilrAI provides four starter policies. Choose one at the **Start from** step when you create a policy. Once added, a starter is an ordinary policy: you can change anything, and QuilrAI never changes it after you add it. Choosing a starter you already have adds a second copy.

| Starter | Looks for (Any one is enough) | AI apps | Coding tools | Risk |
| --- | --- | --- | --- | --- |
| **Keep secrets out of AI** | API Key, AWS Credentials, Access Token, Other Secret, Password | Block | Block | High |
| **Ask before sharing ID numbers, card or health data** | Aadhaar Number, Bank Account Number, CA Social Insurance Number, Driver's License Number, IBAN Number, National ID Number, PAN Card Number, Passport Number, Protected Card Information (PCI), Protected Health Information (PHI), Social Security Number, UK National Insurance Number | Ask for a reason | Record only | Medium |
| **Stop prompt injection and jailbreaks**, rule 1 | Jailbreak Techniques, Prompt Injection Techniques | Block | Block | Critical |
| **Stop prompt injection and jailbreaks**, rule 2 | Prompt Context Corruption, Semantic Adversarial Prompts, Social Engineering Prompts, System, Guardrail & Security Disclosure | Record only | Record only | Medium |
| **Block bulk personal data** | At least 5 of: Bank Account Number, Credit/Debit Card, National ID Number, Passport Number, Social Security Number. At least 50 of: Email Address, Phone Number | Block | Block | Critical |

All four use **Who: Everyone**, **Priority: Default** and **All coding tools**.

:::note Apps the starters leave out
All four starters check every AI app except LM Studio, Ollama and Slack (**AI apps: All apps except**). Only the **Keep secrets out of AI** description says so. To cover those apps, edit the rule's **Where** step.
:::

If your tenant turned on the Policy Engine from earlier Endpoint Agent settings, the four starters may already be in your list, turned off. See [Turn on, turn off and pause](./turn-on-off-and-pause).

## Edit a policy as code (QuilrQL)

QuilrQL is the policy language behind every policy. The editor writes it for you. Use the **Form | Code** switch on the **Rules** step to see or edit a policy as QuilrQL text. "Form edits rules step by step. Code shows the policy as written, including its priority number."

Use **Code** to:

- read exactly what a policy does, including its priority number;
- write a condition that the form does not offer;
- change a rule that the form cannot show.

Use **Form** for everything else. It checks each step and explains problems in plain words.

### What the Code view shows

The Code view shows only the open policy. **Name** and **Description** stay in their own fields. This is the **Keep secrets out of AI** starter in the Code view:

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

| Part | Meaning |
| --- | --- |
| `policy <name> priority <n>` | The policy's technical name and its priority. 100 is Default. A higher number wins over a lower one, from 0 to 999,999. |
| `request where …` | One block of conditions. The editor writes at least one `request` block for each place a rule checks: `surface.kind == "endpoint_proxy"` is AI apps, and `"endpoint_hooks"` is coding tools. A rule can have more blocks, for example when it has **For some people** rows. Each block counts as one rule toward the 500-rule limit. See [How rules are counted](./limits-and-behavior#how-rules-are-counted). |
| `data_type (…)` | What the rule looks for. `any(…)` is **Any one is enough** and `all(…)` is **All must be found**. `"Social Security Number" count >= 5` means at least 5. |
| `then { … }` | `endpoint.action` sets the response and `risk.level` sets the risk. |

| Response in the form | `endpoint.action` value |
| --- | --- |
| **Block** | `block` |
| **Require a reason** | `justification_mandatory` |
| **Ask for a reason** / **Warn and continue** | `justification_optional` |
| **Record only** | `monitor` |

`risk.level` takes `low`, `medium`, `high` or `critical`. Rules saved earlier may also use `very_low` or `very_critical`.

### How the Code view works

- **Technical name.** The editor makes the technical name from the **Name** when you first save a policy, and never changes it afterwards, so the policy's history stays linked. To rename a policy, change **Name**. Only a new, unsaved policy can get a different technical name in Code.
- **Saving.** A save from Code keeps your text exactly as written, including comments and spacing.
- **Rule grouping.** If you add or remove `request` blocks, each block opens as its own rule afterwards, and optional rule names are dropped.
- **Form greyed.** When the code holds something the form can't show, **Form** is greyed with "The form can't show this policy. Edit it as code."
- **Rules written as code.** In **Form**, a single rule the form can't show appears as a card tagged **Written as code**, with **Edit as code** and **Show the rule**. The card says why, and the rule is kept exactly as written.
- **One condition.** To edit one **Only when** line or block as text, use its ⋯ menu > **Edit this part as code**.
- **Priority.** Keep the priority between 0 and 999,999. Higher numbers are reserved for Pause enforcement, and a publish that uses one is refused.

| When | Message |
| --- | --- |
| The code holds more than one policy | Keep one policy here. Create other policies with Create policy. |
| The code holds no policy, or uses another policy's name | Write one policy here, with a name no other policy uses. |
| You changed the technical name of a saved policy | Keep "policy *name*" as it is: this policy's history follows that name. To rename the policy, change Name. |
| A new policy uses the name of a removed policy | A removed policy used the name "*name*". Pick another name, or bring that policy back from its history. |
| The code has errors | Fix the marked lines, then switch to Form. On save: Fix the marked lines to save this policy. |
| You open Code while an **Only when** line has no value | A condition needs a value first |

## Size limits

The editor refuses a save that goes over a limit, shows the reason, and leaves your draft unchanged. The limits that you meet most often while you edit are:

- Up to 128 values in one list (people, apps, tools or condition values) and up to 128 programs per rule.
- Up to 64 data types per rule.
- Up to 120 characters for a policy name or rule name, and 500 for a description.
- About 30 conditions in one rule. The editor does not warn before you reach it. See [Too many conditions in one rule](./limits-and-behavior#too-many-conditions-in-one-rule).

All your Endpoint Agent policies together can hold up to 200 policies and 500 rules. The 500-rule limit can count more rules than the editor shows. Near a limit, the policy list shows "You're close to the limit of 200 policies.", "You're close to the limit of 500 rules." or "You're close to the limit of 200 policies and 500 rules."

For the full list, how rules are counted, and why to stay below the limits so that you can pause enforcement, see [Size limits](./limits-and-behavior#size-limits).

## Fix a save that is blocked

When you save, the editor first checks the policy in your browser. If something is missing, the footer says what to fix in one sentence, for example "To save this policy to your draft, add a name and choose a response for rule 1." The editor then opens the first problem.

The **Check and save** step lists every problem with its place, for example "Rule 1 › Response and risk: Choose what happens in AI apps.", and a **Go to** button.

Next, QuilrAI checks your whole draft with this policy in it. If that check fails, nothing is saved and the editor shows "This policy can't be saved yet:" followed by the reason. A problem anywhere in your draft blocks saving every policy. For example, if a custom detection that a rule names is deleted, every save fails with "This policy can't be saved yet: unknown data type '*name*'" until that rule is fixed.

Warnings, such as **Never matches** or a Smart Group that was not found, never block a save.

| Step | Message that blocks the save |
| --- | --- |
| Name and description | Name this policy. |
| Name and description | Use a name of 120 characters or fewer. |
| Name and description | Another policy is already called "*name*". |
| Name and description | Use a description of 500 characters or fewer. |
| Rules | Add at least one rule. |
| Who | Choose people, groups or departments, or choose Everyone. |
| Who | *Name* is in both Only these people and Excluded, so this rule never applies to them. Remove them from one of the two lists. |
| Who, Where, Looks for, Only when | One list can hold up to 128 values. |
| Where | Choose AI apps, coding tools, or both. |
| Where | Choose at least one AI app. |
| Where | Choose at least one program, or choose In any program. |
| Where | Type a program name. |
| Where | Use the program's file name, such as chrome.exe, not its path. |
| Where | Program names can't contain control characters. |
| Where | Use a program name of 255 characters or fewer. |
| Where | A rule can name up to 128 programs. |
| Where | Choose at least one coding tool. |
| Where | Give each extra coding-tool condition a value, or remove it. |
| Where | File conditions can't be checked in coding tools yet. Remove the file condition or turn off Coding tools. |
| Looks for | A rule can look for up to 64 data types. |
| Looks for | Give each group at least two data types, or remove it. |
| Looks for | These groups combine in too many ways to check. Use fewer groups, or fewer data types in each. |
| Looks for | Give each file condition a value, or remove it. |
| Looks for (Only when) | 1 condition under Only when needs a value. Choose one, or remove it. |
| Looks for (Only when) | *N* conditions under Only when need values. Choose them, or remove those conditions. |
| Response and risk | Choose what happens in AI apps. |
| Response and risk | Choose what happens in coding tools. |
| Response and risk | Coding tools can't ask for a reason. Use Warn and continue. |
| Response and risk | In coding tools this blocks instead, so it isn't offered here. |
| For some people | Row *N*: choose who it is for. |
| For some people | Choose a different response or risk. |
| For some people | Leave out only people this row doesn't already name. |
| For some people | *Name* is in more than one row of For some people. |
| For some people | For some people, row *N*: one list can hold up to 128 values. |
| For some people | For some people, row *N*: Coding tools can't ask for a reason. Use Warn and continue. |
| Priority | This policy's Priority can't be saved. Choose it again. |
| Priority | This policy is set where only Pause can be. Choose its Priority again. |

## Permissions

| To | You need |
| --- | --- |
| See policies and open them read-only | Access to the **Policy** page and the **Read policies** permission |
| Create, edit, turn off, remove and save policies to your draft | Also the **Update policies** permission |

Without **Update policies**, the editor shows "You can view this policy. Ask an admin to change it." To publish, see [Draft, test, publish and restore](./draft-test-publish-and-history). For every task, see [Permissions](./overview#permissions).

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Smart Groups](../../console/settings-organization/smart-groups)
- [Detection Models](../../console/govern/detection-models)
