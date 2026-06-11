import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clipboard,
  Database,
  Download,
  FileText,
  Loader2,
  Play,
  RotateCcw,
  Table2,
} from 'lucide-react';
import styles from './styles.module.css';

const ENDPOINTS = [
  { label: 'India', value: 'https://guardrails-india-1.quilr.ai' },
  { label: 'Nearest', value: 'https://guardrails.quilr.ai' },
  { label: 'US Central West', value: 'https://guardrails-usa-1.quilr.ai' },
  { label: 'US East', value: 'https://guardrails-usa-2.quilr.ai' },
  { label: 'Custom', value: 'custom' },
];

const GATEWAY_OPTIONS = [
  {
    id: 'llm',
    label: 'LLM Gateway',
    path: '/llmgateway/logs/export',
    rowType: 'llmgateway.request',
  },
  {
    id: 'mcp',
    label: 'MCP Gateway',
    path: '/mcpgateway/logs/export',
    rowType: 'mcpgateway.tool_call',
  },
];

const COLUMN_SETS = {
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
    {
      id: 'quilr_processing_ms',
      label: 'Quilr Processing ms',
      path: 'latency_ms.quilr_processing',
    },
    { id: 'first_response_ms', label: 'First Response ms', path: 'latency_ms.first_response' },
    { id: 'user_email', label: 'User Email', path: 'metadata.user_email', default: true },
    { id: 'conversation_id', label: 'Conversation ID', path: 'metadata.conversation_id' },
    { id: 'client_ip', label: 'Client IP', path: 'metadata.client_ip' },
    { id: 'routing_group_id', label: 'Routing Group ID', path: 'routing.group_id' },
    { id: 'routing_mode', label: 'Routing Mode', path: 'routing.mode' },
    { id: 'request_text', label: 'Request Text JSON', path: 'payload.request_text' },
    { id: 'response_text', label: 'Response Text JSON', path: 'payload.response_text' },
    {
      id: 'actions_and_categories',
      label: 'Actions and Categories JSON',
      path: 'guardrails.actions_and_categories',
    },
    {
      id: 'request_predictions',
      label: 'Request Predictions JSON',
      path: 'guardrails.request_predictions',
    },
    {
      id: 'response_predictions',
      label: 'Response Predictions JSON',
      path: 'guardrails.response_predictions',
    },
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
    {
      id: 'input_predictions',
      label: 'Input Predictions JSON',
      path: 'guardrails.input.predictions',
    },
    {
      id: 'output_predictions',
      label: 'Output Predictions JSON',
      path: 'guardrails.output.predictions',
    },
    { id: 'tool_arguments', label: 'Tool Arguments JSON', path: 'payload.tool_arguments' },
    { id: 'response_content', label: 'Response Content JSON', path: 'payload.response_content' },
    { id: 'user_email', label: 'User Email', path: 'metadata.user_email', default: true },
    { id: 'agent', label: 'Agent', path: 'metadata.agent', default: true },
    { id: 'extra_data', label: 'Extra Data JSON', path: 'metadata.extra_data' },
  ],
};

