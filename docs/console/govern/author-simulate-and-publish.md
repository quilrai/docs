---
sidebar_position: 2
sidebar_label: "Author, simulate and publish"
sidebar_custom_props:
  icon: Workflow
description: "The draft, validate, simulate, replay, publish and roll back loop, plus permissions and engine limits."
---

# Author, simulate and publish

How a change moves from a draft to a live revision on the **LLM Gateway** and **MCP Gateway** tabs of the [Policy Engine](./policy-engine). The Browser Extension and Endpoint Agent tabs do not use this draft workflow.

## The loop

<StepFlow steps={[
  { label: "Draft", items: ["Configure a card", "Shared draft"] },
  { label: "Validate", items: ["Errors", "Warnings"] },
  { label: "Simulate", items: ["Describe a request", "Synthetic cases"] },
  { label: "Replay", items: ["Recorded traffic"] },
  { label: "Publish", items: ["Numbered revision", "History"] },
]} />

### 1. Open the card

Each card shows what is live. Select **Configure** to edit it in place. Scope shortcuts add a User, Smart group or Application condition with a seeded priority (900, 700 and 600), so a narrower scope wins without you choosing numbers.

### 2. Edit into the shared draft

Every edit, from every card and every admin, collects in one shared draft. Pickers are backed by your real catalogs (people, applications, Smart Groups, detections), so you cannot enter a value that would fail validation. Anything too complex for a card stays byte-preserved under **Advanced policies** and remains editable in source view.

Conditions are built from a field, an operator and a value. Operators adapt to the field: `is`, `is not`, `is any of`, `is none of`, `is set`, `is not set`, `contains`, `starts with`, `ends with`, `matches pattern`, `is inside CIDR`, `includes (ignoring case)`, `has entry` and `has count`. **Data found** takes `is any of`, `is all of` or `is none of`, with an optional occurrence threshold.

- Rows join with `and` or `or`, and an any-of group nests a bracketed set of alternatives inside the sentence.
- On a card, every **Applies to** chip must match (AND), and values accept `*` and `?` wildcards. For "A or B", add a second configuration or an any-of group.

### 3. Validate

Problems are reported against the exact field that caused them, with warnings
kept separate from errors.

### 4. Simulate

Use **Describe a request** (MCP: **Describe a call**) to see the winning value per control for one request. Leave **API surface** empty and the request simulates as `chat`; **Add detection** reports a data type as found, with a count per type. For more coverage, run up to 100 synthetic cases against your draft and read the engine's actual decision evidence: which rules matched, on which stage, and the call-level outcome.

:::tip
A policy validating, or appearing to be in scope, is not evidence of the
outcome. Simulation is the only thing that reports the engine's real decision.
:::

### 5. Replay recorded traffic

Evaluate the draft against traffic that already happened, up to 90 days back
and up to 5,000 requests for the LLM Gateway. This is how you find the rule
that would have blocked more than you intended.

### 6. Publish

Review the draft, then publish. On the LLM Gateway, publish takes a message; on the MCP Gateway it takes no message, and drafts can be renamed. All pending changes publish together as the next numbered revision, shown as **Revision N** in the header. Drafts carry a concurrency guard, so a colleague's publish cannot be silently overwritten.

### 7. Watch, then adjust

The activity view rolls up governed calls, blocked calls and tokens saved over
the last 7 or 30 days.

### 8. Roll back if needed

**History** lists every published revision with its checksum. Rolling back
republishes an earlier document as a new revision, so the timeline only moves
forward and an incident stays fully auditable.

## Source view and the Advanced workspace

Every policy has an exact text form in QuilrQL, the policy language. The `</>` toggle switches between the sentence editor and source in both directions. You need source only for review, diffing or bulk work.

```
policy block_request_secrets priority 900 {
  request
  data_type ("Auth & Secrets")
  then {
    dlp.action = block;
    risk.level = critical;
  }
}
```

**Advanced policies > Advanced workspace** opens the source-level editor for the whole document:

1. **New draft from active revision** clones the live revision into a named draft.
2. Edit with the visual builder (one policy at a time) or the full QuilrQL source. **Suggested policies** inserts ready-made rules, and **Insert from catalog** inserts exact values for users, apps and more.
3. **Save draft** explicitly. Validation and publication run only against the saved source.
4. **02 Analyze** runs **Diagnostics**, **Simulation** and **Historical Try** against the candidate, then publish the revision.

## Permissions

| To | You need |
|---|---|
| Read the workspace, validate, simulate, replay, preview conversion | Policy read access, plus gateway credentials in the session |
| Create drafts, publish, roll back, enable, disable | Policy update access |

## Limits and practical notes

| Topic | Detail |
|---|---|
| Document size | Up to 400,000 characters per document, which is thousands of policies in practice |
| Data types | Up to 64 per rule and 256 per document |
| Simulation | Up to 100 synthetic cases per run |
| Replay | LLM Gateway up to 90 days and 5,000 requests; MCP Gateway filters by window, MCP, tool, user and route |
| Activity window | 7 or 30 days |
| Activity attribution | The LLM Gateway rollup reports tenant totals. Per-policy match counts are not attributed in LLM traffic logs, so use simulation and replay for per-policy behaviour. The MCP Gateway does attribute per policy. |
| Naming | Observed history is keyed by policy name. Renaming a live policy starts its history over, so prefer editing in place. |
