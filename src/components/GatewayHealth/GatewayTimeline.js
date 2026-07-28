import React, { useEffect, useMemo, useState } from 'react';
import { History, ShieldCheck, X } from 'lucide-react';
import styles from './timeline.module.css';

// Gateway Health: MCP Gateway and LLM Gateway sections, both fetched from rollup_server.py, which lives in the
// macrodata-refinement repo at OTHER_APPS/gateway_health/rollup_server.py (this repo has no backend).
// Bucket = { t, state: 'operational'|'degraded'|'partial'|'major'|'monitor_disconnected'|'maintenance'|'nodata', p95, errorRate, requests, incidentId }
// monitor_disconnected = the sustained failures behind this bucket never got a response at all
// (the monitoring worker/host itself lost outbound connectivity), not the real gateway
// infrastructure failing - see is_connectivity_error in rollup_server.py.

/* ────────────────────────────────── Config ─────────────────────────── */

const GATEWAY_ROLLUP_URL = 'https://health-check.mcp.quilr.ai/api/public/gateway-health/rollup';
const GATEWAY_ROLLUP_DAYS = 7;
const GATEWAY_ROLLUP_TIMEOUT_MS = 15000;

const STATE_META = {
  operational: { label: 'Operational' },
  degraded: { label: 'Degraded' },
  partial: { label: 'Partial outage' },
  major: { label: 'Major outage' },
  monitor_disconnected: { label: 'Monitoring interrupted' },
  maintenance: { label: 'Maintenance' },
  nodata: { label: 'No data' },
};

// How much each hour counts against uptime (maintenance and monitor_disconnected are excluded
// entirely - neither reflects the real gateway's health, just a monitoring gap).
const DOWN_WEIGHT = { operational: 0, degraded: 0, partial: 0.5, major: 1, monitor_disconnected: 0, maintenance: 0, nodata: 0 };
const SEVERITY_RANK = { operational: 0, maintenance: 1, monitor_disconnected: 1, degraded: 2, partial: 3, major: 4, nodata: 0 };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function summarize(buckets) {
  let downWeight = 0;
  let denom = 0;
  let p95Sum = 0;
  let p95N = 0;
  let errSum = 0;
  let reqTotal = 0;
  for (const b of buckets) {
    if (b.state !== 'maintenance' && b.state !== 'monitor_disconnected') {
      denom += 1;
      downWeight += DOWN_WEIGHT[b.state];
    }
    if (b.p95 != null) {
      p95Sum += b.p95;
      p95N += 1;
    }
    errSum += b.errorRate;
    reqTotal += b.requests;
  }
  return {
    uptime: denom ? (1 - downWeight / denom) * 100 : 100,
    p95: p95N ? Math.round(p95Sum / p95N) : null,
    errorRate: buckets.length ? errSum / buckets.length : 0,
    requests: reqTotal,
    current: buckets[buckets.length - 1] || null,
  };
}

