---
sidebar_position: 5
---

# Access Control

Restrict which AI agents can use each MCP server.

## Overview

Access Control lets you restrict each MCP to specific AI agents. When enabled, only the selected agents can invoke tools from that MCP. Agents are identified by their User-Agent header keyword.

## How It Works

- **Per-MCP agent-level access control** - Configure allowed agents for each MCP independently
- **Toggle access for predefined agents** - OpenAI, Claude, Cursor, Gemini
- **Support for custom agents** - User-Agent keyword matching for any AI client
- **Changes take effect immediately** - No restart needed

## Predefined Agents

Pre-defined agents (OpenAI, Claude, Cursor, Gemini) are available by default. Each is identified by its User-Agent header keyword.

## Custom Agents

Create custom agents with a keyword and display name to support any AI client. The gateway matches the keyword against the User-Agent header of incoming requests.

## Configuration

Access control is configured per-MCP in the **Settings → General** tab. Toggle individual agents on or off for each MCP server.

:::tip
For a global view of agent permissions across all MCPs, use [Agents Configuration](./agents-configuration) instead. Both views control the same underlying permissions.
:::
