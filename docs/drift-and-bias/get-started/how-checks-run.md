---
sidebar_position: 2
sidebar_label: "How checks run"
sidebar_custom_props:
  icon: CalendarClock
description: "When Drift & Bias checks your ML models, when it skips a check, and how long check data is kept."
aliases: [schedule, check now, check all, monitoring check, retention]
---

# How checks run

A **check** reads a model's reference window and current window, computes drift, performance and fairness, updates the model's open findings and sends any alerts.

## Every 6 hours, only when something changed

Drift & Bias plans a check of every registered model every 6 hours. A model is skipped for that period when all of these are true:

- Its last check finished less than 24 hours ago.
- Its [monitoring settings](../monitor-ml-models/monitoring-settings.md) have not changed since that check started.
- No new rows, training runs or registrations have arrived.
- Nothing changed in MLflow (no new run or version).

A skipped check reads and stores nothing. If anything changed, the check runs in full.

Every model is still checked at least once a day.

## Run a check now

You do not have to wait for the schedule:

- **Check now** on a model page checks that model.
- **Check all** on the **ML models** tab checks every model.

Manual checks always run, even when nothing changed. They appear in the model's **Check history** next to scheduled ones.

## How long data is kept

| Data | Kept for |
|---|---|
| Checks (results and history) | 180 days |
| Current-window rows your pipeline sent | 90 days |

A model's latest check, and any check behind an open finding, are always kept.

## Next steps

- [Connect a model from your pipeline](../connect-models/pipeline-push.md)
- [Monitoring settings](../monitor-ml-models/monitoring-settings.md)
