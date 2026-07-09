---
sidebar_position: 2
sidebar_custom_props:
  icon: Coins
---

# Token Saving

Reduce token usage by optimizing input content before it reaches the model.

## How It Works

<StepFlow steps={[
  {
    label: "Request Arrives",
    items: [
      "JSON, HTML, Markdown, or text",
      "Original input tokens",
    ],
  },
  {
    label: "QuilrAI Compresses",
    items: [
      "JSON -> TOON",
      "Markup -> clean text",
    ],
  },
  {
    label: "Sent to LLM",
    items: [
      "Fewer prompt tokens",
      "Meaning preserved ✓",
    ],
  },
]} />

1. **Request Arrives** - Your app sends a normal API call
2. **Gateway Optimizes** - Enabled transforms rewrite eligible text fields to use fewer tokens
3. **Forwarded to LLM** - Optimized input is sent to the provider with no SDK changes

## Compression Methods

### Smart JSON Compression - Up to 20% savings

Converts eligible JSON objects or arrays in LLM inputs to TOON format - ideal for tool call responses and structured data.

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

### Text Compression

Compresses verbose plain text while preserving the original meaning. It removes low-value prose noise and separator noise while avoiding structured-looking lines.

| Before | After |
|--------|-------|
| `Please review the following statement and the context which was actually very repetitive.` | `Review statement and context.` |

## Configuration Keys

Token saving is configured per API key. Enable only the transforms that match the traffic sent through that key.

```json
{
  "smart_json_compression": false,
  "html_to_text": false,
  "markdown_to_text": false,
  "text_compression": false
}
```

| Setting | Behavior |
|---------|----------|
| `smart_json_compression` | Converts eligible JSON objects or arrays to TOON when it reduces token usage. |
| `html_to_text` | Extracts clean text from HTML-heavy inputs. |
| `markdown_to_text` | Converts Markdown formatting to plain text and removes syntax-only tokens. |
| `text_compression` | Compresses verbose plain text while preserving meaning. |

## Input-Only Behavior

Compression is applied **only to input tokens** before they reach the LLM. Responses are returned untouched. Your application code stays exactly the same - no SDK changes, no prompt rewrites, just lower costs.
