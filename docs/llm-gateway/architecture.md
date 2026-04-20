---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the QuilrAI LLM Gateway processes every request - from your application to the LLM provider and back.

<ArchitectureDiagram
  source={{
    label: "Your Application",
    code: `client = OpenAI(
    base_url='https://guardrails.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx'
)
client.chat.completions.create(
    model='gpt-4o',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)`,
  }}
  gateway={{
    label: "QuilrAI LLM Gateway",
    phases: [
      {
        label: "Validate",
        stages: [
          { label: "Identity & Auth", items: ["JWT / header validation", "Domain allowlist", "Per-user tracking"] },
          { label: "Rate Limits", items: ["Req/min, hr, day limits", "Token budgets", "Key expiration"] },
        ],
      },
      {
        label: "Scan",
        stages: [
          { label: "PII / PHI / PCI", items: ["Contextual detection", "Exact data matching", "Block / redact / anonymize"] },
          { label: "Adversarial Detection", items: ["Prompt injection", "Jailbreak detection", "Social engineering"] },
          { label: "Custom Intents", items: ["User-defined categories", "Example-trained classifier"] },
        ],
      },
      {
        label: "Transform",
        stages: [
          { label: "Prompt Store", items: ["Centralized prompts", "Template variables", "Enforce prompt-only mode"] },
          { label: "Token Saving", items: ["JSON compression", "HTML/MD stripping", "Input-only, same accuracy"] },
        ],
      },
      {
        label: "Route",
        stages: [
          { label: "Request Routing", items: ["Weighted load balancing", "Automatic failover", "Multi-provider groups"] },
        ],
      },
    ],
    footer: "Logging  ·  Cost Tracking  ·  Analytics  ·  Red Team Testing",
  }}
  destination={{
    label: "LLM Providers",
    items: ["OpenAI", "Anthropic", "Azure OpenAI", "AWS Bedrock", "Vertex AI", "Custom Endpoints"],
  }}
/>

## Pipeline Stages

Every API request flows through these stages in order. Each stage is independently configurable per API key from the dashboard.

| Stage | Description | Details |
|-------|-------------|---------|
| **Identity & Auth** | Validates request identity via JWT, JWKS, or header. Enforces domain restrictions. | [Identity Aware →](./features/identity-aware) |
| **Rate Limits** | Enforces request rates, token budgets, and key expiration before reaching the provider. | [Rate Limits →](./features/rate-limits) |
| **Security Guardrails** | Detects PII, PHI, PCI, and financial data. Catches prompt injection, jailbreak, and social engineering. | [Security Guardrails →](./features/security-guardrails) |
| **Custom Intents** | User-defined detection categories trained with positive and negative examples. | [Custom Intents →](./features/custom-intents) |
| **Prompt Store** | Resolves centralized system prompts by ID with template variable substitution. | [Prompt Store →](./features/prompt-store) |
| **Token Saving** | Compresses input tokens - JSON to TOON, HTML/Markdown to plain text. Responses unchanged. | [Token Saving →](./features/token-saving) |
| **Request Routing** | Routes to the optimal provider using weighted load balancing with automatic failover. | [Request Routing →](./features/request-routing) |

## Response Path

Responses from the LLM provider pass back through the **security guardrails** for output scanning before being returned to your application. The same detection categories and configurable actions (block, redact, anonymize, monitor) apply to both requests and responses.

Non-streaming chat completions, Anthropic Messages, Vertex/Gemini `generateContent`, and the OpenAI Responses API all follow the full request → scan → forward → scan → return pipeline. For **streaming** responses (SSE), request-side scanning runs as usual but response-side scanning is skipped so chunks pass straight through; request-side prediction results are still logged. **Realtime** websocket sessions are a raw passthrough today - neither request-side nor response-side DLP runs on live Realtime events, though session-level logs are still recorded.

## Observability

Every request is logged with cost, latency, token counts, and guardrail actions. Use the **Logs** tab to review request history and the **Red Team Testing** tool to [validate your guardrail configuration](./features/red-team-testing) against adversarial prompts.
