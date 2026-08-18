---
sidebar_position: 8.5
sidebar_custom_props:
  icon: ClipboardList
---

# Reading the Report

<div className="rt-hero">
  <span className="rt-kicker">LLM Gateway</span>
  <strong>Every number in a red team report answers a different question. This page says which.</strong>
  <p>A completed run gives you a headline pass rate, a per-suite breakdown, a Guardian counterfactual, framework rollups, a knowledge horizon, and a list of cases that never completed. Read in the wrong order, they contradict each other. Read in the right order, they tell you what to fix and what to ship.</p>
  <div className="rt-stats">
    <div><strong>1</strong><span>Headline pass rate</span></div>
    <div><strong>2</strong><span>Verdict views, before and after review</span></div>
    <div><strong>3</strong><span>Guardian outcome buckets</span></div>
    <div><strong>7</strong><span>Report sections to read in order</span></div>
  </div>
</div>

This page is about interpreting a finished run. For how the test is executed, what each suite contains, and how to configure a run, see [Red Team Testing](./red-team-testing).

## What the Report Is

The report is not a static snapshot written when the run ended. It is rebuilt from the stored cases every time you open it, which has two consequences worth knowing up front.

<div className="rt-grid rt-cols-2">
  <div className="rt-card" data-accent="info">
    <span>Consequence 1</span>
    <strong>Human review changes the numbers</strong>
    <p>Record a human verdict on a case and the pass rate, the suite breakdown, the framework rollups, and the Guardian counts all move with it. Nothing needs to be re-run.</p>
  </div>
  <div className="rt-card" data-accent="warn">
    <span>Consequence 2</span>
    <strong>The numbers you see already exclude errors</strong>
    <p>Cases that failed for technical reasons are stripped out of every rate and listed separately, so an outage never reads as a safety regression.</p>
  </div>
</div>

## Read It In This Order

<StepFlow steps={[
  {
    label: "1. Health",
    items: [
      "Run status",
      "Excluded error tests",
      "✓ Is this run trustworthy",
    ],
  },
  {
    label: "2. Exposure",
    items: [
      "Guardian residual failures",
      "Prompt Attacks failures",
      "✗ What is actually at risk",
    ],
  },
  {
    label: "3. Quality",
    items: [
      "Per-suite pass rates",
      "Capability suites",
      "Knowledge horizon",
    ],
  },
  {
    label: "4. Evidence",
    items: [
      "Case drill-down",
      "Human review",
      "Framework rollups",
    ],
  },
]} />

Checking health first is not a formality. A run that aborted, or one where a quarter of the cases errored, produces a pass rate that looks like a result and is not one.

## 1. Run Health

### Status

| Status | What it means for the report |
|---|---|
| **Pending** | Queued, no cases executed yet. Nothing to read. |
| **Processing** | Cases are landing one at a time. Everything below is readable but partial, and every rate will move as the remaining cases complete. |
| **Completed** | The full selected corpus ran. The report is final apart from human review. |
| **Failed** | The run aborted part way through. Read the run error first, treat the numbers as a fragment, and re-run once the cause is fixed. |

A failed run is almost always a configuration or provider problem rather than a model problem. Authentication and permission failures abort on the first case, because every remaining case would fail the same way. Other systemic failures abort after a sustained run of consecutive case errors. This is deliberate: a broken run stops visibly instead of producing a report full of errors that reads like a catastrophic safety result.

### Excluded error tests

Cases that could not be completed are removed from every pass rate and every rollup, then listed on their own with the reason and the error type. The report keeps the pre-exclusion totals alongside the adjusted ones, so you can always see how much of the corpus actually produced a verdict.

Common reasons, in plain terms:

| Reason | What happened | What to do |
|---|---|---|
| **Rate limit** | The provider throttled the run. The runner already lowers concurrency automatically when this happens. | Re-run with lower concurrency, or raise the provider quota. |
| **Timeout, connection, or server error** | The provider was slow or unavailable beyond the retry budget. | Re-run. If it recurs at the same point, suspect a specific case size or a provider region. |
| **Authentication or permission error** | The credentials on the app cannot call the selected model. | Fix the provider configuration. The run will have aborted early. |
| **Bad request** | The provider rejected the request shape, usually a model that does not accept an option you set. | Check the generation options, then re-run. |
| **Unsupported capability** | The model refused something the case requires, most often tool definitions on a tool-required case. | Expected on models without tool support. Those cases cannot be scored on that target. |
| **Parse error** | The response could not be read as the fixed answer format the case requires. | Usually a model that ignores output constraints. That is itself a finding, but it is reported as an error rather than a failure. |

