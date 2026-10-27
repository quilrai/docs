import React, { useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2, Zap } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { findOperation } from './spec.mjs';
import {
  ApiChips,
  Btn,
  ErrorBox,
  Field,
  JsonView,
  KeyValue,
  Pager,
  Panel,
  Pill,
  Table,
  fmt,
  pretty,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { useLoad } from './shared';
import styles from './styles.module.css';

// Fields a read returns that a write does not take (or recomputes). They are
// left out of the body a "Replace" opens in the explorer.
const READ_ONLY_FIELDS = [
  'etag',
  'id',
  'source',
  'priority',
  'rank_source',
  'rule_index',
  'rule_indexes',
  'shadowed_by',
  'historical',
  'view',
  'policy',
  'references',
  'quota_id',
  'kind',
  'read_only',
  'enabled',
  'candidate_scope',
];

export function editableBody(resource) {
  if (!resource || typeof resource !== 'object') return {};
  return Object.fromEntries(Object.entries(resource).filter(([k]) => !READ_ONLY_FIELDS.includes(k)));
}

export const isConsoleRow = (row) => row && (row.source === 'console' || String(row.id || '').startsWith('console:'));

/** Opens one operation of the spec in the explorer with the given inputs. */
export function useOpen() {
  const { index, openExplorer } = usePlayground();
  return (method, path, { pathParams, query, headers, body } = {}) => {
    const op = findOperation(index, method, MANAGEMENT_PREFIX + path);
    if (!op) return false;
    openExplorer({
      opId: op.id,
      pathParams,
      query,
      headers,
      body: body === undefined ? undefined : pretty(body),
    });
    return true;
  };
}

/** Compact one-line description of a scope object. */
export function scopeText(scope) {
  if (!scope || typeof scope !== 'object') return 'Everyone';
  const parts = Object.entries(scope)
    .filter(([, v]) => Array.isArray(v) && v.length)
    .map(([k, v]) => `${k}: ${v.join(', ')}`);
  return parts.length ? parts.join('; ') : 'Everyone';
}

const FILTERS = [
  ['source', 'Source', 'managed or console'],
  ['app', 'App', 'Rows that can apply to this app'],
  ['requested_model', 'Requested model', 'Rows that can apply to this model'],
  ['mode', 'Mode', 'routes: active, observe, disabled; limits: enforce, alert, paused'],
  ['references', 'References', 'provider_label or provider_label/model'],
];

/**
 * One managed-controls collection: filtered list, a detail read, and writes
 * that open in the API explorer with the ETag and a dry run already set.
 *
 * config: { title, subtitle, path, columns, routing, quickOps(resource) => [[label, method, suffix, body]] }
 */
export function ControlCollection({ config, extra }) {
  const { client } = usePlayground();
  const open = useOpen();
  const [draft, setDraft] = useState({});
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);
  const action = useAction();
  const list = useCollection(
    (cursor) =>
      client.call({ path: MANAGEMENT_PREFIX + config.path, query: { limit: 100, cursor, ...filters }, source: config.title }),
    [client, config.path, JSON.stringify(filters)],
  );
  const item = `${config.path}/{resource_id}`;
  // Routing writes take repin; every write previews with dry_run first.
  const writeQuery = config.routing ? { dry_run: 'true', repin: 'keep' } : { dry_run: 'true' };

  async function read(id) {
    await action.run(async () => {
      const res = await client.call({ path: `${MANAGEMENT_PREFIX}${config.path}/${seg(id)}`, source: `${config.title} detail` });
      setSelected({ id, data: res });
      return res;
    });
  }

  const resource = selected?.data?.resource;
  const etag = selected?.data?.etag || resource?.etag;
  const readOnly = isConsoleRow(resource) || isConsoleRow({ id: selected?.id });

  return (
    <Panel
      title={config.title}
      subtitle={config.subtitle}
      actions={
        <>
          <ApiChips calls={[['GET', config.path], ['GET', item], ['PUT', item], ['PATCH', item], ['DELETE', item]]} />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
          <Btn
            variant="primary"
            onClick={() => open('PUT', item, { pathParams: { resource_id: '' }, query: writeQuery, headers: { 'If-None-Match': '*' } })}
          >
            <Plus size={13} aria-hidden /> New
          </Btn>
        </>
      }
    >
      <form
        className={styles.formGrid}
        onSubmit={(e) => {
          e.preventDefault();
          setFilters(Object.fromEntries(Object.entries(draft).filter(([, v]) => String(v || '').trim())));
        }}
      >
        {FILTERS.map(([name, label, hint]) => (
          <Field key={name} label={label} hint={hint}>
            <input value={draft[name] || ''} onChange={(e) => setDraft((d) => ({ ...d, [name]: e.target.value }))} spellCheck="false" />
          </Field>
        ))}
        <div className={styles.inline}>
          <Btn type="submit">Apply filters</Btn>
          <Btn
            onClick={() => {
              setDraft({});
              setFilters({});
            }}
          >
            Clear
          </Btn>
        </div>
      </form>
      <ErrorBox error={list.error} />
      {list.data?.revision != null && (
        <p className={styles.muted}>
          Revision {list.data.revision}
          {list.data.etag ? (
            <>
              {' '}
              · collection ETag <code>{list.data.etag}</code>
            </>
          ) : null}
        </p>
      )}
      <div className={styles.split}>
        <div>
          <Table
            rows={list.data?.items || []}
            rowKey={(r) => r.id}
            selected={selected?.id}
            onRowClick={(r) => read(r.id)}
            empty={list.loading ? 'Loading...' : 'No controls here yet. Use New to create one.'}
            columns={[
              { label: 'Id', render: (r) => <code>{fmt(r.id)}</code> },
              { label: 'Source', render: (r) => <Pill tone={isConsoleRow(r) ? 'off' : 'ok'}>{isConsoleRow(r) ? 'console' : 'managed'}</Pill> },
              ...config.columns,
            ]}
          />
          <Pager list={list} />
        </div>
        <div>
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          {selected ? (
            <>
              <div className={styles.cardHead}>
                <h3>
                  <code>{selected.id}</code>
                </h3>
                {readOnly && <Pill tone="off">Console rule, read only</Pill>}
              </div>
              <KeyValue items={[['ETag', etag ? <code>{etag}</code> : '-'], ['Revision', fmt(selected.data?.revision)]]} />
              {!readOnly && (
                <div className={styles.inline}>
                  <Btn
                    onClick={() =>
                      open('PUT', item, {
                        pathParams: { resource_id: selected.id },
                        query: writeQuery,
                        headers: { 'If-Match': etag },
                        body: editableBody(resource),
                      })
                    }
                  >
                    <Pencil size={13} aria-hidden /> Replace (dry run)
                  </Btn>
                  {(config.quickOps?.(resource) || []).map(([label, method, suffix, body]) => (
                    <Btn
                      key={label}
                      onClick={() =>
                        open(method, `${item}${suffix}`, {
                          pathParams: { resource_id: selected.id },
                          query: writeQuery,
                          headers: { 'If-Match': etag },
                          body,
                        })
                      }
                    >
                      <Zap size={13} aria-hidden /> {label}
                    </Btn>
                  ))}
                  <Btn
                    variant="danger"
                    onClick={() =>
                      open('DELETE', item, { pathParams: { resource_id: selected.id }, query: writeQuery, headers: { 'If-Match': etag } })
                    }
                  >
                    <Trash2 size={13} aria-hidden /> Delete (dry run)
                  </Btn>
                </div>
              )}
              <p className={styles.muted}>
                Writes open in the API explorer with the ETag and <code>dry_run=true</code> set. Send once to see the diff
                and impact, then set <code>dry_run</code> to false to publish.
              </p>
              {extra && extra(selected.id, resource)}
              <JsonView value={selected.data} maxHeight={520} />
            </>
          ) : (
            <p className={styles.muted}>Select a row to read it with its ETag.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

/** A singleton control such as the failover default (GET / PUT / DELETE = reset). */
export function ControlSingleton({ title, subtitle, path }) {
  const { client } = usePlayground();
  const open = useOpen();
  const current = useLoad(() => client.call({ path: MANAGEMENT_PREFIX + path, source: title }), [client, path]);
  const resource = current.data?.resource;
  const etag = current.data?.etag || resource?.etag;
  const query = { dry_run: 'true', repin: 'keep' };
  return (
    <Panel
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <ApiChips calls={[['GET', path], ['PUT', path], ['DELETE', path]]} />
          <Btn onClick={current.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ErrorBox error={current.error} />
      {current.data && (
        <>
          <KeyValue
            items={[
              ['State', resource ? <Pill tone="ok">Set</Pill> : <Pill tone="off">Built-in default applies</Pill>],
              ['ETag', etag ? <code>{etag}</code> : '-'],
            ]}
          />
          <div className={styles.inline}>
            <Btn
              variant="primary"
              onClick={() =>
                open('PUT', path, {
                  query,
                  headers: resource ? { 'If-Match': etag } : { 'If-None-Match': '*' },
                  body: resource ? editableBody(resource) : undefined,
                })
              }
            >
              <Pencil size={13} aria-hidden /> {resource ? 'Replace (dry run)' : 'Set (dry run)'}
            </Btn>
            {resource && (
              <Btn variant="danger" onClick={() => open('DELETE', path, { query, headers: { 'If-Match': etag } })}>
                <Trash2 size={13} aria-hidden /> Reset to built-in (dry run)
              </Btn>
            )}
          </div>
          <JsonView value={current.data} maxHeight={420} />
        </>
      )}
    </Panel>
  );
}

/** A small GET form whose answer is shown as JSON plus an optional summary. */
export function LookupForm({ title, subtitle, path, fields, calls, summary, source }) {
  const { client } = usePlayground();
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const action = useAction();
  return (
    <Panel title={title} subtitle={subtitle} actions={<ApiChips calls={calls || [['GET', path]]} />}>
      <form
        className={styles.formGrid}
        onSubmit={(e) => {
          e.preventDefault();
          action.run(async () => {
            const query = Object.fromEntries(Object.entries(values).filter(([, v]) => String(v || '').trim()));
            const res = await client.call({ path: MANAGEMENT_PREFIX + path, query, source: source || title });
            setResult(res);
            return res;
          });
        }}
      >
        {fields.map(([name, label, hint, options]) => (
          <Field key={name} label={label} hint={hint}>
            {options ? (
              <select value={values[name] || ''} onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}>
                <option value="">(not set)</option>
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input value={values[name] || ''} onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))} spellCheck="false" />
            )}
          </Field>
        ))}
        <div className={styles.inline}>
          <Btn type="submit" variant="primary">
            Run
          </Btn>
        </div>
      </form>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      {result && (
        <>
          {summary && summary(result)}
          <JsonView value={result} maxHeight={520} />
        </>
      )}
    </Panel>
  );
}
