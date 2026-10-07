---
sidebar_position: 1
sidebar_label: "Endpoint Agent overview"
sidebar_custom_props:
  icon: Bot
---

# Endpoint Agent overview

The QuilrAI Endpoint Agent discovers and governs AI use that happens outside the browser: desktop AI apps, coding agents, local models, and the MCP servers and skills they use. It runs as a background service on macOS and Windows and syncs what it finds to the QuilrAI console.

## What it discovers and governs

| Area | What the agent does |
| --- | --- |
| Desktop AI apps | Finds installed and running AI apps (for example ChatGPT, Claude, Copilot, Gemini) and applies per-app policies. |
| Coding agents | Discovers tools such as Cursor and Claude Code, plus their hooks, plugins, and configuration files. |
| Local models | Detects local model runtimes such as Ollama and LM Studio, and downloaded models. |
| MCP servers and skills | Inventories MCP server configurations and agent skills on the device. |
| Network monitoring | Inspects AI traffic with TLS inspection, runs DLP on requests and responses, and can block or ask for justification. See [Network monitoring](../how-it-works/network-monitoring). |
| Process mapping | Maps running processes to known applications and enforces allow, block, quarantine, or justify policies. See [Process mapping](../how-it-works/process-mapping). |

## Where the data shows up

| Console area | What you see |
| --- | --- |
| **Inventory** | Apps, models, MCP servers, skills, plugins, and hooks discovered on endpoints. See [Inventory](../../console/observe/inventory). |
| **Agents** | Agents observed on endpoints (sources Endpoint discovered and Endpoint runtime). See [Agents](../../console/observe/agents). |
| **Findings** | DLP findings and enforcement outcomes from endpoint traffic. See [Findings and interactions](../../console/observe/findings-and-interactions). |
| **Users › Endpoint deployment** | Which workstations run the agent, its version and status. See [Deployment and status](../deploy-and-operate/deployment-and-status). |
| **Skills Library › Discovered** | Skills seen on endpoints, with apps, devices, scope, and risk. See [Skills Library](../../console/settings-ai-gateway/skills-library). |

## Get started

1. Check the [requirements](./requirements) for your endpoints.
2. Get the agent package from your QuilrAI representative and [roll it out](../deploy-and-operate/deployment-and-status).
3. Review [agent settings](../configure/agent-settings) and set [app policies](../configure/app-policies).
4. Keep the [kill switch](../deploy-and-operate/agent-kill-switch) procedure handy for incidents.

:::note
The Endpoint Agent is a separate package from the [Browser Extension](../../browser-extension/get-started/overview). Deploy both for full coverage of browser and desktop AI use.
:::
