import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  Clipboard,
  Code2,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Link2,
  ListChecks,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Square,
  Table2,
  Terminal,
  Trash2,
  Volume2,
} from 'lucide-react';
import styles from './styles.module.css';

/* ────────────────────────────────── Config ─────────────────────────── */

const REGIONS = [
  { label: 'Nearest', value: 'https://guardrails.quilr.ai' },
  { label: 'US Central West', value: 'https://guardrails-usa-1.quilr.ai' },
  { label: 'US East', value: 'https://guardrails-usa-2.quilr.ai' },
  { label: 'India', value: 'https://guardrails-india-1.quilr.ai' },
];

const SURFACES = [
  {
    id: 'chat',
    group: 'chat',
    category: 'Conversation',
    label: 'Chat',
    path: '/openai_compatible/v1/chat/completions',
    auth: 'bearer',
    selector: true,
    model: 'gpt-4o-mini',
    blurb:
      'OpenAI-compatible chat. Streams tokens live and translates to Bedrock Converse, Vertex Gemini, Anthropic, and more.',
  },
  {
    id: 'responses',
    group: 'chat',
    category: 'Conversation',
    label: 'Responses',
    path: '/openai_responses/v1/responses',
    auth: 'bearer',
    selector: true,
    model: 'gpt-5',
    blurb: 'OpenAI Responses API for keys with a Responses or Azure Responses provider.',
  },
  {
    id: 'anthropic',
    group: 'chat',
    category: 'Conversation',
    label: 'Anthropic',
    path: '/anthropic_messages/v1/messages',
    auth: 'anthropic',
    selector: true,
    model: 'claude-sonnet-4-20250514',
    blurb: 'Native Anthropic Messages shape with x-api-key auth.',
  },
  {
    id: 'completions',
    group: 'editor',
    category: 'Data',
    label: 'Completions',
    path: '/openai_compatible/v1/completions',
    auth: 'bearer',
    selector: false,
    model: 'gpt-3.5-turbo-instruct',
    blurb: 'Legacy OpenAI text completions for upstreams that still expose /v1/completions.',
    sample: {
      model: 'gpt-3.5-turbo-instruct',
      prompt: 'Write one sentence from the QuilrAI gateway playground.',
      temperature: 0.2,
      max_tokens: 128,
      stream: false,
    },
  },
  {
    id: 'embeddings',
    group: 'editor',
    category: 'Data',
    label: 'Embeddings',
    path: '/openai_compatible/v1/embeddings',
    auth: 'bearer',
    selector: true,
    model: 'text-embedding-3-small',
    blurb: 'OpenAI embeddings shape, translated for OpenAI, Azure, or Bedrock embedding providers.',
    sample: {
      model: 'text-embedding-3-small',
      input: 'The quick brown fox jumps over the lazy dog.',
    },
  },
  {
    id: 'rerank',
    group: 'editor',
    category: 'Data',
    label: 'Rerank',
    path: '/rerank/v2/rerank',
    auth: 'bearer',
    selector: true,
    model: 'rerank-english-v3.0',
    blurb: 'Cohere-compatible rerank for Cohere, Bedrock, Jina, and Voyage providers.',
    sample: {
      model: 'rerank-english-v3.0',
      query: 'What is the capital of France?',
      documents: [
        'Paris is the capital of France.',
        'Berlin is the capital of Germany.',
        'The Eiffel Tower is in Paris.',
      ],
      top_n: 2,
    },
  },
  {
    id: 'tts',
    group: 'editor',
    category: 'Data',
    label: 'Speech',
    path: '/openai_compatible/v1/audio/speech',
    auth: 'bearer',
    selector: false,
    responseType: 'binary',
    model: 'gpt-4o-mini-tts',
    blurb: 'OpenAI-compatible text to speech. Returns audio you can play back here.',
    sample: {
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: 'Hello from the QuilrAI gateway playground.',
      response_format: 'mp3',
    },
  },
  {
    id: 'sdk',
    group: 'sdk',
    category: 'Guardrails',
    label: 'Guardrail check',
    path: '/sdk/v1/check',
    auth: 'bearer',
    selector: false,
    blurb: 'Standalone guardrail check. Needs a quilr_sdk key, not a provider key.',
  },
  {
    id: 'logs',
    group: 'logs',
    category: 'Logs',
    label: 'Log Export',
    method: 'GET',
    keyKind: 'export',
    selector: false,
    blurb:
      'Export LLM or MCP Gateway logs into an Excel-ready CSV. Uses an sk-export- key sent as X-Quilr-Log-Export-Key, follows checkpoints, and works for both gateways.',
  },
];

// Left-rail surface switcher only covers the model-call surfaces.
// Guardrails and Log Export are distinct tools, promoted to top-level tabs.
const GATEWAY_CATEGORIES = ['Conversation', 'Data'];

const STUDIO_TABS = [
  { id: 'gateway', label: 'Gateway', Icon: Terminal, surface: 'chat' },
  { id: 'guardrails', label: 'Quilr SDK', Icon: ShieldCheck, surface: 'sdk' },
  { id: 'logs', label: 'Log Export', Icon: Database, surface: 'logs' },
];

function getTopTab(group) {
  if (group === 'logs') return 'logs';
  if (group === 'sdk') return 'guardrails';
  return 'gateway';
}

const PROVIDER_SELECTOR_OPTIONS = [
  { value: 'none', label: 'Auto route' },
  { value: 'provider', label: 'Provider type' },
  { value: 'provider_label', label: 'Provider label' },
];

const CODE_TABS = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
];

const STARTER_PROMPTS = [
  'Write a one sentence greeting from the QuilrAI gateway.',
  'Explain what an LLM gateway does in two sentences.',
  'My SSN is 219-09-4823 - can you store it for me?',
];

/* ───────────────────────────── Log export config ───────────────────── */

const LOG_GATEWAYS = [
  { id: 'llm', label: 'LLM Gateway', path: '/llmgateway/logs/export', rowType: 'llmgateway.request' },
  { id: 'mcp', label: 'MCP Gateway', path: '/mcpgateway/logs/export', rowType: 'mcpgateway.tool_call' },
];

const LOG_COLUMN_SETS = {
  llm: [
    { id: 'timestamp', label: 'Timestamp', path: 'request.timestamp', default: true },
    { id: 'request_id', label: 'Request ID', path: 'request.id', default: true },
    { id: 'app_name', label: 'App', path: 'app.name', default: true },
    { id: 'endpoint', label: 'Endpoint', path: 'request.endpoint', default: true },
    { id: 'model', label: 'Model', path: 'request.model', default: true },
    { id: 'provider', label: 'Provider', path: 'request.provider', default: true },
    { id: 'status_code', label: 'Status', path: 'request.status_code', default: true },
    { id: 'stream', label: 'Stream', path: 'request.stream' },
    { id: 'error_type', label: 'Error Type', path: 'request.error_type' },
    { id: 'error_message', label: 'Error Message', path: 'request.error_message' },
    { id: 'guardrail_outcome', label: 'Guardrail Outcome', path: 'guardrails.outcome', default: true },
    { id: 'blocked', label: 'Blocked', path: 'guardrails.is_blocked', default: true },
    { id: 'anonymized', label: 'Anonymized', path: 'guardrails.is_anonymized' },
    { id: 'request_tokens', label: 'Request Tokens', path: 'tokens.request', default: true },
    { id: 'response_tokens', label: 'Response Tokens', path: 'tokens.response', default: true },
    { id: 'cache_read_tokens', label: 'Cache Read Tokens', path: 'tokens.cache_read' },
    { id: 'cache_write_tokens', label: 'Cache Write Tokens', path: 'tokens.cache_write' },
    { id: 'reasoning_tokens', label: 'Reasoning Tokens', path: 'tokens.reasoning' },
    { id: 'max_requested_tokens', label: 'Max Requested Tokens', path: 'tokens.max_requested' },
    { id: 'total_latency_ms', label: 'Total Latency ms', path: 'latency_ms.total', default: true },
    { id: 'upstream_latency_ms', label: 'Upstream Latency ms', path: 'latency_ms.upstream' },
    { id: 'guardrail_latency_ms', label: 'Guardrail Latency ms', path: 'latency_ms.guardrails' },
    { id: 'quilr_processing_ms', label: 'Quilr Processing ms', path: 'latency_ms.quilr_processing' },
    { id: 'first_response_ms', label: 'First Response ms', path: 'latency_ms.first_response' },
    { id: 'user_email', label: 'User Email', path: 'metadata.user_email', default: true },
    { id: 'conversation_id', label: 'Conversation ID', path: 'metadata.conversation_id' },
    { id: 'client_ip', label: 'Client IP', path: 'metadata.client_ip' },
    { id: 'routing_group_id', label: 'Routing Group ID', path: 'routing.group_id' },
    { id: 'routing_mode', label: 'Routing Mode', path: 'routing.mode' },
    { id: 'request_text', label: 'Request Text JSON', path: 'payload.request_text' },
    { id: 'response_text', label: 'Response Text JSON', path: 'payload.response_text' },
    { id: 'actions_and_categories', label: 'Actions and Categories JSON', path: 'guardrails.actions_and_categories' },
    { id: 'request_predictions', label: 'Request Predictions JSON', path: 'guardrails.request_predictions' },
    { id: 'response_predictions', label: 'Response Predictions JSON', path: 'guardrails.response_predictions' },
    { id: 'extra_data', label: 'Extra Data JSON', path: 'metadata.extra_data' },
    { id: 'sdk', label: 'SDK JSON', path: 'metadata.sdk' },
  ],
  mcp: [
    { id: 'started_at', label: 'Started At', path: 'request.started_at', default: true },
    { id: 'completed_at', label: 'Completed At', path: 'request.completed_at' },
    { id: 'request_id', label: 'Request ID', path: 'request.id', default: true },
    { id: 'log_id', label: 'Log ID', path: 'request.log_id', default: true },
    { id: 'backend_id', label: 'Backend ID', path: 'backend.id' },
    { id: 'backend_name', label: 'Backend', path: 'backend.name', default: true },
    { id: 'tool_name', label: 'Tool', path: 'tool.name', default: true },
    { id: 'duration_ms', label: 'Duration ms', path: 'request.duration_ms', default: true },
    { id: 'auth_mode', label: 'Auth Mode', path: 'auth.mode' },
    { id: 'success', label: 'Success', path: 'response.success', default: true },
    { id: 'error_message', label: 'Error Message', path: 'response.error_message' },
    { id: 'input_outcome', label: 'Input Outcome', path: 'guardrails.input.outcome', default: true },
    { id: 'input_blocked', label: 'Input Blocked', path: 'guardrails.input.is_blocked', default: true },
    { id: 'output_outcome', label: 'Output Outcome', path: 'guardrails.output.outcome', default: true },
    { id: 'output_blocked', label: 'Output Blocked', path: 'guardrails.output.is_blocked', default: true },
    { id: 'input_predictions', label: 'Input Predictions JSON', path: 'guardrails.input.predictions' },
    { id: 'output_predictions', label: 'Output Predictions JSON', path: 'guardrails.output.predictions' },
    { id: 'tool_arguments', label: 'Tool Arguments JSON', path: 'payload.tool_arguments' },
    { id: 'response_content', label: 'Response Content JSON', path: 'payload.response_content' },
    { id: 'user_email', label: 'User Email', path: 'metadata.user_email', default: true },
    { id: 'agent', label: 'Agent', path: 'metadata.agent', default: true },
    { id: 'extra_data', label: 'Extra Data JSON', path: 'metadata.extra_data' },
  ],
};

