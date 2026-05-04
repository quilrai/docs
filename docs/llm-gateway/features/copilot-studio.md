---
sidebar_position: 11
sidebar_custom_props:
  badge: new
  icon: Bot
---

# Copilot Studio

Connect Microsoft Copilot Studio external threat detection to QuilrAI guardrails.

Copilot Studio calls QuilrAI before a tool executes. QuilrAI scans the user's recent prompt context and proposed tool inputs, then returns an allow/block decision. This is SDK-style guardrail enforcement; QuilrAI does not proxy an upstream LLM request for this integration.

## When to use it

Use the Copilot Studio integration when you want to:

- Block sensitive data before a Copilot tool receives it
- Prevent risky tool inputs generated from a user prompt
- Log Copilot tool-execution checks alongside other QuilrAI gateway logs
- Apply the same PII, PHI, PCI, financial, adversarial, and custom-intent policies you use elsewhere

Microsoft external threat detection is called for generative agents that use generative orchestration. Microsoft skips this flow for classic agents.

## Endpoint

Create a QuilrAI key with provider `copilot_studio`, then use this endpoint as the external threat detection base URL:

```text
https://guardrails.quilr.ai/copilot_studio/sk-quilr-xxx
```

Use the regional base URL if your tenant uses a regional QuilrAI deployment:

| Endpoint | Region | Endpoint base |
|----------|--------|---------------|
| Global (auto-routed) | Nearest | `https://guardrails.quilr.ai/copilot_studio/sk-quilr-xxx` |
| USA | US East | `https://guardrails-usa-1.quilr.ai/copilot_studio/sk-quilr-xxx` |
| India | Mumbai | `https://guardrails-india-1.quilr.ai/copilot_studio/sk-quilr-xxx` |

Treat this URL as a secret. The QuilrAI key is part of the path because Copilot Studio owns the webhook call shape.

## Routes

Copilot Studio appends these paths to the endpoint base:

| Route | Purpose |
|-------|---------|
| `POST /validate` | Checks that the QuilrAI endpoint is reachable and ready. |
| `POST /analyze-tool-execution` | Sends proposed tool execution context for allow/block evaluation. |

For example, if the endpoint base is `https://guardrails.quilr.ai/copilot_studio/sk-quilr-xxx`, Copilot Studio calls:

```text
https://guardrails.quilr.ai/copilot_studio/sk-quilr-xxx/validate
https://guardrails.quilr.ai/copilot_studio/sk-quilr-xxx/analyze-tool-execution
```

Copilot Studio may also include an `api-version` query parameter. QuilrAI ignores unknown query parameters.

## Power Platform setup

1. In QuilrAI, create an LLM Gateway API key with provider `copilot_studio`.
2. Copy the full endpoint base URL, including the `sk-quilr-...` key.
3. Follow Microsoft's external threat detection setup to configure the Microsoft Entra application required by Power Platform.
4. Open Power Platform admin center.
5. Go to **Security** and then **Threat detection**.
6. Select **Additional threat detection**.
7. Select the environment, then select **Set up**.
8. Enable **Allow Copilot Studio to share data with a threat detection provider**.
9. Enter the Microsoft Entra App ID requested by Power Platform.
10. Enter the QuilrAI endpoint base URL as the endpoint link.
11. Choose the Power Platform error behavior and save.

Microsoft documents the setup flow in [Enable external threat detection and protection for Copilot Studio custom agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/external-security-provider). Their webhook contract is documented in [Build a runtime threat detection system for Copilot Studio agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/external-security-webhooks-interface-developers).

## What QuilrAI scans

For `analyze-tool-execution`, QuilrAI scans:

- Recent user messages from `plannerContext.chatHistory`
- `plannerContext.userMessage` when chat history does not provide user text
- Scalar values inside `inputValues`, including nested object and array values

QuilrAI stores Copilot metadata for review, including conversation ID, tool name, tool ID, correlation ID, and user/tenant identifiers when Copilot provides them.

If Copilot includes a bearer token, QuilrAI uses available claims such as `email`, `preferred_username`, `upn`, `oid`, `sub`, and `tid` for identity-aware logging. The webhook is authenticated by the QuilrAI key in the endpoint path.

## Decision behavior

| QuilrAI result | Copilot response |
|----------------|------------------|
| Allowed or monitored | `{"blockAction": false}` |
| Blocked | `{"blockAction": true, "reasonCode": 112, ...}` |
| Redacted, anonymized, or partial-redacted | Blocked |
| No user input/tool values found | Allowed with `reason: "no_user_input"` |
| DLP timeout/internal error | Allowed with fail-open diagnostics |

Copilot Studio expects a fast decision. QuilrAI returns a fail-open allow decision on DLP timeout or internal DLP errors so the agent flow is not broken by transient guardrail service issues.

Redaction-style actions become blocks because Copilot Studio cannot accept rewritten tool input from the external threat detection response. Use monitor actions for detections you want to observe without blocking.

## Response examples

Allow:

```json
{
  "blockAction": false
}
```

Block:

```json
{
  "blockAction": true,
  "reasonCode": 112,
  "reason": "content_blocked",
  "diagnostics": "{\"reason\":\"content_blocked\",\"categories\":[\"email\"]}"
}
```

Validation:

```json
{
  "isSuccessful": true,
  "status": "OK"
}
```

## Troubleshooting

| Error | Cause |
|-------|-------|
| `Invalid Copilot Studio API key in path` | The endpoint URL does not include a valid `sk-quilr-*` key. |
| `The provided Copilot Studio API key is invalid or has been revoked` | The key was deleted or does not exist. |
| `The provided Copilot Studio API key has expired` | The QuilrAI key has expired. |
| `This endpoint requires a copilot_studio API key` | The key exists but was created for another provider. |
| Power Platform cannot save the endpoint | Check the endpoint URL, Microsoft Entra app configuration, and Power Platform admin permissions. |
