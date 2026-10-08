---
sidebar_position: 1
sidebar_label: "Deployment and status"
description: "Silent install recipes for Windows and macOS, tenant binding, detection and uninstall, then coverage tracking in Users › Endpoint deployment."
sidebar_custom_props:
  icon: Activity
---

# Deployment and status

Roll the Endpoint Agent out to your fleet, then use the console to track coverage and switch individual workstations on or off.

## What you receive

Your QuilrAI representative supplies the agent packages (MSI, PKG, macOS configuration profiles and certificates) with your tenant ID. For a step-by-step walk-through, from prerequisites to troubleshooting, follow the [installation SOP](./installation-sop). This page is the reference for silent installs.

| Platform | Package |
| --- | --- |
| **Windows** | An MSI installer, `quilrai-endpoint-agent.msi`. |
| **macOS** | A signed installer package (`.pkg`), plus configuration profiles for the system extension and Full Disk Access, and the QuilrAI root and intermediate CA certificates. |

The Endpoint Agent package is separate from the Browser Extension's native Browser Agent. Do not reuse the Browser Agent install commands from the [Browser Extension deployment pages](../../browser-extension/get-started/prerequisites).

Before you start, check OS versions, network destinations and platform approvals in [Requirements](../get-started/requirements).

## Bind the agent to your tenant

The installer needs your tenant ID. It uses it to look up your tenant's backend and DLP hosts. Supply it in one of these ways:

| Platform | Options |
| --- | --- |
| **Windows** | The `TENANTID` MSI property; or the machine environment variable `QUILR_TENANT_ID`; or a file `C:\ProgramData\QuilrAI\tenant_id` containing only the ID, created before the install. |
| **macOS** | A package built for your tenant; or a file `/Library/Application Support/QuilrAI/tenant_id` containing only the ID, written by a pre-install script before the package runs. |

## Windows recipe

1. Deploy the MSI as a line-of-business or Win32 app (Intune), or with your software distribution tool, in system context:

   ```powershell
   msiexec /i quilrai-endpoint-agent.msi /qn /l*v C:\Windows\Temp\quilrai-install.log TENANTID=<your-tenant-id>
   ```

2. The install fails with exit code `1603` if the tenant's backend cannot be resolved, for example because the tenant ID is wrong or the QuilrAI discovery host is blocked (see [Requirements](../get-started/requirements)). Details are in the log file.
3. **Detection rule:** the file `%ProgramFiles%\QuilrAI\quilrai.exe` exists, or the MSI product code.
4. **Uninstall:** `msiexec /x <ProductCode> /qn`, or assign the app for uninstall in your management tool.

## macOS recipe

1. Deploy the configuration profiles first: the system extension profile, the Full Disk Access profile, and a certificate payload with the QuilrAI root and intermediate CA certificates.
2. Wait until devices report the profiles as installed.
3. If you use the universal package, deploy a pre-install script that writes your tenant ID to `/Library/Application Support/QuilrAI/tenant_id`.
4. Deploy the `.pkg`. It installs as root and needs no user interaction when the profiles are in place.
5. **Detection rule:** `/Applications/QuilrAIProxy.app` and `/Library/LaunchDaemons/com.quilrai.agent.plist` exist, or the package receipt `ai.quilr.agent.endpoint.installer`.
6. **Uninstall:**

   ```bash
   sudo "/Library/Application Support/QuilrAI/quilrai-endpoint-uninstaller" --force
   ```

For per-tool walk-throughs (Microsoft Intune, Jamf Pro, Kandji, ManageEngine Endpoint Central), see <SopLink track="endpoint-agent" step="installing-using-mdm" />. To install on one test device from the command line, see <SopLink track="endpoint-agent" step="manual-installation" />.

After the first install, the agent keeps itself up to date. See [Requirements](../get-started/requirements#security-and-updates).

## Pilot first

Deploy to a small group first, confirm the checks in [Confirm a healthy rollout](#confirm-a-healthy-rollout) and <SopLink track="endpoint-agent" step="verify-mdm-install" />, then widen the assignment. If devices fail to install or check in, work through <SopLink track="endpoint-agent" step="troubleshooting" />.

## Watch coverage

<ConsolePath console="QuilrAI console" path={['Users', 'Endpoint deployment']} />

| KPI | Meaning |
| --- | --- |
| **Workstations** | Workstations where the agent has checked in with QuilrAI. |
| **Enabled** | Workstations where the agent is enabled. |
| **Disabled** | Workstations where the agent is disabled. |
| **Without persona** | Workstations where no persona links activity to a person. Check the persona options in [Agent settings](../configure/agent-settings). |
| **Latest version** | Workstations running the latest agent version. |

The table lists each **Workstation**, **User**, **Operating system**, **Agent version**, **Status**, and **Last registered** time (the last time the agent checked in). Use **Search** and the status and version filters to find a device.

## Reconcile assigned and reporting devices

The **Workstations** count shows devices whose agent has checked in, not devices you assigned the package to. To find gaps:

1. Export the device names in your MDM assignment group, with each device's install status and last check-in time.
2. Search for those names in **Users › Endpoint deployment**.
3. Sort the gaps:

| What you see | Likely cause | Next step |
| --- | --- | --- |
| Installed in MDM, not listed | The agent has never checked in. | Check the tenant ID, the [network destinations](../get-started/requirements#network) and, on macOS, that the profiles and CA certificates arrived before the package. |
| Listed, **Last registered** much older than the MDM last check-in | The device is online but the agent is not reporting. | Check that the service is running (`QuilrAIAgent` on Windows, `com.quilrai.agent` on macOS). |
| Listed, **Last registered** old and MDM check-in also old | The device is offline. | No action until it comes back online. |
| Listed, not in the MDM group | Installed outside your assignment. | Decide whether to keep it, and add it to the group or uninstall. |

A running agent checks in with QuilrAI about every 2 minutes.

## Enable or disable workstations

Select one or more workstations and use the bulk **Enable** or **Disable** action. The action applies to every session on the workstation; a workstation whose sessions differ shows as **Mixed sessions**.

To turn the agent off for the whole tenant instead, use **Enable or Disable** in [Agent settings](../configure/agent-settings). For incident handling, timing and recovery, see [Agent kill switch](./agent-kill-switch).

## Confirm a healthy rollout

| Check | Where |
| --- | --- |
| Device listed with a recent **Last registered** (check-in) time | **Users › Endpoint deployment** |
| Agent version matches the latest | **Latest version** KPI and **Agent version** column |
| Persona created | **Without persona** count stays at zero for the pilot group |
| Apps and AI components discovered | [Inventory](../../console/observe/inventory) and [Agents](../../console/observe/agents) |
| Policies enforced | A safe test finding in [Findings and interactions](../../console/observe/findings-and-interactions) |

For one person's devices and sensor status, open their profile in [Users](../../console/observe/users) and go to **Deployment & devices**.
