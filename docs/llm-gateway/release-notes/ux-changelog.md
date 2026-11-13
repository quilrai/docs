---
sidebar_position: 1
sidebar_label: "UX changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "Recent interface improvements - tagging, filtering, and quality-of-life updates."
---

# UX Changelog

Recent interface improvements and quality-of-life changes.

## Response cache: normalized and semantic matching (2026-11-13)

- **Choose how closely a repeat must match**: **Exact** (default, unchanged), **Normalized** (also ignores case, punctuation at word edges, repeated spaces and a fixed list of words such as *the*, *my*, *please* and *thanks*) or **Semantic** (also matches a reworded latest user message)
- **Similarity** for Semantic: **Narrow** (default, safest), **Balanced** or **Wider**
- Exact and normalized repeats are answered straight from the cache and skip every guardrail. A reworded (semantic) match is served only after request guardrails pass the new prompt, and skips the model call and response guardrails; prompts that guardrails blocked, redacted or flagged are never matched semantically. Semantic covers chat and Anthropic Messages only; embeddings stay exact
- Offline replay of a one-week production sample: Normalized matched +0.4 points over exact, Semantic +1.5 (Narrow) to +3.9 (Wider) points. Most semantic matches on templated prompts were wrong (a different name, title, username, file or domain). Use Semantic, starting with Narrow, only for apps where people type questions
- Set it on the **Response cache** rule under **Token Savings**, with the `response_cache.match` and `response_cache.similarity` policy effects, or with `match` and `similarity` on `/controls/response-cache`
- Details: [Response cache](../cost-and-traffic/response-cache)

## Self-service: JWT clients keep working with named user keys (2026-11-13)

