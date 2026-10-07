---
sidebar_position: 3
sidebar_label: "Token saving"
sidebar_custom_props:
  icon: Coins
---

# Token saving

Rewrite request content into fewer tokens before it reaches the provider. Responses are returned untouched, and your code does not change.

## Turn it on for an app

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Token Saving"
/>

Turn on each strategy that matches the traffic the app sends. Apps with any strategy on show a **Token saving** flag in the app list.

![Token Saving strategies with Smart JSON compression, HTML to text, Markdown to text and Text compression, each with a before and after example](/img/llm-gateway/ui/app-token-saving-strategies.png)

## Strategies

| Strategy | What it does | Before | After |
|----------|--------------|--------|-------|
| **Smart JSON compression** | Compacts eligible JSON objects and arrays, converting to TOON where that saves more. Best for tool results and structured data. Up to about 20% savings. | `{"name": "John", "age": 30}` | `name:John\|age:30` |
| **HTML to text** | Strips HTML markup down to readable text. | `<p><b>Hello</b> world</p>` | `Hello world` |
| **Markdown to text** | Strips Markdown syntax that costs tokens without adding meaning. | `## Hello **world**` | `Hello world` |
| **Text compression** | Removes low-value prose and separator noise from long text while keeping its meaning. Structured-looking lines are left alone. | `Please review the following statement and the context which was actually very repetitive.` | `Review statement and context.` |

A transform only applies when it reduces token usage. Savings appear as **Tokens saved** in the app's Analytics tab and per request in **Activity > Requests**, and tenant-wide in [Costs and savings](../../console/observe/costs-and-savings).

Turn on only the methods that match your traffic. A retrieval app that sends JSON search results and Markdown snippets can enable Smart JSON compression and Markdown to text without enabling every transform.

## Shared with the MCP Gateway

The same four methods, with the same names in settings, logs and analytics, are available for MCP tool output. On the MCP Gateway they rewrite `tools/call` text results before they return to the client, and OneMCP smart tool search also reduces tool-schema tokens. See [MCP Gateway token saving](../../mcp-gateway/protect/token-saving).

| Setting key | Use it for |
|-------------|------------|
| `smart_json_compression` | Structured JSON payloads, API responses and tool results. |
| `html_to_text` | Scraped pages, rich emails, dashboards and HTML reports. |
| `markdown_to_text` | Markdown documents, README files, issue bodies and generated notes. |
| `text_compression` | Verbose prose, repeated separator lines and low-signal plain text. |

For the [Management API](../api-reference/management-api), the app's switches are (all off by default):

```json
{
  "smart_json_compression": false,
  "html_to_text": false,
  "markdown_to_text": false,
  "text_compression": false
}
```

## Going further with the Policy Engine

Token saving is also the **Token Savings** card in **Policy Engine > LLM Gateway**. When the engine is on for the LLM Gateway, the Token Saving tab freezes and the card applies instead. See [Switching from classic settings](../../console/govern/switching-from-classic-settings).

Each strategy is a section with a **Turn on** button; all four apply on `chat`, `responses` and `vertex`. Each strategy is a three-way switch (**Leave as is**, **On**, **Off**), and the highest-priority configuration wins per strategy. Scenarios the card supports:

- **One configuration for several apps.** Scope by App tag or several applications; it shows as a `shared_*` row on each section.
- **Exempt a narrow scope.** Turn a strategy **Off** for one Requested model, Provider or Smart group while it stays on for Everyone.
- **Compress by content.** Scope by Prompt complexity or Prompt text, for example only long prompts.
- **Structural strategies for a pipeline.** A document-ingestion app turns on JSON, HTML and Markdown compression and leaves prose untouched:

<PolicyCard
  name="compress_document_ingestion"
  stage="request"
  priority={500}
  when={[{ field: "Application", op: "is", value: "Doc Ingestion Pipeline" }]}
  then={[
    { effect: "JSON compression", value: "true" },
    { effect: "HTML to text", value: "true" },
    { effect: "Markdown to text", value: "true" },
  ]}
/>

## Related

- [MCP Gateway token saving](../../mcp-gateway/protect/token-saving)
- [Prompt store](./prompt-store)
- [Costs and savings](../../console/observe/costs-and-savings)
