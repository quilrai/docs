---
sidebar_position: 2
sidebar_custom_props:
  icon: LibraryBig
---

# Console Sections

What is on each page and which sensors feed it. Every page shares one period
picker (24 hours to 365 days, or a custom range) and the same drawers.

## Observe

Read the estate. Nothing here changes configuration.

### Overview

One period-scoped read of how the organisation uses AI, what agentic assets
exist and where risk stands. Every number is clickable.

- **Adoption** - people using AI (weekly active, first-time, dormant), AI
  interactions, adoption depth cohorts, top applications, org-to-app adoption
  flows, stickiness, subscriptions and seats, coverage and discovery charts.
- **Agentic estate** - agentic assets, parent applications, MCP governance
  split, risk and control gaps, per-source panels, a Shadow AI table, skills by
  reach and MCP tools with blocked calls.
- **Posture & risk** - interactions with findings, interventions, standing
  estate, a priority spotlight, a risk register per confirmed category, apps
  and people ranked by findings, sensor coverage.
- **Drill drawer** - any tile, bar, legend or day opens a drill drawer with a
  back-stack and chained drills.

### Costs & Savings

Token-honest spend intelligence plus evidence-backed savings you can enforce.

- **Overview** - known cost in USD with priced-token coverage, total tokens,
  realized savings, enforceable opportunity, provider incidents, an estate
  bubble map, daily tokens by surface.
- **Attribution** - master-detail over Users, Departments, Applications, Smart
  Groups, Topics, Models, MCP Tools and Repos.
- **Providers** - capacity board splitting requests into served, rate-limited,
  auth-failed and provider errors, with an incident queue.
- **Enforceable** - every saving you could switch on, with deep links into the
  exact settings page, and receipts for controls already saving.

:::note
LLM Gateway reports exact tokens. MCP, Endpoint and Browser figures are
estimates at four characters per token, and the page says so.
:::

### Findings & Interactions

One feed for every AI interaction Quilr observed, with a review lens over
findings and an investigation drawer per conversation.

- **Two lenses** - Findings (needs review) and Interactions (all activity).
- **Three layouts** - Bird's-eye, Cards, and Table with 20 pickable columns.
- **Filters** - a query builder over app, outcome, data category, topic,
  sensors, person, model, tool, agent and device.
- **Conversation drawer** - Overview, replayed conversation turns, sensitive
  data with masked spans (reveal is permission-gated and audited), related
  activity, timeline, and sensor-specific sections.
- **Actions** - open the person, app or policy drawer, export to the Export
  Center, or configure agent activation. There is no resolve or assign state:
  remediation is agent activation.

### Users

Who is using AI, how much, how riskily, and how well each sensor covers them.
Tabs for All users, Browser deployment, Endpoint deployment, Accounts and
Quilly, a per-person workspace, and a table of around seventy columns.

### Inventory

One searchable estate table of every AI asset Quilr observes, with per-asset
drill-down into evidence, posture and settings. Asset types cover workspace,
project, application, browser extension, AI client, MCP server, agent, skill,
model, plugin, tool, canvas, automation, hook, permission and repository.

LLM Gateway applications and MCP servers keep their full workspaces here:
analytics, activity, usage and settings in one drawer.

### Agents

Every AI agent identity observed across the estate, the skills, MCP servers,
prompts and models it uses, and the people running it.

### Dashboards and saved views

Commission a dashboard in plain language, preview it against your own data,
then publish and share it. Saved views are the lighter tool: a remembered
filter, column set and layout on the big list pages.

## Govern

### Policy Engine

One versioned policy document per enforcement target. See the
[Policy Engine](../policy-engine/overview) section.

### Detection Models

The catalog every policy's `data found` condition draws from: out-of-the-box
and custom models for data and adversarial risks, plus an AI-assisted builder.
Policies reference detections by exact name from this catalog.

## Settings

### AI Gateway

| Page | What it does |
|---|---|
| LLM Gateway | Create gateway applications, manage Quilr keys, configure providers. Policy-owned protections freeze once the engine is on. |
| MCP Gateway | Register MCP servers, govern tool access, operate OneMCP. |
| Models | The model catalog: which models are approved, what they cost, who may call them, and how they perform. |
| Skills Library | Discover, inspect and install tenant Skills from pinned public repositories. |

:::note
Spend budgets in the Policy Engine need input and output prices for every
matching model. Set them once under Models and every application can use them.
:::

### Sensors

Endpoint Agent and Browser Extension deployment and operation, plus the User
Interaction Hub where you brand the guidance end users see when Quilr
intervenes.

### Organization

General settings and domains, Smart Groups from your identity provider, Roles &
Permissions, Single sign-on, Organizational Policies, Data Sources and Audit
Logs.

:::note
Smart Groups are directory groups matched to people by email. Membership is not
authored in the console. These are the groups every policy's Smart groups
condition and every sharing dialog use.
:::

### Data Settings

**Data Retention** controls how long LLM Gateway and MCP Gateway data stays
visible, per data class, with ordered rules and published revisions.
**Export Center** creates, schedules and shares JSONL and Excel exports of
Inventory, Users, Findings and Interactions.

### Integrations

Connectors for compliance data, telemetry, inventory, logs and notifications.

## Red Teaming

Run adversarial and benchmark suites against a gateway application, a model or
an HTTP agent endpoint, and grade the result. Reports carry a risk score and
grade, findings with severity and OWASP mapping, evidence and reproduction,
prompt hardening suggestions, and custom detection suggestions you can take
straight to Detection Models.
