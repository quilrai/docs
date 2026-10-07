---
sidebar_position: 7
sidebar_label: "Inventory"
description: "The catalog of discovered AI assets, the asset drawer, and a worked example for an MCP server running outside the gateway."
sidebar_custom_props:
  icon: Database
---

# Inventory

Inventory is the catalog of every AI asset Quilr has discovered: applications,
browser extensions, AI clients, models, MCP servers, agents, skills, plugins,
hooks, repositories and more. Open it from **Observe > Inventory**.

![Inventory in the console](/img/console-v2/pages/inventory.jpg)

The header has **Refresh**, **Export** and the period selector.

## Summary panels

| Panel | Shows |
|---|---|
| Total inventory | Counts of applications, skills, agents and MCP servers. |
| Applications | Top applications by interactions. |
| Skills & MCP | The most prevalent skills and the top MCP servers by calls. |
| Agentic components | Counts of models, tools, plugins, agents, hooks and repositories. |

## Asset table

One row per asset, sorted by **Needs attention** by default.

- **Columns**: Asset, Context, Sensors, Risk & findings, Activity,
  Relationships and Last seen. Use **Columns** to change them.
- **Filters**: sources, asset types, risk, approval status and
  vendor or provider, plus search.
- **Saved views** keep a filter set you return to. See
  [Views, filters and drawers](../get-started/views-filters-and-drawers).

## Asset detail drawer

Click an asset to open its drawer. The header shows the asset type, name,
sensor, **Approval status**, **Overall risk**, and when it was first and last
seen.

- **Overview**: interactions, devices, related assets, a **Sources** table
  (which sensors and integrations reported it) and **Identity & details**.
- **Graph**: the asset's relationships.
- Type-specific sections. For example, a coding tool shows its MCP servers,
  scheduled tasks, tool usage, guardrails and dependencies.

Use the drawer to decide whether an asset should be approved, and to see who
uses it. Agents get a richer view on [Agents](./agents).

## Example: an MCP server outside the gateway

1. **Find it.** On [Overview](./overview) › **Agentic estate**, **Control coverage** counts MCP servers by route, and **Act now** often names an MCP server running **Outside gateway**. Select **Review asset** to open it here.
2. **Find the owner.** In the drawer's **Overview**, the devices, interactions and **Sources** table show who runs it and which sensor reported it (for example the Endpoint Agent on a developer's laptop). Open the person in [Users](./users) for their other devices and assets.
3. **Decide.** Agree with the owner whether the server is needed. Record the outcome in the asset's **Approval status** where your workflow uses it.
4. **Enforce.** If it is allowed, [add it to the MCP Gateway](../../mcp-gateway/servers-and-connections/adding-mcp-servers), set [Server access](../../mcp-gateway/protect/server-access), and have the owner connect through the gateway or [OneMCP](../../mcp-gateway/get-started/onemcp) instead of directly. If it is not allowed, the owner removes it from their client configuration. Gateway policies only apply to traffic that goes through the gateway; they cannot block a direct local connection.
5. **Verify.** After the next period, check that the server's route in **Control coverage** has moved to **Gateway only**, or that it no longer appears with recent **Last seen** activity.

:::tip
LLM Gateway applications and MCP servers are configured under Settings. See
the [LLM Gateway](../../llm-gateway) and [MCP Gateway](../../mcp-gateway)
docs.
:::
