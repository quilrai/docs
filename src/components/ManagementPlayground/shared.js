import React, { useEffect, useId, useRef, useState } from 'react';
import { MANAGEMENT_PREFIX } from './client.mjs';
import { Btn, Field, usePlayground } from './ui';
import styles from './styles.module.css';

/** Loads one resource; reload() refetches. */
export function useLoad(loader, deps, enabled = true) {
  const [state, setState] = useState({ data: null, error: null, loading: false });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(loader)
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: null, error, loading: false }));
    return () => {
      active = false;
    };
  }, [...deps, tick, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: () => setTick((t) => t + 1), setData: (data) => setState((s) => ({ ...s, data })) };
}

const MAX_PAGES = 100;

/**
 * Follows next_cursor until the last page and returns the first page's payload
 * with every item. loadPage(cursor) loads one page. Stops on a repeated cursor.
 */
export async function fetchAllPages(loadPage) {
  const items = [];
  const seen = new Set();
  let first = null;
  let page = null;
  let cursor = null;
  for (let i = 0; i < MAX_PAGES; i += 1) {
    page = await loadPage(cursor || undefined);
    first ||= page;
    items.push(...(Array.isArray(page?.items) ? page.items : []));
    cursor = page?.next_cursor || null;
    if (!cursor) break;
    if (seen.has(cursor)) throw new Error('The API repeated a pagination cursor. Refresh the list.');
    seen.add(cursor);
    if (i === MAX_PAGES - 1) throw new Error(`Stopped after ${MAX_PAGES} pages. Refresh the list or narrow it.`);
  }
  const result = { ...first, items, next_cursor: null };
  if (page?._meta) Object.defineProperty(result, '_meta', { value: page._meta, enumerable: false });
  return result;
}

/** App selector shared by Credentials and Prompts; remembers the app in the URL. */
export function AppPicker({ label = 'App' }) {
  const { client, urlParam, setParam } = usePlayground();
  const [draft, setDraft] = useState(urlParam('app'));
  const [names, setNames] = useState([]);
  const listId = useId();
  useEffect(() => {
    if (!client) return;
    let active = true;
    fetchAllPages((cursor) => client.call({ path: `${MANAGEMENT_PREFIX}/apps`, query: { limit: 200, cursor }, source: 'App picker' }))
      .then((res) => {
        if (active) setNames(res.items.map((a) => a.name).filter(Boolean));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [client]);
  return (
    <form
      className={styles.pickerRow}
      onSubmit={(e) => {
        e.preventDefault();
        setParam('app', draft.trim());
      }}
    >
      <Field label={label} hint="Names with / or % use the query-locator form of the route automatically.">
        <input list={listId} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Support Bot" />
        <datalist id={listId}>
          {names.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </Field>
      <Btn type="submit" variant="primary" disabled={!draft.trim()}>
        Open app
      </Btn>
    </form>
  );
}

/**
 * Ref for the detail side of a list + detail layout. When `key` changes (a row was picked),
 * the detail scrolls back to its top and, if it is off screen (stacked layout), into view.
 */
export function useDetailReveal(key) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || key === null || key === undefined || key === '') return;
    el.scrollTop = 0;
    const box = el.getBoundingClientRect();
    if (box.top < 0 || box.top > window.innerHeight - 80) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [key]);
  return ref;
}

// ── App / provider / model drill-down filters ─────────────────────────────

// One load of apps and shared providers per connected client, reused by every filter form.
const scopeCache = new WeakMap();
function loadScope(client) {
  if (!scopeCache.has(client)) {
    const all = (path, source) => fetchAllPages((cursor) => client.call({ path: `${MANAGEMENT_PREFIX}${path}`, query: { limit: 200, cursor }, source }));
    const promise = Promise.all([all('/apps', 'Filter options: apps'), all('/providers', 'Filter options: providers')]).then(([apps, providers]) => ({
      apps: apps.items.map((a) => ({ name: a.name, labels: a.provider_labels || [] })).filter((a) => a.name),
      providers: providers.items.map((p) => ({ label: p.label, name: p.provider_name, models: p.selected_models || [] })).filter((p) => p.label),
    }));
    promise.catch(() => scopeCache.delete(client));
    scopeCache.set(client, promise);
  }
  return scopeCache.get(client);
}

/** Apps and shared providers of the tenant, for filter dropdowns. data is null until loaded. */
export function useScopeOptions() {
  const { client } = usePlayground();
  return useLoad(() => loadScope(client), [client], !!client);
}

const uniq = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
const TYPE = '\u0000type';

/** A select of known values plus "Any" and "Type a value...", which switches to a text box. */
function PickOrType({ value, options, onChange, anyLabel = 'Any', placeholder, disabled }) {
  const [typing, setTyping] = useState(false);
  const known = value === '' || options.includes(value);
  if (typing || !known) {
    return (
      <span className={styles.inline}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={typing} />
        {options.length > 0 && (
          <Btn
            onClick={() => {
              setTyping(false);
              onChange('');
            }}
          >
            List
          </Btn>
        )}
      </span>
    );
  }
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => {
        if (e.target.value === TYPE) setTyping(true);
        else onChange(e.target.value);
      }}
    >
      <option value="">{anyLabel}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value={TYPE}>Type a value...</option>
    </select>
  );
}

