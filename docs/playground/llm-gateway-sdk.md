---
sidebar_position: 1
hide_table_of_contents: true
sidebar_custom_props:
  badge: new
  icon: BrainCircuit
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLM Gateway Playground

Use this page to test QuilrAI LLM Gateway requests before wiring them into an application. The provider API key mode sends real gateway calls to supported HTTP surfaces. The SDK mode checks standalone guardrail requests and responses with a `quilr_sdk` key.

## Interactive Playground

Use **Provider API key** for normal LLM Gateway keys that proxy to a configured provider. Use **SDK check** for guardrails-only `quilr_sdk` keys.

The provider API key mode supports direct browser requests for these HTTP surfaces:

| Surface | Path | Notes |
|---------|------|-------|
| Unified chat completions | `/openai_compatible/v1/chat/completions` | Works with OpenAI-compatible chat and gateway translations for Bedrock Converse, Vertex Gemini, Anthropic Messages, and other configured chat providers. |
| OpenAI text completions | `/openai_compatible/v1/completions` | Classic OpenAI-compatible text completion shape for upstreams that still expose `/v1/completions`. |
| OpenAI Responses | `/openai_responses/v1/responses` | Requires an OpenAI Responses or Azure OpenAI Responses provider on the key. |
| Embeddings | `/openai_compatible/v1/embeddings` | Uses the OpenAI embeddings request shape. |
| Rerank | `/rerank/v2/rerank` | Uses the Cohere-compatible rerank request shape. |
| Anthropic Messages | `/anthropic_messages/v1/messages` | Sends native Anthropic Messages JSON with `x-api-key` auth. |
| Text to speech | `/openai_compatible/v1/audio/speech` | Uses the OpenAI-compatible TTS JSON body and shows returned audio metadata plus a browser audio preview. |

:::info Provider-specific SDKs
Browser mode sends plain HTTP requests with JSON bodies. Bedrock boto3 requires SigV4 signing, OpenAI Realtime requires a websocket session, STT and audio translations require multipart file upload, Copilot Studio is configured as an external webhook, and native Vertex paths depend on provider-specific URL construction. Those flows are documented in the integration guide instead of being executed here.
:::

:::caution Keep production keys out of public browsers
The playground sends your key directly from this page to QuilrAI and does not store it. For public applications, put this call behind your backend or edge service so end users cannot inspect or reuse the key.
:::

<SdkApiKeyTester />

Use the code switcher in the playground to see the exact request for the selected endpoint, API surface, provider selector, and JSON body. The key is masked in the snippet by default; reveal it only when you need to copy a runnable local command.

## SDK Mode

The SDK endpoint is:

```http
POST /sdk/v1/check
Authorization: Bearer sk-quilr-...
Content-Type: application/json
```

Use the closest gateway host from the [Integration Guide](../llm-gateway/integration-guide), then append `/sdk/v1/check`.

For a user request, send messages and optional metadata:

```json
{
  "type": "request",
  "messages": [
    { "role": "user", "content": "My SSN is 219-09-4823" }
  ],
  "metadata": {
    "caller": "demo-frontend",
    "team_id": "sales",
    "user_id": "internal-user-1",
    "end_user_id": "customer-1"
  }
}
```

For model output or any raw text, send:

```json
{
  "type": "response",
  "text": "Response text to inspect"
}
```

## Response Shape

The response tells your caller what to do next. Treat `action` as the judgement
your application should branch on:

```json
{
  "status": "redacted",
  "action": "redact",
  "messages": [
    { "role": "user", "content": "My SSN is [REDACTED]." }
  ],
  "predictions": [
    {
      "id": "...",
      "name": "...",
      "type": "redact",
      "sensitive_entities": ["123-45-6789"],
      "entity_texts_with_subcategories": {
        "123-45-6789": "SOCIAL SECURITY NUMBER"
      }
    }
  ],
  "categories_detected": ["pii", "ssn"],
  "placeholder_masking": {
    "text": "My SSN is [SSN_1].",
    "messages": [
      { "role": "user", "content": "My SSN is [SSN_1]." }
    ],
    "placeholders": [
      {
        "placeholder": "[SSN_1]",
        "value": "123-45-6789",
        "sub_category": "SOCIAL SECURITY NUMBER",
        "category_id": "data_risk_category_pii",
        "action": "redact",
        "message_index": 0
      }
    ]
  }
}
```

Some fields are populated only for the input shape you used. For example, message checks return `messages` when the content is allowed or redacted, while raw text checks return `processed_text`.

Use the judgement fields for control flow:

