---
sidebar_position: 24
sidebar_custom_props:
  icon: FileText
---

# PDF Editor

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">READ AND EDIT PDFS</span><h2>Change a PDF without it looking changed.</h2><p>Replace text in the document's own font and position, fill forms, stamp watermarks, and read scans - then get the file back. Nothing to authorize.</p></div>

PDF Editor is a Quilr-built MCP that reads, searches and edits PDF documents, including scanned ones, and hands back a finished file. There is no OAuth app, client ID, client secret or API key: PDF Editor is enabled, not connected.

## Tools

The MCP provides 20 tools. The original upload is never modified in place. Every edit applies to a working copy, so a bad edit is reverted rather than re-uploaded.

| Capability | Examples | Access |
|------------|----------|--------|
| Document intake | Browser upload with a short claim code; direct fetch when the client supplies a file reference | Write |
| Structure inspection | Compact page manifest: dimensions, style catalog, text blocks, and a flag for pages that need OCR | Read only |
| Text search | Case-insensitive search across a page range, returning block IDs for editing | Read only |
| Page rendering | Full-page or single-region PNG renders for visual checks | Read only |
| OCR | Per-word text, bounding boxes and confidence scores, plus a page mean and a list of low-confidence words | Read only |
| Text editing | Batched replace and delete, redrawn on the original baseline at the original size, colour and embedded font | Write |
| Text insertion | New text at a position, with size, colour, bold, italic, monospaced and multi-line support | Write |
| Metadata | Read and change title, author, subject, keywords, creator and producer; clear a field to strip it | Write |
| Watermarks and stamps | Text or an uploaded image across chosen pages, with position, opacity, rotation and scale; behind the content as a watermark or on top as a stamp | Write |
| Form filling | List and fill real AcroForm fields, which stay fillable | Write |
| Image extraction | Per-page image inventory with format, dimensions, size and placement | Read only |
| Undo and export | Revert unexported edits, or export the finished PDF as a download | Write |

PDF Editor makes no LLM calls and contacts no third-party service. Its only outbound request is downloading an attached file from an allowlisted host when the client supplies one.

### Getting a document in

MCP has no way for a client to pass file bytes to a remote server, and passing a PDF as base64 text through the model corrupts it. PDF Editor uses an upload page instead:

<StepFlow
  steps={[
    {label: 'Ask', items: ['The agent returns an upload link']},
    {label: 'Upload', items: ['You drop the PDF in your browser', 'Bytes go straight to the server']},
    {label: 'Claim', items: ['You paste the short code back', 'The agent receives a document ID']},
    {label: 'Work', items: ['Inspect, search, OCR, edit', 'Export the finished PDF']},
  ]}
/>

The claim code works once and expires after 30 minutes. The upload page also accepts PNG, JPEG, GIF, BMP and WebP images as stamp assets. Some clients can pass a chat attachment as a file reference and skip the upload page; ChatGPT custom connectors currently cannot.

### Limits and handling

| Limit | Default |
|---|---|
| File size | 25 MB |
| Page count | 200 |
| OCR pages per call | 10 |
| Edits per call | 50 |
| Document retention | 24 hours |
| Claim code lifetime | 30 minutes |

- **Active content is removed on upload.** Each PDF is rebuilt from its pages, dropping embedded JavaScript, auto-run, launch and remote actions, and embedded files. Hyperlinks and annotations are dropped too; form fields are kept. What was removed is reported back.
- **Documents are reachable only by ID.** IDs are unguessable, documents cannot be listed, and one conversation cannot reach another's file.
- **Documents expire** after 24 hours, including edits and exports.
- Encrypted or password-protected PDFs are not supported.

## Setup

There is nothing to prepare: no account, no API key and no OAuth consent.

1. Go to **Settings > AI Gateway > MCP Gateway**, click **Library** and find **PDF Editor**.
2. Click **Install**. There is no credential prompt.
3. Make sure the tools are enabled in [Tool visibility](../protect/tool-visibility).

If **PDF Editor** is not in your Library, contact Quilr.

### Verify

```text
Using PDF Editor, I want to edit a PDF.
```

The agent should return an upload link. Upload a PDF, paste the code back, then ask:

```text
Find the total on page 1, correct it, and give me the finished PDF.
```

The export should come back as a downloadable file, not a description of one.

### Use it effectively

- Let the agent inspect the document before editing. The manifest is compact and reports which pages need OCR.
- Collect every change into one edit request. Editing a page invalidates its block IDs.
- Keep the document ID for the whole task; losing it means uploading again.
- Check OCR confidence before trusting a scanned figure. Words scoring under 60 are reported separately.
- Say when a replacement should be centred. PDFs do not record alignment.
- Ask to "revert my edits" rather than re-uploading.

### Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| The agent asks for an upload link every time | The client cannot pass chat attachments to MCP tools | Expected on ChatGPT custom connectors; use the upload page. |
| `not found for document_id` | Wrong ID, or the document expired | Upload again. |
| `Claim code is not valid` | Code already used, expired or mistyped | Upload again for a new code. |
| `block_id not found` | The page was edited, so block IDs changed | Search the page again; batch all edits into one call. |
| Replacement overlaps nearby text | The new text is wider than the old | Shorten it, or ask for it to be shrunk to fit. |
| Replaced text looks slightly different | The original font is not embedded | Expected; size, colour and position still match. |
| OCR returns little | Blank, low-resolution or unsupported-language page | Ask for a higher OCR resolution, or check which languages are available. |
| A stamp image is rejected | Not a supported raster image | Use PNG, JPEG, GIF, BMP or WebP; SVG is not accepted. |
| `exceeds the 25 MB limit` or `exceeds the 200 page limit` | Document too large | Split the document. |

## Compared with built-in PDF reading

<McpDecision
  officialTitle="Use built-in PDF reading to answer questions"
  official="Your assistant can already read an attached PDF. Use that when the goal is understanding the document - summarizing it, answering questions about it, or pulling figures out of it."
  officialPoints={['Nothing to enable; just attach the file', 'Best for one-off reading and Q&A']}
  quilrTitle="Choose PDF Editor to change the document"
  quilr="Use PDF Editor when the output is a modified PDF rather than an answer: corrected text, a watermark, filled form fields, or stripped metadata."
  quilrPoints={['Returns an edited PDF, not a description', 'Preserves the original font, size, and layout']}
  verdict="If you want to know what a PDF says, attach it. If you want a changed PDF back, use PDF Editor."
/>

| Capability | Built-in PDF reading | PDF Editor |
|---|:---:|:---:|
| Summarize and answer questions about a document | ✅ | ✅ |
| Return a modified PDF file | - | ✅ |
| Replace or delete text in place, keeping font and layout | - | ✅ |
| Reuse the document's own embedded font for replacements | - | ✅ |
| Watermarks and image stamps across pages | - | ✅ |
| Fill real form fields, still fillable afterwards | - | ✅ |
| Read and edit document metadata | - | ✅ |
| OCR with per-word confidence scores | Varies | ✅ |
| Extract embedded images | - | ✅ |
| Strip embedded JavaScript and auto-run actions | - | ✅ On upload |
| Undo edits without re-uploading | - | ✅ |
| Zero setup - nothing to self-host or authorize | ✅ | ✅ |
