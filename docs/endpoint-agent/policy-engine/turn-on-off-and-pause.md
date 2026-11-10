---
sidebar_position: 2
sidebar_label: "Turn on, off and pause"
sidebar_custom_props:
  icon: ArrowLeftRight
description: "Turn the Endpoint Agent Policy Engine on or off, pause and resume enforcement, and know what each action changes on devices and when."
console_path: []
aliases: [turn on policy engine, turn off policy engine, pause enforcement, resume enforcement, endpoint policy kill switch, starter policies, convert endpoint settings, previous endpoint settings, detection policy]
---

# Turn on, turn off and pause

Updated on 10 November 2026.

Four actions control whether the Policy Engine decides what happens on devices:

- **Turn on** makes Policy Engine policies decide instead of your previous Endpoint settings.
- **Pause enforcement** keeps the policies running but stops them from blocking.
- **Resume enforcement** ends a pause.
- **Turn off** hands decisions back to your previous Endpoint settings.

You find all four in the status strip at the top of **Govern > Policy Engine > Endpoint Agent > Desktop**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent']} />

## Key terms

| Term | Meaning |
| --- | --- |
| **Previous Endpoint settings** | The per-app settings that decide on devices while the Policy Engine is off: **Guardrails** (an action for each sensitive-data category in each app), **File Restrictions** and **Group & User Rules** (exceptions for a Smart Group or a person). You manage them in Console V1 under **Settings > Endpoint**. The status strip calls them existing settings. |
| **Console V1** | The earlier QuilrAI console, where the previous Endpoint settings and Detection Policy are managed. See [Console V1 settings](../../console/legacy-v1/administration/settings). |
| **Detection Policy** | A separate rules engine in Console V1, under **Settings > Detection Policy**. Its rules are not converted into Policy Engine policies. |
| **Smart Group** | A named group of people that rules can target. See [Smart Groups](../../console/settings-organization/smart-groups). |
| **Version** | A numbered, saved copy of your Sensitive data and Files policies. Each publish, restore, Turn on, pause and resume creates one, and so does a change to your previous Endpoint settings while the converted version runs. **History** keeps every version. |
| **Converted version** | The version that Turn on creates from your previous Endpoint settings alone. **History** describes it as **Converted from the previous settings**, or as **Regenerated after a settings change** after a change to those settings updated it. |
| **Enforce** | Apply each rule's response as written, such as **Block** or **Ask for a reason**. |
| **Only monitor** | Treat every matching rule as if its response were **Record only**: the request goes through with no message, and matches are still recorded. |

## Where to find these actions

Go to **Govern > Policy Engine**, select **Endpoint Agent** in the workspace selector, and select **Desktop**. The status strip at the top of the page shows the Policy Engine state and holds the actions.

| Status strip shows | Actions you can take |
| --- | --- |
| **Policy Engine off · existing settings active** | **Turn on** |
| **Policy Engine on** | **More** menu with **Pause enforcement…** and **Turn off Policy Engine (use previous settings)…** |
| **Policy Engine on**, with **Enforcement: Paused** on an amber strip | **More** menu with **Resume enforcement…** and **Turn off Policy Engine (use previous settings)…** |

