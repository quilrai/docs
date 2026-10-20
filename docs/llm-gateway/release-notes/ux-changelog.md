---
sidebar_position: 1
sidebar_label: "UX changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "Recent interface improvements - tagging, filtering, and quality-of-life updates."
---

# UX Changelog

Recent interface improvements and quality-of-life changes.

## Any-to-any API formats (2026-10-20)

Call any conversational provider from the SDK you already use. The gateway now accepts Chat Completions, Responses, Anthropic Messages, Gemini generateContent and Bedrock Converse / InvokeModel requests and reaches every conversational provider from each of them.

- Native first: when the provider speaks your format, the request is forwarded as sent, nothing converted
- Otherwise, in order: an endpoint switch on the same credential (for example Responses on xAI, Messages on DeepSeek, Gemini on the Gemini API), the existing Chat Completions adapters, then two-way translation
- Tools, streaming, structured output, images and inline files, and reasoning carry across; billing uses the provider's own token usage
- Guardrails run on your request before conversion and on the converted-back response
- Errors come back in your client's format; stored Responses state stays on native pairs, and hosted tools the target cannot run are dropped so the request still runs
- Routing groups and Policy Engine routes can now mix API families, preferring the request's own family
- Format explorer and full matrix: [Any-to-any formats](../api-reference/any-to-any-formats)

## xAI and Mistral providers (2026-10-20)

- New provider types `xai`, `xai_responses` and `mistral`, with an API key and a fixed endpoint
- xAI: Chat Completions and Responses natively, plus images, videos, batches and files
- Mistral: Chat Completions natively, plus embeddings, transcription, moderations, fill-in-the-middle, OCR, batches and files
- Every other client format reaches both through any-to-any formats - see [Provider Support](../apps-and-providers/provider-support#xai-and-mistral)

## Anthropic on Azure AI Foundry from every format (2026-10-20)

- `anthropic_messages_azure` now serves Responses, Gemini and Bedrock clients as well as Anthropic Messages and Chat Completions

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
