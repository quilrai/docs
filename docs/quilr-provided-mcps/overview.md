---
sidebar_position: 1
sidebar_custom_props:
  icon: LayoutGrid
---

# Quilr-Provided MCPs

Quilr-provided MCPs are integrations built and operated by Quilr for products that need a broader, safer, or more agent-friendly tool surface than a provider's standard connector. Install them from the MCP Library, then use the MCP Gateway to control tools, guardrails, access, and audit logs.

<div className="mcp-showcase-grid">
  <a className="mcp-showcase-card featured" href="./microsoft-365-v3"><span>FLAGSHIP</span><strong>Microsoft 365 v3</strong><small>9 workloads. 1 governed MCP.</small></a>
  <a className="mcp-showcase-card" href="./azure-devops"><span>ENGINEERING</span><strong>Azure DevOps Advanced</strong><small>Delivery intelligence + controlled actions</small></a>
  <a className="mcp-showcase-card" href="./athenahealth"><span>SAFETY-FIRST</span><strong>Athenahealth</strong><small>FHIR + athenaOne with PHI-safe controls</small></a>
  <a className="mcp-showcase-card" href="./semrush"><span>INTELLIGENCE</span><strong>Semrush Advanced</strong><small>23 explicit SEO and market tools</small></a>
</div>

This is different from a **custom MCP server** that your organization registers by URL. See [MCP Library](../mcp-gateway/features/mcp-library) for that workflow.

If the provider also publishes an MCP server, use the [Official MCP Comparison](./official-comparison) to understand which option is broader and what Quilr adds.

## Choose An Integration

| Integration | Best for | Main capabilities | Connection | Changes data? |
|---|---|---|---|---|
| [Microsoft 365 v3](./microsoft-365-v3) | Mail, calendar, OneDrive, OneNote, Teams | Search, read, send, schedule, files, notes, collaboration | Microsoft OAuth | Yes |
| [SharePoint](./sharepoint) | Sites, document libraries, lists | Find, list, read, upload, update, delete | Microsoft OAuth | Yes |
| [Excel](./excel) | Cloud workbooks | Ranges, formulas, formatting, tables, charts, pivots | Microsoft OAuth | Yes |
| [Microsoft Tasks & Planner](./microsoft-tasks-planner) | Personal and team work planning | To Do lists/tasks and Planner plans/buckets/tasks | Microsoft OAuth | Yes |
| [Azure DevOps Advanced](./azure-devops) | Engineering delivery | Repos, pull requests, boards, pipelines, tests, wiki, security | Microsoft OAuth | Yes |
| [Jira](./jira) | Issue and project workflows | Issue, project, search, comment, and workflow operations | Atlassian OAuth | Yes |
| [Confluence](./confluence) | Knowledge bases | Spaces, pages, search, comments | Atlassian OAuth | Yes |
| [Google Workspace](./google-workspace) | Gmail, Calendar, and Drive | Search/read mail, drafts/send, events, Drive discovery/export | Google OAuth | Yes |
| [Figma](./figma) | Design-to-code and review | Design context, screenshots, variables, comments, Code Connect | Figma OAuth | Yes |
| [Calendly](./calendly) | Scheduling operations | Event types, invitees, routing, webhooks, availability | Calendly OAuth | Yes |
| [HubSpot CRM](./hubspot) | CRM records | Search, batch read, associations, create, update, archive | HubSpot OAuth | Yes |
| [Avoma](./avoma) | Meeting intelligence | Meetings, transcripts, notes | API key | No |
| [Writer](./writer) | Enterprise generative AI | Chat, apps, knowledge graphs, files, translation, vision, web search | API key | Limited |
| [Optimizely Experimentation](./optimizely) | Experiment analysis and operations | Results, schemas, reporting, lifecycle, collaborators, datafiles | Customer OAuth app | Yes |
| [Semrush Advanced](./semrush) | SEO and market research | Domains, keywords, backlinks, traffic, projects, batch analysis | API key | No |
| [BrowserStack Advanced](./browserstack) | Test operations and diagnostics | Browser/device inventory, Automate, App Automate, test management | Username + access key | Yes |
| [Athenahealth](./athenahealth) | Clinical system integration | athenaOne and FHIR reads, controlled writes, bulk export jobs | Customer OAuth app | Yes, gated |
| [Tavily](./tavily) | Agent web research | Search, extract, map, crawl, research, usage | API key | No |
| [Cycode](./cycode) | Code security | Service status and secret scanning | Optional provider auth | No |
| [Quilr Web Search](./web-search) | Lightweight search and page retrieval | Web search and webpage extraction | Managed | No |
| [SketchIt](./sketchit) | Diagrams and charts from a description | Flowcharts, hierarchy/architecture diagrams, charts, presentation layouts | None - enabled, not connected | No |
| [PDF Editor](./pdf-editor) | Reading and editing PDF documents | Inspect, search, OCR, edit text, watermark, forms, metadata, export | None - enabled, not connected | Yes |

:::note
“Changes data?” describes the integration's available tool surface, not what every user can do. Administrators can disable write or destructive tools in [Tools Management](../mcp-gateway/features/tools-management) and restrict agent access through [Access Control](../mcp-gateway/features/access-control).
:::

## Quilr-Provided vs Provider-Native vs Your Own

| Option | Choose it when | Operations | Credentials and updates |
|---|---|---|---|
| **Quilr-provided MCP** | You want a curated tool surface with gateway-aware safety and enterprise workflows. | Quilr operates the MCP; your admin controls exposure through the gateway. | Quilr maintains the server. Users or admins still supply provider authorization where required. |
| **Provider-native MCP** | The provider's official MCP already covers the workflows you need. | The provider operates the upstream server; Quilr secures and governs access. | Follow the provider's connection model. See [Provider Setup](../mcp-gateway/mcp-provider-setup/overview). |
| **Organization custom MCP** | You have an internal system or your own MCP implementation. | Your organization operates the server; Quilr proxies and governs it. | Register its reachable `/mcp` or `/sse` URL in the library. |

## Common Safety Model

- Read, write, and destructive tools are labeled so administrators can apply least privilege.
- OAuth and API credentials are scoped per connection and are not passed to the AI model.
- Destructive operations use explicit confirmation where the integration supports them.
- MCP Gateway policies can scan tool inputs and outputs and retain auditable tool-call metadata.
- Availability and exact tools can vary by tenant, provider plan, granted scopes, and administrator policy.

Open any integration above for its focused capability matrix, Quilr differentiation, safety model, and setup links.
