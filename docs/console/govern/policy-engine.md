---
sidebar_position: 1
sidebar_label: "Policy Engine overview"
sidebar_custom_props:
  icon: ListChecks
---

# Policy Engine overview

The Policy Engine decides what happens when AI use crosses a line. It has one tab per enforcement surface, and each surface holds the controls enforced through that product.

![Policy Engine in the console](/img/console-v2/pages/policy-engine.jpg)

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine']} />

## The four surfaces

| Tab | Model | What you configure |
|---|---|---|
| **Browser Extension** | Controls table | Monitor and action controls for AI apps and websites in the browser |
| **LLM Gateway** | Card engine, versioned | Data, tools, models, identity, routing, spend and quality on every model call |
| **MCP Gateway** | Card engine, versioned | Server access, tool visibility and invocation, approvals, quotas and responses for MCP traffic |
| **Endpoint Agent** | Basic policies | Per-app detection and application configuration on managed devices |

### Browser Extension

A table of controls. Search, filter by **Posture** (AI Risks, Data Risks, Device Risks, IT Support, MFA Risks, Password Hygiene and more) and **Type**, sort by **Recently modified**, **Export**, or **Add control**. Each row shows the control name and use case, **Criticality**, **Mode** (Monitor or Action), a **Status** toggle, and who created and last updated it. The row menu offers **Edit** and **Duplicate**.

The edit form has three parts: control details (name, description, criticality from Very Low to Very High, mode), **When this happens** (the use case, fixed after creation, plus mandatory and additional conditions), and **Perform action**. See [Browser controls](../../browser-extension/configure/browser-controls).

### LLM Gateway and MCP Gateway

Both gateways use the same card-based engine:

- The header shows **ENGINE ON**, the live **Revision N**, how many cards are active, and **History**.
- Each card has **Configure** (edit in place) and a summary of what is set.
- **All edits from every card collect in one shared draft.** Nothing changes for live traffic until you review the draft and publish it. Publishing creates the next numbered revision.
- **History** lists published revisions, so you can review and roll back.
- **Advanced policies** holds rules that no card can express. They stay byte-preserved; card edits never rewrite them.

The MCP Gateway tab groups its cards by the stage where they take effect: **1 Session** (evaluated once per connection), **2 Discovery** (per listed capability), **3 Request** (before a call is dispatched) and **4 Response** (before the result returns).

See [Author, simulate and publish](./author-simulate-and-publish) for the draft and publish workflow.

### Endpoint Agent

The Endpoint Agent tab still runs in **Basic policies** mode, with **Detection configurations** and **Application configuration** sub-tabs and a card per supported AI app (ChatGPT, Claude, Cursor, Copilot, Gemini, DeepSeek, Ollama, LM Studio and more). A **Convert to Policy Engine** button moves it to the engine model. See [App policies](../../endpoint-agent/configure/app-policies).

## Describe a request

On the LLM Gateway tab, **What applies to one request** has a **Describe a request** button (on the MCP Gateway tab: **Describe a call**). Describe a request or session, for example the user, application, model, server or tool, and every card collapses to the value that would win for it, resolved from the shared draft the way the engine merges it. Use it to answer "what happens to this call?" before you publish.

## How policies work

Each card setting is stored as a policy: a sentence with a name, a priority, a stage, conditions and effects.

<PolicyCard
  name="block_request_secrets"
  stage="request"
  priority={900}
  when={[{ field: "data found", op: "is any of", value: "Auth & Secrets" }]}
  then={[
    { effect: "Sensitive data action", value: "block" },
    { effect: "Risk level", value: "critical" },
  ]}
/>

| Part | Meaning |
|---|---|
| Name | Stable identifier. Activity history is keyed by name, so renaming a live policy starts a fresh history. |
| Priority | Higher wins when several rules set the same single-value setting. New policies start at 500. |
| Stage | Where the rule runs: `request` and `response` for the LLM Gateway; `session`, `discovery`, `request` and `response` for the MCP Gateway. |
| Conditions | Who, which app, model, server, tool or metadata. No conditions means every call on that stage. |
| Effects | The settings that take effect. |

When several rules match:

- **Restriction wins.** A deny is not undone by a permissive rule elsewhere.
- **Priority settles single values.** A person rule sits above a Smart Group rule, which sits above an everyone default.
- **Risk only climbs.** A call's risk level rises to the highest any matching rule assigns.
- **Redaction is per data type.** `redact` and `partial-redact` apply only to the findings their own rule selected, so rules for different data types never compete. `block` stops the whole call.

