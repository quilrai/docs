---
sidebar_position: 1.5
sidebar_custom_props:
  icon: Plug
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Integration Guide

Connect to the QuilrAI gateway with your existing SDK. Change the base URL and the API key; keep everything else.

## 1. Choose Your Endpoint

### Region

| Region | Base URL |
|--------|----------|
| **Nearest** (auto) | `https://guardrails.quilr.ai` |
| **USA (US Central West)** | `https://guardrails-usa-1.quilr.ai` |
| **USA (US East)** | `https://guardrails-usa-2.quilr.ai` |
| **India 1** | `https://guardrails-india-1.quilr.ai` |
| **India 2** | `https://guardrails-india-2.quilr.ai` |
| **Japan** | `https://guardrails-jp-1.quilr.ai` |
| **Europe** | `https://guardrails-europe-1.quilr.ai` |

Use the regional endpoint closest to your application for production traffic. Use `https://guardrails.quilr.ai` only when you want global auto-routing. The examples below use US East.

### API Format

| Format | Path | Auth header |
|--------|------|-------------|
| **OpenAI-compatible** | `/openai_compatible/` | `Authorization: Bearer sk-quilr-xxx` |
| **Anthropic** | `/anthropic_messages/` | `x-api-key: sk-quilr-xxx` |
| **AWS Bedrock Runtime** (boto3) | `/bedrock-runtime/` | AWS SigV4 using `sk-quilr-xxx` |
| **Vertex AI** | `/vertex_ai/` | `Authorization: Bearer sk-quilr-xxx` |
| **OpenAI Responses** | `/openai_responses/` | `Authorization: Bearer sk-quilr-xxx` |
| **OpenAI Assistants** | `/openai_assistants/` | `Authorization: Bearer sk-quilr-xxx` |
| **OpenAI Realtime** (wss) | `/openai_realtime/` | `Authorization: Bearer sk-quilr-xxx` |
| **Sarvam** (speech and text) | `/sarvam/` | `Authorization: Bearer sk-quilr-xxx` |
| **Copilot Studio** | `/copilot_studio/{sk-quilr-xxx}` | Quilr key in the path |
| **TrueFoundry custom guardrail** | `/sdk/v1/check/truefoundry` | `Authorization: Bearer sk-quilr-xxx` from a `quilr_sdk` app |

Combine a region with a path, for example:

```
https://guardrails-usa-2.quilr.ai/openai_compatible/
```

