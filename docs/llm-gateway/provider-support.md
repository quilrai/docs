---
sidebar_position: 5
sidebar_custom_props:
  badge: new
  icon: Handshake
---

# Provider Support

Supported providers, API formats, and configuration details.

## Overview

Your app authenticates to the gateway using a QuilrAI API key. Provider credentials are configured in the dashboard and never exposed to clients. Oracle OCI customers can instead grant QuilrAI cross-tenancy access without sharing an Oracle API key or signing key.

## Capability Matrix

| Provider | Chat | Embeddings | Rerank | TTS | STT | Responses | Realtime | Models | SDK / Webhook |
|----------|:----:|:----------:|:------:|:---:|:---:|:---------:|:--------:|:------:|:-------------:|
| OpenAI | ✓ | ✓ | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Azure OpenAI | ✓ | ✓ | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Anthropic (Chat Completions) | ✓ | - | - | - | - | - | - | ✓ | - |
| DeepSeek | ✓ | - | - | - | - | - | - | ✓ | - |
| Gemini (Chat Completions) | ✓ | - | - | - | - | - | - | ✓ | - |
| General LLM | ✓ | - | - | - | - | - | - | ✓ | - |
| Anthropic (Messages) | ✓ | - | - | - | - | - | - | ✓ | - |
| AWS Bedrock (OpenAI-compatible via Converse) | ✓ | - | - | - | - | - | - | ✓ | - |
| AWS Bedrock (Anthropic) | ✓ | - | - | - | - | - | - | ✓ | - |
| AWS Bedrock Runtime (boto3) | ✓ | - | - | - | - | - | - | ✓ | - |
| Azure (Anthropic Messages) | ✓ | - | - | - | - | - | - | ✓ | - |
| Vertex AI | ✓ | - | - | - | - | - | - | ✓ | - |
| Oracle OCI Generative AI (Chat) | ✓ | - | - | - | - | - | - | Manual | - |
| Oracle OCI Generative AI (Responses) | - | - | - | - | - | ✓ | - | Manual | - |
| Sarvam | ✓ | - | - | ✓ | ✓ | - | - | ✓ | - |
| AWS Bedrock (Embeddings) | - | ✓ | - | - | - | - | - | ✓ | - |
| Cohere Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| AWS Bedrock Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| Jina Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| Voyage Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| General Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| QuilrAI SDK | - | - | - | - | - | - | - | - | ✓ |
| Microsoft Copilot Studio | - | - | - | - | - | - | - | - | ✓ |

Responses and Realtime are supported on dedicated provider types (`openai_responses`, `openai_responses_azure`, `openai_realtime`, `openai_realtime_azure`). A key configured for any other primary provider must add one of these as an additional provider on the key to access the Responses or Realtime endpoints.

