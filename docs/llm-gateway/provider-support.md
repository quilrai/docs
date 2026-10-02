---
sidebar_position: 1.4
sidebar_custom_props:
  badge: new
  icon: Handshake
---

# Provider Support

Every provider type, the gateway endpoints it serves, and the credentials it needs. Provider support is the same in the V1 and V2 consoles.

You add a provider to an app in **Create App** or in the app's **LLM Providers** section. In the V2 console you can also add it once in **Settings > Models** and link it to many apps (see [Providers and Models](./providers-and-models)). Your code always authenticates with a Quilr key; provider credentials never leave the gateway.

## Capability matrix

One row per provider type. The type is what you pick in the console and what you pass as `X-Provider-Name`.

| Provider type | Provider | Chat | Messages | Responses | Assistants | Realtime | Embeddings | Rerank | Speech | List models |
|---------------|----------|:----:|:--------:|:---------:|:----------:|:--------:|:----------:|:------:|:------:|:-----------:|
| `openai` | OpenAI | ✓ | - | - | - | - | ✓ | - | ✓ | ✓ |
| `openai_responses` | OpenAI | - | - | ✓ | - | - | - | - | - | ✓ |
| `openai_assistants` | OpenAI | - | - | - | ✓ | - | - | - | - | ✓ |
| `openai_realtime` | OpenAI | - | - | - | - | ✓ | - | - | - | ✓ |
| `azureopenai` | Azure OpenAI | ✓ | - | - | - | - | ✓ | - | ✓ | ✓ |
| `openai_responses_azure` | Azure OpenAI | - | - | ✓ | - | - | - | - | - | ✓ |
| `openai_assistants_azure` | Azure OpenAI | - | - | - | ✓ | - | - | - | - | ✓ |
| `openai_realtime_azure` | Azure OpenAI | - | - | - | - | ✓ | - | - | - | ✓ |
| `anthropic` | Anthropic (OpenAI-compatible) | ✓ | - | - | - | - | - | - | - | ✓ |
| `anthropic_messages` | Anthropic | ✓ | ✓ | - | - | - | - | - | - | ✓ |
| `anthropic_messages_bedrock` | Anthropic on AWS Bedrock | ✓ | ✓ | - | - | - | - | - | - | ✓ |
| `anthropic_messages_azure` | Anthropic on Azure AI Foundry | ✓ | ✓ | - | - | - | - | - | - | ✓ |
| `bedrock` | AWS Bedrock (Converse, boto3 runtime) | ✓ | - | - | - | - | - | - | - | ✓ |
| `bedrock_embeddings` | AWS Bedrock | - | - | - | - | - | ✓ | - | - | ✓ |
| `bedrock_rerank` | AWS Bedrock | - | - | - | - | - | - | ✓ | - | ✓ |
| `vertex_ai` | Google Vertex AI | ✓ | - | - | - | - | - | - | - | ✓ |
| `gemini_chatcompletions` | Google Gemini API (OpenAI-compatible) | ✓ | - | - | - | - | - | - | - | ✓ |
| `deepseek` | DeepSeek | ✓ | - | - | - | - | - | - | - | ✓ |
| `oracle` | Oracle OCI Generative AI | ✓ | - | - | - | - | - | - | - | Manual |
| `oracle_responses` | Oracle OCI Generative AI | - | - | ✓ | - | - | - | - | - | Manual |
| `sarvam` | Sarvam | ✓ | - | - | - | - | - | - | ✓ | ✓ |
| `cohere_rerank` | Cohere | - | - | - | - | - | - | ✓ | - | ✓ |
| `jina_rerank` | Jina | - | - | - | - | - | - | ✓ | - | ✓ |
| `voyage_rerank` | Voyage | - | - | - | - | - | - | ✓ | - | ✓ |
| `general` | Custom endpoint (vLLM, Ollama, LiteLLM, any OpenAI-compatible URL) | ✓ | - | - | - | - | - | - | - | ✓ |
| `general_rerank` | Custom endpoint with a Cohere-shaped `/rerank` | - | - | - | - | - | - | ✓ | - | ✓ |
| `quilr_sdk` | QuilrAI SDK (guardrails only, no upstream) | - | - | - | - | - | - | - | - | - |
| `copilot_studio` | Microsoft Copilot Studio (guardrails only) | - | - | - | - | - | - | - | - | - |

