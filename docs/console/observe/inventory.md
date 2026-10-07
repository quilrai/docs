---
sidebar_position: 7
sidebar_label: "Inventory"
sidebar_custom_props:
  icon: Database
---

# Inventory

Inventory is the catalog of every AI asset Quilr has discovered: applications,
browser extensions, AI clients, models, MCP servers, agents, skills, plugins,
hooks, repositories and more. Open it from **Observe > Inventory**.

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

:::tip
LLM Gateway applications and MCP servers are configured under Settings. See
the [LLM Gateway](../../llm-gateway) and [MCP Gateway](../../mcp-gateway)
docs.
:::
