---
sidebar_position: 2
sidebar_label: "AI workflow"
sidebar_custom_props:
  icon: FileText
description: "Red team a document, image, or structured data workflow that has no chat interface."
aliases: [ai workflow, document upload, workflow]
---

# Red team an AI workflow

Test a document, image, or structured data workflow that processes inputs and generates a result or takes an action.

## When to use this mode

Not all AI is conversational. Many organizations run AI workflows that never chat with anyone: they take a document or a record, process it, and return a result or take an action. Examples include contract review, invoice extraction, résumé screening, claims triage, and report summarization.

These workflows have no chat box to attack, but they can still be manipulated. Anyone who can get a file into the workflow can hide instructions inside it. This mode tests exactly that: the Red Team Agent builds realistic documents with attacks hidden inside, uploads them to the workflow, and checks whether the result was manipulated.

The workflow can be reached directly, or through the Quilr LLM Gateway if it sits behind it.

## Before you begin

- From the workflow's development team, get its upload endpoint, authentication header, accepted file format, upload field name, and where the result appears in its reply. See [Know your target application](../get-started/requirements.md).
- You have approval to test the workflow.

## Start an AI workflow assessment

On the **New assessment** page, select **Start** on the **AI Workflow** card.

![The New assessment page with four mode cards: AI App / Agent, AI Workflow (marked New), Model, and MCP, each with a Start link.](/img/red-teaming/new-assessment-modes.png)

*Figure 1. Select **AI Workflow** on the New assessment page.*

The **New AI workflow assessment** setup opens. It has five steps: **Target**, **Coverage**, **Custom Attacks**, **Schedule**, and **Review**.

## Step 1: Target

Describe how the workflow receives documents and returns results. Fields marked with an asterisk (*) are required. To fill in the setup automatically instead, select **Detect from URL instead** *(Preview)*. Review what it fills in, and confirm the authentication method and the test account's permissions with the development team.

