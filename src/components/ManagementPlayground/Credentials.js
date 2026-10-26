import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { appRoute, newIdempotencyKey, seg, versionOf } from './client.mjs';
import {
  ActionButton,
  ApiChips,
  Btn,
  ConnectFirst,
  ErrorBox,
  Field,
  Notice,
  Pager,
  Panel,
  Pill,
  SecretOnce,
  Table,
  fmt,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { AppPicker, when } from './shared';
import styles from './styles.module.css';

const sub = (app, s) => {
  const r = appRoute(app, s);
  return { path: r.path, query: r.query };
};

function toIso(local) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function statusTone(status) {
  return status === 'active' ? 'ok' : status === 'expired' ? 'warn' : 'off';
}

export default function Credentials() {
  const { client, urlParam } = usePlayground();
  if (!client) return <ConnectFirst what="manage gateway keys" />;
  const app = urlParam('app');
  return (
    <div className={styles.stack}>
      <Panel
        title="Gateway credentials"
        subtitle="Named keys that clients use to call an app through the gateway. Secrets are shown once at issue, or on an explicit, audited reveal."
      >
        <AppPicker />
      </Panel>
      {app && <AppKeys key={app} app={app} />}
    </div>
  );
}

function AppKeys({ app }) {
  const { client, confirm } = usePlayground();
  const list = useCollection(
    (cursor) => {
      const r = sub(app, '/keys');
      return client.call({ ...r, query: { ...r.query, limit: 50, cursor }, source: 'Gateway keys' });
    },
    [client, app],
  );
  const [issue, setIssue] = useState({ name: '', expires: '' });
  const [idemKey, setIdemKey] = useState(newIdempotencyKey('issue-key'));
  const [secret, setSecret] = useState(null);
  const [editing, setEditing] = useState(null);
  const [expiry, setExpiry] = useState('');
  const action = useAction();

  async function etagFor(row) {
    if (row.version) return `"${row.version}"`;
    const res = await client.call({ ...sub(app, `/keys/${seg(row.key_id)}`), source: 'Read key version' });
    return versionOf(res);
  }

  async function reveal(row) {
    if (
      !(await confirm({
        title: `Reveal the secret of "${row.name}"?`,
        body: 'The secret is shown in this page once. The reveal is recorded in the audit log. Make sure nobody else can see your screen.',
        confirmLabel: 'Reveal secret',
        tone: 'danger',
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'POST', ...sub(app, `/keys/${seg(row.key_id)}/reveal`), source: 'Reveal key' });
      setSecret({ title: `Secret for ${row.name}`, value: res.key?.secret || res.secret });
      return res;
    });
  }
  async function revoke(row) {
    if (
      !(await confirm({
        title: `Revoke "${row.name}"?`,
        body: 'Clients using this key are rejected from now on. Revocation cannot be undone; issue a new key instead.',
        confirmLabel: 'Revoke key',
        tone: 'danger',
        typeToConfirm: row.name,
      }))
    )
      return;
    await action.run(async () => {
      const etag = await etagFor(row);
      const res = await client.call({ method: 'DELETE', ...sub(app, `/keys/${seg(row.key_id)}`), headers: { 'If-Match': etag }, source: 'Revoke key' });
      list.reload();
      return res;
    }, `Revoked ${row.name}.`);
  }
  async function saveExpiry(row, clear) {
    await action.run(async () => {
      const etag = await etagFor(row);
      const res = await client.call({
        method: 'PATCH',
        ...sub(app, `/keys/${seg(row.key_id)}`),
        body: { expires_at: clear ? null : toIso(expiry) },
        headers: { 'If-Match': etag },
        source: 'Change key expiry',
      });
      setEditing(null);
      list.reload();
      return res;
    }, clear ? 'Expiry cleared.' : 'Expiry updated.');
  }

  return (
    <Panel
      title={`Keys for ${app}`}
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', '/apps/{app_name}/keys'],
              ['POST', '/apps/{app_name}/keys'],
              ['PATCH', '/apps/{app_name}/keys/{key_id}'],
              ['POST', '/apps/{app_name}/keys/{key_id}/reveal'],
              ['DELETE', '/apps/{app_name}/keys/{key_id}'],
            ]}
          />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ErrorBox error={list.error} />
      <SecretOnce secret={secret?.value} title={secret?.title} onDismiss={() => setSecret(null)} />
      <Table
        rows={list.data?.items || []}
        rowKey={(r) => r.key_id}
        empty={list.loading ? 'Loading...' : 'No keys for this app.'}
        columns={[
          { label: 'Name', render: (r) => <strong>{r.name}</strong> },
          { label: 'Status', render: (r) => <Pill tone={statusTone(r.status)}>{fmt(r.status)}</Pill> },
          { label: 'Fingerprint', render: (r) => <code>{fmt(r.fingerprint)}</code> },
          { label: 'Created', render: (r) => when(r.created_at) },
          { label: 'Expires', render: (r) => (r.expires_at ? when(r.expires_at) : 'never') },
          {
            label: 'Actions',
            render: (r) =>
              r.status === 'active' || !r.status ? (
                <span className={styles.inline}>
                  <Btn
                    onClick={() => {
                      setEditing(r.key_id);
                      setExpiry('');
                    }}
                  >
                    Expiry
                  </Btn>
                  <ActionButton method="POST" path="/apps/{app_name}/keys/{key_id}/reveal" scopes={['credentials:read']} onClick={() => reveal(r)}>
                    Reveal
                  </ActionButton>
                  <ActionButton method="DELETE" path="/apps/{app_name}/keys/{key_id}" scopes={['credentials:write']} variant="danger" onClick={() => revoke(r)}>
                    Revoke
                  </ActionButton>
                </span>
              ) : (
                <span className={styles.muted}>No actions</span>
              ),
          },
        ]}
      />
      <Pager list={list} />
      {editing && (
        <div className={styles.subPanel}>
          <h3>Change expiry</h3>
          <div className={styles.inline}>
            <Field label="New expiry (your local time)" hint="Must be in the future. Revoked or expired keys cannot be revived.">
              <input type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </Field>
            <ActionButton
              method="PATCH"
              path="/apps/{app_name}/keys/{key_id}"
              scopes={['credentials:write']}
              variant="primary"
              disabled={!toIso(expiry)}
              onClick={() => saveExpiry(list.data.items.find((k) => k.key_id === editing), false)}
            >
              Save expiry
            </ActionButton>
            <ActionButton
              method="PATCH"
              path="/apps/{app_name}/keys/{key_id}"
              scopes={['credentials:write']}
              onClick={() => saveExpiry(list.data.items.find((k) => k.key_id === editing), true)}
            >
              Never expire
            </ActionButton>
            <Btn onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </div>
      )}
      <div className={styles.subPanel}>
        <h3>Issue a key</h3>
        <div className={styles.inline}>
          <Field label="Name" hint="Unique within the app.">
            <input value={issue.name} onChange={(e) => setIssue({ ...issue, name: e.target.value })} placeholder="Production" />
          </Field>
          <Field label="Expires (optional, local time)">
            <input type="datetime-local" value={issue.expires} onChange={(e) => setIssue({ ...issue, expires: e.target.value })} />
          </Field>
          <ActionButton
            method="POST"
            path="/apps/{app_name}/keys"
            scopes={['credentials:write']}
            variant="primary"
            disabled={!issue.name.trim()}
            onClick={() =>
              action.run(async () => {
                const res = await client.call({
                  method: 'POST',
                  ...sub(app, '/keys'),
                  body: { name: issue.name.trim(), expires_at: toIso(issue.expires) },
                  headers: { 'Idempotency-Key': idemKey },
                  source: 'Issue key',
                });
                setSecret({ title: `New key ${res.key?.name || issue.name}`, value: res.key?.secret });
                setIdemKey(newIdempotencyKey('issue-key'));
                setIssue({ name: '', expires: '' });
                list.reload();
                return res;
              }, 'Key issued.')
            }
          >
            Issue key
          </ActionButton>
        </div>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </Panel>
  );
}
