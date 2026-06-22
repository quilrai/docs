---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the Sentinel agent communicates with the Quilr backend: what it sends, what it receives, and when.

<ArchitectureDiagram
  source={{
    label: "Sentinel Agent",
    code: `[backend]
base_url   = "https://api.quilr.ai"
tenant_id  = "<uuid>"
auth_token = "<token>"`,
  }}
  gateway={{
    label: "Backend Sync",
    phases: [
      {
        label: "Discover",
        stages: [
          { label: "Ingest", items: ["POST /ea/v1/sync/discovered-apps", "Batches of 50", "Gzip-compressed", "202 Accepted"] },
          { label: "Unknown Processes", items: ["POST /ea/v1/sync/unknown-processes", "Unmapped PIDs", "Backend identifies"] },
        ],
      },
      {
        label: "Govern",
        stages: [
          { label: "Delta Sync", items: ["GET /ea/v1/sync/delta", "Poll every 120s", "Approval + policy overrides"] },
          { label: "Process Map", items: ["GET /ea/v1/sync/process-map", "Name-to-app mappings", "Used by Correlator"] },
        ],
      },
      {
        label: "Report",
        stages: [
          { label: "Activity Log", items: ["POST /ea/v1/sync/activity", "Per-decision audit record", "Fire-and-forget"] },
          { label: "Alerts", items: ["POST /ea/v1/sync/alerts", "Block / quarantine events", "Dashboard notifications"] },
        ],
      },
    ],
    footer: "Bearer Auth  ·  Tenant-scoped  ·  Gzip Compression  ·  Retry on Failure",
  }}
  destination={{
    label: "Quilr Backend",
    items: ["App Catalog", "Governance Policies", "Process Mappings", "Delta Endpoint", "Audit Dashboard", "Alert Queue"],
  }}
/>

## API Endpoints

| Direction | Method | Description |
|-----------|--------|-------------|
| Agent → Backend | POST | Batch push discovered entities |
| Agent → Backend | POST | Per-decision enforcement audit log |
| Agent → Backend | POST | Block and quarantine alert notifications |
| Backend → Agent | GET | Governance overrides: approval status, execution policy |
| Backend → Agent | GET | Name-to-app mappings used by the Correlator |

## Sync Cadence

| Operation | Trigger | Frequency |
|-----------|---------|-----------|
| App ingest | New entities discovered | On discovery (startup + every 30 min) |
| Delta pull | Scheduled timer | Every 60 seconds |
| Activity report | Enforcement event | Immediate, fire-and-forget |
| Alert | Block / quarantine action | Immediate, fire-and-forget |

## Authentication

All requests include the following tenant-scoped headers:

| Header | Value |
|--------|-------|
| `X-Tenant-ID` | Tenant UUID from the dashboard |
| `X-Subscriber-ID` | Subscriber identifier from the dashboard |

These headers are set on every outbound request and are used by the backend for multi-tenant routing and isolation.

## Local Persistence

The agent maintains local state to ensure reliability across restarts and network outages.

| Component | Format | Purpose |
|-----------|--------|---------|
| **Alert Queue** | SQLite | Buffers enforcement alerts when backend is offline. |
| **Entity Store** | JSON | Periodic snapshot of discovered apps and AI entities. |
| **Sync Cursor** | JSON | Persists the last-seen delta timestamp for incremental sync. |

## Reliability

| Feature | Behavior |
|---------|----------|
| **Ingest retries** | Retries on network failure; batches are idempotent. |
| **Offline Buffering** | Alerts are queued in the local SQLite DB and synced when connectivity returns. |
| **Delta cursor** | Persisted to disk before applying overrides; replays safely on restart. |
| **Activity / alerts** | Critical alerts are buffered; non-critical activity logs are fire-and-forget. |
| **Gzip compression** | All ingest payloads compressed to reduce bandwidth. |
