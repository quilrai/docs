---
sidebar_position: 6
sidebar_label: "Draft, test, publish and restore"
sidebar_custom_props:
  icon: GitBranch
description: "Keep Endpoint Agent policy changes in a draft, test them against a situation or recent activity, publish them as a new version, and compare or restore versions in History."
console_path: [/policy/engine/endpoint-agent/test, /policy/engine/endpoint-agent/history]
aliases: [endpoint policy draft, unpublished changes, review and publish, publish endpoint policies, safety check, conflicts, endpoint policy test, try a prompt, try a situation, replay activity, endpoint policy history, policy versions, restore version, rollback]
---

# Draft, test, publish and restore

Updated on 10 November 2026.

Changes to Endpoint Agent policies do not reach devices when you save them. They wait in a draft until you publish them as a new numbered version. **History** keeps every version so you can compare them or restore an earlier one.

Open **Govern > Policy Engine > Endpoint Agent** and select **Desktop**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent']} />

## Key terms

- **Draft**: your unpublished changes. Devices never follow a draft.
- **Version**: a numbered copy of your Sensitive data and Files policies that never changes. Each publish, restore, Turn on, pause and resume creates one.
- **Live version**: the version that devices follow now.
- **Safety check**: a check that all your policies together are valid and can be enforced.
- **Conflict**: a rule that another rule overrides in some or all of the places it applies.

## Which controls use drafts

