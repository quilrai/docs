---
sidebar_position: 1
sidebar_custom_props:
  icon: UserCog
---

# Overview

Let your developers get gateway access and manage their own API keys, without an admin minting a key for every person.

Self-service has two sides. A **platform admin** decides which apps are exposed, what kind of credential users receive, and what they are allowed to do. A **developer** signs in to the Self-Service portal, picks up or creates a key, and starts calling the gateway.

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

1. **Admin grants access** - On an API key's **Self-Service** settings tab, choose a credential mode and pick who can use it.
2. **User signs in** - Users with self-service access land in the Self-Service portal and see only the apps they were granted.
3. **User gets a key** - Depending on the mode, the user receives the shared app key or creates their own named, user-scoped key and starts calling the gateway.

## Credential Modes

Each app runs in one of two credential modes. The mode decides which kind of key allowed users receive - it does **not** decide who has access. Access is always controlled separately (see [Capabilities](#capabilities)).

| Mode | What the user gets | Runtime behavior |
|------|--------------------|------------------|
| **Shared Parent Key** (default) | The existing app key (`sk-quilr-…`) | The shared key works as-is. No per-user identity payload is required. |
| **Named User API Keys** | A personal, user-scoped key they create themselves | The gateway only accepts a valid named self-service key tied to an active stored record. A bare parent key, a JWT, or an `X-User-Email` header alone are rejected. |

In **Named User API Keys** mode, each key looks like the app key with a self-service payload appended:

```
sk-quilr-<app-key>:ss1.<encoded-identity>.<random>
```

The payload identifies the user and key; the random suffix lets one person hold several keys for the same app (for example, one per machine). Use the full string anywhere you'd normally use an `sk-quilr-…` key:

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

Per-user identity is recorded on every request, so usage, logs, and findings are automatically attributed to the user behind the key - the same per-user view you get with [Identity Aware](../identity-aware).

## Capabilities

Access is granted per capability, so you can let a wide group view an app while only a few people can change settings or see raw credentials.

| Capability | What it grants |
|------------|----------------|
| **Viewer Access** | See the app in the Self-Service portal. |
| **Settings Request Access** | Submit settings changes for admin approval. Implies viewer access unless viewer rules explicitly deny the user. |
| **Direct Settings Update** | Update the app's settings from the portal immediately, with no admin approval step. |
| **API Key Visibility** | View and copy the credential values shown in the portal. When off, users manage key metadata but the key value stays hidden. |
| **All Logs Visibility** | See all logs and app-wide usage for the app, not just the user's own activity. |

Each capability is granted independently, and each one is scoped to nobody, everyone, or a specific set of people and groups. See [Set the Scope of Each Capability](./admin-guide#step-3-set-the-scope-of-each-capability) in the Admin Guide for how to configure them.

:::note Deny by default
If an app has no self-service access configured, self-service is denied for everyone until an admin grants a capability. Turning a capability **Disabled** is also a deny - it does not fall back to "anyone".
:::

## The Self-Service Portal

Users with self-service access sign in to a dedicated portal instead of the full admin dashboard. For each app they can view, the portal has three tabs:

- **Settings** - Credential mode and app details (provider, models, routing groups, estimated cost), plus key management in **Named User API Keys** mode.
- **Logs** - The app's request logs. Scoped to the user's own activity unless they have All Logs Visibility.
- **Findings** - Guardrail activity (blocked, monitored, anonymized, normal) with per-request detail. Also scoped to the user unless they have All Logs Visibility.

![Self-Service portal listing the apps a developer can access, each card showing its credential mode, enabled capabilities, models, routes, and request, key, and model counts](/img/self-service-portal-apps.png)

For a walkthrough of each tab, see the [Developer Guide](./developer-guide).

## Limitations

- **Revoking access does not revoke issued keys.** Removing a user or smart group from access hides the app and stops them from creating new keys, but it does not invalidate named keys they already created or shared parent keys they already copied. Revoke individual named keys (from the portal or as an admin) when you need to cut off an existing credential.
- Named self-service keys are **soft-revoked** - a revoked key stops working but its record is retained for audit history.

## Related

- [Admin Guide](./admin-guide) - configure credential mode, capabilities, and smart groups.
- [Developer Guide](./developer-guide) - use the portal, create keys, and request settings changes.
- [Identity Aware](../identity-aware) - per-user identity, tracking, and domain controls.
- [Audit Log](../audit-log) - approve change requests, review config history, and roll back changes.
- [Request Routing](../request-routing) - the routing groups shown in an app's self-service details.
