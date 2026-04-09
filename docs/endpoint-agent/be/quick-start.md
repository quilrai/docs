---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get the Sentinel agent connected to the Quilr backend in 4 steps.

<StepFlow steps={[
  {
    label: "Configure",
    items: [
      "Base URL: api.quilr.ai",
      "Tenant ID: from dashboard",
      "Auth: X-Tenant-ID + X-Subscriber-ID",
    ],
  },
  {
    label: "Sync Apps",
    items: [
      "Auto-push on startup",
      "Batches of 50, gzip-compressed",
      "Visible in Applications tab",
    ],
  },
  {
    label: "Pull Governance",
    items: [
      "Delta sync every 60s",
      "No agent restart needed",
      "Approval status + policy",
    ],
  },
  {
    label: "Report Activity",
    items: [
      "Enforcement audit log",
      "Block & quarantine alerts",
      "Fire-and-forget",
    ],
  },
]} />

## 1. Configure Backend Connection

The agent reads its connection settings from the local configuration file in the data directory. Set these values before starting the agent:

```toml title="sentinel.toml"
[backend]
# Quilr backend API root
base_url       = "https://api.quilr.ai"

# Your organization's tenant UUID — find it in Settings → Organization
tenant_id      = "<your-tenant-uuid>"

# Subscriber identifier — find it in Settings → Subscribers
subscriber_id  = "<your-subscriber-id>"
```

Replace the placeholder values with your credentials from the **Quilr dashboard**.

## 2. Verify Discovery Sync

Once the agent starts, it pushes discovered apps to the backend automatically. Check the backend received them:

- Go to **Applications** in the Quilr dashboard
- Discovered apps appear within the first polling cycle (startup + every 30 min)
- Each entity includes device ID, user, OS type, and canonical identity

The agent batches up to 50 entities per request, compresses with gzip, and retries on failure.

## 3. Confirm Governance Pull

The agent polls for governance overrides every 60 seconds via [delta sync](./architecture#api-endpoints). After setting a policy in the dashboard:

- Policy changes reach the agent within the next poll cycle
- No agent restart needed
- The agent applies the override immediately to its in-memory EntityStore

## 4. Check Activity Reporting

Enforcement events (block, quarantine, justify) are reported to the backend as they happen:

- **Activity sync** : enforcement audit log per decision
- **Alert sync** : block and quarantine alerts for dashboard notifications

Both are fire-and-forget. Critical alerts are buffered in a local SQLite database if the backend is unreachable and retried automatically.