:::note
A handful of excluded errors in a long run is normal. A large share of one suite erroring means that suite was not really tested, and its pass rate is being computed over whatever survived.
:::

## 2. The Headline Pass Rate

The headline number is the share of completed, non-error cases that passed.

<div className="rt-grid">
  <div className="rt-card" data-accent="good">
    <span>In the numerator</span>
    <strong>Passing cases</strong>
    <p>Cases where the response met the expected behavior or matched the answer key, after any human verdict is applied.</p>
  </div>
  <div className="rt-card" data-accent="danger">
    <span>In the denominator</span>
    <strong>Passes, failures, and needs review</strong>
    <p>Every case that produced a verdict. Cases awaiting human judgment are counted here even though they have not been decided.</p>
  </div>
  <div className="rt-card" data-accent="info">
    <span>Not counted at all</span>
    <strong>Error cases</strong>
    <p>Removed from both sides and reported separately, so a provider outage cannot move the score in either direction.</p>
  </div>
</div>

:::warning
**Needs review sits in the denominator.** Until a human resolves them, unreviewed cases depress the pass rate exactly as if they had failed. On a fresh Prompt Attacks run this can be a visible gap. Resolving reviews can only hold the number steady or raise it, never lower it, so an unreviewed run is a floor rather than a verdict.
:::

### Automated and effective verdicts

The report shows two pass rates side by side over the same set of cases.

| View | What it counts |
|---|---|
| **Automated verdicts** | The grader's original decisions only. This is the reproducible number, and the one to use when comparing runs. |
| **Effective verdicts** | The same cases with human decisions applied where they exist. This is the number to sign off on. |

Before anyone reviews, the two are identical. The gap between them is a direct measure of how much human judgment moved the result, which is worth watching: a large gap means the automated grading is not matching your policy on this corpus, and the reviewed cases are worth reading as a set rather than one at a time.

## 3. Per-Suite Results

Each suite reports its own totals, verdict counts, pass rate, and average score. The headline number tells you whether there is a problem. The suite breakdown tells you what kind.

| Suite | A failure here means |
|---|---|
| **Prompt Attacks** | The model did something unsafe under adversarial pressure. This is the security signal. |
| **Grounded Answering** | The model answered with something the source document did not say, including quietly filling in a field that was absent. |
| **Hallucination** | The model accepted a fabricated statement as supported, or failed to recognise that a question was unanswerable from the source. |
| **Instruction Following** | The model treated an explicit constraint as approximate. Format, length, ordering, and forbidden-content rules are the usual casualties. |
| **Knowledge** | The model is weaker than expected in a domain. Not a security signal on its own, but it is what tells you whether a drop elsewhere is a safety regression or just a less capable model. |
| **Logic & Reasoning** | The model reasoned incorrectly or over-assumed on facts that were fully stated in the prompt. |

A useful pattern to watch for: security failures concentrated in one suite are a policy problem, while failures spread evenly across Prompt Attacks and the capability suites usually mean the model itself is under-powered for the application.

:::warning
**Average score is not comparable across suites.** The deterministic suites are pass or fail per case, so their average score is just their pass rate expressed differently. Prompt Attacks carries a graded 0 to 100 score per case, so its average blends partial outcomes. Reading one suite's average against another's, or averaging them together, produces a number that means nothing. Compare a suite only against the same suite in another run.
:::

Suites where cases were excluded for errors show that count alongside their totals, so a suite that was only half tested is visible as such.

## 4. Reading a Prompt Attacks Case

Prompt Attacks is the only suite where a case carries a graded judgment rather than a match against an answer key, and it is where the drill-down matters most.

Each case shows:

- **The verdict** - pass, fail, or needs review.
- **A score from 0 to 100** - how much was actually given away.
- **A severity** - how bad this particular failure would be in production.
- **An evidence quote** - the exact span of the response the grader based its decision on.
- **An unsafe tool use flag** - whether the model decided to call something it should not have.
- **The full conversation** - every turn, the request that was sent, the response, and any tool calls the model constructed.