Each path is served only by matching provider types on the app. For example, an `openai` provider cannot serve `/openai_responses/`; add an `openai_responses` provider. See the [capability matrix](./provider-support#capability-matrix).

`sk-quilr-xxx` stands for your Quilr key. Copy it from the app's **API Integration** section (see [Applications and Keys](./applications-and-keys#api-integration)). The `model` you send must be enabled on the app.

## 2. Code Examples

### OpenAI-compatible chat

<Tabs groupId="lang">
<TabItem value="python" label="Python">

```python
from openai import OpenAI

# Point the client to QuilrAI's gateway
client = OpenAI(
    # diff-add
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    # diff-remove
    api_key='sk-openai-xxx'
    # diff-add
    api_key='sk-quilr-xxx'
)

# Everything below stays exactly the same
response = client.chat.completions.create(
    model='gpt-4o-mini',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(response.choices[0].message.content)

# Embeddings work too
embedding = client.embeddings.create(
    model='text-embedding-3-small',
    input='The quick brown fox'
)
print(embedding.data[0].embedding[:5])
```

</TabItem>
<TabItem value="js" label="JavaScript">

```javascript
import OpenAI from "openai";

// Point the client to QuilrAI's gateway
const client = new OpenAI({
  // diff-add
  baseURL: "https://guardrails-usa-2.quilr.ai/openai_compatible/",
  // diff-remove
  apiKey: "sk-openai-xxx",
  // diff-add
  apiKey: "sk-quilr-xxx",
});

// Everything below stays exactly the same
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Point the request to QuilrAI's gateway
# diff-remove
curl https://api.openai.com/v1/chat/completions \
# diff-add
curl https://guardrails-usa-2.quilr.ai/openai_compatible/v1/chat/completions \
  -H "Content-Type: application/json" \
  # diff-remove
  -H "Authorization: Bearer sk-openai-xxx" \
  # diff-add
  -H "Authorization: Bearer sk-quilr-xxx" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

</TabItem>
</Tabs>

### Bedrock, Vertex AI and Anthropic through OpenAI-compatible chat

Keep the OpenAI client and send a provider-native model name. The gateway translates the request to Bedrock `Converse`, Vertex AI `generateContent` or Anthropic Messages. This path is text-only; see [Unified Completions](./unified-completions) for supported parameters, tools and streaming.

<Tabs>
<TabItem value="bedrock" label="AWS Bedrock">

App provider: `bedrock`. Send any selected Bedrock model ID or inference profile ID that supports Converse.

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx',
)

response = client.chat.completions.create(
    model='amazon.nova-lite-v1:0',
    messages=[{'role': 'user', 'content': 'Hello from an OpenAI client.'}],
    max_tokens=256,
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="vertex" label="Vertex AI">

App provider: `vertex_ai`. Send a selected Gemini model name. Use the native `/vertex_ai/` endpoint for multimodal calls.

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx',
)

response = client.chat.completions.create(
    model='gemini-2.5-flash',
    messages=[{'role': 'user', 'content': 'Hello from an OpenAI client.'}],
    max_tokens=256,
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="anthropic" label="Anthropic Messages">

App provider: `anthropic_messages`, `anthropic_messages_bedrock` or `anthropic_messages_azure`. Send the Claude model name, or the Bedrock Claude model ID for `anthropic_messages_bedrock`.

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx',
)

response = client.chat.completions.create(
    model='claude-sonnet-4-5',
    messages=[{'role': 'user', 'content': 'Hello from an OpenAI client.'}],
    max_tokens=256,
)
print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

### Embeddings

Every embeddings provider (`openai`, `azureopenai`, `bedrock_embeddings`) takes the OpenAI embeddings shape. For Bedrock, the AWS credentials stay on the app's provider and the gateway makes the Bedrock call.

<Tabs groupId="lang">
<TabItem value="python" label="Python">

```python
from openai import OpenAI

client = OpenAI(
    # diff-add
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    # diff-add
    api_key='sk-quilr-xxx',
)

# Same call for OpenAI, Azure OpenAI, or AWS Bedrock embeddings providers.
# Use a model name enabled on your app
# (e.g. 'text-embedding-3-small', 'amazon.titan-embed-text-v2:0',
# 'cohere.embed-english-v3').
embedding = client.embeddings.create(
    model='amazon.titan-embed-text-v2:0',
    input='The quick brown fox',
)
print(embedding.data[0].embedding[:5])
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl https://guardrails-usa-2.quilr.ai/openai_compatible/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -d '{
    "model": "amazon.titan-embed-text-v2:0",
    "input": "The quick brown fox"
  }'
```

</TabItem>
</Tabs>

### Rerank

Every rerank provider takes the Cohere-compatible shape. Point the Cohere SDK at `https://guardrails-usa-2.quilr.ai/rerank`; `/rerank/rerank`, `/rerank/v1/rerank` and `/rerank/v2/rerank` all work.

<Tabs groupId="lang">
<TabItem value="python" label="Python">

```python
import cohere

co = cohere.ClientV2(
    # diff-add
    base_url='https://guardrails-usa-2.quilr.ai/rerank',
    # diff-remove
    api_key='co-xxx',
    # diff-add
    api_key='sk-quilr-xxx',
)

# Same call for any configured rerank provider.
result = co.rerank(
    model='rerank-english-v3.0',
    query='What is the capital of France?',
    documents=[
        'Paris is the capital of France.',
        'Berlin is the capital of Germany.',
        'The Eiffel Tower is in Paris.',
    ],
    top_n=2,
)
for r in result.results:
    print(r.index, r.relevance_score)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl https://guardrails-usa-2.quilr.ai/rerank/v2/rerank \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -d '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of France?",
    "documents": [
      "Paris is the capital of France.",
      "Berlin is the capital of Germany.",
      "The Eiffel Tower is in Paris."
    ],
    "top_n": 2
  }'
```

</TabItem>
</Tabs>

### Anthropic

<Tabs groupId="lang">
<TabItem value="python" label="Python">

