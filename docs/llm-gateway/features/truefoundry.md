---
sidebar_position: 10.5
sidebar_custom_props:
  badge: new
  icon: Plug
---

# TrueFoundry Integration

Use QuilrAI as a custom guardrail in TrueFoundry AI Gateway to scan, redact, or block LLM inputs and outputs. Your application continues calling TrueFoundry. TrueFoundry calls QuilrAI for the configured checks and applies the result before forwarding the input or returning the output.

The integration uses a dedicated [SDK Mode](./sdk-mode) endpoint:

```text
POST https://guardrails-usa-2.quilr.ai/sdk/v1/check/truefoundry
```

The example uses US East. Choose your [regional base URL](../integration-guide#region) or your QuilrAI deployment URL and append `/sdk/v1/check/truefoundry`. Both input and output guardrails use this same endpoint.

## 1. Create a QuilrAI SDK key

Create a QuilrAI app/key with provider **`quilr_sdk`** and configure its [security guardrails](./security-guardrails). Select the categories, sensitivities, actions, and request/response scopes you want TrueFoundry to enforce.

For example, enable PII detection with **redact** and scope **both** to redact detected PII on input and output. Use **block** to reject detected content or **monitor** to record findings while leaving content unchanged.

There are two separate credentials in this integration:

| Connection | Credential |
| --- | --- |
| Your application to TrueFoundry | Your existing TrueFoundry API key |
| TrueFoundry to QuilrAI | The QuilrAI SDK key, `sk-quilr-...` |

Regular QuilrAI LLM proxy keys are rejected by the SDK endpoint. Guardrail settings come from the authenticated QuilrAI app and its effective policy. The TrueFoundry **Config** field does not override those settings.

## 2. Add the custom guardrail in TrueFoundry

In TrueFoundry, open **AI Gateway → Guardrails**, create or select a guardrails group, and add a **Custom Guardrail** configuration. The examples below use group `quilr` and configurations `sdk-input` and `sdk-output`.

| Setting | Value |
| --- | --- |
| URL | `https://guardrails-usa-2.quilr.ai/sdk/v1/check/truefoundry`, adjusted for your deployment |
| Operation | **Mutate**, so TrueFoundry applies redacted content and policy blocks |
| Auth Data | **Custom Bearer Auth**, with your QuilrAI SDK key as the token |
| Config | `{}` |
| Enforcement strategy | **Enforce** or **Enforce But Ignore On Error** to apply policy blocks |
| Timeout | TrueFoundry's default is 10 seconds. Allow enough time for the QuilrAI checks you enable, especially image scanning and Guardian checks. |

TrueFoundry sends `Authorization: Bearer sk-quilr-...` to QuilrAI. The configured URL must be reachable from the TrueFoundry gateway. If your QuilrAI key restricts source IPs, allow the gateway's outbound IP.

**Mutate** is required for redaction. **Validate** ignores replacement content and can run input checks alongside an already-started model request. **Audit** records outcomes without enforcing policy blocks. See TrueFoundry's [operation and enforcement modes](https://www.truefoundry.com/docs/ai-gateway/guardrails-overview).

:::note Gateway compatibility

Use a TrueFoundry gateway that supports the current **HTTP 2xx + JSON `verdict`** contract. Earlier versions can treat an HTTP 200 block response as an allowed check. TrueFoundry's [integration contract](https://github.com/truefoundry/integrations-custom-guardrails/blob/main/docs/gateway-contract.md) describes the May 2026 transition to this behavior.

:::

## 3. Attach input and output checks

Attach `quilr/sdk-input` to the LLM input hook and `quilr/sdk-output` to the LLM output hook through a TrueFoundry policy, or select them with the `X-TFY-GUARDRAILS` request header. Both configurations can use the same QuilrAI URL, credentials, and `{}` config.

Selectors use `<group-name>/<config-name>`. Replace the names below with those in your TrueFoundry dashboard. To check only one direction, include only that direction's selector.

```bash
# Set TRUEFOUNDRY_BASE_URL to your gateway's OpenAI-compatible API base
# (including /v1 if it is part of that base), without a trailing slash.
# Set TRUEFOUNDRY_API_KEY to your TrueFoundry credential.
curl --request POST "${TRUEFOUNDRY_BASE_URL}/chat/completions" \
  --header "Authorization: Bearer ${TRUEFOUNDRY_API_KEY}" \
  --header 'Content-Type: application/json' \
  --header 'X-TFY-GUARDRAILS: {"llm_input_guardrails":["quilr/sdk-input"],"llm_output_guardrails":["quilr/sdk-output"]}' \
  --data '{
    "model": "your-truefoundry-model-id",
    "messages": [{"role": "user", "content": "Contact alice@example.com"}],
    "stream": false
  }'
```

Your application receives a normal model response when the checks allow it, with any output redactions applied. With enforcement enabled, a policy denial produces TrueFoundry's `guardrail_checks_failed` error.

:::warning Output guardrails require a complete response

TrueFoundry does not apply LLM output guardrails to streamed responses. Set **`stream: false`** whenever you require output checks. Input guardrails also work with streamed model requests. See the [TrueFoundry streaming behavior](https://www.truefoundry.com/docs/ai-gateway/guardrails-overview).

:::

## 4. Verify the integration

Use synthetic content that matches an enabled QuilrAI detector. Run both a direct hook check and a request through TrueFoundry; a successful direct check alone does not verify that TrueFoundry selected and enforced the rail.

| Check | Expected result |
| --- | --- |
| Safe content | The request succeeds with unchanged content. |
| Input redaction | With the matched category set to redact, the model receives redacted input. Inspect the TrueFoundry trace. |
| Output redaction | With output scanning enabled and `stream: false`, detected content is redacted before the client receives it. Use synthetic content introduced by the model output to test this independently of input redaction. |
| Policy block | With the matched category set to block and TrueFoundry enforcement enabled, the client receives `guardrail_checks_failed`. |
| Monitor | Findings appear in QuilrAI logs; content is unchanged. |

### Direct input check

This calls QuilrAI with the envelope TrueFoundry sends. Set `QUILR_BASE_URL` to your regional or deployment base URL without a trailing slash, and `QUILR_SDK_API_KEY` to your SDK key.

```bash
curl --request POST "${QUILR_BASE_URL}/sdk/v1/check/truefoundry" \
  --header "Authorization: Bearer ${QUILR_SDK_API_KEY}" \
  --header 'Content-Type: application/json' \
  --data '{
    "requestBody": {
      "model": "your-truefoundry-model-id",
      "messages": [{"role": "user", "content": "Contact alice@example.com"}],
      "stream": false
    },
    "context": {
      "user": {"subjectId": "test-user", "subjectType": "user"},
      "metadata": {"request_id": "tf-input-test"}
    },
    "config": {}
  }'
```

If the email is detected and its action is redact, QuilrAI returns HTTP 200 with:

```json
{
  "verdict": true,
  "transformed": true,
  "result": {
    "model": "your-truefoundry-model-id",
    "messages": [{"role": "user", "content": "Contact XXXXXXXXXXXXXXXXX"}],
    "stream": false
  }
}
```

### Direct output check

Use the same URL and authentication with this JSON body. Including `responseBody` selects an output check. The original `requestBody` remains available for policy context; the scan targets the response choices.

```json
{
  "requestBody": {
    "model": "your-truefoundry-model-id",
    "messages": [{"role": "user", "content": "Show the contact details."}],
    "stream": false
  },
  "responseBody": {
    "id": "chatcmpl-example",
    "object": "chat.completion",
    "created": 123,
    "model": "your-truefoundry-model-id",
    "choices": [{
      "index": 0,
      "message": {"role": "assistant", "content": "Contact alice@example.com"},
      "finish_reason": "stop"
    }]
  },
  "context": {
    "user": {"subjectId": "test-user", "subjectType": "user"},
    "metadata": {"request_id": "tf-output-test"}
  },
  "config": {}
}
```

For a redacted output, `result` contains the full Chat Completions response with modified message content. Response IDs, model information, choices, usage, and other protocol fields are preserved.

## Request and response behavior

TrueFoundry constructs the hook envelope automatically. If you test it directly:

- `requestBody.messages` must be a nonempty OpenAI Chat Completions messages array.
- Omit `responseBody` for input checks. Include a complete response with a nonempty `choices` array of assistant messages for output checks. A null or malformed response is rejected with HTTP 400.
- `context.user` requires a nonempty `subjectId` and a `subjectType` of `user`, `team`, or `serviceaccount`.
- `config` may be an object or null. Use `{}`; QuilrAI does not interpret config entries as guardrail settings.

Completed policy outcomes return HTTP 200:

| Outcome | `verdict` | `transformed` | Body |
| --- | --- | --- | --- |
| Allow or monitor | `true` | `false` | `result` contains the unchanged request or response. |
| Redact or partial-redact | `true` | `true` | `result` contains the complete modified request or response. |
| Block | `false` | `false` | `message` explains the denial; `result` is omitted. |

TrueFoundry consumes these fields. The native SDK's `predictions`, `placeholder_masking`, and original-content fields are not part of this response. Use QuilrAI logs to inspect findings.

### Content coverage

Input checks scan supported text across all messages supplied by TrueFoundry, including system, developer, user, assistant, and tool messages. Output checks scan every response choice. Text/refusal parts and function/tool-call arguments are supported. JSON function arguments are scanned and redacted by value while preserving keys and structure; invalid JSON arguments are scanned as text. Tool IDs and names are preserved.

Embedded images use the QuilrAI app's image-scanning settings and request/response scopes. Image scanning must be enabled separately, and requires a deployment with OCR available. Remote image URLs are never fetched. When image redaction applies, the affected attachment is removed. Audio/file parts, custom tool-call types, and streaming delta bodies are unsupported. This endpoint supports LLM Chat Completions hooks; it does not implement TrueFoundry MCP pre/post-tool hooks.

### Identity and failures

The TrueFoundry `context.user` fields are recorded as attribution. They do not replace QuilrAI authentication or verified user identity. Existing source-IP, identity, and conversation-ID requirements on your SDK key still apply. Configure any required identity headers according to [Identity Aware](./identity-aware); `subjectSlug` alone does not satisfy an identity requirement.

Invalid envelopes and credentials return SDK errors with non-2xx status codes. TrueFoundry's enforcement strategy controls handling of propagated errors and timeouts.

**Internal detection failures retain the SDK's fail-open behavior.** A failed scan can return HTTP 200 with `verdict: true`. TrueFoundry's **Enforce** or **Fail on error** setting cannot turn that successful HTTP response into an infrastructure failure. Monitor QuilrAI scan errors as well as TrueFoundry hook outcomes.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| HTTP 404 from QuilrAI | Confirm the deployment includes TrueFoundry support and the URL ends in `/sdk/v1/check/truefoundry`. |
| HTTP 401 or 403 from QuilrAI | Use a valid `quilr_sdk` key; check expiry, source-IP restrictions, and required identity headers. |
| HTTP 400 from QuilrAI | Inspect the error code; validate `requestBody`, `context.user`, output `choices`, supported content shapes, and any required conversation ID. |
| Redaction is ignored | Select **Mutate**, verify the rail selector/policy, and check that QuilrAI returned `transformed: true`. |
| A policy block is ignored | Check enforcement strategy, rail selection, and support for the current `2xx + verdict` contract. |
| Output checks do not run | Set `stream: false`, attach the output rail, and enable the relevant response scopes in QuilrAI. |
| Changing TrueFoundry Config has no effect | Change the authenticated QuilrAI app's guardrail settings or policy. Config entries are not interpreted by this adapter. |

## References

- [TrueFoundry custom guardrail configuration](https://www.truefoundry.com/docs/ai-gateway/custom-guardrails)
- [TrueFoundry execution, enforcement, and streaming](https://www.truefoundry.com/docs/ai-gateway/guardrails-overview)
- [TrueFoundry integration examples and HTTP contract](https://github.com/truefoundry/integrations-custom-guardrails/blob/main/docs/gateway-contract.md)
- [QuilrAI SDK Mode](./sdk-mode)
