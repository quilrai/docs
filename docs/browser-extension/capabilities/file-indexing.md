---
sidebar_position: 2
sidebar_label: "File indexing"
sidebar_custom_props:
  icon: Rocket
---

# File indexing

File indexing keeps a local index of files on the endpoint so the DLP engine can quickly resolve the real file behind an upload or download and scan it. The QuilrAI agent builds the index from paths you configure, keeps it current with OS file events, and re-scans on a schedule.

<StepFlow steps={[
  { label: "Configure", items: ["Root paths", "Ignore patterns", "Scan interval"] },
  { label: "Scan", items: ["Parallel walker", "Low OS priority", "Safety limits"] },
  { label: "Watch", items: ["OS-native file events", "300 ms batches", "Incremental updates"] },
  { label: "Serve", items: ["Index lookup", "Disk verification", "DLP file resolution"] },
]} />

## Settings

File indexing settings are managed with your QuilrAI representative and pushed to the agent. Each update triggers an immediate re-scan.

| Setting | Description |
| --- | --- |
| **Root paths** | Directories to index. Supports macOS and Windows paths. |
| **Ignore patterns** | gitignore-style globs to exclude, for example `**/node_modules/**`, `**/.git/**`, `*.tmp`. |
| **Scan interval** | How often a full re-scan runs. Default: 60 minutes. |
| **Max files** | Ceiling on total indexed files. Safety limits apply as the index approaches it. |

Network shares, Windows UNC paths, and macOS mounted disk images are excluded automatically.

## When scans run

| Trigger | When |
| --- | --- |
| Configuration update | Immediately on every settings change. |
| Agent start | On every start or restart of the agent. |
| Scheduled scan | Every scan interval (default 60 minutes), to catch changes the watcher missed. |

Scans run at reduced OS priority (background priority on macOS, below-normal thread priority on Windows) so they do not slow the endpoint.

## How it works

| Stage | What happens |
| --- | --- |
| **Mount policy** | Each root path is checked first; network shares and disk images are skipped. |
| **Full scan** | A parallel directory walker traverses the root paths and writes results to a local index in batches. |
| **Safety guards** | Near the file ceiling, a soft limit reduces scan depth. After a scan, a hard limit prunes the deepest paths. A 30-minute timeout prevents data loss from a partial scan. |
| **Real-time watcher** | OS file events (FSEvents on macOS, ReadDirectoryChangesW on Windows) are collected in 300 ms windows and applied to the index in one atomic update. It starts automatically; no configuration is needed. |
| **File search** | For DLP, the agent looks up the filename in the index, then verifies size and modification time on disk. If the index has no match, it falls back to the platform's own search. |

## Monitor index health

Index state is reported back to QuilrAI and includes:

- **Scan status**: Idle, Running, or Failed, with the last run time and duration.
- **File count**: total indexed files and any paths pruned by safety limits.
- **Watcher activity**: create, modify, and delete event counts.
- **Search hit rate**: how often file resolution is served from the index versus falling back to disk.

To pause file indexing together with the agent's other services, use the [agent kill switch](./agent-kill-switch).
