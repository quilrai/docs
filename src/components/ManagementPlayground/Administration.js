import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { ADMIN_PREFIX, newIdempotencyKey, seg, versionOf } from './client.mjs';
import {
  ApiChips,
  Btn,
  Checkbox,
  ErrorBox,
  Field,
  JsonView,
  Notice,
  Panel,
  Pill,
  SecretOnce,
  Table,
  fmt,
  useAction,
  usePlayground,
} from './ui';
import { fetchAllPages, useLoad, when } from './shared';
import { SCOPES } from './Overview';
import styles from './styles.module.css';

const A = ADMIN_PREFIX;

function toIso(local) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function Administration() {
  const { adminSession, acceptAdminToken, forgetAdminToken, tenantId, adminBase, adminClient } = usePlayground();
  const [tokenDraft, setTokenDraft] = useState('');
  const [tenantDraft, setTenantDraft] = useState(tenantId);
  // A destination change forgets the accepted token (index.js) and the draft,
  // so the token is only ever sent where the user clicked "Use token".
  const lastBase = useRef(adminBase);
  useEffect(() => {
    if (lastBase.current !== adminBase) setTokenDraft('');
    lastBase.current = adminBase;
  }, [adminBase]);
  const ready = adminClient && tenantId;
  return (
    <div className={styles.stack}>
      <Panel
        title="Tenant administration"
        subtitle="Turn management on for a tenant and issue management keys. These calls use a tenant-admin token from your QuilrAI console sign-in, not a management key, so you can bootstrap access before any key exists."
      >
        <ul className={styles.bullets}>
          <li>
            The token must be a verified QuilrAI sign-in token that identifies you and lists the tenant in its tenantIds.
            Paste it from your console session; this page keeps it in memory only and never stores it.
          </li>
          <li>
            The token is sent only to the destination shown below when you click Use token. Changing the region or URL,
            or disconnecting, forgets it.
          </li>
          <li>Management is off for a tenant until you enable it here. Suspending it keeps keys, and re-enabling restores them.</li>
          <li>Management keys start with qlmgmt_ and are shown once when issued.</li>
        </ul>
        <form
          className={styles.formGrid}
          onSubmit={(e) => {
            e.preventDefault();
            acceptAdminToken(tokenDraft.trim(), tenantDraft.trim());
            setTokenDraft('');
          }}
        >
          <Field label="Tenant-admin token">
            <input type="password" autoComplete="off" spellCheck="false" value={tokenDraft} onChange={(e) => setTokenDraft(e.target.value)} placeholder="eyJ..." />
          </Field>
          <Field label="Tenant id">
            <input value={tenantDraft} onChange={(e) => setTenantDraft(e.target.value)} spellCheck="false" />
          </Field>
          <div className={styles.actionsRow}>
            <Btn type="submit" variant="primary" disabled={!tokenDraft.trim() || !tenantDraft.trim() || !adminBase}>
              <ShieldCheck size={14} aria-hidden /> Use token
            </Btn>
            {adminSession && (
              <Btn
                onClick={() => {
                  forgetAdminToken();
                  setTokenDraft('');
                }}
              >
                Forget token
              </Btn>
            )}
            {adminBase && (
              <small className={styles.muted}>
                {adminSession ? 'Token in use for ' : 'Use token sends it to '}
                <code>{adminSession?.base || adminBase}</code>
              </small>
            )}
          </div>
        </form>
        {!adminBase && <Notice tone="warn">Choose a region or enter a custom URL in the connection bar first.</Notice>}
      </Panel>
      {ready && <TenantSettings key={`${tenantId}-${adminSession.id}`} />}
      {ready && <ManagementKeys key={`k-${tenantId}-${adminSession.id}`} />}
    </div>
  );
}

