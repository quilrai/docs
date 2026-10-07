---
sidebar_position: 11
sidebar_label: "Token saving"
sidebar_custom_props:
  icon: Coins
---

# Token Saving

Compress tool results before they reach the model, so agents use fewer tokens on each MCP call.

Go to **Settings > AI Gateway > MCP Gateway** and click **Configure > Token Saving** on the server card. The **Strategies** card reads: "Rewrites tool results on the way back to the client to cut model token usage." New servers have every strategy off.

![Token saving section with the Strategies card showing Active strategies and switches for Smart JSON compression, HTML to text, Markdown to text and Text compression](/img/mcp-gateway/ui/settings-token-saving.png)

:::note Policy Engine
When the Policy Engine is on, response handling policies apply instead and this section is read-only. **Edit anyway** changes the values used only if the Policy Engine is turned off. See [MCP Gateway policies](../../console/govern/policy-engine).
:::

## Strategies

| Strategy | What it does | Turn it on when the server returns |
|----------|--------------|------------------------------------|
| **Smart JSON compression** | Compacts verbose JSON tool results before they reach the model. | Large JSON objects or lists. |
| **HTML to text** | Strips HTML markup from tool results and keeps the readable text. | Web pages, HTML emails or reports. |
| **Markdown to text** | Flattens Markdown formatting in tool results. | Markdown documents or wiki pages. |
| **Text compression** | Compresses long text results while preserving meaning. | Long plain text. |

Turn on the strategies that match what the server returns, then click **Save settings** in the footer. The **Active strategies** bar and the section list (for example **2 of 4 strategies on**) show how many are on.

Token saving runs after guardrails, so detections are made on the full tool result.

## Where savings show

| Place | What you see |
|-------|--------------|
| Server card | **Token saving** chip (**Yes** / **No**) and **tokens saved** for the period. |
| **Overall analytics > Analytics** | The **Tokens saved** tile across servers. |
| **Costs & Savings** | Savings from the MCP channel. |

## OneMCP saves tokens too

[OneMCP](../get-started/onemcp) reduces the tokens agents use to discover tools. With dynamic tool calling on, an agent receives a small set of tools instead of every server's full tool list:

| Tool | Purpose |
|------|---------|
| `list_mcp_connections` | Lists the MCP servers the person can use and whether each is connected. |
| `find_relevant_tools` | Finds the tools that fit the current task. |
| `call_tool` | Calls the chosen tool. |

Set it under **OneMCP endpoint > Dynamic tool calling**.

## Related

- [Group & User Rules](./group-and-user-rules) - turn strategies on or off for a smart group or user.
- [Security Guardrails](./security-guardrails) - scan tool results before they are shortened.
- [OneMCP](../get-started/onemcp) - one endpoint with dynamic tool calling.
