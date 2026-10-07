---
sidebar_position: 3
sidebar_label: "Self Service"
sidebar_custom_props:
  icon: UserCog
description: "How people without admin access find and run the workflow agents shared with them in the Self Service portal."
---

# Self Service

People without admin access use the agents shared with them from the **Self Service** portal, on its **Workflow Agents** tab. Admins can open it with **Switch to Self Service** at the bottom of the console sidebar.

![Self Service portal, Workflow Agents tab listing the agents shared with the user, each with its model, tools, engine, Explore agent, Start a task and Chat](/img/workflow-agents/self-service-agents.jpg)

**Workflow agents shared with you** lists every agent shared with the person, with search. Each card has:

- **Explore agent**: what the agent is made of and who owns it.
- **Start a task**: give it one job.
- **Chat**: talk to it.

Every tool action waits for the person's approval unless the owner chose otherwise, and conversations stay private to the person. Runs use the person's own MCP connections; if a tool is not connected yet, they are asked to connect it.

To make an agent show up here, share it from [Share and manage](./share-and-manage#sharing). For the rest of the portal, see [LLM Gateway self-service](../../llm-gateway/self-service/overview).
