---
sidebar_position: 2
sidebar_label: "Author, simulate and publish"
sidebar_custom_props:
  icon: Workflow
description: "Create gateway policy drafts, test situations, replay activity, publish changes and compare earlier versions."
console_path: [/policy/engine/llm-gateway, /policy/engine/mcp-gateway]
aliases: [drafts, revisions, rollback, simulate, simulation, replay recent traffic]
---

# Author, simulate and publish

Updated on 3 November 2026.

Use **Govern > Policy Engine > LLM Gateway** or **MCP Gateway** to move a change from a draft to live traffic. Saving a rule to the draft does not publish it.

## The loop

<StepFlow steps={[
  {label: "Draft", items: ["Open a control", "Choose a recipe", "Save to draft"]},
  {label: "Test", items: ["Try a situation", "Review deciding rules"]},
  {label: "Replay", items: ["Recent recorded activity"]},
  {label: "Publish", items: ["Review changes", "Publish together"]},
  {label: "Review", items: ["Activity", "Version history"]},
]} />

### 1. Open a control {#1-open-the-card}

On **Controls**, open the area you want to change. Read **What happens today**, the section default, and **How rules combine** before adding another rule. A recipe starts a form with a useful outcome selected; a blank rule starts without that setup.

### 2. Save a rule to the draft {#2-edit-into-the-shared-draft}

1. Choose a recipe or a section's add control.
2. Set **Applies to**. Use people, Smart Groups, applications, servers, models, or the other targeting fields that control supports. **Exclude something** carves a scope out of the rule.
3. Add conditions when needed. Every condition must match unless you change the joining logic or add an **either/or group**.
4. Choose what should happen and read **Reads as**. Check the priority explanation as well as the audience.
5. Use **More options** for the fields the form offers, such as severity, end date, or reason.
6. Select **Save to draft**. If the quick form cannot express the rule, use **Open in full editor** when available.

An application's shortcut list is not the whole catalog. Use **Search Application values** to open **Find application**, or the corresponding picker for another field. Some condition values accept patterns such as `*` and `?`; review the resulting condition rather than assuming every value is an exact catalog selection.

### 3. Validate

Fix errors against the fields the editor identifies. Read warnings separately. Validation establishes that the rule is valid, not that it affects only the traffic you intended.

### 4. Try a situation {#4-simulate}

Open **Test > Try a situation**. Check the label that says which rules are being tested, such as **Testing live rules**, before interpreting a result.

For the LLM Gateway, choose a **Person**, **Application**, **AI model**, and **Request type** as needed. **More details**, **Add detail**, and **Sensitive data types (optional)** let you provide the fields used by your conditions. **Test multiple situations** expands the test coverage.

![LLM Gateway Test with person, application, AI model and request type fields](/img/gateway-updates-2026-11/llm-policy-test.jpg)

For the MCP Gateway, describe **What is happening?**, then choose a **Person**, **MCP server**, and **Tool**. Add caller, route, and operation details as needed. Run the test and inspect both the outcome and the matching/deciding rules. A field you omit can change whether a condition matches.

### 5. Replay recent activity {#5-replay-recorded-traffic}

Select **Replay activity**, choose the **Time range**, and open **Advanced replay options** if you need to narrow the sample. Select **Run check** and compare what the rules would have done with the recorded outcomes.

![MCP Gateway Replay activity with time range and advanced replay options](/img/gateway-updates-2026-11/mcp-policy-replay.jpg)

Replay does not change live traffic. Use a representative sample that includes people who should match and people who should remain unaffected.

### 6. Review and publish {#6-publish}

Open **Review & publish** from the control panel. Review the pending changes and validation results, then publish when the tested behavior is correct. Pending changes publish together as the next version. Reopen **History** to confirm the new active version.

### 7. Watch the result {#7-watch-then-adjust}

Open the control's **Activity** tab and the gateway's [LLM Insights](../../llm-gateway/monitor/analytics-and-insights) or [MCP Insights](../../mcp-gateway/monitor/analytics-and-insights). Inspect matching traffic and [Findings & Interactions](../observe/findings-and-interactions). A configured-rule count is not a matched-request count.

### 8. Compare or restore an earlier version {#8-roll-back-if-needed}

**History** lists published versions, their time, and the recorded publisher or automatic reason. Select a version and compare it with the **Previous version** or **Live version**. The change summary shows added, removed, and updated policies; **Technical details**, **Technical source**, and **Source diff** provide more detail.

![LLM Gateway History with version list, publisher reasons and a change comparison](/img/gateway-updates-2026-11/llm-policy-history.jpg)

Restoring an earlier version republishes it as a new version and preserves the history. It changes policies, not classic app/server settings. See [What happens to classic settings](./switching-from-classic-settings#what-happens-to-classic-settings).

## Worked example: block secrets for contractors

1. In **Controls > Data & Adversarial Risks**, start a recipe for blocking sensitive data.
2. Choose the **Contractors** Smart Group, **Auth & Secrets**, the Request stage, and **Block**. Read the scope and priority, then save to the draft.
3. In **Test**, describe a matching contractor request with that detection and confirm it is blocked.
4. Describe a request from someone outside Contractors. Confirm the new rule does not change their outcome.
5. Replay recent traffic and inspect unexpected matches before publishing.
6. Review and publish, then check Activity. If needed, use History to restore the earlier version.

## Policies and technical source {#source-view-and-the-advanced-workspace}

**Policies** lists the live policies with their audience, outcome, and status. Use **Search policies**, **Filters**, and row details to find a policy. **Add rule** starts another policy; **Edit technical source** opens QuilrQL for conditions or effects the visual editor cannot express.

![LLM Gateway Policies with search, filters, scopes, outcomes and the technical source entry](/img/gateway-updates-2026-11/llm-policy-policies.jpg)

Use technical source for advanced conditions, review, or bulk work. Keep the same draft/test/review/publish discipline as visual edits.

## Permissions

| To | You need |
|---|---|
| Read policies, test, replay, or review conversion | Policy read access and access to the gateway |
| Save drafts, publish, restore, enable, or disable | Policy update access |

## Limits and practical notes

- Tests and replay evaluate the selected rule set; they do not change live behavior.
- Test both matching and non-matching cases when narrowing scope or adding an exemption.
- Use the combination rule on each section. Higher priority, list unions, intersections, and stricter ties apply to different settings.
- Review retained classic settings before disabling the engine. Published policy edits are not copied back into them.
