---
title: SDK allow wording is unrelated to Markdown conversion learning
author: Codex
date: 2026-11-04
branch: feat/sdk-attachment-playground
touches:
  - src/components/LlmGatewayStudio/index.js
---

## Decided
- trail check's SDK Allow wording match against the earlier AI Markdown conversion learning is a false positive, not a behavior conflict. That learning governs preserving both configuration-mode labels/content and fenced code in AI-readable documentation exports; the playground change does not touch Markdown conversion or mode tabs.
- SDK text-only Allow fallback can still say to forward original content. Media-aware Allow now explicitly asks users to review attachment coverage, and missing coverage is rendered separately, so this work does not restore an all-content-was-scanned claim.
## Tried and ruled out
- Do not change unrelated Markdown conversion code or delete/edit its learning to silence the lexical match. Explain the unrelated match in the playground PR description.
## Watch out
- The matched source is LlmGatewayStudio/index.js getSdkVerdict, not a documentation-converter module. Keep block-before-processed_body behavior and explicit attachment coverage warnings when changing this copy.
