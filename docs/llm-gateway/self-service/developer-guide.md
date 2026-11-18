---
sidebar_position: 4
sidebar_label: "Developer guide"
sidebar_custom_props:
  icon: Rocket
description: "For developers - open the self-service developer portal, create and manage personal API keys in Keys & Connect, call the gateway with them, see your model options, ask for more budget, access, models, key lifetime or apps, and create your own app from a template."
console_path: [/self-service/llm-gateway, /self-service/llm-gateway/keys, /self-service/llm-gateway/models, /self-service/llm-gateway/requests]
aliases: [developer portal, self service portal, personal api key, create api key, keys and connect, model tiers, self-service requests, new application]
---

# Developer guide

For developers using the self-service developer portal: get a personal key, call the gateway, see which models you can use, and ask for more. Want the concepts first? See the [Overview](./overview). New to the gateway itself? The [Quick Start](../get-started/quick-start) and the [Integration Guide](../get-started/integration-guide) cover endpoints, base URLs and SDK examples.

:::note Words in the portal
The portal still uses some older names. A **profile** is what admins call an **access plan**, a **model tier** is a **model option**, and a **blueprint** is an **app template**.
:::

## Open the portal

- **You only have self-service access:** sign in with your work account. You land in the portal.
- **You also use the admin console:** open the account menu at the bottom left of the sidebar and select **Switch to Self Service**. **Admin console** at the top right of the portal takes you back.

The portal's tabs are **My usage**, **LLM Gateway**, **MCP Gateway**, **Workflow agents** and **Skills**. Your access plan can hide some of them.

![Developer portal My usage tab with Your LLM activity, the Traffic and Period pickers, and Available to your account](/img/llm-gateway/ui/self-service/dev-portal-my-usage.jpg)

**My usage** shows activity attributed to you across your approved apps. Shared-key traffic without a user identity is not included.

## Your apps

**LLM Gateway** lists the apps you can open, with your requests, estimated cost and API keys. The buttons at the top open **Analytics**, **Platform providers**, **Models** and **Requests**.

![Developer portal LLM Gateway page with Your requests, Your estimated cost, Applications and Your API keys, and an app card with Inspect and Configure actions](/img/llm-gateway/ui/self-service/dev-portal-llm-gateway.jpg)

Each app card shows its providers and models and what you can do there:

| On the card | Meaning |
|-------------|---------|
| **Personal keys** | You create your own keys for this app. Without it, the app uses shared keys. |
| **Changes need approval** | You can ask for settings changes; an administrator approves them. |
| **Key value hidden** | You cannot see key values for this app. |
| **Inspect**: Analytics, Activity, Usage & Cost, Provider Status | Your requests and findings, or everyone's when you have all-logs visibility. |
| **Configure**: Settings, Keys & Connect, Change requests | The app's settings, your keys, and your settings change requests. |

If an app you expect is missing, you do not have viewer access to it. Ask your admin, or [request access](#ask-for-more).

If your access plan gives you one starter app instead of an app list, **LLM Gateway** opens **My developer key**: select **Issue my developer key** to get a personal key in that app. Its value is shown once.

## Get a personal key

On an app with personal keys:

1. Select **Keys & Connect** on the app card.
2. Under **API credentials**, select **Create API key**.
3. Enter a **Key name** that says where it will live, for example `laptop` or `ci-runner`.
4. Choose when it **Expires**. If the app or your access plan caps key lifetime, the key must expire within that cap.
5. Copy the key. **It is shown only once.**

![Keys & Connect tab of an app with API credentials, a Create API key button and the note that the access policy does not reveal credential values](/img/llm-gateway/ui/self-service/dev-portal-keys-and-connect.jpg)

New keys look like `sk-quilr-ss-` followed by 48 hex characters. Keys created before November 2026 look like `sk-quilr-<app key>:ss1.<...>` and keep working.

If the app does not let you view key values, the portal creates the key but does not show its value. Ask your admin for **View and copy API key values** on that app.

Your keys are listed with their status, expiry and last use. **Rename**, **Edit expiry** and **Revoke** act on one key. You can hold up to 10 active keys per app; your access plan can set a lower limit. One key per machine or environment is a good habit, so you can revoke one without breaking the others.

On an app with shared keys, **Keys & Connect** shows the app's keys instead. Copy one if the app lets you view key values.

### Use the key

The key is an ordinary gateway credential. **Gateway quickstart** on the same tab shows the gateway URL and examples.

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-ss-...'  # your personal key
)

