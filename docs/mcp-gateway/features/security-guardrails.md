---
sidebar_position: 4
sidebar_custom_props:
  icon: ShieldCheck
---

# Security Guardrails

Scan what agents send to an MCP server and what the server sends back, and block, redact or flag sensitive data and attacks.

Go to **Settings > AI Gateway > MCP Gateway** and click **Configure > Guardrails** on the server card.

![Guardrails section with Coverage, Request actions across categories, the Actions card (Default, Request, Response) and the Data risk categories table](/img/mcp-gateway/ui/settings-guardrails.png)

:::note Policy Engine
When the Policy Engine is on, data scan policies apply instead and this section is read-only. **Edit anyway** changes the values used only if the Policy Engine is turned off. See [MCP Gateway policies](../../policy-engine/mcp-gateway).
:::

## Request and response

| Direction | What is scanned |
|-----------|-----------------|
| **Request (tool arguments)** | The inputs an agent sends when it calls a tool. |
| **Response (tool results)** | What the tool returns before the agent sees it. |

## Actions

| Action | What happens |
|--------|--------------|
| **Block** | The tool call is stopped. |
| **Redact** | The detected data is removed and the call proceeds. |
| **Partial** (**Partial Redact** in the category lists) | Part of each match is masked and the rest stays visible for context. |
| **Monitor** | The call goes ahead and the detection is recorded. |

The **Actions** card sets the defaults:

| Setting | Meaning |
|---------|---------|
| **Default** | The action for any detection that has no more specific action. Starts as **Monitor**. |
| **Request (tool arguments)** | The action for detections in tool inputs. **Default** uses the setting above. |
| **Response (tool results)** | The action for detections in tool results. **Default** uses the setting above. |

## Categories

Select a category to scan for it, then optionally select its own **Request** and **Response** action. Leave a category on **Default** to use the **Actions** card.

| Group | Categories |
|-------|------------|
| **Data risk categories** | PII, PHI, PFI, PCI, Insurance, Auth Secrets, Device Network Online Identifiers, Telecom Subscriber Data, Employee HR Data |
| **Adversarial categories** | Prompt Injection Techniques, Jailbreak Techniques, Prompt Context Corruption, Semantic Adversarial Prompts, Social Engineering Prompts, Response Risks, Hateful Or Offensive Content, Violence And Harmful Content, Fraudulent Or Illegal Activity Content, System Guardrail And Security Disclosure, Security Exploit And Payload Enablement, Cybersecurity Frameworks And Standards Mention |

Each group shows how many categories are on, for example **3 of 9 on**. The **Coverage** card totals both groups and **Request actions across categories** shows how many categories use each action.

Click **Save settings** in the footer to apply your changes.

## Where detections show

- The **Stopped by guardrails** tile on the MCP Gateway page counts guardrail flags.
- The **Guardrails** chip on the server card opens this section.
- **Overall analytics > Analytics** shows **Blocked** and **Guardrail flags**.
- **Findings & Interactions** lists each detection, filterable by input and output DLP.

## Related

- [Group & User Rules](./group-user-rules) - more or less restrictive guardrail actions for a smart group or user.
- [Tools Management](./tools-management) - turn tools off or require confirmation.
- [MCP Gateway policies](../../policy-engine/mcp-gateway) - per data type actions under the Policy Engine.
