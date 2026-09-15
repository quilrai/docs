---
sidebar_position: 2
sidebar_custom_props:
  icon: BrainCircuit
---

# LLM Gateway Policies

Govern data, tools, models, identity, spend and quality on every model call.

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
      "Gateway access, identity, network",
      "Tool controls",
      "Allowed models, routing",
      "Rate, token, timeout limits",
      "Budgets and usage quotas",
      "Token savings, Prompt Store",
      "Sensitive data inspection",
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
      "Sensitive data inspection",
      "Hallucination checks",
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
| Application method type | API surface in use: `chat`, `responses`, `assistants`, `embeddings`, `rerank`, `tts`, `stt`, `bedrock`, `vertex`, `sdk_check`. |
| User email | The identified caller. |
| Smart groups | The caller's Quilr Smart Groups, the gateway's own runtime groups. These are distinct from console access-control groups and are matched ignoring case. |
| Requested model | The model the caller asked for. |
| Tool name, tags, arguments | The tool call under evaluation, its tags, and its individual argument values. |
| Request metadata | Your own metadata sent on the call: environment, cost centre, ticket ID, anything you pass. |
| Data found | Detections by exact catalog name, with `is any of`, `is all of` or `is none of`, and an optional occurrence threshold. |

## The twelve control surfaces

Every setting belongs to exactly one card, and the workspace is those twelve
cards. Monitor, redact and block are settings inside a card, never separate
cards.

| Surface | Stage | What it controls |
|---|---|---|
| Data & Adversarial Risks | request, response | PII, PHI, financial data, secrets, prompt injection, jailbreaks, custom detections. Actions: `monitor`, `partial-redact`, `redact`, `block`. |
| Guardian Agent | request | Dependency security checks, latest-version suggestions, task-adherence enforcement with a sensitivity and a nudge or block action. |
| Hallucination Protection | response | Scores responses and enforces above a confidence threshold between 0 and 1. |
| Gateway Access | request | Allow or deny the whole model request by application, person, group, model or metadata. |
| Identity & Network Trust | request | Require an identified caller and a conversation ID; restrict traffic to approved CIDR ranges. |
| Tool Controls | request | Allow or deny tool calls on name, type, tags, risk or annotations, independently of data handling. |
| Allowed Models | request | The models matching traffic may use. |
| Routing Groups & Fallbacks | request | Weighted routing groups and ordered provider fallback chains. |
| Budgets & Usage Limits | request | Spend and usage allowances by metric, grouped per user, application or model, over calendar, rolling or lifetime periods. |
| Rate, Token & Timeout Limits | request | Concurrency, request rate, token ceilings and timeouts, application-wide and per model. |
| Token Savings | request | JSON compression, HTML and Markdown to text, text compression before the provider call. |
| Prompt Store Enforcement | request | Require matching requests to use an approved system prompt. |

## Protecting data

### Block secrets everywhere

```
policy  block_request_secrets      priority 900      runs on request

When  data found            is any of  Auth & Secrets
Then  Sensitive data action →          block
      Risk level            →          critical
```

No scope condition, so it covers every request the gateway sees. A high
priority keeps it above narrower, more permissive rules.

### Redact personal data in responses

```
policy  redact_response_personal_data   priority 750   runs on response

When  Application method type  is any of  chat, responses, assistants, +4
and   data found               is any of  Personally Identifiable Information (PII)
Then  Sensitive data action    →          redact
      Risk level               →          high
```

Use `partial-redact` instead to mask only part of a value, the usual choice for
financial data where the last four digits still need to be readable.

### Introduce a detection safely

```
policy  monitor_selected_request_data   priority 200   runs on request

When  Application method type  is any of  chat, responses, assistants, sdk_check
and   data found               is any of  Email Address, Phone Number
Then  Sensitive data action    →          monitor
      Risk level               →          low
```

Publish on `monitor`, read a week of activity, then raise it. A low priority
keeps it clear of real enforcement rules.

### Stop prompt attacks at ingress

```
policy  block_prompt_attacks_at_ingress   priority 1000   runs on request

When  data found            is any of  Prompt Injection Techniques,
                                       Jailbreak Techniques
Then  Sensitive data action →          block
      Risk level            →          very_critical
```

Adversarial detections are ordinary data types, so prompt-attack defence has
the same shape as secrets defence.

## Several data types, several actions

A configuration on the Data & Adversarial Risks card holds as many **data
rules** as you need. Each rule picks its own data types and its own action;
they all share the configuration's scope and priority. **Add data rule** adds
another.

```
policy  support_copilot_data_actions   priority 700   runs on request

Data rule 1
  When  Application           is         Support Copilot
  and   data found            is any of  Aadhaar Number / VID
  Then  Sensitive data action →          redact
        Risk level            →          high

Data rule 2
  When  Application           is         Support Copilot
  and   data found            is any of  Name
  Then  Sensitive data action →          monitor

Data rule 3
  When  Application           is         Support Copilot
  and   data found            is any of  Auth & Secrets
  Then  Sensitive data action →          block
        Risk level            →          critical
```

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

```
policy  deny_public_repository_creation   priority 950   runs on request

When  Tool name                       is  create_repository
and   Tool arguments . visibility     is  public
and   any of the following
        Tool arguments . owner_type   is        organization
        or Tool tags                  has entry write
Then  Tool call access                →         deny
      Risk level                      →         high
```

