---
sidebar_position: 20
sidebar_custom_props:
  icon: Globe
---

# Tavily

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">WEB RESEARCH</span><h2>Search is only the first step.</h2><p>Eight read-only tools for search, extraction, mapping, crawling, research jobs, and usage.</p></div>

<McpDecision
  officialTitle="Choose basic Tavily for search"
  official="Use Tavily's basic MCP setup when search and URL extraction are sufficient and provider-style API-key configuration is acceptable."
  officialPoints={['Simple search and extraction', 'Familiar provider setup']}
  quilrTitle="Choose Quilr for the research lifecycle"
  quilr="Use Quilr when agents also need site mapping, bounded crawling, asynchronous deep research, usage reporting, and managed authentication."
  quilrPoints={['Eight read-only tools', 'Search through research-job completion']}
  verdict="For only search and retrieval, use the smaller Web Search surface. Choose Tavily when the workflow genuinely needs research depth."
/>

| Capability | Tavily Basic MCP Docs | Quilr Tavily |
|---|:---:|:---:|
| Web search | ✅ | ✅ |
| URL extraction | ✅ | ✅ |
| Site map | - | ✅ |
| Bounded crawl | - | ✅ |
| Start and check deep research | - | ✅ |
| Usage reporting | - | ✅ |
| API-key information | - | ✅ Plan-dependent |
| API key embedded in MCP URL | Common setup | - Collected through auth flow |

For only search and webpage retrieval, choose the smaller [Quilr Web Search](./web-search) surface.
