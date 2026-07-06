import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Boxes, Gauge, RefreshCw, Server, Wifi } from 'lucide-react';
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

// Upstream providers the gateway routes to. Metrics below are SAMPLE data.
// TODO: replace buildMockProviders() with the real provider-health API.
const PROVIDER_DEFS = [
  { id: 'openai', label: 'OpenAI', latMin: 380, latSpread: 180 },
  { id: 'anthropic', label: 'Anthropic', latMin: 460, latSpread: 200 },
  { id: 'azure', label: 'Azure OpenAI', latMin: 340, latSpread: 160 },
  { id: 'bedrock', label: 'AWS Bedrock', latMin: 430, latSpread: 190 },
  { id: 'vertex', label: 'Google Vertex AI', latMin: 470, latSpread: 210 },
  { id: 'copilot', label: 'GitHub Copilot', latMin: 300, latSpread: 150 },
];

const WINDOW_LABEL = 'Last 3 days';
const WINDOW_HOURS = 72; // 3 days of hourly ticks

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

function buildMockProviders() {
  return PROVIDER_DEFS.map((p) => {
    const avg = Math.round(p.latMin + Math.random() * p.latSpread);
    const p95 = Math.round(avg * (1.45 + Math.random() * 0.4));
    const requests = Math.round(90000 + Math.random() * 240000);
    // All 100% uptime over the window -> every hourly tick is "up".
    const ticks = Array.from({ length: WINDOW_HOURS }, () => true);
    return { id: p.id, label: p.label, uptime: 100, avg, p95, requests, ticks };
  });
}

function formatRelative(ts) {
  if (!ts) return 'never';
  const secs = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  return `${mins}m ago`;
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

/* ────────────────────────────────── Component ──────────────────────── */

export default function GatewayHealth() {
  const [history, setHistory] = useState(() =>
    Object.fromEntries(OUR_SERVERS.map((s) => [s.id, []])),
  );
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);
  const [providers, setProviders] = useState([]);
  const [tab, setTab] = useState('provider');
  const [tick, setTick] = useState(0); // re-render for relative timestamps
  const mounted = useRef(true);

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

  useEffect(() => {
    mounted.current = true;
    setProviders(buildMockProviders());
    runChecks();
    const poll = setInterval(runChecks, REFRESH_MS);
    const clock = setInterval(() => setTick((t) => t + 1), 5000);
    return () => {
      mounted.current = false;
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [runChecks]);

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

  const overall = useMemo(() => {
    const known = serverState.filter((s) => s.status !== 'checking');
    if (!known.length) return { tone: 'checking', label: 'Checking systems…' };
    const down = known.filter((s) => s.status === 'down').length;
    if (down === 0) return { tone: 'up', label: 'All Systems Operational' };
    if (down === known.length) return { tone: 'down', label: 'Major Outage' };
    return { tone: 'degraded', label: 'Partial Degradation' };
  }, [serverState]);

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
              <span className={styles.metaText}>Updated {formatRelative(lastChecked)}</span>
              <button
                type="button"
                className={styles.refreshBtn}
                onClick={runChecks}
                disabled={checking}
              >
                <RefreshCw size={13} className={checking ? styles.spin : undefined} />
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
            <span className={styles.sectionNote}>{WINDOW_LABEL}</span>
          </div>

          <div className={styles.providerBanner}>
            Sample data. Live upstream metrics will be wired via the provider-health API.
          </div>

          <div className={styles.grid}>
            {providers.map((p) => (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.cardLabel}>{p.label}</span>
                  <span className={`${styles.statusPill} ${styles.tone_up}`}>
                    <span className={styles.dot} />
                    Operational
                  </span>
                </div>

                <div className={styles.uptimeRow}>
                  <span className={styles.uptimePct}>{p.uptime.toFixed(2)}%</span>
                  <span className={styles.uptimeLabel}>uptime · {WINDOW_LABEL.toLowerCase()}</span>
                </div>

                <div className={styles.ticks} aria-hidden="true">
                  {p.ticks.map((up, i) => (
                    <span
                      key={i}
                      className={`${styles.tickBar} ${up ? styles.tickUp : styles.tickDown}`}
                    />
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span>avg {p.avg}ms</span>
                  <span>p95 {p.p95}ms</span>
                  <span>{(p.requests / 1000).toFixed(1)}k reqs</span>
                </div>
              </div>
            ))}
          </div>
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
