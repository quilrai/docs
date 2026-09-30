---
sidebar_position: 1
sidebar_custom_props:
  icon: ShieldCheck
description: "Create, scope, test, promote, maintain, duplicate, and disable browser and endpoint controls."
---

# Policy Configuration and Lifecycle

Create, scope, test, promote, maintain, and retire controls without exposing the full tenant to unvalidated enforcement.

**Navigation:** Settings > Browser Extension > Detection Configuration for browser controls. Settings > Endpoint > Detection configurations for application guardrails and Group & User Rules.

**Configuration and options:** Browser controls include name, description, criticality, Monitor/Action mode, status, scenario, mandatory/additional conditions, and actions. Endpoint controls expose per-application guardrails, access control, and group/user scope.

**Role-specific value:** Administrators own naming, approval, scope, priority, mode, and lifecycle. Engineers test scenario matching, investigate exceptions, and recommend tuning.

**Verification:** The control appears in the list with the intended status/mode and produces the expected outcome for an in-scope staged group but not an out-of-scope test.

## Browser control: sensitive data shared with an AI application

1. Select Add. Enter Quilr Staged Sensitive Data as the Control Name, High as Criticality, a description, Monitor Mode, and Enabled status.

2. Select the scenario “a user shares sensitive data with an AI application.”

3. Review the generated mandatory conditions: Application > Category > is equal to > Generative AI; Data > Sensitive > is equal to > True.

4. Add a staged deployment-group scope through an available User/Smart Group condition if that scope is present in your tenant.

5. Review Configure Actions. In the inspected tenant, action families included Activate Agent, Remediation Action, and Just in Time.

6. Keep the first version in **Monitor** mode. Save only after the change record contains the owner, scope, expected event, and rollback plan.

![Browser control form with General fields, mode, status, and scenario area.](/img/console-v1/browser-control-general.png)

*Browser control form with General fields, mode, status, and scenario area.*

![Sensitive-data scenario and generated mandatory conditions.](/img/console-v1/browser-control-conditions.png)

*Sensitive-data scenario and generated mandatory conditions.*

![Browser Extension action families and available just-in-time choices.](/img/console-v1/browser-control-actions.png)

*Browser Extension action families and available just-in-time choices.*

| Action family | Verified choices and when to use |
| --- | --- |
| Activate Agent | User Collaborator AI Agent, Human Risk AI Agent, or Security Awareness where the tenant workflow calls for assisted follow-up. |
| Remediation Action | Send Alert to Syslog for integration with an approved downstream monitoring workflow. |
| Just in Time | Allow after removing sensitive data; allow original prompt with no, optional, or mandatory justification; or redact sensitive data. Choose only after testing the user experience. |

## Endpoint guardrail example

1. Open Endpoint > Detection configurations, locate ChatGPT, and select Guardrails.

2. Enable guardrails for the staged deployment group. Set PII to Justify for coaching; use Block for Auth & Secrets only after approval, or start in Monitor.

3. Open Group & User Rules, scope to the approved staged deployment group, and review any higher-priority rule.

4. If workspace restriction is required, enable Restrict Usage to Approved Workspaces and enter only approved workspace IDs.

![Endpoint application cards and control areas.](/img/console-v1/endpoint-application-controls.png)

*Endpoint application cards and control areas.*

![Endpoint application guardrails, access control, and category responses.](/img/console-v1/endpoint-application-guardrails.png)

*Endpoint application guardrails, access control, and category responses.*

## Maintain and troubleshoot a policy

| Lifecycle task | Operational practice |
| --- | --- |
| Inventory | Use search, type/category filters, status, mode, Created/Updated By, First Created, and Last Modified. Use list export only when that screen offers it. |
| Review | Reconfirm owner, purpose, conditions, action, scope, exception path, and last validation. |
| Promote | Monitor → Justify/coaching → targeted Block only after success criteria are met. |
| Unexpected result | Compare scenario, mandatory/additional conditions, model enablement, group membership, app category/status, propagation time, and device health. |
| Retire | Disable under change control, validate the intended finding stops, preserve audit/export evidence, then follow the organization’s retention process. |

**Expected result:** A named, staged-group scoped, monitor-first control is configured with explicit success criteria.

**Verification:** Allow propagation, run in-scope and out-of-scope synthetic tests, review the policy row and [Audit Log](../reporting/audit-log), and confirm the finding and control fields match the saved configuration.

## Control composition and lifecycle boundaries

| Element | Verified behavior | Administrative guidance |
| --- | --- | --- |
| Trigger and scenario | Selects the event or scenario evaluated by the control. | Name the use case and confirm the trigger with a positive and negative synthetic test. |
| Conditions | Mandatory conditions are locked; additional Application, Source, User, Data, and Agent conditions can be combined with AND/OR where available. | Keep condition logic minimal and document precedence, scope, and expected exclusions. |
| Actions | Available families include Just in Time, Remediation, and Activate Agent. | Begin in Monitor; approve user-facing or downstream actions only after validating impact. |
| Maintenance | A control can be duplicated. The inspected release did not expose bulk operations or policy import/export. | Use Duplicate for a controlled variant and compare every condition/action before activation. |
| Retirement | No delete action was exposed; disable the control. | Disable under change control, verify the expected finding stops, and preserve audit/export evidence. |

**Monitor-first window:** Run a new or materially changed control in Monitor for one to two weeks when operational volume permits. Review true positives, false positives, user groups, AI assets, outcomes, and version health before enabling an action. Shorten the window only for an approved urgent risk decision with explicit rollback criteria.

Use [Detection Models](./detection-models) to validate the matched category and [Findings](../investigations/findings) to confirm the resulting action.
