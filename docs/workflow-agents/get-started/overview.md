---
sidebar_position: 1
sidebar_label: "Introduction"
sidebar_custom_props:
  icon: BookOpen
description: "What Workflow Agents are, how an agent is made of a model, tools and an engine, and how every run is governed by your LLM Gateway and MCP Gateway."
---

# Introduction to Workflow Agents

Workflow Agents lets you build AI agents that do real work with your tools, share them with the people who need them, and run them from the console, a chat, Slack or a schedule. Every agent uses your organization's models and MCP connections, so each model call and tool call goes through the same gateways, guardrails and logs as the rest of your AI traffic.

<ConsolePath console="QuilrAI Console" path={['Settings', 'AI Gateway', 'Workflow Agents']} action="Create agent" />

<StepFlow steps={[
  {
    label: "Start a run",
    items: [
      "Chat or Start a task",
      "Slack mention or DM",
      "Schedule",
    ],
  },
  {
    label: "Workflow agent",
    items: [
      "Model from your LLM providers",
      "Tools from your MCP connections",
      "Engine runs the steps",
    ],
  },
  {
    label: "Governed",
    items: [
      "✓ Tool approvals",
      "✓ MCP Gateway rules and guardrails",
      "✓ Run limits",
    ],
  },
  {
    label: "Result",
    items: [
      "Markdown, JSON or a table",
      "Posted back where the run started",
    ],
  },
]} />

![Workflow Agents, My agents tab with Workspace, Published, In progress and Shared with you tiles, the agent search and filters, and agent cards](/img/workflow-agents/my-agents.jpg)

## Key concepts

| Term | What it is |
|------|------------|
| **Agent** | A published definition: a name and outcome, a **System prompt**, a model, the tools it may call, an engine and run limits. Each card on **My agents** shows its **Model**, **Tools** and **Engine**. |
| **Draft** | An agent you are still building. Drafts are private to you until you publish. |
| **Revision** | Every publish creates a new version. Runs already in progress keep the version they started with, and you can restore an earlier one. |
| **Model** | The lead model that writes every answer. Use one of **Your models** (providers your organization connected to the LLM Gateway) or a **Quilr model**. |
| **Tools** | Tools from your MCP connections, picked one by one. Read-only tools are selected for you; tools that change data are your call. |
| **Engine** | The runtime that carries out the steps: **LangGraph** (recommended), **OpenAI Agents SDK**, **Claude Agent SDK**, **Google ADK** or **CrewAI**. |
| **Team** | Two to six published agents under a lead model that combines their answers into one result. |
| **Run** | One chat response or task. Runs show up on the [Usage](../monitor/usage) tab. |

## The page

**Workflow Agents** has **Build a team** and **+ Create agent** in the header, and four tabs:

| Tab | What it is for |
|-----|----------------|
| **My agents** | Your published agents, your drafts and the agents shared with you. Search, switch between **Cards** and **List**, and filter with **All**, **Published**, **Drafts**, **Shared** and **Disabled**. **Connect Slack** adds Slack as a tool. |
| **Library** | Editable templates to start from. See [Library templates](../build/library-templates). |
| **Chat** | Talk to an agent. See [Chat and tasks](../run-and-share/chat-and-tasks). |
| **Usage** | Runs, completion rate, tool attempts and duration per agent. See [Usage](../monitor/usage). |

Each agent card has **Explore agent**, **Manage** (for agents you own or manage), **Start a task** and **Chat**. Drafts show **Continue building**.

## How runs are governed

- **Models** come from the providers your organization connected to the [LLM Gateway](../../llm-gateway), or from QuilrAI-provided models that draw on your shared credit.
- **Tools** are your [MCP Gateway](../../mcp-gateway) connections. Only the tools you tick are available to the agent, and each person's own connections are used unless you choose otherwise.
- **Approvals**: by default every tool action waits for the person running the agent. Owners can let shared runs skip that wait, but confirmations your MCP Gateway requires still pause the run.
- **Limits**: **Maximum turns** and **Run timeout (seconds)** stop a run that goes on too long.
- **Access** is checked again on every run: model access, tool access and who the agent is shared with.

## Next steps

- [Quick start](./quick-start): build, publish and run your first agent
- [Create an agent](../build/create-an-agent): every step of the builder
- [Chat from Slack](../slack/chat-from-slack): let people talk to an agent in Slack
