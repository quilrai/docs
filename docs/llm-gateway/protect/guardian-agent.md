---
sidebar_position: 3
sidebar_label: "Guardian agent"
sidebar_custom_props:
  badge: experimental
  icon: ShieldCheck
---

# Guardian agent

Guide model behavior with gateway checks for dependency safety and task adherence.

Guardian Agent runs inside the gateway's request and response flow. It is not a separate agent or model endpoint. When enabled, the gateway can add instructions before a request reaches the model, retry unsafe dependency output once with corrective guidance, append an advisory, or block off-task requests.

## Turn it on for an app

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'LLM Gateway', 'your app', 'Configure']}
  action="Guardian"
/>

Guardian Agent is **off** for new apps.

![Guardian Agent section with Coding helpers switches, and Task adherence with Action, Sensitivity, Agent purpose and Guardian prompt](/img/llm-gateway/ui/app-guardian-agent.png)

| Setting | Options | Default when turned on |
|---------|---------|------------------------|
| Dependency security check | On / off | Off |
| Latest version suggestions | On / off | Off |
| Task adherence | On / off | Off |
| Task adherence action | Nudge, Block | Nudge |
| Task adherence sensitivity | Low, Medium, High. Higher flags smaller deviations. | Medium |
| Agent purpose | One sentence describing what the agent is for | Empty |
| Guardian prompt | The boundary to enforce, in plain language | Empty |

## How it works

<StepFlow steps={[
  {
    label: "Request Arrives",
    items: [
      "User message + system prompt",
      "Guardian config loaded",
    ],
  },
  {
    label: "Evaluate Request",
    items: [
      "Dependency intent?",
      "Task still on purpose?",
    ],
  },
  {
    label: "Apply Policy",
    items: [
      "Inject guidance",
      "Nudge or block",
    ],
  },
  {
    label: "Call Provider",
    items: [
      "Forward if allowed",
      "Log Guardian findings",
    ],
  },
]} />

For dependency output, Guardian Agent adds a response-side review before the final answer is returned:

<StepFlow steps={[
  {
    label: "Model Draft",
    items: [
      "pip install django==3.2.0",
      "Package specs extracted",
    ],
  },
  {
    label: "Check Dependencies",
    items: [
      "OSV vulnerabilities",
      "Latest registry versions",
    ],
  },
  {
    label: "Retry Once",
    items: [
      "Corrective instruction added",
      "Safer dependency output",
    ],
  },
  {
    label: "Return Response",
    items: [
      "Advisory appended if needed",
      "Findings visible in logs",
    ],
  },
]} />

## Feature groups

Guardian Agent currently has two feature groups.

### Coding helpers

Coding helpers focus on dependency-related prompts and generated dependency output.

On the request side, Guardian Agent detects dependency intent in user messages, such as `requirements.txt`, `pip install`, `pyproject.toml`, dependency lists, and package version questions. When matched, it adds a system instruction directing the model to avoid vulnerable versions and prefer current stable patched versions, depending on configuration.

On the response side, Guardian Agent scans dependency-like output, including:

- `pip install` commands
- `requirements.txt` and `pyproject.toml`
- `package.json`
- `Cargo.toml`
- `Gemfile`
- `go.mod`
- `.csproj` `PackageReference` entries
- `pom.xml`
- `composer.json`

Package extraction is best-effort across PyPI, npm, crates.io, RubyGems, NuGet, Go, Maven, and Packagist. Exact pinned versions can be checked against OSV for known vulnerabilities. Bare package installs resolve the latest registry version first, then check that version. Version ranges are not checked.

Latest-version suggestions are supported for exact pins on PyPI, npm, crates.io, RubyGems, NuGet, and Go. Latest-version checks are not available for Maven and Packagist.

### Task adherence

Task adherence checks whether the latest user message stays within the agent's purpose. Set **Agent purpose** to one sentence describing what the agent is for, and use **Guardian prompt** to state the boundary. The request's system prompt also describes the purpose; if a request has no system prompt, the check is skipped and the request is allowed.

