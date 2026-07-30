---
sidebar_position: 10
sidebar_custom_props:
  icon: Workflow
---

# Azure DevOps Advanced MCP

Connect Azure DevOps Services to QuilrAI through the custom Azure DevOps
Advanced MCP. It provides 47 model-facing tools across organizations, projects,
Azure Repos, pull requests, Boards, Pipelines, Test Plans, Wiki, Search, and
Advanced Security.

The integration uses Microsoft Entra delegated OAuth. Each user signs in with
their own Microsoft account, and Azure DevOps applies that user's existing
organization, project, repository, pipeline, and work-item permissions.

```text
MCP client -> QuilrAI Gateway -> Azure DevOps MCP -> Microsoft Entra -> Azure DevOps
```

:::warning Azure DevOps Services
This guide covers cloud-hosted Azure DevOps Services at `dev.azure.com`. It does
not cover Azure DevOps Server hosted on a customer's own network.
:::

See [Provider Setup Overview](./overview) for shared prerequisites and secret
handling.

## Authentication Model

The custom MCP uses a pre-registered Microsoft Entra application and delegated
`user_impersonation` permission for the Azure DevOps resource. It does not use
the deprecated Azure DevOps OAuth application registration system.

Microsoft stopped accepting new Azure DevOps OAuth registrations in April 2025
and recommends Microsoft Entra OAuth for new integrations. Do not create a
legacy application through the old Azure DevOps OAuth registration page.

| Component | Responsibility |
|-----------|----------------|
| Customer Entra administrator | Creates or approves the Entra application, redirect URI, delegated Azure DevOps permission, and client secret. |
| Azure DevOps MCP service | Owns the Entra OAuth configuration and exposes the MCP-compatible authorization flow. |
| QuilrAI Gateway | Registers the MCP in Auto-detect mode, applies access controls and guardrails, and exposes the customer-facing gateway URL. |
| End user | Signs in with Microsoft and can access only the Azure DevOps resources already permitted to that identity. |
| MCP client | Connects only to the generated QuilrAI gateway URL. It never receives the Entra Client Secret. |

## Create The Microsoft Entra Application

If QuilrAI already provides a managed Entra application for your tenant, skip
this section and ask the tenant administrator to approve that application.
Otherwise, create a customer-owned application:

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com/)
   using an account allowed to manage application registrations.
2. Open **Entra ID** > **App registrations** and select
   **New registration**.
3. Enter a recognizable name, such as `QuilrAI Azure DevOps MCP`.
4. Choose the supported account type:
   - Select **Accounts in this organizational directory only** for a dedicated
     single-tenant customer deployment.
   - Select **Accounts in any organizational directory** only for an approved
     multi-tenant deployment.
5. Under **Redirect URI**, select **Web** and enter:

   ```text
   https://azure-devops.mcp.quilr.ai/auth/callback
   ```

6. Select **Register**.
7. From **Overview**, copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**, or use `organizations` only for an approved
     multi-tenant application
8. Open **API permissions** and select **Add a permission**.
9. Select **APIs my organization uses**, search for **Azure DevOps**, and select
   it.
10. Select **Delegated permissions**, enable `user_impersonation`, and add the
    permission.
11. Grant tenant-wide admin consent if your organization's consent policy
    requires it. Otherwise, users are prompted during connection.
12. Open **Certificates & secrets** > **Client secrets** and select
    **New client secret**.
13. Choose an approved description and expiration, then select **Add**.
14. Copy the secret **Value** immediately. Do not copy the Secret ID.

:::warning Protect the secret
Microsoft displays the Client Secret value only once. Store it in the approved
secret manager and provide it to the QuilrAI operator through the authorized
onboarding channel. Never place it in an MCP client JSON file, browser chat,
ticket, source repository, or the gateway transport URL.
:::

The service requests these OAuth scopes:

```text
499b84ac-1321-427f-aa17-267ca6975798/user_impersonation
openid
profile
offline_access
```

