---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Disable or restore the Sentinel endpoint agent without a code deploy. Pick the action that matches your scenario.

<StepFlow steps={[
  {
    label: "Single Device",
    items: [
      "Who: dashboard admin",
      "How: set endpointAgentEnabled = false",
      "Effect: next poll cycle (~30 min)",
    ],
  },
  {
    label: "Entire Tenant",
    items: [
      "Who: tenant admin",
      "How: set tenantEndpointAgentEnabled = false",
      "Effect: next poll cycle (~30 min)",
    ],
  },
  {
    label: "Immediate Stop",
    items: [
      "Who: IT / helpdesk (sudo)",
      "How: launchctl bootout",
      "Effect: immediate",
    ],
  },
  {
    label: "Roll Back",
    items: [
      "Who: IT or MDM",
      "How: re-run installer with --force",
      "Effect: ~5 minutes",
    ],
  },
]} />

## Quick Reference

| Situation | Action | Time to Effect |
|-----------|--------|----------------|
| Disable agent for **one device** | Backend: set `endpointAgentEnabled = false` | Next poll cycle (~30 min) |
| Disable agent for **entire tenant** | Backend: set `tenantEndpointAgentEnabled = false` | Next poll cycle (~30 min) |
| Disable agent **right now** on one machine | IT: `launchctl bootout` (see below) | Immediate |
| Roll back to a previous version | IT: re-run installer script (see below) | ~5 minutes |
| Disable a specific sub-feature | Engineering required — see [Sub-feature Flags](#sub-feature-flags) | Requires deploy |

---

## 1. Disable for a Single Device

> **Who**: Anyone with access to the Quilr admin dashboard or backend API.

The agent goes dormant but stays installed. It re-checks every ~30 minutes and resumes if the flag is turned back on.

| Step | Action |
|------|--------|
| **1** | Log in to the Quilr admin backend (BFF) |
| **2** | Find the device record by device ID or user email |
| **3** | Set `endpointAgentEnabled = false` and save |
| **4** | Confirm: agent status endpoint returns `enabled: false` within one poll cycle |

To re-enable, set `endpointAgentEnabled = true` and save.

---

## 2. Disable for an Entire Tenant

> **Who**: Anyone with tenant-level admin access.

Disables the agent across all devices for that tenant. The tenant-level flag takes priority over device-level flags.

| Step | Action |
|------|--------|
| **1** | Log in to the Quilr admin backend |
| **2** | Find the tenant record |
| **3** | Set `tenantEndpointAgentEnabled = false` and save |
| **4** | Confirm: spot-check one or two devices — agents should stop within the next poll cycle |

To re-enable, set `tenantEndpointAgentEnabled = true` and save.

:::note
If the tenant flag is `false`, individual device flags are ignored — the tenant flag always wins.
:::

---

## 3. Immediate Stop on a Specific Machine

> **Who**: IT / helpdesk with sudo access to the macOS machine.

Use this when you cannot wait for the next backend poll cycle.

### Stop the agent

```bash
sudo launchctl bootout "system/com.sentinel.agent"
```

All monitoring and proxy interception ceases immediately.

### Verify the agent is stopped

```bash
sudo launchctl list | grep sentinel
```

Returns nothing if the agent is stopped.

### Restart the agent

```bash
sudo launchctl bootstrap system "/Library/LaunchDaemons/com.sentinel.agent.plist"
```

### Prevent restart on reboot (persistent stop)

```bash
sudo launchctl disable "system/com.sentinel.agent"
sudo launchctl bootout "system/com.sentinel.agent"
```

To re-enable after a persistent stop:

```bash
sudo launchctl enable "system/com.sentinel.agent"
sudo launchctl bootstrap system "/Library/LaunchDaemons/com.sentinel.agent.plist"
```

:::warning
Stopping via `launchctl` is temporary by default. The agent restarts on reboot unless you also run the `disable` command above.
:::

---

## 4. Roll Back to a Previous Version

> **Who**: IT with sudo access, or engineering via MDM.

### Option A — Re-run the installer

```bash
sudo /usr/local/sentinel/scripts/sentinel-endpoint.sh --env <environment> --force
```

Replace `<environment>` with `quartz`, `preprod`, or `secure`. The installer pulls the latest stable release and overwrites the broken version.

### Option B — Clear a stuck auto-rollback

If the agent auto-rolled back after a failed upgrade but the device is still having issues:

```bash
# Check what version was rejected
cat ~/.sentinel/.quarantined_version

# Remove the quarantine file to let the agent retry
rm ~/.sentinel/.quarantined_version
```

Then restart the agent (see Section 3).

### Confirm the active version

```bash
cat /usr/local/sentinel/VERSION
```

---

## Sub-feature Flags

The following sub-features have their own `enabled` flags but are **not yet remotely toggleable** without a code change. Open an incident ticket and tag the on-call engineer.

| Sub-feature | What it does | Config flag |
|-------------|--------------|-------------|
| Enforcement | Kills non-compliant processes | `enforcement.enabled` |
| Enforcement dry-run | Logs violations but does NOT kill processes | `enforcement.dry_run` |
| File scanning | Scans for sensitive files (`.claude`, `.cursor`, etc.) | `scan.enabled` |
| Hook integrity | Verifies Claude/Cursor hook files aren't tampered | `hook_manager.enabled` |
| Package scanning (npm/cargo/go) | Scans installed packages | `pkg_scanner.enabled` |

**Workaround while waiting for engineering**: Use the tenant or device-level kill switch (Sections 1–2) to stop the entire agent.

---

## Severity & Escalation

| Severity | Symptoms | First action | Escalate if |
|----------|----------|--------------|-------------|
| **P0 – Critical** | Agent breaking user workflows, blocking logins, data loss risk | Immediate stop via launchctl + tenant flag off | Not resolved in 15 min |
| **P1 – High** | Feature misbehaving for a group of users | Device-level flag off | Affecting >5 devices |
| **P2 – Medium** | Unexpected behavior, no immediate harm | Backend toggle + monitor | Persists after toggle |
| **P3 – Low** | Cosmetic, minor annoyance | Log ticket | — |

Tag `#sentinel-oncall` in Slack with the device ID, tenant ID, and what you observed.

---

## Verification Checklist

After any kill switch action:

- [ ] Agent status endpoint returns `enabled: false` for the affected device(s)
- [ ] `launchctl list | grep sentinel` shows not running (if stopped via IT)
- [ ] User confirms monitoring and proxy interception has stopped
- [ ] No new alerts or logs from the device for 5 minutes post-action
- [ ] If tenant-wide: spot-check at least 3 devices from the tenant

---

## Re-enabling After an Incident

1. Confirm the root cause has been identified.
2. Confirm a fix is in place (code deploy, config change, or false alarm).
3. Re-enable at the device level first (one test device) and monitor for 10 minutes.
4. If clean, re-enable for the full tenant.
5. Post a brief incident summary in `#sentinel-oncall` with what was toggled and when.

---

**Next step:** See the [Architecture](../../../endpoint-agent/agent-kill-switch/architecture) for the full enforcement pipeline and state machine.
