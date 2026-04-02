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

## Weight-Based Routing

Assign weights to distribute traffic across models. Weights must total 100%.

| Model | Weight |
|-------|--------|
| `gpt-4o` | 60% |
| `claude-sonnet` | 40% |

Use the **distribute** button to split weights evenly across all models in a group.

## Automatic Failover

### Provider Available

Requests are routed based on configured weights across all models in the group.

### Provider Down

Traffic automatically shifts to remaining models. No code changes needed.

## Multi-Provider Support

Models in a group must share the same API format. You can mix providers freely within a format.

### OpenAI-compatible format

- OpenAI
- Azure OpenAI
- Anthropic (chat completions)
- Bedrock (chat completions)
- General LLM (vLLM, etc.)

### Anthropic Messages format

- Anthropic
- AWS Bedrock (Anthropic)

:::warning Cannot mix formats
OpenAI-compatible and Anthropic Messages use different request/response structures, so they cannot be combined in the same group.
:::

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
