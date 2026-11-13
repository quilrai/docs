---
sidebar_position: 1
sidebar_label: "Assessments overview"
sidebar_custom_props:
  icon: LayoutGrid
description: "The Red Teaming landing page: summary cards, recent runs, filters, and run statuses."
aliases: [assessments, recent runs, pass rate, dashboard]
---

# Assessments overview

The Red Teaming landing page shows how your AI systems are holding up across every assessment, and lists recent runs so you can open any one for details.

![The Red Teaming landing page with the Assessments, Findings, Schedules, and Attack library tabs, four summary cards, the New assessment mode cards, and the Recent runs table.](/img/red-teaming/results/1-landing.png)

*Figure 1. The Red Teaming landing page.*

The page has three parts, from top to bottom: the summary cards, the **New assessment** cards for starting a test, and the **Recent runs** table. To start a new assessment, see the guides under [Configure and run](../configure-and-run/agent.md).

## Navigate Red Teaming

Use the tabs at the top of the page to move between areas:

| Tab | What it shows |
| --- | --- |
| Assessments | The landing page: summary cards, new assessments, and recent runs. Opens by default. |
| Findings | Weaknesses found across your assessments. |
| Schedules | Assessments set to run on a schedule. |
| Attack library | Attack objectives, including custom objectives you saved. |

![The Assessments, Findings, Schedules, and Attack library tabs, with Assessments selected.](/img/red-teaming/results/2-tabs.png)

*Figure 2. Red Teaming tabs.*

## Summary cards

By default, four cards across the top summarize red teaming activity in your organization.

| Card | What it shows |
| --- | --- |
| Latest run | The pass rate of the most recent run, with the number of attacks, how many of them succeeded against the target (failed), and how many attack categories were covered. Select **View run** to open it. |
| Average pass rate | The average pass rate across recent runs in your organization, with a trend line. The badge shows how much it moved, in percentage points. |
| Runs | The total number of assessment runs in the last 14 days, with a bar for each day. The badge shows the change compared with the previous period. |
| Runs by type | How the runs split across target types: Gateway-connected, Chat agent, AI workflow, Voice agent, and Model. |

![Four summary cards: Latest run for Max Voice Scribe at 78.6% pass rate with 14 attacks, 3 failed, and 9 categories; Average pass rate of 45.8% over 10 runs, down 23.0 points; 97 runs in the last 14 days, up 26%; and Runs by type, a donut chart of 100 runs.](/img/red-teaming/results/3-summary-cards.png)

*Figure 3. Summary cards.*

### How to read the pass rate

The pass rate is the share of attacks the target withstood. A higher pass rate means a stronger defense. In Figure 3, the latest run sent 14 attacks and 3 of them got through, so the target passed 11 of 14, a pass rate of 78.6%.

## Recent runs

The **Recent runs** table lists every assessment run, newest first.

| Column | What it shows |
| --- | --- |
| Assessment | The assessment name, with its mode and type below it, such as **Agent · Voice agent** or **Model**. |
| Status | Where the run is in its lifecycle. See [Run statuses](#run-statuses). |
| Pass rate | The run's pass rate, shown as a bar and a percentage. It appears only for completed runs; other runs show a dash. |
| Started | The date and time the run started. |

Select the arrow (**>**) at the end of a row to open the run's details. See [Run details](./run-details.md). Use **Rows per page** and the page controls at the bottom of the table to move through older runs.

![The Recent runs table with columns for assessment, status, pass rate, and started time, listing agent and model runs with Failed, Cancelled, and Completed statuses.](/img/red-teaming/results/4-recent-runs.png)

*Figure 4. The Recent runs table.*

### Filter runs

Use the controls above the table to narrow the list:

- **Running** shows how many runs are in progress right now.
- **All targets** filters by target type: Agent, Model, Gateway app, or AI workflow.
- **All statuses** filters by run status.

![The All targets filter open, listing Agent, Model, Gateway app, and AI workflow.](/img/red-teaming/results/5-filter-targets.png)

*Figure 5. Filter by target type.*

![The All statuses filter open, listing Queued, Running, Completed, Incomplete, Failed, and Cancelled.](/img/red-teaming/results/6-filter-statuses.png)

*Figure 6. Filter by status.*

### Run statuses

| Status | Meaning |
| --- | --- |
| Queued | The run is waiting to start. |
| Running | The run is in progress. |
| Completed | The run finished. Its pass rate is shown. |
| Incomplete | The run ended before all of its attacks finished. |
| Failed | The run could not finish, for example because the target could not be reached. This is a run error, not a test result. |
| Cancelled | The run was stopped before it finished. |
