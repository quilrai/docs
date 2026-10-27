---
sidebar_position: 1
sidebar_label: "Routing and failover"
sidebar_custom_props:
  icon: Route
description: "How the LLM Gateway picks a provider and model for each request: Policy Engine routes, content routes, conversation pinning for prompt caching, retries, failover and app routing groups."
aliases: [routing, model routing, smart routing, complexity routing, content routes, route by topic, description routing, prompt cache, keep cache warm, conversation pinning, failover, fallbacks, retries, routing groups]
---

# Routing and failover

For every request the gateway decides three things, in this order:

1. **Which route applies**: a Policy Engine route, an app routing group, or just the requested model.
2. **Which model and provider in that route**: kept the same for the whole conversation so the provider's prompt cache keeps hitting.
3. **What to do when that provider fails**: retry it, or move the request to a backup.

With the Policy Engine on for the LLM Gateway, the **Model routing** card owns all three. Without it, the app's **Routing** tab does; see [Routing without the Policy Engine](#routing-without-the-policy-engine).

<StepFlow steps={[
  { label: "Check access", items: ["Allowed Models", "Requested model"] },
  { label: "Pick the route", items: ["Content routes", "Route to", "Routing groups"] },
  { label: "Pick the model", items: ["Conversation pin", "Weights"] },
  { label: "Reach it", items: ["Native or converted"] },
  { label: "Send", items: ["Retry", "Failover"] },
  { label: "Pin", items: ["After a successful response"] },
]} />

## Where it lives

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Govern', 'Policy Engine', 'LLM Gateway', 'Routing & cost']}
  action="Model routing"
/>

![Model routing tile in the Routing & cost lane, showing Content routes, Route to, Routing groups and Complexity levels](/img/llm-gateway/ui/policy-model-routing-tile.png)

| Tab | What it shows |
|---|---|
| **Overview** | Per section, what applies to **Everyone** and each scoped configuration with its priority (for example `P783`). |
| **Controls** | **Quick add**, then **Conversations**, **Content routes**, **Route to**, **Routing groups**, **Complexity levels**, **Failover**, and **Routing activity** at the bottom. |
| **Activity** | Requests where the card applied in the last 7 days: how many were routed by a policy, which rules matched and which settings decided. |

Every form adds to one shared draft. Live traffic changes only after **Review & publish**.

### From scripts and pipelines {#management-api}

Everything on this card can also be managed with the [Management API](../api-reference/management-api), as typed resources: routes, weighted and ordered destinations, failover profiles, rules and default, routing constraints and model access. **Admins never need to write QuilrQL for these**: each API write is validated, turned into policy rules and published as one revision, with dry runs, ETags, revision history and restore.

| Task | API |
| --- | --- |
| Model aliases, weighted splits, gradual migrations, failover | [Routing and failover API](../api-reference/routing-and-failover-api) |
| Request and token limits, request guards, temporary raises | [Rate limits API](../api-reference/rate-limits-api) |
| Take a provider out of routing during an outage, reset cooldowns, drop pins | [Incidents API](../api-reference/incidents-api) |

