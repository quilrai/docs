---
sidebar_position: 1
sidebar_label: "Overview"
sidebar_custom_props:
  icon: BarChart2
---

# Overview

Overview is the executive snapshot of how your organisation uses AI, what
agentic assets exist, and where risk stands. Open it from **Observe >
Overview**. It has three tabs, and the period selector at the top (for
example **Last 7 days**) applies to all of them.

Most tiles, bars and list entries are clickable and lead to the page with the
underlying records.

## Adoption

How widely and how deeply people use AI.

| Panel | Shows |
|---|---|
| Headline tiles | **People using AI** (as a share of your directory), **AI interactions**, **Power users** and **AI applications**. |
| Who's using AI | **Ever tried**, **Weekly active**, **First-time adopters** and **Dormant**, with depth of use (**Tried once**, **Regular**, **Power users**). |
| Subscriptions & usage | Paid plans compared with free tiers observed in use. |
| What AI is used for | Usage modes (**Chat assistants**, **Coding agents**, **MCP agents**, **API & service accounts**, **Other**), switchable to gateway requests, plus interactions per day and the top AI apps. |
| Across the organization | A flow chart from **Departments**, **Teams** or **People** to the apps they use, marked sanctioned or unapproved, and what is **New this period** (new apps and topics). |
| Quilr coverage | Devices reporting, surfaces covered and people seen. |

Use it to report adoption, spot dormant licences and see new apps as they
appear.

## Agentic estate

The agents, MCP servers, skills and other agentic assets in use, and how well
they are governed.

- **Headline tiles**: **Agentic assets**, **Shadow AI**, share of **MCP
  servers through gateway**, and **High-risk assets**.
- **Act now**: the single most urgent item (for example an MCP server running
  outside the gateway), with **Review asset** and **Next in queue**.
- **Needs attention**: Shadow AI and high-risk assets.
- **Control coverage**: direct AI apps by approval status (**Sanctioned**,
  **Unapproved**, **Needs review**, **Posture unknown**) and MCP servers by
  route (**Outside gateway**, **Both**, **Gateway only**).
- **What is running**: assets by type (agents, skills, plugins, hooks,
  permissions, projects and more) and their parent applications.
- **Activity hotspots**: widely used skills and MCP tools with blocked calls.
- **Connected platforms**: per-platform panels for OpenAI, Microsoft Copilot
  Studio and Azure AI Foundry, plus the data sources behind the page.

Use it to find agentic assets that bypass the gateway and work through them
one by one. Each asset opens in [Inventory](./inventory).

## Posture & risk

What was flagged and how Quilr handled it.

- **Headline tiles**: **Interactions with findings**, **Blocked or
  redacted**, **Apps with findings** and **People involved**.
- **Top priority**: the most important current risk, with **Investigate**.
- **Risk categories**: findings by category, such as PII, adversarial
  prompts, auth and secrets, financial and health data.
- **How findings were handled**: by outcome (**Monitored**, **Justified**,
  **Redacted**, **Blocked**, **Failed**) or by sensor.
- **Where findings occur**: top apps and top people.
- **Estate today**: assets that need review, are ungoverned, or are high or
  critical risk.
- **Browser remediation**: open, overdue and closed browser findings, with
  **Review open findings**.

Use it for a weekly risk review, then drill into
[Findings & Interactions](./findings-and-interactions) to act.
