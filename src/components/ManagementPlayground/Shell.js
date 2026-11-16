import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { Activity, ArrowUpRight, Lock, PanelRightClose, PanelRightOpen, Plug, ShieldCheck, Unplug } from 'lucide-react';
import { createClient, normalizeBaseUrl, setRedactionOptions, setSpecSecretFields } from './client.mjs';
import { buildIndex } from './spec.mjs';
import { PlaygroundContext, Btn, Checkbox, EmptyState, Field, ErrorBox, Pill } from './ui';
import ActivityPanel from './ActivityPanel';
import styles from './styles.module.css';

// The playground shell shared by the LLM Gateway and MCP Gateway Management API
// playgrounds: destination + key connection, workspace navigation, API activity,
// the live/bundled spec index and the confirm dialog. Everything that differs
// between the two products comes from `product` (see ./index.js for the LLM
// Gateway configuration and ../McpManagementPlayground/index.js for MCP):
//
//   spec, managementPrefix, adminPrefix, apiRoot, liveSpecPath   API shape
//   regions [{id,label,url}], regionLabel, regionPlaceholder,
//   defaultRegion                                                destinations
//   keyPrefix, keyCheck(key), probe(client), connectError(err)   connecting
//   storageKey        sessionStorage namespace for "Remember for this tab"
//   envNames {management, admin}  credential variables in snippets
//   indexOptions      buildIndex options (tag order, alias and subgroup rules)
//   redaction         {extraSecretFields, redactUrlQueryValues}
//   workspaces [{id,label,Icon,Component}], limitedAllowed (usable with limitedAreas)
//   adminSupported    false: tenant-admin operations are reference only
//   hero {eyebrow,title,text}, links [{to,label}], securityNote, connectFirst

const MAX_ACTIVITY = 200;

function readStored(storageKey) {
  try {
    return JSON.parse(window.sessionStorage.getItem(storageKey) || 'null');
  } catch {
    return null;
  }
}
function writeStored(storageKey, value) {
  try {
    if (value) window.sessionStorage.setItem(storageKey, JSON.stringify(value));
    else window.sessionStorage.removeItem(storageKey);
  } catch {
    /* Storage can be disabled; the session still works in memory. */
  }
}

