---
sidebar_position: 5
sidebar_label: "Performance and fairness"
sidebar_custom_props:
  icon: Gauge
description: "How Drift & Bias tracks a model's accuracy against its reference and checks each protected attribute for unfair outcomes."
aliases: [performance, degraded, fairness, four-fifths rule, equalized odds, selection rate, RMSE, F1]
---

# Performance and fairness

## Performance

Performance compares the reference window with the current one, using only rows that carried a label.

| Task | Metrics shown | Primary metric |
|---|---|---|
| Classification | **Accuracy**, **Precision**, **Recall**, **F1**, **ROC AUC** | **F1** (macro F1 for multiclass) |
| Regression | **MAE**, **RMSE**, **R²** | **RMSE** |

Each card shows the current value, the change against the reference and the **Reference** value.

Under the cards, a tolerance line explains the result, for example:

- *F1 +0.443 against the reference; degraded when it falls by more than 0.05. 2,400 labelled reference rows, 604 labelled current rows.*
- *RMSE -222.201 (-1.4%) against the reference; degraded when it rises by more than 5%.*

So for a classifier the tolerance is how far F1 may fall; for a regression it is how far RMSE may rise, relative to the reference. Past it, the model is **Degraded** and a finding opens. With no labelled rows, performance shows **No labels**. Set the tolerance in [Monitoring settings](./monitoring-settings.md).

## Fairness

Fairness looks at each protected attribute you registered, group by group, on the current window.

### Classifiers

For each attribute (for example `gender` or `age_band`), a table lists every group with its **Rows**, **Selection rate**, **True positive rate** and **False positive rate**. Next to it:

| Measure | Meaning |
|---|---|
| **Selection-rate difference** | Highest group's selection rate minus the lowest. |
| **Selection-rate ratio** | Lowest group's selection rate divided by the highest. |
| **Equal opportunity difference** | Largest gap in true positive rate between groups. |
| **Equalized odds difference** | Largest gap in true positive rate or false positive rate between groups. |

Two flags can appear on an attribute:

- **Selection-rate ratio:** the ratio fell below **Minimum selection-rate ratio** (default 0.8, the four-fifths rule).
- **Equalized odds:** the difference rose above **Maximum equalized odds difference** (default 0.1).

### Regressions

For each attribute, a table lists every group with its **Rows**, **Mean prediction** and **MAE**, next to the **Mean prediction gap** and **Error gap** between groups. The **Error** flag appears when groups differ too much. The **Maximum equalized odds difference** setting is also the regression tolerance between groups.

A flagged attribute marks the model **Fairness: Flagged** and opens a finding. Set both limits in [Monitoring settings](./monitoring-settings.md).
