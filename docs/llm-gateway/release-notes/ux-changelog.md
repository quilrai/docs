---
sidebar_position: 1
sidebar_label: "UX changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "Recent interface improvements - tagging, filtering, and quality-of-life updates."
---

# UX Changelog

Recent interface improvements and quality-of-life changes.

## TypeSafe decision models (2026-10-28)

- New provider type `typesafe` on a **TypeSafe** tile ("Decision models · Direct API"), with an API key and a fixed endpoint (`https://api.typesafe.ai/v1`)
- Jev decision models (`jev-latest`, `jev-preview`, `jev-1.14.0`, `jev-1.13.0`) answer typed questions with probabilities through `/typesafe/v1/systemone` (System One format) and `/openai_compatible/v1/decisions` (OpenAI Decisions format)
- The TypeSafe SDK works with the gateway as its base URL: `system_one()` and `models.list()` (new `GET /typesafe/v1/models`); pass `compression=False`
- **Check key and list models** lists the Jev models as decision models and validates each one
- Details: [Decision models](../apps-and-providers/provider-support#typesafe)

## Cerebras provider (2026-10-27)

- New provider type `cerebras` on a **Cerebras** tile, with an API key and a fixed endpoint (`https://api.cerebras.ai/v1`)
- Chat Completions natively, including streaming and tool calls, plus legacy completions on `/openai_compatible/v1/completions`
- Responses, Anthropic Messages, Gemini and Bedrock clients reach it through any-to-any formats, with model reasoning returned in each client's format
- **Get available models** lists the models your Cerebras key can call
- Details: [Cerebras](../apps-and-providers/provider-support#cerebras)

## Model visibility (2026-10-27)

- New **Model Visibility** card in **Policy Engine > LLM Gateway** decides what model lists show: `GET /v1/models` (OpenAI and Anthropic formats) and **Get available models** / **List models** in the console
- Turn listing off, show only some providers, provider labels or model patterns (`*` and `?` wildcards), hide models, or hide undated aliases such as `gpt-4o` next to `gpt-4o-2024-08-06`, for everyone or by Application, App tag, Smart group or person
- Hidden models stay callable by name; to block a model, reject it on **Allowed Models**
- **Hidden models** lets the people you choose ask for hidden entries with `include_hidden=true`, marked `"quilr_visibility": "hidden"`; in the console, people who can view LLM Gateway policies get **Show models hidden by policy**
- Console lookups skip the provider check for hidden models, and ask for model names when listing is off
- `GET /openai_compatible/v1/models/{id}` now runs the same identity, source IP and Policy Engine checks as the model list: a model Allowed Models rejects returns 404 `model_not_found`
- Details: [Model visibility](../protect/model-visibility)

## Universal system prompt policies (2026-10-26)

- With the Policy Engine on, a **Universal system prompt** control on the **Prompt Store and Enforcement** card decides the universal system prompt by Application, Smart group, user, model or request metadata: write the prompt (up to 8,192 characters), use a Global Prompt Store prompt, or turn it **Off** for a narrower scope
- The app's own setting freezes while the engine is on, and turning the engine on converts each app's prompt into a configuration for that app
- Details: [Universal system prompt policies](../cost-and-traffic/prompt-store#universal-system-prompt-policies)

## Universal system prompt (2026-10-25)

- New **Universal system prompt** card in an app's **Configure > Prompts**: one prompt, with no Prompt ID, that the gateway adds to every request once **Apply to every request** is on
- Added before the system prompt your app sends, or used as the system prompt when a request has none; works in Chat Completions, Responses, Anthropic Messages, Gemini / Vertex and Bedrock formats
- Applied after guardrails and Prompt Store references, right before the provider call; request logs keep the request as your app sent it
- Saved with **Save settings**, versioned and audited like other app settings, and settable through the Management API as `prompts.universal_system_prompt`
- Details: [Universal system prompt](../cost-and-traffic/prompt-store#universal-system-prompt)

## Mistral and xAI vendor routes (2026-10-23)

Each vendor's own APIs now have their own route, in the vendor's own format, for that vendor's connections only. See [Vendor routes](../apps-and-providers/provider-support#vendor-routes).

- `/xai/v1/responses`: xAI's Responses API with its server-side tools (web search, X search); retrieve and delete by id
- `/xai/v1/images/generations` and `/images/edits` with xAI's own fields (`aspect_ratio`, `resolution`)
- `/xai/v1/videos/...` and `/xai/v1/batches/...` (including adding batch requests), off by default like their families
- `/mistral/v1/ocr` and `/mistral/v1/fim/completions` (Mistral's own FIM request and response, with streaming)
- Mistral AI and xAI setup now lives on [Provider Support](../apps-and-providers/provider-support#xai-and-mistral)

## Decision models on Azure AI Foundry (2026-10-23)

- Call Microsoft-Decision-1 deployments on an Azure provider through `/openai_compatible/v1/decisions` (OpenAI Decisions format) or `/typesafe/v1/systemone` (System One format)
- Guardrails scan the input and every question; answers come back in the format you called
- Requests reach only the deployments listed on the provider
- Decision deployments now pass model validation in the Azure provider form - see [Provider Support](../apps-and-providers/provider-support#decision-models)

## Any-to-any API formats (2026-10-20)

Call any conversational provider from the SDK you already use. The gateway now accepts Chat Completions, Responses, Anthropic Messages, Gemini generateContent and Bedrock Converse / InvokeModel requests and reaches every conversational provider from each of them.

- Native first: when the provider speaks your format, the request is forwarded as sent, nothing converted
- Otherwise, in order: an endpoint switch on the same credential (for example Responses on xAI, Messages on DeepSeek, Gemini on the Gemini API), the existing Chat Completions adapters, then two-way translation
- Tools, streaming, structured output, images and inline files, and reasoning carry across; billing uses the provider's own token usage
- Guardrails run on your request before conversion and on the converted-back response
- Errors come back in your client's format; stored Responses state stays on native pairs, and hosted tools the target cannot run are dropped so the request still runs
- Routing groups and Policy Engine routes can now mix API families, preferring the request's own family
- Format explorer and full matrix: [Any-to-any formats](../api-reference/any-to-any-formats)

## Endpoint families (2026-10-21)

Shared OpenAI-compatible endpoints beyond chat, served for several providers under `/openai_compatible/v1/`. See [Endpoint Families](../api-reference/endpoint-families).

- On by default: `/moderations`, `/images/generations` and `/images/edits`, `/ocr`, `/completions` (including Mistral and DeepSeek fill-in-the-middle, with streaming)
- Off by default: `/files`, `/batches`, `/videos`
- Existing providers gain endpoints: OpenAI (all families), Azure OpenAI (images, completions, files, batches), Gemini (image generation), DeepSeek (FIM), custom endpoints (moderations, images, completions)
- Access, model allow-lists, limits and quotas apply; DLP guardrails do not run on these routes yet

## xAI and Mistral providers (2026-10-20)

- New provider types `xai`, `xai_responses` and `mistral`, with an API key and a fixed endpoint
- xAI: Chat Completions and Responses natively, plus images, videos, batches and files
- Mistral: Chat Completions natively, plus embeddings, transcription, moderations, fill-in-the-middle, OCR, batches and files
- Every other client format reaches both through any-to-any formats - see [Provider Support](../apps-and-providers/provider-support#xai-and-mistral)
- Setup guide with examples: [xAI and Mistral](../apps-and-providers/provider-support#xai-and-mistral)
- New **Search provider types** box in the provider picker filters tiles by vendor or API name

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
