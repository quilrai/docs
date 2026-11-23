---
sidebar_position: 3
sidebar_label: "Alerts"
sidebar_custom_props:
  icon: Activity
description: "App-level and per-provider failure-rate alerts with email and webhook channels, and API key expiry warnings sent to the app's webhooks."
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

## Key expiry warnings

The app's webhooks also get a warning when one of its Quilr keys is close to expiring, at **120, 90, 60 and 30 days** before the expiry. Nothing to turn on: any webhook in **Notification channels** gets them, even with both alert types off. Alert emails are not used for these warnings.

- Each key gets one message per warning point, sent to every webhook of the app. It is not repeated while the key stays at that point.
- If a key is created or changed with less time left, only the current warning is sent. For example, a key set to expire in 20 days gets the 30-day warning only.
- Changing a key's expiry starts its warnings again for the new date.
- Revoked and expired keys, and keys with no expiry, get no warning.
- An app with no webhook gets no message; a webhook added later still gets the current warning.
- The key value is never sent.

Slack webhooks get a formatted message. Other webhooks get a JSON `POST`:

```json
{
  "text": "API key expiry warning: key 'Production' of LLM Gateway app 'support-bot' expires in 20 days (2026-12-13, 30-day warning). Create a new key and switch the application to it before then, or requests with this key will be rejected.",
  "alert": {
    "type": "api_key_expiring",
    "tenant": "<tenant id>",
    "app_name": "support-bot",
    "key_id": "<key id>",
    "key_name": "Production",
    "tier_days": 30,
    "days_left": 20,
    "expires_at": "2026-12-13T09:00:00Z",
    "fired_at": "2026-11-23T09:00:00Z"
  }
}
```

Warnings are checked every few minutes. The console shows the same warnings; see [Key expiry warnings](../apps-and-providers/applications-and-keys#key-expiry-warnings).

## Related

- [Applications and Keys](../apps-and-providers/applications-and-keys) - add, rotate and set expiry on Quilr keys.
- [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) - limits that return `429` before a call reaches the provider.
- [Request Routing](../cost-and-traffic/routing-and-fallbacks) - spread traffic across providers so one failing provider does not stop the app.
