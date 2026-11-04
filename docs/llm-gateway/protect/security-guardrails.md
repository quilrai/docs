---
sidebar_position: 1
sidebar_label: "Security guardrails"
sidebar_custom_props:
  icon: ShieldCheck
description: "Configure sensitive-text, image and adversarial risk detections, their actions, and the request and response surfaces they protect."
aliases: [guardrails, language blocking, image risks]
console_path: []
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Security guardrails

Updated on 3 November 2026.

Detect sensitive data and adversarial input in prompts and responses, then monitor, redact or block it. Set the basics per app in the app's settings; use the Policy Engine's **Data & Adversarial Risks** card when you need rules that depend on who is calling, which model, or which part of the request.

## Configure this control

Choose the mode used by your gateway. When the Policy Engine is on, published rules govern this control; classic values saved through **Edit anyway** apply only after the engine is disabled. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Turn it on for an app {#turn-it-on-for-an-app}

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Guardrails"
/>

The Security Guardrails section includes:

| Part | What it does |
|------|--------------|
| [Default action](#actions) | The action used where a category does not set its own. |
| [Data risks](#data-risks) | Sensitive data such as PII, PHI, card data and secrets. |
| [Image Risks](./attachment-scanning#image-risks) | Visual categories such as payment cards, ID documents and faces in request attachments. |
| [Adversarial risks](#adversarial-risks) | Prompt injection, jailbreaks and harmful content. |
| [Precision detections](#precision-detections) | Exact-match identifiers such as SSN, Aadhaar or IBAN. |
| [Hallucination check](#hallucination-check) | Flags responses that score as likely fabricated. |
| [Source IP restrictions](#source-ip-restrictions) | Accepts calls only from listed networks. |

### Defaults for a new app {#defaults-for-a-new-app}

**Create App** has no guardrail step. Every new app starts with these guardrails:

| Setting | Default |
|---------|---------|
| Default action | **Monitor** |
| Data risks | All 6 on: PII, PHI, PFI, PCI, Insurance data, Authentication secrets |
| Adversarial risks | 12 of 13 on. **Malicious scripts** is off (opt-in). |
| Data risk scope | Request and response |
| Precision detections, hallucination check, source IP restrictions | Off |
| Guardian Agent | Off. See [Guardian Agent](./guardian-agent). |
| Attachment scanning and Image Risks | Off. See [Attachment scanning](./attachment-scanning). |

Because the default action is Monitor, a new app records detections without changing traffic. Review findings before you change any category to Redact or Block.

## Actions {#actions}

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
- The **Action mix** panel counts categories by action, including categories that are off.

**Image Risks** uses Monitor, Strip or Block. Strip removes the whole image. Text redaction and partial redaction inside an attachment also remove that attachment, rather than editing the original file. See [attachment actions](./attachment-scanning#actions-and-unreadable-files).

## Data risks {#data-risks}

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
| [Image Risks](./attachment-scanning#image-risks) (off by default) | Nudity or Sexual Image, Weapons Image, Human Face Image, ID Document Image, Payment Card Image, Code or Terminal Screenshot, Medical Image |

Each text data-risk category has these settings:

| Setting | Options | Default |
|---------|---------|---------|
| Enabled | On / off | On (Code Scripts and Queries off) |
| Risk level | None, Low, Medium, High | High |
| Applies to | Request only, Request & response, Response only | Request & response |
| Action | Redact, Partial redact, Block, Monitor | App default action |
| Sub-category sensitivity | Low, Medium, High per sub-category | Set per sub-category |

Image Risks applies to request images and has a switch and action per image type. It requires **Scan attachments** and **Classify images** in the app's **Attachments** section, or the equivalent published Policy Engine configuration. [Document extraction and OCR](./attachment-scanning#document-text-and-ocr) let the text data types above inspect supported files as well as message text.

### Risk level and sub-category sensitivity {#risk-level-and-sub-category-sensitivity}

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

The app's risk level wins over the organization-wide setting in [Detection Models](../../console/govern/detection-models#risk-levels). When the Policy Engine is enabled, the policy wins.

## Adversarial risks {#adversarial-risks}

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

## Precision detections {#precision-detections}

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

## Hallucination check {#hallucination-check}

Flags responses the gateway scores as likely fabricated, using a fixed threshold of **0.8**.

| Setting | Options | Default |
|---------|---------|---------|
| Enabled | On / off | Off |
| Action | Block, Monitor | Monitor |
| Risk level | Low, Medium, High | Medium |

It runs on non-streaming responses only, because a streamed response cannot be blocked once it has started. To set a different threshold per app or group, use the Policy Engine's [Hallucination protection](./hallucination-protection) card.

## Source IP restrictions {#source-ip-restrictions}

Accept gateway calls only from listed networks. Turn on **Enabled** and enter **Allowed source IPs** as comma-separated IPv4, IPv6 or CIDR values, for example `203.0.113.10, 10.0.0.0/8`. Calls from other addresses are rejected.

![Hallucination check with Action and Risk level, and Source IP restrictions, both switched off](/img/llm-gateway/ui/app-guardrails-hallucination-source-ip.png)

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine {#going-further-with-the-policy-engine}

1. Open **Govern > Policy Engine > LLM Gateway > Controls > Data & Adversarial Risks**.
2. Choose a recipe or use the add menu in **Detection rules**, **Language Blocking**, or **Tag matching traffic**.
3. Set **Applies to**, the conditions and outcome. Check **Reads as**, then **Save to draft**.
4. Use **Test > Try a situation** for a matching request and an exception, then **Review & publish**.

### Detection rules

Select data types, a findings threshold, an action, and whether the rule applies to Request, Response or Both. A whole category or individual types can be selected; app [custom detections](./custom-detections) appear in the **Custom** group. **Scan tool-call arguments** checks arguments separately and supports Monitor or Block.

| Setting | Default |
|---|---|
| Data types | None |
| Findings threshold | At least 1 |
| Action | Monitor |
| Stage | Request |
| **Scan tool-call arguments** | Off |

The highest-priority matching action applies to the request or response; the stricter action wins ties. A higher-priority Monitor or Redact can cancel a lower-priority Block, including a block selected by another data type. Non-blocking redaction is selected per data type. Check the panel's **How rules combine** explanation before adding an exception, and test requests containing several data types together.

Without a rule here, nothing is redacted or blocked. A type is scanned only when a rule needs it, so the absence of a finding does not by itself prove that the type was checked.

### Language Blocking

Choose **Only allow certain languages** to monitor or block passages outside the languages you select. Languages are unrestricted without a matching rule. Highest priority decides; conflicting values at the same priority fail validation. Streamed responses are skipped.

### Tag matching traffic

Add a severity to matching traffic for investigation and reporting. Severity does not change Monitor, Redact or Block. All matching tag rules contribute, and the highest severity is reported regardless of priority.

Hallucination scoring and source IP restrictions have their own controls: [Hallucination protection](./hallucination-protection) and [Identity and network trust](./identity-and-network-trust).

</TabItem>
</Tabs>

## Endpoint coverage {#endpoint-coverage}

The table below describes the text guardrails. [Attachment scanning](./attachment-scanning#coverage-and-availability) adds request-file protection on supported conversational surfaces and request-side SDK text/messages checks when enabled and available on the deployment. This includes supported data URLs embedded in text; it does not scan model-generated files. SDK callers should inspect [attachment results and coverage](../apps-and-providers/sdk-mode#attachment-results), separately from message-text predictions.

| Surface | Request | Response |
|---------|---------|----------|
| Chat completions, including Bedrock Converse, Vertex Gemini and Anthropic models reached through translation | Yes | Yes |
| Native Anthropic Messages | Yes | Yes |
| OpenAI Responses (including xAI's `/xai/v1/responses`) | Yes | Yes |
| Bedrock Runtime (boto3) | Yes | Yes. `converse_stream` is request only. |
| Native Vertex / Gemini `generateContent` | Yes | Yes |
| Embeddings, text-to-speech | Input | - |
| Speech-to-text | - | Output |
| Sarvam speech synthesis | Input | - |
| Sarvam transcription | - | Output |
| Sarvam translation, transliteration, language detection | Yes | Yes |
| Copilot Studio | User context and tool inputs | - |
| OpenAI Realtime (websocket) | Not scanned | Not scanned |
| [Endpoint families](../api-reference/endpoint-families) (moderations, images, OCR, completions, files, batches, videos), including the Mistral and xAI [vendor routes](../apps-and-providers/provider-support#vendor-routes) | Not scanned | Not scanned |

- **Streaming:** request-side checks run as normal. Response-side redaction and blocking apply only when the gateway holds the full response, so streamed chunks pass through unmodified.
- **Copilot Studio** cannot accept rewritten tool input, so Redact and Partial redact become Block. See [Copilot Studio](../../integrations/pull-ai-usage-and-inventory/microsoft-copilot-studio).
- **Realtime** sessions log the handshake, byte counters and usage, but do not run DLP. Use [SDK Mode](../apps-and-providers/sdk-mode) to scan Realtime transcripts out of band.

## Related {#related}

- [Custom detections](./custom-detections) - your own regex and intent detections.
- [Guardian Agent](./guardian-agent) - dependency checks and task adherence.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, scopes and priorities work.
