---
sidebar_position: 4
sidebar_custom_props:
  icon: Plug
---

# Integration Guide

Connect to the QuilrAI gateway in minutes - same SDK, one-line change.

## 1. Choose Your Endpoint

### Region

| Region | Base URL |
|--------|----------|
| **Nearest** (auto) | `https://guardrails.quilr.ai` |
| **USA** | `https://guardrails-usa-1.quilr.ai` |
| **India** | `https://guardrails-india-1.quilr.ai` |

### API Format

| Format | Path | Auth Header |
|--------|------|-------------|
| **OpenAI** | `/openai_compatible/` | `Authorization: Bearer sk-quilr-xxx` |
| **Anthropic** | `/anthropic_messages/` | `x-api-key: sk-quilr-xxx` |
| **Vertex AI** | `/vertex_ai/` | `Authorization: Bearer sk-quilr-xxx` |
| **OpenAI Responses** | `/openai_responses/` | `Authorization: Bearer sk-quilr-xxx` |
| **OpenAI Realtime** (wss) | `/openai_realtime/` | `Authorization: Bearer sk-quilr-xxx` |

Combine a region base URL with the API format path to get your full endpoint. For example:

```
https://guardrails.quilr.ai/openai_compatible/
```

## 2. Code Examples

### OpenAI - Python

```python
from openai import OpenAI

# Point the client to QuilrAI's gateway
client = OpenAI(
    # diff-add
    base_url='https://guardrails.quilr.ai/openai_compatible/',
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

### OpenAI - JavaScript

```javascript
import OpenAI from "openai";

// Point the client to QuilrAI's gateway
const client = new OpenAI({
  // diff-add
  baseURL: "https://guardrails.quilr.ai/openai_compatible/",
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

### OpenAI - cURL

```bash
# Point the request to QuilrAI's gateway
# diff-remove
curl https://api.openai.com/v1/chat/completions \
# diff-add
curl https://guardrails.quilr.ai/openai_compatible/v1/chat/completions \
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

### Anthropic - Python

```python
import anthropic

# Point the client to QuilrAI's gateway
client = anthropic.Anthropic(
    # diff-remove
    # uses default base URL
    # diff-add
    base_url='https://guardrails.quilr.ai/anthropic_messages/',
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

### Anthropic - JavaScript

```javascript
import Anthropic from "@anthropic-ai/sdk";

// Point the client to QuilrAI's gateway
const client = new Anthropic({
  // diff-remove
  // uses default base URL
  // diff-add
  baseURL: "https://guardrails.quilr.ai/anthropic_messages/",
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

### Anthropic - cURL

```bash
# Point the request to QuilrAI's gateway
# diff-remove
curl https://api.anthropic.com/v1/messages \
# diff-add
curl https://guardrails.quilr.ai/anthropic_messages/v1/messages \
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

### Vertex AI - Google GenAI SDK

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
    http_options=HttpOptions(base_url='https://guardrails.quilr.ai/vertex_ai'),
)

# Everything below stays exactly the same
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Hello!'
)
print(response.text)
```

### Vertex AI - LangChain

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
    base_url='https://guardrails.quilr.ai/vertex_ai',
    project='your-gcp-project',
    location='us-central1',
    vertexai=True,
)

# Everything below stays exactly the same
response = llm.invoke('Hello!')
print(response.content)
```

Replace `sk-quilr-xxx` with the API key you created in the dashboard. The model parameter uses the same model names as your provider. For Vertex AI, the `project` and `location` should match the values configured when creating the key.

:::info Provider configuration required
The Responses and Realtime endpoints are only served for keys whose primary provider is `openai_responses` / `openai_responses_azure` / `openai_realtime` / `openai_realtime_azure`, or that have one of those added as an additional provider. A plain "OpenAI" or "Azure OpenAI" chat-completions key cannot hit `/openai_responses/` or `/openai_realtime/` by just swapping the URL - add the Responses or Realtime provider to the key first. See [Provider Support](./provider-support#responses-api) for the full matrix.
:::

### OpenAI Responses - Python

```python
from openai import OpenAI

# Point the client to QuilrAI's gateway
client = OpenAI(
    # diff-add
    base_url='https://guardrails.quilr.ai/openai_responses/v1',
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

### OpenAI Responses - JavaScript

```javascript
import OpenAI from "openai";

// Point the client to QuilrAI's gateway
const client = new OpenAI({
  // diff-add
  baseURL: "https://guardrails.quilr.ai/openai_responses/v1",
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

### OpenAI Responses - cURL

```bash
# Point the request to QuilrAI's gateway
# diff-remove
curl https://api.openai.com/v1/responses \
# diff-add
curl https://guardrails.quilr.ai/openai_responses/v1/responses \
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

For Azure OpenAI Responses, the deployment name goes in `model` and Quilr resolves it against the `azure_endpoint` configured on the key. The Azure-style deployment alias `/openai_responses/openai/deployments/{deployment}/responses` is also supported.

### OpenAI Realtime - Python

```python
import asyncio
from openai import AsyncOpenAI


async def main():
    client = AsyncOpenAI(
        # diff-add
        base_url='https://guardrails.quilr.ai/openai/v1',
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

### OpenAI Realtime - JavaScript

```javascript
import { OpenAIRealtimeWebSocket } from "openai/realtime/websocket";

const rt = new OpenAIRealtimeWebSocket({
  // diff-add
  baseURL: "wss://guardrails.quilr.ai/openai/v1",
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

Realtime sessions are a raw websocket passthrough. Voice I/O (PCM16 `input_audio_buffer.append` / `response.output_audio.delta`) works end-to-end. Live-event DLP is not yet applied to Realtime sessions - see [Provider Support](./provider-support#realtime-api).

## 3. Using Routing Groups

If you've configured a [Routing Group](./features/request-routing), pass the group name as the `model` parameter. The gateway automatically load-balances and fails over across providers in that group.

```python
response = client.chat.completions.create(
    model='Group1',  # your routing group name
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

See [Request Routing](./features/request-routing) for full details on setting up groups.

## 4. Selecting a Provider on Multi-Provider Keys

A single QuilrAI key can have one primary provider plus any number of additional providers. For **Responses** and **Realtime** keys, you can pick which configured provider handles a specific request. If you omit a selector, QuilrAI uses the first compatible provider on the key.

| Endpoint | Body field | Header | Query param |
|----------|-----------|--------|-------------|
| Chat Completions / Anthropic Messages / Vertex | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Responses | `provider` or `provider_label` | `X-Provider-Name` / `X-Provider-Label` | - |
| Realtime (websocket) | - | `X-Provider-Name` / `X-Provider-Label` | `provider` or `provider_label` |

Match by either the provider type (e.g. `openai_responses_azure`) or the `label` you set on the additional provider in the dashboard.

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
