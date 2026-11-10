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

Changes to Endpoint Agent policies do not reach devices when you save them. They wait in a draft until you review and publish them. Each publish creates a new numbered version, and **History** keeps every version so you can compare versions or restore an earlier one.

All of this happens under **Govern > Policy Engine > Endpoint Agent**, on the **Desktop** side of the **Desktop** | **Browser** switch.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent']} />

<StepFlow steps={[
  {label: "Draft", items: ["Edit policies", "Kept in this browser tab"]},
  {label: "Test", items: ["Try a situation", "Replay activity"]},
  {label: "Review & publish", items: ["Safety check", "Conflicts", "Publish changes"]},
  {label: "History", items: ["New version is live", "Compare or restore"]},
]} />

## Key terms

| Term | Meaning |
| --- | --- |
| **Draft** | Your unpublished changes to Endpoint Agent policies. Devices never follow a draft. |
| **Publish** | Make your draft live. All changed policies go live together as one new version. |
| **Version** | A numbered, saved copy of your Sensitive data and Files policies. Each publish, restore, Turn on, pause and resume creates one. A version never changes after it is saved. |
| **Live version** | The version that devices follow now. |
| **Restore** | Make an earlier version live again. Restoring creates a new version with the earlier rules. No version is deleted. |
| **Safety check** | QuilrAI checks that all your policies together are valid and can be enforced. A problem in any rule blocks publishing. |
| **Conflict** | A rule that no longer decides the outcome in some or all of the places it applies, because another rule wins there. See [How policies are evaluated](./how-policies-are-evaluated). |

## Which controls use drafts

Only Sensitive data and Files policies use a draft, **Test** and **History**. You change them in **All policies**, **Sensitive data** and **Files**, including the order of **Priority policies**.

