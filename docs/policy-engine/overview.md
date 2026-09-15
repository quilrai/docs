---
sidebar_position: 1
sidebar_custom_props:
  icon: ListChecks
---

# Policy Engine Overview

One versioned policy document per enforcement target, authored as sentences.

## What it is

Every tenant has exactly one policy document per enforcement target. The
Policy Engine currently governs two targets, each with its own document,
its own revision history and its own on/off switch:

| Target | Stages | Governs |
|---|---|---|
| LLM Gateway | `request`, `response` | Model traffic: data, tools, models, identity, spend, quality |
| MCP Gateway | `session`, `discovery`, `request`, `response` | MCP servers, tools, resources and prompts |

A target is governed **either** by its classic per-application settings **or**
by the Policy Engine, never by both. Turning the engine on converts your
current settings into revision 1 and freezes the settings screens. See
[Switching from settings](./switching-from-settings).

## Every policy is a sentence

Policies are authored as sentences, not code. The sentence you see in the
console **is** the policy, not a description of it, and every underlined word
is a control you click to change.

```
policy  block_request_secrets      priority 900      runs on request

When  data found            is any of  Auth & Secrets
Then  Sensitive data action →          block
      Risk level            →          critical
```

Each policy has five parts:

| Part | What it does |
|---|---|
| Name | A stable identifier. Observed activity is keyed by name, so renaming a live policy starts a fresh history for it. |
| Priority | An integer from 0 upward. Settles competing single-value settings when several rules match the same call. Higher wins; new policies start at 500. |
| Stage | Which decision point the rule runs at. Every target publishes its own stage list. |
| Conditions | Facts about the call: who, which application, which model, which tool, your own metadata. No conditions means the rule applies to every call on that stage. |
| Effects | The settings that take effect. This is the enforcement. |

A `data found` condition is a separate clause that names detections by exact
name from your [Detection Models](../llm-gateway/features/security-guardrails)
catalog. A rule can carry an occurrence threshold so it fires on bulk exposure
rather than a single incidental match.

## Conditions and operators

Every field, operator and value is picked from a searchable list backed by your
real catalogs, so a value that would not validate is never offered. Operators
adapt to the field you pick:

`is`, `is not`, `is any of`, `is none of`, `is set`, `is not set`, `contains`,
`starts with`, `ends with`, `matches pattern`, `is inside CIDR`,
`includes (ignoring case)`, `has entry`, `has count`.

Rows join with `and` or `or`, and an any-of group nests a bracketed set of
alternatives inside the sentence.

## How overlapping policies resolve

Rules are not first-match. Every rule whose conditions hold contributes, and
the engine resolves what they jointly ask for.

- **Restriction wins.** A deny is not undone by a permissive rule elsewhere in
  the document.
- **Priority settles single values.** Higher wins. This is how a person
  specific rule sits above a Smart Group rule, which sits above an everyone
  default.
- **Risk only climbs.** A call's risk level rises to the highest any matching
  rule assigns; it is never lowered.
- **Simulation is the proof.** A policy validating, or appearing to be in
  scope, is not evidence of the outcome. See
  [Authoring and publishing](./authoring-and-publishing).

:::note
Sensitive-data actions are an important exception to the priority rule.
`redact` and `partial-redact` apply only to the findings the rule's own
`data found` condition selected, so rules covering different data types never
compete. See the per-target pages for detail.
:::

## Source view

Every sentence has an exact text form in QuilrQL, the policy language, and the
`</>` toggle switches between the two freely in both directions.

```
policy block_request_secrets priority 900 {
  request
  data_type ("Auth & Secrets")
  then {
    dlp.action = block;
    risk.level = critical;
  }
}
```

You need the source view only for review, diffing or bulk work. Policies too
complex for the sentence editor stay byte-preserved under **Advanced policies**
and remain editable as source.

## Where to go next

- [LLM Gateway policies](./llm-gateway) - stages, control surfaces and worked examples
- [MCP Gateway policies](./mcp-gateway) - stages, control surfaces and worked examples
- [Switching from settings](./switching-from-settings) - conversion review and activation
- [Authoring and publishing](./authoring-and-publishing) - draft, simulate, replay, publish, roll back
