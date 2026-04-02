---
sidebar_position: 7
sidebar_custom_props:
  icon: Link
---

# OAuth Connect

Authorize OAuth-protected MCP servers with one click.

## How It Works

<StepFlow steps={[
  {
    label: "Probe MCP URL",
    items: [
      "URL: github-mcp.example.com",
      "Auth: OAuth 2.0 detected",
      "DCR: supported ✓",
    ],
  },
  {
    label: "Authorize",
    items: [
      "→ GitHub OAuth consent",
      "Scope: repo, read:org",
      "Status: authorized ✓",
    ],
  },
  {
    label: "Capabilities Cached",
    items: [
      "Tools: 12 fetched",
      "Resources: 3 fetched",
      "Prompts: 2 fetched",
    ],
  },
]} />

1. **Probe URL** - The gateway detects the MCP server's auth requirements
2. **Authorize** - You're redirected to the MCP's OAuth authorization page
3. **Fetch Capabilities** - Tools, resources, and prompts are cached automatically

## OAuth Modes

### Dynamic Client Registration (DCR) - Recommended

The gateway automatically registers as an OAuth client with the MCP server. No Client ID or Secret needed - just click **Connect** and authorize.

### Manual OAuth

For MCP servers without DCR support. Provide your OAuth credentials during MCP setup:

```
Client ID: your-client-id
Client Secret: ••••••••••
```

The gateway uses these credentials for the authorization flow.

## Fetched Capabilities

After authorization, the gateway caches the MCP server's capabilities:

| Capability | Description |
|------------|-------------|
| **Tools** | Available tool functions |
| **Resources** | Exposed data resources |
| **Prompts** | Pre-defined prompt templates |

## Re-Fetching Capabilities

If the MCP server adds new tools or updates its capabilities, click **"Already connected? Click to fetch capabilities"** in the Settings panel to refresh the cached capabilities without re-authorizing.
