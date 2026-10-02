---
sidebar_position: 4
sidebar_custom_props:
  icon: KeyRound
---

# Gateway Access

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Allow or deny an entire model request by who sent it, which app or model it targets, or what its prompt says. Denied requests are rejected before routing or scanning: no provider call, no tokens.

![Gateway Access card expanded with the Requests section holding a Deny rule and an empty Prompt text rules section](/img/policy-engine/llm-gateway-access-expanded.jpg)

## Sections

| Section | What it does | Empty state |
|---|---|---|
| **Requests** | Allow or deny the whole request for a scope. **Add rule**. | Everyone without a rule is allowed. |
| **Prompt text rules** | Act on a phrase or pattern in the user or system prompt. **Add phrase rule**. | No request is denied for what its prompt says. |

## Request rule settings

| Setting | Options | Default | Notes |
|---|---|---|---|
| Decision | Allow, Deny | Deny | Allow carves an exception out of a broader deny when it outranks it. |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Reported only. |

An allow **never** bypasses identity, source IP, model or tool checks.

## Phrase rule settings

Request stage only, on `chat`, `responses`, `bedrock` and `vertex`.

| Setting | Options | Default | Notes |
|---|---|---|---|
| Where | User prompt, System prompt, Either | User prompt | One per line. Tool-call content is not part of the text. |
| Condition | contains, starts with, ends with, matches `*wildcard*`, is exactly (case-sensitive) | contains | Matching is case-insensitive (except **is exactly**) and reads the first 8,192 characters. No regular expressions; wildcards use `*` and `?`. |
| Phrase | Text or `*pattern*` | - | Add more lines; match **any line** (default) or **all lines**. |
| Then | Deny request, Route to..., Severity only | Deny request | Route to sends the request to an ordered list of targets. Severity only tags it. |

## Examples

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

For limiting models, an [Allowed Models](../llm-gateway#the-allow-list-alternative) list is usually easier to maintain than a deny list.

## Scoping and precedence

- **Applies to**: Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Prompt text, Tool, Source network, or **Except...** to carve people out of a broader rule.
- Highest priority wins. When an allow and a deny share a priority, **deny wins**. Phrase rules follow the same rule.

## Legacy app setting

None. Gateway Access is a policy-only control with no equivalent app settings section.
