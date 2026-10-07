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

Select **Create export** to build your own export. The builder has five numbered steps, summarized in a rail on the right:

| Step | What you set |
|---|---|
| **01 Source** | **Export name** and **Source**: **Inventory**, **Users**, **Audit logs**, **Findings**, **Interactions** or **Policy Engine**. The source cannot be changed after the export is created. |
| **02 Query** | The period, search and visual conditions that choose matching records. Policy Engine exports always capture the current policies. |
| **03 Fields** | The fields to include. Conversation content in Findings and Interactions exports needs a role that may export content; other fields stay available without it. |
| **04 Delivery** | **Format**: **JSONL** (line-delimited JSON for pipelines and scripts) or **Excel workbook**. **Schedule**: **One time**, **Daily**, **Weekly** or **Monthly**, with **Timezone** (IANA, for example America/New_York), **Weekday** or **Day of month** (1 to 28), **Hour** and **Minute**. **Notify me in the console** shows an in-app notification when a run completes or fails. |
| **05 Review** | **Preview export** samples up to 10 records and checks the run limit. A workbook is limited to 100,000 rows across all sheets and 256 MiB. |

**Create export** is enabled once the current draft has been previewed. A custom absolute period can run only once, and Policy Engine exports are one time only.

**Example:** a weekly JSONL feed of findings for a SIEM pipeline. Source **Findings**, period **Last 7 days**, the fields your pipeline needs, format **JSONL**, schedule **Weekly** on **Monday** at 09:00 in your timezone. Preview, then **Create export**.

### Manage an export

The **Exports** table lists each export with its **Schedule**, **Next run** and **State** (**Active**, **Paused** or **Archived**). Exports shared with you are tagged **Shared with you**. Row actions:

- **Edit export** - change the query, fields and delivery (not the source).
- **Run now** - queue an extra run.
- **Pause export** / **Resume export** - stop or restart the schedule.
- **Archive export** / **Unarchive**.
- **Share export** - choose **People** (active platform users in this organization) and **Smart Groups**. Recipients can view the run history and download available files, but cannot edit, rerun, archive, delete or reshare the export. Smart Group access follows current membership. Removing everyone makes the export private again.

## Run history

Every run is listed with its status, row count and size, and a download link. **Delete export run** deletes a finished run and its file. Select **Mark read** to clear new-export notifications.

:::note
Exports are a snapshot. Exports created after a [Data retention](./data-retention) policy is published follow it; files you already downloaded are not affected.
:::

## Related

- [Data retention](./data-retention)
- [Audit logs](../settings-organization/audit-logs)
