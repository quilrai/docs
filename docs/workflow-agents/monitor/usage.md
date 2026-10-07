---
sidebar_position: 1
sidebar_label: "Usage"
sidebar_custom_props:
  icon: BarChart2
description: "The Usage tab: runs, completion rate, tool attempts and average duration per agent, the flow from work to outcome, and the run history."
---

# Usage

The **Usage** tab shows how an agent is doing for you over the last 30 days. Pick an **Agent** at the top; the refresh button reloads the numbers.

![Usage tab with the agent picker, the Runs, Completion rate, Tool attempts and Average duration tiles, and the Where your work goes flow](/img/workflow-agents/usage.jpg)

## Tiles

| Tile | What it counts |
|------|----------------|
| **Runs** | Your chat responses and tasks in the period, split into **Succeeded**, **Failed** and **Other outcomes**. |
| **Completion rate** | Succeeded out of finished runs; excludes active runs. |
| **Tool attempts** | Tool calls the agent attempted across the runs shown. |
| **Average duration** | From the finished runs shown; excludes queue time. |

## Where your work goes

A flow from **Work** (the kind of run, such as chat responses or tasks) through the agent to each **Outcome**. Ribbon width represents runs, not tokens or tool calls. Select an outcome to filter the run history below.

## Run history

Every run in the period, newest first, with **Conversation or task**, **Outcome**, **Started**, **Tool attempts**, **Duration** and **Open run** to see the full run.

:::tip
Agent tool calls go through your MCP Gateway like any other tool call, so they also appear in the [MCP Gateway](../../mcp-gateway) activity for that server.
:::
