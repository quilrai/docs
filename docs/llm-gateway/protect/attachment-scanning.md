---
sidebar_position: 1.5
sidebar_label: "Attachment scanning"
sidebar_custom_props:
  icon: FileText
description: "Scan request attachments for sensitive text and image risks, control allowed file types and limits, and monitor, remove or block files through app settings or the Policy Engine."
aliases: [attachments, document scanning, image scanning, OCR, scanned PDFs, image risks, payment card image, file uploads]
console_path: []
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Attachment scanning

Updated on 4 November 2026.

Check files sent with a model request before they reach the provider. The gateway extracts document text, reads text in images and scanned PDFs with OCR, and identifies image risks such as payment cards or ID documents. Your enabled data risks decide what to monitor, remove or block.

**Attachment scanning is off by default.** Turning it on does not change what the selected model can accept: the file format must still be supported by that model.

In [SDK Mode](../apps-and-providers/sdk-mode#images-and-documents-request-checks), the check runs without a model call. Your application uses the returned action and sanitized content before continuing.

<StepFlow steps={[
  { label: "Check the files", items: ["Detected type", "Size, count and PDF pages"] },
  { label: "Read and inspect", items: ["Document text and OCR", "Enabled Image Risks"] },
  { label: "Apply your rules", items: ["Monitor", "Strip or block"] },
  { label: "Record the outcome", items: ["Scan status", "Findings and action"] },
]} />

## Three kinds of protection {#three-kinds-of-protection}

| Protection | What it checks | Example |
|---|---|---|
| **Document text** | Text extracted from PDFs, documents, spreadsheets, presentations and text files, using your request-side data risks and custom detections. | Find an API key in a spreadsheet or personal data in a PDF. |
| **Read text in images (OCR)** | Text visible in an attached image or scanned PDF page, using the same enabled text detections. | Find a card number in a screenshot or a scanned invoice. |
| **Image Risks** | The visual content of an attached image, using the image types you enable. | Identify a payment-card photo even when its text is difficult to read. |

OCR and image classification answer different questions. An invoice containing a card number can trigger a text detection without being a **Payment Card Image**. A photo of a payment card can trigger that image type. Enable the protections your use case needs.

## Configure this control

Choose the mode used by your gateway. When the Policy Engine is on, published rules govern this control; classic values saved through **Edit anyway** apply only after the engine is disabled. See [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings).

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Where to configure it {#where-to-configure-it}

Open **Settings > AI Gateway > LLM Gateway > your app > Configure > Attachments**. The section includes **Scan attachments**, **Allowed files and limits**, **Scanning**, and **Images and OCR**. Choose the checks and click **Save settings**. Select text and image data types and their actions under **Security Guardrails**.

</TabItem>
<TabItem value="policy" label="Policy Engine">

### Attachment policies

Open **Govern > Policy Engine > LLM Gateway > Controls > Attachments**. Configure these sections:

| Section | What you choose |
|---|---|
| **Scanning** | Whether attachment scanning runs. |
| **File types** | Which file types are allowed, stripped or blocked. |
| **Size and count limits** | File size, total size, counts and page limits. |
| **Files that can't be scanned** | What happens when file content cannot be inspected. |
| **Text in images (OCR)** | How text in images and scanned pages is read. |

Start from a recipe or a section's add menu, choose **Applies to**, then **Save to draft**. The **Data & Adversarial Risks** control selects text/image data types and their actions. Test the rules before **Review & publish**. A saved classic switch does not override a published policy.

</TabItem>
</Tabs>

:::tip Image classification needs both controls
Turn on attachment scanning and **Classify images**, then enable at least one **Image Risks** type in Security Guardrails, or select that image data type in a Policy Engine detection rule. **Classify images** on its own does not check every image type.
:::

## Allowed files and limits {#allowed-files-and-limits}

File types are detected from their content, rather than trusting the file name. Each type can be **Allow**, **Strip** or **Block**. **Allow** lets the file proceed to the enabled scans; it does not exempt it from data-risk rules.

| Control | Default | What it means |
|---|---|---|
| **Scan attachments** | Off | Enables the attachment controls. |
| **File types** | Allow every type | Separate actions for Images, PDFs, Documents, Spreadsheets, Presentations, Text, CSV & code, Audio, Video, Archives and Other. |
| **Max file size (MB)** | 20 | Maximum size of one file. |
| **Max attachments per request (MB)** | 50 | Maximum combined attachment size in a request. |
| **Max new files per request** | 20 | Counts new attachments, rather than files resent from earlier turns. |
| **Max PDF pages** | 200 | Maximum pages in one PDF. |
| **When a size, count or page limit is broken** | Block | Monitor the violation, remove the affected attachment, or reject the request. |

Files resent in conversation history still count toward size limits and remain subject to type and page checks. Their content can still be scanned.

### Content the gateway can read {#content-the-gateway-can-read}

| File group | Supported content |
|---|---|
| PDFs | Text PDFs and, with OCR on, scanned pages. |
| Office documents | DOCX, DOC, XLSX, XLS, PPTX and PPT. |
| OpenDocument | ODT, ODS and ODP. |
| Other text documents | RTF, HTML, EML, plain text, CSV, JSON and code files. EML includes message headers and text parts; documents nested inside an email are not fully extracted. |
| Raster images | PNG, JPEG, WebP, GIF, BMP and TIFF support OCR and enabled visual image checks. See [Supported image formats](#supported-image-formats) for coverage and exclusions. |
| SVG | Markup text only. The drawing and embedded images are not read by OCR or checked by Image Risks. |

Audio, video, archives and unknown binary formats are not content-scanned. Their file-type controls still let you allow, remove or block them. Allowing a type does not make its content readable.

### Supported image formats {#supported-image-formats}

OCR reads text visible in an image. Image Risks classifies its visual content. These are separate checks: attachment scanning must be on, OCR requires enabled text detections, and image classification requires **Classify images** plus at least one enabled **Image Risks** type.

| Image format | OCR of visible text | Image Risks classification | Coverage |
|---|---|---|---|
| **PNG** (`.png`) | Supported | Supported | Attached raster image. |
| **JPEG** (`.jpg`, `.jpeg`) | Supported | Supported | Attached raster image. |
| **WebP** (`.webp`) | Supported | Supported | First frame only for animated WebP. |
| **GIF** (`.gif`) | Supported | Supported | First frame only; later animation frames are not scanned. |
| **BMP** (`.bmp`) | Supported | Supported | Attached raster image. |
| **TIFF** (`.tif`, `.tiff`) | Supported | Supported | First image only; later pages in a multi-page TIFF are not scanned. |
| **SVG** (`.svg`) | Not supported | Not supported | With document text extraction on, text in the SVG markup can be extracted and checked by enabled text detections. The drawing is not rendered. |
| **HEIC, HEIF and AVIF** (`.heic`, `.heif`, `.avif`) | Not supported | Not supported | Can be recognized as images, but cannot be decoded for these checks. |
| **Icons and cursors** (`.ico`, `.cur`) | Skipped | Skipped | Content scanning is skipped. |

The format is detected from file content, not just its extension or declared type. Supported formats remain subject to scan settings, size and pixel limits, and scanner availability. Very small images may be skipped.

:::note SVG text extraction does not scan the picture
SVG support is limited to text stored in the markup, such as text elements, titles and descriptions. It does **not** OCR text drawn as shapes, classify the rendered artwork, or inspect raster images embedded inside the SVG. An SVG containing a payment-card photo or a weapons illustration can therefore produce no Image Risks finding. A completed SVG text scan does not establish that its visual content was checked.
:::

When a requested scan needs to decode HEIC, HEIF or AVIF, the file follows the configured unreadable-file action rather than receiving a successful content scan.

### How attachments are recognized

Send the file content with the request. The gateway recognizes supported inline image and file blocks, as well as data URLs embedded in text. This includes text content parts, HTML, conversation history and tool-result text. Line-wrapped base64 in a data URL is supported. A bare base64 string in ordinary text is not assumed to be an image; recognized image/file fields can carry bare base64.

Request-side SDK checks use the same attachment discovery as proxy requests, including supported media in request extension fields. Caller metadata and tool-definition examples are not attachments. Response checks and the SDK's explicit structured-JSON mode do not run attachment scanning.

For payloads and application control flow, see [Send images and documents](../get-started/integration-guide#send-images-and-documents) and [SDK images and documents](../apps-and-providers/sdk-mode#images-and-documents-request-checks). The protection settings below apply to both proxy and SDK request scanning.

## Document text and OCR {#document-text-and-ocr}

**Extract document text** is on by default once scanning is enabled. The extracted text is checked with the request's enabled text data types, including applicable [custom detections](./custom-detections).

| **Read text in images (OCR)** | Behavior |
|---|---|
| **Off** | Does not read image text or scanned PDF pages. Document text extraction can still run. |
| **Images and pages without text** (default) | Reads attached images and PDF pages without a text layer. Other PDF pages use their existing text. |
| **Every page** | Also reads PDF pages that already have a text layer. This can take longer. |

OCR reads up to **20 pages per file**, separately from the configurable **Max PDF pages** limit. Across a request, up to **50,000 extracted characters** are sent to text detection. If work cannot finish or text remains beyond the scan limit, the scan is reported as incomplete; findings from the part that was scanned still apply.

### OCR scripts {#ocr-scripts}

**OCR scripts** defaults to **Every script**. Choose **Only these** to limit the writing systems read:

| Supported writing systems |
|---|
| Latin; Chinese & Japanese; Korean; Cyrillic; Arabic; Devanagari; Tamil; Telugu; Thai; Greek |

These are writing systems, rather than a guarantee for every language or image. Bengali OCR is not supported. Text in an unsupported or excluded script, unreadable text, or text made too small by resizing can result in a partial scan.

## Image Risks {#image-risks}

**Classify images** checks the visual content of raster images attached to requests. It is on by default within the attachment settings, but runs only while attachment scanning is on and an image type is enabled. **Image Risks** is off by default.

| Image type | What it identifies |
|---|---|
| **Nudity or Sexual Image** | Images with nudity or sexual content. |
| **Weapons Image** | Images depicting weapons. |
| **Human Face Image** | Images depicting a human face. |
| **ID Document Image** | Images depicting identity documents. |
| **Payment Card Image** | Images depicting payment cards. |
| **Code or Terminal Screenshot** | Screenshots of code or terminal content. |
| **Medical Image** | Images depicting medical content. |

Each image type can use its own action or inherit the Image Risks category action. Start with **Monitor** to review findings before choosing **Strip** or **Block**. Classification describes visible content; it does not verify a person's identity, authenticate a document, or make a medical diagnosis.

Image classification applies only to the attached raster formats listed in [Supported image formats](#supported-image-formats). It does not inspect SVG drawings, images embedded inside SVGs, or images embedded inside a PDF or Office document. OCR can still read scanned PDF pages. Image quality, cropping and small content can affect what is detected.

### Quick configurations {#quick-configurations}

| Goal | Attachments controls | Data-risk controls |
|---|---|---|
| Review sensitive text in uploads | Scan attachments on; Extract document text on; OCR set to Images and pages without text | Enable the required request-side text data types; action Monitor. |
| Stop payment-card images | Scan attachments on; Classify images on | Enable Payment Card Image; action Block. |
| Remove ID-document images while allowing the rest of a request | Scan attachments on; Classify images on | Enable ID Document Image; action Strip. |
| Restrict uploads to permitted file kinds | Scan attachments on; set unwanted File types to Strip or Block | No image finding is required for a file-type restriction. |

The same choices can be scoped to people, groups or applications on the Policy Engine cards. Publish the draft before testing live traffic.

## Actions and unreadable files {#actions-and-unreadable-files}

| Action | Effect |
|---|---|
| **Monitor** | Keeps the attachment and records the outcome. |
| **Strip** | Removes the attachment and tells the model it was removed, while the rest of the request can continue. |
| **Block** | Rejects the whole request before it reaches the provider. |

**Redact** and **Partial redact** findings in an attachment currently remove the entire attachment. The gateway does not rewrite a PDF or Office file, obscure pixels in an image, or replace a document with redacted extracted text. Where the client format cannot safely represent a removed attachment, a Strip decision becomes Block.

Two additional controls handle content the gateway cannot read:

| Control | Default | Applies to |
|---|---|---|
| **Encrypted, unreadable, remote or file-ID attachments** | Monitor | Password-protected or unparseable files, unsupported content, remote URLs and provider file references. |
| **Macro-enabled documents** | Monitor | Office files containing macros or embedded objects. |

The gateway does not fetch remote URLs or download files from a provider's file store. Send file content with the request to have it scanned. Choosing Block for unreadable attachments can reject those references instead.

:::note An incomplete scan is not a clean result
Timeouts, scanner failures and unfinished scans **fail open**: the missing scan alone does not remove a file or reject a request. This behavior is separate from the action for an unreadable file. Findings in content that was successfully scanned can still trigger their configured action.
:::

## Coverage and availability {#coverage-and-availability}

Scanning applies to **request attachments**, including requests that ask for a streaming response, on Chat Completions, OpenAI Responses, Anthropic Messages, Gemini generateContent, Bedrock Converse and supported InvokeModel bodies. On gateway deployments that include SDK attachment support, it also applies to request-side text/messages checks in [SDK Mode](../apps-and-providers/sdk-mode#images-and-documents-request-checks) and [TrueFoundry input hooks](../../integrations/pull-ai-usage-and-inventory/truefoundry#content-coverage). The gateway inspects the incoming client format before any [format translation](../api-reference/any-to-any-formats).

It does not scan files generated in a model's response. Enabling scanning also does not fetch files held remotely, inspect audio or video content, or add guardrails to the separate [endpoint-family routes](../api-reference/endpoint-families).

On **no-GPU deployments**, document text extraction remains available; OCR and image classification are unavailable. A requested scan that cannot run is reported as incomplete and fails open. This differs from an image intentionally left unscanned because its protection is switched off.

## Review scan outcomes {#review-scan-outcomes}

The gateway's **Insights > Attachments** view shows file kinds and sizes, scan outcomes, data found in attachment text, **Image labels**, and **Why attachments were skipped**. Filter the period and applications, then select a chart or app to review the related requests.

Request details show each attachment's scan status and the resulting action. Check for incomplete or skipped scans as well as detections; a successful model response alone does not establish that the attachment was scanned.

## Related {#related}

- [Security guardrails](./security-guardrails) - request-side text and image data types and their actions.
- [Custom detections](./custom-detections) - your own sensitive text definitions.
- [Policy Engine overview](../../console/govern/policy-engine) - scoped attachment controls and detection rules.
- [Author, simulate and publish](../../console/govern/author-simulate-and-publish) - making policy changes live.
