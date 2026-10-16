---
title: Copilot Studio and Microsoft 365
sidebar_label: Copilot Studio / Microsoft 365
sidebar_position: 4
sidebar_custom_props:
  icon: Workflow
description: "Administer Quilr MCP connections in Copilot Studio and publish them through Microsoft 365 or Teams, including OAuth field mapping and identity validation."
---

# Copilot Studio and Microsoft 365

Replace `<YOUR_MCP_BASE_URL>` in the examples with your deployment's HTTPS base URL, without a trailing slash. This can be `https://mcpgateway.quilr.ai`, `https://mcpgateway.quilrai.com`, or another exact hostname assigned under `quilrai.com`. Copy the base from your Quilr dashboard; the placeholder includes `https://`.

Connect a Copilot Studio agent to Quilr using the MCP onboarding wizard, then publish that agent to the approved Microsoft 365 or Teams channel. Start a pilot with **OAuth 2.0 > Dynamic discovery** for OneMCP. The gateway's discovery and public-client behavior must work with your Microsoft environment before production approval.

**Documentation checked: October 15, 2026.** The configuration below is based on gateway behavior and official Microsoft documentation. It has not been validated through a live customer Copilot Studio connection.

## Choose the Microsoft integration

| Customer request | Configuration surface |
|---|---|
| Build an agent in Copilot Studio | Add an MCP tool to that agent using this guide. |
| Make that agent available in Microsoft 365 Copilot or Teams | Configure the MCP tool first, then publish and enable the channel. |
| Build a Microsoft 365 declarative agent with an MCP plugin manifest | This is a separate developer registration and authentication flow. Do not reuse Studio callback URLs or assume DCR works identically. |
| Configure GitHub Copilot | Use the [GitHub Copilot guide](./github-copilot); the configuration is different. |

For the declarative-plugin route, Microsoft's authentication troubleshooting describes a Teams developer portal authentication configuration, matching runtime `reference_id`, and a matching MCP base URL. Validate that integration separately with Quilr engineering, especially if it expects a confidential client or refresh tokens. [Microsoft 365 plugin authentication](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-troubleshooting).

## Administrator prerequisites

Record the Power Platform environment, agent owner, target audience, intended channel, approved tool list, and gateway administrator. Confirm the maker can create and edit the agent and connections in that environment, and that the users have the required Microsoft product access. Microsoft plans and entitlements can differ; check the tenant's available features rather than assuming every Microsoft 365 subscription includes the same authoring rights.

Prepare the following Quilr settings:

| Item | Required value or decision |
|---|---|
| MCP base URL | `<YOUR_MCP_BASE_URL>` as defined above |
| Server URL | `<YOUR_MCP_BASE_URL>/quilrone/mcp`, after substituting your deployment base URL. |
| Single MCP alternative | `<YOUR_MCP_BASE_URL>/<backend-id>/mcp`; authentication depends on that backend's mode. |
| Transport | Streamable HTTP. Use the `/mcp` endpoint. |
| Gateway access | Allow the pilot users and the observed Copilot Studio client in Quilr access controls. |
| Upstream access | Complete each user's upstream service connection and permissions. Gateway sign-in does not grant access to upstream data by itself. |
| Network | Microsoft-hosted connection traffic must reach the assigned HTTPS host and discovery/token endpoints. Browser access from a laptop is a separate check. |

Use [authentication](./authentication) for exact discovery endpoints and deployment checks. Keep the same assigned hostname throughout MCP discovery, authorization, registration, and token exchange unless the gateway's metadata intentionally specifies another host.

## Power Platform policy and user identity

Before adding the tool, have the Power Platform administrator review the environment's data policies. A connector may be blocked or placed in a data group incompatible with other connectors. Policy violations can disable features and prevent publishing. Resolve the specific policy finding through your organization's change process. [Microsoft data policies](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention).

