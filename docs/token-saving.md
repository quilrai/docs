---
sidebar_position: 2
sidebar_custom_props:
  icon: Coins
---

# Token Saving

Reduce prompt and agent-context token usage across LLM Gateway and MCP Gateway.

Token saving lets QuilrAI rewrite high-overhead input text before it is sent into an AI context. The same transform names are used across gateway settings, logs, and analytics, so teams can enable the same optimization strategy for direct LLM calls and MCP tool output.

## Where It Applies

| Gateway | What is optimized | Configure it | Details |
|---------|-------------------|--------------|---------|
| **LLM Gateway** | Text in request inputs before the provider call. Responses are returned unchanged. | Per API key. | [LLM Gateway Token Saving](./llm-gateway/features/token-saving) |
| **MCP Gateway** | Text content blocks in MCP `tools/call` output before the result is returned to the client. | Per MCP in that MCP's settings. | [MCP Gateway Token Saving](./mcp-gateway/features/token-saving) |

## Shared Methods

| Setting | Use it for | Behavior |
|---------|------------|----------|
| `smart_json_compression` | Structured JSON payloads, API responses, and tool results. | Converts eligible JSON objects or arrays to TOON when it reduces token usage. |
| `html_to_text` | Scraped pages, rich emails, dashboards, and HTML reports. | Strips HTML tags and extracts clean text content. |
| `markdown_to_text` | Markdown documents, README files, issue bodies, and generated notes. | Converts Markdown formatting to plain text and removes syntax-only tokens. |
| `text_compression` | Verbose prose, repeated separator lines, and low-signal plain text. | Compresses plain text while preserving meaning and avoiding structured-looking lines. |

## Config Shape

When all toggles are off, the token-saving config is equivalent to:

```json
{
  "smart_json_compression": false,
  "html_to_text": false,
  "markdown_to_text": false,
  "text_compression": false
}
```

Turn on only the methods that match your traffic. For example, a retrieval app that sends JSON search results and Markdown snippets can enable `smart_json_compression` and `markdown_to_text` without enabling every transform.

## What Stays Unchanged

- Application and agent SDK code stays the same.
- LLM Gateway responses are not compressed on the way back to the application.
- MCP Gateway preserves non-text structured content unless a separate security guardrail redacts it.
- Token-saving logs report saved tokens by method, so admins can measure the effect before broad rollout.
