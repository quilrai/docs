---
sidebar_position: 3.7
sidebar_label: "Gateway functions"
sidebar_custom_props:
  badge: new
  icon: Code
description: "Run your own Python scripts or a remote MCP server's tools inside gateway requests: add context before the model call, give the model tools, review the answer, or act after the request."
aliases: [gateway functions, functions, function, python script, pre_call, post_call, on_complete, function tools, mcp server tools, tool loop, tool search, function memory, function data, call_llm]
console_path: []
---

# Gateway functions

Updated on 22 November 2026.

A gateway function is a small Python script, or a remote MCP server, that the gateway runs for the requests you choose. Use functions to add your own data to a request, give the model tools it can call, check or rewrite the answer, or send finished requests somewhere else. Your applications need no change.

Nothing runs unless you attach a function to requests. A request that no function is attached to is handled exactly as before.

## What you can do

A function runs at one of four stages of a request. You can attach the same function to more than one stage.

| Stage | Console name | When it runs | What a function can do |
| --- | --- | --- | --- |
| `pre_call` | **Before the model is called** | After Quilr's request checks, before the request is sent to the model. | Add context, rewrite the latest user message, set `temperature`, `top_p` or `max_tokens`, answer in place of the model, or block the request. |
| `tools` | **Tools the model can call** | While the model answers. | Serve a tool. The gateway runs each call and continues the answer, so the client gets one answer and never sees these tool calls. |
| `post_call` | **On the model's answer** | After the model answers, before the client gets the answer. | Pass the answer, rewrite its text, remove a tool call, block it, or ask the model to answer again. |
| `on_complete` | **After the request** | In the background, once the request is finished. | Record or export what happened. It cannot change the request or the answer. |

## Before you start

