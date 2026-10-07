---
sidebar_position: 3
sidebar_label: "Developer guide"
sidebar_custom_props:
  icon: Rocket
---

# Developer Guide

For developers who have been granted self-service access. This page covers signing in, getting a key, reading your own logs and findings, and requesting settings changes.

Want the concepts first? See the [Overview](./overview). Setting self-service up for your org? See the [Admin Guide](./admin-guide). New to the gateway itself? The [Quick Start](../get-started/quick-start) and the [Integration Guide](../get-started/integration-guide) cover endpoints, base URLs, and SDK examples.

## Signing In

Sign in with your work account. If you have self-service access, you land in the **Self-Service portal** instead of the full admin dashboard.

You only see the apps an admin granted you. If the portal is empty, nobody has given you access to an app yet - ask your QuilrAI platform admin.

## Your Apps

Each app you can access appears as a card:

![Self-Service portal app list with credential badges, provider and model chips, routing groups, and request, key and model counts on each card](/img/self-service-portal-apps.png)

A card tells you:

| On the card | What it means |
|-------------|---------------|
| **USER KEY** badge | The app runs in Named User API Keys mode - you create your own key. Without it, the app uses the shared parent key. |
| **REQUESTS ENABLED** badge | You can submit settings changes for admin approval. |
| **KEYS HIDDEN** badge | You can manage keys but cannot see the credential value. The key chip reads `API key hidden`. |
| Key chip | Your current credential, or `No key available` when you have not created one yet. |
| Provider and model chips | The provider, the models this app can call, and any routing groups under **ROUTES**. |
| **REQUESTS / KEYS / MODELS** | Request count, how many keys you hold, and how many models are enabled. |
| **Mode / Cost / Latest key** | Credential mode, estimated cost, and when you last created a key. |
| **Settings / Logs / Findings** | The three tabs for the app. |

## The Three Tabs

Open an app to get to its tabs:

![An app opened in the Self-Service portal with Settings, Logs and Findings tabs and a Request settings change button](/img/self-service-portal-app-tabs.png)

### Settings

Shows the credential mode and app details: provider, models, routing groups, and estimated cost. In **Named User API Keys** mode this is also where you manage your keys. If you have Settings Request Access, a **Request settings change** action appears here.

The routing groups listed here are the names you can pass as a model to load balance or fail over across providers - see [Request Routing](../cost-and-traffic/routing-and-fallbacks). Which providers, endpoints, and API shapes the app can reach is covered in [Provider Support](../apps-and-providers/provider-support).

### Logs

The app's request logs. You see your own activity only, unless an admin granted you **All Logs Visibility** for this app.

Logs get considerably more useful when your requests carry context. Pass a conversation ID to group a multi-turn exchange into one thread ([Conversation Grouping](../monitor/conversation-grouping)), or send standard tracing or agent headers so each call is tied to the agent run that produced it ([Agent Monitoring](../monitor/agent-monitoring)). To pull the same records into your own tooling, ask an admin for a log export key and use the [Log Export API](../api-reference/log-export-api).

### Findings

Guardrail activity for the app - blocked, monitored, redacted and normal requests - with per-request detail. Scoped to your own activity under the same rule as Logs.

This is where you check why a request was blocked or came back redacted: the finding names the category that fired and the action that was applied. [Security Guardrails](../protect/security-guardrails) explains the categories, risk levels, and actions behind those results.

## Getting Your Key

What you get depends on the app's credential mode.

### Shared Parent Key mode

The app already has a key. Copy it from the Settings tab and use it as-is. If the app shows `API key hidden`, an admin has turned off key visibility for you - ask them for the value.

### Named User API Keys mode

You create your own key:

1. Open the app's **Settings** tab.
2. Create a key and give it a name that says where it will live, for example `Alice local dev` or `alice-ci-runner`.
3. Copy the full value. It looks like the app key with a self-service payload appended:

   ```
   sk-quilr-<app-key>:ss1.<encoded-identity>.<random>
   ```

