---
sidebar_position: 4
sidebar_label: "Detection Models"
sidebar_custom_props:
  icon: Fingerprint
---

# Detection Models

Detection Models define what counts as sensitive data or an adversarial prompt. Policies and controls refer to these detections by name, so this page is where you decide what Quilr looks for, and how risky each finding is by default.

![Detection Models in the console](/img/console-v2/pages/detection-models.jpg)

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

Each category row shows how many subcategories it contains, its **Risk level** (**None**, **Low**, **Medium** or **High**), a **View & test** action and an enable toggle. Expanding a category shows each subcategory with a **priority** of **Low**, **Medium** or **High**.

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

"Risk level" means different things in different places. Check which one you are looking at.

| Where | UI label and values | What it does |
|---|---|---|
| **Data Risks > Contextual**, per category | **Risk level**: None, Low, Medium, High | A detection threshold, not a severity. It decides which subcategory priorities are detected: **None** detects nothing, **Low** only High-priority subcategories, **Medium** High and Medium, **High** all three. |
| **Data Risks > Contextual**, per subcategory | **priority**: Low, Medium, High | How strong a signal the subcategory is. Combined with the category's risk level above. |
| **AI Adversarial Risks**, per technique | Risk level badge | The default severity of that technique. Shown for reference. |
| LLM Gateway app **Guardrails** tab | **Risk level** per category, with sub-category sensitivity | The same threshold model as Contextual, set per app. See [Risk level and sub-category sensitivity](../../llm-gateway/protect/security-guardrails#risk-level-and-sub-category-sensitivity). |
| Policy Engine rule effect | **Risk level**: `very_low` to `very_critical` | The severity assigned to a matching call. It only climbs: a call takes the highest level any matching rule sets. |

Example: PII has **Risk level** set to **Low**, and its name subcategory has priority **Low**. A prompt containing only a person's name is not detected as PII at all, so no Policy Engine rule on PII matches it. Raise the category to **High** and the name is detected; a rule with **Risk level** `high` on PII then marks that call as high risk.

When the same category's risk level is set in more than one place, an LLM Gateway app's own **Guardrails** setting wins over the organization-wide **Detection Models** setting. When the Policy Engine is enabled, the policy wins.

None of these levels choose the action. Monitor, redact or block always comes from the policy or control.

## View & test

**View & test** opens a category or group so you can see what it covers and try sample text against it before you rely on it in a policy. Test with synthetic data, never real customer or employee records.

## How detections are used

- **LLM Gateway and MCP Gateway**: the **Data & Adversarial Risks** card in the [Policy Engine](./policy-engine) picks detections by category or individual type and assigns an action per stage.
- Findings in [Findings & Interactions](../observe/findings-and-interactions) name the detection that fired.

## Related

- [Custom detections and library](./custom-detections-and-library)
- [LLM Gateway security guardrails](../../llm-gateway/protect/security-guardrails)
- [MCP Gateway security guardrails](../../mcp-gateway/protect/security-guardrails)
