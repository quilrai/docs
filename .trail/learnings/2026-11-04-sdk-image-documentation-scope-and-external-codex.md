---
title: SDK image documentation scope and external build validation
author: Codex
date: 2026-11-04
branch: docs/sdk-attachment-scanning
touches:
  - docs/llm-gateway/apps-and-providers/sdk-mode.md
  - docs/llm-gateway/protect/attachment-scanning.md
  - docs/llm-gateway/get-started/integration-guide.md
  - docs/integrations/pull-ai-usage-and-inventory/truefoundry.md
---

## Decided
- Approved scope: update existing image/attachment reference, SDK and TrueFoundry guides plus crosslinks. Keep API examples in SDK/integration guides and the attachment reference conceptual. Separate docs/playground draft PRs publish after backend deployment.
- Normal scanning was already documented by docs PR82. New docs describe embedded data URL parity, explicit SDK direction, request-only/JSON boundaries, per-file coverage and processed_body for rewritten extension fields.
## Tried and ruled out
- Gitless external Docusaurus builds need GIT_DIR for read-only source Git metadata and GIT_WORK_TREE for the external copy, because sitemap generation reads last-update dates.
- Exclude generated build only at the source root: recursive build ignores omit legitimate docs/workflow-agents/build and create false broken links. Recopying existing AGENTS.md symlinks also needs care.
## Watch out
- Four trail-check conflicts are lexical false positives: no required TrueFoundry endpoint was removed; user roles in API examples are not provider-setting edits; result fields do not change mode-tab behavior; changelog text does not remove anchors/redirects. Include this rationale in the PR description rather than weakening checks.
- Independent reviewer verified all seven pages, ran both new Python examples against local stubs and checked image/PDF parsing. Public product wording and existing required endpoints/heading IDs are retained.
