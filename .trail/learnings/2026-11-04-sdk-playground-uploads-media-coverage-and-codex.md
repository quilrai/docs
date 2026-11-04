---
title: "SDK playground uploads, media coverage and module resolution"
author: Codex
date: 2026-11-04
branch: feat/sdk-attachment-playground
touches:
  - src/components/LlmGatewayStudio/index.js
  - src/components/LlmGatewayStudio/SdkAttachments.js
  - src/components/LlmGatewayStudio/sdkAttachments.mjs
  - scripts/test-sdk-attachments.mjs
---

## Decided
- SDK-only playground file selection stays in React memory, becomes inline image_url/file user-message parts, and sends only when Run is clicked. Text and manually edited Messages stay flexible; files plus Response or JSON-value mode block with an explicit mode message rather than silently dropping files. Empty Text plus files supports image-only checks.
- Attachment results separate scan evidence from allow/redact/block, including missing metadata for uploaded or manually pasted media. A conservative iterative input hint detects blocks/data URLs without decoding or serializing bytes; JSON-value/Response/token-saving opt out. No settings, URL fetching or persistence are added.
- Display and Python/JS snippets prefer processed_body only after block handling. Byte-heavy content is compacted for visual previews while copied requests and actual fetch payloads retain complete bytes. Playground uses 20 MiB/file, 50 MiB total and 20-file browser limits, independent of potentially lower app limits.
- Keep this as a separate draft playground PR held until backend SDK attachment scanning is deployed; normal Chat/Responses/Anthropic upload UI is outside scope.
## Tried and ruled out
- SSR tests alone missed a production resolver failure on macOS: extensionless import ./SdkAttachments resolved the similarly named sdkAttachments.mjs helper before SdkAttachments.js because Docusaurus prefers .mjs. Import the JSX module with explicit .js and keep the enhanced-resolve regression that verifies actual React exports.
- Copytree with a global build exclusion removed legitimate docs/workflow-agents/build pages. Exclude generated directories only at source root; all generated build output lives in the external scratch directory. Preserve Git last-update lookups via GIT_DIR/GIT_WORK_TREE for gitless build sources.
## Watch out
- SDK JSON is explicit JSON-value mode, never a full API request envelope; JSON files selected as attachments are ordinary file blocks in Text/Messages mode.
- Unknown/missing attachment coverage must stay visible even on HTTP 200 Allow. Animated images and multipage TIFF cover only first frame/image; SVG extracts text. Attachment classifications need enabled Image Risks data types.
- 16 targeted behavioral tests cover file reading/payloads, mode guards, source preservation, previews, missing/incomplete coverage, snippet execution, SSR results and actual production module resolution. Browser QA must stub gateway requests and block external network; never send files/keys to live gateways.
