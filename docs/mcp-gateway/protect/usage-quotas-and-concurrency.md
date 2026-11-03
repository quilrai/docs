---
sidebar_position: 10
sidebar_label: "Usage quotas and concurrency"
sidebar_custom_props:
  icon: Gauge
description: "Limit MCP tool calls and simultaneous execution with scoped Policy Engine quotas and shared counters."
aliases: [MCP quotas, rate limits, concurrent calls]
---

# Usage quotas and concurrency

Updated on 3 November 2026.

Cap how many tool calls can be made in a time window, and how many can run at the same time. Use quotas to stop a runaway agent or a heavy user from exhausting an MCP server or its upstream API limits.

:::note Policy Engine only
There is no quota setting in a server's **Configure** sections. Quotas and concurrency limits are set only on the **Usage Quotas & Concurrency** control in **Govern > Policy Engine > MCP Gateway**, and apply once the Policy Engine is on for the MCP Gateway.
:::

## Where to set it

<ConsolePath
  console="QuilrAI console"
  path={['Govern', 'Policy Engine', 'MCP Gateway']}
  action="Usage Quotas & Concurrency"
/>

The panel has **Call quotas** and **Simultaneous calls** sections, with **Controls** and **Activity** tabs.

1. Choose **Limit calls** or **Limit simultaneous calls**, or start a blank rule in the corresponding section.
2. Set **Applies to**, the limits, and the counter dimensions.
3. Check **Reads as**, then **Save to draft**.
4. Use **Test** to check the candidate, then [review and publish](../../console/govern/author-simulate-and-publish).

Without a matching setting, this control adds no rate or concurrency ceiling. Other gateway or upstream limits can still refuse a call.

Every distinct matching counter must admit the call; priority does not make another counter disappear. Rules with the same quota name share usage and must agree on dimensions, window and timezone. The **Share a server's concurrency pool** recipe creates one pool shared by rules that name it.

## Effects

| Effect | Key | What it sets |
|--------|-----|--------------|
| **Requests per minute**, **per hour**, **per day** | `quota.minute`, `quota.hour`, `quota.day` | The number of calls allowed in each window. |
| **Quota window** | `quota.window` | `fixed` or `rolling`. |
| Quota timezone | `quota.timezone` | The timezone used for the quota windows. |
| **Quota dimensions** | `quota.dimensions` | What the counter is keyed by: `tenant`, `user`, `agent`, `mcp`, `tool` or `group`. |
| Quota ID | `quota.id` | An identifier for the quota counter. |
| **Concurrent requests** | `concurrency.limit` | How many calls may be in flight at the same time. |
| Concurrency TTL | `concurrency.ttl_seconds` | A time limit, in seconds, for a concurrency slot. |
| Concurrency dimensions | `concurrency.dimensions` | What the concurrency limit is keyed by, using the same dimensions as quotas. |

Dimensions decide who shares a counter. `user, mcp` gives each person a separate allowance on each MCP server. `tenant` gives everyone one shared allowance.

Quotas are reserved all or nothing. A call that would cross any limit is refused rather than partially served.

## Example: per-user budget on direct connections

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

Each person can make 60 calls a minute and 5,000 a day on each MCP server they reach directly, with at most 4 running at once.

## More scenarios

- **Protect an upstream API with a tenant-wide cap.** Match **MCP name** and key the quota by `tenant` and `mcp`, so the whole organization stays under the provider's own rate limit.
- **Limit expensive tools only.** Match **tool name** or tool tags and key by `user` and `tool`, so a costly search or export tool has a lower budget than the rest of the server.
- **Tighter limits for one group or agent.** Match **smart groups** or **agent name**, for example a lower daily quota for an automated agent than for people.

## Related

- [Group and user rules](./group-and-user-rules) - per group overrides that do not need the Policy Engine.
- [Server access](./server-access) - decide who may use a server at all.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