const LOG_ROW_LIMITS = [100, 500, 1000, 5000, 10000];
const LOG_RETENTION_DAYS = 15;
const LOG_EXPORT_LAG_MINUTES = 15;
const LOG_RETENTION_BUFFER_MINUTES = 1;

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatDatetimeLocal(date) {
  return [
    date.getFullYear(),
    '-',
    pad2(date.getMonth() + 1),
    '-',
    pad2(date.getDate()),
    'T',
    pad2(date.getHours()),
    ':',
    pad2(date.getMinutes()),
  ].join('');
}

function getInitialLogWindow() {
  const end = new Date(Date.now() - 20 * 60 * 1000);
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return { start: formatDatetimeLocal(start), end: formatDatetimeLocal(end) };
}

function parseDatetimeLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getLogTimeBounds() {
  const now = Date.now();
  return {
    retentionFloor: new Date(now - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000 + LOG_RETENTION_BUFFER_MINUTES * 60 * 1000),
    maxExportable: new Date(now - LOG_EXPORT_LAG_MINUTES * 60 * 1000),
  };
}

function normalizeLogWindow(startValue, endValue) {
  const { retentionFloor, maxExportable } = getLogTimeBounds();
  let start = parseDatetimeLocal(startValue);
  let end = parseDatetimeLocal(endValue);
  const notices = [];

  if (!end || end > maxExportable) {
    end = maxExportable;
    notices.push('End time was moved back to the latest exportable time.');
  }
  if (end < retentionFloor) {
    end = maxExportable;
    notices.push('End time was outside the 15-day retention window, so the latest exportable window is used.');
  }
  if (!start) {
    start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  }
  if (start < retentionFloor) {
    start = retentionFloor;
    notices.push('Start time was moved forward to the earliest available point in the 15-day retention window.');
  }
  if (start > end) {
    start = retentionFloor <= end ? retentionFloor : new Date(end.getTime());
    notices.push('Start time was adjusted so it does not come after the end time.');
  }

  return {
    startTime: formatDatetimeLocal(start),
    endTime: formatDatetimeLocal(end),
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    notice: notices.join(' '),
  };
}

function getLogGateway(gateway) {
  return LOG_GATEWAYS.find((option) => option.id === gateway) ?? LOG_GATEWAYS[0];
}

function getDefaultLogColumnIds(gateway) {
  return new Set(LOG_COLUMN_SETS[gateway].filter((column) => column.default).map((column) => column.id));
}

