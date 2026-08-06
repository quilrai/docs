import React, { useEffect, useMemo, useState } from 'react';
import { History, ShieldCheck, X } from 'lucide-react';
import { GATEWAY_ROLLUP_DAYS, stateMeta, summarizeGateways } from './gatewayRollup';
import styles from './timeline.module.css';

// Gateway Health: MCP Gateway and LLM Gateway sections. All data (fetch, bucket shape,
// uptime weighting) lives in ./gatewayRollup.js so this view and the page header cannot
// drift apart; this file is the rendering only.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function stateClass(prefix, state) {
  return styles[`${prefix}_${state}`] || styles[`${prefix}_nodata`];
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
  return `${n.toFixed(2)}%`;
}

/* ────────────────────────────────── Subviews ───────────────────────── */

function Tooltip({ hover }) {
  if (!hover) return null;
  const { b, comp, x, y } = hover;
  return (
    <div className={styles.tooltip} style={{ left: `${x}px`, top: `${y}px` }}>
      <div className={styles.ttHead}>
        <span className={`${styles.ttDot} ${stateClass('s', b.state)}`} />
        {stateMeta(b.state).label}
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
          <span className={`${styles.statusPill} ${stateClass('p', currentState)}`}>
            <span className={styles.pillDot} />
            {stateMeta(currentState).label}
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
                className={`${styles.bar} ${stateClass('s', b.state)}`}
                onMouseEnter={(e) => onHover(e, b, comp)}
                onMouseLeave={onLeave}
                aria-label={`${fmtHour(b.t)}: ${stateMeta(b.state).label}`}
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

export default function GatewayTimeline({ mcpRows, llmRows, status, onViewProviders }) {
  const [hover, setHover] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!historyOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setHistoryOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [historyOpen]);

  // Same computation the page header runs, so the aggregate uptime here always matches the
  // headline pill above it.
  const overall = useMemo(
    () => summarizeGateways([...mcpRows, ...llmRows], status),
    [mcpRows, llmRows, status],
  );

  const handleHover = (e, b, comp) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ b, comp, x: r.left + r.width / 2, y: r.top - 10 });
  };

  const renderGroup = (label, groupRows) => (
    <React.Fragment key={label}>
      <div className={styles.groupHead}>
        <span className={styles.groupLabel}>{label}</span>
        <span className={styles.groupNote}>Live</span>
      </div>
      {status === 'error' ? (
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
          {status === 'loading' && groupRows.length === 0 ? (
            <div className={styles.loading}>Loading {label} health...</div>
          ) : null}
        </div>
      )}
    </React.Fragment>
  );

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <History size={15} />
        <h2 className={styles.sectionTitle}>Gateway Health</h2>
        <span className={styles.sectionNote}>Hourly buckets · last {GATEWAY_ROLLUP_DAYS} days · UTC</span>
      </div>

      {/* The current-state pill lives in the page header now; this bar carries the number the
          SLA is actually written against. */}
      <div className={styles.summaryBar}>
        <span className={styles.uptimeStat}>
          <span className={styles.uptimeStatValue}>
            {overall.uptime != null ? fmtPct(overall.uptime) : '-'}
          </span>
          <span className={styles.uptimeStatLabel}>{GATEWAY_ROLLUP_DAYS}-day uptime, all components</span>
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

      <p className={styles.scopeNote}>
        Degradation here is ours: these bars count request handling, policy evaluation and
        routing overhead inside the gateway. A slow or failing upstream model does not move
        them - that is tracked separately under{' '}
        <button type="button" className={styles.linkBtn} onClick={onViewProviders}>
          Provider Health
        </button>
        .
      </p>

      {renderGroup('MCP Gateway', mcpRows)}
      {renderGroup('LLM Gateway', llmRows)}

      <div className={styles.legend}>
        {['operational', 'degraded', 'partial', 'major', 'monitor_disconnected', 'maintenance'].map((s) => (
          <span key={s} className={styles.legendItem}>
            <span className={`${styles.swatch} ${stateClass('s', s)}`} />
            {stateMeta(s).label}
          </span>
        ))}
        <span className={styles.legendHint}>Each bar = 1 hour · hover for detail</span>
      </div>

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
