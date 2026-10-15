---
title: "Administrator setup checklist"
sidebar_label: "Administrator setup checklist"
sidebar_position: 1
sidebar_custom_props:
  icon: ClipboardList
description: "Choose an MCP client, prepare gateway authentication and access, and roll out Quilr connections to users."
---

# Administrator setup checklist

Use this section to connect employee AI applications to Quilr MCP Gateway. Start with the exact product and runtime: GitHub Copilot in VS Code, GitHub's cloud agent, and Microsoft Copilot Studio have different configuration and authentication requirements.

Client documentation was checked on **15 October 2026**. These guides describe vendor-documented setup and the gateway implementation; they are not a claim that every client version has passed a live interoperability test. Complete the pilot below for your deployed gateway and client version.

## Choose a guide

| Client | Administrator guide | Starting authentication path |
| --- | --- | --- |
| GitHub Copilot in VS Code, Copilot CLI | [GitHub Copilot](./github-copilot) | Remote HTTP and browser OAuth |
| GitHub Copilot cloud agent / code review | [GitHub Copilot](./github-copilot) | Direct non-OAuth MCP with API-token headers; remote OAuth is unsupported by GitHub |
| Microsoft Copilot Studio / Microsoft 365 delivery | [Copilot Studio](./copilot-studio) | Streamable HTTP and OAuth dynamic discovery; pilot required |
| Claude web, Desktop, Cowork, Claude Code | [Claude](./claude) | Remote connector or CLI HTTP configuration; user OAuth |
| Cursor | [Cursor](./cursor) | Remote URL in MCP configuration; user OAuth |
| ChatGPT custom MCP / Codex local clients | [ChatGPT and Codex](./openai) | Separate hosted-plugin and local-client setup paths |
| Another MCP client | [Authentication reference](./authentication) | Confirm transport, discovery, public-client auth, and token lifecycle compatibility |

## 1. Record the deployment and endpoint

Quilr gateways are deployed at **`https://mcpgateway.quilr.ai`** or an assigned hostname under **`quilrai.com`**. Copy the complete URL from the gateway user dashboard or the server's **Quilr gateway** field. An environment-specific hostname is not interchangeable with another deployment.

`*.quilrai.com` describes a family of hostnames. It is not a URL to enter in a client. Use the exact assigned hostname, for example `https://mcpgateway.quilrai.com` only when that is your deployment. Keep the same hostname throughout MCP requests, OAuth discovery, and sign-in.

| Endpoint | Purpose | Example on the primary hostname |
| --- | --- | --- |
| Tenantless OneMCP | Resolve the user's organization through sign-in | `https://mcpgateway.quilr.ai/quilrone/mcp` |
| Tenant-scoped OneMCP | Address one Quilr tenant explicitly | `https://mcpgateway.quilr.ai/quilrone/<quilr-tenant-id>/mcp` |
| Direct MCP | Connect to one installed server | `https://mcpgateway.quilr.ai/<backend-id-or-slug>/mcp` |

Use the dashboard-provided endpoint. The **Quilr tenant ID** is not automatically the Microsoft Entra tenant ID. A backend UUID avoids ambiguous slugs. OneMCP excludes OAuth-passthrough servers; use their direct endpoint and discovered upstream authorization details.

## 2. Assign responsibilities

| Owner | Work to complete |
| --- | --- |
| Quilr administrator | Install the MCPs, configure upstream authentication, allow the client, grant the appropriate users/groups access, and choose OneMCP settings |
| AI application administrator | Enable custom MCP integrations, approve/distribute the gateway connection, configure tool permissions and organization policy |
| Identity administrator | Ensure the intended users can complete the configured platform SSO and any upstream consent required by their connectors |
| Network/platform operator | Supply the canonical gateway hostname, valid TLS, reachable discovery/login endpoints, and an ingress that preserves MCP headers and streaming |
| End user | Sign in with their own company account and connect upstream services that require personal authorization |

Approving an integration for an organization does not sign in every user. Access to the AI application does not itself grant access to a Quilr tenant or upstream service.

## 3. Prepare Quilr

1. In **Settings > AI Gateway > MCP Gateway**, install the required MCPs and verify their configuration. See [adding servers](../servers-and-connections/adding-mcp-servers).
2. Configure shared upstream credentials or require personal credentials as appropriate. See [OAuth connections](../servers-and-connections/oauth-connect) and [provider setup](../provider-setup/overview).
3. Permit the intended client in [Allowed Agents](../servers-and-connections/allowed-agents). Verify the actual client identity in gateway logs; a browser product name may differ from its MCP runtime's User-Agent.
4. Set [server access](../protect/server-access), [tool visibility](../protect/tool-visibility), and [group/user rules](../protect/group-and-user-rules), or the published policies used by your tenant.
5. For OneMCP, choose **Dynamic tool calling** and **Memories enabled** according to your rollout requirements. See [OneMCP](../get-started/onemcp).
6. Confirm that the pilot user can sign in to the gateway dashboard and connect the intended upstream service.

## 4. Prepare the client and network

Use Streamable HTTP to the complete `/mcp` URL. Do not replace it with `/sse`, a dashboard page, or a provider's upstream URL.

Local IDE clients need outbound HTTPS from the environment running the client and browser access to sign-in. Hosted clients such as Copilot Studio, Claude remote connectors, and ChatGPT hosted integrations need the gateway reachable from the vendor service, not only from an employee laptop or VPN. Consult that vendor's current network requirements before restricting ingress to IP ranges.

Allow discovery endpoints without an interactive reverse-proxy login. Preserve `WWW-Authenticate`, `Authorization`, `MCP-Protocol-Version`, `Mcp-Session-Id`, and streaming responses. API-token connections additionally need `mcpuser`. Give the client and the gateway access to the identity-provider endpoints used during sign-in.

## 5. Run a pilot before distribution

Record the deployment URL, client version, date, pilot identities, and outcomes:

1. Verify discovery and the unauthenticated challenge using [diagnostics](./troubleshooting).
2. Add the client configuration and complete a fresh sign-in with a normal employee account.
3. List tools. Smart OneMCP exposes discovery tools rather than every upstream tool individually.
4. List available connectors; complete any required personal connection.
5. Run an approved read-only tool and confirm the expected result and user attribution in gateway logs.
6. Check a second user's authorized tool visibility. Confirm a deliberately excluded user or tool remains blocked.
7. Restart the client and verify the saved connection; also test disconnect/reconnect. Record any client-side token expiry behavior.
8. Distribute the non-secret server definition through the client's supported organization mechanism. Each user completes their own authentication.

A successful OAuth browser window is only one step: tool discovery, upstream credentials, policy enforcement, and audit attribution must also work.

## Customer handoff template

```text
AI client and version:
Workspace / organization:
Gateway base URL (exact HTTPS hostname):
MCP server URL (complete path):
Endpoint type: tenantless OneMCP / tenant-scoped OneMCP / direct MCP
Quilr tenant ID (if tenant-scoped):
Authentication: OAuth dynamic registration / approved direct API token
Client administrator contact:
Quilr administrator contact:
Allowed users / groups:
Approved MCPs and tools:
Personal upstream sign-in required:
Network access confirmed from the actual runtime:
Pilot date and validation results:
```

For OAuth, share URLs and sign-in instructions. For direct API tokens, distribute the credential through your approved secret channel and specify the required `mcpuser` identity and any client binding. Do not put live credentials in support tickets or shared configuration examples.
