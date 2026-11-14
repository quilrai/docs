import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  ApiChips,
  Btn,
  Checkbox,
  ConnectFirst,
  ErrorBox,
  Field,
  JsonView,
  Pager,
  Panel,
  Pill,
  Table,
  Tabs,
  csv,
  fmt,
  useCollection,
  usePlayground,
} from '../ManagementPlayground/ui';
import { when } from '../ManagementPlayground/shared';
import { BarChart, Stats, daysAgo, num } from '../ManagementPlayground/charts';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX, groupBy, mcpPath } from './routes.mjs';
import { useInventory } from './common';

const ms = (v) => (v === null || v === undefined ? '-' : `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 })} ms`);
const ALL_FILTERS = ['tool', 'user', 'agent', 'called_via', 'auth_mode', 'transport', 'outcome'];

// One entry per report. Dimensions, filters and sorts follow the spec's query parameters.
const REPORTS = {
  usage: {
    label: 'Usage',
    path: '/usage',
    subtitle: 'Tool calls and outcomes by period and dimension. Default range: the last 7 days.',
    granular: true,
    dims: ['mcp', 'tool', 'user', 'agent', 'called_via', 'auth_mode', 'transport', 'outcome'],
    filters: ALL_FILTERS,
    sorts: ['period', 'requests', 'errors', 'blocked', 'duration'],
    limit: { def: 500, max: 5000 },
    from: () => daysAgo(7),
    metrics: [
      ['requests', 'Requests', num],
      ['success', 'Success', num],
      ['errors', 'Errors', num],
      ['blocked', 'Blocked', num],
      ['unique_users', 'Users', num],
      ['unique_tools', 'Tools', num],
      ['avg_duration_ms', 'Avg', ms],
      ['p95_duration_ms', 'p95', ms],
    ],
  },
  latency: {
    label: 'Latency',
    path: '/latency',
    subtitle: 'Tool-call latency percentiles and a histogram. Default range: the last 7 days.',
    granular: true,
    dims: ['mcp', 'tool', 'transport', 'outcome'],
    filters: ALL_FILTERS,
    sorts: ['period', 'requests', 'p50', 'p95', 'p99', 'avg'],
    limit: { def: 500, max: 5000 },
    from: () => daysAgo(7),
    metrics: [
      ['requests', 'Requests', num],
      ['p50_ms', 'p50', ms],
      ['p90_ms', 'p90', ms],
      ['p95_ms', 'p95', ms],
      ['p99_ms', 'p99', ms],
      ['avg_ms', 'Avg', ms],
      ['max_ms', 'Max', ms],
    ],
  },
  dlp: {
    label: 'DLP',
    path: '/dlp/summary',
    subtitle: 'Data-risk scans of tool arguments (input) and responses (output): flagged and blocked calls by category. Default range: the last 7 days.',
    granular: true,
    dims: ['mcp', 'tool', 'user', 'category', 'direction'],
    filters: ['tool', 'user', 'category', 'direction'],
    sorts: ['period', 'requests', 'flagged', 'blocked'],
    limit: { def: 500, max: 5000 },
    from: () => daysAgo(7),
    metrics: [
      ['requests', 'Requests', num],
      ['flagged', 'Flagged', num],
      ['blocked', 'Blocked', num],
    ],
  },
  requests: {
    label: 'Requests',
    path: '/requests',
    subtitle: 'Tool-call metadata, newest first: never arguments, responses or tokens. Default range: the last 24 hours; at most 31 days.',
    granular: false,
    dims: [],
    filters: ['tool', 'user', 'outcome', 'request_id'],
    sorts: [],
    limit: { def: 100, max: 1000 },
    from: () => daysAgo(1),
    metrics: [],
  },
  users: {
    label: 'Users',
    path: '/users',
    subtitle: 'Per-user tool-call activity. Default range: the last 30 days.',
    granular: false,
    dims: [],
    filters: ALL_FILTERS,
    sorts: ['calls', 'errors', 'blocked', 'last_seen', 'user'],
    limit: { def: 100, max: 1000 },
    from: () => daysAgo(30),
    metrics: [
      ['calls', 'Calls', num],
      ['success', 'Success', num],
      ['errors', 'Errors', num],
      ['blocked', 'Blocked', num],
      ['mcps_used', 'MCPs', num],
      ['tools_used', 'Tools', num],
    ],
  },
};
const FILTER_LABELS = {
  tool: ['Tools', 'search_files'],
  user: ['User emails', 'alice@example.com'],
  agent: ['Agents', ''],
  called_via: ['Called via', ''],
  auth_mode: ['Auth modes', ''],
  transport: ['Transports', ''],
  outcome: ['Outcomes', 'success, error, blocked'],
  category: ['DLP categories', 'email_address'],
  direction: ['Directions', 'input, output'],
  request_id: ['Request ids', ''],
};

