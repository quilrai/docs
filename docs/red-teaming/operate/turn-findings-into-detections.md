---
sidebar_position: 3
sidebar_label: "Turn findings into detections"
sidebar_custom_props:
  icon: Fingerprint
---

# Turn findings into detections

Agentic and Model Red Teaming reports do more than list what broke. The **Remediation** section of each report suggests controls that would stop the same attacks in production. This page explains where each suggestion goes.

<StepFlow
  steps={[
    { label: 'Report', items: ['Findings', 'Remediation section'] },
    { label: 'Apply', items: ['Prompt hardening', 'Guardian Agent prompt', 'Custom detections'] },
    { label: 'Verify', items: ['Apply & verify with the guardrail', 'Re-run the assessment'] },
    { label: 'Track', items: ['Track findings', 'Close when fixed'] },
  ]}
/>

## What the report suggests

| Suggestion | What you get | Where it goes |
|------------|--------------|---------------|
| **Prompt hardening suggestions** | Key changes and recommended system-prompt guardrails, generated from the findings, with a copy button | The target's own system prompt (your agent, or the system prompt on the model form) |
| **Guardian Agent prompt** | An agent purpose and Do / Don't rules, with suggested settings | The [Guardian Agent](../../llm-gateway/protect/guardian-agent) on the LLM Gateway app in front of the target |
| **Custom detection suggestions** | Per control: an action (for example BLOCK or MONITOR), a control type, a rationale, and patterns to add | A custom detection in **Govern › Detection Models**, then used in a policy. See [Custom detections and library](../../console/govern/custom-detections-and-library). |

Some runs also suggest a **Token Limit** control, for example to cap oversized extraction requests.

## Add a suggested detection

1. In the report, open **Remediation** and copy the patterns from a custom detection suggestion.
2. Go to **Govern › Detection Models**, open the **Custom** view, and create a detection with those patterns (or describe it in the **Detection Model builder**). Test it before saving.
3. Use the detection in a control on the [Policy Engine](../../console/govern/policy-engine) for the surface that reaches the target, with the action the report suggested.

## Verify the fix

Click **Apply & verify with the guardrail** in the report to re-run the assessment with Quilr's guardrail in front of the target and compare before/after grades. After you change the prompt or add detections, re-run the assessment (or let a [schedule](./runs-findings-and-schedules#schedules) do it) and close the finding in the [findings tracker](./runs-findings-and-schedules#findings-tracker).

:::note
These suggestions come from Agentic and Model Red Teaming reports. For LLM Intelligence Assessment runs, use the **Guardian counterfactual** (residual failures and potential over-blocks) to tune Guardian policy instead. See [Reading a report](../get-started/reading-a-report#guardian-counterfactual).
:::
