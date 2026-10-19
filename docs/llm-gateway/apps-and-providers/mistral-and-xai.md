---
sidebar_position: 7
sidebar_label: "Mistral AI and xAI Grok"
sidebar_custom_props:
  badge: new
  icon: Sparkles
description: "Connect Mistral AI and xAI Grok to the LLM Gateway with one API key each, and call chat, embeddings, transcription, moderation, OCR, fill-in-the-middle, image generation and the xAI Responses API through the gateway."
aliases: [mistral, mistral ai, xai, grok, codestral, voxtral, grok imagine]
---

# Mistral AI and xAI Grok

Mistral AI and xAI (Grok) are direct providers. You paste one API key and the gateway calls the vendor's own API. Your code keeps using a Quilr key and the standard gateway endpoints, so there is no Mistral- or xAI-specific path or model prefix.

| Provider type | Console tile and API | Upstream | What one key serves |
|---------------|----------------------|----------|---------------------|
| `mistral` | **Mistral AI** › Chat completions | `https://api.mistral.ai/v1` | Chat, embeddings, transcription, moderation, document OCR, Codestral fill-in-the-middle (FIM). Files and batch jobs when enabled. |
| `xai` | **xAI** › Chat completions | `https://api.x.ai/v1` | Chat, Grok Imagine image generation and image edits. Files, batches and video generation when enabled. |
| `xai_responses` | **xAI** › Responses | `https://api.x.ai/v1` | The Responses API, which xAI recommends for new integrations. |

## Add the provider

