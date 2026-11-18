---
title: "Self-service docs: spliced OpenAPI entries and the self-service API page"
author: Praneethb
date: 2026-11-18
branch: docs/self-service-redesign
id: l-e2451674
scope: repo
status: active
src: agent
touches:
  - docs/console/settings-organization/smart-groups.md
  - docs/llm-gateway/api-reference/apps-and-credentials-api.mdx
  - docs/llm-gateway/api-reference/management-api.mdx
  - docs/llm-gateway/api-reference/users-api.mdx
  - docs/llm-gateway/release-notes/ux-changelog.md
  - docs/llm-gateway/self-service/admin-guide.md
  - docs/llm-gateway/self-service/developer-guide.md
  - docs/llm-gateway/self-service/overview.md
  - src/components/ManagementApi/index.js
  - src/components/ManagementPlayground/Apps.js
---

## Decided
- The self-service Management API routes live on their own page, docs/llm-gateway/api-reference/self-service-api.mdx. In the OpenAPI document they are tagged Users (profiles, exceptions, owners, usage) and Credentials (personal keys), so the Users and Apps-and-credentials pages narrow their ApiReference with paths (['/users'] and ['/apps/{app_name}/keys']) and ManagementApi/index.js sends any path containing "self-service" to self-service-api.
- static/openapi/llm-gateway-management-v1.json was updated by exporting the gateway's document (DataClassifier/scripts/export_management_openapi.py, run from a detached dev_main worktree with a throwaway venv) and splicing only the self-service paths, GET /apps and the SelfService*/App* schemas. The export also carried unrelated drift (management-admin health-alerts, Provider* schema changes); that was left out on purpose for the feature that owns it.
- The admin screens renamed the concepts (access plan, app template, model option, request, app owner) while the API and the developer portal keep profile, blueprint, tier and exception. The pages state the mapping once and use the screen names elsewhere.

## Watch out
- In personal-key mode the app's bare main key (with or without X-User-Email) and verified JWTs are still accepted, and a personal key stops when its owner loses Viewer access or is suspended (about a minute). Older docs said the opposite on both points.
- Keep the anchors other pages link to: overview#credential-modes, admin-guide#choose-a-credential-mode.
