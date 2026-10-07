---
sidebar_position: 1
sidebar_label: "Chat and tasks"
sidebar_custom_props:
  icon: MessageSquareText
description: "Run an agent from the console: chat with it, give it a one-off task, explore what it is made of, and choose how tool actions are approved."
---

# Chat and tasks

There are two ways to run an agent from the console: **Chat** for a conversation, and **Start a task** for one job. Both are on every agent card and on the agent's **Explore agent** page. Your conversations and runs are private to you.

## Chat

![Chat tab with the Conversations list and agent picker on the left, and the agent's model, connected tools, suggested prompts and message box on the right](/img/workflow-agents/chat.jpg)

1. Open the **Chat** tab and pick an **Agent**, or select **Chat** on an agent card.
2. Start from **Explore an idea**, **Make a plan** or **Create something**, or type your own message. If the agent has required inputs, fill them in under **Set up this conversation**.
3. Choose how the agent uses tools and how tool actions are approved, then **Send message**.

| Setting | Options |
|---------|---------|
| Tool use | **Let agent decide**, **Require tools**, **No tools** |
| Approval | **Ask each time**, **Auto-approve this turn** |

**Conversations** lists your recent chats with the selected agent (from your latest 50 runs), with search. They are only visible to you. If the agent publishes a new version, start a new chat to continue.

The header shows the agent's engine and model, its **Tools**, and **View agent**.

## Start a task

![Start a task panel with the Task for your agent box, Start run, and the agent's earlier runs](/img/workflow-agents/start-a-task.jpg)

**Start a task** opens a panel for one job:

1. Fill in **Task for your agent** and any inputs the agent asks for.
2. Select **Start run**.
3. Review proposed tool actions before they run, unless the agent is set to run tools without waiting.

**Earlier runs** lists your previous runs of the agent with their outcome. Open one to see the conversation and results, or **Start another task**.

## Explore agent

![Explore agent page showing who can run the agent, the agent, and what it is made of: model, tools, inputs, output, engine and human approval](/img/workflow-agents/explore-agent.jpg)

**Explore agent** shows how an agent is put together before you run it:

- **Who can run it**: the owner and how the agent is shared with you.
- **Agent**: status (for example **Live**), whether it runs in **Chat** and **Tasks**, and how many tools are allowlisted.
- **What it is made of**: **Model** (and whether it is your provider), **Tools** (with **Exact allowlist**), **Inputs**, **Output**, **Engine** (with its turn limit) and **Human approval** (for example **Every tool call waits for you**).

Below the map, **Tools** lists every allowlisted tool and its connection. **Explore usage** opens the agent on the [Usage](../monitor/usage) tab.

## Tool approvals

By default, every tool action waits for the person running the agent. An owner can turn on **Run tool actions without waiting for approval** when sharing the agent or connecting it to Slack. Either way, tools your [MCP Gateway](../../mcp-gateway/protect/server-access) marks as needing confirmation still pause the run, and time spent waiting counts toward the agent's run timeout.

## Related

- [Share and manage](./share-and-manage)
- [Chat from Slack](../slack/chat-from-slack)
- [Usage](../monitor/usage)
