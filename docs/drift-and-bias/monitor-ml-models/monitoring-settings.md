---
sidebar_position: 7
sidebar_label: "Monitoring settings"
sidebar_custom_props:
  icon: Wrench
description: "Set the current window, drift limits, performance tolerance and fairness limits for one ML model."
aliases: [monitoring settings, thresholds, limits, PSI limit, performance tolerance, four-fifths rule, current window]
---

# Monitoring settings

Each model has its own limits. Open the model's page and select **Settings**.

![Monitoring settings panel with the current window, drift limits, performance tolerance and fairness limits](/img/drift-and-bias/11-monitoring-settings.jpg)

*Figure 1. Monitoring settings for one model.*

The next check uses these values. Thresholds apply to the model's features, prediction, primary metric and protected attributes. Until you save, the panel says **Using the defaults; not saved yet**.

| Setting | Default | What it does |
|---|---|---|
| **Current window** | **Last 7 days** | The trailing window compared with the reference. |
| **Moderate drift (PSI)** | 0.1 | PSI at or above this marks a feature as moderate drift. |
| **Severe drift (PSI)** | 0.25 | PSI at or above this marks a feature as severe drift. |
| **Performance tolerance** | 0.05 | How much the primary metric (F1, macro F1 or RMSE) may worsen before the model is degraded. |
| **Minimum selection-rate ratio** | 0.8 | Flag an attribute when the lowest group's selection rate divided by the highest falls below this. 0.8 is the four-fifths rule. |
| **Maximum equalized odds difference** | 0.1 | Flag an attribute when the equalized odds difference is above this. Also the regression tolerance between groups. |

Select **Save**. A settings change also makes the model due for its next scheduled check (see [How checks run](../get-started/how-checks-run.md)).

See [Drift](./drift.md) and [Performance and fairness](./performance-and-fairness.md) for how each limit is applied.
