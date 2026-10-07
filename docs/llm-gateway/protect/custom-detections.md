---
sidebar_position: 2
sidebar_label: "Custom detections"
sidebar_custom_props:
  icon: Target
---

# Custom detections

Add your own detections to an app when the built-in [guardrail categories](./security-guardrails) do not describe what you need caught, such as an internal project codename, a customer ID format or competitor mentions.

## Add one to an app

Custom detections are defined per app. Open the app from **Settings > AI Gateway > LLM Gateway** and choose any **Configure** option to open the app workspace's **Settings** tab, then select **Custom Detections** under **Protection**.

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

**Save detection applies the change immediately.** It does not wait for the app's **Save settings** button, and it is recorded in the app's [Audit Log](../monitor/app-audit-log).

:::tip Writing good examples
For intents, add negative examples that are close to the positive ones. A detection for "competitor pricing questions" needs negatives such as "what is our own pricing?" to stay precise.
:::

## Going further with the Policy Engine

Custom detections stay editable in app settings when the Policy Engine is on; they do not freeze (see [Switching from classic settings](../../console/govern/switching-from-classic-settings)). In the **Data & Adversarial Risks** card, they appear under the **Custom** group of the data type picker, so a data rule can give them their own action, threshold, stage and scope. For example, block a project codename only for one Smart group, or only on requests to one provider. See [Security guardrails](./security-guardrails#going-further-with-the-policy-engine).

Tenant-wide detectors and the shared detection library are managed in the console's Detection Models. See [Custom detections and library](../../console/govern/custom-detections-and-library).

## Related

- [Security guardrails](./security-guardrails) - built-in categories and precision detections.
- [SDK mode](../apps-and-providers/sdk-mode) - run the same detections from your own code.
