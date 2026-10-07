---
sidebar_position: 4
sidebar_label: "Detection Models"
sidebar_custom_props:
  icon: Fingerprint
---

# Detection Models

Detection Models define what counts as sensitive data or an adversarial prompt. Policies and controls refer to these detections by name, so this page is where you decide what Quilr looks for, and how risky each finding is by default.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Detection Models']} />

The page has two tabs: **Data Risks** and **AI Adversarial Risks**.

## Data Risks

Data Risks has two views:

| View | Contains |
|---|---|
| **Out-of-the-box** | Built-in detections, split into **Contextual** and **Non-contextual** |
| **Custom** | Your own detection models. See [Custom detections and library](./custom-detections-and-library). |

### Contextual

Contextual detections use the surrounding text to decide whether something is sensitive. They are grouped into categories such as:

- PII (personally identifiable information)
- PHI (protected health information)
- PFI (payment and financial information)
- PCI (protected card information)
- Insurance Data
- Auth & Secrets
- Code Scripts and Queries

Each category row shows how many subcategories it contains, its **risk level**, a **View & test** action and an enable toggle.

### Non-contextual

Non-contextual detections match well-defined entities by format, for example SSN, Aadhaar, PAN, passport number, phone number, email address, IBAN, UPI ID, card number and CVV. Each entity has an **Enabled** toggle.

## AI Adversarial Risks

Adversarial detections look for attacks on the model rather than sensitive data. They are grouped by technique:

| Group | Techniques |
|---|---|
| Prompt Injection | 6 |
| Jailbreak | 6 |
| Prompt Context Corruption | 1 |
| Semantic Adversarial Prompts | 3 |
| Social Engineering Prompts | 2 |
| Response Risks | 8 |

Each group shows its risk level, **Show techniques** to list the individual techniques, and **View & test**.

## Risk levels

Every category and adversarial group carries a default risk level: **None**, **Low**, **Medium** or **High**. The risk level is reported on findings and used for ranking in dashboards, exports and alerts. A policy can raise the risk of a call further, but the action taken (monitor, redact, block) comes from the policy or control, not from the risk level.

## View & test

**View & test** opens a category or group so you can see what it covers and try sample text against it before you rely on it in a policy. Test with synthetic data, never real customer or employee records.

## How detections are used

- **LLM Gateway and MCP Gateway**: the **Data & Adversarial Risks** card in the [Policy Engine](./policy-engine) picks detections by category or individual type and assigns an action per stage.
- Findings in [Findings & Interactions](../observe/findings-and-interactions) name the detection that fired.

## Related

- [Custom detections and library](./custom-detections-and-library)
- [LLM Gateway security guardrails](../../llm-gateway/protect/security-guardrails)
- [MCP Gateway security guardrails](../../mcp-gateway/protect/security-guardrails)