const KINDS = {
  provider: { label: 'Provider type', any: 'All provider types', noun: 'provider' },
  app: { label: 'App', any: 'All apps', noun: 'app', placeholder: 'Support Bot' },
  model: { label: 'Served model', any: 'All models', noun: 'model' },
};
const sameApp = (a, b) => a.toLowerCase() === b.toLowerCase();

// Shared providers that fit every chosen value except the `except` kind. A chosen model keeps
// only the providers that list it (a provider without a model list is not assumed to serve it).
function providersFor(data, by, sel, except) {
  const app = except !== 'app' && sel.app ? data.apps.find((a) => sameApp(a.name, sel.app)) : null;
  return data.providers.filter(
    (p) =>
      (!app || app.labels.includes(p.label)) &&
      (except === 'provider' || !sel.provider || p[by] === sel.provider) &&
      (except === 'model' || !sel.model || p.models.includes(sel.model)),
  );
}

// The options of one field, narrowed by the values chosen in the other fields.
function optionsFor(kind, data, by, sel) {
  const ps = providersFor(data, by, sel, kind);
  if (kind === 'provider') return uniq(ps.map((p) => p[by]));
  if (kind === 'model') return uniq(ps.flatMap((p) => p.models));
  if (!sel.provider && !sel.model) return uniq(data.apps.map((a) => a.name));
  const labels = new Set(ps.map((p) => p.label));
  return uniq(data.apps.filter((a) => a.labels.some((l) => labels.has(l))).map((a) => a.name));
}

// Only values the tenant knows narrow the other fields; typed values (or comma lists) do not.
function knownSelection(data, by, fields, value) {
  const sel = { app: '', provider: '', model: '' };
  for (const f of fields) {
    const v = String(value[f.key] || '').trim();
    if (!v) continue;
    if (f.kind === 'app' && data.apps.some((a) => sameApp(a.name, v))) sel.app = v;
    if (f.kind === 'provider' && data.providers.some((p) => p[by] === v)) sel.provider = v;
    if (f.kind === 'model' && data.providers.some((p) => p.models.includes(v))) sel.model = v;
  }
  return sel;
}

/**
 * Provider, app and model filters as linked dropdowns that narrow each other in any order:
 * pick a provider to see only the apps that use it and the models it serves, or pick an app
 * to see only its providers and their models. A choice that no longer fits is cleared.
 *
 *   value      the form object; onChange receives a patch of changed form keys
 *   fields     [{kind: 'provider'|'app'|'model', key, label, hint, placeholder}] in display
 *              order; key defaults to kind. Default: provider, app, model.
 *   providerBy 'name' (provider type, e.g. openai) or 'label' (shared provider label)
 *
 * Every dropdown also offers "Type a value...". Falls back to text boxes while the options
 * load or when the key cannot list apps or providers.
 */
export function ScopeFilters({ value, onChange, fields: fieldsIn, providerBy = 'name' }) {
  const { data } = useScopeOptions();
  const fields = (fieldsIn || [{ kind: 'provider' }, { kind: 'app' }, { kind: 'model' }]).map((f) => ({
    key: f.kind,
    ...f,
    label: f.label || (f.kind === 'provider' && providerBy === 'label' ? 'Provider label' : KINDS[f.kind].label),
  }));

  if (!data) {
    return fields.map((f) => (
      <Field key={f.key} label={f.label} hint={f.hint}>
        <input value={value[f.key] || ''} onChange={(e) => onChange({ [f.key]: e.target.value })} placeholder={f.placeholder ?? KINDS[f.kind].placeholder} />
      </Field>
    ));
  }

  const sel = knownSelection(data, providerBy, fields, value);
  const change = (field, next) => {
    const patch = { [field.key]: next };
    const nextSel = knownSelection(data, providerBy, fields, { ...value, ...patch });
    for (const other of fields) {
      if (other === field || !nextSel[other.kind]) continue;
      const opts = optionsFor(other.kind, data, providerBy, nextSel);
      const fits = opts.some((o) => (other.kind === 'app' ? sameApp(o, nextSel.app) : o === nextSel[other.kind]));
      if (opts.length && !fits) {
        patch[other.key] = '';
        nextSel[other.kind] = '';
      }
    }
    onChange(patch);
  };

  return fields.map((f) => {
    const by = fields.filter((o) => o !== f && sel[o.kind]).map((o) => KINDS[o.kind].noun);
    const narrowed = by.length ? `Narrowed to the selected ${by.join(' and ')}.` : '';
    const hint = [narrowed, f.hint].filter(Boolean).join(' ') || undefined;
    return (
      <Field key={f.key} label={f.label} hint={hint}>
        <PickOrType
          value={value[f.key] || ''}
          options={optionsFor(f.kind, data, providerBy, sel)}
          onChange={(next) => change(f, next)}
          anyLabel={f.kind === 'provider' && providerBy === 'label' ? 'All provider labels' : KINDS[f.kind].any}
          placeholder={f.placeholder ?? KINDS[f.kind].placeholder}
        />
      </Field>
    );
  });
}

export const idOf = (row, ...keys) => {
  for (const k of keys) if (row && row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
  return undefined;
};

export const when = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const date = typeof value === 'number' ? new Date(value * (value < 1e12 ? 1000 : 1)) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};
