---
sidebar_position: 11
sidebar_label: "Token saving"
sidebar_custom_props:
  icon: Coins
description: "Per-server strategies that shorten tool results (smart JSON compression, HTML to text, Markdown to text, text compression) and where savings appear."
---

# Token saving

Compress tool results before they reach the model, so agents use fewer tokens on each MCP call.

<VideoEmbed id="ai-gateway-token-saving" />

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Token Saving"
/>

The **Strategies** card reads: "Rewrites tool results on the way back to the client to cut model token usage." New servers have every strategy off.

![Token saving section with the Strategies card showing Active strategies and switches for Smart JSON compression, HTML to text, Markdown to text and Text compression](/img/mcp-gateway/ui/settings-token-saving.png)

### Strategies

| Strategy | What it does | Turn it on when the server returns |
|----------|--------------|------------------------------------|
| **Smart JSON compression** | Compacts verbose JSON tool results before they reach the model. | Large JSON objects or lists. |
| **HTML to text** | Strips HTML markup from tool results and keeps the readable text. | Web pages, HTML emails or reports. |
| **Markdown to text** | Flattens Markdown formatting in tool results. | Markdown documents or wiki pages. |
| **Text compression** | Compresses long text results while preserving meaning. | Long plain text. |

Turn on the strategies that match what the server returns, then click **Save settings** in the footer. The **Active strategies** bar and the section list (for example **2 of 4 strategies on**) show how many are on.

Token saving runs after guardrails, so detections are made on the full tool result. The four strategies are the same methods the LLM Gateway applies to requests; see [LLM Gateway token saving](../../llm-gateway/cost-and-traffic/token-saving) for a before-and-after example of each.

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

Set it with the **OneMCP endpoint** button in the MCP Gateway header, under **Dynamic tool calling** (**User preference**, **Always on** or **Always off**).

## Going further with the Policy Engine

When the Policy Engine is on for the MCP Gateway, this section turns read-only and the **Token Savings** card (stage 4, Response) in **Govern > Policy Engine > MCP Gateway** applies instead. **Edit anyway** changes the stored values, which are used only if the Policy Engine is disabled (see [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings)). The card has one effect per strategy: **smart JSON compression**, **HTML to text**, **Markdown to text** and **text compression**.

Scenarios the card supports that server settings cannot:

- **Compress by tool, not by server.** Match **tool name** or tags, so only the tools that return large payloads are compressed.
- **Compress for some callers or agents.** Match **smart groups** or **agent name**, for example compress results only for an agent with a small context window.
- **Compress on one route.** Match **route kind** to treat OneMCP traffic differently from direct connections.

<PolicyCard
  name="compress_web_search"
  stage="response"
  priority={400}
  when={[{ field: "MCP name", op: "is", value: "Web Search" }]}
  then={[
    { effect: "smart JSON compression", value: "true" },
    { effect: "HTML to text", value: "true" },
  ]}
/>

The OneMCP side has its own card. **OneMCP Features** (stage 1, Session) sets OneMCP dynamic tools and memory per caller, for example turning dynamic tools off for one smart group.

## Related

- [Group and user rules](./group-and-user-rules) - turn strategies on or off for a smart group or user.
- [Security guardrails](./security-guardrails) - scan tool results before they are shortened.
- [OneMCP](../get-started/onemcp) - one endpoint with dynamic tool calling.
- [LLM Gateway token saving](../../llm-gateway/cost-and-traffic/token-saving) - the shared compression methods.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
