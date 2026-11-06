---
sidebar_position: 1
sidebar_label: "Policy Engine overview"
sidebar_custom_props:
  icon: ListChecks
description: "Find gateway controls, understand how matching policies combine, and review what the Policy Engine governs."
console_path: [/policy, /policy/engine]
aliases: [policy engine, policy studio, quilrql, llm gateway policies, mcp gateway policies, gateway controls]
---

# Policy Engine overview

Updated on 3 November 2026.

Use the Policy Engine to decide who can use your gateways, what requests are checked, and what may return. Open **Govern > Policy Engine**, then choose **LLM Gateway** or **MCP Gateway**.

![LLM Gateway controls organized by access, checks, routing and responses](/img/gateway-updates-2026-11/llm-policy-controls.jpg)

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine']} />

## Policy workspaces {#the-four-surfaces}

The workspace selector shows **LLM Gateway**, **MCP Gateway**, **Endpoint Agent**, and **Cloud & SaaS**. This guide covers the two gateways. For other enforcement surfaces, see [Endpoint app policies](../../endpoint-agent/configure/app-policies) and [Browser controls](../../browser-extension/configure/browser-controls).

### Gateway workspaces {#llm-gateway-and-mcp-gateway}

Each gateway has its own engine status and these sections:

| Section | Use it to |
|---|---|
| **Controls** | Open a control area, read what happens today, start from a recipe, or manage configured rules. |
| **Policies** | Search and filter policies, inspect their scope and outcome, add a rule, or open **Edit technical source**. |
| **Test** | **Try a situation** or **Replay activity** before publishing. |
| **History** | Compare published versions and review what changed. |
| **Groups** (LLM Gateway only) | Rank smart groups and create virtual groups. The best-ranked group governs a person who is in several groups. See [Budgets for several groups](../../llm-gateway/cost-and-traffic/rate-token-and-budget-limits#budgets-for-several-groups). |

**POLICY ENGINE ON** means published policies govern that gateway. The header shows when it was updated. A control's status summarizes its configured scope; it is not proof that a particular request will match.

Open a control to see its default, how rules combine, and the rules already configured. Most panels have **Controls** and **Activity** tabs. Routing has **Routes**, **Failover defaults**, and **Activity**; Prompt Store also has a **Prompt Store** tab.

Edits saved to the draft do not change live traffic. Use **Review & publish** to publish the pending changes together. See [Author, simulate and publish](./author-simulate-and-publish).

### Browser controls {#browser-extension}

See [Browser controls](../../browser-extension/configure/browser-controls) for browser-specific conditions, actions, and modes.

### Endpoint Agent

See [App policies](../../endpoint-agent/configure/app-policies) for application monitoring and device policy configuration.

## Test a situation {#describe-a-request}

Open **Test > Try a situation**. For the LLM Gateway, describe the person, application, AI model, and request type. For the MCP Gateway, describe the person, server, tool, and operation. Add details that your rules depend on, then run the test and review the deciding rules.

Use **Replay activity** to compare the candidate with recent recorded traffic. Tests and replay do not change live behavior. See [Test and replay](./author-simulate-and-publish#4-simulate).

## How policies work

A policy has a name, a priority, one or more stages, conditions, and effects. A stage describes where it applies: request/response for LLM traffic, or session/discovery/request/response for MCP traffic. Those execution stages are separate from the question-based groups in **Controls**.

When several policies match, use the combination rule shown on the control:

| Control or setting | How matching rules combine |
|---|---|
| Gateway Access, MCP Server Access, tool access | Highest numeric priority wins; Deny wins ties. A higher-priority Allow can override a lower-priority Deny for that setting. Other checks still apply. |
| Allowed Models | Matching allowed lists combine. A model on any matching rejected list is rejected, regardless of priority. |
| Identity or conversation ID required | Highest priority wins; Required wins ties. |
| Allowed source IP ranges | Matching rules narrow access by intersecting their ranges. |
| Token-saving switches | Each switch resolves independently by priority; On wins ties. An Off exemption must outrank the On rule. |
| Human Confirmation | Highest priority wins; the stricter confirmation requirement wins ties. |
| Data-risk actions | The highest-priority matching action applies to the request, call, or result, with stricter actions winning ties. Non-blocking redaction and MCP scan-profile category actions have additional per-type rules; see the control guides. |
| Severity tags | The highest matching severity is reported, regardless of priority. Severity does not replace the configured action. |

Do not assume that a narrower audience always wins. Scope shortcuts seed a priority, but existing rules keep their stored priority. Inspect the rule and test overlapping cases before publishing.

Every policy also has a QuilrQL text form. Use **Policies > Edit technical source** when a visual control cannot express the condition or effect you need.

## Where each control is documented

### LLM Gateway controls {#llm-gateway-cards}

The groups follow a model request from access to returned response.

| Group | Control | Guide |
|---|---|---|
| Who can use AI? | Gateway Access; Allowed Models | [Gateway access and allowed models](../../llm-gateway/protect/gateway-access-and-allowed-models) |
| Who can use AI? | Identity & Network Trust | [Identity and network trust](../../llm-gateway/protect/identity-and-network-trust) |
| Who can use AI? | Model Visibility | [Model visibility](../../llm-gateway/protect/model-visibility) |
| Who can use AI? | Prompt Store & Enforcement | [Prompt store](../../llm-gateway/cost-and-traffic/prompt-store) |
| What should be checked? | Data & Adversarial Risks | [Security guardrails](../../llm-gateway/protect/security-guardrails), [Custom detections](../../llm-gateway/protect/custom-detections) |
| What should be checked? | Guardian Agent | [Guardian Agent](../../llm-gateway/protect/guardian-agent) |
| What should be checked? | Tool Controls | [Tool controls](../../llm-gateway/protect/tool-controls) |
| What should be checked? | Attachments | [Attachment scanning](../../llm-gateway/protect/attachment-scanning) |
| Which model and limits? | Routing Groups & Fallbacks | [Routing and failover](../../llm-gateway/cost-and-traffic/routing-and-fallbacks) |
| Which model and limits? | Budgets & Usage Limits | [Rate, token and budget limits](../../llm-gateway/cost-and-traffic/rate-token-and-budget-limits) |
| Which model and limits? | Token Savings | [Token saving](../../llm-gateway/cost-and-traffic/token-saving) |
| What may return? | Hallucination Protection | [Hallucination protection](../../llm-gateway/protect/hallucination-protection) |
| What may return? | Error Messages | [Error messages](../../llm-gateway/protect/error-messages) |

### MCP Gateway controls {#mcp-gateway-cards}

![MCP Gateway controls organized around connections, available tools, execution and results](/img/gateway-updates-2026-11/mcp-policy-controls.jpg)

| Group | Control | Guide |
|---|---|---|
| Who can connect? | MCP Server Access | [Server access](../../mcp-gateway/protect/server-access) |
| Who can connect? | OneMCP Features | [OneMCP](../../mcp-gateway/get-started/onemcp), [Tool lists](../../mcp-gateway/protect/tool-lists) |
| Who can connect? | Web Search Security | [Web search security](../../mcp-gateway/protect/web-search-security) |
| Who can connect? | Claims Forwarding | [Claims forwarding](../../mcp-gateway/protect/claims-forwarding) |
| Which tools are available? | Invocation & Discovery | [Tool visibility](../../mcp-gateway/protect/tool-visibility), [Group and user rules](../../mcp-gateway/protect/group-and-user-rules) |
| What can run? | Human Confirmation | [Human approval](../../mcp-gateway/protect/human-approval) |
| What can run? | Usage Quotas & Concurrency | [Quotas and concurrency](../../mcp-gateway/protect/usage-quotas-and-concurrency) |
| What can run? | Data & Adversarial Risks | [Security guardrails](../../mcp-gateway/protect/security-guardrails) |
| What may return? | Token Savings | [Token saving](../../mcp-gateway/protect/token-saving) |

For combinations not exposed by a visual control, use **Policies** and the technical source editor. See [MCP advanced policy reference](#mcp-advanced-policy-reference).

## MCP advanced policy reference

An effect is legal only on the stages that own it. The compiler rejects a rule that puts an effect on the wrong stage, so a quota cannot run at `session` and a cache mode cannot run at `response`.

### What you can match on

| Group | Fields |
|---|---|
| Caller | User email, user ID, user full name, smart groups, identity provider, client IP |
| Agent | Agent name, keyword, normalized and raw user agent, classification, matching registered agent keywords |
| Route | Route kind (`direct`, `onemcp`, `workflow`), route name, route source |
| MCP server | MCP ID, name, slug, transport, auth type, system MCP, tags |
| Operation | MCP method, operation kind |
| Tool | Tool name, type, tags, risk, and the `read_only`, `destructive`, `idempotent` and `open_world` annotations |
| Resource and prompt | Resource URI, template URI, name, MIME type; prompt name |
| Response | Whether the response succeeded, error code and message |
| Data found | Detections by exact catalog name |

### Effects by stage

| Surface | Stage | Effects |
|---|---|---|
| MCP Server Access | session | `mcp.access` allow or deny |
| Tools, Resources & Prompts | discovery, request, response | `tool.access`, `resource.access`, `prompt.access` |
| Human Confirmation | request | `tool.confirmation`: `none`, `required`, or `required_with_justification` |
| Data & Adversarial Risks | request, response | `dlp.action`, `dlp.category_actions`, `dlp.default_action`, `dlp.detectors`, `risk.level` |
| Usage Quotas & Concurrency | request | `quota.minute`, `quota.hour`, `quota.day`, `quota.window`, `quota.timezone`, `quota.dimensions`, `quota.id`, `concurrency.limit`, `concurrency.ttl_seconds`, `concurrency.dimensions` |
| OneMCP Features | session | `onemcp.dynamic_tools`, `onemcp.memory`, `tool_list.top_tools` (most-used tools listed), `tool_list.code` (`run_code` scripts); both `tool_list` effects are off unless a configuration turns them on |
| Identity & Managed Authentication | session | `claims.forward`, `token.profile`, credential references |
| Capability Cache & Isolation | session | `cache.mode`: `shared`, `tenant`, `private` or `none` |
| Token Savings | response | `token_saving.smart_json_compression`, `html_to_text`, `markdown_to_text`, `text_compression` |
| Web Search Security | response | `web_search.zia_timeout_seconds`, `excluded_domains`, `url_overrides`, `result_domain_action` |

Quota and concurrency dimensions are keyed by `tenant`, `user`, `agent`, `mcp`, `tool` or `group`, over a `fixed` or `rolling` window.

A session rule can combine several advanced effects, for example a locked-down posture for contractors:

<PolicyCard
  name="contractor_session_posture"
  stage="session"
  priority={800}
  when={[{ field: "Smart groups", op: "includes (ignoring case)", value: "Contractors" }]}
  then={[
    { effect: "OneMCP dynamic tools", value: "false" },
    { effect: "OneMCP memory", value: "deny" },
    { effect: "forward user claims", value: "false" },
    { effect: "cache mode", value: "private" },
  ]}
/>

## App settings under the Policy Engine

The engine switch is tenant-wide. While the LLM Gateway engine is on, these sections of every gateway app's settings follow published policies instead of their own values. Each shows **Controlled by Policy Engine**, with **View policies** (open the matching control) and **Edit anyway** (edit the stored legacy values). Values saved through **Edit anyway** are not enforced and are not added to policies; they become live only if the engine is disabled. For every transition (publish, rollback, Edit anyway, Management API writes, disable), see [What happens to classic settings](./switching-from-classic-settings#what-happens-to-classic-settings).

| App settings section | Policy Engine control |
|---|---|
| Security Guardrails (data, adversarial, precision detections) | Data & Adversarial Risks |
| Security Guardrails > Hallucination check | Hallucination Protection |
| Security Guardrails > Source IP restrictions | Identity & Network Trust |
| Guardian Agent | Guardian Agent |
| Attachments | Attachments |
| Rate and Token Limits | Budgets & Usage Limits > Request guards |
| Token Saving | Token Savings |
| Routing | Routing Groups & Fallbacks |
| Identity Aware (Enforce identity, Enforce conversation ID) | Identity & Network Trust |
| Prompt Store (Require system prompt from store, Universal system prompt) | Prompt Store & Enforcement |

Still managed in the app: LLM providers, custom detections, self-service, alerts, API keys, API integration and audit log. Gateway Access, Tool Controls, Budgets & Usage Limits, Model Visibility and Error Messages are configured in the engine. See [Switching from classic settings](./switching-from-classic-settings).

## Related

- [Author, simulate and publish](./author-simulate-and-publish)
- [Switching from classic settings](./switching-from-classic-settings)
- [Detection Models](./detection-models)
