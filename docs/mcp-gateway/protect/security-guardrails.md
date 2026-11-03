---
sidebar_position: 6
sidebar_label: "Security guardrails"
sidebar_custom_props:
  icon: ShieldCheck
description: "Data risk and adversarial categories on tool arguments and tool results, with Block, Redact, Partial Redact and Monitor actions."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Security guardrails

Updated on 3 November 2026.

Scan what agents send to an MCP server and what the server sends back, and block, redact or flag sensitive data and attacks.

## Request and response {#request-and-response}

| Direction | What is scanned |
|---|---|
| **Request (tool arguments)** | The inputs sent when an agent calls a tool. |
| **Response (tool results)** | What the tool returns before the AI client sees it. |

## Actions {#actions}

| Action | What happens |
|---|---|
| **Block** | Stops the tool call or withholds the result. |
| **Redact** | Removes detected data and lets the payload continue. |
| **Partial redact** | Masks part of each match while retaining context. |
| **Monitor** | Lets the payload continue and records the detection. |

Choose the instructions for the mode that governs your MCP Gateway. See [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what happens to stored settings when the engine is on.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Configure it on the server

Open **Settings > AI Gateway > MCP Gateway**, then the server's **Configure > Guardrails** section.

![Classic Guardrails settings with default, request and response actions and category selection](/img/mcp-gateway/ui/settings-guardrails.png)

The **Actions** card has **Default**, **Request (tool arguments)**, and **Response (tool results)** selectors. Default starts as Monitor; choosing Default for a direction uses that value.

### Categories

Enable the data-risk and adversarial categories you need. Each category can have its own Request and Response action; Default uses the Actions card. The Coverage and action summaries show what is selected.

Click **Save settings** to apply. For differences by person or Smart Group, use [Group and user rules](./group-and-user-rules).

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine

Open **Govern > Policy Engine > MCP Gateway > Controls > Data & Adversarial Risks**. It has two sections:

| Section | What it sets |
|---|---|
| **Detection rules** | Selected findings, the request/response stage and an action for a matching call or result. |
| **Scan profile** | Which detectors run, category-specific actions, and the fallback action. |

1. Choose a recipe or start a blank rule in the appropriate section.
2. Choose **Applies to**, the data types or detectors, and the outcome.
3. Check **Reads as**, then **Save to draft**.
4. Use **Test > Try a situation** or **Replay activity** to check the candidate, then [review and publish](../../console/govern/author-simulate-and-publish).

Detection rules resolve a payload-wide action: the highest numeric priority wins, with the stricter action winning ties. For each finding, that action competes by priority with the scan profile's category-specific or fallback action. Do not assume every Block overrides every higher-priority rule.

Scan-profile settings resolve per detector and per category. On wins a detector tie, and the stricter category action wins an action tie; the default action is a fallback. Detectors run only when a rule or profile selects them. Without selected checks, nothing is scanned automatically.

Rules that select detectors or set scan-profile actions run before scanning. Put conditions on **Data found** in a separate detection rule, rather than making the scan depend on a finding it has not yet produced.

Open **Activity** for observed matches. Classic settings marked **Controlled by Policy Engine** are stored for use when the engine is off; **Edit anyway** does not change published policies.

</TabItem>
</Tabs>

## Where detections show

- **Overall analytics > Data & security** shows flagged request and response content in [MCP Gateway Insights](../monitor/analytics-and-insights).
- **Findings & Interactions** lists detections and supports input/output DLP filters.
- The server card's **Guardrails** chip opens its configuration.

## Related

- [Group and user rules](./group-and-user-rules) - more or less restrictive guardrail actions for a smart group or user.
- [Tool visibility](./tool-visibility) - turn tools off or require confirmation.
- [Detection models](../../console/govern/detection-models) - what counts as sensitive data or an adversarial prompt.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
