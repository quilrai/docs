import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX, newIdempotencyKey, seg, versionOf } from './client.mjs';
import {
  ActionButton,
  ApiChips,
  Btn,
  Checkbox,
  ConnectFirst,
  ErrorBox,
  Field,
  JsonField,
  JsonView,
  KeyValue,
  Notice,
  Pager,
  Panel,
  Pill,
  Table,
  fmt,
  parseJson,
  pretty,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { useLoad } from './shared';
import styles from './styles.module.css';

const P = `${MANAGEMENT_PREFIX}/quota-pools`;

function memberCount(pool) {
  const m = pool.members;
  if (!m) return '-';
  if (Array.isArray(m)) return m.length;
  return (m.providers || []).length + (m.models || []).length;
}

export default function QuotaPools() {
  const { client, urlParam, setParam } = usePlayground();
  const [creating, setCreating] = useState(false);
  const list = useCollection((cursor) => client.call({ path: P, query: { limit: 50, cursor }, source: 'Quota pools' }), [client], !!client);
  if (!client) return <ConnectFirst what="manage quota pools" />;
  const selected = urlParam('pool');
  const unregistered = list.data?.unregistered || [];
  return (
    <div className={styles.stack}>
      <Panel
        title="Quota pools"
        subtitle="Named upstream quotas shared by several providers or models. Pools are descriptive: they document shared ceilings and do not change routing."
        actions={
          <>
            <ApiChips calls={[['GET', '/quota-pools']]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
            <Btn variant="primary" onClick={() => setCreating((v) => !v)} aria-expanded={creating}>
              <Plus size={13} aria-hidden /> New pool
            </Btn>
          </>
        }
      >
        <ErrorBox error={list.error} />
        {unregistered.length > 0 && (
          <Notice tone="warn">
            Providers reference pools that were never registered: {unregistered.map(fmt).join(', ')}. Register them to
            describe their limits.
          </Notice>
        )}
        {creating && (
          <CreatePool
            onCreated={(id) => {
              list.reload();
              setParam('pool', id);
            }}
          />
        )}
        <Table
          rows={list.data?.items || []}
          rowKey={(r) => r.pool_id}
          selected={selected}
          onRowClick={(r) => setParam('pool', r.pool_id)}
          empty={list.loading ? 'Loading...' : 'No quota pools registered.'}
          columns={[
            { label: 'Pool', render: (r) => <code>{r.pool_id}</code> },
            { label: 'Name', render: (r) => <strong>{fmt(r.name)}</strong> },
            { label: 'Limits', render: (r) => (r.limits ? Object.entries(r.limits).map(([k, v]) => `${k}: ${v ?? 'unknown'}`).join(', ') : '-') },
            { label: 'Members', render: (r) => memberCount(r) },
          ]}
        />
        <Pager list={list} />
      </Panel>
      {selected && <PoolDetail key={selected} id={selected} onChanged={list.reload} onDeleted={() => { setParam('pool', ''); list.reload(); }} />}
    </div>
  );
}

function CreatePool({ onCreated }) {
  const { client } = usePlayground();
  const [form, setForm] = useState({ pool_id: '', name: '', description: '', limits: pretty({ rpm: 1000, total_tpm: 200000 }) });
  const [idemKey, setIdemKey] = useState(newIdempotencyKey('create-pool'));
  const action = useAction();
  const limits = parseJson(form.limits);
  const validId = /^[a-z0-9][a-z0-9._:-]{0,127}$/.test(form.pool_id);
  const body = {
    pool_id: form.pool_id,
    name: form.name,
    ...(form.description ? { description: form.description } : {}),
    ...(limits.value ? { limits: limits.value } : {}),
  };
  return (
    <div className={styles.subPanel}>
      <h3>Register a quota pool</h3>
      <div className={styles.formGrid}>
        <Field label="Pool id" hint="Lowercase letters, digits, and . _ : - (immutable).">
          <input value={form.pool_id} onChange={(e) => setForm({ ...form, pool_id: e.target.value })} aria-invalid={!!form.pool_id && !validId} placeholder="openai-org-main" />
        </Field>
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Description">
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </div>
      <JsonField label="Limits (JSON)" rows={4} value={form.limits} onChange={(v) => setForm({ ...form, limits: v })} hint="Keys such as rpm, input_tpm, output_tpm, total_tpm, max_inflight_requests. null means unknown." />
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/quota-pools"
          scopes={['providers:write']}
          variant="primary"
          disabled={!validId || !form.name || !!limits.error}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'POST', path: P, body, headers: { 'Idempotency-Key': idemKey }, source: 'Create quota pool' });
              setIdemKey(newIdempotencyKey('create-pool'));
              onCreated(form.pool_id);
              return res;
            }, `Registered ${form.pool_id}.`)
          }
        >
          Create pool
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </div>
  );
}

