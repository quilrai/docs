import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import { Wallet, RefreshCw, ArrowUpRight } from 'lucide-react';
import { createBudgetsClient } from './api.mjs';
import Settings from './Settings';
import BudgetEditor from './BudgetEditor';
import Grants from './Grants';
import {
  Panel,
  Field,
  Table,
  Json,
  Freshness,
  Badge,
  ErrorView,
  useLoad,
  LoadState,
  Pager,
  StateSelect,
  format,
} from './ui';
import styles from './styles.module.css';

const storageKey = 'quilr-budgets-playground-session';
const tabs = [
  ['budgets', 'Budgets'],
  ['subjects', 'Who uses what'],
  ['grants', 'Grants'],
  ['models', 'Models & costs'],
  ['exemptions', 'Exemptions'],
  ['alerts', 'Alerts & changes'],
];
function Percent({ value }) {
  return (
    <>
      {format(value)}%
      <div className={styles.progress}>
        <span
          style={{
            width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`,
          }}
        />
      </div>
    </>
  );
}
function SnapshotTable({ rows }) {
  return (
    <Table
      rows={rows}
      columns={[
        ...(rows?.some((r) => r.budget_id)
          ? [
              {
                label: 'Budget',
                render: (r) => (
                  <>
                    <strong>{r.label || r.budget_id}</strong>
                    <small>
                      {r.budget_id} · {r.metric}
                    </small>
                  </>
                ),
              },
            ]
          : []),
        {
          label: 'Subject / bucket',
          render: (r) => (
            <>
              <strong>{format(r.subject)}</strong>
              <details>
                <summary>Bucket</summary>
                <code>{r.bucket}</code>
              </details>
            </>
          ),
        },
        {
          label: 'Used / base / effective',
          render: (r) => (
            <>
              {format(r.used)} / {format(r.base_limit)} /{' '}
              {format(r.effective_limit)}
            </>
          ),
        },
        { label: 'Remaining', key: 'remaining' },
        { label: 'Utilization', render: (r) => <Percent value={r.pct} /> },
        {
          label: 'State',
          render: (r) => (
            <Badge state={r.state}>{r.state || 'Unresolved'}</Badge>
          ),
        },
        {
          label: 'Grant',
          render: (r) =>
            r.grant ? (
              <>
                <strong>{format(r.grant.limit)}</strong>
                <small>Expires {r.grant.expires_at}</small>
              </>
            ) : (
              'None'
            ),
        },
        {
          label: 'Overflow',
          render: (r) =>
            r.overflow ? (
              <>
                <strong>Hard stop {format(r.overflow.limit)}</strong>
                <small>
                  Remaining {format(r.overflow.remaining)} ·{' '}
                  {r.overflow.active ? 'active' : 'inactive'}
                </small>
              </>
            ) : (
              'None'
            ),
        },
      ]}
    />
  );
}

export default function BudgetsAdmin() {
  const [url, setUrl] = useState('http://127.0.0.1:28080');
  const [key, setKey] = useState('');
  const [remember, setRemember] = useState(false);
  const [connection, setConnection] = useState(null);
  const [tab, setTab] = useState('budgets');
  const [period, setPeriod] = useState('current');
  const [version, setVersion] = useState(0);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [connecting, setConnecting] = useState(false);
  const connectGeneration = useRef(0);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved) {
        setUrl(saved.url);
        setKey(saved.key);
        setRemember(true);
      }
    } catch {
      /* Storage can be disabled in private browsers. */
    }
  }, []);
  const api = useMemo(
    () =>
      connection
        ? createBudgetsClient({ baseUrl: connection.url, key: connection.key })
        : null,
    [connection],
  );
  async function run(fn, message = 'Change saved.') {
    setError(null);
    setNotice('');
    try {
      const result = await fn();
      setNotice(message);
      setVersion((v) => v + 1);
      return result;
    } catch (e) {
      setError(e);
      return null;
    }
  }
  async function connect(e) {
    e.preventDefault();
    const generation = ++connectGeneration.current;
    setError(null);
    setNotice('');
    setConnecting(true);
    try {
      const next = createBudgetsClient({ baseUrl: url, key });
      await next.listBudgets({ limit: 1 });
      if (generation !== connectGeneration.current) return;
      try {
        if (remember)
          sessionStorage.setItem(storageKey, JSON.stringify({ url, key }));
        else sessionStorage.removeItem(storageKey);
      } catch {
        /* Connection still works without storage. */
      }
      setConnection({ url, key, id: generation });
      setVersion((v) => v + 1);
    } catch (e) {
      if (generation === connectGeneration.current) setError(e);
    } finally {
      if (generation === connectGeneration.current) setConnecting(false);
    }
  }
  function disconnect() {
    connectGeneration.current += 1;
    setConnecting(false);
    setConnection(null);
    setKey('');
    setRemember(false);
    setError(null);
    setNotice('');
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
  }
  const props = { api, run, version, period };
  return (
    <main className={styles.studio}>
      <header className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>LLM GATEWAY / FINOPS WORKSPACE</div>
          <h1>
            <Wallet size={27} /> Budgets admin playground
          </h1>
          <p>
            Your budgets, usage, and cost controls. Connect with a management
            key to administer your gateway directly.
          </p>
        </div>
        <nav className={styles.links}>
          <Link to="/llm-gateway-playground">
            Gateway playground <ArrowUpRight size={13} />
          </Link>
          <Link to="/llm-gateway/api-reference/management-api">
            API reference <ArrowUpRight size={13} />
          </Link>
        </nav>
      </header>
      <form className={styles.connection} onSubmit={connect}>
        <Field label="Gateway URL">
          <input
            type="url"
            required
            disabled={connecting}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://gateway.example.com"
          />
        </Field>
        <Field label="Management API key">
          <input
            type="password"
            autoComplete="off"
            required
            disabled={connecting}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Bearer management key"
          />
        </Field>
        <button className={styles.primary} disabled={connecting} type="submit">
          {connecting
            ? 'Connecting…'
            : connection
              ? 'Reconnect'
              : 'Connect gateway'}
        </button>
        {connection && (
          <button type="button" onClick={disconnect}>
            Disconnect & forget
          </button>
        )}
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={remember}
            disabled={connecting}
            onChange={(e) => {
              setRemember(e.target.checked);
              if (!e.target.checked) {
                try {
                  sessionStorage.removeItem(storageKey);
                } catch {}
              }
            }}
          />
          Remember credentials in this tab
        </label>
      </form>
      <p className={styles.muted}>
        Requires budgets:read, budgets:grant and budgets:policy. Requests go
        directly to the gateway. Credentials stay in memory unless you enable
        tab session storage.
      </p>
      <ErrorView error={error} />
      {notice && (
        <div role="status" className={styles.success}>
          {notice}
          <button
            type="button"
            onClick={() => setNotice('')}
            style={{ float: 'right' }}
          >
            Dismiss
          </button>
        </div>
      )}
      {connection ? (
        <>
          <div className={styles.toolbar}>
            <Badge>Connected · {connection.url}</Badge>
            <Field label="Usage period">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="current">Current period</option>
                <option value="previous">Previous period</option>
              </select>
            </Field>
            <button type="button" onClick={() => setVersion((v) => v + 1)}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          {period === 'previous' && (
            <p className={styles.notice}>
              Previous-period usage shows base limits. Grants and configuration
              are current. Rolling and lifetime budgets support the current
              period only.
            </p>
          )}
          <nav className={styles.tabs} aria-label="Budget workspace">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => {
                  setTab(id);
                  setError(null);
                  setNotice('');
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          {tab === 'budgets' && <Budgets key={connection.id} {...props} />}
          {tab === 'subjects' && <Subjects key={connection.id} {...props} />}
          {tab === 'grants' && <Grants key={connection.id} {...props} />}
          {['models', 'exemptions', 'alerts'].includes(tab) && (
            <Settings key={`${connection.id}-${tab}`} tab={tab} {...props} />
          )}
        </>
      ) : (
        <Panel title="Connect your gateway">
          <p>
            Start with a gateway URL and a tenant-scoped management key. Then
            review budget pressure, look up any person or app, and make changes
            with a policy preview.
          </p>
          <div className={styles.grid}>
            {[
              [
                '01',
                'Understand usage',
                'See each budget and the subjects closest to its limit.',
              ],
              [
                '02',
                'Adjust intentionally',
                'Preview budget changes and their impact before publishing.',
              ],
              [
                '03',
                'Operate independently',
                'Manage grants, model prices, exemptions and alert delivery.',
              ],
            ].map(([n, title, text]) => (
              <div key={n}>
                <span className={styles.eyebrow}>{n}</span>
                <h3>{title}</h3>
                <p className={styles.muted}>{text}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </main>
  );
}

function Budgets({ api, run, version, period }) {
  const budgets = useLoad(() => api.allPages('listBudgets'), [api, version]);
  const summary = useLoad(
    () => api.getSummary({ period }),
    [api, version, period],
  );
  const [selected, setSelected] = useState('');
  const [creating, setCreating] = useState(false);
  const rows = budgets.data?.items || [];
  const sums = summary.data?.items || [];
  const total = (field) => sums.reduce((n, r) => n + Number(r[field] || 0), 0);
  return (
    <>
      <LoadState state={budgets} />
      <LoadState state={summary} />
      {budgets.data && (
        <>
          <div className={styles.toolbar}>
            <Badge
              state={budgets.data.policy_engine?.enabled ? 'ok' : 'blocked'}
            >
              Policy engine{' '}
              {budgets.data.policy_engine?.enabled ? 'enabled' : 'disabled'}
            </Badge>
            <span className={styles.muted}>
              Active revision{' '}
              {format(budgets.data.policy_engine?.active_revision)}
            </span>
            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setSelected('');
              }}
            >
              Create API-managed budget
            </button>
          </div>
          {budgets.data.note && (
            <p className={styles.notice}>{budgets.data.note}</p>
          )}
          <div className={styles.stats}>
            {[
              [rows.length, 'Budgets'],
              [total('blocked'), 'Blocked budget-subject pairs'],
              [total('over_80_pct'), 'Pairs over 80%'],
              [total('active_grants'), 'Active grants'],
            ].map(([n, label]) => (
              <div className={styles.stat} key={label}>
                <strong>{n}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <Panel title="All budgets">
        <p className={styles.muted}>
          Usage totals stay in their own metric. A subject can count against
          several budgets.
        </p>
        <Freshness data={summary.data} />
        <Table
          rows={rows}
          columns={[
            {
              label: 'Budget',
              render: (r) => (
                <button
                  className={styles.linkButton}
                  onClick={() => {
                    setSelected(r.id);
                    setCreating(false);
                  }}
                >
                  <strong>{r.label || r.id}</strong>
                  <small>
                    {r.id} · {r.managed ? 'API-managed' : r.policy}
                  </small>
                </button>
              ),
            },
            {
              label: 'Base limit',
              render: (r) => (
                <>
                  <strong>
                    {r.metric === 'spend_usd' ? '$' : ''}
                    {format(r.base_limit)}
                  </strong>
                  <small>{r.metric}</small>
                </>
              ),
            },
            {
              label: 'Window / per',
              render: (r) => (
                <>
                  {format(r.window)}
                  <small>{r.per?.join(', ') || 'Shared budget'}</small>
                </>
              ),
            },
            {
              label: 'Mode / alerts',
              render: (r) => (
                <>
                  <Badge>{r.mode}</Badge>
                  <small>
                    {r.alerts?.map((a) => `${a.at_pct}%`).join(', ') ||
                      'No alerts'}
                  </small>
                </>
              ),
            },
            {
              label: 'Adjustments',
              render: (r) =>
                r.adjustments ? (
                  <>
                    <strong>Ceiling {format(r.adjustments.ceiling)}</strong>
                    <small>
                      Max {r.adjustments.max_duration || '366d'} · overflow{' '}
                      {r.adjustments.overflow?.add_pct || 0}%
                    </small>
                    <details>
                      <summary>All rules</summary>
                      <Json value={r.adjustments} />
                    </details>
                  </>
                ) : (
                  'Fixed'
                ),
            },
            {
              label: 'Usage summary',
              render: (r) => {
                const s = sums.find((s) => s.budget_id === r.id);
                return s ? (
                  <>
                    <strong>{format(s.total_used)} used</strong>
                    <small>
                      {s.subjects_tracked} subjects · {s.blocked} blocked ·{' '}
                      {s.in_overflow} overflow · {s.at_limit} at limit
                    </small>
                  </>
                ) : (
                  'Unavailable for this period'
                );
              },
            },
          ]}
        />
      </Panel>
      {creating && (
        <BudgetEditor
          key="create"
          api={api}
          run={run}
          version={version}
          onClose={() => setCreating(false)}
        />
      )}
      {selected && (
        <>
          <BudgetEditor
            key={selected}
            id={selected}
            api={api}
            run={run}
            version={version}
            onClose={() => setSelected('')}
          />
          <BudgetUsage
            key={`${selected}-${period}`}
            id={selected}
            api={api}
            version={version}
            period={period}
          />
        </>
      )}
    </>
  );
}

function BudgetUsage({ id, api, version, period }) {
  const [filter, setFilter] = useState({
    min_pct: '',
    state: '',
    sort: 'pct',
    'subject.user': '',
    include_idle: false,
  });
  const [cursor, setCursor] = useState('');
  const query = { ...filter, period, cursor, limit: 50 };
  const state = useLoad(
    () => api.getUsage(id, query),
    [api, id, version, JSON.stringify(query)],
  );
  function change(name, value) {
    setFilter((v) => ({ ...v, [name]: value }));
    setCursor('');
  }
  return (
    <Panel title={`Subject usage · ${id}`}>
      <div className={styles.toolbar}>
        <Field label="User email filter">
          <input
            value={filter['subject.user']}
            onChange={(e) => change('subject.user', e.target.value)}
          />
        </Field>
        <Field label="Minimum %">
          <input
            type="number"
            min="0"
            value={filter.min_pct}
            onChange={(e) => change('min_pct', e.target.value)}
          />
        </Field>
        <StateSelect
          value={filter.state}
          onChange={(v) => change('state', v)}
        />
        <Field label="Sort">
          <select
            value={filter.sort}
            onChange={(e) => change('sort', e.target.value)}
          >
            <option value="pct">Highest %</option>
            <option value="used">Most used</option>
            <option value="remaining">Least remaining</option>
          </select>
        </Field>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={filter.include_idle}
            onChange={(e) => change('include_idle', e.target.checked)}
          />
          Include idle users
        </label>
      </div>
      <LoadState state={state} />
      <Freshness data={state.data} />
      {state.data && (
        <>
          <SnapshotTable rows={state.data.items} />
          <Pager
            data={state.data}
            onNext={setCursor}
            onReset={() => setCursor('')}
          />
        </>
      )}
    </Panel>
  );
}

function Subjects({ api, version, period }) {
  const [filters, setFilters] = useState({
    q: '',
    kind: '',
    budget_id: '',
    min_pct: '',
    state: '',
    sort: 'tightest_pct',
    include_idle: false,
  });
  const [cursor, setCursor] = useState('');
  useEffect(() => setCursor(''), [period]);
  const [lookup, setLookup] = useState({ kind: 'user', value: '', app: '' });
  const [chosen, setChosen] = useState(null);
  const query = { ...filters, period, cursor, limit: 50 };
  const subjects = useLoad(
    () => api.listSubjects(query),
    [api, version, JSON.stringify(query)],
  );
  const detail = useLoad(
    () =>
      chosen
        ? api.getSubject(chosen.kind, chosen.value, { period, app: chosen.app })
        : Promise.resolve(null),
    [api, version, period, JSON.stringify(chosen)],
  );
  function change(name, value) {
    setFilters((f) => ({ ...f, [name]: value }));
    setCursor('');
  }
  return (
    <>
      <Panel title="Subjects across all budgets">
        <div className={styles.toolbar}>
          <Field label="Search">
            <input
              placeholder="Person, app or key"
              value={filters.q}
              onChange={(e) => change('q', e.target.value)}
            />
          </Field>
          <Field label="Kind">
            <select
              value={filters.kind}
              onChange={(e) => change('kind', e.target.value)}
            >
              {['', 'user', 'app', 'key', 'smart_group', 'other'].map((k) => (
                <option value={k} key={k}>
                  {k || 'All subjects'}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Budget ID">
            <input
              value={filters.budget_id}
              onChange={(e) => change('budget_id', e.target.value)}
            />
          </Field>
          <Field label="Minimum %">
            <input
              type="number"
              min="0"
              value={filters.min_pct}
              onChange={(e) => change('min_pct', e.target.value)}
            />
          </Field>
          <StateSelect
            value={filters.state}
            onChange={(v) => change('state', v)}
          />
          <Field label="Sort">
            <select
              value={filters.sort}
              onChange={(e) => change('sort', e.target.value)}
            >
              <option value="tightest_pct">Tightest budget %</option>
              <option value="used">Tightest budget used</option>
            </select>
          </Field>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={filters.include_idle}
              onChange={(e) => change('include_idle', e.target.checked)}
            />
            Include idle users
          </label>
        </div>
        <LoadState state={subjects} />
        <Freshness data={subjects.data} />
        {subjects.data && (
          <>
            <Table
              rows={subjects.data.items}
              columns={[
                {
                  label: 'Subject',
                  render: (r) => (
                    <>
                      <button
                        className={styles.linkButton}
                        disabled={r.subject.kind === 'other'}
                        onClick={() => {
                          setChosen(r.subject);
                          setLookup({ ...r.subject, app: '' });
                        }}
                      >
                        <strong>{r.subject.value}</strong>
                      </button>
                      <small>
                        {r.subject.kind}{' '}
                        {r.subject.key && format(r.subject.key)}
                      </small>
                    </>
                  ),
                },
                {
                  label: 'Tightest budget',
                  render: (r) => (
                    <>
                      <strong>{r.tightest?.budget_id}</strong>
                      <small>
                        {format(
                          r.budgets?.find(
                            (b) => b.budget_id === r.tightest?.budget_id,
                          )?.used,
                        )}{' '}
                        used /{' '}
                        {format(
                          r.budgets?.find(
                            (b) => b.budget_id === r.tightest?.budget_id,
                          )?.effective_limit,
                        )}{' '}
                        limit
                      </small>
                    </>
                  ),
                },
                {
                  label: 'Utilization',
                  render: (r) => <Percent value={r.tightest?.pct} />,
                },
                {
                  label: 'State',
                  render: (r) => (
                    <Badge state={r.tightest?.state}>{r.tightest?.state}</Badge>
                  ),
                },
                {
                  label: 'Applies to',
                  render: (r) => (
                    <>
                      {r.budgets?.length} budgets · {r.active_grants} grants
                      <details>
                        <summary>All budget usage</summary>
                        <Json value={r.budgets} />
                      </details>
                    </>
                  ),
                },
              ]}
            />
            <Pager
              data={subjects.data}
              onNext={setCursor}
              onReset={() => setCursor('')}
            />
          </>
        )}
      </Panel>
      <Panel title="Person or app detail">
        <form
          className={styles.toolbar}
          onSubmit={(e) => {
            e.preventDefault();
            setChosen({ ...lookup });
          }}
        >
          <Field label="Subject kind">
            <select
              value={lookup.kind}
              onChange={(e) =>
                setLookup((v) => ({ ...v, kind: e.target.value }))
              }
            >
              {['user', 'app', 'key', 'smart_group'].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Email, app name, key hash or group">
            <input
              required
              value={lookup.value}
              onChange={(e) =>
                setLookup((v) => ({ ...v, value: e.target.value }))
              }
            />
          </Field>
          <Field label="App context (optional for user)">
            <input
              value={lookup.app}
              disabled={lookup.kind !== 'user'}
              onChange={(e) =>
                setLookup((v) => ({ ...v, app: e.target.value }))
              }
            />
          </Field>
          <button type="submit">Look up subject</button>
        </form>
        {chosen && (
          <>
            <LoadState state={detail} />
            <Freshness data={detail.data} />
            {detail.data && (
              <>
                <h3>{chosen.value}</h3>
                <p className={styles.muted}>
                  Applicability is derived from definitions. Conditional rules
                  depend on request context. Unresolved dimensions require more
                  subject context.
                </p>
                <SnapshotTable rows={detail.data.items} />
                <Table
                  rows={detail.data.items}
                  columns={[
                    { label: 'Budget', key: 'budget_id' },
                    {
                      label: 'Applicability',
                      render: (r) => (
                        <>
                          {r.conditional ? 'Conditional' : 'Direct'}
                          <small>{format(r.applies_to)}</small>
                          {r.unresolved?.length > 0 && (
                            <Badge state="alerting">
                              Unresolved: {r.unresolved.join(', ')}
                            </Badge>
                          )}
                        </>
                      ),
                    },
                    {
                      label: 'Exemptions',
                      render: (r) =>
                        r.exemptions?.length ? (
                          <Json value={r.exemptions} />
                        ) : (
                          'None'
                        ),
                    },
                    {
                      label: 'Overridden by',
                      render: (r) =>
                        r.overridden_by?.length
                          ? format(r.overridden_by)
                          : 'None',
                    },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Panel>
    </>
  );
}
