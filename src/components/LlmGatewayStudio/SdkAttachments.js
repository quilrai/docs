import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  SDK_ATTACHMENT_ACCEPT, attachmentCoverage, attachmentFindingLabel, attachmentStageLabel,
  formatFileBytes, loadSdkFiles,
} from './sdkAttachments.mjs';

export function SdkAttachmentUploads({ styles, uploads, onChange, onBusyChange, isRunning, available }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function selectFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setBusy(true);
    onBusyChange(true);
    setError(null);
    try {
      onChange(await loadSdkFiles(files, uploads));
    } catch (err) {
      setError(err.message || 'Could not read the files. Choose them again.');
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  return (
    <section className={styles.sdkAttachments} aria-labelledby="sdk-attachments-title">
      <div className={styles.sdkAttachmentHeader}>
        <div>
          <h3 id="sdk-attachments-title">Images and documents</h3>
          <p>Files become inline user-message content. Nothing is sent until you run the check.</p>
        </div>
        <button className={styles.sdkAttachButton} type="button" onClick={() => inputRef.current?.click()} disabled={isRunning || busy || !available}>
          {busy ? <Loader2 size={14} className={styles.spin} aria-hidden /> : <Plus size={14} aria-hidden />}
          {busy ? 'Reading files' : 'Add files'}
        </button>
        <input ref={inputRef} type="file" multiple accept={SDK_ATTACHMENT_ACCEPT} onChange={selectFiles} className={styles.sdkFileInput} tabIndex={-1} aria-label="Choose images or documents" disabled={isRunning || busy || !available} />
      </div>
      <p className={styles.sdkAttachmentHelp}>Request checks with Text or Messages only. Image-only checks are supported. Files stay in memory and are not saved by the playground.</p>
      {uploads.length > 0 && (
        <ul className={styles.sdkUploadList} aria-label="Selected attachments">
          {uploads.map((file) => (
            <li key={file.id}>
              <FileText size={17} aria-hidden />
              <div><strong>{file.name}</strong><small>{file.mime} · {formatFileBytes(file.size)}</small></div>
              <button type="button" className={styles.iconBtn} onClick={() => onChange(uploads.filter((item) => item.id !== file.id))} aria-label={`Remove ${file.name}`} disabled={busy || isRunning}><Trash2 size={15} aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className={styles.sdkAttachmentError} role="alert">{error}</p>}
      <details className={styles.sdkAttachmentFormats}>
        <summary>Formats and playground limits</summary>
        <p>PNG, JPEG, WebP, GIF, BMP and TIFF support configured OCR and image-risk checks. Animated images and multipage TIFF use the first frame or image. SVG supports embedded text extraction.</p>
        <p>PDF, Word, Excel, PowerPoint, OpenDocument, text, CSV, JSON, HTML, XML, RTF and email files support text extraction; PDF can also use OCR. Images inside documents do not receive image-risk classification.</p>
        <p>Up to 20 files, 20 MB per file and 50 MB total in this playground. Your app can set lower limits. HEIC/AVIF are not decoded; remote URLs are not fetched.</p>
      </details>
      <p className={styles.sdkAttachmentHelp}>Your app&apos;s attachment settings and policies decide what runs. Image classification also needs enabled Image Risks categories. <a href="/llm-gateway/protect/attachment-scanning">Attachment scanning guide</a></p>
    </section>
  );
}

export function SdkAttachmentResults({ styles, record, expected = false }) {
  if (!record) return expected ? (
    <section className={styles.resultCard} aria-label="Attachment coverage unavailable">
      <div className={styles.sdkAttachmentCoverage} data-coverage="warning"><AlertTriangle size={17} aria-hidden /><h3>No attachment coverage returned</h3></div>
      <p className={styles.subtle}>The input appears to contain attachments, but the gateway returned no scan details. An allow decision does not confirm they were scanned. Check your app&apos;s attachment settings and that the gateway supports SDK attachment scanning.</p>
    </section>
  ) : null;
  const coverage = attachmentCoverage(record);
  const Icon = coverage.tone === 'complete' ? CheckCircle2 : AlertTriangle;
  const items = Array.isArray(record.items) ? record.items : [];

  return (
    <section className={styles.resultCard} aria-labelledby="sdk-attachment-results-title">
      <div className={styles.sdkAttachmentCoverage} data-coverage={coverage.tone}>
        <Icon size={17} aria-hidden />
        <h3 id="sdk-attachment-results-title">{coverage.label}</h3>
        <span>{items.length} attachment{items.length === 1 ? '' : 's'}</span>
      </div>
      <p className={styles.subtle}>Coverage is separate from the allow, redact or block decision. An allowed request can contain skipped, unreadable or incomplete attachments.</p>
      <div className={styles.sdkScanItems}>
        {items.map((item, index) => {
          const findings = [...new Set([...(item.data_types || []), ...(item.image_labels || [])].map(attachmentFindingLabel))];
          return (
            <article key={`${item.id || index}-${item.path || ''}`} className={styles.sdkScanItem}>
              <div className={styles.sdkScanItemTitle}><strong>Attachment {item.id || index + 1}</strong><span>{item.kind || 'Unknown type'}{item.mime ? ` · ${item.mime}` : ''}</span></div>
              {item.path && <code className={styles.sdkAttachmentPath}>{item.path}</code>}
              <dl className={styles.sdkScanFacts}>
                <div><dt>Status</dt><dd>{String(item.status || 'not reported').replace(/_/g, ' ')}</dd></div>
                <div><dt>Action</dt><dd>{item.action || 'not reported'}{item.stripped ? ' · removed' : ''}</dd></div>
                <div><dt>Completed stages</dt><dd>{item.stages_run?.length ? item.stages_run.map(attachmentStageLabel).join(', ') : 'None reported'}</dd></div>
                <div><dt>Coverage</dt><dd>{item.incomplete ? 'Incomplete' : item.unscannable ? 'Unreadable' : ['ok', 'cache_hit'].includes(item.status) ? 'Completed configured stages' : 'Not fully scanned'}</dd></div>
              </dl>
              {item.reason && <p className={styles.subtle}>Reason: {String(item.reason).replace(/_/g, ' ')}</p>}
              <p className={styles.sdkAttachmentFindings}><strong>Findings:</strong> {findings.length ? findings.join(', ') : 'None reported'}{item.text_truncated ? ' · Extracted text truncated' : ''}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
