---
sidebar_position: 5
sidebar_custom_props:
  icon: Target
---

# Custom Detections

Add your own detections to an app when the built-in [guardrail categories](./security-guardrails) do not describe what you need caught, such as an internal project codename, a customer ID format or competitor mentions.

Open the app's **Settings > Custom Detections** (under **Protection**).

![Custom Detections form with Precision (regex) selected, Detection ID, Display name, Code name, and Positive and Negative regex boxes](/img/llm-gateway/ui/app-custom-detections-precision.png)

## Detection types

| Type | How it matches | Use it for |
|------|----------------|------------|
| **Precision (regex)** | Deterministic regex matching, evaluated at the gateway on every call. | Identifiers with a fixed shape: employee IDs, ticket numbers, internal hostnames. |
| **Intent** | Semantic matching against a described intent, steered by examples. | Topics and phrasing that no regex can capture: competitor comparisons, requests for legal advice. |

## Fields

| Field | Applies to | Notes |
|-------|-----------|-------|
| **Detection enabled** | Both | Switch the detection off without deleting it. |
| **Detection ID** | Both | Reuse an existing ID to update that detection. |
| **Display name** | Both | Shown in the console. |
| **Code name** | Both | Stable machine name reported with findings. |
| **Positive regexes** | Precision | Comma-separated regexes that should match. |
| **Negative regexes** | Precision | Comma-separated regexes that must not match. A match here suppresses the finding. |
| **Intent description** | Intent | Plain-language description of what to detect. |
| **Positive examples** / **Negative examples** | Intent | Comma-separated prompts that should and should not match. |

## Create a detection

1. Choose **Precision (regex)** or **Intent**.
2. Enter a new **Detection ID**, a **Display name** and a **Code name**.
3. Add the regexes, or the intent description and examples.
4. Select **Save detection**.

**Save detection applies the change immediately.** It does not wait for the app's **Save settings** button, and it is recorded in the app's [Audit Log](./audit-log).

:::tip Writing good examples
For intents, add negative examples that are close to the positive ones. A detection for "competitor pricing questions" needs negatives such as "what is our own pricing?" to stay precise.
:::

## Custom detections and the Policy Engine

Custom Detections stay editable in app settings when the Policy Engine is on. In a policy, custom detections appear under the **Custom** group of the data type picker, so a data rule can give them their own action. See [LLM Gateway Policies](../../policy-engine/llm-gateway#new-data-rule).

## Related

- [Security Guardrails](./security-guardrails) - built-in categories and precision detections.
- [SDK Mode](./sdk-mode) - run the same detections from your own code.
