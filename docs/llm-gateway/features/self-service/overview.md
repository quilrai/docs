---
sidebar_position: 1
sidebar_custom_props:
  icon: UserCog
---

# Overview

Let developers get gateway access and manage their own keys, without an admin minting a key for every person.

| If you are a... | Read |
|-----------------|------|
| Platform admin turning self-service on for an app | [Admin Guide](./admin-guide) |
| Developer who was granted access to an app | [Developer Guide](./developer-guide) |

## How It Works

<StepFlow steps={[
  {
    label: "Admin Grants Access",
    items: [
      "App: Support Bot",
      "Viewer: engineering smart group",
      "Mode: Named user keys",
    ],
  },
  {
    label: "User Signs In",
    items: [
      "alice@acme.com",
      "Self-Service portal",
      "Sees: Support Bot ✓",
    ],
  },
  {
    label: "User Gets a Key",
    items: [
      'Creates "Alice local dev"',
      "sk-quilr-•••:ss1.•••",
      "Calls the gateway ✓",
    ],
  },
]} />

1. **Admin grants access** in the app's **Self-Service** settings: who can view the app, request or make changes, see keys and see all logs.
2. **User signs in** to the Self-Service portal and sees only the apps they were granted.
3. **User gets a key**: the shared app key, or a personal key they create, depending on the app's credential mode.

## Credential Modes

The credential mode decides which kind of key allowed users receive. It does **not** decide who has access.

| Mode | Shown in reports as | What the user gets | Runtime behavior |
|------|---------------------|--------------------|------------------|
| **Shared Parent Key** (default) | Main app key | The existing app key (`sk-quilr-…`) | The shared key works as-is. |
| **Named User API Keys** | Personal keys | A personal key each user creates | Only a valid named key is accepted. A bare parent key, a JWT, or an `X-User-Email` header alone are rejected. |

A named key is the app key with a self-service payload appended. Use the whole string anywhere you would use an `sk-quilr-…` key:

```
sk-quilr-<app-key>:ss1.<encoded-identity>.<random>
```

The payload identifies the user and key, and the random suffix lets one person hold several keys for the same app. Every request is attributed to the user behind the key, the same per-user view you get with [Identity Aware](../identity-aware).

## Capabilities

Five capabilities are granted independently: **Viewer access**, **Settings request access**, **Direct settings update**, **API key visibility** and **All-logs visibility**. Self-service is denied by default. See [Grant capabilities](./admin-guide#grant-capabilities) for what each one does and how to scope it.

## Limitations

- **Revoking access does not revoke issued keys.** Removing a user hides the app and stops them creating new keys, but keys they already created or copied keep working. Revoke named keys individually, or rotate the shared app key.
- Named keys are **soft-revoked**: a revoked key stops working, but its record is kept for audit history.

## Related

- [Audit Log](../audit-log) - approve change requests, review config history, and roll back changes.
- [Identity Aware](../identity-aware) - per-user identity and domain controls.
