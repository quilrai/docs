---
sidebar_position: 1
sidebar_label: "Runs, findings and schedules"
sidebar_custom_props:
  icon: ListChecks
---

# Red Team Findings and Schedules

Track red-team findings through to a fix, and re-run the same authorized assessment on a schedule.

Both live in the shared sub-navigation of the [Agentic](../assessments/agentic-red-teaming) and [Model](../assessments/model-red-teaming) Red Teaming tabs: **Findings** and **Schedules**. They are shared between the two tabs.

## Findings tracker

The tracker collects findings from agent and model assessments so you can assign, schedule, and close them out.

<StepFlow
  steps={[
    { label: 'Open a report', items: ['Runs → a completed run'] },
    { label: 'Track findings', items: ['Copies its findings', 'into the tracker'] },
    { label: 'Review', items: ['Status, assignee, due date', 'Reason for change'] },
    { label: 'Verify', items: ['Re-run or guardrail verify', 'Then close'] },
  ]}
/>

### Add findings

Click **Track findings** at the top of a report. It copies that report's findings into the tracker, recorded in the audit history as "Imported from assessment evidence".

:::note
**Track findings** writes to the tracker. It is not just a link.
:::

### The list

![Findings tracker with Objective, Severity, Workflow, Assignee, Due, and a Review action for each row](/img/red-teaming/findings-tracker.png)

| Column | Shows |
|--------|-------|
| **Objective** | The objective name, plus the target type and outcome (for example "http · vulnerable", "model · partial") |
| **Severity** | Critical, High, Medium, or Low |
| **Workflow** | The current workflow status |
| **Assignee** / **Due** | Owner and due date |
| **Action** | **Review** |

Use **Refresh findings** to reload. The list is paged at up to 100 findings per page.

### Review a finding

Click **Review** on a row.

![Review panel for System Prompt Extraction with Open source assessment link, Workflow status, Assignee, Due date (UTC), Reason for change, Save workflow, and Close review](/img/red-teaming/findings-review-workflow.png)

1. Click **Open source assessment** to see the evidence in the original report.
2. Set **Workflow status**, **Assignee**, and **Due date (UTC)** as needed.
3. Enter a **Reason for change** (required). Record the decision here; keep credentials and sensitive evidence in the source assessment.
4. Click **Save workflow**.

| Workflow status | Use it when |
|-----------------|-------------|
| **open** | New, not yet looked at |
| **triaged** | Confirmed and prioritized |
| **in progress** | A fix is being made |
| **awaiting verification** | Fixed; waiting for a re-run to prove it |
| **risk accepted** | Not fixing, with a recorded reason |
| **false positive** | Not a real issue |

Every save is kept in the **Audit history** below the form: an append-only list of revisions with actor, status, timestamp, and note (the latest 200 changes are shown).

:::warning
Workflow status does not certify a fix. Move a finding out of **awaiting verification** only after a re-run, or a guardrail verification, shows it held.
:::

## Schedules

Schedules repeat one authorized red-team assessment against the same target, so you can track it over time. Each recurrence appears in **Runs** with the scheduled time appended to the campaign name.

Click **New schedule** to open **New recurring assessment**.

![New recurring assessment form with Schedule name, Start this schedule immediately, and Cadence set to Weekly on Monday at 09:00 in the selected IANA time zone](/img/red-teaming/schedule-new-recurring-assessment.png)

### 1. Schedule details

| Field | Default | Notes |
|-------|---------|-------|
| **Schedule name** | Empty (required) | |
| **Start this schedule immediately** | On | Inactive schedules keep their configuration but do not launch runs. |

### 2. Cadence

| Field | Default | Notes |
|-------|---------|-------|
| **Cadence** | **Weekly** | Daily, Weekly, or Monthly |
| **IANA time zone** | Your browser's time zone | Scheduled times follow this zone, including daylight-saving changes. |
| **Weekday** | Monday | For weekly schedules |
| **Hour** / **Minute** | 09 / 00 | |

### 3. Assessment target

Every recurrence runs against one authorized HTTP agent.

| Field | Notes |
|-------|-------|
| **HTTP agent name** | Required |
| **HTTP method** | **GET** or **POST** (default POST). Only these two are authorized. |
| **Agent endpoint URL** | Absolute HTTPS URL only. Credentials, query strings, and fragments are not allowed. |
| **Request headers** | Values are masked, encrypted by the schedule service, and never returned. |
| **Request body template** | Required. Include `{{message}}` for the current turn or `{{history}}` for the conversation. |
| **Response path** | Optional, such as `reply` or `result.text` |
| **Replay-safe checkbox** | Same meaning as on the interactive form |
| **Advanced HTTP settings** | Session ID path, Tool calls path, Request encoding (default Auto-detect), Timeout (seconds), Maximum response bytes |

:::note
Credentials are sent securely only when you save and are never returned in schedule details.
:::

### 4. Test plan and coverage

- **Shared system prompt** and **Shared tools JSON** (both optional).
- **Attack coverage**: **Full library** (all 64 catalog attacks) or **Select attacks** (search the catalog and pick). Schedules have no Quick scan option.
- **Custom objectives**, as on the interactive form.

### 5. Authorization and evaluation

| Field | Notes |
|-------|-------|
| **Authorized assessment scope** | Required |
| **Assessment depth** | **Low** (default), **High**, or **Maximum**. The interactive form's Standard matches Low and Deep matches High. |
| **Evaluation policy** | Same options as the interactive form: Hybrid / Deterministic / Judge, judge count 1, consensus threshold 0.67, confirmation runs, deterministic evidence override |
| **Acknowledgement** | Required, as on the interactive form |

Click **Save schedule**.

## Related

- [Reading a report](../get-started/reading-a-report#agentic-and-model-red-teaming-reports)
- [Attack Library](./attack-library)
