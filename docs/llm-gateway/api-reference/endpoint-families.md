---
sidebar_position: 8
sidebar_label: "Endpoint families"
sidebar_custom_props:
  badge: new
  icon: Layers
description: "OpenAI-compatible moderations, images, completions (including fill-in-the-middle), files, batches and videos endpoints on the LLM Gateway, the Mistral and xAI vendor routes for their own APIs, which providers serve each one, defaults, limits and error codes."
aliases: [moderations, image generation, ocr, fim, fill in the middle, files api, batch api, videos api]
---

# Endpoint Families

Endpoint families are OpenAI-compatible APIs beyond chat that one shared gateway layer serves for several providers. You call them with a Quilr key under `/openai_compatible/v1/`. The gateway picks the provider from the app's configured providers and the request `model`, rewrites the request for the vendor where needed, and returns an OpenAI-shaped response.

Mistral OCR and fill-in-the-middle, and xAI images, videos and batches, are served on [vendor routes](#vendor-routes) under `/mistral/v1/` and `/xai/v1/` instead, in each vendor's own format.

## Families and providers

| Family | Default | Endpoints | Providers | Streaming |
|--------|---------|-----------|-----------|:---------:|
| `moderations` | On | `POST /moderations` | `openai`, `mistral`, `general` | - |
| `images` | On | `POST /images/generations` | `openai`, `azureopenai`, `gemini_chatcompletions`, `general` | - |
| | | `POST /images/edits` | `openai`, `general`, `azureopenai` (multipart) | - |
| | | `POST /images/variations` | `openai` (multipart) | - |
| `completions` | On | `POST /completions` | `openai`, `azureopenai`, `deepseek` (FIM beta), `cerebras`, `general` | ✓ |
| `files` | Off | `POST`, `GET /files`; `GET`, `DELETE /files/{file_id}`; `GET /files/{file_id}/content` | `openai`, `azureopenai`, `mistral`, `xai` | - |
| `batches` | Off | `POST`, `GET /batches`; `GET /batches/{batch_id}`; `POST /batches/{batch_id}/cancel` | `openai`, `azureopenai`, `mistral` | - |
| `videos` | Off | `POST /videos`; `GET /videos`; `GET`, `DELETE /videos/{video_id}`; `GET /videos/{video_id}/content` | `openai` | - |

Every path also works without `/v1` (for example `/openai_compatible/moderations`).

### What changed for each provider

| Provider type | Families it now serves |
|---------------|------------------------|
| `mistral` (new) | moderations, files, batches; OCR and FIM on its [vendor routes](#vendor-routes) |
| `xai` (new) | files; images, videos and batches on its [vendor routes](#vendor-routes) |
| `openai` | moderations, images, completions, files, batches, videos |
| `azureopenai` | images (generations, edits), completions, files, batches |
| `gemini_chatcompletions` | images (generations) |
| `deepseek` | completions (FIM through DeepSeek's beta endpoint) |
| `cerebras` (new) | completions |
| `general` | moderations, images (generations, edits), completions |

The new providers also serve existing endpoints: `mistral` serves chat, embeddings and transcription, `xai` serves chat, and `xai_responses` serves the Responses API. See [xAI and Mistral](../apps-and-providers/provider-support#xai-and-mistral).

### Vendor adapters

- **Mistral moderations** add OpenAI's per-result `flagged` field.
- **Mistral batches** map to Mistral's batch jobs API, with job statuses converted to OpenAI's.

xAI is not in the `completions` family: xAI rejects `/v1/completions` for every current model.

Cerebras serves `completions` only. Its files and batches APIs are a private preview, so the `files` and `batches` families do not route to `cerebras`. See [Cerebras](../apps-and-providers/provider-support#cerebras).

## Vendor routes

A vendor's own APIs have their own route under its prefix. The same family engine serves them, for that vendor's provider type only, and forwards the vendor's own request and response unchanged (no OpenAI-shape conversion), so vendor-only fields such as xAI's `aspect_ratio` and `resolution` or Mistral's `random_seed` pass through. Defaults, limits, logging and errors are the family's.

| Family | Default | Endpoints | Provider type | Streaming |
|--------|---------|-----------|---------------|:---------:|
| `ocr` | On | `POST /mistral/v1/ocr` | `mistral` | - |
| `completions` | On | `POST /mistral/v1/fim/completions` (Codestral FIM) | `mistral` | ✓ |
| `images` | On | `POST /xai/v1/images/generations`; `POST /xai/v1/images/edits` (JSON body) | `xai` | - |
| `videos` | Off | `POST /xai/v1/videos/generations`, `/xai/v1/videos/edits`, `/xai/v1/videos/extensions`; `GET /xai/v1/videos/{request_id}` | `xai` | - |
| `batches` | Off | `POST`, `GET /xai/v1/batches`; `GET /xai/v1/batches/{batch_id}`; `POST`, `GET /xai/v1/batches/{batch_id}/requests`; `GET /xai/v1/batches/{batch_id}/results`; `POST /xai/v1/batches/{batch_id}:cancel` | `xai` | - |

A key of another provider type gets `400 unsupported_provider_for_<family>`. On an app with several providers the route uses the vendor's connection for the requested model; batch and video calls, which carry no model, use the app's only connection of that type. xAI's Responses API has its own vendor route too, `/xai/v1/responses`, described in [xAI and Mistral](../apps-and-providers/provider-support#vendor-routes).

## Examples

```bash
# Moderation (OpenAI or Mistral model)
curl https://guardrails.quilr.ai/openai_compatible/v1/moderations \
  -H "Authorization: Bearer $QUILR_KEY" -H "Content-Type: application/json" \
  -d '{"model": "mistral-moderation-latest", "input": "Some text to classify"}'

# Image generation
curl https://guardrails.quilr.ai/openai_compatible/v1/images/generations \
  -H "Authorization: Bearer $QUILR_KEY" -H "Content-Type: application/json" \
  -d '{"model": "gpt-image-1", "prompt": "A plain white square.", "n": 1}'

# xAI image generation on its vendor route, with xAI's own fields
curl https://guardrails.quilr.ai/xai/v1/images/generations \
  -H "Authorization: Bearer $QUILR_KEY" -H "Content-Type: application/json" \
  -d '{"model": "grok-imagine-image", "prompt": "A plain white square.", "aspect_ratio": "16:9"}'

# Batches and files route by provider label, not model
curl https://guardrails.quilr.ai/openai_compatible/v1/batches/batch_123 \
  -H "Authorization: Bearer $QUILR_KEY" -H "X-Provider-Label: mistral-prod"
```

The OpenAI SDKs work unchanged: point `base_url` at `https://<region>/openai_compatible/v1` and call `client.moderations.create`, `client.images.generate` or `client.completions.create`.

## Choosing the provider

- **Model-based calls** (moderations, images, OCR, completions, and creating files, batches or videos): the gateway uses the enabled provider that has the requested `model` and serves that operation. `model` is required.
- **ID-based calls** (`/files/{file_id}`, `/batches/{batch_id}`, `/videos/{video_id}`, and lists): IDs belong to the provider that created them. When more than one provider on the app can serve the call, send `provider_label` or `X-Provider-Label`. IDs must match `[A-Za-z0-9][A-Za-z0-9._:@=-]{0,255}`.
- `provider`, `provider_label`, `X-Provider-Name` and `X-Provider-Label` work as on other endpoints and are removed before the request goes upstream.

## What applies on family routes

| Control | Applies |
|---------|:-------:|
| Quilr key auth, identity and source-IP checks | ✓ |
| Model allow-lists and model access | ✓ |
| Routing groups | ✓ |
| Rate, concurrency and token limits, quotas | ✓ |
| Request logging | ✓ |
| DLP guardrails (request or response) | - |

:::warning Not scanned by guardrails
Family routes are not scanned for sensitive data. A Policy Engine detection rule on these surfaces reports `unsupported_route_capability`. Use the chat, Responses or embeddings endpoints where content must be scanned, or restrict which models an app can reach.
:::

**Usage accounting:** `completions` and `images` count tokens and spend like chat and enforce output-token limits. `moderations`, `ocr`, `files`, `batches` and `videos` count requests. An image response without token counts charges no tokens; the provider's usage is kept on the log.

**Logging:** each request is logged with its family and operation. Base64 payloads are left out of the log and logged bodies are capped (256 KiB by default). File and video downloads stream through byte for byte.

## Enabling families

Moderations, images, OCR and completions are on by default. Files, batches and videos are off by default because their ID-based calls are not tied to an app's model list. On self-hosted gateways the operator sets `LLMGATEWAY_ENDPOINT_FAMILIES`:

| Value | Result |
|-------|--------|
| Unset or empty | `moderations,images,ocr,completions` |
| Comma-separated list, for example `moderations,images,files,batches` | Only those families |
| `all` | Every family |
| `none` | No family routes |

On QuilrAI-hosted gateways, contact QuilrAI to turn on files, batches or videos.

| Setting | Default |
|---------|---------|
| `LLMGATEWAY_FAMILY_MAX_BODY_BYTES` (maximum request body) | 100 MiB |
| `LLMGATEWAY_FAMILY_LOG_MAX_BYTES` (logged body cap) | 256 KiB |
| `LLMGATEWAY_FAMILY_MAX_CONNECTIONS` (upstream connection pool) | 100 |

## Errors

Errors use the OpenAI shape `{"error": {"message", "type", "code"}}`. Errors from the provider are passed through with their status, body and `retry-after`.

| Status | Code | When |
|--------|------|------|
| 404 | `endpoint_not_enabled` | The family is turned off: `The {family} endpoints are not enabled on this gateway.` |
| 400 | `unsupported_provider_for_<family>` | The selected provider does not serve that operation. |
| 400 | `streaming_not_supported` | `stream: true` on a non-streaming operation or provider. |
| 400 | `unsupported_content_type` | Wrong body type, for example a multipart body on `/xai/v1/images/edits`. |
| 400 | `missing_required_parameter` | `model` is missing. |
| 400 | `provider_label_required` | An ID-based call matches several providers and has no label. |
| 400 | `provider_not_found`, `ambiguous_provider_label` | The label matches no provider, or several. |
| 400 | `invalid_path_parameter` | A file, batch or video ID has invalid characters. |
| 403 | `model_access_denied` | The model is not enabled on the labeled provider. |
| 413 | `request_too_large` | The body exceeds the size limit. |

## Related

- [xAI and Mistral](../apps-and-providers/provider-support#xai-and-mistral)
- [Provider Support](../apps-and-providers/provider-support)
- [Security Guardrails - Endpoint coverage](../protect/security-guardrails#endpoint-coverage)
