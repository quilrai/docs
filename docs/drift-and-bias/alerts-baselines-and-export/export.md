---
sidebar_position: 3
sidebar_label: "Export"
sidebar_custom_props:
  icon: FileText
description: "Export every ML model check, one row per check, from Export Center."
aliases: [export, ML model monitoring export, export center, download checks]
---

# Export ML model checks

The **ML model monitoring** source in Export Center lists the checks of your classic ML models started in the selected period, one row per check, with its drift, performance and fairness outcome.

:::note
Exports hold aggregates only. Pushed rows, predictions and labels are not included.
:::

## Create the export

![Create ML model monitoring export with the source, query and fields steps and the draft manifest](/img/drift-and-bias/14-export.jpg)

*Figure 1. Creating an ML model monitoring export.*

1. Select **Export** on the **ML models** or **Baselines** tab. Export Center opens **Create ML model monitoring export** with **ML model monitoring** already chosen as the **Source**. You can also start from **Settings** > **Data management** > **Export Center** > **Create export**.
2. Work through the steps. The **Draft manifest** on the right summarizes each one:
   - **01 Source:** **Export name** and **Source**.
   - **02 Query:** the **Period** (for example **Last 30 days**), **Search** and **Conditions**. Records must match every condition; OR, NOT and nested groups are not supported.
   - **03 Fields:** choose the fields and arrange their **Output order**.
   - **04 Delivery:** format and schedule.
   - **05 Review:** preview the draft.
3. Select **Create export**. It is enabled once you preview the current draft.

See [Export Center](../../console/settings-data/export-center.md) for delivery formats, schedules and limits.

## Export LLM runs

The **Drift & Bias runs** source exports one row per LLM run: its model, question set, status, bias-free score and interval, baseline comparison, drift result and each group's results. Filter by status, question set, model, baseline or drift. Replies to the test questions are never exported.
