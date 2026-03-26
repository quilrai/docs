---
sidebar_position: 3
---

# Agents Configuration

Map AI clients to MCPs and monitor per-agent usage.

## How It Works

1. **Register Agents** — Use predefined agents or create custom ones
2. **Map to MCPs** — Enable or disable MCPs per agent
3. **Monitor Usage** — Track per-agent tool call statistics

## Predefined Agents

Built-in agents are identified by their User-Agent header keywords:

| Agent | User-Agent Keyword |
|-------|-------------------|
| OpenAI | `openai` |
| Claude | `claude` |
| Cursor | `cursor` |
| Gemini | `gemini` |

## Custom Agents

Create custom agents for any AI client not in the predefined list. Each custom agent requires:

- **User-Agent Keyword** — The keyword to match in the User-Agent header (e.g., `my-custom-agent`)
- **Display Name** — A human-readable name for the dashboard (e.g., `My Custom Agent`)

## Per-Agent Dashboard

Each agent card shows:

- **Total tool calls** — Cumulative tool invocations for the agent
- **MCP access** — Which MCPs are enabled vs. disabled
- **Toggle controls** — Enable or disable individual MCP access per agent directly from this view

### Example

| Agent | Tool Calls | MCPs |
|-------|-----------|------|
| OpenAI | 1,247 | GitHub, Slack, Jira, Confluence (enabled) — S3, Internal API (disabled) |

## Agents Configuration vs. Access Control

| View | Best For |
|------|----------|
| **Agents Configuration** | Global view — see all MCPs for each agent. Best for managing agent permissions across your entire MCP fleet. |
| **Access Control** | Per-MCP view — see all agents for one MCP. Best when configuring a single MCP's permissions. |

Both views control the same underlying permissions — use whichever is more convenient for your workflow.
