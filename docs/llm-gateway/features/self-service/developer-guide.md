---
sidebar_position: 3
sidebar_custom_props:
  icon: Rocket
---

# Developer Guide

For developers who have been granted self-service access. This page covers signing in, getting a key, reading your own logs and findings, and requesting settings changes.

Want the concepts first? See the [Overview](./overview). Setting self-service up for your org? See the [Admin Guide](./admin-guide).

## Signing In

Sign in with your work account. If you have self-service access, you land in the **Self-Service portal** instead of the full admin dashboard.

You only see the apps an admin granted you. If the portal is empty, nobody has given you access to an app yet - ask your QuilrAI platform admin.

## Your Apps

Each app you can access appears as a card:

![Self-Service portal app list showing cards for Alerts Testing 2, MultiProviderTesting, and copilot with credential badges, provider and model chips, and request, key, and model counts](/img/self-service-portal-apps.png)

A card tells you:

| On the card | What it means |
|-------------|---------------|
| **USER KEY** badge | The app runs in Named User API Keys mode - you create your own key. Without it, the app uses the shared parent key. |
| **REQUESTS ENABLED** badge | You can submit settings changes for admin approval. |
| **KEYS HIDDEN** badge | You can manage keys but cannot see the credential value. The key chip reads `API key hidden`. |
| Key chip | Your current credential, or `No key available` when you have not created one yet. |
| Provider and model chips | The provider, the models this app can call, and any routing groups under **ROUTES**. |
| **REQUESTS / KEYS / MODELS** | Request count, how many keys you hold, and how many models are enabled. |
| **Mode / Cost / Latest key** | Credential mode, estimated cost, and when you last created a key. |
| **Settings / Logs / Findings** | The three tabs for the app. |

## The Three Tabs

Open an app to get to its tabs:

![An app opened in the Self-Service portal with Settings, Logs, and Findings tabs, showing the credential settings card and a Request settings change button](/img/self-service-portal-app-tabs.png)

### Settings

Shows the credential mode and app details: provider, models, routing groups, and estimated cost. In **Named User API Keys** mode this is also where you manage your keys. If you have Settings Request Access, a **Request settings change** action appears here.

### Logs

The app's request logs. You see your own activity only, unless an admin granted you **All Logs Visibility** for this app.

### Findings

Guardrail activity for the app - blocked, monitored, anonymized, and normal requests - with per-request detail. Scoped to your own activity under the same rule as Logs.

## Getting Your Key

What you get depends on the app's credential mode.

### Shared Parent Key mode

The app already has a key. Copy it from the Settings tab and use it as-is. If the app shows `API key hidden`, an admin has turned off key visibility for you - ask them for the value.

### Named User API Keys mode

You create your own key:

1. Open the app's **Settings** tab.
2. Create a key and give it a name that says where it will live, for example `Alice local dev` or `alice-ci-runner`.
3. Copy the full value. It looks like the app key with a self-service payload appended:

   ```
   sk-quilr-<app-key>:ss1.<encoded-identity>.<random>
   ```

4. Use the whole string anywhere you'd normally use an `sk-quilr-…` key:

   ```python
   from openai import OpenAI

   client = OpenAI(
       base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
       api_key='sk-quilr-xxx:ss1.a1b2c3.d4e5f6'  # your named self-service key
   )

   response = client.chat.completions.create(
       model='gpt-4o-mini',
       messages=[{'role': 'user', 'content': 'Hello!'}]
   )
   ```

You can hold several keys for the same app - one per machine or environment is a good habit, since you can then revoke one without breaking the others. Your active keys are listed with their created and last-used times, and you can revoke any of them yourself.

Every request made with your key is attributed to you, so your logs, usage, and findings are your own.

:::warning A bare parent key will not work
In Named User API Keys mode the gateway only accepts a valid named self-service key. The parent `sk-quilr-…` key on its own, a JWT, or an `X-User-Email` header alone are rejected.
:::

## Requesting a Settings Change

If you have **Settings Request Access**, use **Request settings change** on the Settings tab. You get the app's settings editor - providers and models, tags, guardrails, custom detections, rate limits, token saving, routing configurations, alerts, identity settings, and the prompt store - and submit your edits as a request.

![The self-service settings editor with the LLM Providers section open and a footer reading "Submitted changes require admin approval before they apply" next to a Submit Request button](/img/self-service-change-request.png)

Nothing you edit here is live. The footer says it plainly: **submitted changes require admin approval before they apply**. Choose **Submit Request** to send it for review.

Track your submissions under **My Change Requests** in the portal. Each request shows one of these statuses:

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for an admin to review it. |
| `approved` | An admin accepted it and the change is live. |
| `rejected` | An admin declined it. Nothing changed. |
| `failed` | The change was approved but could not be applied. |
| `stale` | The app's config moved on since you submitted. Re-submit against the current settings. |

Admins review requests from the app's **Audit Log** tab - see [Audit Log](../audit-log#change-requests).

:::note You cannot change self-service access
The self-service configuration itself, including credential mode and who has access, is admin-only and does not appear in the portal's settings editor.
:::

### If you have Direct Settings Update

Some users are granted **Direct Settings Update** instead. In that case your saves apply to the live app immediately, with no approval step. There is no undo in the portal, but every change is versioned in the app's config history and an admin can roll it back.

## Troubleshooting

| What you see | What it means |
|--------------|---------------|
| The portal is empty | No app has granted you Viewer Access yet. Ask your platform admin. |
| `No key available` | The app is in Named User API Keys mode and you have not created a key yet. |
| `API key hidden` | You do not have API Key Visibility for that app. You can still manage key metadata. |
| An app disappeared | Your access was removed, or you were removed from a smart group that granted it. Keys you already copied are not automatically revoked, but you can no longer create new ones. |
| Your key is rejected by the gateway | The key was revoked, or you are sending the bare parent key to an app that requires named user keys. |
| Logs look emptier than expected | Logs and findings are scoped to your own activity unless you have All Logs Visibility. |

## Related

- [Overview](./overview) - concepts, credential modes, and the key format.
- [Admin Guide](./admin-guide) - how access is configured on the admin side.
- [Integration Guide](../../integration-guide) - endpoint URLs and code examples for calling the gateway.
- [Audit Log](../audit-log) - how change requests are reviewed.
