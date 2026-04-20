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
