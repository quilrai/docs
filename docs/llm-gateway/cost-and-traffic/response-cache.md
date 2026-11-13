---
sidebar_position: 3.5
sidebar_label: "Response cache"
sidebar_custom_props:
  badge: new
  icon: Database
aliases: [response cache, semantic cache, cache match mode, normalized cache, x-quilr-cache]
description: "Answer repeat requests from a stored response instead of calling the model, matching exact repeats, normalized repeats or reworded questions."
console_path: []
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Response cache

Updated on 13 November 2026.

**Answer a repeat request from the response the gateway already delivered, without calling the model again.** A cache hit costs nothing and skips the model's response time. You choose how closely a new request must match a stored one: an exact repeat, a repeat that differs only in case, punctuation or filler words, or a question asked in different words.

The response cache is off by default and is separate from a provider's prompt cache. To keep the provider's prompt cache alive instead, see [Keep prompt cache warm](./routing-and-fallbacks#keep-prompt-cache-warm).

## What it caches {#what-it-caches}

| Request | Cached |
|---|---|
| OpenAI Chat Completions, non-streaming | Yes |
| Anthropic Messages, non-streaming | Yes |
| Embeddings | Yes, exact match only |
| Streaming requests and other APIs | No, always sent to the model |

A stored response is reused only for the same app, model, provider, settings and policy. With the **user** scope, each person also gets their own entries. Entries expire after the app's cache lifetime (24 hours by default).

Responses that were blocked, or where a guardrail could not finish its check, are never stored.

## Match modes {#match-modes}

| Mode | A new request matches when | Works on |
|---|---|---|
| **Exact** (default) | It is the same request. Only trailing spaces and line endings may differ. | Chat, Messages, embeddings |
| **Normalized** | It is the same after ignoring case, punctuation around words, extra spaces and filler words such as *a*, *the*, *please*, *hi* and *thanks*. | Chat, Messages |
| **Semantic** | Its latest user message asks the same thing in different words. Everything else must match exactly. | Chat, Messages |

Normalized keeps every word that can change the meaning. *and* / *or*, *was* / *were* and *can* / *should* are all kept, so "can I reset my password" and "should I reset my password" never share an answer.

Each mode builds on the one before it: Semantic first tries a normalized match, and Normalized covers every exact repeat.

## Lookup order {#lookup-order}

<DecisionLadder
  label="How a request is answered when the response cache is on"
  steps={[
    { id: 'stored', question: 'Is the same request already stored?', hint: 'Exact, or Normalized when that mode is on', yes: { label: 'Cache hit', detail: 'Stored response returned. No guardrails, no model call', tone: 'success' } },
    { id: 'guardrails', question: 'Do request guardrails block the new prompt?', hint: 'Data risks, Guardian Agent and other request checks run as usual', yes: { label: 'Blocked', detail: 'Same result as without the cache', tone: 'danger' } },
    { id: 'semantic', question: 'Semantic mode: was a close enough question already answered?', hint: 'Same conversation so far, prompt unchanged by guardrails, safety checks pass', yes: { label: 'Semantic hit', detail: 'Stored response returned. Model call and response checks skipped', tone: 'info' } },
  ]}
  fallback={{ label: 'Sent to the model', detail: 'The response is stored for next time', tone: 'neutral' }}
/>

In Exact and Normalized mode only step 1 applies: a miss goes straight through the normal pipeline to the model.

## How semantic matching stays safe {#semantic-safety}

- **Only the latest user message can differ.** The system prompt, earlier conversation, tools, model, settings and policy must all match exactly.
- **Request guardrails run first.** A semantic hit is served only after the new prompt passes your request checks. A prompt that guardrails blocked, redacted or flagged is never matched semantically.
- **Details must be identical.** Numbers, URLs, email addresses and code must be the same in both questions.
- **Negations must match.** Words such as *not*, *never*, *no* and *can't* must appear in both, so "can I share this file" never returns the answer to "can I not share this file".
- **Similar length.** Very short and very long versions of a question do not match.
- **Fails open.** If the similarity check is unavailable or slow, the request goes to the model.

### Similarity {#similarity}

Similarity sets how close a reworded question must be. It applies only in Semantic mode.

| Similarity | Matches |
|---|---|
| **Narrow** (default) | Near-identical wording. Safest. |
| **Balanced** | Light rewording. |
| **Wider** | Looser rewording. More hits and more risk of a wrong answer. |

## Results from production traffic {#results}

From a sample of about 41,000 production requests across 66 applications over one week:

| Mode | Share of requests answered from the cache |
|---|---|
| **Exact** | 38% |
| **Normalized** | +0.5% more. Every sampled match was correct. |
| **Semantic, Narrow** | +1.8% more |
| **Semantic, Balanced** | +3.8% more |
| **Semantic, Wider** | +6.8% more |

:::warning Semantic mode can return another entity's answer
In that sample, most semantic matches on automated or templated prompts were wrong. Prompts that differed only in a business name, job title, username or file name scored as near-identical, so the cache would have returned the answer generated for someone or something else. The safety checks catch numbers, links, emails, code and negations, not names.
:::

## Which mode to choose {#choose-a-mode}

| Your traffic | Use |
|---|---|
| Automated pipelines, agents and templated prompts | **Exact** or **Normalized** |
| People typing questions, such as FAQ or helpdesk apps | **Semantic**, starting with **Narrow** |

After you turn on Semantic, review the cache hits in the request logs for a few days before widening similarity.

## Configure the response cache {#configure}

Choose the mode used by your gateway. When the Policy Engine is on, published rules decide whether the cache is on and which match mode and similarity apply; without a matching rule the cache is off.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

Set the app's `response_cache` setting through the [Management API](../api-reference/providers-and-configuration-api) (`transformations.response_cache` on the app):

```json
{
  "transformations": {
    "response_cache": {
      "enabled": true,
      "match": "normalized",
      "similarity": "narrow",
      "scope": "app",
      "ttl_seconds": 86400
    }
  }
}
```

| Field | Values |
|---|---|
| `enabled` | `true` or `false` (default) |
| `match` | `exact` (default), `normalized` or `semantic` |
| `similarity` | `narrow` (default), `balanced` or `wider`. Used only with `semantic`. |
| `scope` | `app` (default) or `user`. With `user`, requests without a user identity are not cached. |
| `ttl_seconds` | 60 to 604800. Default 86400 (24 hours). |
| `max_size_mb` | 1 to 1024. Default 32. The oldest entries are removed first. |
| `flush` | `true` discards every stored response for the app. |

</TabItem>
<TabItem value="policy" label="Policy Engine">

1. Open **Govern > Policy Engine > LLM Gateway > Controls > Token Savings**.
2. Add a **Response cache** rule, choose **Applies to**, and turn it on.
3. Choose the match mode (**Exact**, **Normalized** or **Semantic**) and, for Semantic, the similarity (**Narrow**, **Balanced** or **Wider**).
4. **Save to draft**, use **Test**, then **Review & publish**.

The same rule in policy text:

```text
policy helpdesk_cache priority 600 {
  request where application.group_key == "helpdesk"
  then { response_cache.enabled = true; response_cache.match = semantic; response_cache.similarity = narrow; }
}
```

`response_cache.match` takes `exact`, `normalized` or `semantic`; `response_cache.similarity` takes `narrow`, `balanced` or `wider`. Without a matching rule they are `exact` and `narrow`. Rule conditions for these effects cannot use data types, Guardian Agent or hallucination results, or the detected language, because a cache hit skips those checks.

To set the cache from your own tooling, use `/controls/response-cache` in the [Access and gateway features API](../api-reference/gateway-features-api) with the settings `enabled`, `match` and `similarity`.

</TabItem>
</Tabs>

## Check that it works {#check}

Every non-streaming request to an app with the cache on returns an `X-Quilr-Cache` header:

| Header | Meaning |
|---|---|
| `X-Quilr-Cache: HIT` | Served from the cache, including semantic hits. `Age` gives the entry's age in seconds. |
| `X-Quilr-Cache: MISS` | Sent to the model. The response may be stored for next time. |
| `X-Quilr-Cache: BYPASS` | Not looked up, for example a request with `Cache-Control: no-store` or `no-cache`. |

A hit is logged with zero tokens and zero cost, and records the tokens and cost it saved. Hit rate and savings per app are in the [Monitoring API](../api-reference/monitoring-api) feature summary.

## Related {#related}

- [Token saving](./token-saving)
- [Keep prompt cache warm](./routing-and-fallbacks#keep-prompt-cache-warm)
- [Access and gateway features API](../api-reference/gateway-features-api)
- [Costs and savings](../../console/observe/costs-and-savings)
