---
sidebar_position: 3
sidebar_label: "Alerts"
sidebar_custom_props:
  icon: Activity
description: "Set up channels and rules in LLM Gateway Alerts to get notified about failures, spikes, provider and gateway health, spend, budgets and key expiry."
console_path: [/settings/llm-gateway/alerts, /settings/llm-gateway/alerts/rules, /settings/llm-gateway/alerts/coverage, /settings/llm-gateway/alerts/channels, /settings/llm-gateway/alerts/activity]
aliases: [central alerts, alert rules, alert channels, failure rate alerts, spend alerts, budget alerts, key expiry, webhook signature]
---

# Alerts

**LLM Gateway > Alerts** is one place for every gateway alert. You set up where alerts go once, then choose what to watch.

Alerts has two building blocks:

| Block | What it is |
|-------|------------|
| **Channels** | Where alerts are sent: **Slack**, **webhook** or **email**. Any channel works for any alert type. |
| **Rules** | What to watch. A rule has an alert type, the apps, budgets or endpoints it covers, and the channels that hear about it. |

The page also has a **Coverage** tab (which apps have no alerts) and an **Activity** tab (every alert and its result per channel).

## Get started

1. Open **LLM Gateway > Alerts > Channels** and add a channel. Select **Send test** to check it.
2. Open **Rules** and add a rule. Pick a type, the scope and one or more channels.
3. Open **Coverage** to see which apps still have no alerts.

