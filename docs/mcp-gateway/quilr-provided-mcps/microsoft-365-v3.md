---
sidebar_position: 3
sidebar_custom_props:
  badge: flagship
  icon: Sparkles
---

# Microsoft 365 v3

<div className="mcp-product-hero">
  <span className="mcp-product-kicker">QUILR FLAGSHIP MCP</span>
  <h2>One Microsoft 365 brain. Not four disconnected connectors.</h2>
  <p>Mail, calendars, files, SharePoint, Teams, people, OneNote, search, sync, and controlled actions through one governed MCP.</p>
  <div className="mcp-stat-row">
    <span><strong>9</strong> workloads</span>
    <span><strong>1</strong> connection</span>
    <span><strong>Read + write</strong> workflows</span>
  </div>
</div>

<McpDecision
  officialTitle="Choose native connectors for retrieval"
  official="Use first-party Microsoft APIs or approved product connectors when the job is primarily searching and reading one workload inside a supported client."
  officialPoints={['Focused retrieval context', 'Provider-native authorization model']}
  quilrTitle="Choose one operational Microsoft surface"
  quilr="Use Quilr when an agent must safely move from search to action across mail, calendars, files, SharePoint, Teams, people, OneNote, and sync."
  quilrPoints={['Nine workloads through one connection', 'Writes, batch, sync, and destructive controls']}
  verdict="Retrieval-only use cases can stay native. Cross-workload operational agents benefit from the unified Quilr surface."
/>

## Quilr vs ChatGPT Microsoft Connectors

| Capability | **Quilr Microsoft 365 v3** | **ChatGPT Outlook** | **ChatGPT SharePoint** |
|---|:---:|:---:|:---:|
| Search and read email | ✅ | ✅ | - |
| Batch-read email | ✅ | ✅ | - |
| Send, reply, and forward email | ✅ | - | - |
| Draft lifecycle and attachments | ✅ | - | - |
| Move, mark, and delete email | ✅ | - | - |
| Read calendar events | ✅ | ✅ | - |
| Create, update, cancel, and respond to events | ✅ | - | - |
| Availability and meeting-time suggestions | ✅ | - | - |
| Search SharePoint and OneDrive | ✅ | - | ✅ |
| Read and download files | ✅ | - | ✅ |
| Upload, copy, move, share, and delete files | ✅ | - | - |
| SharePoint lists and list items | ✅ | - | - |
| Teams chats, channels, messages, and meetings | ✅ | - | - |
| Send Teams messages | ✅ | - | - |
| Directory, managers, reports, and org chain | ✅ | - | - |
| OneNote notebooks, sections, and pages | ✅ | - | - |
| Cross-workload search and URL resolution | ✅ | - | - |
| Delta sync for mail, calendar, and files | ✅ | - | - |
| Gateway guardrails and destructive-tool controls | ✅ | - | - |

<div className="mcp-verdict">
  <strong>The difference:</strong> ChatGPT's documented Outlook and SharePoint connector tools are excellent for retrieval. Quilr Microsoft 365 v3 is an operational MCP for end-to-end work across Microsoft 365.
</div>

:::note Comparison scope
The ChatGPT columns reflect the Outlook Email, Outlook Calendar, and SharePoint tools in OpenAI's [current connector tool catalog](https://developers.openai.com/api/docs/guides/tools-connectors-mcp#available-tools-in-each-connector). Newer ChatGPT workspace agents can have additional administrator-configured connector actions. Exact availability depends on product surface, workspace policy, OAuth scopes, and rollout.
:::

## What Agents Can Do

| Workload | Read and discover | Act |
|---|---|---|
| **Outlook Mail** | Search, list, batch-read, attachments, folders | Draft, send, reply, forward, move, mark read, delete |
| **Calendar** | Calendars, events, attachments, schedules, free/busy | Create, update, respond, cancel, attach files |
| **OneDrive** | Search, list, metadata, content, changes | Upload, resumable upload, copy, move, share, delete |
| **SharePoint** | Sites, drives, lists, items, files, URL resolution | Create/update lists and files, upload, move, delete |
| **Teams** | Chats, channels, messages, replies, meetings, presence | Send messages, reply, create/update/delete meetings |
| **Directory** | Profiles, relevant people, manager, reports, org chain | Read-only by design |
| **OneNote** | Notebooks, section groups, sections, pages | Create and update notebooks, sections, and pages |
| **Microsoft Search** | Search across mail, files, events, and people | Returns recommended next tool calls |
| **Synchronization** | Delta cursors for email, calendar, and drive changes | Incremental processing without full re-reads |

## Built For Enterprise Control

- Every operation is labeled read, write, idempotent write, or destructive.
- Large attachments and files use bounded or resumable transfer flows.
- Batch tools reduce agent round trips while enforcing per-call limits.
- Capability tokens protect download and continuation URLs.
- Microsoft delegated OAuth preserves the connected user's permissions.
- MCP Gateway can apply tool allowlists, sensitive-data scanning, agent access rules, and audit logging.

## When To Use A Focused MCP Instead

| Requirement | Choose |
|---|---|
| Broad workflows spanning communication, content, and people | **Microsoft 365 v3** |
| Sites, document libraries, and lists only | [SharePoint](./sharepoint) |
| Workbook calculations and formatting only | [Excel](./excel) |
| Personal and team task management only | [Microsoft Tasks & Planner](./microsoft-tasks-planner) |

The production endpoint and OAuth callback are provided by the Quilr MCP Library for your environment.
