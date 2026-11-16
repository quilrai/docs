import React, { useEffect, useId, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { newIdempotencyKey, seg } from '../ManagementPlayground/client.mjs';
import { Btn, CopyButton, ErrorBox, Field, KeyValue, Pill, Table, fmt, usePlayground } from '../ManagementPlayground/ui';
import { fetchAllPages, useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX } from './routes.mjs';

// Building blocks shared by the MCP playground workspaces.

// One load of the MCP inventory per connected client, reused by every picker.
const inventoryCache = new WeakMap();
function loadInventory(client) {
  if (!inventoryCache.has(client)) {
    const promise = fetchAllPages((cursor) =>
      client.call({ path: `${MCP_PREFIX}/mcps`, query: { limit: 200, cursor }, source: 'MCP picker' }),
    ).then((res) => res.items);
    promise.catch(() => inventoryCache.delete(client));
    inventoryCache.set(client, promise);
  }
  return inventoryCache.get(client);
}

/** Forgets the cached inventory (after a create, rename or delete). */
export function invalidateInventory(client) {
  if (client) inventoryCache.delete(client);
}

/** Every MCP of the tenant (all pages); data is null until loaded. */
export function useInventory() {
  const { client } = usePlayground();
  return useLoad(() => loadInventory(client), [client], !!client);
}

const STATE_TONES = { ready: 'ok', pending_connection: 'warn', pending_first_client: 'warn', fetch_failed: 'err' };

export function StatePill({ state }) {
  if (!state) return <Pill>unknown</Pill>;
  return <Pill tone={STATE_TONES[state]}>{String(state).replace(/_/g, ' ')}</Pill>;
}

/**
 * Picks one MCP and keeps it in the URL (?mcp=<id>), so every workspace opens on the
 * same MCP. Lists the tenant's MCPs; an id can also be typed.
 */
export function McpPicker({ hint }) {
  const { urlParam, setParam } = usePlayground();
  const inventory = useInventory();
  const selected = urlParam('mcp');
  const [typed, setTyped] = useState('');
  const listId = useId();
  const items = inventory.data || [];
  const known = items.some((m) => m.id === selected);
  return (
    <div className={styles.pickerRow}>
      <Field label="MCP" hint={hint}>
        <select value={known ? selected : ''} onChange={(e) => setParam('mcp', e.target.value)} disabled={!items.length}>
          <option value="">{inventory.loading ? 'Loading MCPs...' : items.length ? 'Select an MCP' : 'No MCPs listed'}</option>
          {items.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.slug || m.id}){m.enabled ? '' : ' - disabled'}
            </option>
          ))}
        </select>
      </Field>
      <form
        className={styles.inline}
        onSubmit={(e) => {
          e.preventDefault();
          if (typed.trim()) setParam('mcp', typed.trim());
        }}
      >
        <Field label="Or MCP id">
          <input list={listId} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={selected || 'a1b2c3d4'} spellCheck="false" />
          <datalist id={listId}>
            {items.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </datalist>
        </Field>
        <Btn type="submit" disabled={!typed.trim()}>
          Open
        </Btn>
      </form>
      <ErrorBox error={inventory.error} />
    </div>
  );
}

/** The name of the selected MCP, from the inventory, for headings. */
export function useMcpName(id) {
  const inventory = useInventory();
  return inventory.data?.find((m) => m.id === id)?.name || id;
}

/** Idempotency-Key for a create: visible, copyable and regenerable. Kept after a failure so a retry is safe. */
export function useIdempotencyKey(prefix) {
  const [key, setKey] = useState(() => newIdempotencyKey(prefix));
  return { key, regenerate: () => setKey(newIdempotencyKey(prefix)) };
}

export function IdempotencyKeyField({ idem }) {
  return (
    <div className={styles.inline}>
      <Field label="Idempotency-Key" hint="Sent with the create. Retrying with the same key within 24 hours returns the original result instead of a duplicate. A new key is made after a success.">
        <input value={idem.key} readOnly spellCheck="false" />
      </Field>
      <CopyButton text={idem.key} />
      <Btn onClick={idem.regenerate}>
        <RefreshCw size={12} aria-hidden /> New key
      </Btn>
    </div>
  );
}