```
policy  block_secrets_in_tool_arguments   priority 925   runs on request

When  Application method type  is any of  chat, responses
and   Tool name                is set
and   data found               is any of  Auth & Secrets
Then  Sensitive data action    →          block
      Risk level               →          critical
```

`is set` is a presence test needing no value. It narrows the rule to calls
carrying a tool invocation, leaving ordinary chat traffic alone.

## Denying access

Gateway Access rejects the whole call before any model is contacted: no tokens
spent, no provider round trip, and the data rules never run because the request
never proceeds.

### Deny a person completely

```
policy  deny_offboarded_users     priority 1000   runs on request

When  User email       is any of  j.doe@acme.com, r.patel@acme.com
Then  Request access   →          deny
      Risk level       →          critical
```

One condition, no application scope, so these people are refused on every
gateway application, every model and every method. Use this shape while a
leaver's credentials are still being revoked upstream.

### Deny a group for particular models

```
policy  deny_frontier_models_to_interns   priority 800   runs on request

When  Smart groups      includes (ignoring case)  Interns
and   Requested model   is any of                 claude-opus-4, gpt-4.1, o3
Then  Request access    →                         deny
      Risk level        →                         medium
```

Interns keep full gateway access and are refused only when they reach for an
expensive frontier model. Swap the group row for `User email is any of` to do
the same for one person.

### The allow-list alternative

```
policy  restrict_interns_to_small_models   priority 700   runs on request

When  Smart groups     includes (ignoring case)  Interns
Then  Allowed models   →                         gpt-4.1-mini, claude-haiku-4.5
```

Same intent, opposite construction. The card above denies three named models
and must be edited every time a new frontier model appears; this one names the
two models Interns may use, so anything new is excluded by default. Prefer this
shape unless you specifically need the denial recorded as a blocked call.

### Everyone except

```
policy  finance_copilot_platform_team_only   priority 850   runs on request

When  Application     is                            Finance Copilot
and   Smart groups    does not include (ignoring case)  Finance Platform
Then  Request access  →                             deny
      Risk level      →                             high
```

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

```
policy  secure_coding_routes      priority 700      runs on request

When  Application method type      is any of        chat, responses
and   Requested model              matches pattern  *code*
Then  Guardian                     →  true
      Dependency security check    →  true
      Latest version suggestions   →  true
      Task adherence sensitivity   →  high
      Task adherence action        →  block
      Allowed models               →  quilr-code-large, quilr-code-fast
      Concurrency limit            →  20
      Tokens per request           →  100,000
      Timeout                      →  90s
```

`matches pattern` with `*code*` covers any model whose name contains "code", so
a newly released coding model inherits the whole profile with no policy change.

```
policy  govern_production_gateway_access   priority 850   runs on request

When  Request metadata . environment  is         production
and   Application method type         is any of  chat, responses, embeddings, +4
Then  Require identity                →  true
      Require conversation ID         →  true
      Allowed source IP ranges        →  10.0.0.0/8, 2001:db8:1200::/48
      Allowed models                  →  gpt-4.1, claude-sonnet-4
      Routing group                   →  production-safe
      Rate limit                      →  600 per minute
      Input token limit               →  2,000,000 per hour
      Per-model limits                →  2 models
```

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

```
policy  support_copilot_budgets      priority 500      runs on request

When  Application         is  Support Copilot
Then  Named usage quotas  →   2 budgets

      Budget 1   Spend (USD), 500, Calendar month, Asia/Kolkata,
                 separate for each User email,  id support_user_monthly_usd
      Budget 2   Total tokens, 10,000,000, Rolling week,
                 shared across matching traffic, id support_team_weekly_tokens

      Token pricing       →   gpt-4.1          input $2.50 / 1M, output $10.00 / 1M
                              claude-sonnet-4  input $3.00 / 1M, output $15.00 / 1M
```

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
blocked. Set prices once under Settings, Models.
:::

## Token savings and Prompt Store

```
policy  compress_document_ingestion   priority 300   runs on request

When  Application             is         Doc Ingestion Pipeline
and   Application method type is any of  chat, responses
Then  JSON compression        →  true
      HTML to text            →  true
      Markdown to text        →  true
      Text compression        →  true
```

Savings show up as tokens saved in the activity view, so you can prove the
reduction rather than assume it. See
[Token Saving](../token-saving) for the cross-product guide.

```
policy  require_approved_system_prompts   priority 600   runs on request

When  Request metadata . environment  is         production
and   Application method type         is any of  chat, responses
Then  Require Prompt Store system prompt  →  true
```

Production traffic must use a reviewed system prompt while development traffic
stays free to experiment. See
[Prompt Store](../llm-gateway/features/prompt-store).

## Response quality

```
policy  monitor_high_confidence_hallucinations   priority 500   runs on response

When  Application method type   is any of  chat, responses, bedrock, vertex
Then  Hallucination check       →  true
      Hallucination threshold   →  0.82
      Hallucination risk level  →  high
      Hallucination action      →  monitor
```

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

```
policy  support_team_pii_exception   priority 800   runs on request

When  Application           is                        Support Copilot
and   Smart groups          includes (ignoring case)  Support Tier 2
and   data found            is any of                 Personally Identifiable Information (PII)
Then  Sensitive data action →                         monitor
      Risk level            →                         medium
```

An exception layered above a stricter default. If the tenant-wide PII rule
redacts at priority 750, this monitors at 800, so Support Tier 2 sees
unredacted data in the Support Copilot application only.
