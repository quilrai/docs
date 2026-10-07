---
sidebar_position: 6
sidebar_label: "Gateway access and allowed models"
sidebar_custom_props:
  icon: KeyRound
---

# Gateway access and allowed models

Control who may send requests through the gateway and which models they may call. Denied requests are rejected before routing or scanning: no provider call, no tokens.

## Set models for an app

In app settings, an app's usable models are the models of the providers linked to it. To limit an app to certain models, link only the providers (and enable only the models) it should use:

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Providers"
/>

See [Link providers to an app](../apps-and-providers/providers-and-models#link-providers-to-an-app) and [Providers and models](../apps-and-providers/providers-and-models). There is no app setting to deny a request by user, group or prompt text. That needs the Policy Engine.

## Going further with the Policy Engine

Two cards in **Policy Engine > LLM Gateway** cover access. Edits join a shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish). Gateway Access is policy-only, so nothing freezes when you turn it on; see [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what the engine takes over.

### Gateway Access card

Allow or deny an entire request by who sent it, which app or model it targets, or what its prompt says.

| Section | What it does | Empty state |
|---|---|---|
| **Requests** | **Add rule**: Allow or Deny (default **Deny**) the whole request for a scope, with an optional severity. | Everyone without a rule is allowed. |
| **Prompt text rules** | **Add phrase rule**: act on a phrase in the user prompt, system prompt or either. | No request is denied for what its prompt says. |

Phrase rules run at the request stage on `chat`, `responses`, `bedrock` and `vertex`.

| Setting | Options | Default |
|---|---|---|
| Where | User prompt, System prompt, Either. Tool-call content is not part of the text. | User prompt |
| Condition | **contains**, **starts with**, **ends with**, **matches `*wildcard*`**, **is exactly** (case-sensitive) | contains |
| Phrase | Text or a pattern. Add more lines and match **any line** or **all lines**. | Any line |
| Then | **Deny request**, **Route to...** (an ordered list of targets), **Severity only** | Deny request |

Matching is case-insensitive (except **is exactly**) and reads the first 8,192 characters. There are no regular expressions; wildcards use `*` and `?`.

Highest priority wins. When an allow and a deny share a priority, **deny wins**. An allow never bypasses identity, source IP, model or tool checks.

### Allowed Models card

Choose which models matching traffic may call, and which models nobody in scope may call.

- **Allowed lists combine.** Every matching allowed list is merged, and the request may use any model in the union.
- **Rejected models always win**, including models reached through [routing](../cost-and-traffic/routing-and-fallbacks). Priority is ignored on this card.
- **No matching allowed list** means any configured model may be requested unless it is rejected.
- The card runs before routing: it filters what may be used, then routing picks where the request goes.

The model picker is grouped by provider credential and lists only enabled credentials. Use **Search models**, **Select all** and **Clear all**, or **All** / **None** on one credential's group, to maintain long lists without ticking models one by one. Leave **Allowed models** empty to add only rejections.

Both sections apply on the `assistants`, `bedrock`, `chat`, `copilot`, `embeddings`, `models`, `realtime`, `rerank`, `responses`, `sdk_check`, `stt`, `text`, `tts` and `vertex` API surfaces.

:::warning Everyone lists affect every app
An allowed list scoped to **Everyone** restricts every application and user to that list. Choose **Application** or another scope to limit who it affects.
:::

### Scenarios

- **Keep frontier models away from a group.** Deny requests when the Smart group is Interns and the requested model is one of a list:

<PolicyCard
  name="deny_frontier_models_to_interns"
  stage="request"
  priority={800}
  when={[
    { field: "Smart groups", op: "includes (ignoring case)", value: "Interns" },
    { field: "Requested model", op: "is any of", values: ["claude-opus-4", "gpt-4.1", "o3"] },
  ]}
  then={[
    { effect: "Request access", value: "deny" },
    { effect: "Risk level", value: "medium" },
  ]}
/>

- **Restrict an app to one team.** Deny requests to the Finance Copilot app unless the caller is in the Finance Platform Smart group.
- **Pin an app to approved models.** An allowed list scoped to the Support Copilot application limits it to `gpt-4.1` and `gpt-4.1-mini`. A request for `gpt-4o` is rejected.
- **Ban preview models everywhere.** A rejected list scoped to Everyone blocks `o1-preview` even through an app whose allowed list includes it or a routing group that targets it.

For limiting models, an allowed list is usually easier to maintain than a deny rule on Gateway Access.

## Related

- [Providers and models](../apps-and-providers/providers-and-models)
- [Routing and fallbacks](../cost-and-traffic/routing-and-fallbacks)
- [Tool controls](./tool-controls)
- [Policy Engine overview](../../console/govern/policy-engine)
