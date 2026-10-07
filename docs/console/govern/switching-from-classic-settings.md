---
sidebar_position: 3
sidebar_label: "Switching from classic settings"
sidebar_custom_props:
  icon: GitBranch
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

Attention items sort to the top. Activation needs an acknowledgement that the
settings screens will freeze, a second one when attention items exist, and a
final confirmation naming the gateway.

Confirming does three things at once:

1. Snapshots your complete legacy configuration.
2. Writes the converted document as **revision 1**.
3. Makes the engine authoritative for that gateway.

If your gateway build predates the comparison, the console reports
`detailed comparison unavailable` and will not offer activation. It never asks
you to switch blind.

## After the switch

Policy-owned settings freeze, and a governed change attempted there is
rejected.

| Gateway | Frozen once the engine is on | Still managed in Settings |
|---|---|---|
| LLM Gateway | Security Guardrails, Guardian Agent, Rate and Token Limits, Token Saving, Routing, Identity Aware (identity and conversation ID requirements), Prompt Store (store-prompt enforcement) | Applications, keys, providers and credentials, custom detections, alerts, self-service, audit |
| MCP Gateway | Tools, Guardrails, Token saving, Group & User Rules per server | Server register, connections, OneMCP operation, API tokens |

The LLM Gateway sections map to Policy Engine cards as listed in [App settings under the Policy Engine](./policy-engine#app-settings-under-the-policy-engine). Organization-wide prompts live in the [Global Prompt Store](../../llm-gateway/cost-and-traffic/prompt-store#global-prompt-store-v2-console), opened from the **Prompt Store and Enforcement** card.

:::warning Disabling is a rollback, not an undo
Disabling the engine restores the frozen snapshot exactly as it was at
activation. Work done under the engine is not translated back: the document
stays in revision history, but those changes do not reappear on the settings
screens. Treat disable as a rollback to the moment you switched, and use the
engine's own rollback for everything after.
:::

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
