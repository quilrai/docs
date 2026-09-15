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
      "Server access",
      "OneMCP",
      "Identity",
      "Cache mode",
    ],
  },
  {
    label: "discovery",
    items: [
      "Tool visibility",
      "Resources",
      "Prompts",
    ],
  },
  {
    label: "request",
    items: [
      "Invocation",
      "Human approval",
      "Data scan",
      "Quotas",
    ],
  },
  {
    label: "response",
    items: [
      "Data scan",
      "Token savings",
      "Web search",
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

<PolicyCard
  name="block_unapproved_servers"
  stage="session"
  priority={900}
  when={[{ field: "MCP name", op: "is any of", values: ["Unapproved Notes", "Legacy CRM"] }]}
  then={[{ effect: "MCP access", value: "deny" }]}
/>

Denied at session, so the agent never sees the server's tools at all.

## Hiding and denying a tool

<PolicyCard
  name="hide_destructive_github_tools"
  priority={850}
  rules={[
    {
      label: "Rule 1 - runs on discovery",
      when: [
        { field: "MCP name", op: "is", value: "GitHub" },
        { field: "Tool is destructive", op: "is", value: "true" },
      ],
      then: [{ effect: "Tool call access", value: "deny" }],
    },
    {
      label: "Rule 2 - runs on request",
      when: [
        { field: "MCP name", op: "is", value: "GitHub" },
        { field: "Tool is destructive", op: "is", value: "true" },
      ],
      then: [{ effect: "Tool call access", value: "deny" }],
    },
  ]}
/>

Denying at `discovery` removes the tool from the list the agent is offered.
Denying at `request` refuses it if the agent calls it anyway. Use both: an
agent that cached an earlier tool list can still attempt a call.

## Requiring a human

<PolicyCard
  name="confirm_write_tools"
  stage="request"
  priority={700}
  when={[{ field: "Tool tags", op: "has entry", value: "write" }]}
  then={[{ effect: "tool confirmation", value: "required" }]}
/>

The call pauses until a person approves it.

## Per data type actions

The MCP target carries an explicit map effect for this, so one rule can assign
a different action to each data type.

<PolicyCard
  name="crm_data_actions"
  stage="request"
  priority={700}
  when={[{ field: "MCP name", op: "is", value: "Customer CRM" }]}
  then={[
    {
      effect: "Actions per sensitive data type",
      value: "3 data types",
      detail: [
        { label: "Auth & Secrets", value: "block" },
        { label: "Aadhaar Number / VID", value: "redact" },
        { label: "Name", value: "monitor" },
      ],
    },
    { effect: "Default sensitive data action", value: "monitor" },
  ]}
/>

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

<PolicyCard
  name="per_user_tool_budget"
  stage="request"
  priority={500}
  when={[{ field: "Route kind", op: "is", value: "direct" }]}
  then={[
    { effect: "requests per minute", value: "60" },
    { effect: "requests per day", value: "5,000" },
    { effect: "quota window", value: "rolling" },
    { effect: "quota dimensions", values: ["user", "mcp"], tone: "info" },
    { effect: "concurrent requests", value: "4" },
  ]}
/>

Dimensions decide what the counter is keyed by. `user, mcp` gives each person a
separate allowance on each MCP server. Quotas are reserved all or nothing, so a
call that would cross any limit is refused rather than partially served.

## Session shape

<PolicyCard
  name="contractor_session_posture"
  stage="session"
  priority={800}
  when={[{ field: "Smart groups", op: "includes (ignoring case)", value: "Contractors" }]}
  then={[
    { effect: "OneMCP dynamic tools", value: "false" },
    { effect: "OneMCP memory", value: "deny" },
    { effect: "forward user claims", value: "false" },
    { effect: "cache mode", value: "private" },
  ]}
/>

## Response handling

<PolicyCard
  name="compress_and_fence_search"
  stage="response"
  priority={400}
  when={[{ field: "MCP name", op: "is", value: "Web Search" }]}
  then={[
    { effect: "smart JSON compression", value: "true" },
    { effect: "HTML to text", value: "true" },
    { effect: "excluded domains", values: ["pastebin.com", "raw.githubusercontent.com"], tone: "info" },
    { effect: "result domain action", value: "block" },
  ]}
/>

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
