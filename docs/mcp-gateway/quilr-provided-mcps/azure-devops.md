---
sidebar_position: 7
sidebar_custom_props:
  badge: advanced
  icon: GitBranch
---

# Azure DevOps Advanced

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">ENGINEERING INTELLIGENCE</span><h2>Delivery context, not just API calls.</h2><p>Repositories, pull requests, boards, pipelines, tests, wiki, and security with compound engineering insights.</p></div>

Azure DevOps Advanced is a Quilr-built MCP for Azure DevOps Services (`dev.azure.com`). It provides 47 tools across organizations, projects, Azure Repos, pull requests, Boards, Pipelines, Test Plans, Wiki, Search and Advanced Security. Each user signs in with their own Microsoft account through Microsoft Entra delegated OAuth, so Azure DevOps applies that user's existing permissions.

```text
MCP client -> QuilrAI Gateway -> Azure DevOps MCP -> Microsoft Entra -> Azure DevOps
```

:::warning Azure DevOps Services only
This MCP covers cloud-hosted Azure DevOps Services. It does not cover Azure DevOps Server hosted on your own network.
:::

## Tools

Direct tools cover frequent operations with explicit schemas. Dispatcher tools group related operations behind an `action` selector. Intelligence tools combine several API calls into one briefing. Destructive tools always require an exact confirmation phrase.

### Organization and common direct tools

| Tool | Risk | Purpose |
|------|------|---------|
| `ado_list_organizations` | Read | Refresh and list Azure DevOps organizations linked to the signed-in user, including the saved selection. |
| `ado_select_organization` | Read/settings | Validate and save one linked organization as the user's default. |
| `ado_list_projects` | Read | List projects with optional name/state filters and continuation pagination. |
| `ado_list_repositories` | Read | List repositories in a project, with optional filtering and hidden-repository inclusion. |
| `ado_get_file` | Read | Read a repository file from a branch, tag, or commit. |
| `ado_list_pull_requests` | Read | List pull requests across a project or within one repository using status, creator, reviewer, and target filters. |
| `ado_get_pull_request` | Read | Retrieve one pull request with optional commits and linked work items. |
| `ado_create_pull_request` | Write | Create a pull request with title, description, reviewers, draft state, and linked work items. |
| `ado_get_work_item` | Read | Retrieve one work item with selected fields and relation expansion. |
| `ado_query_work_items` | Read | Execute a bounded WIQL query and return matching work-item references. |
| `ado_create_work_item` | Write | Create a work item from an Azure DevOps field mapping and optional relations. |
| `ado_run_pipeline` | Write | Preview or queue a YAML pipeline run with variables, template parameters, resources, and skipped stages. |

### Compatibility dispatcher tools

