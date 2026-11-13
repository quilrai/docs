---
sidebar_position: 1
sidebar_label: "Alerts"
sidebar_custom_props:
  icon: Webhook
description: "Set alert rules for each tested LLM and each ML model, and send the alerts to your integrations."
aliases: [alerts, alert rules, drift alert, fairness alert, Slack, Sentinel, Splunk, Datadog, webhook]
---

# Alerts

Open **Assessments** > **Drift & Bias** > **Alerts** to set alert rules for each tested LLM and each ML model.

## Where alerts go

Alerts go to the webhook, Slack, Microsoft Sentinel, Splunk and Datadog integrations that have **Red Teaming alerts** turned on in **Integrations**. Drift & Bias uses the same channels as Red Teaming. See [Splunk, Datadog and Slack](../../integrations/send-logs-and-alerts/splunk-datadog-and-slack.md), [Microsoft Sentinel](../../integrations/send-logs-and-alerts/microsoft-sentinel.md) and [Webhook](../../integrations/send-logs-and-alerts/webhook.md).

Each alert arrives as one event or log with the model, the rule that fired, the observed value and the limit.

## LLM alert rules

For each tested LLM, set a **Minimum bias-free score**, the **Largest drop from the baseline**, and whether to alert when a run fails or ends incomplete. A drop only alerts when the drift test says the change is real. Each finished run is checked against its model's rule, and the tab lists every alert raised with the value that set it off, the limit, and whether it was delivered.

## ML model alert rules

The **Alert rules** table lists every model with **Alert when** (its triggers, or **No alerts**) and **Changed**. Rules are checked each time a monitoring check of the model ends.

### Set alerts for an ML model

1. Select the model's row in the **Alert rules** table.
2. Choose the triggers:
   - **Data drift**
   - **Prediction drift**
   - **Performance degraded**
   - **Fairness flagged**
   - **Training run failed**
3. Under **Alert from**, choose **Moderate and up** or **Severe only**. A finding is moderate at the limit and severe well past it.
4. Select **Save**.

Each change is recorded in the [audit log](../../console/settings-organization/audit-logs.md).