When the latest user message is classified as off-task, Guardian Agent records a `guardian_task_adherence` finding and applies the action:

| Action | Behavior |
|--------|----------|
| **Nudge** | Adds an upstream instruction telling the model to steer back to its purpose. |
| **Block** | Blocks the request before it reaches the model. |

Task adherence runs on the request side only.

## Writing a guardian prompt

One or two direct sentences are usually enough: name what the agent may handle, then say what is outside its scope. Keep evaluation logic out of the prompt, and put persona, tone and formatting in the agent's own system prompt.

| Agent | Good | Bad, and why |
|-------|------|--------------|
| Weather assistant | `Allow only questions about weather and meteorology. Treat every other topic as outside this agent's scope.` | A long "ROLE / INPUT / CHECK FOR / OUTPUT" evaluator spec. It defines a second judge when the need is only a topic boundary. |
| Product support | `Allow questions about Acme products, setup, troubleshooting, billing, and returns. Treat unrelated requests as outside this agent's scope.` | `Keep the user on topic and block inappropriate requests.` The topic is never defined. |
| Internal HR | `Allow questions about company benefits, leave, payroll, and workplace policies. Do not allow requests for legal, medical, or financial advice.` | `You are a friendly HR expert. Answer clearly, use bullet points.` Describes tone, not scope. |

## Streaming and retry behavior

Request-side Guardian Agent checks run before upstream calls for both streaming and non-streaming requests.

For non-streaming responses, dependency findings trigger one retry with Guardian dependency instructions. If the retry still contains dependency advisories, the gateway appends a Guardian note to the final response. Vulnerability advisories suppress latest-version advisories for the same response.

For streaming requests with dependency checks enabled, the gateway first sends a preliminary non-streaming provider request to inspect a full draft response. If no dependency findings are found, the gateway streams that draft back to the client as SSE in the provider's format. If Guardian Agent finds vulnerabilities or update advisories, the gateway adds corrective instructions and sends a second streaming upstream request, then streams the second response to the client.

Other response-side Guardian Agent checks are skipped for normal streaming passthrough.

## Latency impact

