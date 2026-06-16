---
sidebar_position: 12
sidebar_custom_props:
  icon: UserCog
---

# Self-Service

Let your developers get gateway access and manage their own API keys, without an admin minting a key for every person.

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

Each app runs in one of two credential modes. The mode decides which kind of key allowed users receive - it does **not** decide who has access. Access is always controlled separately (see [Access Control](#access-control)).

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

Per-user identity is recorded on every request, so usage, logs, and findings are automatically attributed to the user behind the key - the same per-user view you get with [Identity Aware](./identity-aware).

## Access Control

Access is granted per capability, so you can let a wide group view an app while only a few people can request changes or see raw credentials.

### Capabilities

| Capability | What it grants |
|------------|----------------|
| **Viewer Access** | See the app in the Self-Service portal. |
| **Settings Request Access** | Submit settings changes for admin approval. Implies viewer access unless viewer rules explicitly deny the user. |
| **API Key Visibility** | View and copy the credential values shown in the portal. When off, users manage key metadata but the key value stays hidden. |
| **All Logs Visibility** | See all logs and app-wide usage for the app, not just the user's own activity. |

### Access Modes

Each capability is set independently to one of three modes:

| Mode | Who gets it |
|------|-------------|
| **Disabled** | No one. |
| **Everyone** | Every signed-in self-service user, minus any exceptions you list. |
| **Specific** | Only the people and [smart groups](#smart-groups) you add. |

In both **Everyone** and **Specific** mode you can add **exceptions** - specific people or smart groups to block. Exceptions always win: a denied user is blocked even if they also match an allow rule or "Everyone".

:::note Deny by default
If an app has no self-service access configured, self-service is denied for everyone until an admin grants a capability. Turning a capability **Disabled** is also a deny - it does not fall back to "anyone".
:::

### Smart Groups

Smart groups are reusable, named groups of users managed for your tenant. Instead of pasting individual emails into every app, add a smart group (for example, `engineering`) to an allow or deny list and manage membership in one place. Removing someone from the group removes their self-service access across every app that references it.

## The Self-Service Portal

Users with self-service access sign in to a dedicated portal instead of the full admin dashboard. For each app they can view, the portal has three tabs:

- **Settings** - Shows the credential mode and app details (provider, models, routing groups, estimated cost). In **Named User API Keys** mode, users create named keys, see their active keys (with created / last-used times), and revoke keys they no longer need. A **Request settings change** action appears here for users with Settings Request Access.
- **Logs** - The app's request logs. Scoped to the user's own activity unless they have All Logs Visibility.
- **Findings** - Guardrail activity (blocked, monitored, anonymized, normal) with per-request detail. Also scoped to the user unless they have All Logs Visibility.

## Settings Change Requests

Self-service users with **Settings Request Access** never edit live config directly. Instead, they submit a change request that an admin reviews and approves. Supported requests include configuration updates, tag changes, identity/JWT settings, custom categories, and prompt-store changes.

Requesters track their own submissions under **My Change Requests** in the portal, where each request shows a status of `pending`, `approved`, `rejected`, `failed`, or `stale`. Admins review and decide on these requests from the **Audit Log** tab - see [Audit Log](./audit-log#change-requests) for the approval workflow.

## Setup & Permissions

- Configuring self-service (credential mode and access control) requires the **LLM Gateway – Update** permission, set on the app's **Self-Service** settings tab.
- Approving or rejecting change requests also requires **LLM Gateway – Update**. See [Audit Log](./audit-log).

## Limitations

- **Revoking access does not revoke issued keys.** Removing a user or smart group from access hides the app and stops them from creating new keys, but it does not invalidate named keys they already created or shared parent keys they already copied. Revoke individual named keys (from the portal or as an admin) when you need to cut off an existing credential.
- Named self-service keys are **soft-revoked** - a revoked key stops working but its record is retained for audit history.

## Related

- [Identity Aware](./identity-aware) - per-user identity, tracking, and domain controls.
- [Audit Log](./audit-log) - approve change requests, review config history, and roll back changes.
- [Request Routing](./request-routing) - the routing groups shown in an app's self-service details.
