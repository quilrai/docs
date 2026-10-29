---
sidebar_position: 1
sidebar_label: "Changelog"
sidebar_custom_props:
  icon: ClipboardList
description: "What changed in Red Teaming, newest first."
---

# Red Teaming Changelog

What changed in Red Teaming, newest first.

## Detect finds your agent's API and sign-in (2026-10-29)

- Paste a web page or a bare host and **Detect** follows the host's own leads to the agent's API: A2A agent cards, OpenAI plugin manifests, OpenAPI and Swagger documents, OpenAI-compatible `/v1/models` listings, the scripts on the page, and common chat paths
- It fills in the request body and the reply field, and reads streamed (`text/event-stream`) replies
- **Other endpoints found** lists the rest of what it found; **Detect this one** tries another endpoint on the same host
- Detect reads how the API signs callers in (its sign-in challenge, OpenAPI security schemes, OAuth and OpenID Connect metadata) and pre-fills the most likely method, saying where it came from. Methods it can't use, such as NTLM, AWS request signing or SSO, show a warning instead
- New sign-in methods: API key in a header or the query string, HTTP Basic, and a sign-in form that keeps its session cookie, with optional anti-CSRF token support
- Discovery only reads from the host you pasted, with at most 30 requests in 45 seconds, and sends one test message to the endpoint it picks
- Details: [Connect your agent](../assessments/agentic-red-teaming#01-connect-your-agent)

## Run page coverage panel (2026-10-29)

- The **Standards & Framework Coverage** panel shows how many test cases passed out of the total, for example **Tests passed 12/14**
- Framework cards use the same icon tiles as the **New assessment** cards
