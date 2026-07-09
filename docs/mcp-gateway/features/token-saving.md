---
sidebar_position: 9
sidebar_custom_props:
  badge: new
  icon: Coins
---

# Token Saving

Reduce token usage from MCP tool output before it enters an agent's context.

## How It Works

<StepFlow steps={[
  {
    label: "Tool Returns Output",
    items: [
      "HTML report",
      "Large JSON payload",
      "Verbose text",
    ],
  },
  {
    label: "QuilrAI Optimizes",
    items: [
      "HTML -> text",
      "JSON -> TOON",
      "Text compressed",
    ],
  },
  {
    label: "Client Receives",
    items: [
      "Shorter text blocks",
      "Meaning preserved ✓",
    ],
  },
]} />

1. **Agent calls a tool** - The AI client invokes an MCP `tools/call` request through QuilrAI.
2. **MCP returns output** - The upstream MCP server returns text content, structured content, or both.
3. **Gateway optimizes text** - Enabled token-saving transforms run on MCP text content blocks.
4. **Client receives the result** - The agent gets a shorter response that preserves the useful meaning.

## Per-MCP Settings

Token saving is configured independently for each MCP. Open the MCP's **Settings** panel and enable the methods that match that MCP's output shape.

When all toggles are off, the saved config is equivalent to:

```json
{
  "smart_json_compression": false,
  "html_to_text": false,
  "markdown_to_text": false,
  "text_compression": false
}
```

## Methods

| Setting | Behavior |
|---------|----------|
| `smart_json_compression` | Converts eligible JSON objects or arrays in MCP tool output to TOON when it reduces token usage. |
| `html_to_text` | Strips HTML tags and extracts clean text content from markup-heavy tool output. |
| `markdown_to_text` | Converts Markdown formatting to plain text and removes syntax-only tokens. |
| `text_compression` | Compresses verbose plain text while preserving meaning in the tool response. |

## Runtime Order

For `tools/call`, token saving runs after upstream execution and output safety checks:

1. Upstream MCP tool result
2. Web search policy output filtering, when applicable
3. Security guardrail output processing
4. Token-saving transforms
5. Final MCP response and log entry

Only text content blocks are transformed. `structuredContent` is preserved unless a separate DLP redaction action changes it through the structured-output guardrail path.

## Logs and Measurement

MCP Gateway logs record the enabled methods and estimated tokens saved by method. Use those log fields to compare MCPs before enabling token saving broadly.

Token estimates use the `gpt-4o` tokenizer. They are intended for consistent measurement inside QuilrAI and may not exactly match every downstream model's billing tokenizer.
