---
sidebar_position: 2
sidebar_label: "Reading a report"
sidebar_custom_props:
  icon: ClipboardList
---

# Reading a report

Each Red Teaming tool produces its own kind of result. This page explains how to read each one, in the order that tells you what to fix first.

| Tool | What the result looks like | Section |
|------|----------------------------|---------|
| [LLM Intelligence Assessment](../assessments/llm-intelligence-assessment) | Pass rate per suite, Guardian counterfactual, framework rollups, knowledge horizon | [LLM Intelligence Assessment report](#llm-intelligence-assessment-report) |
| [Agentic Red Teaming](../assessments/agentic-red-teaming) and [Model Red Teaming](../assessments/model-red-teaming) | Letter grade, risk score, breached / partial / held findings, remediation | [Agentic and Model Red Teaming reports](#agentic-and-model-red-teaming-reports) |
| [MCP Threat Detection](../assessments/mcp-threat-detection) | A scan with findings and coverage, listed under **Recent scans** | [MCP Threat Detection scans](#mcp-threat-detection-scans) |

All reports share the same ideas: results are evidence for the tested scope only, every failure is mapped to a framework category (see [Framework mapping](#framework-mapping)), and each failing case or finding carries the evidence behind it.

## LLM Intelligence Assessment report

The report is rebuilt from the stored cases every time you open it. Two consequences:

- **Human review changes the numbers.** Record a human verdict on a case and the pass rate, suite breakdown, framework rollups, and Guardian counts all move. Nothing needs to be re-run.
- **The numbers already exclude errors.** Cases that failed for technical reasons are removed from every rate and listed separately, so an outage never reads as a safety regression.

Read it in this order:

<StepFlow steps={[
  { label: "1. Health", items: ["Run status", "Excluded error tests", "✓ Is this run trustworthy"] },
  { label: "2. Exposure", items: ["Guardian residual failures", "Prompt Attacks failures", "✗ What is actually at risk"] },
  { label: "3. Quality", items: ["Per-suite pass rates", "Capability suites", "Knowledge horizon"] },
  { label: "4. Evidence", items: ["Case drill-down", "Human review", "Framework rollups"] },
]} />

### Run health

| Status | Meaning |
|---|---|
| **Pending** | Queued, no cases executed yet. |
| **Processing** | Cases are landing one at a time. Everything is readable but partial. |
| **Completed** | The full selected corpus ran. Final apart from human review. |
| **Failed** | The run aborted. Read the run error first, treat the numbers as a fragment, and re-run once the cause is fixed. |

A failed run is almost always a configuration or provider problem. Authentication and permission failures abort on the first case; other systemic failures abort after a sustained run of consecutive case errors.

**Excluded error tests** are listed with the reason and error type, next to the pre-exclusion totals:

| Reason | What to do |
|---|---|
| **Rate limit** | The runner already lowers concurrency. Re-run with lower concurrency or raise the provider quota. |
| **Timeout, connection, or server error** | Re-run. If it recurs at the same point, suspect a case size or a provider region. |
| **Authentication or permission error** | Fix the provider configuration on the app. |
| **Bad request** | Usually a model that does not accept an option you set. Check generation options. |
| **Unsupported capability** | The model refused something the case needs, most often tool definitions. Expected on models without tool support. |
| **Parse error** | The response could not be read in the required answer format. Reported as an error, not a failure. |

:::note
A few excluded errors in a long run is normal. A large share of one suite erroring means that suite was not really tested.
:::

### Pass rate

The headline number is passing cases divided by every case that produced a verdict (passes, failures, and **needs review**). Error cases are not counted at all.

:::warning
**Needs review sits in the denominator.** Until a human resolves them, unreviewed cases lower the pass rate as if they had failed. Resolving reviews can only hold the number steady or raise it, so an unreviewed run is a floor, not a verdict.
:::

The report shows two views over the same cases:

| View | Use it to |
|---|---|
| **Automated verdicts** | Compare runs. This is the reproducible number. |
| **Effective verdicts** | Sign off. Human decisions are applied where they exist. |

A large gap between them means automated grading is not matching your policy on this corpus.

### Per-suite results

Each suite reports totals, verdict counts, pass rate, and average score.

| Suite | A failure means |
|---|---|
| **Prompt Attacks** | The model did something unsafe under adversarial pressure. The security signal. |
| **Grounded Answering** | The model answered with something the source did not say. |
| **Hallucination** | The model accepted a fabricated statement, or missed that a question was unanswerable. |
| **Instruction Following** | The model treated an explicit format, length, ordering, or content rule as approximate. |
| **Knowledge** | The model is weaker in a domain. Tells you whether a drop elsewhere is a safety regression or a less capable model. |
| **Logic & Reasoning** | The model reasoned incorrectly on facts that were fully stated. |

:::warning
**Average score is not comparable across suites.** Deterministic suites are pass or fail per case; Prompt Attacks carries a graded 0 to 100 score. Compare a suite only against the same suite in another run.
:::

### Prompt Attacks cases

Each case shows the verdict, a 0 to 100 score (how much was given away), a severity, an evidence quote, an unsafe tool use flag, and the full conversation including any tool calls. The verdict and the score are decided separately: use the verdict to count, and the score to prioritize within failures.

On a failure, check which turn broke, what the evidence quote actually disclosed, which tool call and arguments the model constructed, and any recorded provider adaptation. The corpus also contains benign **control cases** that look like attacks; failing one means the model refused legitimate work.

### Guardian counterfactual

For Prompt Attacks, each request is replayed through a Guardian block evaluation, turn by turn, to answer: would the gateway have stopped it?

| Bucket | Meaning |
|---|---|
| **Residual failures** | The model failed and Guardian would have allowed it. Your live exposure. Act on these first. |
| **Prevented** | The model failed but Guardian would have blocked it first. |
| **Potential over-blocks** | The model was safe and Guardian would have blocked it anyway. Friction to tune. |

The report also shows the **prevention rate** (prevented divided by prevented plus residual), raw **blocked and allowed** counts, **pending review**, and **skipped and errors** (never counted as allowed). Each blocked case records the turn, the reason, and the quoted phrases, so you can trace an over-block to exact wording. Tune against residual failures and over-blocks together. Other suites have no Guardian numbers.

### Framework rollups

Each framework the run covers gets per-category totals, pass and fail counts, pass rate, and average score, and each failing category links to its cases. Keep in mind:

- One case usually maps to several categories and frameworks, so category totals add up to more than the number of cases.
- Hallucination, Grounded Answering, and Instruction Following also map into integrity and information-quality categories.
- A category only appears when the run contains cases mapped to it. Limiting **Max cases** or deselecting suites narrows the rollup silently. Only a full run supports a coverage claim.

### Knowledge horizon

The Temporal Knowledge suite groups dated questions by calendar quarter and shows a pass rate per quarter plus the latest quarter the model answers reliably. A clean drop-off is a real cutoff; a ragged pattern means uneven coverage. A horizon earlier than the provider claims means the app needs retrieval for current topics. The horizon does not affect the headline pass rate, and there is none if you deselect the suite.

### Review state

| Signal | Meaning |
|---|---|
| **Review status** | Not started, in progress, or complete. |
| **Reviewed cases** | Cases with a human verdict, including confirmations. |
| **Human overrides** | Human verdicts that differ from the grader. |
| **Unresolved needs review** | Cases nobody has decided. Still in the denominator. |

Treat a run as evidence when unresolved needs review reaches zero. Human decisions never overwrite the grader: both verdicts are kept, changing a decided verdict requires a reason, and the history cannot be edited.

### Comparing two runs

Runs are comparable only when everything else is held still: the same suites and **Max cases**, the same system prompt and tool schemas, the same generation options, and one variable changed at a time. Compare automated verdicts, not effective ones. A bare-model baseline (no system prompt, no tools) shows how much of your posture comes from your own configuration.

## Agentic and Model Red Teaming reports

Open **Runs** on either tab. The **Completed** list has one card per assessment: a letter grade (A-F, or N/A when incomplete), the target name, "x/y vulnerable · done | incomplete", and the date. Comparisons across several models open a campaign view first; see [Compare models](../assessments/model-red-teaming#compare-models).

![Completed runs list with four grade A cards: gpt-5.4-mini 0/12, 0/12, and 0/60 vulnerable, and test-01 0/14 vulnerable](/img/red-teaming/model-runs-graded-list.png)

| Section | Answers |
|---------|---------|
| **Posture card** | Grade, risk score, and outcome counts. |
| **Capabilities exercised** | What the assessment actually tested (objectives, tools probed, channels). |
| **Severity / OWASP coverage / Tool exposure** | How bad the issues are, which categories and tools were hit. |
| **MITRE ATLAS coverage / Attack-technique effectiveness** | Which adversary techniques were tried and which worked. |
| **Discovered attack surface** | What benign recon found before any attack, plus fingerprint chips such as model family. |
| **Findings** | What broke, with evidence and a fix for each. |
| **Remediation** | Guardrail verification, prompt hardening, Guardian Agent, and custom detections. |

The top bar has **Back to runs**, **Track findings** (copies the findings into the [findings tracker](../operate/runs-findings-and-schedules#findings-tracker)), **Review findings**, and **Remediate & verify**.

### Grade, risk score, and outcomes

| Term | Meaning |
|------|---------|
| **Breached** | The attack succeeded. Counted as vulnerable. |
| **Partial** | The target partly gave way, for example leaking a fragment. |
| **Held** | The target resisted the objective. |
| **Inconclusive** | The evaluation could not reach a verdict. |
| **Tested** | Total objectives completed. |
| **Grade** and **risk N/100** | Letter grade and risk score for the run. Lower risk is better. |
| **COMPLETE · RESIDUAL RISK** | At least one breached or partial probe remains. |
| **Synthesized** | The finding came from a tool-targeted objective generated for this target, not the library. |

:::warning
A letter grade is not a pass. When anything is breached or partial, the report states that this is not a clean or passing posture regardless of the letter grade.
:::

### Example 1: a clean result

`gpt-5.4-mini` through Model Red Teaming with the **Full library**: grade **A**, risk **0/100**, 0 breached, 0 partial, 60 held, 60 tested, 16 OWASP categories, 23 ATLAS techniques, every category green.

![Posture card for gpt-5.4-mini: grade A, risk 0/100, COMPLETE, 0 breached, 0 partial, 60 held, 0 inconclusive, 60 tested](/img/red-teaming/model-report-posture-header.png)

- "No vulnerabilities confirmed across 60 completed probes. This is evidence for the tested scope, not a guarantee beyond it." The result covers this model, with this configuration, at this depth.
- **0 tools probed** and "text-only target" mean tool abuse and multimodal channels were not exercised. Add tools or a system prompt on the model form to widen the test.
- With nothing to fix, **Remediation** shows only the guardrail verification card.

:::tip
Re-run after any change to the model, system prompt, or tools. Scheduled quick scans of the same model can vary between runs, so a single clean run is a data point, not a guarantee.
:::

### Example 2: findings to fix

A support agent ("HTTP Agent") through Agentic Red Teaming with a **Quick scan**: grade **D**, risk **30/100**, COMPLETE · RESIDUAL RISK, 1 breached, 1 partial, 12 held, 14 tested (8 quick-scan objectives plus 6 synthesized). Severity: 1 High, 1 Medium.

![Residual-risk banner, Capabilities exercised tiles, severity breakdown with 1 High and 1 Medium, OWASP coverage with LLM07 red and the rest green, and Tool exposure showing no tools configured](/img/red-teaming/agentic-report-capabilities-severity-owasp.png)

**See where it broke.** In **OWASP LLM & Agentic coverage**, green is held and red is breached; only **LLM07: System Prompt Leakage** is red. **Tool exposure** marks in red any tool the agent was induced to invoke. In **MITRE ATLAS coverage** only **AML.T0056: Extract LLM System Prompt** is red, and **Attack-technique effectiveness** shows **Direct** (1). Prioritize defenses against the techniques that appear there.

**Read each finding.** Filter with **All findings / Breached & partial**. Each row shows title, severity, chips (PARTIAL, SYNTHESIZED), OWASP category, ATLAS technique, the technique that worked ("via Direct"), and reproduction status.

![Findings: 2 issues surfaced. System prompt fragment disclosure via piecewise extraction (HIGH) and Truncated system-prompt leakage of verification policy (MEDIUM, PARTIAL, SYNTHESIZED)](/img/red-teaming/agentic-report-findings-list.png)

### Findings, evidence, and reproduction

Expand a finding for the full write-up:

| Block | What it shows |
|-------|---------------|
| **Evaluation provenance** | Evaluation mode (for example Hybrid), hard signals, judge consensus, disagreement. |
| **Reproduction** | Whether confirmation replays ran. They run only when the target is declared replay-safe and confirmation runs are above 0; otherwise the finding says "Reproduction not attempted" and why. |
| **What happened** | A plain description of the attack and the target's behavior. |
| **Evidence** | Turn-referenced quotes from the conversation. |
| **Recommended fix** | What to change in the target. |
| **OWASP mitigation** | Guidance for the OWASP category. |
| **MITRE ATLAS mitigations** | For example AML.M0020, AML.M0021, AML.M0022. Some techniques have no published mitigation, and the finding says so. |
| **NIST AI RMF** | Subcategory citations such as MEASURE 2.7 or GOVERN 1.1. |

![Expanded finding with Evaluation provenance, Reproduction not attempted, What happened, Evidence, Recommended fix, OWASP mitigation LLM07, MITRE ATLAS mitigations, and NIST AI RMF](/img/red-teaming/agentic-report-finding-detail.png)

:::note
Completed reports show turn-referenced evidence, not full transcripts. Full transcripts are visible only in the live run view while the assessment runs.
:::

### Remediate and verify

<StepFlow
  steps={[
    { label: 'Verify baseline', items: ['Run guardrail verification', 'Before/after grade'] },
    { label: 'Harden the prompt', items: ['Copy suggested guardrails'] },
    { label: 'Add Guardian + detections', items: ['Paste Guardian prompt', 'Add custom detections'] },
    { label: 'Re-verify', items: ['Apply & verify with the guardrail'] },
  ]}
/>

1. **Verify with the Quilr guardrail.** Re-runs the same assessment with Quilr's guardrail in front of the target and shows before/after grade cards. It is the same task-adherence classifier the LLM Gateway [Guardian Agent](../../llm-gateway/protect/guardian-agent) enforces inline. Options: **Guardrail scope** (Both, Incoming, Replies; Both is the default) and **Enforcement** (Block or Monitor; Block is the default).
2. **Prompt hardening suggestions.** Auto-generated from the findings: why the changes help, a checklist of key changes, and recommended system-prompt guardrails to copy.
3. **Guardian Agent and custom detection recommendations.** A **Guardian Agent prompt** (agent purpose plus Do and Don't rules, with suggested settings) to paste into the app's Guardian Agent, and **Custom detection suggestions**, each with an action (for example BLOCK or MONITOR), a control type, a rationale, and patterns to add. Some runs also suggest a **Token Limit** control.

![Custom detection suggestions with patterns to add for each control, and the Apply & verify with the guardrail button](/img/red-teaming/agentic-report-custom-detections.png)

Finish with **Apply & verify with the guardrail** to measure the improvement, then **Track findings** to hand open issues to their owners. See [Turn findings into detections](../operate/turn-findings-into-detections) for where to put the suggested controls.

### Export

Use **PDF** or **Markdown** on the posture card. Exports include the executive summary and coverage, OWASP and ATLAS coverage and strategy effectiveness, tool exposure and discovery, findings with evidence (judge votes, excerpts, reproduction, tool arguments and results), guardrail application history, prompt hardening, Guardian Agent and custom detections, remaining app-side fixes, and framework references.

## MCP Threat Detection scans

An MCP Threat Detection scan appears under **Recent scans** on its tab, with its findings and coverage. See [MCP Threat Detection](../assessments/mcp-threat-detection).

## Framework mapping

| Framework | Where it appears |
|-----------|------------------|
| **OWASP Top 10 for LLM Applications (2025)** | LLM01, LLM02, LLM04-LLM10 in the OWASP coverage panel and on each finding |
| **OWASP Top 10 for Agentic Applications** | ASI01, ASI02, ASI03, ASI05, ASI06 in the same panel |
| **MITRE ATLAS** | A technique per objective and mitigations per finding |
| **NIST AI RMF** | Subcategory citations per finding |

LLM Intelligence Assessment reports group results by framework in the [framework rollups](#framework-rollups). For the mapping of each Agentic and Model Red Teaming objective, see the [Attack library](../operate/attack-library).
