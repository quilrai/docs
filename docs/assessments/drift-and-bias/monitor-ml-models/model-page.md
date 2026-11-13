---
sidebar_position: 3
sidebar_label: "Model page"
sidebar_custom_props:
  icon: BrainCircuit
description: "What a classic ML model's page shows: status, lineage, check history and open findings."
aliases: [model page, lineage, check history, open findings, check now, model card]
---

# Model page

Select a model on the [ML models tab](./ml-models-tab.md) to open its page. From top to bottom it shows:

1. [Status and actions](#status-and-actions)
2. [Lineage](#lineage)
3. [Data drift and prediction drift](./drift.md)
4. [Performance and fairness](./performance-and-fairness.md)
5. [Explanations and training runs](./explanations-and-training.md)
6. [Check history](#check-history) and [open findings](#open-findings)
7. [Explain a prediction](./explanations-and-training.md#explain-a-prediction)

## Status and actions

Under the model name you see its key, task, version and when it was last checked, then a line of badges from the latest check: the source, **Data** and **Prediction** drift, **Performance** and **Fairness**.

| Button | What it does |
|---|---|
| **Check now** | Runs a check of this model at once. See [How checks run](../get-started/how-checks-run.md). |
| **Model card** | Opens the card for this ML model, with **Download Markdown** and **Save as PDF**. Each download is recorded in the audit log. |
| **Settings** | Opens [Monitoring settings](./monitoring-settings.md) for this model. |

## Lineage

The latest version, the run that trained it and the dataset versions it learned from, left to right: **Model version** > **Training run** > **Dataset version** (one card per dataset version). Each card shows where it came from, for example **Pipeline**.

Lineage appears when your pipeline sends training runs and dataset versions, or when the model comes from MLflow.

## Check history

Every check of the model, newest first, and how its primary metric and worst drift moved.

- **Primary metric trend** (for example **F1** or **RMSE**): the current window over the last labelled checks.
- **Worst feature PSI**: the largest PSI of any feature, over the last checks.
- **The check table:** **Started**, **Version**, **Status**, **Rows (ref / now)** and **Outcome** (the drift, performance and fairness badges for that check). Scheduled and manual checks are listed alike.

## Open findings

What the checks are still seeing. Each finding shows its **Severity** (**Moderate** or **Severe**), **Kind** (for example **Data drift**, **Prediction drift** or **Fairness**), the **Finding** with its value and limit (for example `plan: PSI 0.604, limit 0.10`), **Opened** and **Last seen**.

A finding closes on the first check that no longer sees it.
