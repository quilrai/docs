---
sidebar_position: 5
sidebar_custom_props:
  icon: Workflow
---

# Authoring and Publishing

Draft, prove and publish a policy revision.

## The loop

<StepFlow steps={[
  { label: "Draft", items: ["Sentence editor", "Scope shortcuts", "Source view"] },
  { label: "Validate", items: ["Compile diagnostics", "Errors and warnings"] },
  { label: "Simulate", items: ["Up to 100 synthetic cases", "Decision evidence"] },
  { label: "Replay", items: ["Recorded traffic", "Up to 90 days, 5,000 requests"] },
  { label: "Publish", items: ["One immutable revision", "Concurrency guarded"] },
]} />

### 1. Open the workspace

The control surfaces show what is live. Select one and it expands with the
sentence editor inline.

### 2. Write the sentence

Pick the stage and priority, scope it with the shortcuts, then add conditions
and effects from the pickers. One picker searches everything at once: type a
person, application, Smart Group or detection name and the console fills in the
matching field, operator and value. There is no syntax to remember and no way
to enter a value that would fail validation.

Anything too complex for the sentence editor stays byte-preserved under
**Advanced policies** and remains editable in source view.

### 3. Validate

Problems are reported against the exact field that caused them, with warnings
kept separate from errors.

### 4. Simulate

Run up to 100 synthetic cases against your draft and read the engine's actual
decision evidence: which rules matched, on which stage, and the call-level
outcome.

:::tip
A policy validating, or appearing to be in scope, is not evidence of the
outcome. Simulation is the only thing that reports the engine's real decision.
:::

### 5. Replay recorded traffic

Evaluate the draft against traffic that already happened, up to 90 days back
and up to 5,000 requests for the LLM Gateway. This is how you find the rule
that would have blocked more than you intended.

### 6. Publish

All pending changes publish together as one immutable revision. Drafts carry a
concurrency guard, so a colleague's publish cannot be silently overwritten.

### 7. Watch, then adjust

The activity view rolls up governed calls, blocked calls and tokens saved over
the last 7 or 30 days.

### 8. Roll back if needed

History lists every published revision with its checksum. Rolling back
republishes an earlier document as a new revision, so the timeline only moves
forward and an incident stays fully auditable.

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
