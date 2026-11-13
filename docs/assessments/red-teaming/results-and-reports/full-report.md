---
sidebar_position: 3
sidebar_label: "Full report"
sidebar_custom_props:
  icon: FileText
description: "Security posture, capabilities exercised, and every finding with evidence and a recommended fix."
aliases: [full report, findings, export, pdf, markdown]
---

# Full report

The full report is the complete record of one assessment run: the overall risk, the attack surface that was tested, and every finding with its evidence, recommended fix, and standards mapping.

## Open the full report

From a run's details page, select **Open full report**. See [Run details](./run-details.md).

![The run action buttons: All assessments, Open full report (highlighted), Replay failed (1), Forward summary, and Re-run.](/img/red-teaming/report/1-open-full-report.png)

*Figure 1. Select **Open full report**.*

The report has three sections, from top to bottom: security posture, capabilities exercised, and findings.

## Security posture

The top of the report gives the overall risk evaluation for the run.

- **Risk grade and score:** the letter grade in the ring, with the risk score below it, such as **C** and **risk 17/100**. A lower score means less risk.
- **Status:** the run's status and outcome, such as **Complete · Residual risk**, meaning the run finished and some risk remains.
- **Target and engine:** the asset that was tested and the red-team engine that tested it, such as the Quilr Adaptive Engine in adaptive mode.
- **Result counts:** how the tested objectives ended.

| Count | Meaning |
| --- | --- |
| Breached | The attack succeeded. These are confirmed risks. |
| Partial | The attack partly succeeded. |
| Held | The target withstood the attack. |
| Inconclusive | The result could not be decided. |
| Tested | The total number of objectives tested. |

To download the report, select **PDF** or **Markdown** at the top right.

![The security posture header: grade C with risk 17/100, status Complete · Residual risk, the target claude-fable-5-1 tested by the Quilr Adaptive Engine, counts of 2 breached, 0 partial, 12 held, 0 inconclusive, and 14 tested, and PDF and Markdown download buttons.](/img/red-teaming/report/2-posture.png)

*Figure 2. Security posture.*

## Capabilities exercised

This section shows the attack surface the assessment actually tested, and which techniques from each standard were used.

At the top, a chip shows the input channel tested, such as **Text**. For a text-only target, the report notes that you can enable multimodal objectives to also test vision, audio, and document channels.

Below it, six counts summarize the scope of the run:

| Count | What it shows |
| --- | --- |
| Objectives run | Attack objectives the run executed. |
| Tools probed | Tools the run tried to make the target misuse. This is 0 when no tools were configured. |
| OWASP categories | OWASP LLM and agentic categories covered. |
| ATLAS techniques | MITRE ATLAS techniques used. |
| NIST AI RMF cited | NIST AI RMF subcategories referenced in the results. |
| ATLAS mitigations | MITRE ATLAS mitigations recommended in the findings. |

The panels below break the run down further:

- **Severity breakdown:** findings by severity: Critical, High, Medium, and Low.
- **OWASP LLM & Agentic coverage:** each OWASP category tested. A red dot marks a category where an attack succeeded; green marks one the target held.
- **MITRE ATLAS coverage:** each ATLAS technique used, with the same red and green markers.
- **Tool exposure:** each configured tool. A tool shown in red is one the agent was induced to call during the attacks.
- **Attack-technique effectiveness:** which adversarial techniques succeeded, and how many times. Prioritize your defenses against the techniques at the top.

![The Capabilities exercised section: a Text channel chip, counts of 14 objectives run, 0 tools probed, 9 OWASP categories, 7 ATLAS techniques, 5 NIST AI RMF cited, and 9 ATLAS mitigations, and panels for severity breakdown, OWASP coverage, tool exposure, MITRE ATLAS coverage, and attack-technique effectiveness.](/img/red-teaming/report/3-capabilities.png)

*Figure 3. Capabilities exercised.*

## Findings

The last section lists every issue the run surfaced.

- Use **Search findings** to find a finding by name, severity, or risk category.
- Select **All findings**, or **Breached & partial** to show only attacks that fully or partly succeeded.

Each finding shows its title and severity, then the OWASP category and MITRE ATLAS technique it maps to, the technique that succeeded (such as **via Direct**), and whether reproduction was attempted. A **Synthesized** tag marks a finding from an objective generated specifically for this target.

![The Findings section with 2 issues surfaced, a search box, All findings and Breached and partial filters, and two findings: a Medium synthesized finding mapped to LLM09 and a Low finding mapped to ASI01 Agent Goal Hijack.](/img/red-teaming/report/4-findings.png)

*Figure 4. The findings list.*

### Inside a finding

Select a finding to expand it.

| Part | What it shows |
| --- | --- |
| Evaluation provenance | How the result was judged: the evaluation mode (such as **hybrid**), the number of hard signals detected, the judge consensus, and whether the judges disagreed. |
| Reproduction | Whether Quilr tried to reproduce the attack. Reproduction is not attempted on a live target unless it is declared a replay-safe sandbox. |
| What happened | A plain-language account of the attack and how the target responded. |
| Evidence | The exact part of the conversation that proves the finding, with its turn number. |
| Recommended fix | What to change so the target no longer behaves this way. |
| OWASP mitigation | The mitigation for the mapped OWASP category. |
| MITRE ATLAS mitigations | The ATLAS mitigations for the mapped technique, with their IDs, such as `AML.M0002`. |
| NIST AI RMF | The NIST AI RMF subcategories that apply, such as `MEASURE 2.7`. |

![An expanded Medium finding showing evaluation provenance (hybrid mode, 0 hard signals, 100% judge consensus, no disagreement), a reproduction-not-attempted note, What happened, Evidence from turn 9, Recommended fix, OWASP mitigation for LLM09, four MITRE ATLAS mitigations, and NIST AI RMF references.](/img/red-teaming/report/5-finding-expanded.png)

*Figure 5. An expanded finding.*

:::tip

Share the recommended fix and evidence with the development team that owns the target. After they apply the fix, replay the finding from the run's details page. See [Run details](./run-details.md).

:::
