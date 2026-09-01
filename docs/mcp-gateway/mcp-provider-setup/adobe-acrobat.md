---
sidebar_position: 23
sidebar_custom_props:
  icon: FileType
---

# Adobe Acrobat

There is no Adobe Acrobat MCP server. When a request for "Adobe Acrobat" means reading and editing PDF documents, the answer is the QuilrAI [PDF Editor](./pdf-editor) MCP, which needs no Adobe licence, no OAuth application, and no API key.

This page explains why Acrobat itself is unavailable, and what to check before you commit to PDF Editor in its place.

## Why Not Acrobat

Adobe publishes several MCP servers, but none of them expose Acrobat's PDF editing surface.

| Adobe MCP | What it covers | In the QuilrAI library |
|-----------|----------------|------------------------|
| Adobe for Creativity | Photoshop, Lightroom, Illustrator, Firefly, Premiere, Express, InDesign, Adobe Stock | No |
| Adobe AEM Cloud Service | Experience Manager content operations | Yes |
| Adobe Analytics | Analytics reporting | Yes |
| Adobe Customer Journey Analytics | Cross-channel analytics | Yes |
| Adobe Marketo Engage | Marketing automation | Yes |

Acrobat Sign has third-party MCP wrappers brokered through automation platforms, but those are e-signature workflows rather than document editing, and they are not first-party Adobe servers.

:::warning Do not register a third-party wrapper as "Adobe Acrobat"
A brokered Acrobat Sign wrapper routes documents through an intermediary that is neither Adobe nor QuilrAI. If a customer asks for Acrobat, resolve the request to one of the two options below rather than substituting a wrapper.
:::

So two distinct requests hide behind one name:

- **"We want to edit PDFs with an agent."** Use PDF Editor, below.
- **"We want to govern our Adobe estate."** Install the relevant Adobe library entry instead, and record which Adobe product is actually in scope.

## Use PDF Editor Instead

PDF Editor is a QuilrAI-built MCP for inspecting, searching, OCR'ing, and editing PDFs. It is designed so an agent works from a compact JSON manifest rather than raw PDF bytes or full-page images, and only pays for a rendered page image when it explicitly asks to verify something visually.

| Field | Value |
|-------|-------|
| MCP URL | `https://pdf-editor.mcp.quilr.ai/mcp` |
| Transport | Streamable HTTP |
| Auth | None. There is no upstream account to authenticate to |
| Client ID and Secret | Not required |
| Tools | 20 |

:::tip Check the library before you commit to it
Confirm the entry exists in the target tenant first. Open **Settings** > **AI Gateway** > **MCP Gateway** > **Library** and search for `PDF Editor`. If it is not listed, the catalogue entry has not been published to that environment. Ask the platform team to publish it rather than registering the transport URL by hand, so the tenant inherits the maintained configuration.
:::

Full tool reference, limits, and capability tables are on the [PDF Editor](./pdf-editor) page. What follows is the part that matters for a governance review.

## How Isolation Works

There is no authentication, so isolation is by capability token rather than identity.

- Every document receives a random 128-bit `document_id` prefixed `doc_`, which the caller passes to every subsequent tool call.
- Holding the id grants access. There is deliberately no way to list documents or look one up by filename, so a caller cannot reach a document whose id they were not given.
- Documents are pruned after the retention window, 24 hours by default.

:::note Why not session scoping
Session-based isolation cannot work here. The MCP transport permits stateless HTTP where each request is its own session, and some connectors behave exactly that way, so a document stored during one tool call is invisible to the next. Anything keyed on session identity is unusable for a server that has to work with real clients.
:::

## The Three Intake Paths, And What The Gateway Sees

This is the part to get right before you tell a customer that PDF uploads are inspected.

| Path | How it works | Do bytes traverse the gateway? |
|------|--------------|-------------------------------|
| `get_upload_link` then `claim_document` | The agent returns an upload URL, the user drops the file in a browser, the page shows a single-use code, the user pastes the code back | No. The browser POSTs bytes straight to the server |
| `fetch_document` | The client passes a file reference and the server downloads the file itself | No. The server fetches it directly |
| `upload_document` | A plain tool call carrying `data_base64` | Yes. Bytes arrive as a tool argument |

:::warning Two of the three intake paths bypass argument inspection
Guardrails that inspect tool arguments see document contents only on the `upload_document` path. On the browser-upload and fetch paths the bytes never appear in a tool argument, so intake is not an inspected path. What the gateway does see on every path is everything the agent subsequently reads back out of the document, which is where inspection, search, OCR, and extraction results are governed.

