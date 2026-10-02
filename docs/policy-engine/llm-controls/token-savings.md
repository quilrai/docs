---
sidebar_position: 11
sidebar_custom_props:
  icon: Sparkles
---

# Token Savings

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Rewrite request content into fewer tokens before it reaches the provider. Responses come back untouched.

![Token Savings card collapsed with Smart JSON compression, HTML to text, Markdown to text and Text compression summary rows](/img/policy-engine/llm-token-savings-card.png)

## Sections

Each strategy is its own section with a **Turn on** button. All four apply on `chat`, `responses` and `vertex`.

| Section | What it does | Off by default |
|---|---|---|
| **Smart JSON compression** | Compresses JSON in supported request bodies. | Yes |
| **HTML to text** | Reduces HTML in supported request bodies to its text. | Yes |
| **Markdown to text** | Reduces Markdown in supported request bodies to its text. | Yes |
| **Text compression** | Compresses prose in supported request bodies. | Yes |

![HTML to text and Markdown to text sections, each with a Turn on button and a shared configuration row](/img/policy-engine/llm-token-savings-sections.png)

With no configuration, request bodies are sent to the provider as received.

## Configuration settings

Any **Turn on** button opens one **New Token Savings configuration** dialog with all four controls, preset to the one you clicked.

![Controls section with Leave as is, On and Off for each of the four strategies](/img/policy-engine/llm-token-savings-dialog.png)

| Setting | Options | Default | Notes |
|---|---|---|---|
| Applies to | Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Prompt complexity, Prompt text, Tool, Source network, Except... | Everyone | Or pick an application directly. |
| Each strategy | Leave as is, On, Off | Leave as is (On for the strategy you clicked) | **Leave as is** keeps the broader configuration's value. **Off** switches a strategy off for a narrower scope. |
| Severity | Not set to Very critical | Not set | Reported only. |

## Example

<PolicyCard
  name="compress_document_ingestion"
  stage="request"
  priority={500}
  when={[{ field: "Application", op: "is", value: "Doc Ingestion Pipeline" }]}
  then={[
    { effect: "JSON compression", value: "true" },
    { effect: "HTML to text", value: "true" },
    { effect: "Markdown to text", value: "true" },
  ]}
/>

A pipeline that sends scraped pages and API payloads turns on the three structural strategies and leaves prose untouched.

## Scoping and precedence

- Highest-priority configuration wins per strategy. New configurations start at 500.
- One configuration can cover several apps; it shows as a `shared_*` row on each section.

## Legacy app setting

[Token Saving](../../llm-gateway/features/token-saving) in the app's settings. For how the strategies work, see [Token Saving](../../token-saving).
