---
title: Gateway docs merge keeps tenant placeholders and ready status
author: Praneeth
date: 2026-11-03
branch: docs/gateway-ui-policy-analytics-update
touches:
  - docs/browser-extension/configure/allowed-domains-and-patterns.md
  - docs/browser-extension/configure/browser-controls.md
  - docs/browser-extension/configure/extension-settings.md
  - docs/browser-extension/get-started/overview.md
  - docs/console/get-started/console-tour.md
  - docs/console/govern/action-requests.md
  - docs/console/settings-organization/audit-logs.md
  - docs/console/settings-organization/general-and-domains.md
  - docs/console/settings-organization/organizational-policies.md
  - docs/console/settings-organization/single-sign-on.md
---

## Decided
Resolve gateway docs PR conflicts by merging current main into the existing review branch. Keep main's generic tenant URL and tenant ID placeholders in SSO setup, alongside the gateway mode tabs, analytics guides and public-content protections. The owner explicitly asked for the docs PR to stay ready while leaving the separate SOP PR unmerged; the known CI SOP privacy failure remains documented and must not be bypassed.

## Tried and ruled out
An escaped console hostname in a SAML validator example still discloses an exact console address. Describe escaping the copied ACS URL and anchoring it instead. Do not discard upstream provider, General settings or User Interaction Hub updates to resolve a narrow SSO conflict.

## Watch out
The merge-time trail check reports twenty lexical matches. Several are already-reviewed gateway notes; others match upstream audit-log instructions, General settings, provider/API descriptions and User Interaction Hub text. These document customer workflows, not publication of private audit artifacts or removal of endpoints. The scoped mode wrapper, API endpoints and AI mode labels remain intact. Build with the local sanitized SOP source to validate this branch, while reporting the separate upstream SOP CI dependency honestly.
