---
sidebar_position: 8
sidebar_custom_props:
  badge: new
  icon: Route
---

# Unified Completions

Use OpenAI Chat Completions clients with provider-native chat models. QuilrAI accepts an OpenAI-style `/chat/completions` request, translates it to the selected provider, and returns an OpenAI-shaped chat completion response.

Provider notes verified:

- AWS Bedrock translation: May 13, 2026
- Vertex AI translation: June 9, 2026
- Anthropic Messages translation: June 9, 2026

## Scope

This page covers translated providers on:

```text
/openai_compatible/v1/chat/completions
```

| Provider key | Upstream call | Model value | Streaming | Content support |
|--------------|---------------|-------------|-----------|-----------------|
| `bedrock` | Bedrock `Converse` / `ConverseStream` | Selected Bedrock model ID or inference profile ID | Yes | Text only |
| `vertex_ai` | Vertex AI Gemini `generateContent` / `streamGenerateContent` | Selected Gemini model name | Yes | Text only |
| `anthropic_messages` | Anthropic Messages `messages.create` / streaming | Selected Claude model name | Yes | Text only |
| `anthropic_messages_bedrock` | Anthropic Messages on Bedrock | Selected Bedrock Claude model ID | Yes | Text only |
| `anthropic_messages_azure` | Azure Anthropic Messages | Selected Claude model name | Yes | Text only |

This page does not cover:

- OpenAI, Azure OpenAI, Anthropic OpenAI-compatible, DeepSeek, Gemini public API, or custom providers that already expose an OpenAI-compatible upstream API
- Native Vertex AI `/vertex_ai/` routes
- Native Anthropic Messages `/anthropic_messages/` routes
- AWS Bedrock Runtime boto3 routes such as `/bedrock-runtime/model/{model_id}/converse`
- Bedrock embeddings or rerank
- OpenAI Responses API

Use Unified Completions when your application already speaks OpenAI Chat Completions and you want to call selected Bedrock, Vertex AI Gemini, or Anthropic Messages models without switching SDKs.

:::info Native multimodal routes
The translated OpenAI-compatible path is text-only today. Use native Vertex AI, Anthropic Messages, or Bedrock Runtime routes when you need provider-native image, audio, video, document, or other multimodal request shapes.
:::

## Request Flow

1. Create an LLM Gateway key with provider `bedrock`, `vertex_ai`, `anthropic_messages`, `anthropic_messages_bedrock`, or `anthropic_messages_azure`.
2. Select the models that the key is allowed to call.
3. Point your OpenAI SDK or OpenAI-compatible wrapper at the closest regional endpoint, such as `https://guardrails-usa-2.quilr.ai/openai_compatible/`.
4. Send the provider model name in the OpenAI SDK `model` parameter.
5. QuilrAI translates the OpenAI-style request to the provider-native chat API and translates the provider response back to OpenAI Chat Completions.

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://guardrails-usa-2.quilr.ai/openai_compatible/",
    api_key="sk-quilr-xxx",
)

response = client.chat.completions.create(
    model="amazon.nova-lite-v1:0",
    messages=[{"role": "user", "content": "Summarize this in one sentence."}],
    max_tokens=256,
)

