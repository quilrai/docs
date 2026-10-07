---
sidebar_position: 4
sidebar_label: "Prompt store"
sidebar_custom_props:
  icon: MessageSquareText
---

# Prompt Store

Store reusable system prompts centrally, then reference one or more of them and add inline instructions at request time.

Open the app's **Settings > Prompt Store** (under **Identity & content**). Enter a **Prompt ID** and **Prompt content**, then click **Save prompt**. Prompt changes apply immediately, without **Save settings**, and are recorded in the app's [Audit Log](../monitor/app-audit-log).

![Prompt editor with the Prompt content box, the variable syntax help text and the Save prompt button](/img/llm-gateway/ui/app-prompt-store.png)

Variable names can contain letters, numbers, underscores and hyphens. Callers must supply every variable as a string.

## How It Works

<StepFlow steps={[
  {
    label: "Prompt Stored",
    items: [
      "ID: code-reviewer",
      '"You are a {{tone}} reviewer"',
    ],
  },
  {
    label: "API References It",
    items: [
      "system: quilrai-prompt-store-code-reviewer",
      'vars: {tone: "formal"}',
    ],
  },
  {
    label: "QuilrAI Resolves",
    items: [
      '"You are a formal reviewer"',
      "Sent to LLM ✓",
    ],
  },
]} />

1. **Create** - Store a prompt with a unique ID (e.g., `code-reviewer`)
2. **Reference** - Use it as the system message content: `quilrai-prompt-store-code-reviewer`
3. **Gateway Resolves** - The gateway resolves the prompt and sends the full text to the LLM

## Combining Prompts and Instructions

A system message is not limited to a single reference. The gateway scans it for `quilrai-prompt-store-<id>` reference tokens and replaces each one **in place** with that prompt's resolved content, leaving any other text exactly where you wrote it. So one system message can:

- **Reference several prompts** - list multiple `quilrai-prompt-store-<id>` tokens and the gateway combines their resolved content in the order written.
- **Mix in your own instructions** - add freeform text around the references to extend the stored prompt for a single request, without editing the stored prompt itself.

**System message your app sends:**

```
quilrai-prompt-store-startup-advisor

Be concise, practical, and honest. Always answer in English.
```

**Stored prompt `startup-advisor`:**

```
You are an experienced startup advisor, venture capitalist, product strategist, and entrepreneur.

Your role is to challenge assumptions, identify risks, and provide actionable recommendations.
```

**Resolved prompt sent to the LLM:**

```
You are an experienced startup advisor, venture capitalist, product strategist, and entrepreneur.

Your role is to challenge assumptions, identify risks, and provide actionable recommendations.

Be concise, practical, and honest. Always answer in English.
```

Referencing multiple prompts works the same way - each token resolves independently and the surrounding layout is preserved:

```
quilrai-prompt-store-base-policy
quilrai-prompt-store-code-reviewer

Only review the security-sensitive files in this diff.
```

:::tip
References and inline text are combined from top to bottom in the order they appear. Put foundational prompts first and request-specific instructions last so the model reads them in a natural order.
:::

## Template Variables

Prompts support `{{variable}}` placeholders. Pass values via the `X-Prompt-Variables` header, keyed by the reference each set of values belongs to.

**Prompt template (`code-reviewer`):**

```
You are a {{tone}} code reviewer for {{language}}.
```

**X-Prompt-Variables header:**

```json
{"quilrai-prompt-store-code-reviewer": {"tone": "formal", "language": "Python"}}
```

**Resolved prompt sent to LLM:**

```
You are a formal code reviewer for Python.
```

When a system message references several prompts, give each one its own entry - the gateway applies each variable set only to its matching reference:

```json
{
  "quilrai-prompt-store-code-reviewer": {"tone": "formal", "language": "Python"},
  "quilrai-prompt-store-base-policy": {"region": "EU"}
}
```

## Enforce System Prompts