function PoolDetail({ id, onChanged, onDeleted }) {
  const { client, confirm } = usePlayground();
  const path = `${P}/${seg(id)}`;
  const pool = useLoad(() => client.call({ path, source: 'Quota pool detail' }), [client, id]);
  const data = pool.data?.pool || pool.data;
  const etag = versionOf(pool.data);
  const [patch, setPatch] = useState('');
  const [detach, setDetach] = useState(false);
  const action = useAction();
  const parsed = parseJson(patch);

  async function remove() {
    if (
      !(await confirm({
        title: `Delete quota pool ${id}?`,
        body: detach
          ? 'The pool id is removed from every member provider and model first, then the pool is deleted.'
          : 'The gateway refuses while providers still reference the pool. Tick "Detach members" to remove those references first.',
        confirmLabel: 'Delete pool',
        tone: 'danger',
        call: `DELETE ${path}${detach ? '?detach=true' : ''}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'DELETE', path, query: detach ? { detach: 'true' } : {}, headers: { 'If-Match': etag }, source: 'Delete quota pool' });
      onDeleted();
      return res;
    });
  }

  return (
    <Panel
      title={data?.name || id}
      subtitle={`Pool ${id}`}
      actions={
        <>
          <ApiChips calls={[['GET', '/quota-pools/{pool_id}'], ['PATCH', '/quota-pools/{pool_id}'], ['DELETE', '/quota-pools/{pool_id}']]} />
          <Btn onClick={pool.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={pool.error} />
      {data && (
        <div className={styles.split}>
          <div>
            <KeyValue
              items={[
                ['Version (ETag)', <code key="v">{etag || '-'}</code>],
                ['Description', fmt(data.description)],
                ['Source', fmt(data.source_url || data.source)],
              ]}
            />
            <h3>Members</h3>
            <JsonView value={data.members ?? []} maxHeight={240} />
            <details>
              <summary>Raw pool</summary>
              <JsonView value={data} />
            </details>
          </div>
          <div>
            <h3>Edit</h3>
            <p className={styles.muted}>pool_id is immutable. Limits merge per key; null marks a limit unknown.</p>
            <Btn onClick={() => setPatch(pretty({ name: data.name, description: data.description ?? '', limits: data.limits || {} }))}>Load current values</Btn>
            <JsonField label="PATCH body" rows={8} value={patch} onChange={setPatch} />
            <ActionButton
              method="PATCH"
              path="/quota-pools/{pool_id}"
              scopes={['providers:write']}
              variant="primary"
              disabled={!!parsed.error || !parsed.value}
              onClick={() =>
                action.run(async () => {
                  const res = await client.call({ method: 'PATCH', path, body: parsed.value, headers: { 'If-Match': etag }, source: 'Update quota pool' });
                  pool.reload();
                  onChanged();
                  return res;
                }, 'Pool saved.')
              }
            >
              Save changes
            </ActionButton>
            <div className={styles.dangerZone}>
              <h3>Delete</h3>
              <Checkbox label="Detach members first" checked={detach} onChange={setDetach} />
              <ActionButton method="DELETE" path="/quota-pools/{pool_id}" scopes={['providers:write']} variant="danger" onClick={remove}>
                Delete pool
              </ActionButton>
            </div>
          </div>
        </div>
      )}
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {action.error?.code === 'quota_pool_in_use' && <Pill tone="warn">Tick &quot;Detach members first&quot; and delete again.</Pill>}
    </Panel>
  );
}
