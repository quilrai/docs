---
sidebar_position: 1
sidebar_custom_props:
  icon: Wrench
description: "Console V1 settings areas, save behavior, responsibilities, and audit verification."
---

# Settings Overview

Configure tenant-wide context, sensor deployment, gateway protection, end-user messaging, compliance connectors, and detection rules from one place, in the order an administrator normally needs them.

**Navigation:** Select Settings (gear icon) at the bottom of the main navigation. The Settings rail lists Organizational Context, Browser Extension, Endpoint, AI Gateway, User Interaction Hub, Compliance, Detection Policy, and AI Telemetry. AI Telemetry appears only on tenants where QuilrAI has enabled it.

**Configuration and options:** Each area is independent. Deployment switches apply as soon as they are set. Per-application endpoint panels save as you edit. Scoped group and user rules save only when you select Save rule. Everything else stages until you select Save, and the footer of each panel states which rule applies. Build every control in Monitor first, confirm the findings, then move to enforcement.

**Role-specific value:** Quilr Administrators own tenant context, deployment, gateway keys, and change control. Security Engineers tune guardrails, detection rules, and end-user messaging, and verify results in Findings and the Audit Logging Console.

**Verification:** Review the [Audit Logging Console](../reporting/audit-log) for the acting administrator, time, category, and resource after making a change. Preserve the saved state and change record alongside any available audit event.

| Settings area | Tabs | Use it to |
| --- | --- | --- |
| Organizational Context | General, Organizational Policies, Profile, Manage Users | Set the organization name, domains, and timezone; upload or generate the AI acceptable-use policy that coaching quotes; manage console users, groups, and roles. |
| Browser Extension | Deployment, Deployment Management, Deployment Status, Whitelist, Detection Configuration | Choose a deployment method, enable and scope the extension, confirm device health, exclude internal sites, and build browser controls. |
| Endpoint | Deployment Management, Deployment Status, Detection configurations, Application Configuration, Endpoint Configuration | Enable the agent, confirm device health, set per-application guardrails and file rules, allow or block desktop applications, and tune the traffic redirector. |
| AI Gateway | LLM Gateway, MCP Gateway, Workflow Agents | Protect your own applications' model traffic, your agents' tool traffic, and the workflow agents built on the gateway. |
| User Interaction Hub | Customize Logo, Customize Content, Customize Links | Brand and word the messages end users see, and link them to your policy. |
| Compliance | Claude, OpenAI | Register the provider admin keys used by compliance monitoring, and collect the OTLP and hooks endpoints. |
| Detection Policy | Rule list | Review, import, export, and author QuilRQL detection rules and their findings. |
| AI Telemetry | Insights, Metrics, Logs | Receive OpenTelemetry metrics, logs, and traces from AI coding agents. |

Screenshots illustrate the guide's example tenant. Applications, domains, keys, servers, and available settings may differ in your tenant.

## Configure the administrative baseline

1. Set the organization identity, domains, timezone, and policy language in [Organizational Context](./organizational-context).
2. Grant approved [console access](./access-control) and verify the resulting permissions.
3. Deploy the [Browser Extension and native agent](../deployment/overview), then validate telemetry.
4. Brand the prompts and policy links in the [User Interaction Hub](./user-interaction-hub).
5. Test [detection models](../policies-and-detections/detection-models) and build [controls](../policies-and-detections/policy-lifecycle) in Monitor before enabling enforcement.
