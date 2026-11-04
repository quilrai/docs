export const PLAYGROUND_UPLOAD_LIMITS = Object.freeze({ files: 20, fileBytes: 20 * 1024 * 1024, totalBytes: 50 * 1024 * 1024 });

export const SDK_ATTACHMENT_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.txt,.csv,.json,.html,.xml,.rtf,.eml';

const FILE_MIMES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
  bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff', svg: 'image/svg+xml', pdf: 'application/pdf',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text', ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation', txt: 'text/plain', csv: 'text/csv',
  json: 'application/json', html: 'text/html', htm: 'text/html', xml: 'application/xml', rtf: 'application/rtf', eml: 'message/rfc822',
};

export function fileMime(file) {
  return FILE_MIMES[file.name?.split('.').pop().toLowerCase()] || file.type || 'application/octet-stream';
}

export function formatFileBytes(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Choose the file again.`));
    reader.onabort = () => reject(new Error(`Reading ${file.name} was cancelled.`));
    reader.onload = () => {
      const encoded = typeof reader.result === 'string' ? reader.result.split(';base64,')[1] : undefined;
      if (encoded === undefined) reject(new Error(`Could not encode ${file.name}. Choose the file again.`));
      else resolve(`data:${fileMime(file)};base64,${encoded}`);
    };
    reader.readAsDataURL(file);
  });
}

export async function loadSdkFiles(files, existing = [], read = readFileDataUrl) {
  if (files.length + existing.length > PLAYGROUND_UPLOAD_LIMITS.files) throw new Error('The playground accepts up to 20 files per check.');
  if (files.some((file) => file.size > PLAYGROUND_UPLOAD_LIMITS.fileBytes)) throw new Error('A file exceeds the playground limit of 20 MB. Use a smaller file.');
  if ([...files, ...existing].reduce((total, file) => total + file.size, 0) > PLAYGROUND_UPLOAD_LIMITS.totalBytes) {
    throw new Error('The selected files exceed the playground limit of 50 MB in total.');
  }
  const loaded = [];
  // Read sequentially to avoid multiple simultaneous base64 copies of large files.
  for (const file of files) {
    loaded.push({
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${loaded.length}-${Math.random()}`,
      name: file.name, size: file.size, mime: fileMime(file), dataUrl: await read(file),
    });
  }
  return [...existing, ...loaded];
}

export function sdkUploadModeError(uploads, checkType, inputFormat) {
  if (!uploads.length) return null;
  return checkType !== 'request' || inputFormat === 'json'
    ? 'Files are included only in Request checks with Text or Messages. Switch back or remove the files to continue.'
    : null;
}

const MEDIA_BLOCK_TYPES = new Set(['image_url', 'image', 'document', 'file', 'input_image', 'input_file', 'input_audio', 'computer_screenshot']);
const NON_CONTENT_FIELDS = new Set(['metadata', 'tools', 'functions', 'tool_choice', 'toolConfig', 'tool_config', 'response_format', 'generationConfig', 'generation_config', 'inferenceConfig', 'safetySettings', 'signature', 'thoughtSignature', 'thought_signature', 'encrypted_content']);
const DATA_URL_HINT = /data:[A-Za-z0-9.+-]+\/[A-Za-z0-9.+-]+(?:;[A-Za-z0-9=._-]*)*(?:;base64)?,/;

// A conservative UI hint, not validation or a promise that the scanner can
// decode the content. It never decodes or serializes inline bytes.
export function sdkMayContainAttachments(payload) {
  if (!payload || payload.type !== 'request' || Object.prototype.hasOwnProperty.call(payload, 'json')) return false;
  const pending = [payload];
  while (pending.length) {
    const value = pending.pop();
    if (typeof value === 'string') {
      if (value.includes('data:') && DATA_URL_HINT.test(value)) return true;
    } else if (Array.isArray(value)) {
      for (const child of value) pending.push(child);
    }
    else if (value && typeof value === 'object') {
      if (['thinking', 'redacted_thinking', 'reasoning'].includes(value.type)) continue;
      if (MEDIA_BLOCK_TYPES.has(value.type) || value.image_url || value.file_data || value.inlineData || value.inline_data
        || value.image?.source || value.document?.source || value.video?.source) return true;
      for (const [name, child] of Object.entries(value)) if (!NON_CONTENT_FIELDS.has(name)) pending.push(child);
    }
  }
  return false;
}

