---
sidebar_position: 1
sidebar_label: "UX changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "Recent interface improvements - tagging, filtering, and quality-of-life updates."
---

# UX Changelog

Recent interface improvements and quality-of-life changes.

## Mistral AI and xAI Grok providers

Two new direct providers, each configured with a single API key. See [Mistral AI and xAI Grok](../apps-and-providers/mistral-and-xai).

- **Mistral AI** (`mistral`): chat, embeddings, speech to text (Voxtral), moderation, document OCR and Codestral fill-in-the-middle
- **xAI** (`xai`, `xai_responses`): Grok chat, the Responses API, and Grok Imagine image generation and edits
- The upstream URL is fixed by QuilrAI, so there is no Base URL field
- New **Search provider types** box in the provider picker filters tiles by vendor or API name

## Endpoint families

Shared OpenAI-compatible endpoints beyond chat, served for several providers under `/openai_compatible/v1/`. See [Endpoint Families](../api-reference/endpoint-families).

- On by default: `/moderations`, `/images/generations` and `/images/edits`, `/ocr`, `/completions` (including Mistral and DeepSeek fill-in-the-middle, with streaming)
- Off by default: `/files`, `/batches`, `/videos`
- Existing providers gain endpoints: OpenAI (all families), Azure OpenAI (images, completions, files, batches), Gemini (image generation), DeepSeek (FIM), custom endpoints (moderations, images, completions)
- Access, model allow-lists, limits and quotas apply; DLP guardrails do not run on these routes yet

## OpenAI Realtime API

Native websocket passthrough for OpenAI's Realtime API (voice and text).

- Point clients at `wss://guardrails.quilr.ai/openai_realtime/v1/realtime` (or the `/openai/v1/realtime` compat alias) with a QuilrAI API key
- OpenAI and Azure OpenAI variants supported via `openai_realtime` / `openai_realtime_azure` provider types
- API key can be passed via `Authorization` header, `api-key` header, query parameter, or `openai-insecure-api-key.*` subprotocol (browser-friendly)
- Live-event DLP coverage is not included yet - see [Security Guardrails](../protect/security-guardrails#endpoint-coverage)

## OpenAI Responses API

Native support for OpenAI's Responses API format.

- Endpoint: `/openai_responses/v1/responses` with create / retrieve / cancel / delete / list-input-items
- Azure-deployment-style alias also registered
- Request-side DLP scans `input_text` parts plus top-level `instructions`; response-side DLP scans `output_text` on non-streaming responses
- Streaming (SSE) supported; streaming bypasses response-side DLP per the standard gateway rule

## Tags

Add custom tags to API keys to organize by team, environment, or use case.

- Add custom tags to API keys to organize by team, environment, or use case
- Filter and search keys by tag from the top bar
- Tags persist per app across sessions and can be removed inline
