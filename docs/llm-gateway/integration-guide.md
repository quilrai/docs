---
sidebar_position: 3
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

## 3. Using Routing Groups

If you've configured a [Routing Group](./features/request-routing), pass the group name as the `model` parameter. The gateway automatically load-balances and fails over across providers in that group.

```python
response = client.chat.completions.create(
    model='Group1',  # your routing group name
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

See [Request Routing](./features/request-routing) for full details on setting up groups.
