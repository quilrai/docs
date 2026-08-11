---
sidebar_position: 3
sidebar_custom_props:
  icon: Rocket
---

# Developer Guide

For developers who have been granted self-service access. This page covers signing in, getting a key, reading your own logs and findings, and requesting settings changes.

Want the concepts first? See the [Overview](./overview). Setting self-service up for your org? See the [Admin Guide](./admin-guide). New to the gateway itself? The [Quick Start](../../quick-start) and the [Integration Guide](../../integration-guide) cover endpoints, base URLs, and SDK examples.

## Signing In

Sign in with your work account. If you have self-service access, you land in the **Self-Service portal** instead of the full admin dashboard.

You only see the apps an admin granted you. If the portal is empty, nobody has given you access to an app yet - ask your QuilrAI platform admin.

## Your Apps

Each app you can access appears as a card:

![Self-Service portal app list showing cards for Alerts Testing 2, MultiProviderTesting, and copilot with credential badges, provider and model chips, and request, key, and model counts](/img/self-service-portal-apps.png)

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

![An app opened in the Self-Service portal with Settings, Logs, and Findings tabs, showing the credential settings card and a Request settings change button](/img/self-service-portal-app-tabs.png)

### Settings

Shows the credential mode and app details: provider, models, routing groups, and estimated cost. In **Named User API Keys** mode this is also where you manage your keys. If you have Settings Request Access, a **Request settings change** action appears here.

The routing groups listed here are the names you can pass as a model to load balance or fail over across providers - see [Request Routing](../request-routing). Which providers, endpoints, and API shapes the app can reach is covered in [Provider Support](../../provider-support).

### Logs

The app's request logs. You see your own activity only, unless an admin granted you **All Logs Visibility** for this app.

Logs get considerably more useful when your requests carry context. Pass a conversation ID to group a multi-turn exchange into one thread ([Conversation Grouping](../conversation-grouping)), or send standard tracing or agent headers so each call is tied to the agent run that produced it ([Agent Monitoring](../agent-monitoring)). To pull the same records into your own tooling, ask an admin for a log export key and use the [Log Export API](../../log-export-api).

### Findings

Guardrail activity for the app - blocked, monitored, anonymized, and normal requests - with per-request detail. Scoped to your own activity under the same rule as Logs.

This is where you check why a request was blocked or came back redacted: the finding names the category that fired and the action that was applied. [Security Guardrails](../security-guardrails) explains the categories, risk levels, and actions behind those results.

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

Every request made with your key is attributed to you, so your logs, usage, and findings are your own. That attribution is the same per-user identity described in [Identity Aware](../identity-aware).

:::warning A bare parent key will not work
In Named User API Keys mode the gateway only accepts a valid named self-service key. The parent `sk-quilr-…` key on its own, a JWT, or an `X-User-Email` header alone are rejected.
:::

### Using the Key

The key is an ordinary gateway credential, so everything in the main gateway docs applies:

| You want to | Read |
|-------------|------|
| Find your base URL and see examples for other SDKs and languages | [Integration Guide](../../integration-guide) |
| Know which providers, endpoints, and API shapes the app supports | [Provider Support](../../provider-support) |
| Call OpenAI, Anthropic, Bedrock, and Vertex through one request format | [Unified Completions](../../unified-completions) |
| Target a routing group or pick a provider on a multi-provider key | [Request Routing](../request-routing) |
| Scan content from your code without proxying an LLM call | [SDK Mode](../sdk-mode) |

## Requesting a Settings Change

If you have **Settings Request Access**, use **Request settings change** on the Settings tab. You get the app's full settings editor and submit your edits as a request:

