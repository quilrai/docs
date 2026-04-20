---
sidebar_position: 5
sidebar_custom_props:
  icon: Handshake
---

# Provider Support

Supported providers, API formats, and configuration details.

## Overview

Your app authenticates to the gateway using a QuilrAI API key. Provider credentials are configured in the dashboard and never exposed to clients.

## Capability Matrix

| Provider | Chat | Embeddings | TTS | STT | Responses | Realtime | Models |
|----------|:----:|:----------:|:---:|:---:|:---------:|:--------:|:------:|
| OpenAI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Azure OpenAI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Anthropic (Chat Completions) | ✓ | - | - | - | - | - | ✓ |
| DeepSeek | ✓ | - | - | - | - | - | ✓ |
| Gemini (Chat Completions) | ✓ | - | - | - | - | - | ✓ |
| General LLM | ✓ | - | - | - | - | - | ✓ |
| Anthropic (Messages) | ✓ | - | - | - | - | - | ✓ |
| AWS Bedrock (Anthropic) | ✓ | - | - | - | - | - | ✓ |
| Azure (Anthropic Messages) | ✓ | - | - | - | - | - | ✓ |
| Vertex AI | ✓ | - | - | - | - | - | ✓ |

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
| AWS Bedrock (Anthropic via Bedrock) | AWS Credentials | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| Azure (Anthropic Messages) | API Key | `api_key`, `azure_endpoint` | `azure_api_version` |

AWS Bedrock default region: `us-east-1`

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

## TTS & STT

**Endpoints:** `/openai_compatible/v1/audio/speech` and `/openai_compatible/v1/audio/transcriptions`

| Provider | TTS | STT | Auth Mode | Required Fields |
|----------|:---:|:---:|-----------|-----------------|
| OpenAI | ✓ | ✓ | API Key | `api_key` |
| Azure OpenAI | ✓ | ✓ | API Key | `api_key`, `azure_endpoint` |

STT also supports `/v1/audio/translations`. Azure deployments use the `/openai/deployments/{deployment}/` path prefix.

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
| Chat Completions / Anthropic Messages / Vertex | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Responses | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Realtime (websocket) | - | `X-Provider-Name` / `X-Provider-Label` | `provider` or `provider_label` |

Match by either the provider type (`openai_responses_azure`, `openai_realtime`, `anthropic_messages_bedrock`, etc.) or the `label` you assigned to the additional provider when you added it in the dashboard.

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