**Enforce system prompts from store** (on the **Enforcement** card) ensures every request's system message includes at least one managed Prompt Store reference, so no request runs without a reviewed base prompt.

| Mode | Behavior |
|------|----------|
| **Enabled** | Every system message must contain at least one valid Prompt Store reference (`quilrai-prompt-store-<id>`). You can list multiple references and add your own inline instructions around them - the request is accepted as long as a valid reference is present. A system message with freeform text but no valid reference, or no system message at all, is rejected with a 400 (`system_prompt_not_found`). |
| **Disabled** (default) | Both stored references and fully freeform system prompts are accepted. |

This applies uniformly across Chat Completions, Anthropic Messages (both the top-level `system` field and any `system`-role messages), Vertex/Gemini, and the OpenAI Responses API. Useful when every system prompt should build on a reviewed base from the Prompt Store while still allowing per-request instructions.

## Global Prompt Store (V2 console)

The Global Prompt Store is one prompt library for your whole organization, reusable by every LLM Gateway app. Open **Policy Engine > LLM Gateway** and click **Prompt Store** on the **Prompt Store and Enforcement** card.

![Prompt Store and Enforcement card with the Configure menu, the Prompt Store button, and Require store prompt set for 3 applications](/img/llm-gateway/ui/policy-prompt-store-card.png)

The drawer lists every prompt with its ID, variables and content. Search by ID or content, or use **Add prompt**, **Edit** and **Delete**. IDs and `{{variable}}` rules are the same as for app prompts. Changes apply immediately across the organization: they are not part of the policy draft and do not require publishing.

![Global Prompt Store drawer with a search box and two prompts showing their persona and name variable chips](/img/llm-gateway/ui/policy-global-prompt-store-drawer.png)

| | App Prompt Store | Global Prompt Store |
|---|---|---|
| Where | App **Settings > Prompt Store** | **Policy Engine > LLM Gateway > Prompt Store** |
| Scope | One app | Every app in the organization |
| Reference in requests | `quilrai-prompt-store-<id>` | `quilrai-prompt-store-<id>` |
| Variables | `X-Prompt-Variables` header | `X-Prompt-Variables` header |

How the two stores relate:

- The global list also shows the prompts of your active apps. When apps share an ID, the newest app version is the default and conflicting versions get alias IDs.
- Saving an app-derived ID in the global store creates an organization-level version that takes priority over the app copies.
- Deleting an app-derived ID in the global store hides it from the global list.

### Enforcement under the Policy Engine

With the Policy Engine on, **Enforce system prompts from store** is set by **Prompt Store and Enforcement** policies instead of the app setting. Each configuration specifies who it applies to (application, people, smart group and more) and sets **Require store prompt**. It applies to chat, Responses and Vertex traffic, and the highest-priority matching configuration wins. See [LLM Gateway Policies](../../console/govern/policy-engine#token-savings-and-prompt-store).

## Code Examples

### OpenAI

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx'
)

response = client.chat.completions.create(
    model='gpt-4o-mini',
    messages=[
        {'role': 'system', 'content': 'quilrai-prompt-store-code-reviewer'},
        {'role': 'user', 'content': 'Review this code'}
    ],
    extra_headers={
        'X-Prompt-Variables': '{"quilrai-prompt-store-code-reviewer": {"tone": "formal", "language": "Python"}}'
    }
)
```

### Anthropic

```python
import anthropic

client = anthropic.Anthropic(
    base_url='https://guardrails-usa-2.quilr.ai/anthropic_messages/',
    api_key='sk-quilr-xxx'
)

message = client.messages.create(
    model='claude-sonnet-4-5',
    max_tokens=1024,
    system='quilrai-prompt-store-code-reviewer',
    messages=[
        {'role': 'user', 'content': 'Review this code'}
    ],
    extra_headers={
        'X-Prompt-Variables': '{"quilrai-prompt-store-code-reviewer": {"tone": "formal", "language": "Python"}}'
    }
)
```
