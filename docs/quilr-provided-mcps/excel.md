---
sidebar_position: 5
sidebar_custom_props:
  icon: BarChart2
---

# Excel

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">WORKBOOK AUTOMATION</span><h2>From raw ranges to finished charts.</h2><p>A focused Microsoft Graph workbook MCP for calculations, structure, formatting, and reporting.</p></div>

<McpDecision
  officialTitle="Build on Graph workbook APIs"
  official="Use Microsoft Graph directly when your application team needs the raw workbook API and will design its own agent schema and controls."
  officialPoints={['Direct provider API contract', 'Maximum implementation freedom']}
  quilrTitle="Choose a workbook-only agent surface"
  quilr="Use Quilr when an agent needs eight predictable dispatchers for ranges, formulas, tables, charts, pivots, and workbook structure."
  quilrPoints={['Bounded Microsoft scope', 'Explore and change operations grouped by task']}
  verdict="Choose Excel for workbook automation. Use Microsoft 365 v3 only when the workflow must cross into mail, files, calendars, or Teams."
/>

## Tool Surface

| Dispatcher | Explore | Change |
|---|---|---|
| `workbook` | List and inspect workbooks | Create workbooks |
| `worksheet` | List and inspect sheets | Create, rename, reposition, delete |
| `range` | Read values, formulas, and used ranges | Write, calculate, clear, and format |
| `table` | Read tables and rows | Create, resize, add/update/delete rows |
| `named_range` | List and resolve names | Create, update, delete |
| `chart` | List and inspect charts | Create, update, position, delete |
| `pivot` | Inspect pivot tables | Read-only |
| `function` | Evaluate Excel functions | Read-only evaluation |

:::tip Safe rollout
Enable writes against a test workbook first. Range, formula, and table changes can affect downstream reports even when the individual API call is not destructive.
:::

Use [Microsoft 365 v3](./microsoft-365-v3) for cross-workload workflows; use Excel when workbook manipulation should be the agent's entire Microsoft scope.
