---
sidebar_position: 21
sidebar_custom_props:
  icon: Cloud
description: "Connect Salesforce two ways - the Salesforce Hosted MCP servers (activate SObject Reads/Mutations/Deletes/All, create an External Client App with the QuilrAI callback URL, mcp_api and refresh_token scopes, PKCE, refresh token rotation, and JWT-based access tokens, then use the Consumer Key as the Client ID with no secret), or the third-party Cirra (Salesforce MCP) admin server (https://mcp.cirra.ai/mcp) installed from the MCP Library with optional Client ID/Secret left empty, authorized by signing in with a Salesforce account. Covers sandbox URLs and troubleshooting."
---

# Salesforce

You can connect Salesforce to QuilrAI through two different MCP servers. Pick the one that matches what your agents need to do:

| Option | Connection | Best for | What you set up |
|--------|------------|----------|-----------------|
| [Salesforce Hosted MCP](#salesforce-hosted-mcp) | Direct to Salesforce | Reading and writing Salesforce **records** (Accounts, Contacts, Opportunities, custom objects) | An External Client App in your org. Its **Consumer Key** goes into QuilrAI as the Client ID. |
| [Cirra AI](#cirra-ai-salesforce-admin-mcp) | Third party (Cirra AI) | Salesforce **admin** work: objects, fields, permission sets, page layouts, users, flows | Nothing up front. Install **Cirra (Salesforce MCP)** from the MCP Library and sign in with your Salesforce account. |

You can connect both at the same time. They show up as separate MCPs in QuilrAI, each with its own tools and access controls.

See [Overview](./overview) for shared prerequisites and secret-handling guidance.

## Salesforce Hosted MCP

Salesforce runs its own MCP servers at `api.salesforce.com`. Access goes through OAuth 2.0 with PKCE against your org. Salesforce does not support Dynamic Client Registration, so you have to create an **External Client App** in your org. Its Consumer Key is the Client ID you give QuilrAI.

<StepFlow steps={[
  { label: "MCP client", items: ["Agent or IDE"] },
  { label: "QuilrAI MCP Gateway", items: ["OAuth 2.0 + PKCE", "Guardrails, access control"] },
  { label: "Salesforce Hosted MCP", items: ["api.salesforce.com"] },
  { label: "Salesforce org", items: ["User's own permissions"] },
]} />

### How Salesforce Hosted MCP Differs

- **You create an External Client App, but a secret is not required.** PKCE protects the authorization. Turn off the Web Server Flow and Refresh Token Flow secret requirements, and QuilrAI only needs the Consumer Key.
- **JWT-based access tokens are mandatory.** The hosted MCP servers only accept JWT access tokens. This setting is off by default and easy to miss. With it off, authorization appears to work, but every MCP call is rejected. See [Configure Security Settings](#4-configure-security-settings).
- **Each server has to be activated first.** Salesforce ships several standard servers (read-only, create and update, delete, all). None of them respond until an admin activates them in your org.
- **Access follows the authorizing user.** Tools run with the Salesforce user's own profile, permission sets, and sharing rules.

### Connection Details

| Field | Value |
|-------|-------|
| MCP URL | `https://api.salesforce.com/platform/mcp/v1/platform/<server-name>` (see [Standard MCP Servers](#standard-mcp-servers)) |
| Callback URL (production) | `https://mcpgateway.quilrai.com/oauth/callback` |
| OAuth scopes | `mcp_api`, `refresh_token` |
| Auth | OAuth 2.0 + PKCE with the External Client App Consumer Key |

### 1. Activate A Hosted MCP Server

1. In Salesforce, open **Setup**.
2. In **Quick Find**, search for **MCP Servers** and open it.
3. Open the **API Catalog** (the list of Salesforce-provided servers) and click **Activate** for each server you want to use.
4. Open the activated server. On the **Details** tab, copy the **Server URL** under **Authentication Details**.

![Salesforce MCP server details page for the SObject Mutations server showing the Active status, tool count, and Server URL](/img/salesforce-mcp-server-url.png)

For a first test, start with **SObject Reads** (`https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads`). It is read-only.

#### Standard MCP Servers

| Server | What it does | MCP URL |
|--------|--------------|---------|
| SObject Reads | Queries and reads records | `https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads` |
| SObject Mutations | Creates and updates records, no deletions | `https://api.salesforce.com/platform/mcp/v1/platform/sobject-mutations` |
| SObject Deletes | Deletes records | `https://api.salesforce.com/platform/mcp/v1/platform/sobject-deletes` |
| SObject All | Read, create, update, and delete | `https://api.salesforce.com/platform/mcp/v1/platform/sobject-all` |

Always copy the exact URL from the server's **Details** tab rather than typing it by hand. Custom MCP servers you build in your org use `https://api.salesforce.com/platform/mcp/v1/custom/<API_NAME>`.

:::note Sandboxes use a different path
For sandbox and scratch orgs, the path includes `/sandbox/`, for example `https://api.salesforce.com/platform/mcp/v1/sandbox/platform/sobject-reads`. The server **Details** tab in the sandbox shows the correct URL.
:::

:::tip Prefer the narrowest server
Connect **SObject Reads** or **SObject Mutations** rather than **SObject All** unless agents really need to delete records. Picking a smaller server limits what an agent can do before any QuilrAI policy applies.
:::

### 2. Create The External Client App

1. In **Setup**, search for **External Client App Manager** and open it.
2. Click **New External Client App**.
3. Enter the basic information:
   - **External Client App Name**: any name you choose, for example `Quilr Salesforce MCP`
   - **API Name**: fills in automatically
   - **Contact Email**: an admin mailbox for your team
   - **Distribution State**: **Local**
4. Expand **API (Enable OAuth Settings)** and check **Enable OAuth**.

### 3. Configure OAuth Settings

1. Set **Callback URL** to the QuilrAI callback URL exactly as QuilrAI shows it. Production is `https://mcpgateway.quilrai.com/oauth/callback`.
2. Under **OAuth Scopes**, move these two scopes to **Selected OAuth Scopes**:
   - **Perform requests at any time (refresh_token, offline_access)**
   - **Access Salesforce hosted MCP servers (mcp_api)**

![Salesforce External Client App OAuth settings showing the QuilrAI callback URL and the refresh_token and mcp_api scopes selected](/img/salesforce-eca-oauth-scopes.png)

Do not add the general `api` or `full` scopes. The hosted MCP servers only need `mcp_api`.

### 4. Configure Security Settings

In the **Security** section of the same OAuth settings:

| Setting | Value |
|---------|-------|
| Require secret for Web Server Flow | Off |
| Require secret for Refresh Token Flow | Off |
| Require Proof Key for Code Exchange (PKCE) extension for Supported Authorization Flows | **On** |
| Enable Refresh Token Rotation | **On** |
| Issue JSON Web Token (JWT)-based access tokens for named users | **On** |

![Salesforce External Client App Security settings with PKCE, Refresh Token Rotation, and JWT-based access tokens enabled and the secret requirements disabled](/img/salesforce-eca-security-settings.png)

:::warning Do not skip JWT-based access tokens
**Issue JSON Web Token (JWT)-based access tokens for named users** is the setting people miss most often. Without it, Salesforce issues opaque access tokens that the hosted MCP servers reject. The OAuth consent screen still completes, but the connection fails or returns no tools.
:::

In some orgs, Salesforce enforces PKCE, Refresh Token Rotation, and the 30-day idle refresh token limit and shows them as locked ("To change this required setting, contact Support"). Leave them on.

Click **Create**. Salesforce can take a few minutes to roll out a new External Client App, so wait before you authorize.

### 5. Copy The Consumer Key

1. In **External Client App Manager**, open the app you created.
2. Open the **Settings** tab and expand **OAuth Settings**.
3. Click **Consumer Key and Secret**. Salesforce may send a verification code to your email first.
4. Copy the **Consumer Key**. You only need the **Consumer Secret** if you left a secret requirement turned on in step 4.

### 6. Add Salesforce Hosted MCP To QuilrAI

1. In QuilrAI, go to **MCP Gateway** and click **Add MCP server**.
2. Paste the server URL you copied in step 1, for example `https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads`.
3. Set **Auth Mode** to **Auto-detect**.
4. Paste the **Consumer Key** as the **Client ID**. Leave **Client Secret** empty unless you kept a secret requirement on.
5. Click **Create**. The Salesforce login and consent screen opens. Sign in as the user whose permissions the agent should use, then click **Allow**.
6. After authorization, QuilrAI connects and fetches the available tools.

Give your MCP clients the QuilrAI gateway URL shown on the MCP card, not the `api.salesforce.com` URL, so traffic goes through the gateway's controls.

To connect a second Salesforce server, such as SObject Mutations, repeat step 6 with its URL. You can reuse the same External Client App.

## Cirra AI Salesforce Admin MCP

[Cirra AI](https://cirra.ai/) is a third-party MCP server built for Salesforce **administration**. Salesforce Hosted MCP is a direct connection to Salesforce and works on record data. Cirra AI sits between QuilrAI and your org and works on org configuration: custom objects and fields, page layouts and record types, profiles and permission sets, user setup, flows and validation rules, SOQL, and Tooling API operations.

It is available in the QuilrAI **MCP Library** as **Cirra (Salesforce MCP)**.

<StepFlow steps={[
  { label: "MCP client", items: ["Agent or IDE"] },
  { label: "QuilrAI MCP Gateway", items: ["OAuth Connect", "Guardrails, access control"] },
  { label: "Cirra AI", items: ["mcp.cirra.ai", "Third party"] },
  { label: "Salesforce org", items: ["Signed-in user's permissions"] },
]} />

### How Cirra AI Differs

- **No Salesforce setup.** You do not activate MCP servers or create an External Client App. Cirra AI supports Dynamic Client Registration, so QuilrAI registers itself automatically through [OAuth Connect](../servers-and-connections/oauth-connect).
- **Client ID and Client Secret are optional.** The install dialog has these fields, but you can leave them empty. Fill them in only if your organization has its own OAuth client that it wants this install to use.
- **You sign in with your Salesforce account.** During install, the flow redirects to Salesforce. The Salesforce account you sign in with decides which org Cirra AI connects to and which permissions its tools have.
- **Admin-level impact.** Tools can change metadata, permissions, and users in the connected org, so a wrong call affects the whole org, not a single record. Treat this MCP as high risk.
- **Metered usage.** Cirra AI charges tool calls against the credits on your Cirra AI plan.

### Connection Details

| Field | Value |
|-------|-------|
| MCP Library entry | **Cirra (Salesforce MCP)** |
| MCP URL | `https://mcp.cirra.ai/mcp` |
| Callback URL (production) | `https://mcpgateway.quilrai.com/oauth/callback` (only needed for a custom OAuth client) |
| Auth | OAuth 2.0 with Dynamic Client Registration. Client ID and Client Secret are optional. |

### Install Cirra AI From The MCP Library

1. In QuilrAI, go to **MCP Gateway** and open the **MCP Library**.
2. Find **Cirra (Salesforce MCP)** and click **Install**.
3. The **Install OAuth MCP** dialog opens. Leave **Client ID** and **Client Secret** empty to install without custom OAuth client credentials.

   ![QuilrAI Install OAuth MCP dialog for Cirra (Salesforce MCP) showing the callback URL and the optional Client ID and Client Secret fields](/img/cirra-mcp-install-dialog.png)

4. Click **Install**. The flow redirects to Salesforce.
5. Sign in with the Salesforce account whose org and permissions the agent should use (normally a **System Administrator** for admin work), then approve access.
6. After authorization, QuilrAI connects and fetches the available tools.

:::note Using a custom OAuth client
If you do fill in **Client ID** and **Client Secret**, add the **Callback URL** shown in the dialog to that OAuth app as an allowed redirect URL first. Otherwise the redirect fails with `redirect_uri_mismatch`.
:::

:::tip Use a sandbox first
Sign in with a sandbox user for your first install and test agent workflows there before you connect production. Every Cirra AI tool call runs with the permissions of the Salesforce user who signed in.
:::

### Lock Down Admin Tools

Before you roll Cirra AI out to agents, use QuilrAI controls to narrow what it can do:

- [Tool visibility](../protect/tool-visibility) - turn off tools the agents do not need, such as user creation or permission-set assignment.
- [Access Control](../protect/server-access) - limit which users and agents can reach this MCP.
- [Security Guardrails](../protect/security-guardrails) - add checks on write and metadata operations.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch` | The External Client App **Callback URL** does not match the QuilrAI callback URL exactly. | Copy the callback URL from QuilrAI again, update the External Client App, save, wait a few minutes, and retry. |
| Consent completes, then the connection fails or shows `invalid token` | **Issue JSON Web Token (JWT)-based access tokens for named users** is off, or the `mcp_api` scope is missing. | Turn on JWT-based access tokens, confirm `mcp_api` and `refresh_token` are selected, save, and reconnect. |
| `invalid_client` or `invalid_client_id` | Wrong Consumer Key, or the External Client App has not finished rolling out yet. | Copy the Consumer Key again. If the app is new, wait a few minutes and retry. |
| `invalid_client_credentials` or a missing-secret error | A secret requirement is still on in the app's **Security** settings. | Turn off both **Require secret** settings, or paste the Consumer Secret into QuilrAI. |
| `Server definition not found` or a 404 from `api.salesforce.com` | The MCP server is not activated, or the URL is wrong for the org type. | Activate the server under **MCP Servers**, wait a couple of minutes, and copy the exact URL from its **Details** tab. Sandboxes use the `/sandbox/` path. |
| `OAUTH_APP_ACCESS_DENIED` or "user is not admin approved" | The External Client App policies only allow admin-approved users. | In the app's **Policies** tab, set **Permitted Users** to **All users may self-authorize**, or assign the user a permitted profile or permission set. |
| Tools are missing or calls fail on specific objects | The authorizing Salesforce user lacks object or field permissions. | Grant the needed permissions through a permission set, then reconnect. |
| Cirra AI tools return an org or connection error | The Salesforce authorization behind the Cirra AI install expired or was revoked. | Reconnect the Cirra (Salesforce MCP) install in QuilrAI and sign in with your Salesforce account again. |

## References

- [Salesforce: Hosted MCP Servers, Set Up Your Org](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/setup-overview.html)
- [Salesforce: Create an External Client App](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/create-external-client-app.html)
- [Salesforce: Connect MCP Clients](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/client-connection-overview.html)
- [Cirra AI: Salesforce Admin MCP Server](https://cirra.ai/products/salesforce-admin-mcp/)
- [Cirra AI: Salesforce MCP Server Setup Guide](https://cirra.ai/salesforce-mcp-server-setup/)
- [OAuth Connect](../servers-and-connections/oauth-connect)
