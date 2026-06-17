---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the QuilrAI MCP Gateway processes every tool call - from your AI agent to the MCP server and back.

<ArchitectureDiagram
  source={{
    label: "Your AI Agent",
    code: `// claude_desktop_config.json
{
  "mcpServers": {
    "github": {
      "url": "https://mcp.quilr.ai/mcp/github/"
    }
  }
}`,
  }}
  gateway={{
    label: "QuilrAI MCP Gateway",
    phases: [
      {
        label: "Authenticate",
        stages: [
          { label: "Bearer Token", items: ["API token auth", "mcpuser identity header", "Agent-scoped tokens"] },
          { label: "OAuth", items: ["Gateway proxy tokens", "Dynamic Client Registration", "OAuth passthrough"] },
        ],
      },
      {
        label: "Authorize",
        stages: [
          { label: "Agent Access", items: ["Per-MCP agent mapping", "User-Agent detection", "Custom agent support"] },
          { label: "Tool Controls", items: ["Risk categorization", "Per-tool enable/disable", "Hidden when disabled"] },
        ],
      },
      {
        label: "Scan",
        stages: [
          { label: "PII / PHI / PCI", items: ["Contextual detection", "Block / redact / anonymize"] },
          { label: "Adversarial Detection", items: ["Prompt injection", "Jailbreak detection", "Context corruption"] },
        ],
      },
      {
        label: "Policy (Web Search)",
        stages: [
          { label: "Domain Filtering", items: ["URL filter rules", "Category blocking", "Group-based policies"] },
          { label: "Enterprise Gateways", items: ["Zscaler ZIA", "Palo Alto Prisma Access", "FortiGate", "Cisco Umbrella"] },
        ],
      },
      {
        label: "Connect",
        stages: [
          { label: "OAuth → Token", items: ["Gateway holds OAuth creds", "Agents use Bearer token", "Auto token refresh"] },
          { label: "Token → Token", items: ["Direct token passthrough", "Gateway manages keys", "Credential rotation"] },
          { label: "Client OAuth → Upstream OAuth", items: ["Passthrough mode", "Client-owned upstream token", "No gateway refresh"] },
          { label: "No Auth → OAuth", items: ["Gateway adds auth layer", "Secures open MCPs", "OAuth / token required"] },
        ],
      },
    ],
    footer: "Logging  ·  Authorization  ·  Tool Safety  ·  Token Optimization",
  }}
  destination={{
    label: "MCP Servers",
    items: ["GitHub (OAuth)", "Slack (OAuth)", "Jira (Token)", "Web Search (Built-in)", "Internal APIs (No Auth)", "Custom MCPs"],
  }}
/>

## Pipeline Stages

Every MCP tool call flows through these stages in order. Each stage is independently configurable from the dashboard.

| Stage | Description | Details |
|-------|-------------|---------|
| **Bearer Token / OAuth** | Authenticates the agent via API token, gateway OAuth proxy token, OneMCP proxy token, or OAuth passthrough token. | [API Tokens →](./features/api-tokens) · [OAuth Connect →](./features/oauth-connect) |
| **Agent Access** | Controls which agents can access each MCP server. Matches User-Agent headers. | [Access Control →](./features/access-control) · [Agents Configuration →](./features/agents-configuration) |
| **Tool Controls** | Categorizes tools by risk level and lets admins enable or disable each tool individually. | [Tools Management →](./features/tools-management) |
| **Security Guardrails** | Detects PII, PHI, PCI, and financial data. Catches prompt injection, jailbreak, and social engineering. | [Security Guardrails →](./features/security-guardrails) |
| **Web Search Policy** | Enforces enterprise domain filtering rules on web search tool calls via connected security gateways. | [Web Search Policy →](./features/web-search-policy) |
| **Auth Mediation** | Converts between auth modes - handles OAuth for token-only agents, adds auth to unauthenticated MCPs. | [Integration Guide →](./integration-guide) |
| **OneMCP Aggregation** | Presents policy-accessible MCPs through one endpoint with tool discovery, native memory tools, and inline OAuth recovery. | [OneMCP →](./onemcp) |

## Response Path

Responses from MCP servers pass back through the **security guardrails** for output scanning before being returned to your agent. The same detection categories and configurable actions (block, redact, anonymize, monitor) apply to both tool call inputs and outputs.

## Auth Mediation

The gateway decouples agent authentication from MCP server authentication, supporting these modes:

| Mode | Agent Connects With | MCP Server Requires | Gateway Handles |
|------|--------------------|--------------------|-----------------|
| **OAuth → Token** | Bearer token | OAuth 2.0 | Holds OAuth credentials, manages token refresh |
| **Token → Token** | Bearer token | API token | Manages and relays credentials |
| **OAuth Passthrough** | Upstream OAuth token | OAuth 2.0 | Validates access controls, forwards the client-owned upstream token, and logs best-effort identity |
| **Static API Key** | Gateway API token or OAuth proxy token | Fixed API key, header, Bearer token, or query parameter | Injects the admin-owned upstream credential and strips client auth headers |
| **No Auth → OAuth** | OAuth / Bearer token | No authentication | Adds auth layer in front of open MCPs |

## Observability

Every tool call is logged with latency, guardrail actions, and agent identity. Use the dashboard to review request history, the [MCP Gateway Log Export API](./log-export-api) to export logs programmatically, and per-agent usage statistics to monitor adoption.
