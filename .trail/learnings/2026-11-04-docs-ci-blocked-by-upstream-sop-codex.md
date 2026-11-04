---
title: Docs CI blocked by unmerged upstream SOP redaction
author: Codex
date: 2026-11-04
touches:
  - scripts/check-public-content.js
  - scripts/sync-install-sop.js
---

## Decided
The owner clarified that installation docs do not need this check. Exclude the synced build/sop/ subtree from public-content validation, while keeping console-address checks on the rest of the site and root private-artifact checks. CLAUDE.md records this exception. This supersedes the earlier learning requiring upstream redaction before docs deployment.

## Tried and ruled out
Missing descriptions, Browserslist data age, and webpack dynamic-require messages are warnings. SOP builds pull quilrai/installdocs main at 2ae2f9e. Redaction PR https://github.com/quilrai/installdocs/pull/3 is CLOSED without merging; its existence does not mean main contains the fix. Confirmed in deployment runs 41860815284 and 41638831114 and PR run 41860524114.

## Watch out
The SOP exclusion applies only to the top-level build/sop/ directory. Keep the check active elsewhere. SOP content still comes from installdocs; do not patch its ignored synced copy. The installed graft CLI lacks the note command, so this learning was saved directly.
