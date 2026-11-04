---
sidebar_position: 4
sidebar_label: "Model"
sidebar_custom_props:
  icon: BrainCircuit
description: "Red team a single model, or compare two to eight models on the same attacks."
aliases: [model, compare models, provider]
---

# Red team a model

Test a single model, or compare the defenses of several models side by side.

## When to use this mode

Sometimes you need to evaluate a model on its own, before you build it into an application. Use this mode to choose a model for a new project, or to baseline a new model version when the provider releases it, before you route applications to it.

You can assess:

- **A single model**, to see how well it resists attacks on its own.
- **Two to eight models** compared against each other, with the same attacks, so you can see which one defends best.

### Model sources

Each model you assess can come from one of three sources:

| Source | Use it when | What you enter |
| --- | --- | --- |
| Your models | The model is already configured in your environment, in the **Models** tab of the Quilr LLM Gateway. | Only the model. Its key stays in the gateway. |
| Enter manually | The model has never been configured behind the Quilr LLM Gateway, but you have API access to it. | The provider, the model ID, and an API key. |
| QuilrAI provided models | Your tenant has credit for QuilrAI provided models. QuilrAI gives prepaid access to models from frontier labs and open-model hosts. | Only the model. It runs through your managed QuilrAI access, with no key. |

## Start a model assessment

On the **New assessment** page, select **Start** on the **Model** card.

![The New assessment page with five mode cards. The Model card is highlighted.](/img/red-teaming/model/1-select-mode.png)

*Figure 1. Select **Model** on the New assessment page.*

The **New model assessment** setup opens. It has five steps: **Target**, **Coverage**, **Custom Attacks**, **Schedule**, and **Review**.

## Step 1: Target

In **Assessment name**, enter a name that identifies the test, such as `Checkout assistant model`. Then choose **Single model** or **Compare models**.

### Assess a single model

Select **Single model**. Under **Models to assess**, configure **Model 1** using the source that fits.

#### Option 1: Your models

Use this option when the model is already configured behind the Quilr LLM Gateway.

1. Under **Model source for model 1**, select **Your models**.
2. In **Your model for model 1**, select the model. Models are grouped by the provider connection they belong to.

![The New model assessment Target step with Single model selected, Your models chosen as the source, and the model list open showing Anthropic models.](/img/red-teaming/model/2-your-models.png)

*Figure 2. Select a model you already connected in the gateway.*

#### Option 2: Enter manually

Use this option for a new model that has never been configured behind the Quilr LLM Gateway.

1. Under **Model source for model 1**, select **Enter manually**.
2. In **Provider for model 1**, select the provider. You can choose hosted providers, open-model hosts, cloud platforms, or your own OpenAI-compatible endpoint.
3. In **Model id for model 1**, pick one of the provider's current models, or type any model ID the provider serves.
4. Check the **Endpoint**, which is filled in for the provider you chose.
5. Enter the provider's API key for the model.