Every action needs the **Update policies** permission. Without it, the status strip shows the state but no **Turn on** button or **More** menu. **Turn off** has one more condition. See [Who can turn off](#who-can-turn-off).

Each Turn on, Turn off, Pause and Resume is recorded in [Audit logs](../../console/settings-organization/audit-logs).

## Choose the right action

| Action | What it does | Who can do it | How to undo it |
| --- | --- | --- | --- |
| **Turn on** | Converts your previous Endpoint settings into policies and makes the policies decide. | Admins with **Update policies**, while Detection Policy is off. | **Turn off**, while the converted version runs. |
| **Turn off** | Hands decisions back to your previous Endpoint settings. Deletes nothing. | Admins with **Update policies**, only while the converted version runs. Otherwise only QuilrAI support. See [Who can turn off](#who-can-turn-off). | **Turn on**. |
| **Pause enforcement** | Policies keep running but only monitor. Some coding-tool checks switch off. Pausing publishes a new version, so afterwards only QuilrAI support can turn off the Policy Engine. | Admins with **Update policies**, while the Policy Engine is on. | **Resume enforcement**. |
| **Resume enforcement** | Ends the pause. Rules enforce again exactly as written. | Same as **Pause enforcement**. | **Pause enforcement**. |

:::tip Stop blocking quickly
To stop blocking during an incident, use **Pause enforcement**. You can use it whenever the Policy Engine is on, and findings keep being recorded.

Pausing publishes a new version. Afterwards only QuilrAI support can turn off the Policy Engine, even after you resume. If you can still turn it off and want your previous Endpoint settings back, use **Turn off** instead.
:::

None of these actions starts or stops the Endpoint Agent on devices. See [The Endpoint Agent switch is a different control](#the-endpoint-agent-switch-is-a-different-control).

## Turn on the Policy Engine

### What Turn on does

When you turn on the Policy Engine:

1. Your previous Endpoint settings, as they are now, are converted into Policy Engine policies.
2. QuilrAI's four starter policies are added, switched off. They change nothing until you switch one on.
3. Devices start following the policies instead of the previous Endpoint settings.
4. Devices send requests from every supported app for a decision, including apps whose **Guardrails** were off, so that any policy can cover them. To stop monitoring an app, turn it off under **Application Monitoring** in **Settings > Endpoint Agent**.

Turn on does not change **Skills**, **Apps**, **Accounts** or **Packages**. They keep their own settings whether the Policy Engine is on or off. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

### Before you turn on

- **Detection Policy must be off.** Its rules are not converted into policies. While it is on for your tenant, Turn on is refused so that those rules keep working. See [Console V1 settings](../../console/legacy-v1/administration/settings).
- **Check the Endpoint Agent switch.** Turning on the Policy Engine does not start the Endpoint Agent. If the agent is off for your tenant, no device follows the policies until you turn it back on in **Settings > Endpoint Agent**. The Turn on dialog warns you about this if you have the **Read Endpoint Agent** permission.
- **Conflicts are not checked first.** Turn on does not show a preview or check the converted policies for rule conflicts. After it is on, **Controls > All policies** and **History** show any rules that lose to other rules.

For conversion results that can surprise you, see [Moving from Endpoint settings](./limits-and-behavior#moving-from-endpoint-settings).

### Turn on step by step

1. Go to **Govern > Policy Engine > Endpoint Agent** and select **Desktop**.
2. In the status strip, select **Turn on**. The **Turn on Policy Engine for Endpoint Agent?** dialog opens. It says what will be converted and added.
3. Select **Turn on**. The dialog shows "Turning on the Policy Engine… This can take up to a minute." To cancel instead, select **Keep it off**.
4. A **Policy Engine is on for Endpoint Agent** message confirms the result. The message is amber when something needs your attention. See [The confirmation message](#the-confirmation-message).
5. Open **History** to see the new version, described for example as **Converted from the previous settings**.
6. Review the converted policies in **Controls > All policies**.

### If Turn on is refused

The dialog shows the reason in a banner. Nothing is changed.

| The banner says | What to do |
| --- | --- |
| "Detection Policy decides this tenant's endpoint traffic; Turn on is blocked so it keeps working." | Detection Policy is on for your tenant, and **Turn on** stays unavailable until Detection Policy is turned off. Detection Policy rules are not converted, so plan replacement policies first. Your QuilrAI representative can help. |
| "Couldn't check whether Detection Policy decides this tenant's endpoint traffic…" | Try again. |
| "Couldn't read this tenant's current Endpoint settings…" | Try again. |
| "The Policy Engine could not be turned on. Try again." or another message | Try again. If it keeps failing, contact QuilrAI support. |

If your previous Endpoint settings convert into more policies or rules than the size limits allow, Turn on is refused with the reason. See [Size limits](./limits-and-behavior#size-limits).

### The confirmation message

The **Policy Engine is on for Endpoint Agent** message can include the lines below. In the examples, Version 4 is the version that was running when the Policy Engine was last turned off.

| The message includes | What it means | Shown after |
| --- | --- | --- |
| "Devices now use Policy Engine policies." | The policies now decide on devices. | A first Turn on |
| "Devices now use policies converted from your current Endpoint settings and 2 policies kept from Version 4." | The policies your team wrote in Version 4 apply again. | Turning on again |
| "2 policies from Version 4 weren't kept: …" | A converted policy now uses the same name, or the policies did not pass the safety check together. Version 4 in **History** still has them. | Turning on again |
| "Quilr's starter policies weren't added: …" | Adding them would go over the size limits or fail the safety check. You can still start a new policy from a starter. | Any Turn on |
| "Enforcement is still paused: …" | Version 4's pause was kept. Use **Resume enforcement** when you are ready. | Turning on again |
| "Enforcement is no longer paused: Version 4's pause isn't carried over. …" | Rules enforce again. Pause again if you need to. | Turning on again |
| "Endpoint Agent is off for this tenant, …" | Devices apply none of the policies until the agent is turned back on in **Settings > Endpoint Agent**. You see this line only if you have the **Read Endpoint Agent** permission. | Any Turn on |

### What your previous Endpoint settings become

Converted policies are named after the app. The examples below use ChatGPT.

| Previous Endpoint setting | Becomes |
| --- | --- |
| **Guardrails** on for an app | A policy named after the app, for example **ChatGPT**. Its rules cover each category you turned on, with the action you chose. Categories with the same action can share one rule, so there can be fewer rules than categories. |
| **Guardrails** off for an app | No rule. Converted policies do not cover that app, but any policy you add later can. |
| **File Restrictions** | A policy such as **ChatGPT · File restrictions**. It applies to uploads in AI apps. In coding tools, devices keep applying the file-type rules from your previous Endpoint settings. |
| **Group & User Rules** | Separate policies for the exceptions, such as **ChatGPT · For Smart Groups**, **ChatGPT · For Smart Groups, by activity**, **ChatGPT · For people** and **ChatGPT · For people, by activity**. They show **Custom order**. If any Group & User Rule sets File Restrictions, or Language Blocking is on for any app or exception, the exceptions are written into the app's own policies instead, such as **ChatGPT** and **ChatGPT · File restrictions**, at **Default**. |
| **Detection Policy** | Not converted. Turn on is refused while it is on. |

:::note Check exceptions after you turn on
For the people they name in that app, separate exception policies decide before **Default** policies, including stricter **Default** policies you add later. To make a new policy decide before them, add it to **Priority policies**. See [Make one policy decide first](./how-policies-are-evaluated#make-one-policy-decide-first) and [Differences from Endpoint settings](./limits-and-behavior#differences-from-endpoint-settings).

Use **Test** to check a few people who have Group & User Rules exceptions and confirm the results are what you expect. See [Test your changes](./draft-test-publish-and-history#test-your-changes).
:::

### The four starter policies

Every Turn on adds QuilrAI's four starter policies, switched off: **Keep secrets out of AI**, **Ask before sharing ID numbers, card or health data**, **Stop prompt injection and jailbreaks** and **Block bulk personal data**. To use one, switch it on and publish the change. For what each one looks for and does, see [Starter policies](./policies-and-rules#starter-policies).

If adding the starter policies would take your policies over the size limits, they are left out and the confirmation message says so. Turn on still goes ahead.

### Turn on again after a Turn off

If the Policy Engine was on before, the dialog names the version that was running when it was turned off, for example Version 4. Turn on then does the following:

- Converts your previous Endpoint settings again, as they are now. Edits made to converted policies in Version 4 are not kept.
- Keeps the policies your team wrote in Version 4.
- Adds the starter policies switched off, unless Version 4 already has them. A starter policy that was switched on or edited in Version 4 comes back as it was in Version 4.
- If enforcement was paused in Version 4, keeps it paused when it can. The confirmation message tells you whether enforcement is still paused.
- Keeps Version 4 in **History**, so you can still compare or restore it.

If Turn on keeps any policy or the pause from Version 4, only QuilrAI support can turn off the Policy Engine afterwards. See [Who can turn off](#who-can-turn-off).

## Changing previous Endpoint settings while the Policy Engine is on

You can still change your previous Endpoint settings in Console V1 while the Policy Engine is on.

- While the converted version runs, a settings change updates the converted policies. **History** describes the new version as **Regenerated after a settings change**.
- Once anyone publishes, restores, pauses or resumes, or Turn on keeps policies or a pause from an earlier version, a settings change that would alter the converted policies is refused. Make the change in the Policy Engine instead.

Changes you make in the Policy Engine are never copied back into the previous Endpoint settings.

## Turn off the Policy Engine

### What Turn off does

- Devices go back to your previous Endpoint settings as they are now, including any changes made to them while the Policy Engine was on.
- Nothing is deleted. Every version stays in **History**. If you turn on again later, the policies your team wrote come back. See [Turn on again after a Turn off](#turn-on-again-after-a-turn-off).
- **Skills**, **Apps**, **Accounts** and **Packages** keep their own settings.
- The Endpoint Agent keeps running. Turn off does not start or stop the agent on devices.

### Who can turn off

You can turn off the Policy Engine yourself only while the converted version runs, and nobody has published, restored, paused or resumed since. **History** describes that version as **Converted from the previous settings** or **Regenerated after a settings change**.

After any of the following, only QuilrAI support can turn off the Policy Engine:

- Someone publishes a change or restores a version.
- Someone pauses or resumes enforcement.
- Turn on keeps policies or a pause from an earlier version. When it keeps policies, **History** describes the new version as, for example, **Converted from the previous settings, keeping the policies you wrote in Version 4**.

Resuming enforcement, or restoring the converted version, does not make Turn off available again.

When you cannot turn off, **Turn off Policy Engine (use previous settings)…** is greyed out with the note "The policies running now aren't the ones converted from your Endpoint settings, so only Quilr support can turn off Policy Engine." Use **Pause enforcement** to stop blocking in the meantime, or contact QuilrAI support.

### Turn off step by step

1. Go to **Govern > Policy Engine > Endpoint Agent** and select **Desktop**.
2. In the status strip, select **More > Turn off Policy Engine (use previous settings)…**.
3. The **Turn off Policy Engine for Endpoint Agent?** dialog explains that devices go back to the previous Endpoint settings and what happens to the running version.
4. Select **Turn off**. To cancel instead, select **Keep it on**.
5. A **Policy Engine is off for Endpoint Agent** message confirms: "Devices use the previous Endpoint settings. Device enablement is unchanged." The status strip shows **Policy Engine off · existing settings active**.

### If Turn off is refused

The dialog shows the reason in a banner.

| The banner says | What to do |
| --- | --- |
| "The policies running now aren't the ones converted from your Endpoint settings, so only Quilr support can turn off Policy Engine. Use Pause enforcement to stop blocking in the meantime." | Someone published, restored, paused or resumed after the page loaded. Use **Pause enforcement** to stop blocking, or contact QuilrAI support. **Turn off** stays unavailable. |
| "The Policy Engine changed after you opened this. Reload and try again." | Someone published a change after you opened the dialog. Reload the page. If **Turn off** is still available, try again. |
| "The Policy Engine is already off, so Endpoint devices follow their previous settings." | Nothing to do. |

## Pause and resume enforcement

**Pause enforcement** stops blocking on devices without losing visibility. Policies keep running and matches are still recorded, but every Sensitive data and Files rule only monitors.

A pause applies to every device and person in your tenant. You cannot limit it to some apps or Smart Groups. It lasts until someone selects **Resume enforcement**.

### What changes while enforcement is paused

| Area | While paused |
| --- | --- |
| **Sensitive data** rules, in AI apps and coding tools | Only monitor. They do not block, warn or ask for a reason. Matches are recorded. |
| **Files** rules in AI apps | Only monitor. Matches are recorded. |
| File-type rules in coding tools (set in your previous Endpoint settings, not in the Policy Engine) | Off. |
| **Skills** rules | Off. No skill is blocked. Changes you save are kept and apply after you resume. |
| **Packages** checks: **Block vulnerable dependencies** and **Notify about newer dependency versions** | Off. Package installs are still recorded for Inventory, marked as not checked. |
| **Accounts** checks that coding tools make themselves, such as the Codex and Cursor model checks, and Claude Code's organization check when **Also enforce at Anthropic** is off | Off. Changes you save to these checks apply after you resume. |
| Every other **Accounts** restriction | Keeps applying. Changes you save apply now. |
| **Apps** (which applications can run on devices) | Keeps applying. |
| Which apps and browsers devices monitor (**Application Monitoring**) | Unchanged. |
| Browser Extension, LLM Gateway and MCP Gateway | Unchanged. They keep enforcing their own policies. |

### What is recorded while paused

- Detections and findings are still recorded, and alerts set on a rule are still sent when the rule matches.
- A finding from a paused rule carries a **Paused** tag, for example **Paused · would have blocked**. See [What each policy label means](./what-users-see-and-findings#what-each-policy-label-means).
- Checks that are off while paused record nothing about what they would have done.

### Pause step by step

1. Go to **Govern > Policy Engine > Endpoint Agent** and select **Desktop**.
2. In the status strip, select **More > Pause enforcement…**.
3. The **Pause enforcement for Endpoint Agent?** dialog lists what is **Turned off while paused** and what is **Not paused: these keep applying**, and says when devices pick up the change.
4. Select **Pause enforcement**. To cancel instead, select **Keep enforcing**.
5. An **Enforcement is paused for Endpoint Agent** message confirms. The status strip shows **Enforcement: Paused**, and a banner that starts **Enforcement is paused for Endpoint Agent.** appears on **Overview**, **All policies**, **Sensitive data** and **Files**.
6. For up to about 2 minutes, the **More** menu in this browser tab shows **Applying the last change…** in place of **Resume enforcement…**, and **Turn off Policy Engine (use previous settings)…** is unavailable until it finishes.

If the dialog shows an error instead, it explains what to change. For example, when your policies are at the size limit, the pause does not fit: remove a policy, publish, then pause again. See [Room kept for Pause enforcement](./limits-and-behavior#room-kept-for-pause-enforcement).

:::note A pause is a published version
Pausing publishes a new version, which **History** shows as "Enforcement paused". After it, only QuilrAI support can turn off the Policy Engine, even after you resume. See [Who can turn off](#who-can-turn-off). If your policies still follow your previous Endpoint settings, the dialog also warns that from then on, settings changes no longer update the policies.
:::

### Resume step by step

1. In the status strip, select **More > Resume enforcement…**. You can also select **Resume enforcement** on the paused banner.
2. The **Resume enforcement for Endpoint Agent?** dialog says that Sensitive data rules, file rules, skill rules and package checks enforce again, exactly as written. Rules you switched off stay off.
3. Select **Resume enforcement**. To stay paused instead, select **Keep paused**.
4. An **Enforcement resumed for Endpoint Agent** message confirms. Resuming also publishes a new version, which **History** shows as "Enforcement resumed".
5. For up to about 2 minutes, the **More** menu in this browser tab shows **Applying the last change…** in place of **Pause enforcement…**, and **Turn off Policy Engine (use previous settings)…** is unavailable until it finishes.

If enforcement was already in the state you chose when you confirmed, for example because another admin changed it, nothing is published and the message says "It already was, so nothing was published."

### Publishing and restoring around a pause

- While paused, you can keep editing and publishing. A publish keeps the pause. If a draft would remove the pause, publishing is refused: reload the draft, or use **Resume enforcement**.
- While paused, you cannot restore a version that was published without the pause. Resume first, then restore it.
- While not paused, you cannot restore a version that was published during a pause. Pause first, then restore it.

## When devices apply each change

- **AI apps.** New requests follow a Turn on, Turn off, pause or resume right away. After a Turn on or Turn off, devices also update, within about 2 minutes, which apps they send for a decision.
- **Coding tools.** Sensitive data rules follow a pause or resume right away, and follow a Turn on or Turn off within about 4 minutes. File-type rules and skill rules follow a pause or resume within about 4 minutes. Package checks and the coding-tool **Accounts** checks follow within about 15 minutes.

A device that is offline applies the change when it reconnects. In AI apps, a request that was just blocked can stay blocked for up to 2 minutes if the person sends it again unchanged. For every control, see [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).

## The Endpoint Agent switch is a different control

The Policy Engine decides which rules devices follow. The Endpoint Agent switch decides whether the agent runs on devices at all. Turning the Policy Engine on or off, or pausing it, never starts or stops the agent.

| Control | Where | What it stops |
| --- | --- | --- |
| **Pause enforcement** | **Govern > Policy Engine > Endpoint Agent**, **More** menu | Blocking by Policy Engine rules. Monitoring continues. |
| **Turn off Policy Engine (use previous settings)…** | **Govern > Policy Engine > Endpoint Agent**, **More** menu | Policy Engine decisions. The previous Endpoint settings decide instead. |
| **Endpoint Agent** switch | **Settings > Endpoint Agent** | The Endpoint Agent on every device in the tenant: nothing is monitored, detected or enforced. |
| **Disable** for a workstation | **Users > Endpoint deployment** | The Endpoint Agent on the selected workstations. |

See [Agent settings](../configure/agent-settings) and [Agent kill switch](../deploy-and-operate/agent-kill-switch).

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Agent kill switch](../deploy-and-operate/agent-kill-switch)