Set expectations accordingly, and do not describe upload as a DLP-inspected step.
:::

The browser-upload path is the reliable one. `fetch_document` depends on a client convention for passing file references that is not part of the MCP specification, is documented for one vendor's app platform rather than for plain custom connectors, and has been reported to degrade on some clients and on mobile. Treat it as an opportunistic fast path and expect users on most clients to take the upload link.

The browser-upload path also accepts PNG, JPEG, GIF, BMP, and WebP images, which are returned as an `asset_id` for use as a stamp.

## Built-In Safety Behaviour

- Active content is removed on upload, including JavaScript, auto-run actions, and embedded files.
- Hyperlinks and annotations are dropped. Form fields are preserved as fields.
- Documents are reachable only by their id, and expire after the retention window.
- Password-protected PDFs are not supported.

:::danger `fetch_document` is an SSRF primitive on an unauthenticated server
Because the server has no authentication, a tool that fetches arbitrary URLs would be an SSRF vector. `fetch_document` is constrained accordingly: HTTPS only, a host allowlist, every resolved IP must be publicly routable so loopback, private ranges, and cloud-metadata addresses are blocked, redirects are followed manually and revalidated at each hop, plus a streamed byte cap, a timeout, and a PDF magic-byte check.

If a deployment widens the host allowlist, that hardening is what it is trading away. Review the allowlist during any security assessment.
:::

## Built-In Reading Versus PDF Editor

Use the client's built-in PDF reading when the goal is to understand a document. It takes a file attachment directly in the conversation and needs no claim code. Use PDF Editor when the goal is a modified PDF as output.

## Recommended Rollout

1. Enable PDF Editor for a pilot smart group first. The write set is large: editing, insertion, metadata, watermarks, stamps, form filling, undo, and export all change the document.
2. If the customer only needs to read PDFs, disable the write tools with [Tools Management](../features/tools-management). Inspection, search, rendering, OCR, and image extraction are enough.
3. Decide who may upload. Intake is the least inspected step, so it deserves the tightest [Access Control](../features/access-control) group.
4. Tell users documents expire after 24 hours. This is not a document store.

## Verify It Works

```
Using PDF Editor, I want to edit a PDF.
```

The agent should return an upload link and, after you upload a short test document, a claim code exchange that yields a document id. Then confirm that:

- the page manifest matches the document you uploaded;
- a single text replacement appears in the exported file;
- the export downloads successfully;
- an intentionally password-protected file is rejected rather than silently failing.

## Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| `PDF Editor` does not appear in the library | The catalogue entry is not published to this environment | Ask the platform team to publish it. Do not register a guessed transport URL |
| The upload link works but the claim code is rejected | The single-use code expired, 30 minutes by default | Request a new link and upload again |
| A document id stops working mid-task | The retention window elapsed | Re-upload. Retention is not configurable per tenant |
| `fetch_document` never fires when a user attaches a file | The client does not implement the file-reference convention that path relies on | Use the browser upload link instead. This is expected on most clients |
| `fetch_document` refuses a URL | The host is not on the allowlist, or resolves to a non-public IP | Expected hardening. Use the browser upload path rather than widening the allowlist |
| A large file is refused | The document exceeds the size or page limit | Split the document before upload |
| OCR returns low confidence | The source is a poor-quality scan | Check the confidence scores before trusting extracted text |
| Edits partially applied | More edits were sent than the per-call limit allows | Batch edits into smaller groups |
| Hyperlinks missing from the export | Expected. Links and annotations are dropped on upload | Note the limitation. Form fields are the exception and are preserved |

## Security Notes

- There are no credentials in this integration. If someone asks for a Client Secret or API key for PDF Editor, the server was registered incorrectly.
- Do not describe intake as a DLP-inspected path. Inspect what comes back out of the document instead.
- Keep the write tools disabled for any group that only needs to read documents.
- Treat exported PDFs as new copies of the source data, subject to the same handling rules as the original.
- A `document_id` is a bearer capability. Anyone who obtains one from a transcript can reach that document until it expires, so treat agent transcripts containing `doc_` identifiers as sensitive.

## References

- [QuilrAI: PDF Editor provider setup](./pdf-editor)
- [QuilrAI: PDF Editor tool reference](../../quilr-provided-mcps/pdf-editor)
- [QuilrAI: Quilr-provided MCPs overview](../../quilr-provided-mcps/overview)
- [QuilrAI: Tools Management](../features/tools-management)
- [QuilrAI: Access Control](../features/access-control)
