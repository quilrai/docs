---
sidebar_position: 3
sidebar_label: "Moving from Console V1"
sidebar_custom_props:
  icon: Route
description: "Ground rules, the three transition phases, and where to do what while both consoles run in parallel."
---

# Moving from Console V1

Both consoles run in parallel on the same data. Governance moves one
enforcement target at a time, and each move is reviewed, reversible and proven
before it enforces.

## Ground rules

- **Observe pages are safe from day one.** Overview, Costs & Savings, Graph, Findings
  & Interactions, Users, Inventory, Agents and Dashboards read the same data V1
  reads. Use them now; nothing in V1 changes.
- **Data is reflected in both places.** Applications, keys, servers, findings
  and interactions created or observed in either console appear in both. There
  is no import and no sync step.
- **Governance moves per target, not per console.** A target is governed either
  by its legacy settings or by the Policy Engine, never both. Switching one
  target changes nothing for the others.
- **Every switch starts with a review and can be turned off.** Conversion is
  previewed before anything changes, and activation locks the legacy settings.
  Disabling makes the legacy settings live again as they are stored at that
  moment. See [What happens to classic settings](../govern/switching-from-classic-settings#what-happens-to-classic-settings).

## Phase 1: the gateways

Start here. The LLM Gateway and MCP Gateway targets are the most mature: full
control surfaces, conversion review, simulation, replay and rollback.

1. **Tidy in V1 first.** Resolve duplicate application names and disable
   providers you no longer use.
2. **Set model prices.** Under **Settings > Models**, confirm input and output
   prices for every model you route to.
3. **Review the conversion, do not activate.** Read the generated rules and the
   scope-by-scope changes.
4. **Activate and change nothing.** Revision 1 is your current behaviour. Let
   it run for a few days.
5. **Repeat for MCP Gateway.** Tools, Guardrails, Token saving and Group & User
   Rules from each server arrive as sentences in the MCP Gateway cards.
6. **Add new controls on monitor**, then **replay before you enforce**.

Full detail is in
[Switching from classic settings](../govern/switching-from-classic-settings).

## Phase 2: the device sensors

Endpoint Agent and Browser Extension control sets are still undergoing minor
changes. Their data is already in V2: device status under Users, agentic
inventory under Agents and Inventory, interactions in the feed. Keep authoring
their controls where you do today, and do not use **Convert to Policy Engine**
on the Endpoint Agent tab yet, even if your console shows the button. Quilr will
confirm when they are settled.

## Phase 3: data, access and the last of V1

1. **Publish retention.** A published retention policy is enforced today as
   console visibility: data past its horizon is hidden in the console,
   including data collected before you published. Nothing is deleted from
   storage. See [Data retention](../settings-data/data-retention).
2. **Move exports and alerts.** Recreate recurring extracts as Export Center
   definitions and check that Slack, SIEM and webhook integrations show as
   installed.
3. **Optionally migrate access control.** Until you migrate, V1 roles still
   decide access and Roles & Permissions in V2 is read-only. **Review the
   migration** opens a wizard that previews the V2 roles it will create, who
   keeps access, who would be denied and any unmapped permissions. Activation
   is **permanent**: the tenant cannot return to V1 authorization, and anyone
   without an imported role is denied immediately. See
   [Roles and permissions](../settings-organization/roles-and-permissions#before-you-migrate).
4. **Retire V1 habits, not V1 data.** V1 remains available and reads the same
   data. Nothing needs exporting or copying.

## Where to do what during the transition

| Task | Before Phase 1 | After Phase 1 |
|---|---|---|
| Look at activity, findings, users, assets, cost | Either console, V2 recommended | Either console, V2 recommended |
| Create LLM apps, issue keys, add providers | Either console | Either console |
| Register MCP servers, connections, OneMCP | Either console | Either console |
| LLM guardrails, Guardian Agent, limits, routing, identity, token saving, Prompt Store enforcement | V1 or V2 settings | Govern, Policy Engine, LLM Gateway only |
| MCP tools, guardrails, token saving, group and user rules | V1 or V2 settings | Govern, Policy Engine, MCP Gateway only |
| Endpoint Agent and Browser Extension controls | Where you do today | Where you do today, until Phase 2 |
| Detection models | Either console | Either console, builder in V2 |
| Retention, exports, dashboards, skills, models catalog | V2 only | V2 only |

:::warning The one-way step, restated
Activating a gateway target can be turned off: disabling makes the legacy
settings live again as they are stored at that moment, including anything
saved through **Edit anyway** or the Management API since activation. What
does not carry back is the work you publish under the engine. It stays in
revision history and does not reappear on the legacy settings screens. Use the
engine's own rollback to undo a published change, and see
[What happens to classic settings](../govern/switching-from-classic-settings#what-happens-to-classic-settings) for every case. Access control
migration, by contrast, is permanent.
:::
