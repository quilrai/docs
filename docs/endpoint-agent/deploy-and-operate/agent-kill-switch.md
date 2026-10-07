---
sidebar_position: 2
sidebar_label: "Agent kill switch"
description: "Stop the Endpoint Agent on one device, across the tenant, or immediately on a Mac or Windows machine, then restore it with a canary."
sidebar_custom_props:
  icon: Rocket
---

# Agent kill switch

Use the kill switch to stop the Endpoint Agent on one device or across your tenant, for example if it interferes with users' work, and to restore it afterwards. No reinstall or new package is needed.

<StepFlow steps={[
  { label: "One device", items: ["Disable the workstation", "About 2 minutes"] },
  { label: "Whole tenant", items: ["Disable in Settings", "About 2 minutes"] },
  { label: "Right now", items: ["IT stops the service", "Immediate"] },
  { label: "Restore", items: ["Canary device first ✓"] },
]} />

## Which switch controls what

QuilrAI has three separately installed components on a device. Each switch stops only its own component.

| Switch | Where | Stops | Scope | Time to effect |
| --- | --- | --- | --- | --- |
| **Tenant Enable or Disable** | **Settings › Endpoint Agent** | Endpoint Agent | Every device in the tenant | Next check-in, about 2 minutes |
| **Workstation Disable** | **Users › Endpoint deployment** | Endpoint Agent | Selected workstations | Next check-in, about 2 minutes |
| **Local stop** | On the device (commands below) | Endpoint Agent service | One device | Immediate |
| **Browser Extension on or off** | **Settings › Browser Extension** | Browser Extension | Every managed browser | See [Extension settings](../../browser-extension/configure/extension-settings) |
| **Browser Agent kill switch** | Browser Extension | The extension's native Browser Agent | One device | See [Browser Agent kill switch](../../browser-extension/capabilities/agent-kill-switch) |

The Endpoint Agent ignores the Browser Extension's flags, and the Browser Extension switches do not stop the Endpoint Agent. To stop everything on a device, use the Endpoint Agent and the Browser Extension switches together.

**Precedence.** The agent runs only when both the tenant flag and its workstation flag are on. If the tenant flag is off, every device stays disabled whatever its workstation flag says. The two flags are stored separately: turning the tenant back on does not change any workstation flag.

**Who can do it.** Changing either console switch needs the **Manage Endpoint Agent** permission (Endpoint area) in [Roles and permissions](../../console/settings-organization/roles-and-permissions). A local stop needs administrator rights on the device (`sudo` on macOS, an elevated PowerShell on Windows).

## Disable one device

1. Open **Users › Endpoint deployment** and search for the workstation.
2. Select it and choose **Disable**. The action applies to every session on that workstation.
3. The agent picks up the change at its next check-in, about every 2 minutes.

To restore, select the workstation and choose **Enable**.

## Disable the whole tenant

1. Open **Settings › Endpoint Agent** and turn **Enable or Disable** off. See [Agent settings](../configure/agent-settings).
2. Every agent picks up the change at its next check-in, about every 2 minutes.

To restore, use the [canary sequence](#restore-with-a-canary) below rather than turning the tenant flag straight back on.

## Stop immediately on a device

When you cannot wait for the next check-in, IT staff can stop the agent locally. A local stop is not reported to the console.

The agent's updater runs every 30 minutes and starts the agent again if it is not running. To keep the agent stopped for longer than that, also stop the updater as shown under **Keep it stopped**.

### macOS

```bash
# Stop the agent
sudo launchctl bootout system/com.quilrai.agent

# Check it is stopped (no output means stopped)
pgrep -x quilrai
```

Keep it stopped across updater runs and reboots:

```bash
sudo launchctl bootout system/com.quilrai.endpoint.updater
sudo launchctl disable system/com.quilrai.endpoint.updater
sudo launchctl disable system/com.quilrai.agent
sudo launchctl bootout system/com.quilrai.agent
```

Start it again:

```bash
sudo launchctl enable system/com.quilrai.agent
sudo launchctl bootstrap system /Library/LaunchDaemons/com.quilrai.agent.plist
sudo launchctl enable system/com.quilrai.endpoint.updater
sudo launchctl bootstrap system /Library/LaunchDaemons/com.quilrai.endpoint.updater.plist
```

### Windows

Run in an elevated PowerShell:

```powershell
# Stop the agent and its child processes
Stop-Service -Name QuilrAIAgent -Force

# Check it is stopped (Status should be Stopped)
Get-Service -Name QuilrAIAgent
```

Keep it stopped across updater runs and reboots:

```powershell
Disable-ScheduledTask -TaskName "QuilrAI-Endpoint-Update"
Set-Service -Name QuilrAIAgent -StartupType Disabled
Stop-Service -Name QuilrAIAgent -Force
```

Start it again:

```powershell
Set-Service -Name QuilrAIAgent -StartupType Automatic
Start-Service -Name QuilrAIAgent
Enable-ScheduledTask -TaskName "QuilrAI-Endpoint-Update"
```

## What happens on the device

| Event | Result |
| --- | --- |
| Console disable (tenant or workstation) | At the next check-in the agent stops its traffic proxy (new connections are refused and in-flight requests finish) and its monitoring services. The core service keeps running so it can receive a re-enable. |
| Agent restarts while disabled | The disabled state is held by QuilrAI, not on the device. The agent applies it again at its next check-in. |
| Console re-enable | At the next check-in the agent restarts its services. No process restart or reinstall is needed. |
| Check-in fails (for example no network) | The agent keeps its last known state. |
| Local stop | The service and its child processes exit at once. The updater starts it again within 30 minutes unless you also stopped the updater. |

## Verify

The **Status** column in **Users › Endpoint deployment** shows the flag you set, not a confirmation from the device: the agent does not report its kill switch state back. Verify independently:

- [ ] After about 2 minutes, no new activity or findings arrive from the device in [Findings and interactions](../../console/observe/findings-and-interactions).
- [ ] For a local stop, `pgrep -x quilrai` returns nothing (macOS) or `Get-Service QuilrAIAgent` shows **Stopped** (Windows).
- [ ] For a tenant-wide action, spot-check at least three devices, including one Mac and one Windows machine.

## Restore with a canary

Because the tenant flag overrides workstation flags, you cannot test one device while the tenant flag is off. Use this sequence:

1. In **Users › Endpoint deployment**, select all workstations and choose **Disable**.
2. In **Settings › Endpoint Agent**, turn the tenant flag back on. Nothing restarts yet, because every workstation flag is off.
3. Enable one test workstation and watch it for about 10 minutes: normal browsing and apps work, and activity appears in the console.
4. Enable a small pilot group, then the rest of the fleet.

If you only disabled single workstations, skip steps 1 and 2.

For a local stop, run the start commands for the device's platform on one test machine first.

Record what was disabled, when, and why, for your own change log.

## Version problems

The updater checks for a new version every 30 minutes. After installing one, it waits for the agent to run stably and restores the previous version if it does not. If a device still misbehaves after an update, disable it as above and contact your QuilrAI representative. Check the installed version in the **Agent version** column of **Users › Endpoint deployment**.
