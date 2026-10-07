---
sidebar_position: 4
sidebar_label: "Validate deployment"
sidebar_custom_props:
  icon: ListChecks
description: "Verify management assignment, browser policy, native processes, console registration, and synthetic telemetry independently."
---

# Validate deployment

Prove the extension, native agent, browser policy, network path, console registration, and detections as separate layers.

**Navigation:** Use the GPO or MDM status, `chrome://policy` or `edge://policy`, the browser extensions page, Task Manager or Activity Monitor, **Users › Browser deployment**, **Findings**, and **Audit Logs** in the QuilrAI console.

**Configuration and options:** Validate with the same assignment scope and time window used for deployment. Use approved synthetic data only; record versions, timestamps, device, user, policy, control, and finding ID.

**Role-specific value:** Administrators verify assignment and health; Security Engineers isolate failures by layer and confirm evidence reaches the platform.

**Verification:** Every layer has positive evidence. An unsuccessful setup can be assigned to policy, package, permissions, network, process, registration, control, or detection.

## Enterprise installation validation

| Layer | Successful result | Unsuccessful indicators |
| --- | --- | --- |
| GPO or MDM | Task/app/profile reports success for the intended device. | Failed/pending status, task exit error, device out of scope, or policy conflict. |
| Browser policy | Extension ID appears in `ExtensionInstallForcelist` or the equivalent managed policy without conflict. | Policy absent, blocked, invalid update URL, or competing MDM entries. |
| Browser | QuilrAI extension is listed, enabled, and marked as installed by enterprise policy. | Extension missing, disabled, removable, or showing an update error. |
| Native process | Quilr native messaging agent is running after the browser starts. | Process missing, crashes on launch, or dependency error. |
| Console | **Users › Browser deployment** shows the user as reporting, on the latest extension version, in the expected browser. | User missing or not reporting, or the version is behind the latest. |
| Telemetry | An approved positive synthetic event produces a finding and the behavior configured for the control's mode. | No finding for a matching event, or behavior differs from the saved control. A user-facing prompt is not required in Monitor mode. |

## Validation procedure

1. Force the applicable GPO or MDM synchronization and confirm a successful task, app, or profile result for one targeted device.

2. Open `chrome://policy` or `edge://policy`, reload policies, and verify the QuilrAI extension ID and update URL are present without conflict.

3. Open the browser extensions page and confirm the extension is enabled and enterprise managed.

4. On Windows, confirm the Quilr installation folder and native messaging process. On macOS, confirm the native process in Activity Monitor and the deployed Full Disk Access profile.

   The native processes are typically `Quilr-native-messaging-agent-mac` on macOS and `Quilr-native-messaging-agent-xxx.exe` on Windows. Process names and installation paths can vary with the package; compare them with the [local process and log references](../../console/legacy-v1/troubleshooting#local-process-and-log-references).

5. Open **Users › Browser deployment**. Confirm the user is reporting and compare the browser and extension version with the endpoint.

6. Run an approved positive synthetic test and a negative test. Confirm the visible action matches Monitor or Action mode and that the finding contains the expected user, AI asset, control, source, and outcome.

7. For Endpoint Agent coverage, repeat the console health and telemetry checks in **Users › Endpoint deployment**. See [Endpoint Agent deployment and status](../../endpoint-agent/deploy-and-operate/deployment-and-status).

**Expected result:** Installation, connectivity, and expected operation are supported by evidence from the management plane, endpoint, and QuilrAI console.

**Verification:** Store the management result, policy output, version/process evidence, Browser deployment status, finding ID, test time, and reviewer. Do not expand scope when any layer remains contradictory or stale.

If a layer fails, use [Troubleshooting](../../console/legacy-v1/troubleshooting) before expanding the deployment.
