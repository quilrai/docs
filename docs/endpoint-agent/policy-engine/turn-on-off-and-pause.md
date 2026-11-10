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

Four actions in the status strip at the top of **Govern > Policy Engine > Endpoint Agent > Desktop** control whether the Policy Engine decides what happens on Endpoint Agent devices.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent']} />

## Key terms

| Term | Meaning |
| --- | --- |
| **Previous Endpoint settings** | Per-app settings in Console V1, the earlier QuilrAI console, under **Settings > Endpoint**. They decide on devices while the Policy Engine is off: **Guardrails** (an action for each sensitive-data category in each app), **File Restrictions** and **Group & User Rules** (exceptions for a [Smart Group](../../console/settings-organization/smart-groups) or a person). The status strip calls them existing settings. |
| **Detection Policy** | A separate rules engine in Console V1, under **Settings > Detection Policy**. |
| **Version** | A numbered, saved copy of your Sensitive data and Files policies. Each publish, restore, Turn on, pause and resume creates one. **History** keeps every version. |
| **Converted version** | The version Turn on creates from your previous Endpoint settings alone, shown in **History** as **Converted from the previous settings** or **Regenerated after a settings change**. |
| **Only monitor** | Every matching rule acts as **Record only**: the request goes through with no message, and the match is recorded. |

## Choose the right action

When the strip shows **Policy Engine off · existing settings active**, it offers **Turn on**. When it shows **Policy Engine on**, the other actions are in its **More** menu.

