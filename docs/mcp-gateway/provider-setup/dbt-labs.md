---
sidebar_position: 17
sidebar_custom_props:
  icon: Database
---

# dbt Labs

dbt Labs operates its own remote MCP server as part of the dbt platform. Like Datadog and Zoho, you do **not** create an OAuth app or supply a Client ID and Client Secret. The dbt platform displays a ready-made **MCP Endpoint URL** in your account settings, and you add that URL to QuilrAI manually through **Add MCP**.

## How dbt Labs Differs

- **No custom OAuth credentials.** dbt handles authorization with your existing dbt platform login, so there is nothing to register in a dbt "app" console.
- **The URL is per-account, and dbt generates it for you.** Unlike Zoho, you do not configure a server to produce a URL. Unlike Datadog, it is not one shared site-wide endpoint. dbt shows one account-specific URL that already contains your account prefix and region.
- **Browser sign-in with MFA.** Authorization happens through the dbt sign-in page, and dbt enforces multi-factor authentication on the account. If the authorizing user has not enrolled a second factor yet, dbt interrupts the flow to enroll one before it will return to QuilrAI. See [Expect An MFA Prompt](#4-expect-an-mfa-prompt).
- **Remote is read-focused, not a dbt CLI.** The remote server covers Semantic Layer, Discovery, Administrative API, SQL, Fusion, and product-docs tools. It cannot run `dbt run`, `dbt build`, or `dbt test` - those are self-hosted-only toolsets. See [Available Tools](#available-tools).
- **An account admin has to enable AI features first.** Without that, the endpoint exists but will not authorize.

## Before You Start

Have these ready:

| Value | Where to get it |
|-------|-----------------|
| dbt platform account | Starter, Enterprise, or Enterprise+. OAuth for remote MCP is in public beta on these plans. |
| AI features enabled | An account admin turns this on in the dbt platform. Required before any MCP authorization succeeds. |
| MCP Endpoint URL | **Account settings** > **Account** > **Access URLs** > **MCP Endpoint URL**. |
| Static account subdomain | OAuth for MCP requires an account with a static subdomain, for example `abc123.us1.dbt.com`. |
| Enrolled MFA factor | On the dbt user who will authorize the connection. Authenticator app or security key; dbt's SMS option is US numbers only. |
| Production environment ID | Only for token-based auth. **Orchestration** > **Environments**. |

:::warning
A dbt personal access token or service token grants API access to your dbt account. Never commit one to Git or paste it into documentation, tickets, or chat. Only the OAuth path avoids handling a long-lived token at all, which is why it is the recommended route.
:::

## Connect dbt Labs

### 1. Enable AI features

An account admin must enable AI features for the dbt account. Until this is on, the MCP endpoint will reject authorization even though the URL is visible in settings.

### 2. Copy the MCP Endpoint URL

1. Sign in to the dbt platform.
2. Open **Account settings** and stay on the **Account** page.
3. Scroll to the **Access URLs** group. It lists the Semantic Layer GraphQL API URL, the Discovery API URL, and the **MCP Endpoint URL**.
4. Click **Copy** next to **MCP Endpoint URL**.

![dbt platform Account settings page listing the Semantic Layer GraphQL API URL, the Discovery API URL, and the MCP Endpoint URL, each with a Copy button](/img/dbt-mcp-endpoint-url.png)

*Example only - the account prefix (`bk068`) and region (`us1`) shown here are specific to one account. Yours will differ.*

The URL follows the pattern `https://<account-prefix>.<region>.dbt.com/api/ai/v1/mcp/`, for example `https://abc123.us1.dbt.com/api/ai/v1/mcp/`. Single-tenant and legacy accounts may instead show `https://cloud.getdbt.com/api/ai/v1/mcp/`.

:::note
Copy the value from **Access URLs** rather than hand-constructing it. The account prefix and region are both account-specific, and a wrong region is the most common cause of a failed connection. See dbt's [Access, Regions, & IP addresses](https://docs.getdbt.com/docs/platform/about-platform/access-regions-ip-addresses) for the region hosts.
:::

:::tip Trailing slash
dbt's documentation specifies the endpoint with a trailing slash (`/api/ai/v1/mcp/`), while the value shown in the settings UI may omit it. If the connection fails to initialize, add the trailing slash and retry.
:::

### 3. Add dbt MCP to QuilrAI

1. In QuilrAI, go to **MCP Gateway** and click **Add MCP**.
2. Paste the MCP Endpoint URL you copied above.
3. Leave auth mode on auto-detect. dbt's remote server advertises OAuth, so QuilrAI does not need a Client ID or Client Secret.
4. Authorize when prompted. The dbt sign-in page opens in the browser.
5. Sign in as the dbt user whose permissions the tools should run with, complete MFA, and approve the requested scopes.
6. After authorization, QuilrAI connects and fetches the available tools.

The session persists after the first authorization, so later connections do not re-prompt until the session expires or is revoked.

### 4. Expect An MFA Prompt

dbt enforces multi-factor authentication on the account, so the browser sign-in can divert to a **Keep Your Account Safe** screen asking you to add another authentication method before it returns to QuilrAI. dbt offers three options:

| Method | Notes |
|--------|-------|
| Google Authenticator or similar | TOTP authenticator app. The most portable option. |
| SMS | **US phone numbers only.** Not usable for most non-US teams. |
| Security key | Hardware key or platform passkey. |

Enroll the factor, finish the sign-in, and the flow returns to QuilrAI and completes. The authorization does not fail here, it just pauses until enrollment is done.

:::tip
Enroll MFA on the authorizing dbt user **before** starting **Add MCP**. Hitting enrollment mid-flow is the most common reason this setup looks stuck.
:::

## Token-Based Alternative

If OAuth is unavailable for your account - no static subdomain, or a plan without the beta - dbt also accepts a token in request headers. This path needs a long-lived credential, so prefer OAuth when you can use it.

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | Yes | `Token <your-dbt-token>` or `Bearer <your-dbt-token>` |
| `x-dbt-prod-environment-id` | Yes | Numeric production environment ID |
| `x-dbt-dev-environment-id` | For `execute_sql` and Fusion tools | Numeric development environment ID |
| `x-dbt-user-id` | For `execute_sql` and Fusion tools | Numeric dbt user ID |

Two token types work, with different limits:

| Token type | Permissions needed | Limitation |
|------------|--------------------|------------|
| Personal access token (PAT) | Semantic Layer and Developer | Tied to one user. **Required** for `execute_sql` under token auth. |
| Service token | At minimum Semantic Layer Only, Metadata Only, and Developer | Better for shared or CI use, but **cannot** run `execute_sql`. |

:::warning
These headers take **numeric IDs only**, not URLs. Pasting a full environment URL such as `https://abc123.us1.dbt.com/deploy/12345/projects/67890/environments/54321` instead of `54321` is a frequent misconfiguration. Copy just the trailing number.
:::

## Restrict The Tool Surface

dbt accepts two optional headers that trim what the server exposes, which is worth using to reduce context usage and limit blast radius:

| Header | Example | Effect |
|--------|---------|--------|
| `x-dbt-disable-toolsets` | `semantic_layer,sql,discovery` | Remove entire toolsets |
| `x-dbt-disable-tools` | `get_all_models,text_to_sql,list_entities` | Remove individual tools |

Disabling the `sql` toolset is the simplest way to prevent agents from executing arbitrary SQL against your warehouse while keeping metadata and Semantic Layer tools available.

## Available Tools

The remote server exposes these toolsets:

| Toolset | Tools | Access |
|---------|-------|--------|
| Semantic Layer | `list_metrics`, `get_dimensions`, `get_dimension_values`, `get_entities`, `get_metrics_compiled_sql`, `list_saved_queries`, `query_metrics` | Read only |
| Discovery | `get_all_models`, `get_all_sources`, `get_all_macros`, `get_node_details`, `get_lineage`, `get_related_models`, `get_model_health`, `get_model_performance`, `get_exposures`, `search` | Read only |
| SQL | `execute_sql`, `text_to_sql` | Executes SQL against your warehouse |
| Administrative API | `list_projects`, `list_jobs`, `list_jobs_runs`, `get_job_details`, `get_job_run_details`, `get_job_run_error`, `list_job_run_artifacts`, `trigger_job_run`, `retry_job_run`, `cancel_job_run` | Read **and write** |
| Fusion | `fusion.compile_sql`, `fusion.get_column_lineage` | Read only |
| Product Docs | `search_product_docs`, `get_product_doc_pages` | Read only |

:::warning
The Administrative API toolset is not read-only. `trigger_job_run`, `retry_job_run`, and `cancel_job_run` change orchestration state in your dbt account. Scope the authorizing identity's dbt permissions accordingly, or disable the toolset.
:::

The dbt CLI and Codegen toolsets (`run`, `build`, `test`, `compile`, `generate_model_yaml`, and similar) are **not** available on the remote server. They require the self-hosted dbt MCP server, which is outside the scope of this guide.

:::note
Only `text_to_sql` consumes your dbt Copilot action allotment. The other tools do not. The remote server is rate limited to 5,000 requests per minute per IP, the same limit as dbt's other APIs.
:::

## Verify The Connection

Start with a read-only metadata request:

```text
Using dbt, list the models in my dbt project and return just the names and descriptions.
```

Then check the Semantic Layer:

```text
Using dbt, list the metrics defined in my Semantic Layer, then show the dimensions
available for one of them. Do not run any queries against the warehouse.
```

If the responses reflect your actual dbt project rather than generic answers, the connection is working. Leave warehouse-executing requests (`execute_sql`, `query_metrics`) until after the read-only checks pass.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| Browser sign-in stops on **Keep Your Account Safe** | The dbt user has no MFA factor enrolled | Enroll an authenticator app or security key, then complete the sign-in. The flow resumes on its own. |
| Authorization fails even with valid credentials | AI features are not enabled on the dbt account | Ask an account admin to enable AI features, then retry. |
| OAuth is not offered, only token fields | The account has no static subdomain, or the plan is outside the OAuth beta | Use the [token-based alternative](#token-based-alternative). |
| Connection fails to initialize | URL missing the trailing slash, or wrong region host | Re-copy the URL from **Access URLs** and confirm it ends in `/api/ai/v1/mcp/`. |
| `401 Unauthorized` | Invalid, revoked, or malformed token | Confirm the header value is `Token <token>` or `Bearer <token>`, then reissue the token if needed. |
| `403 Forbidden` | Token lacks the required permission sets | Grant Semantic Layer and Developer permissions and retry. |
| `execute_sql` fails while other tools work | A service token was used | Switch to a personal access token, or use OAuth. |
| Headers rejected or ignored | A full URL was pasted into an ID header | Use the numeric ID only. |
| Expected tools are missing | A toolset is disabled, or the tool is self-hosted only | Check `x-dbt-disable-toolsets` and `x-dbt-disable-tools`, then confirm the tool is remote-supported in [Available Tools](#available-tools). |

## References

- [dbt: About the dbt MCP server](https://docs.getdbt.com/docs/dbt-ai/about-mcp)
- [dbt: Set up remote MCP](https://docs.getdbt.com/docs/dbt-ai/setup-remote-mcp)
- [dbt: Connect to the remote dbt MCP server](https://docs.getdbt.com/docs/dbt-ai/mcp-quickstart-remote)
- [dbt: How to find your dbt MCP IDs](https://docs.getdbt.com/docs/dbt-ai/mcp-find-ids)
- [dbt: Access, Regions, & IP addresses](https://docs.getdbt.com/docs/platform/about-platform/access-regions-ip-addresses)
- [dbt-labs/dbt-mcp on GitHub](https://github.com/dbt-labs/dbt-mcp)
