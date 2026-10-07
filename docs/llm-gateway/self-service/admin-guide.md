---
sidebar_position: 2
sidebar_label: "Admin guide"
sidebar_custom_props:
  icon: ShieldCheck
---

# Admin Guide

For platform admins: turn self-service on for an app, choose the credential mode, decide who can do what, and track how it is used.

New to self-service? Start with the [Overview](./overview). For the developer's side, see the [Developer Guide](./developer-guide).

## Where to configure it

Open **Settings > LLM Gateway**, choose an app, then **Settings > Self-Service** (under **Optimization & policy**). Turn on the **Self-service** switch; when it is off, nobody can see or manage the app from self-service. Self-Service stays app-managed when the Policy Engine is on.

![Self-Service capabilities table with Allow all users switches and Allow and Deny email and smart group fields for Viewer access and Settings request access](/img/llm-gateway/ui/app-self-service-capabilities.png)

Changes apply when you select **Save settings**.

## Choose a credential mode

| Mode | Users receive | Use it when |
|------|---------------|-------------|
| **Shared Parent Key** (default) | The existing app key | One credential for a team is fine and per-user attribution is not required. |
| **Named User API Keys** | A personal key each user creates | You need per-user attribution, per-user revocation, and one key per machine. |

In the V1 console the mode is the **Credential Mode** tab of the app's Self-Service settings:

![V1 console Self-Service settings with the Credential Mode choice between Shared Parent Key and Named User API Keys](/img/self-service-admin-settings.png)

:::warning Switching to named keys stops the parent key
Once an app uses **Named User API Keys**, the bare parent key is no longer accepted for it. Move existing integrations to named keys before you switch.
:::

## Grant capabilities

| Capability | Grants |
|------------|--------|
| **Viewer access** | See the app in the Self-Service portal. |
| **Settings request access** | Submit settings changes for admin approval. Implies viewer access unless a viewer rule denies the user. |
| **Direct settings update** | Change the app's settings from the portal with no approval step. |
| **API key visibility** | View and copy key values in the portal. Without it, users manage key metadata but the value stays hidden. |
| **All-logs visibility** | See all of the app's logs and usage, not just the user's own. |

For each capability, choose who gets it:

| To grant | Set |
|----------|-----|
| Everyone | **Allow all users** on |
| Specific people or groups | **Allow emails** and **Allow smart groups** (comma-separated) |
| Everyone except some | **Allow all users** on, plus **Deny emails** or **Deny smart groups** |
| Nobody | Leave everything empty |

A denied entry always wins over an allowed one. The chip next to each capability shows the result: **Everyone**, **Listed only** or **Nobody yet**. [Smart groups](#smart-groups) let you manage membership in one place instead of pasting emails into every app.

:::note Deny by default
An app with no self-service access configured is closed to everyone until you grant a capability.
:::

### Direct update vs request access

| | Settings request access | Direct settings update |
|---|---|---|
| Who applies the change | An admin, after review | The user, immediately |
| Approval queue | Yes, in the app's **Audit Log** | No |
| Recorded in config history | Yes, once approved | Yes, when saved |
| Best for | Most developers | A few trusted app owners |

Grant **Direct settings update** sparingly. The change is still versioned in [Config History](../monitor/app-audit-log#config-history) and can be rolled back, but nobody approves it first. Self-service settings themselves are admin-only, so no user can grant themselves access.

### Smart groups

Smart groups are reusable, named groups of users managed for your tenant. Add one (for example `engineering`) to an allow or deny list, and removing someone from the group removes their access across every app that references it.

## Review change requests

Requests from users with **Settings request access** land in the app's **Settings > Audit Log**, filterable by status (`pending`, `approved`, `rejected`, `failed`, `stale`). See [Audit Log](../monitor/app-audit-log#change-requests) for the approval workflow. Your own direct edits as an admin apply immediately and skip the queue.

## Track usage

The **Self-service usage** button on the **Settings > LLM Gateway** page opens a tenant-wide report of who can do what in each app, and whether they use it.

![Self-service usage Applications tab listing each app's credential mode as Personal keys or Main app key, with users per role, keys, requests and estimated cost](/img/llm-gateway/ui/self-service-usage-by-application.png)

| Tab | Shows |
|-----|-------|
| **Users** | Each user's roles (view, request, direct, API key, all logs), apps, keys, requests, estimated cost and last request. Expand a user for the app-by-app grid. |
| **Applications** | Each app's credential mode (**Personal keys** or **Main app key**), users per role (or **Everyone**), keys, requests and estimated cost. |
| **Change history** | Every settings change submitted through self-service, with requester, change path, status and reviewer. |

The report covers the last 30 days by default (up to 366 days). By default it includes apps with self-service configuration, personal keys or change requests in the window; select **Include every active app** to widen it. Estimated cost leaves out models with no configured price.

## Revoke access

Removing a user or smart group hides the app and stops new keys. It does **not** invalidate keys already issued:

- **Named User API Keys:** revoke the individual named key. The key stops working and its record is kept for audit.
- **Shared Parent Key:** rotate the app key, since every allowed user holds the same value.

## Permissions

Configuring self-service and approving or rejecting change requests both require the **LLM Gateway - Update** permission.
