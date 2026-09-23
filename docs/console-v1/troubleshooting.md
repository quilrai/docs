---
sidebar_position: 7
sidebar_custom_props:
  icon: Wrench
description: "Diagnose deployment, telemetry, policy, and export issues; locate logs and confirm operational readiness."
---

# Troubleshooting and Completion Checklist

Resolve missing telemetry, unexpected outcomes, stale data, and export issues systematically, then confirm operational readiness.

**Navigation:** Use Deployment Status, saved policy/model configuration, Findings, Audit Log, Exports, and the relevant endpoint/browser local state.

**Configuration and options:** Troubleshoot layer by layer: access → deployment → connectivity → persona/scope → model → policy → user experience → finding → export.

**Role-specific value:** Administrators coordinate ownership and rollback; Engineers isolate the failing layer and collect evidence without exposing sensitive content.

**Verification:** Each symptom has an identified layer, owner, corrective action, and retest result.

## Quick triage

| Symptom | Checks |
| --- | --- |
| No browser device/persona | Tenant ID, forced install scope, native utility, browser restart, outbound 443, persona settings/exclusions, Last Seen. |
| Endpoint absent/stale | Tenant ID, service/system extension, certificates, network filter, privacy approvals, outbound 443, version, Last Seen. |
| No finding | Source selection, date range/Clear All, policy enabled/scope, model/pattern enabled, propagation, correct app/event, synthetic sample. |
| Unexpected allow/block | Monitor vs Action, selected response, mandatory/additional conditions, group membership, rule priority, app category/status, version. |
| High false-positive volume | Matched model/pattern, contextual vs non-contextual choice, negative tests, scope, app/event conditions, repeated source. |
| Export mismatch/failure | Current-filter summary, date window, result count/limit, permissions, job status, expiry, retry record. |
| Unexplained configuration | Audit actor/time/code/category/action/resource/status/severity and the approved change record. |

## Completion checklist

- [ ] Access to all required administrative and investigation sections is verified.

- [ ] Tenant ID, deployment owners, staged deployment group, approver, rollback owner, and support path are recorded.

- [ ] Required hosts are allowed on TCP 443 and certificate/TLS handling is approved.

- [ ] Browser Extension plus native utility are installed, enabled, current, and recently seen.

- [ ] Endpoint service/system components, certificates, filters, and privacy approvals are healthy.

- [ ] Required detection models/patterns are enabled and synthetic positive/negative tests are documented.

- [ ] Policies have clear names, descriptions, severity, mode, status, scenario/conditions, action, scope, owner, and review date.

- [ ] Browser and endpoint functional tests produced the expected user experience and findings.

- [ ] Users, Accounts, AI Assets, Insights, and findings can be connected in an investigation; Applications is not used because it is end-of-life.

- [ ] Audit events and scoped exports support the change/investigation record.

- [ ] Screenshots and exported evidence shared for review have unnecessary identity information and sensitive content removed.

- [ ] Production promotion criteria, exception path, review cadence, and retirement process are approved.

## Tenant-specific limits and verification gaps

- The source guide documents procedures; it does not establish that an installer or policy change was tested on a managed production endpoint.

- Obtain the tenant ID from the provisioning administrator or QuilrAI support; it was not visible in the inspected pages.

- Confirm the exact Custom Detection field set and test results in your tenant. The guide gives a workflow but does not establish every field.

- The documented Audit Log details are the row fields and optional Description; a separate detail drawer was not established.

- The inspected AI Insights and Governance Reports screens had no direct export control. Use supported underlying detail views.

- SaaS AI Assets summary metrics and table fields depend on populated sources. Confirm available row actions for the selected asset.

- The guide does not specify exact export retention duration. Confirm it before relying on the Exports queue for long-term evidence storage.

**Final operational principle:** Start small, preserve evidence, separate telemetry from interpretation, and promote enforcement only after the policy’s scope and user impact are understood.

## Enterprise deployment diagnostics

| Symptom | Diagnostic path | Corrective action |
| --- | --- | --- |
| Extension is not visible | Inspect `chrome://policy` or `edge://policy`, `ExtensionInstallForcelist`, extension management JSON, target scope, browser restart, and management conflicts. | Correct the GPO/MDM assignment or manifest URL, remove conflicting management entries through the owning system, synchronize policy, and restart the browser. |
| GPO task fails | Confirm the UNC path is reachable as the computer account; inspect share and NTFS Read permission plus TaskScheduler/Operational, System, and Application logs. | Grant the target computer group access, correct the task action/tenant argument, and rerun through Group Policy. |
| Native process is absent | Launch the native agent manually and capture its error. On Windows, check the Visual C++ runtime dependency. | Install the approved Microsoft VC++ redistributable when missing, then restart the browser and verify the native process. |
| macOS installation is incomplete | Confirm the correct architecture PKG, `/tmp/agent.conf` tenant value, Full Disk Access profile, and deployment ordering. | Deploy Full Disk Access before the PKG, correct architecture/scope, then rerun the MDM or Jamf policy. |
| Sensitive data is not detected | Check the tenant-approved DLP/network endpoint, model enablement, policy scope/mode, browser policy, time range, and synthetic sample. | Correct the approved allowlist or configuration, then repeat positive and negative tests without using live sensitive data. |

## Local process and log references

| Platform | Process or log | Use |
| --- | --- | --- |
| Windows | `C:\Program Files\Quilr\quilr-native-messaging-agent.exe` | Run manually only for diagnosis; capture dependency or startup errors. |
| Windows runtime | `%APPDATA%\sentinel\sentinel.log` | Review native runtime and connectivity behavior for the affected user. |
| Windows install/update | `%PROGRAMFILES%\Quilr\log\quilr-update.log` | Review installation and update activity. |
| macOS | `/usr/local/bin/quilr-native-messaging-agent` | Run manually only for diagnosis and capture the result. |
| macOS install | `/var/log/quilr/quilr.log` | Review package installation behavior. |
| macOS runtime | `~/Library/Application Support/Sentinel/logs/sentinel.log` | Review the affected user’s runtime and connectivity behavior. |

**Escalation package:** Contact [support@quilr.ai](mailto:support@quilr.ai) through the approved support process. Include the tenant identifier, operating system and version, browser and version, device-management method, affected scope, timestamp and timezone, exact error, masked screenshots, relevant logs, and troubleshooting already attempted. Remove credentials, tokens, and unnecessary sensitive content before transmission.

Package names and local paths in this guide are examples from the supplied deployment procedures. Confirm the executable and logs for the installed version before applying a detection rule or starting a process manually.
