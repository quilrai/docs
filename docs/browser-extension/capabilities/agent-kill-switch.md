---
sidebar_position: 3
sidebar_label: "Agent kill switch"
sidebar_custom_props:
  icon: Rocket
---

# Agent kill switch (extension)

The Browser Extension can switch off the QuilrAI agent on the endpoint and switch it back on, without restarting any process. While disabled, the agent stops its services (clipboard monitoring and file indexing) and processes no clipboard, file, or network DLP events. The disabled state survives reboots.

This page covers the switch in the extension. To disable the Endpoint Agent for a device or a whole tenant from the console, see the [Endpoint Agent kill switch](../../endpoint-agent/deploy-and-operate/agent-kill-switch).

<StepFlow steps={[
  { label: "Disable", items: ["Agent Settings in the extension", "Toggle Disable Agent"] },
  { label: "Agent stops", items: ["State saved to disk", "Services stopped", "DLP processing removed"] },
  { label: "Stays reachable", items: ["Only re-enable accepted", "Survives reboots ✓"] },
  { label: "Re-enable", items: ["Toggle Enable Agent", "Services restarted", "DLP restored ✓"] },
]} />

## Disable the agent

1. Open the Browser Extension and go to **Agent Settings**.
2. Toggle **Disable Agent**.

The extension sends the signal to the agent over the Native Messaging pipe, and the agent applies it immediately.

| What happens | Result |
| --- | --- |
| **State saved** | The disabled flag is written to the agent's local database and survives reboots. |
| **Services stopped** | Clipboard monitoring and file indexing stop. |
| **DLP processing removed** | No clipboard, file, or network DLP events are processed. |
| **Confirmed** | The extension receives confirmation and **Agent Status** shows Disabled. |

## Re-enable the agent

Toggle **Enable Agent** in the extension. The agent clears the flag, restarts its services, and restores DLP processing without a process restart. **Agent Status** shows Active.

## How it works

- **Re-enable is always available.** While disabled, the agent ignores every event except re-enable signals. This channel is never removed, so the extension can always restore the agent, including after a disable pushed by MDM or GPO.
- **Startup enforcement.** On every start, the agent reads the flag before it registers any service. If the agent is disabled, it skips service and DLP registration entirely and only listens for re-enable. Nothing is started and then torn down.
- **Logging.** Every disable and re-enable is logged with a timestamp and the trigger source.

| Agent state at startup | Behavior |
| --- | --- |
| Enabled | All services and DLP processing start normally. |
| Disabled | Nothing starts except the re-enable channel. |