```python
import anthropic

# Point the client to QuilrAI's gateway
client = anthropic.Anthropic(
    # diff-remove
    # uses default base URL
    # diff-add
    base_url='https://guardrails-usa-2.quilr.ai/anthropic_messages/',
    # diff-remove
    api_key='sk-ant-xxx'
    # diff-add
    api_key='sk-quilr-xxx'
)

# Everything below stays exactly the same
message = client.messages.create(
    model='claude-sonnet-4-20250514',
    max_tokens=1024,
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(message.content[0].text)
```

</TabItem>
<TabItem value="js" label="JavaScript">

```javascript
import Anthropic from "@anthropic-ai/sdk";

// Point the client to QuilrAI's gateway
const client = new Anthropic({
  // diff-remove
  // uses default base URL
  // diff-add
  baseURL: "https://guardrails-usa-2.quilr.ai/anthropic_messages/",
  // diff-remove
  apiKey: "sk-ant-xxx",
  // diff-add
  apiKey: "sk-quilr-xxx",
});

// Everything below stays exactly the same
const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(message.content[0].text);
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Point the request to QuilrAI's gateway
# diff-remove
curl https://api.anthropic.com/v1/messages \
# diff-add
curl https://guardrails-usa-2.quilr.ai/anthropic_messages/v1/messages \
  -H "Content-Type: application/json" \
  # diff-remove
  -H "x-api-key: sk-ant-xxx" \
  # diff-add
  -H "x-api-key: sk-quilr-xxx" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

</TabItem>
</Tabs>

### Vertex AI

Pass the Quilr key as a Bearer token. `project` and `location` should match the GCP project ID and region on the app's `vertex_ai` provider.

<Tabs>
<TabItem value="genai" label="Google GenAI SDK">

```python
from google import genai
from google.genai.types import HttpOptions
# diff-remove
from google.oauth2 import service_account
# diff-add
from google.auth import credentials as auth_credentials


# diff-add
class APIKeyCredentials(auth_credentials.Credentials):
    # diff-add
    """Pass the QuilrAI API key as a Bearer token."""
    # diff-add

    # diff-add
    def __init__(self, api_key):
        # diff-add
        super().__init__()
        # diff-add
        self.api_key = api_key
        # diff-add
        self.token = api_key
    # diff-add

    # diff-add
    def refresh(self, request):
        # diff-add
        self.token = self.api_key
    # diff-add

    # diff-add
    @property
    # diff-add
    def valid(self):
        # diff-add
        return True


# diff-remove
credentials = service_account.Credentials.from_service_account_file(
    # diff-remove
    'service.json',
    # diff-remove
    scopes=['https://www.googleapis.com/auth/cloud-platform']
# diff-remove
)
# diff-add
credentials = APIKeyCredentials('sk-quilr-xxx')

client = genai.Client(
    vertexai=True,
    project='your-gcp-project',
    location='us-central1',
    credentials=credentials,
    # diff-remove
    # uses default Vertex AI endpoint
    # diff-add
    http_options=HttpOptions(base_url='https://guardrails-usa-2.quilr.ai/vertex_ai'),
)

# Everything below stays exactly the same
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Hello!'
)
print(response.text)
```

</TabItem>
<TabItem value="langchain" label="LangChain">

```python
# diff-remove
from google.oauth2 import service_account
# diff-add
from google.oauth2 import credentials as ga_credentials
from langchain_google_genai import ChatGoogleGenerativeAI


# diff-add
class _NoopCredentials(ga_credentials.Credentials):
    # diff-add
    """Inject the QuilrAI API key as a Bearer token."""
    # diff-add

    # diff-add
    def __init__(self, api_key):
        # diff-add
        super().__init__(token=api_key)
    # diff-add

    # diff-add
    def refresh(self, request):
        # diff-add
        pass
    # diff-add

    # diff-add
    @property
    # diff-add
    def valid(self):
        # diff-add
        return True


# diff-remove
credentials = service_account.Credentials.from_service_account_file(
    # diff-remove
    'service.json',
    # diff-remove
    scopes=['https://www.googleapis.com/auth/cloud-platform']
# diff-remove
)
# diff-add
credentials = _NoopCredentials('sk-quilr-xxx')

llm = ChatGoogleGenerativeAI(
    model='gemini-2.5-flash',
    credentials=credentials,
    # diff-add
    base_url='https://guardrails-usa-2.quilr.ai/vertex_ai',
    project='your-gcp-project',
    location='us-central1',
    vertexai=True,
)

