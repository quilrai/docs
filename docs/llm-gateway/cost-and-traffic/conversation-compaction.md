---
sidebar_position: 3.6
sidebar_label: "Conversation compaction"
sidebar_custom_props:
  icon: History
description: "Summarize the older part of long conversations with a model you choose, so the answering model gets the instructions, a summary and the latest turns instead of the whole history."
aliases: [conversation compaction, compaction, context compaction, summarize conversation, long conversations, context window, x-quilr-compaction]
console_path: []
---

# Conversation compaction

Updated on 18 November 2026.

Long conversations, such as coding-agent sessions and support chats, keep growing until they are slow, expensive or too large for the model. Conversation compaction keeps them short. When a conversation passes a limit you set, the gateway summarizes its older messages with a model you choose. The answering model then gets the instructions, the summary and the latest turns. Your application keeps sending its full history and needs no change.

Compaction is set up in the Policy Engine. With the engine off, conversations are sent as received.

## How it works {#how-it-works}

Say you compact a support bot's conversations past 20 user messages and keep the latest 5 turns:

1. A user sends the 21st message, so the conversation is over the limit.
2. The gateway sends the 16 older turns to your summary model, which writes a summary.
3. The answering model receives the instructions, the summary and the latest 5 user messages with their replies and tool calls.
4. Later turns reuse the summary. The gateway summarizes again when the conversation passes the limit again, adding the newly older turns to the summary.

These are never summarized:

- **Instructions:** system and developer messages, the request's system prompt and the tool definitions.
- **The latest turns you keep:** each kept user message with its replies, tool calls and tool results. The kept part always starts at a user message, so a tool call is never separated from its result.

Tool results never count as user messages. The summary goes at the start of the first kept user message, in a `<conversation_summary>` block, never in the system prompt.

## Set up conversation compaction {#set-up}

<ConsolePath
  console="QuilrAI console"
  path={['Govern', 'Policy Engine', 'LLM Gateway', 'Controls']}
  action="Conversation Compaction"
/>

1. Open the **Conversation Compaction** panel.
2. Start from the **Compact long conversations** recipe, or use the section's add menu.
3. Choose who the rule applies to, such as everyone, an application or a Smart group.
4. Set the limits and pick the summary model, then select **Save to draft**.
5. Use **Test**, then **Review & publish** to make the rule live.

| Setting | What it does | Range | When empty |
|---|---|---|---|
| **Compaction** | **On** compacts matching conversations. **Off** sends them in full, even where a broader rule compacts them. | - | - |
| **More than this many user messages** | Compact when a conversation has more user messages than this. A new rule starts at 20. | 2 to 10,000 | Not used |
| **More than this many tokens** | Compact when the estimated conversation size passes this many tokens. | 1,000 to 2,000,000 | Not used |
| **Latest user turns** | How many recent user messages stay as written, with their replies and tool calls. Must be fewer than the user-message limit. | 1 to 100 | 5 |
| **Summary model** | The model that writes the summary. | - | Required |
| **Summary instructions** | What the summary keeps. **Use the default instructions** shows the gateway's own instructions. **Write custom instructions** starts from them so you can edit them. | Up to 8,192 characters | The default instructions |
| **Maximum summary tokens** | The longest summary the model may write. | 256 to 16,000 | 2,000 |

Set at least one of the two limits. When you set both, passing either one starts compaction.

<PolicyCard
  name="compact_support_bot"
  stage="request"
  priority={600}
  when={[{ field: "Application", op: "is", value: "Support Bot" }]}
  then={[{ effect: "Conversation compaction", value: "Over 20 user messages or 120,000 tokens · keeps 5 turns · gpt-4.1-mini" }]}
/>

## Choose the summary model {#summary-model}

