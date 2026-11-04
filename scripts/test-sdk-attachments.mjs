import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import vm from 'node:vm';
import {
  attachmentCoverage, buildSdkCheckPayload, compactSdkMedia, formatSdkSafeContent,
  loadSdkFiles, sdkMayContainAttachments, sdkUploadModeError,
} from '../src/components/LlmGatewayStudio/sdkAttachments.mjs';

const image = { id: 'image', name: 'synthetic.png', size: 8, mime: 'image/png', dataUrl: 'data:image/png;base64,U1lOVEhFVElD' };
const document = { id: 'document', name: 'synthetic.pdf', size: 12, mime: 'application/pdf', dataUrl: 'data:application/pdf;base64,U1lOVEhFVElD' };
const request = (options = {}) => buildSdkCheckPayload({ inputFormat: 'text', value: 'Inspect these files', checkType: 'request', hashingMode: 'case_sensitive', ...options });

test('browser file reading creates standard image/document requests without separate uploads', async () => {
  const previous = globalThis.FileReader;
  globalThis.FileReader = class {
    readAsDataURL(file) {
      this.result = `data:application/octet-stream;base64,${Buffer.from(file.bytes).toString('base64')}`;
      this.onload();
    }
  };
  try {
    const files = await loadSdkFiles([
      { name: 'photo.PNG', size: 4, type: '', bytes: [1, 2, 3, 4] },
      { name: 'report.pdf', size: 3, type: '', bytes: [5, 6, 7] },
    ]);
    const payload = request({ uploads: files });
    assert.equal(payload.text, undefined);
    assert.equal(payload.type, 'request');
    assert.deepEqual(payload.messages[0].content, [
      { type: 'text', text: 'Inspect these files' },
      { type: 'image_url', image_url: { url: 'data:image/png;base64,AQIDBA==' } },
      { type: 'file', file: { filename: 'report.pdf', file_data: 'data:application/pdf;base64,BQYH' } },
    ]);
    assert.deepEqual(payload.metadata, { caller: 'docs-playground' });
  } finally {
    globalThis.FileReader = previous;
  }
});

test('image-only checks and file removal produce the actual expected payload', () => {
  const first = request({ value: '', uploads: [image, document] });
  assert.equal(first.messages[0].content.length, 2);
  assert.equal(first.messages[0].content[0].type, 'image_url');
  const afterRemoval = request({ value: '', uploads: [document] });
  assert.deepEqual(afterRemoval.messages[0].content, [{ type: 'file', file: { filename: document.name, file_data: document.dataUrl } }]);
});

test('uploads preserve manually edited history and append to the last user message without mutation', () => {
  const messages = [
    { role: 'system', content: 'Keep this' },
    { role: 'user', content: [{ type: 'text', text: 'Manual text' }, { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'MANUAL' } }] },
    { role: 'assistant', content: 'Assistant last does not override Request' },
  ];
  const before = structuredClone(messages);
  const payload = request({ inputFormat: 'messages', value: messages, uploads: [image] });
  assert.deepEqual(messages, before);
  assert.deepEqual(payload.messages[0], before[0]);
  assert.deepEqual(payload.messages[2], before[2]);
  assert.deepEqual(payload.messages[1].content.slice(0, 2), before[1].content);
  assert.equal(payload.messages[1].content[2].image_url.url, image.dataUrl);
  const noUser = request({ inputFormat: 'messages', value: [{ role: 'system', content: 'Instructions' }], uploads: [image] });
  assert.equal(noUser.messages[1].role, 'user');
});

test('manual text, messages and JSON-value requests retain their existing shapes without uploads', () => {
  assert.equal(request().text, 'Inspect these files');
  assert.deepEqual(request({ inputFormat: 'json', value: { nested: [false, 3, null] } }).json, { nested: [false, 3, null] });
  assert.equal(request({ checkType: 'response' }).type, 'response');
  const html = `<img src="${image.dataUrl}">`;
  assert.equal(request({ value: html }).text, html);
});

test('files cannot silently disappear into JSON-value or response checks', () => {
  for (const options of [{ checkType: 'response' }, { inputFormat: 'json' }]) {
    assert.throws(() => request({ ...options, uploads: [image] }), /only in Request checks/);
  }
  assert.equal(sdkUploadModeError([], 'response', 'json'), null);
});

