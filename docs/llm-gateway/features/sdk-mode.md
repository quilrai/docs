---
sidebar_position: 10
sidebar_custom_props:
  icon: Wrench
---

# SDK Mode

Scan content directly from your application code - no LLM proxy required.

## Overview

SDK mode exposes a standalone content-checking endpoint (`POST /sdk/v1/check`) that you can call at any point in your pipeline. Instead of routing LLM traffic through the Quilr gateway, you call this endpoint yourself to scan messages or text for sensitive data and adversarial inputs.

Common uses:

- Check user input before forwarding to an LLM
- Scan LLM responses before returning them to users
- Scan file uploads, form fields, or other non-LLM content
- Integrate with a self-hosted LiteLLM proxy

## Authentication

SDK mode requires a dedicated **SDK key** - regular LLM proxy keys are rejected with `403`.

When creating an API key in the dashboard, set the provider to `quilr_sdk`. Then use it as a Bearer token:

```
Authorization: Bearer sk-quilr-xxx
```

`Api-Key: sk-quilr-xxx` is also accepted.

You can optionally include an `X-User-Email` header for identity-aware enforcement if that is configured on your key.

## Request Format

`POST /sdk/v1/check`

Two input formats are supported:

### Messages (conversation)

Use this to check a full conversation. The `type` field is optional.

```json
{
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "type": "request",
  "metadata": {}
}
```

### Text (raw string)

Use this to check a single piece of text. The `type` field is optional.

```json
{
  "text": "some text to check",
  "type": "request"
}
```

`type` is `"request"` or `"response"`.

## Response

The endpoint always returns HTTP 200. The response shape depends on which input format you used.

### Messages response

```json
{
  "status": "safe | redacted | blocked",
  "action": "allow | redact | block",
  "messages": [...],
  "blocked_text": "...",
  "predictions": [...],
  "categories_detected": ["pii", "email", "ssn"],
  "error": {...}
}
```

- `messages` - the (possibly redacted) messages array; `null` if blocked
- `blocked_text` - only present when `status` is `blocked`
- `error` - only present when `status` is `blocked`

### Text response

```json
{
  "status": "safe | redacted | blocked",
  "action": "allow | redact | block",
  "original_text": "...",
  "processed_text": "...",
  "predictions": [...],
  "categories_detected": ["pii", "phone"],
  "error": {...}
}
```

- `processed_text` - the redacted text; `null` if blocked
- `error` - only present when `status` is `blocked`

---

## Code Examples

### Python - `httpx` (async)

A typical pattern: check the user message before sending it to your LLM, then check the LLM response before returning it to the user.

```python
import httpx

QUILR_BASE = "https://guardrails.quilr.ai"
QUILR_SDK_KEY = "sk-quilr-xxx"

async def check_messages(messages: list[dict]) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{QUILR_BASE}/sdk/v1/check",
            headers={"Authorization": f"Bearer {QUILR_SDK_KEY}"},
            json={"messages": messages, "type": "request"},
            timeout=5,
        )
        resp.raise_for_status()
        return resp.json()

async def check_text(text: str, type_: str = "response") -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{QUILR_BASE}/sdk/v1/check",
            headers={"Authorization": f"Bearer {QUILR_SDK_KEY}"},
            json={"text": text, "type": type_},
            timeout=5,
        )
        resp.raise_for_status()
        return resp.json()

# --- Usage ---

import asyncio
from openai import AsyncOpenAI

openai = AsyncOpenAI(api_key="sk-openai-xxx")

async def safe_chat(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    # 1. Check input
    result = await check_messages(messages)
    if result["status"] == "blocked":
        raise ValueError(f"Input blocked: {result['categories_detected']}")
    if result["status"] == "redacted":
        messages = result["messages"]  # use redacted version

    # 2. Call LLM
    response = await openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
    )
    reply = response.choices[0].message.content

    # 3. Check output
    result = await check_text(reply, type_="response")
    if result["status"] == "blocked":
        raise ValueError(f"Response blocked: {result['categories_detected']}")
    if result["status"] == "redacted":
        reply = result["processed_text"]

    return reply

asyncio.run(safe_chat("What is my SSN?"))
```

### Python - `requests` (sync)

```python
import requests

QUILR_BASE = "https://guardrails.quilr.ai"
QUILR_SDK_KEY = "sk-quilr-xxx"

def check_text(text: str, type_: str = "response") -> dict:
    resp = requests.post(
        f"{QUILR_BASE}/sdk/v1/check",
        headers={"Authorization": f"Bearer {QUILR_SDK_KEY}"},
        json={"text": text, "type": type_},
        timeout=5,
    )
    resp.raise_for_status()
    return resp.json()

# Check a piece of text before storing or displaying it
result = check_text("My credit card is 4111 1111 1111 1111", type_="request")

match result["status"]:
    case "safe":
        print("No issues found")
    case "redacted":
        print("Cleaned text:", result["processed_text"])
    case "blocked":
        print("Blocked. Detected:", result["categories_detected"])
```

