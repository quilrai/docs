---
sidebar_position: 6
sidebar_custom_props:
  icon: Wrench
---

# Tool Controls

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Allow or deny tool calls by tool name, declared annotations, wire type or argument values, independently of what data they carry.

![Tool Controls card expanded with the per-call banner, a Deny rule for delete_* tools, and the Argument & result protection section](/img/policy-engine/llm-tool-controls-expanded.jpg)

## Sections

| Section | What it does | Add button |
|---|---|---|
| **Tool calls** | Per-call allow or deny rules. | **Add tool rule** |
| **Argument & result protection** | Lists the [Data & Adversarial Risks](./data-and-adversarial-risks) rules scoped to the tool boundary. Edit them on that card. | **Open Data & Adversarial Risks** |

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

## Example

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

To scan tool arguments for secrets or PII instead, add a data rule with **Scan tool-call arguments** on [Data & Adversarial Risks](./data-and-adversarial-risks). Only Monitor and Block apply there, because redaction cannot preserve a call.

## Scoping and precedence

- **Applies to**: Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Tool, Source network, or **Except...**.
- Highest priority wins for each call.

## Legacy app setting

None. Tool Controls is a policy-only control with no equivalent app settings section.
