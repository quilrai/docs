---
sidebar_position: 1
sidebar_label: "Console tour"
sidebar_custom_props:
  icon: LayoutGrid
---

# Console tour

The QuilrAI console at [web.quilr.ai](https://web.quilr.ai) is organised
around what you manage (people, applications, agents, interactions and
controls), not around the sensors that collect the data. This page shows how
the sidebar is laid out and where each job lives.

## How sensors feed every page

The LLM Gateway, MCP Gateway, Endpoint Agent and Browser Extension, plus
connected platforms such as OpenAI Compliance, GitHub, Microsoft Copilot
Studio and Azure AI Foundry, all report into the same data. You do not visit
one page per sensor. Instead:

- every Observe page combines all sources, and most lists have a **Sensor**
  or **Sources** filter to narrow them,
- rows and drawers name the sensor that saw the activity,
- each sensor keeps one home under Settings (deployment and operation) and
  one tab under **Govern > Policy Engine** (enforcement).

To hide a source from the console without stopping ingestion, use
[Data sources](../settings-organization/data-sources).

## The sidebar

The sidebar has four groups: Observe, Govern, Assessments and Settings.

### Observe

| Page | What it is for |
|---|---|
| [Overview](../observe/overview) | Executive snapshot: AI adoption, the agentic estate, and posture and risk. |
| [Costs & Savings](../observe/costs-and-savings) | AI spend and tokens by source, who drives them, and settings that would save tokens. |
| [Graph](../observe/graph) | Interactive map of how people, apps, agents, MCP servers and data connect. |
| [Findings & Interactions](../observe/findings-and-interactions) | Every finding and every AI interaction, with an investigation drawer. Includes the [Triage center](../observe/triage-center). |
| [Users](../observe/users) | Each person's AI usage and risk, plus browser and endpoint deployment coverage. |
| [Inventory](../observe/inventory) | Catalog of every AI asset Quilr discovered, with approval status and risk. |
| [Agents](../observe/agents) | Every AI agent observed, with the skills, MCP servers, prompts and people behind it. |
| [Dashboards](../observe/dashboards) | Custom dashboards you describe in plain language to an AI designer. |

### Govern

| Page | What it is for |
|---|---|
| [Policy Engine](../govern/policy-engine) | What happens when AI use crosses a line, per enforcement surface: Browser Extension, LLM Gateway, MCP Gateway and Endpoint Agent. |
| [Detection Models](../govern/detection-models) | What counts as sensitive data or an adversarial prompt: built-in and custom detectors. |
| [Action Request](../govern/action-requests) | Approve or reject justification requests raised when the browser extension blocked an action. |

### Assessments

[Red Teaming](../../red-teaming) actively tests LLM applications, MCP servers,
agents and models for weaknesses.

### Settings

| Group | Pages |
|---|---|
| AI Gateway | [Workflow Agents](../../workflow-agents), [LLM Gateway](../../llm-gateway), [MCP Gateway](../../mcp-gateway), [Models](../../llm-gateway/apps-and-providers/providers-and-models), [Skills Library](../settings-ai-gateway/skills-library) |
| Organization | [General](../settings-organization/general-and-domains), [Smart Groups](../settings-organization/smart-groups), [Roles & Permissions](../settings-organization/roles-and-permissions), [Single sign-on](../settings-organization/single-sign-on), [Organizational Policies](../settings-organization/organizational-policies), [Data Sources](../settings-organization/data-sources), [Audit Logs](../settings-organization/audit-logs) |
| Data management | [Data Retention](../settings-data/data-retention), [Export Center](../settings-data/export-center) |
| Other | [Integrations](../../integrations), [Endpoint Agent](../../endpoint-agent/configure/agent-settings), [Browser Extension](../../browser-extension/configure/extension-settings), [User Interaction Hub](../settings-sensors/end-user-popups), [User Profile and Display](../settings-sensors/display-and-profile) |

## Search, Quilr Assist and the page guide

- **Search** at the top of the sidebar (**Cmd+K**) opens a command palette to
  jump to any page.
- The **Quilr Assist** bubble in the bottom-right corner opens the in-console
  assistant.
- The **?** button next to it opens the **page guide** for the page you are
  on.

You can hide the bubble, turn off the page guide, or make the bubble compact
under **Settings > Display**. See
[Display and profile](../settings-sensors/display-and-profile).

Patterns shared by most pages (period selector, filters, saved views,
layouts, drawers and export) are covered in
[Views, filters and drawers](./views-filters-and-drawers).

## Self Service for end users

**Switch to Self Service** at the bottom of the sidebar opens the end-user
portal. There, people connect their AI apps, see the LLM Gateway applications
they are approved for, and use Workflow Agents shared with them. See
[Self Service](../../llm-gateway/self-service/overview).

## Next steps

- [Views, filters and drawers](./views-filters-and-drawers)
- [Moving from Console V1](./moving-from-console-v1)
