---
sidebar_position: 4
sidebar_label: "Prompt store"
sidebar_custom_props:
  icon: MessageSquareText
description: "Store reusable system prompts, reference them at request time, and give an app a universal system prompt that the gateway adds to every request."
console_path: []
aliases: ["prompt store"]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prompt store

Updated on 3 November 2026.

Store reusable system prompts centrally, then reference one or more of them and add inline instructions at request time. You can also give an app one universal system prompt that the gateway adds to every request.

## Configure this control

App prompt definitions stay editable in both modes. Choose Classic settings for app prompt setup, or Policy Engine for organization-wide prompts and scoped enforcement. Only the governed enforcement and universal-prompt settings follow the engine switch. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Turn it on for an app {#turn-it-on-for-an-app}

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Prompts"
/>

Enter a **Prompt ID** and **Prompt content**, then click **Save prompt**. Prompt changes apply immediately, without **Save settings**, and are recorded in the app's [Audit Log](../monitor/app-audit-log).

![Prompt editor with the Prompt content box, the variable syntax help text and the Save prompt button](/img/llm-gateway/ui/app-prompt-store.png)

Variable names can contain letters, numbers, underscores and hyphens. Callers must supply every variable as a string.

To add one prompt to every request without a Prompt ID, use the [universal system prompt](#universal-system-prompt) in the same section.

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine {#going-further-with-the-policy-engine}

The **Prompt Store & Enforcement** card in **Policy Engine > LLM Gateway** holds three things: the organization-wide Global Prompt Store, the **Require store prompt** policy and the **Universal system prompt** policy. When the engine is on for the LLM Gateway, the app's store-prompt enforcement and [universal system prompt](#universal-system-prompt) freeze, and the card's policies decide them. App prompts themselves stay editable. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

### Global Prompt Store {#global-prompt-store-v2-console}

The Global Prompt Store is one prompt library for your whole organization, reusable by every LLM Gateway app. Open **Govern > Policy Engine > LLM Gateway > Controls > Prompt Store & Enforcement**, then choose its **Prompt Store** tab.

The **Prompt Store** tab lists every prompt with its ID, variables and content. Search by ID or content, or use **Add prompt**, **Edit** and **Delete**. IDs and `{{variable}}` rules are the same as for app prompts. Changes apply immediately across the organization: they are not part of the policy draft and do not require publishing.

| | App Prompt Store | Global Prompt Store |
|---|---|---|
| Where | App **Configure > Prompts** | **Policy Engine > LLM Gateway > Prompt Store & Enforcement > Prompt Store** |
| Scope | One app | Every app in the organization |
| Reference in requests | `quilrai-prompt-store-<id>` | `quilrai-prompt-store-<id>` |
| Variables | `X-Prompt-Variables` header | `X-Prompt-Variables` header |

How the two stores relate:

- The global list also shows the prompts of your active apps. When apps share an ID, the newest app version is the default and conflicting versions get alias IDs.
- Saving an app-derived ID in the global store creates an organization-level version that takes priority over the app copies.
- Deleting an app-derived ID in the global store hides it from the global list.

### Require store prompt {#require-store-prompt}

Use a recipe or the add menu in **Require store prompt** to add a configuration with **Require store prompt** set to **Required**, **Not required** (an exception that must outrank the matching requirement) or **Leave as is**. It applies on `chat`, `responses` and `vertex`. The highest-priority matching configuration wins; Required wins ties. Edits join the shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

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

### Universal system prompt policies {#universal-system-prompt-policies}

With the engine on, the universal system prompt comes from policies instead of each app's setting. Open **Universal system prompt** in the **Prompt Store & Enforcement** panel and start from a recipe or its add menu. Choose who it applies to, then set **Universal system prompt** to:

- **On**, with the prompt from either:
  - **Write the prompt**: type it in **Prompt text**. The counter shows its length against the 8,192-character limit.
  - **Use a Global Prompt Store prompt**: pick it in **Global Prompt Store prompt**, for longer prompts or one prompt shared by several configurations. **Manage prompts in the Prompt Store** opens the [Global Prompt Store](#global-prompt-store-v2-console).
- **Off**: an explicit exception at a higher priority than the matching On configuration.

The card shows each configuration as **On · 1,234 characters**, **On · Global prompt support-persona** or **Off**. Editing one reopens the same form, or the full editor for a configuration the form cannot show.

The gateway adds the winning prompt exactly as described in [What the model receives](#what-the-model-receives), on `chat` (including Anthropic Messages), `responses`, `vertex` and `bedrock` requests.

How it resolves:

- **One prompt per request.** The highest-priority matching configuration wins. The form sets a priority from the scope, and the form then moves to the next priority no other universal system prompt holds. Two configurations at the same priority with different prompts cannot be published unless they apply to different applications.
- **No matching configuration, no prompt.** The app's own universal system prompt does not apply while the engine is on.
- **Global Prompt Store prompts are live.** The gateway reads the prompt on each request, so editing it in the Global Prompt Store applies immediately, without publishing. It is sent as written: `{{variables}}` are not resolved.
- **A deleted prompt is skipped.** Requests go to the model without a universal system prompt, and the request log records the reason `prompt_not_found`. The form flags a prompt the Global Prompt Store no longer holds, and validation warns about it.
- **Request logs name the source.** The log records that the prompt came from a policy and, for a Global Prompt Store prompt, its ID. The prompt text is never logged.

When you [turn the engine on](../../console/govern/switching-from-classic-settings), each app's universal system prompt becomes a configuration scoped to that app. A prompt longer than 8,192 characters cannot move automatically: the conversion review flags it, and you add it to the Global Prompt Store and reference it from a configuration.

Scenarios:

- **One persona for everyone.** Turn it on for Everyone with a Global Prompt Store prompt, and set **Off** for the one Application that brings its own.
- **Per team.** Give a Smart group its own prompt at a higher priority than the Everyone configuration.
- **Per model.** Add model-specific instructions for one Requested model.

<PolicyCard
  name="support_team_persona"
  stage="request"
  priority={600}
  when={[{ field: "Smart groups", op: "includes (ignoring case)", value: "Support" }]}
  then={[{ effect: "Universal system prompt", value: "On · Global prompt support-persona" }]}
/>

</TabItem>
</Tabs>

## How it works {#how-it-works}

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

## Combining prompts and instructions {#combining-prompts-and-instructions}

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

## Universal system prompt {#universal-system-prompt}

A universal system prompt is one prompt per app, with no Prompt ID, that the gateway adds to every request. Callers do not reference it, so it reaches the model even when an app sends its own system prompt or none at all.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Prompts"
/>

1. In the **Universal system prompt** card, write the text in **Prompt**.
2. Turn on **Apply to every request**.
3. Click **Save settings**.

Unlike stored prompts, which apply immediately, the universal system prompt is part of the app's settings. It applies when you click **Save settings**, is kept in the app's configuration versions (so **Roll back** restores it), and is recorded in the app's [Audit Log](../monitor/app-audit-log) as a configuration change (`update_config`). Self-service editors change it through the normal settings save or change request. It can be up to 100,000 characters, and it cannot be turned on while **Prompt** is empty.

</TabItem>
<TabItem value="policy" label="Policy Engine">

Open **Govern > Policy Engine > LLM Gateway > Controls > Prompt Store & Enforcement** and add a rule under **Universal system prompt**. Choose who it applies to and whether to write prompt text or reference a Global Prompt Store prompt, then **Save to draft** and **Review & publish**. See [Universal system prompt policies](#universal-system-prompt-policies) for precedence and prompt sources.

</TabItem>
</Tabs>

### What the model receives {#what-the-model-receives}

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

### Where it goes in each format {#where-it-goes-in-each-format}

| Request format | Where the universal system prompt is added |
|---|---|
| Chat Completions | Merged into the first message when it is a `system` or `developer` message, otherwise added as a new first `system` message |
| Responses | Prepended to `instructions`, which is set when absent |
| Anthropic Messages | Prepended to `system`: in front of a string, or as a new first text block when `system` is a list of blocks |
| Gemini / Vertex `generateContent` | The first part of `systemInstruction`, which is created when absent. Not applied when the request uses `cachedContent`, because Gemini does not accept a system instruction with cached content |
| Bedrock Converse and ConverseStream | The first `system` block |
| Bedrock InvokeModel | Claude models (`system`), Nova models (`system` blocks) and OpenAI models (`messages`). Other model families are sent unchanged |

It is not applied to embeddings, legacy completions, images, moderations, Realtime, Assistants or Anthropic token counting.

### How it behaves {#how-it-behaves}

- **Sent as written.** Prompt Store references and `{{variables}}` inside the universal system prompt are not resolved.
- **Applied after guardrails.** The gateway adds it after guardrails run and Prompt Store references are resolved, right before the request goes to the provider, so guardrails never scan or redact it. It is added to the request in the format your client sent, so it also works with [any-to-any formats](../api-reference/any-to-any-formats).
- **Not in request logs.** Logs keep the request exactly as your app sent it.
- **Counts toward token limits.** Its length is part of the token estimate for [rate and token limits](./rate-token-and-budget-limits).
- **Fresh cache entries.** Changing it starts fresh entries in the app's response cache.
- **Covered by leakage checks.** The **System Prompt, Tool & Model Leakage** category checks responses against it, along with the rest of the system prompt.
- **Enforcement is unchanged.** [Enforce system prompts from store](#enforce-system-prompts) checks only the system prompt your app sends.
- **Governed by the Policy Engine.** When the engine is on for the LLM Gateway, policies decide the universal system prompt and this setting freezes. See [Universal system prompt policies](#universal-system-prompt-policies).

To set it from automation, use the [Management API](../api-reference/prompts-api).

## Template variables {#template-variables}

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

## Enforce system prompts {#enforce-system-prompts}

**Enforce system prompts from store**, in the app's prompt settings, ensures every request's system message includes at least one managed Prompt Store reference, so no request runs without a reviewed base prompt.

| Mode | Behavior |
|------|----------|
| **Enabled** | Every system message must contain at least one valid Prompt Store reference (`quilrai-prompt-store-<id>`). You can list multiple references and add your own inline instructions around them - the request is accepted as long as a valid reference is present. A system message with freeform text but no valid reference, or no system message at all, is rejected with a 400 (`system_prompt_not_from_store`). |
| **Disabled** (default) | Both stored references and fully freeform system prompts are accepted. |

This applies uniformly across Chat Completions, Anthropic Messages (both the top-level `system` field and any `system`-role messages), Vertex/Gemini, and the OpenAI Responses API. Useful when every system prompt should build on a reviewed base from the Prompt Store while still allowing per-request instructions.

The [universal system prompt](#universal-system-prompt) does not count as a reference. Enforcement checks only the system prompt your app sends, so with enforcement on, a request without a valid reference is still rejected even when the universal system prompt is on.

## Code examples {#code-examples}

### OpenAI {#openai}

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

### Anthropic {#anthropic}

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

## Related {#related}

- [Prompts API](../api-reference/prompts-api)
- [Token saving](./token-saving)
- [Policy Engine overview](../../console/govern/policy-engine)