- **Turn on the Policy Engine** for the LLM Gateway. Functions are attached by policy rules.
- **Issue a management key** with the **Manage functions** scope (`functions:write`) and **Read**. See [Management API](../api-reference/management-api#enable-in-the-console). Functions are created and changed only through the Management API; the console shows them read-only and lets you attach them.

The examples below use these variables:

```bash
export MANAGEMENT_URL='https://guardrails-usa-1.quilr.ai'   # your region
export MANAGEMENT_KEY='qlmgmt_...'
```

## Create a function {#create-a-function}

A function has an id, a script and a few settings. This one adds the customer's plan to each conversation:

```python
# Add the customer's plan in front of the latest user turn.
email = (request.get("user") or {}).get("email")
plans = await data.get("support/plans", {})
plan = plans.get(email, "free")
await conv.add_context("Customer plan: " + plan + ". Follow the support policy for this plan.")
{"plan": plan}
```

1. Save the script to a file, for example `add_account_context.py`.
2. Create the function. `jq` puts the script into the JSON body:

```bash
jq -n --rawfile code add_account_context.py '{
  display_name: "Add account context",
  description: "Adds the customer plan in front of the latest user message.",
  code: $code,
  timeout_ms: 2000
}' | curl --request PUT \
  "$MANAGEMENT_URL/llmgateway/management/v1/functions/add_account_context" \
  --header "Authorization: Bearer $MANAGEMENT_KEY" \
  --header 'Content-Type: application/json' \
  --data-binary @-
```

3. Store the data it reads:

```bash
curl --request PUT \
  "$MANAGEMENT_URL/llmgateway/management/v1/function-data/support/plans" \
  --header "Authorization: Bearer $MANAGEMENT_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"value": {"ana@example.com": "enterprise"}}'
```

The function is saved as version 1 and reaches every gateway server within about two minutes. It does nothing yet: [attach it](#attach-a-function) first.

Every setting, including `on_failure`, `allowed_hosts`, `llm_targets` and `secrets`, is described in the [Functions API](../api-reference/functions-api#functions).

## Test a function {#test-a-function}

Test before you attach. Neither call stores anything or sends anything outside the gateway.

- **Check** a definition with `POST /functions/_validate`. It returns the errors a save would refuse and warnings. This checks syntax and shape only. Code that tries to read files, open network connections or read the environment gets a warning where the check recognizes it, and fails when it runs.
- **Run** a function with `POST /functions/_test`. Outside calls answer from the `mocks` you send, and the response shows the result, the calls the script made and what it asked to change.

```bash
curl --request POST \
  "$MANAGEMENT_URL/llmgateway/management/v1/functions/_test" \
  --header "Authorization: Bearer $MANAGEMENT_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "function_id": "add_account_context",
    "request": {"user": {"email": "ana@example.com"}},
    "mocks": {
      "data": {"support/plans": {"ana@example.com": "enterprise"}},
      "conv": {"messages": [{"role": "user", "text": "Where is my invoice?"}]}
    }
  }'
```

```json
{
  "ok": true,
  "ms": 1,
  "calls": [{"name": "data_get", "ok": true, "ms": 0}],
  "logs": "",
  "actions": [{"kind": "add_context", "where": "user", "text": "Customer plan: enterprise. Follow the support policy for this plan."}],
  "result": {"plan": "enterprise"}
}
```

To test a function that reviews an answer, send `mocks.response`. To test a background function, send `mocks.event`. See [Validate and test](../api-reference/functions-api#validate-and-test) for every mock.

## Attach a function {#attach-a-function}

Attach a saved function in the console or through the API. Both count: a request runs the functions of every rule that matches it.

### In the console

<ConsolePath
  console="QuilrAI console"
  path={['Govern', 'Policy Engine', 'LLM Gateway', 'Controls']}
  action="Functions"
/>

1. Open the **Functions** control and click **Attach functions**.
2. Under **Applies to**, keep **Everyone** or narrow the rule with **People**, **Smart groups** or **Applications**.
3. Under **Choose what should happen**, add functions to the stages you need: click **Add function** under **Before the model is called**, **On the model's answer** or **After the request**, or **Add tool** under **Tools the model can call**.
4. Set each function's options (see the table below).
5. Set the **Priority**. When several rules match a request, the rule with the higher number runs its functions first.
6. Click **Save to draft**, then **Review & publish**.

![Attach functions form with Applies to set to the Support Copilot application, one function under Before the model is called and two tools under Tools the model can call with Tool search and Tool limits](/img/llm-gateway/ui/functions/attach-functions-form.png)

| Stage | Options |
| --- | --- |
| **Before the model is called** | **How often it runs in a conversation**: **On every message** or **Once per conversation**. **Observe only**. **Arguments**. |
| **Tools the model can call** | **Found through tool search**, **Restore tokenized values in arguments**, **Arguments**, **Tool search** and **Tool limits** (**Follow-up model requests**, **Tool calls per request**, **When a tool call fails**). |
| **On the model's answer** | **Observe only**, **Hold streamed answers**, **Retries**, **Arguments**. |
| **After the request** | **Arguments**. |

**Observe only** runs the function and records what it would have done without applying it. The script itself still runs for real: anything it saves, and any outside call or model call it makes, happens.

The control's first screen shows **What happens today**, the **Configured order** of every stage and the **Rules**. Functions attached through the API carry a **Managed by API** tag and are changed there.

![Functions control with What happens today, the Configured order of each stage and the list of rules](/img/llm-gateway/ui/functions/functions-controls-panel.png)

### With the API

A function binding attaches functions to requests. This one runs `add_account_context` once per conversation for one app:

```bash
curl --request PUT \
  "$MANAGEMENT_URL/llmgateway/management/v1/controls/functions/support-context" \
  --header "Authorization: Bearer $MANAGEMENT_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "scope": {"apps": ["support-bot"]},
    "functions": [{"id": "add_account_context", "run": "per_conversation"}]
  }'
```

Each write publishes a policy revision. Add `?dry_run=true` to preview. See [Function bindings](../api-reference/functions-api#function-bindings) for every field.

## Before the model is called {#pre-call}

A `pre_call` function reads the conversation as `conv` and can change what the model receives.

| To | Call |
| --- | --- |
| Add context in front of the latest user message | `await conv.add_context(text)` |
| Add to the system prompt | `await conv.add_context(text, where="system")`. Needs **Once per conversation**. |
| Replace the latest user message | `await conv.set_last_user_text(text)` |
| Set a model setting | `await conv.set_param("temperature", 0.2)`. Also `top_p` and `max_tokens`. |
| Answer in place of the model | `await respond(text)`. The client gets a normal answer; no model is called. |
| Refuse the request | `await block(message)`. The client gets `403 function_blocked` with your message. |

This function refuses requests about topics you list in function data:

```python
# Refuse questions about a blocked topic before any model is called.
topics = await data.get("support/blocked_topics", [])
text = conv.last_user_text.lower()
for topic in topics:
    if topic in text:
        await block("This assistant cannot help with " + topic + ".")
{"checked": len(topics)}
```

- **Edits stay in place.** What a function added to a turn is stored and applied again, unchanged, on later requests of the same conversation without running the function again. This keeps the provider's prompt cache working.
- **On every message** runs the function once for each new user message. **Once per conversation** runs it once.
- **Order.** Functions run after Quilr's request guardrails, tokenization, the [Prompt Store](./prompt-store) and [external hooks](../api-reference/hooks-api), and before [conversation compaction](./conversation-compaction). A script reads tokenized placeholders such as `<PERSON_1>`, not the real values.
- **Token limits** are checked before functions run, so context a function adds is not counted by them.
- **An answer from `respond`** is your own text. Quilr's response checks do not run on it, and it uses no tokens.

## Tools the model can call {#tools}

A tool function is offered to the model as an ordinary tool. Its id is the tool name, its `description` tells the model when to call it, and its `args_schema` says what to send. When the model calls it, the gateway runs the function, gives the model the result and continues the answer.

```python
# Look up an order in your own system. The model supplies order_id.
reply = await http_request(
    "GET",
    "https://orders.example.com/v1/orders/" + args["order_id"],
    secrets={"Authorization": {"secret": "orders_token", "prefix": "Bearer "}},
)
if reply["status"] != 200:
    raise ToolError("order lookup failed")
order = reply["json"]
{"status": order["status"], "eta": order["eta"]}
```

Save it with a schema, the host it may call and its secret:

```json
{
  "description": "Look up the shipping status of an order by its order id.",
  "args_schema": {
    "type": "object",
    "properties": {"order_id": {"type": "string"}},
    "required": ["order_id"]
  },
  "allowed_hosts": ["orders.example.com"],
  "secrets": {"orders_token": "<your-orders-api-token>"},
  "timeout_ms": 3000
}
```

- **Tool limits.** By default the model may be called 5 more times after tool results (**Follow-up model requests**, 1 to 10) and a request may make 20 tool calls in total (**Tool calls per request**, 1 to 50). When a tool fails, the model is told and carries on, or the answer ends there (**When a tool call fails**). An answer that ends there is a normal `200` that is usually empty, not an error.
- **Fixed arguments.** Arguments you set on the attachment are hidden from the model and always used.
- **Tool search.** With many tools, turn on **Found through tool search** for the ones needed rarely. The model gets one search tool and looks them up when it needs them, so a long tool list is not sent with every request.
- **Results** are text of up to 20,000 characters. A failed tool gives the model a short error word, never your error text.
- **Tokenized data.** The model writes placeholders in its arguments. Turn on **Restore tokenized values in arguments** to give the function the real values; the function's definition must allow it (`detokenize_args`). Results are masked again before the model reads them.
- **Name clash.** If the application sends its own tool with the same name, the application's tool wins and yours is not offered.
- **Cost.** Each extra call to the model is priced like any request. The client sees the token totals of all turns added up.

### MCP servers {#mcp-servers}

A function can also be a remote MCP server. The gateway connects to the server and offers its tools to the model, named `mcp__<function id>__<tool name>`. The client sees neither the calls nor the results.

```json
{
  "kind": "mcp",
  "description": "Issue tracker",
  "allowed_hosts": ["mcp.example.com"],
  "secrets": {"token": "<your-mcp-token>"},
  "mcp": {
    "url": "https://mcp.example.com/mcp",
    "headers": {"Authorization": {"secret": "token", "prefix": "Bearer "}},
    "tools": ["search_issues", "get_issue"],
    "user_header": "X-User-Email"
  }
}
```

- An MCP server function can only be attached under **Tools the model can call**.
- The server is reached over HTTPS with a static credential you store as a secret. OAuth sign-in is not supported.
- `tools` limits which of the server's tools are offered. With `user_header`, each tool call carries the request's user email in that header.
- Test a saved MCP server function with `POST /functions/_test`: it connects and lists the tools without calling one.
- This connects the LLM Gateway to your own MCP servers. Servers behind the QuilrAI [MCP Gateway](../../mcp-gateway) cannot be used as a function.

## On the model's answer {#post-call}

A `post_call` function reads the answer as `response` and decides what the client gets.

| To | Call |
| --- | --- |
| Read the answer | `response.text`, `response.tool_calls`, `response.stop_reason` (`end`, `tool_use`, `length` or `other`), `response.model`, `response.usage`, `response.attempt` |
| Replace the answer's text | `await response.replace_text(text)` |
| Remove a tool call the client would receive | `await response.drop_tool_call(id)` |
| Refuse the answer | `await response.block(message)`. The client gets `403 function_blocked`. |
| Ask the model to answer again | `granted = await response.retry(feedback)` |

```python
# Ask the model to answer again when the answer promises a refund.
if "refund is guaranteed" in response.text.lower():
    granted = await response.retry("Do not promise refunds. Explain the refund policy instead.")
    if not granted:
        await response.block("The answer could not be approved.")
{"checked": True}
```

- **Retries.** When a retry is granted, the run ends and every answer function runs again on the new answer. `retry` returns `False` when the function's **Retries** (0 to 2, default 1) are used up or the request already made 3 retries; the script then decides what to do.
- **Order.** Functions run before tokenized values are restored and before Quilr's response guardrails, Guardian, hallucination checks and external hooks, so those still check the final answer.
- **Several functions** run in order, and each sees the changes of the ones before it.

### Streamed answers {#streamed-answers}

A streamed answer reaches the client piece by piece, so a function can only change it if the gateway holds it back.

| **Hold streamed answers** | What happens on a streamed answer |
| --- | --- |
| Off (default) | The answer is sent as it arrives. The function runs after it has ended and can only record what it found. |
| On for at least one function | The gateway holds the whole answer until every function has passed it. Functions can rewrite, block or ask again. The client waits longer for the first words. |

Non-streamed answers are always held, so every function can change them.

## After the request {#on-complete}

An `on_complete` function runs in the background once the request is finished, including requests that ended in an error and requests a function ended itself: answered in place of the model, blocked, or refused because a required function failed. It reads the finished request as `event`.

```python
# Send failed requests to your own alerting endpoint.
if event["status_code"] >= 400:
    await http_request(
        "POST",
        "https://alerts.example.com/gateway",
        json={
            "request_id": event["request_id"],
            "app": event["app"]["name"],
            "status": event["status_code"],
            "error": event["error_type"],
        },
        secrets={"Authorization": {"secret": "alerts_token", "prefix": "Bearer "}},
    )
{"sent": event["status_code"] >= 400}
```

`event` holds `request_id`, `created_at`, `surface`, `stream`, `app` (`name`, `tags`), `user` (`email`, `groups`), `agent`, `conversation` (`id`), `model` (`requested`, `served`), `provider`, `status_code`, `error_type`, `latency_ms`, `usage`, `cost` and `content` (`user_text`, `assistant_text`, the names of `tool_calls`). Texts are cut to 32 KiB and keep tokenized placeholders.

- A function can run more than once for the same request, so make it safe to repeat.
- Runs happen on the gateway server that served the request. They are not shown on the request's log; see [Background runs](#see-what-functions-did).
- A request refused before functions run does not start background functions: a failed sign-in, a limit, data protection or an external hook that blocked it.
- Requests the gateway makes itself, and replays, do not start background functions.

## Script reference {#script-reference}

A script is Python. Top-level `await` is allowed, and the last expression is the function's result. The script has no file, network or environment access: everything outside goes through the calls below.

**Always available**

| Name | What it is |
| --- | --- |
| `args` | The function's arguments, from the attachment and, for a tool, from the model. |
| `request` | Details of the request: `request_id`, `surface`, `stream`, `turn_count`, `app` (`name`, `tags`), `user` (`email`, `groups`), `model` (`requested`), `client` (`agent.name`), `conversation` (`id`). A value is `None` when unknown. |
| `conv` | The conversation: `conv.system`, `conv.messages` (a list of `{"role", "text"}`), `conv.last_user_text`, `conv.turn_count`, `conv.is_first_turn`. Images, files and tool calls appear as markers such as `[image]`. |
| `response` | The model's answer (answer stage only). |
| `event` | The finished request (background stage only). |
| `ToolError` | The error a failed call raises. Raise it yourself to fail the run. |
| `asyncio`, `datetime`, `json`, `math`, `re`, `time` | Python modules. |

**Your data and state**

| Call | What it does |
| --- | --- |
| `await data.get("namespace/key", default=None)` | Read [function data](../api-reference/functions-api#function-data). Scripts cannot change it. |
| `await data.search(query, namespace=None, limit=5, mode="keyword")` | Find the best matching data entries: a list of `{namespace, key, score, value}`. `limit` is at most 20. `mode="semantic"` ranks by meaning where available, and otherwise runs as a keyword search. |
| `await kv.get(scope, key, default=None)`, `kv.set(scope, key, value, ttl_seconds=3600)`, `kv.delete(scope, key)` | Short-term state for up to 7 days. `scope` is `"tenant"`, `"user"` or `"conversation"`. A read that does not answer in time raises `ToolError`; see [Short-term state](#short-term-state). |
| `await memory.get(scope, key, default=None)`, `memory.set(scope, key, value, ttl_days=None)`, `memory.delete(scope, key)`, `memory.list(scope, prefix="", limit=50)` | Long-term memory, kept until it expires or is deleted. `scope` is `"tenant"` or `"user"`. Shared by all of your functions. |

The `user` scope is the request's user email as the gateway identified it, or the personal or app key when there is no email. A request with neither has no `user` scope. Identity is as trustworthy as your app's [identity setup](../protect/identity-and-network-trust).

**Outside calls**

| Call | What it does |
| --- | --- |
| `await http_request(method, url, headers=None, json=None, body=None, secrets=None)` | Call one of the function's `allowed_hosts` over HTTPS. Returns `{status, headers, body, json, truncated}`. |
| `await call_llm(target, messages, schema=None, max_tokens=None)` | Ask a model. `target` is one of the function's `llm_targets`: a provider label or `label/model`. Returns `{content, json, tool_calls, finish_reason, model, usage, request_id}`. With `schema`, `json` holds the parsed result. |
| `await run_agent(target, system, tools, input, max_iterations=5)` | Let a model work with up to 16 of your other functions as tools. Returns `{output, iterations, tool_calls, finished}`. |
| `await get_category(text, categories)` | Pick which of 2 to 20 categories fits a text, with Quilr's own classifier. Returns `{category, status, reason}`; `status` is `ok` or `not_evaluated`. |
| `await web_search(query, limit=5)` | Search the web: a list of `{url, title, snippet}`. Needs web search enabled for your deployment; otherwise the call raises `ToolError`. |
| `await fetch_url(url)` | Fetch a public page as `{url, markdown}`. Needs web search enabled for your deployment; otherwise the call raises `ToolError`. |

**Outcomes**

| Call | What it does |
| --- | --- |
| `await respond(content)` | Answer in place of the model. Before the model is called, and in tools (the content is the tool's result). |
| `await block(message=None)` | Refuse. Before the model is called and on the model's answer. |

A call that fails raises `ToolError`, which the script can catch. A call that is not available in the function's stage, such as `respond` on the model's answer, raises `ToolError` too.

## Data, state and memory {#data-state-and-memory}

| | Function data | `kv` | `memory` |
| --- | --- | --- | --- |
| Use it for | Reference content you manage: instructions, lookup tables. | Short-term state, such as what a conversation has seen. | What functions should remember about a user or your organization. |
| Written by | You, through the API. | Scripts. | Scripts. |
| Lasts | Until you change it. | 1 hour by default, 7 days at most. | Until `ttl_days` (1 to 365) passes, or forever without one. |
| Size | 256 KB per entry, 5,000 entries. | 16 KiB per value. | 16 KB per value; 500 keys per user, 5,000 organization-wide. |
| Scopes | Organization. | Organization, user, conversation. | Organization, user. |

To see or erase what functions remembered, including everything about one person, use the [function memory](../api-reference/functions-api#function-memory) routes. Values are stored encrypted.

### Short-term state {#short-term-state}

`kv.get` returns your `default` only when the key is absent. When the store does not answer in time, the read raises `ToolError` instead, so a script that reads, changes and writes back never mistakes a slow read for an empty one. If you do not catch the error, the function fails and its `on_failure` setting decides. Catch it when the function can do without the value:

```python
# Count the user messages of a conversation. Skip the count when state is unavailable.
try:
    seen = await kv.get("conversation", "messages_seen", 0)
    await kv.set("conversation", "messages_seen", seen + 1, ttl_seconds=86400)
except ToolError:
    seen = None
{"seen": seen}
```

`kv.set` returns `False` when the write could not be stored.

## Where functions run {#where-functions-run}

| API | Before the model | Tools | On the answer | After the request |
| --- | --- | --- | --- | --- |
| OpenAI Chat Completions | Yes | Yes | Yes | Yes |
| OpenAI Responses | Yes | Yes | Yes | Yes |
| Anthropic Messages | Yes | Yes | Yes | Yes |
| Gemini `generateContent` | Yes | Yes | No | Yes |
| Bedrock Runtime Converse and InvokeModel (Claude, Nova) | Yes | Yes | No | Yes |

Functions do not run on:

- Other APIs, such as embeddings, Realtime and Assistants.
- Requests that run on a privately hosted gateway, such as a [GPU connector](../apps-and-providers/gpu-connectors). The request's log details say so.
- Bedrock InvokeModel bodies of other model families.

When a function with `on_failure: block` is attached and the request has a shape it cannot work on, the gateway refuses the request with `400 function_unsupported_request` instead of letting it pass unchecked. This covers Chat Completions with `n` above 1 and Responses with `background: true` for answer functions, and unsupported Bedrock bodies for functions that run before the model.

More to know:

- **Response cache.** A request with an attached tool, or with a function before the model or on the answer that is not **Observe only**, is not served from the [response cache](./response-cache) and its answer is not stored there.
- **Stored Responses conversations.** On a Responses request that stores its state, a function cannot remove a tool call. Send `store: false`, or block the answer.
- **Deleted functions.** A function that a published rule still uses cannot be deleted (`409 function_in_use`). Remove it from the rules first.

## When a function fails

Each function's `on_failure` setting decides:

| `on_failure` | Before the model or on the answer | As a tool |
| --- | --- | --- |
| `allow` (default) | The run is skipped and the request continues. | The model is told the tool failed. |
| `block` | The request is refused with `503 function_failed`. | The model is told the tool failed. |

A function fails when its script raises an error, runs longer than `timeout_ms`, computes for longer than `max_cpu_ms`, makes more outside calls than `max_host_calls`, or the gateway is too busy to run it. Clients never see your error text.

A background function that fails is counted under [Background runs](#see-what-functions-did). The gateway tries it again only when the gateway itself could not run it; a script error or a timeout is final.

You can give `function_blocked` and `function_failed` friendlier text with [error messages](../protect/error-messages).

## See what functions did {#see-what-functions-did}

**The Functions tab.** **Govern > Policy Engine > LLM Gateway > Functions** lists your functions read-only, with their kind, whether a policy attaches them, version, what happens if a run fails and time limit. Open a function for its script, settings and versions. The tab also shows **Function data**, **Memory** and **Background runs**.

![Functions tab listing Python and MCP server functions with kind, In policies, version, If a run fails, time limit and updated columns](/img/llm-gateway/ui/functions/functions-tab.png)

**Activity.** The **Activity** card on the same tab shows, for 24 hours, 7 days or 30 days: requests with a function, runs, failed runs, requests sent to models for tools, web searches and model spend, then each function's runs, failure rate, slowest runs and last run. Click a function's request count to open those requests in the logs.

![Activity card with requests with a function, runs, failed runs, requests sent to models for tools, web searches and model spend, and a row per function](/img/llm-gateway/ui/functions/functions-activity.png)

**Request logs.** A request that ran functions has a **Functions** section in its details, with one block per stage: what was attached, what ran, what changed, tool calls and time. Filter the list with **Functions** (**A function ran** or **No function ran**) and **Function** (a function id). Logs hold ids, counts and timings, never arguments, results or your block messages.

![Request details with the Functions section open: Before the model is called, Tools the model can call, On the model's answer and After the request](/img/llm-gateway/ui/functions/request-log-functions.png)

**Change history.** Every function, data, memory and attachment change made through the Management API is listed under **Settings > AI Gateway > LLM Gateway > Management API > History**, and in `GET /audit`.

**Background runs.** `GET /functions/_on_complete/status` and the **Background runs** section show what is waiting and, per function, how many runs succeeded, failed or were dropped, with the last error. The numbers are those of the one gateway server that took the call, so repeated calls can show different numbers.

**Management API.** `GET /requests` items carry `functions` (`ran` and `failed`), and [`GET /requests/{request_id}/explain`](../api-reference/monitoring-api#explain-a-request) returns a `functions` section with each stage and up to 50 runs. A request a function blocked has the outcome `blocked` in usage, the request list, latency and the explanation.

### Requests a function sends to models {#function-model-calls}

Each `call_llm` or `run_agent` model call is its own request in the logs, tagged **Function call**, and is billed to the application like any request. In the Management API it has `request_kind: "function"` and a `function_call` that names the request and the function that made it. Extra model turns for tools are part of the original request.

Requests the gateway makes itself are ordinary requests: they count in request totals, tokens, cost, latency and error rates everywhere, including the [Usage API](../api-reference/usage-api) and [Monitoring API](../api-reference/monitoring-api). In the logs, the **Request kind** filter tells them apart: **Function call**, **Conversation summary** and **Cache warming**.

## Security

- **Sandbox.** Scripts run in a sandbox with no file, network or environment access, a memory limit and a compute-time limit (`max_cpu_ms`). They reach the outside only through the calls in the [script reference](#script-reference).
- **Allowed hosts.** `http_request` and MCP servers reach only the hosts you list in `allowed_hosts`, over HTTPS, on public addresses. Redirects are returned, not followed. Cookies are never kept. Quilr's own hosts and local addresses are refused.
- **Secrets are write-only.** A secret is stored encrypted and shown as `********`. Scripts never see its value: the gateway attaches it to the calls that name it, and masks it if the other side echoes it back. `Authorization` and `Cookie` headers can only be set from a secret.
- **Model targets.** `call_llm` and `run_agent` can use only the providers and models in `llm_targets`.
- **Sensitive data.** Scripts read tokenized placeholders, not the real values, unless you turn on **Restore tokenized values in arguments** for a tool whose function allows it. Search results and pages a script fetches are not scanned by Quilr's guardrails.
- **Scopes.** Only keys with `functions:write` can create, change, test or attach functions, and read stored memory values. Reading memory values is recorded in the audit log.
- **Observe first.** Attach a new function with **Observe only** to see what it would do before it changes anything.

## Limits

| Limit | Value |
| --- | --- |
| Functions per organization | 200 |
| Script size | 64 KiB |
| Run time (`timeout_ms`) | 100 ms to 60 s, default 5 s |
| Script compute time per run (`max_cpu_ms`) | 10 ms to 1 s, default 200 ms; waits on outside calls are not counted |
| Outside calls per run (`max_host_calls`) | 1 to 50, default 20 |
| Context added by one call | 20,000 characters; 8 conversation changes per run |
| `http_request` | 256 KiB request and response bodies, 32 headers, 30 s |
| `call_llm` | 200 messages, 400,000 characters; `max_tokens` default 1,024, at most 8,192 |
| Tool result | 20,000 characters |
| Functions per request | 16 at each stage; 32 gateway tools offered |
| Retries of an answer | 3 per request |
| Test runs | 30 a minute |

More limits are listed in the [Functions API](../api-reference/functions-api#limits).

## Web search by the gateway {#web-search-by-the-gateway}

Some applications ask the model's provider to search the web, for example with Anthropic's `web_search` tool, the Responses `web_search` tool or Chat Completions `web_search_options`. Not every provider supports this: Claude on AWS Bedrock, for example, refuses the tool. For an application that has this turned on, the gateway runs the search itself on providers that cannot, so the same request works wherever it is routed.

- It is off by default. QuilrAI turns it on per application on request.
- Providers that have their own web search keep using it.
- Each extra model turn is priced like any request, and these answers are not stored in the response cache.
- Citations are not added to the answer; the model cites URLs in its text.
- A request that used it shows **Web search by the gateway** in its log details.

## Related

- [Functions API](../api-reference/functions-api) - every route, field, error and limit.
- [Hooks API](../api-reference/hooks-api) - call your own HTTPS API on gateway traffic instead of running a script.
- [Tool controls](../protect/tool-controls) - allow, block or review the tools applications send.
- [Conversation compaction](./conversation-compaction) - keep long conversations short.
- [Policy Engine](../../console/govern/policy-engine) - draft, test and publish policy changes.
