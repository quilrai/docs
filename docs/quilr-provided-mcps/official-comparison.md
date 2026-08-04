---
sidebar_position: 2
sidebar_custom_props:
  icon: BarChart2
---

# Official MCP Comparison

This page compares the implemented Quilr tool surfaces with current provider-hosted MCP servers or, when a provider does not publish an MCP server, the provider's official APIs. It was reviewed against the custom MCP implementations, production runtime inventory, and provider documentation in August 2026.

“Additional” means a Quilr-specific capability or operating model. It does not mean the Quilr integration contains every tool in the official server. Provider MCPs change frequently, and availability can depend on product plan or preview enrollment.

## At A Glance

| Integration | Official option | Quilr difference | Best fit for Quilr |
|---|---|---|---|
| Microsoft 365 Outlook | Microsoft Graph APIs; no equivalent single broad Microsoft-hosted MCP identified | One remote MCP spanning mail, calendar, OneDrive, SharePoint, Teams, directory, OneNote, search, batch, and delta sync | Cross-workload Microsoft 365 agents |
| SharePoint | Microsoft Graph APIs | Six consolidated tools, URL resolution, list and drive operations, confirmed deletes | A smaller SharePoint-only permission surface |
| Excel | Microsoft Graph workbook APIs | Eight dispatchers group workbook, range, table, chart, named-range, pivot, and function operations | Structured workbook automation without unrelated Microsoft tools |
| Microsoft Tasks & Planner | Microsoft Graph To Do and Planner APIs | One focused ten-tool surface across personal and team tasks | Task agents with a limited Graph scope |
| Azure DevOps Advanced | Microsoft publishes an official local MCP | Remote multi-tenant OAuth, compatibility dispatchers, compound intelligence, organization selection, and separately confirmed deletes | Centrally governed Azure DevOps access through Quilr |
| Jira and Confluence | Atlassian Rovo MCP is a broad hosted server | Separate, compact Jira and Confluence surfaces with predictable tools and independent gateway policy | Organizations wanting narrower per-product exposure |
| Google Workspace | Google offers separate Gmail, Drive, Calendar, Chat, and People MCPs in Developer Preview | One combined Gmail, Calendar, and Drive connection with shared-drive discovery and file export | A stable combined surface without separate preview connectors |
| Figma | Figma offers remote and desktop MCPs | API-oriented defaults, comments, assets, design-system search, and Code Connect mapping management | Design review and integration administration |
| Calendly | Calendly hosts a DCR-only OAuth 2.1 MCP | Customer-owned OAuth app flow for clients and gateways that require pre-registered credentials | Managed enterprise OAuth when DCR is not suitable |
| HubSpot CRM | HubSpot hosts a GA remote CRM MCP | Nine consolidated tools with batch record reads, property/owner discovery, and controlled archive | Compact, gateway-governed CRM workflows |
| Avoma | Avoma publishes an MCP connector | Deliberately read-only four-tool surface for meetings, transcripts, and notes | Least-privilege meeting research |
| Writer | Writer publishes a local SDK MCP package | Hosted streamable HTTP, API-key validation, and a curated ten-tool surface | Centrally operated Writer access for remote agents |
| Optimizely Experimentation | No official Optimizely MCP was identified | Schema-guided querying, compound reporting, lifecycle controls, exports, audit history, collaborators, and datafiles | Full experimentation operations through MCP |
| Semrush Advanced | Semrush hosts a public schema-driven MCP | 23 explicit tools, compound opportunity/research briefs, native comparisons, batch project reads, and quota visibility | Predictable SEO workflows with agent-friendly schemas |
| BrowserStack Advanced | BrowserStack offers local and remote MCP options | 48 explicit API tools with bulk Test Management operations, bounded logs, screenshots, and diagnostic briefs | Auditable test operations with controlled bulk actions |
| Athenahealth | Athenahealth publishes athenaOne and FHIR APIs, not an official MCP | Capability packs, allowlists, PHI-safe logging, idempotent writes, explicit confirmations, and bulk-export jobs | Governed clinical-system agents |
| Tavily | Tavily's public MCP emphasizes search and extract | Adds crawl, map, asynchronous research, usage, and key inspection behind a managed authorization flow | Full Tavily API coverage without API keys in MCP URLs |
| Cycode | The deployed server packages Cycode's CLI MCP capability; no Cycode-hosted remote MCP was identified | Quilr-operated remote container and gateway policy around the provider package | Centralized secret scanning from remote agents |
| Quilr Web Search | No separate provider MCP | Minimal managed search and page retrieval with gateway domain policy | Lightweight web access with the smallest tool surface |

## Microsoft

### Microsoft 365 Outlook

Microsoft documents the underlying mail, calendar, files, sites, Teams, directory, notes, Excel, To Do, and Planner capabilities through Microsoft Graph. The Quilr implementation turns those APIs into a single remote MCP and adds agent-oriented operations such as cross-workload search, URL resolution, batch reads and updates, delta synchronization, upload sessions, bounded attachment downloads, and explicit destructive labels.

