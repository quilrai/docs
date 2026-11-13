---
sidebar_position: 3
sidebar_label: "Token saving"
sidebar_custom_props:
  icon: Coins
aliases: [token saving]
description: "Reduce request tokens with automatic gateway transforms, or use the standalone SDK endpoint to choose methods and receive optimized text with savings estimates."
console_path: []
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Token saving

Updated on 3 November 2026.

Reduce tokens sent to the provider with request compression and tool-output cleanup. The Policy Engine can also reuse an eligible cached response. Your application keeps using its existing API.

For optimization from your own application code, use [standalone SDK token savings](../apps-and-providers/sdk-token-savings). It accepts a text string and an explicit choice of seven methods, returns the final text and savings estimates, and supports deterministic, cache-friendly prompt preparation without routing an LLM call through the gateway.

<VideoEmbed id="ai-gateway-token-saving" />

## Configure this control

Choose the mode used by your gateway. When the Policy Engine is on, published rules govern this control; classic values saved through **Edit anyway** apply only after the engine is disabled. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Turn it on for an app {#turn-it-on-for-an-app}

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Token Saving"
/>

Turn on each strategy that matches the traffic the app sends. Apps with any strategy on show a **Token saving** flag in the app list.

![Token Saving strategies with Smart JSON compression, HTML to text, Markdown to text and Text compression, each with a before and after example](/img/llm-gateway/ui/app-token-saving-strategies.png)

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine {#going-further-with-the-policy-engine}

1. Open **Govern > Policy Engine > LLM Gateway > Controls > Token Savings**.
2. Start from a recipe, such as **Turn on request compression** or **Clean up tool output**, or use a section's add menu.
3. Choose **Applies to** and the settings to change, then **Save to draft**.
4. Use **Test**, then **Review & publish** to make the rules live.

| Section | What it changes |
|---|---|
| **Smart JSON compression** | Compress eligible JSON before it reaches the provider. |
| **HTML to text** | Keep text from HTML in requests. |
| **Markdown to text** | Remove Markdown formatting in requests. |
| **Text compression** | Shorten prose before it is sent. This can reword text. |
| **Minify JSON tool outputs** | Remove whitespace from JSON tool outputs. |
| **Clean up tool output** | Remove color codes, progress bars and repeated lines. |
| **Remove encoded content** | Replace long base64 content in tool outputs with a size note; the model no longer receives that content. |
| **Response cache** | Answer eligible repeat requests from a stored response rather than sending every request to the provider. Choose Exact, Normalized or Semantic matching. |

Each switch resolves separately: highest priority wins, and **On** wins equal-priority ties. **Off** only exempts a scope when it outranks the matching On rule. Without a matching rule, request bodies are unchanged and requests go to the provider.

Use narrower scopes to enable only the transformations a pipeline needs. For example, compress structured retrieval results without rewording prose, or exempt one application at a higher priority.

### Response cache

Response caching is separate from compression and from a provider's prompt cache. It returns an earlier answer for an eligible repeat of a non-streaming request, without a new provider call. A repeat can be exact, differ only in case, punctuation or filler words (Normalized), or be the same question in other words (Semantic). Use it only where reusing that answer is appropriate. See [Response cache](./response-cache) for match modes, safety checks and production results. [Keep prompt cache warm](./routing-and-fallbacks#keep-prompt-cache-warm) instead maintains the provider's prompt cache; the model still answers the request.

</TabItem>
</Tabs>

## Strategies {#strategies}

| Strategy | What it does | Before | After |
|----------|--------------|--------|-------|
| **Smart JSON compression** | Compacts eligible JSON objects and arrays, converting to TOON where that saves more. Best for tool results and structured data. Up to about 20% savings. | `{"name": "John", "age": 30}` | `name:John\|age:30` |
| **HTML to text** | Strips HTML markup down to readable text. | `<p><b>Hello</b> world</p>` | `Hello world` |
| **Markdown to text** | Strips Markdown syntax that costs tokens without adding meaning. | `## Hello **world**` | `Hello world` |
| **Text compression** | Removes low-value prose and separator noise from long text while keeping its meaning. Structured-looking lines are left alone. | `Please review the following statement and the context which was actually very repetitive.` | `Review statement and context.` |

A transform only applies when it reduces token usage. Savings appear as **Tokens saved** in the app's Analytics tab and per request in **Activity > Requests**, and tenant-wide in [Costs and savings](../../console/observe/costs-and-savings).

Turn on only the methods that match your traffic. A retrieval app that sends JSON search results and Markdown snippets can enable Smart JSON compression and Markdown to text without enabling every transform.

## Shared with the MCP Gateway {#shared-with-the-mcp-gateway}

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

## Related {#related}

- [Standalone SDK token savings](../apps-and-providers/sdk-token-savings)
- [MCP Gateway token saving](../../mcp-gateway/protect/token-saving)
- [Response cache](./response-cache)
- [Prompt store](./prompt-store)
- [Costs and savings](../../console/observe/costs-and-savings)
