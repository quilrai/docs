import React, { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import {
  ApiChips,
  Btn,
  ConnectFirst,
  ErrorBox,
  Field,
  JsonView,
  KeyValue,
  Pager,
  Panel,
  Pill,
  Table,
  fmt,
  useCollection,
  usePlayground,
} from '../ManagementPlayground/ui';
import { useDetailReveal, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX } from './routes.mjs';
import { GoTo } from './common';

const BLANK = { actor: '', action: '', resource_type: '', resource_id: '', via: '', since: '', until: '', limit: '50' };

// datetime-local value (local time) -> RFC 3339 with Z, as the API requires a timezone.
const toRfc3339 = (local) => {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

export default function Audit() {
  const { client, urlParam } = usePlayground();
  const [filters, setFilters] = useState(() => ({ ...BLANK, resource_id: urlParam('mcp') }));
  const [applied, setApplied] = useState(filters);
  const [open, setOpen] = useState(null);
  const detailRef = useDetailReveal(open?.event_id);
  const list = useCollection(
    (cursor) =>
      client.call({
        path: `${MCP_PREFIX}/audit`,
        query: { ...applied, since: toRfc3339(applied.since), until: toRfc3339(applied.until), cursor },
        source: 'Audit',
      }),
    [client, JSON.stringify(applied)],
    !!client,
  );
  if (!client) return <ConnectFirst what="read the audit trail" />;
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const rows = list.data?.items || [];
  return (
    <div className={styles.stack}>
      <Panel
        title="Audit"
        subtitle="Configuration changes made in the console and through this API, newest first. Events record what changed (changed_fields), never before or after values. Pages follow next_cursor; 409 collection_changed means start again from the newest."
        actions={
          <>
            <ApiChips calls={[['GET', '/audit']]} />
            <Btn onClick={list.first}>
              <RefreshCw size={13} aria-hidden /> Newest
            </Btn>
          </>
        }
      >
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(filters);
          }}
        >
          <Field label="Actor email">
            <input value={filters.actor} onChange={(e) => set({ actor: e.target.value })} placeholder="admin@example.com" />
          </Field>
          <Field label="Action" hint="Exact, for example management_key_created.">
            <input value={filters.action} onChange={(e) => set({ action: e.target.value })} />
          </Field>
          <Field label="Resource type">
            <input value={filters.resource_type} onChange={(e) => set({ resource_type: e.target.value })} />
          </Field>
          <Field label="Resource id" hint="For example an MCP id.">
            <input value={filters.resource_id} onChange={(e) => set({ resource_id: e.target.value })} spellCheck="false" />
          </Field>
          <Field label="Made through">
            <select value={filters.via} onChange={(e) => set({ via: e.target.value })}>
              <option value="">Console and API</option>
              <option value="ui">Console (ui)</option>
              <option value="management_api">Management API</option>
            </select>
          </Field>
          <Field label="Since" hint="Inclusive, your local time.">
            <input type="datetime-local" value={filters.since} onChange={(e) => set({ since: e.target.value })} />
          </Field>
          <Field label="Until" hint="Exclusive.">
            <input type="datetime-local" value={filters.until} onChange={(e) => set({ until: e.target.value })} />
          </Field>
          <Field label="Page size">
            <select value={filters.limit} onChange={(e) => set({ limit: e.target.value })}>
              {['25', '50', '100', '200'].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Btn type="submit" variant="primary">
            Apply filters
          </Btn>
          <Btn
            onClick={() => {
              setFilters(BLANK);
              setApplied(BLANK);
            }}
          >
            Clear
          </Btn>
        </form>
        <ErrorBox error={list.error} />
        {list.error?.code === 'collection_changed' && (
          <Btn onClick={list.first}>Start again from the newest</Btn>
        )}
        <div className={`${styles.split} ${styles.masterDetail}`}>
          <div>
            <Table
              rows={rows}
              rowKey={(r) => r.event_id}
              selected={open?.event_id}
              onRowClick={(r) => setOpen(r)}
              empty={list.loading ? 'Loading...' : 'No audit events match.'}
              columns={[
                { label: 'When', render: (r) => <span className={styles.nowrap}>{when(r.created_at)}</span> },
                { label: 'Action', render: (r) => <code>{r.action}</code> },
                { label: 'Resource', render: (r) => `${r.resource_name || r.resource_id} (${r.resource_type})` },
                { label: 'Via', render: (r) => <Pill tone={r.via === 'management_api' ? 'warn' : undefined}>{r.via === 'management_api' ? 'API' : 'console'}</Pill> },
                { label: 'Actor', render: (r) => fmt(r.actor_email) },
                { label: 'Result', render: (r) => (r.result ? <Pill tone={/fail|error|denied/i.test(r.result) ? 'err' : 'ok'}>{r.result}</Pill> : '-') },
              ]}
            />
            <Pager list={list} />
          </div>
          <div ref={detailRef}>
            {open ? (
              <div className={styles.subPanel}>
                <div className={styles.cardHead}>
                  <h3>
                    <code>{open.action}</code>
                  </h3>
                  <button type="button" className={styles.iconBtn} onClick={() => setOpen(null)} aria-label="Close event" title="Close">
                    <X size={14} />
                  </button>
                </div>
                <KeyValue
                  items={[
                    ['When', when(open.created_at)],
                    ['Resource', `${open.resource_type} ${open.resource_name || ''}`],
                    [
                      'Resource id',
                      /^mcp/i.test(open.resource_type || '') ? (
                        <GoTo key="r" tab="mcps" mcp={open.resource_id}>
                          {open.resource_id}
                        </GoTo>
                      ) : (
                        <code key="r">{open.resource_id}</code>
                      ),
                    ],
                    ['Changed fields', (open.changed_fields || []).join(', ') || '-'],
                    ['Actor', `${fmt(open.actor_email)}${open.actor_role ? ` (${open.actor_role})` : ''}`],
                    ['Via', open.via],
                    ['Management key', open.management_key_id ? <code key="k">{open.management_key_id}</code> : '-'],
                    ['Operation', open.operation_id ? <code key="o">{open.operation_id}</code> : '-'],
                    ['Request id', open.request_id ? <code key="q">{open.request_id}</code> : '-'],
                  ]}
                />
                <details>
                  <summary>Raw event</summary>
                  <JsonView value={open} />
                </details>
              </div>
            ) : (
              <p className={styles.muted}>Select an event to see its details.</p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
