import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX, appRoute, newIdempotencyKey, seg, versionOf } from './client.mjs';
import {
  ActionButton,
  ApiChips,
  Btn,
  Checkbox,
  ConnectFirst,
  EnabledPill,
  ErrorBox,
  Field,
  JsonField,
  JsonView,
  KeyValue,
  Notice,
  Pager,
  Panel,
  Pill,
  SecretOnce,
  Table,
  Tabs,
  csv,
  fmt,
  parseJson,
  pretty,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { idOf, useLoad, when } from './shared';
import styles from './styles.module.css';

const SECTIONS = [
  'detection',
  'routing',
  'limits',
  'access',
  'self_service',
  'transformations',
  'prompts',
  'tags',
  'alerting',
  'smart_group_policies',
];

export default function Apps() {
  const { client, urlParam, setParam } = usePlayground();
  const [filters, setFilters] = useState({ name: '', tag: '', enabled: '' });
  const [applied, setApplied] = useState(filters);
  const [creating, setCreating] = useState(false);
  const list = useCollection(
    (cursor) =>
      client.call({
        path: `${MANAGEMENT_PREFIX}/apps`,
        query: { ...applied, limit: 50, cursor },
        source: 'Apps',
      }),
    [client, applied.name, applied.tag, applied.enabled],
    !!client,
  );
  if (!client) return <ConnectFirst what="manage apps" />;
  const selected = urlParam('app');
  return (
    <div className={styles.stack}>
      <Panel
        title="Apps"
        subtitle="Each app is one gateway entry point with its own providers, settings and keys."
        actions={
          <>
            <ApiChips calls={[['GET', '/apps']]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
            <Btn variant="primary" onClick={() => setCreating((v) => !v)} aria-expanded={creating}>
              <Plus size={13} aria-hidden /> New app
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
          <Field label="Name contains">
            <input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          </Field>
          <Field label="Tag">
            <input value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })} />
          </Field>
          <Field label="Status">
            <select value={filters.enabled} onChange={(e) => setFilters({ ...filters, enabled: e.target.value })}>
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </Field>
          <Btn type="submit">Apply filters</Btn>
        </form>
        <ErrorBox error={list.error} />
        {creating && <CreateApp onCreated={(name) => { list.reload(); setParam('app', name); }} />}
        <Table
          rows={list.data?.items || []}
          rowKey={(r) => r.name}
          selected={selected}
          onRowClick={(r) => setParam('app', r.name)}
          empty={list.loading ? 'Loading...' : 'No apps match.'}
          columns={[
            { label: 'Name', render: (r) => <strong>{r.name}</strong> },
            { label: 'Status', render: (r) => <EnabledPill value={r.enabled} /> },
            { label: 'Mode', key: 'mode' },
            { label: 'Providers', render: (r) => (r.provider_labels || []).join(', ') || r.provider_mode || '-' },
            { label: 'Tags', render: (r) => (r.tags || []).join(', ') || '-' },
          ]}
        />
        <Pager list={list} />
      </Panel>
      {selected ? (
        <AppDetail key={selected} name={selected} onChanged={list.reload} />
      ) : (
        <p className={styles.muted}>Select an app to see its settings, providers and version history.</p>
      )}
    </div>
  );
}

