---
sidebar_position: 3
sidebar_label: "Agent kill switch"
description: "Switch the extension's native Browser Agent off and on, and which other switches stop the extension or the Endpoint Agent."
sidebar_custom_props:
  icon: Rocket
---

# Browser Agent kill switch

The Browser Extension can switch off its native Browser Agent on a device and switch it back on, without restarting any process. While disabled, the Browser Agent stops [clipboard monitoring](./clipboard-monitoring) and [file indexing](./file-indexing) and processes no clipboard or file DLP events. The disabled state survives reboots.

## Which switch to use

This switch stops only the Browser Agent. It does not turn off the extension itself or the separately installed Endpoint Agent.

| To stop | Use | Scope |
| --- | --- | --- |
| The Browser Agent (clipboard and file indexing) | This page | One device |
| The Browser Extension | **Browser Extension** on or off in **Settings › Browser Extension**, then **Force Update** to push the change to managed browsers. See [Extension settings](../configure/extension-settings). | Every managed browser in the tenant |
| The Endpoint Agent | The [Endpoint Agent kill switch](../../endpoint-agent/deploy-and-operate/agent-kill-switch), which also has Windows and macOS commands for an immediate local stop | One workstation or the tenant |

The Endpoint Agent kill switch page has the full matrix, required permissions and a canary recovery sequence.

<StepFlow steps={[
  { label: "Disable", items: ["Admin uses the console", "Toggle Disable Agent"] },
  { label: "Browser Agent stops", items: ["State saved on the device", "Services stopped", "DLP processing removed"] },
  { label: "Stays reachable", items: ["Only re-enable accepted", "Survives reboots ✓"] },
  { label: "Re-enable", items: ["Toggle Enable Agent", "Services restarted", "DLP restored ✓"] },
]} />

## Disable the Browser Agent

An admin toggles **Disable Agent** in the console.

The extension sends the signal to the Browser Agent over the Native Messaging pipe, and the Browser Agent applies it immediately.

| What happens | Result |
| --- | --- |
| **State saved** | The disabled flag is written to the Browser Agent's local database and survives reboots. |
| **Services stopped** | Clipboard monitoring and file indexing stop. |
| **DLP processing removed** | No clipboard or file DLP events are processed. |
| **Confirmed** | The extension receives confirmation and **Agent Status** shows Disabled. |

## Re-enable the Browser Agent

An admin toggles **Enable Agent** in the console. The Browser Agent clears the flag, restarts its services, and restores DLP processing without a process restart. **Agent Status** shows Active.

To verify on the device, copy a harmless test value that a clipboard rule would act on and check that the expected prompt or finding appears again.

## How it works

- **Re-enable stays available.** While disabled, the Browser Agent ignores every event except re-enable signals. This channel is never removed, so the extension can always restore it.
- **Startup enforcement.** On every start, the Browser Agent reads the flag before it registers any service. If it is disabled, it skips service and DLP registration entirely and only listens for re-enable. Nothing is started and then torn down.
- **Logging.** Every disable and re-enable is logged with a timestamp and the trigger source.

| State at startup | Behavior |
| --- | --- |
| Enabled | All services and DLP processing start normally. |
| Disabled | Nothing starts except the re-enable channel. |
