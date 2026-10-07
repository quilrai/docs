---
sidebar_position: 8
sidebar_label: "Agents"
sidebar_custom_props:
  icon: Bot
---

# Agents

Agents lists every AI agent observed across your estate, and the skills, MCP
servers, system prompts, models and people behind each one. Open it from
**Observe > Agents**.

Source chips at the top show which sources contribute agents, for example
Azure AI Foundry, Copilot Studio, Endpoint discovered, Endpoint runtime, MCP
Gateway and OpenAI Compliance. The headline tiles are **Agents observed**,
**Observed calls**, **People** and **MCP reach** (with blocked calls).

## Agents

One row per application or agent: Source, Capabilities (observed and
declared), Calls, Users, Governance and Last seen. Use search and
**Filters** to narrow the list. Click a parent application to filter the list
to its child agents.

## Skills

Which skills agents use, and how widely. This tab is read-only usage evidence.
To install, configure or remove skills, use the
[Skills Library](../settings-ai-gateway/skills-library).

## MCP servers

MCP servers agents call: **Used by**, **Evidence**, **Calls**, **Users**,
**Tools** and **Blocked**. Use it to see which agents reach which servers, and
where calls are being blocked.

## System prompts

The system prompts observed for agents, with their size in tokens, potential
compression savings, risk, and the top suggestion for each. Use it to find
oversized or risky prompts. To act on compression savings, see
[Costs & Savings](./costs-and-savings).

## Users

People who run agents: the agents each person used, calls, blocked calls and
devices.

## Agent drawer

Click an agent to open its drawer. It has five tabs: **Overview**,
**Users**, **Dependencies & Calls**, **Activity** and **System prompt**. The
Overview shows the agent's identity, type, parent applications, sources, top
users and source instances.
