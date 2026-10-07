---
sidebar_position: 1
sidebar_label: "Data retention"
sidebar_custom_props:
  icon: CalendarDays
description: "How Data Retention deletes data once it passes the retention period, where it applies across the console, and how to set, publish and verify a retention policy."
---

# Data retention

Data Retention sets how long LLM Gateway, MCP Gateway and OpenAI Compliance data is kept. Data past its retention period is deleted. You set a default horizon for each kind of data, then add ordered rules for traffic that needs a different horizon.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Data management', 'Data Retention']} />

:::note What retention does
- **Deletes data past its retention period.** Once data passes its horizon, it is removed from the console and deleted.
- **Applies to existing data.** The horizon is measured from each event's time, so data collected before you published is covered too.
- **Applies across the console**: [Overview](../observe/overview), [Costs & Savings](../observe/costs-and-savings), [Graph](../observe/graph), [Users](../observe/users), [Findings & Interactions](../observe/findings-and-interactions), [dashboards](../observe/dashboards) and [Export Center](./export-center) exports created afterwards.
- **Files already downloaded are not affected.**
:::

## Summary tiles

| Tile | Shows |
|---|---|
| **In force** | The live revision, when it was published (or **Baseline policy**), and its state: **Enforcing**, or **Applying policy** while console services load a newly published revision |
| **Draft** | Changes staged but not yet published |
| **Rules** | How many ordered rules exist, plus the default |

Like the Policy Engine, retention uses a shared draft: edits are staged, and publishing creates the next revision.

## Default horizon

How long each kind of data is kept when no rule matches. Each kind has its own duration, from 30 days up to 10 years.

| Data kind | Covers |
|---|---|
| Activity metadata | Who, what app, when |
| Identity | User identity details |
| Request content | What was sent to the model or tool |
| Response content | What came back |
| Finding summary | The finding record |
| Finding evidence | The content that triggered a finding |
| Diagnostics | Technical diagnostics |
| Derived insights | Analytics computed from the data |

Shortening the horizon for **Request content** and **Response content** while keeping **Activity metadata** longer is a common way to keep usage trends without keeping prompt text.

## Ordered rules

Rules give specific traffic a different horizon. An event takes the **first rule that matches**; whatever is left falls to the default.

- **Add rule** to create one. Order matters, so put the most specific rules first.
- The default rule, **Everything else**, cannot be removed. It catches every event no rule above claimed. It has a **Preset** (for example **Full activity**) and a duration per data kind.

## Review and publish

Edits are staged in a draft. The **Review and publish** section shows what is staged, for example "Publishing draft 4 replaces revision 3 everywhere in the console".

1. **Save draft** to stage your edits. You must save before you can preview or publish.
2. **Validate** checks the draft for errors.
3. **Preview impact** shows, per data kind, how many events and characters the draft would affect and their share of the total.
4. **Publish** makes the draft the live revision. Publishing applies the policy to everything already collected, not just to new data.

### Verify a published policy

1. Wait until the **In force** tile shows the new revision with **Enforcing** rather than **Applying policy**.
2. Open [Findings & Interactions](../observe/findings-and-interactions) and look at an LLM or MCP interaction older than the horizon you shortened. The data kinds you shortened, for example request content, should no longer be shown.
3. Compare with **Preview impact**, which estimated how many events each data kind would affect.

**Discard draft** drops the staged changes and keeps the live revision.

## History

**Published revisions** lists every revision with its number, publish time, rule count and who published it. The live revision is marked **Enforcing**. The first entry may show **Baseline** instead of a time. History records configuration, actor and time only, never the data itself. There is no one-click rollback: to go back, edit the draft to match an earlier revision and publish it.

## What retention does and does not affect

| | Affected | Not affected |
|---|---|---|
| Data | LLM Gateway, MCP Gateway and OpenAI Compliance events | Other sources, such as Browser Extension and Endpoint Agent interactions |
| Where | Overview, Costs & Savings, Graph, Users, Findings & Interactions, dashboards, and exports created afterwards | Files already downloaded |
| Storage | Data past its retention period is deleted | |
| Time | Existing and new data, measured from each event's time | |

:::warning
Files you already downloaded are not affected. Handle them under your own retention process when they must follow the new policy.
:::

## Related

- [Export Center](./export-center)
- [Data sources](../settings-organization/data-sources)
