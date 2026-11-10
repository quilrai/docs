---
sidebar_position: 1
sidebar_label: "Changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "What changed in Red Teaming, newest first."
---

# Red Teaming Changelog

What changed in Red Teaming, newest first.

## Drift & Bias alerts can go to Splunk and Datadog (2026-11-10)

- The Splunk and Datadog integrations can now be set up and receive Drift & Bias alerts. Splunk uses an HTTP Event Collector URL and token, and Datadog uses your site and an API key
- **Red Teaming alerts** starts on for both. **Test connection** sends a marked test event so you can confirm it arrives
- Each alert arrives as one event or log with the model, the rule that fired, the observed value and the limit

## Drift & Bias runs in Export Center (2026-11-10)

- Export Center has a new source, **Drift & Bias runs**: one row per run with its model, question set, status, bias-free score and interval, baseline comparison, drift result and each group's results
- Filter by status, question set, model, baseline or drift, and export as Excel or JSONL, once or on a schedule, to keep bias test results as audit evidence
- Replies to the test questions are never exported

## Drift & Bias alerts (2026-11-09)

- On the Drift & Bias **Alerts** tab, set an alert rule for each tested model: a **Minimum bias-free score**, the **Largest drop from the baseline**, and whether to alert when a run fails or ends incomplete. A drop only alerts when the drift test says the change is real
- Each finished run is checked against its model's rule. The **Alerts** tab lists every alert raised, with the score or drop that set it off, the limit, and whether it was delivered
- Alerts are sent to your Webhook, Slack and Microsoft Sentinel integrations. Turn on **Red Teaming alerts** in an integration's setup to receive them

## Drift & Bias: test how a model treats different groups, and whether that changes (2026-11-09)

- The new **Drift & Bias** page, under Red Teaming in the sidebar, tests how a text model from your model library treats gender, race and ethnicity, and age. Click **New run**, pick a model and a question set, and choose how many questions to send and how often to repeat each one
- Each run reports a **bias-free score** (the share of replies without biased opinions) with its 95% interval, plus each group's replies, refusals, accuracy and score, and the widest gap between groups
- Runs of the same model, question set and settings form a series. The first complete run becomes the series' **baseline**, and every later run is compared with it to show whether the score really changed (**Drifted**)
- **Overview** shows every model by group at a glance, **Runs** lists every run, and **Baselines** shows what each series is compared against. A run's page shows its replies with the judge's verdict on each, and **Run again** repeats it with the same settings
- A run that couldn't send or judge more than 10% of its questions is marked **Incomplete**. It's shown, but never used as a baseline

## Full report says Compromised instead of Breached (2026-11-05)

- On a run's full report, attacks that got through are now called **Compromised** instead of **Breached**: in the posture tallies, the warning above the findings, the **Compromised & partial** findings filter, each conversation's status and the guardrail check
- The PDF, the Markdown export and the full-report email use the same wording, for example **Confirmed compromises** and the **Compromises** column in the attack-technique table

## Framework rings average their categories again (2026-11-05)

- Each framework ring on a run's Standards & Framework Coverage panel is again the average pass rate of that framework's categories, the same rates shown in the **Categories** table, with each category counted equally. Tests under **Other** are still left out
- Since the 2026-11-03 change, rings counted each test once, so a run whose tests fell under every framework showed the same number on every card. Each framework now shows its own score
- The large ring is still the average of the framework rings

## Forward summary can email the full report (2026-11-05)

- In **Forward summary** on a run's page, tick **Email the full report instead of the summary** to send each email address the run's full report. It has the same content as the report's PDF: every finding with its evidence, the attack details and the recommended fixes
- Slack still gets the summary
- Unlike the summary, the full report can be read without signing in to the console, so send it only to people who should see attack details

## Full report text matches the run page (2026-11-05)

- Text on a run's full report now uses the same sizes and styles as the run page, so the two pages read alike. Small labels that were hard to read are larger, and the monospace font is kept for tool names, framework IDs, prompts and other code-like values
- The report's **PDF**, **Markdown** and **copy** buttons now match the console's other buttons

## Agent card renamed to AI App / Agent (2026-11-05)

- On the **Assessments** page, the first card in the **New assessment** row is now called **AI App / Agent**. It starts the same assessment as before

## Gateway-connected card removed from New assessment (2026-11-05)

- The **New assessment** row on the **Assessments** page now shows four cards: **Agent**, **AI Workflow**, **Model** and **MCP**. The **Gateway-connected** card is no longer shown
- Past Gateway-connected runs still appear under **Recent runs**, and you can still filter by them

## MCP scans can sign in to the server (2026-11-04)

- A live MCP scan can now sign in the same ways an agent assessment can: bearer token, API key (in a header or query parameter), username and password, OAuth client credentials, a login that returns a token, or a sign-in form's session cookie. Choose the method under **Sign-in** when you scan a live server. Credentials are used for that scan only and are never stored
- Add an optional **Access level**, such as "Read-only analyst", to say what the credentials should be allowed to do. The scan flags tools that go beyond it, such as write or delete tools a read-only account can reach
- When the scan signs in, it also checks that the server turns away a request with no credentials and one with a made-up credential. The report's new **Sign-in** section shows each result, and a server that accepts either gets a finding
- When a server turns the scan away, the report now says the server requires sign-in or refused the credentials, and lists how the server signs callers in, instead of showing a generic error

## Model scans say when a model was rate limited (2026-11-04)

- When a model from the QuilrAI catalog is rate limited during a scan, each affected test now says the model was rate limited instead of showing a generic error

## Back to assessments from a live run (2026-11-03)

