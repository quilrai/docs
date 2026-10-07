---
sidebar_position: 4
sidebar_label: "Model red teaming"
sidebar_custom_props:
  icon: BrainCircuit
description: "Red team one model or compare 2-8 models side by side, from your gateway models, QuilrAI-provided models, or manual entry, with system prompts and Tool Studio."
---

# Model Red Teaming

Point the adaptive red-team engine directly at a model: probe its guardrails, its system prompt, and the tools it is allowed to call. Test one model, or compare two to eight on the same objectives.

Model Red Teaming is the **Model Red Teaming** tab on **Assessments → Red Teaming**. It uses the same three-step form, attack library, evaluation policy, reports, findings tracker, and schedules as [Agentic Red Teaming](./agentic-red-teaming). Only step 01 differs: you choose models instead of an agent endpoint.

![Model Red Teaming tab with the New assessment form, Assessment mode set to Single model, and the Models to assess section](/img/red-teaming/model-new-assessment-overview.png)

<StepFlow
  steps={[
    { label: '01 Choose the model', items: ['Single or compare (2-8)', 'Model source per model', 'Optional system prompt + tools'] },
    { label: '02 Challenge', items: ['Quick scan / Full library / Select attacks'] },
    { label: '03 Launch', items: ['Scope, depth, evaluation policy'] },
    { label: 'Results', items: ['One report per model', 'Campaign view for comparisons'] },
  ]}
/>

## 01 Choose the model

1. Enter a **Name** (for example "Checkout assistant model").
2. Pick an **Assessment mode**:

   | Mode | What it does |
   |------|--------------|
   | **Single model** (default) | Assess one model with its own provider credentials. |
   | **Compare models** | Run the same objectives and evaluation policy against two to eight models. |

3. For each model card, pick a **Model source**.
4. Optionally add a system prompt and tools.

### Model sources

| Source | What you enter | How it runs |
|--------|----------------|-------------|
| **Your models** | Pick a model from a list | Models you connected in the Models tab. Runs through the LLM gateway with the key already saved for that provider, so nothing is entered here. See [Providers and Models](../../llm-gateway/apps-and-providers/providers-and-models). |
| **QuilrAI provided models** | Pick a hosted model | Models QuilrAI hosts for you, run through your managed access with no key. See [QuilrAI Provided Models](../../llm-gateway/apps-and-providers/providers-and-models). |
| **Enter manually** (default) | Provider, model id, endpoint URL, API key | Calls the provider directly with the key you type. |

![Model source set to Your models, with the Your model dropdown and the system prompt and Tools fields below](/img/red-teaming/model-source-your-models.png)

### Enter manually

