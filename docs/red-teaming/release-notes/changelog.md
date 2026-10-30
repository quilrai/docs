---
sidebar_position: 1
sidebar_label: "Changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "What changed in Red Teaming, newest first."
---

# Red Teaming Changelog

What changed in Red Teaming, newest first.

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
- Details: [Connect your agent](../assessments/agentic-red-teaming#01-connect-your-agent)

## Pass rate by framework on the run page (2026-10-29)

- Each framework card on the **Standards & Framework Coverage** panel now shows the pass rate of the run's tests under that framework: green when they passed, red when they failed. A test that maps to several controls counts once, and tests that errored are left out
- A large **Overall pass rate** ring sits beside the framework cards
- The panel header shows how many test cases passed out of the total, for example **Tests passed 12/14**
- The line under each ring shows how much of the framework the run reached, for example **7 / 18 techniques tested**. A **Quick scan** reaches less than the **Full library**
- Framework cards use the same icon tiles as the **New assessment** cards
- Details: [Reading a report](../get-started/reading-a-report)

## AI Workflow assessments (2026-10-29)

- The **AI Workflow** card on **New assessment** can now be started: test a document, image or structured-data workflow that processes inputs and returns a result or takes an action
- **Test connection** checks the workflow endpoint before you launch