For user-specific business data, choose **User authentication** or the equivalent end-user credential setting in your version of the tool editor. Microsoft distinguishes user credentials from agent-author credentials, and may prompt a user to create a connection during a conversation. Check that the intended channel supports the required user authentication. [Tool authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-enduser-authentication).

An administrator can restrict maker-provided credentials under **Power Platform admin center > Manage > Environments (or Environment groups) > Settings > Product > Features > Copilot Studio agents > Control maker credential options**. This affects existing agents in the selected scope. End-user-only enforcement can prevent background/autonomous runs that need a live user sign-in. Plan such a policy change separately from the connector pilot. [Credential controls](https://learn.microsoft.com/microsoft-copilot-studio/configure-no-maker-authentication).

For Quilr, confirm the final runtime identity in gateway audit records. An agent that works for its author may still use the author's connection when shared. Test with a second ordinary user before granting broader access.

## Add the OneMCP tool

1. Open the intended agent and its **Tools** page.
2. Choose **Add a tool > New tool > Model Context Protocol**.
3. Enter a recognizable server name, a task-specific description, and the assigned MCP URL.
4. Select **OAuth 2.0**, then **Dynamic discovery**.
5. Create the server, continue, and create a new connection.
6. Complete the company sign-in and add the connected server to the agent.

Copilot Studio supports Streamable HTTP; legacy SSE is unsupported. The wizard discovers registration and OAuth endpoints when Dynamic discovery succeeds. [Microsoft MCP onboarding](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent).

Example administrator-provided values:

```text
Server name: Quilr OneMCP
Description: Read approved business information through Quilr-managed MCP tools.
Server URL: <YOUR_MCP_BASE_URL>/quilrone/mcp
Authentication: OAuth 2.0
OAuth type: Dynamic discovery
```

Adapt the description to the actual approved tools. A read-only description is not an authorization rule; enforce tool permissions in Quilr and upstream services.

## If Microsoft asks for individual OAuth fields

Use `<YOUR_MCP_BASE_URL>` as defined above for these **OneMCP** values. Direct backends may advertise different authentication details:

| Field | OneMCP value | Admin guidance |
|---|---|---|
| MCP URL | `<YOUR_MCP_BASE_URL>/quilrone/mcp` | The tool endpoint, not the authorization URL. |
| Issuer | `<YOUR_MCP_BASE_URL>/quilrone` | Confirm against live metadata. |
| Discovery document | `<YOUR_MCP_BASE_URL>/.well-known/oauth-authorization-server/quilrone` | Use the metadata advertised for your endpoint. |
| Authorization endpoint | `<YOUR_MCP_BASE_URL>/quilrone/oauth/authorize` | Starts user sign-in. |
| Token endpoint | `<YOUR_MCP_BASE_URL>/quilrone/oauth/token` | Supports authorization-code exchange. |
| Registration endpoint | `<YOUR_MCP_BASE_URL>/quilrone/oauth/register` | Used by dynamic client registration. |
| Client ID | Returned by registration | Use the response, not an upstream provider's app ID. |
| Client secret | None issued by OneMCP registration | Public client; token endpoint auth method `none`. |
| Refresh URL / refresh token | Not provided by the current OneMCP client-facing flow | Do not claim refresh-token grant support. |
| Scopes | Use advertised metadata and deployment requirements | Do not copy Microsoft Graph scopes into Quilr's OAuth form. |
| Callback URL | The exact callback generated/used by Microsoft's connector flow | Do not substitute the upstream service callback or a generic Teams URL. |

Microsoft also offers **Dynamic** and **Manual** modes. Manual configuration includes a client secret and refresh URL; the present OneMCP public-client, code-only flow does not supply these. Do not invent values or reuse upstream credentials to satisfy required fields. Treat a client that requires them as a compatibility issue requiring engineering review. [Microsoft authentication modes](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent#configure-oauth-20-authentication).

The gateway advertises PKCE metadata, but this alone is not evidence of full OAuth 2.1 enforcement or certification. See the implementation caveats in [authentication](./authentication) when your security review requires those guarantees.

### API-key alternative for one backend

A Quilr API token can be used only on an eligible direct backend, with **both** `Authorization: Bearer <token>` and `mcpuser: <allowed-user-email>`. It is not a OneMCP credential. New tokens are bound to a selected agent; the actual Microsoft runtime User-Agent must match that binding. The simple Studio API-key field may not express the additional identity header your backend requires; if necessary, an administrator must design and validate a custom connector that sends both headers. Do not document a successful configuration until request logs confirm the complete headers and intended identity. Shared automation credentials need an explicit owner and access scope.

## Publish to Microsoft 365 or Teams

After the pilot succeeds, publish the agent. Open **Channels > Teams and Microsoft Copilot**, enable **Make agent available in Microsoft Copilot** when needed, and add the channel. Share with a small pilot audience or submit for organization approval through the channel's availability options. Organization-wide distribution can require Teams/Microsoft 365 admin approval. [Microsoft channel setup](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams).

Re-test the **published channel**, not only Studio's test pane. Use a fresh conversation and a non-maker account. Channel sign-in and the MCP tool's Quilr connection are separate: a user being signed into Teams does not demonstrate the correct Quilr connection is in use. Confirm gateway audit identity and upstream access for that user.

## Acceptance checklist

| Test | Pass condition |
|---|---|
| Discovery and registration | The client reaches the correct assigned host, follows metadata, and creates a connection without fabricated secrets. |
| Company sign-in | The pilot user signs in through the expected organization identity flow. |
| Tool discovery | Only intended tools are visible. OneMCP dynamic mode can expose routing tools rather than every backend tool individually. |
| Read-only tool call | A known test record returns the expected result under the pilot user's identity. |
| Upstream connection missing | The user is prompted to connect or gets an actionable connection error, without using another user's account. |
| Second user | Gateway logs and upstream access reflect that user, not the maker. |
| Denied user or tool | Access is denied according to Quilr and upstream policy. |
| Published channel | The same checks pass in the intended Teams or Microsoft 365 runtime. |
| Credential recovery | Disconnect/reconnect and revocation behavior have been exercised in the pilot. |

Record deployment host, Quilr tenant, Microsoft environment/agent/channel, credential mode, pilot users, test time, tool names, and evidence. Do not capture access tokens or authorization codes in a support document.

## Troubleshooting

| Symptom | What to investigate |
|---|---|
| Required client secret or refresh URL | You may be in Manual OAuth mode. OneMCP does not issue these values; return to Dynamic discovery or escalate the compatibility requirement. |
| OAuth discovery fails | Check the exact host, `/quilrone/mcp` route, `401` challenge, metadata URLs, and HTTPS reachability from Microsoft's runtime. |
| Works in a browser, fails in Studio | Browser sign-in tests only one part of the connection; verify the hosted connector can fetch metadata and exchange tokens. |
| Connector/tool disabled or publish blocked | Review Power Platform data-policy details and the connector's data group. |
| Signed in but no usable backend | Check Quilr Allowed Agents, user/group permissions, tool visibility, and the user's upstream connections. |
| Author succeeds, end users fail | Review credential mode, channel support, shared access, and each user's connection. Compare audit identity. |
| New deployment still behaves like old configuration | Start a fresh published-channel conversation and verify the agent's latest version and channel configuration. |
| API-token path returns `401` or `403` | Confirm direct backend eligibility, token scope, `Authorization` format, allowed `mcpuser` domain, and the actual runtime User-Agent matching the token's agent binding. |

For a Microsoft 365 **declarative-plugin** integration, separately inspect authentication configuration IDs, matching base URLs, and the callback prescribed for that route. Those values should not be copied into Studio blindly. [Plugin authentication diagnostics](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-troubleshooting).

When retiring the integration, remove or disable the agent tool, review published-channel access, and revoke the associated gateway credentials or connections as appropriate. Removing an agent from a store does not by itself prove gateway access has been revoked. See [shared troubleshooting](./troubleshooting) and [client overview](./overview).