- While an assessment is running, **Back to assessments** now returns to the **Assessments** page, where the run stays listed as **Running**, instead of the older runs list

## Back to run from the full report (2026-11-03)

- On the full report, **Back to run** now returns to the run page you opened it from, instead of the list of runs

## Framework rings count each test once, and a refreshed report (2026-11-03)

- Each framework ring on a run's Standards & Framework Coverage panel now shows the share of the run's tests that held, out of the tests that map to that framework, with each test counted once. Tests under **Other** are left out of the rings and still count in **Tests passed**
- The large ring is still the average of the framework rings
- On the full report, the security posture ring now fills with the safe share, so a clean **A** shows a full ring
- **Capabilities exercised** on the full report has new cards: each stat has an icon, a title and a one-line description, in one row on wide screens
- Section titles on the full report, such as **Severity breakdown** and **Tool exposure**, use the same bold heading as the rest of the page

## OWASP card subtitle shortened (2026-11-02)

- On a run's Standards & Framework Coverage panel, the OWASP card's subtitle now reads **LLM and Agentic**

## Framework rings show the run's pass rate (2026-11-02)

- Each framework ring on a run's Standards & Framework Coverage panel now shows the average pass rate of that framework's categories, matching the Categories table: CIS Controls categories at 72.7%, 50%, 80%, 100% and 100% show 81%
- The large ring is now **Average pass rate**, the average of the framework rings
- The count beside each ring still shows how much of the framework the run tested, for example **4 / 6 safeguards tested**

## Scheduled runs open their schedule and follow your timezone (2026-11-02)

- On the **Schedules** tab, click a run on **Next 7 days**, the **+N more runs** line, or the first run under **Runs in the next 24h** to open that schedule's settings, with its recent runs shown behind
- Schedules use the timezone set in **Settings → Display**: run times, the day view and the schedule editor all read in it and name it the way that page does
- Changing the timezone in **Settings → Display** moves your schedules to it and keeps their clock time: a daily 09:00 schedule still runs at 09:00 in the new timezone
- A schedule still set to another timezone is marked in the **Frequency** column, and saving it moves it to yours

## Schedule any agent or model (2026-11-02)

- WebSocket agents, voice agents and AI workflows can now run on a schedule, not only HTTP agents
- A single-model assessment has a **Schedule** step too; comparing several models still runs once
- **New schedule** on the **Schedules** tab lists saved WebSocket, voice and AI workflow assessments
- Voice agent schedules can be created now and are listed as **Waiting for scheduler support** until scheduled voice runs are available
- Gateway-connected assessments still run once

## Coverage rings match what was tested (2026-10-30)

- Each framework ring on a run's Standards & Framework Coverage panel now shows how much of that framework the run tested, matching the count beside it
- The large ring shows the average coverage across the frameworks
- The run's pass rate is still shown as Tests passed

## Detect AI workflows from a URL (2026-10-30)

- On a new AI Workflow assessment, paste the workflow's upload URL or host and click Detect, or choose Advanced / configure manually to fill in every setting yourself
- Detect reads the workflow's API description and uploads a harmless sample document to fill in the upload settings, including polling for workflows that run as jobs
- Check the filled-in settings, add the credential if the workflow needs one, then test and launch

## See how many runs are in progress (2026-10-30)

- The Recent runs list on the Red Teaming Assessments page shows how many runs are running right now
- Click the count to show only the running runs

## Forward a run's summary to Slack or email (2026-10-30)

- **Forward summary** on a run's page sends the pass rate, findings by severity and the top findings to a Slack channel, to email addresses, or both
- Each message links to the full results in the console, and people sign in to see them
- Nothing is saved: paste a Slack incoming-webhook URL and up to 10 email addresses each time

## Detect finds your agent's API and sign-in (2026-10-29)

- Paste a web page or a bare host and **Detect** follows the host's own leads to the agent's API: A2A agent cards, OpenAI plugin manifests, OpenAPI and Swagger documents, OpenAI-compatible `/v1/models` listings, the scripts on the page, and common chat paths
- It fills in the request body and the reply field, and reads streamed (`text/event-stream`) replies
- **Other endpoints found** lists the rest of what it found; **Detect this one** tries another endpoint on the same host
- Detect reads how the API signs callers in (its sign-in challenge, OpenAPI security schemes, OAuth and OpenID Connect metadata) and pre-fills the most likely method, saying where it came from. Methods it can't use, such as NTLM, AWS request signing or SSO, show a warning instead
- New sign-in methods: API key in a header or the query string, HTTP Basic, and a sign-in form that keeps its session cookie, with optional anti-CSRF token support
- Discovery only reads from the host you pasted, with at most 30 requests in 45 seconds, and sends one test message to the endpoint it picks
- Details: [Connect your agent](../configure-and-run/agent#step-1-target)

## Pass rate by framework on the run page (2026-10-29)

- Each framework card on the **Standards & Framework Coverage** panel now shows the pass rate of the run's tests under that framework: green when they passed, red when they failed. A test that maps to several controls counts once, and tests that errored are left out
- A large **Overall pass rate** ring sits beside the framework cards
- The panel header shows how many test cases passed out of the total, for example **Tests passed 12/14**
- The line under each ring shows how much of the framework the run reached, for example **7 / 18 techniques tested**. A **Quick scan** reaches less than the **Full library**
- Framework cards use the same icon tiles as the **New assessment** cards
- Details: [Reading a report](../results-and-reports/full-report)

## AI Workflow assessments (2026-10-29)

- The **AI Workflow** card on **New assessment** can now be started: test a document, image or structured-data workflow that processes inputs and returns a result or takes an action
- **Test connection** checks the workflow endpoint before you launch
