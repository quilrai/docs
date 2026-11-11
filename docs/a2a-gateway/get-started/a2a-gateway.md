---
sidebar_position: 1
sidebar_label: "How it works"
sidebar_custom_props:
  badge: new
  icon: Handshake
description: "How the A2A Gateway governs Agent2Agent (A2A) traffic: registering agents, caller keys and grants, endpoints, supported versions, streaming, push notifications, chain limits, DLP, signed cards, limits and error codes."
aliases: [a2a, agent2agent, agent to agent, a2a gateway, agent card, agent catalog, a2a errors]
---

# A2A Gateway

Updated on 11 November 2026.

The A2A Gateway sits between agents that call each other over the [Agent2Agent (A2A) protocol](https://a2a-protocol.org). Callers (your agents, apps and partners) call the gateway instead of the target agent. Every call is authenticated, checked against the caller's grants and limits, scanned for sensitive data in both directions, and logged with its full payload and delegation chain.

It is the third QuilrAI gateway, next to the [LLM Gateway](/llm-gateway) (model calls) and the [MCP Gateway](/mcp-gateway) (tool calls).

## How a call flows

<ArchitectureDiagram
  source={{ label: 'Calling agent, app or partner', code: 'A2A request (JSON-RPC or HTTP+JSON)\nAuthorization: Bearer sk-quilr-a2a-...\nOptional: X-Quilr-User-Token (end user)\nOptional: X-Quilr-A2A-Chain from the previous hop' }}
  gateway={{
    label: 'QuilrAI A2A Gateway',
    phases: [
      { label: 'Request', stages: [
        { label: 'Identify', items: ['Caller key and source IP', 'Optional end-user token', 'Agent and approved card'] },
        { label: 'Authorize', items: ['Grant: agent, methods, skills', 'Chain depth and loops'] },
        { label: 'Limit', items: ['Requests per minute', 'Concurrent calls, open tasks'] },
        { label: 'Scan', items: ['Text, data and file text', 'Block or redact'] },
      ] },
      { label: 'Forward', stages: [
        { label: 'Task IDs', items: ['Gateway-issued IDs', 'Only the owner sees a task'] },
        { label: 'Outbound auth', items: ['Agent credential added', 'Your key never forwarded'] },
        { label: 'Send', items: ['Agent version and binding', 'HTTPS, public addresses'] },
      ] },
      { label: 'Response', stages: [
        { label: 'Scan', items: ['Messages, artifacts, status', 'Streams and push callbacks'] },
        { label: 'Return', items: ["Caller's version and binding", 'Every call logged'] },
      ] },
    ],
    footer: 'Fails closed on identity and task ownership · DLP fails open',
  }}
  destination={{ label: 'Target agents', items: ['Remote A2A agents (v1.0 or 0.3)', 'Amazon Bedrock AgentCore', 'Vertex AI Agent Engine', 'Azure AI Foundry agents', 'HTTP agents'] }}
/>

The gateway converts between A2A versions and bindings. A caller on A2A 0.3 JSON-RPC can call an agent that only speaks A2A 1.0 HTTP+JSON, and the other way round. Responses always come back in the caller's own version and binding.

## Register an agent

An admin registers each target agent once (step by step: [Quick start](./quick-start) and [Agents](../configure/agents)). There are three ways:

| Kind | What you provide | Notes |
|---|---|---|
| **Card URL** | The agent's public agent card URL | The gateway fetches and validates the card (A2A 1.0 or 0.3), checks its signatures and shows warnings before you save. Changes to the card are tracked (see [Card drift](#card-drift-and-approval)). |
| **Uploaded card** | The agent card JSON and the agent's endpoint URL, binding and A2A version | For agents that do not publish a card. |
| **Wrapped agent** | A platform agent and its credentials, plus the skills you want to expose | For agents that do not speak A2A. The gateway acts as the A2A server and builds the card from what you enter. |

Wrapped agents:

| Platform | Credentials | Streaming | Cancel |
|---|---|---|---|
| Amazon Bedrock AgentCore | AWS access keys, optional role to assume | Yes | Best effort |
| Vertex AI Agent Engine | Google Cloud service account key | Yes | No |
| Azure AI Foundry agents | Microsoft Entra client credentials | Yes | Yes |
| HTTP agent | Presets for OpenAI Responses, OpenAI Chat Completions or a plain JSON POST, with any outbound auth below | Responses and Chat Completions presets | No |

Wrapped agents accept text and data parts; file parts are refused. Each wrapped skill can map to its own platform call.

### Outbound auth

The gateway adds the agent's credential to every call. The caller's Quilr key is never forwarded. Secrets are write-only: once saved, they are never shown again.

| Mode | Use for |
|---|---|
| None | Agents with no auth |
| Bearer token | A static token in `Authorization` |
| API key header | A static key in a header you name |
| OAuth 2.0 client credentials | Token URL, client ID and secret, scopes and audience; tokens are cached until shortly before they expire |
| AWS SigV4 | Agents behind AWS IAM; region, service, access keys and an optional role to assume |
| Mutual TLS | Client certificate and key, optional private CA bundle, optional bearer token |
| On-behalf-of token exchange | Agents that must act as the end user: the caller's [user token](#end-user-identity) is exchanged for a token for the agent, through Microsoft Entra on-behalf-of or a standard OAuth 2.0 token exchange (RFC 8693) service. Exchanged tokens are cached until shortly before they expire. |
| Forward user token | Sends the caller's verified user token to the agent as is. Discouraged; prefer token exchange. |

Agent calls go over HTTPS to public addresses only and never follow redirects.

### Agent settings

| Setting | What it does |
|---|---|
| Skill-routed | The agent acts only on the skill named in the request. Required for per-skill grants. Wrapped agents are always skill-routed. |
| Disabled skills | Skills hidden from every caller and refused. |
| Public card / public skills | Lets anyone fetch a minimal card for this agent without a key, showing only the skills you mark public. |
| Require signed card | Only card versions with a valid signature from a trusted key can be approved. |
| On drift | What happens when the card changes: alert, block the agent, or auto-approve low-severity changes. |
| Max hop depth / allow re-entry | Chain limits for calls into this agent (see [Chain limits](#chain-limits)). |
| Limits | Requests per minute and concurrent calls across all callers. |

### Test an agent

Before you share an agent, run a test as a chosen caller. **Simulate** (the default) runs authentication, grants, limits and request DLP and returns the decision without contacting the agent. **Execute** sends a real message, so it can have side effects; it needs a separate permission and is logged as an admin test.

## Callers, keys and grants

A **caller** is anything that calls agents through the gateway: one of your agents, an app, or a partner.

- **Keys.** Each caller has one or more keys in the form `sk-quilr-a2a-...`. A key is shown **once**, when you create it; copy it then. Keys can expire, be disabled or be revoked. Deleting a caller revokes all its keys.
- **Source IPs.** Optionally restrict a caller to a list of IP ranges.
- **Bound agent.** If the caller is itself a registered agent, bind it to that agent. Its outgoing calls then count as hops in the same delegation chain.
- **Grants.** A grant names an agent, the methods the caller may use on it, and the skills it may use. Grants are the only way to allow access: an agent with no grant for this caller does not exist as far as the caller can tell.

### End-user identity

A caller can also pass the identity of the person it acts for, as a signed JWT in the `X-Quilr-User-Token` header. Per caller, set the user token to **off** (ignored), **optional** (checked when sent) or **required**, and list the identity providers it trusts: issuer, public keys (a JWKS URL or the keys themselves), accepted audiences, and the email and groups claims.

The gateway checks the signature, issuer, audience and expiry. A missing (when required) or invalid token returns `-31401` with the reason in `error.data.user_token_error`. Tasks created with a user token belong to that user as well as the caller, and the user's email appears in the logs. The token itself is never logged and reaches the agent only through the two user-token outbound modes above.

Per-skill grants (a list of skills instead of "all current and future skills") are available only on skill-routed agents. On those agents, a request names its skill in `message.metadata.skill_id`. If the caller can use exactly one skill on the agent, it can leave the skill out: the gateway fills it in and the log marks it as inferred. Otherwise a request with no skill, or with a skill outside the grant, is refused with `-31403`, and follow-up messages on a task must keep the task's skill. `error.data.reason` says why: `skill_required`, `skill_not_granted`, `skill_unknown` (not on the approved card) or `skill_disabled`.

```json
{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "Refund order 4411"}],
    "metadata": {"skill_id": "refunds"}
  }
}
```

## Endpoints a caller uses

Send the key as `Authorization: Bearer sk-quilr-a2a-...` or in the `X-Quilr-A2A-Key` header. `{org}` is your organization's A2A handle and `{agent}` is the agent's slug; both appear in the agent card URLs, so callers normally copy them from there.

| Endpoint | Method | What it does |
|---|---|---|
| `/a2a/{org}/{agent}` | POST | JSON-RPC, A2A 1.0 or 0.3 |
| `/a2a/{org}/{agent}/message:send`, `/tasks/{id}`, ... | GET, POST, DELETE | HTTP+JSON, A2A 1.0 |
| `/a2a/{org}/{agent}/.well-known/agent-card.json` | GET | The agent card (A2A 1.0) |
| `/a2a/{org}/{agent}/.well-known/agent.json` | GET | The agent card in A2A 0.3 shape |
| `/a2a/{org}/catalog` | GET | Every agent this caller can reach; filter with `?q=` (name, description, skill names) or `?skill_tag=` |
| `/a2a/{org}/.well-known/jwks.json` | GET | Your organization's public keys for verifying agent card signatures |

The card a caller fetches is the gateway's own version of the agent card: its interfaces point at the gateway, its security scheme is the Quilr key, and it lists only the skills that caller is granted. Without a key, a card or the catalog is returned only when an admin made it public; otherwise the answer is `401`.

Every response carries an `X-Quilr-Request-Id` header. Quote it when you contact support.

### Supported versions and methods

| | A2A 1.0 | A2A 0.3 |
|---|---|---|
| JSON-RPC | Yes | Yes |
| HTTP+JSON | Yes | No (use JSON-RPC) |

The version comes from the `A2A-Version` header. With no header, a JSON-RPC request is treated as 0.3, unless it uses a 1.0 method name.

| A2A 1.0 method | A2A 0.3 method | Notes |
|---|---|---|
| `SendMessage` | `message/send` | |
| `SendStreamingMessage` | `message/stream` | Only if the agent's card supports streaming |
| `GetTask` | `tasks/get` | |
| `ListTasks` | none | Answered by the gateway: only your own tasks on that agent, up to 100 per page |
| `CancelTask` | `tasks/cancel` | |
| `SubscribeToTask` | `tasks/resubscribe` | |
| Push notification config methods | `tasks/pushNotificationConfig/*` | See [Push notifications](#push-notifications) |
| `GetExtendedAgentCard` | `agent/getAuthenticatedExtendedCard` | Served from the approved card version |

### Tasks belong to their caller

The gateway issues its own task and context IDs. The agent's own IDs never reach callers, and callers' IDs never reach agents. A task can be read, cancelled or subscribed to only by the caller that created it; anyone else gets the standard `TaskNotFoundError` (`-32001`), exactly as if the task did not exist.

## Streaming

`SendStreamingMessage` and `SubscribeToTask` return Server-Sent Events in the caller's version. Every status message and artifact chunk is scanned before it is forwarded.

To catch sensitive data split across chunks, the gateway holds back the last 256 characters of streamed artifact text until more text arrives or the artifact or task ends. Text before that tail is scanned and forwarded at least once a second, so small chunks keep flowing while the agent works. If a chunk is blocked, the stream ends with an error event (`-31451`), the task is marked as blocked, and the gateway asks the agent to cancel it.

The gateway sends keepalive comments every 15 seconds on quiet streams.

## Push notifications

When an admin turns on push for your organization and the agent supports it, callers can register a webhook for a task as usual (`url`, `token`, `authentication`). The webhook must be HTTPS on a public address.

1. The gateway stores your webhook and gives the agent a relay URL and its own credentials instead. The agent never sees your webhook URL or token.
2. When the agent posts an update, the gateway checks the credentials and task ownership, rewrites the IDs, converts the payload to your version, and scans it.
3. The update is stored before the gateway acknowledges the agent, then delivered to your webhook with your token. Failed deliveries are retried with exponential backoff (up to 5 minutes apart), 6 attempts in total. Updates for one task are delivered in order.

Reading your push configs returns the values you sent. A task can have up to 10 push configs.

## Chain limits

When an agent calls another agent, which calls another, the gateway tracks the whole chain.

- On every call it forwards, the gateway adds a signed `X-Quilr-A2A-Chain` header (valid for 10 minutes) and a W3C `baggage` entry. If your agent calls the gateway again while handling that request, pass the header on (OpenTelemetry-instrumented agents propagate `baggage` automatically). The gateway accepts it only from the caller bound to the agent it was issued for.
- **Depth.** A chain deeper than the agent's max hop depth (default 5) is refused with `-31508`.
- **Loops.** A chain that would call an agent already in it is refused with `-31508`, unless that agent allows re-entry.
- **Require chain token.** A caller bound to an agent can be required to present a chain token on every call; without it, calls are refused with `-31508`.

Every log entry records the chain, its depth and the parent request, so you can see which agent acted for whom.

## DLP

The gateway scans requests, responses, streams and push callbacks with your organization's detection categories.

| Part | What is scanned |
|---|---|
| Text parts | The text |
| Data parts | Every string value |
| File parts with bytes | Text extracted from the file (up to 20 MiB per file, 50 MiB and 20 files per message) |
| File parts with a URL | The URL as text; the file is not fetched |
| Responses | Messages, task artifacts, status messages and task history |

Each finding is allowed, flagged, redacted or blocked. A blocked request or response returns `-31451`. Redaction rewrites text and string values in place; file contents are never rewritten, so a redaction inside a file leaves the part unchanged and is recorded. When a response is blocked, the task is marked as blocked and the gateway asks the agent to cancel it.

**DLP fails open**, like the LLM Gateway. If a scan times out, a detector fails or a part cannot be scanned (too large, unsupported file type), the call continues and the log records the status and reason for each part. Findings from the detectors that did run are still enforced.

## Signed cards

- **Upstream signatures.** When an agent card is signed, the gateway verifies each signature and records the result: valid, invalid, unsigned or unverifiable. Keys come from the card's own host or from keys an admin trusts for that agent.
- **Gateway signatures.** The cards the gateway serves are rewritten (gateway URLs, Quilr security scheme, filtered skills), so the original signature no longer applies. The gateway signs them with your organization's key (ES256) and publishes the public key at `/a2a/{org}/.well-known/jwks.json`. When keys are rotated, the previous key stays published for 30 days.
- **Provenance.** Each served card carries an extension that states the original card's signature status.

## Card drift and approval

The gateway only ever serves and enforces the card version an admin approved. It never fetches a card while handling a call.

Every 15 minutes the gateway re-reads each card-URL agent's card (and its extended card). When something changed, it saves a **pending** version with a diff: skills added, removed or changed, interfaces, security, signature and extensions. Changes to security, interfaces or the signature, an extended card change, or a new skill are **high** severity; the rest are low.

| On drift | Effect |
|---|---|
| Alert (default) | Keep serving the approved version; the agent shows pending changes. |
| Block agent | Refuse calls with `-31409` until an admin approves or rejects the new version. |
| Auto-approve low | Approve low-severity changes automatically; high-severity changes wait for an admin. |

Admins can also refresh a card on demand, approve or reject each pending version, and see the full history.

## Limits

| Limit | Applies to | When exceeded |
|---|---|---|
| Requests per minute | Each caller and each agent | `-31429` with `Retry-After` |
| Concurrent calls | Each caller and each agent | `-31429` with `Retry-After` |
| Open (unfinished) tasks | Each caller | `-31429` with `Retry-After` |
| Request size | Each request | 32 MiB |
| Push callback size | Each callback | 8 MiB |

Limits are unset (unlimited) until an admin sets them. A refused request does not count against the per-minute limit.

## Error codes

Standard JSON-RPC errors (`-32700` to `-32603`) and A2A errors (`-32001` to `-32009`) from the agent are passed through. Errors from the gateway itself use the `-31xxx` range and carry `error.data.quilr_error_code` and `error.data.request_id`. HTTP+JSON callers get the HTTP status below and a standard error body with reason set to the upper-case code and domain `quilr.ai`.

| JSON-RPC | HTTP | Code | Meaning |
|---|---|---|---|
| `-31401` | 401 | `a2a_unauthenticated` | Missing, invalid, expired or disabled key, or a missing or invalid user token |
| `-31403` | 403 | `a2a_forbidden` | The grant does not allow this method or skill, or the source IP is not allowed |
| `-31404` | 404 | `a2a_agent_not_found` | Unknown agent, a disabled agent, or an agent this caller has no grant for |
| `-31409` | 409 | `a2a_card_unapproved` | The agent has no approved card, or it is blocked until a card change is approved |
| `-31429` | 429 | `a2a_rate_limited` | A rate, concurrency or open-task limit was reached; see `Retry-After` |
| `-31451` | 403 | `a2a_blocked_by_dlp` | DLP blocked the request, response, stream or push update |
| `-31502` | 502 | `a2a_upstream_error` | The agent could not be reached or sent an invalid response |
| `-31503` | 503 | `a2a_unavailable` | The gateway is turned off on this deployment, or task state or the user token keys are temporarily unavailable; retry later |
| `-31504` | 504 | `a2a_upstream_timeout` | The agent did not answer in time |
| `-31508` | 403 | `a2a_chain_limit` | Chain too deep, a loop, or a required chain token is missing |

Other errors you may see from the gateway: `-32004` when the agent's card does not support a method (for example streaming), `-32003` when push notifications are not enabled, and `-32009` for an unsupported A2A version or binding.