| Action | What it does |
| --- | --- |
| **Turn on** | Converts your previous Endpoint settings into policies, which then decide. |
| **Pause enforcement…** | Stops blocking quickly, such as in an incident. Policies only monitor, so findings keep being recorded. Some coding-tool checks switch off. Afterwards only QuilrAI support can turn off the Policy Engine, even after you resume. |
| **Resume enforcement…** | Ends the pause. |
| **Turn off Policy Engine (use previous settings)…** | Hands decisions back to your previous Endpoint settings. Deletes nothing. Available only while the converted version runs. See [Who can turn off](#who-can-turn-off). |

Every action needs the **Update policies** permission and is recorded in [Audit logs](../../console/settings-organization/audit-logs). Without the permission, you see the state but no actions.

## Turn on the Policy Engine

### What Turn on does

- Converts your previous Endpoint settings, as they are now, into policies. See [What your previous Endpoint settings become](#what-your-previous-endpoint-settings-become).
- Adds QuilrAI's four [starter policies](./policies-and-rules#starter-policies), switched off. They change nothing until you switch one on and publish.
- Makes devices follow the policies and send requests from every supported app for a decision, even apps whose **Guardrails** were off. To stop monitoring an app, turn it off under **Application Monitoring** in **Settings > Endpoint Agent**. Older agents keep some checks; see [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).
- Does not change **Skills**, **Apps**, **Accounts** or **Packages**, which apply whether the Policy Engine is on or off. See [Files, Skills, Packages, Apps and Accounts](./files-skills-packages-apps-accounts).

### Before you turn on

- **Detection Policy must be off.** Its rules are not converted, so Turn on is refused while it is on. Plan replacement policies first. See [Console V1 settings](../../console/legacy-v1/administration/settings).
- **Check the Endpoint Agent switch.** If it is off, no device follows the policies until you turn it on in **Settings > Endpoint Agent**.
- **There is no preview or conflict check.** Afterwards, **Controls > All policies** and **History** show rules that lose to other rules.

For surprising conversion results, see [Moving from Endpoint settings](./limits-and-behavior#moving-from-endpoint-settings).

### Turn on step by step

1. In the status strip at the top of **Govern > Policy Engine > Endpoint Agent > Desktop**, select **Turn on**. The **Turn on Policy Engine for Endpoint Agent?** dialog says what will be converted and added.
2. Select **Turn on**, or **Keep it off** to cancel. This can take up to a minute.
3. Read the **Policy Engine is on for Endpoint Agent** message. If it is amber, something needs attention, such as starter policies left out because of the [size limits](./limits-and-behavior#size-limits).
4. Review the new version in **History** and the converted policies in **Controls > All policies**.

If Turn on is refused, nothing changes. Fix the reason shown, usually Detection Policy or the size limits, or contact QuilrAI support.

### What your previous Endpoint settings become

Converted policies are named after the app. The examples below use ChatGPT.

| Previous Endpoint setting | Becomes |
| --- | --- |
| **Guardrails** on for an app | A policy such as **ChatGPT**, with rules for each category you turned on and the action you chose. Categories with the same action can share one rule. |
| **Guardrails** off for an app | No rule. Policies you add later can cover the app. |
| **File Restrictions** | A policy such as **ChatGPT · File restrictions**, for uploads in AI apps. In coding tools, devices keep applying the file-type rules from your previous Endpoint settings. |
| **Group & User Rules** | Separate exception policies with **Custom order** priority: **ChatGPT · For Smart Groups**, **ChatGPT · For Smart Groups, by activity**, **ChatGPT · For people** and **ChatGPT · For people, by activity**. If any Group & User Rule sets File Restrictions, or Language Blocking is on anywhere, the exceptions go into the app's own policies at **Default** priority instead. |

:::note Check exceptions after you turn on
For the people they name in that app, separate exception policies decide before **Default** policies (those with no set priority), even stricter ones you add later. To make a new policy decide first, add it to **Priority policies** in **Controls > All policies**. See [Make one policy decide first](./how-policies-are-evaluated#make-one-policy-decide-first) and [Differences from Endpoint settings](./limits-and-behavior#differences-from-endpoint-settings).

Use **Test** on a few people with Group & User Rules to confirm their results. See [Test your changes](./draft-test-publish-and-history#test-your-changes).
:::

### Turn on again after a Turn off

If the Policy Engine was on before, the dialog names the version running at the last Turn off, such as Version 4. Turn on then:

- Converts your previous Endpoint settings again, dropping edits to converted policies in Version 4.
- Keeps the policies your team wrote in Version 4, unless a converted policy now has the same name or they fail the safety check together. The message lists any left out; Version 4 in **History** still has them.
- Brings back starter policies as they were in Version 4.
- Keeps Version 4's pause when it can. Otherwise rules enforce again. The message says which.

If Turn on keeps any policy or the pause, only QuilrAI support can turn off the Policy Engine afterwards. See [Who can turn off](#who-can-turn-off).

## Changing previous Endpoint settings while the Policy Engine is on

While the converted version runs, changing your previous Endpoint settings updates the converted policies as a new version, **Regenerated after a settings change**. After any event listed in [Who can turn off](#who-can-turn-off), a change that would alter the converted policies is refused; make it in the Policy Engine. Changes you make in the Policy Engine are never copied back into your previous Endpoint settings.

## Turn off the Policy Engine

### What Turn off does

Devices go back to your previous Endpoint settings as they are now, including changes made while the Policy Engine was on. Nothing is deleted: every version stays in **History**, and your team's policies come back if you turn on again.

### Who can turn off

You can turn off the Policy Engine yourself only while the converted version runs. Only QuilrAI support can turn it off after:

- A publish or a restore.
- A pause or a resume.
- A Turn on that keeps policies or a pause from an earlier version. **History** then shows, for example, **Converted from the previous settings, keeping the policies you wrote in Version 4**.

Resuming, or restoring the converted version, does not undo this. **Turn off Policy Engine (use previous settings)…** is then greyed out with the note "The policies running now aren't the ones converted from your Endpoint settings…". Use **Pause enforcement** to stop blocking, or contact QuilrAI support.

### Turn off step by step

1. In the status strip, select **More > Turn off Policy Engine (use previous settings)…**.
2. In the **Turn off Policy Engine for Endpoint Agent?** dialog, select **Turn off**, or **Keep it on** to cancel.
3. A **Policy Engine is off for Endpoint Agent** message confirms, and the strip shows **Policy Engine off · existing settings active**.

If the dialog says the Policy Engine changed after you opened it, reload and try again.

## Pause and resume enforcement

**Pause enforcement** stops blocking without losing visibility: every Sensitive data and Files rule only monitors, across your whole tenant, until someone resumes.

Findings and rule alerts are still recorded and sent. Findings from paused rules carry a [**Paused** tag](./what-users-see-and-findings#what-each-policy-label-means), such as **Paused · would have blocked**. Checks that are off while paused record nothing about what they would have done.

### What changes while enforcement is paused

| While paused | Controls |
| --- | --- |
| Only monitor: no block, warning or reason request | **Sensitive data** rules in AI apps and coding tools, and **Files** rules in AI apps. |
| Off | File-type rules in coding tools. **Skills** rules. **Packages** checks (**Block vulnerable dependencies**, **Notify about newer dependency versions**); installs are still recorded for Inventory as not checked. **Accounts** checks that coding tools make themselves, such as the Codex and Cursor model checks and Claude Code's organization check when **Also enforce at Anthropic** is off. Saved changes to Skills and these Accounts checks apply after you resume. |
| Keep applying, and saved changes apply now | **Apps** and every other **Accounts** restriction. |
| Unchanged | **Application Monitoring**, Browser Extension, LLM Gateway and MCP Gateway. |

### Pause step by step

1. In the status strip at the top of **Govern > Policy Engine > Endpoint Agent > Desktop**, select **More > Pause enforcement…**. The **Pause enforcement for Endpoint Agent?** dialog lists what is paused and what keeps applying.
2. Select **Pause enforcement**, or **Keep enforcing** to cancel.
3. An **Enforcement is paused for Endpoint Agent** message confirms. The strip shows **Enforcement: Paused**, policy pages show a paused banner, and **History** shows "Enforcement paused".
4. For up to about 2 minutes, the **More** menu in this browser tab shows **Applying the last change…** in place of **Resume enforcement…**.

If your policies are at a size limit, Pause is refused. Remove a policy, publish, then pause again. See [Room kept for Pause enforcement](./limits-and-behavior#room-kept-for-pause-enforcement).

### Resume step by step

1. In the status strip, select **More > Resume enforcement…**, or select **Resume enforcement** on the paused banner.
2. Select **Resume enforcement**, or **Keep paused** to cancel. Rules enforce again as written; rules you switched off stay off.
3. An **Enforcement resumed for Endpoint Agent** message confirms, and **History** shows "Enforcement resumed".
4. For up to about 2 minutes, the **More** menu in this browser tab shows **Applying the last change…** in place of **Pause enforcement…**.

### Publishing and restoring around a pause

- While paused, a publish keeps the pause. A draft that would remove the pause cannot be published: reload the draft, or resume.
- While paused, you cannot restore a version published without the pause. Resume first.
- While not paused, you cannot restore a version published during a pause. Pause first.

## When devices apply each change

- **AI apps** follow every action on the next request. A request that was just blocked can stay blocked for up to 2 minutes if the person sends it again unchanged. After a Turn on or Turn off, the list of apps sent for a decision updates within about 2 minutes.
- **Coding tools** follow a Turn on or Turn off within about 4 minutes. After a pause or resume, their Sensitive data rules change on the next request and other checks within about 4 to 15 minutes.
- **Offline devices** apply changes when they reconnect.

See [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).

## The Endpoint Agent switch is a different control

None of these actions starts or stops the Endpoint Agent. They change only how rules apply on devices. To stop the Endpoint Agent itself, so nothing is monitored, detected or enforced, use the **Endpoint Agent** switch in **Settings > Endpoint Agent** (every device) or **Disable** under **Users > Endpoint deployment** (selected workstations). See [Agent settings](../configure/agent-settings) and [Agent kill switch](../deploy-and-operate/agent-kill-switch).

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Draft, test, publish and restore](./draft-test-publish-and-history)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