| Result | Caller behavior |
|--------|-----------------|
| `safe` / `allow` | Continue with the original content. |
| `redacted` / `redact` | Use the returned `messages` or `processed_text` instead of the original content. |
| `blocked` / `block` | Stop the flow and return your own safe fallback. |

Use the prediction fields for inspection and audit:

| Field | Meaning |
|-------|---------|
| `predictions[].sensitive_entities` | Exact entity text that triggered the rule. Treat this as sensitive data. |
| `predictions[].entity_texts_with_subcategories` | Map of entity text to a human-readable subcategory, such as `SOCIAL SECURITY NUMBER`. |
| `categories_detected` | Coarse categories detected across the check, such as `pii` or `ssn`. |
| `placeholder_masking` | Additive placeholder view of the checked content, with bracketed tokens such as `[PASSPORT_1]` and a `placeholders[]` map back to original values. |

## Redact Before Calling an LLM

This pattern checks the caller's user message before sending it to an LLM. If QuilrAI redacts the request, your app forwards the redacted messages to the model.

<Tabs groupId="sdk-playground-language">
<TabItem value="javascript" label="JavaScript" default>

```javascript
const QUILR_BASE = "https://guardrails.quilr.ai";
const QUILR_SDK_KEY = process.env.QUILR_SDK_KEY;

async function checkUserMessages(messages) {
  const res = await fetch(`${QUILR_BASE}/sdk/v1/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QUILR_SDK_KEY}`,
    },
    body: JSON.stringify({
      type: "request",
      messages,
      metadata: { caller: "chat-api" },
    }),
  });

  if (!res.ok) throw new Error(`QuilrAI check failed: ${res.status}`);
  return res.json();
}

async function handleChat(userText) {
  const messages = [{ role: "user", content: userText }];
  const check = await checkUserMessages(messages);

  if (check.action === "block") {
    return { blocked: true, content: "I cannot process that request." };
  }

  const llmMessages = check.action === "redact" ? check.messages : messages;
  const detectedEntities =
    check.predictions?.flatMap((prediction) => prediction.sensitive_entities ?? []) ?? [];

  // Call your LLM with llmMessages.
  return callModel(llmMessages, { detectedEntities });
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import os
import requests

QUILR_BASE = "https://guardrails.quilr.ai"
QUILR_SDK_KEY = os.environ["QUILR_SDK_KEY"]


def check_user_messages(messages):
    response = requests.post(
        f"{QUILR_BASE}/sdk/v1/check",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {QUILR_SDK_KEY}",
        },
        json={
            "type": "request",
            "messages": messages,
            "metadata": {"caller": "chat-api"},
        },
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def handle_chat(user_text):
    messages = [{"role": "user", "content": user_text}]
    check = check_user_messages(messages)

    if check.get("action") == "block":
        return {"blocked": True, "content": "I cannot process that request."}

    llm_messages = check["messages"] if check.get("action") == "redact" else messages
    detected_entities = [
        entity
        for prediction in check.get("predictions", [])
        for entity in prediction.get("sensitive_entities", [])
    ]

    # Call your LLM with llm_messages.
    return call_model(llm_messages, detected_entities=detected_entities)
```

</TabItem>
</Tabs>

## Redact Before Returning to a Caller

This pattern checks the model response before your app returns it to the user. If QuilrAI redacts the response, return `processed_text`.

<Tabs groupId="sdk-playground-language">
<TabItem value="javascript" label="JavaScript" default>

```javascript
async function checkModelOutput(text) {
  const res = await fetch(`${QUILR_BASE}/sdk/v1/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QUILR_SDK_KEY}`,
    },
    body: JSON.stringify({ type: "response", text }),
  });

  if (!res.ok) throw new Error(`QuilrAI check failed: ${res.status}`);
  return res.json();
}

async function safeReturn(modelText) {
  const check = await checkModelOutput(modelText);

  if (check.action === "block") {
    return "I cannot return that response.";
  }

  return check.action === "redact" ? check.processed_text : modelText;
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
def check_model_output(text):
    response = requests.post(
        f"{QUILR_BASE}/sdk/v1/check",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {QUILR_SDK_KEY}",
        },
        json={"type": "response", "text": text},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def safe_return(model_text):
    check = check_model_output(model_text)

    if check.get("action") == "block":
        return "I cannot return that response."

    return check["processed_text"] if check.get("action") == "redact" else model_text
```

</TabItem>
</Tabs>

See [SDK Mode](../llm-gateway/features/sdk-mode) for the full API reference and more integration patterns.
