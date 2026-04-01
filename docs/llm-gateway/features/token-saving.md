---
sidebar_position: 2
sidebar_custom_props:
  badge: new
---

# Token Saving

Reduce token usage by compressing input content automatically.

## How It Works

<StepFlow steps={[
  {
    label: "Request Arrives",
    items: [
      '{"name": "John", "age": 30}',
      "14 input tokens",
    ],
  },
  {
    label: "QuilrAI Compresses",
    items: [
      "name:John|age:30",
      "8 input tokens",
    ],
  },
  {
    label: "Sent to LLM",
    items: [
      "43% tokens saved",
      "Same response quality ✓",
    ],
  },
]} />

1. **Request Arrives** - Your app sends a normal API call
2. **Gateway Compresses** - Content is transformed to use fewer tokens
3. **Forwarded to LLM** - Optimized content sent - same accuracy, lower cost

## Compression Methods

### Smart JSON Compression - Up to 20% savings

Converts JSON objects in LLM inputs to TOON format - ideal for tool call responses and structured data.

| Before | After |
|--------|-------|
| `{"name": "John", "age": 30}` | `name:John\|age:30` |

### HTML to Text

Strips HTML tags and extracts clean text - removes markup overhead from scraped pages or rich content.

| Before | After |
|--------|-------|
| `<p class="intro"><b>Hello</b> world</p>` | `Hello world` |

### Markdown to Text

Removes Markdown syntax characters that consume tokens without adding meaning for the LLM.

| Before | After |
|--------|-------|
| `## Hello **world**` | `Hello world` |

## Seamless and Input-Only

Compression is applied **only to input tokens** before they reach the LLM. Responses are returned untouched. Your application code stays exactly the same - no SDK changes, no prompt rewrites, just lower costs.
