---
sidebar_position: 2
sidebar_label: "Providers and models"
sidebar_custom_props:
  icon: Cloud
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Providers and models

:::info V2 console only
**Settings > AI Gateway > Models**, platform providers and credential reuse across apps are available in the V2 console only. In V1, each app keeps its own provider credentials.
:::

The **Models** page (**Settings > AI Gateway > Models**) is where you manage every model the gateway can reach. It has four tabs:

| Tab | What it is for |
|-----|----------------|
| **Models** | **Your models** (your own provider connections and their costs) and **QuilrAI provided models** (the hosted catalog with retail prices). |
| **API keys** | Model API keys for calling QuilrAI-provided models directly. |
| **Usage** | Credit remaining, spend, requests, tokens and per-model throughput for QuilrAI-provided models. |
| **Playground** | Chat with any active QuilrAI-provided model. |

A **platform provider** is a provider connection you set up once for the whole tenant and then link to any number of apps. You manage them in **Settings > AI Gateway > Models** under **Your models**, or with **Provider configuration** on the **Settings > AI Gateway > LLM Gateway** page, which opens the same list.

<StepFlow steps={[
  { label: "Connect", items: ["Provider and API", "Label and credentials"] },
  { label: "Models", items: ["List or add by ID", "Pick what it serves"] },
  { label: "Pricing", items: ["USD per 1M tokens", "Published prices prefilled"] },
  { label: "Review & save", items: ["Everything saves together"] },
  { label: "Link to apps", items: ["Create App", "Platform providers"] },
]} />

## Platform providers or app-only credentials

| | Platform provider | App-only credentials |
|---|---|---|
| Set up in | **Settings > AI Gateway > Models**, or **Provider configuration** on the LLM Gateway page | Create App, or the app's **LLM Providers** section |
| Credentials | Stored once, shared by every linked app | Stored on one app |
| Models added later | Reach every linked app automatically | Added app by app |
| Credential change, disable or delete | Affects every linked app | Affects one app |
| Available in | V2 console | V1 and V2 consoles |

:::warning The choice is fixed when the app is created
An app uses either platform providers or app-only credentials, never both. You cannot convert an app later. To switch, create a new app.
:::

## Your models

Go to **Settings > AI Gateway > Models > Models** and select **Your models**.

![Your models list showing two provider cards, each with its label, provider and API, Enabled badge, and a table of models with input, cached input and output prices](/img/llm-gateway/ui/models-your-models-list.png)

Each card is one provider connection. It shows the label, the provider and API (for example `Anthropic · Messages`), its status, and each model's input, cached input and output price in USD per 1M tokens. **Price source** shows `Published` when the price came from the provider's published list.