# Everything below stays exactly the same
response = llm.invoke('Hello!')
print(response.content)
```

</TabItem>
</Tabs>

### AWS Bedrock Runtime - boto3

App provider: `bedrock`. Point the Bedrock Runtime client at the gateway and sign with the Quilr key.

```python
import boto3
from botocore.config import Config

QUILR_KEY = "sk-quilr-xxx"

bedrock = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    # diff-add
    endpoint_url="https://guardrails-usa-2.quilr.ai/bedrock-runtime",
    # diff-remove
    aws_access_key_id="AKIA...",
    # diff-add
    aws_access_key_id=QUILR_KEY,
    # diff-remove
    aws_secret_access_key="aws-secret",
    # diff-add
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

`converse`, `converse_stream` and `invoke_model` are supported. See [AWS Bedrock - boto3 Runtime](./bedrock-boto3) for coverage and troubleshooting.

### OpenAI Responses

App provider: `openai_responses` or `openai_responses_azure`. For Azure, send the deployment name as `model`.

<Tabs groupId="lang">
<TabItem value="python" label="Python">

```python
from openai import OpenAI

# Point the client to QuilrAI's gateway
client = OpenAI(
    # diff-add
    base_url='https://guardrails-usa-2.quilr.ai/openai_responses/v1',
    # diff-remove
    api_key='sk-openai-xxx'
    # diff-add
    api_key='sk-quilr-xxx'
)

# Everything below stays exactly the same
response = client.responses.create(
    model='gpt-5',
    input=[{'role': 'user', 'content': 'Hello!'}],
    instructions='You are a helpful assistant.'
)
print(response.output_text)
```

</TabItem>
<TabItem value="js" label="JavaScript">

```javascript
import OpenAI from "openai";

// Point the client to QuilrAI's gateway
const client = new OpenAI({
  // diff-add
  baseURL: "https://guardrails-usa-2.quilr.ai/openai_responses/v1",
  // diff-remove
  apiKey: "sk-openai-xxx",
  // diff-add
  apiKey: "sk-quilr-xxx",
});

// Everything below stays exactly the same
const response = await client.responses.create({
  model: "gpt-5",
  input: [{ role: "user", content: "Hello!" }],
  instructions: "You are a helpful assistant.",
});
console.log(response.output_text);
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Point the request to QuilrAI's gateway
# diff-remove
curl https://api.openai.com/v1/responses \
# diff-add
curl https://guardrails-usa-2.quilr.ai/openai_responses/v1/responses \
  -H "Content-Type: application/json" \
  # diff-remove
  -H "Authorization: Bearer sk-openai-xxx" \
  # diff-add
  -H "Authorization: Bearer sk-quilr-xxx" \
  -d '{
    "model": "gpt-5",
    "input": [{"role": "user", "content": "Hello!"}]
  }'
```

</TabItem>
</Tabs>

### OpenAI Realtime