print(response.choices[0].message.content)
```

For Vertex AI Gemini, use the same OpenAI client configuration and pass a selected Gemini model:

```python
response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{"role": "user", "content": "Write a concise release note."}],
    max_tokens=256,
)
```

For Anthropic Messages, use the same OpenAI client configuration and pass a selected Claude model:

```python
response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Write a concise release note."}],
    max_tokens=256,
)
```

The normal gateway behavior still applies: authentication, provider and model routing, prompt-store substitution, request-side DLP, response-side DLP for non-streaming responses, logging, rate limits, token estimates, Guardian checks, and performance metrics.

## Common Contract

These translators use allowlists. Unknown OpenAI parameters are rejected instead of silently dropped.

| OpenAI parameter | Bedrock support | Vertex AI support | Anthropic Messages support |
|------------------|-----------------|-------------------|----------------------------|
| `messages` | Supported | Supported | Supported |
| `model` | Selected Bedrock model ID or inference profile ID | Selected Gemini model name | Selected Claude model name or Bedrock Claude model ID |
| `stream` | Bedrock `ConverseStream` | Vertex `streamGenerateContent` | Anthropic Messages streaming |
| `max_tokens` | `inferenceConfig.maxTokens` | `generationConfig.maxOutputTokens` | `max_tokens` |
| `max_completion_tokens` | `inferenceConfig.maxTokens` | `generationConfig.maxOutputTokens` | `max_tokens` |
| `temperature` | `inferenceConfig.temperature` | `generationConfig.temperature` | `temperature` |
| `top_p` | `inferenceConfig.topP` | `generationConfig.topP` | `top_p` |
| `stop` | `inferenceConfig.stopSequences` | `generationConfig.stopSequences` | `stop_sequences` |
| `tools` | Function tools | Function declarations | Anthropic tools |
| `functions` | Legacy function tools | Legacy function declarations | Legacy function tools |
| `tool_choice` | `auto`, `none`, `required`, and function-specific choices | `auto`, `none`, `required`, and function-specific choices | `auto`, `none`, `required`, and function-specific choices |
| `function_call` | Supported | Supported | Supported |
| `response_format` | `text`, `json_schema` | `text`, `json_object`, `json_schema` | `text` only |
| `stream_options` | `include_usage` | `include_usage` | `include_usage` |
| `parallel_tool_calls` | Accepted as a boolean; `false` is not enforced | Accepted as a boolean; `false` is not enforced | Accepted as a boolean; `false` is not enforced |
| `n` | Must be absent or `1` | Must be absent or `1` | Must be absent or `1` |
| `metadata` | Accepted, not sent upstream | Accepted, not sent upstream | Sent as Anthropic `metadata` |
| `user` | Accepted, not sent upstream | Accepted, not sent upstream | Sent as `metadata.user_id` when not already set |
| `system` | Rejected | Rejected | Accepted as a top-level convenience field and merged with system/developer messages |
| `frequency_penalty` | Rejected | `generationConfig.frequencyPenalty` | Rejected |
| `presence_penalty` | Rejected | `generationConfig.presencePenalty` | Rejected |
| `seed` | Rejected | `generationConfig.seed` | Rejected |

`max_tokens` and `max_completion_tokens` can both be present only when they have the same value. Token limits must be positive integers. `stop` must be a string or a list of strings.

Anthropic Messages requires `max_tokens`; if both `max_tokens` and `max_completion_tokens` are omitted, QuilrAI sends `max_tokens: 1024`.

Common rejected OpenAI parameters include `logit_bias`, `logprobs`, `top_logprobs`, `reasoning_effort`, `modalities`, `audio`, `store`, `service_tier`, `prediction`, and provider-specific `extra_body`.

## Message Support

| OpenAI role | Bedrock translation | Vertex AI translation | Anthropic Messages translation |
|-------------|---------------------|-----------------------|--------------------------------|
| `system` | Top-level Bedrock `system` block | Top-level `systemInstruction.parts` | Top-level Anthropic `system` |
| `developer` | Top-level Bedrock `system` block | Top-level `systemInstruction.parts` | Top-level Anthropic `system` |
| `user` | Bedrock message with role `user` | Vertex content with role `user` | Anthropic message with role `user` |
| `assistant` | Bedrock message with role `assistant` | Vertex content with role `model` | Anthropic message with role `assistant` |
| `tool` | Bedrock `toolResult` block when tools are active | Vertex `functionResponse` part | Anthropic `tool_result` block |
| `function` | Bedrock `toolResult` block for legacy function history | Vertex `functionResponse` part | Anthropic `tool_result` block |

Content is text-only on translated paths:

- String content is supported.
- Content arrays are supported only when every part is text-like.
- Images, audio, files, Bedrock document blocks, Bedrock image blocks, Vertex inline media, Vertex file data, Anthropic image blocks, and Anthropic document blocks are not supported on this OpenAI-compatible path.

## Tools and Function Calling

OpenAI `tools` are supported when each tool is `type: "function"`.

| OpenAI field | Bedrock field | Vertex AI field | Anthropic Messages field |
|--------------|---------------|-----------------|--------------------------|
| `tools[].function.name` | `toolSpec.name` | `functionDeclarations[].name` | `tools[].name` |
| `tools[].function.description` | `toolSpec.description` | `functionDeclarations[].description` | `tools[].description` |
| `tools[].function.parameters` | `toolSpec.inputSchema.json` | `functionDeclarations[].parameters` | `tools[].input_schema` |
| `tools[].function.strict` | `toolSpec.strict` | Validated through schema handling; not emitted as a Vertex field | Not translated |

Legacy OpenAI `functions` and `function_call` are also supported.

Modern `assistant.tool_calls` entries should include `id`. Bedrock and Anthropic Messages reject tool calls without IDs because the later tool result would have no stable identifier. Vertex maps modern `assistant.tool_calls` and legacy `assistant.function_call` to `functionCall` parts, parsing JSON argument strings when possible.

### Tool Choice

| OpenAI `tool_choice` | Bedrock behavior | Vertex AI behavior | Anthropic Messages behavior |
|----------------------|------------------|--------------------|-----------------------------|
| absent | No explicit Bedrock `toolChoice` | No Vertex `toolConfig` | No Anthropic `tool_choice` |
| `auto` | No explicit Bedrock `toolChoice` | No Vertex `toolConfig` | `{"type": "auto"}` |
| `none` | No Bedrock `toolConfig`; tool history is serialized as text | `functionCallingConfig.mode = "NONE"` | No tools are sent |
| `required` | Bedrock `toolChoice.any` | `functionCallingConfig.mode = "ANY"` | `{"type": "any"}` |
| function-specific choice | Bedrock `toolChoice.tool.name` | `functionCallingConfig.mode = "ANY"` with `allowedFunctionNames` | `{"type": "tool", "name": ...}` |

If a request requires a tool but no tools are present, QuilrAI rejects the request before the upstream call.

### Parallel Tool Results

OpenAI-compatible clients often send one `role: "tool"` message per tool call:

```json
[
  {"role": "assistant", "tool_calls": [{"id": "call_a"}, {"id": "call_b"}]},
  {"role": "tool", "tool_call_id": "call_a", "content": "result A"},
  {"role": "tool", "tool_call_id": "call_b", "content": "result B"}
]
```

Bedrock, Vertex AI, and Anthropic Messages expect matching tool results for a model turn to stay together in the next user-side content entry. QuilrAI groups consecutive OpenAI `role: "tool"` or `role: "function"` messages into one provider-native user message containing multiple tool-result blocks.

This grouping matters for parallel tool calls. Sending each tool result as a separate provider turn can produce upstream validation errors about missing tool results or function responses.

## Structured Output

| `response_format` | Bedrock support | Vertex AI support | Anthropic Messages support |
|-------------------|-----------------|-------------------|----------------------------|
| `{"type": "text"}` | Supported | Supported | Supported |
| `{"type": "json_object"}` | Rejected | Maps to `generationConfig.responseMimeType = "application/json"` | Rejected |
| `{"type": "json_schema", "json_schema": {...}}` | Supported on Bedrock models that accept `outputConfig` | Maps to `generationConfig.responseMimeType = "application/json"` plus `generationConfig.responseSchema` | Rejected |

For Bedrock `json_schema`, QuilrAI maps:

| OpenAI field | Bedrock field |
|--------------|---------------|
| `json_schema.name` | `outputConfig.textFormat.jsonSchema.name` |
| `json_schema.description` | `outputConfig.textFormat.jsonSchema.description` |
| `json_schema.schema` | `outputConfig.textFormat.jsonSchema.schema` |

`json_schema.strict` is validated as a boolean, but it is not separately mapped. Bedrock structured output is schema-constrained through `outputConfig.textFormat`.

For Vertex AI `json_schema`, QuilrAI sanitizes the OpenAI schema into the subset accepted by Vertex Gemini. `name`, `description`, and `strict` are type-checked but are not emitted as separate Vertex fields.

Vertex schema normalization:

- Local `$ref` values are inlined.
- Cyclic or unresolvable local refs are rejected.
- Nullable single-type unions collapse to `type` plus `nullable: true`.
- Unsupported JSON Schema metadata keys are dropped.
- `oneOf` and `anyOf` are accepted only for nullable single-type unions.
- Other union arrays are rejected.

Dropped Vertex schema metadata keys include `$defs`, `$id`, `$schema`, `additionalProperties`, `default`, `definitions`, `patternProperties`, `title`, `allOf`, and unsupported `oneOf` or `anyOf`. Schema property names are preserved; for example, a property named `default` remains valid.

Anthropic Messages does not map OpenAI JSON mode or structured output on this translated path today. Only `{"type": "text"}` is accepted.

## Streaming Responses

Streaming returns OpenAI-compatible server-sent events.

| Provider | Upstream stream | OpenAI stream behavior |
|----------|-----------------|------------------------|
| Bedrock | `ConverseStream` | Bedrock message, text, tool-use, stop, and usage events are converted to OpenAI deltas |
| Vertex AI | `streamGenerateContent` with `alt=sse` | Vertex candidate text, function calls, finish reasons, and usage metadata are converted to OpenAI deltas |
| Anthropic Messages | Anthropic Messages stream | Anthropic message, text, tool-use, stop, and usage events are converted to OpenAI deltas |

When `stream_options.include_usage` is true, Bedrock emits usage chunks from `metadata.usage`; Vertex emits one final usage chunk using the latest `usageMetadata` observed in the stream; Anthropic Messages emits one final usage chunk from tracked input and output token counts.

Streaming response-side DLP is not applied on this path. QuilrAI performs request-side scanning, forwards chunks, and accumulates text and tool-call data for logging.

## Non-Streaming Responses

Non-streaming provider responses are converted back to OpenAI chat completions:

- Provider text parts are joined into `choices[].message.content`.
- Provider tool-use or function-call parts become OpenAI `choices[].message.tool_calls`.
- Tool-call-only responses return `message.content: null`.
- Provider usage maps to OpenAI `prompt_tokens`, `completion_tokens`, and `total_tokens`.

Bedrock finish reason mapping:

| Bedrock stop reason | OpenAI finish reason |
|---------------------|----------------------|
| `end_turn` | `stop` |
| `stop_sequence` | `stop` |
| `max_tokens` | `length` |
| `tool_use` | `tool_calls` |
| `content_filtered` | `content_filter` |
| `guardrail_intervened` | `content_filter` |

Unknown Bedrock stop reasons pass through unchanged.

Anthropic Messages finish reason mapping:

| Anthropic stop reason | OpenAI finish reason |
|-----------------------|----------------------|
| `end_turn` | `stop` |
| `stop_sequence` | `stop` |
| `max_tokens` | `length` |
| `tool_use` | `tool_calls` |
| `pause_turn` | `stop` |
| `refusal` | `content_filter` |

Vertex AI finish reason mapping:

| Vertex finish reason | OpenAI finish reason |
|----------------------|----------------------|
| `STOP` | `stop` |
| `MAX_TOKENS` | `length` |
| `SAFETY` | `content_filter` |
| `RECITATION` | `content_filter` |
| `BLOCKLIST` | `content_filter` |
| `PROHIBITED_CONTENT` | `content_filter` |
| `SPII` | `content_filter` |
| `IMAGE_SAFETY` | `content_filter` |
| `FINISH_REASON_UNSPECIFIED` | `null` |

Unmapped Vertex reasons become `stop`. Any Vertex response containing function calls returns `finish_reason: "tool_calls"`.

Vertex usage details include:

| Vertex usage field | OpenAI usage field |
|--------------------|--------------------|
| `promptTokenCount` | `prompt_tokens` |
| `candidatesTokenCount` plus `thoughtsTokenCount` | `completion_tokens` |
| `totalTokenCount` | `total_tokens` |
| `thoughtsTokenCount` | `completion_tokens_details.reasoning_tokens` |
| `cachedContentTokenCount` | `prompt_tokens_details.cached_tokens` |

Anthropic Messages usage maps `usage.input_tokens` to `prompt_tokens`, `usage.output_tokens` to `completion_tokens`, and their sum to `total_tokens`.

## Provider Setup

### Anthropic Messages

Create an LLM Gateway key with provider `anthropic_messages`, `anthropic_messages_bedrock`, or `anthropic_messages_azure`.

| Provider | Auth mode | Required fields | Optional fields |
|----------|-----------|-----------------|-----------------|
| Anthropic Messages | API Key | `api_key` | `anthropic_version` |
| Anthropic Messages on Bedrock | Static AWS keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| Anthropic Messages on Bedrock | Assume role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |
| Azure Anthropic Messages | API Key | `api_key`, `base_url` | `anthropic_version` |

Direct Anthropic and Azure Anthropic default `anthropic_version` to `2023-06-01`. Anthropic Messages on Bedrock uses the same Bedrock credential resolver as the native Anthropic Messages Bedrock endpoint.

### AWS Bedrock

Create an LLM Gateway key with provider `bedrock`.

| Auth mode | Required fields | Optional fields |
|-----------|-----------------|-----------------|
| Static AWS keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| Assume role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |

Select one or more Bedrock chat models that support `Converse`. Send `model` as the Bedrock model ID or inference profile ID.

AWS Bedrock default region: `us-east-1`. For assume-role setup, see [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md).

### Vertex AI

Create an LLM Gateway key with provider `vertex_ai`.

| Auth mode | Required fields | Optional fields | Notes |
|-----------|-----------------|-----------------|-------|
| Express | `api_key` | - | Uses `x-goog-api-key`; no project ID required |
| API Key | `api_key`, `gcp_project_id` | `gcp_region` | Default region: `us-central1` |
| Service Account | `service_account_json` | `gcp_project_id`, `gcp_region` | Project ID can be derived from the JSON |
| ADC | `gcp_project_id` | `gcp_region` | Uses Application Default Credentials |

Model listing for Vertex AI is best effort. Service-account and ADC auth fetch Gemini models from Vertex Model Garden and fall back to a curated Gemini list if fetching fails.

## Error Handling

QuilrAI returns OpenAI-shaped error responses for adapter validation failures and preserves upstream provider error messages where possible.

Common Bedrock adapter error codes:

| Error code | Meaning |
|------------|---------|
| `unsupported_bedrock_openai_parameter` | The request included a parameter that is not translated for Bedrock. |
| `invalid_bedrock_openai_parameter` | A supported parameter had an invalid value or type. |
| `unsupported_bedrock_openai_content` | The request included unsupported content such as image, audio, or file parts. |
| `invalid_bedrock_openai_messages` | Message order or tool-result history was invalid. |
| `unsupported_bedrock_openai_role` | The request included an unsupported role. |
| `invalid_bedrock_openai_tools` | Tool definitions or tool-call history were malformed. |
| `unsupported_bedrock_openai_tools` | The request used a tool shape that cannot be translated. |
| `bedrock_credentials_error` | Bedrock credentials could not be loaded or used. |
| `bedrock_converse_error` | Bedrock `Converse` returned an error. |
| `bedrock_converse_stream_error` | Bedrock `ConverseStream` returned an error. |

Common Anthropic Messages adapter error codes:

| Error code | Meaning |
|------------|---------|
| `unsupported_anthropic_openai_parameter` | The request included a parameter that is not translated for Anthropic Messages. |
| `invalid_anthropic_openai_parameter` | A supported parameter had an invalid value or type. |
| `unsupported_anthropic_openai_content` | The request included unsupported content such as image, audio, file, image block, or document block parts. |
| `invalid_anthropic_openai_messages` | Message order or tool-result history was invalid. |
| `unsupported_anthropic_openai_role` | The request included an unsupported role. |
| `invalid_anthropic_openai_tools` | Tool definitions or tool-call history were malformed. |
| `unsupported_anthropic_openai_tools` | The request used a tool shape that cannot be translated. |
| `missing_provider_key` | The Anthropic provider API key is missing. |
| `missing_azure_anthropic_base_url` | The Azure Anthropic provider is missing `base_url`. |
| `anthropic_messages_bedrock_credentials_error` | Bedrock credentials could not be loaded or used for Anthropic Messages on Bedrock. |
| `anthropic_messages_bedrock_package_missing` | The Anthropic Bedrock package required for the upstream call is missing. |
| `anthropic_messages_error` | Anthropic Messages returned an error. |
| `anthropic_messages_stream_error` | Anthropic Messages streaming returned an error. |

Common Vertex AI adapter error codes:

| Error code | Meaning |
|------------|---------|
| `unsupported_vertex_openai_parameter` | The request included a parameter that is not translated for Vertex AI. |
| `invalid_vertex_openai_parameter` | A supported parameter had an invalid value or type. |
| `unsupported_vertex_openai_content` | The request included unsupported content such as image, audio, file, or inline media parts. |
| `invalid_vertex_openai_messages` | Message order or tool-result history was invalid. |
| `unsupported_vertex_openai_role` | The request included an unsupported role. |
| `invalid_vertex_openai_tools` | Tool definitions or tool-call history were malformed. |
| `unsupported_vertex_openai_tools` | The request used a tool shape that cannot be translated. |
| `vertex_credentials_error` | Vertex credentials could not be loaded or used. |
| `vertex_generate_content_error` | Vertex `generateContent` returned an error. |
| `vertex_generate_content_timeout` | Vertex `generateContent` timed out. |
| `vertex_generate_content_parse_error` | A Vertex `generateContent` response could not be parsed. |
| `vertex_stream_generate_content_error` | Vertex `streamGenerateContent` returned an error. |
| `vertex_stream_timeout` | The Vertex stream timed out. |
| `vertex_stream_parse_error` | A Vertex stream event could not be parsed. |

Upstream Vertex HTTP errors are classified into OpenAI-style error types:

| Upstream status | OpenAI-style error type |
|-----------------|-------------------------|
| `401` | `authentication_error` |
| `429` | `rate_limit_error` |
| `4xx` | `invalid_request_error` |
| `5xx` | `upstream_error` |

## Guardrail Behavior

Request-side DLP scans user text before the upstream call. Non-streaming responses are scanned before they are returned to the client.

Streaming responses are different: request-side DLP still runs, but response-side DLP is skipped so chunks can pass through as they arrive.

Tool messages are carried through without changing tool IDs, function response names, or result ordering. Changing a `tool_call_id`, dropping a `role: "tool"` message, or reordering tool results can break provider tool-result validation.

## Expected Good Scenarios

These scenarios are covered by the translators:

- Plain text chat
- System, developer, user, and assistant text messages
- Non-streaming text responses
- Streaming text responses
- Provider tool calls translated back to OpenAI `tool_calls`
- Tool-call deltas in streaming responses
- Consecutive OpenAI tool result messages grouped into one provider-native tool-result user message
- Legacy OpenAI `functions`, `function_call`, and `role: "function"`
- Anthropic top-level `system` convenience field
- Vertex `response_format: json_object`
- Vertex `response_format: json_schema` with local refs and nullable single-type unions
- Bedrock `response_format: json_schema` on models that support `outputConfig`
- Vertex reasoning-token and cached-token usage details

## Expected Failures

These failures are intentional:

- OpenAI image, audio, or file content
- Mixed multimodal content arrays
- Multiple choices with `n > 1`
- Log probabilities
- Token bias
- Audio input or output modes
- Reasoning-effort controls
- Provider-specific `extra_body`
- Modern Bedrock `assistant.tool_calls` entries without `id`
- Tool result messages missing `tool_call_id`
- A user message immediately after assistant tool calls without matching tool results
- Parallel tool results that are not consecutive in the OpenAI message history and therefore cannot be grouped into one provider-native user turn
- Anthropic `response_format` values other than `{"type": "text"}`
- Bedrock `response_format: json_object`
- Bedrock `response_format: json_schema` on models that do not support `outputConfig`
- Vertex JSON Schema union arrays other than nullable single-type unions
- Vertex cyclic or unresolvable local JSON Schema refs

## Related Pages

- [Provider Support](./provider-support.md)
- [Integration Guide](./integration-guide.md)
- [AWS Bedrock - boto3 Runtime](./bedrock-boto3.md)
- [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md)
