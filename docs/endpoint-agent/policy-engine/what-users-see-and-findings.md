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

When an Endpoint Agent policy applies to a request, two things happen. The person at the device sees the response in the AI app or coding tool they are using, and QuilrAI records the decision in **Findings & Interactions**. This page describes both, so you can explain a popup to a user and read the finding it produced.

You find the records under **Observe > Findings & Interactions**, and each policy's activity under **Govern > Policy Engine > Endpoint Agent > Desktop > Controls > All policies**.

## Key terms

| Term | Meaning |
|---|---|
| **AI app** | An AI chat or assistant application, such as ChatGPT, Claude or Gemini, that people use in a browser or as a desktop app. The Endpoint Agent checks each prompt and upload before it leaves the device. |
| **Coding tool** | An AI coding agent that runs on the device, such as Claude Code, Cursor or Codex CLI. |
| **Hook** | A setting the Endpoint Agent adds to a coding tool so that the tool asks the agent before each prompt or action. |
| **Response** | What a rule tells the agent to do: **Block**, **Require a reason**, **Ask for a reason** (called **Warn and continue** in coding tools) or **Record only**. See [Policies and rules](./policies-and-rules). |
| **Interaction** | One recorded request, such as a prompt or an upload, whatever its response. |
| **Finding** | A recorded request that needs review. See [What makes a finding](#what-makes-a-finding). |
| **Rule risk** and **Decision risk** | Risk levels that rules put on findings. See [Rule risk and Decision risk](#rule-risk-and-decision-risk). |
| **Severity** | A finding's priority in the triage queue: Critical, High, Medium or Low. |

## What people see in AI apps

The agent checks the content before the request reaches the AI service, then applies the response. If the device gets no decision from QuilrAI within 5 seconds, the request is sent. See [When a device can't get a decision](./limits-and-behavior#when-a-device-cant-get-a-decision).

| Response | What happens to the request | What the person sees |
|---|---|---|
| **Block** | It is stopped. | A block message. See [Block](#block). |
| **Require a reason** | It is held until the person gives a reason. | A reason popup with a countdown. If no reason is given in time, the request is blocked. |
| **Ask for a reason** | It is sent at once. | A reason popup with no countdown. The person can answer it or close it. |
| **Record only** | It is sent. | Nothing. |

### Block

The AI service never receives the request. What the person sees depends on the app:

- **Apps whose error format QuilrAI knows.** The app shows a block message in its own window, for example in the conversation. No QuilrAI popup appears, because the app's own message explains the block.
- **Other apps.** The app receives an error response: HTTP 406 with the text "Blocked by DLP policy" (DLP stands for data loss prevention). How the app shows this error depends on the app. QuilrAI also shows a **Prompt Blocked** popup. The popup says that sensitive content was blocked under your organization's data protection policy, and asks the person to remove confidential information before retrying or to contact the IT helpdesk.

The **Prompt Blocked** popup has no countdown. It closes when the person dismisses it, or by itself after 30 minutes.

### Require a reason

1. The agent holds the request and shows a popup titled **Potentially Sensitive Data Detected.** It lists the data types found and previews the content. **Highlight Sensitive Data** marks the detected values in the preview.
2. Under **Reason for bypassing:**, the person picks one of these reasons: *Authorized Business Purpose*, *False Positive*, *Manager Approved Exception* or *Testing Data (Non-Production)*. **Other (write your own)…** opens a text box for a reason of 20 to 140 characters.
3. **Time left:** shows the countdown. The countdown is 15 seconds. It is set on the device, not in the policy or the Console.
4. The person selects **Continue with Original** to send the reason.

| Situation | Result |
|---|---|
| A reason is given before the countdown ends. | The request is sent. The reason is recorded with the finding. |
| The countdown ends with no reason. | The request is blocked. The popup stays open with a banner that says the time to justify has elapsed. A reason given in the next 10 minutes is recorded for review as a second finding for the same request. It does not unblock that request, but if the person sends the same content again within 2 minutes, it can go through without a new popup. |
| The person closes the popup, or the popup cannot be shown on the device. | The request is blocked. |

### Ask for a reason

The request is sent at once. The same reason popup appears, with no countdown. The person can pick a reason or close the popup, and it closes by itself after 30 minutes.

The finding is recorded when the person answers or closes the popup, so it can appear in Findings & Interactions some time after the request was sent.

### When several popups are waiting

The agent shows one popup at a time. When more are waiting, a counter such as **1 of 3** appears at the top of the popup.

- Up to 30 popups can wait. When 30 are already waiting and another arrives, the oldest waiting popup is dropped. If it was a Require a reason popup, its request is blocked.
- A popup that waits more than 15 seconds is dropped. If it was a Require a reason popup, its request is blocked, as if no reason was given.
- A held request waits at most about 40 seconds, including time spent waiting behind other popups. A slow AI app can show its own timeout error before then.

### Account notices

When an account, plan or model is not approved under **Accounts**, the agent refuses the request before it reads any content. The person sees one of these notices: **Workspace/Org ID not approved**, **Plan not approved** or **Model not approved**. Each notice asks the person to switch to an approved workspace, plan or model, or to contact the IT helpdesk. Some apps also show the refusal in their own window. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

### Responses kept from earlier settings

:::note
- **Notify and continue** is no longer offered. A rule saved earlier with it still works: people see a **Security Notice** popup and can continue, but the request is recorded as blocked. Edit the rule and choose another response.
- Rules converted from the per-app Endpoint settings can use redaction. In AI apps the agent does not rewrite a request, so a redaction response blocks the request, as **Block** does.
:::

## What people see in coding tools

The agent checks these coding tools: Claude Code, Cursor, Codex CLI, Copilot CLI, Copilot in the IDE, Qoder, QoderWork, Antigravity and ZCode. **All coding tools** also covers other coding tools that the Endpoint Agent checks.

| Response | What happens |
|---|---|
| **Block** | The prompt or action is stopped, and a message appears in the tool. Where a tool cannot stop a step, it shows a warning instead and the step continues. |
| **Warn and continue** | A warning appears in the tool, and the prompt or action continues. In AI apps this response is called **Ask for a reason**. |
| **Record only** | Nothing. |

**Require a reason** is not available for coding tools, because a coding tool cannot ask for a reason. Use **Warn and continue** instead.

A rule saved earlier with **Notify and continue** blocks in coding tools. Edit the rule and choose another response.

If the device gets no decision from QuilrAI within 7.5 seconds, the prompt or action continues. See [When a device can't get a decision](./limits-and-behavior#when-a-device-cant-get-a-decision).

### The message in the tool

The message is one sentence that starts with **QuilrAI Guardian Agent**. It says what was blocked or flagged, and why:

- **A prompt or a file read.** The message names the data types that were detected.
- **A file type or sensitivity label check, a skill or a package install.** The message names the file or item, and the reason.

The message never shows the detected values. For example, a blocked prompt reads "QuilrAI Guardian Agent blocked your prompt", followed by the data types found.

### Differences between coding tools

| Coding tool | Prompts checked | Desktop popup on Block | Warn and continue |
|---|---|---|---|
| Claude Code | Yes | For prompts | Message in the tool |
| Cursor | Yes | No | Message in the tool |
| Codex CLI | Yes | No | Message in the tool |
| Copilot CLI, Copilot in the IDE | Files referenced in the prompt only. Coding-tool rules don't check text typed into Copilot. A rule for the GitHub Copilot AI app (under AI apps) can. | No | Message in the tool |
| Qoder, QoderWork | Yes | For prompts | Message in the tool |
| Antigravity | No. Tool actions are checked. | No | The tool asks the person to approve the action. |
| ZCode | Yes | For prompts and tool actions | Message in the tool |

The desktop popup is the **Prompt Blocked** popup, with the tool's message as its text. It appears in addition to the message in the tool. Warnings never show a desktop popup.

## While enforcement is paused

When enforcement is paused, every rule is still checked, but each Sensitive data and Files response becomes **Record only**. People see no blocks, reason popups or warnings from policies. Findings are still recorded and are marked **Paused** (see [What each policy label means](#what-each-policy-label-means)). Some controls, such as Apps and account checks in AI apps, keep applying while paused. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).

## How decisions appear in Findings & Interactions

Endpoint Agent decisions are recorded in **Findings & Interactions**. To see only these records, use the **Sensor** filter and choose **Endpoint Agent**. For the page itself, see [Findings & Interactions](../../console/observe/findings-and-interactions).

<ConsolePath console="QuilrAI Console" path={['Observe', 'Findings & Interactions']} />

### What is recorded

- **AI apps.** Every request the agent inspects is recorded as an interaction, including requests with nothing sensitive in them.
- **Coding tools.** A check that finds no sensitive data and is allowed is not recorded.

### What makes a finding

A request becomes a finding when any of these is true:

- The response was **Block**, **Require a reason**, **Ask for a reason** or **Warn and continue**.
- A **Record only** rule matched and the rule looks at content: a data type it looks for was found, or it checks a file, command, tool action or MCP condition.
- Sensitive data was found, but no published rule matched it.
- The Policy Engine could not check a request that contained sensitive data.

Every other request is an interaction only. A **Record only** rule that only sets who and where makes no finding by itself.

A request that an allow rule decided is also an interaction only. An allow rule is an exception written in the Code view of a policy, with `endpoint.action = allow` (see [Edit a policy as code](./policies-and-rules#edit-a-policy-as-code-quilrql)). It lets the request through and records no finding. **Record only** rules are not allow rules.

### Where the deciding policy is shown

Select a finding to open its drawer, the panel that shows the finding's details.

| Place | What it shows |
|---|---|
| **Cards** layout | The finding sentence names the outcome and the policy, with its version. |
| **Table** layout, **Policy** column | The policy name and version, with the rule's own risk under it, for example **Rule risk: High**. |
| Drawer header | Severity, the risk labels (see [Rule risk and Decision risk](#rule-risk-and-decision-risk)), the outcome, and **Policy:** with **Open policy**. |
| Drawer, **Summary** tab, **Why it was flagged** | The **Outcome** and **Policy** rows, and any reason the person gave. |

**Open policy** opens the policy. If the version that decided is no longer live, it opens **History** at that version, so you see the rule as it was when it decided.

The policy is shown with its current name. If it was renamed, hovering shows **Named** *old name* **in Version** *N*. People without permission to read Endpoint Agent policies see the names as plain text, without links.

### What each policy label means

| The policy line shows | Meaning |
|---|---|
| *Policy name* **Version 12** | A rule in this policy decided, on version 12 of your published Endpoint Agent policies. |
| **+2 more** after the name | Other policies shared the decision. Hover to see their names. |
| **Allowed by** *policy name* | An allow rule in this policy decided (see [What makes a finding](#what-makes-a-finding)). The request is an interaction, not a finding. **Record only** rules never show this label. |
| **Paused · would have blocked** | Enforcement was paused, so the request was only recorded. The named rule would have blocked it. Other responses read the same way, for example **Paused · would have required a reason**. |
| **Paused · would-have action not recorded** | Enforcement was paused. The finding lists the policies that matched after **Matched:**, but not the action they would have taken. |
| **Paused** | Enforcement was paused and no rule is credited. **Paused** is also added after **No rule matched this data** and **Rules not checked**. |
| **No rule matched this data** | Sensitive data was found, but none of the Endpoint Agent rules published at the time matched it. **Create a policy** opens a new Endpoint Agent policy. |
| **Rules not checked** or **Some rules not checked** | The Policy Engine could not check the request, or had to skip some rules. Hover to see the reason. See [Why rules were not checked](#why-rules-were-not-checked). |
| **Legacy Endpoint settings**, sometimes with a name such as **Block PII in Cursor** | The per-app Endpoint settings decided, not a Policy Engine policy. This happens while the Policy Engine is off. File type and sensitivity label checks in coding tools also show this label, because the per-app settings decide them. |
| **Policy Engine V1:** *rule name* | The earlier Policy Engine (Detection Policy) decided. Its rules are not in this Policy Engine, so there is nothing to open. |
| **Decision label:** *name* | The name the Endpoint Agent gave the decision. The finding does not record whether a policy or the per-app settings decided it. |

### Why rules were not checked

Hover over **Rules not checked** or **Some rules not checked** to see the reason.

**Rules not checked** means that no rule was checked. **Some rules not checked** means that only the affected rules were skipped.

| Hover text | Label |
|---|---|
| The scan for sensitive data didn't finish, so the Policy Engine couldn't check this request. | **Rules not checked** |
| Your published policies couldn't be loaded, so the Policy Engine couldn't check this request. | **Rules not checked** |
| Your policies couldn't be loaded when this request arrived, so it wasn't checked. | **Rules not checked** |
| The Policy Engine ran into an error while checking this request. | **Rules not checked** |
| The Policy Engine couldn't confirm which policies were in effect, so it didn't check this request. | **Rules not checked** |
| This request was too large to check against your rules. | **Rules not checked** |
| Some data types your rules look for weren't available for this request, so not every rule could be checked. | **Some rules not checked** |
| This request was too large to check against every rule. | **Some rules not checked** |
| The Policy Engine couldn't check this request. (Shown for any other reason.) | **Rules not checked** |

A request that was not checked is a finding only when sensitive data was found in it.

### Rule risk and Decision risk

A rule can set a risk level in its **Risk level on findings** field (see [Risk levels](./policies-and-rules#risk-levels)). The risk level is shown on the finding and never changes the response.

| | Rule risk | Decision risk |
|---|---|---|
| Meaning | The risk level set on the rule the finding names. | The highest risk level that any matching rule set for this activity, from any policy. |
| Can come from another rule | No | Yes |
| Used for severity | No | Yes, while **Policy risk** is on. See [Severity](#severity). |

The drawer header shows these risk labels:

| Risk label | Meaning |
|---|---|
| **Rule risk: High** | The named rule sets High. |
| **No risk set on this rule** | The named rule sets no risk level. |
| **Rule risk: Not recorded** | The named rule's own risk is not available for this decision. Findings recorded before rules carried their risk read this way. |
| **Decision risk: High** | The highest risk among the matching rules. It appears only when it differs from the rule risk, and it can come from a rule other than the named one. |
| **No risk set** | None of the matching rules set a risk level. |

Findings show four levels. A rule saved with Very critical shows as **Critical**, and one saved with Very low shows as **Low**.

**Example.** A rule named "Block SSN" sets no risk and blocks a prompt to ChatGPT. Another matching rule, "Finance data", sets Critical. The drawer shows **No risk set on this rule** and **Decision risk: Critical**. With Policy risk on, the finding's severity is Critical.

The drawer shows no **Decision risk** label on findings labelled **No rule matched this data**, **Rules not checked** or **Legacy Endpoint settings**. To see where any finding's severity came from, hover over its severity (see [Severity](#severity)).

### Severity

QuilrAI sets each open finding's severity from the first source that applies:

1. **Set by hand.** Automation never changes a severity that someone set.
2. **Policy risk**, while it is on and a matching rule set a risk level for the finding. The highest risk level that any matching rule set becomes the severity, even where a severity rule would rate the finding higher.
3. **The first matching severity rule.**
4. **The default severity.**

To let policy risk set severity:

1. Open **Findings & Interactions**, select **Triage center**, then open **Severity & due dates**.
2. On the **Policy risk** card, turn on the **Policy risk sets severity** switch.
3. In **Let policy risk set severity?**, select **Turn on**.

Open findings are classified again, which can raise or lower their severity and move their due dates. Severities set by hand stay as they are. Policy risk is off by default. To change it, you need permission to triage findings across your whole organization. See [Triage center](../../console/observe/triage-center).

A new finding usually gets its severity within minutes. Until then, the **Cards** and **Table** layouts show its Decision risk as the severity, with the hover text "From the decision risk, the highest any matched rule set; severity rules haven't run yet". This value is not stored, so filters and due dates do not use it. The drawer, and the layouts when there is no Decision risk, show **Pending** instead.

In the drawer, hover over the severity to see where it came from, for example **Set by** *email*, **Rule:** *rule name*, **No severity rule matched: the default severity**, or **Policy risk: High ·** *policy name*.

### Export decisions

Select **Export** on Findings & Interactions to export the list you are looking at, or create an export with the **Findings** or **Interactions** source in [Export Center](../../console/settings-data/export-center). Requests that an allow rule decided are interactions, so they appear in Interactions exports only.

Exports include these policy columns, among others. Each column also has a copy for the activity, with **Activity ·** in front of its name, for example **Activity · Policy · Outcome**. The copy of the **Policy** column is **Activity · Policy · Name**, and the copy of **Severity** is **Activity · Severity**.

| Column | Contains |
|---|---|
| **Policy** | The policy the finding names. |
| **Policy · Outcome** | `rule` (a rule decided), `paused_rule` (paused; the rule would have decided), `allowed_by_rule`, `no_policy` (no rule matched the data) or `not_evaluated` (rules not checked). |
| **Policy · Revision** | The version of your Endpoint Agent policies that decided. |
| **Policy · Rule Title** | The policy's title in that version. |
| **Policy · Paused** | `true` while enforcement was paused. |
| **Policy · Would Have Action** | While paused, the response the rule would have applied, for example `block`. |
| **Policy · Risk Level** | The Decision risk. |
| **Policy · Risk Level Recorded** | `true` when the decision recorded its risk. A blank **Policy · Risk Level** then means that no rule set one. |
| **Policy · Rule Risk Level** | The Rule risk. |
| **Policy · Not Evaluated Reason** | The reason code when rules were not checked. |
| **Severity** | The finding's severity. |

Values that were not recorded are left blank.

### Activity on each policy

Each Endpoint Agent policy shows what it did over the last 7 days. Open **Govern > Policy Engine**, choose the **Endpoint Agent** workspace, then open **Desktop > Controls > All policies**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Desktop', 'Controls', 'All policies']} />

The **Last 7 days** column gives a summary. Open a policy and its **Overview** tab for details:

| Item | What it shows |
|---|---|
| **Blocked · 7 days** | Requests its rules blocked, and how many requests it matched. |
| **Given in the last 7 days** | How often each of its responses was used. It is under **Responses it gives**. |
| **Findings in the last 7 days** | Findings it decided, by risk level. It is under **Risk it sets on findings**. |
| **What it did · last 7 days** | Daily bars by response: **Blocked**, **Required a reason**, **Asked for a reason**, **Notified**, **Recorded only** and **Other response** (a response that is not on this list, such as allowed after redaction). Paused days are shaded, with **Would have …, while paused** on top. |
| **Busiest day** | The day it decided, or would have decided while paused, the most requests. |
| **Lost to another policy** | How often one of its rules matched with a stricter response but a higher-priority policy won. It stays 0 while every policy keeps the default priority. |
| **Top person** and **Model most blocked** | These tiles always show **Not measured yet**. People and models are not counted per policy. |
| **Last matched a request** | When it last matched a request. |

Days are calendar days in UTC. A coverage line under the tiles, for example **Based on 2,448 of 4,965 checked requests (49%) since 31 Oct**, shows how many checked requests the numbers are based on. Only requests from devices that report every decision are counted, from the day recording started. Requests checked on other devices, or before then, were still checked but are not in these numbers.

When a policy has no numbers, the card says why:

| Card says | Meaning |
|---|---|
| **Not measured yet** | Counts for this policy are not available. |
| **After publish** | The policy is new in your draft. Activity starts after you publish it. |
| **Not listed** | Only the 1,000 policies that matched the most are listed, and this one is not among them. |
| **Couldn't load** | The counts could not be loaded. Try again from the notice at the top of the page. |
| **Nothing decided yet** | No recorded request matched the policy in the last 7 days, or it matched requests but decided none of them. |

## Notes and limits

- **Test with new content each time.** When the same content is sent again to an AI app within about 2 minutes, the agent can reuse its earlier answer. The repeat may then get no new popup and no new finding. See [Behavior that can change a result without a message](./limits-and-behavior#behavior-that-can-change-a-result-without-a-message).
- **Reasons stay on the finding.** Reasons given in Endpoint Agent popups appear on the finding. They are not sent to [Action requests](../../console/govern/action-requests), which handles Browser Extension requests only.
- **The Browser Extension can record the same prompt.** When the Browser Extension runs in a browser that the Endpoint Agent also monitors for an app, both check the same prompt with their own policies, and each can show its own popup and write its own record. See [Behavior that can change a result without a message](./limits-and-behavior#behavior-that-can-change-a-result-without-a-message).
- **Apps with monitoring off.** When an app's **Application Monitoring** switch is off, new activity from that app is not recorded. Findings already recorded stay.

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
