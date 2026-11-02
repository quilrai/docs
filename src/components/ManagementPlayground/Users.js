import React, { useState } from 'react';
import { RefreshCw, Wallet } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { useOpen } from './Controls';
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
} from './ui';
import { useLoad, when } from './shared';
import { Stats, num, usd } from './Usage';
import styles from './styles.module.css';

const P = MANAGEMENT_PREFIX;
const SOURCE_TONE = { directory: 'ok', configured: 'warn', traffic: 'off' };
const BLANK = { q: '', app: '', active_since: '', sort: 'email' };

export default function Users() {
  const { client, urlParam, setParam } = usePlayground();
  const [form, setForm] = useState(BLANK);
  const [applied, setApplied] = useState(BLANK);
  const list = useCollection(
    (cursor) => client.call({ path: `${P}/users`, query: { ...applied, limit: 100, cursor }, source: 'Users' }),
    [client, JSON.stringify(applied)],
    !!client,
  );
  if (!client) return <ConnectFirst what="see who uses the gateway, their access, keys and usage" />;
  const selected = urlParam('user');
  const data = list.data;
  return (
    <div className={styles.stack}>
      <Panel
        title="Users"
        subtitle="Everyone the gateway knows for your organization: people in your identity directory, people named in gateway configuration and people seen only in requests. Read only."
        actions={
          <>
            <ApiChips calls={[['GET', '/users'], ['GET', '/users/{email}']]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
          </>
        }
      >
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(form);
          }}
        >
          <Field label="Search" hint="Part of an email or department.">
            <input type="search" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="alice or engineering" />
          </Field>
          <Field label="App" hint="Granted this app specifically, or used it.">
            <input value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value })} placeholder="Support Bot" />
          </Field>
          <Field label="Active since" hint="Inclusive, from UTC midnight.">
            <input type="date" value={form.active_since} onChange={(e) => setForm({ ...form, active_since: e.target.value })} />
          </Field>
          <Field label="Sort">
            <select value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })}>
              <option value="email">email (A to Z)</option>
              <option value="last_active">last active</option>
              <option value="requests">requests, 30 days</option>
              <option value="cost">cost, 30 days</option>
            </select>
          </Field>
          <Btn type="submit" variant="primary">
            Search
          </Btn>
        </form>
        <ErrorBox error={list.error} />
        {data && (
          <p className={styles.muted}>
            {num(data.total)} people match.{data.usage?.available === false && ' Usage is unavailable right now; usage columns are empty.'}
            {data.usage?.available && data.usage?.complete === false && ' Usage is partial: the request history exceeded its row limit.'}
            {data.truncated && ' Some people may be missing: the directory or personal keys exceeded their read limit.'}
            {data.generated_at && ` Data read at ${data.generated_at}.`}
          </p>
        )}
        <Table
          rows={data?.items || []}
          rowKey={(u) => u.email}
          selected={selected}
          onRowClick={(u) => setParam('user', u.email)}
          empty={list.loading ? 'Loading...' : 'No people match.'}
          columns={[
            { label: 'Email', render: (u) => <strong>{u.email}</strong> },
            { label: 'Known from', render: (u) => <Pill tone={SOURCE_TONE[u.source]}>{fmt(u.source)}</Pill> },
            { label: 'Department', render: (u) => fmt(u.department) },
            { label: 'Apps', render: (u) => (u.all_apps ? <Pill>every app</Pill> : (u.apps || []).join(', ') || '-') },
            { label: 'Smart groups', render: (u) => (u.smart_groups || []).join(', ') || '-' },
            { label: 'Personal keys', render: (u) => num(u.self_service_keys) },
            { label: 'Last active', render: (u) => when(u.last_active_at) },
            { label: 'Requests (30 d)', render: (u) => <span className={styles.num}>{num(u.requests_30d)}</span> },
            { label: 'Cost (30 d)', render: (u) => <span className={styles.num}>{usd(u.cost_usd_30d)}</span> },
          ]}
        />
        <Pager list={list} />
      </Panel>
      {selected ? (
        <UserDetail key={selected} email={selected} onClose={() => setParam('user', '')} />
      ) : (
        <p className={styles.muted}>Select a person to see every app they can use and how it is granted, their personal keys and usage.</p>
      )}
    </div>
  );
}

const grantText = (g) =>
  [g.kind?.replace(/_/g, ' '), g.role && `role ${g.role}`, g.via && `via ${g.via.replace(/_/g, ' ')}`, (g.smart_groups || []).join(', '), (g.key_ids || []).join(', ')]
    .filter(Boolean)
    .join(' · ');

