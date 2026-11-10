---
sidebar_position: 4
sidebar_label: "How policies are evaluated"
sidebar_custom_props:
  icon: GitBranch
description: "Learn how the Endpoint Agent Policy Engine picks one response and one risk level when several policies match a request, and what happens when no rule matches or a check cannot run."
console_path: []
aliases: [policy evaluation, policy precedence, policy priority, priority policies, stricter response wins, always loses, custom order, policy order, rule order, which rule wins, which policy wins, policy conflicts, decision risk, fail open]
---

# How policies are evaluated

Updated on 10 November 2026.

Each time a person sends a prompt or a file to an AI app, or a coding tool sends a prompt or uses a tool, the Endpoint Agent asks QuilrAI what to do. QuilrAI checks that request against your published Sensitive data and Files policies and returns one response, such as **Block** or **Record only**, and a risk level when a rule sets one. This page explains how that decision is made, so you can predict what a set of policies will do.

This applies while the Policy Engine is on. While it is off, devices follow your previous Endpoint settings instead. See [Turn on, turn off and pause](./turn-on-off-and-pause).

You set a policy's priority in the policy editor, and the order of **Priority policies** at the top of **Govern > Policy Engine > Endpoint Agent > Desktop > Controls > All policies**.

## Key terms

| Term | Meaning |
| --- | --- |
| **Request** | One prompt, paste, upload, file read or coding-tool action that the Endpoint Agent checks. |
| **Match** | A rule matches a request when every part of the rule holds for that request. |
| **Response** | What the device does with the request: **Block**, **Require a reason**, **Ask for a reason** (called **Warn and continue** in coding tools) or **Record only**. |
| **Priority** | A policy's place relative to other policies: **Default**, **In Priority policies**, **Always loses** or **Custom order**. See [Step 1: Priority](#step-1-priority). |
| **Risk** | A level that a rule sets on the request: **Low**, **Medium**, **High** or **Critical**. Risk is recorded on the finding. It never changes the response. |
| **Smart Group** | A named group of people that rules can target. See [Smart Groups](../../console/settings-organization/smart-groups). |
| **Interaction** | One recorded request, such as a prompt or an upload, whatever its response. Interactions are listed in [Findings & Interactions](../../console/observe/findings-and-interactions). |
| **Finding** | A recorded request that needs review, for example because a rule blocked it or because sensitive data was found. See [What makes a finding](./what-users-see-and-findings#what-makes-a-finding). |

For how to write policies and rules, see [Policies and rules](./policies-and-rules).

## How a request is checked

1. The Endpoint Agent sends the request to QuilrAI.
2. QuilrAI checks the request against every rule of every policy in the live (published) version. Unpublished draft changes are never used on devices.
3. It keeps the rules that match.
4. It picks one response from the matching rules: the highest Priority first, then the stricter response.
5. It sets the request's risk to the highest risk that any matching rule sets.
6. The device applies the response. In AI apps, the request is recorded as an interaction, or as a finding when it needs review. In coding tools, a request that is allowed and has no sensitive data found is not recorded.

Two cases change these steps. Requests from apps or browsers that **Application Monitoring** leaves out are not checked against policies. While enforcement is paused, Sensitive data and Files rules only record. See [What happens in special cases](#what-happens-in-special-cases).

## When a rule matches

A rule matches a request when all of its parts hold:

| Part | Holds when |
| --- | --- |
| **Who** | The person is one the rule covers. |
| **Where** | The AI app or coding tool, and any activity or program the rule names, is one the rule covers. |
| **Looks for** | The data types or file conditions the rule looks for are found. A rule with nothing under **Looks for** skips this check, so it matches every request in its **Who** and **Where** scope. For example, a rule that blocks one app for the Contractors Smart Group. |
| **Only when** | Any extra conditions are true. |

Two more points decide whether a rule can match:

- **A rule that is turned off never matches.** It keeps its policy's place, so turning it back on changes no Priority.
- **Data types are looked for only where a rule can use them.** QuilrAI first checks each rule's **Who**, **Where** and **Only when**. It then scans the request only for the data types that the remaining rules look for. For example, if your only card-data rule covers AI apps, card numbers in a coding-tool prompt are not looked for, so they are not found or recorded.

### When a detail is missing from the request

Some details can be missing from a request. For example, nobody is signed in to the agent on the device, or the program that sent the request is not known. A missing detail affects conditions in three ways:

| Condition | When the detail is missing |
| --- | --- |
| Conditions that name values: **Only these people**, **Only these apps**, **Only these tools**, **Only in these programs**, and **Only when** lines with a positive operator, such as **is any of** or **contains** | The condition is false, so the rule does not apply. |
| Conditions that exclude values: **Everyone except**, **All apps except**, **All tools except**, **Not in these programs**, and **Only when** lines with a negative operator, such as **is none of** or **doesn't contain** | The condition is true, so the rule still applies. |
| **But not when** lines with a positive operator, such as **is any of** | The line is false, so the request is not excluded and the rule still applies. |

So a device with nobody signed in counts as "everyone else": rules for **Everyone** and **Everyone except** cover it, and rules for **Only these people** do not. People are matched only while they are signed in to the agent.

To make a negative **Only when** line apply only when the detail is reported, do one of the following:

- When you add the line, choose the operator **isn't (when reported)**.
- For a line you already have, open the line's menu and select **Only when** *field* **is reported**, for example **Only when a device name is reported**.

Neither option is offered for the person fields (email, Smart Group and department). The menu option is also not offered for lines inside **But not when** blocks.

## How the response is chosen

When more than one rule matches, QuilrAI picks one response in two steps:

1. **Priority first.** Among the matching rules that set a response, only those in the highest-placed policies count. A rule that sets only a risk never changes the response.
2. **Then the stricter response.** Among those rules, the strictest response wins.

Priority is compared across all matching rules of all policies, whichever apps they name. The order of policies on the page and the order of rules inside a policy never change the response or the risk.

### Step 1: Priority

Each policy has one of four Priority placements. You set it on the policy's **Priority** step, or with the **Priority policies** list (see [Make one policy decide first](#make-one-policy-decide-first)).

| Priority | How the policy competes | Use it for |
| --- | --- | --- |
| **Default** | The usual place. Every new policy starts here. Between matching Default policies, the stricter response wins. | Most policies. |
| **In Priority policies** | An ordered list at the top of **All policies**. A listed policy decides before every policy placed lower, even when its response is weaker. Listed policies decide from the top of the list down. | Exceptions, for example letting one team use an app that a broader policy blocks. |
| **Always loses** | A fallback. Any other policy that applies to the same request decides instead, even with a weaker response. This policy's response is used only where no other policy applies. | A baseline response that any other policy can replace. |
| **Custom order** | Wins over some policies and loses to others, one by one. | A specific order between particular policies. |

**Example of Always loses.** Two policies cover DeepSeek:

| Policy | Priority | Rule |
| --- | --- | --- |
| **Ask before using DeepSeek** | **Always loses** | Everyone, in DeepSeek. Response **Ask for a reason**. |
| **Research may use DeepSeek** | **Default** | **Who**: only the Research Smart Group, in DeepSeek. Response **Record only**. |

| Person | Device gets | Why |
| --- | --- | --- |
| A member of Research | **Record only** | Another policy applies, so **Ask before using DeepSeek** loses. |
| Anyone else | **Ask for a reason** | No other policy applies, so the fallback decides. |

If **Ask before using DeepSeek** were at **Default**, its stricter response would win for Research members too.

### Step 2: The stricter response

Among the rules that are left, the strictest response wins:

| Strictness | AI apps | Coding tools |
| --- | --- | --- |
| 1 (strictest) | **Block** | **Block** |
| 2 | **Require a reason** | Not offered |
| 3 | **Ask for a reason** | **Warn and continue** |
| 4 (least strict) | **Record only** | **Record only** |

If none of the matching rules sets a response, the device gets **Record only**.

:::note Responses kept from earlier settings
Rules saved earlier can use **Notify and continue**, and rules converted from your previous Endpoint settings can use redaction. Both rank below **Ask for a reason** and above **Record only**. Change those rules to a current response so that the result is predictable. See [Responses kept from earlier settings](./what-users-see-and-findings#responses-kept-from-earlier-settings).
:::

### Rules in the same policy

All rules in a policy share its Priority. Between two rules of the same policy, the stricter response wins, and the order of the rules does not matter.

To give one rule a different Priority, move it to its own policy:

1. On the policy's **Rules** step, open the rule's ⋯ menu and select **Move to its own policy…**.
2. Enter the **Name of the new policy**.
3. Under **When the new policy and "*policy name*" both match**, choose **The new policy always wins** (the default) or **The stricter response wins**.
4. Select **Move rule**. The new policy is created when you save. Devices use it after you publish.

Inside one rule, **For some people** rows work differently. A **For some people** row gives named people, Smart Groups or departments a different response or risk inside one rule. Rows are checked from the top down, and a person gets the first row that names them. A row changes only its own rule. It cannot stop a different policy from deciding for those people. To exempt one team from a broader policy, put the exception in its own policy and add that policy to **Priority policies**. See [For some people](./policies-and-rules#for-some-people-give-some-people-a-different-response-or-risk).

## How risk is set

The request's risk is the highest risk that any matching rule sets, from any policy, whatever its Priority. A rule whose response lost still counts toward the risk.

- A rule sets no risk unless you choose one under **Response and risk**. If no matching rule sets a risk, the request has none.
- A **For some people** row can raise the risk for the people it names. It cannot lower it below the risk another matching rule sets.
- The finding shows the named rule's own risk as **Rule risk**. When the request's risk differs from it, including when the named rule sets no risk, the finding also shows **Decision risk**: the highest risk of all matching rules. See [Rule risk and Decision risk](./what-users-see-and-findings#rule-risk-and-decision-risk).

## Which policy a finding names

A finding names one rule and its policy. Which one depends on the decision:

| Situation | The finding names |
| --- | --- |
| Usual case | The policy whose response decided the request. When a policy in **Priority policies** decides, the finding names it, even if another matching rule was stricter or set a higher risk. |
| The deciding rule gives **Record only** and does not look at content | The highest-placed matching rule that does look at content. A rule looks at content when a data type it looks for is found, or when it checks a file, command, tool action or MCP condition. |
| Several policies give the same winning response | One of them, with **+N more** after its name. Hover over it to see the others. |
| Enforcement is paused | The rule that would have decided. The finding is tagged **Paused**. See [Enforcement is paused](#enforcement-is-paused). |

A rule that matched but is not named still counts toward the risk.

For example, **Research may use DeepSeek** gives the Research Smart Group **Record only** in DeepSeek and looks for nothing. **Card data baseline** is set to **Always loses** and asks for a reason when a card number is found. A Research member pastes a card number into DeepSeek. The device gets **Record only**, and the finding names **Card data baseline**.

For what each finding shows, see [What users see and findings](./what-users-see-and-findings).

## What happens in special cases

### No rule matches

- The device gets **Record only**, and the person sees no message.
- If sensitive data was found, the request is a finding tagged **No rule matched this data**. This usually means a rule looked for that data but did not match in full. For example, a rule blocks 50 or more email addresses, and a prompt contains 3.
- If nothing was found, an AI-app request is recorded as an interaction only. A coding-tool request is not recorded.

### Enforcement is paused

**Pause enforcement** makes Sensitive data and Files rules record instead of enforce until you resume. While enforcement is paused:

- Every rule is still checked, and data is still scanned.
- The device gets **Record only** for every request these rules check, and the person sees no message from a policy.
- The risk is still the highest that any matching rule sets.
- Findings are tagged **Paused**, for example **Paused · would have blocked**. See [What each policy label means](./what-users-see-and-findings#what-each-policy-label-means).
- In **Test**, the rule that will decide once you resume is labelled **Decides when resumed**.

Pause does not stop every control. **Apps** and most **Accounts** restrictions keep applying, and checks such as **Skills** and **Packages** switch off. See [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).

### Application Monitoring is off for the app

**Application Monitoring** is a setting in **Settings > Endpoint Agent**. It decides which apps the Endpoint Agent monitors on devices, and in which browsers. It is not a policy, and no policy, person or Smart Group setting can override it.

While an app's switch is off:

- Its requests are not checked against any policy, and none of its policies or controls apply. This includes **Access Control** (the account restrictions under **Accounts**) and app blocking (the rules under **Apps**). See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).
- Nothing from the app is inspected, logged or reported, so no new findings or interactions appear for it. Findings recorded earlier are kept.

Application Monitoring also sets the browsers each app is monitored in. A request from a browser that is off for that app is not checked against policies.

The Browser Extension is separate. Application Monitoring does not change it, and the extension keeps applying its own policies where it is installed.

**Pause enforcement** does not change which apps or browsers are monitored. For how long devices take to apply a monitoring change, see [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).

If the Endpoint Agent itself is off for the tenant or for a workstation, nothing on those devices is monitored, detected or enforced. See [Agent kill switch](../deploy-and-operate/agent-kill-switch).

### A check cannot run

When QuilrAI cannot check a request, the request is allowed. When only some rules cannot be checked, the other rules still apply.

| What went wrong | What happens |
| --- | --- |
| QuilrAI returns an error, or does not answer in time. | The device lets the request through without applying any rule. |
| Your published policies cannot be loaded or checked. | The device gets **Record only**. If sensitive data was found, the request is a finding tagged **Rules not checked**. Hover over the tag to see why. |
| Some data types could not be checked, for example because detection for them did not finish. | Every other rule is still checked. A rule that needs a missing data type is skipped, unless what was already found is enough for it to match. If no other rule decides and sensitive data was found, the finding is tagged **Some rules not checked**. |

For how long a device waits for an answer, and the cases where it blocks instead, see [When a device can't get a decision](./limits-and-behavior#when-a-device-cant-get-a-decision).

## Worked example

This example uses three policies. Finance is a Smart Group.

| Policy | Priority | Rule |
| --- | --- | --- |
| **Block secrets** | **Default** | AI apps and coding tools. **Looks for** API Key or Password. Response **Block**, risk High. |
| **Ask before sharing card data** | **Default** | AI apps. **Looks for** Credit/Debit Card. Response **Ask for a reason**, risk Medium. |
| **Finance may share card data in ChatGPT** | **In Priority policies**, #1 | AI apps: only ChatGPT. **Who**: only Finance. **Looks for** Credit/Debit Card. Response **Record only**, risk Low. |

Here is what happens to different requests:

| # | Request | Rules that match | Device gets | Risk | Finding |
| --- | --- | --- | --- | --- | --- |
| 1 | alice@example.com pastes a card number into Gemini. | Ask before sharing card data | **Ask for a reason** | Medium | Names Ask before sharing card data |
| 2 | alice pastes a card number and an API key into Gemini. | Block secrets, Ask before sharing card data | **Block**. Both are Default, and Block is stricter. | High | Names Block secrets |
| 3 | bob@example.com, in Finance, pastes a card number into ChatGPT. | Finance may share card data in ChatGPT, Ask before sharing card data | **Record only**. The Finance policy is in Priority policies, so it decides first. | Medium, from Ask before sharing card data | Names Finance may share card data in ChatGPT |
| 4 | bob pastes a card number and an API key into ChatGPT. | All three | **Record only**. The Finance policy still decides first, even over Block. | High, from Block secrets | Names Finance may share card data in ChatGPT |
| 5 | bob pastes only an API key into ChatGPT. | Block secrets | **Block**. The Finance policy does not match, because no card number was found. | High | Names Block secrets |
| 6 | alice pastes a card number into Claude Code. | None. The card rule covers AI apps only, so card numbers are not looked for in coding tools. | **Record only** | None | No finding |
| 7 | Request 2, while enforcement is paused. | Block secrets, Ask before sharing card data | **Record only** | High | Tagged **Paused** |

What the example shows:

- **Rows 1 and 2:** between Default policies, the stricter response wins.
- **Rows 3 and 4:** a policy in Priority policies decides even when another matching rule is stricter. The risk is still the highest of all matching rules.
- **Row 5:** a Priority policy decides only when its own rule matches.
- **Row 6:** a rule applies only where its **Where** step says.

:::tip Keep Priority policies narrow
Row 4 is often not what you want: the Finance exception also lets an API key through. To keep blocking secrets for Finance, add **Block secrets** to **Priority policies** and move it above the Finance policy. **Block secrets** then decides whenever it matches, and the Finance policy still decides for card numbers alone. **Review & publish** lists conflicts like this before you publish.
:::

## Make one policy decide first

Use **Priority policies** when one policy must win over others that match the same request. You need the **Update policies** permission.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Desktop', 'Controls', 'All policies']} />

1. Go to **Govern > Policy Engine > Endpoint Agent**, select **Desktop**, then in **Controls** select **All policies**.
2. In **Priority policies** at the top, select **Add policy to this list** and choose the policy. The policy joins at the bottom of the list. You can also drag the policy's row from the table into the list.
3. Put the list in order by dragging rows or using the move buttons. The policy at the top decides first.
4. Select **Publish changes** above the list. The button shows how many policies changed, for example **Publish changes · 1**. **Review & publish** opens.
5. Check the change under **Conflicts this change creates**, then select **Publish changes**. Devices use the new order only after you publish. See [Publish your draft](./draft-test-publish-and-history#publish-your-draft).

You can also open a policy, go to its **Priority** step and choose **In Priority policies**. To put a policy back at **Default**, select **Remove from list**.

A row that shows **Can't be moved here** has its place set elsewhere, for example in the policy's Code view. Hover over the tag to see why.

## Check a decision before you publish

Go to **Govern > Policy Engine > Endpoint Agent**, select **Desktop**, and open the **Test** tab. Use **Try a situation**: describe the request and select **Check**. **What happens** shows the response, the rule that decides and **Risk on the finding**. **Every rule that matched** lists each matching rule with its **Outcome**:

| Outcome | Meaning |
| --- | --- |
| **Decides** | Its response is used. |
| **Decides (Priority #1)** | Its response is used. Its policy is #1 in Priority policies, so it decides before every other matching policy. |
| **Decides (enforcement paused)** | Shown on the **Enforcement paused** row while enforcement is paused. Every request is only recorded until you resume. |
| **Decides when resumed** | Enforcement is paused. This rule's response is used once you resume. |
| **Loses: Block is stricter** | A rule with a stricter response decides. The label names that response. |
| **Loses: placed lower** | A rule whose policy is placed higher decides, even though this rule is stricter. |
| **Same response** | Another rule decides, with the same response. |
| **Doesn't decide** | Another rule decides. It is also shown when this rule's response can't be read in the test, for example because the rule is written as code. |
| **Sets risk only** | The rule sets a risk but no response. Its risk still counts. |
| **Sets no response** | The rule sets neither a response nor a risk. |

The test uses only the details you choose. It does not scan text, and it does not look up Smart Group membership, so choose the person's groups yourself. See [Test your changes](./draft-test-publish-and-history#test-your-changes).

## Notes and limits

- **Always loses** places a policy below the policies it shares an app or coding tool with at the time you choose it. If you later place another of those policies even lower, the **Always loses** policy wins over it, and its tag changes to **Custom order**.
- Two policies in **Priority policies** can share a place. Between them, the stricter response wins, and the list shows a warning.

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
