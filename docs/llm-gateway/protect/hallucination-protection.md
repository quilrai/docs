---
sidebar_position: 4
sidebar_label: "Hallucination protection"
sidebar_custom_props:
  icon: Target
description: "Flag or act on responses that are likely fabricated: the per-app Hallucination check in Guardrails, and the Policy Engine card for confidence thresholds and actions."
console_path: []
aliases: ["hallucination protection"]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Hallucination protection

Updated on 3 November 2026.

Score model responses for hallucinations and monitor or block them above a confidence threshold. Runs at the response stage.

## Configure this control

Choose the mode used by your gateway. When the Policy Engine is on, published rules govern this control; classic values saved through **Edit anyway** apply only after the engine is disabled. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

### Classic hallucination check

Open **Settings > AI Gateway > LLM Gateway > your app > Configure > Guardrails**, then use [Hallucination check](./security-guardrails#hallucination-check). This app setting uses a fixed threshold of 0.8. For a tunable threshold or scoped exceptions, use the Policy Engine.

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Where it is configured {#where-it-is-configured}

Open **Govern > Policy Engine > LLM Gateway > Controls > Hallucination Protection**. Start from a recipe or a section's add menu, choose **Applies to**, set protection or a tag rule, then **Save to draft**. Test the rules before **Review & publish**. The policy sections and settings are described below.

</TabItem>
</Tabs>

## Sections {#sections}

| Section | What it does | Empty state |
|---|---|---|
| **Protection** | Switch, threshold, action and risk level. Use a recipe or the section add menu. | Responses are not checked for hallucinations. |
| **Tag findings** | Follow-up rules that tag a severity on the detection result. Use the section add menu. | Nothing is tagged on the detection result. |

Applies on `bedrock`, `chat`, `responses` and `vertex`, and only to **non-streaming** responses. Streaming responses cannot be blocked, so they are not checked.

## Settings {#settings}

Open a recipe or the add menu in **Protection** to set:

| Setting | Options | Default | Notes |
|---|---|---|---|
| Protection | On, Off | On | Off exempts the scope only when its rule outranks a matching On rule. |
| Threshold | 0 to 1, step 0.05 | 0.8 | Lower catches more, with more false positives. |
| When flagged: action | Monitor, Block | Monitor | Block replaces the response with a refusal. |
| When flagged: risk level | Low, Medium, High | Medium | Tags the hallucination itself. |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Applies to the whole request. Reported only. |

### Follow-up rules {#follow-up-rules}

Open the add menu in **Tag findings** to set a follow-up rule. **When** is one of: **a hallucination is detected**, **the score is at least** (0 to 1), or **the risk level is** (Low, Medium, High). The rule then tags a severity. The highest severity among matching rules is reported.

## Scoping and advanced scenarios {#scoping-and-advanced-scenarios}

- **Applies to**: Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Tool, Source network, or **Except...**.
- **Threshold**: the **lowest positive** matching threshold applies, whatever its priority. A narrower scope cannot raise that threshold; a value of zero is treated as no threshold.
- **Action and risk level** follow the highest-priority matching configuration.
- **On/Off, action and rating** use highest priority; On, Block and the higher rating win equal-priority ties. An Off exception must outrank the On rule.
- Need to key protection off attachment types, streaming or a metadata field? Use **Add configuration**.

For example, block likely hallucinations for one customer-facing app while the rest of the tenant only monitors, or set a lower (stricter) threshold for one Smart group. Start at Monitor, then move the action or the threshold:

<PolicyCard
  name="monitor_high_confidence_hallucinations"
  stage="response"
  priority={500}
  when={[
    { field: "Application method type", op: "is any of", values: ["chat", "responses", "bedrock", "vertex"] },
  ]}
  then={[
    { effect: "Hallucination check", value: "true" },
    { effect: "Hallucination threshold", value: "0.82" },
    { effect: "Hallucination risk level", value: "high" },
    { effect: "Hallucination action", value: "monitor" },
  ]}
/>

## Related {#related}

- [Security guardrails](./security-guardrails) - the basic per-app hallucination check.
- [Policy Engine overview](../../console/govern/policy-engine)