4. Use the whole string anywhere you'd normally use an `sk-quilr-…` key:

   ```python
   from openai import OpenAI

   client = OpenAI(
       base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
       api_key='sk-quilr-xxx:ss1.a1b2c3.d4e5f6'  # your named self-service key
   )

   response = client.chat.completions.create(
       model='gpt-4o-mini',
       messages=[{'role': 'user', 'content': 'Hello!'}]
   )
   ```

You can hold several keys for the same app - one per machine or environment is a good habit, since you can then revoke one without breaking the others. Your active keys are listed with their created and last-used times, and you can revoke any of them yourself.

Every request made with your key is attributed to you, so your logs, usage, and findings are your own. That attribution is the same per-user identity described in [Identity Aware](../protect/identity-and-network-trust).

:::warning A bare parent key will not work
In Named User API Keys mode the gateway only accepts a valid named self-service key. The parent `sk-quilr-…` key on its own, a JWT, or an `X-User-Email` header alone are rejected.
:::

### Using the Key

The key is an ordinary gateway credential, so everything in the main gateway docs applies:

| You want to | Read |
|-------------|------|
| Find your base URL and see examples for other SDKs and languages | [Integration Guide](../get-started/integration-guide) |
| Know which providers, endpoints, and API shapes the app supports | [Provider Support](../apps-and-providers/provider-support) |
| Call OpenAI, Anthropic, Bedrock, and Vertex through one request format | [Unified Completions](../api-reference/unified-completions) |
| Target a routing group or pick a provider on a multi-provider key | [Request Routing](../cost-and-traffic/routing-and-fallbacks) |
| Scan content from your code without proxying an LLM call | [SDK Mode](../apps-and-providers/sdk-mode) |

## Requesting a Settings Change

If you have **Settings Request Access**, use **Request settings change** on the Settings tab. You get the app's full settings editor and submit your edits as a request:

| Section in the editor | What you are changing | Feature page |
|-----------------------|-----------------------|--------------|
| LLM Providers | Which providers and models the app may call | [Provider Support](../apps-and-providers/provider-support) |
| Security Guardrails | Default action, data and adversarial categories, precision detections | [Security Guardrails](../protect/security-guardrails) |
| Guardian Agent | Dependency checks and task adherence | [Guardian Agent](../protect/guardian-agent) |
| Custom Detections | Your own regex or intent detections | [Custom Detections](../protect/custom-detections) |
| Rate and Token Limits | Timeouts, concurrency, request and token limits | [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) |
| Token Saving | Input compression strategies | [Token Saving](../cost-and-traffic/token-saving) |
| Routing | Routing groups and custom routing | [Request Routing](../cost-and-traffic/routing-and-fallbacks) |
| Alerts | Failure-rate alerts and channels | [Alerts](../monitor/alerts) |
| Identity Aware | Per-user identity, JWT, domain controls | [Identity Aware](../protect/identity-and-network-trust) |
| Prompt Store | Stored system prompts referenced at request time | [Prompt Store](../cost-and-traffic/prompt-store) |

Nothing you edit here is live. The footer says it plainly: **submitted changes require admin approval before they apply**. Choose **Submit Request** to send it for review.

Track your submissions under **My Change Requests** in the portal. Each request shows one of these statuses:

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for an admin to review it. |
| `approved` | An admin accepted it and the change is live. |
| `rejected` | An admin declined it. Nothing changed. |
| `failed` | The change was approved but could not be applied. |
| `stale` | The app's config moved on since you submitted. Re-submit against the current settings. |

Admins review requests from the app's **Audit Log** tab - see [Audit Log](../monitor/app-audit-log#change-requests). A `stale` status means the app's config changed after you submitted; approval re-checks against the config your request was based on, so open the editor again and resubmit.

:::note You cannot change self-service access
The self-service configuration itself, including credential mode and who has access, is admin-only and does not appear in the portal's settings editor.
:::

### If you have Direct Settings Update

