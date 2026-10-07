---
sidebar_position: 2
sidebar_label: "Slack as a tool"
sidebar_custom_props:
  icon: Wrench
description: "Give a workflow agent Slack tools through the MCP Gateway so it can search messages, read channels and post updates as the person running it."
---

# Slack as a tool

Add Slack as a tool when an agent needs to read or post in Slack as part of its work, for example to search messages, summarize a channel or send an update. The agent calls Slack through the Slack MCP server on your MCP Gateway, so every call is checked against your tool rules and guardrails and logged.

## Add Slack

Either:

- On **My agents**, select **Connect Slack**, or
- In the builder's **Integrations** step, select **Add Slack**.

Both open the **MCP Library** filtered to the Slack server.

![MCP Library drawer filtered to Slack, showing the Slack remote server with OAuth sign-in and a Continue setup button](/img/workflow-agents/slack-as-a-tool.jpg)

1. Select **Continue setup** (or install the server if it is not installed yet). If your Slack setup needs your own Slack OAuth app, follow [Slack provider setup](../../mcp-gateway/provider-setup/slack) for the Client ID, Client Secret and user-token scopes.
2. Connect your own Slack account when asked.
3. Back in the builder, select **Refresh** on the **Integrations** step, choose the Slack **Connection**, and tick the tools the agent may call.

Read-only tools (such as searching messages or reading channels) are selected for you. Tools that change data, such as sending messages, are your call.

## Whose Slack access is used

Slack tools act with the Slack account of the person running the agent, through their own connection. Someone who has not connected Slack yet is asked to connect it before the tool can run. Choose which tools need confirmation in the [MCP Gateway](../../mcp-gateway/protect/server-access); those confirmations pause the run even when the agent is set to run tools without waiting.

## Related

- [Slack options](./overview): how this differs from chatting with an agent in Slack
- [Chat from Slack](./chat-from-slack)
- [Create an agent](../build/create-an-agent#3-integrations)
