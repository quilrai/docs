---
sidebar_position: 22
sidebar_custom_props:
  icon: Database
description: "Connect a Snowflake-managed MCP server - create the MCP server object in Snowflake with CREATE MCP SERVER (Cortex Agent, Cortex Analyst, Cortex Search, SQL execution and custom UDF/procedure tools), grant a least-privileged MCP access role, then either create a Snowflake OAuth security integration (OAUTH_CLIENT = CUSTOM, confidential client, QuilrAI callback URL) and paste its client ID and secret into QuilrAI, or use a role-restricted programmatic access token as an upstream API key. Covers the account URL format, hyphenated hostnames, network policies, the 50-tool limit and troubleshooting."
---

# Snowflake

Snowflake runs MCP servers inside your own Snowflake account. You define each one as a schema-level **MCP server** object, choose which tools it exposes, and connect it to QuilrAI like any other remote MCP server. Requests run in Snowflake under the connecting user's role, so Snowflake's own grants and governance apply to every tool call.

See [Overview](./overview) for shared prerequisites and secret-handling guidance.

<StepFlow steps={[
  { label: "MCP client", items: ["Agent or IDE"] },
  { label: "QuilrAI MCP Gateway", items: ["Snowflake OAuth or PAT", "Guardrails, access control"] },
  { label: "Snowflake-managed MCP server", items: ["Your Snowflake account"] },
  { label: "Snowflake objects", items: ["Agents, semantic views, search, SQL"] },
]} />

## How Snowflake Differs

- **You build the server first.** There is no ready-made Snowflake MCP to install. An admin creates an MCP server object with `CREATE MCP SERVER` and lists the tools it exposes. Until then there is no URL to connect.
- **You create an OAuth app, as a security integration.** Snowflake does not support Dynamic Client Registration. You create a Snowflake OAuth **security integration** and give QuilrAI its client ID and client secret. A programmatic access token (PAT) is the non-OAuth alternative.
- **Access follows the role.** Tools run with the connecting user's default role, or the PAT's restricted role. That role needs `USAGE` on the MCP server and on every object its tools use.
- **Tools only.** Snowflake implements MCP tools (protocol revision `2025-11-25`). It does not offer MCP resources, prompts or sampling. One server can expose up to 50 tools.

## Before You Start