Sarvam also serves translation, transliteration, and language detection, which have no column above. See [Sarvam Speech and Text](#sarvam-speech-and-text) for those endpoints, the native `/sarvam/` routes, and the model catalog.

## Chat Completions

**Endpoint:** `/openai_compatible/v1/chat/completions`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| OpenAI | API Key | `api_key` | - |
| Azure OpenAI | API Key | `api_key`, `azure_endpoint` | `azure_api_version` |
| Anthropic (OpenAI-compatible) | API Key | `api_key` | - |
| DeepSeek | API Key | `api_key` | - |
| Gemini (OpenAI-compatible) | API Key | `api_key` | - |
| General LLM (vLLM, Ollama, etc.) | API Key | `api_key`, `base_url` | - |
| Sarvam | API Key | `api_key` | - |
| Anthropic Messages (via OpenAI-compatible) | API Key | `api_key` | `anthropic_version` |
| Anthropic Messages on Bedrock (via OpenAI-compatible) | Static AWS Keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| Anthropic Messages on Bedrock (via OpenAI-compatible) | Assume Role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |
| Azure Anthropic Messages (via OpenAI-compatible) | API Key | `api_key`, `base_url` | `anthropic_version` |
| AWS Bedrock (Converse via OpenAI-compatible) | Static AWS Keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| AWS Bedrock (Converse via OpenAI-compatible) | Assume Role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |
| Vertex AI Gemini (via OpenAI-compatible) | Express | `api_key` | - |
| Vertex AI Gemini (via OpenAI-compatible) | API Key | `api_key`, `gcp_project_id` | `gcp_region` |
| Vertex AI Gemini (via OpenAI-compatible) | Service Account | `service_account_json` | `gcp_project_id`, `gcp_region` |
| Vertex AI Gemini (via OpenAI-compatible) | ADC | `gcp_project_id` | `gcp_region` |
| Oracle OCI Generative AI | Gateway sign-in | `oci_region`, `oci_project_id`, `oci_compartment_id` | - |

The OpenAI-compatible chat endpoint is not limited to OpenAI-hosted models. In addition to providers that already expose an OpenAI-compatible upstream API, QuilrAI can translate provider-native chat models into this surface. Create a `bedrock` provider key and use a selected Bedrock model ID to call Bedrock `Converse`; create a `vertex_ai` provider key and use a selected Gemini model name to call Vertex AI `generateContent`; or create an Anthropic Messages provider key and use a selected Claude model to call native Anthropic Messages. For exact parameter, message, tool, structured-output, and streaming coverage, see [Unified Completions](./unified-completions.md).

AWS Bedrock default region: `us-east-1`. For assume-role setup (trust policy, ExternalId, permissions), see [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md).

For Oracle setup, including the customer-side Admit policy and both tenancy-wide and compartment-scoped access, see [Oracle OCI - Gateway Sign-In Setup](./oracle-cross-tenancy.md).

Sarvam keys serve chat here as well, but only with Sarvam chat models. Its speech and text models are rejected on this endpoint and have dedicated routes instead - see [Sarvam Speech and Text](#sarvam-speech-and-text).

## Anthropic Messages

**Endpoint:** `/anthropic_messages/v1/messages`
**Auth:** `x-api-key: sk-quilr-xxx`

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| Anthropic (Native Messages API) | API Key | `api_key` | - |
| AWS Bedrock (Anthropic via Bedrock) | Static AWS Keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| AWS Bedrock (Anthropic via Bedrock) | Assume Role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |
| Azure (Anthropic Messages) | API Key | `api_key`, `azure_endpoint` | `azure_api_version` |

AWS Bedrock default region: `us-east-1`. For assume-role setup (trust policy, ExternalId, permissions), see [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md).

## AWS Bedrock Runtime (boto3)

**Endpoints:** `/model/{model_id}/converse`, `/model/{model_id}/converse-stream`, `/model/{model_id}/invoke`
**Alternate prefix:** `/bedrock-runtime/model/{model_id}/...`
**Auth:** AWS SigV4 signed request using the QuilrAI key as both access key ID and secret access key

Use this surface when your application already calls Bedrock Runtime through boto3 or another AWS SDK. Configure a `bedrock` provider key in QuilrAI, then set the SDK `endpoint_url` to the closest regional endpoint, such as `https://guardrails-usa-2.quilr.ai/bedrock-runtime`.

If your application uses OpenAI-compatible clients instead, the same `bedrock` provider key can be called through `/openai_compatible/v1/chat/completions`; QuilrAI converts the OpenAI chat request to Bedrock `Converse` for you.

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| AWS Bedrock Runtime (boto3) | Static AWS Keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| AWS Bedrock Runtime (boto3) | Assume Role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |

`converse` supports any selected Bedrock model that supports the Bedrock `Converse` API. `invoke_model` schema coverage is limited to Amazon Nova, Anthropic, and OpenAI-style Bedrock models. Non-streaming `converse` and supported `invoke_model` calls run request and response DLP. `converse_stream` runs request-side DLP, then passes the AWS EventStream response through unchanged. `invoke_model_with_response_stream` is registered but returns `ValidationException`.

Only Bedrock Runtime is proxied. Bedrock control-plane APIs and Bedrock Agent Runtime APIs are not proxied. For setup and boto3 examples, see [AWS Bedrock - boto3 Runtime](./bedrock-boto3.md).

## Vertex AI

**Endpoint:** `/vertex_ai/`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

Vertex AI supports multiple authentication modes. Select the mode when creating the key.

| Auth Mode | Required Fields | Optional Fields | Notes |
|-----------|-----------------|-----------------|-------|
| API Key | `api_key`, `gcp_project_id` | `gcp_region` | Default region: `us-central1` |
| Express | `api_key` | - | No project ID needed |
| Service Account | `service_account_json` | `gcp_project_id`, `gcp_region` | Project ID derived from JSON if omitted |
| ADC | `gcp_project_id` | `gcp_region` | Application Default Credentials from environment |

### Multimodal & image-capable Gemini models

Vertex is a native passthrough to `generateContent`, so any Gemini model configured on the key works - including multimodal models that accept image / audio / video inputs and image-output models like `gemini-2.5-flash-image-preview`. Add the model name to the key's `selected_models` list and call it the same way you would upstream.

Request-side DLP scans text parts of the request. Non-text parts (image / audio / video bytes) and image / audio outputs pass through without response-side DLP - the guardrails pipeline is text-focused today.

## TTS & STT

**Endpoints:** `/openai_compatible/v1/audio/speech` and `/openai_compatible/v1/audio/transcriptions`

| Provider | TTS | STT | Auth Mode | Required Fields |
|----------|:---:|:---:|-----------|-----------------|
| OpenAI | ✓ | ✓ | API Key | `api_key` |
| Azure OpenAI | ✓ | ✓ | API Key | `api_key`, `azure_endpoint` |
| Sarvam | ✓ | ✓ | API Key | `api_key` |

STT also supports `/v1/audio/translations`. Azure deployments use the `/openai/deployments/{deployment}/` path prefix.

On a Sarvam key these compatible routes are adapters over Sarvam's own APIs. QuilrAI maps `input`, `voice`, `speed`, and `response_format` to Sarvam's `text`, `speaker`, `pace`, and `output_audio_codec`; the default compatible audio format is MP3 and `pcm` maps to raw linear16. Transcriptions accept `response_format` of `json`, `verbose_json`, or `text`, and `timestamp_granularities[]=segment`. `model` is required on the compatible routes. Sarvam also exposes native request and response shapes on `/sarvam/` - see below.

## Sarvam Speech and Text

**Endpoints:** `/sarvam/text-to-speech`, `/sarvam/speech-to-text`, `/sarvam/speech-to-text-translate`, `/sarvam/translate`, `/sarvam/transliterate`, `/sarvam/text-lid`
**Auth:** `Authorization: Bearer sk-quilr-xxx`, `api-key: sk-quilr-xxx`, or `api-subscription-key: sk-quilr-xxx`

Sarvam is configured as provider `sarvam` with an `api_key`, as a primary or an additional provider, and covers Indic speech and text alongside chat. The native `/sarvam/` routes take and return Sarvam's own request and response shapes; the OpenAI-compatible audio routes above cover the same speech models for apps that already speak OpenAI. Every upstream call uses the stored provider credential, so callers never send a Sarvam key. Requests are synchronous.

| Endpoint | Purpose | Models | Notes |
|----------|---------|--------|-------|
| `/sarvam/text-to-speech` | Speech synthesis | `bulbul:v3` (default), `bulbul:v2` | Returns Sarvam JSON `{request_id, audios[]}`; join the `audios` fragments and base64-decode them |
| `/sarvam/speech-to-text` | Transcription | `saaras:v3` (default), `saaras:v4` | `multipart/form-data` with one non-empty `file` field |
| `/sarvam/speech-to-text-translate` | Speech translation | `saaras:v3`, `saaras:v4`, `saaras:v2.5` (legacy) | v3 and v4 require `mode=translate`; v2.5 is translation-only, takes no `mode`, and uses the legacy upstream route |
| `/sarvam/translate` | Text translation | `mayura:v1` (default), `sarvam-translate:v1` | Returns `translated_text` |
| `/sarvam/transliterate` | Transliteration | `sarvam-transliterate` | Gateway alias, no upstream model parameter |
| `/sarvam/text-lid` | Language detection | `sarvam-text-lid` | Returns `language_code` and `script_code` |

Chat runs on the standard OpenAI-compatible chat endpoint rather than a `/sarvam/` route:

| Model | Upstream | Notes |
|-------|----------|-------|
| `sarvam-105b`, `sarvam-105b-conversations` | Sarvam `/v1` | JSON and `stream=true` SSE, through the usual chat policy, DLP, tool, and quota pipeline |
| `glm5.2`, `gemma4`, `deepseekv4-flash` | Sarvam `/v2` | Beta, and gated on your Sarvam account. `extra_body` is preserved as a nested wire field |

### Notes and limits

- **Model selection.** Every model and gateway alias you intend to call, including `sarvam-transliterate` and `sarvam-text-lid`, must be enabled in the key's selected models. `transliterate` and `text-lid` default to their alias automatically, and the gateway strips aliases and provider selectors before forwarding.
- **Discovery.** Model listing returns the Sarvam catalog without calling the provider. Optional validation makes one small request per selected API type, and only validation confirms which models the supplied Sarvam key can actually reach.
- **Synthesis.** `language_code` is required on both synthesis routes; the older `target_language_code` alias is accepted, and conflicting values are rejected. `bulbul:v3` accepts 2500 characters and defaults to speaker `shubh` at 24000 Hz; `bulbul:v2` accepts 1500 and defaults to `anushka` at 22050 Hz. Optional parameters are `speech_sample_rate` plus `temperature` and `dict_id` on v3, or `pitch`, `loudness`, `enable_preprocessing`, and `enable_cached_responses` on v2.
- **Speech recognition.** Modern modes are `transcribe`, `translate`, `verbatim`, `translit`, and `codemix`. Only segment timestamps are supported. `keyterms` on Saaras v4 is a JSON-encoded list of at most 50 strings of 1 to 64 characters; legacy v2.5 takes `prompt` instead. Use recordings under 30 seconds; the gateway caps Sarvam multipart bodies at 25 MB.
- **Text processing.** `mayura:v1` covers 11 languages, accepts `auto` as the source language, and caps input at 1000 characters. `sarvam-translate:v1` covers 23 languages, requires an explicit source language, and caps input at 2000 characters.
- **Guardrails.** Request and response DLP run on synthesized text, transcripts, text hints such as `prompt` and `keyterms`, and translated or transliterated output. Uploaded audio is forwarded unchanged and is never written to gateway logs, and timestamp text is dropped when a transcript is redacted. App and model rate limits, request quotas, identity checks, and source IP rules apply as they do elsewhere.
- **Not covered.** Sarvam has no embeddings, rerank, Responses, or Realtime surface on the gateway, and calling the embeddings endpoint with a Sarvam key or model is rejected. Document and batch workflows, speech websockets, and streaming speech are outside this integration. Chat routing groups accept Sarvam chat models only.

## Embeddings

**Endpoint:** `/openai_compatible/v1/embeddings`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| OpenAI | API Key | `api_key` | - |
| Azure OpenAI | API Key | `api_key`, `azure_endpoint` | `azure_api_version` |
| AWS Bedrock (Embeddings) | Static AWS Keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| AWS Bedrock (Embeddings) | Assume Role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |

AWS Bedrock default region: `us-east-1`. Supports Titan and Cohere Embed families on Bedrock; requests and responses follow the OpenAI embeddings shape. For assume-role setup, see [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md).

## Rerank

**Endpoints:** `/rerank/v2/rerank`, `/rerank/v1/rerank`, `/rerank/rerank`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

All three paths are registered to match Cohere's upstream routes (v2, v1, and legacy). Accepts a Cohere-compatible body (`model`, `query`, `documents`, optional `top_n`, `return_documents`) and returns a Cohere-shaped response (`id`, `model`, `results[]`, `usage`).

| Provider | Auth Mode | Required Fields | Optional Fields | Notes |
|----------|-----------|-----------------|-----------------|-------|
| Cohere Rerank | API Key | `api_key` | - | - |
| AWS Bedrock Rerank | Static AWS Keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` | Cohere Rerank 3.5 and Amazon Rerank families; reuses `bedrock:InvokeModel` IAM permission |
| AWS Bedrock Rerank | Assume Role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` | See [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md) |
| Jina Rerank | API Key | `api_key` | - | - |
| Voyage Rerank | API Key | `api_key` | - | - |
| General Rerank | API Key | `api_key`, `base_url` | - | Self-hosted ColBERT / TEI / Infinity exposing a Cohere-shaped `/rerank` endpoint |

Request-side DLP scans the `query` and `documents` fields. Response-side DLP is not applied - responses are scores and indices only.

## Responses API

**Endpoint:** `/openai_responses/v1/responses`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

Native passthrough for supported Responses providers. Create / retrieve / cancel / delete / list-input-items are all supported.

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| OpenAI (Responses) | API Key | `api_key` | `base_url` |
| Azure OpenAI (Responses) | API Key | `api_key`, `azure_endpoint` | `azure_api_version` |
| Oracle OCI Generative AI (Responses) | Gateway sign-in | `oci_region`, `oci_project_id` | `oci_compartment_id` |

Azure-deployment-style aliases are also accepted: `/openai_responses/openai/deployments/{deployment}/responses[/{response_id}[/cancel|/input_items]]`. The deployment name goes in `body.model` regardless of which URL shape is used.

Request-side DLP scans free-form user text inside `input_text` parts of `input` plus the top-level `instructions`. `previous_response_id` and built-in tools (`web_search`, `file_search`, `computer_use`, `code_interpreter`) are passthrough. Response-side DLP scans `output_text` parts on non-streaming responses; streaming responses bypass response-side DLP by design (request-side DLP still runs).

Oracle Responses uses the same customer Admit policy and gateway-owned OCI signing identity as Oracle Chat Completions. See [Oracle OCI - Gateway Sign-In Setup](./oracle-cross-tenancy.md).

## Realtime API

**Endpoint:** `wss://<base>/openai_realtime/v1/realtime`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

Native passthrough for OpenAI's Realtime websocket API (voice and text).

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| OpenAI (Realtime) | API Key | `api_key` | `base_url` |
| Azure OpenAI (Realtime) | API Key | `api_key`, `azure_endpoint` | `azure_api_version` |

Compatibility aliases for SDK and browser clients are registered at `/openai/v1/realtime`, `/openai/realtime`, `/openai_realtime/openai/v1/realtime`, and `/openai_realtime/openai/realtime`.

Quilr accepts the API key in any of the following forms (in priority order) to cover both server and browser clients:

1. `Authorization: Bearer sk-quilr-xxx` header
2. `api-key: sk-quilr-xxx` header
3. `api-key` / `api_key` query parameter
4. `authorization` query parameter
5. WebSocket subprotocol `openai-insecure-api-key.sk-quilr-xxx`

The `openai-insecure-api-key.*` subprotocol is stripped before forwarding and is never sent upstream.

:::note Guardrails coverage
Realtime sessions are passthrough today - DLP is not yet applied to live Realtime events in either direction. Request-side and response-side guardrails on Realtime are planned; until then use Realtime for voice/text flows that do not require in-session redaction. Session-level logging (handshake status, byte counters, usage summary) is still written.
:::

## Selecting a Provider on Multi-Provider Keys

A key can have one primary provider plus any number of additional providers of the same or different kind. When more than one compatible provider is configured, you can pick which one handles a request. If you don't pick, QuilrAI can still infer a provider from the requested model: when exactly one enabled provider has that model enabled on the key, that provider is used; when multiple enabled providers have the same model enabled, QuilrAI chooses one of those providers at random for that request. Use a provider selector when provider choice must be deterministic.

| Endpoint | Body field | Header | Query param |
|----------|-----------|--------|-------------|
| Chat Completions / Anthropic Messages / Vertex / Embeddings / Rerank | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Sarvam speech and text (`/sarvam/`) | `provider` or `provider_label`, sent as a form field on the multipart speech routes | `X-Provider-Name` / `X-Provider-Label` | - |
| Responses | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Realtime (websocket) | - | `X-Provider-Name` / `X-Provider-Label` | `provider` or `provider_label` |

Match by either the provider type (`bedrock`, `openai_responses_azure`, `openai_realtime`, `anthropic_messages_bedrock`, `bedrock_embeddings`, `cohere_rerank`, `bedrock_rerank`, `jina_rerank`, `voyage_rerank`, `general_rerank`, `sarvam`, etc.) or the `label` you assigned to the additional provider when you added it in the dashboard.

## SDK

**API Endpoint:** `/sdk/v1/check`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

The SDK provides guardrails-only scanning - no upstream LLM provider needed. Check text, messages, or structured JSON for PII, PHI, adversarial prompts, and custom intents. JSON mode preserves keys and structure while scanning values. Choose `hashing_mode` for stable placeholders and inspect advisory `similar_entities` in the response. See [SDK Mode](./features/sdk-mode) for request parameters and examples, or try **Quilr SDK** in the [LLM Gateway Playground](/llm-gateway-playground).

### Python

```bash
pip install quilrai
```

### JavaScript

```bash
npm install quilrai
```

### LiteLLM Proxy Plugin

QuilrAI integrates as a plugin for [LiteLLM's](https://docs.litellm.ai) proxy gateway. Configure it in your LiteLLM proxy config to add guardrails to all LLM traffic.

## Microsoft Copilot Studio

**Endpoint base:** `/copilot_studio/{sk-quilr-xxx}`
**Routes:** `/validate`, `/analyze-tool-execution`
**Auth:** QuilrAI key in the endpoint path

Copilot Studio support is SDK-style external threat detection, not LLM proxying. Create a key with provider `copilot_studio`, configure the endpoint base in Power Platform admin center, and Copilot Studio calls QuilrAI before tool execution.

QuilrAI scans recent user prompt context and tool `inputValues`. It returns `blockAction: true` for block/redact/partial-redact outcomes because Copilot Studio cannot accept rewritten tool input. DLP timeout or internal DLP errors fail open with `blockAction: false` so transient service issues do not break the agent flow.

For setup steps, see [Copilot Studio](./features/copilot-studio.md).
