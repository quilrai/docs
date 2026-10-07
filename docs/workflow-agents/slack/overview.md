---
sidebar_position: 1
sidebar_label: "Slack options"
sidebar_custom_props:
  icon: BookOpen
description: "The three ways Slack connects to QuilrAI: agents using Slack as a tool, people chatting with an agent in Slack, and QuilrAI notifications to a channel."
---

# Slack options

Slack shows up in three different places. They use different Slack apps and different tokens, so pick the one that matches what you want.

| You want | Use | Set up in | Slack app |
|----------|-----|-----------|-----------|
| An agent to **read or post in Slack** as part of its work (search messages, summarize a channel, send an update) | [Slack as a tool](./slack-as-a-tool) | **Connect Slack** on **My agents**, or **Add Slack** in the builder | The Slack MCP server on your MCP Gateway (OAuth, user token) |
| People to **talk to an agent in Slack** (mention it in a channel or DM it) | [Chat from Slack](./chat-from-slack) | **Manage agent > Chat connectors > Connect a Slack app** | Your own Slack app in Socket Mode (bot token and app-level token), one per agent |
| QuilrAI **findings and notifications** in a Slack channel | [Slack notifications](../../integrations/send-logs-and-alerts/splunk-datadog-and-slack) | **Settings > Integrations** | The Slack integration card |

You can combine them. For example, an agent people chat with in Slack can also have Slack as a tool so it can look up earlier threads.

<StepFlow steps={[
  {
    label: "Slack as a tool",
    items: [
      "Agent → MCP Gateway → Slack API",
      "Runs as the person, with their Slack access",
    ],
  },
  {
    label: "Chat from Slack",
    items: [
      "Slack mention or DM → agent run",
      "Answer posted back in the thread",
    ],
  },
  {
    label: "Notifications",
    items: [
      "QuilrAI → Slack channel",
      "Findings and operational alerts",
    ],
  },
]} />
