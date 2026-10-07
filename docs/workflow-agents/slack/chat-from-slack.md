---
sidebar_position: 3
sidebar_label: "Chat from Slack"
sidebar_custom_props:
  icon: MessageSquareText
description: "Connect a Slack app to a workflow agent so people can mention it or DM it in Slack: create the Socket Mode app, copy the tokens, and choose who the agent acts as."
---

# Chat from Slack

Connect a Slack app to an agent so people can talk to it in Slack. A mention or a direct message to the app starts a run, the answer is posted back in the thread, and the thread keeps the conversation. Approvals you require still happen in the console.

Each agent gets its own Slack app. You need permission to manage the agent and to create and install apps in your Slack workspace.

<StepFlow steps={[
  {
    label: "Slack",
    items: [
      "@mention in a channel",
      "Or a direct message",
    ],
  },
  {
    label: "Slack app (Socket Mode)",
    items: [
      "Bot token xoxb-",
      "App-level token xapp-",
    ],
  },
  {
    label: "Workflow agent",
    items: [
      "Runs as the asker or as you",
      "Tools through the MCP Gateway",
    ],
  },
  {
    label: "Back in Slack",
    items: [
      "Answer in the thread",
      "Follow-ups keep the context",
    ],
  },
]} />

## 1. Create the Slack app

The quickest way is from a manifest.

1. Open the [Slack app dashboard](https://api.slack.com/apps), select **Create New App**, then **From a manifest**.
2. Choose the workspace, paste the manifest below (change the names to your agent's), and create the app.

```yaml
display_information:
  name: Support Triage
features:
  app_home:
    messages_tab_enabled: true
    messages_tab_read_only_enabled: false
  bot_user:
    display_name: Support Triage
    always_online: true
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - chat:write
      - reactions:write
      - im:history
      - files:write
      - channels:history
      - groups:history
      - users:read
      - users:read.email
settings:
  event_subscriptions:
    bot_events:
      - app_mention
      - message.im
      - message.channels
      - message.groups
  socket_mode_enabled: true
```

To set it up by hand instead, create the app **From scratch** and:

| Where in Slack | Set |
|----------------|-----|
| **Socket Mode** | On |
| **OAuth & Permissions > Bot Token Scopes** | `app_mentions:read`, `chat:write`, `reactions:write`, `im:history`, `files:write`, `channels:history`, `groups:history`, `users:read`, `users:read.email` |
| **Event Subscriptions > Subscribe to bot events** | `app_mention`, `message.im`, `message.channels`, `message.groups` |
| **App Home > Messages Tab** | On, and allow users to send messages, so people can DM the agent |

## 2. Copy the two tokens

1. **Basic Information > App-Level Tokens**: select **Generate Token and Scopes**, add the `connections:write` scope, and generate. Copy the token; it starts with `xapp-`.
2. **Install App**: install the app to your workspace, then copy the **Bot User OAuth Token**; it starts with `xoxb-`.

## 3. Connect the app to the agent

Open the agent's **Manage** drawer, go to **Chat connectors** and select **Connect a Slack app**.

![Chat connectors form with the Slack app requirements, Connector name, Bot token, App-level token and Channel IDs fields](/img/workflow-agents/slack-connector-tokens.jpg)

| Field | What to enter |
|-------|---------------|
| **Connector name** | A name to recognize this connection by, for example the Slack workspace or channel. |
| **Bot token** | The `xoxb-` Bot User OAuth Token. |
| **App-level token** | The `xapp-` app-level token. |
| **Channel IDs (optional)** | Comma-separated channel IDs, such as `C0123ABCDEF, C0456GHIJKL`. Leave empty to answer in every channel the app is invited to. |

Tokens are stored encrypted and never shown again.

## 4. Choose how it behaves

![Chat connectors options: Only respond when mentioned, Who the agent acts as, Answer follow-ups in its threads without a mention, and Run tool actions without waiting for approval](/img/workflow-agents/slack-connector-options.jpg)

| Option | What it does |
|--------|--------------|
| **Only respond when mentioned** | On by default. Direct messages always start a run. Switch it off to answer every message in the chosen channels. |
| **Who the agent acts as** | **The person who asks** (default): each person uses their own connections, memories and access, and must be able to run the agent. If a tool is not connected yet, the bot sends them a private link to connect it and carries on once they have. **Me, for everyone**: everyone's messages run with your connections and access. |
| **Answer follow-ups in its threads without a mention** | On by default. Replies in a thread the bot already answered get an answer without mentioning it, unless they mention someone else. |
| **Run tool actions without waiting for approval** | Off by default. While it is off, tool actions wait for approval in the console, so a Slack run that uses tools pauses until someone approves it there. Turn it on only for agents whose tools just read data. Tools your MCP Gateway marks as needing confirmation still wait. |

Select **Connect Slack**.

:::warning
**Me, for everyone** lets anyone who can message the bot use your connections and access. Pair it with a narrow **Channel IDs** list and read-only tools.
:::

## 5. Invite the bot and test

1. In Slack, invite the app to each channel it should answer in (`/invite @Support Triage`).
2. Mention it with a question, or send it a direct message.
3. The answer arrives in the thread. Check the run on the [Usage](../monitor/usage) tab.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| The bot never answers | Socket Mode is on, the app-level token has `connections:write`, and both tokens were pasted into the right fields. |
| It answers DMs but not in a channel | The app is invited to the channel, the channel is in **Channel IDs** (or the list is empty), and you mentioned it if **Only respond when mentioned** is on. |
| It cannot read the thread or channel | The `channels:history` (public) or `groups:history` (private) scope and the matching `message.channels` or `message.groups` event are added, and the app was reinstalled after adding them. |
| A person gets a link to connect a tool | **Who the agent acts as** is **The person who asks** and they have not connected that tool yet. They connect it from the link and the run carries on. |
| The run stops waiting for approval | **Run tool actions without waiting for approval** is off, or the MCP Gateway requires confirmation for that tool. |
| Someone cannot use the bot | With **The person who asks**, they must be able to run the agent. Check [Sharing](../run-and-share/share-and-manage#sharing). |

## Related

- [Slack options](./overview)
- [Slack as a tool](./slack-as-a-tool)
- [Share and manage](../run-and-share/share-and-manage)
