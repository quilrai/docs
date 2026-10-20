import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

export const format = (value) =>
  value == null
    ? '–'
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
export const pretty = (value) => JSON.stringify(value, null, 2);
export function Panel({ title, children, actions }) {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <h2>{title}</h2>
        {actions}
      </header>
      {children}
    </section>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Json({ value }) {
  return <pre className={styles.json}>{pretty(value)}</pre>;
}
export function JsonEditor({ label, value, onChange, rows = 7 }) {
  return (
    <Field label={label}>
      <textarea
        spellCheck="false"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}
export function Badge({ children, state }) {
  return (
    <span
      className={`${styles.badge} ${['blocked', 'stale'].includes(state) ? styles.danger : ['alerting', 'overflow'].includes(state) ? styles.warning : ''}`}
    >
      {children}
    </span>
  );
}
export function ErrorView({ error }) {
  return error ? (
    <div className={styles.error} role="alert">
      <strong>{error.code || 'request_failed'}</strong>: {error.message}
      {error.status && (
        <small>
          HTTP {error.status} · request {error.requestId || 'unknown'}
        </small>
      )}
      {error.payload && (
        <details>
          <summary>Full API response</summary>
          <Json value={error.payload} />
        </details>
      )}
    </div>
  ) : null;
}
export function Freshness({ data }) {
  if (!data) return null;
  return (
    <div className={styles.freshness}>
      {data.as_of && (
        <>
          <Badge state={data.stale ? 'stale' : 'ok'}>
            {data.stale ? 'Stale snapshot' : 'Fresh snapshot'}
          </Badge>
          <span>As of {data.as_of}</span>
        </>
      )}
      {data.period && <span>Period: {data.period}</span>}
      {data.window?.start && (
        <span>
          {data.window.start} → {data.window.reset_at || 'no reset'}
        </span>
      )}
      {data.period_not_supported?.length > 0 && (
        <span>
          Unsupported for this period: {data.period_not_supported.join(', ')}
        </span>
      )}
    </div>
  );
}
export function Table({ columns, rows = [], empty = 'No matching records.' }) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || row.exemption_id || row.event_id || i}>
              {columns.map((c, j) => (
                <td key={j}>{c.render ? c.render(row) : format(row[c.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className={styles.empty}>{empty}</p>}
    </div>
  );
}
export function MutationForm({
  children,
  onSubmit,
  submitLabel = 'Save',
  disabled,
}) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      className={styles.form}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSubmit();
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      <div className={styles.actions}>
        <button
          className={styles.primary}
          disabled={disabled || busy}
          type="submit"
        >
          {busy ? 'Working…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
export function useLoad(loader, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    setLoading(true);
    Promise.resolve()
      .then(loader)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [...deps, tick]);
  return { data, error, loading, reload: () => setTick((v) => v + 1) };
}
export function LoadState({ state }) {
  return (
    <>
      <ErrorView error={state.error} />
      {state.loading && (
        <p role="status" className={styles.empty}>
          Loading…
        </p>
      )}
    </>
  );
}
export function Pager({ data, onNext, onReset }) {
  return (
    <div className={styles.actions}>
      <small>
        {data?.total != null
          ? `${data.total} matching records`
          : 'Paginated results'}
      </small>
      <button type="button" onClick={onReset}>
        First page
      </button>
      <button
        type="button"
        disabled={!data?.next_cursor}
        onClick={() => onNext(data.next_cursor)}
      >
        Next page
      </button>
    </div>
  );
}
export function StateSelect({ value, onChange }) {
  return (
    <Field label="State">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {['', 'ok', 'alerting', 'granted', 'overflow', 'blocked'].map((s) => (
          <option key={s} value={s}>
            {s || 'All states'}
          </option>
        ))}
      </select>
    </Field>
  );
}
