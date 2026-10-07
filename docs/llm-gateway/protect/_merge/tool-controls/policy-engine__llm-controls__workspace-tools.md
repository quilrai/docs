---
sidebar_position: 13
sidebar_custom_props:
  icon: Wrench
---

# Workspace Tools

:::info V2 console
These tools live in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`, around the twelve control cards.
:::

The workspace header, the request resolver, revision history and the advanced workspace. For the full draft, simulate, replay and publish loop, see [Authoring and publishing](../../console/govern/author-simulate-and-publish).

## Workspace header

![Gateway controls header with the Engine on and Revision 54 badges, the 10 of 12 active chip, the History link, search and Filter](/img/policy-engine/llm-workspace-header.png)

| Element | What it does |
|---|---|
| **ENGINE ON** / **Revision N** | The engine state and the live revision number. |
| **N of 12 active** | How many cards have at least one configuration. |
| **History** | Opens the [revision history](#history). |
| Search | Filter cards by policy, app, user, group or detection name. |
| **Filter** (`F`) | Narrow the cards shown. |

## Shared draft, review and publish

Every card edit joins **one shared draft**. Nothing changes in the gateway until it is published.

<StepFlow steps={[
  { label: "Edit cards", items: ["Add, edit, remove", "One shared draft"] },
  { label: "Pending bar", items: ["N pending changes", "Discard changes"] },
  { label: "Review changes", items: ["Validation", "Replay counters"] },
  { label: "Publish", items: ["One new revision"] },
]} />

- While changes are pending, a bar at the bottom shows the count across surfaces with **Discard changes** and **Review changes**.
- **Review changes** validates the draft and replays it over sampled recorded traffic. The replay reports global counters (blocked, redacted, rerouted, model rejected, rate-limited), never per rule.
- Names the catalog cannot resolve block publishing.
- Publishing creates one immutable revision for all pending changes.

## Describe a request

**What applies to one request** collapses every card to the winning value per control for a request you describe, resolved from the shared draft the way the engine merges it. Filling the form is read-only; nothing is saved.

![What applies to one request panel with Person, Smart groups, Application, Requested model, API surface, Environment, Provider credential and Source IP fields, Add detection and Test with the engine](/img/policy-engine/llm-describe-request-form.png)

| Field | Notes |
|---|---|
| Person | User email. |
| Smart groups | One or more. |
| Application | Pick from your apps. |
| Requested model | The model the client asks for. |
| API surface | Leave empty and the request simulates as `chat`. |
| Environment | Your `environment` metadata value. |
| Provider credential | Pick a credential label. |
| Source IP | Caller IP. |
| Findings | **Add detection** to report data types found in the request, with a count per type. |

Each card then shows the value in force, the configuration that decided it and why. Values that depend on a field you left empty are tagged **conditional**.

![Resolved Gateway Access, Identity & Network Trust and Tool Controls rows with conditional tags and the deciding configuration](/img/policy-engine/llm-describe-request-result.png)

The resolver follows the engine's rules: highest priority wins per control, equal-priority allow and deny resolve to deny, IP allowlists intersect, model lists combine and rejected models win, limits take the strictest value, every matching budget applies, and data actions resolve per data type with block request-wide.

- **Test with the engine** sends the same request to the engine's simulator against the current draft and shows its answer next to the console's, so any disagreement is visible.
- **Open full simulator** opens the [simulator](../../console/govern/author-simulate-and-publish#4-simulate) with the matched policies preselected.

## History

![Revision history with revision number, Active badge, published time, actor, checksum, View source and Rollback](/img/policy-engine/llm-history.png)

Lists every published revision with its time, actor and checksum. **View source** shows the revision's QuilrQL. **Rollback** republishes that source as a new revision, so existing history is kept. See [Roll back if needed](../../console/govern/author-simulate-and-publish#8-roll-back-if-needed).

## Advanced policies

![Advanced policies section with the Advanced workspace link](/img/policy-engine/llm-advanced-policies.png)

Policies that the cards cannot represent safely are listed here, below the cards. Card edits never rewrite them.

**Advanced workspace** opens the source-level editor for the whole LLM Gateway document:

![Advanced workspace with the authoritative revision badge, Draft policy selector, New draft from active revision, Save draft, Validate and Publish revision](/img/policy-engine/llm-advanced-workspace-draft.png)

| Area | What it holds |
|---|---|
| **01 Author** | Named drafts cloned from the active revision, a visual builder for one policy at a time, and the full QuilrQL source (up to 400,000 bytes). Drafts save explicitly and publish only after the saved source validates. |
| Suggested policies | Ready-made policies to insert, for example block sensitive information, block prompt attacks, deny tool access, secure coding routes, govern gateway access. |
| Insert from catalog | Search a catalog (users, apps and more) and insert exact values. |
| **02 Analyze** | **Diagnostics**, **Simulation** and **Historical Try** against the current candidate. |
| **03 History** | Published revisions with **View source** and **Rollback**. |

![02 Analyze section with Diagnostics, Simulation and Historical Try tabs](/img/policy-engine/llm-advanced-workspace-analyze.png)

:::warning Disable Policy Engine
The advanced workspace also carries **Disable Policy Engine**, which hands the LLM Gateway back to classic app settings. See [Switching from settings](../../console/govern/switching-from-classic-settings).
:::
