---
sidebar_position: 2
sidebar_label: "Export Center"
sidebar_custom_props:
  icon: FileText
---

# Export Center

One place to create, schedule and download exports of console data.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Data management', 'Export Center']} action="Create export" />

## Quick exports

Ready-made Excel admin reports. Pick a period and download.

| Report | Report |
|---|---|
| User app usage | Cost and performance |
| User sensor activity | Ownership and approvals |
| User activity summary | Risk and findings |
| User topics | Findings review |
| App and asset activity | Interaction activity |
| Audit trail | |

## Custom and scheduled exports

Select **Create export** to define your own export and, optionally, a schedule. The **Exports** table lists each export with its **Schedule**, **Next run** and **State**.

## Run history

Every run is listed with its status, row count and size, and a download link. Select **Mark read** to clear new-export notifications.

:::note
Exports are a snapshot. A file you downloaded or that is still listed in run history can contain data that [Data retention](./data-retention) now hides in the console.
:::

## Related

- [Data retention](./data-retention)
- [Audit logs](../settings-organization/audit-logs)