// Group a component's buckets into UTC-day columns for the strip + axis.
function groupByDay(buckets) {
  const days = [];
  let current = null;
  for (const b of buckets) {
    const d = new Date(b.t);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    if (!current || current.key !== key) {
      current = { key, label: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`, buckets: [] };
      days.push(current);
    }
    current.buckets.push(b);
  }
  return days;
}


/* ────────────────────────────────── Formatting ─────────────────────── */

function fmtHour(t) {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${String(d.getUTCHours()).padStart(2, '0')}:00 UTC`;
}

function fmtCount(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(n);
}

function fmtPct(n) {
  return `${n.toFixed(n >= 99.995 ? 2 : 2)}%`;
}

/* ────────────────────────────────── Subviews ───────────────────────── */

function Tooltip({ hover }) {
  if (!hover) return null;
  const { b, comp, x, y } = hover;
  return (
    <div className={styles.tooltip} style={{ left: `${x}px`, top: `${y}px` }}>
      <div className={styles.ttHead}>
        <span className={`${styles.ttDot} ${styles[`s_${b.state}`]}`} />
        {STATE_META[b.state].label}
        <span className={styles.ttComp}>· {comp.label}</span>
      </div>
      <div className={styles.ttTime}>{fmtHour(b.t)}</div>
      <div className={styles.ttGrid}>
        <span>Overhead p95</span>
        <span>{b.p95 != null ? `${b.p95} ms` : '-'}</span>
        <span>Error rate</span>
        <span>{b.errorRate.toFixed(2)}%</span>
        <span>Requests</span>
        <span>{fmtCount(b.requests)}</span>
      </div>
      {b.incidentId ? <div className={styles.ttInc}>↳ {b.incidentId}</div> : null}
    </div>
  );
}

function ComponentRow({ comp, buckets, stats, onHover, onLeave }) {
  const days = useMemo(() => groupByDay(buckets), [buckets]);
  const currentState = stats.current ? stats.current.state : 'nodata';

  return (
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <div className={styles.rowId}>
          <span className={styles.rowKind}>{comp.kind}</span>
          <span className={styles.rowLabel}>{comp.label}</span>
          {comp.host ? <span className={styles.rowHost}>{comp.host}</span> : null}
        </div>
        <div className={styles.rowRight}>
          <span className={styles.rowUptime}>
            <strong>{fmtPct(stats.uptime)}</strong> uptime
          </span>
          <span className={`${styles.statusPill} ${styles[`p_${currentState}`]}`}>
            <span className={styles.pillDot} />
            {STATE_META[currentState].label}
          </span>
        </div>
      </div>

      {/* 7 days' worth of bars fluidly fills the row width (flex-grow proportional to bucket
          count per day) - shrinks to fit rather than needing a scrollbar, since a 7-day span
          is small enough not to need a hard per-bar minimum width. */}
      <div className={styles.strip}>
        {days.map((day) => (
          <div key={day.key} className={styles.dayCol} style={{ flexGrow: day.buckets.length }}>
            {day.buckets.map((b) => (
              <button
                type="button"
                key={b.t}
                className={`${styles.bar} ${styles[`s_${b.state}`]}`}
                onMouseEnter={(e) => onHover(e, b, comp)}
                onMouseLeave={onLeave}
                aria-label={`${fmtHour(b.t)}: ${STATE_META[b.state].label}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.axis}>
        {days.map((day) => (
          <span key={day.key} className={styles.axisLabel} style={{ flexGrow: day.buckets.length }}>
            {day.label}
          </span>
        ))}
      </div>

      <div className={styles.rowFooter}>
        <span>overhead p95 {stats.p95 != null ? `${stats.p95}ms` : '-'}</span>
        <span>error {stats.errorRate.toFixed(2)}%</span>
        <span>{fmtCount(stats.requests)} reqs</span>
        {comp.note ? <span className={styles.rowNote}>{comp.note}</span> : null}
      </div>
    </div>
  );
}

/* ────────────────────────────────── Component ──────────────────────── */

const ROW_HOSTS = { mcp: 'mcpgateway.quilr.ai' };

function mapRollup(data) {
  const byGroup = { mcp: [], llm: [] };
  for (const c of data?.components || []) {
    const buckets = c.buckets || [];
    const row = {
      comp: { id: c.id, kind: c.kind, label: c.label, host: c.host || ROW_HOSTS[c.group], note: c.note },
      buckets,
      stats: summarize(buckets),
    };
    (byGroup[c.group] || (byGroup[c.group] = [])).push(row);
  }
  return byGroup;
}

export default function GatewayTimeline() {
  const [hover, setHover] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mcpRows, setMcpRows] = useState([]);
  const [llmRows, setLlmRows] = useState([]);
  const [rollupStatus, setRollupStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GATEWAY_ROLLUP_TIMEOUT_MS);

    fetch(`${GATEWAY_ROLLUP_URL}?days=${GATEWAY_ROLLUP_DAYS}`, { cache: 'no-store', signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const byGroup = mapRollup(data);
        setMcpRows(byGroup.mcp || []);
        setLlmRows(byGroup.llm || []);
        setRollupStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setRollupStatus('error');
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!historyOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setHistoryOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [historyOpen]);

  const overall = useMemo(() => {
    const allRows = [...mcpRows, ...llmRows];
    if (!allRows.length) return { state: 'nodata', label: 'Loading…' };
    let worst = 'operational';
    for (const r of allRows) {
      const s = r.stats.current ? r.stats.current.state : 'operational';
      if (SEVERITY_RANK[s] > SEVERITY_RANK[worst]) worst = s;
    }
    const label =
      worst === 'operational' || worst === 'maintenance'
        ? 'All Systems Operational'
        : worst === 'monitor_disconnected'
        ? 'Monitoring Interrupted'
        : worst === 'degraded'
        ? 'Degraded Performance'
        : worst === 'partial'
        ? 'Partial Outage'
        : 'Major Outage';
    return { state: worst, label };
  }, [mcpRows, llmRows]);

  const handleHover = (e, b, comp) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ b, comp, x: r.left + r.width / 2, y: r.top - 10 });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <History size={15} />
        <h2 className={styles.sectionTitle}>Gateway Health</h2>
        <span className={styles.sectionNote}>Hourly buckets · last {GATEWAY_ROLLUP_DAYS} days · UTC</span>
      </div>

      <div className={styles.summaryBar}>
        <span className={`${styles.overallPill} ${styles[`p_${overall.state}`]}`}>
          <span className={styles.pillDot} />
          {overall.label}
        </span>
        <span className={styles.slaNote}>
          <ShieldCheck size={13} />
          Target SLA 99.6% uptime · ~40ms gateway overhead
        </span>
        <button
          type="button"
          className={styles.historyBtn}
          onClick={() => setHistoryOpen(true)}
        >
          <History size={13} />
          Incident history
        </button>
      </div>

      {(() => {
        const renderGroup = (label, groupRows) => (
          <React.Fragment key={label}>
            <div className={styles.groupHead}>
              <span className={styles.groupLabel}>{label}</span>
              <span className={styles.groupNote}>Live</span>
            </div>
            {rollupStatus === 'error' ? (
              <div className={styles.groupError}>Couldn't load {label} health right now.</div>
            ) : (
              <div className={styles.rows}>
                {groupRows.map((r) => (
                  <ComponentRow
                    key={r.comp.id}
                    comp={r.comp}
                    buckets={r.buckets}
                    stats={r.stats}
                    onHover={handleHover}
                    onLeave={() => setHover(null)}
                  />
                ))}
                {rollupStatus === 'loading' && groupRows.length === 0 ? (
                  <div className={styles.loading}>Loading {label} health…</div>
                ) : null}
              </div>
            )}
          </React.Fragment>
        );

        return (
          <>
            {renderGroup('MCP Gateway', mcpRows)}
            {renderGroup('LLM Gateway', llmRows)}

            <div className={styles.legend}>
              {['operational', 'degraded', 'partial', 'major', 'monitor_disconnected', 'maintenance'].map((s) => (
                <span key={s} className={styles.legendItem}>
                  <span className={`${styles.swatch} ${styles[`s_${s}`]}`} />
                  {STATE_META[s].label}
                </span>
              ))}
              <span className={styles.legendHint}>Each bar = 1 hour · hover for detail</span>
            </div>
          </>
        );
      })()}

      <Tooltip hover={hover} />

      {/* Incident history side drawer - empty for now */}
      <div
        className={`${styles.drawerBackdrop} ${historyOpen ? styles.drawerOpen : ''}`}
        onClick={() => setHistoryOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${historyOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Incident history"
        aria-hidden={!historyOpen}
      >
        <div className={styles.drawerHead}>
          <h3 className={styles.drawerTitle}>Incident history</h3>
          <button
            type="button"
            className={styles.drawerClose}
            onClick={() => setHistoryOpen(false)}
            aria-label="Close incident history"
          >
            <X size={16} />
          </button>
        </div>
        <div className={styles.drawerBody}>
          <p className={styles.drawerEmpty}>No incidents to show.</p>
        </div>
      </aside>
    </section>
  );
}