:::warning
**The verdict and the score are decided separately.** Pass or fail comes from the grader's verdict alone. The score describes the magnitude of what happened, not the decision. That means a case can pass with a middling score, where the model held the line but wobbled on the way, and a case can fail at a score that is not near zero, where it leaked a fragment rather than the whole thing. Use the verdict to count, and the score to prioritise within the failures.
:::

### What to look at on a failure

1. **Which turn broke.** Multi-turn cases build rapport before the attack lands. A model that holds for four turns and gives way on the fifth needs a different fix than one that fails immediately.
2. **The evidence quote.** It tells you what was actually disclosed. A paraphrase of one policy line is a different problem than a verbatim system prompt dump.
3. **The tool calls.** On a tool-aware case, the call the model decided to make is the finding. Check the function it chose and the arguments it constructed, particularly whether attacker text landed inside an argument.
4. **Any recorded adaptation.** If the runner had to adjust the request to fit the provider, that is noted on the case, so a difference in behavior is never unexplained.

### Control cases

The corpus deliberately includes benign requests that look like attacks. A failure on one of these is not an over-cautious model behaving well, it is a model refusing legitimate work. They are scored the same way as everything else, which is what keeps the pass rate a measure of usable safety rather than blanket refusal.

## 5. The Guardian Counterfactual

For Prompt Attacks cases, the report also answers a question the pass rate cannot: would the gateway have stopped this before it reached the model? The same request is replayed through a Guardian block evaluation, turn by turn, stopping at the first turn that would have been blocked.

The result splits every scenario into three buckets that matter and several that do not.

<div className="rt-grid">
  <div className="rt-card" data-accent="danger">
    <span>Act on this first</span>
    <strong>Residual failures</strong>
    <p>The model failed and Guardian would have allowed the request through. Nothing in the stack stopped these. This is your live exposure.</p>
  </div>
  <div className="rt-card" data-accent="good">
    <span>Evidence of value</span>
    <strong>Prevented</strong>
    <p>The model failed but Guardian would have blocked the request first. Protection the gateway is adding today, on top of whatever the model does.</p>
  </div>
  <div className="rt-card" data-accent="warn">
    <span>Friction to tune</span>
    <strong>Potential over-blocks</strong>
    <p>The model handled the case safely and Guardian would have blocked it anyway. Cost with no security benefit.</p>
  </div>
</div>

Alongside those, the report gives you:

| Number | How to read it |
|---|---|
| **Prevention rate** | Of the failures Guardian could have caught, the share it would have caught. The denominator is prevented plus residual failures, so it is a statement about coverage of real failures, not about the whole corpus. |
| **Blocked and allowed** | The raw counterfactual decisions across all scenarios, regardless of whether the model passed or failed. Useful for seeing how aggressive the current policy is overall. |
| **Pending review** | Scenarios where the model's verdict is still awaiting a human, so the case cannot yet be sorted into prevented or residual. |
| **Skipped and errors** | Evaluations that could not run. These are unknown outcomes and are never counted as allowed, so they never flatter the prevention rate. |

Each blocked case records which turn triggered the block, the reason, and the phrases quoted from the conversation. That is what makes an over-block actionable: you can trace it to the exact wording, rather than guessing at the policy.

:::tip
Residual failures and potential over-blocks pull in opposite directions, and tuning against only one of them is how policies go wrong. A policy that drives residual failures to zero by blocking everything shows up immediately in the over-block count.
:::

The counterfactual runs for Prompt Attacks only. The other suites measure model capability rather than request policy, so a request-side block has no meaningful reading there, and their cases are absent from every Guardian number.

## 6. Framework Rollups

Each framework the run has coverage for gets its own rollup: per-category totals, pass and fail counts, pass rate, and average score. Individual cases carry their own mapping, so a failing category can be traced from the framework view straight to the prompt and response that failed it. That traceability is what makes a run usable as an audit artifact rather than a dashboard.

Three things to know before reading these as coverage:

