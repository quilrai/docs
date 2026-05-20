---
sidebar_position: 8
sidebar_custom_props:
  badge: new
  icon: Route
---

# OpenAI to Bedrock Translation

Use OpenAI-compatible chat clients with AWS Bedrock models. QuilrAI accepts an OpenAI-style `/chat/completions` request, calls Bedrock `Converse` or `ConverseStream`, and returns an OpenAI-shaped chat completion response.

Last verified: May 13, 2026

## Scope

This page covers the `bedrock` provider on:

```text
/openai_compatible/v1/chat/completions
```

It does not cover:

- AWS Bedrock Runtime boto3 routes such as `/bedrock-runtime/model/{model_id}/converse`
- Anthropic Messages on Bedrock
- Bedrock embeddings or rerank
- OpenAI Responses API

Use this mode when your application already speaks OpenAI Chat Completions and you want to call selected Bedrock models without switching to boto3.

## Request Flow

1. Create an LLM Gateway key with provider `bedrock`.
2. Select one or more Bedrock chat models that support `Converse`.
3. Point your OpenAI SDK or OpenAI-compatible wrapper at the closest regional endpoint, such as `https://guardrails-usa-2.quilr.ai/openai_compatible/`.
4. Send `model` as the Bedrock model ID or inference profile ID.
5. QuilrAI translates the OpenAI-style request to Bedrock `Converse` or `ConverseStream`.

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

The normal gateway behavior still applies: authentication, provider and model routing, prompt-store substitution, request-side DLP, response-side DLP for non-streaming responses, logging, rate limits, token estimates, and performance metrics.

## Supported Parameters

The Bedrock translator uses an allowlist. Unknown OpenAI parameters are rejected instead of silently dropped.

| OpenAI parameter | Support |
|------------------|---------|
| `messages` | Supported |
| `model` | Supported. Use a selected Bedrock model ID or inference profile ID. |
| `stream` | Supported through Bedrock `ConverseStream` |
| `max_tokens` | Maps to `inferenceConfig.maxTokens` |
| `max_completion_tokens` | Maps to `inferenceConfig.maxTokens` |
| `temperature` | Maps to `inferenceConfig.temperature` |
| `top_p` | Maps to `inferenceConfig.topP` |
| `stop` | Maps to `inferenceConfig.stopSequences` |
| `tools` | Supported for `type: "function"` tools |
| `functions` | Supported as legacy function tools |
| `tool_choice` | Supported for `auto`, `none`, `required`, and function-specific choices |
| `function_call` | Supported for legacy function calls |
| `response_format` | Supports `text` and `json_schema` |
| `stream_options` | Supports `include_usage` for streaming usage chunks |
| `parallel_tool_calls` | Accepted as a boolean, but `false` is not enforced by Bedrock |
| `n` | Must be absent or `1` |
| `metadata` | Accepted for compatibility, not sent to Bedrock |
| `user` | Accepted for compatibility, not sent to Bedrock |

`max_tokens` and `max_completion_tokens` can both be present only when they have the same value. Token limits must be positive integers. `stop` must be a string or a list of strings.

Common rejected parameters include `frequency_penalty`, `presence_penalty`, `logit_bias`, `logprobs`, `top_logprobs`, `seed`, `store`, `service_tier`, `modalities`, `audio`, `prediction`, and `reasoning_effort`.

## Message Support

| OpenAI role | Bedrock translation |
|-------------|---------------------|
| `system` | Top-level Bedrock `system` block |
| `developer` | Top-level Bedrock `system` block |
| `user` | Bedrock message with role `user` |
| `assistant` | Bedrock message with role `assistant` |
| `tool` | Bedrock `toolResult` block when tools are active |
| `function` | Bedrock `toolResult` block for legacy function history |

Content is text-only:

- String content is supported.
- Content arrays are supported only when every part is text-like.
- Images, audio, files, Bedrock document blocks, and Bedrock image blocks are not supported on this OpenAI-to-Bedrock path.

Do not use this surface for multimodal Bedrock calls. Use a native Bedrock Runtime route when you need provider-native request shapes.

## Tools and Function Calling

OpenAI `tools` are supported when each tool is a function tool:

| OpenAI field | Bedrock field |
|--------------|---------------|
| `tools[].function.name` | `toolSpec.name` |
| `tools[].function.description` | `toolSpec.description` |
| `tools[].function.parameters` | `toolSpec.inputSchema.json` |
| `tools[].function.strict` | `toolSpec.strict` |

Legacy OpenAI `functions` and `function_call` are also supported. For legacy function-call history, QuilrAI uses the function name as the Bedrock `toolUseId` so the later `role: "function"` result can be matched consistently.

Modern `assistant.tool_calls` entries must include `id`. QuilrAI rejects tool calls without IDs because the client would have no stable identifier to send back in the later tool result.

### Tool Choice

| OpenAI `tool_choice` | Bedrock behavior |
|----------------------|------------------|
| absent or `auto` | No explicit Bedrock `toolChoice` |
| `none` | No Bedrock `toolConfig`; tool history is serialized as text |
| `required` | Bedrock `toolChoice.any` |
| function-specific choice | Bedrock `toolChoice.tool.name` |

If a request requires a tool but no tools are present, QuilrAI rejects the request before Bedrock.

### Parallel Tool Results

OpenAI-compatible clients often send one `role: "tool"` message per tool call:

```json
[
  {"role": "assistant", "tool_calls": [{"id": "call_a"}, {"id": "call_b"}]},
  {"role": "tool", "tool_call_id": "call_a", "content": "result A"},
  {"role": "tool", "tool_call_id": "call_b", "content": "result B"}
]
```

