---
sidebar_position: 3
sidebar_custom_props:
  badge: new
  icon: ShieldCheck
---

# Guardian Agent

Guide model behavior with gateway-side policy checks for dependency safety and task adherence.

## Overview

Guardian Agent runs inside the LLM Gateway request and response flow. It is not a separate autonomous agent or a new model endpoint. When enabled on an API key, the gateway can add policy instructions before a request reaches the upstream model, retry unsafe dependency output once with corrective guidance, append an advisory when needed, or block off-task requests before they reach the provider.

Use Guardian Agent when you want coding assistants to avoid risky dependency recommendations, or when an agent should stay aligned to the purpose defined by its system prompt.

## How It Works

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

## Feature Groups

Guardian Agent currently has two feature groups.

### Coding Helpers

Coding helpers focus on dependency-related prompts and generated dependency output.

On the request side, Guardian Agent detects dependency intent in user messages, such as `requirements.txt`, `pip install`, `pyproject.toml`, dependency lists, and package version questions. When matched, it injects an upstream system instruction telling the model to avoid vulnerable versions and prefer current stable patched versions, depending on configuration.

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

Package extraction is best-effort across PyPI, npm, crates.io, RubyGems, NuGet, Go, Maven, and Packagist. Exact pinned versions can be checked against OSV for known vulnerabilities. Bare package installs resolve the latest registry version first, then check that version. Range specs are skipped in this release.

Latest-version suggestions are supported for exact pins on PyPI, npm, crates.io, RubyGems, NuGet, and Go. Maven and Packagist latest-version checks are skipped in v1.

### Task Adherence

Task adherence compares the latest user message against the request system prompt. The system prompt is treated as the agent's purpose. If there is no system prompt, the check is skipped and the request is allowed.

When the latest user message is classified as unrelated to the system prompt, Guardian Agent records a `guardian_task_adherence` finding and applies the configured action:

| Action | Behavior |
|--------|----------|
| `nudge` | Adds an upstream instruction telling the model to redirect back to the configured purpose. |
| `block` | Blocks the request before it reaches the upstream model. |

Task adherence is request-side only today. Response-side task adherence is not implemented.

## Streaming and Retry Behavior

Request-side Guardian Agent checks run before upstream calls for both streaming and non-streaming requests.

For non-streaming responses, dependency findings trigger one retry with Guardian dependency instructions. If the retry still contains dependency advisories, the gateway appends a Guardian note to the final response. Vulnerability advisories suppress latest-version advisories for the same response.

For streaming requests with dependency checks enabled, the gateway first sends a hidden non-streaming upstream request to inspect a full draft response. If no dependency findings are found, the gateway streams that draft back to the client as provider-shaped SSE. If Guardian Agent finds vulnerabilities or update advisories, the gateway adds corrective instructions and sends a second streaming upstream request, then streams the second response to the client.

Other response-side Guardian Agent checks are skipped for normal streaming passthrough.

## Endpoint Coverage

Guardian Agent is implemented on these LLM Gateway surfaces:

| Surface | Request-side checks | Response-side dependency checks |
|---------|---------------------|---------------------------------|
| OpenAI-compatible chat completions | Yes | Yes |
| OpenAI Responses API | Yes | Yes |
| Anthropic Messages | Yes | Yes |
| Vertex AI Gemini | Yes | Yes |

OpenAI-compatible chat includes provider-native chat models reached through gateway translations, including Bedrock `Converse`, Vertex AI Gemini `generateContent`, and Anthropic Messages.

## Configuration

Guardian Agent is configured per LLM Gateway API key under `guardian_agent`:

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
      "sensitivity": "low",
      "action": "nudge"
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `guardian_agent.enabled` | Enables or disables Guardian Agent for the key. |
| `coding_helpers.enabled` | Enables dependency-related request instructions and response review. |
| `coding_helpers.dependency_security_check` | Checks exact dependency pins and resolved bare installs for known OSV vulnerabilities. |
| `coding_helpers.latest_version_suggestions` | Suggests newer versions for exact pins where registry latest-version checks are supported. |
| `task_adherence.enabled` | Enables relevance checks between the latest user message and the system prompt. |
| `task_adherence.sensitivity` | Must be `low`, `medium`, or `high`. |
| `task_adherence.action` | Must be `nudge` or `block`. If omitted, the action defaults to `nudge`. |

`task_adherence.agent_purpose` may still appear in older configurations, but the live task-adherence check uses the request system prompt.

On API key create or update, pass `guardian_agent` as a top-level config field. On key create, it can also be nested inside `quilr_api_key_settings`. Setting `guardian_agent` to `null` on update removes the Guardian Agent configuration from that key.

## Logging

Guardian Agent findings are logged with the same prediction shape used by guardrails:

- `type`: `classify`
- `match_type`: `guardian`
- `id`: `guardian_task_adherence`, `guardian_coding_dependency_security_review`, or `guardian_coding_latest_version_review`

Guardian categories are also written to `metadata.extra_data.guardian_agent.request` and `metadata.extra_data.guardian_agent.response` in exported logs. Nudge and monitor findings appear under `actions_and_categories.request.monitored` or `actions_and_categories.response.monitored`. Blocked task-adherence findings appear under `actions_and_categories.request.blocked`.

If Guardian Agent finds something and nothing was blocked or anonymized, the request outcome becomes `monitor_detected`. If task adherence is configured with `block` and the latest user message is classified as unrelated, the request outcome becomes `blocked` and the upstream model is not called.

## Current Limits

- Dependency extraction is best-effort and can miss unusual manifest shapes.
- Range specs are not checked for OSV vulnerabilities or latest-version suggestions.
- Vulnerable dependency output is not hard-blocked today. The current behavior is monitor plus retry, with an appended advisory as fallback.
- Task adherence checks only the latest user message.
- Task adherence requires a system prompt. No system prompt means no task-adherence check.
- Dependency and task-adherence network checks fail open on transient errors.
- Response-side task adherence is not implemented.
- Streaming response-side checks are only implemented for dependency security and latest-version coding helpers.