<div className="rt-grid">
  <div className="rt-card" data-accent="warn">
    <span>Read carefully</span>
    <strong>Category totals overlap</strong>
    <p>One case usually maps to several categories, and to several frameworks at once. Category totals within a framework will add up to more than the number of cases in the run. They are views of the same cases, not a partition of them.</p>
  </div>
  <div className="rt-card" data-accent="info">
    <span>Read carefully</span>
    <strong>Not only Prompt Attacks contributes</strong>
    <p>Most categories are driven by the security suite, but Hallucination, Grounded Answering, and Instruction Following also map into the integrity and information-quality categories. A weak category there is a grounding problem, not an attack.</p>
  </div>
  <div className="rt-card" data-accent="danger">
    <span>Read carefully</span>
    <strong>Coverage follows the run</strong>
    <p>A framework or category only appears when the run contains cases mapped to it. Limiting cases or deselecting suites silently narrows the rollup, and a category that is absent has not been tested rather than passed.</p>
  </div>
</div>

That last point is the one that trips people up. A capped smoke run produces a framework view that looks clean because most of the corpus never executed. Only a full run supports a coverage claim.

## 7. Knowledge Horizon

Alongside the selected suites, the run measures where the target model's factual recall actually stops. Questions anchored to dated public events are grouped by calendar quarter, and the report shows a pass rate for each quarter plus the most recent quarter the model answers reliably.

How to read it:

- **The per-quarter curve matters more than the single headline quarter.** A clean run of high quarters that falls off a cliff is a real cutoff. A ragged pattern of high and low quarters usually means uneven training coverage rather than a boundary.
- **A horizon earlier than the provider claims** is the useful finding. It tells you the app needs retrieval or web tooling to answer anything current, regardless of what the model card says.
- **A horizon that moves between runs on the same model name** is worth investigating on its own. It is one of the few signals that a provider has quietly changed the model behind a stable name.

This measurement runs on every test. It is not a suite you select, and it does not contribute to the headline pass rate.

## 8. Review State

The report tracks how much of it has been through human hands:

| Signal | What it tells you |
|---|---|
| **Review status** | Not started, in progress, or complete. Complete means no case is still waiting on a human decision. |
| **Reviewed cases** | How many cases carry a human verdict, including confirmations of a verdict the grader already got right. |
| **Human overrides** | How many human verdicts actually differ from the grader. This is the number that shows whether review is changing the outcome or confirming it. |
| **Unresolved needs review** | Cases the grader could not decide and no human has decided either. These are still sitting in the pass rate denominator. |

A run is ready to be treated as evidence when unresolved needs review reaches zero. Until then the effective pass rate is understated by an amount you can read directly off that count.

Human decisions never overwrite the grader. Both verdicts are kept, changing a decided verdict requires a reason, and the history of who decided what and when cannot be edited or removed.

## Comparing Two Runs

The corpus is fixed, so runs are comparable, but only when everything else is held still. For a difference between two runs to be attributable:

- **The same suites, with the same case limits.** Case limits take cases from the front of each suite, so two limited runs are comparable to each other but never to a full run.
- **The same system prompt and the same tool schemas.** These are the entire simulation of your application. Changing either changes what is being measured.
- **The same generation options.** Temperature and the rest are part of the target's behavior.
- **One variable changed at a time.** A new model and a reworded system prompt in the same run leave you unable to attribute the movement to either.
- **Compare automated verdicts, not effective ones.** Human review is applied unevenly across runs, so the reviewed number is the one to sign off on and the automated number is the one to diff.

<div className="rt-note">
  <strong>Keep a bare-model baseline.</strong>
  <p>A run with no system prompt and no tools measures the provider before your application does anything. The gap between that and your configured run is the part of your posture your own configuration is responsible for, which is the only part you can fix without changing models.</p>
</div>

## Quick Reference

| If you want to know | Read |
|---|---|
| Whether the run is worth reading at all | Status, then the excluded error tests |
| What is exposed in production right now | Guardian residual failures |
| Whether the gateway is earning its place | Prevented, and the prevention rate |
| Where policy is too aggressive | Potential over-blocks, then the blocking turn and evidence on each |
| Whether the model is safe under attack | Prompt Attacks pass rate, automated view |
| Whether the model is trustworthy when not under attack | Grounded Answering, Hallucination, Instruction Following |
| Whether a regression is a safety problem or a weaker model | Knowledge and Logic & Reasoning against the previous run |
| Whether the app needs retrieval | The knowledge horizon curve |
| Whether the report can be signed off | Unresolved needs review, then human overrides |
| What to show an auditor | The framework rollups, with the case drill-down behind each failing category |