| Tool | Risk | Purpose and supported actions |
|------|------|-------------------------------|
| `ado_core_read` | Read | Read projects, project teams, identity IDs, or connection metadata. Actions: `list_projects`, `list_project_teams`, `get_identity_ids`, `get_connection_data`. |
| `ado_repositories_read` | Read | Inspect repositories, branches, commits, directories, and files. Actions: `list_repositories`, `get_repository`, `list_branches`, `list_my_branches`, `get_branch`, `search_commits`, `list_directory`, `get_file_content`. |
| `ado_repositories_write` | Write | Create a branch. Action: `create_branch`. |
| `ado_pull_requests_read` | Read | List and inspect pull requests, changes, labels, threads, and comments. Actions: `list`, `list_by_commits`, `get`, `get_changes`, `get_labels`, `list_threads`, `list_thread_comments`. |
| `ado_pull_requests_write` | Write | Create or update pull requests, reviewers, votes, labels, threads, and comments. Actions: `create`, `update`, `update_reviewers`, `vote`, `update_labels`, `create_thread`, `update_thread`, `reply_to_comment`. |
| `ado_search` | Read | Search source code, wiki content, or work items. Actions: `code`, `wiki`, `work_item`. |
| `ado_work_items_read` | Read | Read work items, comments, revisions, types, backlogs, iterations, saved queries, WIQL results, and attachments. Actions: `get`, `get_batch`, `list_comments`, `list_revisions`, `get_work_item_type`, `my_work_items`, `get_iteration_work_items`, `list_backlogs`, `list_backlog_work_items`, `get_query`, `get_query_results`, `query_wiql`, `get_attachment`. |
| `ado_work_items_write` | Write | Create or update work items, relations, artifact/PR links, and comments. Actions: `create`, `update`, `update_batch`, `add_children`, `link`, `unlink`, `add_artifact_link`, `link_pull_request`, `add_comment`, `update_comment`. |
| `ado_work_read` | Read | Read iterations, team settings, capacity, and iteration capacity. Actions: `list_iterations`, `list_team_iterations`, `get_team_settings`, `get_team_capacity`, `get_iteration_capacities`. |
| `ado_work_write` | Write | Create or assign iterations and update team-member capacity. Actions: `create_iterations`, `assign_iterations`, `update_capacity`. |
| `ado_pipelines_build` | Read | List builds, inspect status, and list build changes. Actions: `list`, `get_status`, `get_changes`. |
| `ado_pipelines_build_log` | Read | List build logs or retrieve log content. Actions: `list`, `get_content`. |
| `ado_pipelines_definition` | Read | List build definitions and definition revisions. Actions: `list`, `list_revisions`. |
| `ado_pipelines_run` | Read | Get one pipeline run or list runs. Actions: `get`, `list`. |
| `ado_pipelines_artifact` | Read/download | List or download pipeline artifacts. Actions: `list`, `download`. |
| `ado_pipelines_write` | Write | Queue/preview pipelines, create pipeline definitions, or update build-stage state. Actions: `run_pipeline`, `create_pipeline`, `update_build_stage`. |
| `ado_test_plans_read` | Read | List test plans, suites, cases, or test results from a build. Actions: `list_plans`, `list_suites`, `list_cases`, `show_results_from_build`. |
| `ado_test_plans_write` | Write | Create plans/suites/cases, attach cases to suites, or update test steps. Actions: `create_plan`, `create_suite`, `add_test_cases`, `create_test_case`, `update_test_case_steps`. |
| `ado_wiki_read` | Read | List and inspect wikis, pages, and page content. Actions: `list_wikis`, `get_wiki`, `list_pages`, `get_page`, `get_page_content`. |
| `ado_wiki_write` | Write | Create or update a wiki page with concurrency protection. Action: `upsert_page`. |
| `ado_advanced_security_read` | Read | List Advanced Security alerts or retrieve one alert. Actions: `list_alerts`, `get_alert`. |

### Intelligence tools

| Tool | Risk | Purpose |
|------|------|---------|
| `ado_project_overview` | Read | Build a project briefing from repositories, active pull requests, recent builds, and open work items. |
| `ado_pull_request_readiness` | Read | Summarize draft status, reviewer votes, discussions, merge state, policies, commits, and file changes. |
| `ado_pipeline_failure_summary` | Read | Explain a failed run using stage/task outcomes, issues, logs, and build status. |
| `ado_work_item_traceability` | Read | Follow parent/child, pull request, commit, build, wiki, revision, and comment relationships for one work item. |
| `ado_sprint_health` | Read | Summarize sprint state, ownership, effort, remaining work, completion, and team capacity. |
| `ado_security_dashboard` | Read | Aggregate Advanced Security alerts across repositories by severity, state, and alert type. |

### Destructive tools

These tools are marked destructive, are not retried automatically, and reject the request unless the exact confirmation value is supplied. Keep them disabled in [Tool visibility](../protect/tool-visibility) unless the workflow is explicitly approved.

| Tool | Purpose | Exact confirmation |
|------|---------|--------------------|
| `ado_delete_branch` | Delete one Git branch reference. | `DELETE BRANCH` |
| `ado_delete_repository` | Delete an Azure Repos repository. | `DELETE REPOSITORY` |
| `ado_delete_work_item` | Soft-delete or permanently destroy a work item. | `DELETE WORK ITEM` or `DESTROY WORK ITEM` |
| `ado_delete_build` | Delete one build and its retained build data. | `DELETE BUILD` |
| `ado_delete_pipeline` | Delete a pipeline and its builds. | `DELETE PIPELINE AND BUILDS` |
| `ado_delete_wiki_page` | Delete one wiki page. | `DELETE WIKI PAGE` |
| `ado_delete_test_plan` | Delete one test plan. | `DELETE TEST PLAN` |
| `ado_delete_iteration` | Delete one project iteration. | `DELETE ITERATION` |

