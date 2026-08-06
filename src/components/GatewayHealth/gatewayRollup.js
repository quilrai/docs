import { useCallback, useEffect, useRef, useState } from 'react';

// Shared source of truth for Gateway Health. Both the page header (the headline status
// pill) and the Gateway Health timeline read from this one fetch - the header must never
// disagree with the section below it, and one page load should mean one rollup request.
//
// Data comes from rollup_server.py, which lives in the macrodata-refinement repo at
// OTHER_APPS/gateway_health/rollup_server.py (this repo has no backend).
// Bucket = { t, state: 'operational'|'degraded'|'partial'|'major'|'monitor_disconnected'|'maintenance'|'nodata', p95, errorRate, requests, incidentId }
// monitor_disconnected = the sustained failures behind this bucket never got a response at all
// (the monitoring worker/host itself lost outbound connectivity), not the real gateway
// infrastructure failing - see is_connectivity_error in rollup_server.py.

const GATEWAY_ROLLUP_URL = 'https://health-check.mcp.quilr.ai/api/public/gateway-health/rollup';
export const GATEWAY_ROLLUP_DAYS = 7;
const GATEWAY_ROLLUP_TIMEOUT_MS = 15000;

export const STATE_META = {
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

// Tone names shared with the pill classes in styles.module.css / timeline.module.css.
const STATE_TONE = {
  operational: 'up',
  maintenance: 'maintenance',
  monitor_disconnected: 'monitor',
  degraded: 'degraded',
  partial: 'partial',
  major: 'down',
  nodata: 'noData',
};

// Headline wording. Deliberately says "Gateways", not "Systems": this pill speaks only for
// QuilrAI-operated infrastructure, never for an upstream model provider.
const OVERALL_LABEL = {
  operational: 'All Gateways Operational',
  maintenance: 'Maintenance In Progress',
  monitor_disconnected: 'Monitoring Interrupted',
  degraded: 'Degraded Performance',
  partial: 'Partial Outage',
  major: 'Major Outage',
};

// The backend (systemd restart) and this frontend (merge-to-main + Pages build) deploy on
// different cadences, so a bucket state this build has never heard of is a matter of when, not
// if. Every lookup below falls back to 'nodata' rather than letting an unrecognized state throw.
export function stateMeta(state) {
  return STATE_META[state] || STATE_META.nodata;
}
export function downWeightOf(state) {
  return DOWN_WEIGHT[state] ?? 0;
}
export function severityOf(state) {
  return SEVERITY_RANK[state] ?? 0;
}
export function toneOf(state) {
  return STATE_TONE[state] || 'noData';
}

export function summarize(buckets) {
  let downWeight = 0;
  let denom = 0;
  let p95Sum = 0;
  let p95N = 0;
  let errSum = 0;
  let reqTotal = 0;
  for (const b of buckets) {
    if (b.state !== 'maintenance' && b.state !== 'monitor_disconnected') {
      denom += 1;
      downWeight += downWeightOf(b.state);
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

// Worst-current-state across every gateway component, plus the mean uptime over the window.
// Nothing upstream feeds into this: a provider outage must not turn this pill amber.
export function summarizeGateways(rows, status) {
  if (status === 'error') return { state: 'nodata', label: 'Gateway status unavailable', uptime: null };
  if (!rows.length) return { state: 'nodata', label: 'Checking gateways...', uptime: null };

  let worst = 'operational';
  for (const r of rows) {
    const s = r.stats.current ? r.stats.current.state : 'operational';
    if (severityOf(s) > severityOf(worst)) worst = s;
  }
  const uptime = rows.reduce((sum, r) => sum + r.stats.uptime, 0) / rows.length;
  return { state: worst, label: OVERALL_LABEL[worst] || stateMeta(worst).label, uptime };
}

export function useGatewayRollup() {
  const [mcpRows, setMcpRows] = useState([]);
  const [llmRows, setLlmRows] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [loadedAt, setLoadedAt] = useState(null);
  const mounted = useRef(true);
  const abortRef = useRef(null);

  const reload = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), GATEWAY_ROLLUP_TIMEOUT_MS);

    // A manual refresh keeps the last good rows on screen instead of flashing back to
    // "Checking gateways..." - only the very first load has nothing to show.
    setStatus((prev) => (prev === 'ready' ? 'ready' : 'loading'));

    return fetch(`${GATEWAY_ROLLUP_URL}?days=${GATEWAY_ROLLUP_DAYS}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted.current || abortRef.current !== controller) return;
        const byGroup = mapRollup(data);
        setMcpRows(byGroup.mcp || []);
        setLlmRows(byGroup.llm || []);
        setStatus('ready');
        setLoadedAt(Date.now());
      })
      .catch(() => {
        if (!mounted.current || abortRef.current !== controller) return;
        setStatus('error');
      })
      .finally(() => clearTimeout(timer));
  }, []);

  useEffect(() => {
    mounted.current = true;
    reload();
    return () => {
      mounted.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [reload]);

  return { mcpRows, llmRows, status, loadedAt, reload };
}
