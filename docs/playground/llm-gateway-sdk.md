---
sidebar_position: 1
hide_table_of_contents: true
sidebar_custom_props:
  badge: new
  icon: BrainCircuit
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLM Gateway SDK Playground

Use this page to test a QuilrAI SDK-mode API key against the standalone guardrails endpoint. This does not proxy to an LLM and does not require provider credentials. It checks the content you send, then tells your application whether to allow, redact, or block it.

## SDK Playground

Test request-side and response-side guardrail checks with a `quilr_sdk` key.

:::info SDK keys only
This playground supports only QuilrAI SDK tokens: `sk-quilr-...` keys whose provider is `quilr_sdk`. Regular LLM Gateway provider keys are rejected with `sdk_mode_required`.
:::

:::caution Keep production keys out of public browsers
The playground sends your key directly from this page to QuilrAI and does not store it. For public applications, put this call behind your backend or edge service so end users cannot inspect or reuse the key.
:::

<SdkApiKeyTester />

Use the code switcher in the playground to see the exact `POST /sdk/v1/check`
call for the endpoint, mode, and text you entered. The key is masked in the
snippet by default; reveal it only when you need to copy a runnable local
command.

## What It Calls

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
  "categories_detected": ["pii", "ssn"]
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
