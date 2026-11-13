---
sidebar_position: 6
sidebar_label: "Explanations and training"
sidebar_custom_props:
  icon: Sparkles
description: "See what drives a classic ML model, how it was trained, and why it made one prediction."
aliases: [explanations, feature importance, attributions, training runs, explain a prediction, row id]
---

# Explanations and training

## Explanations

Global feature importance as reported for the latest version, and how each feature moved since the version before.

**Top features** lists the features by weight. The header names the version, the version its ranks are compared against and the method, as your pipeline or MLflow reported it (for example `method: gain`). Each feature shows:

- Its rank and weight.
- A rank change badge, such as **Up 1** or **Down 1**, since the previous version.
- Its previous rank, for example `was #3`.

The first version has no earlier version to compare, so no rank changes are shown.

## Training runs

Every training run for the model, newest first: **Run**, **Version**, **Dataset version**, **Status**, **Metrics** (for example `f1 0.840 · auc 0.920`) and **Started**.

A failed retraining run stays in the list with its error next to the **failed** status, for example `failed OutOfMemoryError`. A failed run can also raise an alert (see [Alerts](../alerts-baselines-and-export/alerts.md)).

## Explain a prediction

Look up one scored row to see its features, its prediction and the attributions behind it.

1. On the model page, go to **Explain a prediction**.
2. Enter the **Row id** your pipeline sent with the row.
3. Select **Look up**.

You see:

| Panel | Shows |
|---|---|
| **Prediction** | The **Row**, when it was **Scored**, the **Prediction**, the **Predicted label**, the actual **Label** and the row's protected attributes. |
| **Features** | The inputs the model scored. |
| **Why this prediction** | Each feature's contribution to this prediction, as your pipeline sent it: its size, and whether it raised or lowered the prediction. |
