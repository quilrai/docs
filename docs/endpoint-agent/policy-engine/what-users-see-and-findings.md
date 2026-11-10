---
sidebar_position: 7
sidebar_label: "What users see and findings"
sidebar_custom_props:
  icon: MessageSquareText
description: "What people see when an Endpoint Agent policy responds in AI apps and coding tools, and how each decision appears in Findings & Interactions, severity, exports and policy activity."
console_path: []
aliases: [endpoint popups, endpoint pop-ups, prompt blocked, require a reason, ask for a reason, warn and continue, justification popup, justification pop-up, guardian agent message, endpoint findings, rule risk, decision risk, policy risk severity, no rule matched this data, rules not checked, allowed by, allow rule, would have blocked, policy activity]
---

# What users see and findings

Updated on 10 November 2026.

When an Endpoint Agent policy applies to a request, the person at the device sees a response in their AI app or coding tool, and QuilrAI records the decision in **Observe > Findings & Interactions**.

## Key terms

| Term | Meaning |
|---|---|
| **AI app** | An AI chat or assistant app, such as ChatGPT, in a browser or on the desktop. |
| **Coding tool** | An AI coding agent on the device, such as Claude Code or Cursor. |
| **Response** | What a rule tells the agent to do. See [Responses](./policies-and-rules#responses). |
| **Interaction** | One recorded request, such as a prompt or an upload. |
| **Finding** | A recorded request that needs review. See [What makes a finding](#what-makes-a-finding). |

## What people see in AI apps

The agent checks each prompt and upload before it reaches the AI service. With no decision from QuilrAI within 5 seconds, the request is sent. See [When a device can't get a decision](./limits-and-behavior#when-a-device-cant-get-a-decision).

- **Block** stops the request.
- **Require a reason** holds the request until the person gives a reason.
- **Ask for a reason** sends the request and shows a reason popup.
- **Record only** sends the request with no message.

### Block

The AI service never receives the request. Apps whose error format QuilrAI knows show their own block message, and no QuilrAI popup appears. Other apps receive an HTTP 406 error with the text "Blocked by DLP policy" (DLP is data loss prevention), and QuilrAI shows a **Prompt Blocked** popup asking the person to remove confidential information or contact the IT helpdesk. It closes when dismissed or after 30 minutes.

### Require a reason

1. The **Potentially Sensitive Data Detected.** popup lists the data types found and previews the content.
2. Under **Reason for bypassing:**, the person picks a listed reason, such as *False Positive*, or writes 20 to 140 characters under **Other (write your own)…**.
3. The person selects **Continue with Original** within the 15-second **Time left:** countdown, which is set on the device, not in the Console.

The request is then sent, with the reason on the finding. It is blocked if the countdown ends, or if the popup is closed or cannot be shown.

If the countdown ends, the popup stays open and says the time to justify has elapsed. A reason given there within 10 minutes is recorded as a second finding. It does not unblock the request, but the same content sent again within 2 minutes goes through without a new popup.

Popups appear one at a time, with a counter such as **1 of 3**. A Require a reason popup that waits more than 15 seconds behind others is dropped, and its request is blocked.

### Ask for a reason

The request is sent at once, and the same popup appears without a countdown. It closes by itself after 30 minutes. The finding is recorded when the person answers or closes it, so it can appear later than the request.

### Account notices

When an account, plan or model is not approved under **Accounts**, the agent refuses the request and shows **Workspace/Org ID not approved**, **Plan not approved** or **Model not approved**. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

## What people see in coding tools

The agent checks the coding tools in [Differences between coding tools](#differences-between-coding-tools). A rule set to **All coding tools** covers every coding tool the agent checks, including tools supported later. With no decision within 7.5 seconds, the prompt or action continues.

- **Block** stops the prompt or action. A tool that cannot stop a step shows a warning instead.
- **Warn and continue** (**Ask for a reason** in AI apps) shows a warning, and the prompt or action continues.
- **Record only** shows nothing.

**Require a reason** is not available for coding tools. Use **Warn and continue** instead.

### The message in the tool

Each message starts with **QuilrAI Guardian Agent**, for example "QuilrAI Guardian Agent blocked your prompt". For a prompt or a file read, it names the data types found. For a file type or sensitivity label check, a skill or a package install, it names the item and the reason. It never shows the detected values.

### Differences between coding tools

| Coding tool | Prompts checked | Desktop popup on Block |
|---|---|---|
| Claude Code, Qoder, QoderWork | Yes | For prompts |
| Cursor, Codex CLI | Yes | No |
| Copilot CLI, Copilot in the IDE | Only files referenced in the prompt. Coding-tool rules don't see typed text. To check it, add a rule for the GitHub Copilot app under **AI apps**. | No |
| Antigravity | No. Tool actions are checked. | No |
| ZCode | Yes | For prompts and tool actions |

The desktop popup is the **Prompt Blocked** popup with the tool's message. Warnings never show it. In Antigravity, **Warn and continue** asks the person to approve the action.

## Responses kept from earlier settings

- **Notify and continue** is no longer offered. Rules saved with it still work: AI apps show a **Security Notice** popup and let the person continue but record a block, and coding tools block. Choose another response.
- Rules converted from the per-app Endpoint settings can use a redaction response. In AI apps it blocks the request, because the agent does not rewrite requests.

## While enforcement is paused

Rules are still checked, but Sensitive data and Files responses become **Record only**, so people see no policy blocks, popups or warnings. Findings are marked **Paused**. Some controls, such as Apps and account checks in AI apps, keep applying. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).

## How decisions appear in Findings & Interactions

To see only Endpoint Agent records, set the **Sensor** filter to **Endpoint Agent**. See [Findings & Interactions](../../console/observe/findings-and-interactions).

<ConsolePath console="QuilrAI Console" path={['Observe', 'Findings & Interactions']} />

In AI apps, every inspected request is recorded. In coding tools, an allowed check with no sensitive data is not recorded.

### What makes a finding

A request becomes a finding when any of these is true:

- The response was **Block**, **Require a reason**, **Ask for a reason** or **Warn and continue**.
- A **Record only** rule that looks at content matched: it found a data type, or checks a file, command, tool action or MCP condition.
- Sensitive data was found, but no published rule matched it.
- The Policy Engine could not check a request with sensitive data.

Every other request is an interaction only, including one decided by an allow rule: an exception with `endpoint.action = allow` in a policy's Code view (see [Edit a policy as code](./policies-and-rules#edit-a-policy-as-code-quilrql)). **Record only** rules are not allow rules.

### Where the deciding policy is shown

The **Cards** layout names the policy and version in the finding sentence. The **Table** layout's **Policy** column adds the rule's own risk. The drawer, which opens when you select a finding, shows the policy and any reason the person gave. **Open policy** opens the policy, or **History** at the deciding version if it is no longer live.

The policy shows its current name. If it was renamed, hover over it to see its name in the deciding version. People who cannot read Endpoint Agent policies see the name without a link.

### What each policy label means

| Label | Meaning |
|---|---|
| *Policy name* **Version 12** | A rule in this policy decided, on version 12 of your published policies. |
| **+2 more** after the name | Other policies gave the same response or set the risk. Hover to see their names. |
| **Allowed by** *policy name* | An allow rule decided. The request is an interaction only. |
| **Paused · would have blocked** | Enforcement was paused, and the named rule would have blocked. Other responses read the same way, for example **Paused · would have required a reason**. |
| **Paused · would-have action not recorded** | Enforcement was paused. The policies that matched are listed after **Matched:**, without the action they would have taken. |
| **Paused** | Enforcement was paused, and no rule is credited. **Paused** is also added after **No rule matched this data** and **Rules not checked**. |
| **No rule matched this data** | Sensitive data was found, but no published rule matched it. **Create a policy** starts one. |
| **Rules not checked**, **Some rules not checked** | See [Why rules were not checked](#why-rules-were-not-checked). |
| **Legacy Endpoint settings** | The per-app Endpoint settings decided, while the Policy Engine was off or for a coding-tool file type or sensitivity label check. |
| **Policy Engine V1:** *rule name* | The earlier Policy Engine (Detection Policy) decided. |
| **Decision label:** *name* | The agent's name for the decision, without recording what decided it. |

### Why rules were not checked

Hover over the label for the reason:

- **Rules not checked** (no rule was checked): the sensitive data scan didn't finish, your policies couldn't be loaded or confirmed, an error occurred, or the request was too large.
- **Some rules not checked** (only some rules were skipped): data types your rules need weren't available, or the request was too large for every rule.

### Rule risk and Decision risk

Risk comes from each rule's **Risk level on findings** field and never changes the response. See [How risk is set](./how-policies-are-evaluated#how-risk-is-set).

- **Rule risk** is the risk on the rule the finding names, for example **Rule risk: High** or **No risk set on this rule**. Older findings can show **Rule risk: Not recorded**.
- **Decision risk** is the highest risk any matching rule set, from any policy. The drawer shows it only when it differs from the rule risk, or **No risk set** when no rule set one.

### Severity

Severity is a finding's triage priority: Critical, High, Medium or Low. It comes from the first source that applies:

1. A severity set by hand.
2. **Policy risk**, while it is on and a matching rule set a risk: the Decision risk, even if a severity rule would rate it higher.
3. The first matching severity rule.
4. The default severity.

Policy risk is off by default. To turn it on, you need permission to triage findings across your whole organization.

1. In **Findings & Interactions**, select **Triage center**, then **Severity & due dates**.
2. On the **Policy risk** card, turn on **Policy risk sets severity**.
3. In **Let policy risk set severity?**, select **Turn on**.

Open findings are classified again, which can change their severity and due dates. See [Triage center](../../console/observe/triage-center).

Until a new finding gets its severity, usually within minutes, the **Cards** and **Table** layouts show its Decision risk in place of a severity. Filters and due dates do not use that value. The drawer, and findings with no Decision risk, show **Pending**.

In the drawer, hover over the severity to see its source, such as **Set by** *email*, **Rule:** *rule name* or **Policy risk: High ·** *policy name*.

### Export decisions

Use **Export** on Findings & Interactions, or [Export Center](../../console/settings-data/export-center). Allow-rule requests appear in Interactions exports only. Policy columns include:

- **Policy:** the policy the finding names.
- **Policy · Outcome:** `rule`, `paused_rule`, `allowed_by_rule`, `no_policy` (no rule matched) or `not_evaluated` (rules not checked).
- **Policy · Rule Title:** the policy's title in the deciding version.
- **Policy · Risk Level** (Decision risk) and **Policy · Rule Risk Level** (Rule risk). If **Policy · Risk Level Recorded** is `true`, a blank risk means no rule set one.

Each column also appears a second time with **Activity ·** in front of its name, for example **Activity · Policy · Outcome** (**Policy** becomes **Activity · Policy · Name**). Values that were not recorded are blank.

### Activity on each policy

In **Govern > Policy Engine**, choose the **Endpoint Agent** workspace, then **Desktop > Controls > All policies**. The **Last 7 days** column summarizes each policy, and its **Overview** tab has details.

- **Lost to another policy** counts matches where one of its rules was stricter but a higher-priority policy won. It stays 0 while all policies keep the default priority.
- **Top person** and **Model most blocked** always show **Not measured yet**.

Days are UTC calendar days. A coverage line under the tiles, such as **Based on 2,448 of 4,965 checked requests (49%) since 31 Oct**, shows how many requests the counts include. Only devices that report every decision are counted, from the day recording started. Other requests were still checked.

## Notes and limits

- **Test with new content each time.** The same content sent to an AI app again within about 2 minutes can get no new popup or finding. See [Behavior that can change a result without a message](./limits-and-behavior#behavior-that-can-change-a-result-without-a-message).
- **The Browser Extension can check the same prompt.** In a browser that both products monitor, each applies its own policies, so one prompt can show two popups and record two findings.
- **Reasons stay on the finding.** They are not sent to [Action requests](../../console/govern/action-requests), which handles Browser Extension requests only.
- **Apps with Application Monitoring off** record no new activity. Existing findings stay.

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [Limits and behavior to know](./limits-and-behavior)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
- [Triage center](../../console/observe/triage-center)
- [Agent settings](../configure/agent-settings)
