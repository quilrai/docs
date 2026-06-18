---
sidebar_position: 1
sidebar_custom_props:
  icon: KeyRound
---

# Overview

Set up the provider side of an MCP connection. Most providers need a provider-owned OAuth app with a manual **Client ID** and **Client Secret**; a few only need their MCP server URL added manually.

## When You Need This

Use these guides when an MCP server does not support Dynamic Client Registration and the QuilrAI setup flow asks for OAuth credentials.

For DCR-compatible MCP servers, you do not need to create a provider app. Use [OAuth Connect](../features/oauth-connect) and authorize directly.

## Before You Start

Have these values ready:

| Value | Where to get it |
|-------|-----------------|
| QuilrAI callback URL | The gateway displays it on the MCP setup screen when you **Add MCP** or install one from the library. Copy it from there. |
| Provider scopes | Use the scopes requested by the MCP integration. Start with the least privileged scopes that support the tools you plan to enable. |
| App owner | Use the Slack workspace, GitHub organization, or GitHub account that should own the integration. |

:::tip
Create a separate OAuth app for each QuilrAI tenant or environment if the callback URL is different. This keeps rotation, testing, and production authorization separate.
:::

## Provider Guides

- [Slack](./slack) - create a Slack app and copy its Client ID and Client Secret.
- [GitHub](./github) - create a GitHub OAuth app and copy its Client ID and Client Secret.
- [Zoho](./zoho) - no OAuth app needed; add the Zoho-generated MCP server URL manually.
- [Google Workspace](./google-workspace) - create a Google Cloud OAuth client for the QuilrAI-built Gmail and Calendar MCP, then copy its Client ID and Client Secret.

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