### Organization selection

Organization arguments are optional on organization-scoped tools:

- With one linked organization, the MCP selects and saves it automatically.
- With several organizations and no saved selection, a tool returns `organization_selection_required` with the choices.
- Call `ado_select_organization` with the exact URL-name segment, such as `contoso` from `https://dev.azure.com/contoso`. Do not pass a full URL or a display label.
- An organization passed directly to another tool is a one-call override and does not replace the saved selection.

The selection is stored per signed-in user. Access and refresh tokens are not stored with it.

## Setup

The MCP uses a Microsoft Entra application with the delegated `user_impersonation` permission for Azure DevOps. It does not use the deprecated Azure DevOps OAuth app registration, which stopped accepting new apps in April 2025.

| Who | Responsibility |
|-----|----------------|
| Your Entra administrator | Creates or approves the Entra application, redirect URI, delegated Azure DevOps permission and client secret. |
| Azure DevOps MCP service | Owns the Entra OAuth configuration and exposes the MCP authorization flow. |
| QuilrAI administrator | Adds the server to the MCP Gateway and sets tools, access and guardrails. |
| Each user | Signs in with Microsoft and reaches only the Azure DevOps resources they already have. |

### 1. Create the Microsoft Entra application

If Quilr already provides a managed Entra application for your tenant, skip this step and ask your tenant administrator to approve it.

