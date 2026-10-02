---
sidebar_position: 1.3
sidebar_custom_props:
  icon: Sparkles
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# QuilrAI-Provided Models

:::info V2 console only
**Settings > Models** is available in the V2 console only.
:::

QuilrAI hosts a catalog of chat models behind one OpenAI-compatible endpoint. You do not need a provider account: create a model API key, pick the models it may call, and send requests to `https://models.quilrai.dev/v1`.

| | |
|---|---|
| **Billing** | Each request is charged at the catalog's listed prices (USD per 1M tokens) and drawn from your organization's model credit. Contact QuilrAI support to raise your credit limit. |
| **Shared credit** | The [Playground](#try-a-model-in-the-playground), Workflow Agents, and [Red Teaming](./features/agentic-red-teaming) runs that use QuilrAI-provided models all draw from the same credit. |
| **Where** | **Settings > Models**: **Models** (catalog), **API keys**, **Usage**, **Playground** tabs. |

## When to use which

| You want to | Use |
|---|---|
| Call a hosted model directly, without a provider account, billed from your QuilrAI credit | **A model API key** against `https://models.quilrai.dev/v1` ([steps 1 to 3](#1-browse-the-catalog)) |
| Use QuilrAI-provided models with LLM Gateway guardrails, routing, rate and token limits, and logging | **An LLM Gateway app** with a General LLM provider that points at QuilrAI-provided models ([steps](#use-through-an-llm-gateway-app)) |
| Use your own OpenAI, Anthropic, Azure, Bedrock, or Vertex accounts | **An LLM Gateway app** with your own providers ([Quick Start](./quick-start), [Providers and Models](./providers-and-models)) |

A model API key can only call QuilrAI-provided models. Your own provider models cannot be added to it.

## 1. Browse the catalog

Go to **Settings > Models > Models** and select **QuilrAI provided models**.

![QuilrAI-provided models catalog](/img/llm-gateway/ui/models-quilrai-provided-catalog.png)

| Control | What it does |
|---|---|
| **Search models** | Filters by model id or provider prefix. |
| **Sort by price** | Sorts by input, cached input, or output price, low to high or high to low. |
| **Chat** (per row) | Opens the Playground with that model selected. |

Columns: **Model** (the exact id to send as `model`), **Capabilities**, **Input price**, **Cached input price** ("Not available" when the model has no cached-input price), **Output price**, and **API schema**. Prices are USD per 1M tokens. See the [full catalog](#model-catalog) below.

## 2. Create a model API key

1. Go to **Settings > Models > API keys** and click **Create API key**.

   ![API keys tab with the Create API key button](/img/llm-gateway/ui/quilr-models-api-keys-header.png)

2. Fill in the dialog:

   | Field | Notes |
   |---|---|
   | **Key name** | Required, 1 to 128 characters. Example: "Production inference". The name "Console playground" is reserved. |
   | **Allowed models** | Required, at least one. Searchable multi-select of the QuilrAI catalog. The key can call only these models. |

   ![Create model API key dialog](/img/llm-gateway/ui/quilr-models-create-api-key-dialog.png)

   ![Allowed models picker open](/img/llm-gateway/ui/quilr-models-create-api-key-model-picker.jpg)

   ![One allowed model selected](/img/llm-gateway/ui/quilr-models-create-api-key-selected.png)

3. Click **Create API key**. The full key (`sk-quilrllm-...`) and the inference base URL are shown **once**. Copy the key and store it securely; the console keeps only the key prefix.

:::warning
If you lose the key, revoke it and create a new one. Revocation is permanent.
:::

The **API keys** list shows each key's name, key prefix, allowed models (click **View** to expand), status (`ACTIVE` / `REVOKED`), requests and spend this month, and a **Revoke** action. Keys have no expiry and no per-key spend limit; the organization credit is the only cap.

![Models a key may call](/img/llm-gateway/ui/quilr-models-api-key-allowed-models.png)

You may also see keys you did not create:

| Key name | Created by |
|---|---|
| **Console playground** | The Playground. Older playground keys stay listed after they are replaced. |
| **Agent run &lt;id&gt;** | A Workflow Agent run. Limited to the run's model and revoked after the run. |

**Permissions:** viewing the catalog, keys, and usage needs LLM Gateway read access. Creating a key needs LLM Gateway create access (under RBAC V2, `llm.apps.create` and `secrets.reveal`). Revoking needs LLM Gateway delete access (`llm.apps.delete`). Every key creation is recorded in the audit log.

## 3. Call a model

| | |
|---|---|
| **Base URL** | `https://models.quilrai.dev/v1` |
| **Endpoint** | `POST /chat/completions` (OpenAI Chat Completions format) |
| **Auth** | `Authorization: Bearer $QUILR_MODEL_API_KEY` |
| **Model** | The exact catalog id, including any prefix (for example `deepseek/deepseek-v3.2`, `gpt-oss-120b`). It must be one of the key's allowed models. |

```bash
export QUILR_MODEL_API_KEY="sk-quilrllm-..."
```

<Tabs groupId="quilr-models-lang">
<TabItem value="curl" label="cURL" default>

```bash
curl 'https://models.quilrai.dev/v1/chat/completions' \
  -H "Authorization: Bearer $QUILR_MODEL_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
  "model": "deepseek/deepseek-v3.2",
  "messages": [
    {
      "role": "user",
      "content": "Explain zero trust in one sentence."
    }
  ],
  "temperature": 0.7,
  "top_p": 1,
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
    messages=[
        {"role": "user", "content": "Explain zero trust in one sentence."}
    ],
    temperature=0.7,
    top_p=1,
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

:::tip
The Playground's **Use this model in your app** panel generates these snippets for the selected model, prompt, and settings.
:::

## Use through an LLM Gateway app

Put QuilrAI-provided models behind an LLM Gateway app to get the app's guardrails, routing, limits, and logs. The app reaches them through the **General LLM** provider (an OpenAI-compatible custom endpoint).

1. [Create a model API key](#2-create-a-model-api-key) whose **Allowed models** include every model the app should use.
2. In the LLM Gateway, create an app (or edit an existing one) and add a **General LLM** provider, either as a global provider or with app-specific credentials:

   | Field | Value |
   |---|---|
   | `base_url` | `https://models.quilrai.dev/v1` |
   | `api_key` | Your model API key (`sk-quilrllm-...`) |
   | Models | The exact catalog ids, for example `deepseek/deepseek-v3.2` |

3. Call the app with its QuilrAI gateway key (`sk-quilr-...`) as in the [Quick Start](./quick-start), using the catalog id as `model`.

See [Provider Support](./provider-support) for the General LLM provider's capabilities.

Usage is billed from your organization credit either way, and shows up on the model API key's spend and the **Usage** tab.

:::note
Native integration, selecting QuilrAI-provided models directly in **Create App** without a General LLM provider, is coming soon.
:::

## Try a model in the Playground

Go to **Settings > Models > Playground** (or click **Chat** on a catalog row). Playground requests count toward your organization's usage, and responses are not stored by the console. You do not need to create a key; the Playground uses its own server-held key.

![Models Playground](/img/llm-gateway/ui/models-playground.png)

| Setting | Range | Default |
|---|---|---|
| **Model** | Any active catalog model | |
| **System prompt** | Up to 16,000 characters | |
| **Temperature** | 0 to 2 | 0.7 |
| **Top P** | 0 to 1 | 1 |
| **Max output tokens** | 1 to 4,096 | 1,024 |
| **User prompt** | Up to 16,000 characters | |

Conversations are limited to 20 messages and 64,000 characters. Playground responses are not streamed.

![Request settings and the Use this model in your app panel](/img/llm-gateway/ui/models-playground-request-settings-snippet.png)

## Track usage

**Settings > Models > Usage** shows your credit and spend. Usage can take a few moments to appear after a request completes; click **Refresh** to update.

| Tile | Shows |
|---|---|
| **Credit remaining** | Remaining credit, and amount spent of your lifetime limit |
| **Spend this month** | Spend in the current UTC month |
| **Requests this month** | Successful and failed requests |
| **Tokens this month** | Input and output tokens |
| **Total throughput** | Tokens per second, input and output |

Below the tiles, a per-model table lists requests, tokens, input/output/total TPS, average latency, error rate, month spend, and lifetime spend. Models that have only lifetime spend stay listed with zeros for the month. If a banner says some token totals are estimated, the provider did not report exact usage for those requests.

Per-key spend for the current month is on the **API keys** tab.

## Model catalog

Catalog as of 2026-10-02; the console shows the current list and prices. Prices are USD per 1M tokens. API schema is informational: every model is called the same way.

| Model (use as `model`) | Capabilities | Input | Cached input | Output | API schema |
|---|---|---|---|---|---|
| `anthracite-org/magnum-v4-72b` | Chat, Streaming | $5 | Not available | $10 | v1 |
| `baidu/ernie-4.5-vl-424b-a47b` | Chat, Streaming | $0.84 | Not available | $2.5 | v1 |
| `bytedance/ui-tars-1.5-7b` | Chat, Streaming | $0.2 | $0.2 | $0.4 | v1 |
| `cognitivecomputations/dolphin-mistral-24b-venice-edition` | Chat, Streaming | $0.4 | Not available | $1.8 | v1 |
| `deepseek-r1-distill-qwen-32b` | Chat, Streaming | $0.994 | Not available | $9.762 | v2 |
| `deepseek-v4-flash-0731` | Chat, Streaming | $0.88 | $0.028 | $2.64 | v2 |
| `deepseek-v4-pro-0813` | Chat, Streaming | $2.64 | $0.088 | $7.92 | v2 |
| `deepseek/deepseek-chat` | Chat, Streaming | $0.64 | Not available | $1.78 | v1 |
| `deepseek/deepseek-chat-v3-0324` | Chat, Streaming | $0.48 | $0.27 | $1.8 | v1 |
| `deepseek/deepseek-chat-v3.1` | Chat, Streaming | $0.5 | $0.26 | $1.9 | v1 |
| `deepseek/deepseek-r1` | Chat, Streaming | $1.4 | Not available | $5 | v1 |
| `deepseek/deepseek-r1-0528` | Chat, Streaming | $1 | $0.7 | $4.3 | v1 |
| `deepseek/deepseek-r1-distill-llama-70b` | Chat, Streaming | $1.6 | Not available | $1.6 | v1 |
| `deepseek/deepseek-v3.1-terminus` | Chat, Streaming | $0.54 | $0.27 | $2 | v1 |
| `deepseek/deepseek-v3.2` | Chat, Streaming | $0.52 | $0.26 | $0.76 | v1 |
| `deepseek/deepseek-v3.2-exp` | Chat, Streaming | $0.54 | Not available | $0.82 | v1 |
| `deepseek/deepseek-v4-flash-vision-exp` | Chat, Streaming | $0.4312 | $0.1372 | $1.2936 | v1 |
| `gemma-4-26b-a4b-it` | Chat, Streaming | $0.2 | Not available | $0.6 | v2 |
| `gemma-sea-lion-v4-27b-it` | Chat, Streaming | $0.702 | Not available | $1.11 | v2 |
| `glm-4.7-flash` | Chat, Streaming | $0.121 | Not available | $0.8 | v2 |
| `glm-5.2` | Chat, Streaming | $2.8 | $0.52 | $8.8 | v2 |
| `glm-5.3` | Chat, Streaming | $2.8 | $0.52 | $8.8 | v1 |
| `glm-5.3-flash` | Chat, Streaming | $0.3 | $0.06 | $1 | v1 |
| `google/gemma-2-27b-it` | Chat, Streaming | $1.3 | Not available | $1.3 | v1 |
| `google/gemma-3-12b-it` | Chat, Streaming | $0.1 | Not available | $0.3 | v1 |
| `google/gemma-3-27b-it` | Chat, Streaming | $0.16 | Not available | $0.32 | v1 |
| `google/gemma-3-4b-it` | Chat, Streaming | $0.1 | Not available | $0.2 | v1 |
| `google/gemma-4-31b-it` | Chat, Streaming | $0.18 | $0.1 | $0.68 | v1 |
| `gpt-oss-120b` | Chat, Streaming | $0.7 | Not available | $1.5 | v2 |
| `gpt-oss-120b-ultrafast` | Chat, Streaming | $0.7 | Not available | $1.5 | v1 |
| `gpt-oss-20b` | Chat, Streaming | $0.4 | Not available | $0.6 | v2 |
| `granite-4.0-h-micro` | Chat, Streaming | $0.034 | Not available | $0.224 | v2 |
| `gryphe/mythomax-l2-13b` | Chat, Streaming | $0.12 | Not available | $0.12 | v1 |
| `ibm-granite/granite-4.1-8b` | Chat, Streaming | $0.1 | $0.1 | $0.2 | v1 |
| `ibm-granite/granite-4.2-8b` | Chat, Streaming | $0.2 | $0.1 | $0.3 | v1 |
| `inclusionai/ling-3.0-flash` | Chat, Streaming | $0.042 | $0.0084 | $0.126 | v1 |
| `kimi-k2.6` | Chat, Streaming | $1.9 | $0.32 | $8 | v2 |
| `kimi-k2.7-code` | Chat, Streaming | $1.9 | $0.38 | $8 | v2 |
| `llama-3.1-8b-instruct-fp8` | Chat, Streaming | $0.304 | Not available | $0.574 | v2 |
| `llama-3.2-11b-vision-instruct` | Chat, Streaming | $0.097 | Not available | $1.352 | v2 |
| `llama-3.2-1b-instruct` | Chat, Streaming | $0.054 | Not available | $0.402 | v2 |
| `llama-3.2-3b-instruct` | Chat, Streaming | $0.1018 | Not available | $0.67 | v2 |
| `llama-3.3-70b-instruct-fp8-fast` | Chat, Streaming | $0.586 | Not available | $4.506 | v2 |
| `llama-4-scout-17b-16e-instruct` | Chat, Streaming | $0.54 | Not available | $1.7 | v2 |
| `llama-guard-3-8b` | Chat, Streaming | $0.968 | Not available | $0.06 | v2 |
| `meta-llama/llama-3.1-70b-instruct` | Chat, Streaming | $0.8 | Not available | $0.8 | v1 |
| `meta-llama/llama-4-maverick` | Chat, Streaming | $0.4 | Not available | $1.392 | v1 |
| `meta-llama/llama-guard-4-12b` | Chat, Streaming | $0.36 | Not available | $0.36 | v1 |
| `meta/muse-glimmer-30b` | Chat, Streaming | $0.6 | $0.08 | $2.2 | v1 |
| `microsoft/phi-4` | Chat, Streaming | $0.14 | Not available | $0.28 | v1 |
| `microsoft/wizardlm-2-8x22b` | Chat, Streaming | $1.24 | Not available | $1.24 | v1 |
| `minimax/minimax-m2` | Chat, Streaming | $0.51 | Not available | $2.04 | v1 |
| `minimax/minimax-m2.1` | Chat, Streaming | $0.6 | $0.06 | $2.4 | v1 |
| `minimax/minimax-m2.5` | Chat, Streaming | $0.54 | $0.06 | $1.9 | v1 |
| `minimax/minimax-m2.7` | Chat, Streaming | $0.48 | Not available | $1.92 | v1 |
| `minimax/minimax-m3` | Chat, Streaming | $0.46 | $0.1 | $1.92 | v1 |
| `mistral-small-3.1-24b-instruct` | Chat, Streaming | $0.702 | Not available | $1.11 | v2 |
| `mistralai/devstral-2512` | Chat, Streaming | $0.8 | $0.08 | $4 | v1 |
| `mistralai/ministral-14b-2512` | Chat, Streaming | $0.4 | $0.04 | $0.4 | v1 |
| `mistralai/ministral-3b-2512` | Chat, Streaming | $0.2 | $0.02 | $0.2 | v1 |
| `mistralai/ministral-8b-2512` | Chat, Streaming | $0.3 | $0.03 | $0.3 | v1 |
| `mistralai/mistral-nemo` | Chat, Streaming | $0.038 | Not available | $0.06 | v1 |
| `mistralai/mistral-small-24b-instruct-2501` | Chat, Streaming | $0.1 | Not available | $0.16 | v1 |
| `mistralai/mistral-small-2603` | Chat, Streaming | $0.3 | $0.03 | $1.2 | v1 |
| `mistralai/mistral-small-3.2-24b-instruct` | Chat, Streaming | $0.15 | Not available | $0.4 | v1 |
| `mistralai/mixtral-8x22b-instruct` | Chat, Streaming | $4.4 | $0.44 | $13.2 | v1 |
| `mistralai/voxtral-small-24b-2507` | Chat, Streaming | $0.2 | $0.02 | $0.6 | v1 |
| `moonshotai/kimi-k2` | Chat, Streaming | $1.14 | Not available | $4.6 | v1 |
| `moonshotai/kimi-k2-0905` | Chat, Streaming | $1.2 | Not available | $5 | v1 |
| `moonshotai/kimi-k2-thinking` | Chat, Streaming | $1.2 | Not available | $5 | v1 |
| `moonshotai/kimi-k2.5` | Chat, Streaming | $0.9 | $0.14 | $4.5 | v1 |
| `moonshotai/kimi-k3` | Chat, Streaming | $5.2 | $0.58 | $26 | v1 |
| `nemotron-3-120b-a12b` | Chat, Streaming | $1 | Not available | $3 | v2 |
| `nex-agi/nex-n2-pro` | Chat, Streaming | $1 | $0.5 | $5 | v1 |
| `nousresearch/hermes-3-llama-3.1-405b` | Chat, Streaming | $2 | Not available | $2 | v1 |
| `nousresearch/hermes-3-llama-3.1-70b` | Chat, Streaming | $1.4 | Not available | $1.4 | v1 |
| `nousresearch/hermes-4-405b` | Chat, Streaming | $2 | Not available | $6 | v1 |
| `nousresearch/hermes-4-70b` | Chat, Streaming | $0.26 | Not available | $0.8 | v1 |
| `nvidia/nemotron-3-nano-30b-a3b` | Chat, Streaming | $0.1 | $0.06 | $0.4 | v1 |
| `nvidia/nemotron-3-ultra-550b-a55b` | Chat, Streaming | $1 | $0.2 | $4.4 | v1 |
| `nvidia/nemotron-3.5-lightning` | Chat, Streaming | $0.16 | $0.08 | $0.4 | v1 |
| `openai/gpt-oss-safeguard-20b` | Chat, Streaming | $0.15 | $0.075 | $0.6 | v1 |
| `qwen-3.8-27b-ultrafast` | Chat, Streaming | $1.98 | Not available | $2.98 | v1 |
| `qwen/qwen-2.5-72b-instruct` | Chat, Streaming | $0.72 | Not available | $0.8 | v1 |
| `qwen/qwen-2.5-7b-instruct` | Chat, Streaming | $0.2 | Not available | $0.4 | v1 |
| `qwen/qwen2.5-vl-72b-instruct` | Chat, Streaming | $0.5 | Not available | $1.5 | v1 |
| `qwen/qwen3-14b` | Chat, Streaming | $0.2 | Not available | $0.44 | v1 |
| `qwen/qwen3-235b-a22b-2507` | Chat, Streaming | $0.18 | Not available | $1.1 | v1 |
| `qwen/qwen3-235b-a22b-thinking-2507` | Chat, Streaming | $0.6 | Not available | $6 | v1 |
| `qwen/qwen3-30b-a3b-instruct-2507` | Chat, Streaming | $0.18 | Not available | $0.6 | v1 |
| `qwen/qwen3-32b` | Chat, Streaming | $0.16 | Not available | $0.56 | v1 |
| `qwen/qwen3-coder` | Chat, Streaming | $0.6 | $0.2 | $2 | v1 |
| `qwen/qwen3-coder-30b-a3b-instruct` | Chat, Streaming | $0.14 | Not available | $0.54 | v1 |
| `qwen/qwen3-coder-next` | Chat, Streaming | $0.24 | $0.14 | $1.6 | v1 |
| `qwen/qwen3-next-80b-a3b-instruct` | Chat, Streaming | $0.18 | Not available | $2.2 | v1 |
| `qwen/qwen3-next-80b-a3b-thinking` | Chat, Streaming | $0.3 | Not available | $2.4 | v1 |
| `qwen/qwen3-vl-235b-a22b-instruct` | Chat, Streaming | $0.4 | $0.22 | $1.76 | v1 |
| `qwen/qwen3-vl-235b-a22b-thinking` | Chat, Streaming | $1.96 | Not available | $7.9 | v1 |
| `qwen/qwen3-vl-30b-a3b-instruct` | Chat, Streaming | $0.3 | Not available | $1.2 | v1 |
| `qwen/qwen3-vl-30b-a3b-thinking` | Chat, Streaming | $0.58 | Not available | $2 | v1 |
| `qwen/qwen3-vl-8b-instruct` | Chat, Streaming | $0.5 | $0.24 | $1.5 | v1 |
| `qwen/qwen3.5-122b-a10b` | Chat, Streaming | $0.52 | Not available | $4.16 | v1 |
| `qwen/qwen3.5-27b` | Chat, Streaming | $0.5 | Not available | $4 | v1 |
| `qwen/qwen3.5-35b-a3b` | Chat, Streaming | $0.28 | $0.1 | $2 | v1 |
| `qwen/qwen3.5-397b-a17b` | Chat, Streaming | $0.9 | $0.44 | $6 | v1 |
| `qwen/qwen3.5-9b` | Chat, Streaming | $0.2 | Not available | $0.3 | v1 |
| `qwen/qwen3.6-27b` | Chat, Streaming | $0.64 | $0.3 | $5.4 | v1 |
| `qwen/qwen3.6-35b-a3b` | Chat, Streaming | $0.2 | $0.1 | $1.8 | v1 |
| `qwen/qwen3.8-2.4t-a95b` | Chat, Streaming | $4 | $0.4 | $12 | v1 |
| `qwen2.5-coder-32b-instruct` | Chat, Streaming | $1.32 | Not available | $2 | v2 |
| `qwen3-30b-a3b-fp8` | Chat, Streaming | $0.1018 | Not available | $0.67 | v2 |
| `qwen3.8-27b` | Chat, Streaming | $0.9 | $0.1 | $6.4 | v2 |
| `qwq-32b` | Chat, Streaming | $1.32 | Not available | $2 | v2 |
| `rekaai/reka-edge` | Chat, Streaming | $0.2 | Not available | $0.2 | v1 |
| `rekaai/reka-flash-3` | Chat, Streaming | $0.2 | Not available | $0.4 | v1 |
| `sao10k/l3-lunaris-8b` | Chat, Streaming | $0.08 | Not available | $0.1 | v1 |
| `sao10k/l3.1-euryale-70b` | Chat, Streaming | $1.7 | Not available | $1.7 | v1 |
| `sao10k/l3.3-euryale-70b` | Chat, Streaming | $1.3 | Not available | $1.5 | v1 |
| `stepfun/step-3.5-flash` | Chat, Streaming | $0.2 | Not available | $0.6 | v1 |
| `stepfun/step-3.7-flash` | Chat, Streaming | $0.32 | $0.064 | $1.84 | v1 |
| `tencent/hunyuan-a13b-instruct` | Chat, Streaming | $0.28 | Not available | $1.14 | v1 |
| `tencent/hy-mt2-1.8b` | Chat, Streaming | $0.088 | Not available | $0.354 | v1 |
| `tencent/hy-mt2-30b-a3b` | Chat, Streaming | $0.148 | Not available | $0.59 | v1 |
| `tencent/hy-mt2-7b` | Chat, Streaming | $0.148 | Not available | $0.59 | v1 |
| `tencent/hy3` | Chat, Streaming | $0.28 | $0.07 | $1.16 | v1 |
| `thedrummer/cydonia-24b-v4.1` | Chat, Streaming | $0.6 | $0.3 | $1 | v1 |
| `thedrummer/skyfall-36b-v2` | Chat, Streaming | $1.1 | $0.5 | $1.6 | v1 |
| `thedrummer/unslopnemo-12b` | Chat, Streaming | $0.8 | Not available | $0.8 | v1 |
| `thinkingmachines/inkling` | Chat, Streaming | $1.9 | $0.32 | $8.1 | v1 |
| `thinkingmachines/inkling-small` | Chat, Streaming | $0.9 | $0.2 | $2.4 | v1 |
| `undi95/remm-slerp-l2-13b` | Chat, Streaming | $0.7 | Not available | $1.3 | v1 |
| `xiaomi/mimo-v2.5` | Chat, Streaming | $0.336 | $0.0068 | $0.672 | v1 |
| `xiaomi/mimo-v2.5-pro` | Chat, Streaming | $0.96048 | $0.007912 | $1.92096 | v1 |
| `z-ai/glm-4.5` | Chat, Streaming | $1.2 | $0.22 | $4.4 | v1 |
| `z-ai/glm-4.5-air` | Chat, Streaming | $0.26 | $0.05 | $1.7 | v1 |
| `z-ai/glm-4.5v` | Chat, Streaming | $1.2 | $0.22 | $3.6 | v1 |
| `z-ai/glm-4.6` | Chat, Streaming | $0.86 | $0.16 | $3.5 | v1 |
| `z-ai/glm-4.6v` | Chat, Streaming | $0.6 | $0.11 | $1.8 | v1 |
| `z-ai/glm-4.7` | Chat, Streaming | $0.8 | $0.16 | $3.5 | v1 |
| `z-ai/glm-5` | Chat, Streaming | $1.2 | $0.24 | $4.16 | v1 |
| `z-ai/glm-5.1` | Chat, Streaming | $2.1 | $0.41 | $7 | v1 |
