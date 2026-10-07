---
sidebar_position: 2
sidebar_label: "Quick start"
sidebar_custom_props:
  icon: Rocket
description: "Create, publish and run your first workflow agent in five steps: describe it, pick a model and tools, publish, share and run."
---

# Quick start

Build an agent, publish it and give it its first task.

<StepFlow steps={[
  {
    label: "Describe",
    items: [
      "Create agent",
      "Or a Library template",
    ],
  },
  {
    label: "Model and tools",
    items: [
      "Lead model",
      "MCP connection and tools",
    ],
  },
  {
    label: "Publish",
    items: [
      "Checks pass",
      "Save & publish agent",
    ],
  },
  {
    label: "Share",
    items: [
      "Manage > Sharing",
      "Optional: Slack, schedule",
    ],
  },
  {
    label: "Run",
    items: [
      "Chat or Start a task",
      "Review on Usage",
    ],
  },
]} />

## Before you start

- At least one model your organization can use: a provider on the [LLM Gateway](../../llm-gateway/apps-and-providers/providers-and-models) or a QuilrAI-provided model.
- The MCP servers your agent needs, added to the [MCP Gateway](../../mcp-gateway/servers-and-connections/adding-mcp-servers). An agent without tools can only answer from the model.

## 1. Describe the agent

Go to **Settings > AI Gateway > Workflow Agents** and select **+ Create agent**.

![Create an agent page with the Describe your agent box, a Build a team prompt and Start from an example suggestions](/img/workflow-agents/create-agent.jpg)

Pick one way in:

- **Describe your agent** in plain words, then **Draft with the assistant**. The assistant drafts the name, instructions and a first task, and you review every word before anything is saved.
- **Start from an example**, such as **Review pull requests**, **Research and write a brief** or **Triage support tickets**.
- **Browse the library** to start from a [template](../build/library-templates).
- **Start with a blank agent** to fill in the builder yourself.

## 2. Pick a model and tools

In the builder, fill in **Purpose** (name, outcome and **System prompt**), then:

1. **Models & team**: choose the **Lead model**.
2. **Integrations**: choose a **Connection**, then tick the tools the agent may call. If you have not connected your own account to that server yet, select **Authorize** and come back.

The rest of the steps have working defaults. See [Create an agent](../build/create-an-agent) for each one.

## 3. Publish

The **Before you publish** panel counts the checks that pass, such as **It has a name**, **A model is chosen** and **Your tools are connected**. When they all pass, select **Save & publish agent**. **Save draft** keeps it private instead.

## 4. Share it (optional)

New agents are **Only me**. Open the agent's **Manage** drawer and use **Sharing** to give it to your organization or to specific Smart Groups and people. From the same drawer you can [connect a Slack app](../slack/chat-from-slack) or [add a schedule](../run-and-share/share-and-manage#schedules).

## 5. Run it

On the agent's card, select **Chat** to talk to it or **Start a task** to give it one job. Approve tool actions as they come up, then check the run on the [Usage](../monitor/usage) tab.

## Next steps

- [Create an agent](../build/create-an-agent): builder reference
- [Share and manage](../run-and-share/share-and-manage): sharing, managers, schedules and versions
- [Build a team](../build/build-a-team): combine agents under a lead
