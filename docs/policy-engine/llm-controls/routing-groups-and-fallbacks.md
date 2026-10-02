---
sidebar_position: 8
sidebar_custom_props:
  icon: Route
---

# Routing Groups & Fallbacks

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Decide where a request is served: an ordered fallback chain of provider credentials, a weighted split across models, or word-count thresholds that classify prompts as Low, Medium or High complexity.

![Routing Groups & Fallbacks card expanded with the order-of-decision banner, an empty Route to section and the Routing groups header](/img/policy-engine/llm-routing-expanded.png)

## Order of decision

<StepFlow steps={[
  { label: "Allowed Models", items: ["Filters what may be used"] },
  { label: "Route to", items: ["Highest-priority route", "First enabled target"] },
  { label: "Routing group", items: ["Highest-priority group", "Weighted split"] },
  { label: "Provider default", items: ["App's own provider"] },
]} />

A route beats a routing group for the same traffic. If neither matches, the application's provider default serves the request, and the request keeps the model it asked for.

## Sections

| Section | What it does | Applies on | Empty state |
|---|---|---|---|
| **Route to** | An ordered list of provider credential and model pairs. The first with an enabled credential serves the request, whatever model the client asked for. **Add route**. | `bedrock`, `chat`, `responses`, `vertex` | Requests keep the model they asked for. |
| **Routing groups** | A weighted split across models. Weights always total 100. **New group**. | `bedrock`, `chat`, `realtime`, `responses`, `vertex` | No split. |
| **Complexity thresholds** | Word counts that classify a prompt Low, Medium or High for the **Prompt complexity** scope chip. **Set thresholds**. | `bedrock`, `chat`, `responses`, `vertex` | 6 words or fewer are Low, 7 to 10 are Medium, longer are High. |

![Routing groups list showing per-application groups with a weight bar, provider credential tags, models and percentages](/img/policy-engine/llm-routing-groups-list.png)

## Configuration settings

All three buttons open one **New Routing Groups & Fallbacks configuration** dialog. **Send to** picks the mode.

| Setting | Options | Default | Notes |
|---|---|---|---|
| Applies to | Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Prompt complexity, Prompt text, Tool, Source network, Except... | Everyone | Or pick an application directly. Thresholds cannot be scoped by Prompt complexity. |
| Send to | Ordered targets, Weighted split, Complexity thresholds | Depends on the button | |
| Severity | Not set to Very critical | Not set | Reported only. |

### Ordered targets (Route to)

![Ordered targets mode with one target row: Choose provider, Choose model, Remove, and Add target](/img/policy-engine/llm-routing-dialog-ordered-targets.png)

| Setting | Options | Notes |
|---|---|---|
| Targets | Provider credential + model, one row per target | Tried in order. Drag the handle or use the arrow keys to reorder. **Add target** for more fallbacks. |

### Weighted split (Routing groups)

![Weighted split mode with Name, Kind, Mode, Add model, Balance evenly and the Weight 0 of 100 counter](/img/policy-engine/llm-routing-dialog-weighted-split.png)

| Setting | Options | Default | Notes |
|---|---|---|---|
| Name | Text, required | - | A policy-only alias. It never affects a live routing group with the same name. Converted app groups are scoped with **Requested model** set to the group name. |
| Kind | Chat completion, Anthropic messages, Vertex AI, Responses, Realtime, Bedrock | Chat completion | The API shape the group serves. |
| Mode | Split by requests, Split by tokens | Split by requests | |
| Models | **Add model** per provider credential + model, each with a weight | - | Weights must total 100. **Balance evenly** splits them equally. |

### Complexity thresholds

![Complexity thresholds mode with Low up to 6 and Medium up to 10 word counts](/img/policy-engine/llm-routing-dialog-complexity.png)

| Setting | Default | Notes |
|---|---|---|
| Low up to | 6 words | |
| Medium up to | 10 words | Anything longer is High. |

## Examples

<PolicyCard
  name="support_failover"
  stage="request"
  priority={500}
  when={[{ field: "Application", op: "is", value: "Support Copilot" }]}
  then={[
    {
      effect: "Route to",
      value: "2 targets",
      detail: [
        { label: "1", value: "openai_primary / gpt-4.1" },
        { label: "2", value: "azureopenai_primary / gpt-4.1" },
      ],
    },
  ]}
/>

OpenAI serves every Support Copilot request. If that credential is disabled, Azure OpenAI takes over.

<PolicyCard
  name="cheap_short_prompts"
  stage="request"
  priority={600}
  when={[{ field: "Prompt complexity", op: "is", value: "low" }]}
  then={[{ effect: "Route to", value: "openai_primary / gpt-4.1-mini", tone: "info" }]}
/>

Short prompts go to a cheaper model. Combine with **Complexity thresholds** to change what counts as short.

## Scoping and precedence

- Highest priority wins where scopes overlap. New configurations start at 500.
- Rejected models on [Allowed Models](./allowed-models) still win over a route or group target.

## Legacy app setting

[Request Routing](../../llm-gateway/features/request-routing) in the app's settings.