function blankForm(report, mcp) {
  const r = REPORTS[report];
  return {
    from: r.from(),
    to: '',
    granularity: r.granular ? 'day' : '',
    g1: '',
    g2: '',
    sort: r.sorts[0] || '',
    limit: String(r.limit.def),
    mcp: mcp || '',
    perMcp: false,
    blocked: '',
    ...Object.fromEntries(Object.keys(FILTER_LABELS).map((k) => [k, ''])),
  };
}

function reportRequest(report, f, cursor) {
  const r = REPORTS[report];
  const perMcp = report === 'usage' && f.perMcp && f.mcp && !f.mcp.includes(',');
  const query = {
    from: f.from,
    to: f.to,
    limit: f.limit,
    cursor,
    ...(r.granular ? { granularity: f.granularity, group_by: groupBy(f.g1, f.g2) } : {}),
    ...(r.sorts.length ? { sort: f.sort } : {}),
    ...(perMcp ? {} : { mcp: csv(f.mcp).join(',') }),
    ...(report === 'requests' && f.blocked ? { blocked: f.blocked } : {}),
  };
  for (const name of r.filters) query[name] = csv(f[name]).join(',');
  return { path: perMcp ? mcpPath(f.mcp, '/usage') : MCP_PREFIX + r.path, query };
}

export default function Analytics() {
  const { client, urlParam, setParam } = usePlayground();
  const report = REPORTS[urlParam('report')] ? urlParam('report') : 'usage';
  if (!client) return <ConnectFirst what="read MCP analytics" />;
  return (
    <div className={styles.stack}>
      <Tabs label="Report" value={report} onChange={(v) => setParam('report', v)} tabs={Object.entries(REPORTS).map(([id, r]) => [id, r.label])} />
      <Report key={report} report={report} initialMcp={urlParam('mcp')} />
    </div>
  );
}