Every policy also has an exact text form in QuilrQL, the policy language. Use the source view for review, diffing or bulk work.

## Where each control is documented

### LLM Gateway cards

| Card | Docs |
|---|---|
| Data & Adversarial Risks | [Security guardrails](../../llm-gateway/protect/security-guardrails), [Custom detections](../../llm-gateway/protect/custom-detections) |
| Guardian Agent | [Guardian Agent](../../llm-gateway/protect/guardian-agent) |
| Hallucination Protection | [Hallucination protection](../../llm-gateway/protect/hallucination-protection) |
| Gateway Access | [Gateway access and allowed models](../../llm-gateway/protect/gateway-access-and-allowed-models) |
| Identity & Network Trust | [Identity and network trust](../../llm-gateway/protect/identity-and-network-trust) |
| Tool Controls | [Tool controls](../../llm-gateway/protect/tool-controls) |
| Allowed Models | [Gateway access and allowed models](../../llm-gateway/protect/gateway-access-and-allowed-models) |
| Routing Groups & Fallbacks | [Routing and fallbacks](../../llm-gateway/cost-and-traffic/routing-and-fallbacks) |
| Budgets & Usage Limits | [Rate, token and budget limits](../../llm-gateway/cost-and-traffic/rate-token-and-budget-limits) |
| Rate, Token & Timeout Limits | [Rate, token and budget limits](../../llm-gateway/cost-and-traffic/rate-token-and-budget-limits) |
| Token Savings | [Token saving](../../llm-gateway/cost-and-traffic/token-saving) |
| Prompt Store and Enforcement | [Prompt Store](../../llm-gateway/cost-and-traffic/prompt-store) |

### MCP Gateway cards

| Stage | Card | Docs |
|---|---|---|
| 1 Session | MCP Server Access | [Server access](../../mcp-gateway/protect/server-access) |
| 1 Session | OneMCP Features | [OneMCP](../../mcp-gateway/get-started/onemcp) |
| 1 Session | Claims Forwarding | [Claims forwarding](../../mcp-gateway/protect/claims-forwarding) |
| 2 Discovery | Discovery Visibility | [Tool visibility](../../mcp-gateway/protect/tool-visibility) |
| 3 Request | Invocation | [Tool visibility](../../mcp-gateway/protect/tool-visibility), [Group and user rules](../../mcp-gateway/protect/group-and-user-rules) |
| 3 Request | Human Approval | [Human approval](../../mcp-gateway/protect/human-approval) |
| 3 Request | Usage Quotas & Concurrency | [Usage quotas and concurrency](../../mcp-gateway/protect/usage-quotas-and-concurrency) |
| 3 Request, 4 Response | Data & Adversarial Risks | [Security guardrails](../../mcp-gateway/protect/security-guardrails) |
| 4 Response | Token Savings | [Token saving](../../mcp-gateway/protect/token-saving) |
| 4 Response | Web Search Security | [Web search security](../../mcp-gateway/protect/web-search-security) |

Settings without a card (cache mode, managed authentication and credential references, web search tuning, response-stage access rules) live under **Advanced policies & classifications**.

## App settings under the Policy Engine

The engine switch is tenant-wide. While the LLM Gateway engine is on, these sections of every gateway app's settings follow published policies instead of their own values. Each shows **Controlled by Policy Engine**, with **View policies** (open the matching card) and **Edit anyway** (edit the saved legacy values, which are not enforced and apply again only if the engine is turned off).

| App settings section | Policy Engine card |
|---|---|
| Security Guardrails (data, adversarial, precision detections) | Data & Adversarial Risks |
| Security Guardrails > Hallucination check | Hallucination Protection |
| Security Guardrails > Source IP restrictions | Identity & Network Trust |
| Guardian Agent | Guardian Agent |
| Rate and Token Limits | Rate, Token & Timeout Limits |
| Token Saving | Token Savings |
| Routing | Routing Groups & Fallbacks |
| Identity Aware (Enforce identity, Enforce conversation ID) | Identity & Network Trust |
| Prompt Store (Require system prompt from store) | Prompt Store and Enforcement |

Still managed in the app: LLM providers, custom detections, self-service, alerts, API keys, API integration and audit log. Gateway Access, Tool Controls and Budgets & Usage Limits exist only in the engine. See [Switching from classic settings](./switching-from-classic-settings).

## Related

- [Author, simulate and publish](./author-simulate-and-publish)
- [Switching from classic settings](./switching-from-classic-settings)
- [Detection Models](./detection-models)
