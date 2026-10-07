---
sidebar_position: 2
sidebar_label: "Views, filters and drawers"
sidebar_custom_props:
  icon: LayoutGrid
---

# Views, filters and drawers

Most console pages share the same controls. Learn them once and they work the
same way on Findings & Interactions, Users, Inventory, Agents, Costs & Savings
and the other list pages.

## Period and compare

The period selector at the top right of a page (for example **Last 7 days**
or **Last 30 days**) scopes every count, chart and list on that page. Ranges
run from 24 hours to 365 days, or pick a custom range. Some
pages, such as [Costs & Savings](../observe/costs-and-savings), also offer
**Compare: previous period** so that changes are shown against the period
before.

## Search and filters

- The search box matches people, applications and, on some pages, prompts.
- **Quick filters** under the search box cover the fields you use most, for
  example **Sensor**, **Person**, **App**, **Category** and **Outcome** on
  Findings.
- **More filters** (or **Filters** / **Add filter**) opens the full list of
  fields for the page, including sensor-specific fields. Press **F** to open
  filters from the keyboard.
- Active filters appear as chips in an **Active** row. Remove one with its
  **x**, or use **Clear filters**.

## Saved views

A saved view remembers the filters, columns and layout of a list. The chip bar
above the list shows the default view (for example **All findings**) and any
views you saved.

1. Set up the filters, columns and layout you want.
2. Click **Save new view** and name it.
3. Click the chip to return to the view later. Use the menu next to the chips
   for view actions.

## Layouts and columns

| Layout | Use it to |
|---|---|
| **Cards** | Read items one by one. Best for reviewing a queue. |
| **Table** | Compare many items in sortable columns. Use **Columns** to pick which columns appear. |
| **Bird's-eye** | See summary tiles and charts for the current filters before drilling into rows. Available on Findings & Interactions. |

Filters and the period carry across layouts.

## Detail drawers and deep links

Clicking a row, card or name opens a detail drawer on the right, over the
list, so you keep your place. The drawer is reflected in the page URL, so you
can copy the URL and share it: the recipient opens the same drawer (subject to
their own [permissions](../settings-organization/roles-and-permissions)).

| URL parameter | Opens |
|---|---|
| `?person=` | A person's profile ([Users](../observe/users)) |
| `?asset=` | An asset's detail ([Inventory](../observe/inventory)) |
| `?agent=` | An agent's detail ([Agents](../observe/agents)) |
| `?interaction=` | A finding or interaction ([Findings & Interactions](../observe/findings-and-interactions)) |
| `?dashboard=` | A custom dashboard ([Dashboards](../observe/dashboards)) |
| `?workspace=` | An LLM Gateway application workspace |
| `?manage=` | An MCP Gateway management panel, such as the OneMCP endpoint or the Library |

Drawers link to each other. From a finding you can open the person, the app
in Inventory or the control that applied, and from a person you can jump to
their interactions.

## Export

**Export** on a list page exports the list you are looking at, with its
filters. Exports are collected in the
[Export Center](../settings-data/export-center), which is also where you
create recurring exports and download past runs.