Only Sensitive data and Files policies use a draft, **Test** and **History**. **Skills**, **Apps**, **Accounts**, **Packages** and **Browser** controls save at once, with no draft or version. See [How changes go live](./overview#how-changes-go-live).

## Work with your draft

Saving a policy, turning a policy or rule on or off, removing a policy and reordering **Priority policies** all change your draft. **Save & publish** in the policy editor also opens **Review & publish**.

### Where your draft is kept

Your draft is kept only in your current browser tab, so other admins, tabs and browsers do not see it. After a reload, a banner offers **Keep** or **Discard**. Closing the tab, signing out, or the tab switching to another person or tenant deletes it, so publish before you leave.

If the browser cannot store your draft, for example because it is too large, a reload will lose it. Keep the tab open, or select **Copy source** or **Download source** before you leave.

### The draft bar

While you have unpublished changes, the **Your draft · Unpublished changes** bar shows at the bottom of **All policies**, **Sensitive data** and **Files**, and on **History** while the Policy Engine is on. **Review & publish**, or **Publish changes · N** in the list header, opens the review (N policies differ from the live version). **Discard** deletes your draft and cannot be undone.

### When a newer version goes live

QuilrAI never merges a draft into a newer version, so your draft can no longer be published once a newer version goes live. That happens when:

- Another admin publishes.
- Anyone, including you, restores a version, pauses or resumes enforcement, or turns on the Policy Engine.
- A change to your previous Endpoint settings in Console V1 regenerates the converted policies, which QuilrAI created from those settings.

You see this in one of two places:

- In **Review & publish**, the footer reads **A newer version is live. Load it to publish.** Select **Download draft** to keep a copy, then **Load version N**.
- After a reload, the draft bar says your changes were based on an earlier version and were not merged. Select **Open source** to read them or **Download source** to save them, then **Discard**.

Then make your changes again on the newer version, using your copy as a reference.

## Test your changes

**Test** shows what your Sensitive data and Files rules would decide, without changing devices or turning the Policy Engine on. It scans no text or files; it uses only the details you choose. Skills, Apps, Accounts and Packages are not tested, so check them on a test device.

### Choose the rules to test

With a draft, choose **Live rules** (the default) or **Unpublished changes**. Test sees only changes saved to your draft, so save the policy first.

While the Policy Engine is off, **Live rules** reads **Published version**, and results show what would happen once you turn it on. While enforcement is paused, every outcome is **Monitor** (the **Test** name for **Record only**), decided by **Enforcement paused**. **Every rule that matched** still shows which rule decides once you resume, tagged **Decides when resumed**.

### Try a situation

1. Select **Try a situation**.
2. In **Try a prompt**, set **Person**, **Groups** (the person's [Smart Groups](../../console/settings-organization/smart-groups)), **Where** (the app or coding tool and the activity), **AI model reported**, **Data types found** and **File**. Leave **AI model reported** empty to test a request with no model.
3. Optional: add fields such as department under **More details**. To test up to 100 requests, open **Test multiple situations** and select **Add case**.
4. Select **Check**.

**What happens** shows the outcome, the deciding rule and **Risk on the finding**, the highest risk any matching rule sets. **Every rule that matched** shows why the other rules lost. See [Check a decision before you publish](./how-policies-are-evaluated#check-a-decision-before-you-publish).

:::note What the test does not look up
The test does not look up Smart Groups or department, which a device takes from the person's last sign-in, so pick them yourself. It also decides for apps that are not monitored, although policies apply only to monitored apps. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).
:::

### Replay activity

**Replay activity** shows how often your rules would change the result of recent recorded requests.

1. Select **Replay activity**.
2. Choose a **Time range**. The default is **Last 30 days**; a **Custom range** can cover up to 90 days.
3. In **Requests to check**, enter the sample size: 1,000 by default, 5,000 at most.
4. Select **Run check**.

**Outcome changes** counts requests that would get a different result from the one recorded. **Would be enforced** counts rule matches, not requests. **People identified** shows how each request was matched to an app and activity. It does not count people.

:::note What replay uses
Replay uses recorded details, never prompt text, and skips requests whose app or activity cannot be identified. Department is not recorded, so rules that depend on department never match in replay. A rule for one data type within a category, such as Social Security Number, sees that type as unavailable. Check those rules with **Try a situation**.

The recorded result may come from earlier settings. To see what your draft changes, compare a **Live rules** run with an **Unpublished changes** run.
:::

## Review and publish

Publishing makes every change in your draft live together, as one new version. The review checks that your rules are valid and lists conflicts, but it does not predict what devices will do, so [test your changes](#test-your-changes) first. You need the Policy Engine on and the **Update policies** permission.

### Publish your draft

1. Select **Review & publish** on the draft bar.
2. Check **Changes** and **Conflicts this change creates**. See [Read the conflicts](#read-the-conflicts).
3. Under **Safety check**, wait for **These changes passed the safety check.** If it reads **Some changes need attention.**, fix each listed problem, then reopen the review.
4. Under **Publish**, tick **I've reviewed these conflicts and want to publish anyway** or **Publish without a conflict check**, if shown. Changing the draft clears the tick.
5. Optional: add a **Note (optional)** of up to 500 characters, shown in **History**.
6. Select **Publish changes**.

### What happens after you publish

- A message confirms **Endpoint Agent changes published**, and your draft is cleared.
- New requests use the new version right away, but in AI apps, identical content that was just blocked can stay blocked for up to 2 minutes. The console does not confirm when each device has applied the change. See [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).
- The publish, your note and the conflicts you confirmed are recorded in [Audit logs](../../console/settings-organization/audit-logs).
- If enforcement is paused, the new version keeps the pause. See [Publishing and restoring around a pause](./turn-on-off-and-pause#publishing-and-restoring-around-a-pause).

### Read the conflicts

**Conflicts this change creates** groups the rules that will stop deciding after you publish:

- **N rules won't work as written**: another rule always wins where they apply, one of their exceptions loses, or a looser rule wins because of how policy priority is set. You must confirm. The headline can add **and M more might not**, or read **N rules might not work as written**, when the result depends on details the check cannot settle. Rules that only might not work as written need no confirmation.
- **N rules will be overridden in places**, **N rules might be overridden**, **N rules will have their response set by other rules (risk still counts)** and **N rules now add nothing**: these need no confirmation.
- **Some rules in the policies you changed weren't checked for conflicts.** You must confirm.
- **Conflicts couldn't be checked right now**: select **Check again**, or tick **Publish without a conflict check**.

These notes never block publishing:

- **N rules check every coding tool**: these rules check only some AI apps, but every coding tool. **Limit to**, such as **Limit to Cursor agent**, limits each rule to those apps' coding tools.
- **Not checked in coding tools**: a rule names an AI app, but no rule checks that app's coding tool.
- **A Smart Group wasn't found**: a rule names a Smart Group that was deleted or renamed. Check the rule.

### When you can't publish

- **Turn on the Policy Engine to publish.** **Safety check** offers **Turn on** if you have permission.
- **Needs Policy publish access** or **Needs Policy update access**. Ask an admin for the **Update policies** permission.
- **The rule set is empty.** Add or restore at least one policy.
- **A newer version is live. Load it to publish.** See [When a newer version goes live](#when-a-newer-version-goes-live).

:::note One invalid rule blocks every publish
A problem in any rule blocks saving and publishing, even in policies you did not change. For example, a rule that names a deleted [custom detection](../../console/govern/custom-detections-and-library) fails with **This policy can't be saved yet: unknown data type 'Project code'**. Fix the rule or restore the detection.
:::

## Review version history

The **History** tab lists every published version, 20 at a time. A version holds your Sensitive data and Files policies and the pause state. A restore does not change Skills, Apps, Accounts or Packages.

### Read the version list

Each version shows its number, time, publisher (or **Made automatically**) and summary, such as the publish note or **Restored from Version 3**. Change types are **Published** (also for pause and resume), **Restored**, **Converted** (created from your previous Endpoint settings when the Policy Engine was turned on) and **Regenerated after a settings change** (QuilrAI updated the converted policies after those settings changed in Console V1).

The live version's workstation count covers your whole fleet; it does not show how many devices use this version.

### Compare versions

1. Select a version.
2. Under **Compare with**, choose **Previous version** or **Live version**.
3. Read the differences. **Rule-level details** shows the exact rule changes.

Each version also has **Conflicts this version created** and **Technical source**, with **Download policy file**.

While the Policy Engine is off, the last live version is tagged **Kept · Policy Engine off**, and you cannot restore. See [Turn on again after a Turn off](./turn-on-off-and-pause#turn-on-again-after-a-turn-off).

## Restore an earlier version

Restoring makes an earlier version live right away, as a new version. Your current version stays in **History**.

### Before you restore

You need the Policy Engine on and the **Update policies** permission. The live version and the version you restore must have the same pause state, or the restore is refused. Select **Resume enforcement** or **Pause enforcement** first.

### Restore a version

1. In **History**, select the version, then **Review restore**.
2. In **Review & restore**, check the changes, conflicts and safety check as for a publish. If asked, tick **I've reviewed these conflicts and want to restore anyway** or **Restore without a conflict check**.
3. Select **Restore this version**.

A message confirms **Earlier version restored**, and the restore is recorded in [Audit logs](../../console/settings-organization/audit-logs). If someone publishes while you review, nothing is restored; recheck the changes against the new live version.

### When you can't restore

When **Review restore** is greyed out, hold the pointer over it to see why. If **The live version is unavailable.**, refresh the page. If **The selected version did not pass the safety check.**, choose another version, or make the changes in your draft.

### Restore one policy into your draft

1. In **All policies**, open the policy and select its **History** tab.
2. Under **Versions that changed this policy**, select a version.
3. Select **Restore this version**, then **Restore to draft**, or **Restore & review** to also open **Review & publish**.

Only that policy changes in your draft; devices are unchanged until you publish.

## Permissions

- **See policies, use Test and see History**: access to the **Policy** page and the **Read policies** permission.
- **Change your draft, publish or restore**: also the **Update policies** permission.
- **See the workstation count in History**: the **Read users** permission.

See [Permissions](./overview#permissions).

## Notes and limits

- **Only QuilrAI support can turn off the Policy Engine after you publish**, restore, or pause or resume enforcement. To stop enforcement quickly, use **Pause enforcement**. See [Who can turn off](./turn-on-off-and-pause#who-can-turn-off).
- **Size limits.** All your policies together can hold up to 200 policies and 500 rules, with room kept for **Pause enforcement**. See [Size limits](./limits-and-behavior#size-limits).

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
