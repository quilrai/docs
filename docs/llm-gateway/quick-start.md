---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Create an app, point your SDK at the gateway, and send a first request.

<StepFlow steps={[
  {
    label: "Create App",
    items: [
      "Name and Quilr key name",
      "Providers and models",
      "Guardrails",
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
- A global provider already set up in **Settings > Models** (V2 console only, see [Providers and Models](./providers-and-models)).

## 1. Create the app

Go to **Settings > LLM Gateway** and click **Create App**. The wizard has three steps.

### Step 1: Application and providers

![Create App step 1 with Application name, Quilr key name, Application URL, Initial key expiry and the Global providers picker](/img/llm-gateway/ui/create-app-step1-global-providers.png)

| Field | Notes |
|-------|-------|
| **Application name** | Required. 4 to 29 characters. |
| **Quilr key name** | Required. Defaults to `Default`. Names the gateway key, not your provider key. |
| **Application URL** | Optional. |
| **Initial key expiry** | Optional. Leave blank for a key that never expires. |

Next, choose where the provider credentials come from.

| Option | Use it when |
|--------|-------------|
| **Global providers** | A provider is already set up in **Settings > Models** and you want this app to reuse its credentials and models. |
| **Use app-specific credentials** | You want to enter provider credentials for this app only. |

:::info V2 console only
The **Global providers** option exists only in the V2 console, and it is the default when any global provider exists. In V1, every app uses app-specific credentials. Either way, the choice is fixed once the app is created.
:::

**Global providers.** Pick one or more providers. The first one you pick is the **Primary**. The app inherits all their models and credentials, including models added later.

![A global provider selected and marked Primary, with its model listed below](/img/llm-gateway/ui/create-app-global-provider-selected.png)

**App-specific credentials.** Click **Use app-specific credentials** and pick a provider type.

![The Provider dropdown listing provider types such as openai, anthropic, azureopenai, general, deepseek, Sarvam and bedrock](/img/llm-gateway/ui/create-app-provider-dropdown.png)

1. Keep or change the **Provider label**.
2. Enter the **Models** the app may call, separated by commas, or click **Discover models** to list what the credentials can reach.
3. Fill in the credential fields. Each provider's fields are listed in [Provider Support](./provider-support#credentials-by-provider).
4. Optional: click **Validate first model** to test the credentials.
5. Optional: use **Add provider** to add more providers for failover or routing.

![An openai provider form with Models and API key fields, followed by the Discover models, Validate first model and Add provider controls](/img/llm-gateway/ui/create-app-discover-models-add-provider.jpg)

:::tip Use QuilrAI-provided models
To put an app in front of [QuilrAI-provided models](./quilr-provided-models), add a **general** (General LLM) provider with base URL `https://models.quilrai.dev/v1` and a model API key from **Settings > Models > API keys**.
:::

Click **Continue to guardrails**.

### Step 2: Guardrails

![Create App step 2 with the Default guardrail action set to Monitor and the data and adversarial risk toggles](/img/llm-gateway/ui/create-app-step2-guardrails.jpg)

| Setting | Default |
|---------|---------|
| **Default guardrail action** | **Monitor**. You can choose Block, Redact or Partial redact instead. |
| **Data risks** | All six on: PII, PHI, financial, payment card, insurance, authentication secrets |
| **Adversarial risks** | 12 of 13 on. **Malicious scripts** is off. |
| **Dependency security check**, **Latest-version suggestions**, **Task adherence** | Off. These are [Guardian Agent](./features/guardian-agent) checks. |

Monitor logs detections without changing traffic, which makes it a safe first setting. Click **Create app**.

### Step 3: Key details

The last step shows the new Quilr key. Copy it. You can copy it again later from the app's **API Integration** section (see [Applications and Keys](./applications-and-keys#api-integration)).

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

The example uses US East. Pick the nearest region, and the right path for your SDK (Anthropic, boto3, Vertex AI, Responses, Realtime), in the [Integration Guide](./integration-guide).

## 3. Check that it worked

On the app card, click **Logs**. The **Activity > Requests** view lists each call with its model, provider, guardrail outcome, HTTP status, tokens and latency. See [Overview](./overview#the-app-workspace) for the other tabs.

## 4. Tune the app

Open the app card's **Configure** buttons to change any of these settings later.

| Setting | What it controls |
|---------|------------------|
| [Security Guardrails](./features/security-guardrails) | Data and adversarial risk categories, actions, hallucination check, source IPs |
| [Guardian Agent](./features/guardian-agent) | Dependency nudges and task adherence |
| [Custom Detections](./features/custom-intents) | Your own regex and intent detections |
| [Rate and Token Limits](./features/rate-limits) | Timeouts, concurrency, request rates, token ceilings |
| [Routing](./features/request-routing) | Weighted and token-based groups, failover, routing by request size |
| [Token Saving](./features/token-saving) | JSON, HTML, Markdown and text compression |
| [Prompt Store](./features/prompt-store) | Reusable system prompts |
| [Identity Aware](./features/identity-aware) | Required user identity, conversation IDs, JWT verification |
| [Self-Service](./features/self-service/overview) | What developers can see and change themselves |

If the [Policy Engine](../policy-engine/llm-gateway) is on, guardrails, Guardian Agent, limits, token saving, routing, identity requirements and Prompt Store enforcement follow published policies instead of these app settings.