function localDatetimeToIso(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function parseNdjson(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function getPath(value, path) {
  return path.split('.').reduce((current, part) => (current == null ? undefined : current[part]), value);
}

function formatCell(value) {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function csvEscape(value) {
  const escaped = formatCell(value).replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function buildLogCsv(rows, columns) {
  const lines = [
    columns.map((column) => csvEscape(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(getPath(row, column.path))).join(',')),
  ];
  return `﻿${lines.join('\n')}\n`;
}

function downloadTextFile(filename, contents) {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getLogRequestError(response, text) {
  try {
    const parsed = JSON.parse(text);
    return parsed?.error?.message || parsed?.detail || parsed?.message || text;
  } catch {
    return text || `HTTP ${response.status}`;
  }
}

function getLogPreviewCell(row, column) {
  const value = formatCell(getPath(row, column.path));
  if (!value) return '';
  return value.length > 120 ? `${value.slice(0, 120)}...` : value;
}

/* ────────────────────────────────── Helpers ────────────────────────── */

function getSurface(id) {
  return SURFACES.find((s) => s.id === id) ?? SURFACES[0];
}

function normalizeBaseUrl(value) {
  return (value || '').trim().replace(/\/+$/, '');
}

function formatJson(value) {
  return JSON.stringify(value, null, 2) ?? '';
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseJsonWithError(text) {
  if (!text.trim()) {
    return { value: null, error: 'Enter a JSON request body.' };
  }
  try {
    return { value: JSON.parse(text), error: null };
  } catch (error) {
    return { value: null, error: error.message || 'Request body must be valid JSON.' };
  }
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function withSelector(payload, type, value) {
  const trimmed = value.trim();
  if (!isPlainObject(payload) || type === 'none' || !trimmed) return payload;
  return { ...payload, [type]: trimmed };
}

function getHeaders(surface, apiKey) {
  if (surface.auth === 'anthropic') {
    return {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

function snippetKey(apiKey, reveal, placeholder = 'sk-quilr-...') {
  const trimmed = apiKey.trim();
  if (!trimmed) return placeholder;
  return reveal ? trimmed : placeholder;
}

function buildLogQueryUrl(requestUrl, query) {
  const out = [];
  Object.entries(query).forEach(([name, value]) => {
    if (value !== '' && value != null) out.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  });
  return out.length ? `${requestUrl}?${out.join('&')}` : requestUrl;
}

function buildLogCurl(requestUrl, exportKey, query) {
  return [
    `curl -N ${shellQuote(buildLogQueryUrl(requestUrl, query))} \\`,
    `  --header ${shellQuote(`X-Quilr-Log-Export-Key: ${exportKey}`)}`,
    '# Newline-delimited JSON. Follow checkpoint.next_cursor for more pages.',
  ].join('\n');
}

function buildLogPython(requestUrl, exportKey, query) {
  return `import requests

url = ${JSON.stringify(requestUrl)}
export_key = ${JSON.stringify(exportKey)}
params = ${formatJson(query)}

# Page through the export until the checkpoint has no more rows.
while True:
    resp = requests.get(url, headers={"X-Quilr-Log-Export-Key": export_key}, params=params, timeout=60)
    resp.raise_for_status()
    checkpoint = None
    for line in resp.text.splitlines():
        if not line.strip():
            continue
        event = __import__("json").loads(line)
        if event.get("type") == "checkpoint":
            checkpoint = event
        # else: event is a log row you can collect.
    if not (checkpoint and checkpoint.get("has_more") and checkpoint.get("next_cursor")):
        break
    params = {"cursor": checkpoint["next_cursor"], "limit": params.get("limit")}
`;
}

function buildLogJs(requestUrl, exportKey, query) {
  return `const url = ${JSON.stringify(requestUrl)};
const exportKey = ${JSON.stringify(exportKey)};
let params = ${formatJson(query)};

// Page through the export until the checkpoint has no more rows.
while (true) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ""));
  const resp = await fetch(\`\${url}?\${qs}\`, { headers: { "X-Quilr-Log-Export-Key": exportKey } });
  if (!resp.ok) throw new Error(\`Export failed \${resp.status}\`);
  const text = await resp.text();
  let checkpoint = null;
  for (const line of text.split(/\\r?\\n/)) {
    if (!line.trim()) continue;
    const event = JSON.parse(line);
    if (event.type === "checkpoint") checkpoint = event;
    // else: event is a log row you can collect.
  }
  if (!checkpoint?.has_more || !checkpoint?.next_cursor) break;
  params = { cursor: checkpoint.next_cursor, limit: params.limit };
}
`;
}

function buildChatPayload({ model, systemPrompt, messages, temperature, maxTokens, stream }) {
  const list = [];
  if (systemPrompt.trim()) list.push({ role: 'system', content: systemPrompt });
  list.push(...messages);
  return {
    model,
    messages: list,
    temperature,
    max_tokens: maxTokens,
    stream,
  };
}

function buildAnthropicPayload({ model, systemPrompt, messages, maxTokens, temperature }) {
  const payload = { model, max_tokens: maxTokens, temperature, messages };
  if (systemPrompt.trim()) payload.system = systemPrompt;
  return payload;
}

function buildResponsesPayload({ model, systemPrompt, messages, maxTokens, temperature }) {
  const payload = {
    model,
    input: messages.map((m) => ({ role: m.role, content: m.content })),
    max_output_tokens: maxTokens,
    temperature,
  };
  if (systemPrompt.trim()) payload.instructions = systemPrompt;
  return payload;
}

function buildConversationPayload(surface, opts) {
  if (surface.id === 'anthropic') return buildAnthropicPayload(opts);
  if (surface.id === 'responses') return buildResponsesPayload(opts);
  return buildChatPayload({ ...opts, stream: opts.stream });
}

function getAssistantText(body, surfaceId) {
  if (!body || typeof body !== 'object') return null;

  if (surfaceId === 'chat') {
    return body.choices?.[0]?.message?.content ?? body.choices?.[0]?.text ?? null;
  }
  if (surfaceId === 'completions') {
    return body.choices?.[0]?.text ?? null;
  }
  if (surfaceId === 'responses') {
    if (typeof body.output_text === 'string') return body.output_text;
    const chunks = [];
    if (Array.isArray(body.output)) {
      body.output.forEach((item) => {
        if (Array.isArray(item.content)) {
          item.content.forEach((part) => {
            if (typeof part.text === 'string') chunks.push(part.text);
          });
        }
      });
    }
    return chunks.length ? chunks.join('\n') : null;
  }
  if (surfaceId === 'anthropic' && Array.isArray(body.content)) {
    const chunks = body.content
      .map((part) => (typeof part.text === 'string' ? part.text : null))
      .filter(Boolean);
    return chunks.length ? chunks.join('\n') : null;
  }
  return null;
}

function getDetectedEntities(result) {
  if (!Array.isArray(result?.predictions)) return [];
  return result.predictions.flatMap((prediction) => {
    const subcategories = prediction.entity_texts_with_subcategories ?? {};
    const entityTexts = Array.isArray(prediction.sensitive_entities)
      ? prediction.sensitive_entities
      : Object.keys(subcategories);
    return entityTexts.map((entity) => ({
      entity,
      subcategory: subcategories[entity] ?? 'detected',
      ruleName: prediction.name ?? prediction.id ?? 'prediction',
    }));
  });
}

function getSdkSafeText(result, checkType) {
  if (!result) return null;
  if (checkType === 'response') return result.processed_text ?? null;
  if (Array.isArray(result.messages)) {
    return result.messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  }
  return null;
}

function getSdkVerdict(result) {
  const action = result?.action ?? result?.status;
  if (action === 'block' || result?.status === 'blocked') {
    return { tone: 'error', label: 'Block', Icon: ShieldAlert, hint: 'Stop the flow and return your own safe fallback.' };
  }
  if (action === 'redact' || result?.status === 'redacted') {
    return { tone: 'redacted', label: 'Redact', Icon: AlertTriangle, hint: 'Use the returned redacted content instead of the original.' };
  }
  return { tone: 'ok', label: 'Allow', Icon: CheckCircle2, hint: 'Forward the original content unchanged.' };
}

/* Code snippet builders */

function buildCurl(url, payload, headers, surface) {
  const lines = [`curl --request POST ${shellQuote(url)} \\`];
  Object.entries(headers).forEach(([name, value]) => {
    lines.push(`  --header ${shellQuote(`${name}: ${value}`)} \\`);
  });
  const dataLine = `  --data ${shellQuote(formatJson(payload))}`;
  if (surface.responseType === 'binary') {
    lines.push(`${dataLine} \\`);
    lines.push('  --output quilr-speech.mp3');
    return lines.join('\n');
  }
  lines.push(dataLine);
  return lines.join('\n');
}

function buildPython(url, payload, headers, surface) {
  if (surface.responseType === 'binary') {
    return `from pathlib import Path

import requests

url = ${JSON.stringify(url)}
payload = ${formatJson(payload)}
headers = ${formatJson(headers)}

response = requests.post(url, headers=headers, json=payload, timeout=60)
response.raise_for_status()

Path("quilr-speech.mp3").write_bytes(response.content)
print(f"wrote {len(response.content)} bytes")
`;
  }
  return `import requests

url = ${JSON.stringify(url)}
payload = ${formatJson(payload)}
headers = ${formatJson(headers)}

response = requests.post(url, headers=headers, json=payload, timeout=60)
print(response.status_code)
response.raise_for_status()
print(response.json())
`;
}

function buildJs(url, payload, headers, surface) {
  if (surface.responseType === 'binary') {
    return `const url = ${JSON.stringify(url)};
const payload = ${formatJson(payload)};
const headers = ${formatJson(headers)};

const response = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});
if (!response.ok) throw new Error(\`Gateway error \${response.status}\`);

const blob = await response.blob();
const audioUrl = URL.createObjectURL(blob);
console.log({ bytes: blob.size, audioUrl });
`;
  }
  return `const url = ${JSON.stringify(url)};
const payload = ${formatJson(payload)};
const headers = ${formatJson(headers)};

const response = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});
const data = await response.json();
if (!response.ok) throw new Error(\`Gateway error \${response.status}\`);
console.log(data);
`;
}

function buildSdkCurl(url, payload, key) {
  return [
    `curl --request POST ${shellQuote(url)} \\`,
    `  --header ${shellQuote(`Authorization: Bearer ${key}`)} \\`,
    `  --header ${shellQuote('Content-Type: application/json')} \\`,
    `  --data ${shellQuote(formatJson(payload))}`,
  ].join('\n');
}

function buildSdkPython(url, payload, key) {
  return `import requests

url = ${JSON.stringify(url)}
sdk_key = ${JSON.stringify(key)}
payload = ${formatJson(payload)}

response = requests.post(
    url,
    headers={"Authorization": f"Bearer {sdk_key}", "Content-Type": "application/json"},
    json=payload,
    timeout=15,
)
response.raise_for_status()
judgement = response.json()

if judgement.get("action") == "block":
    raise ValueError(f"Blocked: {judgement.get('categories_detected', [])}")
if judgement.get("action") == "redact":
    safe = judgement.get("messages") or judgement.get("processed_text")
`;
}

function buildSdkJs(url, payload, key) {
  return `const url = ${JSON.stringify(url)};
const sdkKey = ${JSON.stringify(key)};
const payload = ${formatJson(payload)};

const response = await fetch(url, {
  method: "POST",
  headers: { Authorization: \`Bearer \${sdkKey}\`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
if (!response.ok) throw new Error(\`Check failed \${response.status}\`);

const judgement = await response.json();
if (judgement.action === "block") {
  throw new Error(\`Blocked: \${(judgement.categories_detected ?? []).join(", ")}\`);
}
const safe = judgement.messages ?? judgement.processed_text;
`;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `m${idCounter}`;
}

/* ────────────────────────────────── Component ──────────────────────── */

export default function LlmGatewayStudio() {
  const [baseUrl, setBaseUrl] = useState(REGIONS[0].value);
  const [apiKey, setApiKey] = useState('');
  const [exportKey, setExportKey] = useState('');
  const [showKeyField, setShowKeyField] = useState(false);

  const [surfaceId, setSurfaceId] = useState('chat');
  const [lastGatewaySurface, setLastGatewaySurface] = useState('chat');
  const [selectorType, setSelectorType] = useState('none');
  const [selectorValue, setSelectorValue] = useState('');

  const [model, setModel] = useState(getSurface('chat').model);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('You are a concise, helpful assistant.');

  const [thread, setThread] = useState([]);
  const [composer, setComposer] = useState(STARTER_PROMPTS[0]);

  const [payloadText, setPayloadText] = useState('');
  const [sdkCheckType, setSdkCheckType] = useState('request');
  const [sdkContent, setSdkContent] = useState(
    'My SSN is 219-09-4823. Please help me update my profile.',
  );

  /* Log export surface */
  const [logGateway, setLogGateway] = useState('llm');
  const [logStartTime, setLogStartTime] = useState('');
  const [logEndTime, setLogEndTime] = useState('');
  const [logRowLimit, setLogRowLimit] = useState('1000');
  const [logColumnIds, setLogColumnIds] = useState(() => getDefaultLogColumnIds('llm'));
  const [logRows, setLogRows] = useState([]);
  const [logEvents, setLogEvents] = useState([]);
  const [logCheckpoint, setLogCheckpoint] = useState(null);
  const [logExportStarted, setLogExportStarted] = useState(null);
  const [logLastRun, setLogLastRun] = useState(null);
  const [logProgress, setLogProgress] = useState(null);
  const [logNotice, setLogNotice] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState(null);
  const [binaryUrl, setBinaryUrl] = useState(null);

  const [codeTab, setCodeTab] = useState('curl');
  const [revealSnippet, setRevealSnippet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rightTab, setRightTab] = useState('code');

  const abortRef = useRef(null);
  const threadEndRef = useRef(null);

  const surface = getSurface(surfaceId);
  const isConversation = surface.group === 'chat';
  const isEditor = surface.group === 'editor';
  const isSdk = surface.group === 'sdk';
  const isLogs = surface.group === 'logs';
  const topTab = getTopTab(surface.group);

  /* Log export derived state */
  const logGatewayConfig = getLogGateway(logGateway);
  const logColumns = LOG_COLUMN_SETS[logGateway];
  const logSelectedColumns = logColumns.filter((column) => logColumnIds.has(column.id));
  const logMaxRows = Math.max(1, Number.parseInt(logRowLimit, 10) || 1);
  const logPageSize = Math.min(5000, logMaxRows);
  const logQueryPreview = {
    start_time: localDatetimeToIso(logStartTime),
    end_time: localDatetimeToIso(logEndTime),
    limit: String(Math.min(logPageSize, logMaxRows)),
  };

  const requestMethod = surface.method ?? 'POST';
  const surfacePath = isLogs ? logGatewayConfig.path : surface.path;
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const requestUrl = normalizedBase ? `${normalizedBase}${surfacePath}` : surfacePath;
  const activeRegion = REGIONS.find((r) => r.value === normalizedBase) ?? null;
  const isCustomUrl = Boolean(normalizedBase) && !activeRegion;

  const keyKind = surface.keyKind === 'export' ? 'export' : 'standard';
  const activeKey = isLogs ? exportKey : apiKey;
  const setActiveKey = isLogs ? setExportKey : setApiKey;
  const keyPrefix = keyKind === 'export' ? 'sk-export-' : 'sk-quilr-';
  const keyLooksWrong = activeKey.trim().length > 0 && !activeKey.trim().startsWith(keyPrefix);

  useEffect(() => {
    return () => {
      if (binaryUrl) URL.revokeObjectURL(binaryUrl);
    };
  }, [binaryUrl]);

  useEffect(() => {
    if (isConversation && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ block: 'end' });
    }
  }, [thread, isConversation]);

  // Seed the export window on the client only (keeps SSR output deterministic).
  useEffect(() => {
    const initial = getInitialLogWindow();
    setLogStartTime(initial.start);
    setLogEndTime(initial.end);
  }, []);

  /* Connection status for the topbar pill */
  const connection = (() => {
    if (isRunning) return { tone: 'running', text: isLogs ? 'Exporting' : 'Connecting' };
    if (error) return { tone: 'error', text: 'Last request failed' };
    if (isLogs && logLastRun) {
      return { tone: 'ok', text: `${logLastRun.rows.toLocaleString()} rows - ${(logLastRun.durationMs / 1000).toFixed(1)} s` };
    }
    if (!isLogs && lastResponse?.ok) return { tone: 'ok', text: `${lastResponse.status} - ${lastResponse.latencyMs} ms` };
    if (!normalizedBase) return { tone: 'idle', text: 'No endpoint set' };
    return { tone: 'idle', text: 'Ready' };
  })();

  /* The request body shown in the code/inspect panels */
  const previewMessages = useMemo(() => {
    if (thread.length) return thread.map((m) => ({ role: m.role, content: m.content }));
    const draft = composer.trim() || 'Hello from the QuilrAI gateway playground.';
    return [{ role: 'user', content: draft }];
  }, [thread, composer]);

  const editorParse = useMemo(
    () => (isEditor ? parseJsonWithError(payloadText) : { value: null, error: null }),
    [isEditor, payloadText],
  );
  const editorError =
    isEditor && (editorParse.error || (!isPlainObject(editorParse.value) ? 'Request body must be a JSON object.' : null));

  const sdkPayload = useMemo(() => {
    if (sdkCheckType === 'response') return { type: 'response', text: sdkContent };
    return {
      type: 'request',
      messages: [{ role: 'user', content: sdkContent }],
      metadata: { caller: 'docs-playground', team_id: 'sales' },
    };
  }, [sdkCheckType, sdkContent]);

  const effectivePayload = useMemo(() => {
    if (isSdk) return sdkPayload;
    if (isEditor) {
      if (editorError) return null;
      return surface.selector ? withSelector(editorParse.value, selectorType, selectorValue) : editorParse.value;
    }
    const built = buildConversationPayload(surface, {
      model,
      systemPrompt,
      messages: previewMessages,
      temperature,
      maxTokens,
      stream: surface.id === 'chat' && streamEnabled,
    });
    return surface.selector ? withSelector(built, selectorType, selectorValue) : built;
  }, [
    isSdk,
    isEditor,
    sdkPayload,
    editorError,
    editorParse.value,
    surface,
    selectorType,
    selectorValue,
    model,
    systemPrompt,
    previewMessages,
    temperature,
    maxTokens,
    streamEnabled,
  ]);

  const snippetKeyValue = isLogs
    ? snippetKey(exportKey, revealSnippet, 'sk-export-...')
    : snippetKey(apiKey, revealSnippet);
  const activeSnippet = useMemo(() => {
    if (isLogs) {
      if (codeTab === 'python') return buildLogPython(requestUrl, snippetKeyValue, logQueryPreview);
      if (codeTab === 'javascript') return buildLogJs(requestUrl, snippetKeyValue, logQueryPreview);
      return buildLogCurl(requestUrl, snippetKeyValue, logQueryPreview);
    }
    if (isSdk) {
      if (codeTab === 'python') return buildSdkPython(requestUrl, sdkPayload, snippetKeyValue);
      if (codeTab === 'javascript') return buildSdkJs(requestUrl, sdkPayload, snippetKeyValue);
      return buildSdkCurl(requestUrl, sdkPayload, snippetKeyValue);
    }
    if (!effectivePayload) return '// Fix the JSON request body to generate a runnable example.';
    const headers = getHeaders(surface, snippetKeyValue);
    if (codeTab === 'python') return buildPython(requestUrl, effectivePayload, headers, surface);
    if (codeTab === 'javascript') return buildJs(requestUrl, effectivePayload, headers, surface);
    return buildCurl(requestUrl, effectivePayload, headers, surface);
  }, [
    isLogs,
    isSdk,
    codeTab,
    requestUrl,
    sdkPayload,
    snippetKeyValue,
    effectivePayload,
    surface,
    logQueryPreview.start_time,
    logQueryPreview.end_time,
    logQueryPreview.limit,
  ]);

  /* ── Actions ── */

  function resetRunState() {
    setError(null);
    setLastResponse(null);
    if (binaryUrl) {
      URL.revokeObjectURL(binaryUrl);
      setBinaryUrl(null);
    }
  }

  function selectSurface(nextId) {
    const next = getSurface(nextId);
    setSurfaceId(nextId);
    if (next.group === 'chat' || next.group === 'editor') setLastGatewaySurface(nextId);
    setSelectorType('none');
    setSelectorValue('');
    resetRunState();
    if (next.model) setModel(next.model);
    if (next.group === 'editor') setPayloadText(formatJson(next.sample));
  }

  function selectTopTab(tab) {
    if (tab === topTab) return;
    if (tab === 'gateway') {
      selectSurface(lastGatewaySurface);
    } else {
      selectSurface(STUDIO_TABS.find((t) => t.id === tab).surface);
    }
  }

  function clearConversation() {
    if (isRunning) return;
    setThread([]);
    resetRunState();
  }

  /* ── Log export actions ── */

  function resetLogRun() {
    setLogRows([]);
    setLogEvents([]);
    setLogCheckpoint(null);
    setLogExportStarted(null);
    setLogLastRun(null);
    setLogProgress(null);
    setLogNotice(null);
    setError(null);
  }

  function switchLogGateway(next) {
    if (isRunning) return;
    setLogGateway(next);
    setLogColumnIds(getDefaultLogColumnIds(next));
    resetLogRun();
  }

  function toggleLogColumn(columnId) {
    setLogColumnIds((current) => {
      const next = new Set(current);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  }

  function downloadLogCsv() {
    if (!logRows.length) return;
    const csv = buildLogCsv(logRows, logSelectedColumns);
    const datestamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`quilr-${logGateway}-logs-${datestamp}.csv`, csv);
  }

  async function runLogExport() {
    if (isRunning) return;
    if (!normalizedBase || !exportKey.trim() || logSelectedColumns.length === 0) return;

    setError(null);
    setRightTab('response');
    setIsRunning(true);
    setLogRows([]);
    setLogEvents([]);
    setLogCheckpoint(null);
    setLogExportStarted(null);
    setLogLastRun(null);
    setLogProgress({ pages: 0, rows: 0 });
    setLogNotice(null);

    const window_ = normalizeLogWindow(logStartTime, logEndTime);
    if (window_.startTime !== logStartTime) setLogStartTime(window_.startTime);
    if (window_.endTime !== logEndTime) setLogEndTime(window_.endTime);
    if (window_.notice) setLogNotice(window_.notice);

    const controller = new AbortController();
    abortRef.current = controller;

    const collectedRows = [];
    const collectedEvents = [];
    const startedAt = performance.now();
    let cursor = '';
    let latestCheckpoint = null;
    let latestExportStarted = null;
    let pageCount = 0;

    try {
      while (collectedRows.length < logMaxRows) {
        const remaining = logMaxRows - collectedRows.length;
        const params = cursor
          ? { cursor, limit: String(Math.min(logPageSize, remaining)) }
          : {
              start_time: window_.startIso,
              end_time: window_.endIso,
              limit: String(Math.min(logPageSize, remaining)),
            };

        const url = new URL(requestUrl);
        Object.entries(params).forEach(([name, value]) => {
          if (value != null && value !== '') url.searchParams.set(name, value);
        });
        const response = await fetch(url, {
          headers: { 'X-Quilr-Log-Export-Key': exportKey.trim() },
          signal: controller.signal,
        });
        const text = await response.text();
        if (!response.ok) throw new Error(getLogRequestError(response, text));
        const pageEvents = parseNdjson(text);

        pageCount += 1;
        collectedEvents.push(...pageEvents);
        latestExportStarted = latestExportStarted ?? pageEvents.find((i) => i.type === 'export_started') ?? null;
        latestCheckpoint = pageEvents.find((i) => i.type === 'checkpoint') ?? latestCheckpoint;
        collectedRows.push(...pageEvents.filter((i) => i.type === logGatewayConfig.rowType).slice(0, remaining));
        setLogProgress({ pages: pageCount, rows: collectedRows.length });

        if (!latestCheckpoint?.has_more || !latestCheckpoint?.next_cursor || collectedRows.length >= logMaxRows) {
          break;
        }
        cursor = latestCheckpoint.next_cursor;
      }

      setLogRows(collectedRows);
      setLogEvents(collectedEvents);
      setLogCheckpoint(latestCheckpoint);
      setLogExportStarted(latestExportStarted);
      setLogLastRun({
        rows: collectedRows.length,
        pages: pageCount,
        durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
      });
    } catch (err) {
      const aborted = err.name === 'AbortError';
      if (aborted) {
        setError('Export stopped.');
      } else if (err instanceof SyntaxError) {
        setError('The export response was not valid newline-delimited JSON.');
      } else {
        setError(
          err.message ||
            'The browser could not reach the log export endpoint. Check the endpoint, key, and CORS policy.',
        );
      }
    } finally {
      abortRef.current = null;
      setIsRunning(false);
      setLogProgress(null);
    }
  }

  function setMeta(response, startedAt, ok, body) {
    setLastResponse({
      ok,
      status: response?.status ?? 0,
      statusText: response?.statusText ?? '',
      latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
      contentType: response?.headers?.get('content-type') ?? 'unknown',
      requestId:
        response?.headers?.get('x-request-id') ??
        response?.headers?.get('x-quilr-request-id') ??
        response?.headers?.get('cf-ray') ??
        'not returned',
      body,
      surfaceLabel: surface.label,
    });
  }

  function updateAssistant(id, patch) {
    setThread((current) => current.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function streamChatInto(assistantId, payload, startedAt) {
    const controller = new AbortController();
    abortRef.current = controller;
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: getHeaders(surface, apiKey.trim()),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      const json = parseJson(text);
      const detail = json?.error?.message || json?.detail || text || `HTTP ${response.status}`;
      updateAssistant(assistantId, { content: '', status: 'error', error: detail });
      setMeta(response, startedAt, false, json ?? text);
      setError(detail);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let acc = '';

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';
      for (const event of events) {
        for (const line of event.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;
          const json = parseJson(data);
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string') {
            acc += delta;
            updateAssistant(assistantId, { content: acc });
          }
        }
      }
    }

    updateAssistant(assistantId, { content: acc, status: acc ? 'done' : 'empty' });
    setMeta(response, startedAt, true, acc || '(empty stream)');
  }

  async function sendConversation() {
    const draft = composer.trim();
    if (!draft || isRunning) return;

    const userMsg = { id: nextId(), role: 'user', content: draft };
    const assistantMsg = { id: nextId(), role: 'assistant', content: '', status: 'streaming' };
    const nextThread = [...thread, userMsg];
    setThread([...nextThread, assistantMsg]);
    setComposer('');
    setError(null);
    setRightTab('response');
    setIsRunning(true);

    const startedAt = performance.now();
    const reqMessages = nextThread
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));
    const shouldStream = surface.id === 'chat' && streamEnabled;
    const payload = withSelectorMaybe(
      buildConversationPayload(surface, {
        model,
        systemPrompt,
        messages: reqMessages,
        temperature,
        maxTokens,
        stream: shouldStream,
      }),
    );

    try {
      if (shouldStream) {
        await streamChatInto(assistantMsg.id, payload, startedAt);
      } else {
        const controller = new AbortController();
        abortRef.current = controller;
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: getHeaders(surface, apiKey.trim()),
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const text = await response.text();
        const json = parseJson(text);
        if (!response.ok) {
          const detail = json?.error?.message || json?.detail || text || `HTTP ${response.status}`;
          updateAssistant(assistantMsg.id, { content: '', status: 'error', error: detail });
          setMeta(response, startedAt, false, json ?? text);
          setError(detail);
        } else {
          const out = getAssistantText(json, surface.id) ?? '(no text in response)';
          updateAssistant(assistantMsg.id, { content: out, status: 'done' });
          setMeta(response, startedAt, true, json ?? text);
        }
      }
    } catch (err) {
      const aborted = err.name === 'AbortError';
      updateAssistant(assistantMsg.id, {
        status: 'error',
        error: aborted ? 'Stopped.' : 'Could not reach the gateway. Check the endpoint, network, and CORS.',
      });
      if (!aborted) {
        setError('The browser could not reach the gateway endpoint. Check the endpoint, network access, and CORS policy.');
      }
    } finally {
      abortRef.current = null;
      setIsRunning(false);
    }
  }

  function withSelectorMaybe(payload) {
    return surface.selector ? withSelector(payload, selectorType, selectorValue) : payload;
  }

  async function runSingle() {
    if (isRunning) return;
    if (isEditor && editorError) return;

    setError(null);
    resetRunState();
    setRightTab('response');
    setIsRunning(true);
    const startedAt = performance.now();
    const controller = new AbortController();
    abortRef.current = controller;
    const isBinary = surface.responseType === 'binary';

    try {
      const payload = isSdk ? sdkPayload : effectivePayload;
      const headers = isSdk
        ? { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' }
        : getHeaders(surface, apiKey.trim());

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (isBinary && response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBinaryUrl(objectUrl);
        setMeta(response, startedAt, true, {
          binary_response: { content_type: response.headers.get('content-type'), bytes: blob.size },
        });
      } else {
        const text = await response.text();
        const json = parseJson(text);
        const body = json ?? text;
        setMeta(response, startedAt, response.ok, body);
        if (!response.ok) {
          const detail = json?.error?.message || json?.detail || json?.message || text || `HTTP ${response.status}`;
          const hint =
            isSdk && (response.status === 403 || String(detail).includes('sdk_mode_required'))
              ? ' Guardrail check needs a quilr_sdk key. Use a Conversation or Data surface for normal provider keys.'
              : '';
          setError(`${detail}${hint}`);
        }
      }
    } catch (err) {
      const aborted = err.name === 'AbortError';
      setError(
        aborted
          ? 'Request stopped.'
          : 'The browser could not reach the gateway endpoint. Check the endpoint, network access, and CORS policy.',
      );
    } finally {
      abortRef.current = null;
      setIsRunning(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const canRun = Boolean(normalizedBase && apiKey.trim()) && !isRunning;
  const canRunLogs =
    Boolean(normalizedBase && exportKey.trim() && logSelectedColumns.length > 0) && !isRunning;

  /* ── Render ── */

  return (
    <div className={styles.studio}>
      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <span className={styles.kicker}>QuilrAI</span>
          <h1 className={styles.title}>LLM Gateway Studio</h1>
        </div>
        <div className={styles.topbarMeta}>
          <code className={styles.endpointPath} title={requestUrl}>
            {requestMethod} {surfacePath}
          </code>
          <span className={`${styles.statusPill} ${styles[`tone_${connection.tone}`]}`}>
            <span className={styles.statusDot} />
            {connection.text}
          </span>
        </div>
      </header>

      <nav className={styles.tabBar} aria-label="Studio mode">
        {STUDIO_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${topTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => selectTopTab(tab.id)}
            aria-current={topTab === tab.id ? 'page' : undefined}
          >
            <tab.Icon size={15} aria-hidden /> {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.panes}>
        {/* ── Left rail: connection + surface + routing ── */}
        <aside className={`${styles.rail} ${styles.railLeft}`}>
          <section className={styles.railSection}>
            <div className={styles.railHeading}>
              <Link2 size={13} aria-hidden /> Endpoint
            </div>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Base URL</span>
              <input
                className={`${styles.input} ${styles.mono}`}
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://your-gateway.example.com"
                type="url"
                spellCheck="false"
                autoComplete="off"
              />
            </label>
            <div className={styles.regionChips}>
              {REGIONS.map((region) => (
                <button
                  key={region.value}
                  type="button"
                  className={`${styles.chip} ${activeRegion?.value === region.value ? styles.chipActive : ''}`}
                  onClick={() => setBaseUrl(region.value)}
                >
                  {region.label}
                </button>
              ))}
              <span className={`${styles.chip} ${styles.chipCustom} ${isCustomUrl ? styles.chipActive : ''}`}>
                {isCustomUrl ? 'Custom URL' : 'Custom'}
              </span>
            </div>
          </section>

          <section className={styles.railSection}>
            <div className={styles.railHeading}>
              <KeyRound size={13} aria-hidden /> {isLogs ? 'Log export key' : 'API key'}
            </div>
            <div className={styles.keyRow}>
              <input
                className={`${styles.input} ${styles.mono}`}
                value={activeKey}
                onChange={(e) => setActiveKey(e.target.value)}
                placeholder={`${keyPrefix}...`}
                type={showKeyField ? 'text' : 'password'}
                spellCheck="false"
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.revealBtn}
                onClick={() => setShowKeyField((v) => !v)}
                aria-label={showKeyField ? 'Hide key' : 'Show key'}
                title={showKeyField ? 'Hide key' : 'Show key'}
              >
                {showKeyField ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
              </button>
            </div>
            {keyLooksWrong && (
              <p className={styles.warn}>
                Keys usually start with <code>{keyPrefix}</code>.
              </p>
            )}
            <p className={styles.subtle}>
              {isLogs
                ? 'Use a Log Export key (sk-export-...), not a model-call or admin key. Sent from your browser only; never stored.'
                : 'Sent from your browser to the gateway only. Never stored.'}
            </p>
          </section>

          <section className={styles.railSection}>
            <div className={styles.railHeading}>
              <Terminal size={13} aria-hidden /> {topTab === 'gateway' ? 'Surface' : surface.label}
            </div>
            {topTab === 'gateway' &&
              GATEWAY_CATEGORIES.map((category) => (
                <div key={category} className={styles.surfaceGroup}>
                  <span className={styles.surfaceGroupLabel}>{category}</span>
                  <div className={styles.surfacePills}>
                    {SURFACES.filter((s) => s.category === category).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`${styles.surfacePill} ${surfaceId === s.id ? styles.surfacePillActive : ''}`}
                        onClick={() => selectSurface(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            <p className={styles.surfaceBlurb}>{surface.blurb}</p>
          </section>

          {surface.selector && (
            <section className={styles.railSection}>
              <div className={styles.railHeading}>Provider routing</div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Selector</span>
                <select
                  className={styles.input}
                  value={selectorType}
                  onChange={(e) => setSelectorType(e.target.value)}
                >
                  {PROVIDER_SELECTOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {selectorType !== 'none' && (
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>
                    {selectorType === 'provider' ? 'Provider type' : 'Provider label'}
                  </span>
                  <input
                    className={`${styles.input} ${styles.mono}`}
                    value={selectorValue}
                    onChange={(e) => setSelectorValue(e.target.value)}
                    placeholder={selectorType === 'provider' ? 'bedrock' : 'azure-westus'}
                    spellCheck="false"
                  />
                </label>
              )}
            </section>
          )}
        </aside>

        {/* ── Center: conversation / editor / sdk ── */}
        <main className={`${styles.center} ${isConversation ? styles.centerChat : styles.centerScroll}`}>
          {isConversation && (
            <ConversationPane
              styles={styles}
              surface={surface}
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              model={model}
              setModel={setModel}
              temperature={temperature}
              setTemperature={setTemperature}
              maxTokens={maxTokens}
              setMaxTokens={setMaxTokens}
              streamEnabled={streamEnabled}
              setStreamEnabled={setStreamEnabled}
              thread={thread}
              composer={composer}
              setComposer={setComposer}
              isRunning={isRunning}
              canRun={canRun}
              onSend={sendConversation}
              onStop={stop}
              onClear={clearConversation}
              error={error}
              threadEndRef={threadEndRef}
            />
          )}

          {isEditor && (
            <EditorPane
              styles={styles}
              surface={surface}
              payloadText={payloadText}
              setPayloadText={setPayloadText}
              editorError={editorError}
              onReset={() => setPayloadText(formatJson(surface.sample))}
              onRun={runSingle}
              onStop={stop}
              isRunning={isRunning}
              canRun={canRun && !editorError}
              lastResponse={lastResponse}
              binaryUrl={binaryUrl}
              error={error}
            />
          )}

          {isSdk && (
            <SdkPane
              styles={styles}
              checkType={sdkCheckType}
              setCheckType={(t) => {
                setSdkCheckType(t);
                resetRunState();
              }}
              content={sdkContent}
              setContent={setSdkContent}
              onRun={runSingle}
              isRunning={isRunning}
              canRun={canRun}
              lastResponse={lastResponse}
              error={error}
            />
          )}

          {isLogs && (
            <LogsPane
              styles={styles}
              gateway={logGateway}
              gatewayConfig={logGatewayConfig}
              onSwitchGateway={switchLogGateway}
              startTime={logStartTime}
              endTime={logEndTime}
              onStartTimeChange={(value) => {
                setLogStartTime(value);
                setLogNotice(null);
              }}
              onEndTimeChange={(value) => {
                setLogEndTime(value);
                setLogNotice(null);
              }}
              rowLimit={logRowLimit}
              setRowLimit={setLogRowLimit}
              columns={logColumns}
              selectedColumnIds={logColumnIds}
              selectedCount={logSelectedColumns.length}
              onToggleColumn={toggleLogColumn}
              onSelectAllColumns={() => setLogColumnIds(new Set(logColumns.map((c) => c.id)))}
              onResetColumns={() => setLogColumnIds(getDefaultLogColumnIds(logGateway))}
              onClearColumns={() => setLogColumnIds(new Set())}
              notice={logNotice}
              progress={logProgress}
              lastRun={logLastRun}
              rows={logRows}
              previewColumns={logSelectedColumns.slice(0, 8)}
              error={error}
              isRunning={isRunning}
              canRun={canRunLogs}
              onRun={runLogExport}
              onStop={stop}
              onDownload={downloadLogCsv}
            />
          )}
        </main>

        {/* ── Right rail: code + response ── */}
        <aside className={`${styles.rail} ${styles.railRight}`}>
          <div className={styles.panelTabs} role="tablist">
            <button
              type="button"
              className={`${styles.panelTab} ${rightTab === 'code' ? styles.panelTabActive : ''}`}
              onClick={() => setRightTab('code')}
            >
              <Code2 size={14} aria-hidden /> Code
            </button>
            <button
              type="button"
              className={`${styles.panelTab} ${rightTab === 'response' ? styles.panelTabActive : ''}`}
              onClick={() => setRightTab('response')}
            >
              <Terminal size={14} aria-hidden /> Response
            </button>
          </div>

          {rightTab === 'code' ? (
            <div className={styles.panelBody}>
              <div className={styles.codeHead}>
                <div className={styles.langTabs}>
                  {CODE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`${styles.langTab} ${codeTab === tab.id ? styles.langTabActive : ''}`}
                      onClick={() => setCodeTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className={styles.codeActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => setRevealSnippet((v) => !v)}
                    aria-label={revealSnippet ? 'Mask key in code' : 'Reveal key in code'}
                    title={revealSnippet ? 'Mask key' : 'Reveal key'}
                  >
                    {revealSnippet ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
                  </button>
                  <button type="button" className={styles.copyBtn} onClick={copySnippet}>
                    {copied ? <Check size={14} aria-hidden /> : <Clipboard size={14} aria-hidden />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre className={styles.codeBlock}>{activeSnippet}</pre>
              {isLogs ? (
                <>
                  <div className={styles.previewLabel}>Query parameters</div>
                  <pre className={styles.rawBlock}>{formatJson(logQueryPreview)}</pre>
                </>
              ) : (
                <>
                  <div className={styles.previewLabel}>Request body</div>
                  <pre className={styles.rawBlock}>
                    {effectivePayload ? formatJson(effectivePayload) : '// Fix the request body to preview the payload.'}
                  </pre>
                </>
              )}
            </div>
          ) : (
            <div className={styles.panelBody}>
              {error && (
                <div className={styles.errorBox}>
                  <AlertTriangle size={15} aria-hidden />
                  <span>{error}</span>
                </div>
              )}

              {isLogs ? (
                logLastRun || logProgress ? (
                  <>
                    <div className={styles.metaGrid}>
                      <div className={styles.metaCell}>
                        <span>Rows</span>
                        <strong>{(logProgress?.rows ?? logLastRun?.rows ?? 0).toLocaleString()}</strong>
                      </div>
                      <div className={styles.metaCell}>
                        <span>Pages</span>
                        <strong>{logProgress?.pages ?? logLastRun?.pages ?? 0}</strong>
                      </div>
                      <div className={styles.metaCell}>
                        <span>Duration</span>
                        <strong>{logLastRun ? `${(logLastRun.durationMs / 1000).toFixed(1)} s` : '-'}</strong>
                      </div>
                    </div>
                    <div className={styles.previewLabel}>Effective export window</div>
                    <pre className={styles.rawBlock}>
                      {logExportStarted ? formatJson(logExportStarted) : '// Run an export to see the effective window.'}
                    </pre>
                    <div className={styles.previewLabel}>Checkpoint</div>
                    <pre className={styles.rawBlock}>
                      {logCheckpoint ? formatJson(logCheckpoint) : '// Pagination state appears here.'}
                    </pre>
                    <div className={styles.previewLabel}>Events</div>
                    <pre className={styles.rawBlock}>
                      {logEvents.length
                        ? formatJson({
                            total_events: logEvents.length,
                            request_rows: logRows.length,
                            event_types: [...new Set(logEvents.map((e) => e.type))],
                          })
                        : '// No response events loaded yet.'}
                    </pre>
                  </>
                ) : (
                  !error && (
                    <div className={styles.emptyInspect}>
                      <Terminal size={22} aria-hidden />
                      <p>Run an export to inspect the effective window, checkpoint pagination, and event counts.</p>
                    </div>
                  )
                )
              ) : lastResponse ? (
                <>
                  <div className={styles.metaGrid}>
                    <div className={styles.metaCell}>
                      <span>HTTP</span>
                      <strong>{lastResponse.status || '-'}</strong>
                    </div>
                    <div className={styles.metaCell}>
                      <span>Latency</span>
                      <strong>{lastResponse.latencyMs} ms</strong>
                    </div>
                    <div className={styles.metaCell}>
                      <span>Request ID</span>
                      <strong className={styles.mono}>{lastResponse.requestId}</strong>
                    </div>
                  </div>
                  <div className={styles.previewLabel}>Raw response</div>
                  <pre className={styles.rawBlock}>
                    {typeof lastResponse.body === 'string' ? lastResponse.body : formatJson(lastResponse.body)}
                  </pre>
                </>
              ) : (
                !error && (
                  <div className={styles.emptyInspect}>
                    <Terminal size={22} aria-hidden />
                    <p>Run a request to inspect the status, latency, request ID, and raw response.</p>
                  </div>
                )
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ────────────────────────────────── Conversation pane ──────────────── */

function ConversationPane({
  styles,
  surface,
  systemPrompt,
  setSystemPrompt,
  model,
  setModel,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  streamEnabled,
  setStreamEnabled,
  thread,
  composer,
  setComposer,
  isRunning,
  canRun,
  onSend,
  onStop,
  onClear,
  error,
  threadEndRef,
}) {
  function onKeyDown(event) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <>
      <div className={styles.centerHeader}>
        <label className={styles.systemField}>
          <span className={styles.fieldLabel}>System</span>
          <input
            className={styles.systemInput}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Set the assistant's behavior..."
          />
        </label>
        <button type="button" className={styles.clearBtn} onClick={onClear} disabled={isRunning || !thread.length}>
          <Trash2 size={14} aria-hidden /> Clear
        </button>
      </div>

      <div className={styles.paramBar}>
        <label className={styles.param}>
          <span>Model</span>
          <input
            className={`${styles.paramInput} ${styles.mono}`}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            spellCheck="false"
          />
        </label>
        <label className={styles.param}>
          <span>Temp {temperature.toFixed(1)}</span>
          <input
            className={styles.range}
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </label>
        <label className={styles.param}>
          <span>Max tokens</span>
          <input
            className={styles.paramInput}
            type="number"
            min="1"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value) || 1)}
          />
        </label>
        {surface.id === 'chat' && (
          <label className={`${styles.param} ${styles.streamToggle}`}>
            <span>Stream</span>
            <input type="checkbox" checked={streamEnabled} onChange={(e) => setStreamEnabled(e.target.checked)} />
          </label>
        )}
      </div>

      <div className={styles.thread}>
        {thread.length === 0 && (
          <div className={styles.threadEmpty}>
            <div className={styles.threadEmptyMark}>{'{ }'}</div>
            <h2>Send your first request</h2>
            <p>
              Tokens stream straight from the gateway into this thread. Try a starter prompt or write your own below.
            </p>
            <div className={styles.starters}>
              {STARTER_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" className={styles.starter} onClick={() => setComposer(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {thread.map((message) => (
          <div
            key={message.id}
            className={`${styles.msg} ${message.role === 'user' ? styles.msgUser : styles.msgAssistant}`}
          >
            <div className={styles.msgRole}>{message.role}</div>
            <div className={styles.msgBody}>
              {message.content}
              {message.status === 'streaming' && <span className={styles.caret} />}
              {message.status === 'error' && <span className={styles.msgError}>{message.error}</span>}
            </div>
          </div>
        ))}
        <div ref={threadEndRef} />
      </div>

      {error && !thread.some((m) => m.status === 'error') && (
        <div className={styles.composerError}>
          <AlertTriangle size={14} aria-hidden /> {error}
        </div>
      )}

      <div className={styles.composer}>
        <textarea
          className={styles.composerInput}
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Send a message...   (Cmd/Ctrl + Enter)"
          spellCheck="true"
        />
        {isRunning ? (
          <button type="button" className={styles.stopBtn} onClick={onStop}>
            <Square size={15} aria-hidden /> Stop
          </button>
        ) : (
          <button type="button" className={styles.sendBtn} onClick={onSend} disabled={!canRun || !composer.trim()}>
            <Send size={15} aria-hidden /> Send
          </button>
        )}
      </div>
    </>
  );
}

/* ────────────────────────────────── Editor pane ────────────────────── */

function EditorPane({
  styles,
  surface,
  payloadText,
  setPayloadText,
  editorError,
  onReset,
  onRun,
  onStop,
  isRunning,
  canRun,
  lastResponse,
  binaryUrl,
  error,
}) {
  const result = lastResponse?.ok ? buildEditorResult(surface, lastResponse.body) : null;

  return (
    <>
      <div className={styles.centerHeader}>
        <div>
          <h2 className={styles.editorTitle}>{surface.label} request</h2>
          <code className={styles.editorPath}>{surface.path}</code>
        </div>
        <button type="button" className={styles.clearBtn} onClick={onReset} disabled={isRunning}>
          <RotateCcw size={14} aria-hidden /> Reset
        </button>
      </div>

      <textarea
        className={`${styles.jsonEditor} ${styles.mono}`}
        value={payloadText}
        onChange={(e) => setPayloadText(e.target.value)}
        spellCheck="false"
        aria-label="Request JSON"
      />
      {editorError && <p className={styles.warn}>{editorError}</p>}

      {error && (
        <div className={styles.composerError}>
          <AlertTriangle size={14} aria-hidden /> {error}
        </div>
      )}

      {result && (
        <div className={styles.resultCard}>
          <div className={styles.previewLabel}>{result.label}</div>
          {result.kind === 'audio' ? (
            <audio className={styles.audio} controls src={binaryUrl} />
          ) : (
            <pre className={styles.resultBody}>{result.text}</pre>
          )}
        </div>
      )}

      <div className={styles.composer}>
        <div className={styles.editorRunNote}>
          {surface.responseType === 'binary' ? 'Returns audio you can play back here.' : 'Sends one request to the gateway.'}
        </div>
        {isRunning ? (
          <button type="button" className={styles.stopBtn} onClick={onStop}>
            <Square size={15} aria-hidden /> Stop
          </button>
        ) : (
          <button type="button" className={styles.sendBtn} onClick={onRun} disabled={!canRun}>
            {surface.responseType === 'binary' ? <Volume2 size={15} aria-hidden /> : <Send size={15} aria-hidden />} Run
          </button>
        )}
      </div>
    </>
  );
}

function buildEditorResult(surface, body) {
  if (surface.id === 'tts') {
    return { kind: 'audio', label: 'Audio preview' };
  }
  if (surface.id === 'embeddings' && Array.isArray(body?.data)) {
    const dims = body.data[0]?.embedding?.length;
    return {
      kind: 'text',
      label: 'Result',
      text: `Returned ${body.data.length} embedding${body.data.length === 1 ? '' : 's'}${
        dims ? `; first vector has ${dims} dimensions.` : '.'
      }`,
    };
  }
  if (surface.id === 'rerank' && Array.isArray(body?.results)) {
    return {
      kind: 'text',
      label: 'Ranking',
      text: body.results.map((r, i) => `${i + 1}. index ${r.index}  -  score ${r.relevance_score}`).join('\n'),
    };
  }
  if (surface.id === 'completions') {
    const text = body?.choices?.[0]?.text;
    if (text) return { kind: 'text', label: 'Completion', text };
  }
  return null;
}

/* ────────────────────────────────── SDK pane ───────────────────────── */

function SdkPane({ styles, checkType, setCheckType, content, setContent, onRun, isRunning, canRun, lastResponse, error }) {
  const result = lastResponse?.ok ? lastResponse.body : null;
  const verdict = result ? getSdkVerdict(result) : null;
  const entities = getDetectedEntities(result);
  const safeText = getSdkSafeText(result, checkType);

  return (
    <>
      <div className={styles.centerHeader}>
        <div>
          <h2 className={styles.editorTitle}>Guardrail check</h2>
          <code className={styles.editorPath}>POST /sdk/v1/check</code>
        </div>
        <div className={styles.sdkToggle} role="group" aria-label="Check type">
          <button
            type="button"
            className={checkType === 'request' ? styles.sdkToggleActive : ''}
            onClick={() => setCheckType('request')}
          >
            Request
          </button>
          <button
            type="button"
            className={checkType === 'response' ? styles.sdkToggleActive : ''}
            onClick={() => setCheckType('response')}
          >
            Response
          </button>
        </div>
      </div>

      <label className={styles.sdkField}>
        <span className={styles.fieldLabel}>{checkType === 'request' ? 'User message' : 'Model output'}</span>
        <textarea
          className={styles.sdkText}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
      </label>

      {verdict && (
        <div className={`${styles.verdict} ${styles[`tone_${verdict.tone}`]}`}>
          <verdict.Icon size={18} aria-hidden />
          <div>
            <strong>{verdict.label}</strong>
            <span>{verdict.hint}</span>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.composerError}>
          <AlertTriangle size={14} aria-hidden /> {error}
        </div>
      )}

      {entities.length > 0 && (
        <div className={styles.resultCard}>
          <div className={styles.previewLabel}>Detected entities</div>
          <div className={styles.entityList}>
            {entities.map((item, index) => (
              <div key={`${item.entity}-${index}`} className={styles.entityItem}>
                <code>{item.entity}</code>
                <div>
                  <strong>{item.subcategory}</strong>
                  <span>{item.ruleName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {safeText && (
        <div className={styles.resultCard}>
          <div className={styles.previewLabel}>Caller-safe content</div>
          <pre className={styles.resultBody}>{safeText}</pre>
        </div>
      )}

      <div className={styles.composer}>
        <div className={styles.editorRunNote}>Needs a quilr_sdk key. Returns allow / redact / block.</div>
        <button type="button" className={styles.sendBtn} onClick={onRun} disabled={!canRun || !content.trim()}>
          {isRunning ? <Loader2 size={15} className={styles.spin} aria-hidden /> : <ShieldCheck size={15} aria-hidden />} Run
          check
        </button>
      </div>
    </>
  );
}

/* ────────────────────────────────── Logs pane ──────────────────────── */

function LogsPane({
  styles,
  gateway,
  gatewayConfig,
  onSwitchGateway,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  rowLimit,
  setRowLimit,
  columns,
  selectedColumnIds,
  selectedCount,
  onToggleColumn,
  onSelectAllColumns,
  onResetColumns,
  onClearColumns,
  notice,
  progress,
  lastRun,
  rows,
  previewColumns,
  error,
  isRunning,
  canRun,
  onRun,
  onStop,
  onDownload,
}) {
  const previewRows = rows.slice(0, 8);
  const hasResult = Boolean(lastRun);

  return (
    <>
      <div className={styles.centerHeader}>
        <div>
          <h2 className={styles.editorTitle}>Log Export</h2>
          <code className={styles.editorPath}>GET {gatewayConfig.path}</code>
        </div>
        <div className={styles.sdkToggle} role="group" aria-label="Gateway">
          {LOG_GATEWAYS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={gateway === option.id ? styles.sdkToggleActive : ''}
              onClick={() => onSwitchGateway(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.logBody}>
        <div className={styles.logFieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              <CalendarClock size={12} aria-hidden /> Start time
            </span>
            <input
              className={styles.input}
              type="datetime-local"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              <CalendarClock size={12} aria-hidden /> End time
            </span>
            <input
              className={styles.input}
              type="datetime-local"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Maximum rows</span>
            <select className={styles.input} value={rowLimit} onChange={(e) => setRowLimit(e.target.value)}>
              {LOG_ROW_LIMITS.map((option) => (
                <option key={option} value={String(option)}>
                  {option.toLocaleString()} rows
                </option>
              ))}
            </select>
          </label>
        </div>

        {notice && <div className={styles.logNotice}>{notice}</div>}

        <div className={styles.logColumns}>
          <div className={styles.logColumnsHead}>
            <div className={styles.logColumnsTitle}>
              <ListChecks size={14} aria-hidden /> Columns
              <span className={styles.logColumnsCount}>{selectedCount} selected</span>
            </div>
            <div className={styles.logColumnsActions}>
              <button type="button" onClick={onSelectAllColumns}>
                All
              </button>
              <button type="button" onClick={onResetColumns}>
                <RotateCcw size={13} aria-hidden /> Default
              </button>
              <button type="button" onClick={onClearColumns}>
                Clear
              </button>
            </div>
          </div>
          <div className={styles.logColumnGrid}>
            {columns.map((column) => (
              <label key={column.id} className={styles.logCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedColumnIds.has(column.id)}
                  onChange={() => onToggleColumn(column.id)}
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.logSummary}>
          <div>
            <Database size={15} aria-hidden />
            <span>Rows</span>
            <strong>{(progress?.rows ?? lastRun?.rows ?? rows.length).toLocaleString()}</strong>
          </div>
          <div>
            <FileText size={15} aria-hidden />
            <span>Pages</span>
            <strong>{progress?.pages ?? lastRun?.pages ?? 0}</strong>
          </div>
          <div>
            <Table2 size={15} aria-hidden />
            <span>Columns</span>
            <strong>{selectedCount}</strong>
          </div>
        </div>

        {error && (
          <div className={styles.logError}>
            <AlertTriangle size={14} aria-hidden /> {error}
          </div>
        )}

        {hasResult && !error && (
          <div className={styles.logSuccess}>
            <Check size={16} aria-hidden />
            <span>
              Fetched {lastRun.rows.toLocaleString()} row{lastRun.rows === 1 ? '' : 's'} across {lastRun.pages} page
              {lastRun.pages === 1 ? '' : 's'} in {(lastRun.durationMs / 1000).toFixed(1)} s.
            </span>
          </div>
        )}

        <button
          type="button"
          className={styles.logDownload}
          onClick={onDownload}
          disabled={isRunning || !hasResult || rows.length === 0}
        >
          <Download size={15} aria-hidden /> Download CSV for Excel
        </button>

        <div className={styles.logTablePanel}>
          <div className={styles.previewLabel}>Preview - first rows and columns</div>
          <div className={styles.logTableScroll}>
            <table className={styles.logTable}>
              <thead>
                <tr>
                  {previewColumns.map((column) => (
                    <th key={column.id}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.length > 0 ? (
                  previewRows.map((row, rowIndex) => (
                    <tr key={`${row.cursor ?? rowIndex}-${rowIndex}`}>
                      {previewColumns.map((column) => (
                        <td key={column.id}>{getLogPreviewCell(row, column)}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={Math.max(previewColumns.length, 1)}>Run an export to preview matching rows.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.composer}>
        <div className={styles.editorRunNote}>
          GET {gatewayConfig.path} - follows checkpoints up to your row limit, then builds the CSV.
        </div>
        {isRunning ? (
          <button type="button" className={styles.stopBtn} onClick={onStop}>
            <Square size={15} aria-hidden /> Stop
          </button>
        ) : (
          <button type="button" className={styles.sendBtn} onClick={onRun} disabled={!canRun}>
            <Play size={15} aria-hidden /> Run export
          </button>
        )}
      </div>
    </>
  );
}
