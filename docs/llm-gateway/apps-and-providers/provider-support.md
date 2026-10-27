---
sidebar_position: 3
sidebar_label: "Provider support matrix"
sidebar_custom_props:
  badge: new
  icon: Handshake
description: "Supported LLM providers (OpenAI, Anthropic, Azure, Bedrock, Vertex AI, xAI, Mistral, Cerebras, DeepSeek, Oracle OCI, Sarvam, Copilot Studio) and their capability matrix with credentials per provider (incl. Oracle OCI auth modes, rerank, embeddings, Realtime, Assistants), including Oracle gateway sign-in, provider-native models through OpenAI-compatible endpoints, and the Sarvam speech and text APIs, and Microsoft-Decision-1 decision models on Azure AI Foundry through the OpenAI Decisions and System One APIs, and the Mistral and xAI vendor routes (/mistral/v1/ocr, /mistral/v1/fim/completions, /xai/v1/responses, /xai/v1/images, videos and batches)."
aliases: [mistral, mistral ai, xai, grok, codestral, voxtral, grok imagine]
---

# Provider Support

Every provider type, the gateway endpoints it serves, and the credentials it needs. Provider support is the same in the V1 and V2 consoles.

You add a provider to an app in **Create App** or in the app's **LLM Providers** section. In the V2 console you can also add it once in **Settings > AI Gateway > Models** and link it to many apps (see [Providers and Models](./providers-and-models)). Your code always authenticates with a Quilr key; provider credentials never leave the gateway.

## Capability matrix

One row per provider type. The type is what you select in the console and what you pass as `X-Provider-Name`.

✓ means the provider serves that API natively. ↻ means the gateway reaches it from that API by [any-to-any formats](../api-reference/any-to-any-formats): an endpoint switch on the same credential, a built-in adapter, or two-way translation. Soon means coming soon.

| Provider type | Provider | Chat | Messages | Responses | Assistants | Realtime | Embeddings | Rerank | Speech | List models |
|---------------|----------|:----:|:--------:|:---------:|:----------:|:--------:|:----------:|:------:|:------:|:-----------:|
| `openai` | OpenAI | ✓ | ↻ | ✓ | - | - | ✓ | - | ✓ | ✓ |
| `openai_responses` | OpenAI | ✓ | ↻ | ✓ | - | - | - | - | - | ✓ |
| `openai_assistants` | OpenAI | - | - | - | ✓ | - | - | - | - | ✓ |
| `openai_realtime` | OpenAI | - | - | - | - | ✓ | - | - | - | ✓ |
| `azureopenai` | Azure OpenAI | ✓ | ↻ | ✓ | - | - | ✓ | - | ✓ | ✓ |
| `openai_responses_azure` | Azure OpenAI | ✓ | ↻ | ✓ | - | - | - | - | - | ✓ |
| `openai_assistants_azure` | Azure OpenAI | - | - | - | ✓ | - | - | - | - | ✓ |
| `openai_realtime_azure` | Azure OpenAI | - | - | - | - | ✓ | - | - | - | ✓ |
| `anthropic` | Anthropic (OpenAI-compatible) | ✓ | ✓ | ↻ | - | - | - | - | - | ✓ |
| `anthropic_messages` | Anthropic | ↻ | ✓ | ↻ | - | - | - | - | - | ✓ |
| `anthropic_messages_bedrock` | Anthropic on AWS Bedrock | ↻ | ✓ | ↻ | - | - | - | - | - | ✓ |
| `anthropic_messages_azure` | Anthropic on Azure AI Foundry | ↻ | ✓ | ↻ | - | - | - | - | - | ✓ |
| `bedrock` | AWS Bedrock (Converse, boto3 runtime) | ✓ | ✓ | ✓ | - | - | - | - | - | ✓ |
| `bedrock_embeddings` | AWS Bedrock | - | - | - | - | - | ✓ | - | - | ✓ |
| `bedrock_rerank` | AWS Bedrock | - | - | - | - | - | - | ✓ | - | ✓ |
| `vertex_ai` | Google Vertex AI | ↻ | ↻ | ↻ | - | - | - | - | - | ✓ |
| `gemini_chatcompletions` | Google Gemini API (OpenAI-compatible) | ✓ | ↻ | ↻ | - | - | - | - | - | ✓ |
| `deepseek` | DeepSeek | ✓ | ↻ | ↻ | - | - | - | - | - | ✓ |
| `xai` | xAI | ✓ | ↻ | ↻ | - | - | - | - | - | ✓ |
| `xai_responses` | xAI | ↻ | ↻ | ✓ | - | - | - | - | - | ✓ |
| `mistral` | Mistral | ✓ | ↻ | ↻ | - | - | ✓ | - | ✓ | ✓ |
| `cerebras` | Cerebras | ✓ | ↻ | ↻ | - | - | - | - | - | ✓ |
| `oracle` | Oracle OCI Generative AI | ✓ | Soon | Soon | - | - | - | - | - | Manual |
| `oracle_responses` | Oracle OCI Generative AI | Soon | Soon | ✓ | - | - | - | - | - | Manual |
| `sarvam` | Sarvam | ✓ | Soon | Soon | - | - | - | - | ✓ | ✓ |
| `cohere_rerank` | Cohere | - | - | - | - | - | - | ✓ | - | ✓ |
| `jina_rerank` | Jina | - | - | - | - | - | - | ✓ | - | ✓ |
| `voyage_rerank` | Voyage | - | - | - | - | - | - | ✓ | - | ✓ |
| `general` | Custom endpoint (vLLM, Ollama, LiteLLM, any OpenAI-compatible URL) | ✓ | ↻ | ✓ | - | - | ✓ | - | - | ✓ |
| `general_rerank` | Custom endpoint with a Cohere-shaped `/rerank` | - | - | - | - | - | - | ✓ | - | ✓ |
| `quilr_sdk` | QuilrAI SDK (guardrails only, no upstream) | - | - | - | - | - | - | - | - | - |
| `copilot_studio` | Microsoft Copilot Studio (guardrails only) | - | - | - | - | - | - | - | - | - |

