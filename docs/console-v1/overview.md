---
sidebar_position: 1
sidebar_custom_props:
  icon: BookOpen
description: "Reading paths for deployment, administration, governance, investigations, and reporting in Console V1."
---

# Console V1 Administrator Guide

This guide helps Security Administrators and Security Engineers deploy QuilrAI sensors, establish organization settings, configure controls, investigate findings, and preserve evidence in **Console V1**. It is adapted from the QuilrAI Administrator Guide, edition 2.0. The guide edition is separate from the console version.

The running examples use a staged deployment group and approved synthetic data. Start controls in Monitor, verify their findings and scope, then enable the intended user-facing action.

## Choose a reading path

| Goal | Reading path |
| --- | --- |
| Deploy QuilrAI for the first time | [Deployment prerequisites](./deployment/overview), your GPO or MDM procedure, [Validation](./deployment/validation), [Settings](./administration/settings), and [Access control](./administration/access-control). Finish with the [completion checklist](./troubleshooting#completion-checklist). |
| Configure governance | [Organizational context](./administration/organizational-context), [User Interaction Hub](./administration/user-interaction-hub), [Policy lifecycle](./policies-and-detections/policy-lifecycle), and [Detection models](./policies-and-detections/detection-models). |
| Investigate a finding | [AI Assets](./investigations/ai-assets), [Users and Accounts](./investigations/users-and-accounts), [Findings](./investigations/findings), and the [end-to-end investigation](./investigations/end-to-end-workflow). |
| Review posture and reporting | [Insights and Governance Reports](./reporting/insights-and-governance-reports), [Dashboards and Exports](./reporting/dashboards-and-exports), and [Audit Logging Console](./reporting/audit-log). |

## Operating sequence

<StepFlow steps={[
  {label: 'Deploy', items: ['Assign a staged group', 'Validate each layer']},
  {label: 'Configure', items: ['Set organization context', 'Test controls in Monitor']},
  {label: 'Investigate', items: ['Connect assets and identities', 'Explain the finding outcome']},
  {label: 'Review', items: ['Preserve audit and exports', 'Approve enforcement scope']},
]} />

## Guide conventions

| Convention | Meaning |
| --- | --- |
| Monitor first | Observe matching events before enabling user-facing enforcement. |
| Synthetic test | Use approved, non-production sample data for positive and negative tests. |
| Expected result | The outcome the procedure should produce. |
| Verification gap | Behavior or fields that must be confirmed in the target tenant. |

Screenshots illustrate the guide's example environments. Available fields, source data, and package paths can vary. Retain the validation evidence described on each page.

For the newer interface, see [Console V2](../console-v2/overview) and its [transition plan](../console-v2/transition-plan).