The same codebase also contains focused SharePoint, Excel, and Tasks & Planner MCPs. Choose those when broad Microsoft 365 access would give an agent more tools or scopes than it needs.

### Azure DevOps Advanced

Microsoft's [official Azure DevOps MCP](https://github.com/microsoft/azure-devops-mcp) is a strong local server with domain-filtered tools for core, work, work items, repositories, search, pipelines, test plans, wiki, and Advanced Security.

Quilr does not simply mirror it. The custom server provides:

- A remotely operated, streamable-HTTP service with Microsoft Entra delegated OAuth.
- 21 compatibility dispatchers that preserve 93 established operations.
- Direct tools for common project, repository, pull-request, work-item, file, query, and pipeline calls.
- Compound intelligence for project overviews, sprint health, pull-request readiness, pipeline failures, traceability, and security dashboards.
- Explicit organization discovery and selection for users who belong to multiple Azure DevOps organizations.
- Separately labeled and confirmed deletes for branches, builds, iterations, pipelines, repositories, test plans, wiki pages, and work items.

Use the official server for a local IDE-first setup. Use Quilr when access must run through central OAuth, gateway policy, guardrails, tool controls, and audit logs.

## Atlassian

Atlassian's [Rovo MCP Server](https://developer.atlassian.com/cloud/rovo-mcp/) is broader than the two Quilr integrations. It covers Jira, Confluence, Compass, Jira Service Management, Bitbucket, Rovo search, and Teamwork Graph through one hosted endpoint. Its [supported tools](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/) include deeper Jira metadata and linking, Confluence descendants and inline comments, and additional Atlassian products.

Quilr's Jira and Confluence servers are intentionally separate:

| Quilr MCP | Current surface | Difference from Rovo MCP |
|---|---|---|
| Jira | Identity, projects, issue get/search/create/assign, transitions, comments | Smaller Jira-only surface with ten predictable tools and independent policy. It does not claim Rovo's JSM, Compass, Bitbucket, or graph breadth. |
| Confluence | Identity, spaces, pages, CQL search, create/update pages, comments | Compact nine-tool knowledge-base surface. Rovo adds descendants, inline-comment workflows, and cross-product context. |

Choose Rovo for the widest Atlassian-native coverage. Choose the Quilr integrations when Jira and Confluence need separate authorization, tool allowlists, or release control.

## Google Workspace

