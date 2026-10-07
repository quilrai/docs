---
sidebar_position: 1
sidebar_label: "Applications and keys"
sidebar_custom_props:
  icon: KeyRound
---

# Applications and Keys

An **application** holds a gateway configuration. **Quilr keys** are the credentials your code uses to call it. One app can have many keys, and every key shares the app's providers, guardrails, routing, limits and logs.

## Applications

- **Create** an app with **Create App** on **Settings > AI Gateway > LLM Gateway**. See [Quick Start](../get-started/quick-start).
- **Name**: 4 to 29 characters.
- **Status**: each app is **Active**, **Inactive** or **Expired**. Click a status on the Applications summary card to filter by it.
- **Tags**: click **+ Tag** on an app card. The app search box matches tags, so you can group apps by team, environment or cost center.
- **Find apps**: search by app, key, provider, model, creator or tag. **Filter** (shortcut `F`) narrows by attention (all providers off, no guardrails, key expiring soon), status or provider. Sort by creation time, name, creator or next key expiry.

## Quilr keys

Every app starts with one key, named in Create App (default `Default`). To manage keys, click **Manage keys** on the app card, or open **Settings > API Keys** in the app workspace.

![API Keys section with the Add a Quilr key form and a Default key that is Active and never expires, with Edit expiry and Revoke buttons](/img/llm-gateway/ui/app-api-keys.png)

### Add a key

1. Enter a **Quilr key name**, such as `Production`. Names must be unique within the app while a key is active or expired.
2. Optional: set an **Expiry**. Leave it blank for no expiry.
3. Click **Add key**, then copy the value.

### Manage a key

| Action | Effect |
|--------|--------|
| **Copy** | Copies the key value. Only the last four characters are shown. |
| **Edit expiry** | Sets, changes or clears the expiry date. |
| **Revoke** | Stops the key working immediately. Revoked keys stay in the list for the record. |

The app card shows how many keys are active, expired and revoked. The **Needs attention** card counts apps with a key expiring in the next 30 days.

:::tip Rotate without downtime
Give each environment or team its own key. To rotate one, add a new key, deploy it, then revoke the old one.
:::

## API Integration

The **API Integration** section (or **Integration docs** on the app card) has the two values a client needs.

![API Integration section with a Quilr key picker and Copy button, and a read-only Log export key with Copy](/img/llm-gateway/ui/app-api-integration.png)

- **Quilr key**: pick an active key (the newest is selected by default) and copy it. Send it as the API key on every gateway request.
- **Log export key**: a read-only key for this app's logs. Use it with the [Log Export API](../api-reference/log-export-api).

## Log keys

Log keys are read-only. They cannot send model requests.

| Key | Reads | Where to copy it |
|-----|-------|------------------|
| **Log export key** | One app's logs | API Integration, **Copy logs key** on the app card, or the last step of Create App |
| **All-apps log key** | Logs of every app in the tenant | **...** menu on **Settings > AI Gateway > LLM Gateway** > **Copy all-apps log key**, or the last step of Create App |

## Configuration history and rollback

Every saved change to an app's settings creates a configuration version. Open **Audit Log** on the app card, or **Settings > Audit Log** in the workspace.

- **Configuration versions** lists each version with its operation (for example `Update config`), who made it and when. The live one is marked **Current**.
- Click **Roll back** on a version to restore those settings on an active app.
- **Change requests** lists settings changes submitted through [Self-Service](../self-service/overview), for approval or rejection.

Rolling back restores app settings only. It does not change published [Policy Engine](../../console/govern/policy-engine) policies. See [Audit Log](../monitor/app-audit-log) for details.

## Audit tab

The workspace **Audit** tab lists configuration events with their application, operation (such as `create` or `update_config`), actor, status and time. The **Audit log** button on **Settings > AI Gateway > LLM Gateway** opens it for all apps.

## Automate it

The [Management APIs](../api-reference/management-api) create apps, issue and revoke Quilr keys, change expiry and read history from scripts and pipelines. See [Gateway app credentials](../api-reference/apps-and-credentials-api).