response = client.chat.completions.create(
    model='gpt-4o-mini',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

Every request made with your key is attributed to you, so your activity, usage and findings are your own.

| You want to | Read |
|-------------|------|
| Find your base URL and examples for other SDKs | [Integration Guide](../get-started/integration-guide) |
| Know which providers, endpoints and API shapes the app supports | [Provider Support](../apps-and-providers/provider-support) |
| Call any provider from the SDK you already use | [Any-to-any formats](../api-reference/any-to-any-formats) |
| Target a routing group | [Request Routing](../cost-and-traffic/routing-and-fallbacks) |
| Scan content without proxying an LLM call | [SDK Mode](../apps-and-providers/sdk-mode) |

## Models you can call

**Models** (on the **LLM Gateway** page) shows the model tiers your access plan allows. Send a tier's **Model name to call** as the request's `model`; the gateway routes it.

![Developer portal Models page saying no model tiers apply, so the app's models can be called as usual](/img/llm-gateway/ui/self-service/dev-portal-models.jpg)

- **No model tiers apply to you**: call your apps' models as usual.
- **Only these model names work with your personal keys**: other models are refused with `self_service_model_not_allowed`, and responses do not name the model that served them.
- Otherwise, other tiers are refused, and other models stay available under your organization's policies.
- A reasoning effort cap lowers requests that ask for more. It never refuses them.

These limits apply to your personal keys only. **Request a stronger tier** asks for more.

## Ask for more {#ask-for-more}

Open **Requests** (on the **LLM Gateway** page). **My requests** lists what you asked for; **New request** asks for something new.

![New request form with What do you need set to Budget increase, the Application, Extra amount (USD), Budget and Why do you need it fields](/img/llm-gateway/ui/self-service/dev-portal-new-request.jpg)

| What do you need? | Who decides |
|-------------------|-------------|
| **Budget increase** (an extra amount in USD) | The app's owners, if the budget covers only that app. Otherwise an administrator. |
| **Application access** (the abilities you need) | The app's owners, or an administrator when it has none. |
| **Stronger model tier** | An administrator. |
| **Longer key lifetime** | An administrator. |
| **Another application** (from a blueprint, past your limit) | An administrator. |

Say why you need it and until when. Every approval ends on a date, at most a year away, except a new application. You cannot approve your own request, and you can withdraw a request while it waits. You can have up to 20 pending requests.

If you own an app, a **To review** tab lists requests about it for you to approve or reject.

## Create your own app

If your access plan lets you create apps, select **New application** on the **LLM Gateway** page, pick a **Blueprint** and name the app. You become its owner, and it starts with the blueprint's providers, routing, settings and guardrail policies. Who can do what, shared keys, budgets, the prompt store, JWT sign-in and key expiry start empty.

On your own app:

- Your access plan decides whether you change its settings directly, ask for changes, or do not see settings.
- You can view its key values and all of its logs.
- You answer requests about it, such as other people asking for access.
- You can disable or delete it.

Past your plan's limit, the button reads **Request another application** and an administrator decides.

## Request a settings change

If **Changes need approval** shows on the app, open **Settings** and edit it: your edits are submitted as a request, and nothing is live until an administrator approves it. With direct settings update, your saves apply immediately and are versioned in the app's config history, where an administrator can roll them back.

| Section | What you are changing | Feature page |
|---------|-----------------------|--------------|
| LLM Providers | Which providers and models the app may call | [Provider Support](../apps-and-providers/provider-support) |
| Security Guardrails | Default action, data and adversarial categories | [Security Guardrails](../protect/security-guardrails) |
| Guardian Agent | Dependency checks and task adherence | [Guardian Agent](../protect/guardian-agent) |
| Custom Detections | Your own regex or intent detections | [Custom Detections](../protect/custom-detections) |
| Rate and Token Limits | Timeouts, concurrency, request and token limits | [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) |
| Token Saving | Input compression strategies | [Token Saving](../cost-and-traffic/token-saving) |
| Routing | Routing groups and custom routing | [Request Routing](../cost-and-traffic/routing-and-fallbacks) |
| Prompt Store | Stored and universal system prompts | [Prompt Store](../cost-and-traffic/prompt-store) |

Track your submissions in the app's **Change requests**:

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for an administrator. |
| `approved` | Accepted; the change is live. |
| `rejected` | Declined. Nothing changed. |
| `failed` | Approved, but it could not be applied. |
| `stale` | The app's config changed after you submitted. Edit again and resubmit. |

Self-service access itself (credential mode and who can do what) is admin-only and is not in the settings editor.

## Troubleshooting

| What you see | What it means |
|--------------|---------------|
| No apps | No app gives you viewer access yet. Ask your admin, or request access to an app by name. |
| `401 invalid_api_key` | The key is unknown or was revoked. |
| `401 expired_api_key` | The key passed its expiry. Create a new one. |
| `401 self_service_access_revoked` | You no longer have viewer access to the app, or you were suspended. Keys stop within about a minute of the change. |
| Your key stopped after the app changed | The app switched to a shared key, which accepts no personal key. |
| `403 self_service_model_not_allowed` | Your access plan does not allow that model on personal keys. Check **Models**. |
| `409 api_key_limit_reached` | You hold the maximum number of active keys for the app. Revoke one first. |
| The key value is not shown | You do not have **View and copy API key values** on that app. |
| A request was blocked or redacted | A guardrail fired. Check the app's **Activity** for the finding; see [Security Guardrails](../protect/security-guardrails). |
| Rate limit or token limit errors | The app's [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) are being hit. |

## Related

- [Overview](./overview) - concepts and the key format.
- [Admin guide](./admin-guide) - how access is set up on the admin side.
- [Audit Log](../monitor/app-audit-log) - how settings change requests are reviewed and rolled back.
- [Integration Guide](../get-started/integration-guide) - endpoint URLs and code examples per SDK.
- [Conversation Grouping](../monitor/conversation-grouping) and [Agent Monitoring](../monitor/agent-monitoring) - make your logs more useful.
