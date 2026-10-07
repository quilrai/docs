---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the QuilrAI Process Mapping engine discovers, monitors, and governs every application and AI agent on the endpoint.

<ArchitectureDiagram
  source={{
    label: "Endpoint",
    code: `# Discovery sources
Process Monitor   → polls every 10s (sysinfo)
File Scanner      → startup + 30min poll (Lua sandbox)
Backend SSE       → governance overrides in real-time`,
  }}
  gateway={{
    label: "QuilrAI Process Mapping",
    phases: [
      {
        label: "Discover",
        stages: [
          { label: "Process Monitor", items: ["sysinfo polling (10s)", "PID reuse detection", "New / exited process tracking"] },
          { label: "File Scanner", items: ["Lua scripting sandbox", "AI config file discovery", "Startup + 30 min poll"] },
        ],
      },
      {
        label: "Correlate",
        stages: [
          { label: "Correlator", items: ["Two-level cache (alias + app)", "300s TTL per entry", "Path-based resolution"] },
          { label: "EntityStore", items: ["DashMap (concurrent)", "Broadcast change events", "Added / Updated / Removed"] },
        ],
      },
      {
        label: "Sync",
        stages: [
          { label: "Ingest Service", items: ["POST /sync/discovered-apps", "Gzip-compressed batches", "Canonical ID assignment"] },
          { label: "Delta Sync", items: ["GET /sync/delta", "Governance overrides", "Approval status + policy"] },
        ],
      },
      {
        label: "Enforce",
        stages: [
          { label: "Enforcer", items: ["Block: kill + notify", "Quarantine: kill + log", "Allow / Audit: log only"] },
          { label: "Snapshot Timer", items: ["JSON dump every 30s", "Crash recovery on startup", "Idempotent delta replay"] },
        ],
      },
    ],
    footer: "Activity Logging  ·  Delta Sync  ·  Crash Recovery  ·  Process Attribution",
  }}
  destination={{
    label: "Quilr Backend",
    items: ["App Catalog", "Governance Policies", "Process Mappings", "Delta Endpoint", "Audit Dashboard", "SSE Stream"],
  }}
/>

## Pipeline Stages

Every discovery and process event flows through these stages in order.

| Stage | Description |
|-------|-------------|
| **Process Monitor** | Polls macOS / Windows for running processes every 10s via `sysinfo`. Detects new processes, exits, and PID reuse. |
| **File Scanner** | Walks configured paths and runs Lua scripts in a sandbox to discover AI entities (MCP servers, hooks, skills, agents, models, repos, plugins). |
| **Correlator** | Maps process names and executable paths to application identities using a two-level cache (alias + app, 300s TTL). |
| **EntityStore** | In-memory `DashMap` with broadcast channel for change events (`Added`, `Updated`, `Removed`, `GovernanceUpdated`). Central hub for sync and enforcement. |
| **Ingest Service** | Batch uploads discovered entities to the backend via `POST /ea/v1/sync/discovered-apps` (gzip-compressed). |
| **Delta Sync** | Polls `GET /ea/v1/sync/delta` for governance overrides (approval status, execution policy, criticality). |
| **Enforcer** | Subscribes to EntityStore change events. Enforces execution policies: block, quarantine, audit, or allow. |

## Entity Types

| Entity | Description |
|--------|-------------|
| **Application** | Desktop apps, CLI tools, running processes |
| **MCP Server** | Model Context Protocol server configurations |
| **Hook** | Lifecycle hooks for AI tools (Cursor, Claude, etc.) |
| **Skill** | AI skill / capability definitions |
| **Agent** | AI agent configurations |
| **Model** | Downloaded or referenced AI models |
| **Controlled Repo** | Git repositories under AI tool control |
| **Permission** | Tool permission configurations |
| **Plugin** | IDE plugins and extensions |

## Persistence

In-memory `DashMap` for concurrent hot-path access, with periodic JSON snapshots for crash recovery.

| Feature | Description |
|---------|-------------|
| **Snapshot interval** | JSON dump every 30 seconds |
| **Recovery** | On startup, loads snapshot and resumes delta sync from persisted cursor |
| **Crash safety** | Delta sync cursor persisted before applying overrides; replays are idempotent |

## Platform Support

| Platform | Process Discovery | File Scanner | Enforcement |
|----------|------------------|-------------|-------------|
| **macOS** | `sysinfo` crate (polling) | Lua scripting sandbox | POSIX signals (SIGTERM, SIGKILL) |
| **Windows** | `sysinfo` crate (polling) | Lua scripting sandbox | Windows process termination APIs |

## Observability

Every discovery event, governance override, and enforcement action is logged with entity identity, policy match, and action taken. Ingest Service and Delta Sync maintain continuous bidirectional sync with the Quilr backend.
