---
sidebar_position: 1
sidebar_custom_props:
  badge: new
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

The catalog includes ready-to-use MCP servers across categories:

- Productivity
- Developer Tools
- Data & Analytics
- Communication
- Cloud Services
- Security
- Web Search

## Authentication

### OAuth MCPs

Click **Connect** to authorize. The gateway handles client registration and capability fetching automatically.

### No-Auth MCPs

Ready immediately after install. Create API tokens in **Settings** for programmatic access.

## Custom MCP Servers

Don't see what you need? Click **"Add MCP"** to register any MCP server by providing its transport URL (ending in `/sse` or `/mcp`). The gateway auto-detects auth requirements and probes capabilities.