/** Looks up a create operation (GET /operations/{op_id}) and shows its state and stages. */
export function OperationLookup({ initialId = '', compact }) {
  const { client } = usePlayground();
  const [id, setId] = useState(initialId);
  const [query, setQuery] = useState(initialId);
  useEffect(() => {
    setId(initialId);
    setQuery(initialId);
  }, [initialId]);
  const op = useLoad(
    () => client.call({ path: `${MCP_PREFIX}/operations/${seg(query)}`, source: 'Operation lookup' }),
    [client, query],
    !!client && !!query,
  );
  const o = op.data?.operation;
  return (
    <div className={compact ? '' : styles.subPanel}>
      <form
        className={styles.inline}
        onSubmit={(e) => {
          e.preventDefault();
          if (id.trim() === query) op.reload();
          else setQuery(id.trim());
        }}
      >
        <Field label="Operation id" hint="From operation_id in a create response or a 503 operation_pending error. Only the key that started an operation can read it.">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="op_..." spellCheck="false" />
        </Field>
        <Btn type="submit" variant="primary" disabled={!id.trim() || !client} busy={op.loading}>
          <Search size={13} aria-hidden /> Look up
        </Btn>
      </form>
      <ErrorBox error={op.error} />
      {o && (
        <>
          <KeyValue
            items={[
              ['State', <Pill key="s" tone={o.state === 'done' ? 'ok' : o.state === 'pending' ? 'warn' : 'err'}>{o.state}</Pill>],
              ['Operation', <code key="o">{fmt(o.operation)}</code>],
              ['Resource', o.resource_id ? <code key="r">{o.resource_id}</code> : '-'],
              ['HTTP status', fmt(o.status_code)],
              ['Created', when(o.created_at)],
              ['Completed', when(o.completed_at)],
            ]}
          />
          {Array.isArray(o.stages) && o.stages.length > 0 && (
            <Table
              rows={o.stages}
              rowKey={(r) => `${r.stage}-${r.at}`}
              columns={[
                { label: 'Stage', render: (r) => <code>{r.stage}</code> },
                { label: 'At', render: (r) => when(r.at) },
              ]}
            />
          )}
          {o.state === 'pending' && (
            <p className={styles.muted}>Still pending: retry the original request with the same Idempotency-Key to finish it.</p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Error box for writes and creates. Adds the next step for the MCP API's write errors:
 * 412 version_conflict / 428 offer a reload, 503 operation_pending offers a lookup and
 * keeps the Idempotency-Key, 422 install_input_required names the missing values.
 */
export function WriteError({ error, onDismiss, onReload }) {
  const [lookup, setLookup] = useState(false);
  if (!error) return null;
  const err = error.payload?.error || {};
  const operationId = err.operation_id;
  return (
    <div className={styles.stack} style={{ gap: 8 }}>
      <ErrorBox error={error} onDismiss={onDismiss} />
      {(error.status === 412 || error.status === 428) && onReload && (
        <div className={styles.inline}>
          <span className={styles.warnText}>
            {error.status === 412
              ? `Someone changed this MCP since it was read${err.current_version ? ` (now ${err.current_version})` : ''}. Reload, check your change against the new values, and save again.`
              : 'The write was sent without If-Match. Reload to read the current version.'}
          </span>
          <Btn onClick={onReload}>
            <RefreshCw size={12} aria-hidden /> Reload latest version
          </Btn>
        </div>
      )}
      {error.code === 'operation_pending' && (
        <div className={styles.subPanel}>
          <p>
            The create was interrupted after it started. Send it again with the <strong>same Idempotency-Key</strong> (kept below): the
            gateway finishes or cleanly redoes it and never creates a duplicate.
          </p>
          {operationId && (
            <>
              <p className={styles.muted}>
                Operation <code>{operationId}</code> <CopyButton text={operationId} />{' '}
                <button type="button" className={styles.linkBtn} onClick={() => setLookup((v) => !v)}>
                  {lookup ? 'Hide state' : 'Check its state'}
                </button>
              </p>
              {lookup && <OperationLookup initialId={operationId} compact />}
            </>
          )}
        </div>
      )}
      {Array.isArray(err.missing_fields) && err.missing_fields.length > 0 && (
        <p className={styles.warnText}>
          Missing values: {err.missing_fields.map((f) => <code key={f}>{f}</code>).reduce((a, b) => [a, ', ', b])}
        </p>
      )}
    </div>
  );
}

/** Shows a connect link once, with its single-use and 15-minute rules. */
export function ConnectLinkBox({ connect, onDismiss }) {
  if (!connect?.url) return null;
  return (
    <div className={styles.secretBox} role="status">
      <strong>OAuth connect link</strong>
      <p>
        Single use, valid for 15 minutes (until {when(connect.expires_at)}). Whoever opens it signs in with the provider and the connection
        is saved for the administrator who issued the management key. Treat it like a password: share it only with that person, over a
        private channel. This page shows it once and keeps it out of API activity.
      </p>
      <div className={styles.secretRow}>
        <code>{connect.url}</code>
        <CopyButton text={connect.url} />
      </div>
      <Btn onClick={onDismiss}>Hide the link</Btn>
    </div>
  );
}

/** Warnings arrays ({code, message}) from creates, settings and tools. */
export function Warnings({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <ul className={styles.bullets}>
      {items.map((w, i) => (
        <li key={i}>
          <Pill tone="warn">{w.code || 'warning'}</Pill> {w.message || fmt(w)}
        </li>
      ))}
    </ul>
  );
}

/** Opens another workspace on the same MCP. */
export function GoTo({ tab, mcp, children }) {
  const { navigate } = usePlayground();
  return (
    <button type="button" className={styles.linkBtn} onClick={() => navigate(tab, { mcp })}>
      {children}
    </button>
  );
}
