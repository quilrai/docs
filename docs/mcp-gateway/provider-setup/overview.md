---
sidebar_position: 1
sidebar_label: "Overview"
sidebar_custom_props:
  icon: KeyRound
---

# MCP provider setup

Set up the provider side of an MCP connection. Most providers need a provider-owned OAuth app with a manual **Client ID** and **Client Secret**; a few only need their MCP server URL added manually.

Looking for a capabilities comparison rather than connection steps? Start with [Quilr-Provided MCPs](../quilr-provided-mcps/overview).

## When You Need This

Use these guides when an MCP server does not support Dynamic Client Registration and the QuilrAI setup flow asks for OAuth credentials.

For DCR-compatible MCP servers, you do not need to create a provider app. Use [OAuth Connect](../servers-and-connections/oauth-connect) and authorize directly.

## Before You Start

Have these values ready:

| Value | Where to get it |
|-------|-----------------|
| QuilrAI callback URL | The gateway displays it on the MCP setup screen when you click **Add MCP server** or install one from the **Library**. Copy it from there. |
| Provider scopes | Use the scopes requested by the MCP integration. Start with the least privileged scopes that support the tools you plan to enable. |
| App owner | Use the Slack workspace, GitHub organization, or GitHub account that should own the integration. |

:::tip
Create a separate OAuth app for each QuilrAI tenant or environment if the callback URL is different. This keeps rotation, testing, and production authorization separate.
:::

## Provider guides

Provider-native and community MCP servers:

- [Slack](./slack) - create a Slack app and copy its Client ID and Client Secret.
- [GitHub](./github) - create a GitHub OAuth app and copy its Client ID and Client Secret.
- [Zoho](./zoho) - no OAuth app needed; add the Zoho-generated MCP server URL manually.
- [Datadog](./datadog) - no OAuth app needed; register the QuilrAI callback URL in Datadog Organization Settings, enable MCP access (and write access if needed), then add your site-specific Datadog MCP endpoint URL manually.
- [Zoom](./zoom) - create a Zoom General (user-managed OAuth) app and copy its Client ID and Client Secret.
- [Excalidraw](./excalidraw) - no OAuth app needed; self-host the community Excalidraw MCP server, bridge it to streamable HTTP, and add its `/mcp` URL manually.
- [Asana](./asana) - create an Asana **MCP app** in the developer console, set the redirect URL and workspace distribution, then copy its Client ID and Client Secret.
- [dbt Labs](./dbt-labs) - no OAuth app needed; copy the account-specific MCP Endpoint URL from dbt **Account settings** > **Access URLs** and add it manually, then authorize through dbt sign-in and MFA.
- [Netskope](./netskope) - no OAuth app needed; a technology preview requiring a Netskope-issued access code in the URL path plus a REST API v2 bearer token, and allowlisting the MCP server's egress IPs.
- [PitchBook](./pitchbook) - connect the PitchBook Premium remote MCP; its DCR is allowlisted, so ask your PitchBook account team for a Client ID and Client Secret.
- [Salesforce](./salesforce) - two options: create a Salesforce External Client App (PKCE, JWT access tokens, `mcp_api` scope) for the Salesforce Hosted MCP servers, or install the third-party Cirra (Salesforce MCP) admin server from the MCP Library and sign in with your Salesforce account.

Quilr-provided MCPs. Setup steps live on each MCP's page, together with its tools and how it compares with the official server:

- [Google Workspace](../quilr-provided-mcps/google-workspace) - create a Google Cloud OAuth client for the QuilrAI-built Gmail, Calendar, Drive, and directory MCP, then copy its Client ID and Client Secret.
- [Figma](../quilr-provided-mcps/figma) - create a Figma OAuth app for the QuilrAI-built Figma MCP, then copy its Client ID and Client Secret.
- [Calendly Custom](../quilr-provided-mcps/calendly) - create a customer-owned Calendly OAuth app, configure the QuilrAI callback and scopes, and connect the QuilrAI-built 40-tool MCP.
- [Azure DevOps Advanced](../quilr-provided-mcps/azure-devops) - create or approve a Microsoft Entra application, connect Azure DevOps organizations, and review all 47 custom MCP tools.
- [Semrush Advanced](../quilr-provided-mcps/semrush) - connect the QuilrAI-built advanced Semrush MCP with a Semrush API key.
- [BrowserStack Advanced](../quilr-provided-mcps/browserstack) - connect the QuilrAI-built advanced BrowserStack MCP with a BrowserStack username and access key.
- [SketchIt](../quilr-provided-mcps/sketchit) - no OAuth app or credential needed; enable the QuilrAI-built diagram and chart renderer directly from the **Library**.
- [PDF Editor](../quilr-provided-mcps/pdf-editor) - no OAuth app or credential needed; enable the QuilrAI-built PDF reading and editing MCP directly from the **Library**, then upload documents through its own upload page.

## Store And Rotate Secrets

- Store Client Secrets only in QuilrAI and your approved secret-management system.
- Do not send Client Secrets through email, chat, client-side code, public repositories, or tickets.
- Rotate the provider secret if it is exposed or if ownership changes.
- After rotating a secret, update the MCP's manual OAuth credentials in QuilrAI and reconnect if the provider invalidates existing tokens.
- Remove unused OAuth apps from Slack or GitHub so stale credentials cannot be reused.

## Troubleshooting

These errors are common across providers. See each provider guide for provider-specific issues.

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch`, `bad_redirect_uri`, or failed callback | Provider app callback URL does not match the QuilrAI callback URL. | Copy the callback URL from QuilrAI again, update the provider app, save, and retry. |
| `invalid_client` or `bad_client_secret` | Wrong Client ID, wrong secret, or a deleted secret. | Copy the provider Client ID and Client Secret again, update QuilrAI, and retry. |
| Consent succeeds but tools are missing | The MCP was authorized with narrower scopes than the tools need. | Add the missing provider scopes, reconnect, and re-fetch capabilities. |