`499b84ac-1321-427f-aa17-267ca6975798` is the Azure DevOps resource identifier.
The application receives delegated access, not unrestricted application access.
The signed-in user's Azure DevOps permissions remain the effective boundary.

## Azure DevOps Prerequisites

Before users connect, confirm that:

- the Azure DevOps organization is connected to the intended Microsoft Entra
  tenant;
- each user is a member or guest of every Azure DevOps organization they need;
- users have project and resource permissions for the tools they will invoke;
- Advanced Security is enabled and licensed where security tools are required;
- Test Plans, Pipelines, Wiki, and other product features are enabled where
  relevant;
- tenant consent and Conditional Access policies permit the Entra application;
- destructive tools are denied in QuilrAI unless separately approved.

## Add The MCP To QuilrAI

1. In QuilrAI, go to **Settings** > **AI Gateway** > **MCP Gateway**.
2. Click **Add MCP**.
3. Enter the following values:

   | Field | Value |
   |-------|-------|
   | Name | `Azure DevOps Advanced` |
   | Slug | A unique value such as `azure-devops` |
   | Transport URL | `https://azure-devops.mcp.quilr.ai/mcp` |
   | Auth mode | **Auto-detect** |

4. Create the MCP connection.
5. Click **Connect** or **Reconnect**.
6. Sign in with the Microsoft identity that has access to the required Azure
   DevOps organization and accept the requested permissions.
7. Return to QuilrAI and refresh capabilities. The MCP should expose 47 tools.
8. Use **Tools**, **Access Control**, **Guardrails**, and group/user rules to
   restrict the exposed operations before connecting agent clients.

Do not enter the Entra Client Secret into Cursor, Claude, ChatGPT, or another
MCP client. The upstream MCP service owns the Entra application configuration.

## Organization Selection

An Azure DevOps user can belong to one or several organizations. Organization
arguments are optional on normal organization-scoped tools:

- With one linked organization, the MCP selects and saves it automatically.
- With multiple organizations and no saved selection, a tool returns
  `organization_selection_required` with the available choices.
- Call `ado_select_organization` using the exact URL-name segment, such as
  `contoso` from `https://dev.azure.com/contoso`.
- Do not pass a full URL or a display label.
- An organization supplied directly to another tool is a one-call override and
  does not silently replace the saved selection.

Organization discovery and the selected organization are stored per signed-in
principal. Access and refresh tokens are not stored in the organization-context
file.

## Tool Catalog

The 47 tools are grouped by risk and usage style. Direct tools cover frequent
operations with explicit schemas. Dispatcher tools consolidate related
operations behind an `action` selector. Intelligence tools combine several API
calls into one useful briefing. Destructive tools always require an exact
confirmation phrase.

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

These tools are marked destructive, are not retried automatically, and reject
the request unless the exact confirmation value is supplied. Keep them disabled
in QuilrAI unless the customer has explicitly approved the workflow.

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

## Connect An MCP Client

Use the generated QuilrAI gateway URL. Do not point the agent directly at the
private upstream URL.

Cursor example:

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

Use a short key such as `ado` to keep combined server/tool names compact. For
Claude, add a custom connector with the same generated QuilrAI gateway URL and
leave the optional OAuth Client ID and Client Secret fields empty.

## Verify The Connection

Start with a discovery-only prompt:

```text
Use the Azure DevOps MCP. First call ado_list_organizations. If there is one
organization, use it automatically. If there are multiple, show me the choices
and wait for my selection. Then list the first 20 projects. Do not guess an
organization and do not create, update, run, vote, comment, or delete anything.
```

After selecting a project, test a bounded read:

```text
Using my selected Azure DevOps organization, list repositories in PROJECT_NAME,
then show active pull requests for the first repository. Read-only operations
only.
```

## Redeployment And Reconnection

Routine MCP redeployments should not require users to authenticate again when
all of the following remain stable:

