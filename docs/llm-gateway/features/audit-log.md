---
sidebar_position: 13
sidebar_custom_props:
  icon: History
---

# Audit Log

A complete, versioned history of every configuration change to an LLM Gateway app - with one-click rollback and an approval queue for self-service change requests.

## How It Works

<StepFlow steps={[
  {
    label: "Config Changes",
    items: [
      "alice@acme.com edits guardrails",
      "Save ✓",
    ],
  },
  {
    label: "Version Recorded",
    items: [
      "v7 · update_config",
      "Actor: alice@acme.com",
      "Changed: security_guardrails",
    ],
  },
  {
    label: "Review or Roll Back",
    items: [
      "Compare v6 → v7",
      "Roll back to v6 ✓",
    ],
  },
]} />

Every configuration change to an app is captured as an immutable version. From the app's **Audit Log** settings tab you can browse that history, inspect exactly what changed, roll back to a previous version, and review change requests submitted by [self-service](./self-service) users.

## Config History

Each config-changing action records a new version snapshot. A version captures:

| Field | Description |
|-------|-------------|
| **Version** | A sequential number for display (`v7`). Each version also has a stable internal id used for rollback. |
| **Operation** | What triggered the change - for example `update_config`, `set_tags`, `jwt_auth_settings`, `update_custom_category`, `prompt_store_create`, `prompt_store_delete`, or a `rollback`. |
| **Actor** | Who made the change, attributed from their verified sign-in identity (email / username). |
| **Time** | When the change was committed. |
| **Change summary** | Which config sections changed and a list of the individual fields that were added, removed, or updated. |

Snapshots are stored with credentials and secrets redacted, so provider API keys, AWS secrets, signing keys, and similar values never appear in audit history.

## Version Details

Open any version to see what actually changed:

- **Changed fields** - a compact list of field paths with their change type (added, removed, or updated).
- **Config diff** - a side-by-side comparison of the previous and new configuration.
- **Raw snapshots** - the full (redacted) previous and new config, available on demand.

This makes it easy to answer "what changed, when, and by whom" without diffing exports by hand.

## Rollback

When a change causes a problem, an admin can restore a previous version. Rollback applies **immediately** after a confirmation prompt that shows the target version, when it was changed, and by whom. The restore itself is recorded as a new version, so history stays complete and you can always roll forward again.

**Rollback restores** the app's provider settings, enabled guardrail categories, and API-key settings (including that app's custom categories).

**Rollback does not touch** tenant-wide settings such as cross-app permissions, the shared custom-category definition registry, or smart groups - these are managed separately and are intentionally out of scope.

:::note When rollback is blocked
Rollback fails if the target version no longer exists, or if the app or the target version has been revoked or made inactive. The confirmation surfaces the reason so nothing is half-applied.
:::

## Change Requests

When [self-service](./self-service) users with Settings Request Access submit a change, it lands here as a change request for an admin to review. The **Audit Log** tab lists requests for the current app, filterable by status.

| Status | Meaning |
|--------|---------|
| **Pending** | Awaiting an admin decision. |
| **Approved** | Reviewed and applied to the live config. |
| **Rejected** | Declined by an admin, with a reason. |
| **Failed** | Approved, but applying the change errored. |
| **Stale** | The app's config changed after the request was submitted, so it can no longer be applied safely. |

**Approving** a request applies the originally requested change to the live config as a normal, recorded edit. You can add an optional approval comment. As a safeguard, approval re-checks the app against the configuration the request was based on - if the config has changed since submission, the request is marked **stale** instead of applied, and the requester must resubmit against the current config.

**Rejecting** a request requires a reason, which is shown back to the requester. Approve and reject are only available on **pending** requests.

:::tip Admin edits stay direct
Approvals only govern self-service requests. An admin editing an app's settings directly still takes effect immediately - those edits are recorded in Config History, not routed through the approval queue.
:::

## Tenant-Wide Audit Log

Beyond a single app, an **Audit Log · all apps** view rolls up activity across every LLM Gateway app in your tenant. It combines two streams - committed config-history events and change-request workflow events - with status filters and a count of everything still pending approval, so admins can monitor governance across all apps from one place.

## Permissions

Viewing the audit log, approving or rejecting change requests, and rolling back versions all require the **LLM Gateway – Update** permission.

## Related

- [Self-Service](./self-service) - how users submit the change requests reviewed here.
- [Identity Aware](./identity-aware) - the per-user identity that powers actor attribution.
- [Security Guardrails](./security-guardrails) - the guardrail configuration whose changes are versioned here.