![Model 1 configured with Enter manually: provider DeepSeek, model ID deepseek-v4-pro, the endpoint https://api.deepseek.com/v1, and an empty DeepSeek API key field.](/img/red-teaming/model/3-enter-manually.png)

*Figure 3. Enter the provider, model ID, and API key for a new model.*

#### Option 3: QuilrAI provided models

If your tenant has credit for QuilrAI provided models, this is the quickest option.

1. Under **Model source for model 1**, select **QuilrAI provided models**.
2. In **QuilrAI provided model for model 1**, select the model. No key is needed.

![Model 1 with QuilrAI provided models selected and the model list open.](/img/red-teaming/model/4-quilr-provided.png)

*Figure 4. Select a QuilrAI provided model.*

#### Add context (optional)

Whichever source you use, expand **System prompt & tools** to add the system prompt and the tools you plan to use with the model. This is optional but recommended. The attacks are then curated for your environment, so you see how the model behaves in the role you plan to give it, not only in general.

### Compare models

Select **Compare models** to run the same attacks against several models and compare how each one defends.

- Each model is a separate card, configured on its own. You can mix and match sources: for example, Model 1 can be a QuilrAI provided model and Model 2 a model you enter manually with your own key.
- A comparison needs at least two models. Select **Add model** to add more, up to eight.
- Coverage, evaluation, and authorization apply to every model, so each one faces the same test and the results are directly comparable.
- The optional **System prompt & tools** section works the same way as for a single model.

![Compare models selected with two model cards: Model 1 using QuilrAI provided models, and Model 2 using Enter manually with Anthropic and claude-sonnet-5. The Add model button is highlighted.](/img/red-teaming/model/5-compare.png)

*Figure 5. Compare two to eight models. Each can use a different source.*

:::tip

To compare fairly, give every model the same system prompt and tools, so the only difference between results is the model itself.

:::

When the Target step is complete, select **Continue**.

## Step 2: Coverage

Choose how much of the attack library to run.

| Option | What runs | Use when |
| --- | --- | --- |
| Full library | All 73 objectives: the full OWASP LLM Top 10 and agentic-threat catalog, plus tool-targeted objectives generated live for the tools you listed. | You want the most complete assessment. |
| Quick scan | About 8 core objectives. | You want a fast first check. |
| Custom selection | Only the objectives you pick from the library. | You want to focus on specific risks. |

The library covers the main ways AI systems are attacked: prompt injection, both typed directly and hidden in content the target reads; jailbreaks that bypass safety training; system prompt leakage; sensitive data disclosure; tool misuse and privilege escalation; data exfiltration; unsafe output that downstream systems might run; harmful content; misinformation; and runaway token or cost consumption. Quilr maintains the library and adds new techniques as they are published.

Expand **Attack library** to see which objectives will run. Then select **Continue**.

![The Coverage step with three options: Full library with 73 objectives, Quick scan with about 8 core objectives, and Custom selection.](/img/red-teaming/gateway/3-coverage.png)

*Figure 6. The Coverage step.*

## Step 3: Custom Attacks

This step is optional. Add your own objectives, such as rules the model must follow in your planned use. Custom objectives run alongside the coverage you chose.

- Select **Add custom objective** to write a new objective now.
- Select **Add from library** to reuse an objective you saved earlier in the attack library.

Write each objective as one clear goal the attack should reach. The clearer the goal, the easier it is to tell whether the attack worked. Save objectives you want to reuse, so other assessments can add them from the library.

Select **Continue** when you are done, or to skip this step.

![The Custom Attacks step with Add custom objective and Add from library buttons.](/img/red-teaming/gateway/4-custom-attacks.png)

*Figure 7. The Custom Attacks step.*

:::note

Managing saved objectives in the attack library is covered in a separate topic *(Coming soon)*.

:::

## Step 4: Schedule

Choose when the assessment runs. A recurring schedule catches regressions caused by model upgrades, prompt edits, new tools, and newly published attack techniques, so a fix that worked last month is checked again.

| Option | Runs |
| --- | --- |
| Run once | Now, with no repeats. |
| Daily | Every day at a set time. |
| Weekly | On the days you pick. |
| Monthly | One day each month. |
| Custom (cron) | On a cron expression, for advanced schedules. For example, `0 2 * * 1` runs at 02:00 every Monday. |
| On policy change *(Coming soon)* | When a gateway policy is edited. |

:::warning

Every scheduled run against a production target uses model tokens and tool quota. Use a dedicated test account so the usage is easy to attribute, and agree on the schedule with the development team.

:::

Select **Continue**.

![The Schedule step with Run once, Daily, Weekly, Monthly, On policy change, and Custom (cron) options.](/img/red-teaming/gateway/5-schedule.png)

*Figure 8. The Schedule step.*

## Step 5: Review and launch

1. Check the summary: **Target**, **Coverage**, **Schedule**, and **Connection**. The connection should show **Configured**.
2. In **Authorized scope**, record what is approved: the target, a ticket or reference number, and the testing boundary.
3. Select **I authorize this assessment**. Transcripts are pattern-redacted and may be processed by the managed evaluation engine, so use only approved targets.
4. Select **Launch assessment**.

![The Review step showing the summary of target, coverage, schedule, and connection, the Authorized scope box, the authorization checkbox, and the Launch assessment button.](/img/red-teaming/gateway/6-review.png)

*Figure 9. The Review step.*

**Result:** The assessment runs against the authorized target only. You can leave the page and come back while it runs.

## Next steps

- Review the results in [Run details](../results-and-reports/run-details.md) and the [Full report](../results-and-reports/full-report.md) when the assessment finishes.