- **Chat** on `bedrock`, `vertex_ai` and the `anthropic_messages*` types is translated from OpenAI Chat Completions. See [Unified Completions](./unified-completions).
- `bedrock` also serves native Bedrock Runtime calls from boto3. `vertex_ai` also serves the native Vertex AI routes.
- **Speech** is text-to-speech and speech-to-text. Sarvam also serves translation, transliteration and language detection.
- **Manual**: enter Oracle model IDs yourself.
- [QuilrAI-provided models](./quilr-provided-models) can back an app through a `general` provider with base URL `https://models.quilrai.dev/v1`. Direct integration is coming soon.

## Endpoints

Combine a [regional base URL](./integration-guide#region) with a path below.

| Surface | Path | Auth |
|---------|------|------|
| Chat Completions | `/openai_compatible/v1/chat/completions` | `Authorization: Bearer <Quilr key>` |
| Embeddings | `/openai_compatible/v1/embeddings` | `Authorization: Bearer <Quilr key>` |
| Speech | `/openai_compatible/v1/audio/speech`, `/audio/transcriptions`, `/audio/translations` | `Authorization: Bearer <Quilr key>` |
| Anthropic Messages | `/anthropic_messages/v1/messages` | `x-api-key: <Quilr key>` |
| Responses | `/openai_responses/v1/responses` | `Authorization: Bearer <Quilr key>` |
| Assistants | `/openai_assistants/` | `Authorization: Bearer <Quilr key>` |
| Realtime | `wss://<base>/openai_realtime/v1/realtime` | `Authorization: Bearer <Quilr key>` |
| Bedrock Runtime (boto3) | `/bedrock-runtime/model/{model_id}/converse` and friends | AWS SigV4 with the Quilr key |
| Vertex AI | `/vertex_ai/` | `Authorization: Bearer <Quilr key>` |
| Rerank | `/rerank/v2/rerank`, `/rerank/v1/rerank`, `/rerank/rerank` | `Authorization: Bearer <Quilr key>` |
| Sarvam native | `/sarvam/...` | `Authorization: Bearer <Quilr key>` |
| QuilrAI SDK | `/sdk/v1/check` | `Authorization: Bearer <Quilr key>` |
| Copilot Studio | `/copilot_studio/{Quilr key}` | Quilr key in the path |

## Credentials by provider

Every provider also has a **Provider label** and a **Models** list. Field names in code font are the API names used by the [Management APIs](./management-apis/providers).

| Provider type | Auth option | Required | Optional |
|---------------|-------------|----------|----------|
| `openai`, `openai_responses`, `openai_assistants`, `openai_realtime` | API key | API key (`api_key`) | - |
| `anthropic`, `anthropic_messages` | API key | API key | - |
| `gemini_chatcompletions`, `deepseek` | API key | API key | - |
| `cohere_rerank`, `jina_rerank`, `voyage_rerank` | API key | API key | - |
| `sarvam` | API key | Sarvam API key | - |
| `azureopenai` | API key | API key, Azure endpoint (`azure_endpoint`), Azure API version (`azure_api_version`) | - |
| `openai_responses_azure`, `openai_assistants_azure`, `openai_realtime_azure` | API key | API key, Azure endpoint | - |
| `anthropic_messages_azure` | API key | API key, Base URL (`base_url`, the Azure AI Foundry base URL) | - |
| `general`, `general_rerank` | API key | API key, Base URL | - |
| `bedrock`, `anthropic_messages_bedrock`, `bedrock_embeddings`, `bedrock_rerank` | Static credentials | AWS access key, AWS secret key | AWS region (default `us-east-1`), AWS session token |
| same | Assume role | Role ARN (`aws_role_arn`), External ID (`aws_external_id`) | AWS region, Role session name, Session duration (900 to 43200 seconds) |
| `vertex_ai` | API key | API key, GCP project ID | GCP region (default `us-central1`) |
| `vertex_ai` | Service account | Service account JSON, GCP project ID | GCP region |
| `oracle`, `oracle_responses` | API key | API key | - |
| same | Gateway user principal | No secret. See [Oracle OCI - Gateway Sign-In Setup](./oracle-cross-tenancy). | - |
| same | User principal | Tenancy OCID, User OCID, Key fingerprint, Private key | Private key passphrase |
| same | Session principal | Session token, Private key | Private key passphrase |
| same | Instance principal, Resource principal | No secret | - |
| `quilr_sdk`, `copilot_studio` | None | Label only | - |

Rules that apply to every app:

- Every Oracle provider also needs the **OCI region** (`oci_region`) and **Generative AI project OCID** (`oci_project_id`). `oracle` also needs the **compartment OCID** (`oci_compartment_id`); it is optional for `oracle_responses`.
- Every model-serving provider needs at least one model. For Azure, the model ID is the deployment name.
- Labels may use letters, numbers, spaces, `_`, `.` and `-`. `primary` is reserved.
- Each provider type can appear only once per app.
- `quilr_sdk` and `copilot_studio` apps cannot add other providers.
- Anthropic and Azure Anthropic send `anthropic_version` `2023-06-01` by default.
- For a Bedrock IAM role, see [AWS Bedrock - Assume Role Setup](./bedrock-assume-role).

### What the forms look like

![Azure OpenAI provider form with API key, Azure endpoint and Azure API version](/img/llm-gateway/ui/create-app-provider-azureopenai.png)

![Bedrock provider form with AWS authentication set to Static credentials and the Assume role option shown](/img/llm-gateway/ui/create-app-provider-bedrock-static.png)

![Bedrock credentials with AWS authentication set to Assume role: Role ARN, External ID, Role session name and Session duration](/img/llm-gateway/ui/create-app-provider-bedrock-assume-role.png)

![Google Vertex AI form with Vertex authentication set to Service account, GCP project ID, GCP region and Service account JSON](/img/llm-gateway/ui/models-add-provider-google-vertex-service-account.png)

![Custom endpoint form for the Rerank API with API key and Base URL](/img/llm-gateway/ui/models-add-provider-custom-endpoint.png)

## Chat Completions

`/openai_compatible/v1/chat/completions` works with OpenAI SDKs and OpenAI-compatible wrappers. It reaches providers that already speak OpenAI (OpenAI, Azure OpenAI, Anthropic OpenAI-compatible, DeepSeek, Gemini, Oracle, Sarvam, custom endpoints) and translates for `bedrock` (Converse), `vertex_ai` (Gemini `generateContent`) and the `anthropic_messages*` types. Translation details: [Unified Completions](./unified-completions).

Sarvam serves only its chat models here. Its speech and text models use the [Sarvam routes](#sarvam-speech-and-text).

## Anthropic Messages

`/anthropic_messages/v1/messages` takes the native Anthropic request shape. Use it with the Anthropic SDKs and Claude Code. Served by `anthropic_messages`, `anthropic_messages_bedrock` and `anthropic_messages_azure`.

## AWS Bedrock Runtime (boto3)

Point a boto3 `bedrock-runtime` client at `https://guardrails-usa-2.quilr.ai/bedrock-runtime` (or your [region](./integration-guide#region)) and sign with the Quilr key as both access key ID and secret. Paths: `/model/{model_id}/converse`, `/converse-stream` and `/invoke` (also under `/bedrock-runtime/`).

| Operation | Coverage |
|-----------|----------|
| `converse` | Any selected model that supports Converse. Request and response guardrails. |
| `converse_stream` | Request guardrails; the event stream passes through unchanged. |
| `invoke_model` | Amazon Nova, Anthropic and OpenAI-style Bedrock models. Request and response guardrails. |
| `invoke_model_with_response_stream` | Returns `ValidationException`. |

Only Bedrock Runtime is proxied, not the Bedrock control plane or Agent Runtime. See [AWS Bedrock - boto3 Runtime](./bedrock-boto3).

## Vertex AI

`/vertex_ai/` is a native passthrough to `generateContent`, so any Gemini model on the app works, including multimodal and image-output models. Guardrails scan the text parts of the request. Image, audio and video parts, and non-text outputs, pass through unscanned.

## Embeddings

`/openai_compatible/v1/embeddings` takes the OpenAI embeddings shape for `openai`, `azureopenai` and `bedrock_embeddings` (Titan and Cohere Embed on Bedrock).

## Rerank

All three rerank paths take a Cohere-compatible body (`model`, `query`, `documents`, optional `top_n`, `return_documents`) and return a Cohere-shaped response. Guardrails scan `query` and `documents`. Responses are scores and indices, so they are not scanned. `bedrock_rerank` serves Cohere Rerank 3.5 and Amazon Rerank and uses the `bedrock:InvokeModel` permission.

## TTS & STT

`/openai_compatible/v1/audio/speech`, `/audio/transcriptions` and `/audio/translations` work with `openai`, `azureopenai` and `sarvam`. Azure deployments use the `/openai/deployments/{deployment}/` prefix.

On a Sarvam provider these routes adapt to Sarvam's APIs:

| OpenAI field | Sarvam field |
|--------------|--------------|
| `input` | `text` |
| `voice` | `speaker` |
| `speed` | `pace` |
| `response_format` | `output_audio_codec` (default MP3; `pcm` is raw linear16) |

Transcriptions accept `response_format` of `json`, `verbose_json` or `text`, and `timestamp_granularities[]=segment`. `model` is required.

## Sarvam Speech and Text

Native routes take and return Sarvam's own shapes. Auth: `Authorization: Bearer`, `api-key` or `api-subscription-key`, each with the Quilr key.

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

`/openai_responses/v1/responses` is a native passthrough served by `openai_responses`, `openai_responses_azure` and `oracle_responses`. Create, retrieve, cancel, delete and list input items are supported. Azure-style paths work too: `/openai_responses/openai/deployments/{deployment}/responses`. The deployment goes in `body.model`.

Guardrails scan `input_text` parts and `instructions` on the request, and `output_text` on non-streaming responses. `previous_response_id` and built-in tools pass through.

An `openai` or `azureopenai` provider cannot serve this endpoint. Add a Responses provider type to the app.

## Assistants API

`/openai_assistants/` serves the OpenAI Assistants API (threads, runs, file search) through `openai_assistants` and `openai_assistants_azure`. Use it only for apps already built on Assistants.

## Realtime API

`wss://<base>/openai_realtime/v1/realtime` is a websocket passthrough for OpenAI Realtime voice and text, served by `openai_realtime` and `openai_realtime_azure`. Aliases: `/openai/v1/realtime`, `/openai/realtime`, `/openai_realtime/openai/v1/realtime`, `/openai_realtime/openai/realtime`.

The Quilr key is accepted, in priority order, as an `Authorization: Bearer` header, an `api-key` header, an `api-key` or `api_key` query parameter, an `authorization` query parameter, or the `openai-insecure-api-key.<key>` subprotocol (stripped before forwarding).

:::note Guardrails coverage
Guardrails are not yet applied to live Realtime events. Session logging (handshake status, byte counts, usage) still runs.
:::

## Selecting a Provider on Multi-Provider Apps

When an app has several providers that can serve a request, choose one by provider type or label. Without a selector, the gateway uses the one enabled provider that has the requested model; if several have it, one is picked at random.

| Endpoint | Body field | Header | Query parameter |
|----------|-----------|--------|-----------------|
| Chat Completions, Anthropic Messages, Vertex AI, Embeddings, Rerank, Responses | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Sarvam native (multipart routes: as a form field) | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Realtime | - | `X-Provider-Name` / `X-Provider-Label` | `provider` or `provider_label` |

For apps linked to [global providers](./providers-and-models), the label is the global provider's label.

## SDK

`/sdk/v1/check` scans text, messages or JSON for guardrail findings without calling any LLM. Create an app with the `quilr_sdk` provider. Install with `pip install quilrai` or `npm install quilrai`. See [SDK Mode](./features/sdk-mode), or try it in the [LLM Gateway Playground](/llm-gateway-playground).

## Microsoft Copilot Studio

Create an app with the `copilot_studio` provider and register `https://guardrails-usa-2.quilr.ai/copilot_studio/<Quilr key>` (or your region) in Power Platform. Copilot Studio calls `/validate` and `/analyze-tool-execution` before tool execution. Block, redact and partial-redact outcomes return `blockAction: true`; scanning errors fail open. See [Copilot Studio](./features/copilot-studio).
