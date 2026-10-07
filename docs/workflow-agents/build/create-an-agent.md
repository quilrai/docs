---
sidebar_position: 1
sidebar_label: "Create an agent"
sidebar_custom_props:
  icon: PenTool
description: "The agent builder step by step: purpose and system prompt, models and specialists, MCP tools, capabilities, skills, inputs and output, engine, and run limits."
---

# Create an agent

The builder walks through eight steps. Steps are listed on the left with a summary of what you set, the **Overview** panel on the right shows the agent at a glance and the checks left before you can publish, and the **Assistant** tab drafts or changes the agent for you.

<ConsolePath console="QuilrAI Console" path={['Settings', 'AI Gateway', 'Workflow Agents']} action="Create agent" />

Nothing is saved until you choose to. **Save draft** keeps the agent private to you; **Save & publish agent** runs the checks and publishes a version. **More** has **Read the definition** and **Check definition**. If you leave with unsaved changes, the builder asks before it discards them.

| Step | What you set |
|------|--------------|
| 1. [Purpose](#1-purpose) | **Agent name**, **Desired outcome**, **System prompt**, **First task** |
| 2. [Models & team](#2-models--team) | **Lead model**, **Team models**, **Specialists** |
| 3. [Integrations](#3-integrations) | MCP connections and the tools the agent may call |
| 4. [Capabilities](#4-capabilities) | **Web search**, **Browser**, **Memory** |
| 5. [Skills](#5-skills) | Reusable playbooks from the Skills Library |
| 6. [Inputs & output](#6-inputs--output) | Form fields, fixed variables and the output format |
| 7. [Runtime](#7-runtime) | The engine |
| 8. [Access & limits](#8-access--limits) | **Maximum turns** and **Run timeout (seconds)** |

## 1. Purpose

![Builder, Purpose step with Agent name, Desired outcome and the System prompt instructions, and the Overview panel showing the agent at a glance and the checks before publishing](/img/workflow-agents/builder-purpose.jpg)

- **Agent name** and **Desired outcome**: the outcome is one sentence describing a useful result. It is shown beside the name.
- **System prompt**: how the agent works, its role, the sources it uses and when it asks for help. **Write with the assistant** drafts it for you. Tool access and approvals are set in later steps, not here.
- **First task**: a realistic request to try the draft with before you publish.

## 2. Models & team

![Builder, Models & team step with the Lead model picker, Team models and Specialists](/img/workflow-agents/builder-models.jpg)

- **Lead model** writes every answer. Switch between **Your models** (providers your organization connected to the LLM Gateway) and **Quilr models**. **Add provider** opens provider setup if the model you want is missing.
- **Team models**: up to four extra models that specialists can use. The lead still writes the final answer.
- **Specialists** work in order and share their findings; the lead combines them into one answer. Add one when a second opinion helps, such as a reviewer that checks the lead's findings.

The engine options in step 7 adjust so that the engine works with every model on the team.

## 3. Integrations

![Builder, Integrations step with an Atlassian connection added, the tool list filtered by All, Read-only and Changes data, and a prompt to authorize the connection](/img/workflow-agents/builder-integrations.jpg)

Pick a **Connection** (any MCP server on your MCP Gateway), then choose which of its tools the agent may call. Only the tools you tick are available to the agent.

- Read-only tools are selected when you add a connection. Tools that change data are your call.
- Filter with **All**, **Read-only** and **Changes data**, search tool names and descriptions, or use **Select all**, **Read-only only** and **Clear**.
- If you have not connected your own account to the server yet, select **Authorize** (for example **Authorize Atlassian**), then **Refresh** and select the tools. Until then the **Your tools are connected** check does not pass.
- **Add Slack** opens the MCP Library on the Slack server so you can add Slack as a tool. See [Slack as a tool](../slack/slack-as-a-tool).
- **Browse integrations marketplace** and **Manage connections** open the MCP Gateway library and your connections.

Without a tool, an agent can only answer from the model and never act.

## 4. Capabilities

![Builder, Capabilities step with Web search, Browser and Memory switches](/img/workflow-agents/builder-capabilities.jpg)

Extra reach beyond your connected tools. Each one runs through your MCP Gateway and is listed for the people you share the agent with.

| Capability | What it does |
|------------|--------------|
| **Web search** | Looks things up on the public web through the QuilrAI Web Search MCP. Results flow through your MCP Gateway like any other tool call. |
| **Browser** | Opens and reads web pages, clicks and fills forms in a headless browser through the QuilrAI Browser MCP. Actions that change a page can be set to need confirmation in the MCP Gateway. Shows **Unavailable** if browser access is not enabled for your organization. |
| **Memory** | Remembers across runs: the agent can search and save each person's own memories, the same ones [OneMCP](../../mcp-gateway/get-started/onemcp) uses. Memories stay private to that person, and the **Memories enabled** switch in the [OneMCP settings](../../mcp-gateway/get-started/onemcp) can turn this off for everyone. |

## 5. Skills

A skill is a written playbook, such as how to review evidence or format a report. Attach up to eight from the [Skills Library](../../console/settings-ai-gateway/skills-library): search, review a skill's instructions, then attach it. **Manage skills** opens the library.

A skill's instructions are copied into the agent version, so later library changes never alter a published agent. Skills are optional.

## 6. Inputs & output

![Builder, Inputs & output step with the first input field, its label and name, a Require switch and a preview of the start form](/img/workflow-agents/builder-inputs.jpg)

- **What people fill in**: every run starts with a task in the person's own words. **Add input** adds a field for anything the agent needs every time, such as a customer name or a date range. Each input has a label (what people see), a name (how the agent refers to it) and a **Require** switch. **What people will see** previews the start form.
- **What it always knows**: variables you set once, such as a GitHub organization or a default repository. Write `{{name}}` in the instructions and the value is filled in when the agent runs. People running the agent cannot edit them. They are part of the instructions, not secret storage, so do not put credentials in them.
- **What it hands back**: the **Output format**, enforced on every run.

| Output format | Best for |
|---------------|----------|
| **Written answer · Markdown** | A readable reply with headings and lists, when a person reads the result. |
| **Structured result · JSON** | Named fields another system or a later step can use. Add a schema to fix the fields. |
| **Table · exportable as CSV** | Rows and columns, such as a list of findings or invoices. People can download it as CSV. |

## 7. Runtime

![Builder, Runtime step with the engine choices LangGraph, OpenAI Agents SDK, Claude Agent SDK, Google ADK and CrewAI](/img/workflow-agents/builder-runtime.jpg)

The engine carries out the agent's steps and tool calls. One that works with every model you picked is chosen for you; change it only if your team prefers a specific framework.

| Engine | Suited to |
|--------|-----------|
| **LangGraph** (recommended) | Stateful workflows and approval checkpoints |
| **OpenAI Agents SDK** | Tool-using assistants and agent handoffs |
| **Claude Agent SDK** | Repository research and coding workflows |
| **Google ADK** | Google ecosystem and coordinated workflows |
| **CrewAI** | Role-based tasks and collaborative workflows |

## 8. Access & limits

**Run limits** stop a run when it reaches either one:

- **Maximum turns**: one turn is one model reply, including the tools it calls. 20 suits most tasks.
- **Run timeout (seconds)**: defaults to 300. Time spent waiting for tool approvals counts toward it.

Who can run the agent, and whether their runs wait for approval before tools act, is decided when you share it. See [Share and manage](../run-and-share/share-and-manage#sharing). Model and tool access are checked again on every run.

## Publish

**Before you publish** lists what still stands between the draft and a published agent, for example **It has a name**, **It has instructions**, **A model is chosen** and **Your tools are connected**. **Worth doing, not required** suggests improvements such as adding an example task. When every check passes, **Save & publish agent** publishes a version.

## Related

- [Library templates](./library-templates): start from a pre-filled agent
- [Build a team](./build-a-team): combine published agents
- [Share and manage](../run-and-share/share-and-manage)