Guardian Agent runs additional checks inside the request and response path, so it adds latency on top of the [normal gateway overhead](../get-started/ha-and-sla#gateway-latency).

As a planning figure, expect Guardian Agent to add **~700 ms** per request when it is enabled. The actual latency varies with the scenario and the complexity of the request:

- **Which feature groups are enabled.** Running coding helpers and task adherence together takes longer than running one of them.
- **Request size and complexity.** Longer conversations and larger dependency manifests take longer to evaluate.
- **Dependency lookups.** OSV vulnerability checks and registry latest-version lookups are network calls, and their latency grows with the number of packages extracted from the response.
- **Retries.** A dependency finding triggers one corrective retry, which adds a second upstream model call to the request.
- **Streaming with dependency checks.** The gateway first issues a preliminary non-streaming draft request, so time to first token reflects the full draft rather than the first upstream token.

:::note
~700 ms is a guideline, not a guarantee. Requests that need no retry and no registry lookups take substantially less time, and requests that trigger a retry or many package lookups can take longer.
:::

## Endpoint coverage

Guardian Agent supports these LLM Gateway APIs:

| Surface | Request-side checks | Response-side dependency checks |
|---------|---------------------|---------------------------------|
| OpenAI-compatible chat completions | Yes | Yes |
| OpenAI Responses API | Yes | Yes |
| Anthropic Messages | Yes | Yes |
| Vertex AI Gemini | Yes | Yes |

OpenAI-compatible chat includes provider-native chat models reached through gateway translations, including Bedrock `Converse`, Vertex AI Gemini `generateContent`, and Anthropic Messages.

## Configuration keys

For the [Management APIs](../api-reference/management-api), Guardian Agent is the `guardian_agent` object in the app configuration:

```json
{
  "guardian_agent": {
    "enabled": true,
    "coding_helpers": {
      "enabled": true,
      "dependency_security_check": true,
      "latest_version_suggestions": true
    },
    "task_adherence": {
      "enabled": true,
      "sensitivity": "medium",
      "action": "nudge"
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `guardian_agent.enabled` | Turns Guardian Agent on or off for the app. |
| `coding_helpers.dependency_security_check` | Checks exact pins and resolved bare installs for known OSV vulnerabilities. |
| `coding_helpers.latest_version_suggestions` | Suggests newer versions for exact pins where the registry supports it. |
| `task_adherence.sensitivity` | `low`, `medium` or `high`. |
| `task_adherence.action` | `nudge` (default) or `block`. |

Setting `guardian_agent` to `null` on update removes the Guardian Agent configuration.

## Logging

Guardian Agent findings are logged in the same prediction format used by guardrails:

- `type`: `classify`
- `match_type`: `guardian`
- `id`: `guardian_task_adherence`, `guardian_coding_dependency_security_review`, or `guardian_coding_latest_version_review`

Guardian categories are also written to `metadata.extra_data.guardian_agent.request` and `metadata.extra_data.guardian_agent.response` in exported logs. Nudge and monitor findings appear under `actions_and_categories.request.monitored` or `actions_and_categories.response.monitored`. Blocked task-adherence findings appear under `actions_and_categories.request.blocked`.

If Guardian Agent records a finding and no content was blocked or anonymized, the request outcome becomes `monitor_detected`. If task adherence is configured with `block` and the latest user message is classified as unrelated, the request outcome becomes `blocked` and the upstream model is not called.

## Current limits

- Dependency extraction is best-effort, and version ranges are not checked.
- Vulnerable dependency output is not blocked: the gateway retries once and then appends an advisory.
- Task adherence checks only the latest user message, on the request side.
- Dependency and task-adherence network checks fail open on transient errors.

## Going further with the Policy Engine

Guardian Agent is also a card in **Policy Engine > LLM Gateway**. When the engine is on for the LLM Gateway, the Guardian tab freezes and the card applies instead. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

The card has four sections: **Guardian** (master switch), **Coding helpers**, **Task adherence** and **After Guardian runs** (follow-up rules). Each control is a three-way switch (**Leave as is**, **On**, **Off**), so a narrow configuration can change one setting and inherit the rest. The card applies on the `assistants`, `bedrock`, `chat`, `copilot`, `responses`, `sdk_check` and `vertex` API surfaces.

- In a new configuration, **Guardian** starts **On** when opened from the Guardian section; **Coding helpers** and **Task adherence** start at **Leave as is**. Turning Coding helpers On ticks both **Dependency security check** and **Latest version suggestions**. At least one control must be On or Off.
- Guardian results are request-stage fields, so follow-up rules cannot see them on the response leg.

Scenarios it supports:

- **Coding models only.** Turn on coding helpers and strict task adherence when the Requested model matches a pattern such as `*code*`.
- **Exempt one app or group.** Guardian **Off** on a narrower scope (People, Smart group, Application, App tag) beats **On** for Everyone. The highest-priority configuration wins per setting.
- **Severity follow-ups.** Tag a severity when Guardian blocked, when there are at least N findings, or for a specific finding type, for dashboards and alerts.
- **Metadata conditions.** Use **Add configuration** to key Guardian off languages, repos or request metadata.

<PolicyCard
  name="secure_coding_guardian"
  stage="request"
  priority={700}
  when={[{ field: "Requested model", op: "matches pattern", value: "*code*" }]}
  then={[
    { effect: "Guardian", value: "true" },
    { effect: "Dependency security check", value: "true" },
    { effect: "Latest version suggestions", value: "true" },
    { effect: "Task adherence sensitivity", value: "high" },
    { effect: "Task adherence action", value: "block" },
  ]}
/>

## Related

- [Security guardrails](./security-guardrails) - data and adversarial risk detection.
- [Policy Engine overview](../../console/govern/policy-engine)
- [HA and SLA](../get-started/ha-and-sla) - gateway latency budget.
