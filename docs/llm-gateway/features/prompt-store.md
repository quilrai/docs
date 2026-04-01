---
sidebar_position: 7
sidebar_custom_props:
  badge: new
---

# Prompt Store

Manage and version system prompts centrally.

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

## Template Variables

Prompts support `{{variable}}` placeholders. Pass variable values via the `X-Prompt-Variables` header.

**Prompt template:**

```
You are a {{tone}} code reviewer for {{language}}.
```

**X-Prompt-Variables header:**

```json
{"tone": "formal", "language": "Python"}
```

**Resolved prompt sent to LLM:**

```
You are a formal code reviewer for Python.
```

## Enforce System Prompts

| Mode | Behavior |
|------|----------|
| **Enabled** | Only stored prompts are allowed as system messages. Freeform system prompts return a 400 error. |
| **Disabled** | Both stored and freeform system prompts are accepted. |

## Code Examples

### OpenAI

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails.quilr.ai/openai_compatible/',
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
    base_url='https://guardrails.quilr.ai/anthropic_messages/',
    api_key='sk-quilr-xxx'
)

message = client.messages.create(
    model='claude-sonnet-4-20250514',
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