test('missing coverage hints include manually pasted blocks/data URLs without inferring images from plain base64', () => {
  assert.equal(sdkMayContainAttachments(request({ value: `<img src="${image.dataUrl}">` })), true);
  assert.equal(sdkMayContainAttachments(request({ inputFormat: 'messages', value: [{ role: 'user', content: [{ type: 'file', file: { filename: 'manual.pdf', file_data: 'MANUALBASE64' } }] }] })), true);
  assert.equal(sdkMayContainAttachments(request({ inputFormat: 'messages', value: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', data: 'MANUALBASE64' } }] }] })), true);
  assert.equal(sdkMayContainAttachments(request({ value: 'MANUALBASE64' })), false);
  assert.equal(sdkMayContainAttachments(request({ value: image.dataUrl, checkType: 'response' })), false);
  assert.equal(sdkMayContainAttachments(request({ inputFormat: 'json', value: { image: image.dataUrl } })), false);
  assert.equal(sdkMayContainAttachments({ ...request(), metadata: { example: image.dataUrl }, tools: [{ example: image.dataUrl }] }), false);
});

test('playground upload bounds reject before any file is read', async () => {
  let reads = 0;
  const read = async () => { reads += 1; return image.dataUrl; };
  await assert.rejects(loadSdkFiles(Array.from({ length: 21 }, () => ({ size: 1 })), [], read), /20 files/);
  await assert.rejects(loadSdkFiles([{ size: 20 * 1024 * 1024 + 1 }], [], read), /20 MB/);
  await assert.rejects(loadSdkFiles([{ size: 20 * 1024 * 1024 }], [{ size: 31 * 1024 * 1024 }], read), /50 MB/);
  assert.equal(reads, 0);
});

test('read failures keep the existing selected files intact', async () => {
  const existing = [image];
  await assert.rejects(loadSdkFiles([{ name: 'unreadable.pdf', size: 4 }], existing, async () => { throw new Error('Read failed'); }), /Read failed/);
  assert.deepEqual(existing, [image]);
});

test('previews hide inline bytes while original request and returned values remain intact', () => {
  const input = request({ uploads: [image, document] });
  const preview = compactSdkMedia(input);
  assert.equal(input.messages[0].content[1].image_url.url, image.dataUrl);
  assert.match(preview.messages[0].content[1].image_url.url, /inline bytes hidden/);
  assert.equal(JSON.stringify(preview).includes('U1lOVEhFVElD'), false);
  const wrapped = { text: '<img src="data:image/png;base64,AAAA\nBBBB">', source: { data: 'A'.repeat(300) } };
  assert.equal(JSON.stringify(compactSdkMedia(wrapped)).includes('BBBB'), false);
  assert.equal(compactSdkMedia(wrapped).source.data, '[inline bytes hidden]');
});

test('safe content gives processed_body precedence and block always wins', () => {
  const result = { action: 'redact', messages: [{ role: 'user', content: 'fallback' }], processed_body: { messages: [{ role: 'user', content: 'redacted' }], system: 'removed' } };
  assert.deepEqual(JSON.parse(formatSdkSafeContent(result)), result.processed_body);
  assert.equal(formatSdkSafeContent({ ...result, action: 'block' }), null);
  assert.equal(formatSdkSafeContent({ ...result, status: 'blocked' }), null);
  assert.equal(formatSdkSafeContent({ action: 'allow', processed_json: null }), 'null');
});

test('coverage never treats attempted, skipped or incomplete scans as clean', () => {
  assert.equal(attachmentCoverage({ scanned: false, items: [] }).tone, 'warning');
  for (const item of [{ status: 'ok', incomplete: true }, { status: 'ok', unscannable: true }, { status: 'skipped' }, { status: 'not_scanned' }]) {
    assert.equal(attachmentCoverage({ scanned: true, items: [item] }).tone, 'warning');
  }
  assert.equal(attachmentCoverage({ scanned: true, items: [{ status: 'cache_hit' }] }).label, 'Scan completed');
});

const studioPath = new URL('../src/components/LlmGatewayStudio/index.js', import.meta.url);
const source = readFileSync(studioPath, 'utf8');
const snippetCode = [['formatJson', 'shellQuote'], ['buildSdkPython', 'buildSdkJs'], ['buildSdkJs', 'buildSdkTokenSavingsPython']]
  .map(([name, next]) => source.slice(source.indexOf(`function ${name}(`), source.indexOf(`\nfunction ${next}(`))).join('\n');
const snippetContext = vm.createContext({});
vm.runInContext(snippetCode, snippetContext);

test('the production resolver selects the React panels rather than the similarly named helper module', () => {
  const require = createRequire(studioPath);
  const resolve = require('enhanced-resolve').create.sync({ extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'] });
  const specifier = source.match(/import\s*\{\s*SdkAttachmentResults,\s*SdkAttachmentUploads\s*\}\s*from\s*['"]([^'"]+)['"]/)?.[1];
  assert.ok(specifier, 'The studio must import both attachment panels');
  const resolved = resolve(new URL('../src/components/LlmGatewayStudio/', import.meta.url).pathname, specifier);
  const babel = require('@babel/core');
  const compiled = babel.transformSync(readFileSync(resolved, 'utf8'), {
    plugins: [require('@babel/plugin-transform-react-jsx'), require('@babel/plugin-transform-modules-commonjs')],
  }).code;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(createRequire(resolved), module, module.exports);
  assert.equal(typeof module.exports.SdkAttachmentResults, 'function');
  assert.equal(typeof module.exports.SdkAttachmentUploads, 'function');
});

test('generated JavaScript sends the complete upload payload and safely handles processed_body', async () => {
  const payload = request({ uploads: [image] });
  const result = { action: 'redact', processed_body: { messages: [{ role: 'user', content: 'removed' }], system: 'removed' }, messages: [{ role: 'user', content: 'fallback' }] };
  const code = snippetContext.buildSdkJs('https://example.invalid/sdk/v1/check', payload, 'synthetic-key');
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let sent;
  const run = new AsyncFunction('fetch', `${code}\nreturn {safe, attachments};`);
  const fetch = async (_url, options) => { sent = JSON.parse(options.body); return { ok: true, json: async () => result }; };
  assert.deepEqual((await run(fetch)).safe, result.processed_body);
  assert.equal(sent.messages[0].content[1].image_url.url, image.dataUrl);
  await assert.rejects(run(async () => ({ ok: true, json: async () => ({ ...result, status: 'blocked' }) })), /Blocked/);
});

test('generated Python chooses processed_body and stops blocked responses before content use', () => {
  const code = snippetContext.buildSdkPython('https://example.invalid/sdk/v1/check', request({ uploads: [image] }), 'synthetic-key');
  for (const blocked of [false, true]) {
    const result = { action: 'redact', ...(blocked ? { status: 'blocked' } : {}), processed_body: { text: 'sanitized body' }, messages: ['fallback'] };
    const harness = `import json,sys,types\nfixture=json.loads(${JSON.stringify(JSON.stringify(result))})\nrequests=types.ModuleType('requests')\nrequests.post=lambda *a,**k: types.SimpleNamespace(raise_for_status=lambda:None,json=lambda:fixture)\nsys.modules['requests']=requests\ntry:\n    exec(${JSON.stringify(code)},globals())\n    print(json.dumps(safe))\nexcept ValueError:\n    print('blocked')\n`;
    const run = spawnSync('python3', ['-B', '-c', harness], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout.trim(), blocked ? 'blocked' : JSON.stringify(result.processed_body).replaceAll(':', ': '));
  }
});

test('attachment UI renders missing/incomplete coverage and findings without inline bytes', async () => {
  const require = createRequire(studioPath);
  const babel = require('@babel/core');
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const componentPath = new URL('../src/components/LlmGatewayStudio/SdkAttachments.js', import.meta.url);
  const compiled = babel.transformSync(readFileSync(componentPath, 'utf8'), {
    plugins: [require('@babel/plugin-transform-react-jsx'), require('@babel/plugin-transform-modules-commonjs')],
  }).code;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(createRequire(componentPath), module, module.exports);
  const styles = new Proxy({}, { get: (_target, key) => String(key) });
  const missing = renderToStaticMarkup(React.createElement(module.exports.SdkAttachmentResults, { styles, expected: true }));
  assert.match(missing, /No attachment coverage returned/);
  const incomplete = renderToStaticMarkup(React.createElement(module.exports.SdkAttachmentResults, {
    styles, record: { scanned: true, items: [{ id: 'a0', kind: 'image', status: 'error', incomplete: true, action: 'monitor', stages_run: ['ocr'], image_labels: ['image.payment_card'] }] },
  }));
  assert.match(incomplete, /Scan incomplete/);
  assert.match(incomplete, /Payment card/);
  assert.match(incomplete, /OCR/);
  assert.equal(incomplete.includes('Scan completed'), false);
  const uploads = renderToStaticMarkup(React.createElement(module.exports.SdkAttachmentUploads, { styles, uploads: [image], available: true }));
  assert.match(uploads, /synthetic.png/);
  assert.equal(uploads.includes('U1lOVEhFVElD'), false);
});

test('local file handling has no persistence or network transport of its own', () => {
  for (const path of ['SdkAttachments.js', 'sdkAttachments.mjs']) {
    const code = readFileSync(new URL(`../src/components/LlmGatewayStudio/${path}`, import.meta.url), 'utf8');
    assert.equal(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon/.test(code), false);
  }
});
