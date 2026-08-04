---
sidebar_position: 3
sidebar_custom_props:
  icon: LibraryBig
---

# Integration Reference

This reference covers the Quilr-provided integrations that do not have a separate setup guide. Install availability depends on your Quilr tenant and the provider plan your organization owns.

For provider-hosted alternatives and the capabilities Quilr adds or intentionally omits, see [Official MCP Comparison](./official-comparison).

## Audited Tool Surface

The counts below describe the current public MCP tools or high-level dispatchers implemented by each integration. A dispatcher can support several operations behind one tool, so counts are useful for orientation but not a measure of total API coverage.

| Integration | Public surface | Read areas | Write or destructive areas |
|---|---:|---|---|
| Microsoft 365 Outlook | Broad multi-workload surface | Mail, calendar, files, SharePoint, Teams, directory, OneNote, search, sync | Mail, events, files, sharing, Teams, notes, batch operations |
| SharePoint | 6 high-level tools | Find, list, get | Create, update, delete |
| Excel | 8 high-level dispatchers | Workbook, worksheet, range, table, named range, chart, pivot, function | Supported operations inside the first six dispatchers |
| Microsoft Tasks & Planner | 10 tools | Lists, tasks, plans, buckets | Create/update tasks; delete To Do tasks |
| Jira | 10 tools | Identity, projects, issues, search, transitions | Create, assign, transition, comment |
| Confluence | 9 tools | Identity, spaces, pages, CQL search | Create/update pages; add comments |
| Athenahealth | 9 tools | Connection capabilities, athenaOne, FHIR, bulk export status | Gated athenaOne/FHIR writes and deletes |
| Avoma | 4 tools | Meetings, transcripts, notes | None |
| HubSpot CRM | 9 tools | Search, batch read, associations, properties, owners | Create/update/archive records; create notes and tasks |
| Writer | 10 tools | Models, chat, apps, knowledge graphs, files, translation, vision, web | Run Writer applications |
| Tavily | 8 tools | Search, extract, map, crawl, research, usage, key details | None |
| Quilr Web Search | 2 tools | Search and webpage retrieval | None |

The separately documented integrations currently expose 47 Azure DevOps tools, 48 BrowserStack tools, 40 Calendly tools, 23 Semrush tools, 19 Figma tools, and 13 Google Workspace tools. See their linked setup guides for the operation-level breakdown.

## Choosing Between Overlapping Integrations

| Need | Recommended MCP | Why |
|---|---|---|
| Work across mail, meetings, files, Teams, and notes | Microsoft 365 Outlook | One connection spans the broad Microsoft 365 workflow. |
| Restrict an agent to SharePoint sites, libraries, and lists | SharePoint | Smaller six-tool surface with explicit create, update, and confirmed delete operations. |
| Manipulate workbook structures and calculations | Excel | Purpose-built dispatchers for ranges, formulas, tables, charts, pivots, and formatting. |
| Manage personal and team tasks | Microsoft Tasks & Planner | Combines To Do and Planner without exposing unrelated Microsoft 365 workloads. |
| Perform lightweight search and retrieve selected pages | Quilr Web Search | Minimal managed surface. |
| Crawl sites or run multi-step web research | Tavily | Adds extraction, mapping, crawling, research jobs, and usage visibility. |

## Microsoft 365 Outlook

The Microsoft 365 Outlook MCP brings related Microsoft Graph workloads into one agent connection. It supports email and attachments, calendars and scheduling, OneDrive files, OneNote content, Teams collaboration, Microsoft Search, and incremental change synchronization. Write operations include sending mail, managing events, and supported file or collaboration updates.

Use Microsoft delegated OAuth. The granted Microsoft Graph scopes determine which workloads and operations are available. For focused site and workbook workflows, use the dedicated SharePoint and Excel MCPs below.

## SharePoint

Use SharePoint to search and resolve sites, files, folders, document libraries, lists, and list items. The six high-level tools cover find, list, get, create, update, and delete workflows. Deletes require explicit confirmation.

The integration uses Microsoft delegated OAuth. Site permissions and the user's existing SharePoint access still apply.

## Excel

Use Excel for workbooks stored in Microsoft 365. The integration supports workbook and worksheet discovery, range reads and writes, formulas, formatting, tables, named ranges, charts, pivot tables, and function evaluation.

Because workbook mutations can affect formulas and downstream reporting, enable only the write tools required by the agent and test against a non-production workbook first.

## Microsoft Tasks & Planner

This integration combines Microsoft To Do and Planner. Agents can list and manage To Do lists and tasks, and discover plans, buckets, and Planner tasks. Create and update operations are labeled as writes; delete operations are labeled destructive.