Rules written in the console appear in API lists as read-only rows; API-managed routes and console rules are ordered as described in [Rank and precedence](../api-reference/routing-and-failover-api#rank-and-precedence).

While the Policy Engine is on, the app's **Routing** tab is frozen: app routing groups and custom routing are ignored. Converted app groups become policy groups scoped by **Requested model**; see [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings). Provider credentials, endpoints and the enabled switch stay live and are looked up by provider label.

## How a request is routed {#how-a-request-is-routed}

### Step 1: which route applies

<DecisionLadder
  label="Which route applies"
  steps={[
    { id: 'allowed', question: 'Does Allowed Models reject the requested model?', yes: { label: '403 model_access_denied', tone: 'danger' } },
    { id: 'chain', question: 'Does the request continue state held by one provider?', hint: 'previous_response_id, cachedContent', yes: { label: 'The credential that holds it', detail: 'Never moved', tone: 'neutral' } },
    { id: 'kept', question: 'Has this conversation already been given a destination?', hint: 'Keep destination routes, matched data routes', yes: { label: 'Same destination', detail: 'Unless a higher route takes over', tone: 'success' } },
    { id: 'content', question: 'Does a content route match?', hint: 'Highest in the list first', yes: { label: "Route's destination", tone: 'info' } },
    { id: 'route', question: 'Does a Route to or Routing group match?', hint: 'Higher priority wins; a tie goes to Route to', yes: { label: 'Targets or weighted split', tone: 'accent' } },
  ]}
  fallback={{ label: 'Requested model', detail: 'One provider serves it, or one is picked and kept', tone: 'neutral' }}
/>

- **Rejected models** on the [Allowed Models card](../protect/gateway-access-and-allowed-models) win over every route, including models reached only through routing.
- **Priority** decides between configurations. Content routes take their priority from their place in the list. Two overlapping routing rules cannot share a priority.
- **Data routes** win over the route that would otherwise apply when their priority is equal or higher. They are checked on every message.
- A destination that cannot serve the request's API (natively or by [conversion](../api-reference/any-to-any-formats)) is skipped. If no destination of the route can serve it, the request uses normal routing.

### Step 2: which model in the route

| Route type | How the model is picked |
|---|---|
| **Route to** | The first target, in order, whose credential is enabled and that can serve the request's API. Later targets are used only when an earlier one fails (see [Failover](#failover)). |
| **Routing group** | If the conversation is pinned to a member that is still valid, that member. Otherwise the member whose share of conversations (or tokens, in token mode) is furthest below its weight. This is deterministic, not random, so traffic converges on the configured split. |
| **No route** | The only enabled provider that serves the model, or one picked at random among several and then pinned. |

Members from the request's own API family are preferred. Members that can only be reached by conversion are used when no own-family member is available. Skipped members are left out and the remaining weights are rescaled.

## Conversations and caching {#conversations-and-caching}

Providers cache the start of a prompt (system prompt, tools, earlier turns). The cache belongs to one provider credential and model, and every move to another model starts a cold cache: full input price and slower first tokens. So routing decisions are made per conversation, not per request.

A gateway that routes each request on its own spreads one conversation across providers and pays for a cold cache every time it moves:

<StepFlow steps={[
  { label: "Turn 1", items: ["Provider A", "Cache written"] },
  { label: "Turn 2", items: ["Provider B", "✗ Cold cache"] },
  { label: "Turn 3", items: ["Provider A", "✗ Cold again"] },
  { label: "Turn 4", items: ["Provider C", "✗ Cold again"] },
]} />

The LLM Gateway keeps the conversation where its cache is:

<StepFlow steps={[
  { label: "Turn 1", items: ["Route decided", "Provider A", "Cache written"] },
  { label: "Turn 2", items: ["Pinned", "Provider A", "✓ Cache hit"] },
  { label: "Turn 3", items: ["Pinned", "Provider A", "✓ Cache hit"] },
  { label: "Turn 4", items: ["Pinned", "Provider A", "✓ Cache hit"] },
]} />

### Cache-aware by design

| Where a move could cost the cache | What the gateway does |
|---|---|
| Choosing a route | Decided on the first message and kept (**Keep destination** is the default). |
| Weighted splits | Weights split **new conversations**, not requests; each conversation stays on its member. |
| Several providers for one model | One is picked once and pinned. |
| Writing the pin | Only after a successful response, so an error never pins a conversation somewhere new. |
| Complexity routing | **Upgrade when needed** only moves up, so a conversation rebuilds its cache at most once per level. |
| Failover | The conversation stays on the backup that answered, instead of moving back and paying for a second cold cache. |
| Provider-held state | Requests that continue a stored response or cached content are never moved to another credential. |
| Keeping caches alive | [Keep prompt cache warm](#keep-prompt-cache-warm) extends or refreshes caches without moving the conversation. |
| The request body | Native requests are forwarded byte for byte, and cache markers are carried across [format conversion](../api-reference/any-to-any-formats), so the cached prefix still matches. |
| Helper models | Each requested model is pinned on its own, so a coding tool's small model does not drag the main conversation along. |

### How the gateway identifies a conversation

The first of these present on the request becomes the conversation key:

| Order | Source |
|---|---|
| 1 | Body `previous_response_id` (Responses) |
| 2 | Header `x-conversation-id`, `conversation-id` or `conversation_id`; body `metadata.conversation_id`; Responses `conversation` |
| 3 | The client's session id: the Claude Code session in `metadata.user_id`, `metadata.session_id`, `client_metadata.session_id`, then thread or run ids in `metadata` |
| 4 | Body `prompt_cache_key` |
| 5 | A hash of the user identity, tool definitions, system prompt and first user message |

The key is also scoped to the Quilr key and the **requested** model, so a coding tool's small helper model is routed separately from its main model. Send a conversation ID header when you can: with option 5, two conversations from the same user that start identically share one key. The Identity & Network Trust card can [require one](../protect/identity-and-network-trust).

### Conversation pinning

When a routing group or a multi-provider model picks a member, that choice is pinned for the conversation **after the response succeeds** (a stream has to finish). Failed requests never create a pin. A pin lasts until the conversation has been idle for 1 hour.

A pinned conversation is routed again when:

- the configuration that chose it is edited (any change, including weights or priority), removed or expires,
- the routing group or API changes,
- the pinned provider is disabled, loses its credential, or can no longer serve the request's API,
- 3 requests in a row fail on it with a 5xx, 401, 403, 404, 408, 424 or 429 (requests blocked by QuilrAI guardrails do not count),
- a data route matches,
- or [failover](#failover) moves it, in which case the conversation is pinned to the backup and does not move back.

**Route to** needs no pin: its first available target is the same on every request.

### Conversation behaviour

Each content route has a **Conversation behaviour** (called **Switching** in the complexity form). It decides whether a route is re-checked on later messages:

| Option | What happens | Cache effect |
|---|---|---|
| **Keep destination** (default for most routes) | The first message decides; later messages stay there. A higher route that re-checks every message can still take over. If a check could not finish on the first message, nothing is kept and the next message decides. | One model for the conversation. |
| **Upgrade when needed** (default for complexity routes) | Later messages can move the conversation up a level, never down. | One cache rebuild per upgrade. |
| **Re-check every message** | Each message routes on its own. With AI judging, that is one AI check per message. | Can lose the cache on any message. |

<StepFlow steps={[
  { label: "Message 1: hi", items: ["Low", "Haiku", "Cache built"] },
  { label: "Message 2: design a ledger", items: ["Upgrade to High", "Opus", "Cache rebuilt once"] },
  { label: "Message 3: thanks", items: ["Stays High", "Opus", "Cache hit ✓"] },
]} />

Data routes always re-check every message and, once matched, keep their destination for the rest of the conversation until a higher-priority data route matches or the rule changes.

A stored destination is dropped and routing runs again when its rule is edited, removed or expires, or when the destination can no longer be used.

### Keep prompt cache warm

Provider caches expire after a few minutes without traffic. **Conversations > Set up** opens **Keep prompt cache warm** for chosen apps. Both options are off until you turn them on.

![Keep prompt cache warm with both options on, Stop refreshes after idle 30 minutes and Minimum prompt 4000 tokens](/img/llm-gateway/ui/policy-keep-prompt-cache-warm.png)

| Setting | What it does |
|---|---|
| **Longer cache on Anthropic and Bedrock Claude** | Sets a 1 hour TTL on cache breakpoints for Anthropic, Azure AI Foundry Anthropic and Claude 4.5+ on Bedrock. No extra requests; cache writes cost about 2x base input instead of 1.25x. |
| **Refresh requests on OpenAI, Azure, Gemini and Vertex** | About 60 seconds before the provider cache would lapse, the gateway resends the last prompt for 1 output token (16 on Responses). Applies to OpenAI, Azure OpenAI, OpenAI-compatible, DeepSeek, Gemini, Vertex and Responses. Each refresh is billed to the app, counted toward its quotas and spend, and logged as a cache-warm request. Refreshes stop on a quota refusal or after 2 upstream errors in a row. |
| **Stop refreshes after idle (minutes)** | 1 to 60, default 30. |
| **Minimum prompt (tokens)** | Smaller prompts are not kept warm. Default 4,000. |

Never kept warm: requests with server-side or hosted tools (including web search), Responses `conversation` or background state, requests [translated](../api-reference/any-to-any-formats) to another API, private inference, blocked requests and response-cache hits, and prompts below the minimum. A refresh never moves or extends a conversation pin.

```text
routing.keep_cache_warm = { stop_after_idle_minutes: 30, min_prompt_tokens: 4000, extend_cache_lifetime: true, refresh_requests: true };
```

:::note
The **Response cache** on the [Token Savings](./token-saving) card is different: it answers an exact repeat of a non-streaming request from an earlier response, without calling the model or running guardrails. Keep prompt cache warm only keeps the provider's prompt cache alive.
:::

## Routing types

| Type | Decides by | Uses AI | Default conversation behaviour |
|---|---|---|---|
| [Route to](#route-to) | Scope only (app, group, requested model, ...) | No | Keep destination |
| [Routing groups](#routing-groups) | Weights across models | No | Pinned per conversation |
| [Request is about](#request-is-about-description-routing) | A sentence describing the requests | Yes | Keep destination |
| [Prompt complexity](#complexity-routing) | Low, Medium or High level | Yes, or length only | Upgrade when needed |
| [Data detected](#data-detected) | Data types in the latest message | Data scan | Checked on every message, then kept |
| [Text contains](#text-contains) | Words or phrases | No | Keep destination |
| [Client](#client) | The coding tool named in request headers | No | Keep destination |

All of them apply on the Chat Completions, Anthropic Messages, Responses, Vertex AI and Bedrock Runtime surfaces. OpenAI Realtime supports routing groups only. Embeddings are not routed.

**Quick add** on the Controls tab opens a filled-in form for the common cases: **Send an app to a model** (Route to), **Split traffic across models** (Routing groups), **Route by what the request is about**, **Route sensitive data to a model**, and under **More...** the complexity setups.

![Quick add with Send an app to a model, Split traffic across models, Route by what the request is about and Route sensitive data to a model](/img/llm-gateway/ui/policy-model-routing-quick-add.png)

### Route to {#route-to}

An ordered list of provider label and model pairs. The first target that is enabled, has a credential and can serve the request's API takes the request, whatever model the client asked for. The rest are its failover order.

1. **Quick add > Send an app to a model**, then pick the apps or groups.
2. Under **Send to**, keep **Ordered targets**. Pick a **Provider label** and a **Model** for target 1.
3. **Add target** for each backup and drag to reorder.
4. **Add to draft**, then **Review & publish**.

```text
policy support_copilot_route priority 650 {
  request where application.group_key == "support-copilot"
  then { routing.targets = [
    { model: "gpt-4.1", provider_label: "openai_primary" },
    { model: "gpt-4.1", provider_label: "azureopenai_primary" }
  ]; }
}
```

### Routing groups {#routing-groups}

A weighted split across models. Weights total 100.

1. **Quick add > Split traffic across models**, then pick who it is for.
2. Under **Split**, give it a **Name**, choose the **Kind** (Chat completion, Anthropic messages, Responses, Vertex AI, Bedrock or Realtime) and the **Mode**:
   - **New conversations**: weights split new conversations.
   - **Split by tokens**: weights split total tokens.
3. **Add model** for each model and set its weight. **Balance evenly** splits them equally.

![New Model routing configuration with the Applies to chips and an empty weighted split](/img/llm-gateway/ui/policy-routing-form-applies-to-split.png)

Because a conversation stays on the model it started with, request and spend shares can differ from the weights. The group is saved as `policy-<name>` and never affects an app routing group with the same name.

### Content routes

Content routes pick the destination from what the conversation contains. They share one form, **Add a content route**: who it applies to, **Match when**, and **Send to** (**Ordered targets** or **Routing group**). A content route can only set a destination, its conversation behaviour, observe only and its own failover.

#### Request is about (description routing) {#request-is-about-description-routing}

Describe the requests in a sentence or two (up to 300 characters). An AI classifier judges whether the latest user message matches.

![Add a content route with Request is about selected, a programming-help description and claude-sonnet-4-6 as the target](/img/llm-gateway/ui/policy-content-route-request-is-about.png)

- Long messages are classified on a bounded portion of the text; check long prompts with the [Test](#test-before-you-publish) row.
- Up to 32 descriptions are checked per request, highest priority first.
- With **Keep destination**, the classifier runs on the first message of a conversation; a result is reused while the latest user text is unchanged.
- If the classifier is unavailable or times out, the route is skipped and the request falls through to the next route. The skip is shown in **Routing activity**.

```text
policy route_coding priority 720 {
  request where application.method_type == "chat"
    and about(content.last_user_text, "Programming help: source code, SQL queries, shell scripts, bugs or stack traces.")
  then { routing.targets = [{ model: "claude-sonnet-4-6", provider_label: "anthropic_primary" }]; }
}
```

#### Complexity routing {#complexity-routing}

Send simple prompts to a small model and hard ones to a large one. Start from a complexity quick add card or **Set up complexity routing** under **Complexity levels**.

![Complexity routing form with When the app asks for, How to judge, and the Low level description, token bound and destination](/img/llm-gateway/ui/policy-complexity-routing-form.png)

1. **Application**: pick the app, or leave empty for every app.
2. **When the app asks for** (optional): limit to requested model names, for example `auto`.
3. **How to judge**:
   - **AI reads the message (falls back to length)**: the classifier compares the latest user message with your level descriptions. If it is unavailable or unsure, the length bounds decide.
   - **Message length only**: words or tokens in the latest user message decide. No AI call, no added latency or cost.
4. **Levels**: for **Low** (and **Medium** with **Use a Medium level**) write what the level means and its upper bound in **Words** or **Tokens**. A message at or under the Low bound is Low, at or under the Medium bound is Medium, anything else is High.
5. For each level choose **Normal routing**, **One model or first available**, or **Split by %**.
6. **Switching**: see [Conversation behaviour](#conversation-behaviour).

| Level | Default description | Default bound |
|---|---|---|
| Low | Short factual questions, greetings, or one-step rewrites of a few sentences. | 300 tokens |
| Medium | Everyday drafting, summarising or analysing a short document or snippet. | 4,000 tokens |
| High | Multi-step reasoning, planning, large codebases or long documents. | Anything above Medium |

Without **Complexity levels**, Prompt complexity counts words over all user text in the request: 6 or fewer is Low, 7 to 10 is Medium, more is High.

```text
policy cx priority 760 {
  request where application.group_key == "support-copilot"
  then { routing.complexity_levels = {
    low:    { description: "Greetings and short factual questions", max_tokens: 300 },
    medium: { description: "Everyday drafting and summaries", max_tokens: 4000 },
    high:   { description: "Multi-step reasoning, design or long analysis" }
  }; }
}
policy cx_low priority 759 {
  request where application.group_key == "support-copilot" and content.context_complexity == "low"
  then { routing.targets = [{ model: "claude-haiku-4-5-20251001", provider_label: "anthropic_primary" }];
         routing.route_decision = escalate; }
}
// cx_medium and cx_high follow the same shape
```

For length only: `{ method: length, low: { max_words: 15 }, medium: { max_words: 120 }, high: {} }`.

#### Data detected {#data-detected}

Move a conversation to a model you trust when chosen data types appear, for example an on-premises model for secrets. **Quick add > Route sensitive data to a model**, choose the data types, then the destination.

- Data routes are evaluated on every request and go first in the list by default.
- Once matched, the conversation keeps this destination.
- Best effort: if the scan cannot run, normal routing is used. Use [Security guardrails](../protect/security-guardrails) to redact or block.
- Types used only for routing do not create findings, redact or block. Matches appear only in **Routing activity**.

#### Text contains {#text-contains}

Route when the latest user message contains any of a list of words or phrases. Comma separated, not case-sensitive. `*` matches any text in between (`refund*order`), `?` one character.

#### Client {#client}

Route by the coding tool named in the request headers, for example Claude Code, Codex, Cursor, Cline or GitHub Copilot. The client reports this itself; it is not an identity check.

#### Observe only

Every content route has an **Observe only** switch. The route is checked on every message and **Routing activity** records where matching conversations would go, while requests keep their normal destination. AI and data checks still run, so they still add latency. Observe only cannot be combined with a conversation behaviour or a failover setting.

#### Order

Under **Order**, place a route **1st**, **after** another route, or **Last**. Higher in the list wins. New routes go last; data routes go first. **Earlier** and **Later** on the card move a route.

### When a routing check fails

Content and data routes are best-effort routing, not enforcement. A check that cannot complete never blocks the request: it is routed as if that route did not match. Use [Security guardrails](../protect/security-guardrails) when data must be blocked or redacted.

## Failover {#failover}

When the chosen provider fails, the gateway retries it or moves the request to a backup. Configure it under **Controls > Failover** for everyone or a scope, or per route with **Set failover for this route**. A route's own failover setting wins; otherwise the highest-priority failover setting that matches applies; with none, the defaults below apply.

### Settings

| Setting | Default | Values |
|---|---|---|
| **Move failed requests to another model** | On | Off: failed requests are only retried on the same model, for the errors in **Fail over on**. |
| **Where it can go** | **+ same model on other connections** | **Route models only**, **+ same model on other connections**, **+ other app models** |
| **Backup models** | None | Up to 8 provider label and model pairs, tried after the route's own models. |
| **Fail over on** | Timeouts, Connection errors, Rate limits (429), Provider errors (5xx) | Opt in: Rejected credentials (401/403), Model not found (404), Prompt too long for the model, Provider content filter |
| **Max tries** | 3 | 1 to 3. Counts every send to a provider, retries included. |
| **Same-model retries** | 2 | 0 to 2. Only for errors in **Fail over on**. |
| **Time budget (s)** | 60 | 1 to 600. Only stops new tries from starting; a try in flight is never cut. Starts when the gateway first sends upstream, after its own guardrail checks. |
| **Cut off slow tries** / **Per-try timeout (s)** | Off | 1 to 300. |
| **Advanced > App model ranking** | None | Order for **+ other app models**. |
| **Advanced > Model capabilities** | None | Context window, max output, tools, images, JSON schema and streaming per model. |

```text
routing.failover = { enabled: true, scope: same_model, fallbacks: [{ model: "gpt-4.1", provider_label: "azureopenai_primary" }],
                     on: [timeout, connection, rate_limit, server_error], max_attempts: 3, same_target_retries: 2,
                     total_timeout_ms: 60000, attempt_timeout_ms: 0 };
```

A partial value is filled from the defaults, not merged with other failover settings.

### Where a failed request goes

Backups are tried in tiers. A tier is used only when the tiers before it have no usable candidate left.

<StepFlow steps={[
  { label: "1. Rest of the route", items: ["Route to: next target in order", "Group: other members, drawn by weight"] },
  { label: "2. Backup models", items: ["In the order listed"] },
  { label: "3. Same model, other connections", items: ["Default scope", "Other provider labels serving the model"] },
  { label: "4. Other app models", items: ["Only with + other app models", "Ranked, at most 8"] },
]} />

Every candidate must have an enabled credential, be allowed by Allowed Models, be inside a matched data route's destinations, and serve the request's API without dropping any of its features. A candidate that is the same provider account and model as one already tried is skipped. Before a backup is sent, its quotas and per-model limits are checked; a backup over its limit is skipped.

**Other app models** are ranked by **App model ranking**, then same API family, then same vendor, then closest price. Without **Model capabilities**, such a model is used only for requests with no tools, images or JSON schema, an estimated prompt under 8,000 tokens and requested output up to 4,096 tokens, and for streams only when the provider streams natively for the API.

Because **Max tries** is at most 3 and includes the first send, a request reaches at most 2 backups.

### Retry or move

<DecisionLadder
  label="After a failed try"
  steps={[
    { id: 'quilr', question: 'Was it a QuilrAI block or a gateway error?', hint: 'Guardrail, quota, access, conversion, configuration', yes: { label: 'Returned to the client', detail: 'Never retried', tone: 'danger' } },
    { id: 'budget', question: 'Are Max tries or the Time budget used up?', yes: { label: "Last provider's error", tone: 'danger' } },
    { id: 'move', question: 'Is the error in Fail over on, and is a backup left?', hint: 'A 429 with Retry-After of 2 s or less retries in place instead', yes: { label: 'Next backup', detail: 'Same-model retry count resets', tone: 'info' } },
    { id: 'retry', question: 'Is it a timeout, connection error, 429 or 5xx in Fail over on, with same-model retries left?', yes: { label: 'Retry the same model', detail: '0.5 s, then 1 s, or Retry-After up to 10 s', tone: 'warning' } },
  ]}
  fallback={{ label: "The provider's error, unchanged", tone: 'danger' }}
/>

- **Fail over on** controls both moving and same-model retries: an error left out of it is returned to the client on the first try.
- A retry is made only if its delay fits in the remaining time budget.
- When every try fails, the client gets the last provider's error with its own status, body and `Retry-After`, exactly as if failover did not exist.
- When nothing could be sent (every candidate marked down or over quota, or the time budget already used up), the client gets `503 all_targets_unavailable` with `x-quilr-error-source: gateway` and, when known, `Retry-After`.
- With **Provider content filter** on, a successful response that the provider refused or filtered is also sent to another provider.

### Requests that never move

These are only retried on the same provider:

- requests that continue provider-held state: `previous_response_id`, Responses `conversation` or `background`, Gemini `cachedContent`, stored prompts, containers and MCP servers held by the provider,
- requests with hosted or server-side tools, or that reference provider file ids,
- requests that name a provider with `provider`, `provider_label`, `X-Provider-Name` or `X-Provider-Label`,
- requests served by a private inference edge.

For stateful requests, a retry is made only when the provider certainly did not run the first try (the connection was never opened, or a 429). Embeddings fail over only to the same model on another connection. OpenAI Realtime and Assistants are not retried or failed over by the gateway.

### Streaming

For a stream, the gateway waits for the provider's first event before it starts responding to the client. An error, timeout or error event before that can still retry or fail over. Once the first event reaches the client, the stream is committed to that provider and a later error is passed through.

### Provider health and cooldown

The gateway tracks the health of every provider credential and model it calls:

| Failure | Effect |
|---|---|
| 429 | Cooling down for the provider's `Retry-After`, or 10 s, between 1 and 120 s. |
| Timeout, connection error, 5xx | After 3 failures within 60 s: cooling down for 30 s, doubling on each repeat up to 300 s (with jitter). |
| 401, 403, 404 | Cooling down for 300 s. |
| Prompt too long, content filter | Never. |

A cooldown only affects requests whose **Fail over on** includes the error that caused it, and each kind of error cools down on its own: a 401 cooldown does not hide a later run of 5xx errors from requests that only fail over on 5xx.

During an outage you can also mark a provider down for every app, with an expiry, and reset cooldowns once it recovers, with the [Incidents API](../api-reference/incidents-api).

A cooldown routes around a provider; it never refuses a request. A cooling target is skipped while a healthy backup exists. When its cooldown ends, one request at a time is sent to it as a probe; success clears it, failure starts a longer cooldown. If every candidate is cooling, including a route with a single target, the request is still sent, to the one that recovers first.

### Failover, pinning and quotas

- After a request moves from A to B and succeeds, the conversation is pinned to B and stays there until it goes idle. There is no automatic failback.
- A content-route decision stored for the conversation is not changed by a failover.
- Quotas count one logical request. Each provider that was actually sent to is charged for its own usage at its own price; the app-level request count is charged once.

### See what happened

| Header | When | Value |
|---|---|---|
| `x-quilr-attempts` | More than one send | Number of sends, retries included |
| `x-quilr-failover` | Served by a backup | The tier that served it: `route`, `fallback`, `same_model` or `app` |

The request log lists every try with its provider, model, tier, outcome, status, latency and spend. **Failover preview** in the Failover section shows where an app's failed requests would go.

## Test and verify

### Test before you publish

The content route and complexity forms have a **Test** row that runs against the whole draft. Pick the **App**, write a **Sample first message**, optionally **Add a follow-up message** (up to 5), **Test as user (email)** or **Test as client**, then **Run test**. The real classifier and data scan run; no model is called and no pin or conversation state is written.

![Switching options and the Test row with App, Sample first message, Test as user and Test as client](/img/llm-gateway/ui/policy-complexity-switching-and-test.png)

Per message the result shows the level, which route matched, where it would go, and each route's outcome: **Matched**, **No match**, **Not evaluated**, **Unavailable** or **Timed out**.

### Check live traffic

Every successful gateway response carries:

| Header | Value |
|---|---|
| `x-quilr-route` | `default` when no route applied (including when a route's destination could not serve the request), otherwise the route id: `r_` and 16 hex characters. The id never names the policy. |
| `x-quilr-served-model` | The model that served the request. Omitted on deployments that hide model identity. |

```bash
curl -sD - -o /dev/null https://guardrails-usa-2.quilr.ai/openai_compatible/v1/chat/completions \
  -H "Authorization: Bearer sk-quilr-xxx" -H "Content-Type: application/json" \
  -d '{"model": "gpt-4.1-nano", "messages": [{"role": "user", "content": "hi"}]}' | grep -i x-quilr
```

**Routing activity**, at the bottom of the Controls tab, shows per route and app over 24 h, 7 d or 30 d: conversations, requests, spend (including keep-warm refreshes), cache read, added time, failures, upgrades and fallbacks. Hover a route to see its route id.

![Routing activity table listing complexity routes with conversations, requests, spend, cache read and added time](/img/llm-gateway/ui/policy-routing-activity.png)

## Routing without the Policy Engine

Without the Policy Engine, routing is set per app:

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Routing"
/>

| Type | Splits traffic by | Clients use it by |
|------|-------------------|-------------------|
| **Routing groups** | Share of conversations | Sending the group name as `model` |
| **Token-based routing groups** | Share of total tokens | Sending the group name as `model` |
| **Custom routing** | Request size in words: Low, Medium or High tier, each an ordered list of models | Calling the API surface as usual |

Group names are unique across both group types and can shadow a real model name, so a group called `gpt-4.1` reroutes existing code with no deploy. Custom routing tiers route only when **Published**; on Bedrock Runtime it covers Converse only.

The provider is picked as below. The choice is pinned per conversation exactly as described in [Conversation pinning](#conversation-pinning), and [failover](#failover) runs with its default settings.

<DecisionLadder
  label="How the gateway picks a provider without the Policy Engine"
  steps={[
    { id: 'group', question: 'Is the model a routing group name?', yes: { label: 'A group member', detail: 'Furthest below its weight, then pinned', tone: 'accent' } },
    { id: 'selector', question: 'Does the request name a provider?', hint: 'provider, provider_label, X-Provider-Name or X-Provider-Label', yes: { label: 'That provider', detail: 'Never failed over', tone: 'info' } },
    { id: 'one', question: 'Does exactly one enabled provider serve the model?', yes: { label: 'That provider', tone: 'success' } },
    { id: 'several', question: 'Do several enabled providers serve it?', yes: { label: 'One of them, at random', detail: 'Then pinned', tone: 'warning' } },
  ]}
  fallback={{ label: 'Error: the model is not on the app', tone: 'danger' }}
/>

```python
from openai import OpenAI

client = OpenAI(base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/', api_key='sk-quilr-xxx')
response = client.chat.completions.create(model='Group1', messages=[{'role': 'user', 'content': 'Hello!'}])
```

### Which providers a group can mix {#which-providers-a-group-can-mix}

A group serves one API surface (its kind), but its members can come from any API family. With [any-to-any formats](../api-reference/any-to-any-formats), members that do not speak the group's format are reached by conversion.

- At least one member must be from the group's own family.
- While any own-family member is enabled and usable, only own-family members take traffic.
- Every member must be reachable from the group's surface; unsupported and [coming soon](../api-reference/any-to-any-formats#limits) pairs cannot be added.
- Realtime groups stay within OpenAI Realtime and Azure OpenAI Realtime.

| Group kind | Endpoint | Own family (serves natively) |
|------------|----------|------------------------------|
| **Chat Completions** | `/openai_compatible/v1/chat/completions` | OpenAI, Azure OpenAI, Bedrock, Anthropic (chat completions), DeepSeek, Gemini (chat completions), xAI, Mistral, Oracle, General LLM, Sarvam chat models; also the Chat adapters for Vertex AI Gemini and Anthropic Messages |
| **Anthropic Messages** | `/anthropic_messages/v1/messages` | Anthropic, Bedrock (Anthropic), Azure Anthropic |
| **Vertex AI** | `/vertex_ai/` | Vertex AI |
| **OpenAI Responses** | `/openai_responses/v1/responses` | OpenAI, Azure OpenAI and their Responses types, xAI (Responses), Oracle (Responses) |
| **OpenAI Realtime** | `/openai_realtime/v1/realtime` (wss) | OpenAI Realtime, Azure OpenAI Realtime |

### When a provider fails {#when-a-provider-fails}

Without the Policy Engine, [Failover](#failover) runs with its defaults: the group's other members first, then the same model on the app's other providers. A request blocked by a guardrail is never failed over. Disabled providers are left out before the call.

## Rules and limits

- The requested model must be allowed for the app. A name such as `auto` that exists only for routing is rejected with `model_access_denied` unless the app's allowed models include it.
- Under the Policy Engine, a client that sends an app routing group name the policy does not define gets `403 policy_routing_group_not_defined`, or `policy_routing_group_wrong_surface` when the group is for another API.
- Two overlapping routing rules cannot share a priority.
- **Upgrade when needed** is only for complexity routes. **Observe only** cannot be combined with a conversation behaviour or failover.
- **Request is about** cannot be negated.
- On deployments without GPU models, the AI classifier is never called; complexity routes use the length bounds.
- A spend budget needs a price for every model it can reach, including failover backups; see [Rate, token and budget limits](./rate-token-and-budget-limits).

## Related

- [Routing and failover API](../api-reference/routing-and-failover-api) - manage routes, destinations and failover from scripts, without QuilrQL
- [Incidents API](../api-reference/incidents-api) - outage mark-downs, cooldown resets and pin drops
- [Any-to-any formats](../api-reference/any-to-any-formats) - how a chosen provider is reached
- [Gateway access and allowed models](../protect/gateway-access-and-allowed-models)
- [Token saving](./token-saving) - response cache and prompt compression
- [Author, simulate and publish](../../console/govern/author-simulate-and-publish)
- [Policy Engine overview](../../console/govern/policy-engine)