Some users are granted **Direct Settings Update** instead. In that case your saves apply to the live app immediately, with no approval step. There is no undo in the portal, but every change is versioned in the app's config history and an admin can roll it back - see [Audit Log](../monitor/app-audit-log#config-history).

## Checking a Change Worked

Once a request is approved (or saved directly), the change is live on the next request. To confirm it:

1. Send a request with your key.
2. Open the **Findings** tab to see which guardrails fired and what action was applied - the categories and actions are explained in [Security Guardrails](../protect/security-guardrails).
3. Open the **Logs** tab for the request itself, including token counts, which show the effect of [Token Saving](../cost-and-traffic/token-saving) and of the model your [routing group](../cost-and-traffic/routing-and-fallbacks) picked.

If your admin runs an [LLM Intelligence Assessment](../../red-teaming/assessments/llm-intelligence-assessment) against the app, those results are a broader check on the same guardrail configuration.

## Troubleshooting

| What you see | What it means |
|--------------|---------------|
| The portal is empty | No app has granted you Viewer Access yet. Ask your platform admin. |
| `No key available` | The app is in Named User API Keys mode and you have not created a key yet. |
| `API key hidden` | You do not have API Key Visibility for that app. You can still manage key metadata. |
| An app disappeared | Your access was removed, or you were removed from a smart group that granted it. Keys you already copied are not automatically revoked, but you can no longer create new ones. |
| Your key is rejected by the gateway | The key was revoked, or you are sending the bare parent key to an app that requires named user keys. |
| Logs look emptier than expected | Logs and findings are scoped to your own activity unless you have All Logs Visibility. |
| A request was blocked or came back redacted | A guardrail fired. Check the **Findings** tab for the category and action - see [Security Guardrails](../protect/security-guardrails). |
| Rate limit or token limit errors from the gateway | The app's [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) are being hit. Request a change if the limit is too tight for your workload. |
| The model is not the one you asked for | The app routes that model name through a routing group - see [Request Routing](../cost-and-traffic/routing-and-fallbacks). |
| The model does not accept your request shape | Check what the provider and endpoint support in [Provider Support](../apps-and-providers/provider-support) and [Unified Completions](../api-reference/unified-completions). |
| A change request sits at `stale` | The app's config moved after you submitted. Reopen the editor and resubmit - see [Audit Log](../monitor/app-audit-log#change-requests). |

## Related

**Self-service**

- [Overview](./overview) - concepts, credential modes, and the key format.
- [Admin Guide](./admin-guide) - how access is configured on the admin side.
- [Audit Log](../monitor/app-audit-log) - how change requests are reviewed and rolled back.

**Calling the gateway**

- [Quick Start](../get-started/quick-start) - the four steps to a working call.
- [Integration Guide](../get-started/integration-guide) - endpoint URLs and code examples per SDK.
- [Provider Support](../apps-and-providers/provider-support) - providers, endpoints, and API formats.
- [Unified Completions](../api-reference/unified-completions) - one request format across providers.
- [SDK Mode](../apps-and-providers/sdk-mode) - scan content from your code without proxying an LLM call.

**Settings you can request**

- [Security Guardrails](../protect/security-guardrails) - categories, risk levels, actions and defaults.
- [Custom Detections](../protect/custom-detections) - your own regex and intent detections.
- [Guardian Agent](../protect/guardian-agent) - dependency checks and task adherence.
- [Token Saving](../cost-and-traffic/token-saving) - the compression transforms and what they save.
- [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) - timeouts, concurrency, request and token limits.
- [Request Routing](../cost-and-traffic/routing-and-fallbacks) - routing groups, load balancing, and failover.
- [Prompt Store](../cost-and-traffic/prompt-store) - stored system prompts referenced by ID.
- [Identity Aware](../protect/identity-and-network-trust) - identifying the users of the app you build.

**Logs and monitoring**

- [Conversation Grouping](../monitor/conversation-grouping) - group multi-turn requests into one thread.
- [Agent Monitoring](../monitor/agent-monitoring) - tie calls to the agent run that produced them.
- [Log Export API](../api-reference/log-export-api) - read request logs from your own tooling.
