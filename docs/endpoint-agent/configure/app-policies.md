---
sidebar_position: 2
sidebar_label: "App policies"
sidebar_custom_props:
  icon: Scale
description: "Per-app detection and application configuration for the Endpoint Agent, and the readiness of Convert to Policy Engine."
---

# App policies

App policies decide how the Endpoint Agent detects and acts on sensitive data in each AI application. They live on the **Endpoint Agent** tab of the Policy Engine. For how the Policy Engine works across surfaces, see [Policy Engine](../../console/govern/policy-engine).

<ConsolePath console="QuilrAI console" path={['Policy Engine', 'Endpoint Agent']} />

The Endpoint Agent tab runs in **Basic policies** mode: you configure each application on its own card. The tab has two sub-tabs, **Detection configurations** and **Application configuration**.

## Detection configurations

This sub-tab shows how the agent detects and acts on sensitive data in each application, with a count of active configurations. It lists the supported endpoint applications, for example ChatGPT, Claude, Cursor, GitHub Copilot, Microsoft Copilot, Gemini, DeepSeek, Grok, Slack, Ollama, and LM Studio.

Each application card shows:

| Card area | What it covers |
| --- | --- |
| **Types** | The interaction types configured for the app, such as **Chat**, **File upload**, **Chat anonymous**, and **Plugin**. |
| **Monitoring** | Whether the app is monitored on the desktop, in the browser, or both, and the desktop platforms covered (macOS, Windows). |
| **Guardrails** | The action per sensitive-data category, for example Monitor, Justify, mandatory justification, or Block. |
| **File restrictions** | Rules for files shared with the app. |
| **Group & user rules** | Which smart groups and users the configuration applies to. |
| **Monitored browsers** | The browsers in which the app's web version is monitored. |
| **Action counts** | How many rules justify, require mandatory justification, or monitor. |

## Application configuration

Use this sub-tab to set what applications are allowed to do on endpoints. It works with [process mapping](../how-it-works/process-mapping), which enforces execution policies (allow, block, quarantine, justify) on discovered applications.

## Example: coach on PII in ChatGPT

1. Open **Detection configurations** and find the **ChatGPT** card.
2. Open **Guardrails**. Set PII to **Justify** so users are coached and asked for a reason. Use **Block** for categories such as Auth & Secrets only after you have reviewed the findings, or start everything in **Monitor**.
3. Open **Group & user rules** and scope the configuration to a pilot smart group.
4. Check the results in [Findings and interactions](../../console/observe/findings-and-interactions) before widening the scope.

Policy changes reach agents without a restart. See [Backend connectivity](../how-it-works/backend-connectivity).

## Convert to Policy Engine

The **Convert to Policy Engine** button moves the Endpoint Agent from Basic policies to the Policy Engine model used by the gateways. Your QuilrAI representative can help you plan the conversion.
