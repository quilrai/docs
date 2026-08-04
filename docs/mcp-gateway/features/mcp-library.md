---
sidebar_position: 1
sidebar_custom_props:
  badge: new
  icon: LibraryBig
---

# MCP Library

One-click install pre-built MCP integrations from the catalog.

## How It Works

<StepFlow steps={[
  {
    label: "Browse Catalog",
    items: [
      "Developer Tools: 8 servers",
      "Productivity: 12 servers",
      "Communication: 5 servers",
    ],
  },
  {
    label: "One-Click Install",
    items: [
      "GitHub MCP → installed ✓",
      "OAuth: auto-authorized",
      "Tools: auto-detected",
    ],
  },
  {
    label: "Configure",
    items: [
      "Read tools: 5 enabled",
      "Write tools: 3 enabled",
      "Destructive: 1 disabled ✗",
    ],
  },
]} />

1. **Browse** - Open the MCP Library catalog
2. **Install** - One-click install, no URLs needed
3. **Configure** - Open Settings to customize tools and guardrails

## Pre-Built Integrations

The catalog includes provider-native integrations and MCPs built by Quilr across productivity, developer tools, data, communication, cloud, security, and web search.

For a capability and connection comparison of integrations such as Microsoft 365 Outlook, Azure DevOps, Figma, Semrush, BrowserStack, and Athenahealth, see [Quilr-Provided MCPs](../../quilr-provided-mcps/overview).

## Authentication

### OAuth MCPs

Click **Connect** to authorize. The gateway handles client registration and capability fetching automatically.

### No-Auth MCPs

Ready immediately after install. Create API tokens in **Settings** for programmatic access.

## Add Your Own MCP Server

Don't see what you need? Click **"Add MCP"** to register an MCP server operated by your organization or another provider. Supply its transport URL ending in `/sse` or `/mcp`; the gateway probes its capabilities and detects supported authentication metadata.

This bring-your-own workflow is separate from the catalog of [Quilr-provided integrations](../../quilr-provided-mcps/overview).

## Internal MCPs

To register an MCP server hosted inside your private network, allowlist the following Quilr gateway IPs on your firewall, VPC security group, or reverse proxy so the gateway can reach your internal endpoint:

```
132.226.119.116
```

```
80.225.216.37
```

Once the MCP URL is reachable from these IPs, add it via **"Add MCP"** like any other custom server. Capability probing and subsequent tool calls will originate from the same addresses.
