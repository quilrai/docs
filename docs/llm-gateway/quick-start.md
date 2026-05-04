---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get up and running with the LLM Gateway in 4 steps.

<StepFlow steps={[
  {
    label: "Create API Key",
    items: [
      "Provider: OpenAI",
      "Models: gpt-4o, gpt-4o-mini",
      "Key: sk-quilr-•••",
    ],
  },
  {
    label: "Swap Base URL",
    items: [
      "base_url → guardrails.quilr.ai",
      "api_key → sk-quilr-•••",
      "SDK code: unchanged ✓",
    ],
  },
  {
    label: "Configure",
    items: [
      "PII detection: ON",
      "Rate limit: 100 req/min",
      "Routing: weighted group",
    ],
  },
  {
    label: "Monitor",
    items: [
      "Requests: 1,247",
      "Cost: $12.40",
      "Avg latency: 340ms",
    ],
  },
]} />

## 1. Create an API Key

Go to the **LLM Gateway** tab and click **Create New Key**. Select your provider (OpenAI, Anthropic, Azure, Bedrock, Bedrock Runtime boto3, Vertex AI, OpenAI Responses, OpenAI Realtime, Copilot Studio, or any OpenAI-compatible endpoint), choose which models to expose, and generate your key.

Your provider API key is stored securely - developers only see the QuilrAI proxy key.

:::info Pick the right provider for the endpoint you want to hit
Each QuilrAI endpoint is served only by matching provider types. A plain `OpenAI` chat-completions key cannot hit `/openai_responses/` or `/openai_realtime/` by swapping the URL - create the key with the `OpenAI Responses` / `OpenAI Realtime` provider (or their Azure variants), or add one as an additional provider on an existing key. See the [Provider Support](./provider-support) matrix.
:::

## 2. Swap the Base URL

Replace your provider's base URL with the QuilrAI gateway URL and use your QuilrAI key. Everything else - SDK, parameters, response format - stays exactly the same.

```python
# Point the client to QuilrAI's gateway
client = OpenAI(
    base_url='https://guardrails.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx'
)

# Everything below stays exactly the same
resp = client.chat.completions.create(
    model='gpt-4o',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

Replace `sk-quilr-xxx` with the API key you created in the dashboard.

## 3. Configure Your Key

Sane defaults are selected automatically. Change them when setting up the key or edit them later.

| Setting | Description |
|---------|-------------|
| **[Security Guardrails](./features/security-guardrails)** | PII/PHI/PCI detection, adversarial blocking |
| **[Rate Limits](./features/rate-limits)** | Requests per min/hr/day, token budgets |
| **[Request Routing](./features/request-routing)** | Multi-provider load balancing and failover |
| **[Token Saving](./features/token-saving)** | JSON compression, HTML/MD to text |
| **[Prompt Store](./features/prompt-store)** | Centralized system prompts |
| **[Identity Aware](./features/identity-aware)** | Per-user auth and tracking |

## 4. Monitor Requests

Every request through the gateway is logged with **cost, latency, token counts, and guardrail actions**. Check your **Logs** tab to verify requests are flowing through.

---

**Next step:** See the [Integration Guide](./integration-guide) for full code examples with cURL, JavaScript, region options, and more.
