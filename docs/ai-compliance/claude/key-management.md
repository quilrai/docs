---
sidebar_position: 2
sidebar_custom_props:
  icon: KeyRound
---

# Key Management

Compliance API keys connect QuilrAI to your Claude.ai organization data. Keys are validated against the live Compliance API before being stored.

## Registering a key

Go to **Settings → Compliance → Claude** in the dashboard and click **Add Key**. Enter your Anthropic Compliance API key (`sk-ant-api01-…`).

The key is validated immediately — if it cannot authenticate with the Compliance API, registration is rejected and nothing is stored.

Once registered, the key is stored encrypted at rest and the plaintext is never returned or logged.

## Keeping keys active

After registration, the platform automatically:

- **Syncs data** on a regular schedule — fetching the latest organizations, users, chats, projects, and activity events
- **Runs DLP scans** on all new user inputs since the last pass
- **Tracks sync state** per key — each key maintains its own sync timestamp independently

No action is required to keep a key active. As long as the key remains valid with Anthropic, data will continue to be fetched and scanned.

## Revoking a key

To stop syncing data for a key, revoke it from the dashboard:

1. Open **Settings → Compliance → Claude**
2. Find the key you want to remove
3. Click **Revoke**

Revoking a key removes it from all future sync and DLP passes. Existing data already fetched and scanned remains in the system unless explicitly deleted.

:::note
Revoking a key in QuilrAI does **not** invalidate the key with Anthropic. To fully disable Compliance API access, contact your Anthropic representative.
:::

## Key status

Each registered key shows its current state in the dashboard:

| Status | Meaning |
|--------|---------|
| **Active** | Key is registered and syncing normally |
| **Sync error** | Last sync attempt failed — check the key is still valid with Anthropic |
| **Revoked** | Key has been removed and is no longer synced |
