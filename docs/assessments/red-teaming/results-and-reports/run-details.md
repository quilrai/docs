---
sidebar_position: 2
sidebar_label: "Run details"
sidebar_custom_props:
  icon: ListChecks
description: "Standards and framework coverage, categories, and findings for one run, and how to replay fixed findings."
aliases: [run details, framework coverage, replay]
---

# Run details

Open a run to see how the asset scored against industry standards, which categories it failed, and the findings to fix.

To see the results of a run, select the arrow (**>**) on its row in the Recent runs table. The details page has three parts, from top to bottom: standards and framework coverage, categories, and findings.

## Run summary and coverage

The top of the page identifies the run and shows how it scored against industry standards.

- **Left:** the name of the asset that was tested, such as `claude-fable-5-1`, with its mode and risk grade below it, such as **Model · Risk grade C**.
- **Right:** **Tests passed**, the number of attacks the asset withstood out of the total, such as **12/14**.

![The run details header for claude-fable-5-1, Model, Risk grade C, with action buttons and the Standards and Framework Coverage panel: an 86% average pass rate donut and eight framework cards for MITRE ATLAS, NIST AI RMF, OWASP, ISO/IEC 42001, EU AI Act, CIS Controls, ISO/IEC 27001, and SOC 2. Tests passed shows 12/14.](/img/red-teaming/results/7-run-header.png)

*Figure 1. The run summary and Standards & Framework Coverage.*

**Standards & Framework Coverage** maps the run's attacks to industry standards and best practices. Each card is one framework:

- The **donut** is the pass rate for the attacks mapped to that framework.
- The **count**, such as **8 / 19 techniques tested**, shows how many of the framework's items this run's attacks covered.

The large donut on the left is the **average pass rate** across all the frameworks.

| Framework | Covers | Counted in |
| --- | --- | --- |
| MITRE ATLAS | AI threat techniques | Techniques |
| NIST AI RMF | AI risk management | Subcategories |
| OWASP | LLM and agentic application risks | Categories |
| ISO/IEC 42001 | AI management systems | Controls |
| EU AI Act | Regulatory requirements | Articles |
| CIS Controls v8 | Critical security controls | Safeguards |
| ISO/IEC 27001 | Information security | Controls |
| SOC 2 | Trust Services Criteria | Criteria |

Buttons across the top right let you act on the run:

- **All assessments**: go back to the landing page.
- **Open full report**: open the complete report for this run.
- **Replay failed**: replay every failed attack.
- **Forward summary**: send the run's summary to Slack or email. See [Share results](./share-results.md).
- **Re-run**: run the whole assessment again.

## Categories

Scroll down to see how the run's attacks map to the categories of one standard. Categories are sorted by failures, so the weakest areas appear first.

| Column | What it shows |
| --- | --- |
| Category | The category ID and name in the selected standard. For OWASP, `LLM` IDs come from the Top 10 for LLM Applications and `ASI` IDs from the Top 10 for Agentic Applications. |
| Mapped | How many of the run's attacks map to this category. |
| Pass | Attacks the asset withstood. |
| Fail | Attacks that succeeded against the asset. |
| Review | Results that need a person to review them. |
| Pass rate | Pass as a share of mapped attacks. |

The **Other** row, **Synthesized and other objectives**, holds attacks generated specifically for this target and attacks that do not map to the selected standard.

![The Categories table for OWASP with ten categories sorted by failures. ASI01 Agent Goal Hijack and LLM09 each have one failed attack; the other categories pass at 100%.](/img/red-teaming/results/8-categories.png)

*Figure 2. Categories mapped to OWASP, sorted by failures.*

To view another standard, open the list at the top right of the table and select it. The options are OWASP, MITRE ATLAS, CWE, NIST AI RMF, EU AI Act, ISO/IEC 42001, ISO/IEC 27001, and SOC 2.

![The standard list open above the Categories table, showing OWASP selected, and MITRE ATLAS, CWE, NIST AI RMF, EU AI Act, ISO/IEC 42001, and ISO/IEC 27001.](/img/red-teaming/results/9-standard-picker.png)

*Figure 3. Choose the standard to map categories to.*

## Findings

At the bottom of the page, **Findings** lists the weaknesses this run found.

| Column | What it shows |
| --- | --- |
| Finding | What the attack made the asset do, with its severity and category below it, such as **Medium · LLM09**. The colored bar on the left matches the severity. |
| Asset | The asset the attack ran against, and its mode. |
| Status | The finding's status, such as **Confirmed**. |
| Suggested fix | A recommended change to stop the attack, such as adding explicit scope constraints to the system prompt. |

![The Findings table for claude-fable-5-1 with two confirmed findings: a Medium LLM09 finding and a Low Agent Goal Hijack finding, each with a suggested fix.](/img/red-teaming/results/10-findings.png)

*Figure 4. Findings for a run.*

## Replay a finding after you fix it

After the development team applies a fix, replay the finding to check that the attack no longer works.

1. In **Findings**, select the check box next to each finding you fixed.
2. Select **Replay selected**. The button shows how many findings you selected.

**Result:** Quilr replays the attacks behind each selected finding against the asset and evaluates them again.

![The Findings table with one finding selected and the Replay selected (1) button shown above the table.](/img/red-teaming/results/11-replay-selected.png)

*Figure 5. Select fixed findings, then select **Replay selected**.*

:::tip

To replay every failed attack in the run at once, select **Replay failed** at the top of the page.

:::
