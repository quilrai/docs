import React, { useState } from 'react';
import { Braces, Trash2, X } from 'lucide-react';
import { curlForActivity, matchOperation } from './spec.mjs';
import { CopyButton, JsonView, MethodBadge, shortPath, usePlayground } from './ui';
import styles from './styles.module.css';

function statusTone(status) {
  if (!status) return styles.status_err;
  if (status < 300) return styles.status_ok;
  if (status < 500) return styles.status_warn;
  return styles.status_err;
}

function queryObject(search) {
  const out = {};
  for (const [k, v] of new URLSearchParams(search)) {
    if (k in out) out[k] = [].concat(out[k], v);
    else out[k] = v;
  }
  return out;
}

export default function ActivityPanel({ entries, onClear, onClose }) {
  const { index, openExplorer } = usePlayground();
  const [openId, setOpenId] = useState(null);

  function openInExplorer(entry) {
    const [pathname, search = ''] = entry.path.split('?');
    const match = matchOperation(index, entry.method, pathname);
    if (!match) return;
    const headers = {};
    for (const [k, v] of Object.entries(entry.requestHeaders || {})) {
      if (/^if-match$/i.test(k)) headers['If-Match'] = v;
    }
    openExplorer({
      opId: match.op.id,
      pathParams: match.pathParams,
      query: queryObject(search),
      headers,
      body:
        entry.requestBody === null || entry.requestBody === undefined
          ? undefined
          : typeof entry.requestBody === 'string'
            ? entry.requestBody
            : JSON.stringify(entry.requestBody, null, 2),
    });
  }

  return (
    <aside className={styles.activity} id="mgmt-activity" aria-label="API activity">
      <header className={styles.activityHeader}>
        <div>
          <strong>API activity</strong>
          <small>Every call this page made, newest first. Kept in memory only.</small>
        </div>
        <div className={styles.activityTools}>
          <button type="button" className={styles.iconBtn} onClick={onClear} title="Clear activity" aria-label="Clear activity">
            <Trash2 size={14} />
          </button>
          <button type="button" className={styles.iconBtn} onClick={onClose} title="Hide activity" aria-label="Hide activity">
            <X size={14} />
          </button>
        </div>
      </header>
      {!entries.length && (
        <p className={styles.activityEmpty}>
          Calls appear here as you use the workspaces. Each one can be reopened in the API Explorer or copied as cURL.
        </p>
      )}
      <ol className={styles.activityList}>
        {entries.map((entry) => {
          const open = openId === entry.id;
          const [pathname] = entry.path.split('?');
          const matched = matchOperation(index, entry.method, pathname);
          return (
            <li key={entry.id} className={open ? styles.activityOpen : ''}>
              <button
                type="button"
                className={styles.activityRow}
                onClick={() => setOpenId(open ? null : entry.id)}
                aria-expanded={open}
              >
                <MethodBadge method={entry.method} small />
                <span className={styles.activityPath} title={entry.path}>
                  {shortPath(entry.path)}
                </span>
                <span className={`${styles.statusCode} ${statusTone(entry.status)}`}>{entry.status || 'ERR'}</span>
                <span className={styles.latency}>{entry.latencyMs} ms</span>
              </button>
              {open && (
                <div className={styles.activityDetail}>
                  <p className={styles.muted}>
                    {matched ? matched.op.summary : 'Unlisted route'}
                    {entry.source ? ` - from ${entry.source}` : ''} - {new Date(entry.at).toLocaleTimeString()}
                    {entry.tokenKind === 'admin' ? ' - tenant-admin token' : ''}
                  </p>
                  <div className={styles.activityActions}>
                    {matched && (
                      <button type="button" className={styles.copyBtn} onClick={() => openInExplorer(entry)}>
                        <Braces size={12} aria-hidden /> Open in explorer
                      </button>
                    )}
                    <CopyButton text={() => curlForActivity(entry)} label="Copy as cURL" />
                  </div>
                  {entry.error && <p className={styles.errorText}>{entry.error}</p>}
                  {entry.requestBody !== null && entry.requestBody !== undefined && (
                    <details open>
                      <summary>Request body</summary>
                      <JsonView value={entry.requestBody} maxHeight={220} />
                    </details>
                  )}
                  {Object.keys(entry.requestHeaders || {}).length > 0 && (
                    <details>
                      <summary>Request headers</summary>
                      <JsonView
                        value={{
                          Authorization: entry.tokenKind === 'admin' ? 'Bearer <tenant-admin-jwt>' : 'Bearer <management-key>',
                          ...entry.requestHeaders,
                        }}
                      />
                    </details>
                  )}
                  {entry.response !== undefined && (
                    <details open>
                      <summary>Response</summary>
                      <JsonView value={entry.response} maxHeight={320} />
                    </details>
                  )}
                  {entry.responseHeaders && (
                    <details>
                      <summary>Response headers</summary>
                      <JsonView value={entry.responseHeaders} />
                    </details>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
