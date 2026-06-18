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

The gateway uses these credentials for the authorization flow. For provider-specific setup steps, see [MCP Provider Setup](../mcp-provider-setup/overview).

### OAuth Passthrough

Use OAuth passthrough when the downstream MCP client must perform OAuth directly with the upstream MCP provider. In this mode:

- The gateway relays or advertises upstream OAuth metadata.
- The client obtains the upstream provider's access token.
- The gateway accepts that upstream Bearer token on the direct per-MCP endpoint and forwards it upstream.
- The gateway does not store, refresh, or revoke the upstream token.
- The MCP is not exposed through OneMCP.

### Inline OAuth in OneMCP

OneMCP can surface OAuth MCPs before a user has connected them. When a selected tool needs upstream authorization, OneMCP returns an `isError: true` tool result containing a short-lived connect URL. The user opens the URL, finishes authorization, returns to the agent, and retries the same request.

For the full OneMCP flow, see [OneMCP](../onemcp).

## Fetched Capabilities

After authorization, the gateway caches the MCP server's capabilities:

| Capability | Description |
|------------|-------------|
| **Tools** | Available tool functions |
| **Resources** | Exposed data resources |
| **Prompts** | Pre-defined prompt templates |

## Re-Fetching Capabilities

If the MCP server adds new tools or updates its capabilities, click **"Already connected? Click to fetch capabilities"** in the Settings panel to refresh the cached capabilities without re-authorizing.
