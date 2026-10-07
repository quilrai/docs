---
sidebar_position: 3
sidebar_label: "Graph"
sidebar_custom_props:
  icon: Network
---

# Graph

Graph shows how people, applications, agents, MCP servers, data and controls
connect, as an interactive map. Open it from **Observe > Graph**. Use it to
answer questions such as "which agents reach this MCP server?" or "what does
this person's AI footprint look like?".

## Lenses and filters

- **Graph lens**: **Estate**, **People**, **Agentic**, **Risk** or
  **Governance**. Each lens starts from a different question and emphasises
  different relationships.
- **Sensor chips**: show or hide data from LLM, MCP, Endpoint, Browser,
  Copilot, GitHub, Foundry and OpenAI.
- **Period** and **+ Add filter** narrow the graph further.

## Read the canvas

The canvas starts from a central **Organization** node with category nodes
around it, for example Apps, People, Agents, MCPs, Skills, Models, Data,
Devices, Plugins, Hooks, Permissions, Tool families and Work (working
directories and repositories).

Each category node shows how many items it holds and how many need attention.
Click **expand** to open a category into its items, and keep expanding to
follow relationships.

## Navigate and inspect

- The left rail lists node types. Use it to focus the graph on one type.
- **Legend** explains node and edge styles.
- Zoom and fullscreen controls sit on the canvas.
- Select a node to open its details in the right-hand panel.

:::note
The graph loads a lot of data and can take a few seconds. If a banner says
some data is temporarily unavailable, click **Retry**.
:::

The same relationship view is available for a single person or asset: open
the **Graph** section in a person's profile on [Users](./users) or an asset's
drawer in [Inventory](./inventory).
