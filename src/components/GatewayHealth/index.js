import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Boxes, Gauge, Loader2, RefreshCw, Server, Wifi } from 'lucide-react';
import GatewayTimeline from './GatewayTimeline';
import styles from './styles.module.css';

/* ────────────────────────────────── Config ─────────────────────────── */

// Our infrastructure. Global (guardrails.quilr.ai) is intentionally omitted -
// it auto-routes, so a direct probe to it is not meaningful. We probe each
// regional LLM Gateway host plus the MCP Gateway directly.
const OUR_SERVERS = [
  {
    id: 'usa-1',
    group: 'LLM Gateway',
    label: 'US Central West',
    host: 'guardrails-usa-1.quilr.ai',
    url: 'https://guardrails-usa-1.quilr.ai',
  },
  {
    id: 'usa-2',
    group: 'LLM Gateway',
    label: 'US East',
    host: 'guardrails-usa-2.quilr.ai',
    url: 'https://guardrails-usa-2.quilr.ai',
  },
  {
    id: 'india-1',
    group: 'LLM Gateway',
    label: 'India · Mumbai',
    host: 'guardrails-india-1.quilr.ai',
    url: 'https://guardrails-india-1.quilr.ai',
  },
  {
    id: 'mcp',
    group: 'MCP Gateway',
    label: 'quilr.ai',
    host: 'mcpgateway.quilr.ai',
    url: 'https://mcpgateway.quilr.ai',
  },
  {
    id: 'mcp-com',
    group: 'MCP Gateway',
    label: 'quilrai.com',
    host: 'mcpgateway.quilrai.com',
    url: 'https://mcpgateway.quilrai.com',
  },
];

const REFRESH_MS = 6000;
const PING_TIMEOUT_MS = 8000;
const HISTORY_LEN = 24;
const PROVIDER_HEALTH_URL = 'https://guardrails-india-1.quilr.ai/llmgateway/provider_health/global';
const PROVIDER_FETCH_TIMEOUT_MS = 60000;
const WINDOW_LABEL = 'All time';
const MAX_HISTORY_SEGMENTS = 160;

const STATUS_META = {
  operational: { label: 'Operational', tone: 'up', rank: 2 },
  degraded: { label: 'Degraded', tone: 'degraded', rank: 3 },
  major_outage: { label: 'Major outage', tone: 'down', rank: 4 },
  insufficient_data: { label: 'Insufficient data', tone: 'insufficient', rank: 1 },
  no_data: { label: 'No data', tone: 'noData', rank: 0 },
};

// Horizontal view switcher. Order matches the tab bar left-to-right.
const TABS = [
  { id: 'provider', label: 'Provider Health', Icon: Boxes },
  { id: 'gateway', label: 'Gateway Health', Icon: Gauge },
  { id: 'infra', label: 'QuilrAI Infrastructure', Icon: Server },
];

/* ────────────────────────────────── Helpers ────────────────────────── */

// Browser can't send an ICMP ping. We measure the HTTPS round-trip with a
// no-cors GET (opaque response): the promise resolves once the server answers,
// which tells us it is reachable and how long it took from this location.
async function pingOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  const start = performance.now();
  try {
    await fetch(`${url}/?_hc=${Date.now()}`, {
      mode: 'no-cors',
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { ok: true, rtt: Math.round(performance.now() - start) };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, rtt: null };
  }
}

function formatRelative(ts) {
  if (!ts) return 'never';
  const secs = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  return `${mins}m ago`;
}

