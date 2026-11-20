---
sidebar_position: 2
sidebar_label: "Set up a replay"
sidebar_custom_props:
  icon: ListChecks
description: "Set up a replay run: choose the requests from a Logs filter, the models to send them to or what-if routing rules or token saving methods, how requests are picked, an optional judge with your own instructions, and the spend cap."
console_path: /settings/llm-gateway/model-ops/replays/new
aliases: [new replay, start a replay, replay judge, judge prompt, judge instructions, replay spend cap, replay sample, balanced sample, what-if rule, token saving test]
---

# Set up a replay

Updated on 20 November 2026.

A replay takes a few minutes to set up. The page shows the cost and time before you start, and nothing is sent until you select **Start run**. For what replays are, see [Replays](./replays).

## Start a replay

1. Open **Settings > AI Gateway > LLM Gateway > Model Ops** and select **New replay**, or a start card such as **Compare models**.
2. Choose the kind at the top right: **One request**, **Compare models**, **What-if routing** or **Token saving**. Changing the kind resets the form.
3. Fill in the sections below. Each kind shows only the sections it needs.
4. Check the **Estimate** card and the spend cap, then select **Start run**.

The run page opens and shows progress. A one-request replay opens the request side by side instead.

![New replay page for Compare models with the Name, Source and Send to sections and the Estimate card with the spend cap](/img/llm-gateway/ui/model-ops/setup-compare.jpg)

**Name** is optional. Left blank, the run is named after what it does, for example `Compare: claude-haiku-4-5-20251001 and gpt-5-mini`.

## Choose the requests {#source}

The **Source** section shows which logged requests the run draws from:

