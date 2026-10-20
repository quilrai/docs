---
title: "Gemini Enterprise and Gemini CLI"
sidebar_label: "Gemini"
sidebar_position: 7.5
sidebar_custom_props:
  icon: Sparkles
description: "Configure Gemini Enterprise to use Quilr MCP Gateway, including manual OAuth fields, PKCE, Google ADK agent access, organization controls, and a separate Gemini CLI setup."
aliases: [Gemini Enterprise, Gemini CLI, Google ADK, google-adk, Lucidchart, PKCE]
---

# Gemini Enterprise and Gemini CLI

Connect Gemini to the **Quilr gateway URL** shown on the MCP server card. For enterprise rollout, configure the gateway's user and tool permissions, add the connection in the correct Google administration surface, and test with an employee account before enabling it for the wider team.

**Documentation checked: 20 October 2026.** The Lucidchart OAuth URLs and public client ID below were checked against the deployed gateway. The `google-adk` requirement was observed in that Gemini deployment. Other steps describe Google's current documentation, not a claim that every edition has passed a live interoperability test.

## Choose the Google product

| Product | Setup location | Authentication approach |
| --- | --- | --- |
| Gemini Enterprise in Google Cloud | Gemini Enterprise > Data stores | Custom MCP Server with explicit OAuth fields |
| Gemini Enterprise - Business edition | Settings & help > team > Manage team > Connected apps | Add MCP Server; availability is subject to Google's current rollout |
| Gemini CLI | User or project MCP configuration | Streamable HTTP with discovery and browser OAuth |

The Gemini app at `gemini.google.com` has a separate custom-app feature. Google's current eligibility excludes work/school accounts, so do not use its personal-account instructions as an enterprise deployment procedure. See [Gemini Apps eligibility](https://support.google.com/gemini/answer/17209137?hl=en) and [Business-edition availability](https://support.google.com/g/answer/17106276?hl=en).

## Prepare the gateway

1. Install the MCP and configure its upstream authentication in Quilr. Grant the intended users/groups access to the server and approved tools.
2. Copy its full **Quilr gateway** URL, including `/mcp`. Use the gateway URL throughout this setup.
3. Confirm that Google's hosted runtime can reach the endpoint over HTTPS with a publicly trusted certificate and Streamable HTTP. A URL reachable only through an employee's VPN is insufficient for this setup.
4. Allow the actual runtime in Quilr as described below.