### JavaScript / TypeScript - `fetch`

```typescript
const QUILR_BASE = "https://guardrails.quilr.ai";
const QUILR_SDK_KEY = "sk-quilr-xxx";

async function checkMessages(messages: Array<{ role: string; content: string }>) {
  const res = await fetch(`${QUILR_BASE}/sdk/v1/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QUILR_SDK_KEY}`,
    },
    body: JSON.stringify({ messages, type: "request" }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Quilr error: ${res.status}`);
  return res.json();
}

async function checkText(text: string, type: "request" | "response" = "response") {
  const res = await fetch(`${QUILR_BASE}/sdk/v1/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QUILR_SDK_KEY}`,
    },
    body: JSON.stringify({ text, type }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Quilr error: ${res.status}`);
  return res.json();
}

// Example: guard a chat endpoint
async function safeChat(userMessage: string): Promise<string> {
  const messages = [{ role: "user", content: userMessage }];

  const inputResult = await checkMessages(messages);
  if (inputResult.status === "blocked") {
    throw new Error(`Blocked: ${inputResult.categories_detected.join(", ")}`);
  }
  const checkedMessages =
    inputResult.status === "redacted" ? inputResult.messages : messages;

  // ... call your LLM with checkedMessages ...
  const llmReply = "...";

  const outputResult = await checkText(llmReply, "response");
  if (outputResult.status === "blocked") {
    throw new Error(`Response blocked: ${outputResult.categories_detected.join(", ")}`);
  }
  return outputResult.status === "redacted" ? outputResult.processed_text : llmReply;
}
```

### cURL

```bash
# Check raw text
curl -X POST https://guardrails.quilr.ai/sdk/v1/check \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -H "Content-Type: application/json" \
  -d '{"text": "Call me at 555-867-5309", "type": "request"}'

# Check a conversation
curl -X POST https://guardrails.quilr.ai/sdk/v1/check \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is the password for admin@acme.com?"}
    ],
    "type": "request"
  }'
```

---

## LiteLLM Guardrails Integration

If you run a self-hosted [LiteLLM proxy](https://docs.litellm.ai/docs/proxy/quick_start), you can plug Quilr guardrails in as a native guardrail plugin. The plugin calls `/sdk/v1/check` automatically on every request and/or response - no changes needed in your application code.

### Installation

```bash
pip install quilr-litellm-guardrails
```

Or copy `quilr_litellm_guardrails.py` into your project.

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `QUILR_GUARDRAILS_KEY` | Yes | - | Your `quilr_sdk` API key |
| `QUILR_GUARDRAILS_BASE_URL` | No | `https://guardrails.quilr.ai` | Override for self-hosted deployments |
| `QUILR_GUARDRAILS_TIMEOUT` | No | `3` | Seconds before the check times out (request passes on timeout) |
| `APPLY_QUILR_GUARDRAILS_FOR_MODELS` | No | (all) | Comma-separated list of models to restrict guardrails to |
| `APPLY_QUILR_GUARDRAILS_FOR_KEY_NAMES` | No | (all) | Comma-separated list of LiteLLM key names to restrict guardrails to |

### LiteLLM `config.yaml`

```yaml
guardrails:
  # Check input before the LLM call (adds latency equal to check time)
  - guardrail_name: "quilr-input"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "pre_call"

  # Check input in parallel with the LLM call (zero added latency)
  - guardrail_name: "quilr-input-async"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "during_call"

  # Check output before returning it to the caller
  - guardrail_name: "quilr-output"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "post_call"
```

You can configure all three, or only the modes you need. `during_call` is the recommended input mode when latency matters - the guardrail check runs concurrently with the LLM and does not add to total response time unless it detects a problem.

### Enabling guardrails per request

Pass the guardrail names in the request body:

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-litellm-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["quilr-input-async", "quilr-output"]
  }'
```

### Behavior summary

| Mode | What happens on `blocked` | What happens on `redacted` |
|------|--------------------------|----------------------------|
| `pre_call` | Request rejected before LLM is called | Messages replaced with redacted version before LLM call |
| `during_call` | LLM response discarded, error returned | Messages updated (LLM call already in flight) |
| `post_call` | Response rejected, error returned to caller | Response content replaced with redacted version |

On timeout or any unexpected error from the Quilr API, the request passes through unchanged.
