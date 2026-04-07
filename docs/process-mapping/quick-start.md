---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get up and running with Process Mapping in 4 steps.

<StepFlow steps={[
  {
    label: "Deploy Agent",
    items: [
      "Platform: macOS / Windows",
      "Auto-discovery: immediate",
      "Background service: always-on",
    ],
  },
  {
    label: "Review Apps",
    items: [
      "OS installed: ✓",
      "Package managers: ✓",
      "AI agents: MCP, skills, hooks",
    ],
  },
  {
    label: "Set Policies",
    items: [
      "Allow / Block / Quarantine",
      "Justify with popup prompt",
      "Per-app policy rules",
    ],
  },
  {
    label: "Monitor",
    items: [
      "Discovery events: real-time",
      "Process spawns: correlated",
      "Enforcement: full audit trail",
    ],
  },
]} />

## 1. Deploy the System Monitor

Runs as a background service on each endpoint. Starts discovery immediately on first boot.

| Platform | Coverage |
|----------|----------|
| **macOS** | Installed apps, Homebrew, npm/pip/go globals, standalone binaries |
| **Windows** | Installed programs, Chocolatey, npm/pip/go globals, standalone binaries |

Deployed alongside the Sentinel endpoint agent.

## 2. Review Discovered Applications

| Discovery Method | What It Finds |
|-----------------|---------------|
| **OS Installers** | Apps from native package managers |
| **Package Managers** | npm, pip, go, gem, Homebrew, Chocolatey binaries |
| **Process Monitoring** | Running processes correlated to applications |
| **File System Scan** | Standalone executables, AI agent configs, project files |
| **AI Agent Discovery** | MCP servers, skills, plugins, hooks, models, instruction files |

Navigate to **Applications under Process Mapping** to see your inventory.

## 3. Configure Policies

| Policy Action | Description |
|---------------|-------------|
| **Allow** | Application runs normally; activity is logged |
| **Block** | Application is terminated and prevented from running |
| **Quarantine** | Executable is renamed in place; supports restore |
| **Justify** | User is prompted for a justification before continuing |

Policies are evaluated through a **Process Chain**: enriches each event with catalog data, evaluates policies, resolves actions, and logs the decision. Every enforcement action is recorded for audit.

## 4. Monitor Activity

Every discovery event, policy decision, and enforcement action is logged and synced to the Quilr dashboard.

- **Discovery events** : new applications found with identity and catalog metadata
- **Process spawns** : real-time correlation of running processes to known applications
- **Policy decisions** : which policy matched, what action was taken, and why
- **Enforcement actions** : block, quarantine, justify outcomes with full audit trail
- **AI agent artifacts** : MCP servers, skills, plugins, hooks, and models per app

