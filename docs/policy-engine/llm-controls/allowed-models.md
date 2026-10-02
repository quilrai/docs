---
sidebar_position: 7
sidebar_custom_props:
  icon: ListChecks
---

# Allowed Models

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Choose which models matching traffic may call, and which models nobody in scope may call. A request for a model outside the effective list is rejected at the gateway.

![Allowed Models card collapsed, showing the Allowed models and Rejected models summary rows](/img/policy-engine/llm-allowed-models-card.png)

## How lists combine

![Allowed Models card expanded with the combine banner, the Allowed models section and its Add allowed list button](/img/policy-engine/llm-allowed-models-expanded.png)

- **Allowed lists combine.** Every allowed list that matches a request is merged, and the request may use any model in the union.
- **Rejected models always win**, including models reached through [routing](./routing-groups-and-fallbacks). Priority is ignored for both lists.
- **No matching allowed list** means any configured model may be requested unless it is rejected.
- Other policies still apply. Allowing a model does not bypass identity, access, budget or limit checks.

## Sections

| Section | What it does | Empty state |
|---|---|---|
| **Allowed models** | Restricts matching requests to the listed models. **Add allowed list**. | Any configured model may be requested. |
| **Rejected models** | Blocks the listed models for matching requests, even when another list allows them. **Add rejected list**. | No model is explicitly rejected. |

![Rejected models section with the Add rejected list button and the empty state](/img/policy-engine/llm-allowed-models-rejected.png)

Both sections apply on `assistants`, `bedrock`, `chat`, `copilot`, `embeddings`, `models`, `realtime`, `rerank`, `responses`, `sdk_check`, `stt`, `text`, `tts` and `vertex`.

## Configuration settings

Both buttons open the same **New Allowed Models configuration** dialog. Leave **Allowed models** empty to add only rejections.

![Model picker grouped by provider credential, with search, a selected count, Select all and per-group All and None](/img/policy-engine/llm-allowed-models-picker.png)

| Setting | Options | Default | Notes |
|---|---|---|---|
| Applies to | Everyone, People, Smart group, Application, App tag, Provider, API surface, Environment, Prompt complexity, Prompt text, Tool, Source network, Except... | Everyone | Or pick an application directly. A pencil on an app means it already has a configuration; picking it opens that one. |
| Allowed models | Checkboxes grouped by provider credential, with **Search models**, **Select all**, **Clear all** and per-group **All** / **None** | None | Models come from the provider credentials configured under **Settings > LLM Gateway**. Only enabled credentials are listed. |
| Rejected models | Same picker | None | |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Reported on matching requests for dashboards, exports and alerts. Never changes the outcome. |
| More options | **Open in full editor** | - | Priority, extra rules, metadata and content conditions, raw QuilrQL. |

![Reads as, Severity and More options rows with the Add configuration button](/img/policy-engine/llm-allowed-models-dialog-footer.png)

:::warning Everyone lists affect every app
An allowed list scoped to **Everyone** restricts every application and user to that list. Choose **Application** or another scope to limit who it affects.
:::

## Examples

<PolicyCard
  name="support_copilot_models"
  stage="request"
  priority={500}
  when={[{ field: "Application", op: "is", value: "Support Copilot" }]}
  then={[{ effect: "Allowed models", values: ["gpt-4.1", "gpt-4.1-mini"], tone: "info" }]}
/>

Support Copilot may only call the two listed models. A request for `gpt-4o` is rejected.

<PolicyCard
  name="reject_preview_models"
  stage="request"
  priority={500}
  when={[]}
  then={[{ effect: "Rejected models", values: ["o1-preview", "gpt-4.5-preview"], tone: "info" }]}
/>

No one may call the preview models, even through an app whose allowed list includes them or a routing group that targets them.

## Scoping and precedence

- New configurations start at priority 500. Priority does not matter on this card: allowed lists union and rejections always win.
- The card runs before routing. Allowed Models filters what may be used, then [Routing Groups & Fallbacks](./routing-groups-and-fallbacks) picks where the request goes.

## Legacy app setting

An app's usable models come from the providers linked to it. See [Link providers to an app](../../llm-gateway/providers-and-models#link-providers-to-an-app).
