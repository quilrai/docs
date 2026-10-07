---
sidebar_position: 4
sidebar_label: "Hallucination protection"
sidebar_custom_props:
  icon: Target
---

# Hallucination Protection

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../../console/govern/author-simulate-and-publish) a revision.
:::

Score model responses for hallucinations and monitor or block them above a confidence threshold. Runs at the response stage.

![Hallucination Protection card expanded with the response-stage banner, the Protection section and the After a hallucination is detected section](/img/policy-engine/llm-hallucination-protection-expanded.jpg)

## Sections

| Section | What it does | Empty state |
|---|---|---|
| **Protection** | Switch, threshold, action and risk level. **Add protection**. | Responses are not checked for hallucinations. |
| **After a hallucination is detected** | Follow-up rules that tag a severity on the detection result. **Add follow-up**. | Nothing is tagged on the detection result. |

Applies on `bedrock`, `chat`, `responses` and `vertex`, and only to **non-streaming** responses. Streaming responses cannot be blocked, so they are not checked.

## Settings

**Add protection** opens the **Hallucination protection** dialog.

| Setting | Options | Default | Notes |
|---|---|---|---|
| Protection | On, Off | On | Off exempts the scope from a broader configuration that switched it on. |
| Threshold | 0 to 1, step 0.05 | 0.8 | Lower catches more, with more false positives. |
| When flagged: action | Monitor, Block | Monitor | Block replaces the response with a refusal. |
| When flagged: risk level | Low, Medium, High | Medium | Tags the hallucination itself. |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Applies to the whole request. Reported only. |

### Follow-up rules

**Add follow-up** opens **Hallucination follow-up**. **When** is one of: **a hallucination is detected**, **the score is at least** (0 to 1), or **the risk level is** (Low, Medium, High). The rule then tags a severity. The highest severity among matching rules is reported.

## Example

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

Start at `monitor`, then move the action or the threshold.

## Scoping and precedence

- **Applies to**: Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Tool, Source network, or **Except...**.
- **Threshold**: the **lowest** matching threshold applies, whatever its priority. A narrower scope cannot raise the threshold set for Everyone.
- **Action and risk level** follow the highest-priority matching configuration.
- **Off** on a narrower scope beats **On** for Everyone.
- Need to key protection off attachment types, streaming or a metadata field? Use **Add configuration**.

## Legacy app setting

Replaces the [Hallucination check](./security-guardrails#hallucination-check) in an app's Security Guardrails.