- **Gemini generateContent and Bedrock Converse / InvokeModel** clients reach the same conversational providers. The [format explorer](../api-reference/any-to-any-formats#format-explorer) shows how each client format reaches each provider, model by model.
- **Chat** on `vertex_ai` and the `anthropic_messages*` types uses the built-in adapters described in [Chat Completions adapters](../api-reference/any-to-any-formats#chat-completions-adapters).
- **Speech** on `mistral` is transcription only. xAI and Mistral also serve the extra APIs in [xAI and Mistral](#xai-and-mistral). Cerebras is described in [Cerebras](#cerebras).
- `bedrock` also serves native Bedrock Runtime calls from boto3. `vertex_ai` also serves the native Vertex AI routes.
- **Speech** is text-to-speech and speech-to-text. Sarvam also serves translation, transliteration and language detection.
- **Manual**: enter Oracle model IDs yourself.
- **Endpoint families:** moderations, images, completions (FIM), files, batches and videos are served for several of these types. See [Endpoint families](#endpoint-families). Mistral and xAI also have [vendor routes](#vendor-routes).
- `azureopenai` also serves Microsoft-Decision-1 deployments on the decision routes. See [Decision models](#decision-models).
- **QuilrAI-provided models** back an app through a `general` provider with base URL `https://models.quilrai.dev/v1`. Direct integration is coming soon. See [QuilrAI-Provided Models](./providers-and-models).

## Endpoints

Combine a [regional base URL](../get-started/integration-guide#region) with a path below.

| Surface | Path | Auth |
|---------|------|------|
| Chat Completions | `/openai_compatible/v1/chat/completions` | `Authorization: Bearer <Quilr key>` |
| Embeddings | `/openai_compatible/v1/embeddings` | `Authorization: Bearer <Quilr key>` |
| Speech | `/openai_compatible/v1/audio/speech`, `/audio/transcriptions`, `/audio/translations` | `Authorization: Bearer <Quilr key>` |
| Endpoint families | `/openai_compatible/v1/moderations`, `/images/*`, `/completions`, `/files`, `/batches`, `/videos` | `Authorization: Bearer <Quilr key>` |
| Mistral vendor routes | `/mistral/v1/ocr`, `/mistral/v1/fim/completions` | `Authorization: Bearer <Quilr key>` |
| xAI vendor routes | `/xai/v1/responses`, `/xai/v1/images/*`, `/xai/v1/videos/*`, `/xai/v1/batches/*` | `Authorization: Bearer <Quilr key>` |
| Anthropic Messages | `/anthropic_messages/v1/messages` | `x-api-key: <Quilr key>` |
| Responses | `/openai_responses/v1/responses` | `Authorization: Bearer <Quilr key>` |
| Assistants | `/openai_assistants/` | `Authorization: Bearer <Quilr key>` |
| Realtime | `wss://<base>/openai_realtime/v1/realtime` | `Authorization: Bearer <Quilr key>` |
| Bedrock Runtime (boto3) | `/bedrock-runtime/model/{model_id}/converse` and related operations | AWS SigV4 with the Quilr key |
| Vertex AI | `/vertex_ai/` | `Authorization: Bearer <Quilr key>` |
| Rerank | `/rerank/v2/rerank`, `/rerank/v1/rerank`, `/rerank/rerank` | `Authorization: Bearer <Quilr key>` |
| Sarvam native | `/sarvam/...` | `Authorization: Bearer <Quilr key>` |
| Decision models | `/openai_compatible/v1/decisions`, `/typesafe/v1/systemone` | `Authorization: Bearer <Quilr key>` |
| QuilrAI SDK | `/sdk/v1/check` | `Authorization: Bearer <Quilr key>` |
| Copilot Studio | `/copilot_studio/{Quilr key}` | Quilr key in the path |

## Credentials by provider

Every provider also has a **Provider label** and a **Models** list. Field names in code font are the API names used by the [Management APIs](../api-reference/providers-and-configuration-api). The auth option value goes in `auth_type` (Vertex AI, Oracle) or `aws_auth_mode` (AWS).

| Provider type | Auth option | Required | Optional | Where to set |
|---------------|-------------|----------|----------|--------------|
| `openai`, `anthropic_messages`, `sarvam` | API key | API key (`api_key`) | - | Console, API |
| `openai_responses`, `openai_assistants`, `openai_realtime` | API key | API key | Base URL (`base_url`, default OpenAI) | Console, API |
| `anthropic`, `gemini_chatcompletions`, `deepseek` | API key | API key | - | Console, API |
| `xai`, `xai_responses`, `mistral` | API key | API key | - (the endpoint is fixed: `https://api.x.ai/v1` or `https://api.mistral.ai/v1`) | Console, API |
| `cerebras` | API key | API key | - (the endpoint is fixed: `https://api.cerebras.ai/v1`) | Console, API |
| `cohere_rerank`, `jina_rerank`, `voyage_rerank` | API key | API key | Base URL (default: the vendor's API) | Console, API |
| `azureopenai` | API key | API key, Azure endpoint (`azure_endpoint`) | Azure API version (`azure_api_version`, default `2024-10-21`; the consoles require it) | Console, API |
| `openai_responses_azure`, `openai_assistants_azure`, `openai_realtime_azure` | API key | API key, Azure endpoint | Azure API version (defaults `2025-03-01-preview`, `2024-05-01-preview`, `2025-04-01-preview`) | Console, API |
| `anthropic_messages_azure` | API key | API key, Base URL (the Azure AI Foundry base URL) | Anthropic version (`anthropic_version`, default `2023-06-01`) | Console, API |
| `general`, `general_rerank` | API key | API key, Base URL | - | Console, API |
| `bedrock`, `anthropic_messages_bedrock`, `bedrock_embeddings`, `bedrock_rerank` | Static credentials (`static`, default) | AWS access key (`aws_access_key`), AWS secret key (`aws_secret_key`) | AWS region (`aws_region`, default `us-east-1`), AWS session token (`aws_session_token`) | Console, API |
| same | Assume role (`assume_role`) | Role ARN (`aws_role_arn`), External ID (`aws_external_id`) | AWS region, Role session name (`aws_role_session_name`), Session duration (`aws_session_duration_seconds`, 900 to 43200, default 3600) | Console, API |
| `vertex_ai` | API key (`api_key`, default) | API key, GCP project ID (`gcp_project_id`) | GCP region (`gcp_region`, default `us-central1`) | Console, API |
| same | Service account (`service_account`) | Service account JSON (`service_account_json`) | GCP project ID (the consoles require it; the API falls back to the JSON's `project_id`), GCP region | Console, API |
| same | Express (`express`) | API key (Gemini API key; calls `generativelanguage.googleapis.com`, no project or region) | - | Management API only |
| same | Application Default Credentials (`adc`) | GCP project ID. Uses the gateway's own Google identity. | GCP region | Management API only |
| `oracle`, `oracle_responses` | API key (`api_key`, default) | API key | - | Console, API |
| same | Gateway user principal (`gateway_user_principal`) | No secret. See [Oracle OCI - Gateway Sign-In Setup](./oracle-oci). | - | Console, API |
| same | User principal (`user_principal`) | Tenancy OCID (`oci_tenancy_id`), User OCID (`oci_user_id`), Key fingerprint (`oci_fingerprint`), Private key (`oci_private_key`) | Private key passphrase (`oci_private_key_passphrase`) | Console, API |
| same | Session principal (`session_principal`) | Session token (`oci_session_token`), Private key | Private key passphrase | Console, API |
| same | Instance principal (`instance_principal`), Resource principal (`resource_principal`) | No secret | - | Console, API |
| `quilr_sdk`, `copilot_studio` | None | Label only | - | Console, API |

Rules that apply to every app:

- Every Oracle provider also needs the **OCI region** (`oci_region`) and **Generative AI project OCID** (`oci_project_id`). `oracle` also needs the **compartment OCID** (`oci_compartment_id`); it is optional for `oracle_responses`. Oracle does not accept `base_url`; the endpoint comes from the region.
- Fields from a different auth option are rejected (for example, AWS access keys with `assume_role`). Switching the auth option removes the old option's credentials.
- The Base URL and Azure API version overrides on Responses, Assistants, Realtime and rerank types are in the V1 console form. In the V2 console, set them through the Management APIs.
- Every model-serving provider needs at least one model. For Azure, the model ID is the deployment name.
- Labels may use letters, numbers, spaces, `_`, `.` and `-`, and must be unique within the app. `primary` is reserved.
- The consoles accept each provider type once per app. The API accepts several providers of the same type under different labels; select one with `provider_label`, since `provider` alone is then ambiguous.
- `quilr_sdk` and `copilot_studio` apps cannot add other providers.
- For a Bedrock IAM role, see [AWS Bedrock - Assume Role Setup](./aws-bedrock).
- Credentials not listed here (Azure Entra ID or managed identity, AWS default chain or web identity, OpenAI organization or project headers, custom upstream headers) are not supported.

### What the forms look like

![Azure OpenAI provider form with API key, Azure endpoint and Azure API version](/img/llm-gateway/ui/create-app-provider-azureopenai.png)

![Bedrock provider form with AWS authentication set to Static credentials and the Assume role option shown](/img/llm-gateway/ui/create-app-provider-bedrock-static.png)

![Bedrock credentials with AWS authentication set to Assume role: Role ARN, External ID, Role session name and Session duration](/img/llm-gateway/ui/create-app-provider-bedrock-assume-role.png)

![Google Vertex AI form with Vertex authentication set to Service account, GCP project ID, GCP region and Service account JSON](/img/llm-gateway/ui/models-add-provider-google-vertex-service-account.png)

![Custom endpoint form for the Rerank API with API key and Base URL](/img/llm-gateway/ui/models-add-provider-custom-endpoint.png)

## Chat Completions

`/openai_compatible/v1/chat/completions` works with OpenAI SDKs and OpenAI-compatible wrappers. Providers that already speak the OpenAI format (OpenAI, Azure OpenAI, Anthropic OpenAI-compatible, DeepSeek, Gemini, xAI, Mistral, Cerebras, Oracle, Sarvam, custom endpoints) get the request natively. `bedrock` (native Bedrock chat or Converse), `vertex_ai` (Gemini `generateContent`) and the `anthropic_messages*` types use the built-in [Chat Completions adapters](../api-reference/any-to-any-formats#chat-completions-adapters); every other provider is reached through [any-to-any formats](../api-reference/any-to-any-formats).

Sarvam serves only its chat models here. Its speech and text models use the [Sarvam routes](#sarvam-speech-and-text).

## Anthropic Messages

`/anthropic_messages/v1/messages` takes the native Anthropic request shape. Use it with the Anthropic SDKs and Claude Code. Served natively by `anthropic_messages`, `anthropic_messages_bedrock`, `anthropic_messages_azure`, `anthropic` and Claude models on `bedrock`; DeepSeek through its Anthropic-compatible endpoint. Every other conversational provider (for example GPT on Azure OpenAI) is reached through [any-to-any formats](../api-reference/any-to-any-formats).

## AWS Bedrock Runtime (boto3)

Point a boto3 `bedrock-runtime` client at `https://guardrails-usa-2.quilr.ai/bedrock-runtime` (or your [region](../get-started/integration-guide#region)) and sign with the Quilr key as both access key ID and secret. Paths: `/model/{model_id}/converse`, `/converse-stream` and `/invoke` (also under `/bedrock-runtime/`).

| Operation | Coverage |
|-----------|----------|
| `converse` | Any selected model that supports Converse. Request and response guardrails. |
| `converse_stream` | Request guardrails; the event stream passes through unchanged. |
| `invoke_model` | Amazon Nova, Anthropic and OpenAI-style Bedrock models. Request and response guardrails. |
| `invoke_model_with_response_stream` | Returns `ValidationException`. |

Converse and Claude-body InvokeModel requests can also reach providers that are not on Bedrock (for example a Mistral or OpenAI model on the same app); see [any-to-any formats](../api-reference/any-to-any-formats#routing-across-formats). Only Bedrock Runtime is proxied, not the Bedrock control plane or Agent Runtime. See [AWS Bedrock - boto3 Runtime](./aws-bedrock).

## Vertex AI

`/vertex_ai/` is a native passthrough to `generateContent`, so any Gemini model on the app works, including multimodal and image-output models. Guardrails scan the text parts of the request. Image, audio and video parts, and non-text outputs, pass through unscanned.

## Embeddings

`/openai_compatible/v1/embeddings` takes the OpenAI embeddings shape for `openai`, `azureopenai`, `mistral` (for example `mistral-embed`), `general` and `bedrock_embeddings` (Titan and Cohere Embed on Bedrock).

## Rerank

All three rerank paths take a Cohere-compatible body (`model`, `query`, `documents`, optional `top_n`, `return_documents`) and return a response in Cohere format. Guardrails scan `query` and `documents`. Responses are scores and indices, so they are not scanned. `bedrock_rerank` serves Cohere Rerank 3.5 and Amazon Rerank and uses the `bedrock:InvokeModel` permission.

## TTS & STT

`/openai_compatible/v1/audio/speech`, `/audio/transcriptions` and `/audio/translations` work with `openai`, `azureopenai` and `sarvam`. `mistral` serves `/audio/transcriptions` only (Voxtral models, for example `voxtral-mini-latest`). Azure deployments use the `/openai/deployments/{deployment}/` prefix.

On a Sarvam provider these routes adapt to Sarvam's APIs:

| OpenAI field | Sarvam field |
|--------------|--------------|
| `input` | `text` |
| `voice` | `speaker` |
| `speed` | `pace` |
| `response_format` | `output_audio_codec` (default MP3; `pcm` is raw linear16) |

Transcriptions accept `response_format` of `json`, `verbose_json` or `text`, and `timestamp_granularities[]=segment`. `model` is required.

## Sarvam Speech and Text

Native routes accept and return Sarvam's own formats. Auth: `Authorization: Bearer`, `api-key` or `api-subscription-key`, each with the Quilr key.

| Endpoint | Purpose | Models |
|----------|---------|--------|
| `/sarvam/text-to-speech` | Speech synthesis | `bulbul:v3` (default), `bulbul:v2` |
| `/sarvam/speech-to-text` | Transcription (`multipart/form-data`, one `file`) | `saaras:v3` (default), `saaras:v4` |
| `/sarvam/speech-to-text-translate` | Speech translation | `saaras:v3`, `saaras:v4` (both need `mode=translate`), `saaras:v2.5` |
| `/sarvam/translate` | Text translation | `mayura:v1` (default), `sarvam-translate:v1` |
| `/sarvam/transliterate` | Transliteration | `sarvam-transliterate` |
| `/sarvam/text-lid` | Language detection | `sarvam-text-lid` |

Chat models (`sarvam-105b`, `sarvam-105b-conversations`, and the beta `glm5.2`, `gemma4`, `deepseekv4-flash`) use the standard Chat Completions endpoint.

| Topic | Limit or behavior |
|-------|-------------------|
| Models | Enable every model and alias you call, including `sarvam-transliterate` and `sarvam-text-lid`. |
| Synthesis | `language_code` is required. `bulbul:v3`: 2500 characters, speaker `shubh`, 24000 Hz. `bulbul:v2`: 1500 characters, speaker `anushka`, 22050 Hz. |
| Recognition | Modes `transcribe`, `translate`, `verbatim`, `translit`, `codemix`. Segment timestamps only. Keep recordings under 30 seconds; bodies are capped at 25 MB. |
| Translation | `mayura:v1`: 11 languages, `auto` source, 1000 characters. `sarvam-translate:v1`: 23 languages, explicit source, 2000 characters. |
| Guardrails | Scan synthesized text, transcripts, text hints and translated output. Uploaded audio is forwarded unchanged and never logged. |
| Not covered | Embeddings, rerank, Responses, Realtime, batch and streaming speech. |

## Responses API

`/openai_responses/v1/responses` is a native passthrough for `openai`, `openai_responses`, `azureopenai`, `openai_responses_azure`, `xai_responses`, `oracle_responses`, `bedrock` and `general` endpoints that serve `/responses`; `xai` switches to xAI's Responses endpoint with the same key. Create, retrieve, cancel, delete and list input items are supported. Azure-style paths work too: `/openai_responses/openai/deployments/{deployment}/responses`. The deployment goes in `body.model`.

Guardrails scan `input_text` parts and `instructions` on the request, and `output_text` on non-streaming responses. On native providers, `previous_response_id` and built-in tools pass through.

Other providers (Claude on Anthropic, Bedrock or Azure AI Foundry, Gemini, Mistral, Cerebras, DeepSeek and more) are reached by translation. Stored state such as `previous_response_id` does not carry over, and hosted tools are dropped so the model answers without them; see [Limits](../api-reference/any-to-any-formats#limits).

## xAI and Mistral

`xai` and `xai_responses` call `https://api.x.ai/v1`; `mistral` calls `https://api.mistral.ai/v1`. Each takes one API key; the base URL is fixed by QuilrAI, and any `base_url` sent through the Management API is ignored.

| Provider type | Console tile and API | What one key serves |
|---------------|----------------------|---------------------|
| `mistral` | **Mistral AI** › Chat completions | Chat, embeddings, transcription, moderation, document OCR, Codestral fill-in-the-middle (FIM). Files and batch jobs when enabled. |
| `xai` | **xAI** › Chat completions | Chat, Grok Imagine image generation and edits. Video generation and batches when enabled. |
| `xai_responses` | **xAI** › Responses | xAI's Responses API, which xAI recommends for new integrations. |

### Add the provider

1. Open **Settings > Models > Models** and click **Add your own models** (the same picker appears when you create or edit an app).
2. Search for `mistral`, `grok` or `xai` and select the **Mistral AI** or **xAI** tile. For xAI, choose **Chat completions** or **Responses** under **Which API does the gateway talk to?**.
3. Keep or edit the **Provider label**, paste the **API key**, click **Check key and list models**, then select the models and save. See [Providers and Models](./providers-and-models#add-a-provider).

Mistral lists models from `/v1/models` and sorts each into chat, embedding, moderation, OCR, transcription or FIM from its capability flags. xAI lists language models, plus image and video models your key can reach; `xai_responses` lists language models only. Enable every model you call, on every API.

### Vendor routes

Each vendor's own APIs have their own route under `/mistral/` or `/xai/`. These take and return the vendor's own request format, unchanged, and serve only that vendor's connections:

| API | Path | Provider types |
|-----|------|----------------|
| Mistral document OCR | `/mistral/v1/ocr` | `mistral` |
| Mistral fill-in-the-middle | `/mistral/v1/fim/completions` | `mistral` |
| xAI Responses, with xAI's server-side tools (web search, X search) | `/xai/v1/responses`; `GET`, `DELETE /xai/v1/responses/{response_id}` | `xai_responses`, `xai` |
| xAI image generation and edits | `/xai/v1/images/generations`, `/xai/v1/images/edits` (JSON body) | `xai` |
| xAI video generation (off by default) | `/xai/v1/videos/generations`, `/edits`, `/extensions`; `GET /xai/v1/videos/{request_id}` | `xai` |
| xAI batches (off by default) | `/xai/v1/batches` (create, list); `/xai/v1/batches/{batch_id}` (get); `/xai/v1/batches/{batch_id}/requests` (add, list); `/xai/v1/batches/{batch_id}/results`; `/xai/v1/batches/{batch_id}:cancel` | `xai` |

The shared endpoints serve them too:

| API | Path | xAI | Mistral |
|-----|------|:---:|:-------:|
| Chat Completions | `/openai_compatible/v1/chat/completions` | ✓ (`xai`; switch on `xai_responses`) | ✓ |
| Responses | `/openai_responses/v1/responses` | ✓ (`xai_responses`; switch on `xai`). The multi-agent model is Responses only. | Translated to Chat |
| Anthropic Messages, Gemini, Bedrock Converse | Their native paths | Translated | Translated |
| Embeddings | `/openai_compatible/v1/embeddings` | - | ✓ |
| Transcription | `/openai_compatible/v1/audio/transcriptions` | - | ✓ |
| Moderations | `/openai_compatible/v1/moderations` | - | ✓ |
| Files, batches (off by default) | `/openai_compatible/v1/files`, `/batches` | Files | ✓ |

Chat requests with PDF or file parts on an `xai` key go to xAI Responses, which reads them; Mistral receives them as document URLs. Files, batches and videos are off by default; see [Endpoint Families](../api-reference/endpoint-families#enabling-families).

### xAI and Mistral examples

```bash
# xAI Responses with xAI's own web search tool
curl https://guardrails-usa-2.quilr.ai/xai/v1/responses \
  -H "Authorization: Bearer <Quilr key>" -H "Content-Type: application/json" \
  -d '{"model": "grok-4.20-0309-non-reasoning", "input": "What is new at xAI?", "tools": [{"type": "web_search"}]}'

# xAI image generation with xAI's own fields
curl https://guardrails-usa-2.quilr.ai/xai/v1/images/generations \
  -H "Authorization: Bearer <Quilr key>" -H "Content-Type: application/json" \
  -d '{"model": "grok-imagine-image", "prompt": "A plain white square.", "aspect_ratio": "16:9"}'

# Codestral fill-in-the-middle (Mistral's own request and response; streaming works too)
curl https://guardrails-usa-2.quilr.ai/mistral/v1/fim/completions \
  -H "Authorization: Bearer <Quilr key>" -H "Content-Type: application/json" \
  -d '{"model": "codestral-latest", "prompt": "def add(a, b):\n    return", "suffix": "\n\nprint(add(1, 2))", "max_tokens": 32}'

# Mistral document OCR
curl https://guardrails-usa-2.quilr.ai/mistral/v1/ocr \
  -H "Authorization: Bearer <Quilr key>" -H "Content-Type: application/json" \
  -d '{"model": "mistral-ocr-latest", "document": {"type": "document_url", "document_url": "https://example.com/invoice.pdf"}}'
```

The OpenAI SDK works against the xAI route: set `base_url` to `https://guardrails-usa-2.quilr.ai/xai/v1` and call `client.responses.create(...)` with your Quilr key.

### Provider behavior

| Topic | Mistral AI | xAI |
|-------|-----------|-----|
| Vendor routes | Request and response are Mistral's own (FIM `random_seed`, chat-shaped FIM choices). | Request and response are xAI's own (`aspect_ratio`, `resolution`, `duration`, xAI video and batch objects). |
| Output limit on chat | Send `max_tokens`. Mistral has no `max_completion_tokens` and no `stream_options`. | `max_completion_tokens` is accepted. The gateway requests streaming usage for you. |
| Rejected fields | Unsupported fields come back as Mistral's own HTTP 422. | Reasoning models reject `presence_penalty`, `frequency_penalty` and `stop`; the error is passed through. |
| Streaming | Chat and FIM. | Chat and Responses. |
| Moderation | The response gets OpenAI's per-result `flagged` field. | - |
| Responses | - | Create, retrieve and delete. `cancel` and `input_items` return `400 operation_not_supported`. |
| Not available | Audio translations. | Legacy completions: xAI rejects `/v1/completions` for every current model. |

When a converted request reaches xAI or Mistral, the gateway adapts parameters the provider does not accept (for example, Mistral's `random_seed` for `seed`; unsupported penalties and `logit_bias` are dropped for xAI).

### Guardrails, routing and limits

- **Chat, Responses (including `/xai/v1/responses`), embeddings and transcription** get the same [guardrails](../protect/security-guardrails#endpoint-coverage) as any other provider.
- **OCR, FIM, images, moderation, files, batches and videos** are not scanned by DLP, on the vendor routes as on the shared ones. Access controls, model allow-lists, rate and token limits and quotas apply. See [Endpoint Families](../api-reference/endpoint-families#what-applies-on-family-routes).
- **A vendor route serves only its vendor's connections.** On an app with several providers it picks the vendor's connection for the model; another provider is refused with `400` (`unsupported_provider_for_<family>`, or `provider_not_supported_on_route` on `/xai/v1/responses`).
- **Routing groups:** `mistral` and `xai` are own-family members of **Chat Completions** groups; `xai_responses` of **OpenAI Responses** groups. On `/xai/v1/responses`, group members of other provider types are skipped. See [Routing and Fallbacks](../cost-and-traffic/routing-and-fallbacks#which-providers-a-group-can-mix).

## Cerebras

`cerebras` calls `https://api.cerebras.ai/v1`. It takes one API key; the base URL is fixed by QuilrAI, and any `base_url` sent through the Management API is ignored.

| Provider type | Console tile and API | What one key serves |
|---------------|----------------------|---------------------|
| `cerebras` | **Cerebras** › Chat completions | Chat and legacy text completions on open-weight models such as gpt-oss and Qwen. |

### Add the provider

1. Open **Settings > Models > Models** and click **Add your own models** (the same picker appears when you create or edit an app).
2. Search for `cerebras` and select the **Cerebras** tile.
3. Keep or edit the **Provider label**, paste the **API key**, click **Check key and list models**, then select the models and save. See [Providers and Models](./providers-and-models#add-a-provider).

Cerebras lists models from `/v1/models`; every model is a chat model. Enable every model you call.

| API | Path | Cerebras | Example model |
|-----|------|:--------:|---------------|
| Chat Completions | `/openai_compatible/v1/chat/completions` | ✓ | `gpt-oss-120b` |
| Legacy completions | `/openai_compatible/v1/completions` | ✓ | `gpt-oss-120b` |
| Responses | `/openai_responses/v1/responses` | Translated to Chat | `gpt-oss-120b` |
| Anthropic Messages, Gemini, Bedrock Converse | Their native paths | Translated to Chat | - |
| Embeddings, images, speech, moderations | - | - (Cerebras does not serve them) | - |
| Files, batches | - | - (Cerebras Batch is a private preview) | - |

### Cerebras examples

```bash
# Chat Completions (streaming and tool calls work too)
curl https://guardrails-usa-2.quilr.ai/openai_compatible/v1/chat/completions \
  -H "Authorization: Bearer <Quilr key>" -H "Content-Type: application/json" \
  -d '{"model": "gpt-oss-120b", "messages": [{"role": "user", "content": "Say hello."}], "max_completion_tokens": 256}'

# Legacy text completions
curl https://guardrails-usa-2.quilr.ai/openai_compatible/v1/completions \
  -H "Authorization: Bearer <Quilr key>" -H "Content-Type: application/json" \
  -d '{"model": "gpt-oss-120b", "prompt": "The capital of France is", "max_tokens": 16}'

# Anthropic Messages client, translated to Cerebras Chat Completions
curl https://guardrails-usa-2.quilr.ai/anthropic_messages/v1/messages \
  -H "x-api-key: <Quilr key>" -H "Content-Type: application/json" \
  -d '{"model": "gpt-oss-120b", "max_tokens": 256, "messages": [{"role": "user", "content": "Say hello."}]}'
```

### Cerebras behavior

| Topic | Cerebras |
|-------|----------|
| Reasoning | Reasoning models such as `gpt-oss-120b` return their reasoning to every client format: `thinking` blocks for Anthropic Messages, `reasoning` items for Responses. Reasoning effort is fitted to `low`, `medium` or `high`. |
| Tool loops | Multi-turn tool calls work from every client format; earlier reasoning is sent back in Cerebras' `reasoning` field. |
| Rejected fields | Cerebras rejects unknown fields; the error comes back as Cerebras' own HTTP 400 (`wrong_api_format`). |
| Streaming | Chat and legacy completions. |
| Context window | An over-long request is classified as a context-length error, so [routing failover](../cost-and-traffic/routing-and-fallbacks) can move it to a model with a larger window. |

## Endpoint families

Moderations, images, completions (including DeepSeek fill-in-the-middle), files, batches and videos are served under `/openai_compatible/v1/` in the OpenAI shape for the providers that support them:

| Family | Providers |
|--------|-----------|
| Moderations | `openai`, `mistral`, `general` |
| Images | `openai`, `azureopenai`, `gemini_chatcompletions`, `general` |
| Completions | `openai`, `azureopenai`, `deepseek`, `cerebras`, `general` |
| Files (off by default) | `openai`, `azureopenai`, `mistral`, `xai` |
| Batches (off by default) | `openai`, `azureopenai`, `mistral` |
| Videos (off by default) | `openai` |

Mistral OCR and FIM, and xAI images, videos and batches, have their own [vendor routes](#vendor-routes) under `/mistral/` and `/xai/`. These routes enforce access, model allow-lists and limits but are not scanned by guardrails. See [Endpoint Families](../api-reference/endpoint-families).

## Decision models

Microsoft-Decision-1 on Azure AI Foundry answers typed questions about text or JSON with probabilities instead of generated text. Use it for classification, routing, ranking and yes/no gates. Call it in either format:

| Format | Path | Questions | Answers |
|--------|------|-----------|---------|
| OpenAI Decisions | `/openai_compatible/v1/decisions` | `input` and a `questions` array of `predicate`, `choice` and `score` | An `answers` array in question order |
| System One | `/typesafe/v1/systemone` | `state` and a `questions` map of `noul`, `choice` and `score` | An `answers` map keyed by question name |

Set up:

1. In Azure AI Foundry, deploy **Microsoft-Decision-1** under a name of your choice (Azure does not allow the name `Microsoft-Decision-1` itself), for example `decision-1`.
2. Add an Azure provider (`azureopenai`) with the resource endpoint and key from the deployment details page, and add the deployment name as a model. Model validation checks it on the decision route, since the model has no chat route.
3. Send the deployment name as `model`.

```bash
curl https://guardrails-usa-2.quilr.ai/openai_compatible/v1/decisions \
  -H "Authorization: Bearer <Quilr key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "decision-1",
    "input": "The API returns 500 on every call.",
    "questions": [
      {"type": "choice", "name": "team", "instructions": "Which team should handle this ticket?",
       "choices": [{"value": "billing", "description": "Charges and refunds"},
                   {"value": "engineering", "description": "Bugs and outages"}]}
    ]
  }'
```

The same question in System One format:

```bash
curl https://guardrails-usa-2.quilr.ai/typesafe/v1/systemone \
  -H "Authorization: Bearer <Quilr key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "decision-1",
    "state": "The API returns 500 on every call.",
    "questions": {
      "team": {"type": "choice", "instructions": "Which team should handle this ticket?",
               "criteria": {"billing": "Charges and refunds", "engineering": "Bugs and outages"}}
    }
  }'
```

| Topic | Behavior |
|-------|----------|
| Upstream | `<resource>/providers/microsoft/v1/systemone`. Any endpoint copied from the portal works (`/openai/v1`, `/models` and project URLs are trimmed to the resource). |
| Format conversion | OpenAI Decisions requests are converted to System One and the answers converted back. Text parts of `input` join into the state; `safety_identifier` is dropped. |
| Guardrails | Scan the input or state and every question field before conversion, including object keys. Answers are probabilities and your own labels, so they are not scanned. |
| Not covered | Images, Box questions, audio and video (the model reads text and JSON only). No streaming. |
| Routing | Decision routes serve only Azure providers. They never join a routing group or route. |
| Model access | A request reaches only deployments listed in the serving provider's models; any other deployment is refused with `403 model_access_denied`. A provider with no models listed serves every deployment. |
| Billing | Input tokens are charged ($0.042 per 1M on Azure); output tokens are free. Token, quota and budget limits apply as on other routes. |

## Assistants API

`/openai_assistants/` serves the OpenAI Assistants API (threads, runs, file search) through `openai_assistants` and `openai_assistants_azure`. Use it only for apps already built on Assistants.

## Realtime API

`wss://<base>/openai_realtime/v1/realtime` is a websocket passthrough for OpenAI Realtime voice and text, served by `openai_realtime` and `openai_realtime_azure`. Aliases: `/openai/v1/realtime`, `/openai/realtime`, `/openai_realtime/openai/v1/realtime`, `/openai_realtime/openai/realtime`.

The Quilr key is accepted, in priority order, as an `Authorization: Bearer` header, an `api-key` header, an `api-key` or `api_key` query parameter, an `authorization` query parameter, or the `openai-insecure-api-key.<key>` subprotocol (stripped before forwarding).

:::note Guardrails coverage
Guardrails are not yet applied to live Realtime events. Session logging (handshake status, byte counts, usage) still runs.
:::

## Selecting a Provider on Multi-Provider Apps

When an app has several providers that can serve a request, choose one by provider type or label. Without a selector, the gateway uses the one enabled provider that has the requested model; if several have it, one is selected at random.

| Endpoint | Body field | Header | Query parameter |
|----------|-----------|--------|-----------------|
| Chat Completions, Anthropic Messages, Vertex AI, Embeddings, Rerank, Responses, Decision models | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Sarvam native (multipart routes: as a form field) | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Realtime | - | `X-Provider-Name` / `X-Provider-Label` | `provider` or `provider_label` |

For apps linked to [platform providers](./providers-and-models), the label is the platform provider's label.

## SDK

`/sdk/v1/check` scans text, messages or JSON for guardrail findings without calling any LLM. Create an app with the `quilr_sdk` provider. Install with `pip install quilrai` or `npm install quilrai`. See [SDK Mode](./sdk-mode), or try it in the [LLM Gateway Playground](/llm-gateway-playground).

## Microsoft Copilot Studio

Create an app with the `copilot_studio` provider and register `https://guardrails-usa-2.quilr.ai/copilot_studio/<Quilr key>` (or your region) in Power Platform. Copilot Studio calls `/validate` and `/analyze-tool-execution` before tool execution. Block, redact and partial-redact outcomes return `blockAction: true`; scanning errors fail open. See [Copilot Studio](../../integrations/pull-ai-usage-and-inventory/microsoft-copilot-studio).
