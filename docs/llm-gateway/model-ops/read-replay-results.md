---
sidebar_position: 3
sidebar_label: "Read replay results"
sidebar_custom_props:
  icon: BarChart2
description: "Follow a replay run while it runs, read its results for compare, what-if and token saving runs, filter its requests, and compare one request's answers side by side with the judge's verdict."
aliases: [replay results, replay run, judge verdict, same or better, noise floor, side by side, replay request, adjusted settings, stop replay, delete replay]
---

# Read replay results

Updated on 20 November 2026.

Open a run from **Model Ops > Replays** to follow it and read its results. The page updates every few seconds while the run is active. For how to start one, see [Set up a replay](./set-up-a-replay).

## Follow a run {#progress}

**Progress** shows how many requests have finished, how long is left, each model's answers, the judge, and the spend against the cap. **Results so far** shows each model's share of answers that are the same or better than the original; once the run ends, the card is called **Scores**. **Just finished** lists the latest requests.

![Run page while running, with the Progress card per model, the judge and spend, Results so far, and Just finished](/img/llm-gateway/ui/model-ops/run-progress.jpg)

You can leave the page; the run continues in the background. Requests are replayed in a shuffled order, so early results are a fair sample. A share appears once 30 requests are scored for that model; before that, the page says it is too early to read.

| Status | Meaning |
|--------|---------|
| **Queued** | Saved and waiting to start. |
| **Running** | Requests are being replayed. |
| **Waiting for a worker** | No progress for 2 minutes. The run continues from where it stopped once a worker picks it up. |
| **Stopping** | A stop was requested. Calls already in flight are finishing. |
| **Done** | Every request finished. |
| **Stopped** | Stopped before every request finished. |
| **Stopped at cap** | The run reached its spend cap before every request finished. |
| **Could not start** | The run was saved but has not started. **Retry** starts it. |
| **Failed** | The run ended with an error. The banner says why. |

**Stop run** stops an active run; calls already in flight finish and are kept. A stopped or capped run keeps its results, marked **Partial**. **Delete** removes a finished run and its results; the replayed calls stay in Logs as ordinary requests.

**How this run was set up** lists the source, picking, models, rules, judge and cap. **Judge instructions** shows the text the judge used.

## Compare results {#compare}

The headline sentence sums up the run, for example: "Across real traffic, claude-haiku-4-5-20251001 holds up on about 71% of requests with spend down 57%, against 89% for the same model replayed now."

- The chart plots each model's **Same or better** share against its **Projected spend**. Up and to the left is better. The same model replayed now marks how much answers vary on their own.
- The table compares each model with the requests **As logged**: **Same or better, in traffic**, **Worse**, **Spend, projected**, **Mean latency**, **Answer findings**, **Refusals** and **Tool call match**.
- **Where each model holds up** splits the share by input size and whether tools were offered. A slice with fewer than 30 scored requests is marked low sample.
- The reasons card groups why answers were worse, and compares the 1 to 5 scores of the original and the replay.

![Compare results with the headline, the chart of same or better against projected spend, and the table per model](/img/llm-gateway/ui/model-ops/results-compare.jpg)

Shares are re-weighted from the sample to the real mix of requests. Projected spend is your real token totals at each model's list price, with no prompt-cache discount, while logged spend includes cache discounts.

Mid-loop steps (a tool call in the middle of an agent loop, replayed with the recorded tool results) are listed separately and left out of the headline.

## What-if results {#what-if}

Each rule gets a card comparing **Today** with **With this rule**: the requests and spend that would move, their mean latency, **Answers as good as today**, answers with policy findings, and tool calls matching the original. The control column shows how often the same model, replayed now, is as good as today.

The slice table breaks each rule down by input size and tools. Each slice row is a narrower rule you could publish instead.

## Token saving results {#token-saving}

The headline says how many fewer input tokens the requests send with token saving on, and how often the answers held up against a noise floor. The noise floor comes for free: each request's original answer is compared with the fresh replay that used the same setting it first ran with.

**Method by method** shows what each method removed, how many requests it touched, and how many of those got worse. A request several methods touched counts against each.

## Requests {#requests}

**Requests** lists every request in the run with each model's outcome. Filter by **Verdict**, **On** (model), **Result**, **Kind** or **Slice**, and select a request to see it side by side.

| Outcome | Meaning |
|---------|---------|
| **Better**, **Equivalent**, **Worse** | The judge's verdict against the original. |
| **Match** | The same tool call as the original. |
| **Unsure** | The two strict readings disagreed. |
| **Answered** | Answered, with no judge or not judged yet. |
| **Not judged** | Outside the share you asked the judge to read. |
| **Blocked by policy** | The source application's content policies blocked the request or the answer. |
| **Failed** | The call failed. Hover for the error. |
| **Skipped** | Not sent. Hover for the reason, for example **Over the model's context window**. |

## Compare one request side by side {#side-by-side}

The request page shows the recorded request, then one column per answer: the original, as logged, and each model.

![One request side by side with the original answer and two replays, their latency, tokens and cost, checks and the judge's verdict](/img/llm-gateway/ui/model-ops/request-side-by-side.jpg)

Each column shows:

- **Latency**, **First token**, **Tokens** and **Cost**, with the change from the original.
- **Checks**, worked out without a model: **Finish** reason, **Tool call** (for example, **Same tool, different arguments**), **Length** and **Word overlap** against the original, **JSON**, **Refusal**, and **Token saving**.
- **Adjusted**: settings the model does not support, which were changed or left out so it could answer, with the reason. For example, `thinking (the model does not support adaptive thinking; a fixed thinking budget was used)`.
- **Policy on the answer**: what the content policies found.
- The judge's verdict, its reasons and the 1 to 5 scores, or **Decided by a free check; the judge was not called.** The judge saw the answers as A and B, so its reasons use those letters; the line under them says which answer was A and which was B.

**Highlight differences from the original** marks removed text in red and added text in green. **Open in Logs** opens each call in Logs. **Run on more requests like this** starts a compare run on requests from the same model.

Reading the request and answers needs recorded-text access, and each open is recorded in the audit log. New replays can take a minute to reach Logs; the page fills in the answers when they arrive.
