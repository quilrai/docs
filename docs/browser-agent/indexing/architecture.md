---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the QuilrAI File Indexer builds and maintains a local filesystem index on the endpoint, driven by configuration from the dashboard, to resolve file paths for DLP scanning.

<ArchitectureDiagram
  source={{
    label: "Dashboard / Extension",
    code: `# File index settings
Root paths:    /Users/alice/Documents
               C:\\Users\\Alice\\Documents
Ignore:        node_modules, .git, *.tmp
Scan interval: every 60 min
Max files:     500,000`,
  }}
  gateway={{
    label: "QuilrAI File Indexer",
    phases: [
      {
        label: "Configure",
        stages: [
          { label: "Config Push", items: ["Pushed from dashboard", "Root paths + ignore rules", "Triggers immediate re-index"] },
          { label: "Mount Policy", items: ["Network shares excluded", "Disk images excluded (macOS)", "Tenant overrides supported"] },
        ],
      },
      {
        label: "Scan",
        stages: [
          { label: "Full Scan", items: ["Parallel directory walker", "1,000-file batch writes", "Safety limits enforced"] },
          { label: "Safety Guards", items: ["Soft limit: reduces scan depth", "Hard limit: prunes deepest paths", "Timeout: prevents data loss on partial scan"] },
        ],
      },
      {
        label: "Watch",
        stages: [
          { label: "Real-time Watcher", items: ["OS-native events (FSEvents / ReadDirectoryChangesW)", "300 ms batch window", "Atomic database updates"] },
        ],
      },
      {
        label: "Serve",
        stages: [
          { label: "File Search", items: ["Filename lookup from index (phase 1)", "Disk metadata verification (phase 2)", "Platform search fallback"] },
        ],
      },
    ],
    footer: "Logging  ·  Safety Guards  ·  Cross-platform  ·  Real-time Watching",
  }}
  destination={{
    label: "DLP Engine",
    items: ["File Path Resolution", "Upload Scanning", "Download Scanning", "DLP Findings", "Audit Trail"],
  }}
/>

## Pipeline Stages

Every index operation flows through these stages. Each stage is independently configurable from the dashboard.

| Stage | Description |
|-------|-------------|
| **Config Push** | Dashboard pushes root paths, ignore rules, and scan interval to the endpoint agent. Triggers an immediate re-scan on receipt. |
| **Mount Policy** | Evaluates each root path before scanning. Excludes network shares, Windows UNC paths, and macOS mounted disk images automatically. |
| **Full Scan** | A parallel directory walker traverses configured paths at reduced OS thread priority. Results are batch-written to a local SQLite index. |
| **Safety Guards** | Three-level protection: soft limit reduces scan depth near the file ceiling; hard limit prunes the deepest paths after a scan; a 30-minute timeout prevents data loss on partial scans. |
| **Real-time Watcher** | Listens for filesystem changes using OS-native APIs and applies incremental updates in 300 ms batched transactions. |
| **File Search** | Resolves file paths for DLP in two phases: fast index lookup by filename, followed by disk verification of size and modification time. |

## Scheduling

| Trigger | Default | Description |
|---------|---------|-------------|
| **Config push** | Immediate | Fires on every dashboard configuration update |
| **Scheduled scan** | Every 60 min | Periodic full re-scan to catch changes missed by the watcher |
| **Agent start** | On startup | Ensures the index is current on every (re-)start |

## Platform Support

| Platform | Directory Scan | File Watcher |
|----------|---------------|-------------|
| **macOS** | Parallel walker at background priority | FSEvents |
| **Windows** | Parallel walker at below-normal thread priority | ReadDirectoryChangesW |

## Observability

Index state and scan history are available from the dashboard under **File Index Status**.

- **Scan status**: Idle / Running / Failed with last-run timestamp and duration
- **File count**: total indexed files and any paths pruned by safety limits
- **Watcher activity**: create, modify, and delete event counts
- **Search performance**: index hit rate vs. disk-verification fallback rate
