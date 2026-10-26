import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX, newIdempotencyKey, seg, versionOf } from './client.mjs';
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
import { useLoad, when } from './shared';
import styles from './styles.module.css';

const P = MANAGEMENT_PREFIX;

function outcomeTone(outcome) {
  if (outcome === 'passed') return 'ok';
  if (outcome === 'failed' || outcome === 'timeout') return 'err';
  return 'warn';
}

export function ProbeResult({ result }) {
  if (!result) return null;
  const test = result.test || (result.outcome && !result.discovery ? result : null);
  const discovery = result.discovery;
  if (discovery) {
    return (
      <div className={styles.subPanel}>
        <div className={styles.cardHead}>
          <h3>Discovery</h3>
          <Pill tone={outcomeTone(discovery.outcome)}>{discovery.outcome}</Pill>
          <code>{discovery.code}</code>
          {discovery.latency_ms != null && <span className={styles.muted}>{discovery.latency_ms} ms</span>}
        </div>
        {discovery.message && <p>{discovery.message}</p>}
        {(discovery.warnings || []).length > 0 && <Notice tone="warn">{discovery.warnings.map(fmt).join(' ')}</Notice>}
        <Table
          rows={discovery.models || []}
          rowKey={(m) => m.id}
          empty="No models listed."
          columns={[
            { label: 'Model', render: (m) => <code>{m.id}</code> },
            { label: 'Owner', render: (m) => fmt(m.owned_by || m.provider_name) },
            { label: 'Name', render: (m) => fmt(m.display_name) },
            {
              label: 'Validation',
              render: (m) => {
                const v = (discovery.validation_results || []).find((x) => x.model === m.id);
                return v ? <Pill tone={outcomeTone(v.outcome)}>{v.outcome}</Pill> : '-';
              },
            },
          ]}
        />
        <details>
          <summary>Raw result</summary>
          <JsonView value={result} />
        </details>
      </div>
    );
  }
  if (!test) return <JsonView value={result} />;
  const models = test.models || [];
  return (
    <div className={styles.subPanel}>
      <div className={styles.cardHead}>
        <h3>Test result</h3>
        {test.outcome && <Pill tone={outcomeTone(test.outcome)}>{test.outcome}</Pill>}
        {test.code && <code>{test.code}</code>}
        {test.latency_ms != null && <span className={styles.muted}>{test.latency_ms} ms</span>}
      </div>
      {test.message && <p>{test.message}</p>}
      {test.connection && (
        <p>
          Connection: <Pill tone={outcomeTone(test.connection.outcome)}>{test.connection.outcome}</Pill> <code>{test.connection.code}</code>{' '}
          {test.connection.message}
        </p>
      )}
      {models.length > 0 && (
        <Table
          rows={models}
          rowKey={(m) => m.model}
          columns={[
            { label: 'Model', render: (m) => <code>{m.model}</code> },
            { label: 'Outcome', render: (m) => <Pill tone={outcomeTone(m.outcome)}>{m.outcome}</Pill> },
            { label: 'Code', render: (m) => fmt(m.code) },
            { label: 'Latency', render: (m) => (m.latency_ms != null ? `${m.latency_ms} ms` : '-') },
            { label: 'Message', render: (m) => fmt(m.message) },
          ]}
        />
      )}
      {test.models_truncated && <p className={styles.muted}>Only the first 10 models were probed.</p>}
      <details>
        <summary>Raw result</summary>
        <JsonView value={result} />
      </details>
    </div>
  );
}