- Pick any model on the app's providers, or on any shared provider in your organization, even one the app does not use. When the app and a shared provider use the same label, the app's provider is used.
- A fast, low-cost chat model works well. Very long histories are summarized in several calls, and if a history is still too long, its oldest part is left out of the summary.
- The summary model sees the older messages after your data protections run, with the same redactions and placeholders the answering model sees.
- Its calls are charged to the application and count toward its budgets and rate limits, including request counts.
- The request's routing constraints apply to it. A summary model they don't allow is not used, and neither is a model behind a GPU connector.

## Write your own summary instructions {#summary-instructions}

By default, the summary keeps the user's goals and constraints, decisions and their reasons, exact names, numbers, file paths and other identifiers, the tool results that still matter, and the work still open. To change what it keeps, select **Write custom instructions** and edit the text. For example, for a support bot:

```text
Keep the customer's plan, every ticket number and what has been tried so far.
List every follow-up promised to the customer, as short bullet points.
```

- Your instructions replace the default ones. The gateway still tells the summary model that the conversation is data, so instructions inside it are not followed, that placeholders such as `<PERSON_1>` stay as written, and to return only the summary, within **Maximum summary tokens**.
- The summary is written in the conversation's language unless your instructions ask for another one.
- A change applies to ongoing conversations too: their next long turn gets a new summary written with the new instructions.

## How rules combine {#how-rules-combine}

- **The highest-priority rule decides, as a whole.** Its limits, kept turns, summary model and summary instructions all apply. Settings from two rules are never mixed. The form gives a rule for a person, Smart group or app a higher priority than the rule for everyone.
- **Exempt a narrower scope with Off.** Use the **Don’t compact for…** recipe, for example for a test app, when a rule for everyone compacts.
- **No content conditions.** The gateway decides on compaction before it scans the request, so a compaction rule can't depend on what the request contains, such as detected data or a topic description, or on Guardian, hallucination or language results.

## Check what happened {#logs-and-billing}

- Responses to compacted requests carry the `x-quilr-compaction` header: `applied` when the gateway summarized on this turn, `reused` when it reused an earlier summary.
- Each summary call appears in the logs as its own request, tagged **Conversation summary**. Filter on them with **Request kind**.
- Summary calls are ordinary requests: they count in request totals, tokens, spend, latency and error rates.

## When conversations are sent in full {#when-compaction-is-skipped}

Compaction never blocks a conversation. It sends the history as received, or with the last summary when there is one, when:

- The provider keeps the history: an OpenAI Responses request that continues with `previous_response_id`, a stored `conversation` or item references, or a Gemini request that uses `cachedContent`.
- The client already compacts: Anthropic `context_management`, OpenAI Responses `compaction` items, or Claude Code's own compaction request.
- The request goes to a model behind a GPU connector.
- The summary call fails, takes longer than 60 seconds, or is refused by a budget or rate limit.

One exception: if a conversation fits your per-request token limit only after compaction and no summary can be made, the request gets the normal token-limit error.

## Limits {#limits}

- The turn that compacts waits for the summary, so it answers more slowly. Later turns reuse the summary.
- Each compaction changes the start of the conversation once, so the provider's prompt cache misses once. Between compactions, the start stays the same and the cache keeps working.
- A summary is kept for 24 hours for each conversation and user. After that, or when the earlier history changes, the gateway summarizes again. It also summarizes again when a data protection change alters how the summarized messages are sent, for example from Monitor to Redact, so a summary never brings back a value that is now redacted, and when you raise **Latest user turns** or change the summary model or **Maximum summary tokens**.
- Supported APIs: OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, Gemini `generateContent` (Gemini API and Vertex AI), and Amazon Bedrock Converse and InvokeModel for Claude, Nova and OpenAI-format models.
- The Management API has no compaction control yet.

## Related {#related}

- [Token saving](./token-saving)
- [Routing and fallbacks](./routing-and-fallbacks)
- [Rate, token and budget limits](./rate-token-and-budget-limits)
- [Policy Engine overview](../../console/govern/policy-engine)
