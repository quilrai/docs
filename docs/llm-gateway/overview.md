---
sidebar_position: 0
sidebar_custom_props:
  icon: BookOpen
---

# Overview

The LLM Gateway sits between your applications and your LLM providers. Your code keeps its SDK. You change the base URL and the API key, and every request is checked by guardrails, routed to a provider, and logged with cost and latency.

<StepFlow steps={[
  {
    label: "Your application",
    items: [
      "OpenAI, Anthropic, boto3 or Google SDK",
      "Sends a Quilr key",
    ],
  },
  {
    label: "QuilrAI LLM Gateway",
    items: [
      "Guardrails on request and response",
      "Routing, limits, token saving",
      "Logs, cost, health",
    ],
  },
  {
    label: "Your provider",
    items: [
      "OpenAI, Anthropic, Azure",
      "Bedrock, Vertex AI, Oracle OCI",
      "Any OpenAI-compatible URL",
    ],
  },
]} />

## Key concepts

| Term | What it is |
|------|------------|
| **Application (app)** | The unit you configure. An app holds its providers, guardrails, routing, limits, prompts and logs. You create one with **Create App**. |
| **Quilr key** | The credential your code sends to the gateway. An app can have several named Quilr keys, each with its own expiry. See [Applications and Keys](./applications-and-keys). |
| **Provider** | An upstream connection: a provider type (for example `openai` or `bedrock`), its credentials, a label, and the models the app may call. See [Provider Support](./provider-support). |
| **Primary and additional providers** | An app can use several providers. The first is the primary; the rest serve failover, routing groups and explicit provider selection. |
| **Global provider** | A provider set up once in **Settings > Models** and linked to many apps (V2 console only). See [Providers and Models](./providers-and-models). |

Provider credentials stay in the gateway. Developers only ever see the Quilr key.

## The LLM Gateway page

Go to **Settings > LLM Gateway**. The page has two tabs: **Applications** and **Management API** (see [Management APIs](./management-apis/overview)).

![LLM Gateway Applications tab with the Overall analytics, Self-service usage, Audit log and Create App buttons above four summary cards](/img/llm-gateway/ui/applications-overview-cards.png)

| Button | What it opens |
|--------|---------------|
| **Overall analytics** | The gateway workspace for all applications, on the Analytics tab |
| **Self-service usage** | Who can use self-service in each app, and whether they do |
| **Audit log** | The gateway workspace on its Audit tab |
| **Create App** | The Create App wizard. See [Quick Start](./quick-start). |
| **...** | **Copy all-apps log key**, a read-only key for the [Log Export API](./log-export-api) across every app |

| Summary card | Shows |
|--------------|-------|
| **Requests** | Request count, people calling, models in use, success rate, tokens exchanged |
| **Applications** | Active, Inactive and Expired apps, and the number of distinct providers |
| **Needs attention** | Apps that are not routable (every provider off), have no guardrails, or have a key expiring in 30 days |
| **Stopped by guardrails** | Blocked and redacted requests, failed requests, p95 latency |

Click any number on a card to filter the app list. Below the cards, search by app, key, provider, model, creator or tag, and filter by attention, status or provider.

## The app card

Each app in **Configured Apps** has a card.

![App card with its providers and models, feature chips, request and cost summary, and the Inspect and Configure button rows](/img/llm-gateway/ui/app-card-multi-provider.png)

| Area | What it shows |
|------|---------------|
| Header | App name, key status, **+ Tag**, **Manage keys**, **Integration docs** |
| API Keys | Active, expired and revoked Quilr key counts |
| Providers | Each provider with its models, a **Disabled** chip if switched off, and its p95, latency and error trend |
| Feature chips | Identity aware, Prompt store, Token saving, Guardian agent |
| Traffic | Requests, blocked, monitored, redacted and failed counts, estimated cost, tokens |
| **Inspect** | Red Team, Results, Logs, Usage & Cost, Provider Status, Copy logs key, Export API docs |
| **Configure** | Providers, Guardrails, Guardian, Token Saving, Routing, Self-Service, Audit Log, Prompts |

## The app workspace

Every Inspect and Configure button opens the app workspace on the matching tab. **Overall analytics** opens the same workspace with **All applications** selected. Switch scope with the application picker.

| Tab | What it shows |
|-----|---------------|
| **Analytics** | Requests, blocked, monitored, tokens and tokens saved; traffic by model; guardrail outcomes; top users; requests by provider |
| **Activity** | **Requests** (one row per call), **Interactions** (calls grouped into conversations) and **Findings** (guardrail detections) |
| **Usage** | Estimated cost, input, output, reused and reasoning tokens, errors, and requests and tokens by model |
| **Health** | Provider verdict, failures, rate limits and server errors, and failure rate and p95 upstream latency per provider |
| **Settings** | The app configuration. Available for one app at a time. |
| **Audit** | Configuration changes: application, operation, actor, status and time |

![Analytics tab of the LLM Gateway workspace showing request, blocked, monitored, token and tokens-saved summaries](/img/llm-gateway/ui/workspace-analytics.png)

![Activity tab, Requests view, listing each request with model, provider, outcome, HTTP status, tokens, token savings and latency](/img/llm-gateway/ui/workspace-activity-requests.png)

![Usage tab with estimated cost, token tiles and requests by model](/img/llm-gateway/ui/workspace-usage.png)

![Health tab with the provider verdict, failure tiles and a per-provider status table](/img/llm-gateway/ui/workspace-health.png)

### Settings sections

![Settings tab of an app with the section list on the left and the LLM Providers section open](/img/llm-gateway/ui/app-settings-llm-providers.png)

| Group | Sections |
|-------|----------|
| Providers & routing | LLM Providers, [Routing](./features/request-routing) |
| Protection | [Security Guardrails](./features/security-guardrails), [Guardian Agent](./features/guardian-agent), [Custom Detections](./features/custom-intents), [Rate and Token Limits](./features/rate-limits) |
| Optimization & policy | [Token Saving](./features/token-saving), [Self-Service](./features/self-service/overview), Alerts |
| Identity & content | [Identity Aware](./features/identity-aware), [Prompt Store](./features/prompt-store) |
| Operations | [API Keys, API Integration and Audit Log](./applications-and-keys) |

:::note Policy Engine
When the [Policy Engine](../policy-engine/llm-gateway) is on, sections marked with its icon (Routing, Security Guardrails, Guardian Agent, Rate and Token Limits, Token Saving, Identity Aware, Prompt Store) follow published policies instead of these settings. Providers, keys and the other sections are still managed here.
:::

## Self-service usage

**Self-service usage** reports who can view, request changes to, directly edit, see the keys of, and see all logs of each app, and how much they use it. Tabs: **Users**, **Applications**, **Change history**.

![Self-service usage report with user, app, request and settings-change tiles above the Users tab](/img/llm-gateway/ui/self-service-usage.png)

See [Self-Service](./features/self-service/overview) to set it up.

## Next steps

- [Quick Start](./quick-start): create an app and send a first request.
- [Applications and Keys](./applications-and-keys): add keys, set expiry, roll back changes.
- [Provider Support](./provider-support): every provider type, endpoint and credential field.
- [Integration Guide](./integration-guide): regional URLs and SDK examples.
