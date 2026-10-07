---
sidebar_position: 1
sidebar_custom_props:
  icon: ShieldCheck
---

# Data & Adversarial Risks

:::info V2 console
This card is in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits are saved in the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Decide what happens when PII, PHI, financial data, secrets, prompt attacks or your own custom detections appear in a model request or response.

![Data & Adversarial Risks card collapsed, showing Detection rules and Sensitivity profile rows](/img/policy-engine/llm-data-risks-card.png)
<!-- TODO-SCREENSHOT: retake, shows old Sensitivity profile row (card now shows Language Blocking and Detection rules) -->

## Sections

![Data & Adversarial Risks card expanded with the priority banner and the Detection rules section](/img/policy-engine/llm-data-risks-expanded.jpg)

| Section | What it holds | Empty state |
|---|---|---|
| **Detection rules** | Which data types are found, how many times, and the action. | Nothing is redacted or blocked; findings are still detected and reported. |
| **Language Blocking** | Monitor or block passages outside the allowed languages. Streamed responses are skipped. **Set allowed languages** adds one. | **Off**: languages are not restricted. |

Applies on `assistants`, `bedrock`, `chat`, `copilot`, `embeddings`, `rerank`, `responses`, `sdk_check`, `stt`, `text`, `tts` and `vertex`.

## Detection rule settings

**Add rule** opens the New data rule dialog.

![New data rule dialog with a detection line, action and stage buttons, and the Scan tool-call arguments option](/img/llm-gateway/ui/policy-new-data-rule-detection-lines.png)

| Setting | Options | Default | Notes |
|---|---|---|---|
| Data types | Whole category, individual types, or custom detections | None | **Choose types...** lists every category. Several types on one line match any of them. |
| Findings threshold | **at least** N | 1 | Per line. |
| Action | Monitor, Partial redact, Redact, Block | Monitor | Block on any line stops the whole request. |
| Stage | Request, Response, Both | Request | Response redaction and blocking need the full response; streamed responses are scanned and tagged, not changed. |
| Tool boundary | **Scan tool-call arguments** | Off | Evaluates each tool call's arguments independently. Only Monitor and Block apply. |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Reported for dashboards, exports and alerts. Never changes the action. |
| More options | Priority, extra rules, metadata and content conditions, raw QuilrQL | - | Opens the full editor. |

Add more detection lines to one rule with **+ Add line**. Each line keeps its own types, threshold, action and stage.

## Example

<PolicyCard
  name="block_request_secrets"
  stage="request"
  priority={900}
  when={[{ field: "data found", op: "is any of", values: ["Auth & Secrets"] }]}
  then={[
    { effect: "Sensitive data action", value: "block" },
    { effect: "Risk level", value: "critical" },
  ]}
/>

Start new detections on `monitor`, review activity, then select a more restrictive action.

## Scoping and precedence

- **Applies to**: Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Prompt complexity, Prompt text, Tool, Source network, or **Except...**. Every chip must match; values accept `*` and `?`.
- **Everyone** is priority 500. Narrower scopes take precedence.
- The highest priority takes precedence **per data type**. At equal priority the more restrictive action takes precedence.
- `redact` and `partial-redact` rewrite only the findings their own rule selected.

More examples, the full data type catalog and multi-rule configurations: [LLM Gateway Policies](../llm-gateway#protecting-data).

## Legacy app setting

Replaces the data risks, adversarial risks and precision detections parts of an app's [Security Guardrails](../../llm-gateway/features/security-guardrails). Custom detections themselves are still defined per app under [Custom Intents](../../llm-gateway/features/custom-intents).
