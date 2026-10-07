---
sidebar_position: 3
sidebar_label: "Alerts"
sidebar_custom_props:
  icon: Activity
description: "App-level and per-provider failure-rate alerts with email and webhook channels."
---

# Alerts

Get notified when an app's gateway calls fail above a threshold over a recent window.

Open the app's **Settings > Alerts** (under **Optimization & policy**). Alerts are off for new apps and stay app-managed when the Policy Engine is on.

![Alerts section with the App-level alert and Per-provider alert cards, each showing threshold, window, minimum requests, cooldown and Notify on recovery](/img/llm-gateway/ui/app-alerts.png)

## Alert types

| Type | Evaluates |
|------|-----------|
| **App-level alert** | Failure rate across the whole app, all providers combined. |
| **Per-provider alert** | Failure rate for each provider separately. Fires for any provider that breaches. |

Turn on either or both. Each card shows a plain-language summary of its rule, for example: "Alert when failures exceed 10% over the last 15 min, once at least 20 requests are in. Then wait 10 min before alerting again, and notify on recovery."

## Settings

| Setting | Default | Meaning |
|---------|---------|---------|
| **Failure-rate threshold** | 10 | Percentage of failed calls (0 to 100) that triggers the alert. |
| **Window (minutes)** | 15 | How far back the failure rate is measured. |
| **Minimum requests** | 20 | Calls needed in the window before the rule is evaluated, so a few early failures do not alert. |
| **Cooldown (minutes)** | 10 | Wait before alerting again for the same rule. |
| **Notify on recovery** | On | Send a follow-up when the failure rate drops back below the threshold. |

## Notification channels

Both alert types deliver to the same channels:

| Channel | How to set it |
|---------|---------------|
| **Alert emails** | Comma-separated recipient addresses. |
| **Webhooks** | **Add webhook** and paste the URL. Webhook URLs are encrypted at rest and used only for this app's alerts. |

Select **Save settings** to apply.

## Related

- [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) - limits that return `429` before a call reaches the provider.
- [Request Routing](../cost-and-traffic/routing-and-fallbacks) - spread traffic across providers so one failing provider does not stop the app.
