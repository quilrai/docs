---
sidebar_position: 4
sidebar_custom_props:
  icon: ShieldCheck
---

# Security Guardrails

Detect and act on sensitive data and adversarial inputs.

## Overview

Security guardrails inspect requests and responses passing through the gateway. Each detection category can be independently enabled and assigned an action.

## Data Risk Detection

Contextual detection identifies sensitive data categories and applies the configured action.

### Supported Categories

- **PII** - Personally Identifiable Information
- **PHI** - Protected Health Information
- **PCI** - Payment Card Industry data
- **Financial data** - Financial records and account information

## Adversarial Risk Detection

Catches adversarial attack patterns in requests:

- **Prompt injection** - Attempts to override system instructions
- **Jailbreak** - Attempts to bypass safety controls
- **Social engineering** - Manipulation attempts targeting the AI model

## Endpoint Coverage

Guardrails run on chat completions, embeddings (input), TTS (input), STT (output), Anthropic Messages, AWS Bedrock Runtime boto3 calls, Vertex/Gemini `generateContent`, the OpenAI Responses API, and Copilot Studio external threat detection. For **streaming** responses (SSE), request-side scanning runs as normal but response-side scanning is skipped so chunks stream through unmodified.

**AWS Bedrock Runtime** `converse_stream` runs request-side DLP and then passes the AWS EventStream response through unchanged. **OpenAI Realtime** websocket sessions are passthrough today - DLP does not yet run on live Realtime events in either direction. Session-level logs (handshake status, byte counters, usage summary) are still recorded. Use [SDK Mode](./sdk-mode) if you need to scan Realtime transcripts out-of-band.

**Copilot Studio** runs request-side checks on user context and proposed tool input values before tool execution. Redaction-style outcomes become blocks because Copilot Studio cannot accept rewritten tool input.

## Configurable Actions

Each detection category supports per-category actions:

| Action | Behavior |
|--------|----------|
| **Block** | Reject the request entirely |
| **Redact** | Remove the sensitive data and allow the request |
| **Anonymize** | Replace sensitive data with anonymized placeholders |
| **Monitor** | Allow the request and log the detection for review |

Adversarial categories only support `block` and `monitor` - redact/anonymize fall back to `block` since there's no entity to redact.

## Per-Category Risk Level

Each data-risk category has a configurable **Risk Level** that controls how wide a net the category casts. Raise it to catch more sub-categories; lower it to limit detections to only the most unambiguous values.

| Risk Level | What fires |
|------------|------------|
| **Low** | Only the most unambiguous sub-categories - clearly sensitive values like unique identifiers or structured credentials. |
| **High** | Everything Low catches, plus weaker, contextual sub-categories like names, emails, and amounts. |

### Which sub-categories fire at which Risk Level

| Category | Fires at Risk = Low | Also fires at Risk = High |
|---|---|---|
| **PII** | SSN, Passport, Driver's License, National ID | Name, Email, Phone, Date of Birth, Home Address, Employee ID |
| **PHI** | Medical Appointment, Medical Record Number, Prescription | Medical Facility, Medical Condition, Medical Treatment |
| **PFI** | Bank Account, Bank Identification Code, PAN Card, Tax Information | Financial Amount, Invoice, Payment Processor, Transaction ID, Customer ID |
| **PCI** | Credit/Debit Card | — |
| **Auth & Secrets** | Access Token, API Key, AWS Credentials, Password | Username, Username or Alias |

### Examples (PII)

How the same input is evaluated at different Risk Levels:

| Request body | Risk = Low | Risk = High |
|---|---|---|
| `My name is Praneeth Bedapudi and I live in Bengaluru` | Allowed | Detected (`NAME`, `HOME ADDRESS`) |
| `Reach me at praneeth@example.com or +91-98765-43210` | Allowed | Detected (`EMAIL ADDRESS`, `PHONE NUMBER`) |
| `My passport number is M1234567` | Detected (`PASSPORT NUMBER`) | Detected (`PASSPORT NUMBER`) |
| `SSN 123-45-6789` | Detected (`SOCIAL SECURITY NUMBER`) | Detected (`SOCIAL SECURITY NUMBER`) |

And a mixed example across categories, both at **Risk = Low**:

| Request body | PII | PFI |
|---|---|---|
| `Praneeth Bedapudi, PAN ABCDE1234F` | Allowed (Name only fires at Risk = High) | Detected (`PAN CARD`) |

### Sub-category Risk Level

Within a category, each sub-category can be pinned to its own Risk Level to override the category-level setting.

Raise the Risk Level to catch more. Lower it to cut noise on categories you only want alerts on when confidence is very high.

## Action Scope

Each category can be scoped to run on the **request** side, the **response** side, or **both**. Scope controls which direction a detection runs in - it does not change the configured action.

| Scope | Runs on | Use when |
|-------|---------|----------|
| **Request** | User input only | You only want to gate what users send (e.g. PII leaving your app) |
| **Response** | Model output only | You only want to gate what the model returns (e.g. leaked secrets, unsafe generation) |
| **Both** (default) | Both directions | Full bidirectional coverage |

Adversarial categories are scoped automatically - Response Risks runs on assistant output, all other adversarial categories run on user input.
