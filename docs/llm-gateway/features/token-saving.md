---
sidebar_position: 2
sidebar_custom_props:
  icon: Coins
---

# Token Saving

Rewrite request content into fewer tokens before it reaches the provider. Responses are returned untouched, and your code does not change.

Open the app's **Settings > Token Saving** (under **Optimization & policy**). Turn on each strategy that matches the traffic the app sends.

![Token Saving strategies with Smart JSON compression, HTML to text, Markdown to text and Text compression, each with a before and after example](/img/llm-gateway/ui/app-token-saving-strategies.png)

:::note Policy Engine
When the Policy Engine is on, token saving policies (the **Token Savings** card) apply instead. See [App settings under the Policy Engine](../../policy-engine/llm-gateway#app-settings-under-the-policy-engine).
:::

## Strategies

| Strategy | What it does | Before | After |
|----------|--------------|--------|-------|
| **Smart JSON compression** | Compacts eligible JSON objects and arrays, converting to TOON where that saves more. Best for tool results and structured data. Up to about 20% savings. | `{"name": "John", "age": 30}` | `name:John\|age:30` |
| **HTML to text** | Strips HTML markup down to readable text. | `<p><b>Hello</b> world</p>` | `Hello world` |
| **Markdown to text** | Strips Markdown syntax that costs tokens without adding meaning. | `## Hello **world**` | `Hello world` |
| **Text compression** | Removes low-value prose and separator noise from long text while keeping its meaning. Structured-looking lines are left alone. | `Please review the following statement and the context which was actually very repetitive.` | `Review statement and context.` |

A transform only applies when it reduces token usage. Savings appear as **Tokens saved** in the app's Analytics tab and per request in **Activity > Requests**.

## Configuration keys

For the [Management APIs](../management-apis/overview), the same switches are:

```json
{
  "smart_json_compression": false,
  "html_to_text": false,
  "markdown_to_text": false,
  "text_compression": false
}
```
