---
sidebar_position: 7
sidebar_custom_props:
  badge: new
  icon: Plug
---

# AWS Bedrock - boto3 Runtime

Use the AWS SDK for Python (`boto3`) with QuilrAI guardrails by pointing the Bedrock Runtime client at the QuilrAI gateway.

This mode is for applications that already use `bedrock-runtime` directly and want to keep AWS request shapes such as `converse`, `converse_stream`, and `invoke_model`.

## What is supported

| boto3 operation | Gateway path | Guardrail coverage |
|-----------------|--------------|--------------------|
| `converse` | `/bedrock-runtime/model/{model_id}/converse` | Request and response DLP |
| `converse_stream` | `/bedrock-runtime/model/{model_id}/converse-stream` | Request DLP, raw EventStream response passthrough |
| `invoke_model` | `/bedrock-runtime/model/{model_id}/invoke` | Request and response DLP for supported text schemas |
| `invoke_model_with_response_stream` | `/bedrock-runtime/model/{model_id}/invoke-with-response-stream` | Not enabled yet; returns `ValidationException` |

The same routes are also available without the `/bedrock-runtime` prefix, for example `/model/{model_id}/converse`.

Only Bedrock Runtime is proxied. The Bedrock control plane and Bedrock Agent Runtime are not proxied.

## Create the QuilrAI key

In the QuilrAI dashboard, create an LLM Gateway key with provider `bedrock`.

Configure AWS access with either static credentials or assume role:

| Auth mode | Required fields | Optional fields |
|-----------|-----------------|-----------------|
| Static AWS keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| Assume role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |

For assume-role setup, see [AWS Bedrock - Assume Role Setup](./bedrock-assume-role.md).

## Configure boto3

Set `endpoint_url` to the QuilrAI Bedrock Runtime endpoint. Use the same QuilrAI key for both `aws_access_key_id` and `aws_secret_access_key`; the gateway uses SigV4 to authenticate the request.

```python
import boto3
from botocore.config import Config

QUILR_KEY = "sk-quilr-xxx"

bedrock = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    endpoint_url="https://guardrails.quilr.ai/bedrock-runtime",
    aws_access_key_id=QUILR_KEY,
    aws_secret_access_key=QUILR_KEY,
    config=Config(read_timeout=300),
)

response = bedrock.converse(
    modelId="amazon.nova-lite-v1:0",
    messages=[
        {
            "role": "user",
            "content": [{"text": "Hello!"}],
        }
    ],
    inferenceConfig={"maxTokens": 256},
)

print(response["output"]["message"]["content"][0]["text"])
```

You can also set `endpoint_url` to the service root:

```python
endpoint_url="https://guardrails.quilr.ai"
```

Both endpoint styles are accepted.

## InvokeModel example

`invoke_model` keeps the provider-native Bedrock JSON body. QuilrAI supports deterministic text schemas for Amazon Nova, Anthropic, and OpenAI-style Bedrock models.

```python
import json

body = {
    "messages": [
        {
            "role": "user",
            "content": [{"text": "Summarize how guardrails work in one sentence."}],
        }
    ],
    "inferenceConfig": {"maxTokens": 256},
}

response = bedrock.invoke_model(
    modelId="amazon.nova-lite-v1:0",
    body=json.dumps(body),
    contentType="application/json",
    accept="application/json",
)

payload = json.loads(response["body"].read())
print(payload)
```

## ConverseStream example

`converse_stream` is proxied as raw AWS EventStream after request-side DLP succeeds. QuilrAI logs stream byte count, event count, usage, and best-effort text, but it does not run response-side DLP on stream chunks.

```python
stream = bedrock.converse_stream(
    modelId="amazon.nova-lite-v1:0",
    messages=[
        {
            "role": "user",
            "content": [{"text": "Write a short haiku about logging."}],
        }
    ],
)

for event in stream["stream"]:
    delta = event.get("contentBlockDelta", {}).get("delta", {})
    text = delta.get("text")
    if text:
        print(text, end="")
```

## Supported model families

The boto3 Runtime surface currently supports text models in these Bedrock families:

- Amazon Nova (`amazon.nova-*`)
- Anthropic (`anthropic.*`)
- OpenAI-style Bedrock models (`openai.*`)

Inference profile IDs are accepted when they resolve to one of these families, including region-prefixed profile IDs such as `us.anthropic...`.

Unknown model families are rejected instead of being parsed best-effort. This keeps DLP behavior deterministic for every supported request and response schema.

## Guardrail behavior

For non-streaming `converse` and supported `invoke_model` calls, QuilrAI scans user text before the upstream Bedrock call and scans text in the Bedrock response before returning it.

For `converse_stream`, QuilrAI scans user text before opening the upstream stream. The response stream is passed through unchanged.

Bedrock-native guardrail passthrough is not supported on this surface. Requests that include `x-amzn-bedrock-guardrailidentifier`, `x-amzn-bedrock-guardrailversion`, `guardrailConfig`, or `amazon-bedrock-guardrailConfig` are rejected with `ValidationException`. Configure QuilrAI guardrails on the API key instead.

## Troubleshooting

| Error | Cause |
|-------|-------|
| `UnrecognizedClientException` | The SigV4 access key ID is missing, invalid, or is not a `sk-quilr-*` key. |
| `SignatureDoesNotMatch` | The request was not signed for the `bedrock` service, the host changed after signing, or the key/secret values differ. |
| `AccessDeniedException` | The model is not selected on the QuilrAI key. |
| `ValidationException` for model family | The model is not in a supported text family. |
| `ValidationException` for guardrails | Bedrock-native guardrail headers/body fields were sent. Use QuilrAI guardrail settings instead. |
| `ModelTimeoutException` | The upstream Bedrock Runtime request timed out. |
