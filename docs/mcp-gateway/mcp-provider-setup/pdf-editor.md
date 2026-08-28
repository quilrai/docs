---
sidebar_position: 19
sidebar_custom_props:
  icon: FileText
---

# PDF Editor

**PDF Editor** is a QuilrAI-built MCP that reads, searches, OCRs, and edits PDF documents, then hands back a finished file. Like [SketchIt](./sketchit), there is no OAuth app, Client ID, Client Secret, or API key to create - PDF Editor is enabled, not connected. It has no upstream service and no credential to configure.

Documents reach the server through its own upload page rather than through the chat attachment, because the Model Context Protocol has no mechanism for a client to hand file bytes to a remote MCP server. See [Getting A Document In](#getting-a-document-in) below.

See [Quilr-Provided MCPs: PDF Editor](../../quilr-provided-mcps/pdf-editor) for when to use it instead of your assistant's built-in PDF reading.

## What This MCP Can Do

| Capability | Examples | Access |
|------------|----------|--------|
| Document intake | Browser upload with a short claim code; direct fetch when the client supplies a file reference | Write |
| Structure inspection | Compact page manifest - dimensions, style catalog, text blocks, and a per-page flag for pages that need OCR | Read only |
| Text search | Case-insensitive search across a page range, returning stable block IDs for editing | Read only |
| Page rendering | Full-page or single-region PNG renders for visual verification | Read only |
| OCR | Scanned pages read with per-word text, bounding boxes, and confidence scores, plus a page mean and a list of low-confidence words | Read only in effect |
| Text editing | Batched replace and delete, redrawn on the original baseline at the original size, colour, and embedded font | Write |
| Text insertion | New text at an absolute position, with size, colour, bold, italic, monospaced, and multi-line support | Write |
| Metadata | Read and change title, author, subject, keywords, creator, and producer; clear a field to strip it before sharing | Write |
| Watermarks and stamps | Text or an uploaded image across chosen pages, with position, opacity, rotation, and scale; behind the content as a watermark or on top as a stamp | Write |
| Form filling | List and fill real AcroForm fields, keeping them as fields rather than flattening them to drawn text | Write |
| Image extraction | Per-page image inventory with format, dimensions, size, and placement | Read only |
| Undo and export | Revert all unexported edits, or export the finished PDF as a download | Write |

The MCP provides 20 tools. The original upload is never modified in place - every edit applies to a working copy, so a bad edit is reverted rather than re-uploaded.

:::note
PDF Editor makes no LLM calls and contacts no third-party service. The only outbound request it can make is downloading an attached file from an allowlisted host when the client supplies one.
:::

## Getting A Document In

The Model Context Protocol has no way for a client to pass file bytes to a remote MCP server, and passing a PDF as base64 text through the model corrupts it - a 37 KB file is roughly 49,000 characters the model would have to reproduce exactly. PDF Editor therefore uses an out-of-band upload:

<StepFlow
  steps={[
    {label: 'Ask', items: ['The agent returns an upload link']},
    {label: 'Upload', items: ['You drop the PDF in your browser', 'Bytes go straight to the server']},
    {label: 'Claim', items: ['You paste the short code back', 'The agent receives a document ID']},
    {label: 'Work', items: ['Inspect, search, OCR, edit', 'Export the finished PDF']},
  ]}
/>

The claim code is single-use and expires after 30 minutes. The upload page also accepts PNG, JPEG, GIF, BMP, and WebP images, which become stamp assets for watermarking rather than documents.

Where a client passes a file reference for a chat attachment, the agent can skip the upload page entirely. Support for this varies by client, and ChatGPT custom connectors do not currently provide it, so the upload page remains the reliable path.

## Before You Start

There is nothing to prepare. PDF Editor needs no account, no API key, and no OAuth consent - if it's available in your MCP Store, it's ready to use.

Check the document you intend to edit against these limits:

| Limit | Default |
|---|---|
| File size | 25 MB |
| Page count | 200 |
| OCR pages per call | 10 |
| Edits per call | 50 |
| Document retention | 24 hours |
| Claim code lifetime | 30 minutes |

## Enable PDF Editor

1. Open **PDF Editor** from the MCP Store.
2. Add it to your agent - there is no credential prompt.
3. Start with the verification request below.

If **PDF Editor** is not available in your MCP Store, contact your QuilrAI administrator.

## Verify The Connection

Ask for a document to work on:

```text
Using PDF Editor, I want to edit a PDF.
```

The agent should return an upload link. Open it, drop in a PDF, and paste the short code back. Then confirm the document was read correctly:

```text
Summarize what's in this PDF, page by page.
```

Finally, make an edit and export it:

```text
Find the total on page 1, correct it, and give me the finished PDF.
```

The export should come back as a downloadable file, not a description of one.

## Use It Effectively

- Let the agent inspect the document before editing. The manifest is compact by design, so this costs far less than reading full pages, and it reports which pages need OCR.
- Collect every change into one edit request. Editing a page invalidates that page's block IDs, so a single batched call is both cheaper and more reliable than several sequential ones.
- Keep the document ID for the whole task. It is the only handle to the document; losing it means uploading again.
- Ask for a rendered page only when the layout matters. A single region can be rendered instead of a whole page when checking one edit.
- Check OCR confidence before trusting a scanned figure. Words scoring under 60 are reported separately; ask for a rendered image of that area to read them visually.
- Say when a replacement should be centred. PDFs do not record text alignment, so a table cell keeps its original left edge unless centring is requested.
- Use "revert my edits" rather than re-uploading if an edit goes wrong.

## Security And Handling

- **Active content is removed on upload.** Every PDF is rebuilt from its pages before it is stored, dropping embedded JavaScript, auto-run actions, launch and remote-target actions, and embedded files. What was removed is reported back.
- **Hyperlinks and annotations are dropped** as part of that rebuild, because they are what carry per-page actions. Form fields are preserved and remain fillable.
- **Documents are reachable only by their ID.** Each document gets an unguessable identifier, there is no way to list documents, and one conversation cannot reach another's file.
- **Documents expire.** Uploads, edits, and exports are deleted after 24 hours.
- Encrypted or password-protected PDFs are not supported.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| The agent asks for an upload link every time | The client cannot pass chat attachments to MCP tools | Expected on ChatGPT custom connectors; use the upload page. |
| `not found for document_id` | The ID is wrong, or the document expired after 24 hours | Upload the document again to get a fresh ID. |
| `Claim code is not valid` | The code was already used, expired, or mistyped | Upload again for a new code; each code works once and lasts 30 minutes. |
| `block_id not found` | The page was edited, so its block IDs changed | Ask the agent to search the page again before editing; batch all edits into one call. |
| Replacement text overlaps the content beside it | The new text is wider than the text it replaced | Shorten the replacement, or ask for it to be shrunk to fit. |
| Replaced text looks slightly different | The original font is not embedded in the document, so the closest standard face was used | Expected for documents built with standard fonts; the size, colour, and position still match. |
| OCR returns little or nothing | The page is blank, very low resolution, or in an uninstalled language | Ask for a higher OCR resolution, or check which languages are available. |
| A stamp image is rejected | The file is not a supported raster image | Upload the stamp as PNG, JPEG, GIF, BMP, or WebP; SVG is not accepted. |
| `exceeds the 25 MB limit` or `exceeds the 200 page limit` | The document is larger than the service allows | Split the document and work on the relevant part. |

## References

- PDF Editor's source, full tool list, and configuration reference live in the `pdf_editor_mcp` service repository (`README.md`).
