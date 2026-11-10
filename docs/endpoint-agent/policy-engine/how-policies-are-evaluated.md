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

For each prompt, file or coding-tool action, the Endpoint Agent asks QuilrAI what to do. QuilrAI checks it against your published Sensitive data and Files policies and returns one response, and a risk level when a rule sets one.

While the Policy Engine is off, devices follow your previous Endpoint settings instead. See [Turn on, turn off and pause](./turn-on-off-and-pause).

## Key terms

| Term | Meaning |
| --- | --- |
| **Request** | One prompt, paste, upload, file read or coding-tool action. |
| **Response** | What the device does with the request, such as **Block** or **Record only**. |
| **Priority** | A policy's place relative to other policies, set on its **Priority** step or in **Priority policies**. |
| **Risk** | **Low**, **Medium**, **High** or **Critical**, set by rules and recorded on findings. It never changes the response. |
| **Finding** | A recorded request that needs review. See [What makes a finding](./what-users-see-and-findings#what-makes-a-finding). |

## How a request is checked

1. QuilrAI checks the request against every rule in the published version, never your draft.
2. From the matching rules, it picks one response (highest Priority first, then the stricter response) and the highest risk.
3. The device applies the response. The request is recorded as an [interaction](../../console/observe/findings-and-interactions) or a finding, except an allowed coding-tool request with no sensitive data.

## When a rule matches

A rule matches when all its parts hold:

- **Who**: the person is one the rule covers.
- **Where**: the app or coding tool, and any activity or program the rule names, is covered.
- **Looks for**: the data types or file conditions are found. A rule with nothing here matches every request in its **Who** and **Where** scope.
- **Only when**: any extra conditions are true.

A rule that is turned off never matches. Its policy keeps its Priority, so turning the rule back on does not change the order.

QuilrAI looks for a data type only when a rule looks for it and that rule's **Who**, **Where** and **Only when** hold for the request. For example, if your only card-data rule covers AI apps, card numbers in coding-tool prompts are not found or recorded.

### When a detail is missing from the request

Details can be missing, for example when nobody is signed in or the sending program is unknown:

- **Only these people**, **Only these apps**, **Only these tools**, **Only in these programs**, and **Only when** lines with a positive operator such as **is any of** are false, so the rule does not apply. A **But not when** line with a positive operator is also false, so it excludes nothing.
- **Everyone except**, **All apps except**, **All tools except**, **Not in these programs**, and **Only when** lines with a negative operator such as **is none of** are true, so the rule still applies.

So a device with nobody signed in gets **Everyone** and **Everyone except** rules, not **Only these people** rules.

To make a negative **Only when** line false when the detail is missing, so the rule does not apply, choose the operator **isn't (when reported)** when you add the line. For an existing line, select **Only when** *field* **is reported** in the line's menu. Neither is offered for person fields (email, [Smart Group](../../console/settings-organization/smart-groups) and department).

## How the response is chosen

Both steps compare the matching rules of every policy, whichever apps it names. The order of policies and rules on the page does not matter.

### Step 1: Priority

Only matching rules that set a response count, and only those in the highest-placed policies. A rule that sets only a risk never affects the response.

- **Default**: every new policy starts here. Between Default policies, the stricter response wins.
- **In Priority policies**: an ordered list at the top of **All policies**. A listed policy decides before every policy below it, even with a weaker response. Use it for exceptions.
- **Always loses**: any other policy that applies to the request decides instead, even with a weaker response.
- **Custom order**: wins over some policies and loses to others, one by one.

Keep listed policies narrow. A listed exception that allows card numbers also wins when the same prompt holds an API key that a **Default** policy blocks. To keep that block, list the stricter policy above it.

### Step 2: The stricter response

Among the rules left, the strictest response wins: **Block**, then **Require a reason** (AI apps only), then **Ask for a reason** (**Warn and continue** in coding tools), then **Record only**. If no matching rule sets a response, the device gets **Record only**.

Older rules saved with **Notify and continue**, and rules converted from your previous Endpoint settings that use redaction, rank between **Ask for a reason** and **Record only**. See [Responses kept from earlier settings](./what-users-see-and-findings#responses-kept-from-earlier-settings).

### Rules in the same policy

All rules in a policy share its Priority, so the stricter response wins between them. To give one rule its own Priority:

1. On the policy's **Rules** step, open the rule's ⋯ menu and select **Move to its own policy…**.
2. Enter the **Name of the new policy**.
3. Under **When the new policy and "*policy name*" both match**, choose **The new policy always wins** (default) or **The stricter response wins**.
4. Select **Move rule**, then save and publish.

A **For some people** row changes the response or risk for the people it names, inside its own rule only. It cannot stop another policy from deciding for them. To exempt them, put the exception in its own policy and add it to **Priority policies**. See [For some people](./policies-and-rules#for-some-people-give-some-people-a-different-response-or-risk).

## How risk is set

The risk is the highest that any matching rule sets, including rules whose response lost.

- A rule sets a risk only when you choose one under **Response and risk**.
- The finding shows the named rule's risk as **Rule risk**, and the request's risk as **Decision risk** when they differ. See [Rule risk and Decision risk](./what-users-see-and-findings#rule-risk-and-decision-risk).

## Which policy a finding names

A finding names one rule and its policy:

- **Usually:** the policy whose response decided, even if another rule was stricter or set a higher risk.
- **The deciding rule gives Record only and looks at no content:** the highest-placed matching rule that looks at content. A rule looks at content when a data type it looks for is found, or it checks a file, command, tool action or MCP condition.
- **Several policies give the winning response:** one of them, with **+N more**.
- **Enforcement is paused:** the rule that would have decided, tagged **Paused**.

## What happens in special cases

### No rule matches

The device gets **Record only** and shows no message. If sensitive data was found, the finding is tagged **No rule matched this data**. Usually a rule looked for that data but did not fully match, such as a rule for 50 or more email addresses and a prompt with 3.

### Enforcement is paused

**Pause enforcement** makes Sensitive data and Files rules record instead of enforce. Rules are still checked and risk still set, but the device gets **Record only** and shows no policy message. Findings are tagged **Paused**, for example **Paused · would have blocked**. For other controls, see [What changes while enforcement is paused](./turn-on-off-and-pause#what-changes-while-enforcement-is-paused).

### Application Monitoring is off for the app

**Application Monitoring**, in **Settings > Endpoint Agent**, sets which apps are monitored, and in which browsers. No policy can override it.

While an app is off, none of its policies or controls apply, including **Accounts** and **Apps** rules. Nothing from it is inspected or logged, so no new findings or interactions appear. Findings recorded earlier are kept. Requests from a browser that is off for the app are not checked either.

Application Monitoring does not change the Browser Extension, which keeps applying its own policies where it is installed. **Pause enforcement** does not change which apps or browsers are monitored.

### A check cannot run

- **QuilrAI returns an error or does not answer in time:** the device lets the request through.
- **Your published policies cannot be loaded or checked:** the device gets **Record only**. If sensitive data was found, the finding is tagged **Rules not checked**.
- **Some data types could not be checked:** rules that need them are skipped, unless what was found is enough to match. Other rules still apply. If none decides and sensitive data was found, the finding is tagged **Some rules not checked**.

For timeouts, and when a device blocks instead, see [When a device can't get a decision](./limits-and-behavior#when-a-device-cant-get-a-decision).

## Make one policy decide first

You need the **Update policies** permission.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Desktop', 'Controls', 'All policies']} />

1. Go to **Govern > Policy Engine > Endpoint Agent**, select **Desktop**, then in **Controls** select **All policies**.
2. In **Priority policies**, select **Add policy to this list** and choose the policy.
3. Drag rows or use the move buttons to order the list. The top policy decides first.
4. Select **Publish changes**, check **Conflicts this change creates** in **Review & publish**, and select **Publish changes** again. Devices use the new order after you publish.

**Remove from list** puts a policy back at **Default**. A row tagged **Can't be moved here** has its place set elsewhere, for example in Code view.

## Check a decision before you publish

Go to **Govern > Policy Engine > Endpoint Agent**, select **Desktop** and open the **Test** tab. Select **Try a situation**, describe the request and select **Check**. The test uses only the details you enter: it does not scan text or look up Smart Groups, so choose the person's groups yourself. See [Try a situation](./draft-test-publish-and-history#try-a-situation).

**What happens** shows the response, the deciding rule and **Risk on the finding**. **Every rule that matched** gives each rule an **Outcome**:

- **Decides**, or **Decides (Priority #N)** when its policy is #N in **Priority policies**: its response is used.
- **Decides (enforcement paused)**: shown on the **Enforcement paused** row while enforcement is paused, because every request is only recorded until you resume.
- **Decides when resumed**: enforcement is paused, and this rule decides once you resume.
- **Loses: *response* is stricter**: a rule with the stricter response named in the label decides, for example **Loses: Block is stricter**.
- **Loses: placed lower**: a rule in a higher-placed policy decides, even though this rule is stricter.
- **Same response** or **Doesn't decide**: another rule decides. **Doesn't decide** also appears when the test can't read the rule's response, such as a rule written as code.
- **Sets risk only** (its risk still counts) or **Sets no response** (neither response nor risk).

## Notes and limits

- **Always loses** places a policy below the policies it shares an app or coding tool with when you choose it. If you later place one of those even lower, it loses to the **Always loses** policy, which then shows **Custom order**.
- Two policies in **Priority policies** can share a place. The stricter response wins between them, and the list shows a warning.

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
