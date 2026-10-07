---
sidebar_position: 7
sidebar_label: "Tool controls"
sidebar_custom_props:
  icon: Wrench
---

# Tool controls

Allow or deny tool calls by tool name, declared annotations, wire type or argument values, independently of what data they carry.

## Where it is configured

Tool controls are a Policy Engine feature. There is no app setting or Configure tab for them, so nothing freezes when you use them. Open the **Tool Controls** card in **Policy Engine > LLM Gateway**. Edits join the shared draft and take effect once you [review and publish](../../console/govern/author-simulate-and-publish) a revision.

![Tool Controls card expanded with the per-call banner, a Deny rule for delete_* tools, and the Argument & result protection section](/img/policy-engine/llm-tool-controls-expanded.jpg)

## Sections

| Section | What it does | Add button |
|---|---|---|
| **Tool calls** | Per-call allow or deny rules. | **Add tool rule** |
| **Argument & result protection** | Lists the [Data & Adversarial Risks](./security-guardrails) rules scoped to the tool boundary. Edit them on that card. | **Open Data & Adversarial Risks** |

Tool calls applies on `assistants`, `bedrock`, `chat`, `copilot`, `embeddings`, `rerank`, `responses`, `sdk_check`, `stt`, `text`, `tts` and `vertex`.

Every tool call in a request is judged on its own, but **one denied call rejects the whole request**. The engine never strips a single call. Per-call verdicts stay visible in attribution.

## Tool rule settings

| Setting | Options | Default | Notes |
|---|---|---|---|
| Tool | Tool names or patterns (`delete_*`), or **Any tool** | Empty | Names and patterns are alternatives. Leave empty or tick **Any tool** to judge every call by traits or arguments. |
| By trait | Destructive, Open world, Not read-only, Read-only, Idempotent | None | Declared MCP-style annotations read from the call. Match **any trait** (default) or **all traits**. |
| Tool type | Wire type, for example `function` | Empty | Patterns allowed. |
| When arguments | Argument path + is, is not, one of, contains, starts with, ends with, matches `*wildcard*`, exists, is empty | None | Paths are suggested per tool from observed calls; nested paths like `options.visibility` work. Text conditions ignore case. Values are never stored. Match **all** (default) or **any**. |
| Decision | Allow, Deny | Deny | A deny rejects the whole request that carries the call. |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Reported only. |

Risk and tags are not computed by the gateway, so the quick rule does not offer them. Use **Add configuration** for result-field conditions on the response stage or combinations the quick rule cannot express.

## Scenarios

- **Block destructive tools for most people.** Deny calls whose trait is **Destructive** for Everyone, then allow them at a higher priority for one Smart group.
- **Block one risky argument value.** Deny `create_repository` when `visibility` is `public`:

<PolicyCard
  name="deny_public_repository_creation"
  stage="request"
  priority={950}
  when={[
    { field: "Tool name", op: "is", value: "create_repository" },
    { field: "Tool arguments . visibility", op: "is", value: "public" },
  ]}
  then={[
    { effect: "Tool call access", value: "deny" },
    { effect: "Risk level", value: "high" },
  ]}
/>

- **Pattern rules.** Deny every `delete_*` tool for one Application or Requested model.

To scan tool arguments for secrets or PII instead, add a data rule with **Scan tool-call arguments** on [Data & Adversarial Risks](./security-guardrails). Only Monitor and Block apply there, because redaction cannot preserve a call.

## Scoping and precedence

- **Applies to**: Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Tool, Source network, or **Except...**.
- Highest priority wins for each call.

## Test before you publish

The LLM Gateway workspace in the Policy Engine has tools around the cards that help when you build tool rules:

- **What applies to one request** (Describe a request): enter a person, Smart groups, application, requested model, API surface, environment, provider credential, source IP and detections. Each card shows the winning value, the configuration that decided it and why. Values that depend on a field you left empty are tagged **conditional**. Nothing is saved. **Test with the engine** compares the answer with the engine's simulator, and **Open full simulator** opens the [simulator](../../console/govern/author-simulate-and-publish#4-simulate).
- **Review changes**: validates the shared draft and replays it over sampled recorded traffic, with global counters (blocked, redacted, rerouted, model rejected, rate-limited).
- **History**: every published revision with time, actor, checksum, **View source** and **Rollback** (rollback republishes as a new revision).
- **Advanced policies**: policies the cards cannot represent are listed below the cards. **Advanced workspace** opens the QuilrQL source editor with drafts, suggested policies (for example deny tool access), diagnostics, simulation and historical try.

![What applies to one request panel with Person, Smart groups, Application, Requested model, API surface, Environment, Provider credential and Source IP fields](/img/policy-engine/llm-describe-request-form.png)

## Related

- [Security guardrails](./security-guardrails) - scan tool-call arguments for sensitive data.
- [Gateway access and allowed models](./gateway-access-and-allowed-models)
- [Policy Engine overview](../../console/govern/policy-engine)