function CreateApp({ onCreated }) {
  const { client, capabilities } = usePlayground();
  const [form, setForm] = useState({ name: '', mode: 'gateway', providers: '', keyName: 'Default', tags: '', extra: '' });
  const [idemKey, setIdemKey] = useState(newIdempotencyKey('create-app'));
  const [secret, setSecret] = useState(null);
  const action = useAction();
  const modes = capabilities?.modes || ['gateway', 'sdk', 'copilot_studio'];
  const extra = parseJson(form.extra);
  const body = {
    name: form.name.trim(),
    mode: form.mode,
    ...(form.mode === 'gateway' ? { provider_labels: csv(form.providers) } : {}),
    initial_key: { name: form.keyName.trim() || 'Default' },
    ...(csv(form.tags).length ? { tags: csv(form.tags) } : {}),
    ...(extra.value && typeof extra.value === 'object' ? extra.value : {}),
  };
  return (
    <div className={styles.subPanel}>
      <h3>Create an app</h3>
      <p className={styles.muted}>
        Creating an app always issues one gateway key. The request carries an Idempotency-Key, so a retry after a lost
        response returns the same app instead of a second one.
      </p>
      <div className={styles.formGrid}>
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Mode">
          <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            {modes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        {form.mode === 'gateway' && (
          <Field label="Shared provider labels" hint="Comma separated; the first is primary.">
            <input value={form.providers} onChange={(e) => setForm({ ...form, providers: e.target.value })} />
          </Field>
        )}
        <Field label="Initial key name">
          <input value={form.keyName} onChange={(e) => setForm({ ...form, keyName: e.target.value })} />
        </Field>
        <Field label="Tags" hint="Comma separated.">
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </Field>
      </div>
      <JsonField
        label="Additional fields (optional JSON merged into the body)"
        rows={4}
        value={form.extra}
        onChange={(v) => setForm({ ...form, extra: v })}
        hint='For example {"limits": {"timeout": 60}}'
      />
      <details>
        <summary>Request body</summary>
        <JsonView value={body} />
      </details>
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/apps"
          scopes={['config:write', 'credentials:write']}
          variant="primary"
          disabled={!body.name || !!extra.error}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({
                method: 'POST',
                path: `${MANAGEMENT_PREFIX}/apps`,
                body,
                headers: { 'Idempotency-Key': idemKey },
                source: 'Create app',
              });
              setSecret(res.key?.secret || null);
              setIdemKey(newIdempotencyKey('create-app'));
              onCreated(res.app?.name || body.name);
              return res;
            }, (res) => `Created ${res.app?.name || body.name}.${res.warnings?.length ? ` Warnings: ${res.warnings.join('; ')}` : ''}`)
          }
        >
          Create app
        </ActionButton>
        <small className={styles.muted}>
          Idempotency-Key <code>{idemKey}</code>
        </small>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      <SecretOnce secret={secret} title="Initial gateway key" onDismiss={() => setSecret(null)} />
    </div>
  );
}