function UserDetail({ email, onClose }) {
  const { client } = usePlayground();
  const open = useOpen();
  const res = useLoad(() => client.call({ path: `${P}/users/${seg(email)}`, source: 'User detail' }), [client, email]);
  const u = res.data?.user;
  const usage = u?.usage;
  const subject = u?.links?.budget_subject;
  return (
    <Panel
      title={email}
      subtitle={u ? `Known from ${(u.sources || [u.source]).join(', ')}.` : undefined}
      actions={
        <>
          {subject && (
            <Btn onClick={() => open('GET', '/budget-subjects/{kind}/{value}', { pathParams: { kind: subject.kind, value: subject.value } })}>
              <Wallet size={13} aria-hidden /> Budget subject
            </Btn>
          )}
          <Btn onClick={onClose}>Close</Btn>
        </>
      }
    >
      <ErrorBox error={res.error} />
      {res.loading && <p className={styles.muted}>Loading...</p>}
      {u && (
        <>
          <KeyValue
            items={[
              ['Known from', <Pill tone={SOURCE_TONE[u.source]}>{fmt(u.source)}</Pill>],
              u.directory ? ['Department', fmt(u.directory.department)] : null,
              u.directory?.groups?.length ? ['Directory groups', u.directory.groups.join(', ')] : null,
              ['Smart groups', (u.smart_groups || []).map((g) => g.display_name || g.group_name).join(', ') || '-'],
              u.active_smart_group ? ['Active smart group', u.active_smart_group] : null,
              ['Every app', u.all_apps ? 'yes' : 'no'],
              ['First seen', when(u.first_seen_at)],
              ['Last active', when(u.last_active_at)],
            ]}
          />
          {usage ? (
            <Stats
              items={[
                ['Requests, 30 days', num(usage.last_30d?.requests)],
                ['Cost, 30 days', usd(usage.last_30d?.cost_usd)],
                ['Requests, all time', num(usage.all_time?.requests)],
                ['Cost, all time', usd(usage.all_time?.cost_usd)],
              ]}
            />
          ) : (
            <p className={styles.muted}>Usage is unavailable right now.</p>
          )}
          {usage?.complete === false && <p className={styles.muted}>Usage is partial: this person's history exceeded its row limit.</p>}
          <h3>App access</h3>
          <Table
            rows={u.app_access || []}
            empty="No app-specific access."
            columns={[
              { label: 'App', render: (a) => <strong>{a.app}</strong> },
              { label: 'Granted by', render: (a) => (a.granted_by || []).map(grantText).join('; ') || '-' },
              { label: 'Domain allowed', render: (a) => (a.domain_allowed === false ? <Pill tone="err">no</Pill> : 'yes') },
              { label: 'Self-service denied', render: (a) => (a.self_service_denied ? <Pill tone="err">yes</Pill> : 'no') },
            ]}
          />
          <h3>Personal keys</h3>
          <Table
            rows={u.self_service_keys || []}
            rowKey={(k) => k.key_id}
            empty="No personal keys."
            columns={[
              { label: 'Name', render: (k) => fmt(k.name) },
              { label: 'App', render: (k) => fmt(k.app) },
              { label: 'Status', render: (k) => <Pill tone={k.status === 'active' ? 'ok' : 'off'}>{fmt(k.status)}</Pill> },
              { label: 'Created', render: (k) => when(k.created_at) },
              { label: 'Expires', render: (k) => (k.expires_at ? when(k.expires_at) : 'never') },
              { label: 'Last used', render: (k) => when(k.last_used_at) },
            ]}
          />
          {usage && (
            <div className={styles.split}>
              <div>
                <h3>Top models, 30 days</h3>
                <Table
                  rows={usage.top_models || []}
                  rowKey={(m) => m.model}
                  columns={[
                    { label: 'Model', render: (m) => <code>{m.model}</code> },
                    { label: 'Requests', render: (m) => num(m.requests) },
                    { label: 'Cost', render: (m) => usd(m.cost_usd) },
                  ]}
                />
              </div>
              <div>
                <h3>By app, 30 days</h3>
                <Table
                  rows={usage.by_app || []}
                  rowKey={(a) => `${a.app ?? '(deleted)'}|${a.last_active_at ?? ''}`}
                  columns={[
                    { label: 'App', render: (a) => (a.app == null ? <Pill tone="off">deleted app</Pill> : a.app) },
                    { label: 'Requests', render: (a) => num(a.requests) },
                    { label: 'Cost', render: (a) => usd(a.cost_usd) },
                    { label: 'Last active', render: (a) => when(a.last_active_at) },
                  ]}
                />
              </div>
            </div>
          )}
          <details>
            <summary>Raw response</summary>
            <JsonView value={res.data} maxHeight={420} />
          </details>
        </>
      )}
    </Panel>
  );
}
