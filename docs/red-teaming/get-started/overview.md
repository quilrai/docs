---
sidebar_position: 1
sidebar_label: "Red Teaming overview"
sidebar_custom_props:
  icon: Target
description: "The four Red Teaming tools, the difference between testing the model behind a gateway app and testing the live app, shared concepts and prerequisites."
---

# Red Teaming overview

Red Teaming actively tests your LLM apps, MCP servers, agents, and models for weaknesses before attackers find them. It lives in the console under **Assessments**.

![Red Teaming in the console](/img/console-v2/pages/red-teaming.jpg)

<ConsolePath console="QuilrAI console" path={['Assessments', 'Red Teaming']} />

## The four tools

The Red Teaming page has one tab per tool.

| Tab | Target | What it tests | Output |
|-----|--------|---------------|--------|
| [LLM Intelligence Assessment](../assessments/llm-intelligence-assessment) | The model behind an LLM Gateway app (provider, model, system prompt, tools) | A fixed corpus of adversarial and benchmark suites (Prompt Attacks, Grounded Answering, Hallucination, and more) | Pass rate per suite, Guardian counterfactual, framework rollups, knowledge horizon |
| [MCP Threat Detection](../assessments/mcp-threat-detection) | An MCP server: a public repository and/or a live server | Static and dependency (CVE) scan, read-only tool-surface enumeration, threat model | A scan with findings and coverage |
| [Agentic Red Teaming](../assessments/agentic-red-teaming) | A live agent over HTTP or voice | Adaptive, multi-turn attacks, including tool abuse | Letter grade, risk score, findings, remediation |
| [Model Red Teaming](../assessments/model-red-teaming) | One model, or 2 to 8 models side by side | The same adaptive engine as Agentic Red Teaming, pointed at the model directly | Letter grade, risk score, findings; a campaign view when comparing |

## Model behind an app vs. the live app

The two most common choices test different things:

| | LLM Intelligence Assessment | Agentic Red Teaming |
|---|---|---|
| What is attacked | The model configured on an LLM Gateway app | Your deployed agent or app at its own HTTP or voice endpoint |
| How it is called | Directly at the provider, with the app's provider credentials, system prompt and tool definitions | Through the same endpoint your users call, so whatever sits in that path (including the gateway, if the app uses it) is tested |
| Gateway guardrails in the path | No. The run measures the raw model, so you can see how much protection the gateway needs to add. | Yes, if your app sends its traffic through the gateway |
| Use it to | Benchmark or compare models behind a gateway app | Test the live app or agent end to end before launch |

## Which one to use

- **Choosing or changing the model behind a gateway app**, or measuring how much protection the gateway adds: LLM Intelligence Assessment. The corpus is fixed, so runs before and after a change are comparable.
- **Before you approve or install an MCP server**: MCP Threat Detection.
- **Before you ship an agent, or after changing its prompt or tools**: Agentic Red Teaming.
- **Comparing candidate models on the same attacks**: Model Red Teaming.

## Shared concepts

| Concept | What it is |
|---------|------------|
| **Run** | One execution of an assessment against one target. LLM Intelligence Assessment lists them under **Recent runs** and **Results**; Agentic and Model Red Teaming under **Runs**; MCP Threat Detection under **Recent scans**. |
| **Finding** | A confirmed weakness with severity, framework mapping (OWASP, MITRE ATLAS, NIST AI RMF), evidence, and a recommended fix. |
| **Findings tracker** | Agentic and Model Red Teaming share a **Findings** sub-tab where you assign, track, and close findings. See [Runs, findings and schedules](../operate/runs-findings-and-schedules). |
| **Schedule** | Re-runs the same authorized Agentic or Model assessment on a cadence, from the **Schedules** sub-tab. |
| **Report** | The result of a run. See [Reading a report](./reading-a-report). |

Agentic and Model Red Teaming share the same sub-tabs (**New assessment**, **Runs**, **Findings**, **Schedules**) and the same [Attack library](../operate/attack-library) of 64 objectives.

## Prerequisites

| Tool | You need |
|------|----------|
| LLM Intelligence Assessment | An LLM Gateway app with a configured provider and model, and an **active Quilr key**. The form warns when the app has none. See [Applications and keys](../../llm-gateway/apps-and-providers/applications-and-keys). |
| MCP Threat Detection | A public repository URL and/or a reachable MCP server. |
| Agentic Red Teaming | An agent endpoint you are authorized to test (HTTP endpoint or voice agent). |
| Model Red Teaming | A model source. Models connected in **Settings › Models** appear as **Your models**; see [Providers and models](../../llm-gateway/apps-and-providers/providers-and-models). |

:::warning
Only test targets you own or are authorized to test. Agentic Red Teaming, Model Red Teaming, and MCP Threat Detection require an acknowledgement before a run starts.
:::

## Next steps

- [Reading a report](./reading-a-report)
- [Turn findings into detections](../operate/turn-findings-into-detections)
