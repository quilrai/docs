---
sidebar_position: 1
sidebar_label: "UX changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "Recent interface improvements - tagging, filtering, and quality-of-life updates."
---

# UX Changelog

Recent interface improvements and quality-of-life changes.

## Prompt versions (2026-11-27)

- **New: versions for Global Prompt Store prompts.** Every save is a numbered version (v1, v2, ...) with its author, time and an optional **Change note**; saving unchanged text creates no version
- **Labels**: `production` is what plain references get, `latest` is the newest version, and your own labels (such as `staging`) point at any version. The prompt list shows them as tags
- **Drafts**: clear **Publish to production** when editing to save a version without changing production
- **History** on each prompt: view and **Compare with** any version, **Promote to production** (also how you roll back), **Set label…** and **Remove label**
- **Requests can select a version**: `quilrai-prompt-store-<id>@v2`, `@latest` or `@<label>`. Plain references keep getting production, and an unknown label or version is a 400
- App prompts are not versioned
- Details: [Versions and labels](../cost-and-traffic/prompt-store#versions-and-labels) and [Select a version](../cost-and-traffic/prompt-store#select-a-version)

## Gateway functions (2026-11-22)

- **New: gateway functions.** Run your own Python scripts, or a remote MCP server's tools, inside gateway requests. A function can run **Before the model is called** (add context, rewrite the latest message, answer or block), as one of the **Tools the model can call**, **On the model's answer** (rewrite, block or ask the model again) or **After the request** (record or export). Nothing runs unless you attach a function
- **New Policy Engine control, Functions** (**Govern > Policy Engine > LLM Gateway > Controls > Functions**): attach saved functions to everyone, people, smart groups or applications, per stage, with **Observe only**, **Tool search**, **Tool limits**, **Hold streamed answers** and **Retries**
- **New Policy Engine tab, Functions**: your functions read-only with their script, settings and versions, plus **Function data**, **Memory**, **Background runs** and an **Activity** card for 24 hours, 7 days or 30 days
- Scripts can read your function data, keep short-term state and long-term memory, call your HTTPS APIs on allowed hosts with write-only secrets, and ask a model
- **Logs**: a **Functions** section in a request's details, **Functions** and **Function** filters, and a **Request kind** filter with **Function call**, **Conversation summary** and **Cache warming** tags
- **Counting change**: requests the gateway makes itself (a function's own model calls, conversation summaries and cache warming) are now ordinary requests in every total: requests, tokens, cost, latency and error rates, in the console and in the Usage and Monitoring APIs
- **Management API settings**: a **History** card lists every change made through the Management API, and keys have a new **Manage functions** scope
- Management API: `/functions`, `/functions/_validate`, `/functions/_test`, `/function-data`, `/function-memory`, `/controls/functions` and `/functions/_on_complete/status`, with the new `functions:write` scope
- Details: [Gateway functions](../cost-and-traffic/gateway-functions) and the [Functions API](../api-reference/functions-api)

## Model Ops: Replays (2026-11-20)

- **New tab, Model Ops**, on the LLM Gateway page, with **Replays**: send requests the gateway already logged again and compare the answers, cost and latency with the originals
- Four kinds: **Compare models** (up to 4 models plus the same model now as a control), **What-if routing** (up to 3 rules, with what each would match and save shown for free before you start), **Token saving** (off against the methods you pick) and **One request**
- Pick requests from a Logs filter: **Balanced**, **Random**, **Where the money is**, **Largest**, **Smallest**, **Tool coverage** or **Custom**, up to 500 per run; results are re-weighted to your real mix of requests
- An optional judge model returns **Better**, **Equivalent** or **Worse** with reasons and 1 to 5 scores; add what matters in your own words, or write your own judge instructions
- Each run has its own spend cap (the estimate plus 25% by default, $200 at most), runs in the background and shows progress while it runs; 2 runs at a time
- The source application's content policies apply to every replay; access, quota and routing rules are skipped, and calls never draw on an application's quota
- Settings a target model does not support (such as adaptive thinking or the effort setting) are adjusted and the answer says why
- **Logs**: **Replay these** in the header and **Replay…** in a request's drawer; replay calls carry a **Replay** or **Replay judge** tag and a **Replay calls** filter
- New permission, **Run LLM replays**, for admins by default
- Details: [Replays](../model-ops/replays), [Set up a replay](../model-ops/set-up-a-replay) and [Read replay results](../model-ops/read-replay-results)

## Agents and coding tools (2026-11-20)

- **New Policy Engine tab, Agents** (**Govern > Policy Engine > LLM Gateway > Agents**): every agent and coding tool seen in gateway traffic in the last 30 days, with family, status, groups, people, requests and last seen
- Agents are identified from what the client sends: `x-quilr-agent-id` and related headers or request metadata, W3C baggage, LiteLLM, Copilot Studio and OpenClaw ids, Claude Code and Codex subagents, and coding tools detected from their headers (`claude_code/~cli`). Identity is a label, not authentication
- **Review** lists new undeclared agents with **Declare all**; declaring records a display name, owner, description and tags
- **Agent groups**: built-in **All agents**, **Undeclared agents** and **Coding tools**, plus your own groups from listed keys, exclusions and match rules (families, names, ids, apps, app tags, agent tags, declared, people in 30 days)
- **Families** shows each family's surfaces and request counts
- Policy rules can block, cap or budget a coding tool with the **Client app** condition (`request.client.name`), and target agents, runs and sessions with `request.metadata.agent_id`, `agent_run_id` and `conversation_id`
- **Agent scopes on controls**: **Applies to** offers **Agents** and **Agent groups**, and **Agent family** under **More targeting options**, on access, budgets and rate limits, routing and allowed models. The most specific scope wins (agent 940, agent group 930, family 920, above people and apps); budgets all count
- **Per-agent budgets**: **Who** offers **Agent group**, **Each agent in a group**, **Each agent** and **Each agent run**; the budget list shows agents counted and the ones closest to their limit
- An agent's **Allowed Models** list replaces its app's and people's lists
- Policy rules have an **Agent** field section (`agent.key`, `agent.groups`, `agent.family`, `agent.surface` and more) with values filled from your agents
- **Effective controls** tab in the agent drawer: access, models, routing and quotas for an agent, with the rule that decided each, and whether a requested model would be refused
- Deleting an agent group that rules still use warns and lists them before **Delete anyway**
- Management API: `/agents`, `/agents/_declare`, `/agent-groups`, `/agent-groups/{group_id}/members` and `/agent-families`, with the new `agents:write` scope (**Manage agents**); `POST /agents/{key}/effective`; `agents`, `agent_groups` and `agent_families` in every control scope and budget `applies_to`; `409 group_in_use` with `?force=true`; agent-scoped access controls may set `block: false` to let an agent through an app or person block
- Details: [Agents and coding tools](../protect/agents-and-coding-tools) and [Agents API](../api-reference/agents-api)

## Self-service redesign (2026-11-18)

- **Self-service is its own tab** on the LLM Gateway page, with sub-tabs **Overview**, **Access plans**, **Apps**, **Model options**, **Providers**, **Requests** and **People**, plus a **How self-service works** explainer and a **Usage report**
- New screen names: **Access plan** (was profile), **App template** (blueprint), **Model option** (model tier), **Request** (exception) and **App owner**; the API keeps its names
- **Access plans** set each ability to **Always**, **Only if the app allows** or **Never**; new plans default to **Only if the app allows**, so they grant nothing extra. **What a developer sees** previews the unsaved plan for a sample person, and **Count who it reaches** counts it
- **Check what someone gets** (Overview) and **Check a person** (People) show which plan applies and where each ability on each app comes from
- Before saving or deleting a plan, switching people without a plan to **No self-service**, or applying a bulk app change, the console names everyone who would lose access to apps they hold personal keys for; an unknown or partial impact needs an acknowledgement
- **Apps**: change many apps at once with a preview, set app owners, revoke personal keys, and see why an app cannot be a template (the policies that depend on its identity, with **Recheck**)
- **Requests** splits requests waiting for you from those waiting for app owners, and lists active approvals; settings changes have their own tab
- New personal keys look like `sk-quilr-ss-<48 hex>`; older `ss1` keys keep working
- Management API: `GET /self-service/usage`, `GET /self-service/exceptions/{exception_id}`, tenant-wide `GET /self-service-keys`, `GET /apps?origin=&created_by=`, personal-key impact (`key_impact`) on `POST /self-service/coverage` with `draft_apps`, `remove_profile_id` and `deny_without_profile`, `app_scoped_policy_names` on blueprint eligibility, and `PUT /apps/{app_name}/self-service-owners`
- Details: [Self-service overview](../self-service/overview), [Admin guide](../self-service/admin-guide), [Access plans](../self-service/access-plans) and [Self-service API](../api-reference/self-service-api)

## Outbound IPs (2026-11-18)

- **New drawer, Outbound IPs**, on the LLM Gateway page: send provider calls from fixed Quilr IP addresses in the region you choose (United States, Europe, India) and allowlist them on the provider
- Turn it on for every provider under **Default for providers**, or for one provider in its **Network route**; a provider's own route always wins
- The drawer lists each region's addresses with a **Copy** button
- Changing a provider's route needs a passing test before it saves
- Works for providers with a public `https` endpoint on port 443; private endpoints keep using remote connectors
- Management API: `GET` and `PUT /outbound-ips`, and `provider_settings.use_outbound_ips` on providers
- Details: [Outbound IPs](../apps-and-providers/outbound-ips)

## Conversation compaction (2026-11-17)

- **New Policy Engine control, Conversation Compaction:** when a conversation passes a user-message or token limit, the gateway summarizes its older messages with a model you choose and sends the instructions, the summary and the latest turns to the answering model
- Set either limit or both, how many recent user turns stay as written (default 5) and the summary length (default 2,000 tokens); **Off** exempts a narrower scope
- The summary model can be any model on the app's providers or on any shared provider; its calls are logged and billed as their own requests
- The default summary instructions can be replaced with your own (**Write custom instructions**), for example to keep ticket numbers or promised follow-ups
- Later turns reuse the summary until the conversation passes the limit again; responses carry `x-quilr-compaction: applied` or `reused`
- Works on Chat Completions, Responses, Anthropic Messages, Gemini and Bedrock; requests whose history the provider keeps are sent as received
- Details: [Conversation compaction](../cost-and-traffic/conversation-compaction)

## ElevenLabs: the full generation API and exact transcription cost (2026-11-16)

- ElevenLabs' own API beyond speech and transcription, for the ElevenLabs SDK: speech and dialogue with character timing and streaming, stored transcripts, sound effects, music, voice changer, audio isolation, voice design, forced alignment, dubbing, and the model and voice lists
- Guardrails scan every text that leaves the gateway (dialogue lines, prompts, lyrics, voice descriptions, alignment text) and stored transcripts on return; uploaded audio is forwarded unchanged
- ElevenLabs' reported billing is logged on every call; on transcription its exact USD charge is the request's cost
- Sound effects, music, voice changer, audio isolation and dubbing are priced at ElevenLabs' list rates; products without a published price are logged as unpriced
- Model discovery lists the sound, music, voice changer and voice design models; a request without `model_id` is checked against ElevenLabs' default model
- Guardrails also scan music lyrics, dubbing transcripts and stored transcript edits
- Details: [ElevenLabs](../apps-and-providers/provider-support#elevenlabs)

## Data risks: Tokenize action (2026-11-16)

- **New action, Tokenize**, next to Redact and Partial redact for data-risk categories, sub-categories and precision detections: the model sees placeholders such as `<PERSON_1>` and `<ACCOUNT_1>`, and the user gets the real values back in the reply
- The same value keeps the same placeholder for the whole conversation (kept for 24 hours), and placeholders belong to one user: another user who reuses the conversation id gets nothing back
- Works on chat completions, Anthropic Messages, OpenAI Responses, native Gemini and Bedrock Runtime, with streaming and tool calls; other surfaces, including SDK Mode, treat it as Redact
- Set it in the app's guardrail settings or with `data_risk_action`, `category_actions` and `sub_category_actions` in the Management API
- Details: [Tokenize](../protect/security-guardrails#tokenize)

## ElevenLabs provider (2026-11-13)

- New provider type `elevenlabs` on the **ElevenLabs** tile ("Text to speech & speech to text"), with an API key; checking the key and listing models generates no audio
- Text to speech (Eleven v4, v3, Multilingual and Flash) on `/openai_compatible/v1/audio/speech` and on ElevenLabs' own `/elevenlabs/v1/text-to-speech/{voice_id}`, including `/stream`
- Speech to text (Scribe) on `/openai_compatible/v1/audio/transcriptions` and `/elevenlabs/v1/speech-to-text`, with word timings
- The ElevenLabs SDK works by pointing its base URL at the gateway; its `xi-api-key` header carries the Quilr key
- Guardrails scan the text to speak and the transcript; usage is priced per character and per audio second
- Details: [ElevenLabs](../apps-and-providers/provider-support#elevenlabs)

## Speech: cost for every provider, request ids and an upload limit (2026-11-13)

- Speech is now priced on every speech provider: characters for `tts-1`, `tts-1-hd`, Orpheus, ElevenLabs and Sarvam Bulbul; audio seconds for Whisper, `gpt-transcribe`, Groq, Mistral, Cohere and Sarvam Saaras; estimated tokens for binary `gpt-4o-mini-tts`
- Speech responses carry `x-quilr-request-id`
- Audio uploads above 200 MB are refused with `413 attachment_too_large`
- Streamed transcription with response guardrails on now scans the whole transcript and returns it redacted; redacted `verbose_json` transcripts drop their word timings
- Details: [TTS & STT](../apps-and-providers/provider-support#tts--stt)

## Response cache: normalized and semantic matching (2026-11-13)

- **Choose how closely a repeat must match**: **Exact** (default, unchanged), **Normalized** (also ignores case, punctuation at word edges, repeated spaces and a fixed list of words such as *the*, *my*, *please* and *thanks*) or **Semantic** (also matches a reworded latest user message)
- **Similarity** for Semantic: **Narrow** (default, safest), **Balanced** or **Wider**
- Exact and normalized repeats are answered straight from the cache and skip every guardrail. A reworded (semantic) match is served only after request guardrails pass the new prompt, and skips the model call and response guardrails; prompts that guardrails blocked, redacted or flagged are never matched semantically. Semantic covers chat and Anthropic Messages only; embeddings stay exact
- In an offline replay of one week of simulated real-world traffic, exact repeats were about 99% of the hits exact and normalized matching found, normalized about 1%; Semantic adds about 5% more hits (Narrow) to 12% (Wider), but semantic matching can match unexpected prompts (for example, a different business name, job title or domain). Use Exact or Normalized for pipelines and agents; Semantic, starting with Narrow, only for apps where people type questions
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
