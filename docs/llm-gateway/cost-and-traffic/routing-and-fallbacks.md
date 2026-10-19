---
sidebar_position: 1
sidebar_label: "Routing and fallbacks"
sidebar_custom_props:
  icon: Route
description: "Weighted, token-based and custom routing for LLM Gateway apps, and what happens when a provider fails or is disabled."
aliases: [routing]
---

# Routing and fallbacks

Spread one model name across several models, providers or accounts, fail over automatically when a provider fails, skip providers you disable, and send small requests to cheaper models.

## Turn it on for an app

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Routing"
/>

Routing draws on the models of the app's enabled providers, so link providers first in the app's **Providers** tab.

![Routing section with an example group splitting gpt-4.1 traffic 40/30/20/10 across OpenAI, Azure OpenAI and Anthropic models, and the app's available providers below](/img/llm-gateway/ui/app-routing-overview.png)

## Three ways to route

| Type | Splits traffic by | Clients use it by |
|------|-------------------|-------------------|
| **Routing groups** (weighted) | Share of requests | Sending the group name as `model` |
| **Token-based routing groups** | Share of total tokens (input + output) | Sending the group name as `model` |
| **Custom routing** | Request size: low, medium or high complexity | Calling the API surface as usual |

Group names must be unique across weighted and token-based groups.

## Routing groups

1. Under **Routing groups**, add a group and give it a name, for example `Group1`.
2. Add models from the app's providers and set a weight for each. Weights total 100%. **Distribute** splits them evenly.
3. Save settings, then send the group name as the `model`.

| Model | Provider | Weight |
|-------|----------|--------|
| `gpt-4.1` | OpenAI | 60% |
| `gpt-4.1` | Azure OpenAI | 40% |

If you disable a provider, the group stops sending new requests to its models and splits traffic across the rest. No code change is needed. When a model in the group fails, the gateway fails over to the group's other models; see [When a provider fails](#when-a-provider-fails).

A group name can match a real model name. If a group named `gpt-4.1` routes to `gpt-4.1-mini` and `gpt-4.1-nano`, existing code that sends `model="gpt-4.1"` is rerouted without a deploy.

Because the group picks from models the app's providers already serve, you never re-enter credentials. Common patterns:

- **Cross-provider split:** the same model on OpenAI and Azure OpenAI.
- **Extra capacity:** two accounts for the same provider, added as two providers.
- **Region pinning:** a US and an EU Azure deployment of the same model.

## Token-based routing groups

The same as a routing group, but each model's weight is its target share of **total tokens**, not request count. Use it when request sizes vary widely, for example when one 200-token chat and one 20k-token RAG call should not count equally against a provider's TPM quota.

| Model | Weight | After 100k tokens |
|-------|--------|-------------------|
| `gpt-4.1` | 70% | about 70k tokens routed |
| `claude-sonnet-4-5` | 30% | about 30k tokens routed |

## Custom routing

Route by request size within one API surface. Pick a surface tab, then fill the three tiers with an ordered list of models, cheapest first. Each tier has its own **Published** switch, and only published tiers route traffic.

![Custom routing on the Anthropic Messages tab with Low, Medium and High Complexity Request tiers, each with a Published switch](/img/llm-gateway/ui/app-routing-custom-complexity.png)

| Surface tab | Notes |
|-------------|-------|
| Chat Completion | |
| Anthropic Messages | |
| OpenAI Responses | |
| Vertex AI | |
| Bedrock Runtime | Converse and ConverseStream only. InvokeModel stays direct. |

Request size is measured in words. Under the Policy Engine, size and AI-judged complexity are set as **Complexity levels** on the **Model routing** card; see [Policy Engine routing](./policy-engine-routing#complexity-routing). OpenAI Realtime sessions always use weighted routing.

## Which surfaces a group can mix

A group belongs to one API family. Providers in the same family can be mixed; providers from different families cannot, because their request and response formats differ.

| Group type | Endpoint | Providers you can combine |
|------------|----------|---------------------------|
| **Chat Completions** | `/openai_compatible/v1/chat/completions` | OpenAI, Azure OpenAI, Bedrock (Converse), Vertex AI Gemini, Anthropic Messages (direct, Bedrock, Azure), Anthropic (chat completions), DeepSeek, Gemini (chat completions), General LLM, Sarvam chat models |
| **Anthropic Messages** | `/anthropic_messages/v1/messages` | Anthropic, Bedrock (Anthropic), Azure Anthropic |
| **Vertex AI** | `/vertex_ai/` | Vertex AI |
| **OpenAI Responses** | `/openai_responses/v1/responses` | OpenAI Responses, Azure OpenAI Responses |
| **OpenAI Realtime** | `/openai_realtime/v1/realtime` (wss) | OpenAI Realtime, Azure OpenAI Realtime |

## Without a routing group

You do not need a group for the gateway to choose a provider. When a request names a real model and no provider selector:

- If exactly one enabled provider serves that model, the gateway uses it.
- If several enabled providers serve it, the gateway picks one at random for each request.

For deterministic selection, send `provider`, `provider_label`, `X-Provider-Name` or `X-Provider-Label`.

## When a provider fails

The gateway fails over automatically. When the primary model or provider fails, the gateway sends the request to the next model or provider in the routing order (the fallbacks), so a single failing provider does not stop the app.

- **App providers.** The first provider linked to the app is the **Primary**; the rest are fallbacks, in the order set with the up and down arrows.
- **Routing groups.** The gateway fails over across the group's models.
- **Policy Engine.** **Route to** is an ordered fallback list; the gateway moves to the next target when the one before it fails.
- **Disabled providers** are left out of groups, custom routing and **Route to** before the call.

A request blocked by a guardrail is not failed over; the client gets the guardrail response for the app's action.

Weighted groups pick the model whose actual share is furthest below its weight, so traffic converges on the configured split rather than being random per request. The gateway records the routing group and mode with each request in its logs, and every response carries `x-quilr-served-model` (the model that served it) and `x-quilr-route` (`default`, or the Policy Engine route id).

## Call a routing group

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx'
)

# The routing group name goes in the model field
response = client.chat.completions.create(
    model='Group1',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

```bash
curl https://guardrails-usa-2.quilr.ai/openai_compatible/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -d '{"model": "Group1", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## Going further with the Policy Engine

When the Policy Engine is on for the LLM Gateway, the app's Routing tab freezes and the **Model routing** card in **Policy Engine > LLM Gateway** decides where requests go. Converted app groups are scoped with **Requested model** set to the group name. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

The card adds what app settings cannot:

- **Route to:** an ordered list of provider and model targets for an app or group, whatever model the client asked for.
- **Content routes:** pick the model by what the request is about (AI matches a description you write), the data detected, prompt complexity, words in the prompt, or the coding tool that sent it.
- **Complexity routing:** small, medium and large models by AI-judged difficulty or by length only.
- **Conversation pinning and Keep prompt cache warm:** keep each conversation on one model so provider prompt caches hit.
- **Scopes:** People, Smart group, App tag, Requested model, Provider, API surface, Environment, Prompt text, Tool or Source network.

<PolicyCard
  name="cheap_short_prompts"
  stage="request"
  priority={600}
  when={[{ field: "Prompt complexity", op: "is", value: "low" }]}
  then={[{ effect: "Route to", value: "openai_primary / gpt-4.1-mini", tone: "info" }]}
/>

Rejected models on the Allowed Models card still win over a route or group target. Setup, screenshots and caching behaviour: [Policy Engine routing](./policy-engine-routing).

## Related

- [Policy Engine routing](./policy-engine-routing)
- [Providers and models](../apps-and-providers/providers-and-models)
- [Provider support](../apps-and-providers/provider-support)
- [Gateway access and allowed models](../protect/gateway-access-and-allowed-models)
- [Policy Engine overview](../../console/govern/policy-engine)
