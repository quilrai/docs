---
sidebar_position: 2
sidebar_custom_props:
  icon: BrainCircuit
---

# LLM Gateway Policies

Govern data, tools, models, identity, spend and quality on every model call.

Open **Policy Engine > LLM Gateway**. The workspace shows twelve control cards. Edits from every card collect in one shared draft until you review and publish them as a single revision. **Describe a request** collapses every card to the value that would win for one request you describe.

![Policy Engine LLM Gateway workspace with the Engine on and Revision badges, the Gateway controls header, Describe a request, and the Data & Adversarial Risks and Guardian Agent cards](/img/llm-gateway/ui/policy-llm-gateway-controls-overview.png)

## Two decision points per call

The document is evaluated twice for a single model call.

<StepFlow steps={[
  {
    label: "Your application",
    items: [
      "Model request",
    ],
  },
  {
    label: "on request",
    items: [
      "Access",
      "Identity",
      "Tools",
      "Models",
      "Routing",
      "Limits",
      "Budgets",
      "Token savings",
      "Data scan",
    ],
  },
  {
    label: "Model provider",
    items: [
      "Upstream call",
    ],
  },
  {
    label: "on response",
    items: [
      "Data scan",
      "Hallucination",
    ],
  },
]} />

Controls that shape the outbound call run **on request**. Controls that judge
what came back run **on response**. Data inspection runs on both: on request it
catches what your users send, on response it catches what the model returns.

## What you can match on

| Condition | Matches |
|---|---|
| Application | The gateway application. This is how a policy is scoped to one app, and the condition the automatic conversion always writes. |
| Application method type | API surface in use: `chat`, `responses`, `assistants`, `embeddings`, `rerank`, `tts`, `stt`, `text`, `bedrock`, `vertex`, `copilot`, `sdk_check`. |
| User email | The identified caller. |
| Smart groups | The caller's Quilr Smart Groups, the gateway's own runtime groups. These are distinct from console access-control groups and are matched ignoring case. |
| Requested model | The model the caller asked for. |
| Tool name, tags, arguments | The tool call under evaluation, its tags, and its individual argument values. |
| Request metadata | Your own metadata sent on the call: environment, cost centre, ticket ID, anything you pass. |
| Data found | Detections by exact catalog name, with `is any of`, `is all of` or `is none of`, and an optional occurrence threshold. |

## The twelve control surfaces

Every setting belongs to exactly one card, and the workspace is those twelve
cards. Monitor, redact and block are settings inside a card, never separate
cards. Each card has its own page with screenshots and every setting; see also
[Workspace Tools](./llm-controls/workspace-tools) for Describe a request,
History and Advanced policies.

| Surface | Stage | What it controls |
|---|---|---|
| [Data & Adversarial Risks](./llm-controls/data-and-adversarial-risks) | request, response | PII, PHI, financial data, secrets, prompt injection, jailbreaks, custom detections. Actions: `monitor`, `partial-redact`, `redact`, `block`. |
| [Guardian Agent](./llm-controls/guardian-agent) | request | Dependency security checks, latest-version suggestions, task-adherence enforcement with a sensitivity and a nudge or block action. |
| [Hallucination Protection](./llm-controls/hallucination-protection) | response | Scores non-streaming responses and enforces above a confidence threshold between 0 and 1. The lowest matching threshold applies. |
| [Gateway Access](./llm-controls/gateway-access) | request | Allow or deny the whole model request by application, person, group, model or metadata. |
| [Identity & Network Trust](./llm-controls/identity-and-network-trust) | request | Require an identified caller and a conversation ID; restrict traffic to approved CIDR ranges. |
| [Tool Controls](./llm-controls/tool-controls) | request | Allow or deny tool calls on name, type, tags, risk or annotations, independently of data handling. |
| [Allowed Models](./llm-controls/allowed-models) | request | The models matching traffic may use. |
| [Routing Groups & Fallbacks](./llm-controls/routing-groups-and-fallbacks) | request | Weighted routing groups and ordered provider fallback chains. |
| [Budgets & Usage Limits](./llm-controls/budgets-and-usage-limits) | request | Spend and usage allowances by metric, grouped per user, application or model, over calendar, rolling or lifetime periods. |
| [Rate, Token & Timeout Limits](./llm-controls/rate-token-timeout-limits) | request | Concurrency, request rate, token ceilings and timeouts, application-wide and per model. |
| [Token Savings](./llm-controls/token-savings) | request | JSON compression, HTML and Markdown to text, text compression before the provider call. |
| [Prompt Store and Enforcement](./llm-controls/prompt-store-enforcement) | request | Require matching requests to use an approved system prompt. Also opens the Global Prompt Store. |

