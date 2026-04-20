---
sidebar_position: 1
sidebar_custom_props:
  icon: Route
---

# Request Routing

Multi-provider load balancing and failover behind a single API key.

## How It Works

<StepFlow steps={[
  {
    label: "API Request",
    items: [
      'model: "Group1"',
      'content: "Hello!"',
    ],
  },
  {
    label: "QuilrAI Routes",
    items: [
      "Group1 found ✓",
      "gpt-4o → 60% weight",
      "claude-sonnet → 40% weight",
    ],
  },
  {
    label: "Provider Selected",
    items: [
      "→ gpt-4o (weighted)",
      "Response returned ✓",
    ],
  },
]} />

1. **Create Group** - Define a named routing group (e.g., `Group1`)
2. **Add Models** - Add providers with traffic weights (e.g., `gpt-4o 60%`, `claude 40%`)
3. **Use as Model** - Pass the group name as the `model` parameter in your API call

## Routing Modes

A routing group runs in one of two modes. Both route by weight - they just measure "share" differently.

| Mode | Share measured in | Best for |
|------|-------------------|----------|
| **Request count** (default) | Cumulative requests per model | Even request distribution, simple round-robin-like behavior |
| **Token based** | Cumulative input + output tokens per model | Cost/capacity balancing where request sizes vary widely |

Pick the mode when you create the group. Your app just uses the group name - the gateway handles the rest.

### Weight-Based Routing

Assign weights to distribute traffic across models. Weights must total 100%.

| Model | Weight |
|-------|--------|
| `gpt-4o` | 60% |
| `claude-sonnet` | 40% |

Use the **distribute** button to split weights evenly across all models in a group.

### Token-Based Routing

In token mode, a model's share is the fraction of cumulative tokens (input + output) it has served, not the fraction of requests. This is useful when requests differ in size by an order of magnitude - for example, one 200-token chat and one 20k-token RAG call should not count equally against a provider's capacity.

Weights still sum to 100% and work the same way - only the accounting unit changes.

| Model | Weight | Example after 100k tokens |
|-------|--------|---------------------------|
| `gpt-4o` | 70% | ~70k tokens routed |
| `claude-sonnet` | 30% | ~30k tokens routed |

Pick token mode when you're balancing against TPM quotas or per-token cost. Pick request-count mode when providers are roughly interchangeable per call.

## Context-Tiered Routing

On top of weighted routing, a group can override model selection based on the size of the request. Short prompts can be sent to a small, cheap model (e.g. `gpt-4o-mini`) while larger prompts fall through to the weighted routing for the group.

Configure Low / Medium / High context tiers on the group and pick which models serve each tier. Available for Chat Completions, Anthropic Messages, Vertex AI, and OpenAI Responses groups. Realtime sessions always use the group's weighted routing.

## Routing Across Multiple Credentials

A single API key can carry credentials for several providers - your OpenAI account, an Azure OpenAI deployment, a second OpenAI account for extra TPM, etc. When you build a routing group, you don't re-enter credentials: you pick from the models already available on the providers attached to the key, and the gateway uses that provider's credentials at request time.

Typical patterns this enables:

- **Cross-provider load split** - e.g. `gpt-4o` on OpenAI (50%) and `gpt-4o` on Azure OpenAI (50%) in one group, transparent to your app.
- **Same-model / different-account split** - two OpenAI accounts running `gpt-4o` to double effective TPM.
- **Region-tied routing** - a US and an EU Azure OpenAI deployment for the same model.

Models available to a group are driven by the providers on the key - you won't see a model in the group config that isn't backed by a provider you've already added.

## Automatic Failover

### Provider Available

Requests are routed based on configured weights across all models in the group.

### Provider Down

Traffic automatically shifts to remaining models. No code changes needed.

## Multi-Provider Support

A routing group is tied to one API family. Providers within the same family can be mixed freely; providers from different families can't share a group because their request/response formats differ.

| Group type | Used by | Providers you can combine |
|------------|---------|---------------------------|
| **Chat Completions** | `/openai_compatible/v1/chat/completions` | OpenAI, Azure OpenAI, Anthropic (chat completions), DeepSeek, Gemini (chat completions), General LLM |
| **Anthropic Messages** | `/anthropic_messages/v1/messages` | Anthropic, AWS Bedrock (Anthropic), Azure Anthropic |
| **Vertex AI** | `/vertex_ai/` | Vertex AI |
| **OpenAI Responses** | `/openai_responses/v1/responses` | OpenAI Responses, Azure OpenAI Responses |
| **OpenAI Realtime** | `/openai_realtime/v1/realtime` (wss) | OpenAI Realtime, Azure OpenAI Realtime |


## Group Naming

Group names can match actual model names. Your application keeps sending requests to the same model name, but the gateway silently routes them based on your group config.

### Example

| Group Name | Routes To |
|-----------|-----------|
| `gpt-4.1` | `gpt-4.1-nano` (70%), `gpt-4.1-mini` (30%) |

Your code still sends `model="gpt-4.1"` - zero code changes, but requests get routed to cheaper or faster models behind the scenes.

## Code Examples

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx'
)

# Pass the routing group name as the model parameter
response = client.chat.completions.create(
    model='Group1',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(response.choices[0].message.content)
```

### cURL

```bash
curl https://guardrails.quilr.ai/openai_compatible/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-quilr-xxx" \
  -d '{
    "model": "Group1",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```
