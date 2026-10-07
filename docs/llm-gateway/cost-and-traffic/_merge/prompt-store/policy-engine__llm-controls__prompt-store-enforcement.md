---
sidebar_position: 12
sidebar_custom_props:
  icon: MessageSquareText
---

# Prompt Store and Enforcement

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../../console/govern/author-simulate-and-publish) a revision.
:::

Require matching requests to use an approved system prompt from the Prompt Store. The prompts themselves are managed in the [Prompt Store](./prompt-store).

![Prompt Store and Enforcement card collapsed with Configure, the Prompt Store button and the Require store prompt summary row](/img/policy-engine/llm-prompt-store-card.png)

The **Prompt Store** button on the card opens the store, where you create and edit the prompts that requests reference.

## Sections

| Section | What it does | Applies on | Empty state |
|---|---|---|---|
| **Require store prompt** | The system prompt must include a Prompt Store reference. Text before or after the reference is allowed. **Require**. | `chat`, `responses`, `vertex` | Not required. |

![Prompt Store and Enforcement card expanded with the Require store prompt section and three per-application rows set to Required](/img/policy-engine/llm-prompt-store-expanded.png)

## Configuration settings

![Controls, Reads as, Severity and More options rows of the New Prompt Store and Enforcement configuration dialog](/img/policy-engine/llm-prompt-store-dialog.png)

| Setting | Options | Default | Notes |
|---|---|---|---|
| Applies to | Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Prompt complexity, Prompt text, Tool, Source network, Except... | Everyone | Or pick an application directly. |
| Require store prompt | Leave as is, Required, Not required | Required | **Not required** exempts a narrower scope from a broader requirement. |
| Severity | Not set to Very critical | Not set | Reported only. |

## Example

<PolicyCard
  name="require_approved_system_prompts"
  stage="request"
  priority={600}
  when={[{ field: "Request metadata . environment", op: "is", value: "production" }]}
  then={[{ effect: "Require Prompt Store system prompt", value: "required" }]}
/>

Production traffic must use a reviewed system prompt; development traffic stays free to experiment.

## Scoping and precedence

Highest-priority configuration wins. New configurations start at 500.

## Legacy app setting

The app's **Prompt Store** settings. See [Prompt Store](./prompt-store).
