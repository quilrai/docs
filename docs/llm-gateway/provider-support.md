---
sidebar_position: 5
sidebar_custom_props:
  badge: new
  icon: Handshake
---

# Provider Support

Supported providers, API formats, and configuration details.

## Overview

Your app authenticates to the gateway using a QuilrAI API key. Provider credentials are configured in the dashboard and never exposed to clients.

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
| AWS Bedrock (Anthropic) | ✓ | - | - | - | - | - | - | ✓ | - |
| AWS Bedrock Runtime (boto3) | ✓ | - | - | - | - | - | - | ✓ | - |
| Azure (Anthropic Messages) | ✓ | - | - | - | - | - | - | ✓ | - |
| Vertex AI | ✓ | - | - | - | - | - | - | ✓ | - |
| AWS Bedrock (Embeddings) | - | ✓ | - | - | - | - | - | ✓ | - |
| Cohere Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| AWS Bedrock Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| Jina Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| Voyage Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| General Rerank | - | - | ✓ | - | - | - | - | ✓ | - |
| QuilrAI SDK | - | - | - | - | - | - | - | - | ✓ |
| Microsoft Copilot Studio | - | - | - | - | - | - | - | - | ✓ |

Responses and Realtime are supported on dedicated provider types (`openai_responses`, `openai_responses_azure`, `openai_realtime`, `openai_realtime_azure`). A key configured for any other primary provider must add one of these as an additional provider on the key to access the Responses or Realtime endpoints.

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

Use this surface when your application already calls Bedrock Runtime through boto3 or another AWS SDK. Configure a `bedrock` provider key in QuilrAI, then set the SDK `endpoint_url` to `https://guardrails.quilr.ai/bedrock-runtime`.

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| AWS Bedrock Runtime (boto3) | Static AWS Keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| AWS Bedrock Runtime (boto3) | Assume Role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |

Supported text families are Amazon Nova, Anthropic, and OpenAI-style Bedrock models. Non-streaming `converse` and supported `invoke_model` calls run request and response DLP. `converse_stream` runs request-side DLP, then passes the AWS EventStream response through unchanged. `invoke_model_with_response_stream` is registered but returns `ValidationException`.

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

STT also supports `/v1/audio/translations`. Azure deployments use the `/openai/deployments/{deployment}/` path prefix.

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

Native passthrough for OpenAI's Responses API. Create / retrieve / cancel / delete / list-input-items are all supported.

| Provider | Auth Mode | Required Fields | Optional Fields |
|----------|-----------|-----------------|-----------------|
| OpenAI (Responses) | API Key | `api_key` | `base_url` |
| Azure OpenAI (Responses) | API Key | `api_key`, `azure_endpoint` | `azure_api_version` |

Azure-deployment-style aliases are also accepted: `/openai_responses/openai/deployments/{deployment}/responses[/{response_id}[/cancel|/input_items]]`. The deployment name goes in `body.model` regardless of which URL shape is used.

Request-side DLP scans free-form user text inside `input_text` parts of `input` plus the top-level `instructions`. `previous_response_id` and built-in tools (`web_search`, `file_search`, `computer_use`, `code_interpreter`) are passthrough. Response-side DLP scans `output_text` parts on non-streaming responses; streaming responses bypass response-side DLP by design (request-side DLP still runs).

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

A key can have one primary provider plus any number of additional providers of the same or different kind. When more than one compatible provider is configured, you can pick which one handles a request; if you don't pick, QuilrAI uses the first compatible provider on the key.

| Endpoint | Body field | Header | Query param |
|----------|-----------|--------|-------------|
| Chat Completions / Anthropic Messages / Vertex / Embeddings / Rerank | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Responses | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Realtime (websocket) | - | `X-Provider-Name` / `X-Provider-Label` | `provider` or `provider_label` |

Match by either the provider type (`openai_responses_azure`, `openai_realtime`, `anthropic_messages_bedrock`, `bedrock_embeddings`, `cohere_rerank`, `bedrock_rerank`, `jina_rerank`, `voyage_rerank`, `general_rerank`, etc.) or the `label` you assigned to the additional provider when you added it in the dashboard.

## SDK

**API Endpoint:** `/sdk/v1/check`
**Auth:** `Authorization: Bearer sk-quilr-xxx`

The SDK provides guardrails-only scanning - no upstream LLM provider needed. Check text for PII, PHI, adversarial prompts, and custom intents without forwarding to any model.

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