export default function Providers() {
  const { client, capabilities, urlParam, setParam } = usePlayground();
  const empty = { provider_name: '', enabled: '', include_deleted: false, model: '', tag: '' };
  const [filters, setFilters] = useState(empty);
  const [applied, setApplied] = useState(empty);
  const [creating, setCreating] = useState(false);
  const list = useCollection(
    (cursor) =>
      client.call({
        path: `${P}/providers`,
        query: {
          provider_name: applied.provider_name,
          enabled: applied.enabled,
          include_deleted: applied.include_deleted ? 'true' : '',
          model: csv(applied.model),
          tag: csv(applied.tag),
          limit: 50,
          cursor,
        },
        source: 'Providers',
      }),
    [client, JSON.stringify(applied)],
    !!client,
  );
  if (!client) return <ConnectFirst what="manage shared providers" />;
  const selected = urlParam('provider');
  const types = capabilities?.provider_types || [];
  return (
    <div className={styles.stack}>
      <Panel
        title="Shared providers"
        subtitle="Upstream credentials and model lists that apps attach by label. Secrets never appear in responses."
        actions={
          <>
            <ApiChips calls={[['GET', '/providers']]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
            <Btn variant="primary" onClick={() => setCreating((v) => !v)} aria-expanded={creating}>
              <Plus size={13} aria-hidden /> New provider
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
          <Field label="Provider type">
            <select value={filters.provider_name} onChange={(e) => setFilters({ ...filters, provider_name: e.target.value })}>
              <option value="">All</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={filters.enabled} onChange={(e) => setFilters({ ...filters, enabled: e.target.value })}>
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </Field>
          <Field label="Model" hint="Exact selected model id; comma for several.">
            <input value={filters.model} onChange={(e) => setFilters({ ...filters, model: e.target.value })} />
          </Field>
          <Field label="Tag" hint="key or key:value; comma for several.">
            <input value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })} placeholder="region:us-east-1" />
          </Field>
          <Checkbox label="Include deleted" checked={filters.include_deleted} onChange={(v) => setFilters({ ...filters, include_deleted: v })} />
          <Btn type="submit">Apply filters</Btn>
        </form>
        <ErrorBox error={list.error} />
        {creating && (
          <CreateProvider
            types={types}
            onCreated={(label) => {
              list.reload();
              setParam('provider', label);
            }}
          />
        )}
        <Table
          rows={list.data?.items || []}
          rowKey={(r) => r.label}
          selected={selected}
          onRowClick={(r) => setParam('provider', r.label)}
          empty={list.loading ? 'Loading...' : 'No providers match.'}
          columns={[
            { label: 'Label', render: (r) => <strong>{r.label}</strong> },
            { label: 'Type', key: 'provider_name' },
            {
              label: 'Status',
              render: (r) => (r.is_active === false ? <Pill tone="off">deleted</Pill> : <EnabledPill value={r.enabled} />),
            },
            { label: 'Models', render: (r) => (r.selected_models || []).length },
            { label: 'Region', render: (r) => fmt(r.tags?.region) },
          ]}
        />
        <Pager list={list} />
      </Panel>
      {selected ? (
        <ProviderDetail key={selected} label={selected} onChanged={list.reload} onDeleted={() => { setParam('provider', ''); list.reload(); }} />
      ) : (
        <p className={styles.muted}>Select a provider to edit it, test its models or discover what the upstream offers.</p>
      )}
    </div>
  );
}

