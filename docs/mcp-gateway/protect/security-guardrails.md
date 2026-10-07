---
sidebar_position: 6
sidebar_label: "Security guardrails"
sidebar_custom_props:
  icon: ShieldCheck
description: "Data risk and adversarial categories on tool arguments and tool results, with Block, Redact, Partial Redact and Monitor actions."
---

# Security guardrails

Scan what agents send to an MCP server and what the server sends back, and block, redact or flag sensitive data and attacks.

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Guardrails"
/>

![Guardrails section with Coverage, Request actions across categories, the Actions card (Default, Request, Response) and the Data risk categories table](/img/mcp-gateway/ui/settings-guardrails.png)

### Request and response

| Direction | What is scanned |
|-----------|-----------------|
| **Request (tool arguments)** | The inputs an agent sends when it calls a tool. |
| **Response (tool results)** | What the tool returns before the agent sees it. |

### Actions

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

### Categories

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

## Going further with the Policy Engine

When the Policy Engine is on for the MCP Gateway, this section turns read-only and the **Data & Adversarial Risks** card (stages 3 and 4, Request and Response) in **Govern > Policy Engine > MCP Gateway** applies instead. **Edit anyway** changes the values used only if the Policy Engine is turned off. Edits join a shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

The card's effects are **Actions per sensitive data type**, **Default sensitive data action**, **Sensitive data detectors** and a risk level. Scenarios it supports that server settings cannot:

- **A different action per data type in one rule.** One map can block secrets, redact national IDs and monitor names on the same server. Each data type resolves independently, so a rule about one type never erases another rule's action on a different type. **Default sensitive data action** covers any enabled category the map does not name.
- **Scope by caller, agent or tool.** Apply stricter actions for one smart group, one AI client, or only the tools tagged as writes, instead of one setting for the whole server.
- **React to what was found.** A rule with a **data found** condition (detections by exact catalog name) can set the sensitive data action or raise the call's risk level, for example on a response from one tool.

<PolicyCard
  name="crm_data_actions"
  stage="request"
  priority={700}
  when={[{ field: "MCP name", op: "is", value: "Customer CRM" }]}
  then={[
    {
      effect: "Actions per sensitive data type",
      value: "3 data types",
      detail: [
        { label: "Auth & Secrets", value: "block" },
        { label: "Aadhaar Number / VID", value: "redact" },
        { label: "Name", value: "monitor" },
      ],
    },
    { effect: "Default sensitive data action", value: "monitor" },
  ]}
/>

:::note
**Actions per sensitive data type**, **Default sensitive data action** and **Sensitive data detectors** are evaluated before content is scanned, so a rule carrying one of them cannot also carry a **data found** condition. Put the data condition in a separate rule.
:::

## Related

- [Group and user rules](./group-and-user-rules) - more or less restrictive guardrail actions for a smart group or user.
- [Tool visibility](./tool-visibility) - turn tools off or require confirmation.
- [Detection models](../../console/govern/detection-models) - what counts as sensitive data or an adversarial prompt.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
