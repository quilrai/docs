---
sidebar_position: 2
sidebar_label: "Quick start"
sidebar_custom_props:
  icon: Rocket
description: "Create an app in the console (platform providers or app-only credentials, guardrail defaults), send a first request, and check Activity."
---

# Quick Start

Create an app, configure your SDK to use the gateway, and send a first request.

<StepFlow steps={[
  {
    label: "Create App",
    items: [
      "Name and key settings",
      "Providers and models",
      "Default guardrails applied",
    ],
  },
  {
    label: "Copy the Quilr key",
    items: [
      "Shown after Create app",
      "Also in API Integration",
    ],
  },
  {
    label: "Swap the base URL",
    items: [
      "base_url → guardrails-usa-2.quilr.ai",
      "api_key → Quilr key",
      "SDK code: unchanged ✓",
    ],
  },
  {
    label: "Check Activity",
    items: [
      "Outcome, tokens, latency",
      "Cost per model",
    ],
  },
]} />

## Before you start

You need one of:

- Credentials for a provider (for example an OpenAI API key), or
- A platform provider already set up in **Settings > AI Gateway > Models** (V2 console only, see [Providers and Models](../apps-and-providers/providers-and-models)). You can also add one from inside Create App.

## 1. Create the app

Go to **Settings > AI Gateway > LLM Gateway** and click **Create App**. The wizard has two steps.

### Step 1: Application and providers

![Create App, Step 1 of 2, with Application name, Application URL, the expanded Key settings row (Quilr key name and Initial key expiry), and Platform providers selected with the list of available providers](/img/llm-gateway/ui/create-app-platform-providers.png)

| Field | Notes |
|-------|-------|
| **Application name** | Required. 4 to 29 characters. |
| **Application URL** | Optional. |
| **Quilr key name** | Under **Key settings** (collapsed by default, showing `Default · never expires`). Required. Defaults to `Default`. Names the gateway key, not your provider key. |
| **Initial key expiry** | Under **Key settings**. Optional. Leave blank for a key that never expires. |

Next, under **Where should this app get its models?**, choose where the provider credentials come from.

| Option | Use it when |
|--------|-------------|
| **Platform providers** (Recommended) | You want this app to reuse providers your team already connected, with credentials and models managed in one place. |
| **App-only credentials** | You want to enter provider credentials for this app only, for example when one team's keys must stay separate. |

:::info V2 console only
The **Platform providers** option exists only in the V2 console, and it is the default. In V1, every app keeps its own provider credentials. Either way, the choice is fixed once the app is created.
:::

**Platform providers.** Under **Available**, tick one or more providers. The first one you tick is the **Primary**; use the up and down arrows to change the order. A disabled provider is skipped, but an upstream error is not retried on another provider (see [When a provider fails](../cost-and-traffic/routing-and-fallbacks#when-a-provider-fails)). The app inherits all their models and credentials, including models added later. If none exist yet, click **Add a platform provider** to add one without leaving the form, or **Use app-only credentials**.

**App-only credentials.** Select **App-only credentials** and select a provider tile. For providers with more than one API, also select one under **Which API does the gateway talk to?**.

![App-only credentials selected, with the provider tiles (OpenAI, Anthropic, Azure, Amazon Bedrock, Google, DeepSeek, Sarvam, Cohere, Jina, Voyage, Oracle OCI, Custom endpoint, Quilr SDK, Copilot Studio) and the API choice for OpenAI](/img/llm-gateway/ui/create-app-app-only-provider-tiles.png)

1. Keep or change the **Provider label**.
2. Fill in the credential fields. Each provider's fields are listed in [Provider Support](../apps-and-providers/provider-support#credentials-by-provider).
3. Under **Models**, click **Get available models** and choose from the list, or type a model in **Add a model by name** and click **Add**. Each model is checked against the provider before it is added.
4. Optional: click **Add another provider** to add more providers for [routing](../cost-and-traffic/routing-and-fallbacks).

![OpenAI provider form with Provider label, API key, Get available models, Add a model by name, Remove provider and Add another provider](/img/llm-gateway/ui/create-app-app-only-credentials-models.png)

:::tip Use QuilrAI-provided models
To connect an app to [QuilrAI-provided models](../apps-and-providers/providers-and-models), add a **Custom endpoint** provider with the **Chat completions** API (`general`), base URL `https://models.quilrai.dev/v1` and a model API key from **Settings > AI Gateway > Models > API keys**.
:::

Click **Create app**. There is no guardrail step: every new app starts with these defaults, which you can change later in its [Security Guardrails](../protect/security-guardrails) section.

| Setting | Default |
|---------|---------|
| **Default guardrail action** | **Monitor**. You can change it later to Block, Redact or Partial redact. |
| **Data risks** | All six on: PII, PHI, financial, payment card, insurance, authentication secrets |
| **Adversarial risks** | 12 of 13 on. **Malicious scripts** is off. |
| **Dependency security check**, **Latest-version suggestions**, **Task adherence** | Off. These are [Guardian Agent](../protect/guardian-agent) checks. |

Monitor logs detections without changing traffic.

### Step 2: Key details

The last step, **Integration**, shows the new Quilr key, the app's log export key and, if you have access, the all-apps log key. Copy them now, then click **Done**. You can copy the Quilr key again later from the app's **API Integration** section (see [Applications and Keys](../apps-and-providers/applications-and-keys#api-integration)).

## 2. Send your first request

Point your client at a regional gateway URL and use the Quilr key. Nothing else changes.

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://guardrails-usa-2.quilr.ai/openai_compatible/',
    api_key='sk-quilr-xxx',  # your Quilr key
)

resp = client.chat.completions.create(
    model='gpt-4.1-mini',  # a model enabled on the app
    messages=[{'role': 'user', 'content': 'Hello!'}],
)
print(resp.choices[0].message.content)
```

The example uses US East. Select the nearest region and the appropriate path for your SDK (Anthropic, boto3, Vertex AI, Responses, Realtime), in the [Integration Guide](./integration-guide).

## 3. Check that it worked

On the app card, click **Logs**. The **Activity > Requests** view lists each call with its model, provider, guardrail outcome, HTTP status, tokens and latency. See [Overview](./overview#the-app-workspace) for the other tabs.

## 4. Tune the app

Open the app card's **Configure** buttons to change any of these settings later.

| Setting | What it controls |
|---------|------------------|
| [Security Guardrails](../protect/security-guardrails) | Data and adversarial risk categories, actions, hallucination check, source IPs |
| [Guardian Agent](../protect/guardian-agent) | Dependency nudges and task adherence |
| [Custom Detections](../protect/custom-detections) | Your own regex and intent detections |
| [Rate and Token Limits](../cost-and-traffic/rate-token-and-budget-limits) | Timeouts, concurrency, request rates, token ceilings |
| [Routing](../cost-and-traffic/routing-and-fallbacks) | Weighted and token-based groups, failover, routing by request size |
| [Token Saving](../cost-and-traffic/token-saving) | JSON, HTML, Markdown and text compression |
| [Prompt Store](../cost-and-traffic/prompt-store) | Reusable system prompts |
| [Identity Aware](../protect/identity-and-network-trust) | Required user identity, conversation IDs, JWT verification |
| [Self-Service](../self-service/overview) | What developers can see and change themselves |

If the [Policy Engine](../../console/govern/policy-engine) is on, guardrails, Guardian Agent, limits, token saving, routing, identity requirements and Prompt Store enforcement follow published policies instead of these app settings.