Google now provides [official remote Workspace MCP servers](https://developers.google.com/workspace/guides/configure-mcp-servers) for Gmail, Drive, Calendar, Chat, and People. They are in Developer Preview and each product has its own endpoint.

Quilr combines Gmail, Calendar, and Drive into one 13-tool connection. It includes shared-drive discovery and Google Workspace file export, supports drafts and direct send, and uses a customer-owned Google OAuth client. It does not currently include the official preview's Google Chat or People servers. The [Google Workspace setup guide](../mcp-gateway/mcp-provider-setup/google-workspace) lists all eight scopes requested by the implemented server.

Choose Google's servers when preview access, per-product separation, Chat, or People are required. Choose Quilr when one governed connection for Gmail, Calendar, and Drive is preferable.

## Design And Scheduling

### Figma

Figma's [official MCP server](https://developers.figma.com/docs/figma-mcp-server/) is optimized for extracting design context, generating code from frames, Code Connect-aware output, and writing native content back to the canvas. The remote server has the broadest official feature set, but only approved MCP clients can currently connect.

Quilr's 19-tool server is API-oriented. In addition to design context, metadata, screenshots, variables, libraries, and FigJam reads, it manages defaults, comments, asset uploads, design-system search, and Code Connect mappings and suggestions. These administrative API workflows are the main Quilr distinction. For native canvas creation and modification, prefer Figma's official server.

### Calendly

Calendly's [official hosted MCP](https://developer.calendly.com/calendly-mcp-server) uses OAuth 2.1, PKCE, and Dynamic Client Registration. Its [supported tool catalog](https://developer.calendly.com/supported-tools) provides broad scheduling coverage without a customer-created OAuth application.

The Quilr custom server exists for a different connection model: a customer-owned, pre-registered Calendly OAuth application. Its 40 tools cover event types, schedules and availability, meetings and invitees, routing, organizations and users, memberships, webhooks, shares, and data-compliance operations. Use it when enterprise ownership, explicit scopes, or a non-DCR client requires static OAuth credentials. New DCR-compatible deployments should also evaluate Calendly's hosted server.

## CRM, Meetings, And Enterprise AI

### HubSpot CRM

HubSpot's [remote MCP server](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server) is generally available and now has broad CRM read and write capabilities. It can cover more objects and activity history than Quilr's compact integration.

Quilr exposes nine consolidated tools for object search, batch reads, associations, properties, owners, record create/update/archive, and note/task creation. Its advantage is a small stable schema and gateway-managed exposure, not wider HubSpot coverage. Choose the official server for maximum native breadth and Quilr for a bounded CRM toolset.

### Avoma

Avoma's [official MCP connector](https://help.avoma.com/getting-started-with-avoma-mcp-connector) has expanded beyond meeting retrieval to scorecard evaluations, team usage, meeting outcomes and types, deal stages, teams, and selected meeting updates.

Quilr intentionally exposes only four read tools: list meetings, batch-read meeting details, fetch transcripts, and fetch notes. This is safer for analysis-only agents but narrower than Avoma's official connector.

### Writer

Writer's [official MCP package](https://dev.writer.com/home/mcp-server) runs locally through `writer-sdk-mcp` and can orchestrate Writer APIs such as file upload, generation, Knowledge Graph research, and image analysis.

Quilr operates a remote streamable-HTTP server and validates each user's Writer API key. Its ten curated tools cover chat and models, applications, Knowledge Graphs, files, translation, vision, and web search. Choose the official package for the latest SDK breadth and local execution; choose Quilr for a centrally hosted, policy-controlled surface.

## Experimentation, Marketing, And Testing

### Optimizely Experimentation

No Optimizely-hosted MCP server was identified in Optimizely's official developer documentation during this review. The Quilr server therefore provides the MCP layer over Optimizely Experimentation APIs.

Unlike a thin endpoint wrapper, it adds schema and entity templates, compound experiment summaries, top-experiment reporting, curated Feature Experimentation SDK documentation search, CSV exports, change history, collaborator management, and environment datafiles. Its lifecycle dispatcher supports creation, update, archive, enablement, reset, and deletion across supported entities. Customer-owned OAuth credentials keep the Optimizely application under tenant control.

### Semrush Advanced

Semrush now offers an [official hosted MCP](https://developer.semrush.com/api/v3/introduction/semrush-mcp/) with schema discovery and report execution across SEO, Trends, and read-only Projects APIs. It is the best option for the newest raw Semrush report coverage.

Quilr's 23 tools trade some of that generic breadth for explicit schemas and agent-oriented compositions: domain and keyword opportunity briefs, native backlink and audience comparisons, keyword and backlink gaps, traffic content and channel analysis, batch project reads, and separate Standard/Trends quota visibility. Both consume Semrush API units.

### BrowserStack Advanced

BrowserStack's [official MCP](https://www.browserstack.com/docs/browserstack-mcp-server/overview) covers manual and automated testing, accessibility, Test Management, reporting, Percy, and BrowserStack AI agents. Its overall product breadth is greater than the Quilr server.

Quilr exposes 48 explicit API tools focused on account capabilities, browser/device inventories, Automate and App Automate builds and sessions, bounded diagnostic logs and screenshots, and deep Test Management CRUD. Quilr-specific conveniences include bulk case edit/move/archive, ordered case assignment, bulk result submission, session diagnostic briefs, and destructive-tool labeling. Choose it for predictable automation APIs and controlled bulk operations.

## Healthcare, Web Research, And Security

### Athenahealth

Athenahealth documents official [athenaOne and FHIR APIs](https://docs.athenahealth.com/), but no official MCP server was identified. Quilr adds the agent-facing security layer:

- Operator allowlists and disabled-by-default capability packs.
- Separate athenaOne and FHIR batch reads and writes.
- Confirmation, unique idempotency keys, and no automatic retry for writes.
- Separately enabled deletes with stronger confirmation.
- FHIR bulk-export start and status tools that do not download PHI into the MCP runtime.
- PHI-free logs, traces, application state, and persistent audit records.

### Tavily

Tavily's [official MCP](https://docs.tavily.com/documentation/mcp) prominently documents search and extraction. Tavily's broader [API](https://docs.tavily.com/documentation/api-reference/introduction) also includes crawl, map, and research.

Quilr brings that full API family into eight read-only tools: search, extract, map, crawl, start/check research, usage, and key information. It also collects the API key through an authorization flow instead of placing it in a remote MCP URL. This is the clearest addition over the basic official MCP configuration.

### Cycode

The deployed Cycode integration packages the provider's CLI MCP functionality into a remotely operated container. Quilr adds HTTPS hosting, health monitoring, deployment controls, and gateway policy. Its deliberately small surface is service status and secret scanning; it is not a general-purpose shell or repository-management server.

### Quilr Web Search

Quilr Web Search is a two-tool managed alternative for search and selected webpage retrieval. It is intentionally smaller than Tavily and is useful when an agent only needs bounded results, location/search-type options, and optional domain filters. MCP Gateway [Web Search Policy](../mcp-gateway/features/web-search-policy) can further constrain destinations.

## Comparison Limits

- Tool counts are snapshots of implemented public tools, not counts of underlying provider API endpoints.
- Provider plan, OAuth scopes, tenant configuration, preview enrollment, and gateway policy can hide otherwise implemented operations.
- A provider-hosted MCP may release capabilities after this review. Re-evaluate the official option before a new deployment, especially for Google Workspace, Figma, Calendly, HubSpot, Semrush, BrowserStack, and Avoma.
- Production health confirms that a server process is running; it does not prove a particular customer has provider authorization or access to every tool.
