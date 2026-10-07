---
sidebar_position: 3
sidebar_label: "Backend connectivity"
sidebar_custom_props:
  icon: Rocket
---

# Backend connectivity

The Endpoint Agent talks to the QuilrAI backend over outbound HTTPS only. It pushes what it discovers, pulls governance decisions, and reports enforcement activity.

<StepFlow steps={[
  { label: "Configure", items: ["Tenant ID at install", "Backend found by lookup"] },
  { label: "Push discovery", items: ["Startup + every 30 min", "Batches of 50, gzip"] },
  { label: "Pull governance", items: ["Delta sync every 60 s", "No restart needed"] },
  { label: "Report activity", items: ["Audit log per decision", "Block / quarantine alerts"] },
]} />

## Connection settings

You do not edit a configuration file. At install time the agent is bound to your tenant ID (see [Deployment and status](../deploy-and-operate/deployment-and-status#bind-the-agent-to-your-tenant)) and looks up its tenant's backend and DLP hosts. Every request carries your tenant identity, which the backend uses to keep tenants isolated.

## What is exchanged

| Direction | Endpoint | Data | When |
| --- | --- | --- | --- |
| Agent to backend | `POST /ea/v1/sync/discovered-apps` | Discovered apps and AI entities, including device ID, user, OS, and identity. Returns `202 Accepted`. | At startup and every 30 minutes; batches of up to 50, gzip-compressed, retried on failure |
| Agent to backend | `POST /ea/v1/sync/unknown-processes` | Processes the agent could not map, for the backend to identify | As found |
| Backend to agent | `GET /ea/v1/sync/delta` | Governance overrides: approval status, execution policy, criticality | Delta sync every 60 seconds |
| Backend to agent | `GET /ea/v1/sync/process-map` | Process-name to application mappings | Used by the correlator |
| Agent to backend | `POST /ea/v1/sync/activity` | Enforcement audit record per decision | Immediately |
| Agent to backend | `POST /ea/v1/sync/alerts` | Block and quarantine alerts | Immediately |

Policy changes you make in the console reach the agent on the next delta sync and apply without a restart.

## Verify the connection

1. Discovered apps appear in [Inventory](../../console/observe/inventory) within the first discovery cycle.
2. The device appears in **Users › Endpoint deployment** with a recent **Last registered** time (the last time the agent checked in). See [Deployment and status](../deploy-and-operate/deployment-and-status).
3. After you change an [app policy](../configure/app-policies), the agent applies it within about a minute.

## Offline behavior

| Feature | Behavior |
| --- | --- |
| **Alert buffering** | Critical alerts are queued in a local database while the backend is unreachable and sent when connectivity returns. Non-critical activity logs are not buffered. |
| **Idempotent uploads** | Discovery batches can be retried safely. |
| **Sync cursor** | The last delta position is saved to disk before overrides are applied, so a restart resumes safely. |
| **Inventory snapshot** | Discovered entities are snapshotted to disk and reloaded at startup. |

Network requirements are listed in [Requirements](../get-started/requirements#network).
