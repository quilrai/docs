---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the Sentinel endpoint agent enforces the kill switch — persisting state, stopping all DLP services, and restoring them on demand, without a process restart.

<ArchitectureDiagram
  source={{
    label: "Control Plane",
    code: `// Backend API (polled every ~30 min)
endpointAgentEnabled = false      // device-level
tenantEndpointAgentEnabled = false // tenant-level (wins)

// Browser Extension (Native Messaging)
{ "disable_agent": true  }  // kill
{ "disable_agent": false }  // revive

// IT / launchctl (immediate, macOS)
sudo launchctl bootout "system/com.sentinel.agent"`,
  }}
  gateway={{
    label: "QuilrAI Sentinel Agent",
    phases: [
      {
        label: "Receive & Persist",
        stages: [
          { label: "Kill Switch Handler", items: ["Backend poll (~30 min cycle)", "Extension via Native Messaging", "IT via launchctl (immediate)"] },
          { label: "Flag Hierarchy", items: ["Tenant flag overrides device flag", "Writes boolean to local SQLite DB", "WAL mode — no application mutex"] },
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
| **Kill Switch Handler** | Accepts disable signals from three sources: backend API (polled every ~30 min), browser extension (Native Messaging), and IT via `launchctl`. Persists the flag to the local database, then applies kill or revive synchronously. |
| **Flag Hierarchy** | Tenant-level flag (`tenantEndpointAgentEnabled`) takes priority over device-level flag (`endpointAgentEnabled`). If the tenant flag is `false`, device flags are ignored. |
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

## Sub-feature Flags

Individual capabilities can be disabled independently of the top-level kill switch, but require a code change (not remotely toggleable today).

| Sub-feature | What it does | Config flag |
|-------------|--------------|-------------|
| Enforcement | Kills non-compliant processes | `enforcement.enabled` |
| Enforcement dry-run | Logs violations but does NOT kill processes | `enforcement.dry_run` |
| File scanning | Scans for sensitive files (`.claude`, `.cursor`, etc.) | `scan.enabled` |
| Hook integrity | Verifies Claude/Cursor hook files aren't tampered | `hook_manager.enabled` |
| Package scanning (npm/cargo/go) | Scans installed packages | `pkg_scanner.enabled` |

If a sub-feature must be stopped before engineering can deploy, use the tenant or device-level kill switch to disable the entire agent.

## State Machine

| Event | From | To | What Happens |
|-------|------|----|-------------|
| Backend poll: `endpointAgentEnabled = false` | Enabled | Disabled | Flag persisted; chains removed; services stopped |
| Backend poll: `tenantEndpointAgentEnabled = false` | Enabled | Disabled | Tenant flag overrides; all devices in tenant disabled |
| `disable_agent: true` received (extension) | Enabled | Disabled | Flag persisted; chains removed; services stopped |
| `disable_agent: false` received (extension) | Disabled | Enabled | Flag cleared; chains restored; services started |
| `launchctl bootout` (IT) | Enabled | Stopped | Process terminated immediately; restarts on bootstrap |
| Agent starts, flag = disabled | — | Disabled | Registration skipped; only re-enable chain active |
| Agent starts, flag = enabled | — | Enabled | All chains and services registered normally |

## Observability

Kill and revive transitions are logged at warning level with the full list of affected chains and services. Check **Agent Status** in the dashboard to verify the current state of each endpoint.
