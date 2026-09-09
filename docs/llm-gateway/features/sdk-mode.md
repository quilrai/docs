---
sidebar_position: 10
sidebar_custom_props:
  badge: new
  icon: Wrench
---

# SDK Mode

Scan content directly from your application code - no LLM proxy required.

## Overview

SDK mode exposes a standalone content-checking endpoint (`POST /sdk/v1/check`) that you can call at any point in your pipeline. Instead of routing LLM traffic through the Quilr gateway, you call this endpoint yourself to scan messages, text, or structured JSON for sensitive data and adversarial inputs.

Want to test a key before wiring it into your app? Open the [LLM Gateway Playground](/llm-gateway-playground) and select **Quilr SDK**. Choose **Text**, **Messages**, or **JSON**, select the request/response check type and hashing mode, then run the check. The playground shows processed content, placeholder mappings, detected JSON paths, and similar names, and generates matching cURL, Python, and JavaScript.

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

Three input formats are supported. Send one content field: `messages`, `text`, or `json`.

### Messages (conversation)

Send an OpenAI-style conversation. Request checks select recent user messages according to your key settings. A final assistant message, or `type: "response"`, checks the last message as response text and returns the text response shape. The `type` field is optional.

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

Use this to check a single piece of text. Set `type: "request"` for input checks; omitting `type` checks raw text as a response.

```json
{
  "text": "some text to check",
  "type": "request"
}
```

### JSON (structured content)

Put the value to scan in `json`. Pass an actual JSON value, rather than a serialized object inside `text`.

```json
{
  "type": "request",
  "json": {
    "customer": {
      "firstName": "Praneeth",
      "fullName": "Praneeth Bedapudi",
      "name": "PRANEETH"
    },
    "contacts": [{"email": "praneeth@example.com"}],
    "active": true,
    "notes": null
  },
  "hashing_mode": "case_insensitive",
  "metadata": {"source": "customer-profile"}
}
```

`json` accepts objects, arrays, and scalar roots, including strings, numbers, booleans, and `null`. JSON checks default to `type: "request"`; use `"response"` to apply response-side scopes. JSON-looking content in `text` stays in text mode.

String and number values are scanned together as one document. Field and parent names provide context, including readable camelCase and snake_case labels. Keys are preserved and entity detections found only in keys are discarded. Key names do not force detection: your configured categories, sensitivities, scopes, and actions still apply. For example, the SDK's labeled-name fallback requires the `NAME` subcategory sensitivity to be `high`.

A detected entity can match occurrences in multiple values, including under different keys. This is document-wide entity detection, not independent classification of each field.

### Request parameters

| Field | Type | Behavior |
|-------|------|----------|
| `messages` | Array of messages | Conversation input. Use one content field per request. |
| `text` | String | Raw text input. |
| `json` | Any JSON value | Structured input. Cannot be combined with `text` or `messages`, even if those fields are `null`. |
| `type` | `"request"` or `"response"` | Selects check scopes. JSON defaults to request; raw text defaults to response. Messages ending in an assistant message use response checks. Set this explicitly in integrations. |
| `hashing_mode` | `"case_sensitive"` or `"case_insensitive"` | Optional; defaults to `"case_sensitive"`. Controls placeholder hashes in every input format. |
| `metadata` | JSON metadata | Optional caller metadata stored with the SDK check. |

## Response

Completed checks return HTTP 200, including content blocked by guardrails. Authentication, validation, and policy-access errors use non-2xx responses. The response shape depends on the input and check type.
Use `action` for application control flow, and use `predictions` to inspect what
the guardrail found.

### Messages response

