---
sidebar_position: 22
sidebar_custom_props:
  icon: Globe
description: "Minimal two-tool web search and webpage retrieval integration with optional gateway domain policy."
---

# Quilr Web Search

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">MINIMAL WEB ACCESS</span><h2>Two tools. No research-suite overhead.</h2><p>Managed web search and selected-page retrieval with optional domain policy.</p></div>

<McpDecision
  officialTitle="Choose Tavily for research depth"
  official="Use the Tavily integration when agents need mapping, crawling, deep research jobs, or provider usage reporting beyond ordinary search."
  officialPoints={['Full research lifecycle', 'Provider-specific controls and usage']}
  quilrTitle="Choose the smallest web surface"
  quilr="Use Quilr Web Search when the job is simply finding sources and retrieving selected pages under optional destination policy."
  quilrPoints={['Only two agent tools', 'Managed access with domain controls']}
  verdict="Do not expose a research suite to an agent that only needs search. Start minimal and expand when the workflow proves it needs more."
/>

| Capability | Quilr Web Search | Tavily |
|---|:---:|:---:|
| General web search | ✅ | ✅ |
| Result limit and location | ✅ | ✅ |
| Domain filters | ✅ | ✅ |
| Retrieve selected webpages | ✅ | ✅ Extract |
| Site mapping and crawl | - | ✅ |
| Deep research jobs | - | ✅ |
| Provider usage reporting | - | ✅ |
| Smallest possible tool surface | ✅ | - |

Administrators can apply your Zscaler (ZIA) URL policy and domain exclusions to search results. See [Web search security](../protect/web-search-security).
