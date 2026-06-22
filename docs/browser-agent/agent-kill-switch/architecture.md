---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the browser extension disables and re-enables the Sentinel endpoint agent at runtime — without a process restart, with state persisted across reboots.

<ArchitectureDiagram
  source={{
    label: "Browser Extension",
    code: `// Sent from Agent Settings in the extension
{ "disable_agent": true  }  // disable
{ "disable_agent": false }  // re-enable`,
  }}
  gateway={{
    label: "QuilrAI Kill Switch",
    phases: [
      {
        label: "Receive",
        stages: [
          { label: "Native Messaging", items: ["Extension sends disable signal", "Delivered over stdio pipe", "Routed to kill-switch handler"] },
        ],
      },
      {
        label: "Persist",
        stages: [
          { label: "State Storage", items: ["disable_agent flag written to local DB", "Survives process restarts", "Read at every agent startup"] },
        ],
      },
      {
        label: "Apply",
        stages: [
          { label: "Kill", items: ["All DLP event chains removed", "All services stopped", "Re-enable chain preserved"] },
          { label: "Revive", items: ["All DLP event chains restored", "All services restarted", "Full DLP coverage resumes"] },
        ],
      },
    ],
    footer: "Persisted State  ·  No Restart Required  ·  Re-enable Always Available",
  }}
  destination={{
    label: "Endpoint Agent",
    items: ["DLP chains removed / restored", "Services stopped / started", "Re-enable always accepted", "State persists across reboots"],
  }}
/>

## Pipeline Stages

Every kill switch transition flows through these stages in order.

| Stage | Description |
|-------|-------------|
| **Native Messaging** | The extension sends `{ "disable_agent": true }` or `{ "disable_agent": false }` over the Native Messaging pipe to the Sentinel agent. |
| **State Storage** | The agent persists the flag to its local database immediately. The state is restored on every subsequent startup — no re-disable needed after a reboot. |
| **Kill** | All DLP event chains are removed from the event broker and all services (clipboard monitor, file indexer) are stopped. The re-enable chain remains active. |
| **Revive** | All DLP event chains are restored and all services are restarted. The agent resumes full operation without a process restart. |

## Always-On Re-enable

One channel is never removed, even when the agent is fully disabled:

> `AgentUpdate:Configuration:Disable` — accepts re-enable signals from the extension at all times.

This guarantees the extension can always reach the agent to restore it, even after a managed disable pushed via MDM or GPO.

## Startup Enforcement

When the Sentinel agent starts with the disabled flag set:

| Flag | Startup Behaviour |
|------|------------------|
| **Enabled** | All services and DLP chains registered normally |
| **Disabled** | All service and chain registration skipped; only the re-enable channel is active |

Nothing is created and torn down — services and chains simply never come into existence in the disabled startup path.

## Observability

Every kill and revive transition is logged with timestamp and trigger source. Check **Agent Status** in the dashboard to verify the current state.
