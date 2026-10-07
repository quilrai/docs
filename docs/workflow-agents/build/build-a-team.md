---
sidebar_position: 3
sidebar_label: "Build a team"
sidebar_custom_props:
  icon: Users
description: "Combine two to six published agents under a lead model that merges their answers, running members at the same time or one after another."
---

# Build a team

A team combines published agents under a lead. Each member does its part, and the lead combines their answers into the one result people get back. A team runs from a console task, a chat, a Slack mention or a schedule, like any agent.

<ConsolePath console="QuilrAI Console" path={['Settings', 'AI Gateway', 'Workflow Agents']} action="Build a team" />

![Team builder with the Team assistant on the left, the Task, Add a member, Lead and Result canvas in the middle, and the Team name, deliverable and Before you publish checks on the right](/img/workflow-agents/build-a-team.jpg)

## Choose a pattern

Switch between the two patterns at the top of the builder:

| Pattern | How members work |
|---------|------------------|
| **At the same time** | Every member works on the task at once; the lead combines their answers. |
| **One after another** | Members take turns; each sees the earlier answers before adding its own. Use **Earlier** and **Later** to reorder them. |

## Add members

![Team builder with one member added, and the New member panel with Agent, Name on the canvas and Its part in this team](/img/workflow-agents/build-a-team-member.jpg)

Describe what the team should get done to the **Team assistant**, which picks members from agents you can already run, suggests new ones where nothing fits, and writes how the lead combines their answers. Or build on the canvas yourself: select **Add a member**, then set:

- **Agent**: a published agent you can run.
- **Name on the canvas**.
- **Its part in this team**: sent with the task, so the member knows what to focus on.

A team has two to six members.

## Set up the lead

Select **Lead** on the canvas and choose the model that combines the answers. The lead has no tools of its own: it reads every member's answer and writes the one result, in the format the lead is set to.

## Publish

Give the team a **Team name** and say **What this team delivers**. **Before you publish** checks that:

- The team has a name
- It has 2 to 6 members
- Every member is a published agent
- The lead has a model
- The lead knows how to combine answers

**Publish team** fixes each member to its current version, so later edits to a member do not change the team until you publish it again.

:::note
The team builder saves your draft as you work. A new team appears as a draft on **My agents** as soon as you add the first member.
:::
