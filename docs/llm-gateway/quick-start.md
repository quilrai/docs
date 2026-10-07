---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
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
- A platform provider already set up in **Settings > Models** (V2 console only, see [Providers and Models](./providers-and-models)). You can also add one from inside Create App.

## 1. Create the app

Go to **Settings > LLM Gateway** and click **Create App**. The wizard has two steps.

### Step 1: Application and providers

![Create App step 1 with Application name, Quilr key name, Application URL, Initial key expiry and the Global providers picker](/img/llm-gateway/ui/create-app-step1-global-providers.png)
<!-- TODO-SCREENSHOT: retake, shows old "Global providers" picker and old field layout (Key settings is now a collapsed row) -->

| Field | Notes |
|-------|-------|
| **Application name** | Required. 4 to 29 characters. |
| **Application URL** | Optional. |
| **Quilr key name** | Under **Key settings**. Required. Defaults to `Default`. Names the gateway key, not your provider key. |
| **Initial key expiry** | Under **Key settings**. Optional. Leave blank for a key that never expires. |

Next, under **Where should this app get its models?**, choose where the provider credentials come from.

| Option | Use it when |
|--------|-------------|
| **Platform providers** (Recommended) | You want this app to reuse providers your team already connected, with credentials and models managed in one place. |
| **App-only credentials** | You want to enter provider credentials for this app only, for example when one team's keys must stay separate. |

:::info V2 console only
The **Platform providers** option exists only in the V2 console, and it is the default. In V1, every app keeps its own provider credentials. Either way, the choice is fixed once the app is created.
:::

**Platform providers.** Select one or more providers. The first one you select is the **Primary**; the rest are fallbacks. Use the up and down arrows to change the order. The app inherits all their models and credentials, including models added later. If none exist yet, click **Add a platform provider** to add one without leaving the form, or **Use app-only credentials**.

![A global provider selected and marked Primary, with its model listed below](/img/llm-gateway/ui/create-app-global-provider-selected.png)
<!-- TODO-SCREENSHOT: retake, shows old "Global providers" picker -->

**App-only credentials.** Select **App-only credentials** and select a provider tile. For providers with more than one API, also select one under **Which API does the gateway talk to?**.

![The Provider dropdown listing provider types such as openai, anthropic, azureopenai, general, deepseek, Sarvam and bedrock](/img/llm-gateway/ui/create-app-provider-dropdown.png)
<!-- TODO-SCREENSHOT: retake, shows old Provider dropdown (now provider tiles) -->

1. Keep or change the **Provider label**.
2. Fill in the credential fields. Each provider's fields are listed in [Provider Support](./provider-support#credentials-by-provider).
3. Under **Models**, click **Get available models** and choose from the list, or type a model in **Add a model by name** and click **Add**. Each model is checked against the provider before it is added.
4. Optional: click **Add another provider** to add fallback providers for failover or routing.

![An openai provider form with Models and API key fields, followed by the Discover models, Validate first model and Add provider controls](/img/llm-gateway/ui/create-app-discover-models-add-provider.jpg)
<!-- TODO-SCREENSHOT: retake, shows old Discover models / Validate first model / Add provider controls -->

:::tip Use QuilrAI-provided models
To connect an app to [QuilrAI-provided models](./quilr-provided-models), add a **Custom endpoint** provider with the **Chat completions** API (`general`), base URL `https://models.quilrai.dev/v1` and a model API key from **Settings > Models > API keys**.
:::

Click **Create app**. There is no guardrail step: every new app starts with these defaults, which you can change later in its [Security Guardrails](./features/security-guardrails) section.

![Create App step 2 with the Default guardrail action set to Monitor and the data and adversarial risk toggles](/img/llm-gateway/ui/create-app-step2-guardrails.jpg)
<!-- TODO-SCREENSHOT: retake or remove, shows the old Create App guardrails step, which no longer exists -->

| Setting | Default |
|---------|---------|
| **Default guardrail action** | **Monitor**. You can change it later to Block, Redact or Partial redact. |
| **Data risks** | All six on: PII, PHI, financial, payment card, insurance, authentication secrets |
| **Adversarial risks** | 12 of 13 on. **Malicious scripts** is off. |
| **Dependency security check**, **Latest-version suggestions**, **Task adherence** | Off. These are [Guardian Agent](./features/guardian-agent) checks. |

Monitor logs detections without changing traffic.

### Step 2: Key details

The last step, **Integration**, shows the new Quilr key, the app's log export key and, if you have access, the all-apps log key. Copy them now, then click **Done**. You can copy the Quilr key again later from the app's **API Integration** section (see [Applications and Keys](./applications-and-keys#api-integration)).

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
