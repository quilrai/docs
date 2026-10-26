import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Lock, TriangleAlert } from 'lucide-react';
import { MANAGEMENT_PREFIX, ADMIN_PREFIX } from './client.mjs';
import { findOperation } from './spec.mjs';
import styles from './styles.module.css';

export const PlaygroundContext = createContext(null);
export const usePlayground = () => useContext(PlaygroundContext);

export const pretty = (value) =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);

export const fmt = (value) =>
  value === null || value === undefined || value === ''
    ? '-'
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);

export function shortPath(path) {
  if (path.startsWith(ADMIN_PREFIX)) return `admin${path.slice(ADMIN_PREFIX.length)}`;
  if (path.startsWith(MANAGEMENT_PREFIX)) return path.slice(MANAGEMENT_PREFIX.length) || '/';
  return path;
}

export function MethodBadge({ method, small }) {
  const m = String(method).toUpperCase();
  return (
    <span className={`${styles.method} ${styles[`m_${m.toLowerCase()}`] || ''} ${small ? styles.methodSmall : ''}`}>
      {m}
    </span>
  );
}

export function Panel({ title, subtitle, actions, children, id }) {
  return (
    <section className={styles.panel} aria-labelledby={id}>
      {(title || actions) && (
        <header className={styles.panelHeader}>
          <div>
            {title && <h2 id={id}>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className={styles.panelActions}>{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, wide }) {
  return (
    <label className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label className={styles.checkLabel}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export const Btn = React.forwardRef(function Btn(
  { children, variant, onClick, disabled, type = 'button', title, busy, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${styles.btn} ${variant ? styles[`btn_${variant}`] : ''}`}
      onClick={onClick}
      disabled={disabled || busy}
      title={title}
      aria-busy={busy || undefined}
      {...rest}
    >
      {busy ? 'Working...' : children}
    </button>
  );
});

/** Required scopes for a management route, from the spec when available. */
export function useScopes(method, path, fallback = []) {
  const { index } = usePlayground();
  const op = findOperation(index, method, MANAGEMENT_PREFIX + path);
  return op && op.scopes.length ? op.scopes : fallback;
}

/**
 * A button bound to one API operation. It is disabled with an explanation
 * when the connected key lacks a required scope, and shows the call it makes.
 */
export function ActionButton({ method, path, scopes: fallback, children, onClick, variant, disabled, needsConnection = true }) {
  const { can, client } = usePlayground();
  const scopes = useScopes(method, path, fallback);
  const allowed = can(scopes);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => {
    mounted.current = false;
  }, []);
  const blocked = allowed === false;
  const offline = needsConnection && !client;
  const title = offline
    ? 'Connect with a management key first'
    : blocked
      ? `Requires ${scopes.join(' + ')}`
      : `${method} ${path}`;
  return (
    <Btn
      variant={variant}
      disabled={disabled || blocked || offline}
      busy={busy}
      title={title}
      onClick={async () => {
        setBusy(true);
        try {
          await onClick?.();
        } finally {
          if (mounted.current) setBusy(false);
        }
      }}
    >
      {blocked && <Lock size={12} aria-hidden />} {children}
    </Btn>
  );
}

/** Shows the API call behind a UI element and opens it in the explorer. */
export function ApiChip({ method, path, label }) {
  const { index, openExplorer } = usePlayground();
  const full = path.startsWith('/llmgateway') ? path : MANAGEMENT_PREFIX + path;
  const op = findOperation(index, method, full);
  const content = (
    <>
      <MethodBadge method={method} small />
      <code>{label || shortPath(full)}</code>
    </>
  );
  if (!op) return <span className={styles.apiChip}>{content}</span>;
  return (
    <button
      type="button"
      className={`${styles.apiChip} ${styles.apiChipLink}`}
      onClick={() => openExplorer({ opId: op.id })}
      title={`Open ${op.summary} in the API explorer`}
    >
      {content}
      <ExternalLink size={11} aria-hidden />
    </button>
  );
}

export function ApiChips({ calls }) {
  return (
    <div className={styles.apiChips} aria-label="API calls used here">
      {calls.map(([method, path, label]) => (
        <ApiChip key={method + path} method={method} path={path} label={label} />
      ))}
    </div>
  );
}

export function JsonView({ value, maxHeight }) {
  return (
    <pre className={styles.json} style={maxHeight ? { maxHeight } : undefined}>
      {pretty(value)}
    </pre>
  );
}

export function parseJson(text) {
  if (!String(text).trim()) return { value: undefined, error: null };
  try {
    return { value: JSON.parse(text), error: null };
  } catch (e) {
    return { value: undefined, error: e.message };
  }
}

export function JsonField({ label, value, onChange, rows = 8, hint }) {
  const { error } = parseJson(value);
  return (
    <Field label={label} hint={error ? `Invalid JSON: ${error}` : hint} wide>
      <textarea
        className={`${styles.code} ${error ? styles.invalid : ''}`}
        spellCheck="false"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
    </Field>
  );
}

export function ErrorBox({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className={styles.errorBox} role="alert">
      <div>
        <TriangleAlert size={15} aria-hidden />
        <strong>{error.code || 'request_failed'}</strong>
        {error.status ? <span className={styles.muted}> HTTP {error.status}</span> : null}
        {onDismiss && (
          <button type="button" className={styles.linkBtn} onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
      <p>{error.message}</p>
      {error.status === 403 && (
        <p className={styles.muted}>The key is missing a scope for this call, or management is suspended for the tenant.</p>
      )}
      {error.status === 412 && (
        <p className={styles.muted}>The resource changed since it was read. Reload it and try again.</p>
      )}
      {error.requestId && <small>Request ID: {error.requestId}</small>}
      {error.payload && typeof error.payload === 'object' && (
        <details>
          <summary>Full error response</summary>
          <JsonView value={error.payload} />
        </details>
      )}
    </div>
  );
}

export function Notice({ children, tone = 'info', onDismiss }) {
  if (!children) return null;
  return (
    <div className={`${styles.notice} ${styles[`notice_${tone}`] || ''}`} role="status">
      <span>{children}</span>
      {onDismiss && (
        <button type="button" className={styles.linkBtn} onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}

export function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={styles.copyBtn}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />} {done ? 'Copied' : label}
    </button>
  );
}

export function SecretOnce({ secret, title = 'New secret', onDismiss }) {
  if (!secret) return null;
  return (
    <div className={styles.secretBox} role="status">
      <strong>{title}</strong>
      <p>Store it now. Ordinary reads never return it again, and this page forgets it when you dismiss it.</p>
      <div className={styles.secretRow}>
        <code>{secret}</code>
        <CopyButton text={secret} />
      </div>
      <Btn onClick={onDismiss}>I stored it, hide the secret</Btn>
    </div>
  );
}

export function Table({ columns, rows = [], empty = 'Nothing to show yet.', rowKey, onRowClick, selected }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const key = rowKey ? rowKey(row) : i;
            return (
              <tr
                key={key}
                className={`${onRowClick ? styles.clickable : ''} ${selected !== undefined && selected === key ? styles.selectedRow : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((c) => (
                  <td key={c.label} data-label={c.label}>
                    {c.render ? c.render(row) : fmt(row[c.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length && <p className={styles.empty}>{empty}</p>}
    </div>
  );
}

/** Cursor-paginated collection loader. */
export function useCollection(loader, deps, enabled = true) {
  const [cursors, setCursors] = useState([null]);
  const [state, setState] = useState({ data: null, error: null, loading: false });
  const [tick, setTick] = useState(0);
  const cursor = cursors[cursors.length - 1];
  useEffect(() => {
    setCursors([null]);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }
    let active = true;
    setState((s) => ({ ...s, error: null, loading: true }));
    Promise.resolve()
      .then(() => loader(cursor))
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: null, error, loading: false }));
    return () => {
      active = false;
    };
  }, [...deps, cursor, tick, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    ...state,
    page: cursors.length,
    reload: () => setTick((t) => t + 1),
    next: () => state.data?.next_cursor && setCursors((c) => [...c, state.data.next_cursor]),
    prev: () => setCursors((c) => (c.length > 1 ? c.slice(0, -1) : c)),
    first: () => setCursors([null]),
  };
}

export function Pager({ list }) {
  return (
    <div className={styles.pager}>
      <span className={styles.muted}>
        Page {list.page}
        {list.loading ? ' - loading' : ''}
      </span>
      <Btn onClick={list.first} disabled={list.page === 1}>
        First
      </Btn>
      <Btn onClick={list.prev} disabled={list.page === 1}>
        Previous
      </Btn>
      <Btn onClick={list.next} disabled={!list.data?.next_cursor}>
        Next
      </Btn>
    </div>
  );
}

export function LoadingLine({ show }) {
  return show ? (
    <p className={styles.muted} role="status">
      Loading...
    </p>
  ) : null;
}

/** Runs one async action at a time and keeps its error/result. */
export function useAction() {
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const run = useCallback(async (fn, success) => {
    setError(null);
    setNotice('');
    try {
      const result = await fn();
      if (success) setNotice(typeof success === 'function' ? success(result) : success);
      return result;
    } catch (e) {
      setError(e);
      return undefined;
    }
  }, []);
  return { error, setError, notice, setNotice, run };
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className={styles.emptyState}>
      {Icon && <Icon size={26} aria-hidden />}
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function ConnectFirst({ what }) {
  return (
    <EmptyState icon={Lock} title="Connect to a gateway">
      Choose a region and enter a management key above to {what}. Use the API Explorer to read the reference without
      connecting.
    </EmptyState>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className={styles.subTabs} role="tablist" aria-label={label}>
      {tabs.map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          className={value === id ? styles.subTabActive : ''}
          onClick={() => onChange(id)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function KeyValue({ items }) {
  return (
    <dl className={styles.kv}>
      {items
        .filter(Boolean)
        .map(([k, v]) => (
          <React.Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </React.Fragment>
        ))}
    </dl>
  );
}

export function Pill({ children, tone }) {
  return <span className={`${styles.pill} ${tone ? styles[`pill_${tone}`] : ''}`}>{children}</span>;
}

export function EnabledPill({ value }) {
  if (value === undefined || value === null) return <Pill>unknown</Pill>;
  return <Pill tone={value ? 'ok' : 'off'}>{value ? 'enabled' : 'disabled'}</Pill>;
}

export const csv = (text) =>
  String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