function AppDetail({ name, onChanged }) {
  const { client, confirm } = usePlayground();
  const [tab, setTab] = useState('settings');
  const route = appRoute(name);
  const app = useLoad(() => client.call({ path: route.path, query: route.query, source: 'App detail' }), [client, name]);
  const action = useAction();
  const data = app.data?.app;
  const etag = versionOf(app.data);

  async function setEnabled(enabled) {
    if (
      !enabled &&
      !(await confirm({
        title: `Disable ${name}?`,
        body: 'New requests to this app are rejected once the change takes effect. Existing streams finish. Keys and settings are kept.',
        confirmLabel: 'Disable app',
        tone: 'danger',
        call: `PATCH ${route.path}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({
        method: 'PATCH',
        path: route.path,
        query: route.query,
        body: { enabled },
        headers: { 'If-Match': etag },
        source: enabled ? 'Enable app' : 'Disable app',
      });
      app.reload();
      onChanged();
      return res;
    }, enabled ? 'App enabled.' : 'App disabled.');
  }

  return (
    <Panel
      title={name}
      subtitle={data ? `${data.mode || 'gateway'} app - ${data.provider_mode || 'shared'} providers` : 'Loading app...'}
      actions={
        <>
          <ApiChips calls={[['GET', '/apps/{app_name}'], ['PATCH', '/apps/{app_name}']]} />
          <Btn onClick={app.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
          {data &&
            (data.enabled === false ? (
              <ActionButton method="PATCH" path="/apps/{app_name}" scopes={['config:write']} onClick={() => setEnabled(true)}>
                Enable
              </ActionButton>
            ) : (
              <ActionButton method="PATCH" path="/apps/{app_name}" scopes={['config:write']} variant="danger" onClick={() => setEnabled(false)}>
                Disable
              </ActionButton>
            ))}
        </>
      }
    >
      <ErrorBox error={app.error} />
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {data && (
        <>
          <KeyValue
            items={[
              ['Status', <EnabledPill key="s" value={data.enabled} />],
              ['Version (ETag)', <code key="v">{etag || '-'}</code>],
              ['Providers', (data.provider_labels || []).join(', ') || '-'],
              ['Tags', (data.tags || []).join(', ') || '-'],
              [
                'Policy authority',
                data.policy_authority?.enabled ? <Pill tone="warn">QuilrQL governs some settings</Pill> : 'App settings apply',
              ],
            ]}
          />
          {app.data.warnings?.length > 0 && <Notice tone="warn">{app.data.warnings.map(fmt).join(' ')}</Notice>}
          <Tabs
            label="App sections"
            value={tab}
            onChange={setTab}
            tabs={[
              ['settings', 'Settings'],
              ['providers', 'Providers'],
              ['versions', 'Versions'],
            ]}
          />
          {tab === 'settings' && <AppSettings name={name} app={data} etag={etag} onSaved={() => { app.reload(); onChanged(); }} />}
          {tab === 'providers' && <AppProviders name={name} etag={etag} onChanged={app.reload} />}
          {tab === 'versions' && <AppVersions name={name} etag={etag} onRolledBack={app.reload} />}
        </>
      )}
    </Panel>
  );
}

function AppSettings({ name, app, etag, onSaved }) {
  const { client } = usePlayground();
  const [section, setSection] = useState('limits');
  const [patch, setPatch] = useState(() => pretty({ limits: app.limits || {} }));
  const [result, setResult] = useState(null);
  const action = useAction();
  const route = appRoute(name);
  const parsed = parseJson(patch);
  return (
    <div className={styles.split}>
      <div>
        <h3>Current configuration</h3>
        <JsonView value={app} maxHeight={520} />
      </div>
      <div>
        <h3>Change settings</h3>
        <p className={styles.muted}>
          Omitted fields keep their value. Lists replace the stored list. The save uses If-Match with the version you
          loaded, so a concurrent change returns 412 instead of being overwritten.
        </p>
        <div className={styles.inline}>
          <Field label="Start from section">
            <select value={section} onChange={(e) => setSection(e.target.value)}>
              {SECTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Btn onClick={() => setPatch(pretty({ [section]: app[section] ?? (section === 'tags' ? [] : {}) }))}>Load current value</Btn>
          <Btn
            onClick={() =>
              setPatch(
                pretty({
                  prompts: {
                    universal_system_prompt: app.prompts?.universal_system_prompt || { enabled: true, content: 'You are a helpful assistant.' },
                  },
                }),
              )
            }
          >
            Universal system prompt
          </Btn>
        </div>
        <JsonField label="PATCH body" rows={14} value={patch} onChange={setPatch} />
        <div className={styles.actionsRow}>
          <ActionButton
            method="PATCH"
            path="/apps/{app_name}"
            scopes={['config:write']}
            variant="primary"
            disabled={!!parsed.error || !parsed.value}
            onClick={() =>
              action.run(async () => {
                const res = await client.call({
                  method: 'PATCH',
                  path: route.path,
                  query: route.query,
                  body: parsed.value,
                  headers: { 'If-Match': etag },
                  source: 'Update app settings',
                });
                setResult(res);
                onSaved();
                return res;
              }, 'Settings saved.')
            }
          >
            Save changes
          </ActionButton>
          <small className={styles.muted}>
            If-Match <code>{etag || 'none'}</code>
          </small>
        </div>
        <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
        <Notice tone="ok" onDismiss={() => action.setNotice('')}>
          {action.notice}
        </Notice>
        {result && (result.inactive_under_quilrql || result.warnings?.length) ? (
          <Notice tone="warn">
            {result.inactive_under_quilrql ? 'Saved, but QuilrQL governs some of these paths, so they are inactive. ' : ''}
            {(result.warnings || []).map(fmt).join(' ')}
          </Notice>
        ) : null}
      </div>
    </div>
  );
}

function AppProviders({ name, etag, onChanged }) {
  const { client, confirm } = usePlayground();
  const list = useLoad(() => client.call({ ...appSub(name, '/providers'), source: 'App providers' }), [client, name, etag]);
  const [label, setLabel] = useState('');
  const [primary, setPrimary] = useState(false);
  const [conversion, setConversion] = useState({ labels: '', routing: '' });
  const action = useAction();
  // GET /apps/{app_name}/providers returns {provider_labels: [...], version}, primary first.
  const rows = (Array.isArray(list.data?.provider_labels) ? list.data.provider_labels : []).map((providerLabel, i) => ({
    label: providerLabel,
    order: i + 1,
  }));

  async function attach() {
    await action.run(async () => {
      const r = appSub(name, `/providers/${seg(label.trim())}`);
      const res = await client.call({ method: 'PUT', ...r, body: { primary }, headers: { 'If-Match': etag }, source: 'Attach provider' });
      setLabel('');
      onChanged();
      return res;
    }, `Attached ${label.trim()}.`);
  }
  async function detach(provider) {
    if (
      !(await confirm({
        title: `Detach ${provider}?`,
        body: 'The app stops routing to this provider. An app cannot drop its last provider; attach a replacement first.',
        confirmLabel: 'Detach',
        tone: 'danger',
      }))
    )
      return;
    await action.run(async () => {
      const r = appSub(name, `/providers/${seg(provider)}`);
      const res = await client.call({ method: 'DELETE', ...r, headers: { 'If-Match': etag }, source: 'Detach provider' });
      onChanged();
      return res;
    }, `Detached ${provider}.`);
  }
  async function convert() {
    const routing = parseJson(conversion.routing);
    if (routing.error) {
      action.setError({ code: 'invalid_json', message: `Routing JSON: ${routing.error}` });
      return;
    }
    if (
      !(await confirm({
        title: 'Convert inline providers?',
        body: 'The app switches to the listed shared providers, in order. The app and its keys are preserved.',
        confirmLabel: 'Convert',
      }))
    )
      return;
    await action.run(async () => {
      const r = appSub(name, '/provider-conversion');
      const res = await client.call({
        method: 'POST',
        ...r,
        body: { provider_labels: csv(conversion.labels), ...(routing.value ? { routing: routing.value } : {}) },
        headers: { 'If-Match': etag },
        source: 'Convert providers',
      });
      onChanged();
      return res;
    }, 'Converted to shared providers.');
  }

  return (
    <div className={styles.stack}>
      <ApiChips
        calls={[
          ['GET', '/apps/{app_name}/providers'],
          ['PUT', '/apps/{app_name}/providers/{label}'],
          ['DELETE', '/apps/{app_name}/providers/{label}'],
          ['POST', '/apps/{app_name}/provider-conversion'],
        ]}
      />
      <ErrorBox error={list.error} />
      <Table
        rows={rows}
        rowKey={(r) => r.label}
        empty={list.loading ? 'Loading...' : 'No shared providers attached. Inline apps must be converted first.'}
        columns={[
          { label: 'Order', render: (r) => r.order },
          { label: 'Label', render: (r) => <strong>{r.label}</strong> },
          { label: 'Primary', render: (r) => (r.order === 1 ? <Pill tone="ok">primary</Pill> : '-') },
          {
            label: 'Actions',
            render: (r) => (
              <ActionButton method="DELETE" path="/apps/{app_name}/providers/{label}" scopes={['config:write']} variant="danger" onClick={() => detach(r.label)}>
                Detach
              </ActionButton>
            ),
          },
        ]}
      />
      {list.data && (
        <details>
          <summary>Raw response</summary>
          <JsonView value={list.data} />
        </details>
      )}
      <div className={styles.subPanel}>
        <h3>Attach a shared provider</h3>
        <div className={styles.inline}>
          <Field label="Provider label">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Production OpenAI" />
          </Field>
          <Checkbox label="Make primary" checked={primary} onChange={setPrimary} />
          <ActionButton method="PUT" path="/apps/{app_name}/providers/{label}" scopes={['config:write']} variant="primary" disabled={!label.trim()} onClick={attach}>
            Attach
          </ActionButton>
        </div>
      </div>
      <div className={styles.subPanel}>
        <h3>Convert inline providers to shared providers</h3>
        <p className={styles.muted}>Inline apps must be converted before provider changes. List every shared provider the app should use, in order.</p>
        <Field label="Provider labels" hint="Comma separated, primary first.">
          <input value={conversion.labels} onChange={(e) => setConversion({ ...conversion, labels: e.target.value })} />
        </Field>
        <JsonField label="Routing (optional JSON)" rows={4} value={conversion.routing} onChange={(v) => setConversion({ ...conversion, routing: v })} />
        <ActionButton method="POST" path="/apps/{app_name}/provider-conversion" scopes={['config:write']} disabled={!csv(conversion.labels).length} onClick={convert}>
          Convert
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </div>
  );
}

function appSub(name, sub) {
  const r = appRoute(name, sub);
  return { path: r.path, query: r.query };
}

function AppVersions({ name, etag, onRolledBack }) {
  const { client, confirm } = usePlayground();
  const [viewing, setViewing] = useState(null);
  const action = useAction();
  const list = useCollection(
    (cursor) => client.call({ ...appSub(name, '/versions'), query: { ...appSub(name, '').query, limit: 20, cursor }, source: 'App versions' }),
    [client, name, etag],
  );
  const vid = (r) => idOf(r, 'version_id', 'id', 'version');

  async function view(id) {
    await action.run(async () => {
      const res = await client.call({ ...appSub(name, `/versions/${seg(id)}`), source: 'Read version' });
      setViewing(res);
      return res;
    });
  }
  async function rollback(id) {
    if (
      !(await confirm({
        title: `Roll back ${name} to version ${id}?`,
        body: 'The app configuration returns to this version. Providers, definitions, key expiry and policy are not rolled back. Routing references are revalidated.',
        confirmLabel: 'Roll back',
        tone: 'danger',
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({
        method: 'POST',
        ...appSub(name, `/versions/${seg(id)}/rollback`),
        headers: { 'If-Match': etag, 'Idempotency-Key': newIdempotencyKey('rollback') },
        source: 'Roll back app',
      });
      onRolledBack();
      return res;
    }, `Rolled back to ${id}.`);
  }

  return (
    <div className={styles.stack}>
      <ApiChips
        calls={[
          ['GET', '/apps/{app_name}/versions'],
          ['GET', '/apps/{app_name}/versions/{version_id}'],
          ['POST', '/apps/{app_name}/versions/{version_id}/rollback'],
        ]}
      />
      <ErrorBox error={list.error} />
      <Table
        rows={list.data?.items || []}
        rowKey={(r) => vid(r)}
        empty={list.loading ? 'Loading...' : 'No configuration versions recorded.'}
        columns={[
          { label: 'Version', render: (r) => <code>{fmt(vid(r))}</code> },
          { label: 'When', render: (r) => when(idOf(r, 'created_at', 'timestamp', 'saved_at')) },
          { label: 'Actor', render: (r) => fmt(idOf(r, 'actor', 'actor_key_id', 'actor_type')) },
          { label: 'Change', render: (r) => fmt(idOf(r, 'operation', 'change_type', 'summary', 'message')) },
          {
            label: 'Actions',
            render: (r) => (
              <span className={styles.inline}>
                <Btn onClick={() => view(vid(r))}>View</Btn>
                <ActionButton method="POST" path="/apps/{app_name}/versions/{version_id}/rollback" scopes={['config:write']} variant="danger" onClick={() => rollback(vid(r))}>
                  Roll back
                </ActionButton>
              </span>
            ),
          },
        ]}
      />
      <Pager list={list} />
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {viewing && (
        <div className={styles.subPanel}>
          <div className={styles.cardHead}>
            <h3>Version detail</h3>
            <Btn onClick={() => setViewing(null)}>Close</Btn>
          </div>
          <JsonView value={viewing} maxHeight={480} />
        </div>
      )}
    </div>
  );
}
