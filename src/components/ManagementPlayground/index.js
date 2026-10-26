import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {
  Activity,
  ArrowUpRight,
  Boxes,
  Braces,
  Building2,
  Gauge,
  History as HistoryIcon,
  KeyRound,
  Layers,
  Lock,
  Library,
  PanelRightClose,
  PanelRightOpen,
  Plug,
  Server,
  ShieldCheck,
  Unplug,
  Wallet,
  FileText,
} from 'lucide-react';
import bundledSpec from '@site/static/openapi/llm-gateway-management-v1.json';
import { LIVE_SPEC_PATH, MANAGEMENT_PREFIX, createClient, normalizeBaseUrl, setSpecSecretFields } from './client.mjs';
import { buildIndex } from './spec.mjs';
import { PlaygroundContext, Btn, Checkbox, EmptyState, Field, ErrorBox, Pill } from './ui';
import ActivityPanel from './ActivityPanel';
import Explorer from './Explorer';
import Overview from './Overview';
import Apps from './Apps';
import Providers from './Providers';
import QuotaPools from './QuotaPools';
import Credentials from './Credentials';
import Prompts from './Prompts';
import Budgets from './Budgets';
import Catalogs from './Catalogs';
import HistoryWorkspace from './HistoryWorkspace';
import Administration from './Administration';
import styles from './styles.module.css';

export const REGIONS = [
  { id: 'india-1', label: 'India', url: 'https://guardrails-india-1.quilr.ai' },
  { id: 'europe-1', label: 'Europe', url: 'https://guardrails-europe-1.quilr.ai' },
  { id: 'usa-1', label: 'USA', url: 'https://guardrails-usa-1.quilr.ai' },
  { id: 'jp-1', label: 'Japan', url: 'https://guardrails-jp-1.quilr.ai' },
];

export const WORKSPACES = [
  { id: 'overview', label: 'Overview', Icon: Gauge, Component: Overview },
  { id: 'apps', label: 'Apps', Icon: Layers, Component: Apps },
  { id: 'providers', label: 'Providers', Icon: Server, Component: Providers },
  { id: 'quota-pools', label: 'Quota pools', Icon: Boxes, Component: QuotaPools },
  { id: 'credentials', label: 'Credentials', Icon: KeyRound, Component: Credentials },
  { id: 'prompts', label: 'Prompts', Icon: FileText, Component: Prompts },
  { id: 'budgets', label: 'Budgets', Icon: Wallet, Component: Budgets },
  { id: 'catalogs', label: 'Catalogs', Icon: Library, Component: Catalogs },
  { id: 'history', label: 'History', Icon: HistoryIcon, Component: HistoryWorkspace },
  { id: 'administration', label: 'Administration', Icon: Building2, Component: Administration },
  { id: 'explorer', label: 'API Explorer', Icon: Braces, Component: Explorer },
];

const STORAGE_KEY = 'quilr-management-playground-session';
const MAX_ACTIVITY = 200;

function readStored() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}
function writeStored(value) {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Storage can be disabled; the session still works in memory. */
  }
}

