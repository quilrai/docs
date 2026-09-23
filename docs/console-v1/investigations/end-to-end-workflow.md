---
sidebar_position: 4
sidebar_custom_props:
  icon: Workflow
description: "Trace a sensitive-data signal through findings, identities, AI assets, controls, audit history, and exports."
---

# End-to-End Investigation Workflow

Demonstrate a repeatable path from an aggregate signal to a specific issue and an accountable action.

**Navigation:** Begin in Insights or AI Assets, then pivot through Users/Accounts, Findings, Detection Models, policy configuration, Audit Log, and Exports.

**Configuration and options:** Keep a single date range and write down every pivot key: user, account, AI asset/domain, finding ID, control/model category, device/source, and administrative event.

**Role-specific value:** Administrators decide scope and remediation; Engineers validate the evidence chain and recommend tuning or escalation.

**Verification:** Every conclusion can be traced to a detailed record and every configuration decision has an audit/change reference.

## Scenario: sensitive data appears in a generative-AI workflow

1. **Overview:** In [AI Insights](../reporting/insights-and-governance-reports), set the investigation window and select **View All Findings** from **Sensitive data classification**.

2. **Finding:** Isolate the event in [Findings](./findings) by category, application, source, user, and time. Record the finding ID, criticality, outcome, and control.

3. **Identity:** Open [Users](./users-and-accounts) to understand department, IDP groups and status, risk, other applications and findings, and data movement. Open **Accounts** to identify the application account, login method, and account or application status.

4. **AI asset:** Inspect the [asset record](./ai-assets) for type, deployment, source, version, guardrails, tags, provisioning, integration points, user reach, interactions, and findings.

5. Asset: if endpoint activity is involved, compare requests, sensitive share, detections, blocked share, users, interactions, and guardrails in AI Assets.

6. **Detection and policy:** Verify that the matched [model or category](../policies-and-detections/detection-models) is enabled and that the [control](../policies-and-detections/policy-lifecycle) conditions, mode, action, and scope explain the outcome.

7. **Administrative history:** Filter [Audit Log](../reporting/audit-log) around the policy or deployment change and confirm actor, time, action, resource, status, and severity.

8. Decision: classify as expected validation, true policy violation, false positive, configuration defect, or data gap. Assign owner and deadline.

9. **Evidence:** [Export](../reporting/dashboards-and-exports) the supported filtered records to CSV and record filters and date range. Use an underlying list when a dashboard does not offer an export.

10. **Validation:** After any approved tuning, repeat [positive and negative synthetic tests](../deployment/validation) and confirm the new result without broadening scope unexpectedly.

| Relationship | What to confirm |
| --- | --- |
| User ↔ Account | The person is linked to the application-specific account/session context. |
| Account ↔ AI Asset | Login method/status and the asset record explain the observed use. |
| AI Asset ↔ Finding | The inventory record and the finding reflect the same product, source, and time context. |
| Detection ↔ Policy | The enabled model/category satisfies the policy conditions. |
| Policy ↔ Finding | Mode/action/scope explain the event outcome and criticality context. |
| Change ↔ Audit | Actor, time, resource, status, and change record align. |

**Expected result:** The investigation produces a defensible narrative and a proportionate action.

**Verification:** A reviewer can follow the same pivots and reproduce the conclusion from detailed records, audit evidence, and a scoped export.