export default function PlaygroundShell({ product }) {
  const { workspaces: WORKSPACES, regions: REGIONS, storageKey: STORAGE_KEY, spec: bundledSpec } = product;
  const prefixes = useMemo(() => [product.managementPrefix, product.adminPrefix].filter(Boolean), [product]);
  const location = useLocation();
  const history = useHistory();
  // Static HTML is rendered without a query string; read it only after hydration.
  const isBrowser = useIsBrowser();
  const search = new URLSearchParams(isBrowser ? location.search : '');
  const tab = WORKSPACES.some((w) => w.id === search.get('tab')) ? search.get('tab') : WORKSPACES[0].id;
  const opParam = search.get('op') || '';

  const [regionId, setRegionId] = useState(product.defaultRegion || '');
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
      return { url: normalizeBaseUrl(raw, prefixes), error: null };
    } catch (e) {
      return { url: null, error: e.message };
    }
  }, [regionId, customUrl, REGIONS, prefixes]);

  const spec = useLiveSpec && liveSpec ? liveSpec : bundledSpec;
  const index = useMemo(() => {
    // Fields the spec marks writeOnly / password are redacted in activity too.
    setRedactionOptions(product.redaction);
    setSpecSecretFields(spec);
    return buildIndex(spec, product.indexOptions);
  }, [spec, product]);

  const record = useCallback((entry) => {
    setActivity((list) => [entry, ...list].slice(0, MAX_ACTIVITY));
  }, []);

  const client = useMemo(
    () =>
      connection
        ? createClient({ baseUrl: connection.baseUrl, token: connection.key, tokenKind: 'management', onActivity: record, prefixes })
        : null,
    [connection, record, prefixes],
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
      return createClient({ baseUrl: adminSession.base, token: adminSession.token, tokenKind: 'admin', onActivity: record, prefixes });
    } catch {
      return null;
    }
  }, [adminSession, adminBase, record, prefixes]);
  const acceptAdminToken = useCallback(
    (token, tenant) => {
      if (!adminBase || !token || !tenant) return;
      setAdminSession({ token, tenantId: tenant, base: adminBase, id: Date.now() });
    },
    [adminBase],
  );
  const forgetAdminToken = useCallback(() => setAdminSession(null), []);

  // limitedAreas: the key lacks `read` but holds the read scope of some areas
  // (LLM Gateway: budgets:*, routing:read, limits:read, incidents:read); see product.probe.
  const limitedAreas = Array.isArray(capabilities?.limitedAreas) ? capabilities.limitedAreas : null;
  const budgetsOnly = !!limitedAreas && limitedAreas.length === 1 && limitedAreas[0] === 'budgets';
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
      setConnectError({
        code: 'invalid_url',
        message: selectedBase.error || `Choose a ${product.regionLabel.toLowerCase()} or enter a custom gateway URL.`,
      });
      return;
    }
    if (!key) {
      setConnectError({ code: 'missing_key', message: `Enter a management key. Management keys start with ${product.keyPrefix}.` });
      return;
    }
    const keyProblem = product.keyCheck?.(key);
    if (keyProblem) {
      setConnectError({ code: 'wrong_key_type', message: keyProblem });
      return;
    }
    const current = ++generation.current;
    setConnecting(true);
    setConnectError(null);
    try {
      const probe = createClient({ baseUrl: base, token: key, tokenKind: 'management', onActivity: record, prefixes });
      const caps = await product.probe(probe);
      if (current !== generation.current) return;
      setCapabilities(caps);
      setConnection({ baseUrl: base, key, id: current });
      if (caps.limitedAreas?.length) navigate(caps.limitedAreas[0]);
      setLiveSpec(null);
      writeStored(
        STORAGE_KEY,
        remember || override ? { regionId: override?.regionId ?? regionId, customUrl: override?.customUrl ?? customUrl, key } : null,
      );
      probe
        .send({ path: product.liveSpecPath, source: 'Load live spec' })
        .then((res) => {
          if (current === generation.current && res.ok && res.data && typeof res.data === 'object' && res.data.paths) {
            setLiveSpec(res.data);
          }
        })
        .catch(() => {});
    } catch (err) {
      if (current === generation.current) setConnectError(product.connectError ? product.connectError(err) : err);
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
    writeStored(STORAGE_KEY, null);
  }

  useEffect(() => {
    if (autoConnect.current) return;
    autoConnect.current = true;
    try {
      if (window.matchMedia('(min-width: 1280px)').matches) setActivityOpen(true);
    } catch {
      /* ignore */
    }
    const saved = readStored(STORAGE_KEY);
    if (saved?.key && saved.regionId) {
      setRegionId(saved.regionId);
      setCustomUrl(saved.customUrl || '');
      setKeyInput(saved.key);
      setRemember(true);
      const raw = saved.regionId === 'custom' ? saved.customUrl : REGIONS.find((r) => r.id === saved.regionId)?.url;
      try {
        const base = normalizeBaseUrl(raw, prefixes);
        connect(null, { base, key: saved.key, regionId: saved.regionId, customUrl: saved.customUrl });
      } catch {
        writeStored(STORAGE_KEY, null);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const context = {
    product,
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
    limitedAreas,
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
    activity,
    clearActivity: () => setActivity([]),
  };

  const active = WORKSPACES.find((w) => w.id === tab);
  const Workspace = active.Component;
  const regionLabel = regionId === 'custom' ? 'Custom URL' : REGIONS.find((r) => r.id === regionId)?.label || '';
  const limitedAllowed = product.limitedAllowed || ['explorer'];

  return (
    <PlaygroundContext.Provider value={context}>
      <div className={styles.root}>
        <header className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>{product.hero.eyebrow}</div>
            <h1>{product.hero.title}</h1>
            <p>{product.hero.text}</p>
          </div>
          <nav className={styles.heroLinks} aria-label="Related pages">
            {product.links.map(({ to, label }) => (
              <Link key={to} to={to}>
                {label} <ArrowUpRight size={13} aria-hidden />
              </Link>
            ))}
          </nav>
        </header>

        <form className={styles.connectBar} onSubmit={connect} aria-label="Gateway connection">
          <Field label={product.regionLabel}>
            <select value={regionId} onChange={(e) => setRegionId(e.target.value)} disabled={connecting || !!connection} required>
              <option value="" disabled>
                {product.regionPlaceholder}
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
              placeholder={`${product.keyPrefix}...`}
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
                if (!value) writeStored(STORAGE_KEY, null);
                else if (connection) writeStored(STORAGE_KEY, { regionId, customUrl, key: connection.key });
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
              {limitedAreas && <Pill tone="warn">{budgetsOnly ? 'Budgets only' : `Limited to ${limitedAreas.join(', ')}`}</Pill>}
              {scopes ? (
                <span className={styles.scopeList}>
                  {scopes.map((s) => (
                    <code key={s}>{s}</code>
                  ))}
                </span>
              ) : (
                <span className={styles.muted}>
                  Scopes not reported; buttons stay enabled and the gateway answers 403 when a scope is missing.
                </span>
              )}
            </>
          ) : (
            <span className={styles.muted}>
              <ShieldCheck size={13} aria-hidden /> {product.securityNote}
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
            {limitedAreas && ![...limitedAreas, ...limitedAllowed].includes(active.id) ? (
              <EmptyState icon={Lock} title="This key cannot use this workspace">
                The connected key does not have <code>read</code>, so it can only use{' '}
                {limitedAreas.map((area, i) => (
                  <React.Fragment key={area}>
                    {i > 0 && ', '}
                    <button type="button" className={styles.linkBtn} onClick={() => navigate(area)}>
                      {WORKSPACES.find((w) => w.id === area)?.label || area}
                    </button>
                  </React.Fragment>
                ))}
                . Connect with a key that has <code>read</code> to use {active.label}.
              </EmptyState>
            ) : (
              <Workspace key={`${active.id}-${connection?.id || 0}`} />
            )}
          </main>
          {activityOpen && <ActivityPanel entries={activity} onClear={() => setActivity([])} onClose={() => setActivityOpen(false)} />}
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
          <Btn variant={state.tone === 'danger' ? 'danger' : 'primary'} disabled={needsText && typed !== needsText} onClick={() => onClose(true)}>
            {state.confirmLabel || 'Confirm'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
