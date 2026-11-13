---
sidebar_position: 1
sidebar_label: "From your pipeline"
sidebar_custom_props:
  icon: Webhook
description: "Register a classic ML model and send its scored rows to Drift & Bias from your own pipeline."
aliases: [add model, register model, pipeline push, scored rows, reference rows, current rows]
---

# Connect a model from your pipeline

Your pipeline registers the model once, then sends the rows it scores. Only scored rows and metadata arrive; the model itself is never uploaded. Once the model is registered it appears on the **ML models** tab and its checks run every 6 hours (see [How checks run](../get-started/how-checks-run.md)).

## Before you begin

- An app in the LLM Gateway, and that app's **Quilr API key**. Every call carries this key.
- A **model key**: the short name the model is known by in Drift & Bias, for example `churn-model`. It appears under the model name on the **ML models** tab.
- The model's task, its feature schema and the protected attributes you want fairness checked on.

To see these steps in the console, open **Assessments** > **Drift & Bias** > **ML models** and select **Add model**.

## Step 1: Register the model

`POST /v1/ml/models/{model_key}/register` with the model version, task, feature schema and protected attributes.

Register again when you ship a new version. A new version gets its own reference window (see [Baselines](../alerts-baselines-and-export/baselines.md)).

## Step 2: Send scored rows

`POST /v1/ml/models/{model_key}/rows` with each batch of scored rows, up to 5,000 rows a call. Each call names a window:

- `reference` rows: send once. These are what later rows are compared against.
- `current` rows: send as the model scores.

If you never send reference rows, the model's first 7 days of scored rows become its reference.

The start of a rows request, as the console shows it:

```http
POST /v1/ml/models/credit-risk/rows
Authorization: Bearer <your app's Quilr API key>

{
  "modelVersion": "v3",
  "window": "current",
  "rows": [
    {
      "rowId": "r-1042",
      "features": { "age": 41, "region": "north" },
      "prediction": 0.73,
      ...
```

Select **Copy example** in the **Add an ML model** panel to copy a complete request body to start from.

:::tip
Give every row a stable `rowId`. You use it later to [explain a single prediction](../monitor-ml-models/explanations-and-training.md#explain-a-prediction). Performance and fairness that depend on outcomes are computed only on rows that carry a label.
:::

## Step 3 (optional): Send datasets and training runs

Send dataset versions to `/datasets` and training runs to `/training-runs`. They add:

- **Lineage** on the model page: version, training run and dataset versions.
- **Explanations**: feature importance per version.
- **Training runs**, including failed retraining runs and their errors.

## Next steps

- [ML models tab](../monitor-ml-models/ml-models-tab.md)
- [Monitoring settings](../monitor-ml-models/monitoring-settings.md)