| Value | Where to get it |
|-------|-----------------|
| Snowflake account URL | Your account identifier in hostname form, for example `myorg-myaccount.snowflakecomputing.com`. See [Account identifiers](https://docs.snowflake.com/en/user-guide/admin-account-identifier). |
| A role that can create the MCP server | `CREATE MCP SERVER` on the target schema. |
| A role that can create a security integration | `ACCOUNTADMIN`, or a role with `CREATE INTEGRATION`. OAuth only. |
| The objects the tools use | A Cortex Agent, a semantic view, a Cortex Search service, a warehouse for SQL, or a UDF or stored procedure. |
| QuilrAI callback URL | Shown on the **Connect with OAuth** step in QuilrAI. Production is `https://mcpgateway.quilrai.com/oauth/callback`. |

:::warning Use hyphens in the hostname
Snowflake account URLs can contain underscores, for example `myorg-my_account.snowflakecomputing.com`. MCP connections fail with underscores in the hostname. Replace them with hyphens: `myorg-my-account.snowflakecomputing.com`.
:::

## Connect Snowflake

### 1. Create The MCP Server

Run this in a Snowflake worksheet as a role that can create objects in the target schema. Keep only the tools you need:

```sql
CREATE OR REPLACE MCP SERVER analytics_db.mcp.quilr_mcp
  FROM SPECIFICATION $$
    tools:
      - name: "sql_exec_tool"
        title: "SQL Execution Tool"
        type: "SYSTEM_EXECUTE_SQL"
        description: "Run read-only SQL against Snowflake."
        config:
          read_only: true
          query_timeout: 600
          warehouse: "ANALYTICS_WH"

      - name: "revenue-semantic-view"
        title: "Revenue semantic view"
        type: "CORTEX_ANALYST_MESSAGE"
        identifier: "analytics_db.sales.revenue_semantic_view"
        description: "Answer revenue questions from the revenue semantic view."

      - name: "product-search"
        title: "Product search"
        type: "CORTEX_SEARCH_SERVICE_QUERY"
        identifier: "analytics_db.sales.product_search_service"
        description: "Search the product catalog."
  $$;
```

| Tool type | What it calls | Needs |
|-----------|---------------|-------|
| `CORTEX_AGENT_RUN` | A Cortex Agent | `USAGE` on the agent |
| `CORTEX_ANALYST_MESSAGE` | Cortex Analyst over a semantic view | `SELECT` on the semantic view |
| `CORTEX_SEARCH_SERVICE_QUERY` | A Cortex Search service | `USAGE` on the search service |
| `SYSTEM_EXECUTE_SQL` | SQL in a warehouse | `USAGE` on the warehouse, plus privileges on the data queried |
| `GENERIC` | A UDF or stored procedure | `USAGE` on the function or procedure |

Write each `description` for the model: it is how an agent decides which tool to call.

:::tip Start read-only
Set `read_only: true` on `SYSTEM_EXECUTE_SQL`. Without it, agents can run any SQL the role is allowed to run, including DML and DDL. Snowflake truncates SQL and `GENERIC` tool results at 250 KB.
:::

The server's URL is:

```text
https://<account-url>/api/v2/databases/<database>/schemas/<schema>/mcp-servers/<server-name>
```

For the example above: `https://myorg-myaccount.snowflakecomputing.com/api/v2/databases/analytics_db/schemas/mcp/mcp-servers/quilr_mcp`.

### 2. Grant An MCP Access Role

Create one role for MCP access, grant it only what the tools need, and make it the default role for the users who will connect:

```sql
CREATE ROLE IF NOT EXISTS mcp_access_role;

GRANT USAGE ON DATABASE analytics_db TO ROLE mcp_access_role;
GRANT USAGE ON SCHEMA analytics_db.mcp TO ROLE mcp_access_role;
GRANT USAGE ON MCP SERVER analytics_db.mcp.quilr_mcp TO ROLE mcp_access_role;

-- One grant per tool, matching the server specification
GRANT USAGE ON WAREHOUSE analytics_wh TO ROLE mcp_access_role;
GRANT SELECT ON SEMANTIC VIEW analytics_db.sales.revenue_semantic_view TO ROLE mcp_access_role;
GRANT USAGE ON CORTEX SEARCH SERVICE analytics_db.sales.product_search_service TO ROLE mcp_access_role;

GRANT ROLE mcp_access_role TO USER jane_doe;
ALTER USER jane_doe SET DEFAULT_ROLE = 'MCP_ACCESS_ROLE' DEFAULT_WAREHOUSE = 'ANALYTICS_WH';
```

For a `CORTEX_AGENT_RUN` tool, also grant `USAGE ON AGENT <db>.<schema>.<agent>` and the `SNOWFLAKE.CORTEX_AGENT_USER` database role. Tools also need privileges on the data underneath, such as `SELECT` on the tables a semantic view reads.

:::note Default role
An OAuth session uses the user's `DEFAULT_ROLE` as its primary role. If a user's default role cannot use the MCP server, connecting succeeds but tool discovery or calls fail. Setting `DEFAULT_ROLE` as above avoids that.
:::

### 3. Choose How QuilrAI Signs In

| Option | Who the calls run as | Use when |
|--------|----------------------|----------|
| [Snowflake OAuth](#3a-snowflake-oauth) (recommended) | Each user, through their own default role | Calls should follow each person's Snowflake access, with short-lived tokens |
| [Programmatic access token](#3b-programmatic-access-token) | A dedicated user, restricted to one role | You need a non-interactive service identity |

#### 3a. Snowflake OAuth

Create a confidential OAuth client whose redirect URI is the QuilrAI callback URL:

```sql
CREATE OR REPLACE SECURITY INTEGRATION QUILR_MCP_OAUTH
  TYPE = OAUTH
  OAUTH_CLIENT = CUSTOM
  ENABLED = TRUE
  OAUTH_CLIENT_TYPE = 'CONFIDENTIAL'
  OAUTH_REDIRECT_URI = 'https://mcpgateway.quilrai.com/oauth/callback'
  OAUTH_ISSUE_REFRESH_TOKENS = TRUE
  OAUTH_USE_SECONDARY_ROLES = NONE
  ALLOWED_ROLES_LIST = ('MCP_ACCESS_ROLE');
```

Use the callback URL exactly as QuilrAI shows it on the **Connect with OAuth** step. `ALLOWED_ROLES_LIST` and `OAUTH_USE_SECONDARY_ROLES = NONE` keep MCP sessions on the MCP access role only. Snowflake blocks `ACCOUNTADMIN`, `ORGADMIN` and `SECURITYADMIN` from OAuth sessions by default.

Read the client credentials. The integration name must be in upper case here:

```sql
SELECT SYSTEM$SHOW_OAUTH_CLIENT_SECRETS('QUILR_MCP_OAUTH');
```

The result is JSON. Copy `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET`.

Then add the server in QuilrAI:

1. Go to **MCP Gateway** and click **Add MCP server**.
2. Enter a **Name** and paste the MCP server URL from step 1 as the **Transport URL**.
3. Leave **How the gateway signs in** on **Auto-detect (recommended)** and click **Probe and continue**. Snowflake advertises OAuth, so the **Connect with OAuth** step opens.
4. Paste `OAUTH_CLIENT_ID` as the **OAuth client ID** and `OAUTH_CLIENT_SECRET` as the **OAuth client secret**.
5. Click **Create MCP**, then sign in to Snowflake as a user whose default role is the MCP access role, and approve the consent screen. This administrator sign-in only lets the gateway discover the tools.
6. After authorization, QuilrAI fetches the tools. Enable the ones you want in **Tools**.

Each user then connects their own Snowflake account the first time they use the server, and their calls run with their own default role. See [OAuth Connect](../servers-and-connections/oauth-connect).

Give your MCP clients the QuilrAI gateway URL shown on the MCP card, not the `snowflakecomputing.com` URL, so traffic goes through the gateway's controls.

:::note External OAuth
If your account uses an external identity provider such as Okta or Microsoft Entra ID for Snowflake sign-in, Snowflake can bind an `EXTERNAL_OAUTH` security integration to the MCP server's schema, database or account with `OAUTH_AUTHORIZATION_SERVER`. Register the QuilrAI callback URL in that provider instead, and use that provider's client ID and secret. See Snowflake's [MCP server documentation](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp).
:::

#### 3b. Programmatic Access Token

Create a token that can only use the MCP access role:

```sql
ALTER USER mcp_service_user ADD PROGRAMMATIC ACCESS TOKEN quilr_mcp
  ROLE_RESTRICTION = 'MCP_ACCESS_ROLE';
```

Snowflake shows the token once. Then add the server in QuilrAI:

1. Go to **MCP Gateway** and click **Add MCP server**, and paste the MCP server URL as the **Transport URL**.
2. Under **How the gateway signs in**, choose **Upstream API key**.
3. Paste the token as the **Upstream API key**. Set **Authentication placement** to **Authorization bearer header** with **Value prefix** `Bearer`.
4. Choose **Shared by the whole tenant** for one service identity, or **Each user brings their own** so each user enters their own token.
5. Click **Create MCP** and enable the tools you want.

:::warning Network policy
By default Snowflake only accepts a PAT from a user who is subject to a network policy. Add the QuilrAI gateway's egress IPs, listed under [MCP Library: Internal MCPs](../servers-and-connections/mcp-library#internal-mcps), to that policy. An account-level network policy applies to OAuth sessions too.
:::

A PAT is a long-lived credential. Never commit it to Git or paste it into tickets or chat. Prefer OAuth when you can.

## Verify The Connection

Start with a read-only request that only uses the SQL tool:

```text
Using Snowflake, run SELECT CURRENT_ROLE(), CURRENT_WAREHOUSE() and show the result.
```

The role should be your MCP access role. Then try a Cortex Analyst or Cortex Search tool if you added one:

```text
Using Snowflake, what was total revenue last quarter? Show the SQL you used.
```

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| Connection fails or times out during probing | Underscore in the account hostname | Replace underscores with hyphens in the URL. |
| `404` on the MCP URL | Wrong database, schema or server name, or the server was not created | Run `SHOW MCP SERVERS IN SCHEMA <db>.<schema>;` and rebuild the URL from it. |
| `invalid_client` or redirect error on sign-in | Client ID or secret mistyped, or the redirect URI does not match | Re-read `SYSTEM$SHOW_OAUTH_CLIENT_SECRETS` and make `OAUTH_REDIRECT_URI` match the QuilrAI callback URL exactly. |
| Sign-in fails with a role error | The user's default role is not in `ALLOWED_ROLES_LIST`, or is a blocked admin role | Set the user's `DEFAULT_ROLE` to the MCP access role. |
| Connected, but no tools or `403` on calls | The role lacks `USAGE` on the MCP server or on a tool's object | Add the grants from [step 2](#2-grant-an-mcp-access-role). |
| SQL tool rejects writes | `read_only: true` on `SYSTEM_EXECUTE_SQL` | Expected. Create a separate server for write access if it is really needed. |
| `401` with a PAT | Token expired or revoked, or the caller is outside the network policy | Issue a new token and allow the gateway egress IPs in the user's network policy. |
| Tools missing after editing the specification | The gateway cached the old tool list | Use **Refresh tools** on the server in QuilrAI. |

:::note Replication
MCP server objects are not replicated in failover groups. After a failover, recreate the MCP server on the secondary account. OAuth security integrations are replicated.
:::

## References

- [Snowflake: Snowflake-managed MCP server](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp)
- [Snowflake: Programmatic access tokens](https://docs.snowflake.com/en/user-guide/programmatic-access-tokens)
- [Snowflake: Account identifiers](https://docs.snowflake.com/en/user-guide/admin-account-identifier)
