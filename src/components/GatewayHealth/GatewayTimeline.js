import React, { useEffect, useMemo, useState } from 'react';
import { History, ShieldCheck, X } from 'lucide-react';
import styles from './timeline.module.css';

/*
 * Gateway Health - historical, server-measured status in 1-hour buckets for
 * each LLM Gateway region plus the global auto-router.
 *
 * NOTE: the data here is DETERMINISTIC MOCK DATA, generated from a fixed window
 * start (1 Jul 2026) with a seeded PRNG so the timeline is stable across
 * refreshes and re-renders. This is a design surface. Replace buildTimeline()
 * with a fetch of the real per-hour rollup API when the backend exists; the
 * expected shape per bucket is documented in the Bucket typedef below.
 *
 * Bucket = {
 *   t: number,            // epoch ms, start of the hour (UTC-aligned)
 *   state: 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance' | 'nodata',
 *   p95: number | null,   // gateway overhead p95 in ms (null when no successful traffic)
 *   errorRate: number,    // gateway-attributed 5xx rate, percent
 *   requests: number,     // requests served in the hour
 *   incidentId: string | null,
 * }
 */

/* ────────────────────────────────── Config ─────────────────────────── */

const HOUR_MS = 3600000;
// Fixed design window start: 1 Jul 2026 00:00 UTC.
const WINDOW_START = Date.UTC(2026, 6, 1, 0, 0, 0);

// Regions + the global auto-router. baseP95 ties to the documented ~40ms
// gateway overhead; baseReq is a per-hour request volume for realism.
const COMPONENTS = [
  {
    id: 'global',
    kind: 'Global',
    label: 'Global Router',
    host: 'guardrails.quilr.ai',
    baseP95: 42,
    baseReq: 240000,
    note: 'Auto-routes to the nearest healthy region.',
  },
  {
    id: 'usa-1',
    kind: 'Region',
    label: 'US Central West',
    host: 'guardrails-usa-1.quilr.ai',
    baseP95: 37,
    baseReq: 96000,
  },
  {
    id: 'usa-2',
    kind: 'Region',
    label: 'US East',
    host: 'guardrails-usa-2.quilr.ai',
    baseP95: 39,
    baseReq: 128000,
  },
  {
    id: 'india-1',
    kind: 'Region',
    label: 'India · Mumbai',
    host: 'guardrails-india-1.quilr.ai',
    baseP95: 45,
    baseReq: 61000,
  },
];

const STATE_META = {
  operational: { label: 'Operational' },
  degraded: { label: 'Degraded' },
  partial: { label: 'Partial outage' },
  major: { label: 'Major outage' },
  maintenance: { label: 'Maintenance' },
  nodata: { label: 'No data' },
};

// How much each hour counts against uptime (maintenance is excluded entirely).
const DOWN_WEIGHT = { operational: 0, degraded: 0, partial: 0.5, major: 1, maintenance: 0, nodata: 0 };
const SEVERITY_RANK = { operational: 0, maintenance: 1, degraded: 2, partial: 3, major: 4, nodata: 0 };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ────────────────────────────────── Mock generation ────────────────── */

function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic PRNG (mulberry32) - same seed always yields the same sequence.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBuckets(comp, nowHour) {
  const buckets = [];
  for (let t = WINDOW_START; t <= nowHour; t += HOUR_MS) {
    const hourIndex = (t - WINDOW_START) / HOUR_MS;
    const rand = mulberry32(hashStr(`${comp.id}:${hourIndex}`));

    // Diurnal request curve (deterministic), peaking mid-day UTC.
    const hourOfDay = new Date(t).getUTCHours();
    const diel = 0.62 + 0.4 * Math.sin(((hourOfDay - 8) / 24) * Math.PI * 2);
    const requests = Math.round(comp.baseReq * diel * (0.9 + rand() * 0.2));

    // 100% uptime, zero errors: every bucket is operational. p95 keeps a small
    // deterministic jitter so tooltips read realistically. Swap this whole
    // function for the real per-hour rollup API when the backend exists.
    const p95 = Math.round(comp.baseP95 + (rand() * 10 - 3));
    const errorRate = 0;

    buckets.push({ t, hourIndex, state: 'operational', p95, errorRate, requests, incidentId: null });
  }
  return buckets;
}

function summarize(buckets) {
  let downWeight = 0;
  let denom = 0;
  let p95Sum = 0;
  let p95N = 0;
  let errSum = 0;
  let reqTotal = 0;
  for (const b of buckets) {
    if (b.state !== 'maintenance') {
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
          <span className={styles.rowHost}>{comp.host}</span>
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

export default function GatewayTimeline() {
  // nowHour is client-only (Date.now) to avoid SSR/hydration mismatch.
  const [nowHour, setNowHour] = useState(null);
  const [hover, setHover] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setNowHour(Math.floor(Date.now() / HOUR_MS) * HOUR_MS);
  }, []);

  useEffect(() => {
    if (!historyOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setHistoryOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [historyOpen]);

  const rows = useMemo(() => {
    if (!nowHour) return [];
    return COMPONENTS.map((comp) => {
      const buckets = buildBuckets(comp, nowHour);
      return { comp, buckets, stats: summarize(buckets) };
    });
  }, [nowHour]);

  const overall = useMemo(() => {
    if (!rows.length) return { state: 'nodata', label: 'Loading…' };
    let worst = 'operational';
    for (const r of rows) {
      const s = r.stats.current ? r.stats.current.state : 'operational';
      if (SEVERITY_RANK[s] > SEVERITY_RANK[worst]) worst = s;
    }
    const label =
      worst === 'operational' || worst === 'maintenance'
        ? 'All Regions Operational'
        : worst === 'degraded'
        ? 'Degraded Performance'
        : worst === 'partial'
        ? 'Partial Region Outage'
        : 'Major Region Outage';
    return { state: worst, label };
  }, [rows]);

  const handleHover = (e, b, comp) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ b, comp, x: r.left + r.width / 2, y: r.top - 10 });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <History size={15} />
        <h2 className={styles.sectionTitle}>Gateway Health</h2>
        <span className={styles.sectionNote}>Hourly buckets · since Jul 1, 2026 · UTC</span>
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

      {rows.length === 0 ? (
        <div className={styles.loading}>Loading timeline…</div>
      ) : (
        <>
          <div className={styles.rows}>
            {rows.map((r) => (
              <ComponentRow
                key={r.comp.id}
                comp={r.comp}
                buckets={r.buckets}
                stats={r.stats}
                onHover={handleHover}
                onLeave={() => setHover(null)}
              />
            ))}
          </div>

          <div className={styles.legend}>
            {['operational', 'degraded', 'partial', 'major', 'maintenance'].map((s) => (
              <span key={s} className={styles.legendItem}>
                <span className={`${styles.swatch} ${styles[`s_${s}`]}`} />
                {STATE_META[s].label}
              </span>
            ))}
            <span className={styles.legendHint}>Each bar = 1 hour · hover for detail</span>
          </div>
        </>
      )}

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