```json
{
  "status": "safe | redacted | blocked",
  "action": "allow | redact | block",
  "messages": [...],
  "blocked_text": "...",
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
  "categories_detected": ["pii", "email", "ssn"],
  "similar_entities": [],
  "similar_entities_truncated": false,
  "placeholder_masking": {
    "hashing_mode": "case_sensitive",
    "text": "My SSN is <qe-01a54629efb95228>.",
    "messages": [
      { "role": "user", "content": "My SSN is <qe-01a54629efb95228>." }
    ],
    "placeholders": [
      {
        "placeholder": "<qe-01a54629efb95228>",
        "value": "123-45-6789",
        "sub_category": "SOCIAL SECURITY NUMBER",
        "category_id": "data_risk_category_pii",
        "action": "redact",
        "message_index": 0
      }
    ]
  },
  "error": {...}
}
```

- `messages` - the (possibly redacted) messages array; `null` if blocked
- `blocked_text` - only present when `status` is `blocked`
- `predictions` - rule-level details, including exact `sensitive_entities` and
  `entity_texts_with_subcategories`
- `error` - only present when `status` is `blocked`

### Text response

```json
{
  "status": "safe | redacted | blocked",
  "action": "allow | redact | block",
  "original_text": "...",
  "processed_text": "...",
  "predictions": [
    {
      "id": "...",
      "name": "...",
      "type": "redact",
      "sensitive_entities": ["555-867-5309"],
      "entity_texts_with_subcategories": {
        "555-867-5309": "PHONE NUMBER"
      }
    }
  ],
  "categories_detected": ["pii", "phone"],
  "similar_entities": [],
  "similar_entities_truncated": false,
  "placeholder_masking": {
    "hashing_mode": "case_sensitive",
    "text": "Call me at <qe-59c0b4a6fc3c3b2c>.",
    "messages": null,
    "placeholders": [
      {
        "placeholder": "<qe-59c0b4a6fc3c3b2c>",
        "value": "555-867-5309",
        "sub_category": "PHONE NUMBER",
        "category_id": "data_risk_category_pii",
        "action": "redact"
      }
    ]
  },
  "error": {...}
}
```

- `processed_text` - the redacted text; `null` if blocked
- `predictions` - rule-level details, including exact `sensitive_entities` and
  `entity_texts_with_subcategories`
- `error` - only present when `status` is `blocked`

### JSON response

This example assumes `NAME` is detected and its configured action is `redact`:

```json
{
  "status": "redacted",
  "action": "redact",
  "original_json": {"name": "praneeth", "active": true, "notes": null},
  "processed_json": {"name": "XXXXXXXX", "active": true, "notes": null},
  "original_text": "{\"name\": \"praneeth\", \"active\": true, \"notes\": null}",
  "processed_text": "{\"name\": \"XXXXXXXX\", \"active\": true, \"notes\": null}",
  "predictions": [
    {
      "id": "data_risk_category_pii",
      "type": "redact",
      "sensitive_entities": ["praneeth"],
      "entity_texts_with_subcategories": {"praneeth": "NAME"},
      "entity_json_paths": {"praneeth": ["/name"]}
    }
  ],
  "categories_detected": ["pii"],
  "placeholder_masking": {
    "hashing_mode": "case_sensitive",
    "json": {"name": "<qe-3eec439a42808ba8>", "active": true, "notes": null},
    "text": "{\"name\": \"<qe-3eec439a42808ba8>\", \"active\": true, \"notes\": null}",
    "messages": null,
    "placeholders": [
      {
        "placeholder": "<qe-3eec439a42808ba8>",
        "value": "praneeth",
        "sub_category": "NAME",
        "category_id": "data_risk_category_pii",
        "action": "redact",
        "json_paths": ["/name"]
      }
    ]
  },
  "similar_entities": [],
  "similar_entities_truncated": false
}
```

