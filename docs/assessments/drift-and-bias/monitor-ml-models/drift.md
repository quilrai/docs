---
sidebar_position: 4
sidebar_label: "Drift"
sidebar_custom_props:
  icon: TrendingUp
description: "How Drift & Bias measures data drift on every feature and prediction drift on the model's output."
aliases: [data drift, prediction drift, PSI, KS test, Jensen-Shannon, population stability index]
---

# Drift

Drift compares each feature's **current window** with its **reference**. The reference is set per model version (see [Baselines](../alerts-baselines-and-export/baselines.md)); the length of the current window is set in [Monitoring settings](./monitoring-settings.md).

## Data drift

One row per feature:

| Column | Meaning |
|---|---|
| **Feature** | The feature name from the model's schema. |
| **Kind** | **Numeric** or **Categorical**. |
| **PSI** | Population stability index. This is the value judged against your drift limits. |
| **KS D** and **KS p** | Kolmogorov-Smirnov test statistic and p-value. Numeric features only. |
| **JS distance** | Jensen-Shannon distance. Categorical features only. |
| **Values (ref / now)** | How many values the reference and current windows held. |
| **Status** | **Stable**, **Moderate** or **Severe**. |

## Prediction drift

The same tests over the model's prediction or predicted label, in one row named **Prediction**.

## How the status is set

Only PSI sets the status. With the default limits:

| PSI | Status |
|---|---|
| Below 0.1 | **Stable** |
| 0.1 or more | **Moderate** |
| 0.25 or more | **Severe** |

Change the limits for a model with **Moderate drift (PSI)** and **Severe drift (PSI)** in [Monitoring settings](./monitoring-settings.md). Each drifting feature, and drifting predictions, open a finding on the [model page](./model-page.md#open-findings).