**Skills**, **Apps**, **Accounts**, **Packages** and **Browser** controls save at once, with no draft or version. For each control, see [How changes go live](./overview#how-changes-go-live).

## Work with your draft

### What changes your draft

These actions change your draft:

- Saving a policy in the policy editor with **Create policy** or **Save changes**.
- Turning a policy or a rule on or off.
- Removing a policy with **Remove policy**.
- Changing the order of **Priority policies**.

**Save & publish** in the policy editor saves the policy to your draft and then opens **Review & publish**. For the editor itself, see [Policies and rules](./policies-and-rules).

### Where your draft is kept

Your draft is kept in your current browser tab, not on the QuilrAI backend. Each admin has their own draft.

| Situation | What happens to your draft |
| --- | --- |
| You reload the tab | It is kept. A banner in the draft bar says you have unpublished changes from earlier in this browser. Select **Keep** to continue, or **Discard** to delete them. |
| You open the console in another tab or browser | That tab or browser does not see your draft. |
| You close the tab, sign out, or the tab switches to another person or tenant | Your draft is deleted. |
| You publish from the draft | Your draft is cleared. |
| A newer version goes live before you publish | Your draft is kept but cannot be published. See [When a newer version goes live](#when-a-newer-version-goes-live). |

:::warning Publish before you leave
Unpublished changes are lost when you close the tab or sign out. Publish when you finish, or keep the tab open.
:::

If your draft is too large for the browser to keep, or the browser blocks storage, a warning says it cannot be saved for reload recovery. Select **Copy source** or **Download source** to keep a copy before you leave the tab.

### The draft bar

While you have unpublished changes, a bar at the bottom of **All policies**, **Sensitive data** and **Files** reads **Your draft · Unpublished changes**. It also shows on **History** while the Policy Engine is on.

The bar does not show on **Overview**, **Skills**, **Apps**, **Accounts** or **Test**. The banners about a saved or out-of-date draft appear in the bar, so you see them only on the pages that show it.

- **Review & publish** opens the review. See [Review and publish](#review-and-publish).
- **Discard** deletes your draft immediately. You cannot undo it.

The **Publish changes · N** button in the header of **All policies**, **Sensitive data** and **Files** also opens the review. N is the number of policies that differ from the live version.

If your draft ends up the same as the live version, the bar reads **Unpublished changes match the live rules.** and offers only **Discard**, because there is nothing to publish.

### When a newer version goes live

A draft is always based on the version that was live when you started it. QuilrAI never merges your draft into a newer version, so you must make your changes again on the newer version.

A newer version goes live when:

- Another admin publishes.
- Anyone restores a version from **History**, including you.
- Anyone pauses or resumes enforcement, or turns the Policy Engine on.
- QuilrAI regenerates the converted policies after a change to your previous Endpoint settings in Console V1.

What you see:

| Where | What you see and what to do |
| --- | --- |
| **Review & publish** | A banner says which version was published after your draft was started, and the footer says **A newer version is live. Load it to publish.** Select **Download draft** to keep a copy, then select **Load version N**. If your changes are not saved in this browser, the button reads **Download and load version N** and downloads them first. |
| After a reload | A banner says your unpublished changes were based on an earlier version and were not merged. Select **Open source** to read them or **Download source** to save them, then select **Discard**. |

After you load the newer version, make your changes again in the policy editor. Use the copy you downloaded as a reference.

## Test your changes

**Test** shows what your policies would decide, without changing anything on devices. Open the **Test** tab.

- The test does not scan any text or file. It uses only the details you choose.
- Only Sensitive data and Files rules are tested. Skills, Apps, Accounts and Packages are not.
- Testing never changes live behavior and never turns the Policy Engine on.

### Choose the rules to test

When you have a draft, choose which rules to test:

| Option | What it tests |
| --- | --- |
| **Live rules** | The live version. While the Policy Engine is off, this option reads **Published version**. |
| **Unpublished changes** | Your draft. |

**Live rules** is selected by default. Select **Unpublished changes** to test your draft. The editor's **Open Test** button selects it for you.

With no draft, the page reads **Testing live rules** (or **Testing the published version** while the Policy Engine is off). While the Policy Engine is off, the result shows what your published policies would decide once you turn it on.

:::note Save before you test
Test sees only the changes saved to your draft. Edits that are still open in the policy editor are not tested. Save the policy first, then choose **Unpublished changes**.
:::

While enforcement is paused, every outcome is **Monitor** (the name **Test** uses for **Record only**), decided by **Enforcement paused**. **Every rule that matched** still lists your rules and shows which one decides once you resume.

### Try a situation

Use **Try a situation** to check one request, or several, against your rules.

1. Select **Try a situation**.
2. In the **Try a prompt** card, describe the request:

   | Field | What to choose |
   | --- | --- |
   | **Person** | Who sends the prompt. |
   | **Groups** | The person's [Smart Groups](../../console/settings-organization/smart-groups). Select **Pick groups**. |
   | **Where** | The app or coding tool, and what the person does there, such as sending a chat message or uploading a file. |
   | **AI model reported** | The AI model the app reports. Leave it empty to test a request with no model, as some file uploads have. |
   | **Data types found** | The sensitive data types the scan would find. Select **Counts and categories** to set amounts. |
   | **File** | A file type or label the prompt carries. Select **Add a file type or label**, or leave it as **None**. |

3. Optional: select **More details** to add other fields, such as the department, program or device ID.
4. Optional: to test several requests at once, open **Test multiple situations** and select **Add case**. You can add up to 100 cases.
5. Select **Check**.

The result shows these cards:

| Card | What it shows |
| --- | --- |
| **What happens** | The outcome and the rule that decides it. **Risk on the finding** is the highest risk any matching rule sets. **Finding** says whether a finding is recorded. **Detected** lists the data types you picked. |
| **Why this decision** | The reasons for the outcome, in sentences. |
| **Every rule that matched** | Each matching rule, what it found, its response, and whether it decides. Only one response happens. The others are listed with the reason they lost. |
| **Every setting this prompt gets** | Every setting the matching rules apply to this request. |

With several cases, use **Result case** to choose which result to read. For how the deciding rule is chosen, see [How policies are evaluated](./how-policies-are-evaluated).

To come back to a situation later, select **Keep this situation**. It is kept in this browser tab only. Its details are never put in the page address, so a copied link opens a blank form in another tab. **Reset** clears the form.

:::note What the test does not look up
- **Smart Groups and department.** On a device, they come from the person's last sign-in. The test uses only what you pick, so a rule for a group or department matches only if you pick that group or department here.
- **Application Monitoring.** The test shows what your rules decide even for an app that is not monitored in **Settings > Endpoint Agent**. Policies apply only to monitored apps. See [Application Monitoring is off for the app](./how-policies-are-evaluated#application-monitoring-is-off-for-the-app).
:::

Below the result, **Try these rules on real traffic** (or **Try your draft on real traffic**) runs the same rules on recorded requests from the last 7 days. Select **Run on last 7 days** to see how many prompts **Would change**. Select **More replay options** to open **Replay activity**.

### Replay activity

Use **Replay activity** to see how often your rules would change the result of recent recorded requests.

1. Select **Replay activity**.
2. Choose a **Time range**: **Last 24 hours**, **Last 7 days**, **Last 30 days** (the default), **Last 90 days**, or **Custom range**. A custom range can cover up to 90 days, in your time zone.
3. In **Requests to check**, enter how many recorded requests to sample. The default is 1,000 and the maximum is 5,000.
4. Select **Run check**.

The report has these sections:

| Section | What it shows |
| --- | --- |
| **Requests checked** | How many recorded requests were in the time range (**Eligible**), how many were sampled, evaluated and skipped, and **Outcome changes**: how many would get a different result from the one recorded when the request was sent. |
| **Results** | How many requests would get each outcome, such as **Monitor** or **Block**. **Would be enforced** counts rule matches, not requests, so it can be larger than the number of requests checked. |
| **People identified** | How each request was matched to an app and activity: **Matched exactly**, **Matched from the device user** or **Not matched to a person**. It does not count people. Requests that were not matched are skipped. |
| **What would change** | The requests whose result would change, broken down by app, activity, file type and other details. |
| **People affected** | The requests whose result would change, by person, with masked email addresses. |
| **Time range** | The time window used. |

If nothing is found, the report says **No matching recent activity was found for this time range.**

:::note What replay uses
Replay uses the details recorded for each request, such as the app, the activity, the person and the data types found. It never uses prompt text. Department is not recorded, so rules that depend on department do not match in replay. A rule that looks for a specific data type within a category, such as Social Security Number, counts that type as unavailable in replay. Check those rules with **Try a situation**. Requests whose app or activity cannot be identified are skipped.

Replay compares each new result with the result recorded when the request was sent, which may have come from earlier settings or an earlier version. To see what your draft changes compared with the live rules, run the same check with **Live rules** and with **Unpublished changes** and compare the two reports.
:::

## Review and publish

Publishing makes your draft live as a new version. The review checks that your rules are valid and lists conflicts. It does not predict what devices will do, so [test your changes](#test-your-changes) first.

### Before you publish

- **The Policy Engine must be on.** See [Turn on, turn off and pause](./turn-on-off-and-pause).
- **You need the Update policies permission.** See [Permissions](#permissions).

### Publish your draft

1. Select **Review & publish** on the draft bar. You can also select **Publish changes** in a list header, or **Save & publish** in the policy editor.
2. Under **Changes**, check each policy that is added, changed or removed. Open **Technical source** only if you need the exact rule text.
3. Under **Conflicts this change creates**, check each rule that will stop deciding because another rule wins. Select **Open rule N**, **Open winning rule** or **Open policy** to fix a rule in the editor. See [Read the conflicts](#read-the-conflicts).
4. Under **Safety check**, wait for **These changes passed the safety check.** If it reads **Some changes need attention.**, fix each listed problem in the policy editor, then open the review again.
5. Under **Publish**, tick the confirmation if one is shown: **I've reviewed these conflicts and want to publish anyway**, or **Publish without a conflict check** if the check could not run.
6. Optional: in **Note (optional)**, say why you are publishing, in up to 500 characters. The note is saved with the version and shown in **History**.
7. Select **Publish changes**. To go back without publishing, select **Keep editing**.

The review header shows its state (**Checking…**, **Needs attention** or **Ready**) and counts such as **2 added · 1 edited · 1 removed**.

### What happens after you publish

- A message confirms **Endpoint Agent changes published** and names the version that is now live.
- Your draft is cleared.
- QuilrAI checks new requests against the new version right away. A request that was just blocked can stay blocked for up to 2 minutes if it is sent again unchanged. The console does not confirm when each device has applied the change. See [How long changes take to reach devices](./limits-and-behavior#how-long-changes-take-to-reach-devices).
- Lists can briefly show the previous version while the page refreshes.
- The publish is recorded in [Audit logs](../../console/settings-organization/audit-logs), with your note and the conflicts you confirmed.

### Read the conflicts

**Conflicts this change creates** compares the live version with your draft. It lists the rules that will stop deciding the outcome because another rule wins after you publish. For how rules win, see [How policies are evaluated](./how-policies-are-evaluated).

| What you see | What it means |
| --- | --- |
| **N rules won't work as written** (shown in red at the top) | Another rule always wins where these rules apply, one of their exceptions loses, or a looser rule wins because of how the policies' priorities are set. The headline can also read **N rules might not work as written**, or add **and M more might not**, when the result depends on details the check cannot settle. If any rule definitely won't work as written, you must confirm before you publish. |
| **N rules will be overridden in places** | Another rule wins in some of the places these rules apply. |
| **N rules will have their response set by other rules (risk still counts)** | Another rule decides the response, but these rules' risk still counts on the finding. |
| **N rules might be overridden** | Whether they lose depends on details the check cannot settle, such as group membership or data types. |
| **N rules now add nothing** | Other rules already do the same where these rules apply. |
| **Some rules in the policies you changed weren't checked for conflicts.** | The check could not read these rules. You must confirm before you publish. |
| **N rules check every coding tool** | These rules check only some apps under AI apps, but they check every coding tool. If you have permission, a **Limit to** button, such as **Limit to Cursor agent**, limits each rule to the coding tools of those apps. This note never blocks publishing. |
| **Not checked in coding tools** | A rule names an AI app, but no rule checks that app's coding tool. This is not a conflict, and it never blocks publishing. |
| **No new conflicts. Every rule you changed still decides where it applies.** | Nothing to review. |
| **Conflicts couldn't be checked right now** | Select **Check again**. To publish anyway, tick **Publish without a conflict check**. |

If you change the draft after you tick a confirmation, the tick is cleared and you must confirm again.

### Other messages in the review

| Message | What it means |
| --- | --- |
| **A Smart Group wasn't found. Publishing doesn't wait for this.** | A rule names a Smart Group that QuilrAI could not find, for example one that was deleted or renamed. Check the rule and [Smart Groups](../../console/settings-organization/smart-groups). |
| A suggested risk with **Use** | A rule has no risk set. Select **Use** to apply the suggestion. Suggestions are optional and never block publishing. |

### When you can't publish

Each message below shows in one of these places: the draft bar, the **Publish changes** button in a list header, or **Review & publish** (in the **Safety check** section or the footer).

| Message | Where it shows | What to do |
| --- | --- | --- |
| **Turn on the Policy Engine to publish.** | Draft bar, list header, **Safety check** | Turn the Policy Engine on. If you have permission, the banner in **Safety check** offers **Turn on**. |
| **The Policy Engine is off, so changes can't be published. Turn it on, then publish.** | **Safety check**, after you select **Publish changes** | The Policy Engine was turned off, for example by another admin. Turn it on, then publish. |
| **Needs Policy publish access** or **Needs Policy update access** | The first on the draft bar and list header, the second in **Safety check** | Ask an admin for the **Update policies** permission. |
| **The rule set is empty.** | Draft bar | Your draft has no rules. Add or restore at least one policy. |
| **Some changes need attention.** | **Safety check** | Fix each listed problem in the policy editor, then open the review again. |
| **The Policy Engine was turned on elsewhere. Updating this page…** | **Safety check** | Wait for the page to refresh. |
| **Checking for conflicts…** | Footer | Wait for the conflict check to finish. |
| **Confirm you've reviewed the conflicts to publish.** | Footer | Tick **I've reviewed these conflicts and want to publish anyway** under **Publish**. |
| **Confirm you want to publish without a conflict check.** | Footer | The conflict check could not run. Select **Check again**, or tick **Publish without a conflict check** under **Publish**. |
| **A newer version is live. Load it to publish.** | Footer | Load the newer version and make your changes again. See [When a newer version goes live](#when-a-newer-version-goes-live). |

:::note One invalid rule blocks every publish
The safety check covers all your policies together. A problem in any rule blocks saving and publishing, even for policies you did not change. For example, if a rule names a [custom detection](../../console/govern/custom-detections-and-library) that was later deleted, saves fail with a message such as **This policy can't be saved yet: unknown data type 'Project code'**. Fix that rule, or restore the detection.
:::

### Publish while enforcement is paused

You can publish while enforcement is paused. The new version keeps the pause, so every Sensitive data and Files rule keeps only monitoring until you select **Resume enforcement**. See [Publishing and restoring around a pause](./turn-on-off-and-pause#publishing-and-restoring-around-a-pause).

## Review version history

Open the **History** tab to see every published version. Select a version to read what it changed.

A version holds your Sensitive data and Files policies, and whether enforcement was paused. Skills, Apps, Accounts and Packages are not part of a version, so a restore does not change them.

### Read the version list

Each version shows its number, when it was published, who published it and a summary. The summary is the publish note, or a description such as **Published from Policy Engine**, **Restored from Version 3** or **Converted from the previous settings**.

The live version also shows when it went live and how many workstations are registered. The workstation count covers your whole fleet. It does not say how many devices use this version, and the console does not confirm when each device picks it up.

| Publisher shown | Meaning |
| --- | --- |
| A person's name (**You** for yourself) | The admin who published or restored the version in the console. **Technical details** shows their email address. |
| **Made automatically** | QuilrAI created the version, for example when you turned the Policy Engine on and your Endpoint settings were converted. |
| **Publisher not recorded** | The console has no record of who made the version. |

| Change type | Meaning |
| --- | --- |
| **Published** | Published from the draft. Pausing and resuming enforcement also create Published versions, with the summary **Enforcement paused** or **Enforcement resumed**. |
| **Restored** | An earlier version was restored. |
| **Converted** | Created when the Policy Engine was turned on, from your previous Endpoint settings. |
| **Regenerated after a settings change** | Created by QuilrAI after a change to your previous Endpoint settings in Console V1 updated the converted policies. |

The list shows 20 versions at a time. Select **Show N more** or **Load older changes** to see older versions.

### Compare versions

1. Select a version.
2. Under **Compare with**, choose **Previous version** or **Live version**.
3. Read the policy-by-policy differences. Open **Rule-level details** for the exact rule changes.

Each version also has:

- **Conflicts this version created**: the rules that started losing to other rules when this version was published.
- **Technical source**: the exact policy text of the version. Select **Download policy file** to save it.
- **Technical details**: **Published by**, **Change type** and **Checksum**.

While the Policy Engine is off, the version that was live when it was turned off is tagged **Kept · Policy Engine off**, and **Live version** reads **Kept version**. Turning the Policy Engine on creates a new version from your current Endpoint settings and keeps the policies your team wrote in this version. See [Turn on again after a Turn off](./turn-on-off-and-pause#turn-on-again-after-a-turn-off). You cannot restore a version until you turn the Policy Engine on.

## Restore an earlier version

Restoring makes an earlier version live again right away, as a new version. Your current version stays in **History**, so you can restore it later.

### Before you restore

- **The Policy Engine must be on.** See [Turn on, turn off and pause](./turn-on-off-and-pause).
- **You need the Update policies permission.** See [Permissions](#permissions).
- **The pause state must match.** A restore cannot change whether enforcement is paused. If the live version is paused and the version you restore is not, or the other way round, the restore is refused. Select **Resume enforcement** or **Pause enforcement** first, then restore.

### Restore a version

1. In **History**, select the version you want to restore.
2. Select **Review restore**. **Review & restore** opens.
3. Under **Changes**, check how the selected version differs from the live version.
4. Check the conflicts. If asked, tick **I've reviewed these conflicts and want to restore anyway**, or **Restore without a conflict check** if the check could not run.
5. Under **Safety check**, wait for **This version passed the safety check.**
6. Under **Restore**, read which new version number the rules will go live as.
7. Select **Restore this version**. To cancel, select **Keep current version**.

A message confirms **Earlier version restored**. The restore is recorded in [Audit logs](../../console/settings-organization/audit-logs).

If someone publishes while you review, nothing is restored. The review compares the selected version with the new live version instead. Check the changes again before you restore.

### When you can't restore

**Review restore** is not shown for the live version. When **Review restore** is greyed out, hold the pointer over it to see why. Inside **Review & restore**, a red banner under **Safety check** says why **Restore this version** is unavailable.

| Message | Where it shows | What to do |
| --- | --- | --- |
| **Turn on Policy Engine to restore an earlier version.** | **Review restore** | Turn the Policy Engine on. |
| **Needs Policy update access** | **Review restore**, **Review & restore** | Ask an admin for the **Update policies** permission. |
| **The live version is unavailable.** | **Review restore** | Refresh the page and try again. |
| **The selected version did not pass the safety check.** | **Review & restore** | The version cannot be restored as it is. Choose another version, or make the changes you need in your draft and publish them. |

### Restore one policy into your draft

To bring back one policy instead of a whole version, restore it into your draft. This changes nothing on devices until you publish.

1. In **All policies**, open the policy and select its **History** tab. **Versions that changed this policy** lists the versions that changed it.
2. Select a version. To see how it differs from your draft, select **Compare with your draft**.
3. Select **Restore this version**.
4. Select **Restore to draft** to replace your draft's copy of the policy, or **Restore & review** to also open **Review & publish**. To cancel, select **Keep current copy**.

Only that policy changes in your draft. Your other draft changes stay as they are. If **Restore this version** is unavailable, its message says why, for example **Your draft already has this version of the policy.**

## Permissions

| To | You need |
| --- | --- |
| See policies, use **Test** and see **History** | Access to the **Policy** page and the **Read policies** permission |
| Change your draft, publish, restore a version, or restore a policy into your draft | Also the **Update policies** permission |
| See the workstation count in **History** | The **Read users** permission |

Without **Update policies**, the page shows **Needs Policy update access** and you can only view. For every task, see [Permissions](./overview#permissions).

## Notes and limits

- **Only QuilrAI support can turn off the Policy Engine after you publish.** Once you publish, restore a version, or pause or resume enforcement, you can no longer turn it off yourself. To stop enforcement quickly, use **Pause enforcement**. See [Who can turn off](./turn-on-off-and-pause#who-can-turn-off).
- **Size limits.** All your policies together can hold up to 200 policies and 500 rules, with room kept for **Pause enforcement**. See [Size limits](./limits-and-behavior#size-limits).
- **Test sees less than a device.** **Try a situation** does not look up Smart Groups, department or **Application Monitoring**, and **Replay activity** has no department. Both cover Sensitive data and Files rules only. Check Skills, Apps and Accounts on a test device.

## Related pages

- [Endpoint Agent Policy Engine](./overview)
- [Policies and rules](./policies-and-rules)
- [How policies are evaluated](./how-policies-are-evaluated)
- [Turn on, turn off and pause](./turn-on-off-and-pause)
- [What users see and findings](./what-users-see-and-findings)
- [Limits and behavior to know](./limits-and-behavior)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
