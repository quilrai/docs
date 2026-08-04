---
sidebar_position: 1
sidebar_custom_props:
  icon: LayoutGrid
---

# Quilr-Provided MCPs

Quilr-provided MCPs are integrations built and operated by Quilr for products that need a broader, safer, or more agent-friendly tool surface than a provider's standard connector. Install them from the MCP Library, then use the MCP Gateway to control tools, guardrails, access, and audit logs.

This is different from a **custom MCP server** that your organization registers by URL. See [MCP Library](../mcp-gateway/features/mcp-library) for that workflow.

If the provider also publishes an MCP server, use the [Official MCP Comparison](./official-comparison) to understand which option is broader and what Quilr adds.

## Choose An Integration

| Integration | Best for | Main capabilities | Connection | Changes data? |
|---|---|---|---|---|
| [Microsoft 365 Outlook](./integration-reference#microsoft-365-outlook) | Mail, calendar, OneDrive, OneNote, Teams | Search, read, send, schedule, files, notes, collaboration | Microsoft OAuth | Yes |
| [SharePoint](./integration-reference#sharepoint) | Sites, document libraries, lists | Find, list, read, upload, update, delete | Microsoft OAuth | Yes |
| [Excel](./integration-reference#excel) | Cloud workbooks | Ranges, formulas, formatting, tables, charts, pivots | Microsoft OAuth | Yes |
| [Microsoft Tasks & Planner](./integration-reference#microsoft-tasks--planner) | Personal and team work planning | To Do lists/tasks and Planner plans/buckets/tasks | Microsoft OAuth | Yes |
| [Azure DevOps Advanced](../mcp-gateway/mcp-provider-setup/azure-devops) | Engineering delivery | Repos, pull requests, boards, pipelines, tests, wiki, security | Microsoft OAuth | Yes |
| [Jira](./integration-reference#jira) | Issue and project workflows | Issue, project, search, comment, and workflow operations | Atlassian OAuth | Yes |
| [Confluence](./integration-reference#confluence) | Knowledge bases | Spaces, pages, search, comments | Atlassian OAuth | Yes |
| [Google Workspace](../mcp-gateway/mcp-provider-setup/google-workspace) | Gmail, Calendar, and Drive | Search/read mail, drafts/send, events, Drive discovery/export | Google OAuth | Yes |
| [Figma](../mcp-gateway/mcp-provider-setup/figma) | Design-to-code and review | Design context, screenshots, variables, comments, Code Connect | Figma OAuth | Yes |
| [Calendly](../mcp-gateway/mcp-provider-setup/calendly) | Scheduling operations | Event types, invitees, routing, webhooks, availability | Calendly OAuth | Yes |
| [HubSpot CRM](./integration-reference#hubspot-crm) | CRM records | Search, batch read, associations, create, update, archive | HubSpot OAuth | Yes |
| [Avoma](./integration-reference#avoma) | Meeting intelligence | Meetings, transcripts, notes | API key | No |
| [Writer](./integration-reference#writer) | Enterprise generative AI | Chat, apps, knowledge graphs, files, translation, vision, web search | API key | Limited |
| [Optimizely Experimentation](./integration-reference#optimizely-experimentation) | Experiment analysis and operations | Results, schemas, reporting, lifecycle, collaborators, datafiles | Customer OAuth app | Yes |
| [Semrush Advanced](../mcp-gateway/mcp-provider-setup/semrush) | SEO and market research | Domains, keywords, backlinks, traffic, projects, batch analysis | API key | No |
| [BrowserStack Advanced](../mcp-gateway/mcp-provider-setup/browserstack) | Test operations and diagnostics | Browser/device inventory, Automate, App Automate, test management | Username + access key | Yes |
| [Athenahealth](./integration-reference#athenahealth) | Clinical system integration | athenaOne and FHIR reads, controlled writes, bulk export jobs | Customer OAuth app | Yes, gated |
| [Tavily](./integration-reference#tavily) | Agent web research | Search, extract, map, crawl, research, usage | API key | No |
| [Cycode](./integration-reference#cycode) | Code security | Service status and secret scanning | Optional provider auth | No |
| [Quilr Web Search](./integration-reference#quilr-web-search) | Lightweight search and page retrieval | Web search and webpage extraction | Managed | No |

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

For capability details on integrations that previously had no public page, continue to the [Integration Reference](./integration-reference).
