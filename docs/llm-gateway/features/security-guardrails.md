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

### Exact Data Matching (EDM)

Pattern matching with custom EDM rules for specific data formats.

## Adversarial Risk Detection

Catches adversarial attack patterns in requests:

- **Prompt injection** - Attempts to override system instructions
- **Jailbreak** - Attempts to bypass safety controls
- **Social engineering** - Manipulation attempts targeting the AI model

## Endpoint Coverage

Guardrails run on chat completions, embeddings (input), TTS (input), STT (output), Anthropic Messages, Vertex/Gemini `generateContent`, and the OpenAI Responses API. For **streaming** responses (SSE), request-side scanning runs as normal but response-side scanning is skipped so chunks stream through unmodified.

**OpenAI Realtime** websocket sessions are passthrough today - DLP does not yet run on live Realtime events in either direction. Session-level logs (handshake status, byte counters, usage summary) are still recorded. Use [SDK Mode](./sdk-mode) if you need to scan Realtime transcripts out-of-band.

## Configurable Actions

Each detection category supports per-category actions:

| Action | Behavior |
|--------|----------|
| **Block** | Reject the request entirely |
| **Redact** | Remove the sensitive data and allow the request |
| **Anonymize** | Replace sensitive data with anonymized placeholders |
| **Monitor** | Allow the request and log the detection for review |

Adversarial categories only support `block` and `monitor` — redact/anonymize fall back to `block` since there's no entity to redact.

## Per-Category Sensitivity

Each data-risk category can be tuned to only fire at the severity levels you care about. A category fires when a detection's severity is in the category's allowed sensitivity list.

| Sensitivity | Typical meaning |
|-------------|-----------------|
| **High** | Strong, high-confidence match on a clearly sensitive value |
| **Medium** | Plausible match; lower confidence or weaker context |
| **Low** | Broad / contextual match; highest recall, more false positives |

### Category-level sensitivity

Pick which severity levels a category should fire on. For example, enabling only High on PII suppresses medium and low-confidence PII detections without turning the category off. High + Medium on PHI keeps the strongest two tiers and drops the noisiest one. All three enabled is the widest net.

### Sub-category sensitivity

Within a category, each sub-category (for example the individual PII types like email address, phone number, person name) can be pinned to its own sensitivity level. Sub-category settings narrow the category-level setting — a sub-category won't fire at a level the parent category has excluded.

Raise sensitivity to catch more. Lower it to cut noise on categories you only want alerts on when confidence is very high.

## Action Scope

Each category can be scoped to run on the **request** side, the **response** side, or **both**. Scope controls which direction a detection runs in — it does not change the configured action.

| Scope | Runs on | Use when |
|-------|---------|----------|
| **Request** | User input only | You only want to gate what users send (e.g. PII leaving your app) |
| **Response** | Model output only | You only want to gate what the model returns (e.g. leaked secrets, unsafe generation) |
| **Both** (default) | Both directions | Full bidirectional coverage |

Adversarial categories are scoped automatically — Response Risks runs on assistant output, all other adversarial categories run on user input.