To open Alerts you need LLM Gateway read access for the whole organization; to change it you need LLM Gateway update access for the whole organization. See [Permissions](#permissions).

If your organization has not imported its old alert settings yet, those settings keep working. See [Before you import](#before-you-import).

## Alert types

Each type has defaults, so you can save a rule without changing anything except its scope and channels.

### Reliability

#### Failure rate

An app's failed calls pass a percentage over a time window.

| Setting | Default | Range |
|---------|---------|-------|
| **Failure rate above** | 10% | 0.1 to 100 |
| **Over the last** | 15 min | 5 to 1440 |
| **Only with at least** | 20 requests | 1 to 100000 |
| **Repeat every** | 10 min | 1 to 1440 |
| **Send a recovery message** | On | On or off |

Example: alert when 10% or more of an app's calls fail over 15 minutes, once at least 20 calls came in.

#### Provider failure rate

Calls from an app to one provider label fail above a percentage. It has the same settings and defaults as **Failure rate**, but it is checked for each provider separately.

Example: an app's calls to one OpenAI label fail 30% of the time, while its other providers are fine. Only that provider alerts.

#### Request spike

An app gets far more requests than usual for this time of day.

| Setting | Default | Range |
|---------|---------|-------|
| **At least** | 3x normal | 1.5 to 20 |
| **And at least** | 15 requests above normal | 1 to 1000000 |
| **Only with at least** | 20 requests in 15 min | 1 to 1000000 |
| **For** | 2 periods of 15 min in a row | 1 to 4 |
| **Alert again after** | 60 min | 15 to 1440 |
| **Send a recovery message** | On | On or off |

Example: an app normally gets 40 requests at 09:00. It gets 150 for two 15-minute periods in a row, so it alerts.

#### Guardrail outcome spike

Far more requests than usual are blocked or anonymized by guardrails.

| Setting | Default | Range |
|---------|---------|-------|
| **Count** | Blocked and anonymized | One or both |
| **Rate at least** | 2x normal | 1.5 to 20 |
| **And at least** | 15 points above normal | 1 to 100 |
| **Treat normal as at least** | 1% | 0 to 100 |
| **Only with at least** | 15 checked requests | 1 to 1000000 |
| **And at least** | 5 affected requests | 1 to 1000000 |
| **For** | 2 periods of 15 min in a row | 1 to 4 |
| **Alert again after** | 60 min | 15 to 1440 |
| **Send a recovery message** | On | On or off |

Example: an app usually has 2% of requests blocked. Now 25% are blocked for 30 minutes.

:::note How spikes find "normal"
Spike alerts compare the latest 15 minutes with the same 15-minute time of day over the previous 7 days. They need traffic at that same time of day on at least 5 of the previous 7 days. A new app has no baseline yet, so it does not alert until it has enough history.
:::

### Health

#### Provider health

A provider and model your apps use has an outage or is degraded across Quilr. This rule is not tied to an app. Leave **Providers** empty to cover every provider your apps used in the last 24 hours.

| Setting | Default | Range |
|---------|---------|-------|
| **Providers** | All used | Pick providers |
| **Alert after an outage of** | 1 h | 1 to 24 |
| **Or degraded for** | 2 h | 1 to 24 |
| **Recovered after** | 2 good hours | 1 to 24 |
| **Alert again after** | 2 h | 1 to 48 |
| **Send a recovery message** | On | On or off |

Example: a provider you use has an outage for an hour, so you hear about it before your users report it.

#### Gateway health

A Quilr gateway endpoint you use stops answering. Pick one or more endpoints.

The health probe checks these endpoints: `global`, `usa-1`, `usa-2` and `india-1`. You can pick other endpoints, but they show "not monitored yet" and cannot alert.

Example: `usa-1` stops answering, and the on-call channel gets a message.

### Cost

#### Budget threshold

A budget passes one of its own alert thresholds. The budget decides when. The rule decides who hears about it.

| Setting | Default | Range |
|---------|---------|-------|
| **Only thresholds of at least** | 0% | 0 to 100 |

Scope: all budgets, or the budgets you pick.

Example: a budget has thresholds at 50%, 80% and 100%. Set the minimum to 80 to hear only about the last two.

#### Spend

Spend passes an amount in a day, week or month, with or without a budget.

| Setting | Default | Range |
|---------|---------|-------|
| **Every** | Day | Day, week or month |
| **Amounts** | 500 USD | 1 to 5 amounts, 0.01 to 10,000,000 |
| **Count** | App | Each **App** on its own, or **Combined** |

Periods use UTC. Weeks start on Monday.

Example: alert when any app spends more than 500 USD in a day, and again at 1,000 USD if you add that amount.

#### Budget forecast

At the current burn rate a budget will run out before its period ends.

| Setting | Default | Range |
|---------|---------|-------|
| **Burn rate over** | 24 h | 6 to 168 |
| **Only once at least** | 10% used | 0 to 100 |
| **Not in the first** | 6 h of a period | 0 to 72 |

Example: a monthly budget is 40% used after 5 days. At that pace it runs out on day 12, so it alerts.

Forecasts cover budgets with a calendar period (for example monthly). Budgets with a rolling window are not forecast; use **Budget threshold** for those.

### Security

#### API key expiry

An app's API key is about to expire. Each named key of an app is checked on its own, and the message names the key. The rule warns once for each warning point, and once more when the key has expired. The expired message is sent only within 7 days of the expiry date, so a key that ran out long ago (for example one found right after an import, or a revoked key) is skipped instead of alerting late. If a key gets a new expiry date, the warnings start again.

| Setting | Default | Range |
|---------|---------|-------|
| **Warn at** | 120, 90, 60 and 30 days before | 1 to 6 points, each 1 to 365 days |

Example: with the default points, a key that expires on 1 March sends a warning when 120, 90, 60 and 30 days are left, and a last message on 1 March.

## Choose which apps a rule covers

Rules that watch apps have three scope options:

| Scope | Covers |
|-------|--------|
| **All apps** | Every app, including apps you add later. |
| **Picked apps** | Only the apps you choose. |
| **Apps with tags** | Every app with the tags you choose. New apps with the tag are included automatically. |

Budget rules pick budgets. Gateway health rules pick endpoints. Provider health rules pick providers.

Open the **Coverage** tab to see, for each app, which rules and channels apply. Turn on **Only apps not watched for failures** to find apps with no failure alerts, then select them and use **Add N to rule**.

## Avoid too many alerts

- **Cooldown.** While a problem lasts, repeat alerts for the same app are spaced by **Repeat every** or **Alert again after**. The wait only spaces repeats: if the problem recovers and then comes back, the new alert is sent at once.
- **Overlapping rules.** If two rules with the same condition raise the same alert in the same check (for example a rule for all apps and a rule for some apps, both at 10% over 15 min), you get one alert that names both rules, and one recovery message later. A channel both rules use gets one message; a channel only one rule uses still gets it. A rule with a different condition, such as 20% instead of 10%, keeps its own alert.
- **Repeats.** A repeat alert's title starts with **Still in breach:**, so it does not look like a new problem. Webhooks get the same `title` as the first alert, with `kind` set to `repeat`.
- **Recovery message.** When the problem ends, one follow-up message says so. Turn it off with **Send a recovery message**.
- **Not enough traffic.** If an app has too few requests to judge, the rule does not alert, and the rule shows **Not enough data**. It also never claims that a problem recovered without enough calls to check. An alert that is still open for that reason shows **Firing · not enough traffic to re-check**; it is checked again once there are enough calls, and closes with a recovery message only if that check passes.
- **Summary.** If one rule finds more than 10 alerts in one check, you get one summary message instead of one per app. Its title gives the count (for example **12 alerts (2 new, 10 still in breach)**, or **6 expired, 5 expiring** for key expiry). It lists the first 20 items by name, new breaches first, then says how many more there are. More than 10 recoveries in one check come as their own summary, for example **11 recovered**. Channels imported from the old settings still get one message per app, so old receivers keep working.
- **Check failed.** If Quilr could not check a rule (for example the logs could not be read), the rule shows **Check failed**. It is checked again on the next cycle.

## Turn a rule or channel off

Every rule and channel has an **Enable** switch in its table, and an **Enable** or **Disable** button at the top of its panel. New rules and channels start on. Quilr asks you to confirm before it changes anything:

- **Disable a rule:** no alerts are sent for it until you enable it again. If the rule is firing, the prompt says so. A disabled rule shows **—** as its status.
- **Enable a rule:** it is checked again within about 2 minutes. Before you import, or when its alert type is switched off for your organization, the prompt says it won't be checked yet. If all its channels are disabled, the prompt warns that no one will get its alerts.
- **Disable a channel:** no alerts are sent to it until you enable it again. The prompt says how many rules would be left with no channel. In **Activity**, sends to a disabled channel show **Suppressed**. One-time warnings (API key expiry, spend and budget forecast) are not lost: while every channel of a rule is off, they wait and are sent once a channel is on again.

If someone else changed the rule or channel since you opened it, the change is not saved. Select **Reload** to see the latest version, then try again.

## Delivery

Alerts are queued and sent to each channel. If a send fails, Quilr tries again after 1 minute, 5 minutes, 30 minutes and 2 hours. That is 5 attempts in all. A reply that says the request itself is wrong (most 4xx errors) fails at once and is not retried. Timeouts (408) and rate limits (429) are retried.

A channel that keeps failing shows as **Failing**, with the last error. Quilr never turns a channel off by itself, so it recovers as soon as you fix the cause.

| Tool | What it does |
|------|--------------|
| **Send test** | Sends a test alert to one channel now. You can send 5 tests per channel in 10 minutes. |
| **Activity** tab | Lists each alert with the result for each channel: pending, sent, retrying, failed, suppressed, or email unavailable. |

Webhook URLs and signing secrets are encrypted. After you save, they are never shown again. To change a URL, enter it again. To get a new signing secret, rotate it. If you turn on **Sign each alert** on an existing webhook, the new secret is shown once when you save.

Each **Send test** is recorded in **Audit Logs**. A test the receiver refused is recorded as failed. Creating, changing, turning on or off, and deleting a rule or channel, rotating a signing secret, and importing old settings are recorded in **Audit Logs** too. Webhook URLs, secrets and email addresses are never shown there.

**Activity** keeps alerts for 400 days. Each row names the app (and key), provider and model, endpoint or budget; a summary row shows its title. Critical alerts, including an expired API key and a problem still in breach, are red, in Activity and in Slack and email.

:::note Email details
Alert emails list the facts as plain rows, with units, for each alert type. For example, a failure rate email shows **Failure rate: 30% (30 of 100 calls)** and **Threshold: 10% over 15 min**, and an API key expiry email shows **Expires on: 26 Nov 2026** and **Days left: 30**. Times are shown in UTC, for example **27 Nov 2026, 15:02 UTC**, and a test email shows who sent it by email address.
:::

:::note Email
If email is not set up for your deployment, email deliveries show **Email unavailable**. Use Slack or a webhook instead.
:::

## Webhook payload

A webhook channel receives a JSON `POST`. Slack channels get a formatted Slack message instead. Email channels get a short email with the same facts.

```json
{
  "schema_version": "1",
  "event_id": "evt_3b9f6c1a2d4e5f60",
  "delivery_id": "dlv_8a1c0e7b5d2f4963",
  "type": "failure_rate",
  "kind": "breach",
  "severity": "critical",
  "tenant_id": "acme",
  "rules": [{ "id": "rul_2d10", "name": "Production failure rate" }],
  "subject": { "app_id": "9f2c...", "app_name": "support-bot", "provider_label": null },
  "text": "support-bot: 18.2% of calls failed over 15 min (41 of 225). Top errors: 429 ×30, 500 ×11.",
  "data": {
    "failure_rate": 18.22, "failures": 41, "total": 225,
    "window_minutes": 15, "threshold_pct": 10,
    "top_errors": [{ "status_code": 429, "count": 30 }, { "status_code": 500, "count": 11 }]
  },
  "occurred_at": "2026-11-23T11:42:00Z"
}
```

| Field | Meaning |
|-------|---------|
| `kind` | `breach`, `repeat`, `recovery`, `warning` or `test`. |
| `severity` | `critical`, `warning` or `info`. |
| `event_id` | Same for every channel that gets this alert. |
| `delivery_id` | Unique for each send to one channel. Retries keep the same value. |
| `data` | Details that depend on the alert type. |

The request also has the headers `X-Quilr-Event-Id` and `X-Quilr-Delivery-Id`.

A summary has `"subject": { "digest": true, "count": 12 }`. Its `data` has `count`, `app_ids`, and `subjects`: up to 100 items, each with its `title`, `kind` and the item's own `details` (the same fields a single alert's `data` has).

### Verify the signature

Signing is optional. Turn on **Sign each alert** on the webhook channel. Quilr shows the signing secret once. Copy it then.

Each signed request has this header:

```
X-Quilr-Signature: t=<unix>,v1=<hex>
```

`<hex>` is `HMAC_SHA256(secret, "<t>.<body>")`, where `<body>` is the raw request body, exactly as received. Check the signature before you parse the JSON. Reject old timestamps to stop replays.

```python
import hashlib
import hmac
import time

def verify(secret: str, header: str, raw_body: bytes, max_age=300) -> bool:
    try:
        parts = dict(p.split("=", 1) for p in header.split(","))
        t, sent = parts["t"], parts["v1"]
        timestamp = int(t)
        sent.encode("ascii")
    except (KeyError, ValueError, UnicodeEncodeError):
        return False  # malformed header: reject it
    if abs(time.time() - timestamp) > max_age:
        return False
    signed = t.encode() + b"." + raw_body
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sent)
```

The timestamp check only limits how old a replayed request can be. A retry, or a request whose response was lost, can arrive twice within that time. Handle each `delivery_id` once: retries keep the same value.

If you lose the secret, select **Rotate signing secret** on the channel and update your receiver.

## Before you import

Until your organization imports, alerts work the old way:

- **App failure alerts:** open the app's **Settings > Alerts**. Turn on **App-level alert** (all providers together) or **Per-provider alert** (each provider separately), set the threshold, window, minimum requests and cooldown, add alert emails or webhooks, then select **Save settings**.
- **Budget alerts:** add webhooks under the budget **Alert destinations**.

The old **Gateway health alerts** emails setting saved recipients, but nothing sent alerts to them. To get gateway health alerts, import and add a **Gateway health** rule.

## Move from the old alert settings

Before Alerts, you set up alerting in three places: each app's **Settings > Alerts**, budget alert destinations, and gateway health emails. The import brings all of them over. Gateway health recipients become an email channel; add a **Gateway health** rule and pick your endpoints to send to it, since the old setting never sent alerts. The import cannot be undone.

1. Open **LLM Gateway > Alerts** and select **Review import** in the banner.
2. Review the plan: **Channels to create**, **Rules to create**, **Warnings** and **Not imported**. Nothing changes yet.
3. Select **Import**.

How the import works:

- The same Slack or webhook URL becomes one channel, even if many apps used it.
- Apps with the same settings share one rule.
- A rule never loses a destination or an app: when there are more than 10 channels or 500 apps, it is split into parts.
- A setting outside today's allowed range (for example a cooldown over 24 hours) is set to the nearest allowed value, and the plan says so.
- Old rules that were turned off are listed under **Not imported**.
- **Warnings** lists anything else to check, for example a URL that no longer passes checks.

If your old settings change after you review the plan, review it again. The import only applies the plan you reviewed.

After you import:

- Each app's **Settings > Alerts** shows the number of rules that cover it (for example **Alerts · 11 rules**, or **No rules**). It lists those rules, with why each one covers the app (**All apps**, **Picked** or a tag), and the channels they send to. It is read-only; select **Manage in Alerts** to change them.
- Budget alert destinations and gateway health email settings become read-only. They show **Managed in Alerts** with an **Open Alerts** link.
- Failure rate and budget alerts sent to imported webhook and Slack channels keep their old format, one message per app, so your receivers keep working. Other alert types, such as API key expiry, use the new format on every channel.

If you do not import, your organization keeps working exactly as before. You can still create channels and rules; until you import, each rule shows **Waiting for import** and does not run.

## Permissions

| Access | Can do |
|--------|--------|
| LLM Gateway read access for the whole organization | View channels, rules, coverage and history. |
| LLM Gateway update access for the whole organization | Add, edit and delete channels and rules. Send tests. Run the import. |
| Update access plus permission to reveal secrets | Create a signed webhook channel, turn on **Sign each alert** for an existing one, and rotate its signing secret, because these show the secret. |

Users whose access covers only some apps cannot open Alerts.

## Limits

| Item | Limit |
|------|-------|
| Channels | 50 |
| Rules | 100 |
| Channels per rule | 10 |
| Apps per rule | 500 |
| Tags per rule | 20 |
| Email recipients per channel | 50 |

## Related

- [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) - limits that return `429` before a call reaches the provider.
- [Request Routing](../cost-and-traffic/routing-and-fallbacks) - spread traffic across providers so one failing provider does not stop the app.
