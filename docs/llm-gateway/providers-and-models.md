---
sidebar_position: 1.2
sidebar_custom_props:
  icon: Cloud
---

# Providers and Models

:::info V2 console only
**Settings > Models**, global providers and credential reuse across apps are available in the V2 console only. In V1, each app keeps its own provider credentials.
:::

A **global provider** is a provider connection you set up once for the whole tenant and then link to any number of apps. You manage them in **Settings > Models** under **Your models**.

<StepFlow steps={[
  { label: "Connect", items: ["Provider and API", "Label and credentials"] },
  { label: "Models", items: ["List or add by ID", "Pick what it serves"] },
  { label: "Pricing", items: ["USD per 1M tokens", "Published prices prefilled"] },
  { label: "Review & save", items: ["Everything saves together"] },
  { label: "Link to apps", items: ["Create App", "Global providers"] },
]} />

## Global providers or app-specific credentials

| | Global provider | App-specific credentials |
|---|---|---|
| Set up in | **Settings > Models** | Create App, or the app's **LLM Providers** section |
| Credentials | Stored once, shared by every linked app | Stored on one app |
| Models added later | Reach every linked app automatically | Added app by app |
| Credential change, disable or delete | Affects every linked app | Affects one app |
| Available in | V2 console | V1 and V2 consoles |

:::warning The choice is fixed when the app is created
An app uses either global providers or app-specific credentials, never both. You cannot convert an app later. To switch, create a new app.
:::

## Your models

Go to **Settings > Models > Models** and select **Your models**.

![Your models list showing two provider cards, each with its label, provider and API, Enabled badge, and a table of models with input, cached input and output prices](/img/llm-gateway/ui/models-your-models-list.png)

Each card is one provider connection. It shows the label, the provider and API (for example `Anthropic · Messages`), its status, and each model's input, cached input and output price in USD per 1M tokens. **Price source** shows `Published` when the price came from the provider's published list.

The **QuilrAI provided models** switch shows the models QuilrAI hosts. See [QuilrAI-Provided Models](./quilr-provided-models).

## Add a provider

Click **Add your own models**. Nothing is saved until the last step. Use **+ Add provider** at the top to connect several providers in one save (each provider type once per batch).

### 1. Connect

![Add your own models, Connect step, with provider tiles and the API options for Amazon Bedrock](/img/llm-gateway/ui/models-add-provider-picker.png)

1. Pick the provider tile.
2. Under **Which API does the gateway talk to?**, pick the API your apps call. This sets the gateway provider type.
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

Oracle OCI is coming to this page. Until then, set it up from the V1 console. See [Provider Support](./provider-support).

### 2. Models

![Models step with Get available models, Add by ID with Add without checking, and one selected model](/img/llm-gateway/ui/models-add-step-models-selected.png)

Only the models you select here are reachable through this provider.

- **Get available models** asks the provider which models the key can reach.
- **Add by ID** adds a model by name. Tick **Add without checking** to skip the reachability test.
- **Validation** set to **Don't validate** skips checks for the whole step.

### 3. Pricing

![Pricing step with input, output and cached input prices prefilled from published prices](/img/llm-gateway/ui/models-add-step-pricing.png)

Enter what each model costs you in USD per 1M tokens. Published prices are prefilled, so you only edit what your contract changes. Input and output are required; leave cached input empty if the provider has no separate cached price. The console computes estimated spend from these numbers.

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
Disabling or deleting a global provider, removing a model, or changing its credentials (for example with the [Management API](./management-apis/providers)) applies to every app linked to it. Changes can take a short time to appear.
:::

## Link providers to an app

In **Create App**, step 1 shows **Global providers** by default when any exist.

1. Pick one or more providers. The first one is the **Primary**. To change the order, remove and reselect.
2. The app inherits every model and credential of the linked providers.

If none exist, the wizard says **No global providers are available** and links to **Settings > Models**. See [Quick Start](./quick-start#step-1-application-and-providers).

To send a request to one specific linked provider, pass its label. See [Selecting a provider](./provider-support#selecting-a-provider-on-multi-provider-apps).

## QuilrAI-provided models in an app

QuilrAI-provided models can back a gateway app today through a **General LLM** (`general`) provider: base URL `https://models.quilrai.dev/v1` and a model API key from **Settings > Models > API keys**. Direct integration is coming soon. See [QuilrAI-Provided Models](./quilr-provided-models).
