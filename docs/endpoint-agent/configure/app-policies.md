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

The **Convert to Policy Engine** button moves the Endpoint Agent from Basic policies to the Policy Engine model used by the gateways. It is separate from the LLM Gateway and MCP Gateway switches. The header shows **Basic policies** before conversion and **Engine on** with the active revision after it.

:::warning Not ready for general use
Endpoint Agent controls are still changing. Keep using Basic policies, and do not convert yet even if your console shows the button, until QuilrAI confirms the Endpoint Agent is ready for your tenant (see [Moving from Console V1, phase 2](../../console/get-started/moving-from-console-v1#phase-2-the-device-sensors)). Before converting:

- Get that confirmation from your QuilrAI representative.
- Have policy update access; the same access is needed to disable it again.
- Review your Basic policies on both sub-tabs, since the conversion is built from what is there now.
:::

The button appears only when Policy Engine management for the Endpoint Agent is enabled for your organization and session. If you do not see it, your tenant stays on Basic policies; ask your Quilr contact about availability.

1. Select **Convert to Policy Engine**, then **Review conversion**. Quilr builds a read-only review of your current Basic policies. Nothing changes yet.
2. Review the result: **Scopes reviewed**, **Converted policies**, **Preserved settings** and **Attention items**, with the **Generated rules** and **Scope-by-scope changes**. Check every scope and warning marked **Needs attention**. Use **Copy policy** to keep the generated policy.
3. Under **Confirm your review**, tick both confirmations, then **Enable new Policy Engine**. The reviewed conversion becomes revision 1, and Basic policies are frozen.
4. From then on, make changes as Policy Engine drafts and publish them as new revisions. Check [Findings and interactions](../../console/observe/findings-and-interactions) to confirm enforcement matches what you had before.

**Disable Policy Engine** returns to Basic policies. The console states that Basic detection configurations resume controlling enforcement and that changes made in the Policy Engine are not copied back to them.

If the review reports **Detailed comparison unavailable**, the Endpoint converter has not returned the comparison needed to enable it. Retry later. For how the gateway conversions work, see [Switching from classic settings](../../console/govern/switching-from-classic-settings).
