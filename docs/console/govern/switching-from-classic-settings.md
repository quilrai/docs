---
sidebar_position: 3
sidebar_label: "Switching from classic settings"
sidebar_custom_props:
  icon: GitBranch
description: "The conversion review, activation, what happens to classic settings on publish, rollback, Edit anyway and disable, and a recommended first rollout."
---

# Switching from classic settings

How a gateway moves from its classic per-app settings screens to the [Policy Engine](./policy-engine).

## The two authorities

The LLM Gateway and the MCP Gateway are each governed **either** by their classic per-application settings **or** by the Policy Engine, never by both. Each has its own switch, so turning on the LLM Gateway engine changes nothing for the MCP Gateway. When a gateway is on the engine, its Policy Engine tab shows **ENGINE ON**.

The Endpoint Agent tab runs in **Basic policies** mode and offers its own **Convert to Policy Engine** button.

## The conversion review

Nothing converts silently. The workspace stays idle until you start a review,
which asks the gateway for a read-only **conversion preview**: your settings,
machine-translated, with a before-and-after comparison. Nothing changes and
nothing is published.

The review has three altitudes:

- **A digest** - scopes reviewed, policies generated, settings preserved
  unchanged, and items needing attention.
- **A generated-rule ledger** - every rule the new document contains, by
  application, by people or Smart Group scope, and by what it does. Each names
  the legacy scope it came from.
- **Comparison cards** - per application, and per user or Smart Group override
  beneath it, two columns of plain-language facts: current behaviour against
  behaviour under the policy engine, each marked `preserved`, `changed` or
  `needs attention`.

### What the LLM Gateway conversion compares

Base and Smart Group behaviour for detection categories and actions; models and
routing; rate, token and timeout limits; identity and network controls;
Guardian and Hallucination enablement; and the other governed settings the
engine can express. Duplicate application names and anything unrepresentable
are raised as attention items, never converted quietly.

Your per-category settings arrive as ordinary readable rules: one data rule per
action, each naming its data types. There is no opaque settings blob to
decipher, so you can review the generated document line by line and edit it
afterwards in the sentence editor. Every generated rule for one application or
group shares a priority, so a monitor override on one category can never
suppress a block on another.

### What the MCP Gateway conversion compares

Tenant-wide Smart Mode and Memory, plus each backend's access, capabilities,
tool controls, request and response DLP, scoped overrides, token saving, claims
and cache behaviour, Web Search and managed-auth presence. Capability-source
fallbacks and unconvertible categories are attention items.

:::note What the review will never show you
Comparison facts are content-safe by construction: no credentials, keys or
tokens, no provider secrets or settings, no raw prompts or Guardian prompt
text, no internal snapshots. Managed authentication appears only as present or
absent, and a response carrying anything of that shape is rejected rather than
displayed.
:::

## Activation

Attention items sort to the top. Activation needs an acknowledgement that legacy
settings will be frozen (locked) while the engine is on, a second one when attention items exist, and a
final confirmation naming the gateway.

Confirming does three things at once:

1. Records a snapshot of your complete legacy configuration as the conversion
   input. Disabling does not restore this snapshot; see
   [What happens to classic settings](#what-happens-to-classic-settings).
2. Writes the converted document as a revision (**revision 1** the first time).
3. Makes the engine authoritative for that gateway.

If your gateway build predates the comparison, the console reports
`detailed comparison unavailable` and will not offer activation. It never asks
you to switch blind.

## After the switch

The governed sections of the settings screens lock and show **Controlled by Policy Engine**. Their values stay stored exactly as they were at activation, but live traffic follows published policies instead.

| Gateway | Locked once the engine is on | Still managed in Settings |
|---|---|---|
| LLM Gateway | Security Guardrails, Guardian Agent, Rate and Token Limits, Token Saving, Routing, Identity Aware (identity and conversation ID requirements), Prompt Store (store-prompt enforcement) | Applications, keys, providers and credentials, custom detections, alerts, self-service, audit |
| MCP Gateway | Tools, Guardrails, Token saving, Group & User Rules per server | Server register, connections, OneMCP operation, API tokens |

The LLM Gateway sections map to Policy Engine cards as listed in [App settings under the Policy Engine](./policy-engine#app-settings-under-the-policy-engine). Organization-wide prompts live in the [Global Prompt Store](../../llm-gateway/cost-and-traffic/prompt-store#global-prompt-store-v2-console), opened from the **Prompt Store and Enforcement** card.

## What happens to classic settings

This table is the reference for every page that mentions classic settings under the Policy Engine. It applies to the LLM Gateway and the MCP Gateway separately.

| Event | Stored classic settings | What live traffic follows | Policy history |
|---|---|---|---|
| Engine off (classic mode) | Editable as normal | Classic settings | None, or revisions from an earlier period on the engine |
| **Enable** (activation) | Kept as they were and locked | The converted document | Conversion becomes a new revision (revision 1 the first time) |
| Card edits | Unchanged | The live revision | Edits collect in the shared draft only |
| **Publish** a draft | Unchanged | The new revision | Next numbered revision |
| **Rollback** to an earlier revision | Unchanged | The republished revision | The earlier document is republished as a new revision |
| **Edit anyway**, then save | The saved values replace the stored ones | Still the live revision; the saved values are not enforced and are not added to policies | Unchanged |
| Management API write to a governed field | Saved, with an `inactive_under_quilrql` warning in the response | Still the live revision | Unchanged |
| **Disable Policy Engine** | Become live again, as currently stored | Classic settings | Kept in the revision store; not applied |
| **Enable** again later | Kept as they are now and locked | A fresh conversion of the current settings | The fresh conversion becomes a new revision; it does not resume your last published revision |

In short: on disable, the classic settings resume as they are stored at that moment, which is the activation values plus anything saved since through **Edit anyway** or the Management API. Work published in the engine is never copied back into the classic settings.

### Example

An LLM Gateway app has PII set to **Monitor** when you activate the engine.

1. You publish revision 2, which blocks PII for that app. Live traffic: block.
2. A colleague opens the app's Guardrails, chooses **Edit anyway** and saves PII as **Redact**. Live traffic: still block.
3. You disable the engine. Live traffic: **Redact**, the stored classic value. Neither the activation value (Monitor) nor the engine's block returns.

To return to the exact pre-activation behaviour after disabling, check each governed section and set it back by hand, or avoid **Edit anyway** while the engine is on.

## A recommended first rollout

1. **Tidy first.** Resolve duplicate application names and disable providers
   you no longer use. Attention items are far easier to fix before the review.
2. **Plan model prices.** Once the engine is on, spend budgets use the
   **Model pricing** section of the Budgets & Usage Limits card, so plan input
   and output prices for every model you route to. Spend budgets refuse requests without a
   price.
3. **Review, do not activate.** Read every attention item and both review
   views.
4. **Activate and change nothing.** Revision 1 is your current behaviour. Let
   it run for a few days and confirm the activity numbers match traffic you
   know.
5. **Add new controls on monitor.** Publish new detections and scopes with the
   action set to `monitor`. Nothing is blocked while you calibrate.
6. **Replay before you enforce.** Raise monitor to redact or block in a draft,
   replay 30 days of recorded traffic, and publish once the blocked set is the
   set you meant.