For several connectors through one URL, use [OneMCP](../get-started/onemcp) and its matching [OAuth values](./authentication#url-reference). Do not mix a direct MCP URL with OneMCP's authorization/token endpoints or client ID. OAuth-passthrough servers require their discovered provider-specific registration instead of the public-client example below.

### Allow the Gemini runtime in Quilr

The Gemini connection in this deployment needed **`google-adk`** allowed. Turning on the built-in **Gemini** agent alone was insufficient because its keyword is `gemini`.

1. Open **Settings > AI Gateway > MCP Gateway > Allowed Agents**.
2. Choose **Add agent**.
3. Enter **Gemini Enterprise / Google ADK** as the name and **`google-adk`** as the User-Agent keyword, then choose **Allow agent**.
4. Expand the custom agent and enable the intended MCP, such as Lucidchart.
5. Reconnect Gemini or start a new session, then retry discovery and a tool call.

If the MCP Gateway Policy Engine is enabled, configure and publish the corresponding agent rule there. Confirm the observed client identity in gateway logs; the Google ADK framework, Gemini CLI, and other Google surfaces need not all send the same header. See [Allowed Agents](../servers-and-connections/allowed-agents#gemini-enterprise-and-google-adk).

## OAuth values for the Lucidchart example

Use these values only for the `lucidchart` endpoint on this deployment. For another MCP, copy its actual path and confirm its discovery and registration responses; a display name is not necessarily its URL slug.

| Google field | Value |
| --- | --- |
| Connection / server name | `Quilr Lucidchart` |
| MCP server URL | `https://mcpgateway.quilrai.com/lucidchart/mcp` |
| Authentication | OAuth 2.0 |
| Authorization URL | `https://mcpgateway.quilrai.com/lucidchart/oauth/authorize` |
| Token URL | `https://mcpgateway.quilrai.com/lucidchart/oauth/token` |
| Client ID | `gateway-lucidchart` |
| Client secret | None issued; leave blank where supported |
| PKCE support | Enabled, using S256 |
| Use HTTP Basic Auth | Unchecked; client authentication is `none` |

The [live discovery document](https://mcpgateway.quilrai.com/lucidchart/.well-known/oauth-authorization-server) advertises S256. Registration at `/lucidchart/oauth/register` returned `gateway-lucidchart` with `token_endpoint_auth_method: none`. Its client ID is public configuration, not a password.

**PKCE and Basic Auth are separate settings.** Enable PKCE; do not enable Basic Auth for this public client. The client sends its public `client_id` and PKCE `code_verifier` in the token request body. The [authentication reference](./authentication#manual-fields-for-a-direct-mcp) covers other paths and the current gateway enforcement limitations.

:::note If Google requires a client secret
Google's setup documentation lists a client-secret field, and some Gemini Enterprise flows require a value. This Quilr registration does not issue one. Leave it empty where supported; if the form refuses that, confirm compatibility for the specific edition and deployment before continuing. Do not paste an upstream Lucidchart secret, invent a placeholder, or enable Basic Auth to satisfy the field. Google's documented placeholder for [Looker](https://docs.cloud.google.com/looker/docs/mcp#gemini-enterprise) is provider-specific.
:::

Do not request extra scopes or a refresh grant just to satisfy a form. Follow the endpoint's discovery and the [gateway token-lifecycle limitations](./authentication#scopes-refresh-and-token-format); upstream refresh support does not imply that the MCP client receives a refresh token.

## Configure Gemini Enterprise in Google Cloud

### Administrator prerequisites

The configuring administrator needs **Discovery Engine Editor** (`roles/discoveryengine.editor`) on the target project. A policy administrator must also allow custom MCP data-store creation. Where the project's VPC Service Controls or organization-policy enforcement requires egress/data-source restrictions, allow `custom_mcp` and the exact MCP, authorization, and token hostnames. All three are `mcpgateway.quilrai.com` in the example. Follow [Google's organization-policy prerequisites](https://docs.cloud.google.com/gemini/enterprise/docs/connectors/custom-mcp-server/override-constraint-for-custom-mcp-data-stores) for the project's enforcement conditions.

### Add and enable the connection

1. In Google Cloud, open **Gemini Enterprise > Data stores > Create data store**.
2. Select **Custom MCP Server**, then **Add MCP server**.
3. Select **OAuth 2.0**, enter the full MCP URL, authorization URL, token URL, and client ID above, and handle the secret field as described above.
4. Enable PKCE and leave **Use HTTP Basic Auth** unchecked for this public-client registration.
5. Use Google's exact OAuth redirect URI, `https://vertexaisearch.cloud.google.com/oauth-redirect`, wherever client registration or redirect validation requires it. This is the client's redirect, not Quilr's upstream `/oauth/callback`.
6. Choose **Verify Auth**, complete company sign-in, then **Continue**. In **Configure your data connector**, select the region, enter the data-store name, and choose **Create**. Wait for its status to become **Active**.
7. Open the data store's **Actions**, reload the available tools, and enable only the approved actions. Actions start disabled.
8. Open **Apps > your app > Connected data stores > Add existing data stores** and attach the new data store.

These steps follow [Google's Custom MCP Server setup](https://docs.cloud.google.com/gemini/enterprise/docs/connectors/custom-mcp-server/set-up-custom-mcp-server) and [app-connection walkthrough](https://cloud.google.com/blog/topics/developers-practitioners/devs-guide-to-mcp-apps-in-gemini). Creating or attaching the data store does not authenticate every employee; test each user's sign-in and upstream connection requirements.

## Configure Gemini Enterprise - Business edition

Business edition requires a **team administrator**. It uses a different administration surface and is currently documented as a pre-GA feature:

1. Open **Settings & help > your team > Manage team > Connected apps**.
2. Select **Add MCP Server**, enter the server name and gateway URL, and choose OAuth.
3. Supply the applicable authentication settings, verify the connection, and add it.
4. Enable the connection; newly added connections start disabled.
5. Have a pilot employee connect and run an approved read-only operation.

Use the fields exposed by that edition. Google's documented redirect URI is also `https://vertexaisearch.cloud.google.com/oauth-redirect`; supply it wherever client registration or redirect validation requires it. See [Google's Business-edition instructions](https://support.google.com/g/answer/17106276?hl=en).

## Gemini CLI

Gemini CLI has its own local MCP configuration. It does not inherit a Google Cloud data store or Business-edition connection.

For the example direct endpoint:

```bash
gemini mcp add --scope user --transport http lucidchart   https://mcpgateway.quilrai.com/lucidchart/mcp
gemini
```

Inside Gemini CLI, run:

```text
/mcp auth lucidchart
/mcp
```

Complete browser OAuth and inspect server status and tools. The CLI supports discovery and dynamic registration; let the gateway register its public client. Distribute the endpoint definition, not an administrator's tokens. Verify the CLI's actual User-Agent separately from the hosted Enterprise runtime. See [Gemini CLI MCP configuration](https://geminicli.com/docs/tools/mcp-server/).

## Validate before rollout

1. Use a normal employee account to complete fresh authentication and confirm initialization and tool discovery.
2. For a direct MCP, inspect that server's tools and run one approved read-only operation. For OneMCP, list available connections, discover the intended tool, then call it.
3. If Quilr requests upstream sign-in, complete it as the same employee and retry.
4. Confirm gateway logs show the expected user, backend, client identity, and allowed result.
5. Test a second employee with different permissions and verify that excluded tools/users stay blocked.
6. Restart or reconnect the client and repeat the read. In Gemini Enterprise, confirm the tool is enabled in **Actions** and the data store is attached to the intended app.

| Symptom | Check |
| --- | --- |
| OAuth succeeds, discovery or tool access is denied | Actual User-Agent, custom `google-adk` agent where applicable, and the effective Quilr policy |
| Client secret is required | Edition-specific public-client compatibility; no secret was issued for this registration |
| Verify Auth fails | Exact endpoint family, PKCE, Basic Auth off, callback, and public reachability |
| Connection is Active but no tools are usable | Reload and enable Actions; confirm app attachment and Quilr tool/user permissions |
| Server cannot be created or contacted | Discovery Engine role, custom MCP organization policy, and applicable egress restrictions |

Use the shared [validation and troubleshooting guide](./troubleshooting) to record the client version, timestamps, discovery metadata, and redacted errors. An Active data store or successful sign-in alone does not prove a tool can run.
