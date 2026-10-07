---
sidebar_position: 4
sidebar_label: "App audit log"
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
      "Administrator edits guardrails",
      "Save ✓",
    ],
  },
  {
    label: "Version Recorded",
    items: [
      "v7 · configuration update",
      "Actor: administrator",
      "Changed: security guardrails",
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

Every configuration change to an app is captured as an immutable version. Open the app's **Settings > Audit Log** (under **Operations**) to browse that history, inspect what changed, roll back to a previous version, and review change requests submitted by [self-service](../self-service/overview) users.

![Audit Log section with the Change requests table and the Configuration versions list](/img/llm-gateway/ui/app-audit-log.png)

## Config History

Each configuration change records a new version snapshot. A version captures:

| Field | Description |
|-------|-------------|
| **Version** | A sequential number for display (`v7`). Each version also has a stable ID used for rollback. |
| **Operation** | What triggered the change - for example `update_config`, `set_tags`, `jwt_auth_settings`, `update_custom_category`, `prompt_store_create`, `prompt_store_delete`, or a `rollback`. |
| **Actor** | Who made the change, attributed from their verified sign-in identity (email / username). |
| **Time** | When the change was saved. |
| **Change summary** | Which configuration sections changed and a list of the individual fields that were added, removed, or updated. |

Snapshots are stored with credentials and secrets redacted, so provider API keys, AWS secrets, signing keys, and similar values never appear in audit history.

## Version Details

Each entry in **Configuration versions** shows the version number, the operation, who made the change and when, and its change summary. The live version is tagged **Current**. If you can edit the app, each version has a **Roll back** button. Below the versions, **Audit events** lists configuration and request events for the app.

Use this view to review "what changed, when, and by whom" without manually comparing exports.

## Rollback

When a change causes a problem, an admin can restore a previous version. Rollback applies **immediately** after a confirmation prompt that shows the target version, when it was changed, and by whom. The restore itself is recorded as a new version, so history stays complete and you can always roll forward again.

**Rollback restores** the app's provider settings, enabled guardrail categories, and API-key settings (including that app's custom categories).

**Rollback does not touch** tenant-wide settings such as cross-app permissions, shared custom-category definitions, smart groups, or [Policy Engine](../../console/govern/policy-engine) revisions. Policies have their own revision history and rollback.

:::note When rollback is blocked
Rollback fails if the target version no longer exists, or if the app or the target version has been revoked or made inactive. The confirmation surfaces the reason so nothing is half-applied.
:::

## Change Requests

When [self-service](../self-service/developer-guide) users with Settings Request Access submit a change, it appears here as a change request for an admin to review. The **Audit Log** section lists requests for the current app, filterable by status.

| Status | Meaning |
|--------|---------|
| **Pending** | Awaiting an admin decision. |
| **Approved** | Reviewed and applied to the live configuration. |
| **Rejected** | Declined by an admin, with a reason. |
| **Failed** | Approved, but the change could not be applied. |
| **Stale** | The app's configuration changed after the request was submitted, so it can no longer be applied safely. |

**Approving** a request applies the originally requested change to the live configuration as a normal, recorded edit. You can add an optional approval comment. As a safeguard, approval re-checks the app against the configuration the request was based on - if the configuration has changed since submission, the request is marked **stale** instead of applied, and the requester must resubmit against the current configuration.

**Rejecting** a request requires a reason, which is shown to the requester. Approve and reject are only available on **pending** requests.

:::tip Admin edits stay direct
Approvals only govern self-service requests. An admin's direct edits to an app's settings still take effect immediately - those edits are recorded in Config History, not routed through the approval queue.
:::

## Tenant-Wide Audit Log

Beyond a single app, the **Audit log** button on the **Settings > AI Gateway > LLM Gateway** page opens a tenant-wide view of activity across every app, with the application, operation, actor, status and time of each event. It combines configuration changes and change-request events, with status filters and a count of everything still pending approval, so admins can monitor governance across all apps from one place.

## Permissions

Viewing the audit log, approving or rejecting change requests, and rolling back versions all require the **LLM Gateway – Update** permission.

## Related

- [Self-Service](../self-service/overview) - how users submit the change requests reviewed here.
- [Self-Service Admin Guide](../self-service/admin-guide) - grant Settings Request Access or Direct Settings Update.
- [Identity Aware](../protect/identity-and-network-trust) - the per-user identity that powers actor attribution.
- [Security Guardrails](../protect/security-guardrails) - the guardrail configuration whose changes are versioned here.
