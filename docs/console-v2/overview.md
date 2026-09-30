---
sidebar_position: 1
sidebar_custom_props:
  icon: LayoutGrid
---

# What Changed in Console V2

V1 was organised around the sensors. V2 is organised around what you manage.

## Sensors are evidence, not navigation

V1 gave each sensor - LLM Gateway, MCP Gateway, Endpoint Agent, Browser
Extension - its own screens, its own activity view and its own settings. To
answer "what is this person doing with AI?" you visited four places.

V2 turns that around. The console is organised by what you manage: people,
applications, interactions and controls. Every row in every list carries an
**Observed via** mark naming the sensors that saw it, and every list can be
filtered by sensor. The sensors keep one home each under Settings for
deployment and operation, and one home each under Govern for enforcement.

## Three groups in the sidebar

| Group | Contains |
|---|---|
| Observe | Overview, Costs & Savings, Graph, Findings & Interactions, Users, Inventory, Agents, Dashboards |
| Govern | Policy Engine, Detection Models |
| Red Teaming | Assessments |
| Settings | AI Gateway (LLM Gateway, MCP Gateway, Models, Skills Library), Sensors (Endpoint Agent, Browser Extension, User Interaction Hub), Integrations, Organization, Data Settings |

## One policy engine, two enforcement targets

In V1, controls lived in the settings of each application or server. In V2 the
**Policy Engine** under Govern holds one versioned policy document per
enforcement target, authored as sentences, published as immutable revisions,
and proven by simulation and replay before they take effect.

See the [Policy Engine](../policy-engine/overview) section for the complete
guide.

:::note Same data, both consoles
V1 and V2 read the same tenant data. An application created in either console,
a request logged through any gateway, a finding raised by any sensor: all of it
appears in both places. You can open V2 today for every Observe page without
changing anything in V1. The only things that move one way are the governance
targets you deliberately switch to the Policy Engine.
:::

## Where to go next

- [Console sections](./console-sections) - what is on each page
- [Transition plan](./transition-plan) - the order in which to move across
