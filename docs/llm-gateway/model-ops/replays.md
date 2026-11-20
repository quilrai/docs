---
sidebar_position: 1
sidebar_label: "Replays"
sidebar_custom_props:
  icon: FlaskConical
description: "Replay requests the LLM Gateway already logged on other models, under a what-if routing rule, or with token saving off and on, and compare the answers, cost and latency with the originals."
console_path: /settings/llm-gateway/model-ops/replays
aliases: [replays, replay, model ops, compare models, model comparison, model evaluation, llm judge, what-if routing, drift check, token saving test, replay request]
---

# Replays

Updated on 20 November 2026.

Replays answer "what would happen if" with your own traffic. Pick requests the LLM Gateway has already logged, send them again, and compare the new answers with the originals before you change anything for real:

- Would a cheaper model answer as well?
- Does the model we use today still answer the way it did?
- What would this routing rule save, and what would it cost in quality?
- Does token saving change the answers?

A judge model you pick reads each pair of answers and says whether the new one is better, equivalent or worse. Results are re-weighted from the sample to your real mix of requests, so a share you read is a share of your traffic.

## Where to find it

Open **Settings > AI Gateway > LLM Gateway** and select the **Model Ops** tab. **Replays** lists every run, newest first, with its progress while it runs.

![Replays page with the four start cards Compare models, What-if routing, Token saving off and on and One request, the limits line, and the list of runs](/img/llm-gateway/ui/model-ops/replays-list.jpg)

You can also start from **Logs**:

- **Replay these** in the Logs header replays the requests that match your current filter.
- **Replay…** in a request's detail drawer replays that one request.

## Kinds of replay {#kinds}

Every replay is a run, including a single request. Pick the kind when you start it:

| Kind | Use it to | What is sent |
|------|-----------|--------------|
| **Compare models** | Try up to 4 models on the same requests. | Each request goes to every model you pick, and back to the model that answered it (**Same model, now**). |
| **What-if routing** | See what a routing rule would change before you publish it. | Requests a rule matches go to that rule's model, and back to the model that answered them. |
| **Token saving** | See what each token saving method removes and whether the answers hold. | Each request goes to the model that answered it twice: once with token saving off, once with the methods you pick on. |
| **One request** | Look at one request on other models, side by side. | The request goes to every model you pick. |

**Same model, now** is the control. Answers vary from one call to the next even on the same model, so the control shows how much of a difference is just that. When the control itself scores low, the model may have changed since the request was first logged.

To set one up, see [Set up a replay](./set-up-a-replay). To read the results, see [Read replay results](./read-replay-results).

## How a replay runs {#how-it-runs}

- **Requests are sent exactly as recorded.** Only the model changes, or token saving in a token saving test. You can override the temperature and the maximum output tokens; nothing else in the request can be edited.
- **The source application's content policies apply.** Redaction happens before the request leaves, and each answer is checked on the way back. Access, quota, budget, rate-limit and routing rules are skipped, and there is no failover or response cache.
- **Any enabled model on your providers can be a target or the judge.** It does not have to be attached to an application.
- **Your providers bill the calls.** Replays never draw on an application's quota or budget. Each run has its own spend cap and stops when it reaches it.
- **Runs keep going in the background.** You can leave the page; the list and the run page show progress while it runs. Requests are replayed in a shuffled order, so the results so far are a fair sample at any point.
- **When a target model rejects a setting it does not support**, the request is sent again without it, and the answer shows what was adjusted and why. For example, a model without adaptive thinking gets a fixed thinking budget.

## Limits {#limits}

The **Replays** page states the limits for your organization. Today they are:

| Limit | Value |
|-------|-------|
| Requests per run | 500 |
| Models per run | 4, plus the same model now |
| What-if rules per run | 3 |
| Runs active at once | 2 |
| Spend cap per run | $200 at most; it starts at the estimate plus 25%, at least $1 |
| Calls at a time, per run | 4 |

Some requests cannot be replayed, and the set-up page counts them before you start:

| Reason | What it means |
|--------|---------------|
| Failed or were blocked | The original request did not get an answer. |
| Have no recorded content | Content was not stored for the request. |
| Are not chat requests | For example, embeddings, images or audio. |
| Depend on state held by the provider | The request continues a conversation the provider stores, such as a Responses API `previous_response_id`. |
| Use tools hosted by the provider | For example, the provider's own web search. |
| Are the gateway's own calls | Replays, cache warming and compaction summaries. |

## Replays in Logs and analytics {#in-logs}

Replay and judge calls are real gateway requests. They belong to the source application, with the admin who started the run as the user, so they appear in Logs and are counted in analytics and spend.

- In **Logs**, they carry a **Replay** or **Replay judge** tag under the status. Filter on them with **Replay calls** under the more filters.
- A replay's detail drawer links back to its run and to the request it replayed. An original that was replayed lists the runs that replayed it.
- Deleting a run deletes its results. The replayed calls stay in Logs as ordinary requests.

## Who can use it {#permissions}

| To | You need |
|----|----------|
| See **Model Ops** and open runs | **Read LLM analytics**. You see runs over the applications you can view. |
| Start, stop and delete runs | **Run LLM replays**. Admins have it by default. |
| Read prompts and answers side by side | Recorded-text access, the same access that shows content in Logs. Each open is recorded in the audit log. |

Starting, stopping and deleting a run is recorded in the audit log with its source, picking, models, judge and spend cap.
