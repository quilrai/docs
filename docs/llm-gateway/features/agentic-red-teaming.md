---
sidebar_position: 9
sidebar_custom_props:
  icon: Target
---

# Agentic Red Teaming

Run a full adversarial assessment against your live AI agent, not just single prompts.

## Overview

Where [Red Team Testing](./red-team-testing) grades the model behind an app against a fixed corpus of adversarial and capability tests, Agentic Red Teaming drives your live agent through multi-turn adversarial conversations - including the tools it can call. For every assessment the engine automatically:

1. Reconnoiters the live agent and discovers the tools it exposes.
2. Synthesizes tool-targeted attacks (BOLA/IDOR, unauthorized or destructive actions, argument injection) on top of the built-in OWASP LLM catalog.
3. Runs multi-turn attacks with per-turn scoring, then confirms each finding.
4. Produces remediation: a hardened system prompt, a Guardian Agent prompt, and AgentGuard custom-detection suggestions.

To do this the engine needs to talk to your agent. There are two ways to connect one: as a **hosted API/agent** (any HTTP endpoint) or as a **model provider** (bring your own model + key).

## Connect a target

<StepFlow
  steps={[
    { label: 'Pick a target type', items: ['HTTP / API agent', 'or a model provider'] },
    { label: 'Provide connection details', items: ['URL + response mapping', 'or provider + credentials'] },
    { label: 'Record authorized scope', items: ['Required before any run'] },
    { label: 'Run the assessment', items: ['Recon → attacks → report'] },
  ]}
/>

## Option A - HTTP / API agent

Point the engine at any HTTP endpoint that speaks JSON. You describe how to call it and where the reply lives in the response; the engine handles the multi-turn conversation.

### The contract

Your endpoint receives a request whose body the engine renders from a template you provide, substituting two placeholders:

- `{{message}}` - the next attacker turn (always sent).
- `{{session_id}}` - a stable id the engine generates per conversation, so your agent can keep multi-turn state.

Your endpoint returns JSON. You tell the engine where to read the reply, the session id, and any tool calls using dotted **response paths**.

### Configuration fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `url` | Yes | - | Absolute `http(s)` endpoint. Credentials are not allowed in the URL - use headers. |
| `method` | No | `POST` | `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`. |
| `headers` | No | `{}` | Up to 64 headers (e.g. `Authorization`). Transport-controlled headers are rejected. |
| `body_template` | No | `{"message": "{{message}}"}` | Request body with `{{message}}` and optional `{{session_id}}` placeholders. |
| `response_path` | Yes | - | Dotted path to the assistant reply text in the JSON response (e.g. `reply`, `data.output`). |
| `session_id_path` | No | - | Dotted path where the response returns a session id to reuse on the next turn. |
| `tool_calls_path` | No | - | Dotted path to the tool/function calls your agent made, so the engine can analyze tool abuse. |
| `timeout` | No | `60` | Per-request timeout in seconds (1-300). |
| `request_mode` | No | `auto` | `auto`, `json`, `raw`, or `multipart`. |
| `max_response_bytes` | No | `2000000` | Response size cap (1 KB - 20 MB). |

:::note
Response paths accept letters, digits, dot, dash, and underscore only (e.g. `data.reply`). Authentication headers and any auth-bearing URL query are omitted from stored history and must be re-supplied to re-run.
:::

### Example

Your agent is called like this:

```http
POST https://agent.example.com/chat
Content-Type: application/json
Authorization: Bearer <your-key>

{ "message": "What is my balance?", "session_id": "rt-abc123" }
```

and replies:

```json
{
  "reply": "Your balance is $420.00.",
  "session_id": "rt-abc123",
  "actions": [ { "name": "get_balance", "arguments": { "account": "self" } } ]
}
```

The matching target configuration is:

| Field | Value |
|-------|-------|
| `url` | `https://agent.example.com/chat` |
| `body_template` | `{"message": "{{message}}", "session_id": "{{session_id}}"}` |
| `response_path` | `reply` |
| `session_id_path` | `session_id` |
| `tool_calls_path` | `actions` |
| `headers` | `{ "Authorization": "Bearer <your-key>" }` |

That is all the API spec required: accept a POST with your templated JSON body, and return JSON containing at least the reply text at a known path. Returning the session id keeps multi-turn attacks coherent, and exposing tool calls lets the engine test for tool abuse.

## Option B - Model provider

If you would rather test a raw model (no app in front), bring your own provider and credentials. The engine runs your system prompt and tool definitions on that model. Supported providers and the fields each needs:

| Provider | Required fields | Notes |
|----------|-----------------|-------|
| OpenAI-compatible | `base_url`, `model`, `api_key` | Any OpenAI `chat/completions` compatible endpoint. |
| Azure OpenAI | `base_url` (resource endpoint), `deployment` (or `model`), `api_key`, `api_version` | Uses the deployment URL + `api-key` header. |
| Anthropic | `model`, `api_key` | Anthropic Messages API. |
| Google Gemini | `model`, `api_key` | Gemini `generateContent`. |
| AWS Bedrock | `model` (model id), `aws_region`, `aws_access_key_id`, `aws_secret_access_key`, optional `aws_session_token` | Bedrock Converse API, SigV4 signed. |

Provider credentials are never written to stored history - a re-run asks for them again.

## Remediation output

Every completed assessment closes the loop with three, grounded in the findings that actually broke the agent:

- **Prompt hardening** - a revised system prompt (with a diff) that resists the attacks that succeeded.
- **Guardian Agent prompt** - a DO/DON'T checklist to paste into your [Guardian Agent](./guardian-agent), covering the semantic attacks patterns cannot catch (authorization/BOLA, task scope, verification-state).
- **Custom detections** - pattern-based controls (injection phrases, SQL, secret/tool-name disclosure) to add as [Security Guardrails](./security-guardrails).

## Governance

Every run requires a recorded **authorized scope** attesting you are permitted to test the target. Only test agents you own or are explicitly authorized to assess.