function TenantSettings() {
  const { adminClient, tenantId, confirm } = usePlayground();
  const path = `${A}/tenants/${seg(tenantId)}/settings`;
  const settings = useLoad(() => adminClient.call({ path, source: 'Tenant settings' }), [adminClient, tenantId]);
  const action = useAction();
  const data = settings.data?.settings || settings.data;
  const enabled = data?.enabled;
  async function toggle(next) {
    if (
      !next &&
      !(await confirm({
        title: 'Suspend management for this tenant?',
        body: 'Every management key stops working until management is enabled again. Keys are not revoked.',
        confirmLabel: 'Suspend',
        tone: 'danger',
      }))
    )
      return;
    await action.run(async () => {
      const res = await adminClient.call({ method: 'PATCH', path, body: { enabled: next }, headers: { 'If-Match': settings.data?._meta?.etag || versionOf(settings.data) }, source: next ? 'Enable management' : 'Suspend management' });
      settings.reload();
      return res;
    }, next ? 'Management enabled.' : 'Management suspended.');
  }
  return (
    <Panel
      title="Management access"
      actions={
        <>
          <ApiChips calls={[['GET', `${A}/tenants/{tenant_id}/settings`], ['PATCH', `${A}/tenants/{tenant_id}/settings`]]} />
          <Btn onClick={settings.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={settings.error} />
      {data && (
        <div className={styles.inline}>
          <Pill tone={enabled ? 'ok' : 'off'}>{enabled ? 'Management enabled' : 'Management off'}</Pill>
          {enabled ? (
            <Btn variant="danger" onClick={() => toggle(false)}>
              Suspend
            </Btn>
          ) : (
            <Btn variant="primary" onClick={() => toggle(true)}>
              Enable management
            </Btn>
          )}
        </div>
      )}
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {data && (
        <details>
          <summary>Raw settings</summary>
          <JsonView value={settings.data} />
        </details>
      )}
    </Panel>
  );
}

function ScopePicker({ value, onChange }) {
  return (
    <fieldset className={styles.paramSet}>
      <legend>Scopes</legend>
      <div className={styles.checkGrid}>
        {SCOPES.map(([s, text]) => (
          <Checkbox
            key={s}
            label={
              <span title={text}>
                <code>{s}</code>
              </span>
            }
            checked={value.includes(s)}
            onChange={(on) => onChange(on ? [...value, s] : value.filter((x) => x !== s))}
          />
        ))}
      </div>
    </fieldset>
  );
}

function ManagementKeys() {
  const { adminClient, tenantId, confirm } = usePlayground();
  const base = `${A}/tenants/${seg(tenantId)}/keys`;
  const list = useLoad(
    () => fetchAllPages((cursor) => adminClient.call({ path: base, query: { limit: 200, cursor }, source: 'Management keys' })),
    [adminClient, tenantId],
  );
  const [form, setForm] = useState({ name: '', scopes: ['read'], expires: '' });
  const [idemKey, setIdemKey] = useState(newIdempotencyKey('issue-mgmt-key'));
  const [secret, setSecret] = useState(null);
  const [editing, setEditing] = useState(null);
  const action = useAction();
  const rows = list.data?.items || list.data?.keys || [];
  const etagOf = (row) => (row.version ? `"${row.version}"` : row.etag || null);

  async function revoke(row) {
    if (
      !(await confirm({
        title: `Revoke management key "${row.name}"?`,
        body: 'Automation using this key stops working once the revocation takes effect. Revoked keys cannot be restored.',
        confirmLabel: 'Revoke key',
        tone: 'danger',
        typeToConfirm: row.name,
      }))
    )
      return;
    await action.run(async () => {
      const res = await adminClient.call({ method: 'DELETE', path: `${base}/${seg(row.key_id)}`, headers: { 'If-Match': etagOf(row) }, source: 'Revoke management key' });
      list.reload();
      return res;
    }, `Revoked ${row.name}.`);
  }

  return (
    <Panel
      title="Management keys"
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', `${A}/tenants/{tenant_id}/keys`],
              ['POST', `${A}/tenants/{tenant_id}/keys`],
              ['PATCH', `${A}/tenants/{tenant_id}/keys/{key_id}`],
              ['DELETE', `${A}/tenants/{tenant_id}/keys/{key_id}`],
            ]}
          />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ErrorBox error={list.error} />
      <SecretOnce secret={secret} title="New management key" onDismiss={() => setSecret(null)} />
      <Table
        rows={rows}
        rowKey={(r) => r.key_id}
        empty={list.loading ? 'Loading...' : 'No management keys yet.'}
        columns={[
          { label: 'Name', render: (r) => <strong>{r.name}</strong> },
          { label: 'Scopes', render: (r) => (r.scopes || []).map((s) => <code key={s} className={styles.scopeCode}>{s}</code>) },
          { label: 'Status', render: (r) => <Pill tone={r.status === 'active' || !r.status ? 'ok' : 'off'}>{fmt(r.status || 'active')}</Pill> },
          { label: 'Expires', render: (r) => (r.expires_at ? when(r.expires_at) : 'never') },
          { label: 'Last used', render: (r) => when(r.last_used_at) },
          {
            label: 'Actions',
            render: (r) => (
              <span className={styles.inline}>
                <Btn onClick={() => setEditing({ row: r, name: r.name, scopes: r.scopes || [], expires: '', clearExpiry: false })}>Edit</Btn>
                <Btn variant="danger" onClick={() => revoke(r)}>
                  Revoke
                </Btn>
              </span>
            ),
          },
        ]}
      />
      {editing && (
        <div className={styles.subPanel}>
          <h3>Edit {editing.row.name}</h3>
          <Field label="Name">
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <ScopePicker value={editing.scopes} onChange={(scopes) => setEditing({ ...editing, scopes })} />
          <div className={styles.inline}>
            <Field label="New expiry (optional, local time)" hint="Leave empty to keep the current expiry.">
              <input type="datetime-local" value={editing.expires} onChange={(e) => setEditing({ ...editing, expires: e.target.value })} />
            </Field>
            <Checkbox label="Remove expiry" checked={editing.clearExpiry} onChange={(v) => setEditing({ ...editing, clearExpiry: v })} />
          </div>
          <div className={styles.actionsRow}>
            <Btn
              variant="primary"
              disabled={!editing.name.trim() || !editing.scopes.length}
              onClick={() =>
                action.run(async () => {
                  const body = { name: editing.name.trim(), scopes: editing.scopes };
                  if (editing.clearExpiry) body.expires_at = null;
                  else if (toIso(editing.expires)) body.expires_at = toIso(editing.expires);
                  const res = await adminClient.call({
                    method: 'PATCH',
                    path: `${base}/${seg(editing.row.key_id)}`,
                    body,
                    headers: { 'If-Match': etagOf(editing.row) },
                    source: 'Update management key',
                  });
                  setEditing(null);
                  list.reload();
                  return res;
                }, 'Key updated.')
              }
            >
              Save
            </Btn>
            <Btn onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </div>
      )}
      <div className={styles.subPanel}>
        <h3>Issue a management key</h3>
        <p className={styles.muted}>Requires management to be enabled for the tenant. Grant only the scopes the automation needs.</p>
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Provisioning automation" />
        </Field>
        <ScopePicker value={form.scopes} onChange={(scopes) => setForm({ ...form, scopes })} />
        <Field label="Expires (optional, local time)">
          <input type="datetime-local" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
        </Field>
        <div className={styles.actionsRow}>
          <Btn
            variant="primary"
            disabled={!form.name.trim() || !form.scopes.length}
            onClick={() =>
              action.run(async () => {
                const res = await adminClient.call({
                  method: 'POST',
                  path: base,
                  body: { name: form.name.trim(), scopes: form.scopes, expires_at: toIso(form.expires) },
                  headers: { 'Idempotency-Key': idemKey },
                  source: 'Issue management key',
                });
                setSecret(res.key?.secret || null);
                setIdemKey(newIdempotencyKey('issue-mgmt-key'));
                setForm({ name: '', scopes: ['read'], expires: '' });
                list.reload();
                return res;
              }, 'Management key issued. Paste it into the connection bar to use it here.')
            }
          >
            Issue key
          </Btn>
          <small className={styles.muted}>
            Idempotency-Key <code>{idemKey}</code>
          </small>
        </div>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </Panel>
  );
}
