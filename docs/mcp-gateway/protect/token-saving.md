---
sidebar_position: 11
sidebar_label: "Token saving"
sidebar_custom_props:
  icon: Coins
description: "Per-server strategies that shorten tool results (smart JSON compression, HTML to text, Markdown to text, text compression) and where savings appear."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Token saving

Updated on 3 November 2026.

Compress tool results before they reach the model, so agents use fewer tokens on each MCP call.

<VideoEmbed id="ai-gateway-token-saving" />

Choose the instructions for the mode that governs your MCP Gateway. See [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what happens to stored settings when the engine is on.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Configure it on the server

<ConsolePath
  console="WhiteMatter console"
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

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine

Open **Govern > Policy Engine > MCP Gateway > Controls > Token Savings**. Published policies govern tool-result transforms while the engine is on; stored classic values are used when it is off.

| Section | What it changes |
|---|---|
| **Smart JSON compression** | Compacts eligible JSON results. |
| **HTML to text** | Removes HTML markup. |
| **Markdown to text** | Removes Markdown formatting. |
| **Text compression** | Shortens verbose plain text. |
| **Strip base64 content** | Replaces encoded content with a size note. That content is no longer available to the model. |

1. Choose a recipe for a transform or start a blank rule in its section.
2. Choose **Applies to**: a server, tool, person, Smart Group, agent, or route.
3. Set only the switches you want to change, check **Reads as**, and **Save to draft**.
4. [Test and publish](../../console/govern/author-simulate-and-publish) the change.

Each switch resolves independently: highest numeric priority wins, with **On** winning ties. An Off exemption must outrank the matching On rule. With no rule, responses return as the server sends them.

Base64 stripping removes information rather than merely shortening its representation. Enable it only where the model does not need the encoded payload.

Open **Activity** to review observed activity for this control. [OneMCP Features](../get-started/onemcp#onemcp-settings) separately controls dynamic discovery and short tool lists.

</TabItem>
</Tabs>

## Where savings show

| Place | What you see |
|-------|--------------|
| Server card | **Token saving** chip (**Yes** / **No**) and **tokens saved** for the period. |
| **Overall analytics > Overview** | Response-token savings across servers in [MCP Gateway Insights](../monitor/analytics-and-insights). |
| **Costs & Savings** | Savings from the MCP channel. |

## OneMCP saves tokens too

[OneMCP](../get-started/onemcp) reduces the tokens agents use to discover tools. With dynamic tool calling on, an agent receives a small set of tools instead of every server's full tool list:

| Tool | Purpose |
|------|---------|
| `list_mcp_connections` | Lists the MCP servers the person can use and whether each is connected. |
| `find_relevant_tools` | Finds the tools that fit the current task. |
| `call_tool` | Calls the chosen tool. |

Set it with the **OneMCP endpoint** button in the MCP Gateway header, under **Dynamic tool calling** (**User preference**, **Always on** or **Always off**).

To shorten the tool list itself, per server and on the server's own address too, see [Tool lists](./tool-lists): the server's most-used tools in full and every other tool one search away.

## Related

- [Group and user rules](./group-and-user-rules) - turn strategies on or off for a smart group or user.
- [Security guardrails](./security-guardrails) - scan tool results before they are shortened.
- [Tool lists](./tool-lists) - send a server's most-used tools and keep the rest one search away.
- [OneMCP](../get-started/onemcp) - one endpoint with dynamic tool calling.
- [LLM Gateway token saving](../../llm-gateway/cost-and-traffic/token-saving) - the shared compression methods.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
