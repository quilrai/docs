---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get up and running with File Indexing in 4 steps.

<StepFlow steps={[
  {
    label: "Configure Paths",
    items: [
      "Root: /Users/alice/Documents",
      "Ignore: node_modules, .git",
      "Interval: 60 min",
    ],
  },
  {
    label: "Initial Scan",
    items: [
      "Trigger: config push",
      "Walker: parallel scan",
      "Index: built ✓",
    ],
  },
  {
    label: "Real-time Watch",
    items: [
      "Watcher: OS-native events",
      "Batch window: 300 ms",
      "Updates: incremental ✓",
    ],
  },
  {
    label: "Monitor Index",
    items: [
      "Files indexed: 24,310",
      "Status: Idle",
      "Last scan: 2 min ago",
    ],
  },
]} />

## 1. Configure Index Paths

Go to **File Indexing → Settings** in the dashboard and set the paths and rules for the endpoint.

| Setting | Description |
|---------|-------------|
| **Root paths** | Directories to index. Supports macOS and Windows paths. |
| **Ignore patterns** | gitignore-style globs for paths to exclude (e.g. `**/node_modules/**`, `**/.git/**`, `*.tmp`). |
| **Scan interval** | How often a full re-scan runs. Default is 60 minutes. |
| **Max files** | Ceiling for total indexed files. Safety limits apply automatically when approached. |

Network shares, UNC paths, and macOS disk images are excluded automatically — no configuration needed.

## 2. Trigger the Initial Scan

A scan is triggered automatically when:
- A configuration update is pushed from the dashboard
- The Sentinel agent starts or restarts

The scan runs at reduced OS priority so it does not affect endpoint performance. Navigate to **File Index Status** to track progress.

## 3. Enable Real-time Watching

The file watcher runs continuously alongside scheduled scans, keeping the index current between full sweeps.

| Platform | OS API |
|----------|--------|
| **macOS** | FSEvents |
| **Windows** | ReadDirectoryChangesW |

Filesystem changes are collected in 300 ms windows and written to the index in a single atomic operation. No additional configuration is required — the watcher starts automatically with the indexing service.

## 4. Monitor Index Health

Check **File Index Status** in the dashboard to confirm the index is healthy and up to date.

- **Scan status**: Idle / Running / Failed with last-run timestamp
- **File count**: total indexed paths and any pruned by safety limits
- **Watcher events**: create, modify, and delete counts per hour
- **Search hit rate**: how often DLP file resolution hits the index vs. falls back to disk

---

**Next step:** See the [Architecture](./architecture) for full scan, watch, and search pipeline details.
