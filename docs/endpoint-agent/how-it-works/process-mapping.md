---
sidebar_position: 2
sidebar_label: "Process mapping"
sidebar_custom_props:
  icon: Rocket
---

# Process mapping

Process mapping is how the Endpoint Agent builds an inventory of applications and AI components on each device, ties running processes to those applications, and enforces execution policies. It starts discovery as soon as the agent runs.

<StepFlow steps={[
  { label: "Discover", items: ["Process monitor (10 s)", "File scanner (startup + 30 min)"] },
  { label: "Correlate", items: ["Process to app identity", "Cached lookups"] },
  { label: "Sync", items: ["Push discovered apps", "Pull governance"] },
  { label: "Enforce", items: ["Allow / Block", "Quarantine / Justify"] },
]} />

## What it discovers

| Method | What it finds |
| --- | --- |
| **OS installers** | Installed apps and programs (macOS apps, Windows installed programs). |
| **Package managers** | Binaries from npm, pip, go, gem, Homebrew, and Chocolatey. |
| **Process monitoring** | Running processes, matched to known applications. |
| **File system scan** | Standalone executables, AI agent configuration, and project files. |
| **AI agent discovery** | MCP servers, skills, plugins, hooks, models, and instruction files. |

Discovered items are grouped into these entity types:

| Entity | Examples |
| --- | --- |
| Application | Desktop apps, CLI tools, running processes |
| MCP server | MCP server configurations |
| Hook | Lifecycle hooks for AI tools such as Cursor and Claude |
| Skill | Agent skill definitions |
| Agent | AI agent configurations |
| Model | Downloaded or referenced AI models |
| Controlled repo | Git repositories under AI tool control |
| Permission | Tool permission configurations |
| Plugin | IDE plugins and extensions |

Discovered items appear in [Inventory](../../console/observe/inventory), [Agents](../../console/observe/agents), and the **Discovered** tab of the [Skills Library](../../console/settings-ai-gateway/skills-library).

## Policy actions

| Action | What happens |
| --- | --- |
| **Allow** | The application runs normally; activity is logged. |
| **Block** | The application is terminated and the user is notified. |
| **Quarantine** | The executable is renamed in place (it can be restored) and the event is logged. |
| **Justify** | The user is asked for a justification before continuing. |

Policies come from the console (approval status, execution policy, and criticality per application). See [App policies](../configure/app-policies). Every decision and enforcement action is recorded for audit.

## How it works

| Stage | What happens |
| --- | --- |
| **Process monitor** | Polls running processes every 10 seconds and tracks new processes, exits, and PID reuse. |
| **File scanner** | Runs at startup and every 30 minutes. Walks configured paths and runs sandboxed discovery scripts to find AI entities. |
| **Correlator** | Maps process names and executable paths to application identities, using a cache with a 300-second lifetime per entry. |
| **Entity store** | Holds the current inventory in memory and publishes added, updated, removed, and governance-changed events. |
| **Sync** | Uploads discovered entities to the backend and pulls governance overrides. See [Backend connectivity](./backend-connectivity). |
| **Enforcer** | Applies the execution policy when an entity changes: terminates blocked processes (POSIX signals on macOS, process termination APIs on Windows), quarantines, or logs. |

The agent snapshots its inventory to disk every 30 seconds. After a crash or restart it reloads the snapshot and resumes syncing from where it left off; replaying governance updates is safe.