1. In the [Microsoft Entra admin center](https://entra.microsoft.com/), open **Entra ID** > **App registrations** > **New registration**.
2. Enter a name such as `QuilrAI Azure DevOps MCP`.
3. Choose **Accounts in this organizational directory only** for a single-tenant deployment, or **Accounts in any organizational directory** only for an approved multi-tenant deployment.
4. Under **Redirect URI**, select **Web** and enter `https://azure-devops.mcp.quilr.ai/auth/callback`. Click **Register**.
5. From **Overview**, copy the **Application (client) ID** and **Directory (tenant) ID**.
6. Open **API permissions** > **Add a permission** > **APIs my organization uses**, select **Azure DevOps**, then under **Delegated permissions** enable `user_impersonation`.
7. Grant tenant-wide admin consent if your consent policy requires it. Otherwise users are prompted when they connect.
8. Open **Certificates & secrets** > **Client secrets** > **New client secret**, then copy the secret **Value** (not the Secret ID).

:::warning Protect the secret
Microsoft shows the client secret value only once. Store it in your approved secret manager and hand it to Quilr through the authorized onboarding channel. Never put it in an MCP client file, chat, ticket, repository or URL.
:::

The service requests these scopes. `499b84ac-1321-427f-aa17-267ca6975798` is the Azure DevOps resource ID.

```text
499b84ac-1321-427f-aa17-267ca6975798/user_impersonation
openid
profile
offline_access
```

### 2. Check Azure DevOps prerequisites

- The Azure DevOps organization is connected to the intended Entra tenant.
- Each user is a member or guest of every organization they need, with project permissions for the tools they will call.
- Advanced Security, Test Plans, Pipelines and Wiki are enabled and licensed where those tools are needed.
- Tenant consent and Conditional Access policies permit the Entra application.

### 3. Add the server to the MCP Gateway

1. Go to **Settings > AI Gateway > MCP Gateway** and click **Add MCP server**. Choose **Remote server**.
2. Enter **Name** `Azure DevOps Advanced`, a **Slug** such as `azure-devops`, and **Transport URL** `https://azure-devops.mcp.quilr.ai/mcp`.
3. Under **How the gateway signs in**, keep **Auto-detect (recommended)**, click **Probe and continue** and finish the steps to **Create MCP**.
4. [Connect OAuth once as an administrator](../servers-and-connections/adding-mcp-servers#connect-an-oauth-server-as-an-administrator) with a Microsoft account that can reach the organization, and accept the requested permissions. The server should list 47 tools.
5. In **Configure**, review [Tool visibility](../protect/tool-visibility), [Server access](../protect/server-access) and [Security guardrails](../protect/security-guardrails) before users connect.

Do not enter the Entra client secret in Cursor, Claude, ChatGPT or any other client. The upstream MCP service owns it.

### 4. Connect a client and verify

Point clients at the server's **Quilr gateway** URL, never the upstream URL. A short key such as `ado` keeps combined server and tool names compact:

```json
{
  "mcpServers": {
    "ado": {
      "type": "http",
      "url": "https://mcpgateway.quilr.ai/YOUR-AZURE-DEVOPS-SLUG/mcp"
    }
  }
}
```

For Claude, add a custom connector with the same URL and leave its OAuth Client ID and Client Secret fields empty. Start with a read-only prompt:

```text
Use the Azure DevOps MCP. First call ado_list_organizations. If there is one
organization, use it automatically. If there are multiple, show me the choices
and wait for my selection. Then list the first 20 projects. Do not create,
update, run, vote, comment, or delete anything.
```

### Reconnection

Routine redeployments do not require users to sign in again while the public MCP and callback URLs, the Entra tenant and application, the OAuth signing key and the stored OAuth and organization state stay the same. Users must reconnect after the client secret expires or rotates without a service update, consent is revoked, scopes change, or the Entra application is replaced.

### Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| `AADSTS9010010` resource/scopes mismatch | The MCP resource URL was forwarded to Entra as the OAuth resource. | Confirm the MCP OAuth proxy does not forward the MCP resource and requests the Azure DevOps scope above. |
| `invalid_client` | Wrong Application ID, expired or wrong secret, wrong tenant, or the Secret ID was used instead of the Value. | Verify the Entra application, tenant and current secret value. |
| Redirect URI mismatch | The Entra Web redirect URI differs from `https://azure-devops.mcp.quilr.ai/auth/callback`. | Fix the URI in Entra, save and reconnect. |
| Consent or login blocked | Admin consent, user assignment, Conditional Access or cross-tenant policy blocks the app. | Ask your Entra administrator to review the enterprise application and sign-in logs. |
| `ado_list_organizations` returns nothing | The account is not linked to an Azure DevOps organization, or the organization uses another tenant. | Sign in with the right work account and confirm membership. |
| `organization_selection_required` | Several organizations and no saved default. | Call `ado_select_organization` with the exact URL-name segment. |
| `401` or `TF400813` | Token, membership, tenant linkage or Azure DevOps authorization is invalid. | Reconnect and confirm the user is active in the organization. |
| `403` for one tool | The user lacks that resource permission or product license. | Grant the minimum permission or use an authorized account. |
| Tools stay at **Loading tools** | OAuth not completed, wrong URL, or capabilities not refreshed. | Use the gateway URL, finish **Connect**, refresh tools and restart the client entry. |

References: [Entra OAuth for Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/entra-oauth?view=azure-devops), [Azure DevOps OAuth deprecation](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/azure-devops-oauth?view=azure-devops), [Microsoft Azure DevOps MCP source](https://github.com/microsoft/azure-devops-mcp).

## Compared with the official server

<McpDecision
  officialTitle="Choose official for local IDE work"
  official="Use Microsoft's server when developers need first-party Azure DevOps operations directly inside a supported local coding environment."
  officialPoints={['Excellent IDE-native workflow', 'First-party core domain coverage']}
  quilrTitle="Choose Quilr for organization-wide access"
  quilr="Use Quilr when teams need one hosted endpoint with delegated OAuth, gateway policy, compound delivery intelligence, and controlled destructive actions."
  quilrPoints={['Remote multi-tenant operation', 'Briefs, dashboards, and confirmed deletes']}
  verdict="Local developer assistance favors the official server; centrally governed engineering agents favor Quilr Advanced."
/>

| Capability | Official Azure DevOps MCP | Quilr Advanced |
|---|:---:|:---:|
| Core Azure DevOps domains | ✅ | ✅ |
| Local IDE server | ✅ | - |
| Centrally hosted streamable HTTP | - | ✅ |
| Multi-tenant Entra delegated OAuth | - | ✅ |
| Compatibility dispatchers for established operations | - | ✅ 21 dispatchers / 93 operations |
| Direct common-operation tools | ✅ | ✅ 12 curated tools |
| Compound project and sprint intelligence | - | ✅ |
| Pull-request readiness and pipeline failure briefs | - | ✅ |
| Traceability and security dashboards | - | ✅ |
| Separately confirmed destructive operations | - | ✅ 8 tools |

The official server is excellent for local IDE use. Quilr Advanced is designed for organization-wide access through gateway policy and auditing.
