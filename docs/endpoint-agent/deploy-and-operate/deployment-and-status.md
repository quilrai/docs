---
sidebar_position: 1
sidebar_label: "Deployment and status"
sidebar_custom_props:
  icon: Activity
---

# Deployment and status

Roll the Endpoint Agent out to your fleet, then use the console to track coverage and switch individual workstations on or off.

## Roll out the agent

1. **Get the package.** Agent packages are not downloadable from the console. Ask your QuilrAI administrator or representative for the current macOS and Windows packages and your tenant values.
2. **Check requirements.** Confirm OS versions, root/SYSTEM access, outbound 443, and platform approvals in [Requirements](../get-started/requirements).
3. **Deploy with your management tool.** Push the package with your MDM (for example Microsoft Intune, Jamf, or Kandji) or with Group Policy, running as root on macOS and SYSTEM on Windows. Use the install command and options supplied with the package; the installer registers the service and trusts the agent's certificate when run with `--trust-cert --register-as-service`.
4. **Start with a pilot group.** Deploy to a small group first, confirm the checks below, then widen the assignment.

:::note
The Endpoint Agent package is separate from the Browser Extension's native Browser Agent. Do not reuse the Browser Agent install commands from the [Browser Extension deployment pages](../../browser-extension/get-started/prerequisites) for the Endpoint Agent.
:::

On macOS, the System Extension must be approved in System Settings › Privacy & Security after the first install. The agent keeps itself up to date after that; see [Requirements](../get-started/requirements#security-and-updates).

## Watch coverage

<ConsolePath console="QuilrAI console" path={['Users', 'Endpoint deployment']} />

| KPI | Meaning |
| --- | --- |
| **Workstations** | Workstations that have registered with QuilrAI. |
| **Enabled** | Workstations where the agent is enabled. |
| **Disabled** | Workstations where the agent is disabled. |
| **Without persona** | Workstations where no persona links activity to a person. Check the persona options in [Agent settings](../configure/agent-settings). |
| **Latest version** | Workstations running the latest agent version. |

The table lists each **Workstation**, **User**, **Operating system**, **Agent version**, **Status**, and **Last registered** time. Use **Search** and the filters to find a device.

## Enable or disable workstations

Select one or more workstations and use the bulk **Enable** or **Disable** action. The action applies to every session on the workstation; a workstation whose sessions differ shows as **Mixed sessions**.

To turn the agent off for the whole tenant instead, use **Enable / Disable** in [Agent settings](../configure/agent-settings). For incident handling and timing, see [Agent kill switch](./agent-kill-switch).

## Confirm a healthy rollout

| Check | Where |
| --- | --- |
| Device registered and recent **Last registered** time | **Users › Endpoint deployment** |
| Agent version matches the latest | **Latest version** KPI and **Agent version** column |
| Persona created | **Without persona** count stays at zero for the pilot group |
| Apps and AI components discovered | [Inventory](../../console/observe/inventory) and [Agents](../../console/observe/agents) |
| Policies enforced | A safe test finding in [Findings and interactions](../../console/observe/findings-and-interactions) |

For one person's devices and sensor status, open their profile in [Users](../../console/observe/users) and go to **Deployment & devices**.
