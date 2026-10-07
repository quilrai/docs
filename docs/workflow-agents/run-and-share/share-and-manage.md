---
sidebar_position: 2
sidebar_label: "Share and manage"
sidebar_custom_props:
  icon: Handshake
description: "The Manage agent drawer: edit instructions, choose managers, share with groups and people, connect Slack, schedule recurring runs, restore versions, and disable or delete an agent."
---

# Share and manage

Open a published agent's **Manage** drawer from its card on **My agents**. Only the owner and the agent's managers see **Manage**.

![Manage agent drawer with the agent's status, revision and owner badges, the section list, and the Instructions section showing the published system prompt](/img/workflow-agents/manage-instructions.jpg)

| Section | What you do there |
|---------|-------------------|
| [Instructions](#instructions) | Edit the published system prompt |
| [Managers](#managers) | Choose who else can manage the agent |
| [Chat connectors](#chat-connectors) | Connect a Slack app |
| [Sharing](#sharing) | Choose who can run the agent |
| [Schedules](#schedules) | Recurring tasks |
| [Versions](#versions) | Restore a published version |
| [Agent controls](#agent-controls) | Disable or delete the agent |

**Edit draft** opens the full [builder](../build/create-an-agent) for anything else.

## Instructions

The **System prompt** of the active version. **Publish new version** saves a version that changes only the instructions; runs already in progress keep the version they started with. **Discard changes** reverts your edits.

## Managers

Managers can edit the instructions, change sharing, restore versions, connect Slack apps and add their own schedules. Schedules run as the person who adds them. A Slack connector runs as the person who asks, or as the person who connected it if they chose **Me, for everyone** (see [Chat from Slack](../slack/chat-from-slack#4-choose-how-it-behaves)). Only the owner chooses the managers: add people, then **Save managers**.

## Chat connectors

Let people start the agent from Slack. See [Chat from Slack](../slack/chat-from-slack).

## Sharing

![Sharing section with the Audience choices, the Smart groups and People fields, and the Run tool actions without waiting for approval option](/img/workflow-agents/manage-sharing.jpg)

People you share with use their own MCP access and see only their own runs. People without admin access find shared agents in their [Self Service](./self-service) console. **What this agent can do** lists the capabilities they get, such as **Web search** and **Memory**.

| Audience | Who can run it |
|----------|----------------|
| **Only me** | Nobody else can see or run it. |
| **Everyone in the organization** | Every current member, including people who join later. |
| **Specific groups and people** | The **Smart groups** and **People** you pick. Smart Groups follow membership changes; people are listed individually. |

**Run tool actions without waiting for approval** lets tasks started by people you share with run their tools straight away. Confirmations your MCP Gateway requires still pause the run. Switch it off to review every action.

Select **Save sharing** to apply.

## Schedules

![Schedules section with the Add a schedule form: Schedule name, Repeat, Scheduled task and the agent's inputs](/img/workflow-agents/manage-schedules.jpg)

Give the agent a recurring task. Each run uses the account of the person who added the schedule and the current published version.

1. Select **Add schedule**.
2. Enter a **Schedule name** and choose **Repeat**: **Every hour**, **Every day**, **Every week** or **Custom interval**.
3. Write the **Scheduled task** and fill in the agent's required inputs.
4. Select **Create schedule**.

The first run starts after one interval. Each run uses your usual model credits or provider billing, and tool actions may wait for your approval. Missed runs are skipped, and if a previous run is still working, the next occurrence is skipped too. Use **Pause schedule** and **Resume schedule** on an existing schedule.

## Versions

Every publish is a new revision, shown on the drawer as **Revision** followed by its number. Choose a **Version to restore**, then **Review version change**. New tasks and schedules use the restored version; runs already in progress finish with the version they started with. Your draft, sharing and previous results stay available.

## Agent controls

- **Disable agent** prevents new tasks and conversations for everyone. Active schedules pause, and ongoing runs stop before their next model or tool action. The definition, sharing and results stay available. Actions already sent to another app cannot be undone.
- **Delete agent** removes the published agent from everyone's workspace and revokes its access. Its schedules are deleted and this cannot be undone. Your private draft stays available but cannot republish the deleted agent. Previous run records follow your organization's [data retention](../../console/settings-data/data-retention) policy.