Use it when a workflow spans personal tasks and shared team planning. Microsoft delegated OAuth and the user's existing plan membership determine access.

## Jira

The Jira MCP connects to Atlassian through OAuth 2.0 3LO for issue and project workflows. Use it for Jira search and issue-oriented automation while keeping each user's actions tied to their Atlassian identity.

For knowledge-base content, use the separate Confluence integration. Jira capabilities can vary while the integration is being expanded, so verify the tool list shown in Quilr before building an agent workflow.

## Confluence

Confluence provides nine tools for user identity, spaces, pages, CQL search, page creation and updates, and comments. The current surface has seven read tools and two write tools, with no destructive tools.

It uses Atlassian OAuth 2.0. The connected user's Confluence permissions remain authoritative.

## Athenahealth

Athenahealth supports allowlisted athenaOne REST and FHIR reads, controlled athenaOne and FHIR writes, separately enabled deletes, and FHIR bulk-export job management. It is intended for carefully scoped clinical-system workflows rather than unrestricted API access.

Each customer supplies an Athena system application. Capability packs and destructive writes default to disabled; writes require confirmation and an idempotency key, are not retried automatically, and avoid persisting PHI in application state, logs, traces, or the write-audit ledger.

## Avoma

Avoma is a read-only meeting-intelligence integration. It lists meetings and batch-reads meeting details, transcripts, and notes. Each user connects an Avoma API key, keeping access isolated to that provider account.

Use it for meeting lookup, transcript analysis, follow-up extraction, and note retrieval without allowing the agent to alter Avoma data.

## HubSpot CRM

HubSpot supports CRM object search, batch reads, associations, property and owner discovery, record creation, updates, and archive-style deletion. It can also create CRM notes and tasks associated with records. It is useful for agent workflows across contacts, companies, deals, tickets, and other supported CRM objects.

Record deletion is destructive and should remain disabled unless the workflow explicitly needs it. Provider permissions and the connected HubSpot account limit the accessible objects and properties.

## Writer

Writer exposes chat and model discovery, Writer applications, knowledge graphs, files, translation, image analysis, and Writer web search. Most tools are read-oriented; running a Writer application is labeled as a write.

The user's Writer API key is the upstream credential and is validated before use. Available models, applications, and knowledge graphs depend on the connected Writer organization.

## Optimizely Experimentation

Optimizely covers schema-guided queries, experiment summaries, program reporting, SDK documentation search, entity lifecycle operations, exports, change history, collaborators, and environment datafiles.

Each customer owns the Optimizely OAuth application and supplies its client credentials. Lifecycle operations can modify or delete experimentation entities, so separate analysis agents from administrative agents through tool policy.

## Tavily

Tavily provides read-only search, URL extraction, site mapping, crawling, asynchronous research, account usage, and key information. Users connect their Tavily API key through the authorization flow.

Provider plan limits apply. Deep research and crawl operations can consume more Tavily credits than a basic search, so use bounded inputs and monitor usage.

## Cycode

Cycode provides a focused code-security surface around service status and secret scanning. Use it to add a security check to development workflows without exposing a broad command runner to the agent.

Scanning can send selected repository content to the configured Cycode service. Apply your organization's source-code handling policy before enabling it for sensitive repositories.

## Quilr Web Search

Quilr Web Search is the lightweight managed option for general web search and webpage retrieval. Search accepts result limits, search type, location, and optional domain filters; page retrieval returns content for selected URLs.

For multi-step research, crawling, mapping, and provider usage reporting, choose Tavily. Administrators can also apply [Web Search Policy](../mcp-gateway/features/web-search-policy) to constrain allowed domains.

## Setup Guides For Other Quilr-Provided MCPs

- [Azure DevOps Advanced](../mcp-gateway/mcp-provider-setup/azure-devops)
- [BrowserStack Advanced](../mcp-gateway/mcp-provider-setup/browserstack)
- [Calendly](../mcp-gateway/mcp-provider-setup/calendly)
- [Figma](../mcp-gateway/mcp-provider-setup/figma)
- [Google Workspace](../mcp-gateway/mcp-provider-setup/google-workspace)
- [Semrush Advanced](../mcp-gateway/mcp-provider-setup/semrush)

## Supporting Services Not Listed As Integrations

The custom MCP codebase also contains the MCP library ingestion service, MCP orchestrator, and the custom-MCP observability stack. These operate discovery, acquisition, monitoring, and remediation for the MCP fleet; they are platform services rather than user-selectable business integrations, so they do not appear in the comparison catalog.
