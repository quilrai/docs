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
- **Connect Slack** connects Slack as a tool for your agents. See [Connect Slack](#connect-slack).

## Library

Editable templates to start from, grouped by category: Research, Knowledge, Productivity, Support, Analytics, Engineering, Operations and Security. Pick a template and adjust it rather than starting from scratch.

## Create and publish an agent

**+ Create agent** opens **Describe your agent**, where you describe the job in plain words (for example "Review pull requests" or "Triage support tickets"). You can also **Browse the library**, or set the agent up yourself. From the Library, select **Use** followed by the template name to open the same builder pre-filled.

The builder has these sections:

| Section | What you set |
|---|---|
| **Purpose** | **Agent name**, the outcome, and the **System prompt** |
| **Models & team** | The model, plus any specialist agents it leads |
| **Integrations** | The tools (MCP connections) the agent may call. Tools you have not connected show a **Connect** link |
| **Capabilities** | Web, browser and memory |
| **Skills** | Reusable instructions from the [Skills Library](./skills-library) |
| **Inputs & output** | A realistic first task and the result format |
| **Runtime** | The engine. One that works with every model you picked is chosen for you |
| **Access & limits** | **Maximum turns** (one turn is one model reply with its tool calls; 20 suits most tasks) and **Run timeout (seconds)**. Time spent waiting for tool approvals counts toward the timeout |

**Save draft** keeps the agent private to you. **Publish agent** runs readiness checks (model and tool access) and publishes a version. Some engines cannot publish yet; the builder says so, and you can keep the draft.

### Share and manage a published agent

Open the agent and select **Manage agent**:

- **Sharing**: **Audience** is **Only me**, **Everyone in the organization**, or **Specific groups and people** (Smart Groups follow membership changes). **Run tool actions without waiting for approval** lets people you share with run tools straight away; leave it off to review every action. Confirmations your MCP Gateway requires still pause the run.
- **Managers**: only the owner chooses who else can manage the agent.
- **Schedules**: recurring tasks (**Every hour**, **Every day**, **Every week** or a custom interval in minutes) with **Pause schedule** and **Resume schedule**.
- **Versions**: **Restore published version** to roll back.
- **Chat connectors**: connect the agent to Slack (see below).
- **Agent controls**: **Disable agent** stops new tasks and pauses schedules; **Delete agent permanently** asks you to type the name.

## Build a team

**Build a team** combines published agents under a lead. Describe what the team should get done to the team assistant (or build on the canvas), then **Apply to canvas**. For each member, choose a published agent (or create a new one) and say what it should contribute. Members use the agent version fixed when you publish the team. The lead has no tools of its own: it reads every member's answer and writes the one result people get back, using the model you choose. Set a **Time limit for the whole team**. A team runs from a console task, a chat, a Slack mention or a schedule, like any agent.

## Connect Slack

There are two different Slack connections:

- **Connect Slack** on **My agents** opens the MCP Gateway library on the Slack integration, so agents can use Slack as a tool. See [Slack MCP setup](../../mcp-gateway/provider-setup/slack).
- **Manage agent > Chat connectors > Connect a Slack app** lets people talk to one agent from Slack. Create a Slack app with Socket Mode on, the bot scopes `app_mentions:read`, `chat:write`, `reactions:write`, `im:history`, `files:write`, `channels:history`, `groups:history`, `users:read` and `users:read.email`, and the events `app_mention`, `message.im`, `message.channels` and `message.groups`. Install it to your workspace, then enter a **Connector name**, the **Bot token** (`xoxb-`) and **App-level token** (`xapp-`), and optional **Channel IDs**. Choose whether it is **Only respond when mentioned**, **Who the agent acts as** (**The person who asks**, with their own connections, or **Me, for everyone**), and whether to **Run tool actions without waiting for approval** (needed in Slack because nobody approves steps in the console; turn it on only for agents whose tools just read data). Tokens are stored encrypted and never shown again.

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