![Enter manually with Provider OpenAI, Model id gpt-5.4-mini, Endpoint URL https://api.openai.com/v1, and the OpenAI API key field](/img/red-teaming/model-connect-enter-manually.png)

| Field | Default | Notes |
|-------|---------|-------|
| **Provider** | OpenAI | One of the 17 providers below. |
| **Model id** | `gpt-5.4-mini` for OpenAI (`claude-sonnet-5` for Anthropic) | Pick from the provider's current models, or type any model id the provider serves. |
| **Endpoint URL** | `https://api.openai.com/v1` for OpenAI | Where the assessment sends chat completions. |
| **API key** | Empty | For example `sk-...` for OpenAI or `sk-ant-...` for Anthropic. |

:::tip
Point the endpoint URL at a gateway or proxy to assess the model exactly as your app reaches it.
:::

**Supported providers (17):**

| Group | Providers |
|-------|-----------|
| Model providers | OpenAI, Anthropic, Google Gemini, xAI (Grok), DeepSeek, Mistral, Cohere, Perplexity |
| Open-model hosts | Hugging Face, Groq, Together AI, Fireworks AI, OpenRouter |
| Cloud platforms | Azure OpenAI, AWS Bedrock, Google Vertex AI |
| Your own endpoint | Custom OpenAI-compatible endpoint |

![Provider dropdown open on the Model providers group: OpenAI, Anthropic, Google Gemini, xAI (Grok), DeepSeek, Mistral, Cohere](/img/red-teaming/model-provider-list.png)

### System prompt and tools

Both are optional, and both make the test closer to your real application.

| Field | Why add it |
|-------|-----------|
| **System prompt** | Tests the instructions your app actually sends, and enables the prompt-hardening diff in the report. |
| **Tools** | Declares the functions the model can call so the red agent probes them for unsafe or unauthorized invocation. Leave empty to let recon discover tools on its own. |

![System prompt field and the expanded Tools section with Open Tool Studio and the Tools JSON box](/img/red-teaming/model-system-prompt-tools.png)

Paste a JSON array of tool definitions (OpenAI function format is supported) into **Tools JSON**, or click **Open Tool Studio**.

### Tool Studio

Tool Studio is a side-by-side editor for tool definitions:

1. Paste or write definitions in **Tools JSON**. Use **Format** to tidy them, or **Example** to load a sample.
2. Check the footer, for example "Valid JSON · 2 tools".
3. Review **Discovered tools** on the right. Each tool card shows its description and parameters (type, required) and is classed **READ** or **WRITE**.
4. Click **Apply N tools**.

![Tool Studio with the Example loaded: get_account_balance classed READ and transfer_funds classed WRITE, and Valid JSON 2 tools](/img/red-teaming/model-tool-studio.png)

The built-in example declares `get_account_balance` (READ) and `transfer_funds` (WRITE). WRITE tools are the ones to watch: the red agent will try to induce unsafe calls to them.

## Compare models

Choose **Compare models** to run one campaign across two to eight models. Each model card has its own source and credentials; coverage, evaluation policy, and authorization apply to every model. By default the form shows two cards (OpenAI and Anthropic).

![Compare models mode showing 2 of 8 models: Model 1 OpenAI gpt-5.4-mini and Model 2 Anthropic claude-sonnet-5](/img/red-teaming/model-compare-models.png)

Steps 02 and 03 are the same as in [Agentic Red Teaming](./agentic-red-teaming#02-define-the-attack-coverage). The plan rail reads, for example, "2 models · Standard · 8 selected objectives".

### The campaign view

Open the campaign from **Runs**. The header shows progress, such as "Multi-model assessment · 2 of 2 targets finished".

![Multi-model campaign: gpt-oss-120b-ultrafast with 2 vulnerable and gpt-oss-120b with 4 vulnerable, both QuilrAI provided and 14/14 objectives, plus Result analytics charts](/img/red-teaming/model-compare-campaign-results.png)

| Section | What it shows |
|---------|---------------|
| **Targets table** | Target, provider, status, objectives (for example 14 / 14), result (for example "Valid result · 2 vulnerable"), and **Watch** / **Report** actions. |
| **Result analytics** | Comparable risk score, assessment completion per target, and objective outcomes stacked by Vulnerable / Partial / Safe / Inconclusive / Error. |
| **Target comparison** | Score validity and completion per target, plus the objective-by-target outcome matrix. |
| **Ask about these results** | Questions answered only from this campaign's results, cited by target and objective. |

![Target comparison with both targets VALID at 100% completion, and the objective-by-target outcome matrix with Safe, Partial, Vulnerable, and Not reported cells](/img/red-teaming/model-compare-target-matrix.png)

How to read the matrix:

- Rows are objectives, aligned by objective fingerprint, then attack id.
- Each cell is **outcome · severity · judge confidence**, for example "Partial · Medium · 75% confidence".
- **Not reported** means that objective did not run against that model. Tool-targeted objectives are synthesized per target, so each model can get different ones. The page warns "Targets were evaluated with different coverage" when this happens.
- **Comparable risk score** stays N/A until every target result is comparable.

**Example.** Comparing two QuilrAI-provided models on a quick scan: `gpt-oss-120b-ultrafast` had 2 vulnerable (grade C, risk 33/100: 2 breached, 5 partial, 7 held, 14 tested), while `gpt-oss-120b` had 4 vulnerable (grade F). Click **Report** on either row to open its full report.

## Next steps

- [Reading a report](../get-started/reading-a-report#agentic-and-model-red-teaming-reports) - including a worked example: `gpt-5.4-mini` on the full library, grade A.
- [Attack Library](../operate/attack-library) - all 64 objectives.
- [Findings and Schedules](../operate/runs-findings-and-schedules).
