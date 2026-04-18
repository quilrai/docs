---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the Sentinel endpoint agent enforces the kill switch — persisting state, stopping all DLP services, and restoring them on demand, without a process restart.

<ArchitectureDiagram
  source={{
    label: "Browser Extension",
    code: `// Sent from Agent Settings in the extension
// Delivered via Native Messaging pipe
{ "disable_agent": true  }  // kill
{ "disable_agent": false }  // revive`,
  }}
  gateway={{
    label: "QuilrAI Sentinel Agent",
    phases: [
      {
        label: "Receive & Persist",
        stages: [
          { label: "Kill Switch Handler", items: ["Receives disable signal", "Writes flag to local SQLite DB", "No application mutex — WAL mode"] },
          { label: "Startup Enforcement", items: ["Reads flag on every boot", "Disabled: skips all registration", "Only re-enable channel created"] },
        ],
      },
      {
        label: "Kill",
        stages: [
          { label: "Event Broker", items: ["Removes all DLP process chains", "Preserved chain kept active", "No new events processed"] },
          { label: "Service Manager", items: ["Stops clipboard monitor", "Stops file indexing service", "All services reach Stopped state"] },
        ],
      },
      {
        label: "Revive",
        stages: [
          { label: "Event Broker", items: ["Re-registers all DLP chains from config", "Full event routing restored", "No restart required"] },
          { label: "Service Manager", items: ["Restarts all configured services", "Clipboard monitoring resumes", "File indexing resumes"] },
        ],
      },
    ],
    footer: "Persisted State  ·  Startup Enforcement  ·  No Restart Required  ·  Preserved Re-enable",
  }}
  destination={{
    label: "Endpoint Services",
    items: ["Clipboard Monitor (stopped / started)", "File Indexing (stopped / started)", "All DLP chains (removed / restored)", "Persisted across reboots"],
  }}
/>

## Pipeline Stages

| Stage | Description |
|-------|-------------|
| **Kill Switch Handler** | The sole handler for the disable signal. Persists the flag to the local database, then applies the kill or revive operation synchronously. Returns confirmation to the extension on completion. |
| **Local Database** | Stores `disable_agent` as a boolean in a single-row configuration table. WAL mode ensures concurrent reads are never blocked. The flag persists across process restarts and reboots. |
| **Startup Enforcement** | On every agent start, the flag is read before any service or chain is registered. If disabled, all registration is skipped — nothing is created and torn down, services and chains simply never come into existence. |
| **Event Broker — Kill** | Removes all DLP process chains at runtime. Only the re-enable chain (`AgentUpdate:Configuration:Disable`) remains registered. |
| **Service Manager — Kill** | Calls stop on every running service. Clipboard monitor and file indexer reach `Stopped` state immediately. |
| **Event Broker — Revive** | Re-registers all DLP chains from the compiled chain configuration. Full event routing is restored. |
| **Service Manager — Revive** | Restarts all configured services from `Stopped` state. Full DLP coverage resumes. |

## Preserved Chain

One chain is never removed during a kill:

| Chain | Purpose |
|-------|---------|
| `AgentUpdate:Configuration:Disable` | Accepts re-enable signals from the extension at all times |

This guarantees the extension can always reach the agent to restore it — even after a managed disable deployed via MDM or GPO.

## State Machine

| Event | From | To | What Happens |
|-------|------|----|-------------|
| `disable_agent: true` received | Enabled | Disabled | Flag persisted; chains removed; services stopped |
| `disable_agent: false` received | Disabled | Enabled | Flag cleared; chains restored; services started |
| Agent starts, flag = disabled | — | Disabled | Registration skipped; only re-enable chain active |
| Agent starts, flag = enabled | — | Enabled | All chains and services registered normally |

## Observability

Kill and revive transitions are logged at warning level with the full list of affected chains and services. Check **Agent Status** in the dashboard to verify the current state of each endpoint.