Bedrock expects all matching tool results for that assistant turn in the next user message. QuilrAI groups consecutive OpenAI `role: "tool"` or `role: "function"` messages into one Bedrock user message containing multiple `toolResult` blocks.

This grouping matters for parallel tool calls. Sending each tool result as a separate Bedrock user turn can produce a Bedrock validation error about missing `toolResult` blocks.

## Structured Output

`response_format` support:

| OpenAI value | Support |
|--------------|---------|
| `{"type": "text"}` | Supported |
| `{"type": "json_schema", "json_schema": {...}}` | Supported on Bedrock models that accept `outputConfig` |
| `{"type": "json_object"}` | Rejected |

For `json_schema`, QuilrAI maps:

| OpenAI field | Bedrock field |
|--------------|---------------|
| `json_schema.name` | `outputConfig.textFormat.jsonSchema.name` |
| `json_schema.description` | `outputConfig.textFormat.jsonSchema.description` |
| `json_schema.schema` | `outputConfig.textFormat.jsonSchema.schema` |

`json_schema.strict` is validated as a boolean, but it is not separately mapped. Bedrock structured output is schema-constrained through `outputConfig.textFormat`.

Bedrock structured output is model-dependent. Newer Claude models can support it, while older Claude and some Nova models may reject `outputConfig`. QuilrAI does not maintain a separate model allowlist for this field; unsupported models return the upstream Bedrock error.

`json_object` is rejected because Bedrock structured output requires a concrete JSON Schema. A generic object mode would not preserve OpenAI-equivalent semantics.

## Streaming Responses

Streaming uses Bedrock `ConverseStream` and returns OpenAI-compatible server-sent events.

| Bedrock event | OpenAI stream delta |
|---------------|---------------------|
| `messageStart` | Assistant role delta |
| `contentBlockStart.toolUse` | Tool call ID and function name |
| `contentBlockDelta.text` | `delta.content` |
| `contentBlockDelta.toolUse.input` | Tool-call argument delta |
| `messageStop` | `finish_reason` |
| `metadata.usage` | Usage chunk when `stream_options.include_usage` is true |

Streaming response-side DLP is not applied on this path. QuilrAI performs request-side scanning, forwards chunks, and accumulates text and tool-call data for logging.

## Non-Streaming Responses

Non-streaming Bedrock responses are converted back to OpenAI chat completions:

- Bedrock text blocks are joined into `choices[].message.content`.
- Bedrock `toolUse` blocks become OpenAI `choices[].message.tool_calls`.
- Tool-use-only responses return `message.content: null`.
- Bedrock usage maps to OpenAI `prompt_tokens`, `completion_tokens`, and `total_tokens`.

Finish reasons map as follows:

| Bedrock stop reason | OpenAI finish reason |
|---------------------|----------------------|
| `end_turn` | `stop` |
| `stop_sequence` | `stop` |
| `max_tokens` | `length` |
| `tool_use` | `tool_calls` |
| `content_filtered` | `content_filter` |
| `guardrail_intervened` | `content_filter` |

Unknown Bedrock stop reasons pass through unchanged.

## Unsupported Features

Unsupported request features are rejected before the upstream call unless Bedrock itself owns the model-gated failure.

Unsupported content:

- Image content
- Audio content
- File content
- Bedrock document blocks
- Mixed multimodal content arrays

Unsupported request features:

- Multiple choices with `n > 1`
- Log probabilities
- Token bias
- Seed control
- Frequency and presence penalties
- OpenAI JSON object mode
- Audio input or output modes
- Prediction hints
- Service tier controls
- Storage flags
- Reasoning-effort controls

## Errors

QuilrAI returns OpenAI-shaped error responses for adapter validation failures and wraps Bedrock validation errors without hiding the upstream message.

Common adapter error codes include:

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

## Guardrail Behavior

Request-side DLP scans user text before the Bedrock call. Non-streaming responses are scanned before they are returned to the client.

Streaming responses are different: request-side DLP still runs, but response-side DLP is skipped so chunks can pass through as they arrive.

Tool messages are carried through without changing tool IDs or result ordering. Changing a `tool_call_id`, dropping a `role: "tool"` message, or reordering tool results can break Bedrock's strict tool-result validation.

## Expected Good Scenarios

These scenarios are covered by the translator:

- Plain text chat
- System, developer, user, and assistant text messages
- Non-streaming text responses
- Streaming text responses
- Bedrock tool calls translated back to OpenAI `tool_calls`
- Tool-call deltas in streaming responses
- Consecutive OpenAI tool result messages grouped into one Bedrock tool-result user message
- Legacy OpenAI `functions`, `function_call`, and `role: "function"`
- Strict function tools when the deployed boto3/botocore Bedrock Runtime model supports `ToolSpecification.strict`
- `response_format: json_schema` on Bedrock models that support `outputConfig`

## Expected Failures

These failures are intentional:

- `response_format: json_object`
- `response_format: json_schema` on Bedrock models that do not support `outputConfig`
- OpenAI image, audio, or file content
- Modern `assistant.tool_calls` entries without `id`
- Tool result messages missing `tool_call_id`
- A user message immediately after assistant tool calls without matching tool results
- Parallel tool results that are not consecutive in the OpenAI message history and therefore cannot be grouped into one Bedrock user turn

## Related Pages

- [Provider Support](./provider-support.md)
- [Integration Guide](./integration-guide.md#aws-bedrock-via-openai-compatible-chat---python)
- [AWS Bedrock - boto3 Runtime](./bedrock-boto3.md)
- [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md)
