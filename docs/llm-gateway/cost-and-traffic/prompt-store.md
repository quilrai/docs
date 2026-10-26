---
sidebar_position: 4
sidebar_label: "Prompt store"
sidebar_custom_props:
  icon: MessageSquareText
description: "Store reusable system prompts, reference them at request time, and give an app a universal system prompt that the gateway adds to every request."
---

# Prompt store

Store reusable system prompts centrally, then reference one or more of them and add inline instructions at request time. You can also give an app one universal system prompt that the gateway adds to every request.

## Turn it on for an app

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Prompts"
/>

Enter a **Prompt ID** and **Prompt content**, then click **Save prompt**. Prompt changes apply immediately, without **Save settings**, and are recorded in the app's [Audit Log](../monitor/app-audit-log).

![Prompt editor with the Prompt content box, the variable syntax help text and the Save prompt button](/img/llm-gateway/ui/app-prompt-store.png)

Variable names can contain letters, numbers, underscores and hyphens. Callers must supply every variable as a string.

To add one prompt to every request without a Prompt ID, use the [universal system prompt](#universal-system-prompt) in the same section.

## How it works

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

## Combining prompts and instructions

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

## Universal system prompt

A universal system prompt is one prompt per app, with no Prompt ID, that the gateway adds to every request. Callers do not reference it, so it reaches the model even when an app sends its own system prompt or none at all.

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Prompts"
/>

1. In the **Universal system prompt** card, write the text in **Prompt**.
2. Turn on **Apply to every request**.
3. Click **Save settings**.

Unlike stored prompts, which apply immediately, the universal system prompt is part of the app's settings. It applies when you click **Save settings**, is kept in the app's configuration versions (so **Roll back** restores it), and is recorded in the app's [Audit Log](../monitor/app-audit-log) as a configuration change (`update_config`). Self-service editors change it through the normal settings save or change request. It can be up to 100,000 characters, and it cannot be turned on while **Prompt** is empty.

### What the model receives

The gateway adds the universal system prompt before the system prompt your app sends, separated by a blank line. A request with no system prompt gets the universal system prompt as its system prompt. Prompt Store references in your app's system message are resolved first, so the universal system prompt sits in front of the resolved text.

**Universal system prompt:**

```
You are Acme's support assistant. Never share internal URLs.
```

**System message your app sends:**

```
Answer in Spanish.
```

**Sent to the LLM:**

```
You are Acme's support assistant. Never share internal URLs.

Answer in Spanish.
```

When the request has no system message, the LLM receives only `You are Acme's support assistant. Never share internal URLs.` as its system prompt.

### Where it goes in each format

| Request format | Where the universal system prompt is added |
|---|---|
| Chat Completions | Merged into the first message when it is a `system` or `developer` message, otherwise added as a new first `system` message |
| Responses | Prepended to `instructions`, which is set when absent |
| Anthropic Messages | Prepended to `system`: in front of a string, or as a new first text block when `system` is a list of blocks |
| Gemini / Vertex `generateContent` | The first part of `systemInstruction`, which is created when absent. Not applied when the request uses `cachedContent`, because Gemini does not accept a system instruction with cached content |
| Bedrock Converse and ConverseStream | The first `system` block |
| Bedrock InvokeModel | Claude models (`system`), Nova models (`system` blocks) and OpenAI models (`messages`). Other model families are sent unchanged |

It is not applied to embeddings, legacy completions, images, moderations, Realtime, Assistants or Anthropic token counting.

### How it behaves

- **Sent as written.** Prompt Store references and `{{variables}}` inside the universal system prompt are not resolved.
- **Applied after guardrails.** The gateway adds it after guardrails run and Prompt Store references are resolved, right before the request goes to the provider, so guardrails never scan or redact it. It is added to the request in the format your client sent, so it also works with [any-to-any formats](../api-reference/any-to-any-formats).
- **Not in request logs.** Logs keep the request exactly as your app sent it.
- **Counts toward token limits.** Its length is part of the token estimate for [rate and token limits](./rate-token-and-budget-limits).
- **Fresh cache entries.** Changing it starts fresh entries in the app's response cache.
- **Covered by leakage checks.** The **System Prompt, Tool & Model Leakage** category checks responses against it, along with the rest of the system prompt.
- **Enforcement is unchanged.** [Enforce system prompts from store](#enforce-system-prompts) checks only the system prompt your app sends.
- **Not a Policy Engine control.** It stays editable and keeps applying when the [Policy Engine](#going-further-with-the-policy-engine) is on.

To set it from automation, use the [Management API](../api-reference/prompts-api).

## Template variables

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

## Enforce system prompts

**Enforce system prompts from store**, in the app's prompt settings, ensures every request's system message includes at least one managed Prompt Store reference, so no request runs without a reviewed base prompt.

| Mode | Behavior |
|------|----------|
| **Enabled** | Every system message must contain at least one valid Prompt Store reference (`quilrai-prompt-store-<id>`). You can list multiple references and add your own inline instructions around them - the request is accepted as long as a valid reference is present. A system message with freeform text but no valid reference, or no system message at all, is rejected with a 400 (`system_prompt_not_from_store`). |
| **Disabled** (default) | Both stored references and fully freeform system prompts are accepted. |

This applies uniformly across Chat Completions, Anthropic Messages (both the top-level `system` field and any `system`-role messages), Vertex/Gemini, and the OpenAI Responses API. Useful when every system prompt should build on a reviewed base from the Prompt Store while still allowing per-request instructions.

The [universal system prompt](#universal-system-prompt) does not count as a reference. Enforcement checks only the system prompt your app sends, so with enforcement on, a request without a valid reference is still rejected even when the universal system prompt is on.

## Code examples

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

## Going further with the Policy Engine

The **Prompt Store and Enforcement** card in **Policy Engine > LLM Gateway** holds two things: the organization-wide Global Prompt Store, and the **Require store prompt** policy. When the engine is on for the LLM Gateway, the app's store-prompt enforcement freezes and the card's policies decide it. App prompts themselves stay editable, and so does the [universal system prompt](#universal-system-prompt): it is an app setting, not a Policy Engine control, so it keeps applying when the engine is on. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

### Global Prompt Store {#global-prompt-store-v2-console}

The Global Prompt Store is one prompt library for your whole organization, reusable by every LLM Gateway app. Open **Policy Engine > LLM Gateway** and click **Prompt Store** on the **Prompt Store and Enforcement** card.

![Prompt Store and Enforcement card with the Configure menu, the Prompt Store button, and Require store prompt set for 3 applications](/img/llm-gateway/ui/policy-prompt-store-card.png)

The drawer lists every prompt with its ID, variables and content. Search by ID or content, or use **Add prompt**, **Edit** and **Delete**. IDs and `{{variable}}` rules are the same as for app prompts. Changes apply immediately across the organization: they are not part of the policy draft and do not require publishing.

![Global Prompt Store drawer with a search box and two prompts showing their persona and name variable chips](/img/llm-gateway/ui/policy-global-prompt-store-drawer.png)

| | App Prompt Store | Global Prompt Store |
|---|---|---|
| Where | App **Configure > Prompts** | **Policy Engine > LLM Gateway > Prompt Store** |
| Scope | One app | Every app in the organization |
| Reference in requests | `quilrai-prompt-store-<id>` | `quilrai-prompt-store-<id>` |
| Variables | `X-Prompt-Variables` header | `X-Prompt-Variables` header |

How the two stores relate:

- The global list also shows the prompts of your active apps. When apps share an ID, the newest app version is the default and conflicting versions get alias IDs.
- Saving an app-derived ID in the global store creates an organization-level version that takes priority over the app copies.
- Deleting an app-derived ID in the global store hides it from the global list.

### Require store prompt

**Require** adds a configuration with **Require store prompt** set to **Required**, **Not required** (exempts a narrower scope) or **Leave as is**. It applies on `chat`, `responses` and `vertex`. The highest-priority matching configuration wins; new configurations start at 500. Edits join the shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

Scenarios:

- **Production only.** Require a store prompt when request metadata marks the environment as production, and leave development free to experiment.
- **Tenant-wide with exceptions.** Require it for Everyone, then set **Not required** for one Application, App tag or Smart group.
- **Per model or provider.** Require it only for a Requested model or Provider.

<PolicyCard
  name="require_approved_system_prompts"
  stage="request"
  priority={600}
  when={[{ field: "Request metadata . environment", op: "is", value: "production" }]}
  then={[{ effect: "Require Prompt Store system prompt", value: "required" }]}
/>

## Related

- [Prompts API](../api-reference/prompts-api)
- [Token saving](./token-saving)
- [Policy Engine overview](../../console/govern/policy-engine)