- **Apps in Named User API Keys mode accept verified JWTs** from their [JWT authentication](../protect/identity-and-network-trust#authentication-modes) setup. Before, switching an app to named keys rejected every JWT with `401 self_service_identity_required`
- A JWT request is identified by the token's email, as on an app without self-service, and needs no named key
- A request that sends a JWT in `Authorization` and a named key in `x-api-key` authenticates with the JWT
- Details: [Credential modes](../self-service/overview#credential-modes) and [Choose a credential mode](../self-service/admin-guide#choose-a-credential-mode)

## Budgets: client conversation ids and group grant members (2026-11-11)

- **Conversation and agent caps work with coding tools as they are**: besides `x-conversation-id` and `x-quilr-agent-id`, the gateway counts the session and agent ids that Claude Code, Codex, OpenCode, Copilot Studio, OpenClaw and others already send
- **Refuse requests that have no conversation id** (or agent id): such a request gets `400 quota_id_required` instead of going uncounted
- **Smart group grant members**: each group grant on the **Grants** tab shows how many members it covers, who has their own grant, and who is at the limit; **View N members** opens the members' usage
- Details: [Cap a conversation or an agent](../cost-and-traffic/budget-recipes#conversation-agent-caps)

## Budget grants: overlap, cleanup on publish and console updates (2026-11-10)

- **A new grant replaces only grants whose dates overlap it.** A grant for another period stays, so a person can have one grant in effect plus scheduled ones; if several are in effect, the newest created applies
- **Any publish that removes a budget or rate limit revokes its grants**: console edits and restoring an older revision included, not only API deletes. A restore that brings the budget back does not bring the grants back; moving or pausing a budget keeps them
- Grant writes return `409 budget_changed` when the budget changed or was removed while the grant was being created; read it again and retry
- The **New grant** form offers **Set a limit** or **Add on top of the budget limit**; extra grants read like **+$25.00 over the budget limit (now $75.00)**
- Grants that start later show **Not started**, with usage so far under the current limit
- Conversation cap cards read **each conversation · one-time allowance · never resets**, and **Requests without a conversation id are refused** when set
- Details: [A temporary raise or cut for one person](../cost-and-traffic/budget-recipes#grant), [Raise by an amount](../cost-and-traffic/budget-recipes#raise-by-amount) and [Budgets API](../api-reference/budgets-api#usage-grants-and-prices)

## Budgets API: monthly allowances, extra grants and lifetime caps (2026-11-10)

- **Lifetime budgets** can be created through the API: send `"one_time": true` with `window: {"kind": "lifetime"}` (a per-conversation cap is `per: ["user", "conversation"]` with `missing_id: "refuse"`)
- **`extra` grants** add an amount on top of the budget's limit and follow later changes to it, capped by the highest allowed limit; `limit` stays absolute. Rate-limit `extra` grants now follow the rate limit the same way
- **Scheduled grants**: a grant that starts later shows as `scheduled`; `status=active` now means in effect now
- **Deleting a budget, budget set or rate limit revokes its grants** (`grants_revoked`); an ID created again starts clean
- **Automatic raises** name the person they raised in `subject`, with the step in `auto_raise`
- `per` accepts `application.name` as another name for `app`
- Details: [A monthly allowance for a person or team](../cost-and-traffic/budget-recipes#monthly-allowance), [Raise by an amount](../cost-and-traffic/budget-recipes#raise-by-amount) and [Budgets API](../api-reference/budgets-api#usage-grants-and-prices)

## Budgets: group grants, automatic raises, caps and forecasts (2026-11-10)

- **Smart group grants**: give every member of a Smart group a different limit, including people who join later; a person's own grant wins
- **Grants with no end date** where a budget allows it, and **Ending soonest** / **Ending in 7 days** views on the **Grants** tab, with each grant's usage
- **Automatic raises**: raise a person's limit by a share of the budget when they reach it (or earlier), a set number of times per period, never above the highest allowed limit; off by default
- **Conversation and agent caps**: **Each conversation**, **Each agent** and **Each agent run** under **Who**, counted from caller-declared ids; conversation and run caps start as one-time allowances
- **Forecasts**: **Runs out** on usage rows and a **Running out soon** list; `GET /budget-forecast` and `GET /budgets/{id}/burn-rate` in the Management API
- **Budget-aware routing**: `budget_used_pct()` in policies and `conditions.budget` on API routes move requests to another model as a budget runs low
- Details: [Budget recipes](../cost-and-traffic/budget-recipes) and [Budgets API](../api-reference/budgets-api#forecasts-and-grant-views)

## Azure AI Foundry follow-ups (2026-11-05)

- Adding an Azure (`azureopenai`) provider no longer shows a note about the resource's Claude deployments; add Claude under **Azure** › **Anthropic messages** by deployment name
- Mistral OCR requests (Mistral and Azure) are billed per processed page, for example $3 per 1,000 pages for `mistral-document-ai-2512`
- Details: [Azure AI Foundry models](../apps-and-providers/provider-support#azure-ai-foundry-models)

## Azure AI Foundry models (2026-11-04)

- **Check key and list models** on an Azure (`azureopenai`) provider now also lists the resource's Mistral Document AI and Microsoft-Decision-1 deployments, by deployment name and type
- Mistral Document AI deployments serve document OCR at `/openai_compatible/v1/ocr`; send documents as base64 `data:` URIs
- Claude deployments found on the resource are named in a note that points to **Azure** › **Anthropic messages**; that provider type now asks for deployment names instead of showing a listing error
- Details: [Azure AI Foundry models](../apps-and-providers/provider-support#azure-ai-foundry-models)

## External hooks (2026-11-04)

- New [Hooks API](../api-reference/hooks-api): call your own HTTPS API on gateway traffic for OpenAI Chat Completions, Responses, Anthropic Messages, Gemini and Bedrock clients
- `pre_call` hooks allow, flag or block a request after Quilr's checks and before the model call; `post_call` hooks do the same for non-streaming responses before they are returned or cached; blocked clients get `403 external_hook_blocked` in their own API's error format
- `on_complete` hooks export every finished request in batches (`{"records": [...]}`), with retries and a bounded queue while your endpoint is down
- Shape the call to fit an existing API: URL and header templates, client headers, bearer, basic and API key auth, HMAC signing, a Quilr envelope or your own body template, and a reply mapped from your own JSON
- Choose the fields sent from a field catalog (identity, app, model, Quilr findings, budgets, usage and cost); sensitive fields only when named exactly
- Observe mode, per-hook timeout and failure behavior, a circuit breaker, previews, test calls and stats
- New Management API key scopes: **Manage hooks** (`hooks:write`) and **Manage personal keys** (`keys:write`, issue, rename, re-expire and revoke personal API keys on a user's behalf)
- The console lists configured hooks read-only under **Management API > Configured hooks**, and the [Management API playground](/llm-gateway-management-playground?tab=hooks) has a **Hooks** tab
## SDK image and attachment checks (gateway upgrade required)

- Request-side SDK checks can inspect inline images and documents with the same attachment protections as proxied model requests, including OCR and enabled Image Risks
- Images embedded as data URLs in text or HTML are discovered too; ordinary bare base64 text is not treated as an image
- SDK results include attachment findings and scan coverage, and sanitized content reflects whole-attachment removal
- Explicit request/response direction takes precedence over message roles; structured JSON checks and response checks retain their existing text/value scope
- Available on deployments that include SDK attachment scanning. Upgrade the gateway before relying on this protection; HTTP 200 alone does not establish a complete scan
- Details: [SDK Mode](../apps-and-providers/sdk-mode#images-and-documents-request-checks), [Attachment scanning](../protect/attachment-scanning), and [image/file request examples](../get-started/integration-guide#send-images-and-documents)

## Cohere provider (2026-11-02)

- New provider type `cohere` on the **Cohere** tile, now "Chat, embeddings & rerank · Direct API", with an API key and a fixed endpoint (`https://api.cohere.com`); the existing **Rerank only** type (`cohere_rerank`) is unchanged
- Command and Aya chat on Chat Completions, including streaming, tool calls and JSON schema; Anthropic Messages, Responses, Gemini and Bedrock clients are translated to it
- Embed models on `/openai_compatible/v1/embeddings` (float or base64) and in Cohere's own shape on `/cohere/v2/embed` (int8, binary and the other embedding types)
- Rerank on `/rerank/v1/rerank` and `/cohere/v2/rerank`, now priced from Cohere's search units (Rerank 3 and 4) and input tokens (Rerank 5), for `cohere_rerank` providers too
- Cohere Transcribe on `/openai_compatible/v1/audio/transcriptions`
- Cohere's parse, tokenize, batch, embed-job and dataset APIs on [Cohere routes](../apps-and-providers/provider-support#cohere-routes)
- Details: [Cohere](../apps-and-providers/provider-support#cohere)

## Perplexity provider (2026-11-02)

- New provider type `perplexity` on a **Perplexity** tile ("Web-grounded answers · Direct API"), with an API key and a fixed endpoint (`https://api.perplexity.ai`)
- Perplexity's Agent API on the Responses route: OpenAI, Anthropic, Google, xAI and Perplexity models (including `perplexity/sonar`) with Perplexity's built-in web search
- Chat Completions, Anthropic Messages, Gemini and Bedrock clients reach the Agent API through any-to-any formats, with streaming and tool calls
- Perplexity's `pplx-decider` decision models on the decision routes, including `/perplexity/v1/decisions` for the Perplexity SDK
- Perplexity's `pplx-embed` embedding models: OpenAI-style unit vectors on `/openai_compatible/v1/embeddings` (float or base64), and Perplexity's own int8 or binary vectors on `/perplexity/v1/embeddings`
- **Check key and list models** lists the Agent API, decision and embedding models
- Agent API cache writes and web search calls are billed
- Details: [Perplexity](../apps-and-providers/provider-support#perplexity)

## Inference API reference (2026-11-02)

- New [Inference API](../api-reference/inference-api) page: an OpenAPI 3.1 reference for every client-facing model API (OpenAI-compatible, Responses, Azure OpenAI, Realtime, Assistants, Anthropic Messages, Bedrock Runtime, Gemini and Vertex AI, rerank, Mistral, xAI, Sarvam, TypeSafe), searchable by family
- Documents what the gateway adds: accepted credential headers, `X-Quilr-*` routing, failover, cache and quota response headers, the error code catalog, and guardrail block and redaction behavior
- Download the combined spec or one per family, or fetch it live from `GET /llmgateway_inference_apis/v1/openapi.json?family=<key>`
- Each operation lists the gateway features on its route (guardrails, Guardian, routing, failover, limits, Prompt Store, response cache and more), with a [Gateway features by route](../api-reference/inference-api#gateway-features-by-route) table
- Pin a spec to one region with `?region=<value>` on the live spec routes (Inference and Management), for example `?region=guardrails-europe-1`; the spec has a single `https://{region}.quilr.ai` server so a Kong import never mixes regions
- Import it into Kong with `deck file openapi2kong`, with the route settings streaming, Realtime, Bedrock SigV4 and Vertex AI need
- New [Management API behind Kong](../api-reference/management-api#management-api-behind-kong) section: one region per import, upstream retries off, credentials and conditional-request headers passed through
- Details: [Import into your API gateway (Kong)](../api-reference/inference-api#import-into-your-api-gateway-kong)

## Groq provider (2026-10-29)

- New provider type `groq` on a **Groq** tile, with an API key and a fixed endpoint (`https://api.groq.com/openai/v1`)
- Chat Completions and Groq's Responses API (stateless beta) natively, including streaming and tool calls
- Conversations can move to Groq from other providers: Chat history fields Groq rejects are fitted before sending
- Groq's browser search tool is billed per search and page visit
- Whisper speech to text and speech translation, and Orpheus text to speech (WAV) on the `/openai_compatible/v1/audio/*` routes
- Anthropic Messages, Gemini and Bedrock clients reach it through any-to-any formats, with model reasoning returned in each client's format
- **Check key and list models** lists chat, speech to text and text to speech models, and tells you when an Orpheus model's terms still need accepting in the Groq console
- Details: [Groq](../apps-and-providers/provider-support#groq)

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
