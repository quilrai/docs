import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX } from './client.mjs';
import {
  ApiChips,
  Btn,
  ConnectFirst,
  ErrorBox,
  Field,
  JsonView,
  Pager,
  Panel,
  Pill,
  Table,
  csv,
  fmt,
  useCollection,
  usePlayground,
} from './ui';
import { ScopeFilters } from './shared';
import styles from './styles.module.css';

const P = MANAGEMENT_PREFIX;

// ── Shared helpers (also used by Monitoring and Overview) ─────────────────

export const num = (v) => (v === null || v === undefined ? '-' : Number(v).toLocaleString());
export const usd = (v) =>
  v === null || v === undefined
    ? '-'
    : `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: Number(v) < 1 && Number(v) > 0 ? 4 : 2 })}`;
export const isoDate = (d) => d.toISOString().slice(0, 10);
export const daysAgo = (n) => isoDate(new Date(Date.now() - n * 86400 * 1000));
export const monthStart = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
};

export function Stats({ items }) {
  return (
    <div className={styles.stats}>
      {items.filter(Boolean).map(([label, value]) => (
        <div key={label} className={styles.stat}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

/** A dependency-free bar chart: points = [{label, value, title}]. */
export function BarChart({ points, format = num, label }) {
  if (!points.length) return null;
  const max = Math.max(...points.map((p) => p.value), 0) || 1;
  return (
    <figure aria-label={label} style={{ margin: 0 }}>
      <div className={styles.chart} role="img" aria-label={`${label}: ${points.length} periods, peak ${format(max)}`}>
        {points.map((p) => (
          <div key={p.label} className={styles.chartBar} title={`${p.label}: ${format(p.value)}`}>
            <span style={{ height: `${Math.max((p.value / max) * 100, p.value > 0 ? 1 : 0)}%` }} />
          </div>
        ))}
      </div>
      <div className={styles.chartAxis}>
        <span>{points[0].label}</span>
        <span>peak {format(max)}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </figure>
  );
}

// ── Usage workspace ────────────────────────────────────────────────────────

const DIMENSIONS = ['app', 'model', 'provider', 'user', 'key', 'source', 'outcome'];
// Provider, app and model are linked dropdowns (ScopeFilters); "Type a value..." takes a comma list.
const MULTI_HINT = 'Type a value for a comma list, up to 50.';
const SCOPE_FIELDS = [
  { kind: 'provider', label: 'Provider labels', hint: MULTI_HINT, placeholder: 'Production OpenAI' },
  { kind: 'app', label: 'Apps', hint: MULTI_HINT },
  { kind: 'model', label: 'Models', hint: MULTI_HINT, placeholder: 'gpt-4.1' },
];
const FILTERS = [
  ['user', 'User emails', 'alice@example.com'],
  ['key', 'Key ids', ''],
  ['source', 'Sources', 'gateway, sdk, copilot_studio'],
  ['outcome', 'Outcomes', 'served, blocked, error, rate_limited'],
];
const BLANK = { from: '', to: '', granularity: 'total', g1: '', g2: '', sort: 'period', limit: '500', app: '', model: '', provider: '', user: '', key: '', source: '', outcome: '' };

const PRESETS = [
  ['Daily spend, last 30 days', () => ({ ...BLANK, from: daysAgo(30), granularity: 'day' })],
  ['All-time spend by app', () => ({ ...BLANK, granularity: 'total', g1: 'app', sort: 'cost' })],
  ['Top users this month', () => ({ ...BLANK, from: monthStart(), granularity: 'total', g1: 'user', sort: 'cost', limit: '10' })],
  ['Weekly spend by model', () => ({ ...BLANK, from: daysAgo(90), granularity: 'week', g1: 'model' })],
  ['Outcomes by app, last 30 days', () => ({ ...BLANK, from: daysAgo(30), granularity: 'total', g1: 'app', g2: 'outcome', sort: 'requests' })],
  ['Requests by key, last 90 days', () => ({ ...BLANK, from: daysAgo(90), granularity: 'total', g1: 'app', g2: 'key', sort: 'requests' })],
];

function usageQuery(f, cursor) {
  const query = {
    from: f.from,
    to: f.to,
    granularity: f.granularity,
    group_by: [f.g1, f.g2].filter(Boolean),
    sort: f.sort,
    limit: f.limit,
    cursor,
  };
  for (const name of [...SCOPE_FIELDS.map((s) => s.kind), ...FILTERS.map(([n]) => n)]) query[name] = csv(f[name]).join(',');
  return query;
}

const dimValue = (row, dim) => {
  if (dim === 'app') return row.app == null ? '-' : <>{row.app}{row.app_deleted && <> <Pill tone="off">deleted</Pill></>}</>;
  if (dim === 'key') return row.key == null ? '-' : <><code>{row.key}</code>{row.key_name ? ` ${row.key_name}` : ''}</>;
  if (dim === 'user') return row.user ?? <span className={styles.muted}>no identity</span>;
  return fmt(row[dim]);
};

export default function Usage() {
  const { client } = usePlayground();
  const [form, setForm] = useState(() => PRESETS[0][1]());
  const [applied, setApplied] = useState(form);
  const [metric, setMetric] = useState('cost_usd');
  const list = useCollection(
    (cursor) => client.call({ path: `${P}/usage`, query: usageQuery(applied, cursor), source: 'Usage' }),
    [client, JSON.stringify(applied)],
    !!client,
  );
  if (!client) return <ConnectFirst what="report requests, tokens and spend" />;
  const data = list.data;
  const rows = data?.rows || [];
  const groups = data?.group_by || [applied.g1, applied.g2].filter(Boolean);
  const totals = data?.totals;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Chart: one bar per period, summing the groups on this page.
  const byPeriod = new Map();
  if (data && data.granularity !== 'total') {
    for (const r of rows) byPeriod.set(r.period_start, (byPeriod.get(r.period_start) || 0) + (Number(r[metric]) || 0));
  }
  const points = [...byPeriod.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([label, value]) => ({ label, value }));

  return (
    <div className={styles.stack}>
      <Panel
        title="Usage"
        subtitle="Requests, outcomes, tokens and cost of every app, over all time or any range. Periods are UTC; filters narrow every number, including the totals. Results can be up to 60 seconds old."
        actions={
          <>
            <ApiChips calls={[['GET', '/usage']]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
          </>
        }
      >
        <div className={styles.inline} aria-label="Report presets">
          {PRESETS.map(([label, make]) => (
            <Btn
              key={label}
              onClick={() => {
                const next = make();
                setForm(next);
                setApplied(next);
              }}
            >
              {label}
            </Btn>
          ))}
        </div>
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(form);
          }}
        >
          <Field label="From" hint="Inclusive. Empty: from the first request.">
            <input type="date" value={form.from} onChange={(e) => set({ from: e.target.value })} />
          </Field>
          <Field label="To" hint="Exclusive; a date includes that whole UTC day. Empty: now.">
            <input type="date" value={form.to} onChange={(e) => set({ to: e.target.value })} />
          </Field>
          <Field label="Granularity">
            <select value={form.granularity} onChange={(e) => set({ granularity: e.target.value })}>
              {['total', 'month', 'week', 'day'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Group by">
            <select value={form.g1} onChange={(e) => set({ g1: e.target.value, g2: e.target.value ? form.g2 : '' })}>
              <option value="">None</option>
              {DIMENSIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Then by">
            <select value={form.g2} onChange={(e) => set({ g2: e.target.value })} disabled={!form.g1}>
              <option value="">None</option>
              {DIMENSIONS.filter((d) => d !== form.g1).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Sort">
            <select value={form.sort} onChange={(e) => set({ sort: e.target.value })}>
              <option value="period">period</option>
              <option value="cost">cost (highest first)</option>
              <option value="requests">requests (highest first)</option>
              <option value="tokens">tokens (highest first)</option>
            </select>
          </Field>
          <Field label="Rows per page">
            <input type="number" min="1" max="5000" value={form.limit} onChange={(e) => set({ limit: e.target.value })} />
          </Field>
          <details style={{ flexBasis: '100%' }}>
            <summary>Filters</summary>
            <div className={styles.filters} style={{ marginTop: 10 }}>
              <ScopeFilters value={form} onChange={set} providerBy="label" fields={SCOPE_FIELDS} />
              {FILTERS.map(([name, label, placeholder]) => (
                <Field key={name} label={label} hint="Comma-separated, up to 50.">
                  <input value={form[name]} onChange={(e) => set({ [name]: e.target.value })} placeholder={placeholder} />
                </Field>
              ))}
            </div>
          </details>
          <Btn type="submit" variant="primary">
            Run report
          </Btn>
        </form>
        <ErrorBox error={list.error} />
        {totals && (
          <Stats
            items={[
              ['Requests', num(totals.requests)],
              ['Cost', usd(totals.cost_usd)],
              ['Input tokens', num(totals.input_tokens)],
              ['Output tokens', num(totals.output_tokens)],
              ['Cache read tokens', num(totals.cache_read_tokens)],
              ['Blocked', num(totals.blocked)],
              ['Rate limited', num(totals.rate_limited)],
              ['Errors', num(totals.errors)],
              totals.unpriced_requests ? ['Unpriced requests', num(totals.unpriced_requests)] : null,
              totals.priced_coverage_pct != null && totals.priced_coverage_pct < 100
                ? ['Priced coverage', `${totals.priced_coverage_pct}%`]
                : null,
            ]}
          />
        )}
        {data && (
          <p className={styles.muted}>
            {data.from ? `${data.from} to ${data.to}` : `All time to ${data.to}`} ({data.timezone || 'UTC'}).{' '}
            {num(data.row_count)} rows in total. Periods without traffic are omitted.
            {data.generated_at ? ` Data read at ${data.generated_at}, through ${data.data_through}.` : ''}
          </p>
        )}
      </Panel>
      {points.length > 1 && (
        <Panel
          title={metric === 'cost_usd' ? 'Cost per period' : metric === 'requests' ? 'Requests per period' : 'Output tokens per period'}
          subtitle={list.data?.next_cursor ? 'Sums the rows on this page; page through for the rest, or narrow the report.' : 'Sums every group in each period.'}
          actions={
            <select value={metric} onChange={(e) => setMetric(e.target.value)} aria-label="Chart metric">
              <option value="cost_usd">Cost</option>
              <option value="requests">Requests</option>
              <option value="output_tokens">Output tokens</option>
            </select>
          }
        >
          <BarChart points={points} format={metric === 'cost_usd' ? usd : num} label="Usage per period" />
        </Panel>
      )}
      <Panel title="Rows">
        <Table
          rows={rows}
          rowKey={(r) => [r.period_start, ...groups.map((g) => r[g])].join('|')}
          empty={list.loading ? 'Loading...' : 'No traffic matches this report.'}
          columns={[
            ...(data?.granularity !== 'total' ? [{ label: 'Period', render: (r) => <span className={styles.nowrap}>{fmt(r.period_start)}</span> }] : []),
            ...groups.map((g) => ({ label: g, render: (r) => dimValue(r, g) })),
            { label: 'Requests', render: (r) => <span className={styles.num}>{num(r.requests)}</span> },
            { label: 'Cost', render: (r) => <span className={styles.num}>{usd(r.cost_usd)}</span> },
            { label: 'Input', render: (r) => <span className={styles.num}>{num(r.input_tokens)}</span> },
            { label: 'Output', render: (r) => <span className={styles.num}>{num(r.output_tokens)}</span> },
            { label: 'Blocked', render: (r) => <span className={styles.num}>{num(r.blocked)}</span> },
            { label: 'Rate limited', render: (r) => <span className={styles.num}>{num(r.rate_limited)}</span> },
            { label: 'Errors', render: (r) => <span className={styles.num}>{num(r.errors)}</span> },
            { label: 'Unpriced', render: (r) => <span className={styles.num}>{num(r.unpriced_requests)}</span> },
          ]}
        />
        <Pager list={list} />
        {data && (
          <details>
            <summary>Raw response</summary>
            <JsonView value={data} maxHeight={420} />
          </details>
        )}
      </Panel>
    </div>
  );
}
