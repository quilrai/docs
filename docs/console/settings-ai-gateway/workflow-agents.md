---
sidebar_position: 2
sidebar_label: "Workflow Agents"
sidebar_custom_props:
  icon: Workflow
---

# Workflow Agents

Workflow Agents lets you build and run AI agents connected to your tools. Each agent combines a model, a set of tools and an engine.

<ConsolePath console="QuilrAI Console" path={['Settings', 'AI Gateway', 'Workflow Agents']} action="Create agent" />

The header has **Build a team** and **+ Create agent**. The page has four tabs: **My agents**, **Library**, **Chat** and **Usage**.

## My agents

Your agents and the agents shared with you.

- Tiles: **Workspace**, **Published**, **In progress** (drafts) and **Shared with you**.
- Search, switch between **Cards** and **List**, and filter with the chips **All**, **Published**, **Drafts**, **Shared** and **Disabled**.
- Each card shows the agent's **Model**, **Tools** and **Engine** (for example LangGraph or Claude Agent SDK).
- **Connect Slack** connects a Slack workspace to your agents.

## Library

Editable templates to start from, grouped by category: Research, Knowledge, Productivity, Support, Analytics, Engineering, Operations and Security. Pick a template and adjust it rather than starting from scratch.

## Chat

Talk to an agent directly.

1. Pick an agent.
2. Start from a prompt such as **Explore an idea**, **Make a plan** or **Create something**, or type your own.
3. Choose how tool use is approved: **Let agent decide** or **Ask each time**.

Recent conversations are listed and are private to you.

## Usage

How your agents are performing: runs, completion rate, tool attempts, average duration, and a flow chart from work to outcome.

## End users

Agents shared with users appear in the **Self Service** portal under **Workflow Agents**, where users can explore an agent, start a task or chat. Tool actions wait for the user's approval. See [LLM Gateway self-service](../../llm-gateway/self-service/overview).

## Related

- [Agents](../observe/agents) - observe agents across your estate
- [MCP Gateway](../../mcp-gateway) - govern the tools agents call