## App settings under the Policy Engine

The Policy Engine switch is tenant-wide, not per app. While it is on, seven sections of every app's settings follow published policies instead of their own values. Those sections carry the Policy Engine icon, and the app settings show which revision is live.

![App settings with the Policy Engine active, Revision 54 pill, a banner explaining that marked sections follow published policies, and the Policy Engine icon on Routing, Security Guardrails and Guardian Agent](/img/llm-gateway/ui/app-settings-policy-engine-banner.png)

| App settings section | Followed instead | Policy Engine card |
|----------------------|------------------|--------------------|
| Security Guardrails (data risks, adversarial risks, precision detections) | Guardrail policies | Data & Adversarial Risks |
| Security Guardrails > Hallucination check | Guardrail policies | Hallucination Protection |
| Security Guardrails > Source IP restrictions | Guardrail policies | Identity & Network Trust |
| Guardian Agent | Guardian Agent policies | Guardian Agent |
| Rate and Token Limits | Rate and token limit policies | Rate, Token & Timeout Limits |
| Token Saving | Token saving policies | Token Savings |
| Routing | Routing policies | Routing Groups & Fallbacks |
| Identity Aware (Enforce identity, Enforce conversation ID) | Identity policies | Identity & Network Trust |
| Prompt Store (Require system prompt from store) | Prompt Store policies | Prompt Store and Enforcement |

Each governed section shows: "**Controlled by Policy Engine.** Live requests follow the published policies. These are the legacy settings saved when the Policy Engine was turned on; they apply again only if it is turned off." It offers two buttons:

| Button | What it does |
|--------|--------------|
| **View policies** | Opens the matching card in the Policy Engine. Change live behavior here. |
| **Edit anyway** | Unlocks the legacy values for editing. Saved values are **not enforced** and are not copied into policies. They take effect only if the Policy Engine is turned off. |

**Still managed in app settings:** LLM Providers, Custom Detections, Self-Service, Alerts, API Keys, API Integration and Audit Log. Identity sources (identity header mode, allowed user domains, JWT verification) and each app's own prompts are also still set in the app.

**Policy-only controls** with no app settings section: Gateway Access, Tool Controls and Budgets & Usage Limits. **Allowed Models** narrows the models an app's providers already serve.

