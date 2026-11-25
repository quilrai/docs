---
sidebar_position: 3
sidebar_label: "Moving from Console V1"
sidebar_custom_props:
  icon: Route
description: "Ground rules, the three transition phases, and where to do what while both consoles run in parallel."
---

# Moving from Console V1

Both consoles run in parallel on the same data. Governance moves one
enforcement target at a time. The ground rules below say how each move is
reviewed and how it can be reversed.

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
- **Gateway switches are previewed and can be turned off.** For the LLM
  Gateway and MCP Gateway, conversion is previewed before anything changes.
  While the engine is on, the governed settings sections in Console V2 are
  locked, though **Edit anyway** still saves them; the Console V1 settings
  screens are not locked. Disabling makes the legacy settings live again as
  they are stored at that moment. See [What happens to classic settings](../govern/switching-from-classic-settings#what-happens-to-classic-settings).
- **Endpoint Agent works differently.** Turn on shows no preview, and your
  previous Endpoint settings stay editable while the converted version runs.
  Turn off is not always available: when it is not, the console says why,
  and **Pause enforcement** still stops blocking. See [Phase 2](#phase-2-the-device-sensors).

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
5. **Repeat for MCP Gateway.** Tools, Guardrails, Token saving, Tool list and
   Group & User Rules from each server arrive as sentences in the MCP Gateway cards.
6. **Add new controls on monitor**, then **replay before you enforce**.

Full detail is in
[Switching from classic settings](../govern/switching-from-classic-settings).

## Phase 2: the device sensors

Endpoint Agent and Browser Extension data is already in V2: device status under
Users, agentic inventory under Agents and Inventory, interactions in the feed.

- **Endpoint Agent.** Select **Turn on** under **Govern > Policy Engine >
  Endpoint Agent**. Turn on converts your previous Endpoint settings into
  policies, which then decide on devices. Unlike the gateways, it shows no
  conversion preview first: review the new version in **History** afterwards.
  See [Turn on, turn off and pause](../../endpoint-agent/policy-engine/turn-on-off-and-pause).
- **Detection Policy.** If your organization uses Detection Policy in Console
  V1, Turn on is refused while it is on, because its rules are not converted.
  Neither console has a control to switch Detection Policy off; contact
  QuilrAI support. Switching it off does not convert its rules either: they
  stop applying, and no policies are created from them. Your previous
  Endpoint settings then decide on devices straight away, in place of those
  rules, and Turn on converts them into policies that decide too, so people
  can see blocks or warnings they did not see before. Until it is switched
  off, Detection Policy keeps deciding, and you manage its rules in Console V1
  under **Settings > Detection Policy**.
- **Browser Extension.** Its controls are the same controls in both consoles.
  Manage them in Console V1 or in the Policy Engine; see
  [Browser Extension policy engine](../../browser-extension/policy-engine/overview)
  for where. There is no conversion step.

## Phase 3: data, access and the last of V1

1. **Publish retention.** A published retention policy deletes data once it
   passes the retention period, including data collected before you
   published, across the console and in exports created afterwards. Files
   already downloaded are not affected. See
   [Data retention](../settings-data/data-retention).
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
| Endpoint Agent controls | Console V1 settings until you turn on the Policy Engine for Endpoint Agent, then Govern, Policy Engine, Endpoint Agent. While the converted version runs, changes to the Console V1 settings update it; after that, make changes in the Policy Engine. See [Changing previous Endpoint settings](../../endpoint-agent/policy-engine/turn-on-off-and-pause#changing-previous-endpoint-settings-while-the-policy-engine-is-on) | Same |
| Browser Extension controls | Either console | Either console |
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
