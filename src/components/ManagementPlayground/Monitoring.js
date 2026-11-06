import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Siren } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import {
  ApiChips,
  Btn,
  ConnectFirst,
  ErrorBox,
  Field,
  JsonView,
  KeyValue,
  Notice,
  Pager,
  Panel,
  Pill,
  Table,
  Tabs,
  fmt,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { useLoad, when } from './shared';
import { BarChart, Stats, daysAgo, num, usd } from './Usage';
import styles from './styles.module.css';

const P = MANAGEMENT_PREFIX;
const VIEWS = [
  ['latency', 'Latency'],
  ['features', 'Feature metrics'],
  ['requests', 'Requests'],
  ['guardrails', 'Guardrail activity'],
  ['health', 'Provider health'],
  ['explain', 'Explain a request'],
];

export default function Monitoring() {
  const { client, urlParam, setParam } = usePlayground();
  if (!client) return <ConnectFirst what="see latency, feature metrics, requests, guardrail activity, provider health and why a request behaved the way it did" />;
  const view = VIEWS.some(([id]) => id === urlParam('view')) ? urlParam('view') : urlParam('request_id') ? 'explain' : 'guardrails';
  return (
    <div className={styles.stack}>
      <Tabs tabs={VIEWS} value={view} onChange={(id) => setParam('view', id)} label="Monitoring views" />
      {view === 'latency' && <Latency />}
      {view === 'features' && <Features />}
      {view === 'requests' && <Requests />}
      {view === 'guardrails' && <Guardrails />}
      {view === 'health' && <ProviderHealth />}
      {view === 'explain' && <Explain />}
    </div>
  );
}

// ── Guardrail activity ─────────────────────────────────────────────────────

const G_DIMS = ['category', 'action', 'direction', 'app', 'user', 'model'];
const G_BLANK = { from: daysAgo(30), to: '', granularity: 'total', g1: 'category', g2: 'action', app: '', user: '', model: '', category: '', action: '', direction: '' };
const actionTone = (a) => (a === 'blocked' ? 'err' : a === 'redacted' ? 'warn' : 'off');

const TREND_MAX_PAGES = 20;

function guardrailQuery(f, groupBy, cursor) {
  return {
    from: f.from,
    to: f.to,
    granularity: f.granularity,
    group_by: groupBy,
    app: f.app,
    user: f.user,
    model: f.model,
    category: f.category,
    action: f.action,
    direction: f.direction,
    limit: 200,
    cursor,
  };
}

function Guardrails() {
  const { client } = usePlayground();
  const [form, setForm] = useState(G_BLANK);
  const [applied, setApplied] = useState(G_BLANK);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const list = useCollection(
    (cursor) =>
      client.call({
        path: `${P}/guardrails/summary`,
        query: guardrailQuery(applied, [applied.g1, applied.g2].filter(Boolean), cursor),
        source: 'Guardrail activity',
      }),
    [client, JSON.stringify(applied)],
  );
  // The chart reads its own ungrouped per-period query: requests_flagged counts
  // each request once per period there, while rows grouped by category or
  // action would count a request once per group (summing them double-counts).
  const trend = useLoad(
    async () => {
      const rows = [];
      const seen = new Set();
      let cursor;
      for (let i = 0; i < TREND_MAX_PAGES; i += 1) {
        const page = await client.call({
          path: `${P}/guardrails/summary`,
          query: guardrailQuery(applied, [], cursor),
          source: 'Guardrail activity per period',
        });
        rows.push(...(page?.rows || []));
        cursor = page?.next_cursor || undefined;
        if (!cursor || seen.has(cursor)) break;
        seen.add(cursor);
      }
      return { rows, complete: !cursor };
    },
    [client, JSON.stringify(applied)],
    !!client && applied.granularity !== 'total',
  );
  const data = list.data;
  const t = data?.totals;
  const groups = data?.group_by || [];
  const points = (trend.data?.rows || [])
    .map((r) => ({ label: String(r.period_start || '').slice(0, 10), value: r.requests_flagged || 0 }))
    .sort((a, b) => (a.label < b.label ? -1 : 1));
  return (
    <Panel
      title="Guardrail activity"
      subtitle="Requests scanned, flagged, blocked, redacted and monitored, and the detections behind them. Only counts and identifiers: never prompt text or detected values."
      actions={
        <>
          <ApiChips calls={[['GET', '/guardrails/summary']]} />
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
        <Field label="From" hint="Inclusive. Empty: the last 30 days.">
          <input type="date" value={form.from} onChange={(e) => set({ from: e.target.value })} />
        </Field>
        <Field label="To" hint="Exclusive; a date includes that whole UTC day. Empty: now.">
          <input type="date" value={form.to} onChange={(e) => set({ to: e.target.value })} />
        </Field>
        <Field label="Granularity">
          <select value={form.granularity} onChange={(e) => set({ granularity: e.target.value })}>
            {GRANULARITIES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Group by">
          <select value={form.g1} onChange={(e) => set({ g1: e.target.value, g2: e.target.value ? form.g2 : '' })}>
            <option value="">None</option>
            {G_DIMS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Then by">
          <select value={form.g2} onChange={(e) => set({ g2: e.target.value })} disabled={!form.g1}>
            <option value="">None</option>
            {G_DIMS.filter((d) => d !== form.g1).map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <details style={{ flexBasis: '100%' }}>
          <summary>Filters</summary>
          <div className={styles.filters} style={{ marginTop: 10 }}>
            <Field label="App">
              <input value={form.app} onChange={(e) => set({ app: e.target.value })} placeholder="Support Bot" />
            </Field>
            <Field label="User email">
              <input value={form.user} onChange={(e) => set({ user: e.target.value })} />
            </Field>
            <Field label="Served model">
              <input value={form.model} onChange={(e) => set({ model: e.target.value })} />
            </Field>
            <Field label="Category" hint="Id or display name, or unattributed.">
              <input value={form.category} onChange={(e) => set({ category: e.target.value })} />
            </Field>
            <Field label="Action">
              <select value={form.action} onChange={(e) => set({ action: e.target.value })}>
                <option value="">Any</option>
                {['blocked', 'redacted', 'monitored'].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Direction">
              <select value={form.direction} onChange={(e) => set({ direction: e.target.value })}>
                <option value="">Any</option>
                <option value="request">request (prompts)</option>
                <option value="response">response</option>
              </select>
            </Field>
          </div>
        </details>
        <Btn type="submit" variant="primary">
          Run summary
        </Btn>
      </form>
      <ErrorBox error={list.error} />
      {t && (
        <Stats
          items={[
            ['Scanned', num(t.requests_scanned)],
            ['Flagged', num(t.requests_flagged)],
            ['Blocked', num(t.requests_blocked)],
            ['Redacted', num(t.requests_redacted)],
            ['Monitored', num(t.requests_monitored)],
            ['Detections', num(t.detections)],
          ]}
        />
      )}
      {data?.truncated && <Notice tone="warn">More than 5,000 rows matched; only the first 5,000 are returned. Narrow the range or filters.</Notice>}
      {data?.generated_at && (
        <p className={styles.muted}>
          Data read at {data.generated_at}; counts requests before {data.data_through}.
        </p>
      )}
      {points.length > 1 && (
        <>
          <BarChart points={points} label="Flagged requests per period" />
          <p className={styles.muted}>
            {trend.data?.complete
              ? 'Each request counts once per period, whatever the grouping below.'
              : `First ${points.length} periods only; narrow the range to chart the rest.`}
          </p>
        </>
      )}
      <ErrorBox error={trend.error} />
      <Table
        rows={data?.rows || []}
        rowKey={(r) => [r.period_start, ...groups.map((g) => (g === 'category' ? r.category?.id : r[g]))].join('|')}
        empty={list.loading ? 'Loading...' : 'No guardrail activity matches.'}
        columns={[
          ...(data && data.granularity !== 'total' ? [{ label: 'Period', render: (r) => fmt(String(r.period_start || '').slice(0, 10)) }] : []),
          ...groups.map((g) => ({
            label: g,
            render: (r) =>
              g === 'category' ? (
                r.category ? (
                  <span>
                    {r.category.name || r.category.id} {r.category.type && <Pill>{r.category.type}</Pill>}
                  </span>
                ) : (
                  '-'
                )
              ) : g === 'action' ? (
                <Pill tone={actionTone(r.action)}>{fmt(r.action)}</Pill>
              ) : (
                fmt(r[g])
              ),
          })),
          { label: 'Scanned', render: (r) => <span className={styles.num}>{num(r.requests_scanned)}</span> },
          { label: 'Flagged', render: (r) => <span className={styles.num}>{num(r.requests_flagged)}</span> },
          { label: 'Blocked', render: (r) => <span className={styles.num}>{num(r.requests_blocked)}</span> },
          { label: 'Redacted', render: (r) => <span className={styles.num}>{num(r.requests_redacted)}</span> },
          { label: 'Monitored', render: (r) => <span className={styles.num}>{num(r.requests_monitored)}</span> },
          { label: 'Detections', render: (r) => <span className={styles.num}>{num(r.detections)}</span> },
        ]}
      />
      <Pager list={list} />
      <p className={styles.muted}>
        Scanned is not narrowed by category, action or direction filters, and is empty on rows grouped by them. Requests
        refused before scanning, and apps with guardrails off, are not counted.
      </p>
    </Panel>
  );
}

// ── Provider health ────────────────────────────────────────────────────────

const STATE_TONE = { healthy: 'ok', unknown: 'off', half_open: 'warn', cooling_down: 'warn', circuit_open: 'err', marked_down: 'err' };
const ERROR_LABELS = [
  ['rate_limited', '429'],
  ['upstream_5xx', '5xx'],
  ['timeout_or_connection', 'timeout'],
  ['auth_or_permission', 'auth'],
  ['client_4xx', '4xx'],
  ['other', 'other'],
];
const pct = (v) => (v === null || v === undefined ? '-' : `${Number(v).toFixed(2)}%`);
const ms = (o) => (o && (o.p50 != null || o.p95 != null) ? `${o.p50 == null ? '-' : Math.round(o.p50)} / ${o.p95 == null ? '-' : Math.round(o.p95)} ms` : '-');
const errorText = (errors) => {
  const parts = ERROR_LABELS.filter(([k]) => errors?.[k]).map(([k, label]) => `${label}: ${errors[k]}`);
  return parts.length ? parts.join(' · ') : '-';
};

function StatePill({ state }) {
  if (!state?.state) return '-';
  return (
    <span className={styles.nowrap} title={state.until ? `until ${when(state.until)}` : undefined}>
      <Pill tone={STATE_TONE[state.state]}>{state.state.replace(/_/g, ' ')}</Pill>
      {state.until && <span className={styles.muted}> until {when(state.until)}</span>}
    </span>
  );
}

function ProviderHealth() {
  const { client, navigate } = usePlayground();
  const blank = { window: '24h', from: '', to: '', provider: '', model: '', app: '' };
  const [form, setForm] = useState(blank);
  const [applied, setApplied] = useState(blank);
  // window and from/to are not combined: a range replaces the window.
  const healthQuery = applied.from || applied.to ? { ...applied, window: '' } : { ...applied, from: '', to: '' };
  const health = useLoad(
    () => client.call({ path: `${P}/provider-health`, query: healthQuery, source: 'Provider health' }),
    [client, JSON.stringify(applied)],
  );
  const data = health.data;
  const rows = [];
  for (const p of data?.providers || []) {
    rows.push({ ...p, _key: p.provider_label, _provider: true });
    for (const m of p.models || []) rows.push({ ...m, provider_label: p.provider_label, _key: `${p.provider_label}|${m.model}` });
  }
  const scope = data?.routing_state_scope;
  return (
    <Panel
      title="Provider health"
      subtitle="Per provider and model: outcomes over a window, latency, failovers away, and how routing treats each target right now. Guardrail blocks, limit rejections and background cache-refresh requests are excluded. Results can be up to 60 seconds old."
      actions={
        <>
          <ApiChips calls={[['GET', '/provider-health'], ['GET', '/failover/summary']]} />
          <Btn onClick={health.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
          <Btn onClick={() => navigate('incidents')}>
            <Siren size={13} aria-hidden /> Incidents
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
        <Field label="Window">
          <select value={form.window} onChange={(e) => setForm({ ...form, window: e.target.value })}>
            {['1h', '24h', '7d', '30d'].map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </Field>
        <Field label="From" hint="Inclusive. Replaces the window; at most 30 days.">
          <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
        </Field>
        <Field label="To" hint="Exclusive; a date includes that whole UTC day. Empty: now.">
          <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
        </Field>
        <Field label="Provider label">
          <input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
        </Field>
        <Field label="Model">
          <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        </Field>
        <Field label="App">
          <input value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value })} />
        </Field>
        <Btn type="submit" variant="primary">
          Apply
        </Btn>
      </form>
      <ErrorBox error={health.error} />
      {data?.truncated && <Notice tone="warn">More than 500 provider and model pairs had traffic; the busiest are shown. Filter to see the rest.</Notice>}
      <Table
        rows={rows}
        rowKey={(r) => r._key}
        empty={health.loading ? 'Loading...' : 'No providers.'}
        columns={[
          {
            label: 'Provider / model',
            render: (r) =>
              r._provider ? (
                <span>
                  <strong>{r.provider_label}</strong> <span className={styles.muted}>{fmt(r.provider_name)}</span>
                  {r.configured === false && <> <Pill tone="off">not configured</Pill></>}
                </span>
              ) : (
                <span style={{ paddingLeft: 14 }}>
                  <code>{r.model}</code>
                </span>
              ),
          },
          { label: 'State', render: (r) => <StatePill state={r.routing_state} /> },
          { label: 'Requests', render: (r) => <span className={styles.num}>{num(r.requests)}</span> },
          { label: 'Success', render: (r) => <span className={styles.num}>{pct(r.success_rate_pct)}</span> },
          { label: 'Errors', render: (r) => <span className={styles.nowrap}>{errorText(r.errors)}</span> },
          { label: 'Latency p50 / p95', render: (r) => <span className={styles.num}>{ms(r.latency_ms)}</span> },
          { label: 'First token p50 / p95', render: (r) => <span className={styles.num}>{ms(r.time_to_first_token_ms)}</span> },
          { label: 'Failovers away', render: (r) => <span className={styles.num}>{num(r.failovers_away)}</span> },
          { label: 'Last request', render: (r) => (r._provider ? '' : when(r.last_request_at)) },
        ]}
      />
      {scope && <p className={styles.muted}>{scope.note || 'Cooldown and circuit state is what routing on this server sees now.'}</p>}
      {scope && scope.complete === false && (
        <Notice tone="warn">
          Routing state was read for {scope.apps_evaluated} of {scope.apps_total} apps
          {scope.apps_failed ? ` (${scope.apps_failed} failed)` : ''}; targets without a state read show unknown.
        </Notice>
      )}
      {data?.generated_at && <p className={styles.muted}>Traffic outcomes read at {data.generated_at}.</p>}
      {data && (
        <details>
          <summary>Raw response</summary>
          <JsonView value={data} maxHeight={420} />
        </details>
      )}
    </Panel>
  );
}

// ── Shared report form ─────────────────────────────────────────────────────

const GRANULARITIES = ['total', 'month', 'week', 'day', 'hour'];
const period = (r, granularity) =>
  granularity === 'hour' ? String(r.period_start || '').replace('T', ' ').slice(0, 16) : String(r.period_start || '').slice(0, 10);

function ReportForm({ form, set, dims, onSubmit, submit, children }) {
  return (
    <form
      className={styles.filters}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Field label="From" hint="Inclusive date. hour needs a range of at most 14 days.">
        <input type="date" value={form.from} onChange={(e) => set({ from: e.target.value })} />
      </Field>
      <Field label="To" hint="Exclusive; a date includes that whole UTC day. Empty: now.">
        <input type="date" value={form.to} onChange={(e) => set({ to: e.target.value })} />
      </Field>
      <Field label="Granularity">
        <select value={form.granularity} onChange={(e) => set({ granularity: e.target.value })}>
          {GRANULARITIES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Field>
      <Field label="Group by">
        <select value={form.g1} onChange={(e) => set({ g1: e.target.value, g2: e.target.value ? form.g2 : '' })}>
          <option value="">None</option>
          {dims.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="Then by">
        <select value={form.g2} onChange={(e) => set({ g2: e.target.value })} disabled={!form.g1}>
          <option value="">None</option>
          {dims.filter((d) => d !== form.g1).map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <details style={{ flexBasis: '100%' }}>
        <summary>Filters</summary>
        <div className={styles.filters} style={{ marginTop: 10 }}>
          <Field label="App">
            <input value={form.app} onChange={(e) => set({ app: e.target.value })} placeholder="Support Bot" />
          </Field>
          <Field label="Served model">
            <input value={form.model} onChange={(e) => set({ model: e.target.value })} />
          </Field>
          <Field label="Provider">
            <input value={form.provider} onChange={(e) => set({ provider: e.target.value })} />
          </Field>
          <Field label="Surface" hint="For example chat.">
            <input value={form.surface} onChange={(e) => set({ surface: e.target.value })} />
          </Field>
          {children}
        </div>
      </details>
      <Btn type="submit" variant="primary">
        {submit}
      </Btn>
    </form>
  );
}

function groupColumns(data) {
  const groups = data?.group_by || [];
  return [
    ...(data && data.granularity !== 'total' ? [{ label: 'Period', render: (r) => fmt(period(r, data.granularity)) }] : []),
    ...groups.map((g) => ({ label: g, render: (r) => fmt(g === 'stream' ? String(r.stream) : r[g]) })),
  ];
}

const groupKey = (data) => (r) => [r.period_start, ...(data?.group_by || []).map((g) => r[g])].join('|');

// ── Latency ────────────────────────────────────────────────────────────────

const L_DIMS = ['app', 'model', 'provider', 'surface', 'stream', 'outcome'];
const L_BLANK = { from: daysAgo(7), to: '', granularity: 'day', g1: 'model', g2: '', app: '', model: '', provider: '', surface: '', stream: '', outcome: 'success' };
const MEASURES = [
  ['total', 'Total'],
  ['upstream', 'Provider'],
  ['gateway_overhead', 'Gateway overhead'],
  ['guardrails', 'Guardrails'],
  ['time_to_first_token', 'First token'],
];
const msv = (v) => (v === null || v === undefined ? '-' : `${Math.round(v).toLocaleString()} ms`);
const bucketLabel = (b) => (b.to == null ? `${b.from / 1000}s+` : b.to < 1000 ? `<${b.to}ms` : `<${b.to / 1000}s`);

function Latency() {
  const { client } = usePlayground();
  const [form, setForm] = useState(L_BLANK);
  const [applied, setApplied] = useState(L_BLANK);
  const [measure, setMeasure] = useState('total');
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const list = useCollection(
    (cursor) =>
      client.call({
        path: `${P}/latency`,
        query: { ...applied, g1: undefined, g2: undefined, group_by: [applied.g1, applied.g2].filter(Boolean), limit: 200, cursor },
        source: 'Latency',
      }),
    [client, JSON.stringify(applied)],
  );
  const data = list.data;
  const total = data?.totals?.latency?.[measure];
  const buckets = data?.histogram_buckets_ms || [];
  return (
    <Panel
      title="Latency"
      subtitle="Latency distributions of your gateway requests: percentiles (estimated) and an exact histogram for end to end, provider, gateway overhead, guardrails and time to first token."
      actions={
        <>
          <ApiChips calls={[['GET', '/latency']]} />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ReportForm form={form} set={set} dims={L_DIMS} onSubmit={() => setApplied(form)} submit="Run latency report">
        <Field label="Outcome">
          <select value={form.outcome} onChange={(e) => set({ outcome: e.target.value })}>
            {['success', 'error', 'blocked', 'all'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Streaming">
          <select value={form.stream} onChange={(e) => set({ stream: e.target.value })}>
            <option value="">Any</option>
            <option value="true">streaming</option>
            <option value="false">non-streaming</option>
          </select>
        </Field>
      </ReportForm>
      <ErrorBox error={list.error} />
      <Tabs tabs={MEASURES} value={measure} onChange={setMeasure} label="Latency measure" />
      {total && (
        <Stats
          items={[
            ['Requests', num(total.count)],
            ['p50', msv(total.p50_ms)],
            ['p90', msv(total.p90_ms)],
            ['p95', msv(total.p95_ms)],
            ['p99', msv(total.p99_ms)],
            ['Max', msv(total.max_ms)],
          ]}
        />
      )}
      {total && total.count > 0 && (
        <BarChart points={buckets.map((b, i) => ({ label: bucketLabel(b), value: total.histogram[i] || 0 }))} label="Requests per latency bucket" />
      )}
      {data?.truncated && <Notice tone="warn">More than 5,000 rows matched; only the first 5,000 are returned.</Notice>}
      <Table
        rows={data?.rows || []}
        rowKey={groupKey(data)}
        empty={list.loading ? 'Loading...' : 'No requests match.'}
        columns={[
          ...groupColumns(data),
          { label: 'Requests', render: (r) => <span className={styles.num}>{num(r.latency?.[measure]?.count)}</span> },
          { label: 'p50', render: (r) => <span className={styles.num}>{msv(r.latency?.[measure]?.p50_ms)}</span> },
          { label: 'p95', render: (r) => <span className={styles.num}>{msv(r.latency?.[measure]?.p95_ms)}</span> },
          { label: 'p99', render: (r) => <span className={styles.num}>{msv(r.latency?.[measure]?.p99_ms)}</span> },
          { label: 'Max', render: (r) => <span className={styles.num}>{msv(r.latency?.[measure]?.max_ms)}</span> },
        ]}
      />
      <Pager list={list} />
      <p className={styles.muted}>Percentiles of different rows cannot be added; the histogram counts can.</p>
    </Panel>
  );
}

// ── Feature metrics ────────────────────────────────────────────────────────

const F_DIMS = ['app', 'model', 'provider', 'surface'];
const F_BLANK = { from: daysAgo(30), to: '', granularity: 'total', g1: 'app', g2: '', app: '', model: '', provider: '', surface: '' };

function Features() {
  const { client } = usePlayground();
  const [form, setForm] = useState(F_BLANK);
  const [applied, setApplied] = useState(F_BLANK);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const list = useCollection(
    (cursor) =>
      client.call({
        path: `${P}/features/summary`,
        query: { ...applied, g1: undefined, g2: undefined, group_by: [applied.g1, applied.g2].filter(Boolean), limit: 200, cursor },
        source: 'Feature metrics',
      }),
    [client, JSON.stringify(applied)],
  );
  const data = list.data;
  const t = data?.totals;
  const rc = t?.response_cache;
  return (
    <Panel
      title="Feature metrics"
      subtitle="Response cache, token saving, provider prompt caching, retries and failover, streaming and status classes, with the most frequent error codes."
      actions={
        <>
          <ApiChips calls={[['GET', '/features/summary']]} />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ReportForm form={form} set={set} dims={F_DIMS} onSubmit={() => setApplied(form)} submit="Run feature report" />
      <ErrorBox error={list.error} />
      {t && (
        <Stats
          items={[
            ['Requests', num(t.requests)],
            ['Cache hit rate', rc ? pct(rc.hit_rate_pct) : '-'],
            ['Cache saved', rc ? usd(rc.saved_cost_usd) : '-'],
            ['Tokens saved', num(t.token_saving?.tokens_saved)],
            ['Prompt cache share', pct(t.prompt_cache?.cached_input_pct)],
            ['Failovers', num(t.failover?.requests_moved)],
          ]}
        />
      )}
      {data?.coverage && (
        <p className={styles.muted}>
          {data.coverage.response_cache_from
            ? `Response cache metrics are recorded from ${data.coverage.response_cache_from}.`
            : 'Response cache metrics cover the requests that recorded them.'}
        </p>
      )}
      <Table
        rows={data?.rows || []}
        rowKey={groupKey(data)}
        empty={list.loading ? 'Loading...' : 'No requests match.'}
        columns={[
          ...groupColumns(data),
          { label: 'Requests', render: (r) => <span className={styles.num}>{num(r.requests)}</span> },
          { label: 'Cache hits / misses', render: (r) => (r.response_cache ? `${num(r.response_cache.hits)} / ${num(r.response_cache.misses)}` : '-') },
          { label: 'Hit rate', render: (r) => <span className={styles.num}>{r.response_cache ? pct(r.response_cache.hit_rate_pct) : '-'}</span> },
          { label: 'Tokens saved', render: (r) => <span className={styles.num}>{num(r.token_saving?.tokens_saved)}</span> },
          { label: 'Cached input', render: (r) => <span className={styles.num}>{pct(r.prompt_cache?.cached_input_pct)}</span> },
          { label: 'Retried / moved', render: (r) => `${num(r.failover?.requests_retried)} / ${num(r.failover?.requests_moved)}` },
          { label: '4xx / 5xx', render: (r) => `${num(r.status_classes?.['4xx'])} / ${num(r.status_classes?.['5xx'])}` },
        ]}
      />
      <Pager list={list} />
      {t?.top_error_codes?.length > 0 && (
        <Table
          rows={t.top_error_codes}
          rowKey={(r) => r.code}
          columns={[
            { label: 'Error code', render: (r) => <code>{r.code}</code> },
            { label: 'Requests', render: (r) => <span className={styles.num}>{num(r.requests)}</span> },
          ]}
        />
      )}
    </Panel>
  );
}

// ── Requests ───────────────────────────────────────────────────────────────

const R_BLANK = { app: '', model: '', provider: '', user: '', outcome: '', status: '', category: '', action: '', min_latency_ms: '', stream: '' };
const outcomeTone = (o) => (o === 'served' ? 'ok' : o === 'error' ? 'err' : 'warn');

function Requests() {
  const { client, navigate } = usePlayground();
  const [form, setForm] = useState(R_BLANK);
  const [applied, setApplied] = useState(R_BLANK);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const list = useCollection(
    (cursor) => client.call({ path: `${P}/requests`, query: { ...applied, limit: 50, cursor }, source: 'Requests' }),
    [client, JSON.stringify(applied)],
  );
  const data = list.data;
  return (
    <Panel
      title="Requests"
      subtitle="Your gateway requests, newest first (the last 24 hours by default). Metadata only: never prompt or response text or detected values."
      actions={
        <>
          <ApiChips calls={[['GET', '/requests']]} />
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
        <Field label="App">
          <input value={form.app} onChange={(e) => set({ app: e.target.value })} placeholder="Support Bot" />
        </Field>
        <Field label="User email">
          <input value={form.user} onChange={(e) => set({ user: e.target.value })} />
        </Field>
        <Field label="Outcome">
          <select value={form.outcome} onChange={(e) => set({ outcome: e.target.value })}>
            <option value="">Any</option>
            {['served', 'blocked', 'error', 'rate_limited'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Status" hint="A code (429) or class (5xx).">
          <input value={form.status} onChange={(e) => set({ status: e.target.value })} />
        </Field>
        <Field label="Slower than (ms)">
          <input value={form.min_latency_ms} onChange={(e) => set({ min_latency_ms: e.target.value })} inputMode="numeric" />
        </Field>
        <details style={{ flexBasis: '100%' }}>
          <summary>More filters</summary>
          <div className={styles.filters} style={{ marginTop: 10 }}>
            <Field label="Served model">
              <input value={form.model} onChange={(e) => set({ model: e.target.value })} />
            </Field>
            <Field label="Provider">
              <input value={form.provider} onChange={(e) => set({ provider: e.target.value })} />
            </Field>
            <Field label="Category" hint="Id or display name, or unattributed.">
              <input value={form.category} onChange={(e) => set({ category: e.target.value })} />
            </Field>
            <Field label="Action">
              <select value={form.action} onChange={(e) => set({ action: e.target.value })}>
                <option value="">Any</option>
                {['blocked', 'redacted', 'monitored'].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Streaming">
              <select value={form.stream} onChange={(e) => set({ stream: e.target.value })}>
                <option value="">Any</option>
                <option value="true">streaming</option>
                <option value="false">non-streaming</option>
              </select>
            </Field>
          </div>
        </details>
        <Btn type="submit" variant="primary">
          <Search size={13} aria-hidden /> List requests
        </Btn>
      </form>
      <ErrorBox error={list.error} />
      <Table
        rows={data?.items || []}
        rowKey={(r) => r.request_id}
        empty={list.loading ? 'Loading...' : 'No requests match.'}
        columns={[
          { label: 'Time', render: (r) => <span className={styles.nowrap}>{when(r.timestamp)}</span> },
          { label: 'App', render: (r) => fmt(r.app) },
          { label: 'User', render: (r) => fmt(r.user) },
          { label: 'Model', render: (r) => <code>{fmt(r.model)}</code> },
          {
            label: 'Outcome',
            render: (r) => (
              <span className={styles.nowrap}>
                <Pill tone={outcomeTone(r.outcome)}>{r.outcome}</Pill> {r.status_code || ''}
              </span>
            ),
          },
          { label: 'Latency', render: (r) => <span className={styles.num}>{msv(r.latency?.total_ms)}</span> },
          { label: 'Tokens in / out', render: (r) => `${num(r.tokens?.input)} / ${num(r.tokens?.output)}` },
          { label: 'Cost', render: (r) => <span className={styles.num}>{r.cost_usd == null ? '-' : usd(r.cost_usd)}</span> },
          {
            label: 'Guardrails',
            render: (r) =>
              r.guardrails?.actions?.length ? r.guardrails.actions.map((a) => <Pill key={a} tone={actionTone(a)}>{a}</Pill>) : '-',
          },
          {
            label: '',
            render: (r) => (
              <Btn onClick={() => navigate('monitoring', { view: 'explain', request_id: r.request_id })}>
                Explain
              </Btn>
            ),
          },
        ]}
      />
      <Pager list={list} />
    </Panel>
  );
}

// ── Explain a request ──────────────────────────────────────────────────────

function Explain() {
  const { client, urlParam, setParam } = usePlayground();
  const [id, setId] = useState(urlParam('request_id'));
  const [timestamp, setTimestamp] = useState('');
  const [result, setResult] = useState(null);
  const action = useAction();

  async function explain(requestId = id) {
    const value = requestId.trim();
    if (!value) return;
    setParam('request_id', value);
    setResult(null);
    await action.run(async () => {
      const res = await client.call({
        path: `${P}/requests/${seg(value)}/explain`,
        query: { timestamp: timestamp.trim() },
        source: 'Explain a request',
      });
      setResult(res);
      return res;
    });
  }

  useEffect(() => {
    if (urlParam('request_id')) explain(urlParam('request_id'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Panel
      title="Explain a request"
      subtitle="Why one request was routed, blocked, limited or failed over. Paste the x-quilr-request-id response header. No prompt or response content is returned."
      actions={<ApiChips calls={[['GET', '/requests/{request_id}/explain']]} />}
    >
      <form
        className={styles.filters}
        onSubmit={(e) => {
          e.preventDefault();
          explain();
        }}
      >
        <Field label="Request id" hint="The x-quilr-request-id header. Provider response ids are not accepted.">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="6f1c2a9e-1b2c-4d3e-8f90-1234567890ab" spellCheck="false" />
        </Field>
        <Field label="Approximate time (optional)" hint="For requests older than 30 days. RFC 3339 or epoch seconds.">
          <input value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="2026-11-01T14:03:22Z" />
        </Field>
        <Btn type="submit" variant="primary" disabled={!id.trim()}>
          <Search size={13} aria-hidden /> Explain
        </Btn>
      </form>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      {action.error?.status === 404 && (
        <p className={styles.muted}>
          Not found yet? Explanations are available a short time after the request completes. Check the id belongs to this
          organization, and pass an approximate time for requests older than 30 days.
        </p>
      )}
      {result && <Explanation data={result} />}
    </Panel>
  );
}

const ruleText = (rule) =>
  rule ? `${rule.managed ? 'managed control' : rule.policy || 'policy'}${rule.rule_index != null ? ` rule ${rule.rule_index}` : ''}${rule.route_id ? ` (${rule.route_id})` : ''}` : '-';

function Section({ title, children }) {
  return (
    <div className={styles.subPanel}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function GuardrailDirection({ name, data }) {
  if (!data) return null;
  const actions = data.actions || [];
  return (
    <KeyValue
      items={[
        [
          name,
          actions.length ? (
            <span className={styles.inline}>
              {actions.map((a, i) => (
                <span key={i}>
                  <Pill tone={actionTone(a.action)}>{a.action}</Pill> {(a.categories || []).map((c) => `${c.name || c.id}${c.type ? ` (${c.type})` : ''}`).join(', ')}
                </span>
              ))}
            </span>
          ) : (
            'no action'
          ),
        ],
        (data.decided_by_rules || []).length ? [`${name} rules`, data.decided_by_rules.map(ruleText).join('; ')] : null,
      ]}
    />
  );
}

export function Explanation({ data }) {
  const s = data.summary || {};
  const r = data.routing;
  const f = data.failover;
  const g = data.guardrails;
  const l = data.limits;
  const e = data.error;
  const outcomeTone = s.outcome === 'served' ? 'ok' : s.outcome === 'error' ? 'err' : 'warn';
  return (
    <div className={styles.stack}>
      <Section title="Summary">
        <KeyValue
          items={[
            ['Outcome', <><Pill tone={outcomeTone}>{fmt(s.outcome)}</Pill> {s.status_code != null && <code>{s.status_code}</code>}</>],
            ['Time', when(data.timestamp)],
            ['App', fmt(s.app)],
            s.user_email ? ['User', s.user_email] : null,
            ['Endpoint', <code>{fmt(s.endpoint)}</code>],
            ['Model', `${fmt(s.requested_model)}${s.served_model && s.served_model !== s.requested_model ? ` served as ${s.served_model}` : ''}`],
            ['Provider', fmt(s.provider_label)],
            s.latency_ms ? ['Latency', Object.entries(s.latency_ms).map(([k, v]) => `${k} ${v} ms`).join(' · ')] : null,
            s.tokens ? ['Tokens', Object.entries(s.tokens).map(([k, v]) => `${k} ${num(v)}`).join(' · ')] : null,
            s.cost ? ['Cost', `${usd(s.cost.usd)}${s.cost.status ? ` (${s.cost.status})` : ''}`] : null,
            s.response_cache ? ['Response cache', fmt(s.response_cache.status)] : null,
            s.request_kind && s.request_kind !== 'client' ? ['Request kind', s.request_kind] : null,
          ]}
        />
      </Section>
      {r && (
        <Section title="Routing">
          <KeyValue
            items={[
              ['Chosen by', fmt(r.source)],
              r.rule ? ['Rule', ruleText(r.rule)] : null,
              r.route_id ? ['Route id', <code>{r.route_id}</code>] : null,
              r.routing_group ? ['Routing group', r.routing_group] : null,
              r.session ? ['Conversation pin', `${r.session.pinned ? 'reused pin' : 'new decision'}${r.session.pin_target ? ` to ${r.session.pin_target}` : ''}${r.session.key_source ? ` (by ${r.session.key_source})` : ''}`] : null,
              r.upstream ? ['Upstream API', `${fmt(r.upstream.client_api)} to ${fmt(r.upstream.upstream_api)} (${fmt(r.upstream.mode)})`] : null,
              r.fallback_reason ? ['Fallback', fmt(r.fallback_reason)] : null,
              r.observe_only ? ['Observe only', fmt(r.observe_only)] : null,
            ]}
          />
          {(r.content || r.constraints || r.candidates_skipped) && (
            <details>
              <summary>Content routing, constraints and skipped candidates</summary>
              <JsonView value={{ content: r.content, constraints: r.constraints, candidates_skipped: r.candidates_skipped }} />
            </details>
          )}
        </Section>
      )}
      {f && (
        <Section title="Failover">
          <p className={styles.muted}>
            {num(f.sends)} sends, {num(f.retries)} retries, {num(f.failovers)} failovers{f.served_tier ? `, served from tier ${f.served_tier}` : ''}
            {f.exhausted ? ', every target exhausted' : ''}. Configured by {fmt(f.configured_by)}.
          </p>
          <Table
            rows={f.attempts || []}
            rowKey={(a) => a.index}
            columns={[
              { label: '#', render: (a) => a.index },
              { label: 'Target', render: (a) => <code>{`${fmt(a.provider_label)} / ${fmt(a.model)}`}</code> },
              { label: 'Tier', render: (a) => fmt(a.tier) },
              { label: 'Outcome', render: (a) => <Pill tone={a.outcome === 'served' ? 'ok' : a.outcome === 'final_error' ? 'err' : 'warn'}>{fmt(a.outcome)}</Pill> },
              { label: 'Status', render: (a) => fmt(a.status_code) },
              { label: 'Failure', render: (a) => fmt(a.failure_class || a.skip_reason) },
              { label: 'Duration', render: (a) => (a.duration_ms != null ? `${a.duration_ms} ms` : '-') },
            ]}
          />
        </Section>
      )}
      {g && (
        <Section title="Guardrails">
          <KeyValue items={[['Outcome', <Pill tone={actionTone(g.outcome === 'none' ? '' : g.outcome)}>{fmt(g.outcome)}</Pill>], g.risk_level ? ['Risk level', g.risk_level] : null]} />
          <GuardrailDirection name="Request" data={g.request} />
          <GuardrailDirection name="Response" data={g.response} />
          {g.agent_checks && (
            <details>
              <summary>Agent checks</summary>
              <JsonView value={g.agent_checks} />
            </details>
          )}
        </Section>
      )}
      {l && (
        <Section title="Limits and budgets">
          <KeyValue
            items={[
              ['Budgets', fmt(l.budget_evaluation)],
              l.charge_status ? ['Charges', l.charge_status] : null,
              l.rejection ? ['Refused by', `${fmt(l.rejection.kind)} ${fmt(l.rejection.code || l.rejection.check)}${l.rejection.budget_id ? ` (${l.rejection.budget_id})` : ''}`] : null,
            ]}
          />
          {(l.charges || []).length > 0 && (
            <Table
              rows={l.charges}
              rowKey={(c) => `${c.budget_id}|${c.window}`}
              columns={[
                { label: 'Budget', render: (c) => <code>{fmt(c.budget_id)}</code> },
                { label: 'Window', render: (c) => fmt(c.window) },
                { label: 'Mode', render: (c) => fmt(c.mode) },
                { label: 'Charged', render: (c) => Object.entries(c.charged || {}).map(([k, v]) => `${k} ${v}`).join(' · ') },
                { label: 'Over limit', render: (c) => (c.over_limit ? <Pill tone="err">yes</Pill> : 'no') },
              ]}
            />
          )}
        </Section>
      )}
      {e && (
        <Section title="Error">
          <KeyValue
            items={[
              ['Code', <code>{fmt(e.code)}</code>],
              ['Status', fmt(e.status_code)],
              ['Raised by', fmt(e.raised_by)],
              e.failure_class ? ['Failure class', e.failure_class] : null,
              ['Friendly message', e.friendly_message_applied ? `applied${e.friendly_message?.mapping_id ? ` (${e.friendly_message.mapping_id})` : ''}` : 'no'],
              e.in_stream ? ['In stream', 'yes'] : null,
            ]}
          />
        </Section>
      )}
      <details>
        <summary>Raw explanation</summary>
        <JsonView value={data} maxHeight={480} />
      </details>
    </div>
  );
}
