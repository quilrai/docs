---
title: Gateway docs mode tabs privacy checks and upstream SOP release order
author: Codex
date: 2026-11-03
branch: docs/gateway-ui-policy-analytics-update
touches:
  - docs/console/govern/policy-engine.md
  - src/theme/Tabs/index.js
  - plugins/ai-markdown.js
  - scripts/check-public-content.js
---

## Decided
The owner approved implementing both gateway documentation updates and raising review requests. Dual configuration guides use synchronized native Classic settings and Policy Engine tabs; shared concepts stay outside and policy-only features have one flow. Dedicated analytics guides cover each gateway Insights section. Public console addresses are omitted, while required integration/API URLs remain. The earlier audit-only stage is complete and no longer limits implementation.

## Tried and ruled out
Keeping heading IDs alone does not preserve deep links into hidden tabs. The scoped Tabs wrapper reveals initial and same-page hash targets, accounts for hydration restoring the saved mode, and respects manual and accessibility activation. Its own automatic click must be distinguished explicitly; event.isTrusted rejects legitimate accessibility activations. AI Markdown conversion keeps both mode labels and contents, leaving fenced code unchanged.

## Watch out
The installation SOP is sourced from quilrai/installdocs. Merge its redacted-source change before the docs deployment pulls main. Never fix only the ignored synced copy. Public-content checks reject console addresses, identifying SOP examples and private audit artifacts; the Firefox add-on ID is a required technical identifier and must remain allowed. Review captures and raw OCR/provenance stay outside the published site and public review commits.
