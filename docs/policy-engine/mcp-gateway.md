---
sidebar_position: 3
sidebar_custom_props:
  icon: Network
---

# MCP Gateway Policies

Govern which MCP servers an agent may reach, which tools it may call, and what
comes back.

## Four decision points

The MCP Gateway evaluates its document at four stages, in pipeline order.

<StepFlow steps={[
  {
    label: "session",
    items: [
      "MCP server access",
      "OneMCP dynamic tools and memory",
      "Identity and managed auth",
      "Capability cache mode",
    ],
  },
  {
    label: "discovery",
    items: [
      "Tool, resource and prompt visibility",
    ],
  },
  {
    label: "request",
    items: [
      "Tool, resource and prompt invocation",
      "Human approval",
      "Sensitive data inspection",
      "Quotas and concurrency",
    ],
  },
  {
    label: "response",
    items: [
      "Sensitive data inspection",
      "Token savings",
      "Web search security",
    ],
  },
]} />

An effect is only legal on the stages that own it. The compiler rejects a rule
that places an effect on the wrong stage, so a quota cannot be attached to a
session rule and a cache mode cannot be attached to a response rule.

## What you can match on

| Group | Fields |
|---|---|
| Caller | User email, user ID, user full name, smart groups, identity provider, client IP |
| Agent | Agent name, keyword, normalized and raw user agent, classification, matching registered agent keywords |
| Route | Route kind (`direct`, `onemcp`, `workflow`), route name, route source |
| MCP server | MCP ID, name, slug, transport, auth type, system MCP, tags |
| Operation | MCP method, operation kind |
| Tool | Tool name, type, tags, risk, and the `read_only`, `destructive`, `idempotent` and `open_world` annotations |
| Resource and prompt | Resource URI, template URI, name, MIME type; prompt name |
| Response | Whether the response succeeded, error code and message |
| Data found | Detections by exact catalog name |

## The ten control surfaces

| Surface | Stage | Effects |
|---|---|---|
| MCP Server Access | session | `mcp.access` allow or deny |
| Tools, Resources & Prompts | discovery, request, response | `tool.access`, `resource.access`, `prompt.access` |
| Human Approval | request | `tool.confirmation` none or required |
| Data & Adversarial Risks | request, response | `dlp.action`, `dlp.category_actions`, `dlp.default_action`, `dlp.detectors`, `risk.level` |
| Usage Quotas & Concurrency | request | `quota.minute`, `quota.hour`, `quota.day`, `quota.window`, `quota.timezone`, `quota.dimensions`, `quota.id`, `concurrency.limit`, `concurrency.ttl_seconds`, `concurrency.dimensions` |
| OneMCP Features | session | `onemcp.dynamic_tools`, `onemcp.memory` |
| Identity & Managed Authentication | session | `claims.forward`, `token.profile`, credential references |
| Capability Cache & Isolation | session | `cache.mode`: shared, tenant, private or none |
| Token Savings | response | `token_saving.smart_json_compression`, `html_to_text`, `markdown_to_text`, `text_compression` |
| Web Search Security | response | `web_search.zia_timeout_seconds`, `excluded_domains`, `url_overrides`, `result_domain_action` |

Quota and concurrency dimensions are keyed by `tenant`, `user`, `agent`, `mcp`,
`tool` or `group`, over a `fixed` or `rolling` window.

## Blocking a server

```
policy  block_unapproved_servers      priority 900      runs on session

When  MCP name       is any of  Unapproved Notes, Legacy CRM
Then  MCP access     →          deny
```

Denied at session, so the agent never sees the server's tools at all.

## Hiding and denying a tool

```
policy  hide_destructive_github_tools    priority 850

Rule 1  runs on discovery
  When  MCP name                  is    GitHub
  and   Tool is destructive       is    true
  Then  Tool call access          →     deny

Rule 2  runs on request
  When  MCP name                  is    GitHub
  and   Tool is destructive       is    true
  Then  Tool call access          →     deny
```

Denying at `discovery` removes the tool from the list the agent is offered.
Denying at `request` refuses it if the agent calls it anyway. Use both: an
agent that cached an earlier tool list can still attempt a call.

## Requiring a human

```
policy  confirm_write_tools      priority 700      runs on request

When  Tool tags            has entry  write
Then  tool confirmation    →          required
```

The call pauses until a person approves it.

## Per data type actions

The MCP target carries an explicit map effect for this, so one rule can assign
a different action to each data type.

```
policy  crm_data_actions      priority 700      runs on request

When  MCP name                        is  Customer CRM
Then  Actions per sensitive data type →   Auth & Secrets   block
                                          Aadhaar Number / VID  redact
                                          Name             monitor
      Default sensitive data action   →   monitor
```

Each key resolves independently, so a rule that changes one data type never
erases another rule's opinion on a different one. `Default sensitive data
action` covers any enabled category the map does not name.

:::note
`Actions per sensitive data type`, `Default sensitive data action` and
`Sensitive data detectors` are evaluated before content is scanned, so a rule
carrying one of them cannot also carry a `data found` condition. Put the data
condition in a separate rule.
:::

## Quotas and concurrency

```
policy  per_user_tool_budget      priority 500      runs on request

When  Route kind            is  direct
Then  requests per minute   →   60
      requests per day      →   5,000
      quota window          →   rolling
      quota dimensions      →   user, mcp
      concurrent requests   →   4
```

Dimensions decide what the counter is keyed by. `user, mcp` gives each person a
separate allowance on each MCP server. Quotas are reserved all or nothing, so a
call that would cross any limit is refused rather than partially served.

## Session shape

```
policy  contractor_session_posture      priority 800      runs on session

When  Smart groups            includes (ignoring case)  Contractors
Then  OneMCP dynamic tools    →  false
      OneMCP memory           →  deny
      forward user claims     →  false
      cache mode              →  private
```

## Response handling

```
policy  compress_and_fence_search     priority 400     runs on response

When  MCP name                    is  Web Search
Then  smart JSON compression      →   true
      HTML to text                →   true
      excluded domains            →   pastebin.com, raw.githubusercontent.com
      result domain action        →   block
```

## Differences from the LLM Gateway target

| | LLM Gateway | MCP Gateway |
|---|---|---|
| Stages | 2 | 4, with compiler stage gating |
| Per data type actions | One data rule per action inside a configuration | A single `Actions per sensitive data type` map |
| Publishing | Publish takes a message | Publish takes no message; drafts support rename |
| Access default | Allow unless denied | Deny wins, with default-deny on an unregistered server |
| Replay | Days and row limit | Window, MCP, tool, user and route filters |

Everything else - the sentence editor, drafts, immutable revisions, simulation,
replay, rollback and the conversion review - works the same way on both
targets. See [Authoring and publishing](./authoring-and-publishing).
