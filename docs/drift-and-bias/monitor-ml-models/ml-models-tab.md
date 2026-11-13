---
sidebar_position: 2
sidebar_label: "ML models tab"
sidebar_custom_props:
  icon: ListChecks
description: "Every classic ML model on one list, with its source, latest check and drift, performance and fairness status."
aliases: [ML models, model list, check all, add model, drifting, degraded, fairness flagged]
---

# ML models tab

Open **Assessments** > **Drift & Bias** > **ML models** to see every classic model on one list.

## Actions

| Button | What it does |
|---|---|
| **Export** | Opens a new ML model monitoring export in Export Center. See [Export](../alerts-baselines-and-export/export.md). |
| **Add model** | Shows both ways to connect a model: [from your pipeline](../connect-models/pipeline-push.md) or [from MLflow](../connect-models/mlflow.md). |
| **Check all** | Runs a check on every model now. See [How checks run](../get-started/how-checks-run.md). |

## Headline counts

| Card | Counts |
|---|---|
| **ML models** | Classic models known from a pipeline push or MLflow. LLMs are tested by runs instead. |
| **Drifting** | Models with data or prediction drift in the latest check. |
| **Degraded** | Models whose primary metric worsened past its tolerance. |
| **Fairness flagged** | Models where a group fell outside the fairness limits. |
| **Open findings** | Open findings across every model. |

## The model table

| Column | Shows |
|---|---|
| **Model** | Name and model key. Select a model to open its [model page](./model-page.md). |
| **Source** | **Pipeline**, **MLflow** or **Pipeline + MLflow**. |
| **Task** | For example **Binary classification** or **Regression**. |
| **Latest version** | The newest version, and how many versions are tracked. |
| **Last checked** | When the latest check ran, or **Not yet**. |
| **Drift** | Two badges: **Data** and **Prediction**, each **Stable**, **Moderate**, **Severe** or **Not checked**. |
| **Performance** | **Holding**, **Degraded** or **No labels**. |
| **Fairness** | **Flagged**, or **Not checked**. |
| **Open findings** | The model's open findings. |

The drift levels come from your PSI limits; **Degraded** comes from the performance tolerance; **Flagged** comes from the fairness limits. All three are set per model in [Monitoring settings](./monitoring-settings.md).