- **Filter** is the application, time window and Logs filters. Change the window with the period button, or select **Change in Logs** to refine the filter in Logs and come back with **Replay these**.
- **Matching** counts the requests that can be replayed and their spend, and says why the rest cannot. See [Limits](./replays#limits).

For **One request**, paste the request id instead, or select **Replay…** in the request's Logs drawer. The section says whether the request can be replayed.

## Choose the models {#send-to}

For **Compare models** and **One request**, **Send to** lists up to 4 models:

- **Same model, now** sends each request back to the model that answered it. Keep it on: it is the control the other models are read against.
- **Add a model** adds any enabled model from your providers. Each shows its list price.

A model may carry a warning:

| Warning | Meaning |
|---------|---------|
| **N requests over its context window** | Those requests are too large for the model and are skipped. |
| **Same family as the judge** | Judges tend to favour their own family. Pick a judge from another family if you can. |
| **No list price, so its cost is not estimated** | The run still works, but the estimate leaves it out. |

## Write what-if rules {#rules}

For **What-if routing**, write up to 3 rules in **Rules**. They are checked in order and the first match wins, like routing rules:

1. Set the input size, for example **under 2,000** input tokens.
2. Optionally select **Condition** to add more: **Tools offered**, **Tool set**, **Application**, **Current model**, **Provider**, **Person**, **Smart group**, **Client app**, **Policy findings**, **Streaming** or **Attachments**.
3. Pick the model in **Send to**.

Under each rule, the page shows what it matches in your logs and what it would cost on the new model, for free and before anything is sent. For example: `Matches 1,109 requests (61%) and $4.91 of spend (8%) · 47 of them offer tools · at list price on gpt-5-mini about $0.54, so at most $4.37 saved, 7% of all spend`. Requests no rule matches keep the model that answered them.

![Rules section of a what-if replay: under 2,000 input tokens sent to gpt-5-mini, with what the rule matches and would save, and Otherwise: keep the model that answered it](/img/llm-gateway/ui/model-ops/setup-what-if.jpg)

**Also replay each slice on its current model, as the control** is on by default.

## Choose token saving methods {#methods}

For **Token saving**, every request is replayed twice on the model that answered it:

- **A** with token saving off: the model gets the request exactly as the client sent it.
- **B** with the methods you pick on. **Lossless and noise only**, **Also format changes** and **Everything** select groups of methods.

Next to each method, the page shows how many tokens it would remove from the picked requests, worked out for free before any model is called.

## Pick which requests to replay {#picking}

**Which requests to replay** decides the sample. Pick a way:

| Way | Picks |
|-----|-------|
| **Balanced** (default) | Equal numbers from each input-size band, so small and large requests are both tested. |
| **Random** | A plain random share. Rare kinds of request can be missed. |
| **Where the money is** | In proportion to spend, so most replays go where the cost is. |
| **Largest** / **Smallest** | Only the largest or smallest requests by input tokens, from the top or bottom 5% to 50%. |
| **Tool coverage** | Only requests that offer tools, spread across tool sets. |
| **Custom** | Order by input tokens, cost, latency or time; take the top, bottom or whole range; spread evenly over size band, tool set, application, model or person. |

Pick how many: 60, 120 (default), 200 or 500 requests, or 60, 150 or 300 per rule for a what-if. These options are on by default:

- **At least one from every tool set**
- **Skip exact duplicates**: repeats are replayed once and counted for all of them.
- **At most 10 from one person**

The bars compare the sample with all matching requests and their spend, by input size. Whichever way you pick, results are re-weighted to the real mix afterwards.

![Which requests to replay section with Balanced selected, 120 requests and bars comparing requests, spend and this sample by input size](/img/llm-gateway/ui/model-ops/setup-picking.jpg)

## Change the request settings {#request}

**Request** shows that requests are **Sent exactly as recorded**. You can change:

- **Temperature**, from 0 to 2.
- **Max output tokens**.
- **Token saving**: **As configured for the application** (default), **Off**, **On, all methods** or **On, lossless and noise-only methods**.

Left blank, each keeps the recorded value.

## Set up the judge {#judge}

The judge is optional and on by default. It reads the request and two answers, labelled A and B in random order with no model names, and returns **Better**, **Equivalent** or **Worse** with its reasons.

1. Pick a **Judge model**. Only models that support structured output can judge.
2. Choose how many replays to judge: **every replay**, **half of them** or **a quarter**. Judging a share lowers the cost.
3. Optionally turn on **Strict: judge twice with the order swapped**. When the two readings disagree, the answer counts as unsure. It doubles the judge's calls.
4. Under **Also score 1 to 5**, pick what to score: **Accurate to the prompt** and **Complete** (on by default), **Follows the requested format** and **Tone**.
5. Tell the judge what matters. Choose one:
   - **Default instructions**, and add your own words in **What matters here** (at most 1,000 characters). For example: "Answers must stick to facts given in the prompt. A wrong figure or a skipped required step is a failure."
   - **Write your own** to replace the instructions entirely (at most 8,000 characters). The box starts from the default; **Reset to default** brings it back.

Whatever you write, two things always apply: the judge sees the answers as A and B with no model names, and it replies in a fixed format so the results can be counted. The run page shows the instructions the judge used.

The judge is not called where a free check already decides. An identical answer or tool call is **Equivalent**. A refusal the original did not make, or a call to a different tool, is **Worse**.

![Judge section with a judge model, every replay, Strict, the 1 to 5 scores and the Default instructions and Write your own choice](/img/llm-gateway/ui/model-ops/setup-judge.jpg)

## Check the cost and set the cap {#estimate}

The **Estimate** card lists the calls to each model and the judge, the total, and how long the run takes at 4 calls at a time. It is priced from the recorded token counts at list price, with no prompt-cache discount, and counts every call. Prompt caching, shorter answers and skipped requests usually make the run spend less: in one compare run of 60 requests, the estimate was $7.29 and the run spent $3.60.

**Stop when spend reaches ($)** is the run's spend cap. It starts at the estimate plus 25%, at least $1, up to $200. When replays and judge calls reach it, the run stops and reports what it finished.

:::tip Lower the cost
The judge often costs more than the replays, because it reads every request in full. A cheaper judge, or judging half or a quarter of the replays, lowers it.
:::
