---
sidebar_position: 7
sidebar_label: "Agent platforms and frameworks"
sidebar_custom_props:
  icon: Workflow
description: "Install the Amazon Bedrock Agents, Google Vertex AI Agent Builder, AutoGen, CrewAI, LangChain, LangGraph and LiteLLM cards: the fields each Install drawer asks for, the data each brings in, and how to check it works."
---

# Agent platforms and frameworks

These Library cards register cloud agent platforms, agent frameworks and the LiteLLM proxy with Quilr. They discover agents, tools and models (**Pull inventory**) and bring the platform's runtime telemetry into Quilr (**Send logs**, which for these cards flows into Quilr).

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library']} />

## Set it up

1. On the **Library** tab, click **Install** on the card.
2. **Connection**: enter an **Integration name** (a tenant-visible name for this installation) and the card's own fields from the table below.
3. **Data access**: choose the capabilities to enable. At least one is required.
4. **Review**: check the settings and confirm. The configuration is encrypted and stored for your tenant, and the card moves to **Installed**.

## Fields and data per card

| Card | Category | Connection fields | Brings in |
|---|---|---|---|
| **Amazon Bedrock Agents** | Cloud agent platform | **AWS account alias**; **AWS region** (US East (N. Virginia), Europe (Frankfurt), Asia Pacific (Mumbai)) | Bedrock agents, action groups, knowledge bases and runtime activity |
| **Google Vertex AI Agent Builder** | Cloud agent platform | **Google Cloud project label**; **Google Cloud region** (US Central, Europe West, Asia South) | Vertex AI agents and their runtime telemetry |
| **LangChain** | Agent framework | **Environment** (Production, Staging, Development); **Telemetry handoff** (SDK callback, OpenTelemetry, HTTP collector) | Chain and agent telemetry, tools and model dependencies |
| **LangGraph** | Agent framework | **Environment**; **Telemetry handoff** | Graph run telemetry, graphs, nodes, tools and model usage |
| **CrewAI** | Agent framework | **Environment**; **Telemetry handoff** | Crew execution telemetry, agents, tasks and tools |
| **AutoGen** | Agent framework | **Environment**; **Telemetry handoff** | Multi-agent conversation telemetry, agents and tools |
| **LiteLLM** | LLM gateway | **Proxy deployment label**; **Environment** | Proxy telemetry, routed providers and models |

For the cloud platforms, **Pull inventory** is the primary capability and **Send logs** is additional. For the frameworks and LiteLLM, **Send logs** is primary and **Pull inventory** is additional.

## Check that it works

- The card shows **INSTALLED** on the **Installed** tab. An error badge means it needs attention; open it to see the error.
- Discovered agents, tools and models appear in [Inventory](../../console/observe/inventory) and [Agents](../../console/observe/agents), and activity appears in [Findings & Interactions](../../console/observe/findings-and-interactions).
- To change the fields or capabilities later, click **Configure** on the installed card. **Uninstall** removes it.

:::tip
To also apply Quilr's guardrails to model traffic from these frameworks, point them at the [LLM Gateway](../../llm-gateway). That works independently of these cards.
:::

## Related

- [How integrations work](../get-started/how-integrations-work)
- [Azure AI Foundry](./azure-ai-foundry) and [Microsoft Copilot Studio](./microsoft-copilot-studio) for cloud agent platforms with dedicated connectors
