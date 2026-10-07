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

### 3. Validate

Problems are reported against the exact field that caused them, with warnings
kept separate from errors.

### 4. Simulate

Use **Describe a request** (MCP: **Describe a call**) to see the winning value per control for one request. For more coverage, run up to 100 synthetic cases against your draft and read the engine's actual decision evidence: which rules matched, on which stage, and the call-level outcome.

:::tip
A policy validating, or appearing to be in scope, is not evidence of the
outcome. Simulation is the only thing that reports the engine's real decision.
:::

### 5. Replay recorded traffic

Evaluate the draft against traffic that already happened, up to 90 days back
and up to 5,000 requests for the LLM Gateway. This is how you find the rule
that would have blocked more than you intended.

### 6. Publish

Review the draft, then publish. All pending changes publish together as the next numbered revision, shown as **Revision N** in the header. Drafts carry a concurrency guard, so a colleague's publish cannot be silently overwritten.

### 7. Watch, then adjust

The activity view rolls up governed calls, blocked calls and tokens saved over
the last 7 or 30 days.

### 8. Roll back if needed

**History** lists every published revision with its checksum. Rolling back
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
