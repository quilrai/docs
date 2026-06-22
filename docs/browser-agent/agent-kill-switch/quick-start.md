---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Disable and re-enable the Sentinel endpoint agent from the browser extension in 4 steps.

<StepFlow steps={[
  {
    label: "Open Agent Settings",
    items: [
      "Extension: Agent Settings",
      "Status: Active",
      "Toggle: Disable Agent",
    ],
  },
  {
    label: "Agent Disables",
    items: [
      "State: persisted to disk",
      "Services: stopped",
      "DLP chains: removed",
    ],
  },
  {
    label: "Re-enable Channel Active",
    items: [
      "Re-enable: always accepted",
      "Survives reboots: ✓",
      "No other events processed",
    ],
  },
  {
    label: "Re-enable Agent",
    items: [
      "Toggle: Enable Agent",
      "Services: restarted",
      "DLP chains: restored ✓",
    ],
  },
]} />

## 1. Disable the Agent

Open the browser extension, navigate to **Agent Settings**, and toggle **Disable Agent**. The extension sends the disable signal to the Sentinel agent over the Native Messaging pipe.

The agent responds immediately — no process restart is required.

## 2. What Happens on the Endpoint

| Step | Result |
|------|--------|
| **Flag persisted** | Disabled state written to local database — survives reboots |
| **Services stopped** | Clipboard monitoring and file indexing pause immediately |
| **DLP chains removed** | No clipboard, file, or network DLP events are processed |
| **Confirmed** | Extension receives confirmation; **Agent Status** updates to Disabled |

## 3. Re-enable Channel

While disabled, the agent ignores all events except re-enable signals. The re-enable channel is permanently preserved and cannot be removed — the extension can always reach the agent to restore it.

If the endpoint reboots while disabled, the agent starts in the disabled state automatically. No action is required to maintain the disabled state across restarts.

## 4. Re-enable the Agent

Toggle **Enable Agent** in the extension. All services and DLP chains are restored without a process restart.

| Step | Result |
|------|--------|
| **Flag cleared** | Enabled state written to local database |
| **Services restarted** | Clipboard monitoring and file indexing resume |
| **DLP chains restored** | Full event processing resumes immediately |
| **Confirmed** | Extension receives confirmation; **Agent Status** updates to Active |

---

**Next step:** See the [Architecture](./architecture) for the full disable and startup enforcement details.