- `original_json`, `processed_json`, and `placeholder_masking.json` are actual JSON values. The corresponding `*_text` fields contain serialized JSON for compatibility.
- `processed_json` follows the configured redact or partial-redact action. Safe and monitor-only values stay unchanged. Keys, nesting, array order, empty containers, booleans, and `null` are preserved. A masked number becomes a string; unchanged numbers keep their numeric type.
- Blocked results have `action: "block"`, `processed_json: null`, `processed_text: null`, and `error` details. Placeholder output remains available for inspection and does not override the block. Check `action` before consuming content; `null` can also be a valid safe JSON root.
- `entity_json_paths` maps each detected entity to matching value locations. Placeholder entries include `json_paths` for replaced locations. These are JSON Pointers: `/contacts/0/email` addresses an array item, `~` is escaped as `~0`, `/` as `~1`, and `""` means the root.

### Placeholder masking and hashing mode

Every completed check includes `placeholder_masking`, an additional view with full placeholders for entities whose effective action is redact, partial-redact, or block. Monitor-only values remain unchanged. Use `placeholder_masking.messages` for request messages, `.text` for raw text, or `.json` for JSON input. Text and JSON checks set `.messages` to `null`.

Tokens have the format `<qe-{16-char-hash}>`: the first 16 hexadecimal characters of an unsalted SHA-256 hash of the UTF-8 value. `placeholders[]` retains original values and detection metadata so your application can restore values using the mapping; the hash itself is not reversible.

| `hashing_mode` | Hash input | Example |
|----------------|------------|---------|
| `case_sensitive` (default) | Exact matched source value | `Praneeth` and `praneeth` have different hashes. |
| `case_insensitive` | Source value after Unicode case folding | `Praneeth`, `praneeth`, and `PRANEETH` all produce `<qe-3eec439a42808ba8>`. |

The selected mode is echoed in `placeholder_masking.hashing_mode`. It applies to all placeholder entity types and changes hashing only; detection, ordinary redaction, and policy actions are unaffected. Whitespace, punctuation, and accents remain part of the hash input.

Repeated identical JSON values share a placeholder entry with every replaced path. In case-insensitive mode, different source spellings can share a token but retain separate mapping entries with their exact `value` and `json_paths` or `message_index`. Preserve the location and source spelling if you need to restore exact capitalization: the shared token alone cannot distinguish it.

### Similar entities

Every completed check also includes `similar_entities` and `similar_entities_truncated`. These are response fields, not request parameters. When both names in `{"first": "Praneeth", "full": "Praneeth Bedapudi"}` are detected, a case-insensitive check can return:

```json
{
  "similar_entities": [
    {
      "relationship": "possible_name_match",
      "reason": "name_contains",
      "entities": [
        {
          "value": "Praneeth",
          "hash": "3eec439a42808ba8",
          "placeholder": "<qe-3eec439a42808ba8>",
          "category_id": "data_risk_category_pii",
          "sub_category": "NAME",
          "json_paths": ["/first", "/full"]
        },
        {
          "value": "Praneeth Bedapudi",
          "hash": "e22c3df7649a8ca6",
          "placeholder": "<qe-e22c3df7649a8ca6>",
          "category_id": "data_risk_category_pii",
          "sub_category": "NAME",
          "json_paths": ["/full"]
        }
      ]
    }
  ],
  "similar_entities_truncated": false
}
```

Pairs are advisory textual similarities, not verified identity matches, and do not merge hashes or change detection or masking. Only detected person-name subcategories within the same category are compared; passwords, identifiers, emails, and usernames are excluded. Names that were not detected are not inferred.

| `reason` | Meaning |
|----------|---------|
| `case_variant` | Same value after case folding. |
| `normalized_name_match` | Same name tokens after Unicode, spacing, and punctuation normalization. |
| `name_contains` | One detected name is a contiguous sequence of whole name tokens in the other, including a surname. |

Matching does not use fuzzy spelling, initials, or partial-word matches such as Ann/Anna. Pairs do not imply transitive identity groups. Similarity normalization does not change the hash input: hashes always follow `hashing_mode`, and short and full names keep separate hashes.

Entities retain actual source spellings and `json_paths` for JSON or `message_indices` for messages. JSON keys are excluded. Monitor-only or overlapping name detections may appear, so a reported hash need not appear in the masked output. With no matching names the list is `[]`.