export function buildSdkCheckPayload({ inputFormat, value, checkType, hashingMode, uploads = [] }) {
  const modeError = sdkUploadModeError(uploads, checkType, inputFormat);
  if (modeError) throw new Error(modeError);
  const payload = { type: checkType, [inputFormat]: value, hashing_mode: hashingMode, metadata: { caller: 'docs-playground' } };
  if (!uploads.length) return payload;
  const parts = uploads.map((file) => file.mime.startsWith('image/')
    ? { type: 'image_url', image_url: { url: file.dataUrl } }
    : { type: 'file', file: { filename: file.name, file_data: file.dataUrl } });
  const messages = inputFormat === 'text'
    ? [{ role: 'user', content: value ? [{ type: 'text', text: value }] : [] }]
    : value.map((message) => ({ ...message, content: Array.isArray(message.content) ? [...message.content] : message.content }));
  let userIndex = messages.findLastIndex((message) => message.role === 'user');
  if (userIndex < 0) {
    messages.push({ role: 'user', content: [] });
    userIndex = messages.length - 1;
  }
  const current = messages[userIndex].content;
  messages[userIndex].content = [...(Array.isArray(current) ? current : current ? [{ type: 'text', text: current }] : []), ...parts];
  delete payload.text;
  payload.messages = messages;
  return payload;
}

const DATA_URL_BYTES = /(data:[A-Za-z0-9.+-]+\/[A-Za-z0-9.+-]+(?:;[A-Za-z0-9=._-]*)*;base64,)[A-Za-z0-9+/_=\-\r\n]+/g;

export function compactSdkMedia(value, key = '') {
  if (typeof value === 'string') {
    const hidden = value.replace(DATA_URL_BYTES, '$1[inline bytes hidden]');
    if (hidden !== value) return hidden;
    if (['data', 'bytes', 'file_data', 'url'].includes(key) && value.length > 256 && /^[A-Za-z0-9+/_=\-\r\n]+$/.test(value)) {
      return '[inline bytes hidden]';
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => compactSdkMedia(item, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, compactSdkMedia(item, name)]));
  return value;
}

export function formatSdkSafeContent(result) {
  if (!result || result.action === 'block' || result.status === 'blocked') return null;
  for (const key of ['processed_body', 'processed_json', 'messages']) {
    if (Object.prototype.hasOwnProperty.call(result, key)) return JSON.stringify(compactSdkMedia(result[key]), null, 2);
  }
  return result.processed_text === undefined ? null : compactSdkMedia(result.processed_text);
}

export function attachmentCoverage(record) {
  const items = Array.isArray(record?.items) ? record.items : [];
  if (record?.scanned !== true) return { label: 'Attachments not scanned', tone: 'warning' };
  if (items.some((item) => item.incomplete)) return { label: 'Scan incomplete', tone: 'warning' };
  if (items.some((item) => item.unscannable)) return { label: 'Unreadable attachments', tone: 'warning' };
  if (!items.length || items.some((item) => !['ok', 'cache_hit'].includes(item.status))) return { label: 'Some attachments not scanned', tone: 'warning' };
  return { label: 'Scan completed', tone: 'complete' };
}

const IMAGE_LABELS = {
  'image.nudity_sexual': 'Nudity or sexual image', 'image.weapons': 'Weapons', 'image.human_face': 'Human face',
  'image.id_document': 'ID document', 'image.payment_card': 'Payment card', 'image.code_terminal': 'Code or terminal screenshot', 'image.medical': 'Medical image',
};

export function attachmentFindingLabel(value) {
  return IMAGE_LABELS[value] || String(value).split(':').pop().replace(/_/g, ' ');
}

export function attachmentStageLabel(value) {
  return ({ extract_text: 'Text extraction', ocr: 'OCR', classify_images: 'Image classification' })[value] || String(value).replace(/_/g, ' ');
}