| Section in the editor | What you are changing | Feature page |
|-----------------------|-----------------------|--------------|
| LLM Providers, Models | Which providers and models the app may call | [Provider Support](../../provider-support) |
| Security Guardrails | Category actions for sensitive data and adversarial input | [Security Guardrails](../security-guardrails) |
| Additional Guardrails | Named detectors on top of the broad categories | [Security Guardrails](../security-guardrails#per-category-risk-level) |
| Guardian Agent | Dependency checks, task adherence, custom policy prompt | [Guardian Agent](../guardian-agent) |
| Custom Detections | Your own detection categories, trained from examples | [Custom Intents](../custom-intents) |
| Rate Limits | Request rates, token budgets, key expiry, response timeout | [Rate Limits](../rate-limits) |
| Token Saving | Input compression transforms | [Token Saving](../token-saving) |
| Routing Configurations | Routing groups, load balancing, failover | [Request Routing](../request-routing) |
| Identity Settings | Per-user identity, JWT claims, domain controls | [Identity Aware](../identity-aware) |
| Prompt Store | Versioned system prompts referenced at request time | [Prompt Store](../prompt-store) |
| Alerts, Tags | Notification rules and app labels, configured in the editor | - |

![The self-service settings editor with the LLM Providers section open and a footer reading "Submitted changes require admin approval before they apply" next to a Submit Request button](/img/self-service-change-request.png)

Nothing you edit here is live. The footer says it plainly: **submitted changes require admin approval before they apply**. Choose **Submit Request** to send it for review.

Track your submissions under **My Change Requests** in the portal. Each request shows one of these statuses:

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for an admin to review it. |
| `approved` | An admin accepted it and the change is live. |
| `rejected` | An admin declined it. Nothing changed. |
| `failed` | The change was approved but could not be applied. |
| `stale` | The app's config moved on since you submitted. Re-submit against the current settings. |

Admins review requests from the app's **Audit Log** tab - see [Audit Log](../audit-log#change-requests). A `stale` status means the app's config changed after you submitted; approval re-checks against the config your request was based on, so open the editor again and resubmit.

:::note You cannot change self-service access
The self-service configuration itself, including credential mode and who has access, is admin-only and does not appear in the portal's settings editor.
:::

### If you have Direct Settings Update

Some users are granted **Direct Settings Update** instead. In that case your saves apply to the live app immediately, with no approval step. There is no undo in the portal, but every change is versioned in the app's config history and an admin can roll it back - see [Audit Log](../audit-log#config-history).

## Inside the Settings Editor

The sections you are most likely to open, and what each one does. Each links to its full feature page.

### Security Guardrails

Detection of sensitive data and adversarial input on the way to and back from the model. Set a **Default Action** for anything you have not configured explicitly - Redact, Partial redact, Block, or Monitor - then tune each category under **Data Risks** (PII, PHI, PFI, PCI, Insurance, Auth & Secrets) and **Adversarial Risks** (prompt injection, jailbreak, and similar).

Per category you choose a **Risk Level** (how wide a net it casts), **Applies to** (request only, response only, or both), and the **Action**. Individual sub-categories such as Passport Number or National ID can be raised on their own without changing the rest.

![Security Guardrails section of the self-service settings editor, showing the Default Action row, the Data Risks category tabs, and the PII sub-category list with per-item risk levels](/img/self-service-security-guardrails.png)

Full details: [Security Guardrails](../security-guardrails).

### Additional Guardrails

A catalogue of named detectors on top of the broad categories above, grouped as PII, PHI, PFI, PCI, Auth & Secrets, Device / Network & Online Identifiers, Telecom Subscriber Data, and Employee / HR Data. Each detector - Social Security Number, Aadhar Number, PAN Card Number, Driver's License Number, and so on - is enabled individually and carries its own **Applies to**, **Risk Level**, and **Action**.

Reach for this when you need one specific value caught or ignored rather than a whole category.

![Additional Guardrails section listing the additional category groups with per-detector Applies to, Risk Level, and Action controls](/img/self-service-additional-guardrails.png)

These are configured alongside the category actions described in [Security Guardrails](../security-guardrails).

### Guardian Agent

Marked **EXPERIMENTAL** in the portal.

Guardian Agent is a policy check the gateway runs on your traffic, not a separate agent or a different model endpoint. It can add instructions to a request before it reaches the model, retry an unsafe answer once with corrective guidance, append an advisory, or block the request. Two groups:

- **Coding Helpers** - reads install commands and manifests, and nudges the model away from packages with known vulnerabilities (**Dependency Security Check**) or outdated pinned versions (**Latest Version Suggestions**).
- **Task Adherence** - compares the latest user message against the app's system prompt and either nudges the model back on purpose or blocks the request when the conversation drifts. Sensitivity is adjustable.

A **Custom Guardian Prompt** lets you state the app's policy in plain language, and it is judged against the recent conversation.

![Guardian Agent section showing the status flow diagram, the Coding Helpers and Task Adherence category toggles, and the Custom Guardian Prompt box](/img/self-service-guardian-agent.png)

Full details: [Guardian Agent](../guardian-agent).

### Token Saving

Rewrites eligible input so fewer tokens reach the provider, with the meaning intact. No SDK changes on your side. Four transforms, each toggled on its own:

| Transform | What it does |
|-----------|--------------|
| **Smart JSON Compression** | Converts JSON in the input to TOON format. Up to 20% savings when requests carry tool call responses or other JSON. |
| **HTML to Text** | Strips HTML tags and keeps the text, cutting the cost of markup-heavy input. |
| **Markdown to Text** | Drops Markdown syntax characters that consume tokens without adding meaning. |
| **Text Compression** | Shortens verbose plain text while preserving the original meaning. |

![Token Saving section listing Smart JSON Compression, HTML to Text, Markdown to Text, and Text Compression with their toggles](/img/self-service-token-saving.png)

Transforms apply to input only, so responses come back untouched. Full details, including what each transform does and does not rewrite: [Token Saving](../token-saving).

### Custom Detections

When the built-in categories do not describe what you need caught - a competitor name, an internal project codename, a domain-specific phrase - define your own intent from a name, a description, and example prompts that should and should not match. It then runs alongside the built-in guardrails with its own block, monitor, or redact action.

Full details: [Custom Intents](../custom-intents).

### Rate Limits

Requests per minute, hour, and day; maximum input and output tokens; a token budget over a window; key expiry; and a response timeout. All of it is enforced at the gateway before your request reaches the provider, so raising a limit here is what fixes a `429` from Quilr rather than from the provider.

Full details: [Rate Limits](../rate-limits).

### Routing Configurations

Routing groups let one model name spread across several models, providers, or accounts - weighted by request count or by tokens, with context tiers for small versus large prompts, and automatic failover. Your code keeps calling the group name.

Full details: [Request Routing](../request-routing).

### Identity Settings

Controls how the gateway identifies the end user behind a call: the `X-User-Email` header for trusted backends, or JWT validation via JWKS or a PEM public key, plus enforced identity and allowed domains. Named self-service keys already carry your identity, so these settings are about the users of the app you are building.

Full details: [Identity Aware](../identity-aware).

### Prompt Store

Keeps system prompts versioned centrally so you reference them by ID (`quilrai-prompt-store-<id>`) instead of pasting prompt text into your code. One system message can reference several stored prompts, mix in your own inline instructions, and fill in template variables.

Full details: [Prompt Store](../prompt-store).

## Checking a Change Worked

Once a request is approved (or saved directly), the change is live on the next request. To confirm it:

1. Send a request with your key.
2. Open the **Findings** tab to see which guardrails fired and what action was applied - the categories and actions are explained in [Security Guardrails](../security-guardrails).
3. Open the **Logs** tab for the request itself, including token counts, which show the effect of [Token Saving](../token-saving) and of the model your [routing group](../request-routing) picked.

If your admin runs [Red Team Testing](../red-team-testing) against the app, those results are a broader check on the same guardrail configuration.

## Troubleshooting

| What you see | What it means |
|--------------|---------------|
| The portal is empty | No app has granted you Viewer Access yet. Ask your platform admin. |
| `No key available` | The app is in Named User API Keys mode and you have not created a key yet. |
| `API key hidden` | You do not have API Key Visibility for that app. You can still manage key metadata. |
| An app disappeared | Your access was removed, or you were removed from a smart group that granted it. Keys you already copied are not automatically revoked, but you can no longer create new ones. |
| Your key is rejected by the gateway | The key was revoked, or you are sending the bare parent key to an app that requires named user keys. |
| Logs look emptier than expected | Logs and findings are scoped to your own activity unless you have All Logs Visibility. |
| A request was blocked or came back redacted | A guardrail fired. Check the **Findings** tab for the category and action - see [Security Guardrails](../security-guardrails). |
| Rate limit or token limit errors from the gateway | The app's [Rate Limits](../rate-limits) are being hit. Request a change if the limit is too tight for your workload. |
| The model is not the one you asked for | The app routes that model name through a routing group - see [Request Routing](../request-routing). |
| The model does not accept your request shape | Check what the provider and endpoint support in [Provider Support](../../provider-support) and [Unified Completions](../../unified-completions). |
| A change request sits at `stale` | The app's config moved after you submitted. Reopen the editor and resubmit - see [Audit Log](../audit-log#change-requests). |

## Related

**Self-service**

- [Overview](./overview) - concepts, credential modes, and the key format.
- [Admin Guide](./admin-guide) - how access is configured on the admin side.
- [Audit Log](../audit-log) - how change requests are reviewed and rolled back.

**Calling the gateway**

- [Quick Start](../../quick-start) - the four steps to a working call.
- [Integration Guide](../../integration-guide) - endpoint URLs and code examples per SDK.
- [Provider Support](../../provider-support) - providers, endpoints, and API formats.
- [Unified Completions](../../unified-completions) - one request format across providers.
- [SDK Mode](../sdk-mode) - scan content from your code without proxying an LLM call.

**Settings you can request**

- [Security Guardrails](../security-guardrails) - categories, risk levels, and actions.
- [Custom Intents](../custom-intents) - your own detection categories.
- [Guardian Agent](../guardian-agent) - dependency checks and task adherence.
- [Token Saving](../token-saving) - the compression transforms and what they save.
- [Rate Limits](../rate-limits) - request rates, token budgets, and key expiry.
- [Request Routing](../request-routing) - routing groups, load balancing, and failover.
- [Prompt Store](../prompt-store) - versioned system prompts referenced by ID.
- [Identity Aware](../identity-aware) - identifying the users of the app you build.

**Logs and monitoring**

- [Conversation Grouping](../conversation-grouping) - group multi-turn requests into one thread.
- [Agent Monitoring](../agent-monitoring) - tie calls to the agent run that produced them.
- [Log Export API](../../log-export-api) - read request logs from your own tooling.
