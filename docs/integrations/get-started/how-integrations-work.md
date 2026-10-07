---
sidebar_position: 1
sidebar_label: "How integrations work"
sidebar_custom_props:
  icon: Plug
---

# How integrations work

Integrations connect third-party platforms to QuilrAI. Some bring AI usage, inventory, and compliance data **into** Quilr; others send Quilr activity, findings, and alerts **from** Quilr to your security and operations tools.

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations']} />

## Installed and Library

The Integrations page has two tabs:

| Tab | Shows |
|-----|-------|
| **Installed** | Integrations set up for this tenant, with their status. |
| **Library** | Integrations you can install. |

Use the search box (providers, types, and capabilities) or the **Capability** filter to narrow either list.

Each card shows the provider and vendor, a status badge, a short description, capability chips, and a category with its direction, for example "Cloud agent platform · Into Quilr" or "Observability · From Quilr".

| Status badge | Meaning |
|--------------|---------|
| **INSTALLED** | Set up for this tenant. |
| **N ACTIVE · N DISCONNECTED** | For integrations with several credentials, how many are syncing and how many are paused. |
| **AVAILABLE** | Not set up yet. |
| Error badge | The integration needs attention. Open it to see the error. |

## Capabilities and direction

| Capability | Direction | What it does |
|------------|-----------|--------------|
| **Pull inventory** | Into Quilr | Discovers agents, projects, models, repositories, users, and other AI assets. They appear in **Inventory**, **Agents**, and **Graph**. |
| **Pull compliance data** | Into Quilr | Brings in activity and compliance events, which appear in **Findings & Interactions** and **Overview**. |
| **Send logs** | Depends on the integration | On observability tools (for example Microsoft Sentinel, Splunk, Datadog), sends Quilr activity and findings out. On agent frameworks and platforms (for example LangChain, Amazon Bedrock Agents), the platform sends its runtime telemetry into Quilr. |
| **Alerts & notifications** | From Quilr | Sends findings and operational notifications to another tool. |
| **Federated sign-in** | Into Quilr | Identity provider sign-in (SAML). See [Single sign-on](../../console/settings-organization/single-sign-on). |

## Install, manage, and uninstall

1. Open the **Library** tab and click **Install** on a card.
2. Follow the setup steps in the drawer. The steps depend on the integration: credentials or a service principal, which scopes or subscriptions to monitor, and which capabilities (data flows) to enable.
3. The integration moves to **Installed**.

On an installed card:

- **Manage** or **Configure** reopens the setup drawer to change credentials, scopes, or capabilities.
- **Uninstall** removes the integration from the tenant.

Credentials and configuration are encrypted and stored for the tenant. Secrets are never shown again after you save them.

:::tip
To stop showing an integration's data in the console without uninstalling it, use the **Included in console** toggle in [Data sources](../../console/settings-organization/data-sources). This changes visibility only; ingestion continues.
:::

## Available integrations

### Pull AI usage and inventory

| Integration | Brings in |
|-------------|-----------|
| [OpenAI Compliance](../pull-ai-usage-and-inventory/openai-compliance) | ChatGPT workspace and organization activity, costs, and inventory |
| [Claude Compliance](../pull-ai-usage-and-inventory/claude-compliance-api) | Claude.ai organization activity, chats, projects, and inventory |
| [Azure AI Foundry](../pull-ai-usage-and-inventory/azure-ai-foundry) | Foundry projects, agents, models, access, and activity |
| [Microsoft Copilot Studio](../pull-ai-usage-and-inventory/microsoft-copilot-studio) | Copilot Studio agents, definitions, capabilities, and activity metadata |
| [GitHub](../pull-ai-usage-and-inventory/github) | Repositories, AI projects, workflows, and developer inventory |

Other cards in the Library (no dedicated page yet): Amazon Bedrock Agents, Google Vertex AI Agent Builder, AutoGen, CrewAI, LangChain, LangGraph, and LiteLLM. These discover agents, tools, and models and send runtime telemetry into Quilr.

### Send logs and alerts

| Integration | Sends |
|-------------|-------|
| [Microsoft Sentinel](../send-logs-and-alerts/microsoft-sentinel) | Quilr activity and findings to a Sentinel workspace |
| [Webhook](../send-logs-and-alerts/webhook) | Governed events and notifications to an HTTP receiver |
| [Syslog](../send-logs-and-alerts/syslog) and [Syslog audit events](../send-logs-and-alerts/syslog-audit-events) | Findings and audit events to a syslog server |

Other cards in the Library: Splunk, Datadog (logs and alerts), and Slack (findings and notifications to a channel).

### Runtime guardrail integrations

[TrueFoundry](../pull-ai-usage-and-inventory/truefoundry) calls QuilrAI guardrails from the partner gateway. You set it up with an LLM Gateway app and in the partner product, not from the Integrations page. [Microsoft Copilot Studio](../pull-ai-usage-and-inventory/microsoft-copilot-studio) supports the same pattern for tool-execution checks, in addition to its inventory card.