Candidate values and returned pairs are capped at 256 each. `similar_entities_truncated: true` signals either limit; this limit affects only these advisory results, not detection or masking.

### Validation errors

Check the HTTP status before reading a check result. Validation errors use an `error` object with `message`, `type: "invalid_request_error"`, and `code`.

| HTTP status | `error.code` | Cause |
|-------------|--------------|-------|
| 400 | `invalid_json` | Malformed request JSON or a request envelope that is not an object. |
| 400 | `missing_content` | Missing or invalid text/messages content. |
| 400 | `invalid_json_input` | `json` combined with another content field, invalid JSON-mode `type`, invalid Unicode, NaN/Infinity, or nesting beyond 64 levels. |
| 400 | `invalid_hashing_mode` | Any hashing mode other than the two supported strings, including `null` or booleans. |


---

## Code Examples

### Structured JSON - Python

Send the JSON value without stringifying it. Check the action first and read `processed_json` directly, including when the safe result is `null`, `false`, `0`, or an empty value.

```python
import requests

response = requests.post(
    "https://guardrails-usa-2.quilr.ai/sdk/v1/check",
    headers={"Authorization": "Bearer sk-quilr-xxx"},
    json={
        "type": "request",
        "json": {"name": "Praneeth", "active": True, "notes": None},
        "hashing_mode": "case_insensitive",
        "metadata": {"source": "customer-profile"},
    },
    timeout=15,
)
response.raise_for_status()
result = response.json()
if result["action"] == "block":
    raise ValueError(f"Blocked: {result['categories_detected']}")
safe_json = result["processed_json"]
placeholder_json = result["placeholder_masking"]["json"]
possible_name_matches = result["similar_entities"]
```

### Structured JSON - JavaScript

```javascript
const response = await fetch("https://guardrails-usa-2.quilr.ai/sdk/v1/check", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk-quilr-xxx",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "request",
    json: { name: "Praneeth", active: true, notes: null },
    hashing_mode: "case_insensitive",
  }),
});
if (!response.ok) throw new Error(`Check failed: ${response.status}`);
const result = await response.json();
if (result.action === "block") throw new Error("Content blocked");
const safeJson = result.processed_json;
const placeholderJson = result.placeholder_masking.json;
const possibleNameMatches = result.similar_entities;
```

### Structured JSON - cURL

```bash
curl -X POST https://guardrails-usa-2.quilr.ai/sdk/v1/check \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "response",
    "json": {"name": "Praneeth", "active": true, "notes": null},
    "hashing_mode": "case_insensitive"
  }'
```

### Python - `httpx` (async)

A typical pattern: check the user message before sending it to your LLM, then check the LLM response before returning it to the user.

```python
import httpx

QUILR_BASE = "https://guardrails-usa-2.quilr.ai"
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

QUILR_BASE = "https://guardrails-usa-2.quilr.ai"
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
const QUILR_BASE = "https://guardrails-usa-2.quilr.ai";
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
curl -X POST https://guardrails-usa-2.quilr.ai/sdk/v1/check \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -H "Content-Type: application/json" \
  -d '{"text": "Call me at 555-867-5309", "type": "request"}'

# Check a conversation
curl -X POST https://guardrails-usa-2.quilr.ai/sdk/v1/check \
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

### Prerequisites

- A Quilr guardrails API key, from either Quilr-hosted guardrails or a self-hosted Quilr guardrails deployment
- Download [quilr_litellm_guardrails.py](https://github.com/quilrbusiness/quilr-sdks/blob/main/python-sdks/litellm_guardrails/quilr_litellm_guardrails.py) and place it in the same directory as your LiteLLM `config.yaml`

:::note
LiteLLM resolves custom guardrails by module path relative to the proxy working directory, so the plugin ships as a single file you drop next to `config.yaml`. There is no package to install.
:::

### Environment variables

```bash
QUILR_GUARDRAILS_KEY=sk-quilr-XXXXXXXXX
QUILR_GUARDRAILS_BASE_URL=<QUILR GUARDRAILS BASE URL>
QUILR_GUARDRAILS_TIMEOUT=3  # Optional: timeout in seconds (default: 3). On timeout or API error, the request passes through.
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `QUILR_GUARDRAILS_KEY` | Yes | - | Your `quilr_sdk` API key |
| `QUILR_GUARDRAILS_BASE_URL` | No | `https://guardrails.quilr.ai` | Override with the closest regional endpoint for production or with a self-hosted deployment URL |
| `QUILR_GUARDRAILS_TIMEOUT` | No | `3` | Seconds before the check times out (request passes on timeout) |
| `APPLY_QUILR_GUARDRAILS_FOR_MODELS` | No | (all) | Comma-separated list of models to restrict guardrails to |
| `APPLY_QUILR_GUARDRAILS_FOR_KEY_NAMES` | No | (all) | Comma-separated list of LiteLLM key names to restrict guardrails to |