1. Open **Settings > Models > Models** and click **Add your own models**. The same picker appears when you create an app or edit an app's providers.
2. Type `mistral`, `grok` or `xai` in **Search provider types** (placeholder: *Search by vendor or API*). Search is not case-sensitive and matches the vendor name, tagline, description and API names, so queries such as `ocr`, `image` or `batch` also find these tiles.
3. Select the **Mistral AI** or **xAI** tile. For xAI, choose **Chat completions** or **Responses** under **Which API does the gateway talk to?**. Mistral has one API, so there is no choice.
4. Keep or edit the suggested **Provider label** and paste the **API key**. There is no Base URL, region or API version field: the upstream URL is fixed by QuilrAI, and any `base_url` sent through the Management API is ignored.
5. Click **Check key and list models**, select the models, set pricing and save. See [Providers and Models](./providers-and-models#add-a-provider) for the full flow.

| Field | API name | Required |
|-------|----------|----------|
| Provider label | `provider_label` | Yes. Letters, numbers, spaces, `_`, `-` and `.`. |
| API key | `api_key` | Yes. In edit mode, leave it blank to keep the saved key. |
| Models | `models` | At least one. |

### Model discovery

- **Mistral** lists models from `/v1/models` and sorts each one into chat, embedding, moderation, OCR, transcription or FIM from Mistral's capability flags. Archived models are hidden.
- **xAI** lists language models, plus image and video generation models where your key can reach them. `xai_responses` lists language models only.
- Selected chat models get a short test call when you validate them.

Enable every model you call, on every API. A Mistral embedding or OCR model has to be selected on the provider just like a chat model.

## Call the gateway

Use a [regional base URL](../get-started/integration-guide#region) and your Quilr key (`Authorization: Bearer <Quilr key>`).

| What you want | Endpoint | Mistral | xAI | Example model |
|---------------|----------|:-------:|:---:|---------------|
| Chat | `/openai_compatible/v1/chat/completions` | ✓ | ✓ | `mistral-large-latest`, `ministral-8b-latest`, `grok-4.20-0309-non-reasoning` |
| Responses | `/openai_responses/v1/responses` | - | ✓ (`xai_responses`) | `grok-4.20-0309-non-reasoning` |
| Embeddings | `/openai_compatible/v1/embeddings` | ✓ | - | `mistral-embed` |
| Speech to text | `/openai_compatible/v1/audio/transcriptions` | ✓ | - | `voxtral-mini-latest` |
| Moderation | `/openai_compatible/v1/moderations` | ✓ | - | `mistral-moderation-latest` |
| Document OCR | `/openai_compatible/v1/ocr` | ✓ | - | `mistral-ocr-latest` |
| Fill-in-the-middle | `/openai_compatible/v1/completions` | ✓ | - | `codestral-latest` |
| Image generation | `/openai_compatible/v1/images/generations` | - | ✓ | `grok-imagine-image` |
| Image edits | `/openai_compatible/v1/images/edits` | - | ✓ (JSON body) | `grok-imagine-image` |
| Files, batches | `/openai_compatible/v1/files`, `/batches` | ✓ | ✓ | - |
| Video generation | `/openai_compatible/v1/videos` | - | ✓ | - |

Moderation, OCR, FIM, images, files, batches and videos are [endpoint families](../api-reference/endpoint-families). Files, batches and videos are off by default.

### Examples

```bash
# Mistral chat
curl https://guardrails.quilr.ai/openai_compatible/v1/chat/completions \
  -H "Authorization: Bearer $QUILR_KEY" -H "Content-Type: application/json" \
  -d '{"model": "ministral-8b-latest", "messages": [{"role": "user", "content": "Hello"}], "max_tokens": 128}'

# Codestral fill-in-the-middle (streaming works too)
curl https://guardrails.quilr.ai/openai_compatible/v1/completions \
  -H "Authorization: Bearer $QUILR_KEY" -H "Content-Type: application/json" \
  -d '{"model": "codestral-latest", "prompt": "def add(a, b):\n    return", "suffix": "\n\nprint(add(1, 2))", "max_tokens": 32}'

# Mistral document OCR (Mistral request shape)
curl https://guardrails.quilr.ai/openai_compatible/v1/ocr \
  -H "Authorization: Bearer $QUILR_KEY" -H "Content-Type: application/json" \
  -d '{"model": "mistral-ocr-latest", "document": {"type": "document_url", "document_url": "https://example.com/invoice.pdf"}}'

# Mistral transcription
curl https://guardrails.quilr.ai/openai_compatible/v1/audio/transcriptions \
  -H "Authorization: Bearer $QUILR_KEY" \
  -F file=@hello.wav -F model=voxtral-mini-latest

# xAI image generation
curl https://guardrails.quilr.ai/openai_compatible/v1/images/generations \
  -H "Authorization: Bearer $QUILR_KEY" -H "Content-Type: application/json" \
  -d '{"model": "grok-imagine-image", "prompt": "A plain white square.", "n": 1}'
```

```python
from openai import OpenAI

client = OpenAI(base_url="https://guardrails.quilr.ai/openai_responses/v1", api_key=QUILR_KEY)
resp = client.responses.create(model="grok-4.20-0309-non-reasoning", input="Say hello", max_output_tokens=128)
print(resp.output_text)
```

If an app has several providers that serve the same model, pick one with `provider_label` or `X-Provider-Label`. See [Selecting a Provider](./provider-support#selecting-a-provider-on-multi-provider-apps).

## Provider behavior

| Topic | Mistral AI | xAI |
|-------|-----------|-----|
| Output limit | Send `max_tokens`. Mistral has no `max_completion_tokens` and no `stream_options`. | `max_completion_tokens` is accepted. The gateway requests streaming usage for you. |
| Rejected fields | Unsupported fields come back as Mistral's own HTTP 422. | Reasoning models reject `presence_penalty`, `frequency_penalty` and `stop`; the error is passed through. |
| Streaming | Chat and FIM. Reasoning streams that send `delta.content` as a list of parts are supported. | Chat and Responses. |
| Moderation | The response gets OpenAI's per-result `flagged` field (true when any category is true). | - |
| FIM | `seed` becomes `random_seed`. `n`, `best_of`, `echo`, `logprobs`, `logit_bias`, penalties and `user` are dropped. The response uses OpenAI's `choices[].text`. | Not available: xAI rejects `/v1/completions` for every current model. |
| Images | - | `size`, `quality`, `style`, `background`, `moderation`, `output_compression`, `output_format` and `user` are dropped. Image edits take a JSON body, not multipart. |
| Responses | - | Create, retrieve and delete. `cancel` and `input_items` return `400 operation_not_supported`. |
| Not available | Audio translations, Anthropic Messages endpoint. | Legacy completions, Anthropic Messages endpoint. |

Dropped fields are recorded on the request log.

## Guardrails, routing and limits

- **Chat, Responses, embeddings and transcription** get the same [guardrails](../protect/security-guardrails#endpoint-coverage) as any other provider.
- **Moderation, OCR, FIM, images, files, batches and videos** are not scanned by DLP. Access controls, model allow-lists, rate and token limits and quotas still apply. See [Endpoint Families](../api-reference/endpoint-families#what-applies-on-family-routes).
- **Routing groups:** `mistral` and `xai` join **Chat Completions** groups; `xai_responses` joins **OpenAI Responses** groups. See [Routing and Fallbacks](../cost-and-traffic/routing-and-fallbacks#which-surfaces-a-group-can-mix).

## Related

- [Provider Support](./provider-support)
- [Endpoint Families](../api-reference/endpoint-families)
- [LLM Gateway Playground](/llm-gateway-playground)
