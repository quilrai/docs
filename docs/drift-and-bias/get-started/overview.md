---
sidebar_position: 1
sidebar_label: "About Drift & Bias"
sidebar_custom_props:
  icon: Scale
description: "What Drift & Bias monitors for your LLMs and classic ML models, and where to find it in the console."
aliases: [drift, bias, model monitoring, ML monitoring, fairness, data drift]
---

# About Drift & Bias

Drift & Bias tells you whether your models still behave the way they did when you approved them. It covers two kinds of model side by side:

- **Text models (LLMs):** how text models from your model library treat gender, race and ethnicity, and age, and whether that changes from run to run. Each run reports a **bias-free score**, the share of replies without biased opinions.
- **Classic ML models:** classifiers and regressions you run in your own pipelines, checked on their own scored rows for drift, performance and fairness.

In the console, open **Assessments** > **Drift & Bias**. It sits next to [Red Teaming](/red-teaming).

## The tabs

| Tab | What it shows |
|---|---|
| **Overview** | Two sections: **01 Text models** (the LLM bias heatmap) and **02 Classic models** (headline counts for your ML models). See [Overview tab](../monitor-ml-models/overview-tab.md). |
| **ML models** | Every classic model on one list, with its source, task, latest version and drift, performance and fairness status. See [ML models tab](../monitor-ml-models/ml-models-tab.md). |
| **LLM runs** | The runs behind the LLM bias heatmap. |
| **Baselines** | What each LLM series and each ML model version is compared against. See [Baselines](../alerts-baselines-and-export/baselines.md). |
| **Alerts** | Alert rules for each tested LLM and each ML model. See [Alerts](../alerts-baselines-and-export/alerts.md). |

## What it checks on a classic ML model

| Area | What you get |
|---|---|
| **Drift** | PSI on every feature and on the prediction, plus a KS test for numeric features and Jensen-Shannon distance for categorical ones. See [Drift](../monitor-ml-models/drift.md). |
| **Performance** | Accuracy, precision, recall, F1 and ROC AUC for classifiers; MAE, RMSE and R² for regressions, each against the reference. See [Performance and fairness](../monitor-ml-models/performance-and-fairness.md). |
| **Fairness** | For each protected attribute, group-by-group rates checked against the four-fifths rule and an equalized odds limit (mean prediction and error gaps for regressions). |
| **Explanations** | Global feature importance and how each feature's rank moved since the last version, plus the attributions behind one scored row. See [Explanations and training](../monitor-ml-models/explanations-and-training.md). |
| **Lineage** | Model version, the training run that produced it and the dataset versions it learned from. |

## Your model stays with you

QuilrAI never holds the model itself. It learns about a model from one of two sources:

- **Pipeline push:** your pipeline registers the model and sends scored rows and metadata. See [Connect from your pipeline](../connect-models/pipeline-push.md).
- **MLflow:** QuilrAI reads registered models, versions, runs, dataset inputs and feature importance from an MLflow tracking server or Databricks workspace you connect. Model files and datasets are never downloaded. See [Connect an MLflow registry](../connect-models/mlflow.md).

Exports from Drift & Bias contain check results only. Pushed rows, predictions and labels are never included.

## What's new

Drift & Bias changes are listed in the [Red Teaming changelog](../../red-teaming/release-notes/changelog.md).

## Next steps

- [How checks run](./how-checks-run.md)
- [Connect a model from your pipeline](../connect-models/pipeline-push.md)
