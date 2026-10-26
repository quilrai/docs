import React, { useEffect, useId, useState } from 'react';
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

export const idOf = (row, ...keys) => {
  for (const k of keys) if (row && row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
  return undefined;
};

export const when = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const date = typeof value === 'number' ? new Date(value * (value < 1e12 ? 1000 : 1)) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};
