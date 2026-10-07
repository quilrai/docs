---
sidebar_position: 1
sidebar_label: "Security guardrails"
sidebar_custom_props:
  icon: ShieldCheck
---

# Security Guardrails

Detect sensitive data and adversarial input in prompts and responses, then monitor, redact or block it.

Open **Settings > LLM Gateway**, choose an app, then **Settings > Security Guardrails** (under **Protection**). The section has six parts:

| Part | What it does |
|------|--------------|
| [Default action](#actions) | The action used where a category does not set its own. |
| [Data risks](#data-risks) | Sensitive data such as PII, PHI, card data and secrets. |
| [Adversarial risks](#adversarial-risks) | Prompt injection, jailbreaks and harmful content. |
| [Precision detections](#precision-detections) | Exact-match identifiers such as SSN, Aadhaar or IBAN. |
| [Hallucination check](#hallucination-check) | Flags responses that score as likely fabricated. |
| [Source IP restrictions](#source-ip-restrictions) | Accepts calls only from listed networks. |

:::note Policy Engine
When the tenant-wide Policy Engine is on, guardrail policies decide what happens on live requests, and this section shows app settings that are not enforced. See [App settings under the Policy Engine](../../console/govern/policy-engine#app-settings-under-the-policy-engine).
:::

## Defaults for a new app

**Create App** has no guardrail step. Every new app starts with these guardrails, which you can then change in this section:

| Setting | Default |
|---------|---------|
| Default action | **Monitor** |
| Data risks | All 6 on: PII, PHI, PFI, PCI, Insurance data, Authentication secrets |
| Adversarial risks | 12 of 13 on. **Malicious scripts** is off (opt-in). |
| Data risk scope | Request and response |
| Precision detections, hallucination check, source IP restrictions | Off |
| Guardian Agent (dependency security check, latest-version suggestions, task adherence) | Off. See [Guardian Agent](./guardian-agent). |

![Create App step 2 with the data risk and adversarial risk toggles, Malicious scripts switched off, and the Guardian Agent toggles below](/img/llm-gateway/ui/create-app-step2-guardrail-categories.jpg)
<!-- TODO-SCREENSHOT: retake or replace, shows the old Create App guardrails step, which no longer exists -->

Because the default action is Monitor, a new app records detections without changing traffic. Review findings in the app's **Activity > Findings** view before you change any category to Redact or Block.

## Actions

![Action mix panel counting categories per action, next to the Default action selector set to Monitor](/img/llm-gateway/ui/app-guardrails-action-mix-default-action.png)

| Action | What happens | Available on |
|--------|--------------|--------------|
| **Monitor** | The request passes unchanged and the detection is logged. | All categories |
| **Partial redact** | Masks part of each detected value and forwards the rest. | Data risks, precision detections |
| **Redact** | Replaces each detected value and forwards the request. | Data risks, precision detections |
| **Block** | Rejects the whole request. | All categories |

- **Adversarial risks and the hallucination check support Block or Monitor only.** There is no value to redact.
- **Action resolution:** the category's own action takes precedence, then the app's default action, then Monitor.
- **Set everything to default** clears per-category actions so every category follows the default action.
- The **Action mix** panel counts how many of the 20 categories (7 data + 13 adversarial) use each action or are off.

## Data risks

![PII category detail with Risk level High, Applies to Request and response, Action Monitor, and the sub-category list with per-item sensitivity](/img/llm-gateway/ui/app-guardrails-data-risks-pii.png)

| Category | Sub-categories |
|----------|----------------|
| Personally Identifiable Information (PII) | Date of birth, driver's license number, email address, employee ID, home address, name, national ID, passport number, phone number, social security number, other PII |
| Protected Health Information (PHI) | Medical appointment, condition, facility, record number, treatment, prescription, other PHI |
| Payment and Financial Information (PFI) | Bank account number, bank identification code, customer ID or account number, financial amount, invoice number, PAN card, payment processor detail, tax information, transaction ID, other PFI |
| Protected Card Information (PCI) | Credit/debit card |
| Insurance Data | Health insurance, insurance policy |
| Auth & Secrets | Username, username or alias, access token, API key, AWS credentials, password, other secret |
| Code Scripts and Queries (off by default) | Shell, database queries, YAML/config, Python, JavaScript/TypeScript, Java/Kotlin/Scala, Go, Rust, C/C++/C#, PHP/Ruby, Swift, other code |

Each category has these settings:

| Setting | Options | Default |
|---------|---------|---------|
| Enabled | On / off | On (Code Scripts and Queries off) |
| Risk level | None, Low, Medium, High | High |
| Applies to | Request only, Request & response, Response only | Request & response |
| Action | Redact, Partial redact, Block, Monitor | App default action |
| Sub-category sensitivity | Low, Medium, High per sub-category | Set per sub-category |

### Risk level and sub-category sensitivity

Every sub-category has a sensitivity. The category's risk level determines which sensitivities trigger detection: a low risk level detects only clearly sensitive values, and a high risk level also detects weaker contextual signals.

| Risk level | Detects sub-categories marked |
|------------|--------------------------------|
| Low | High |
| Medium | High, Medium |
| High | High, Medium, Low |

Example for PII, where passport is a high-sensitivity sub-category and name, home address and email are low-sensitivity:

| Request | Risk level Low | Risk level High |
|---------|----------------|-----------------|
| `My name is Jane Doe and I live in Bengaluru` | Allowed | Detected (`NAME`, `HOME ADDRESS`) |
| `Reach me at jane@example.com` | Allowed | Detected (`EMAIL ADDRESS`) |
| `My passport number is M1234567` | Detected | Detected |

Change one sub-category's sensitivity to tune that value without changing the whole category.

## Adversarial risks

![Adversarial risk list with an on/off switch and a Block or Monitor choice for each category](/img/llm-gateway/ui/app-guardrails-adversarial-risks.png)

Each category has an on/off switch and a **Block | Monitor** action. Its scope is fixed to the side of the conversation it targets.

| Category | Checked on | Default |
|----------|-----------|---------|
| Prompt Injection Techniques | Request | On |
| Jailbreak Techniques | Request | On |
| Prompt Context Corruption | Request | On |
| Semantic Adversarial Prompts | Request | On |
| Social Engineering Prompts | Request | On |
| System, Guardrail & Security Disclosure | Request | On |
| Security Exploit & Payload Enablement | Request | On |
| Cybersecurity Frameworks & Standards Mention | Request | On |
| Response Risks | Response | On |
| Hateful or Offensive Content | Both | On |
| Violence & Harmful Content | Both | On |
| Fraudulent or Illegal Activity Content | Both | On |
| Malicious Scripts | Request | **Off** (opt-in) |

**Enable all** turns every adversarial category on.

## Precision detections

Exact-match patterns for structured identifiers. Use them when you need a specific identifier detected in addition to the contextual data risk categories. Each detection has its own switch and action (Redact, Partial redact, Block or Monitor; default Monitor), and all are off until you turn them on. A red dot marks a high-sensitivity identifier.

![Precision detections list with a switch, Reset to default, and an action selector for each identifier](/img/llm-gateway/ui/app-guardrails-precision-detections.png)

The built-in catalog has more than 80 identifiers:

| Group | Identifiers |
|-------|-------------|
| Personal identity | SSN, Aadhaar, PAN card, driver's license, passport, national ID, phone, email, CA social insurance number, UK national insurance number, pensioner/student/senior citizen ID, vehicle number, VIN, vehicle registration certificate, customer signature, photographic image, age, nationality, language, gender orientation, marital status, father's, mother's and maiden names, mother's maiden name, anniversary date, current location, latitude/longitude, local reference |
| Health | Medical record number, medical registration number, patient ID, Medicare number, health insurance, insurance policy, CA health number, UK NHS number, blood group |
| Financial | Bank account number, account holder's name and signature, routing number, bank identification code, SWIFT code, IBAN, UPI ID, customer ID or account number, credit score, tax information, UK unique taxpayer reference, monthly/annual income |
| Card | Card number, expiry date, CVV, cardholder name |
| Secrets | PIN |
| Device and network | IP address, MAC address, SIM number, IMEI, IMSI, handset make/model, ADID/IDFA, cookies |
| Telecom subscriber | Call data records, SMS, roaming, voice and VAS pattern records, PUK code, unique portability code, SIM contacts, credit history and limit, last billed and unbilled amounts, previous payments, usage details, services subscribed, talk plan |
| Employee and HR | Salary details and components, CTC, PF account number, investment details, education, designation, department, employee type, date of joining, work experience, biometric information |

To match your own identifiers with a regex, create a [Custom Detection](./custom-detections) instead.

## Hallucination check

Flags responses the gateway scores as likely fabricated, using a fixed threshold of **0.8**.

| Setting | Options | Default |
|---------|---------|---------|
| Enabled | On / off | Off |
| Action | Block, Monitor | Monitor |
| Risk level | Low, Medium, High | Medium |

It runs on non-streaming responses only, because a streamed response cannot be blocked once it has started. To set a different threshold per app or group, use the Policy Engine's **Hallucination Protection** card.

## Source IP restrictions

Accept gateway calls only from listed networks. Turn on **Enabled** and enter **Allowed source IPs** as comma-separated IPv4, IPv6 or CIDR values, for example `203.0.113.10, 10.0.0.0/8`. Calls from other addresses are rejected.

![Hallucination check with Action and Risk level, and Source IP restrictions, both switched off](/img/llm-gateway/ui/app-guardrails-hallucination-source-ip.png)

## Endpoint coverage

| Surface | Request | Response |
|---------|---------|----------|
| Chat completions, including Bedrock Converse, Vertex Gemini and Anthropic models reached through translation | Yes | Yes |
| Native Anthropic Messages | Yes | Yes |
| OpenAI Responses | Yes | Yes |
| Bedrock Runtime (boto3) | Yes | Yes. `converse_stream` is request only. |
| Native Vertex / Gemini `generateContent` | Yes | Yes |
| Embeddings, text-to-speech | Input | - |
| Speech-to-text | - | Output |
| Sarvam speech synthesis | Input | - |
| Sarvam transcription | - | Output |
| Sarvam translation, transliteration, language detection | Yes | Yes |
| Copilot Studio | User context and tool inputs | - |
| OpenAI Realtime (websocket) | Not scanned | Not scanned |

- **Streaming:** request-side checks run as normal. Response-side redaction and blocking apply only when the gateway holds the full response, so streamed chunks pass through unmodified.
- **Copilot Studio** cannot accept rewritten tool input, so Redact and Partial redact become Block. See [Copilot Studio](../../integrations/pull-ai-usage-and-inventory/microsoft-copilot-studio).
- **Realtime** sessions log the handshake, byte counters and usage, but do not run DLP. Use [SDK Mode](../apps-and-providers/sdk-mode) to scan Realtime transcripts out of band.

## Related

- [Custom Detections](./custom-detections) - your own regex and intent detections.
- [Guardian Agent](./guardian-agent) - dependency checks and task adherence.
- [LLM Gateway Policies](../../console/govern/policy-engine) - the same controls as tenant-wide policies.
