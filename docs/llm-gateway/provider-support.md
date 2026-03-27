---
sidebar_position: 3
---

# Provider Support

Supported providers, API formats, and configuration details.

## Overview

Your app authenticates to the gateway using a QuilrAI API key. Provider credentials are configured in the dashboard and never exposed to clients.

## Capability Matrix

| Provider | Chat | Embeddings | TTS | STT | Models |
|----------|:----:|:----------:|:---:|:---:|:------:|
| OpenAI | ✓ | ✓ | ✓ | ✓ | ✓ |
| Azure OpenAI | ✓ | ✓ | ✓ | ✓ | ✓ |
| Anthropic (Chat Completions) | ✓ | - | - | - | ✓ |
| DeepSeek | ✓ | - | - | - | ✓ |
| Gemini (Chat Completions) | ✓ | - | - | - | ✓ |
| General LLM | ✓ | - | - | - | ✓ |
| Anthropic (Messages) | ✓ | - | - | - | - |
| AWS Bedrock (Anthropic) | ✓ | - | - | - | - |
| Vertex AI | ✓ | - | - | - | - |

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

:::info Coming Soon
Support for OpenAI's Responses API format is in development.
:::

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
