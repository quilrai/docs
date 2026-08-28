---
sidebar_position: 24
sidebar_custom_props:
  icon: FileText
---

# PDF Editor

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">READ AND EDIT PDFS</span><h2>A document in, a finished PDF back.</h2><p>Twenty tools for inspecting, searching, OCRing, and editing PDFs - no server, no credential, no upstream call.</p></div>

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

The document is uploaded through the MCP's own page rather than the chat attachment, because the protocol has no way to pass file bytes to a remote MCP server. See [PDF Editor setup](../mcp-gateway/mcp-provider-setup/pdf-editor) - there's nothing to configure, just enable it.
