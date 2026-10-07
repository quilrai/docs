---
sidebar_position: 3
sidebar_label: "Architecture"
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the QuilrAI LLM Gateway processes every request - from your application to the LLM provider and back.

<ArchitectureDiagram
  source={{
    label: "Your Application",
    code: `client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
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
          { label: "PII / PHI / PCI", items: ["Contextual detection", "Block / redact / anonymize"] },
          { label: "Adversarial Detection", items: ["Prompt injection", "Jailbreak detection", "Social engineering"] },
          { label: "Custom Intents", items: ["User-defined categories", "Example-trained classifier"] },
          { label: "Guardian Agent", items: ["Dependency review", "Task adherence", "Monitor / nudge / block"] },
        ],
      },
      {
        label: "Transform",
        stages: [
          { label: "Prompt Store", items: ["Centralized prompts", "Combine refs + inline text", "Template variables", "Require store reference"] },
          { label: "Token Saving", items: ["JSON compression", "HTML/MD to text", "Input-only, text compression"] },
        ],
      },
      {
        label: "Route",
        stages: [
          { label: "Request Routing", items: ["Weighted load balancing", "Automatic failover", "Multi-provider groups"] },
        ],
      },
    ],
    footer: "Logging  ·  Cost Tracking  ·  Analytics",
  }}
  destination={{
    label: "LLM Providers",
    items: ["OpenAI", "Anthropic", "Azure OpenAI", "AWS Bedrock", "Vertex AI", "Sarvam", "Custom Endpoints"],
  }}
/>

## Pipeline Stages

Every API request flows through these stages in order. Each stage is independently configurable per API key from the dashboard.

| Stage | Description | Details |
|-------|-------------|---------|
| **Identity & Auth** | Validates request identity via JWT, JWKS, or header. Enforces domain restrictions. | [Identity Aware →](../protect/identity-and-network-trust) |
| **Rate Limits** | Enforces request rates, token budgets, and key expiration before reaching the provider. | [Rate Limits →](../cost-and-traffic/rate-token-and-budget-limits) |
| **Security Guardrails** | Detects PII, PHI, PCI, and financial data. Detects prompt injection, jailbreaks, and social engineering. | [Security Guardrails →](../protect/security-guardrails) |
| **Custom Intents** | Detects user-defined categories trained with positive and negative examples. | [Custom Intents →](../protect/custom-detections) |
| **Guardian Agent** | Adds dependency-safety guidance, reviews generated dependency output, and keeps agent requests aligned to the system prompt. | [Guardian Agent →](../protect/guardian-agent) |
| **Prompt Store** | Resolves one or more centralized system prompts by ID, allows inline instructions alongside references, and substitutes template variables. | [Prompt Store →](../cost-and-traffic/prompt-store) |
| **Token Saving** | Compresses input tokens - JSON to TOON, HTML/Markdown to plain text, and verbose prose compression. Leaves responses unchanged. | [Token Saving →](../cost-and-traffic/token-saving) |
| **Request Routing** | Routes to the optimal provider using weighted load balancing with automatic failover. | [Request Routing →](../cost-and-traffic/routing-and-fallbacks) |

## Response Path

Responses from the LLM provider pass back through the **security guardrails** for output scanning before being returned to your application. The same detection categories and configurable actions (block, redact, anonymize, monitor) apply to both requests and responses. When [Guardian Agent](../protect/guardian-agent) coding helpers are enabled, non-streaming responses can also be reviewed for dependency vulnerabilities and outdated exact pins before final delivery.

Non-streaming chat completions, including provider-native models reached through OpenAI-compatible translations such as Bedrock `Converse`, Vertex AI Gemini `generateContent`, and Anthropic Messages, native Anthropic Messages, AWS Bedrock Runtime boto3 `converse` / supported `invoke_model`, native Vertex/Gemini `generateContent`, the OpenAI Responses API, and the Sarvam translation, transliteration, and language detection APIs all follow the full request -> scan -> forward -> scan -> return pipeline. Sarvam speech is scanned on the side that carries text: synthesis on the request, transcription on the response. For **streaming** responses (SSE), request-side scanning runs as usual but response-side scanning is skipped so chunks pass through unchanged; request-side prediction results are still logged. AWS Bedrock Runtime `converse_stream` follows the same request-scan / response-passthrough pattern for AWS EventStream responses. **Realtime** websocket sessions pass through unchanged - neither request-side nor response-side DLP runs on live Realtime events, though session-level logs are still recorded.

Copilot Studio is different from LLM proxy routes: Copilot calls QuilrAI before tool execution, QuilrAI scans the user context and proposed tool input values, and the response is only an allow/block decision.

## Observability

Every request is logged with cost, latency, token counts, and guardrail actions. Use the app card's **Logs** button (the **Activity** tab) to review request history, the [LLM Gateway Log Export API](../api-reference/log-export-api) to export logs programmatically, and **LLM Intelligence Assessment** on **Assessments > Red Teaming** to [validate your guardrail configuration](../../red-teaming/assessments/llm-intelligence-assessment) against adversarial prompts.