function parseTime(value) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatHour(timeMs) {
  if (timeMs == null || !Number.isFinite(timeMs)) return 'Unknown hour';
  const d = new Date(timeMs);
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  const hour = String(d.getUTCHours()).padStart(2, '0');
  return `${month} ${day}, ${hour}:00 UTC`;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatTps(value) {
  const n = toNumber(value);
  if (n == null) return '-';
  if (n > 0 && n < 0.01) return '<0.01';
  if (n >= 100) return Math.round(n).toLocaleString('en-US');
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

function positiveNumber(value) {
  const n = toNumber(value);
  return n != null && n > 0 ? n : null;
}

function latestBucket(buckets) {
  let latest = null;
  let latestEnd = null;
  for (const bucket of buckets || []) {
    if (!bucket || bucket.empty_bucket) continue;
    const end = parseTime(bucket.end);
    if (end == null) continue;
    if (latestEnd == null || end > latestEnd) {
      latest = bucket;
      latestEnd = end;
    }
  }
  return latest ? { bucket: latest, end: latestEnd } : null;
}

function statusMeta(status) {
  return STATUS_META[status] || { label: status || 'Unknown', tone: 'noData', rank: 0 };
}

function currentStatus(rows) {
  return rows.reduce((worst, row) => {
    if (!worst) return row.status;
    return statusMeta(row.status).rank > statusMeta(worst).rank ? row.status : worst;
  }, null);
}

function formatAge(timeMs) {
  if (!timeMs) return 'never';
  const secs = Math.max(0, Math.round((Date.now() - timeMs) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function orderedBuckets(buckets) {
  return (Array.isArray(buckets) ? buckets : [])
    .filter((bucket) => bucket && !bucket.empty_bucket && parseTime(bucket.start) != null)
    .sort((a, b) => parseTime(a.start) - parseTime(b.start));
}

function bucketTps(bucket) {
  const generationTps = positiveNumber(bucket?.generation?.tokens_per_second?.p50);
  if (generationTps != null) {
    return { value: generationTps, source: 'Generation p50 TPS' };
  }

  const outputTokensPerMinute = positiveNumber(bucket?.throughput?.output_tokens_per_minute);
  if (outputTokensPerMinute != null) {
    return { value: outputTokensPerMinute / 60, source: 'Output throughput TPS' };
  }

  return { value: null, source: 'TPS unavailable' };
}

function historyColorVar(status) {
  const tone = statusMeta(status).tone;
  if (tone === 'up') return 'var(--provider-history-up)';
  if (tone === 'degraded') return 'var(--provider-history-degraded)';
  if (tone === 'down') return 'var(--provider-history-down)';
  return 'var(--provider-history-muted)';
}

function sampledHistorySegments(buckets) {
  if (!buckets.length) return [];

  const segmentCount = Math.min(buckets.length, MAX_HISTORY_SEGMENTS);
  const segments = [];

  for (let i = 0; i < segmentCount; i += 1) {
    const start = Math.floor((i * buckets.length) / segmentCount);
    const end = Math.max(start + 1, Math.floor(((i + 1) * buckets.length) / segmentCount));
    let status = buckets[start]?.status || 'no_data';
    let statusBucket = buckets[start] || null;

    for (let j = start + 1; j < end; j += 1) {
      const bucketStatus = buckets[j]?.status || 'no_data';
      if (statusMeta(bucketStatus).rank > statusMeta(status).rank) {
        status = bucketStatus;
        statusBucket = buckets[j];
      }
    }

    const firstBucket = buckets[start];
    const lastBucket = buckets[end - 1];
    segments.push({
      status,
      bucketCount: end - start,
      startTime: parseTime(firstBucket?.start),
      endTime: parseTime(lastBucket?.end || lastBucket?.start),
      tps: bucketTps(statusBucket),
    });
  }

  return segments;
}

function historyGradient(segments) {
  if (!segments.length) return undefined;

  const runs = [];
  for (const segment of segments) {
    const last = runs[runs.length - 1];
    if (last?.status === segment.status) {
      last.count += 1;
    } else {
      runs.push({ status: segment.status, count: 1 });
    }
  }

  const total = runs.reduce((sum, run) => sum + run.count, 0);
  let cursor = 0;
  const stops = runs.map((run) => {
    const startPct = (cursor / total) * 100;
    cursor += run.count;
    const endPct = (cursor / total) * 100;
    return `${historyColorVar(run.status)} ${startPct.toFixed(3)}% ${endPct.toFixed(3)}%`;
  });

  return `linear-gradient(to right, ${stops.join(', ')})`;
}

function summarizeModel(model) {
  const buckets = orderedBuckets(model?.buckets);
  const latest = latestBucket(buckets);
  if (!latest) return null;

  const latestBucketValue = latest.bucket;
  const status = latestBucketValue.status || 'no_data';

  return {
    model: model.model,
    status,
    latestEnd: latest.end,
    latestBucket: latestBucketValue,
    buckets,
    latestTps: bucketTps(latestBucketValue),
  };
}

function summarizeProviderHealth(data) {
  const providers = Array.isArray(data?.providers) ? data.providers : [];

  return providers
    .map((provider) => {
      const models = (provider.models || [])
        .map((model) => summarizeModel(model))
        .filter(Boolean)
        .sort((a, b) => {
          const statusDelta = statusMeta(b.status).rank - statusMeta(a.status).rank;
          if (statusDelta !== 0) return statusDelta;
          return a.model.localeCompare(b.model);
        });

      if (!models.length) return null;

      const latestEnd = Math.max(...models.map((model) => model.latestEnd));
      const status = currentStatus(models);

      return {
        id: provider.provider,
        status,
        latestEnd,
        models,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const statusDelta = statusMeta(b.status).rank - statusMeta(a.status).rank;
      if (statusDelta !== 0) return statusDelta;
      return a.id.localeCompare(b.id);
    });
}

async function fetchProviderHealth(signal) {
  const response = await fetch(PROVIDER_HEALTH_URL, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(`Provider health request failed with HTTP ${response.status}`);
  }
  return response.json();
}

function Sparkline({ samples }) {
  const points = useMemo(() => {
    const vals = samples.filter((s) => s.ok && s.rtt != null).map((s) => s.rtt);
    if (vals.length < 2) return null;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const w = 120;
    const h = 30;
    const step = w / (vals.length - 1);
    return vals
      .map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / span) * h;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [samples]);

  if (!points) return <div className={styles.sparkEmpty} />;
  return (
    <svg className={styles.spark} viewBox="0 0 120 30" preserveAspectRatio="none">
      <polyline points={points} fill="none" strokeWidth="1.5" />
    </svg>
  );
}

function StatusPill({ status }) {
  const meta = statusMeta(status);
  return (
    <span className={`${styles.statusPill} ${styles[`tone_${meta.tone}`]}`}>
      <span className={styles.dot} />
      {meta.label}
    </span>
  );
}

const HistoryStrip = React.memo(function HistoryStrip({ buckets }) {
  const firstBucket = buckets[0];
  const lastBucket = buckets[buckets.length - 1];
  const segments = useMemo(() => sampledHistorySegments(buckets), [buckets]);
  const background = useMemo(() => historyGradient(segments), [segments]);
  const [hover, setHover] = useState(null);

  const handleHistoryHover = useCallback(
    (event) => {
      if (!segments.length) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const rawX = event.clientX - rect.left;
      const ratio = rect.width ? Math.max(0, Math.min(0.999999, rawX / rect.width)) : 0;
      const index = Math.min(segments.length - 1, Math.floor(ratio * segments.length));
      const tooltipWidth = 220;
      const x =
        rect.width > tooltipWidth
          ? Math.max(tooltipWidth / 2, Math.min(rawX, rect.width - tooltipWidth / 2))
          : rect.width / 2;

      setHover((prev) => {
        if (prev?.index === index && Math.abs(prev.x - x) < 2) return prev;
        return { index, x };
      });
    },
    [segments],
  );

  const segment = hover ? segments[hover.index] : null;

  return (
    <div className={styles.modelHistoryWrap}>
      <div
        className={styles.modelHistory}
        style={background ? { background } : undefined}
        aria-label="All-time materialized hourly provider status"
        onMouseMove={handleHistoryHover}
        onMouseLeave={() => setHover(null)}
      />
      {segment ? (
        <div className={styles.historyTooltip} style={{ left: hover.x }}>
          <span className={styles.historyTooltipStatus}>{statusMeta(segment.status).label}</span>
          <span>
            {formatHour(segment.startTime)} - {formatHour(segment.endTime)}
          </span>
          <span title={segment.tps.source}>TPS {formatTps(segment.tps.value)}</span>
          <span>{segment.bucketCount.toLocaleString('en-US')} buckets</span>
        </div>
      ) : null}
      <div className={styles.hourAxis} aria-hidden="true">
        <span>{formatHour(parseTime(firstBucket?.start))}</span>
        <span>{formatHour(parseTime(lastBucket?.start))}</span>
      </div>
    </div>
  );
});

function TpsValue({ metric }) {
  const safeMetric = metric || { value: null, source: 'TPS unavailable' };
  return (
    <span className={styles.tpsValue} title={safeMetric.source}>
      {formatTps(safeMetric.value)}
      {safeMetric.value != null ? <span> tps</span> : null}
    </span>
  );
}

/* ────────────────────────────────── Component ──────────────────────── */

export default function GatewayHealth() {
  const [history, setHistory] = useState(() =>
    Object.fromEntries(OUR_SERVERS.map((s) => [s.id, []])),
  );
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);
  const [providerHealth, setProviderHealth] = useState(null);
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerError, setProviderError] = useState(null);
  const [providerLoadedAt, setProviderLoadedAt] = useState(null);
  const [tab, setTab] = useState('provider');
  const [tick, setTick] = useState(0); // re-render for relative timestamps
  const mounted = useRef(true);
  const providerAbort = useRef(null);
  const providerRequestId = useRef(0);

  const runChecks = useCallback(async () => {
    setChecking(true);
    const results = await Promise.all(
      OUR_SERVERS.map(async (s) => ({ id: s.id, ...(await pingOnce(s.url)) })),
    );
    if (!mounted.current) return;
    const now = Date.now();
    setHistory((prev) => {
      const next = { ...prev };
      for (const r of results) {
        const arr = [...(next[r.id] || []), { ok: r.ok, rtt: r.rtt, t: now }];
        next[r.id] = arr.slice(-HISTORY_LEN);
      }
      return next;
    });
    setLastChecked(now);
    setChecking(false);
  }, []);

  const loadProviderHealth = useCallback(async () => {
    providerRequestId.current += 1;
    const requestId = providerRequestId.current;
    if (providerAbort.current) providerAbort.current.abort();

    const controller = new AbortController();
    providerAbort.current = controller;
    const timer = setTimeout(() => controller.abort(), PROVIDER_FETCH_TIMEOUT_MS);

    setProviderLoading(true);
    setProviderError(null);
    try {
      const data = await fetchProviderHealth(controller.signal);
      if (!mounted.current || providerRequestId.current !== requestId) return;
      setProviderHealth(data);
      setProviderLoadedAt(Date.now());
    } catch (err) {
      if (!mounted.current || providerRequestId.current !== requestId) return;
      if (err?.name !== 'AbortError') {
        setProviderError(err?.message || 'Provider health request failed');
      } else {
        setProviderError('Provider health request timed out');
      }
    } finally {
      clearTimeout(timer);
      if (mounted.current && providerRequestId.current === requestId) {
        setProviderLoading(false);
        providerAbort.current = null;
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadProviderHealth();
    runChecks();
    const clock = setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      mounted.current = false;
      if (providerAbort.current) providerAbort.current.abort();
      clearInterval(clock);
    };
  }, [loadProviderHealth, runChecks]);

  useEffect(() => {
    if (tab !== 'infra') return undefined;

    runChecks();
    const poll = setInterval(runChecks, REFRESH_MS);
    return () => clearInterval(poll);
  }, [runChecks, tab]);

  const serverState = useMemo(() => {
    return OUR_SERVERS.map((s) => {
      const samples = history[s.id] || [];
      const latest = samples[samples.length - 1] || null;
      const okSamples = samples.filter((x) => x.ok && x.rtt != null);
      const avg = okSamples.length
        ? Math.round(okSamples.reduce((a, b) => a + b.rtt, 0) / okSamples.length)
        : null;
      const min = okSamples.length ? Math.min(...okSamples.map((x) => x.rtt)) : null;
      const status = !latest ? 'checking' : latest.ok ? 'up' : 'down';
      return { ...s, samples, latest, avg, min, status };
    });
  }, [history]);

  const providerState = useMemo(() => summarizeProviderHealth(providerHealth), [providerHealth]);

  const overall = useMemo(() => {
    const known = serverState.filter((s) => s.status !== 'checking');
    const providerStatuses = providerState.map((provider) => provider.status);
    const knownCount = known.length + providerStatuses.length;
    if (!knownCount) {
      return { tone: 'checking', label: 'Checking systems…' };
    }
    const down =
      known.filter((s) => s.status === 'down').length +
      providerStatuses.filter((status) => status === 'major_outage').length;
    const degraded = providerStatuses.filter((status) => status === 'degraded').length;
    if (down === 0 && degraded === 0) return { tone: 'up', label: 'All Systems Operational' };
    if (down === knownCount) return { tone: 'down', label: 'Major Outage' };
    return { tone: 'degraded', label: 'Partial Degradation' };
  }, [providerState, serverState]);

  const refreshAll = useCallback(() => {
    runChecks();
    loadProviderHealth();
  }, [loadProviderHealth, runChecks]);

  const updatedAt = Math.max(lastChecked || 0, providerLoadedAt || 0) || null;

  // tick is only used to refresh relative timestamps
  void tick;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headLeft}>
            <span className={styles.kicker}>QuilrAI Status</span>
            <h1 className={styles.title}>System Health</h1>
            <p className={styles.subtitle}>
              Live reachability and latency from your browser to QuilrAI, plus
              upstream provider availability.
            </p>
          </div>
          <div className={styles.headRight}>
            <span className={`${styles.overallPill} ${styles[`tone_${overall.tone}`]}`}>
              <span className={styles.dot} />
              {overall.label}
            </span>
            <div className={styles.metaRow}>
              <span className={styles.metaText}>Updated {formatRelative(updatedAt)}</span>
              <button
                type="button"
                className={styles.refreshBtn}
                onClick={refreshAll}
                disabled={checking || providerLoading}
              >
                <RefreshCw
                  size={13}
                  className={checking || providerLoading ? styles.spin : undefined}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* View switcher */}
        <nav className={styles.tabs} role="tablist" aria-label="Health views">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div key={tab} className={styles.tabPanel} role="tabpanel">
          {/* Provider Health */}
          {tab === 'provider' && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <Activity size={15} />
                <h2 className={styles.sectionTitle}>Provider Health</h2>
                <span className={styles.sectionNote}>
                  {providerLoading ? (
                    <>
                      <Loader2 size={12} className={styles.spin} /> Fetching
                    </>
                  ) : providerLoadedAt ? (
                    <>Loaded {formatAge(providerLoadedAt)}</>
                  ) : (
                    WINDOW_LABEL
                  )}
                </span>
              </div>

              {providerLoading && !providerHealth ? (
                <div className={styles.loadingBlock}>
                  <Loader2 size={18} className={styles.spin} />
                  <span>Loading provider health...</span>
                </div>
              ) : null}

              {providerError ? (
                <div className={styles.errorBanner}>
                  <span>{providerError}</span>
                  <button type="button" className={styles.inlineBtn} onClick={loadProviderHealth}>
                    Retry
                  </button>
                </div>
              ) : null}

              {providerHealth && providerState.length === 0 && !providerLoading ? (
                <div className={styles.emptyState}>No provider health buckets are available.</div>
              ) : null}

              {providerState.length ? (
                <div className={styles.providerList}>
                  {providerState.map((provider) => (
                    <section key={provider.id} className={styles.providerCard}>
                      <div className={styles.providerTop}>
                        <div className={styles.providerTitleGroup}>
                          <span className={styles.cardGroup}>Provider</span>
                          <h3 className={styles.providerTitle}>{provider.id}</h3>
                        </div>
                        <div className={styles.providerStatusGroup}>
                          <StatusPill status={provider.status} />
                          <span>latest {formatAge(provider.latestEnd)}</span>
                        </div>
                      </div>

                      <div className={styles.modelTable}>
                        <div className={`${styles.modelRow} ${styles.modelHeader}`}>
                          <span>Model / status history</span>
                          <span>Current</span>
                          <span>TPS</span>
                          <span>Last seen</span>
                        </div>

                        {provider.models.map((model) => (
                          <div key={model.model} className={styles.modelRow}>
                            <div className={styles.modelCell}>
                              <span className={styles.modelName}>{model.model}</span>
                              <HistoryStrip buckets={model.buckets} />
                            </div>
                            <StatusPill status={model.status} />
                            <TpsValue metric={model.latestTps} />
                            <span>{formatAge(model.latestEnd)}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}
            </section>
          )}

        {/* Gateway Health - historical hourly buckets per region + global router */}
        {tab === 'gateway' && <GatewayTimeline />}

        {/* QuilrAI Infrastructure - live browser probes */}
        {tab === 'infra' && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Server size={15} />
            <h2 className={styles.sectionTitle}>QuilrAI Infrastructure</h2>
            <span className={styles.sectionNote}>
              <Wifi size={12} /> Measured from your location · refreshes every {REFRESH_MS / 1000}s
            </span>
          </div>

          <div className={styles.grid}>
            {serverState.map((s) => (
              <div key={s.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardId}>
                    <span className={styles.cardGroup}>{s.group}</span>
                    <span className={styles.cardLabel}>{s.label}</span>
                  </div>
                  <span className={`${styles.statusPill} ${styles[`tone_${s.status}`]}`}>
                    <span className={styles.dot} />
                    {s.status === 'up' ? 'Operational' : s.status === 'down' ? 'Unreachable' : 'Checking'}
                  </span>
                </div>

                <div className={styles.cardHost}>{s.host}</div>

                <div className={styles.cardMetric}>
                  <span className={styles.latValue}>
                    {s.latest && s.latest.ok ? s.latest.rtt : '—'}
                    <span className={styles.latUnit}>ms</span>
                  </span>
                  <Sparkline samples={s.samples} />
                </div>

                <div className={styles.cardFooter}>
                  <span>min {s.min != null ? `${s.min}ms` : '—'}</span>
                  <span>avg {s.avg != null ? `${s.avg}ms` : '—'}</span>
                  <span>{s.samples.length} samples</span>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.finePrint}>
            Latency is the HTTPS round-trip from your browser to each host (not an
            ICMP ping). Global auto-routing (<code>guardrails.quilr.ai</code>) is
            omitted; probe regional hosts directly.
          </p>
        </section>
        )}
        </div>
      </div>
    </div>
  );
}