**Global Prompt Store:** the **Prompt Store** button on the **Prompt Store and Enforcement** card opens one prompt library for the whole organization, reusable by every app. Edits apply immediately, outside the draft and publish cycle. See [Global Prompt Store](../llm-gateway/features/prompt-store#global-prompt-store-v2-console) and [Identity Aware in the Policy Engine](../llm-gateway/features/identity-aware#identity-aware-in-the-policy-engine-v2-console).

Turning the engine on converts the current app settings into revision 1, and turning it off restores the settings exactly as they were at that moment. See [Switching from Settings](./switching-from-settings).

## Protecting data

### Block secrets everywhere

<PolicyCard
  name="block_request_secrets"
  stage="request"
  priority={900}
  when={[{ field: "data found", op: "is any of", values: ["Auth & Secrets"] }]}
  then={[
    { effect: "Sensitive data action", value: "block" },
    { effect: "Risk level", value: "critical" },
  ]}
/>

No scope condition, so it covers every request the gateway sees. A high
priority keeps it above narrower, more permissive rules.

### Redact personal data in responses

<PolicyCard
  name="redact_response_personal_data"
  stage="response"
  priority={750}
  when={[
    { field: "Application method type", op: "is any of", values: ["chat", "responses", "assistants", "+4"] },
    { field: "data found", op: "is any of", values: ["Personally Identifiable Information (PII)"] },
  ]}
  then={[
    { effect: "Sensitive data action", value: "redact" },
    { effect: "Risk level", value: "high" },
  ]}
/>

Use `partial-redact` instead to mask only part of a value, the usual choice for
financial data where the last four digits still need to be readable.

### Introduce a detection safely

<PolicyCard
  name="monitor_selected_request_data"
  stage="request"
  priority={200}
  when={[
    { field: "Application method type", op: "is any of", values: ["chat", "responses", "assistants", "sdk_check"] },
    { field: "data found", op: "is any of", values: ["Email Address", "Phone Number"] },
  ]}
  then={[
    { effect: "Sensitive data action", value: "monitor" },
    { effect: "Risk level", value: "low" },
  ]}
/>

Publish on `monitor`, read a week of activity, then raise it. A low priority
keeps it clear of real enforcement rules.

### Stop prompt attacks at ingress

<PolicyCard
  name="block_prompt_attacks_at_ingress"
  stage="request"
  priority={1000}
  when={[
    { field: "data found", op: "is any of", values: ["Prompt Injection Techniques", "Jailbreak Techniques"] },
  ]}
  then={[
    { effect: "Sensitive data action", value: "block" },
    { effect: "Risk level", value: "very_critical" },
  ]}
/>

Adversarial detections are ordinary data types, so prompt-attack defence has
the same shape as secrets defence.

## New data rule

On the **Data & Adversarial Risks** card, **Add rule** opens the New data rule dialog.

![New data rule dialog with a detection line set to at least 1 finding, Monitor action, Request stage, the Choose types picker, and the Scan tool-call arguments option](/img/llm-gateway/ui/policy-new-data-rule-detection-lines.png)

| Part | Options |
|------|---------|
| **Applies to** | Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Prompt complexity, Prompt text, Tool, Source network, or Except. Every chip must match; values accept `*` and `?`. For "A or B", add a second configuration or an any-of group. |
| **Detection lines** | Each line picks data types, a findings threshold (**at least** N, default 1), an action and a stage. Add more lines with **+ Add line**. |
| **Action** | **Monitor** (default), **Partial redact**, **Redact**, **Block**. |
| **Stage** | **Request** (default), **Response**, **Both**. |
| **Tool boundary** | **Scan tool-call arguments** judges each tool call's arguments on their own. Only Monitor and Block apply. |
| **Severity** | Not set, Very low, Low, Medium, High, Critical, Very critical. Reported for ranking in dashboards, exports and alerts; it never changes the action. |
| **More options** | Priority, extra rules, metadata and content conditions, raw QuilrQL. |

A configuration scoped to **Everyone** has priority 500. Narrower scopes such as People, Smart group or Application win over it. Highest priority wins per data type, and **Block** on any line stops the whole request. Response redaction and blocking apply only where the gateway holds the full response; streamed responses are scanned and tagged, not changed.

### Choosing data types

**Choose types…** lists every category. A line can name a whole category, individual types, or custom detections; several on one line match any of them.

![Data type picker with a search box and the PII category expanded to its individual types](/img/llm-gateway/ui/policy-data-type-picker.png)

| Category | Types |
|----------|-------|
| Personally Identifiable Information (PII) | 34 |
| Protected Health Information (PHI) | 15 |
| Payment and Financial Information (PFI) | 18 |
| Protected Card Information (PCI) | 4 |
| Insurance Data | 2 |
| Auth & Secrets | 8 |
| Code Scripts and Queries | 12 |
| Device, Network & Online Identifiers | 8 |
| Telecom Subscriber Data | 16 |
| Employee / HR Data | 12 |
| Adversarial categories (Prompt Injection Techniques, Jailbreak Techniques, Response Risks and the other 10) | Whole category only |
| Custom | Your tenant's [custom detections](../llm-gateway/features/custom-intents) |

The category list and descriptions match the app-level [Security Guardrails](../llm-gateway/features/security-guardrails).

### Detection models

**Policy Engine > Detection Models** sets the tenant's default risk level for each data category and turns adversarial categories on or off. **Detection library** and **Detection Model builder** add custom models.

![Detection Models Data Risks tab listing each category with its subcategory count, risk level and View and test action](/img/llm-gateway/ui/policy-detection-models-data-risks.png)

![Detection Models AI Adversarial Risks tab with cards for each category showing technique count and default risk](/img/llm-gateway/ui/policy-detection-models-adversarial-risks.png)

## Several data types, several actions

A configuration on the Data & Adversarial Risks card holds as many **data
rules** as you need. Each rule picks its own data types and its own action;
they all share the configuration's scope and priority. **Add data rule** adds
another.

<PolicyCard
  name="support_copilot_data_actions"
  stage="request"
  priority={700}
  rules={[
    {
      when: [
        { field: "Application", op: "is", value: "Support Copilot" },
        { field: "data found", op: "is any of", value: "Aadhaar Number / VID" },
      ],
      then: [
        { effect: "Sensitive data action", value: "redact" },
        { effect: "Risk level", value: "high" },
      ],
    },
    {
      when: [
        { field: "Application", op: "is", value: "Support Copilot" },
        { field: "data found", op: "is any of", value: "Name" },
      ],
      then: [{ effect: "Sensitive data action", value: "monitor" }],
    },
    {
      when: [
        { field: "Application", op: "is", value: "Support Copilot" },
        { field: "data found", op: "is any of", value: "Auth & Secrets" },
      ],
      then: [
        { effect: "Sensitive data action", value: "block" },
        { effect: "Risk level", value: "critical" },
      ],
    },
  ]}
/>

One request carrying an Aadhaar number, a customer name and an API key has the
Aadhaar redacted, the name left alone but recorded, and the whole call refused
because of the key. Adding a rule copies the scope from the rule above it, so
you only pick the data types and the action.

:::tip Actions are scoped to the data each rule selected
`redact` and `partial-redact` rewrite only the findings their own `data found`
condition selected. The Aadhaar rule redacts Aadhaar numbers; it does not touch
the name beside them. A `monitor` rule leaves its own findings alone and cannot
suppress another rule's redaction.

A finding that no rule selects is left unchanged. Where two rules select the
same finding, the higher policy priority wins, and at equal priority the more
restrictive action wins. Rules inside one configuration share a priority, so
they never compete with each other.
:::

:::warning Block is a decision about the call
`block` stops the whole request rather than stripping the finding out of it.
`redact`, `partial-redact` and `monitor` all operate finding by finding.
:::

Use separate configurations instead when the rules need different scopes or
priorities, for example one for an application and another for a Smart Group
exception. Rules that share a scope belong in one configuration.

## Governing tool calls

Tool Controls decides whether a call may proceed at all, separately from what
data it carries, so an agent keeps its read tools while losing its dangerous
ones.

<PolicyCard
  name="deny_public_repository_creation"
  stage="request"
  priority={950}
  when={[
    { field: "Tool name", op: "is", value: "create_repository" },
    { field: "Tool arguments . visibility", op: "is", value: "public" },
    {
      group: "any",
      rows: [
        { field: "Tool arguments . owner_type", op: "is", value: "organization" },
        { field: "Tool tags", op: "has entry", value: "write" },
      ],
    },
  ]}
  then={[
    { effect: "Tool call access", value: "deny" },
    { effect: "Risk level", value: "high" },
  ]}
/>

<PolicyCard
  name="block_secrets_in_tool_arguments"
  stage="request"
  priority={925}
  when={[
    { field: "Application method type", op: "is any of", values: ["chat", "responses"] },
    { field: "Tool name", op: "is set" },
    { field: "data found", op: "is any of", value: "Auth & Secrets" },
  ]}
  then={[
    { effect: "Sensitive data action", value: "block" },
    { effect: "Risk level", value: "critical" },
  ]}
/>

`is set` is a presence test needing no value. It narrows the rule to calls
carrying a tool invocation, leaving ordinary chat traffic alone.

## Denying access

Gateway Access rejects the whole call before any model is contacted: no tokens
spent, no provider round trip, and the data rules never run because the request
never proceeds.

### Deny a person completely

<PolicyCard
  name="deny_offboarded_users"
  stage="request"
  priority={1000}
  when={[{ field: "User email", op: "is any of", values: ["j.doe@acme.com", "r.patel@acme.com"] }]}
  then={[
    { effect: "Request access", value: "deny" },
    { effect: "Risk level", value: "critical" },
  ]}
/>

One condition, no application scope, so these people are refused on every
gateway application, every model and every method. Use this shape while a
leaver's credentials are still being revoked upstream.

### Deny a group for particular models

<PolicyCard
  name="deny_frontier_models_to_interns"
  stage="request"
  priority={800}
  when={[
    { field: "Smart groups", op: "includes (ignoring case)", value: "Interns" },
    { field: "Requested model", op: "is any of", values: ["claude-opus-4", "gpt-4.1", "o3"] },
  ]}
  then={[
    { effect: "Request access", value: "deny" },
    { effect: "Risk level", value: "medium" },
  ]}
/>

Interns keep full gateway access and are refused only when they reach for an
expensive frontier model. Swap the group row for `User email is any of` to do
the same for one person.

### The allow-list alternative

<PolicyCard
  name="restrict_interns_to_small_models"
  stage="request"
  priority={700}
  when={[{ field: "Smart groups", op: "includes (ignoring case)", value: "Interns" }]}
  then={[{ effect: "Allowed models", values: ["gpt-4.1-mini", "claude-haiku-4.5"], tone: "info" }]}
/>

Same intent, opposite construction. The card above denies three named models
and must be edited every time a new frontier model appears; this one names the
two models Interns may use, so anything new is excluded by default. Prefer this
shape unless you specifically need the denial recorded as a blocked call.

### Everyone except

<PolicyCard
  name="finance_copilot_platform_team_only"
  stage="request"
  priority={850}
  when={[
    { field: "Application", op: "is", value: "Finance Copilot" },
    { field: "Smart groups", op: "does not include (ignoring case)", value: "Finance Platform" },
  ]}
  then={[
    { effect: "Request access", value: "deny" },
    { effect: "Risk level", value: "high" },
  ]}
/>

A negated membership test turns one rule into a default-deny for an
application. Anybody outside Finance Platform is refused, and new joiners are
covered the moment they are added to the group.

### Choosing how to stop a call

| To stop a call | Use | What the caller sees |
|---|---|---|
| Refuse it outright | Gateway Access `deny` | Rejected before any provider is contacted. No tokens, no cost, counted as a blocked call. |
| Narrow the choice | Allowed Models | Only the listed models are available. Anything new is excluded until you add it. |
| Stop one tool | Tool Controls `deny` | The call proceeds; that tool invocation does not. |
| Stop the content | Sensitive data action `block` | Stopped only when a detection fires. The same person's clean requests still run. |

## Runtime, routing and limits

Several cards can contribute to one configuration, giving a whole operating
profile in a single sentence.

<PolicyCard
  name="secure_coding_routes"
  stage="request"
  priority={700}
  when={[
    { field: "Application method type", op: "is any of", values: ["chat", "responses"] },
    { field: "Requested model", op: "matches pattern", value: "*code*" },
  ]}
  then={[
    { effect: "Guardian", value: "true" },
    { effect: "Dependency security check", value: "true" },
    { effect: "Latest version suggestions", value: "true" },
    { effect: "Task adherence sensitivity", value: "high" },
    { effect: "Task adherence action", value: "block" },
    { effect: "Allowed models", values: ["quilr-code-large", "quilr-code-fast"], tone: "info" },
    { effect: "Concurrency limit", value: "20" },
    { effect: "Tokens per request", value: "100,000" },
    { effect: "Timeout", value: "90s" },
  ]}
/>

`matches pattern` with `*code*` covers any model whose name contains "code", so
a newly released coding model inherits the whole profile with no policy change.

<PolicyCard
  name="govern_production_gateway_access"
  stage="request"
  priority={850}
  when={[
    { field: "Request metadata . environment", op: "is", value: "production" },
    { field: "Application method type", op: "is any of", values: ["chat", "responses", "embeddings", "+4"] },
  ]}
  then={[
    { effect: "Require identity", value: "true" },
    { effect: "Require conversation ID", value: "true" },
    { effect: "Allowed source IP ranges", values: ["10.0.0.0/8", "2001:db8:1200::/48"], tone: "info" },
    { effect: "Allowed models", values: ["gpt-4.1", "claude-sonnet-4"], tone: "info" },
    { effect: "Routing group", value: "production-safe", tone: "info" },
    { effect: "Rate limit", value: "600 per minute" },
    { effect: "Input token limit", value: "2,000,000 per hour" },
    {
      effect: "Per-model limits",
      value: "2 models",
      detail: [
        { label: "gpt-4.1", value: "concurrency 20, 300 per minute, total tokens 128,000, timeout 90s" },
        { label: "claude-sonnet-4", value: "concurrency 20, 300 per minute, total tokens 128,000, timeout 90s" },
      ],
    },
  ]}
/>

Keyed on your own request metadata, so production gets a perimeter that
development never sees: no separate application, no duplicated settings.

## Budgets and spend

Budgets are a structured setting, so the card opens a form rather than a single
value. Each budget in the list applies independently.

| Field | Options |
|---|---|
| Measure | Spend (USD), Requests, Input tokens, Output tokens, Total tokens |
| Limit | Budget limit in USD for spend, otherwise a usage limit |
| Budget period | Calendar or rolling (hour, day, week, month, year), or Lifetime with no reset |
| Reset timezone | Calendar periods only. Calendar weeks start Monday. |
| Separate budget for each | Empty for one shared budget, or per User email, application or model. Multiple fields create an allowance per combination. |
| Budget ID | The key usage is tracked against |

<PolicyCard
  name="support_copilot_budgets"
  stage="request"
  priority={500}
  when={[{ field: "Application", op: "is", value: "Support Copilot" }]}
  then={[
    {
      effect: "Named usage quotas",
      value: "2 budgets",
      detail: [
        { label: "Budget 1", value: "Spend (USD), 500, Calendar month, Asia/Kolkata, separate for each User email, id support_user_monthly_usd" },
        { label: "Budget 2", value: "Total tokens, 10,000,000, Rolling week, shared across matching traffic, id support_team_weekly_tokens" },
      ],
    },
    {
      effect: "Token pricing",
      value: "2 models",
      detail: [
        { label: "gpt-4.1", value: "input $2.50 per 1M tokens, output $10.00 per 1M tokens" },
        { label: "claude-sonnet-4", value: "input $3.00 per 1M tokens, output $15.00 per 1M tokens" },
      ],
    },
  ]}
/>

Budget 1 gives every person their own 500 USD monthly allowance; Budget 2 caps
the whole application at 10M tokens a rolling week. Both must hold, so an
individual staying under budget can still be stopped by the team cap.

:::warning The Budget ID matters
Usage is tracked against the ID. Keep it when changing the amount and recorded
usage carries over. Changing the measure, period, timezone or grouping after
publishing needs a new unique ID and starts a fresh count.
:::

:::note Spend budgets need model prices
Spend budgets require input and output prices in USD per 1 million tokens for
every matching provider and model. Requests without a matching price are
blocked. With the Policy Engine on, prices come from the **Model pricing**
section of the [Budgets & Usage Limits](./llm-controls/budgets-and-usage-limits) card.
:::

## Token savings and Prompt Store

<PolicyCard
  name="compress_document_ingestion"
  stage="request"
  priority={300}
  when={[
    { field: "Application", op: "is", value: "Doc Ingestion Pipeline" },
    { field: "Application method type", op: "is any of", values: ["chat", "responses"] },
  ]}
  then={[
    { effect: "JSON compression", value: "true" },
    { effect: "HTML to text", value: "true" },
    { effect: "Markdown to text", value: "true" },
    { effect: "Text compression", value: "true" },
  ]}
/>

Savings show up as tokens saved in the activity view, so you can prove the
reduction rather than assume it. See
[Token Saving](../token-saving) for the cross-product guide.

<PolicyCard
  name="require_approved_system_prompts"
  stage="request"
  priority={600}
  when={[
    { field: "Request metadata . environment", op: "is", value: "production" },
    { field: "Application method type", op: "is any of", values: ["chat", "responses"] },
  ]}
  then={[{ effect: "Require Prompt Store system prompt", value: "true" }]}
/>

Production traffic must use a reviewed system prompt while development traffic
stays free to experiment. See
[Prompt Store](../llm-gateway/features/prompt-store).

## Response quality

<PolicyCard
  name="monitor_high_confidence_hallucinations"
  stage="response"
  priority={500}
  when={[
    { field: "Application method type", op: "is any of", values: ["chat", "responses", "bedrock", "vertex"] },
  ]}
  then={[
    { effect: "Hallucination check", value: "true" },
    { effect: "Hallucination threshold", value: "0.82" },
    { effect: "Hallucination risk level", value: "high" },
    { effect: "Hallucination action", value: "monitor" },
  ]}
/>

The threshold is the confidence at which a response counts as a hallucination.
Start at `monitor`, then move either the action or the threshold.

## Scoping to people and groups

Every card carries one-click scope shortcuts, which add the condition and lift
the priority so the narrower scope wins automatically.

| Shortcut | Seeded priority |
|---|---|
| User | 900 |
| Smart group | 700 |
| Application | 600 |

No conditions means everyone. An individual exception therefore outranks a
group rule without you choosing numbers.

<PolicyCard
  name="support_team_pii_exception"
  stage="request"
  priority={800}
  when={[
    { field: "Application", op: "is", value: "Support Copilot" },
    { field: "Smart groups", op: "includes (ignoring case)", value: "Support Tier 2" },
    { field: "data found", op: "is any of", value: "Personally Identifiable Information (PII)" },
  ]}
  then={[
    { effect: "Sensitive data action", value: "monitor" },
    { effect: "Risk level", value: "medium" },
  ]}
/>

An exception layered above a stricter default. If the tenant-wide PII rule
redacts at priority 750, this monitors at 800, so Support Tier 2 sees
unredacted data in the Support Copilot application only.
