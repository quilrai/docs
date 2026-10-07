---
sidebar_position: 2
sidebar_label: "Agent kill switch"
sidebar_custom_props:
  icon: Rocket
---

# Agent kill switch

Use the kill switch to stop the Endpoint Agent on one device or across your tenant, for example if it interferes with users' work, and to restore it afterwards. No reinstall or new package is needed.

<StepFlow steps={[
  { label: "One device", items: ["Disable the workstation", "Effect: next poll (~30 min)"] },
  { label: "Whole tenant", items: ["Disable tenant-wide", "Effect: next poll (~30 min)"] },
  { label: "Right now", items: ["IT stops the service locally", "Effect: immediate"] },
  { label: "Restore", items: ["Enable again", "Test device first ✓"] },
]} />

## Quick reference

| Situation | Action | Time to effect |
| --- | --- | --- |
| Disable the agent on **one device** | Set the device flag `endpointAgentEnabled` to off: **Disable** the workstation in **Users › Endpoint deployment** | Next poll cycle (about 30 minutes) |
| Disable the agent for the **whole tenant** | Set the tenant flag `tenantEndpointAgentEnabled` to off: **Disable** in **Settings › Endpoint Agent** | Next poll cycle (about 30 minutes) |
| Stop the agent **immediately** on one Mac | Local IT command (below) | Immediate |
| Disable from the browser | The [Browser Extension kill switch](../../browser-extension/capabilities/agent-kill-switch) | Immediate |

The agent checks these flags about every 30 minutes. A disabled agent goes dormant but stays installed, and resumes when the flag is turned back on.

:::note Tenant flag wins
If the tenant flag is off, device flags are ignored: every device in the tenant stays disabled until the tenant flag is turned back on.
:::

## Disable one device

1. Open **Users › Endpoint deployment** and search for the workstation.
2. Select it and choose **Disable**. The action applies to every session on that workstation.
3. Within one poll cycle, the workstation's **Status** shows it as disabled and the device stops sending new activity.

To restore, select the workstation and choose **Enable**.

## Disable the whole tenant

1. Open **Settings › Endpoint Agent** and turn the agent off under **Enable / Disable**. See [Agent settings](../configure/agent-settings).
2. After one poll cycle, spot-check a few workstations in **Users › Endpoint deployment**.

To restore, turn the agent back on.

## Stop immediately on a Mac

When you cannot wait for the next poll cycle, IT staff with `sudo` access can stop the agent locally. All monitoring and traffic interception stops at once.

```bash
# Stop the agent
sudo launchctl bootout "system/com.sentinel.agent"

# Check it is stopped (no output means stopped)
sudo launchctl list | grep sentinel

# Start it again
sudo launchctl bootstrap system "/Library/LaunchDaemons/com.sentinel.agent.plist"
```

A `launchctl bootout` lasts only until the next reboot. To keep the agent stopped across reboots, disable it first:

```bash
sudo launchctl disable "system/com.sentinel.agent"
sudo launchctl bootout "system/com.sentinel.agent"
```

To undo a persistent stop:

```bash
sudo launchctl enable "system/com.sentinel.agent"
sudo launchctl bootstrap system "/Library/LaunchDaemons/com.sentinel.agent.plist"
```

## Version problems

The agent rolls back automatically if a new version fails its health check after an update (see [Requirements](../get-started/requirements#security-and-updates)). If a device still misbehaves after an update, disable it as above and contact your QuilrAI representative for a known-good package. You can check the installed version on a Mac with `cat /usr/local/sentinel/VERSION`, or in the **Agent version** column of **Users › Endpoint deployment**.

## What happens on the device

| Event | Result |
| --- | --- |
| Agent receives a disable (console flag or extension) | The disabled state is saved to the agent's local database. All DLP processing stops and services (clipboard monitoring, file indexing) are stopped. |
| Agent starts while disabled | No services or DLP processing are started at all. The agent only listens for a re-enable. The disabled state survives reboots. |
| Agent receives a re-enable | The state is cleared, DLP processing is restored, and services restart without a process restart. |
| Local `launchctl bootout` | The process exits immediately and restarts on the next bootstrap or reboot (unless disabled). |

The re-enable channel is never removed, so a disabled agent can always be restored.

## Verify and recover

After any kill switch action:

- [ ] The affected workstations show as disabled in **Users › Endpoint deployment**.
- [ ] If stopped locally, `launchctl list | grep sentinel` returns nothing.
- [ ] No new activity or findings arrive from the device for a few minutes.
- [ ] For a tenant-wide action, spot-check at least three devices.

When the cause is fixed:

1. Re-enable one test device and watch it for about 10 minutes.
2. If it is healthy, re-enable the rest of the affected devices or the tenant.
3. Record what was disabled, when, and why, for your own change log.
