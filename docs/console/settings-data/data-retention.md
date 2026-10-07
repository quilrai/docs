---
sidebar_position: 1
sidebar_label: "Data retention"
sidebar_custom_props:
  icon: CalendarDays
description: "What Data Retention enforces today (console visibility, not deletion), which data it covers, and how to set, publish and verify a retention policy."
---

# Data retention

Data Retention sets how long LLM Gateway, MCP Gateway and OpenAI Compliance data stays visible in the console. You set a default horizon for each kind of data, then add ordered rules for traffic that needs a different horizon.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Data management', 'Data Retention']} />

:::note What retention does today
- **Enforced as visibility, not deletion.** A published policy hides data past its horizon in the console. Nothing is deleted from storage, so retention is not a purge or a storage-deletion control.
- **Applies to existing data.** The horizon is measured from each event's time, so data collected before you published is hidden too.
- **Covers LLM Gateway, MCP Gateway and OpenAI Compliance data**, in [Findings & Interactions](../observe/findings-and-interactions), custom [dashboards](../observe/dashboards) and new [Export Center](./export-center) runs.
- **Earlier export files are not changed.** Exports finished before you published can still contain data the policy now hides.
:::

## Summary tiles

| Tile | Shows |
|---|---|
| **In force** | The live revision, when it was published (or **Baseline policy**), and its state: **Enforcing**, or **Applying policy** while console services load a newly published revision |
| **Draft** | Changes staged but not yet published |
| **Rules** | How many ordered rules exist, plus the default |

Like the Policy Engine, retention uses a shared draft: edits are staged, and publishing creates the next revision.

## Default horizon

How long each kind of data stays visible when no rule matches. Each kind has its own duration, from 30 days up to 10 years.

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
3. **Preview impact** shows, per data kind, how many events and characters the draft would hide and their share of the total.
4. **Publish** makes the draft the live revision. Publishing applies the policy to everything already collected, not just to new data.

### Verify a published policy

1. Wait until the **In force** tile shows the new revision with **Enforcing** rather than **Applying policy**.
2. Open [Findings & Interactions](../observe/findings-and-interactions) and look at an LLM or MCP interaction older than the horizon you shortened. The data kinds you shortened, for example request content, should no longer be shown.
3. Compare with **Preview impact**, which estimated how many events each data kind would hide.

**Discard draft** drops the staged changes and keeps the live revision.

## History

**Published revisions** lists every revision with its number, publish time, rule count and who published it. The live revision is marked **Enforcing**. The first entry may show **Baseline** instead of a time. History records configuration, actor and time only, never the data itself. There is no one-click rollback: to go back, edit the draft to match an earlier revision and publish it.

## What retention does and does not affect

| | Affected | Not affected |
|---|---|---|
| Data | LLM Gateway, MCP Gateway and OpenAI Compliance events | Other sources, such as Browser Extension and Endpoint Agent interactions |
| Where | Findings & Interactions, custom dashboards, new exports | Export files that already finished |
| Storage | Nothing is deleted; data is hidden in the console | |
| Time | Existing and new data, measured from each event's time | |

:::warning
Exports finished earlier stay downloadable and can still contain data that the retention policy now hides. Review older exports in the [Export Center](./export-center) when they must follow the new policy.
:::

If you need data physically deleted, for example for a regulatory deletion request, retention does not do that today. Ask your QuilrAI representative.

## Related

- [Export Center](./export-center)
- [Data sources](../settings-organization/data-sources)