| Field | What to enter |
| --- | --- |
| Assessment name | A name that identifies the test. |
| Workflow endpoint URL * | The HTTPS endpoint that accepts the document upload, such as `https://docs.example.com/summarize`. |
| Auth header name | Optional. The request header the workflow authenticates with, such as `X-API-Key`. |
| Auth header value | Optional. The credential sent with every upload. It is never shown again after launch. |
| Document format | The file type the workflow accepts, such as PDF. Each attack is uploaded in this format. |
| Document kind | The kind of document the workflow expects. See [Choose the document kind](#choose-the-document-kind). |
| Upload field name * | The multipart form field the file is uploaded under, such as `file`. |
| Reply path | Optional. The dotted path to the result in the JSON reply, such as `summary`. Leave it blank to detect it automatically. |
| What the workflow does | One line describing the workflow's job, such as "Summarizes uploaded contracts and flags risky clauses." The evaluation engine uses this to tell a manipulated result from a correct one. |
| Additional form fields | Optional. Extra form fields sent with every upload. Select **Add form field** for each one. |

![The New AI workflow assessment Target step with fields for assessment name, workflow endpoint URL, auth header name and value, document format, document kind, upload field name, reply path, what the workflow does, and additional form fields.](/img/red-teaming/workflow/2-target.png)

*Figure 2. The Target step for an AI workflow.*

:::tip

Write **What the workflow does** carefully. It is how Quilr decides whether an attack worked. "Summarizes uploaded contracts and flags risky clauses" lets the engine spot a summary that hides a risky clause; "Processes documents" does not.

:::

### Choose the document kind

Every attack is hidden inside a document. The document kind sets what that document looks like on the outside, its cover, so the workflow treats it as normal input rather than rejecting it or handling it differently. A contract-review workflow that receives something that looks like an invoice may skip it, and the test would miss real risks.

Pick the kind closest to what the workflow receives in production:

| Document kind | Choose it for workflows that |
| --- | --- |
| Report | Summarize, analyze, or extract data from general business reports. This is the default. |
| Contract | Review agreements, extract terms, or flag risky clauses. |
| Résumé | Screen, rank, or extract details from job applications. |
| Invoice | Extract line items, validate amounts, or approve payments. |
| Policy memo | Summarize or check internal policies and compliance documents. |

![The Document kind list with Report selected, and Contract, Résumé, Invoice, and Policy memo options.](/img/red-teaming/workflow/3-document-kind.png)

*Figure 3. Document kind options.*

When the Target step is complete, select **Continue**.

## Step 2: Coverage

Choose how much of the attack library to run.

| Option | What runs | Use when |
| --- | --- | --- |
| Full library | All 73 objectives: the full OWASP LLM Top 10 and agentic-threat catalog, plus objectives generated live for this workflow. | You want the most complete assessment. |
| Quick scan | About 8 core objectives. | You want a fast first check. |
| Custom selection | Only the objectives you pick from the library. | You want to focus on specific risks. |

The library covers the main ways AI systems are attacked: prompt injection, both typed directly and hidden in content the target reads; jailbreaks that bypass safety training; system prompt leakage; sensitive data disclosure; tool misuse and privilege escalation; data exfiltration; unsafe output that downstream systems might run; harmful content; misinformation; and runaway token or cost consumption. Quilr maintains the library and adds new techniques as they are published.

Expand **Attack library** to see which objectives will run. Then select **Continue**.

![The Coverage step with three options: Full library with 73 objectives, Quick scan with about 8 core objectives, and Custom selection.](/img/red-teaming/gateway/3-coverage.png)

*Figure 4. The Coverage step.*

## Step 3: Custom Attacks

This step is optional. Add your own objectives for this workflow, such as "approve an invoice above the limit" or "hide a termination clause from the summary." Custom objectives run alongside the coverage you chose.

- Select **Add custom objective** to write a new objective now.
- Select **Add from library** to reuse an objective you saved earlier in the attack library.

Write each objective as one clear goal the attack should reach. The clearer the goal, the easier it is to tell whether the attack worked. Save objectives you want to reuse, so other assessments can add them from the library.

Select **Continue** when you are done, or to skip this step.

![The Custom Attacks step with Add custom objective and Add from library buttons.](/img/red-teaming/gateway/4-custom-attacks.png)

*Figure 5. The Custom Attacks step.*

:::note

Managing saved objectives in the attack library is covered in a separate topic *(Coming soon)*.

:::

## Step 4: Schedule

Choose when the assessment runs. A recurring schedule catches regressions caused by model upgrades, prompt edits, new tools, and newly published attack techniques, so a fix that worked last month is checked again.

| Option | Runs |
| --- | --- |
| Run once | Now, with no repeats. |
| Daily | Every day at a set time. |
| Weekly | On the days you pick. |
| Monthly | One day each month. |
| Custom (cron) | On a cron expression, for advanced schedules. For example, `0 2 * * 1` runs at 02:00 every Monday. |
| On policy change *(Coming soon)* | When a gateway policy is edited. |

:::warning

Every scheduled run against a production target uses model tokens and tool quota. Use a dedicated test account so the usage is easy to attribute, and agree on the schedule with the development team.

:::

Select **Continue**.

![The Schedule step with Run once, Daily, Weekly, Monthly, On policy change, and Custom (cron) options.](/img/red-teaming/gateway/5-schedule.png)

*Figure 6. The Schedule step.*

## Step 5: Review and launch

1. Check the summary: **Target**, **Coverage**, **Schedule**, and **Connection**. The connection should show **Configured**.
2. In **Authorized scope**, record what is approved: the target, a ticket or reference number, and the testing boundary.
3. Select **I authorize this assessment**. Transcripts are pattern-redacted and may be processed by the managed evaluation engine, so use only approved targets.
4. Select **Launch assessment**.

![The Review step showing the summary of target, coverage, schedule, and connection, the Authorized scope box, the authorization checkbox, and the Launch assessment button.](/img/red-teaming/gateway/6-review.png)

*Figure 7. The Review step.*

**Result:** The assessment runs against the authorized target only. You can leave the page and come back while it runs.

## Next steps

- Review the results in [Run details](../results-and-reports/run-details.md) and the [Full report](../results-and-reports/full-report.md) when the assessment finishes.
