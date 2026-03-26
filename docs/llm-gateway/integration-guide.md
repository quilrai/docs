---
sidebar_position: 2
---

# Integration Guide

Connect to the Quilr gateway in minutes — same SDK, one-line change.

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

Combine a region base URL with the API format path to get your full endpoint. For example:

```
https://guardrails.quilr.ai/openai_compatible/
```

## 2. Code Examples

### OpenAI — Python

```python
from openai import OpenAI

# Point the client to Quilr's gateway
client = OpenAI(
    base_url='https://guardrails.quilr.ai/openai_compatible/',
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

### OpenAI — JavaScript

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://guardrails.quilr.ai/openai_compatible/",
  apiKey: "sk-quilr-xxx",
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);
```

### OpenAI — cURL

```bash
curl https://guardrails.quilr.ai/openai_compatible/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Anthropic — Python

```python
import anthropic

client = anthropic.Anthropic(
    base_url='https://guardrails.quilr.ai/anthropic_messages/',
    api_key='sk-quilr-xxx'
)

message = client.messages.create(
    model='claude-sonnet-4-20250514',
    max_tokens=1024,
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(message.content[0].text)
```

### Anthropic — cURL

```bash
curl https://guardrails.quilr.ai/anthropic_messages/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk-quilr-xxx" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Vertex AI — Google GenAI SDK

```python
from google import genai
from google.genai.types import HttpOptions
from google.auth import credentials as auth_credentials


class APIKeyCredentials(auth_credentials.Credentials):
    """Pass the Quilr API key as a Bearer token."""

    def __init__(self, api_key):
        super().__init__()
        self.api_key = api_key
        self.token = api_key

    def refresh(self, request):
        self.token = self.api_key

    @property
    def valid(self):
        return True


credentials = APIKeyCredentials('sk-quilr-xxx')

client = genai.Client(
    vertexai=True,
    project='your-gcp-project',
    location='us-central1',
    credentials=credentials,
    http_options=HttpOptions(base_url='https://guardrails.quilr.ai/vertex_ai'),
)

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Hello!'
)
print(response.text)
```

### Vertex AI — LangChain

```python
from google.oauth2 import credentials as ga_credentials
from langchain_google_genai import ChatGoogleGenerativeAI


class _NoopCredentials(ga_credentials.Credentials):
    """Inject the Quilr API key as a Bearer token."""

    def __init__(self, api_key):
        super().__init__(token=api_key)

    def refresh(self, request):
        pass

    @property
    def valid(self):
        return True


credentials = _NoopCredentials('sk-quilr-xxx')

llm = ChatGoogleGenerativeAI(
    model='gemini-2.5-flash',
    credentials=credentials,
    base_url='https://guardrails.quilr.ai/vertex_ai',
    project='your-gcp-project',
    location='global',
    vertexai=True,
)

response = llm.invoke('Hello!')
print(response.content)
```

Replace `sk-quilr-xxx` with the API key you created in the dashboard. The model parameter uses the same model names as your provider. For Vertex AI, the `project` and `location` should match the values configured when creating the key.

## 3. Using Routing Groups

If you've configured a [Routing Group](./features/request-routing), pass the group name as the `model` parameter. The gateway automatically load-balances and fails over across providers in that group.

```python
response = client.chat.completions.create(
    model='Group1',  # your routing group name
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

See [Request Routing](./features/request-routing) for full details on setting up groups.