function CreateProvider({ types, onCreated }) {
  const { client } = usePlayground();
  const [form, setForm] = useState({
    label: '',
    provider_name: types[0] || 'openai',
    settings: pretty({ api_key: '' }),
    models: '',
    tags: '',
    enabled: true,
  });
  const [idemKey, setIdemKey] = useState(newIdempotencyKey('create-provider'));
  const [probe, setProbe] = useState(null);
  const [validate, setValidate] = useState(false);
  const action = useAction();
  const settings = parseJson(form.settings);
  const tags = parseJson(form.tags);
  const body = {
    label: form.label.trim(),
    provider_name: form.provider_name,
    provider_settings: settings.value || {},
    selected_models: csv(form.models),
    ...(tags.value ? { tags: tags.value } : {}),
    enabled: form.enabled,
  };
  const invalid = !!settings.error || !!tags.error;
  return (
    <div className={styles.subPanel}>
      <h3>Create a shared provider</h3>
      <p className={styles.muted}>Test the draft or discover its models first; neither call saves anything.</p>
      <div className={styles.formGrid}>
        <Field label="Label" hint="Immutable after creation.">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </Field>
        <Field label="Provider type">
          <select value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })}>
            {(types.length ? types : [form.provider_name]).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Selected models" hint="Comma separated.">
          <input value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} placeholder="gpt-4.1-mini" />
        </Field>
        <Checkbox label="Enabled" checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} />
      </div>
      <JsonField label="Provider settings (JSON)" rows={6} value={form.settings} onChange={(v) => setForm({ ...form, settings: v })} hint="Credentials and endpoint fields for this provider type. Sent directly to your gateway." />
      <JsonField label="Tags (optional JSON)" rows={3} value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} hint='For example {"region": "us-east-1", "team": "platform"}' />
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/providers/test-settings"
          scopes={['providers:write']}
          disabled={invalid}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({
                method: 'POST',
                path: `${P}/providers/test-settings`,
                body: { provider_name: body.provider_name, provider_settings: body.provider_settings, models: body.selected_models.slice(0, 10) },
                source: 'Test draft provider',
              });
              setProbe(res);
            })
          }
        >
          Test before saving
        </ActionButton>
        <ActionButton
          method="POST"
          path="/providers/available-models"
          scopes={['providers:write']}
          disabled={invalid}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({
                method: 'POST',
                path: `${P}/providers/available-models`,
                body: { provider_name: body.provider_name, provider_settings: body.provider_settings, validate },
                source: 'Discover models (draft)',
              });
              setProbe(res);
            })
          }
        >
          Discover models
        </ActionButton>
        <Checkbox label="Validate each model" checked={validate} onChange={setValidate} />
        <ActionButton
          method="POST"
          path="/providers"
          scopes={['providers:write']}
          variant="primary"
          disabled={invalid || !body.label}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({
                method: 'POST',
                path: `${P}/providers`,
                body,
                headers: { 'Idempotency-Key': idemKey },
                source: 'Create provider',
              });
              setIdemKey(newIdempotencyKey('create-provider'));
              onCreated(res.provider?.label || body.label);
              return res;
            }, `Created ${body.label}.`)
          }
        >
          Create provider
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      <ProbeResult result={probe} />
    </div>
  );
}