App provider: `openai_realtime` or `openai_realtime_azure`. Sessions are a websocket passthrough; guardrails are not yet applied to live events (see [Realtime API](./provider-support#realtime-api)).

<Tabs groupId="lang">
<TabItem value="python" label="Python">

```python
import asyncio
from openai import AsyncOpenAI


async def main():
    client = AsyncOpenAI(
        # diff-add
        base_url='https://guardrails-usa-2.quilr.ai/openai/v1',
        # diff-remove
        api_key='sk-openai-xxx',
        # diff-add
        api_key='sk-quilr-xxx',
    )

    # Everything below stays exactly the same
    async with client.realtime.connect(model='gpt-realtime') as conn:
        await conn.session.update(session={'modalities': ['text']})
        await conn.conversation.item.create(item={
            'type': 'message',
            'role': 'user',
            'content': [{'type': 'input_text', 'text': 'Hello!'}],
        })
        await conn.response.create()
        async for event in conn:
            if event.type == 'response.output_text.delta':
                print(event.delta, end='', flush=True)
            elif event.type == 'response.done':
                break


asyncio.run(main())
```

</TabItem>
<TabItem value="js" label="JavaScript">

```javascript
import { OpenAIRealtimeWebSocket } from "openai/realtime/websocket";

const rt = new OpenAIRealtimeWebSocket({
  // diff-add
  baseURL: "wss://guardrails-usa-2.quilr.ai/openai/v1",
  // diff-remove
  apiKey: "sk-openai-xxx",
  // diff-add
  apiKey: "sk-quilr-xxx",
  model: "gpt-realtime",
});

rt.on("response.output_text.delta", (e) => process.stdout.write(e.delta));
rt.send({
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [{ type: "input_text", text: "Hello!" }],
  },
});
rt.send({ type: "response.create" });
```

</TabItem>
</Tabs>

### Sarvam speech and text

App provider: `sarvam`. Chat goes through the OpenAI-compatible client:

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx'
)

resp = client.chat.completions.create(
    model='sarvam-105b',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

Speech uses the OpenAI audio methods. `voice` is a Sarvam speaker and `language_code` is required:

```python
speech = client.audio.speech.create(
    model='bulbul:v3',
    input='Hello world',
    voice='shubh',
    response_format='wav',
    extra_body={'language_code': 'en-IN'}
)
with open('hello.wav', 'wb') as out:
    out.write(speech.content)

with open('audio.wav', 'rb') as audio:
    transcript = client.audio.transcriptions.create(model='saaras:v4', file=audio)
```

The native `/sarvam/` routes take Sarvam's own fields. Translation, transliteration and language detection are only here:

```bash
# Speech synthesis - returns {"request_id": "...", "audios": ["<base64>"]}
curl https://guardrails-usa-2.quilr.ai/sarvam/text-to-speech \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "model": "bulbul:v3",
    "speaker": "shubh",
    "language_code": "en-IN",
    "output_audio_codec": "wav"
  }'

# Transcription - multipart, one file field
curl https://guardrails-usa-2.quilr.ai/sarvam/speech-to-text \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -F file=@audio.wav \
  -F model=saaras:v4 \
  -F mode=transcribe \
  -F language_code=hi-IN

# Text translation
curl https://guardrails-usa-2.quilr.ai/sarvam/translate \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mayura:v1",
    "input": "Hello",
    "source_language_code": "en-IN",
    "target_language_code": "hi-IN"
  }'
```

See [Sarvam Speech and Text](./provider-support#sarvam-speech-and-text) for every endpoint, model and limit.

### Microsoft Copilot Studio

App provider: `copilot_studio`. Register this endpoint base in Power Platform admin center:

```text
https://guardrails-usa-2.quilr.ai/copilot_studio/sk-quilr-xxx
```

See [Copilot Studio](./features/copilot-studio) for setup.

### TrueFoundry custom guardrails

Add QuilrAI as a TrueFoundry custom input/output guardrail: URL = your regional base plus `/sdk/v1/check/truefoundry`, mode **Mutate**, **Custom Bearer Auth** with a Quilr key from a `quilr_sdk` app. See [TrueFoundry Integration](./features/truefoundry).

## 3. Optional Headers

| Header | Purpose |
|--------|---------|
| `X-User-Email` | Identifies the end user behind the request. See [Identity Aware](./features/identity-aware). |
| `X-Conversation-Id` | Groups related requests into one conversation. See [Conversation Grouping](./features/conversation-grouping). |
| `X-Provider-Name` / `X-Provider-Label` | Selects a provider on apps with several (see section 5). |
| `X-Prompt-Variables` | Supplies `{{variable}}` values for stored prompts. See [Prompt Store](./features/prompt-store). |

## 4. Using Routing Groups

Send a [routing group](./features/request-routing) name as `model`. The gateway load-balances and fails over across the group's models.

```python
response = client.chat.completions.create(
    model='Group1',  # your routing group name
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

## 5. Selecting a Provider

On an app with several providers, pick one per request by provider type or label. The fields for each endpoint are in [Selecting a Provider on Multi-Provider Apps](./provider-support#selecting-a-provider-on-multi-provider-apps).

```python
# Responses: pick a specific additional provider
response = client.responses.create(
    model='gpt-5',
    input=[{'role': 'user', 'content': 'Hello!'}],
    extra_body={'provider_label': 'azure-westus'},
)
```

```python
# Realtime: select via query string (headers also work)
async with client.realtime.connect(
    model='gpt-realtime',
    extra_query={'provider_label': 'azure-westus'},
) as conn:
    ...
```