const ROW_LIMIT_OPTIONS = [100, 500, 1000, 5000, 10000];
const RETENTION_DAYS = 15;
const EXPORT_LAG_MINUTES = 15;
const RETENTION_BUFFER_MINUTES = 1;

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDatetimeLocal(date) {
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

function getInitialWindow() {
  const end = new Date(Date.now() - 20 * 60 * 1000);
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

  return {
    start: formatDatetimeLocal(start),
    end: formatDatetimeLocal(end),
  };
}

function parseDatetimeLocal(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getExportTimeBounds() {
  const now = Date.now();

  return {
    retentionFloor: new Date(
      now - RETENTION_DAYS * 24 * 60 * 60 * 1000 + RETENTION_BUFFER_MINUTES * 60 * 1000,
    ),
    maxExportable: new Date(now - EXPORT_LAG_MINUTES * 60 * 1000),
  };
}

function normalizeExportWindow(startValue, endValue) {
  const { retentionFloor, maxExportable } = getExportTimeBounds();
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

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || '').trim().replace(/\/+$/, '');
}

function getGatewayConfig(gateway) {
  return GATEWAY_OPTIONS.find((option) => option.id === gateway) ?? GATEWAY_OPTIONS[0];
}

function getDefaultColumnIds(gateway) {
  return new Set(
    COLUMN_SETS[gateway]
      .filter((column) => column.default)
      .map((column) => column.id),
  );
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
  return path.split('.').reduce((current, part) => {
    if (current == null) return undefined;
    return current[part];
  }, value);
}

function formatCell(value) {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
}

function csvEscape(value) {
  const normalized = formatCell(value);
  const escaped = normalized.replace(/"/g, '""');

  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function buildCsv(rows, columns) {
  const lines = [
    columns.map((column) => csvEscape(column.label)).join(','),
    ...rows.map((row) =>
      columns
        .map((column) => csvEscape(getPath(row, column.path)))
        .join(','),
    ),
  ];

  return `\uFEFF${lines.join('\n')}\n`;
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

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function buildCurlSnippet({ requestUrl, exportKey, query }) {
  const url = new URL(requestUrl);

  Object.entries(query).forEach(([name, value]) => {
    if (value !== '') url.searchParams.set(name, value);
  });

  const key = exportKey.trim() ? 'sk-export-...' : 'sk-export-...';

  return [
    `curl -N ${shellQuote(url.toString())} \\`,
    `  -H ${shellQuote(`X-Quilr-Log-Export-Key: ${key}`)}`,
  ].join('\n');
}

function getRequestError(response, text) {
  try {
    const parsed = JSON.parse(text);
    return parsed?.error?.message || parsed?.detail || parsed?.message || text;
  } catch {
    return text || `HTTP ${response.status}`;
  }
}

function getPreviewCell(row, column) {
  const value = formatCell(getPath(row, column.path));
  if (!value) return '';

  return value.length > 140 ? `${value.slice(0, 140)}...` : value;
}

export default function LogExportPlayground() {
  const [gateway, setGateway] = useState('llm');
  const [endpoint, setEndpoint] = useState('https://guardrails-india-1.quilr.ai');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [exportKey, setExportKey] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [rowLimit, setRowLimit] = useState('1000');
  const [selectedColumnIds, setSelectedColumnIds] = useState(() => getDefaultColumnIds('llm'));
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [events, setEvents] = useState([]);
  const [checkpoint, setCheckpoint] = useState(null);
  const [exportStarted, setExportStarted] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [progress, setProgress] = useState(null);
  const [adjustmentNotice, setAdjustmentNotice] = useState(null);

  useEffect(() => {
    const initialWindow = getInitialWindow();

    setStartTime(initialWindow.start);
    setEndTime(initialWindow.end);
  }, []);

  const gatewayConfig = getGatewayConfig(gateway);
  const availableColumns = COLUMN_SETS[gateway];
  const baseUrl = normalizeBaseUrl(endpoint === 'custom' ? customEndpoint : endpoint);
  const requestUrl = baseUrl ? `${baseUrl}${gatewayConfig.path}` : gatewayConfig.path;
  const maxRows = Math.max(1, Number.parseInt(rowLimit, 10) || 1);
  const pageSize = Math.min(5000, maxRows);
  const selectedColumns = availableColumns.filter((column) => selectedColumnIds.has(column.id));
  const canSubmit = Boolean(baseUrl && exportKey.trim() && selectedColumns.length > 0 && !isLoading);
  const queryPreview = {
    start_time: localDatetimeToIso(startTime),
    end_time: localDatetimeToIso(endTime),
    limit: String(Math.min(pageSize, maxRows)),
  };
  const curlSnippet = useMemo(
    () => buildCurlSnippet({ requestUrl, exportKey, query: queryPreview }),
    [requestUrl, exportKey, queryPreview.start_time, queryPreview.end_time, queryPreview.limit],
  );
  const previewRows = rows.slice(0, 8);
  const previewColumns = selectedColumns.slice(0, 8);

  function switchGateway(nextGateway) {
    setGateway(nextGateway);
    setSelectedColumnIds(getDefaultColumnIds(nextGateway));
    setRows([]);
    setEvents([]);
    setCheckpoint(null);
    setExportStarted(null);
    setError(null);
    setLastRun(null);
    setProgress(null);
    setAdjustmentNotice(null);
  }

  function toggleColumn(columnId) {
    setSelectedColumnIds((current) => {
      const next = new Set(current);

      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }

      return next;
    });
  }

  function selectAllColumns() {
    setSelectedColumnIds(new Set(availableColumns.map((column) => column.id)));
  }

  function resetDefaultColumns() {
    setSelectedColumnIds(getDefaultColumnIds(gateway));
  }

  function clearColumns() {
    setSelectedColumnIds(new Set());
  }

  async function fetchPage(params) {
    const url = new URL(requestUrl);

    Object.entries(params).forEach(([name, value]) => {
      if (value != null && value !== '') {
        url.searchParams.set(name, value);
      }
    });

    const response = await fetch(url, {
      headers: {
        'X-Quilr-Log-Export-Key': exportKey.trim(),
      },
    });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(getRequestError(response, text));
    }

    return parseNdjson(text);
  }

  async function runExport(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setRows([]);
    setEvents([]);
    setCheckpoint(null);
    setExportStarted(null);
    setError(null);
    setLastRun(null);
    setProgress({ pages: 0, rows: 0 });
    setAdjustmentNotice(null);

    const normalizedWindow = normalizeExportWindow(startTime, endTime);
    if (normalizedWindow.startTime !== startTime) {
      setStartTime(normalizedWindow.startTime);
    }
    if (normalizedWindow.endTime !== endTime) {
      setEndTime(normalizedWindow.endTime);
    }
    if (normalizedWindow.notice) {
      setAdjustmentNotice(normalizedWindow.notice);
    }

    const collectedRows = [];
    const collectedEvents = [];
    const startedAt = Date.now();
    let cursor = '';
    let latestCheckpoint = null;
    let latestExportStarted = null;
    let pageCount = 0;

    try {
      while (collectedRows.length < maxRows) {
        const remaining = maxRows - collectedRows.length;
        const pageEvents = await fetchPage(
          cursor
            ? { cursor, limit: Math.min(pageSize, remaining) }
            : {
                start_time: normalizedWindow.startIso,
                end_time: normalizedWindow.endIso,
                limit: Math.min(pageSize, remaining),
              },
        );

        pageCount += 1;
        collectedEvents.push(...pageEvents);
        latestExportStarted =
          latestExportStarted ?? pageEvents.find((item) => item.type === 'export_started') ?? null;
        latestCheckpoint =
          pageEvents.find((item) => item.type === 'checkpoint') ?? latestCheckpoint;

        collectedRows.push(
          ...pageEvents
            .filter((item) => item.type === gatewayConfig.rowType)
            .slice(0, remaining),
        );

        setProgress({ pages: pageCount, rows: collectedRows.length });

        if (
          !latestCheckpoint?.has_more ||
          !latestCheckpoint?.next_cursor ||
          collectedRows.length >= maxRows
        ) {
          break;
        }

        cursor = latestCheckpoint.next_cursor;
      }

      setRows(collectedRows);
      setEvents(collectedEvents);
      setCheckpoint(latestCheckpoint);
      setExportStarted(latestExportStarted);
      setLastRun({
        rows: collectedRows.length,
        pages: pageCount,
        durationMs: Date.now() - startedAt,
      });
    } catch (err) {
      const message =
        err instanceof SyntaxError
          ? 'The export response was not valid newline-delimited JSON.'
          : err.message ||
            'The browser could not reach the log export endpoint. Check the endpoint, key, and CORS policy.';
      setError(message);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  }

  function downloadCsv() {
    const csv = buildCsv(rows, selectedColumns);
    const datestamp = new Date().toISOString().slice(0, 10);

    downloadTextFile(`quilr-${gateway}-logs-${datestamp}.csv`, csv);
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(curlSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`${styles.playground} not-prose`}>
      <form className={styles.form} onSubmit={runExport}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Configure export</h3>
            <p>
              Calls the Log Export API and converts request rows into an
              Excel-compatible CSV.
            </p>
          </div>
          <div className={styles.method}>GET</div>
        </div>

        <div className={styles.segmented} role="group" aria-label="Gateway type">
          {GATEWAY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={gateway === option.id ? styles.activeSegment : undefined}
              onClick={() => switchGateway(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className={styles.field}>
          <span>Gateway endpoint</span>
          <select value={endpoint} onChange={(event) => setEndpoint(event.target.value)}>
            {ENDPOINTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {endpoint === 'custom' && (
          <label className={styles.field}>
            <span>Custom base URL</span>
            <input
              value={customEndpoint}
              onChange={(event) => setCustomEndpoint(event.target.value)}
              placeholder="https://guardrails.example.com"
              type="url"
            />
          </label>
        )}

        <label className={styles.field}>
          <span>Log export key</span>
          <input
            value={exportKey}
            onChange={(event) => setExportKey(event.target.value)}
            placeholder="sk-export-..."
            type="password"
            autoComplete="off"
            spellCheck="false"
          />
        </label>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Start time</span>
            <input
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                setAdjustmentNotice(null);
              }}
              type="datetime-local"
            />
          </label>
          <label className={styles.field}>
            <span>End time</span>
            <input
              value={endTime}
              onChange={(event) => {
                setEndTime(event.target.value);
                setAdjustmentNotice(null);
              }}
              type="datetime-local"
            />
          </label>
        </div>

        {adjustmentNotice && <div className={styles.inlineNotice}>{adjustmentNotice}</div>}

        <label className={styles.field}>
          <span>Maximum rows</span>
          <select value={rowLimit} onChange={(event) => setRowLimit(event.target.value)}>
            {ROW_LIMIT_OPTIONS.map((option) => (
              <option key={option} value={String(option)}>
                {option.toLocaleString()} rows
              </option>
            ))}
          </select>
        </label>

        <div className={styles.columnPanel}>
          <div className={styles.columnHeader}>
            <div>
              <h4>Columns</h4>
              <p>{selectedColumns.length} selected</p>
            </div>
            <div className={styles.columnActions}>
              <button type="button" onClick={selectAllColumns}>
                All
              </button>
              <button type="button" onClick={resetDefaultColumns}>
                <RotateCcw size={14} aria-hidden />
                Default
              </button>
              <button type="button" onClick={clearColumns}>
                Clear
              </button>
            </div>
          </div>

          <div className={styles.columnGrid}>
            {availableColumns.map((column) => (
              <label key={column.id} className={styles.checkboxField}>
                <input
                  type="checkbox"
                  checked={selectedColumnIds.has(column.id)}
                  onChange={() => toggleColumn(column.id)}
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button className={styles.submit} type="submit" disabled={!canSubmit}>
          {isLoading ? <Loader2 size={16} className={styles.spinner} /> : <Play size={16} />}
          {isLoading ? 'Exporting' : 'Run export'}
        </button>
      </form>

      <div className={styles.output}>
        <div className={styles.requestPanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.previewHeader}>Request</div>
              <p>
                Uses <code>{gatewayConfig.path}</code> with a masked export key.
              </p>
            </div>
            <button type="button" className={styles.copyButton} onClick={copySnippet}>
              {copied ? <Check size={15} aria-hidden /> : <Clipboard size={15} aria-hidden />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className={styles.codeBlock}>{curlSnippet}</pre>
        </div>

        <div className={styles.summaryGrid}>
          <div>
            <Database size={16} aria-hidden />
            <span>Rows</span>
            <strong>{progress?.rows ?? lastRun?.rows ?? rows.length}</strong>
          </div>
          <div>
            <FileText size={16} aria-hidden />
            <span>Pages</span>
            <strong>{progress?.pages ?? lastRun?.pages ?? 0}</strong>
          </div>
          <div>
            <Table2 size={16} aria-hidden />
            <span>Columns</span>
            <strong>{selectedColumns.length}</strong>
          </div>
        </div>

        {error && (
          <div className={styles.errorPanel}>
            <AlertTriangle size={18} aria-hidden />
            <p>{error}</p>
          </div>
        )}

        {lastRun && !error && (
          <div className={styles.successPanel}>
            <Check size={18} aria-hidden />
            <div>
              <h3>Export complete</h3>
              <p>
                Fetched {lastRun.rows.toLocaleString()} row
                {lastRun.rows === 1 ? '' : 's'} across {lastRun.pages} page
                {lastRun.pages === 1 ? '' : 's'} in {(lastRun.durationMs / 1000).toFixed(1)}s.
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          className={styles.downloadButton}
          onClick={downloadCsv}
          disabled={isLoading || selectedColumns.length === 0 || !lastRun}
        >
          <Download size={16} aria-hidden />
          Download CSV for Excel
        </button>

        <div className={styles.tablePanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.previewHeader}>Preview</div>
              <p>Shows the first rows and first selected columns from the export.</p>
            </div>
          </div>

          <div className={styles.tableScroll}>
            <table>
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
                        <td key={column.id}>{getPreviewCell(row, column)}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={Math.max(previewColumns.length, 1)}>
                      Run an export to preview matching rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.previewGroup}>
            <div className={styles.previewHeader}>Export metadata</div>
            <pre>
              {exportStarted
                ? formatJson(exportStarted)
                : 'Run an export to see the effective export window.'}
            </pre>
          </div>

          <div className={styles.previewGroup}>
            <div className={styles.previewHeader}>Checkpoint</div>
            <pre>
              {checkpoint
                ? formatJson(checkpoint)
                : 'Run an export to see pagination state.'}
            </pre>
          </div>
        </div>

        <div className={styles.previewGroup}>
          <div className={styles.previewHeader}>Raw event count</div>
          <pre>
            {events.length
              ? formatJson({
                  total_events: events.length,
                  request_rows: rows.length,
                  event_types: [...new Set(events.map((event) => event.type))],
                })
              : 'No response events loaded yet.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