- the public MCP URL and OAuth callback URL;
- the Entra tenant and Application ID;
- the MCP OAuth JWT signing key;
- the encrypted OAuth state volume;
- the organization-context state volume.

Users normally need to reconnect after the Entra Client Secret expires or is
rotated without updating the service, consent is revoked, required scopes
change, refresh fails permanently, OAuth state is lost, the public resource URL
changes, or the Entra application is replaced.

Organization membership is refreshed automatically. A routine restart can
refresh linked organizations without requiring the user to sign in again.

## Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| `AADSTS9010010` resource/scopes mismatch | The MCP resource URL was forwarded to Microsoft Entra as the OAuth resource, but the token request must target Azure DevOps. | Confirm the custom MCP OAuth proxy is configured not to forward the MCP resource and requests the Azure DevOps delegated scope shown above. |
| `invalid_client` | Wrong Application ID, expired/wrong secret value, wrong tenant, or the Secret ID was supplied instead of the secret Value. | Verify the Entra application, tenant, and current Client Secret value in the private MCP configuration. |
| Redirect URI mismatch | The Entra Web redirect URI differs from `https://azure-devops.mcp.quilr.ai/auth/callback`. | Update the Entra app with the exact URI, save, and reconnect. |
| Consent or login blocked | Admin consent, user assignment, Conditional Access, or cross-tenant access policy blocks the app. | Ask the customer's Entra administrator to review the enterprise application and sign-in logs. |
| `ado_list_organizations` returns no organizations | The Microsoft identity is not linked to an Azure DevOps organization, the organization uses another tenant, or the identity lacks membership. | Sign in with the correct work account and confirm organization membership in Azure DevOps. |
| `organization_selection_required` | The user belongs to multiple organizations and has not saved a default. | Show the returned choices and call `ado_select_organization` with the exact organization URL-name segment. |
| `401` or `TF400813` from Azure DevOps | Token, organization membership, tenant linkage, or Azure DevOps user authorization is invalid. | Reconnect, confirm the account and organization tenant, and verify the user is active in Azure DevOps. |
| `403` for one tool | OAuth succeeded, but the user lacks an Azure DevOps resource permission or required product license. | Grant the minimum project/repository/pipeline/Test Plans/Advanced Security permission or use an appropriately authorized account. |
| Tools remain at `Loading tools` | OAuth was not completed, the wrong URL was configured, or the gateway cannot refresh capabilities. | Use the generated gateway URL in the client, complete **Connect**, refresh capabilities in QuilrAI, and restart or toggle the client entry. |
| User must reconnect after deployment | OAuth signing key, encrypted state volume, callback/resource URL, or Entra app identity changed. | Restore the stable configuration/state or reconnect after verifying the new deployment. |

## Security Notes

- Prefer Microsoft Entra OAuth over personal access tokens.
- Do not request or store a user's Microsoft password. Sign-in occurs only on
  Microsoft-hosted pages.
- Never expose the Entra Client Secret, access tokens, refresh tokens, PATs, or
  OAuth signing key in agent configuration or logs.
- Apply least privilege in Azure DevOps and again through QuilrAI tool and group
  policies.
- Keep write and destructive operations disabled unless they are required and
  approved.
- Review the exact organization, project, repository, branch, work item, build,
  or pipeline before approving a destructive action.

## References

- [Microsoft: Build Azure DevOps integrations with Microsoft Entra OAuth apps](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/entra-oauth?view=azure-devops)
- [Microsoft: Authenticate to Azure DevOps with Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/entra?view=azure-devops)
- [Microsoft: Register a Microsoft Entra application](https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-service-principal-portal)
- [Microsoft: Azure DevOps OAuth deprecation](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/azure-devops-oauth?view=azure-devops)
- [Microsoft: Azure DevOps MCP source](https://github.com/microsoft/azure-devops-mcp)
- [QuilrAI: OAuth Connect](../features/oauth-connect)