function Report({ report, initialMcp }) {
  const { client } = usePlayground();
  const r = REPORTS[report];
  const inventory = useInventory();
  const [form, setForm] = useState(() => blankForm(report, initialMcp));
  const [applied, setApplied] = useState(form);
  const [metric, setMetric] = useState(r.metrics[0]?.[0] || '');
  const list = useCollection(
    (cursor) => {
      const req = reportRequest(report, applied, cursor);
      return client.call({ ...req, source: `Analytics: ${r.label}` });
    },
    [client, report, JSON.stringify(applied)],
  );
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const mcps = inventory.data || [];
  const mcpName = (id) => mcps.find((m) => m.id === id)?.name;
  const data = list.data;
  const rows = data?.rows || [];
  const groups = data?.group_by || [applied.g1, applied.g2].filter(Boolean);
  const periodic = r.granular && data?.granularity && data.granularity !== 'total';
  const totals = data?.totals;
  // DLP rows are free-form: show every numeric field they carry.
  const metrics =
    report === 'dlp' && rows.length
      ? [...new Set(rows.flatMap((row) => Object.keys(row).filter((k) => typeof row[k] === 'number')))].map((k) => [k, k, num])
      : r.metrics;

  const byPeriod = new Map();
  if (periodic && metric) for (const row of rows) byPeriod.set(row.period_start, (byPeriod.get(row.period_start) || 0) + (Number(row[metric]) || 0));
  const points = [...byPeriod.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([label, value]) => ({ label: String(label).slice(0, 16).replace('T', ' '), value }));
  const metricFmt = metrics.find(([k]) => k === metric)?.[2] || num;
  const { path } = reportRequest(report, applied);

  return (
    <>
      <Panel
        title={r.label}
        subtitle={`${r.subtitle} Periods are UTC. Results can be up to a minute old.`}
        actions={
          <>
            <ApiChips calls={[['GET', path.startsWith(MCP_PREFIX + '/mcps/') ? '/mcps/{mcp_id}/usage' : r.path]]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
          </>
        }
      >
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(form);
          }}
        >
          <Field label="From" hint="Inclusive, UTC.">
            <input type="date" value={form.from} onChange={(e) => set({ from: e.target.value })} />
          </Field>
          <Field label="To" hint="A date includes that whole UTC day. Empty: now.">
            <input type="date" value={form.to} onChange={(e) => set({ to: e.target.value })} />
          </Field>
          {r.granular && (
            <>
              <Field label="Granularity" hint="hour covers at most 14 days.">
                <select value={form.granularity} onChange={(e) => set({ granularity: e.target.value })}>
                  {['total', 'month', 'week', 'day', 'hour'].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Group by">
                <select value={form.g1} onChange={(e) => set({ g1: e.target.value, g2: e.target.value ? form.g2 : '' })}>
                  <option value="">None</option>
                  {r.dims.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Then by">
                <select value={form.g2} onChange={(e) => set({ g2: e.target.value })} disabled={!form.g1}>
                  <option value="">None</option>
                  {r.dims
                    .filter((d) => d !== form.g1)
                    .map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                </select>
              </Field>
            </>
          )}
          {r.sorts.length > 0 && (
            <Field label="Sort">
              <select value={form.sort} onChange={(e) => set({ sort: e.target.value })}>
                {r.sorts.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Rows per page" hint={`1 to ${r.limit.max}.`}>
            <input type="number" min="1" max={r.limit.max} value={form.limit} onChange={(e) => set({ limit: e.target.value })} />
          </Field>
          <Field label="MCP">
            <select value={mcps.some((m) => m.id === form.mcp) || !form.mcp ? form.mcp : '__typed'} onChange={(e) => set({ mcp: e.target.value === '__typed' ? form.mcp : e.target.value })}>
              <option value="">All MCPs</option>
              {mcps.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
              {form.mcp && !mcps.some((m) => m.id === form.mcp) && <option value="__typed">{form.mcp}</option>}
            </select>
          </Field>
          {report === 'usage' && (
            <Checkbox label="Use the per-MCP route (GET /mcps/{mcp_id}/usage)" checked={form.perMcp} onChange={(perMcp) => set({ perMcp })} disabled={!form.mcp} />
          )}
          <details style={{ flexBasis: '100%' }}>
            <summary>Filters</summary>
            <div className={styles.filters} style={{ marginTop: 10 }}>
              <Field label="MCP ids" hint="Comma-separated, up to 50.">
                <input value={form.mcp} onChange={(e) => set({ mcp: e.target.value })} spellCheck="false" />
              </Field>
              {r.filters.map((name) => (
                <Field key={name} label={FILTER_LABELS[name][0]} hint="Comma-separated, up to 50.">
                  <input value={form[name]} onChange={(e) => set({ [name]: e.target.value })} placeholder={FILTER_LABELS[name][1]} />
                </Field>
              ))}
              {report === 'requests' && (
                <Field label="Blocked">
                  <select value={form.blocked} onChange={(e) => set({ blocked: e.target.value })}>
                    <option value="">Any</option>
                    <option value="true">Blocked only</option>
                    <option value="false">Not blocked</option>
                  </select>
                </Field>
              )}
            </div>
          </details>
          <Btn type="submit" variant="primary">
            Run report
          </Btn>
          <Btn
            onClick={() => {
              const next = blankForm(report, '');
              setForm(next);
              setApplied(next);
            }}
          >
            Reset
          </Btn>
        </form>
        <ErrorBox error={list.error} />
        {totals && <Totals report={report} totals={totals} metrics={metrics} />}
        {data && (
          <p className={styles.muted}>
            {when(data.from)} to {when(data.to)} ({data.timezone || 'UTC'}).
            {data.row_count != null ? ` ${num(data.row_count)} rows in total.` : ''}
            {data.data_through ? ` Data through ${when(data.data_through)}.` : ''}
          </p>
        )}
      </Panel>
      {points.length > 1 && (
        <Panel
          title="Per period"
          subtitle={data?.next_cursor ? 'Sums the rows on this page; page through for the rest, or narrow the report.' : 'Sums every group in each period.'}
          actions={
            <select value={metric} onChange={(e) => setMetric(e.target.value)} aria-label="Chart metric">
              {metrics.map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          }
        >
          <BarChart points={points} format={metricFmt} label={`${r.label} per period`} />
        </Panel>
      )}
      {report === 'latency' && totals?.histogram && Array.isArray(data?.histogram_edges_ms) && (
        <Panel title="Latency histogram" subtitle="Tool calls per latency bucket, across the whole range.">
          <BarChart
            points={totals.histogram.map((value, i) => ({
              label: i < data.histogram_edges_ms.length ? `< ${num(data.histogram_edges_ms[i])} ms` : `>= ${num(data.histogram_edges_ms[data.histogram_edges_ms.length - 1])} ms`,
              value,
            }))}
            label="Latency histogram"
          />
        </Panel>
      )}
      {report === 'dlp' && Array.isArray(data?.categories) && data.categories.length > 0 && (
        <Panel title="Categories" subtitle={data.categories_truncated ? 'Top categories only; narrow the report to see the rest.' : 'Every detected category in the range.'}>
          <Table
            rows={data.categories}
            rowKey={(c) => c.category}
            columns={[
              { label: 'Category', render: (c) => <code>{fmt(c.category)}</code> },
              ...Object.keys(data.categories[0])
                .filter((k) => k !== 'category')
                .map((k) => ({ label: k, render: (c) => <span className={styles.num}>{typeof c[k] === 'number' ? num(c[k]) : fmt(c[k])}</span> })),
            ]}
          />
        </Panel>
      )}
      <Panel title="Rows">
        <Table
          rows={rows}
          rowKey={(row) => JSON.stringify(row)}
          empty={list.loading ? 'Loading...' : 'No tool calls match this report.'}
          columns={columnsFor(report, { periodic, groups, metrics, mcpName })}
        />
        <Pager list={list} />
        {data && (
          <details>
            <summary>Raw response</summary>
            <JsonView value={data} maxHeight={420} />
          </details>
        )}
      </Panel>
    </>
  );
}

function Totals({ report, totals, metrics }) {
  if (report === 'dlp') {
    return (
      <Stats
        items={[
          ['Requests', num(totals.requests)],
          ['Flagged', num(totals.flagged)],
          ['Blocked', num(totals.blocked)],
          ['Input scanned', num(totals.input?.scanned)],
          ['Input flagged', num(totals.input?.flagged)],
          ['Output scanned', num(totals.output?.scanned)],
          ['Output flagged', num(totals.output?.flagged)],
        ]}
      />
    );
  }
  const items = metrics.filter(([k]) => totals[k] !== undefined).map(([k, label, f]) => [label, f(totals[k])]);
  if (!items.length) {
    const numeric = Object.entries(totals).filter(([, v]) => typeof v === 'number');
    return <Stats items={numeric.map(([k, v]) => [k, num(v)])} />;
  }
  return <Stats items={items} />;
}

function dimCell(row, dim, mcpName) {
  if (dim === 'mcp') {
    const label = row.mcp_name || mcpName(row.mcp);
    return row.mcp == null ? '-' : (
      <>
        {label && <strong>{label} </strong>}
        <code>{row.mcp}</code>
      </>
    );
  }
  return fmt(row[dim]);
}

function columnsFor(report, { periodic, groups, metrics, mcpName }) {
  const metricCols = metrics.map(([k, label, f]) => ({ label, render: (row) => <span className={styles.num}>{f(row[k])}</span> }));
  if (report === 'requests') {
    return [
      { label: 'Started', render: (row) => <span className={styles.nowrap}>{when(row.started_at)}</span> },
      { label: 'MCP', render: (row) => fmt(row.mcp_name || mcpName(row.mcp) || row.mcp) },
      { label: 'Tool', render: (row) => <code>{fmt(row.tool)}</code> },
      { label: 'User', render: (row) => fmt(row.user) },
      {
        label: 'Outcome',
        render: (row) => <Pill tone={row.outcome === 'success' ? 'ok' : row.outcome === 'blocked' ? 'warn' : row.outcome ? 'err' : undefined}>{fmt(row.outcome)}</Pill>,
      },
      { label: 'Duration', render: (row) => <span className={styles.num}>{ms(row.duration_ms)}</span> },
      { label: 'Via', render: (row) => fmt(row.called_via || row.agent) },
      { label: 'DLP', render: (row) => (row.dlp && Object.keys(row.dlp).length ? <code>{JSON.stringify(row.dlp)}</code> : '-') },
      { label: 'Request id', render: (row) => <code>{fmt(row.request_id)}</code> },
    ];
  }
  if (report === 'users') {
    return [
      { label: 'User', render: (row) => fmt(row.user) },
      ...metricCols,
      { label: 'First seen', render: (row) => when(row.first_seen) },
      { label: 'Last seen', render: (row) => when(row.last_seen) },
    ];
  }
  return [
    ...(periodic ? [{ label: 'Period', render: (row) => <span className={styles.nowrap}>{fmt(row.period_start)}</span> }] : []),
    ...groups.map((g) => ({ label: g, render: (row) => dimCell(row, g, mcpName) })),
    ...metricCols,
  ];
}