export default function ManagementPlayground() {
  const location = useLocation();
  const history = useHistory();
  // Static HTML is rendered without a query string; read it only after hydration.
  const isBrowser = useIsBrowser();
  const search = new URLSearchParams(isBrowser ? location.search : '');
  const tab = WORKSPACES.some((w) => w.id === search.get('tab')) ? search.get('tab') : 'overview';
  const opParam = search.get('op') || '';

  const [regionId, setRegionId] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [remember, setRemember] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [connection, setConnection] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [liveSpec, setLiveSpec] = useState(null);
  const [useLiveSpec, setUseLiveSpec] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityOpen, setActivityOpen] = useState(false);
  const [preset, setPreset] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  // The tenant-admin token is bound to the destination accepted with "Use token".
  const [adminSession, setAdminSession] = useState(null);
  const generation = useRef(0);
  const autoConnect = useRef(false);

  const selectedBase = useMemo(() => {
    const raw = regionId === 'custom' ? customUrl : REGIONS.find((r) => r.id === regionId)?.url;
    if (!raw) return { url: null, error: null };
    try {
      return { url: normalizeBaseUrl(raw), error: null };
    } catch (e) {
      return { url: null, error: e.message };
    }
  }, [regionId, customUrl]);

  const spec = useLiveSpec && liveSpec ? liveSpec : bundledSpec;
  const index = useMemo(() => {
    // Fields the spec marks writeOnly / password are redacted in activity too.
    setSpecSecretFields(spec);
    return buildIndex(spec);
  }, [spec]);
  const indexRef = useRef(index);
  indexRef.current = index;

  const record = useCallback((entry) => {
    setActivity((list) => [entry, ...list].slice(0, MAX_ACTIVITY));
  }, []);

  const client = useMemo(
    () =>
      connection
        ? createClient({ baseUrl: connection.baseUrl, token: connection.key, tokenKind: 'management', onActivity: record })
        : null,
    [connection, record],
  );
  const adminBase = connection?.baseUrl || selectedBase.url;
  // Changing the destination forgets the admin token, so it is never sent to a
  // host the user did not accept it for.
  useEffect(() => {
    setAdminSession((current) => (current && current.base !== adminBase ? null : current));
  }, [adminBase]);
  const adminClient = useMemo(() => {
    if (!adminSession || !adminBase || adminSession.base !== adminBase) return null;
    try {
      return createClient({ baseUrl: adminSession.base, token: adminSession.token, tokenKind: 'admin', onActivity: record });
    } catch {
      return null;
    }
  }, [adminSession, adminBase, record]);
  const acceptAdminToken = useCallback(
    (token, tenant) => {
      if (!adminBase || !token || !tenant) return;
      setAdminSession({ token, tenantId: tenant, base: adminBase, id: Date.now() });
    },
    [adminBase],
  );
  const forgetAdminToken = useCallback(() => setAdminSession(null), []);

  // budgetsOnly: the key lacks `read` but holds budgets:* scopes (see connect()).
  const budgetsOnly = !!capabilities?.budgetsOnly;
  const scopes = Array.isArray(capabilities?.caller?.scopes) ? capabilities.caller.scopes : null;
  const can = useCallback(
    (required = []) => {
      if (!required || !required.length) return true;
      if (!scopes) return null;
      return required.every((s) => scopes.includes(s));
    },
    [scopes],
  );

  const navigate = useCallback(
    (nextTab, extra = {}) => {
      const params = new URLSearchParams(location.search);
      params.set('tab', nextTab);
      if (nextTab !== 'explorer') params.delete('op');
      for (const [k, v] of Object.entries(extra)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      history.push({ pathname: location.pathname, search: `?${params.toString()}` });
    },
    [history, location.pathname, location.search],
  );

  const setParam = useCallback(
    (name, value) => {
      const params = new URLSearchParams(location.search);
      if (value) params.set(name, value);
      else params.delete(name);
      history.replace({ pathname: location.pathname, search: `?${params.toString()}` });
    },
    [history, location.pathname, location.search],
  );

  const openExplorer = useCallback(
    (next) => {
      setPreset({ ...next, nonce: Date.now() });
      navigate('explorer', { op: next.opId });
    },
    [navigate],
  );

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setConfirmState({ ...options, resolve });
      }),
    [],
  );

  async function connect(e, override) {
    e?.preventDefault();
    const base = override?.base || selectedBase.url;
    const key = (override?.key ?? keyInput).trim();
    if (!base) {
      setConnectError({ code: 'invalid_url', message: selectedBase.error || 'Choose a region or enter a custom gateway URL.' });
      return;
    }
    if (!key) {
      setConnectError({ code: 'missing_key', message: 'Enter a management key. Management keys start with qlmgmt_.' });
      return;
    }
    const current = ++generation.current;
    setConnecting(true);
    setConnectError(null);
    try {
      const probe = createClient({ baseUrl: base, token: key, tokenKind: 'management', onActivity: record });
      let caps;
      try {
        caps = await probe.call({ path: `${MANAGEMENT_PREFIX}/capabilities`, source: 'Connect' });
      } catch (err) {
        if (err.status !== 403 || err.code !== 'insufficient_scope') throw err;
        // Budget-only keys (budgets:* without read) cannot read capabilities.
        // The budgets list works with budgets:read and reports the caller.
        let budgets;
        try {
          budgets = await probe.call({ path: `${MANAGEMENT_PREFIX}/budgets`, query: { limit: 1 }, source: 'Connect (budgets)' });
        } catch {
          throw err;
        }
        const caller = budgets.caller || {};
        caps = {
          budgetsOnly: true,
          caller: {
            scopes: Array.isArray(caller.scopes)
              ? caller.scopes
              : [
                  caller.can_read && 'budgets:read',
                  caller.can_grant && 'budgets:grant',
                  caller.can_edit_policy && 'budgets:policy',
                ].filter(Boolean),
          },
        };
      }
      if (current !== generation.current) return;
      setCapabilities(caps);
      setConnection({ baseUrl: base, key, id: current });
      if (caps.budgetsOnly) navigate('budgets');
      setLiveSpec(null);
      writeStored(remember || override ? { regionId: override?.regionId ?? regionId, customUrl: override?.customUrl ?? customUrl, key } : null);
      probe
        .send({ path: LIVE_SPEC_PATH, source: 'Load live spec' })
        .then((res) => {
          if (current === generation.current && res.ok && res.data && typeof res.data === 'object' && res.data.paths) {
            setLiveSpec(res.data);
          }
        })
        .catch(() => {});
    } catch (err) {
      if (current === generation.current) {
        setConnectError(
          err.status === 401
            ? { ...err, message: 'The gateway rejected this management key. Check that it is active and belongs to this region.' }
            : err.code === 'insufficient_scope'
              ? { ...err, message: `${err.message} The key needs the read scope, or a budgets scope to use only the Budgets workspace.` }
            : err.status === 404
              ? { ...err, message: 'The management API is not available at this URL. Check the region, or ask your administrator to enable management for the tenant.' }
              : err,
        );
      }
    } finally {
      if (current === generation.current) setConnecting(false);
    }
  }

  function disconnect() {
    generation.current += 1;
    setAdminSession(null);
    setConnection(null);
    setCapabilities(null);
    setLiveSpec(null);
    setKeyInput('');
    setRemember(false);
    setConnecting(false);
    setConnectError(null);
    writeStored(null);
  }

  useEffect(() => {
    if (autoConnect.current) return;
    autoConnect.current = true;
    try {
      if (window.matchMedia('(min-width: 1280px)').matches) setActivityOpen(true);
    } catch {
      /* ignore */
    }
    const saved = readStored();
    if (saved?.key && saved.regionId) {
      setRegionId(saved.regionId);
      setCustomUrl(saved.customUrl || '');
      setKeyInput(saved.key);
      setRemember(true);
      const raw = saved.regionId === 'custom' ? saved.customUrl : REGIONS.find((r) => r.id === saved.regionId)?.url;
      try {
        const base = normalizeBaseUrl(raw);
        connect(null, { base, key: saved.key, regionId: saved.regionId, customUrl: saved.customUrl });
      } catch {
        writeStored(null);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const context = {
    index,
    spec,
    liveSpecAvailable: !!liveSpec,
    useLiveSpec,
    setUseLiveSpec,
    connection,
    client,
    adminClient,
    adminBase,
    adminSession,
    tenantId: adminSession?.tenantId || '',
    acceptAdminToken,
    forgetAdminToken,
    capabilities,
    budgetsOnly,
    scopes,
    can,
    navigate,
    setParam,
    urlParam: (name) => search.get(name) || '',
    openExplorer,
    preset,
    opParam,
    confirm,
    record,
  };

  const active = WORKSPACES.find((w) => w.id === tab);
  const Workspace = active.Component;
  const regionLabel =
    regionId === 'custom' ? 'Custom URL' : REGIONS.find((r) => r.id === regionId)?.label || '';

  return (
    <PlaygroundContext.Provider value={context}>
      <div className={styles.root}>
        <header className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>LLM GATEWAY / MANAGEMENT API V1</div>
            <h1>Management API playground</h1>
            <p>
              Administer apps, providers, credentials, prompts and budgets against your live gateway, and see the exact
              API call behind every action.
            </p>
          </div>
          <nav className={styles.heroLinks} aria-label="Related pages">
            <Link to="/llm-gateway-playground">
              Gateway playground <ArrowUpRight size={13} aria-hidden />
            </Link>
            <Link to="/llm-gateway/api-reference/management-api">
              API reference <ArrowUpRight size={13} aria-hidden />
            </Link>
          </nav>
        </header>

        <form className={styles.connectBar} onSubmit={connect} aria-label="Gateway connection">
          <Field label="Region">
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              disabled={connecting || !!connection}
              required
            >
              <option value="" disabled>
                Select a region
              </option>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
              <option value="custom">Custom URL</option>
            </select>
          </Field>
          {regionId === 'custom' && (
            <Field label="Gateway URL" hint={customUrl && selectedBase.error ? selectedBase.error : undefined}>
              <input
                type="url"
                inputMode="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://gateway.example.com"
                disabled={connecting || !!connection}
                aria-invalid={!!(customUrl && selectedBase.error)}
                required
              />
            </Field>
          )}
          <Field label="Management key">
            <input
              type="password"
              autoComplete="off"
              spellCheck="false"
              value={connection ? '••••••••••••' : keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="qlmgmt_..."
              disabled={connecting || !!connection}
            />
          </Field>
          <div className={styles.connectActions}>
            {connection ? (
              <Btn onClick={disconnect}>
                <Unplug size={14} aria-hidden /> Disconnect and forget
              </Btn>
            ) : (
              <Btn type="submit" variant="primary" busy={connecting}>
                <Plug size={14} aria-hidden /> Connect
              </Btn>
            )}
            <Checkbox
              label="Remember for this tab"
              checked={remember}
              disabled={connecting}
              onChange={(value) => {
                setRemember(value);
                if (!value) writeStored(null);
                else if (connection) writeStored({ regionId, customUrl, key: connection.key });
              }}
            />
          </div>
        </form>
        <div className={styles.connectStatus}>
          {connection ? (
            <>
              <Pill tone="ok">Connected</Pill>
              <span>
                {regionLabel} <code>{connection.baseUrl}</code>
              </span>
              {budgetsOnly && <Pill tone="warn">Budgets only</Pill>}
              {scopes ? (
                <span className={styles.scopeList}>
                  {scopes.map((s) => (
                    <code key={s}>{s}</code>
                  ))}
                </span>
              ) : (
                <span className={styles.muted}>Scopes not reported; buttons stay enabled and the gateway answers 403 when a scope is missing.</span>
              )}
            </>
          ) : (
            <span className={styles.muted}>
              <ShieldCheck size={13} aria-hidden /> Requests go straight from your browser to the gateway. The key stays in
              memory (or in this tab's session storage if you opt in) and is never shown in activity or snippets.
            </span>
          )}
          <button
            type="button"
            className={styles.activityToggle}
            onClick={() => setActivityOpen((v) => !v)}
            aria-expanded={activityOpen}
            aria-controls="mgmt-activity"
          >
            {activityOpen ? <PanelRightClose size={14} aria-hidden /> : <PanelRightOpen size={14} aria-hidden />}
            <Activity size={14} aria-hidden /> API activity <span className={styles.count}>{activity.length}</span>
          </button>
        </div>
        <ErrorBox error={connectError} onDismiss={() => setConnectError(null)} />

        <div className={`${styles.shell} ${activityOpen ? styles.shellWithActivity : ''}`}>
          <nav className={styles.nav} aria-label="Workspaces">
            {WORKSPACES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={tab === id ? styles.navActive : ''}
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => navigate(id)}
              >
                <Icon size={15} aria-hidden /> <span>{label}</span>
              </button>
            ))}
          </nav>
          <main className={styles.main} id="mgmt-workspace">
            {budgetsOnly && !['budgets', 'explorer', 'administration'].includes(active.id) ? (
              <EmptyState icon={Lock} title="This key cannot use this workspace">
                The connected key has budget scopes ({(scopes || []).join(', ') || 'none'}) but not <code>read</code>, so
                it can only manage budgets.{' '}
                <button type="button" className={styles.linkBtn} onClick={() => navigate('budgets')}>
                  Open Budgets
                </button>{' '}
                or connect with a key that has <code>read</code> to use {active.label}.
              </EmptyState>
            ) : (
              <Workspace key={`${active.id}-${connection?.id || 0}`} />
            )}
          </main>
          {activityOpen && (
            <ActivityPanel
              entries={activity}
              onClear={() => setActivity([])}
              onClose={() => setActivityOpen(false)}
            />
          )}
        </div>
        {confirmState && (
          <ConfirmDialog
            state={confirmState}
            onClose={(answer) => {
              confirmState.resolve(answer);
              setConfirmState(null);
            }}
          />
        )}
      </div>
    </PlaygroundContext.Provider>
  );
}

function ConfirmDialog({ state, onClose }) {
  const [typed, setTyped] = useState('');
  const cancelRef = useRef(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const needsText = state.typeToConfirm;
  return (
    <div className={styles.dialogBackdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose(false)}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="mgmt-confirm-title">
        <h2 id="mgmt-confirm-title">{state.title}</h2>
        {state.body && <div className={styles.dialogBody}>{state.body}</div>}
        {state.call && (
          <p className={styles.dialogCall}>
            <code>{state.call}</code>
          </p>
        )}
        {needsText && (
          <Field label={`Type ${needsText} to confirm`}>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </Field>
        )}
        <div className={styles.dialogActions}>
          <Btn ref={cancelRef} onClick={() => onClose(false)}>
            Cancel
          </Btn>
          <Btn
            variant={state.tone === 'danger' ? 'danger' : 'primary'}
            disabled={needsText && typed !== needsText}
            onClick={() => onClose(true)}
          >
            {state.confirmLabel || 'Confirm'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