The **QuilrAI provided models** switch shows the models QuilrAI hosts. See [QuilrAI-provided models](#quilrai-provided-models).

## Add a provider

Click **Add your own models**. Nothing is saved until the last step. Use **+ Add provider** at the top to connect several providers in one save (each provider type once per batch).

### 1. Connect

![Add your own models, Connect step, with provider tiles and the API options for Amazon Bedrock](/img/llm-gateway/ui/models-add-provider-picker.png)

1. Select the provider tile.
2. Under **Which API does the gateway talk to?**, select the API your apps call. This sets the gateway provider type.
3. Set the **Provider label**. The console suggests one such as `openai_02_oct_2026_1150`. The label is permanent once saved.
4. Fill in the credentials. See [Provider Support](./provider-support#credentials-by-provider) for each provider's fields.
5. Click **Check key and list models**.

| Tile | API options (gateway provider type) |
|------|-------------------------------------|
| OpenAI | Chat completions (`openai`), Responses (`openai_responses`), Assistants (`openai_assistants`), Realtime (`openai_realtime`) |
| Anthropic | Messages (`anthropic_messages`), Chat completions (`anthropic`) |
| Azure | OpenAI chat (`azureopenai`), Responses (`openai_responses_azure`), Assistants (`openai_assistants_azure`), Realtime (`openai_realtime_azure`), Anthropic messages (`anthropic_messages_azure`) |
| Amazon Bedrock | Converse (`bedrock`), Anthropic messages (`anthropic_messages_bedrock`), Embeddings (`bedrock_embeddings`), Rerank (`bedrock_rerank`) |
| Google | Vertex AI (`vertex_ai`), Gemini OpenAI-compatible (`gemini_chatcompletions`) |
| DeepSeek | Chat completions (`deepseek`) |
| Sarvam | Speech, text & chat (`sarvam`) |
| Cohere, Jina, Voyage | Rerank (`cohere_rerank`, `jina_rerank`, `voyage_rerank`) |
| Custom endpoint | Chat completions (`general`), Rerank (`general_rerank`) |


### 2. Models

![Models step with Get available models, Add by ID with Add without checking, and one selected model](/img/llm-gateway/ui/models-add-step-models-selected.png)

Only the models you select here are reachable through this provider.

- **Get available models** asks the provider which models the key can reach.
- **Add by ID** adds a model by name. Select **Add without checking** to skip the reachability test.
- **Validation** set to **Don't validate** skips checks for the whole step.

### 3. Pricing

![Pricing step with input, output and cached input prices prefilled from published prices](/img/llm-gateway/ui/models-add-step-pricing.png)

Enter what each model costs you in USD per 1M tokens. Published prices are prefilled, so you only need to adjust them to match your contract. Input and output are required; leave cached input empty if the provider has no separate cached price. The console computes estimated spend from these numbers.

### 4. Review & save

Click **Review all providers**, check the summary, and save.

## Add models to an existing provider

Click **+ Add models to this provider** under a card, or **Add models** in its gear menu.

![Add models to an existing provider, with the Stored key and Enabled badges and a List models with the stored key button](/img/llm-gateway/ui/models-add-to-existing-provider-stored-key.png)

- The stored key is reused. You never re-enter it.
- Provider, API and label stay fixed.
- Models already on the provider are marked **Already added**.
- Every linked app can call the new models once they are saved.

## Enable, disable and delete

![Provider gear menu with Add models, Disable provider and Delete provider](/img/llm-gateway/ui/models-provider-actions-menu.png)

| Action | Effect |
|--------|--------|
| **Add models** | Opens the add-models flow above. |
| **Disable provider** | Stops traffic to this provider in every linked app. Credentials and models are kept. |
| **Delete provider** | Removes the provider. Its label can never be reused. |
| **Remove model** (model row gear) | Removes one model. Linked apps can no longer call it. |

:::warning Changes reach every linked app
Disabling or deleting a platform provider, removing a model, or changing its credentials (for example with the [Management API](../api-reference/providers-and-configuration-api)) applies to every app linked to it. Changes can take a short time to appear.
:::

## Link providers to an app

In **Create App**, step 1 selects **Platform providers** by default.

1. Select one or more providers. The first one is the **Primary**; the rest are fallbacks. To change the order, use the up and down arrows.
2. The app inherits every model and credential of the linked providers.

If none exist, the wizard says **No platform providers yet** and offers **Add a platform provider** (adds one without leaving the form), **Provider configuration** and **Use app-only credentials**. See [Quick Start](../get-started/quick-start#1-create-the-app).

To send a request to one specific linked provider, pass its label. See [Selecting a provider](./provider-support#selecting-a-provider-on-multi-provider-apps).

## QuilrAI-provided models

QuilrAI hosts a catalog of chat models behind one OpenAI-compatible endpoint, `https://models.quilrai.dev/v1`. You do not need a provider account: create a model API key, select the models it may call, and send requests.

- **Billing:** each request is charged at the catalog's listed prices (USD per 1M tokens) and drawn from your organization's model credit. Contact QuilrAI support to raise your credit limit.
- **Shared credit:** the [Playground](#playground), [Workflow Agents](../../console/settings-ai-gateway/workflow-agents) and [Red Teaming](../../red-teaming/assessments/agentic-red-teaming) runs that use QuilrAI-provided models draw from the same credit.

| You want to | Use |
|---|---|
| Call a hosted model directly, billed from your QuilrAI credit | A [model API key](#model-api-keys) against `https://models.quilrai.dev/v1` |
| Use QuilrAI-provided models with gateway guardrails, routing, limits and logging | An LLM Gateway app with a General LLM provider ([steps](#use-quilrai-provided-models-in-a-gateway-app)) |
| Use your own OpenAI, Anthropic, Azure, Bedrock or Vertex accounts | An LLM Gateway app with [your own providers](#add-a-provider) |

A model API key can only call QuilrAI-provided models. Your own provider models cannot be added to it.

### Browse the catalog

Go to **Settings > AI Gateway > Models > Models** and select **QuilrAI provided models**.

![QuilrAI-provided models catalog](/img/llm-gateway/ui/models-quilrai-provided-catalog.png)

| Control | What it does |
|---|---|
| **Search models** | Filters by model ID or provider prefix. |
| **Sort by price** | Sorts by input, cached input or output price, low to high or high to low. |
| **Chat** (per row) | Opens the Playground with that model selected. |

Columns: **Model** (the exact ID to send as `model`), **Capabilities**, **Input price**, **Cached input price** ("Not available" when the model has none), **Output price** and **API schema** (informational; every model is called the same way). These docs do not keep a copy of the catalog, because models and prices change: **Settings > AI Gateway > Models > Models** is the reference for current model IDs and prices (USD per 1M tokens).

### Model API keys

1. Go to **Settings > AI Gateway > Models > API keys** and click **Create API key**.
2. Enter a **Key name** (required, 1 to 128 characters; "Console playground" is reserved) and pick **Allowed models** (at least one). The key can call only these models.
3. Click **Create API key**. The full key (`sk-quilrllm-...`) and the inference base URL are shown **once**. The console keeps only the key prefix.

![Create model API key dialog](/img/llm-gateway/ui/quilr-models-create-api-key-dialog.png)

:::warning
If you lose the key, revoke it and create a new one. Revocation is permanent.
:::

The list shows each key's name, key prefix, allowed models (**View**), status (`ACTIVE` / `REVOKED`), requests and spend this month, and **Revoke**. Keys have no expiry and no per-key spend limit; the organization credit is the only cap. You may also see keys you did not create: **Console playground** (used by the Playground) and **Agent run &lt;id&gt;** (a Workflow Agent run, limited to the run's model and revoked after it).

**Permissions:** viewing the catalog, keys and usage requires LLM Gateway read access. Creating a key requires LLM Gateway create access (under RBAC V2, `llm.apps.create` and `secrets.reveal`). Revoking requires LLM Gateway delete access (`llm.apps.delete`). Every key creation is recorded in the audit log.

### Call a model

| | |
|---|---|
| **Base URL** | `https://models.quilrai.dev/v1` |
| **Endpoint** | `POST /chat/completions` (OpenAI Chat Completions format) |
| **Auth** | `Authorization: Bearer $QUILR_MODEL_API_KEY` |
| **Model** | The exact catalog ID, including any prefix (for example `deepseek/deepseek-v3.2`). It must be one of the key's allowed models. |

<Tabs groupId="quilr-models-lang">
<TabItem value="curl" label="cURL" default>

```bash
curl 'https://models.quilrai.dev/v1/chat/completions' \
  -H "Authorization: Bearer $QUILR_MODEL_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
  "model": "deepseek/deepseek-v3.2",
  "messages": [{"role": "user", "content": "Explain zero trust in one sentence."}],
  "max_tokens": 1024
}'
```

</TabItem>
<TabItem value="python" label="Python">

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["QUILR_MODEL_API_KEY"],
    base_url="https://models.quilrai.dev/v1",
)
response = client.chat.completions.create(
    model="deepseek/deepseek-v3.2",
    messages=[{"role": "user", "content": "Explain zero trust in one sentence."}],
    max_tokens=1024,
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="node" label="Node">

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.QUILR_MODEL_API_KEY,
  baseURL: "https://models.quilrai.dev/v1",
});
const response = await client.chat.completions.create({
  model: "deepseek/deepseek-v3.2",
  messages: [
    { role: "user", content: "Explain zero trust in one sentence." }
  ],
  temperature: 0.7,
  top_p: 1,
  max_tokens: 1024,
});
console.log(response.choices[0].message.content);
```

</TabItem>
</Tabs>

The Playground's **Use this model in your app** panel generates these snippets for the selected model, prompt and settings.

### Use QuilrAI-provided models in a gateway app

Route QuilrAI-provided models through an LLM Gateway app to apply the app's guardrails, routing, limits and logs.

1. [Create a model API key](#model-api-keys) whose **Allowed models** include every model the app should use.
2. Add a **General LLM** provider to the app (the **Custom endpoint** tile with the **Chat completions** API, `general`), as a platform provider or with app-only credentials:

   | Field | Value |
   |---|---|
   | `base_url` | `https://models.quilrai.dev/v1` |
   | `api_key` | Your model API key (`sk-quilrllm-...`) |
   | Models | The exact catalog IDs, for example `deepseek/deepseek-v3.2` |

3. Call the app with its QuilrAI gateway key (`sk-quilr-...`) as in the [Quick Start](../get-started/quick-start), using the catalog ID as `model`.

Usage is billed from your organization credit either way and appears in the key's spend and the **Usage** tab. Selecting QuilrAI-provided models directly in **Create App**, without a General LLM provider, is coming soon.

### Playground

Go to **Settings > AI Gateway > Models > Playground** (or click **Chat** on a catalog row). No key is needed; the Playground uses its own server-held key. Requests count toward your organization's usage, and responses are not stored by the console or streamed.

| Setting | Range | Default |
|---|---|---|
| **Model** | Any active catalog model | |
| **System prompt** / **User prompt** | Up to 16,000 characters each | |
| **Temperature** | 0 to 2 | 0.7 |
| **Top P** | 0 to 1 | 1 |
| **Max output tokens** | 1 to 4,096 | 1,024 |

Conversations are limited to 20 messages and 64,000 characters.

### Usage

**Settings > AI Gateway > Models > Usage** shows credit and spend. Usage can take a few moments to appear; click **Refresh** to update.

| Tile | Shows |
|---|---|
| **Credit remaining** | Remaining credit, and amount spent of your lifetime limit |
| **Spend this month** | Spend in the current UTC month |
| **Requests this month** | Successful and failed requests |
| **Tokens this month** | Input and output tokens |
| **Total throughput** | Tokens per second, input and output |

Below the tiles, a per-model table lists requests, tokens, input/output/total TPS, average latency, error rate, month spend and lifetime spend. If a banner says some token totals are estimated, the provider did not report exact usage for those requests. Per-key spend is on the **API keys** tab.