function ProviderDetail({ label, onChanged, onDeleted }) {
  const { client, confirm } = usePlayground();
  const [tab, setTab] = useState('overview');
  const path = `${P}/providers/${seg(label)}`;
  const provider = useLoad(() => client.call({ path, source: 'Provider detail' }), [client, label]);
  const action = useAction();
  const data = provider.data?.provider || provider.data;
  const etag = versionOf(provider.data);
  const deleted = data?.is_active === false;

  async function setEnabled(enabled) {
    if (
      !enabled &&
      !(await confirm({
        title: `Disable ${label}?`,
        body: 'Apps keep the attachment, but requests stop routing to this provider until you enable it again.',
        confirmLabel: 'Disable provider',
        tone: 'danger',
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'PATCH', path, body: { enabled }, headers: { 'If-Match': etag }, source: enabled ? 'Enable provider' : 'Disable provider' });
      provider.reload();
      onChanged();
      return res;
    }, enabled ? 'Provider enabled.' : 'Provider disabled.');
  }
  async function remove() {
    if (
      !(await confirm({
        title: `Delete ${label}?`,
        body: 'This soft-deletes the shared provider. The gateway refuses while any active app still attaches it; detach it from those apps first.',
        confirmLabel: 'Delete provider',
        tone: 'danger',
        typeToConfirm: label,
        call: `DELETE ${path}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'DELETE', path, headers: { 'If-Match': etag }, source: 'Delete provider' });
      onDeleted();
      return res;
    });
  }

  return (
    <Panel
      title={label}
      subtitle={data ? `${data.provider_name} - ${(data.selected_models || []).length} selected models` : 'Loading provider...'}
      actions={
        <>
          <ApiChips calls={[['GET', '/providers/{label}'], ['PATCH', '/providers/{label}'], ['DELETE', '/providers/{label}']]} />
          <Btn onClick={provider.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
          {data && !deleted && (
            <>
              {data.enabled === false ? (
                <ActionButton method="PATCH" path="/providers/{label}" scopes={['providers:write']} onClick={() => setEnabled(true)}>
                  Enable
                </ActionButton>
              ) : (
                <ActionButton method="PATCH" path="/providers/{label}" scopes={['providers:write']} onClick={() => setEnabled(false)}>
                  Disable
                </ActionButton>
              )}
              <ActionButton method="DELETE" path="/providers/{label}" scopes={['providers:write']} variant="danger" onClick={remove}>
                Delete
              </ActionButton>
            </>
          )}
        </>
      }
    >
      <ErrorBox error={provider.error} />
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {data && (
        <>
          <KeyValue
            items={[
              ['Status', deleted ? <Pill tone="off">deleted</Pill> : <EnabledPill value={data.enabled} />],
              ['Version (ETag)', <code key="v">{etag || '-'}</code>],
              ['Credential configured', data.credential_configured ? 'yes' : 'no'],
              ['Credentials updated', when(data.credentials_updated_at)],
              ['Models', (data.selected_models || []).join(', ') || '-'],
              ['Quota pools', (data.upstream_limits?.shared_quota_pool_ids || []).join(', ') || '-'],
            ]}
          />
          <Tabs
            label="Provider sections"
            value={tab}
            onChange={setTab}
            tabs={[
              ['overview', 'Details'],
              ['edit', 'Edit'],
              ['test', 'Test'],
              ['discover', 'Discover models'],
            ]}
          />
          {tab === 'overview' && <JsonView value={data} maxHeight={520} />}
          {tab === 'edit' && <EditProvider path={path} data={data} etag={etag} onSaved={() => { provider.reload(); onChanged(); }} />}
          {tab === 'test' && <TestProvider path={path} data={data} />}
          {tab === 'discover' && <DiscoverModels path={path} data={data} etag={etag} onSaved={provider.reload} />}
        </>
      )}
    </Panel>
  );
}

function EditProvider({ path, data, etag, onSaved }) {
  const { client } = usePlayground();
  const templates = {
    selected_models: () => ({ selected_models: data.selected_models || [] }),
    tags: () => ({ tags: data.tags || {} }),
    upstream_limits: () => ({ upstream_limits: data.upstream_limits || {} }),
    model_costs: () => ({ model_costs: data.model_costs || {} }),
    provider_settings: () => ({ provider_settings: {} }),
  };
  const [patch, setPatch] = useState(pretty(templates.selected_models()));
  const action = useAction();
  const parsed = parseJson(patch);
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>
        Label and type are immutable. Omitted fields keep their value. In provider_settings a blank secret keeps the
        stored one.
      </p>
      <div className={styles.inline}>
        {Object.keys(templates).map((k) => (
          <Btn key={k} onClick={() => setPatch(pretty(templates[k]()))}>
            {k}
          </Btn>
        ))}
      </div>
      <JsonField label="PATCH body" rows={12} value={patch} onChange={setPatch} />
      <div className={styles.actionsRow}>
        <ActionButton
          method="PATCH"
          path="/providers/{label}"
          scopes={['providers:write']}
          variant="primary"
          disabled={!!parsed.error || !parsed.value}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'PATCH', path, body: parsed.value, headers: { 'If-Match': etag }, source: 'Update provider' });
              onSaved();
              return res;
            }, 'Provider saved.')
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
    </div>
  );
}

function TestProvider({ path, data }) {
  const { client } = usePlayground();
  const models = data.selected_models || [];
  const [kind, setKind] = useState('model');
  const [model, setModel] = useState(models[0] || '');
  const [draft, setDraft] = useState(pretty({ provider_settings: {}, models: models.slice(0, 3) }));
  const [result, setResult] = useState(null);
  const action = useAction();
  const parsed = parseJson(draft);
  return (
    <div className={styles.stack}>
      <div className={styles.subPanel}>
        <h3>Test the stored configuration</h3>
        <p className={styles.muted}>Calls the upstream with the saved credentials. Model tests can incur upstream usage.</p>
        <div className={styles.inline}>
          <Field label="Kind">
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="model">One model</option>
              <option value="connection">Connection</option>
            </select>
          </Field>
          <Field label="Model">
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {kind === 'connection' && <option value="">First 10 selected models</option>}
              {models.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <ActionButton
            method="POST"
            path="/providers/{label}/test"
            scopes={['providers:write']}
            variant="primary"
            disabled={kind === 'model' && !model}
            onClick={() =>
              action.run(async () => {
                const res = await client.call({
                  method: 'POST',
                  path: `${path}/test`,
                  body: { kind, ...(model ? { model } : {}) },
                  source: 'Test provider',
                });
                setResult(res);
              })
            }
          >
            Run test
          </ActionButton>
        </div>
      </div>
      <div className={styles.subPanel}>
        <h3>Test draft settings</h3>
        <p className={styles.muted}>
          Overlays draft provider_settings on the stored provider and probes up to 10 models. Nothing is saved.
        </p>
        <JsonField label="Body" rows={6} value={draft} onChange={setDraft} />
        <ActionButton
          method="POST"
          path="/providers/{label}/test-settings"
          scopes={['providers:write']}
          disabled={!!parsed.error}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'POST', path: `${path}/test-settings`, body: parsed.value || {}, source: 'Test draft settings' });
              setResult(res);
            })
          }
        >
          Test draft
        </ActionButton>
      </div>
      <ApiChips calls={[['POST', '/providers/{label}/test'], ['POST', '/providers/{label}/test-settings']]} />
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <ProbeResult result={result} />
    </div>
  );
}

function DiscoverModels({ path, data, etag, onSaved }) {
  const { client } = usePlayground();
  const [validate, setValidate] = useState(false);
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState([]);
  const action = useAction();
  const listed = result?.discovery?.models || [];
  const current = data.selected_models || [];
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>Lists the models the upstream offers using the stored credentials. Validation also probes each one and takes longer.</p>
      <div className={styles.inline}>
        <Checkbox label="Validate each model" checked={validate} onChange={setValidate} />
        <ActionButton
          method="POST"
          path="/providers/{label}/available-models"
          scopes={['providers:write']}
          variant="primary"
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'POST', path: `${path}/available-models`, body: { validate }, source: 'Discover models' });
              setResult(res);
              setChecked([]);
            })
          }
        >
          Discover models
        </ActionButton>
        <ApiChips calls={[['POST', '/providers/{label}/available-models']]} />
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {listed.length > 0 && (
        <div className={styles.subPanel}>
          <h3>Add models to this provider</h3>
          <div className={styles.checkGrid}>
            {listed
              .filter((m) => !current.includes(m.id))
              .map((m) => (
                <Checkbox
                  key={m.id}
                  label={m.id}
                  checked={checked.includes(m.id)}
                  onChange={(v) => setChecked((c) => (v ? [...c, m.id] : c.filter((x) => x !== m.id)))}
                />
              ))}
          </div>
          <ActionButton
            method="PATCH"
            path="/providers/{label}"
            scopes={['providers:write']}
            disabled={!checked.length}
            onClick={() =>
              action.run(async () => {
                const res = await client.call({
                  method: 'PATCH',
                  path,
                  body: { selected_models: [...current, ...checked] },
                  headers: { 'If-Match': etag },
                  source: 'Add discovered models',
                });
                setChecked([]);
                onSaved();
                return res;
              }, 'Models added.')
            }
          >
            Add {checked.length || ''} selected
          </ActionButton>
        </div>
      )}
      <ProbeResult result={result} />
    </div>
  );
}