### Choosing a mode

Add guardrails to your LiteLLM `config.yaml` using the modes you need:

| Mode | When it runs | What it checks | Pros | Cons |
|------|-------------|----------------|------|------|
| `pre_call` | Before the LLM call (sequential) | Input | Can block malicious requests before they reach the LLM, prevents data leakage | Adds minimal latency |
| `during_call` | In parallel with the LLM call | Input | No added latency | Cannot prevent data leakage or attacks, since the LLM processes the request before the guardrail completes |
| `post_call` | After the LLM call | Output | Can check LLM responses for policy violations | Adds guardrail latency. Only needed if the response has to be checked |

**When to use `during_call` vs `pre_call`:**

- Use `during_call` for better latency, since the guardrail runs concurrently with the LLM
- Use `pre_call` if you want to avoid wasting LLM compute on blocked requests

### LiteLLM `config.yaml`

**Input guardrail only (`pre_call`)**

```yaml
guardrails:
  - guardrail_name: "quilr-input"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "pre_call"
    default_on: true
```

**Input guardrail with lower latency (`during_call`)**

```yaml
guardrails:
  - guardrail_name: "quilr-input-duringcall"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "during_call"
    default_on: true
```

**Output guardrail only (`post_call`)**

```yaml
guardrails:
  - guardrail_name: "quilr-output"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "post_call"
    default_on: true
```

**Both input and output guardrails**

```yaml
guardrails:
  - guardrail_name: "quilr-input"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "pre_call"
    default_on: true

  - guardrail_name: "quilr-output"
    litellm_params:
      guardrail: quilr_litellm_guardrails.QuilrGuardrail
      mode: "post_call"
    default_on: true
```

### Optional filtering

You can limit which requests have guardrails applied using these environment variables:

```bash
# Only apply guardrails to specific models (comma-separated)
APPLY_QUILR_GUARDRAILS_FOR_MODELS=gpt-4,gpt-4o,claude-3-opus

# Only apply guardrails to specific API key names (comma-separated)
APPLY_QUILR_GUARDRAILS_FOR_KEY_NAMES=production-key,user-facing-key
```

If neither variable is set, guardrails apply to all requests. If both are set, a request must match both filters (AND logic) for guardrails to be applied.

### Enabling guardrails per request

With `default_on: true`, guardrails run on every request. If you set `default_on: false`, pass the guardrail names in the request body instead:

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-litellm-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["quilr-input-duringcall", "quilr-output"]
  }'
```

### Behavior summary

| Mode | What happens on `blocked` | What happens on `redacted` |
|------|--------------------------|----------------------------|
| `pre_call` | Request rejected before LLM is called | Messages replaced with redacted version before LLM call |
| `during_call` | LLM response discarded, error returned | Messages updated (LLM call already in flight) |
| `post_call` | Response rejected, error returned to caller | Response content replaced with redacted version |

On timeout or any unexpected error from the Quilr API, the request passes through unchanged.
