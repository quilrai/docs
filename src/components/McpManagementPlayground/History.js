import React, { useMemo, useState } from 'react';
import { Braces, Trash2 } from 'lucide-react';
import { activityPreset } from '../ManagementPlayground/ActivityPanel';
import { curlForActivity, matchOperation } from '../ManagementPlayground/spec.mjs';
import { ApiChips, Btn, CopyButton, Field, JsonView, MethodBadge, Panel, Pill, Table, shortPath, usePlayground } from '../ManagementPlayground/ui';
import styles from '../ManagementPlayground/styles.module.css';
import { OperationLookup } from './common';

// History: every request this page sent in this session (the same in-memory,
// redacted entries as the API activity panel), plus create-operation lookup.

const tone = (status) => (!status ? 'err' : status < 300 ? 'ok' : status < 500 ? 'warn' : 'err');

export default function History() {
  const { activity, clearActivity, index, openExplorer, product, client } = usePlayground();
  const [filter, setFilter] = useState('');
  const [failedOnly, setFailedOnly] = useState(false);
  const [openId, setOpenId] = useState(null);
  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return activity.filter(
      (e) => (!failedOnly || !e.status || e.status >= 400) && (!q || `${e.method} ${e.path} ${e.source || ''} ${e.status}`.toLowerCase().includes(q)),
    );
  }, [activity, filter, failedOnly]);
  const open = activity.find((e) => e.id === openId);
  const matched = open ? matchOperation(index, open.method, open.path.split('?')[0]) : null;
  return (
    <div className={styles.stack}>
      <Panel
        title="Request history"
        subtitle="Every call this page sent in this browser tab, newest first (up to 200). Kept in memory only: it is gone when you leave the page. Credentials, extra header values, URL query strings and connect links are masked."
        actions={
          <Btn onClick={clearActivity} disabled={!activity.length}>
            <Trash2 size={13} aria-hidden /> Clear
          </Btn>
        }
      >
        <div className={styles.filters}>
          <Field label="Filter">
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="settings, PATCH, 412..." />
          </Field>
          <Field label="Status">
            <select value={failedOnly ? 'failed' : ''} onChange={(e) => setFailedOnly(e.target.value === 'failed')}>
              <option value="">All</option>
              <option value="failed">Failed only</option>
            </select>
          </Field>
        </div>
        <div className={`${styles.split} ${styles.masterDetail}`}>
          <div>
            <Table
              rows={rows}
              rowKey={(e) => e.id}
              selected={openId}
              onRowClick={(e) => setOpenId(e.id)}
              empty={activity.length ? 'No requests match.' : 'Requests appear here as you use the workspaces.'}
              columns={[
                { label: 'Time', render: (e) => <span className={styles.nowrap}>{new Date(e.at).toLocaleTimeString()}</span> },
                {
                  label: 'Request',
                  render: (e) => (
                    <span className={styles.nowrap}>
                      <MethodBadge method={e.method} small /> <code>{shortPath(e.path, product)}</code>
                    </span>
                  ),
                },
                { label: 'Status', render: (e) => <Pill tone={tone(e.status)}>{e.status || 'ERR'}</Pill> },
                { label: 'Latency', render: (e) => <span className={styles.num}>{e.latencyMs} ms</span> },
                { label: 'From', render: (e) => e.source || '-' },
              ]}
            />
          </div>
          <div>
            {open ? (
              <div className={styles.subPanel}>
                <div className={styles.cardHead}>
                  <h3>{matched ? matched.op.summary : 'Unlisted route'}</h3>
                  {matched && (
                    <button type="button" className={styles.copyBtn} onClick={() => openExplorer(activityPreset(index, open))}>
                      <Braces size={12} aria-hidden /> Open in explorer
                    </button>
                  )}
                  <CopyButton text={() => curlForActivity(open, product.envNames)} label="Copy as cURL" />
                </div>
                <p className={styles.muted}>
                  <code>
                    {open.method} {open.origin}
                    {open.path}
                  </code>
                </p>
                {open.error && <p className={styles.errorText}>{open.error}</p>}
                {open.requestBody != null && (
                  <details open>
                    <summary>Request body</summary>
                    <JsonView value={open.requestBody} maxHeight={240} />
                  </details>
                )}
                <details>
                  <summary>Request headers</summary>
                  <JsonView value={{ Authorization: 'Bearer <management-key>', ...open.requestHeaders }} />
                </details>
                {open.response !== undefined && (
                  <details open>
                    <summary>Response</summary>
                    <JsonView value={open.response} maxHeight={360} />
                  </details>
                )}
                {open.responseHeaders && (
                  <details>
                    <summary>Response headers</summary>
                    <JsonView value={open.responseHeaders} />
                  </details>
                )}
              </div>
            ) : (
              <p className={styles.muted}>Select a request to see what was sent and received.</p>
            )}
          </div>
        </div>
      </Panel>
      {client && (
        <Panel
          title="Create operations"
          subtitle="Look up a create by its operation_id (from a create response or a 503 operation_pending error)."
          actions={<ApiChips calls={[['GET', '/operations/{op_id}']]} />}
        >
          <OperationLookup />
        </Panel>
      )}
    </div>
  );
}
