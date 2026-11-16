import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
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
  Panel,
  Pill,
  Table,
  fmt,
  parseJson,
  pretty,
  useAction,
  usePlayground,
} from '../ManagementPlayground/ui';
import { useLoad, when } from '../ManagementPlayground/shared';
import { redactSecrets } from '../ManagementPlayground/client.mjs';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX, ifMatch, mcpPath } from './routes.mjs';
import { GoTo, McpPicker, WriteError, useInventory, useMcpName } from './common';

// REST API MCPs (MCPs created with POST /mcps/api): read and change the
// configuration, preview an operation selection, test access rules and resync
// the OpenAPI document. Values the API never returns (fixed parameter values,
// URL query strings) are kept by PATCH unless replaced, so this page only
// sends the fields you change.

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

export default function RestApi() {
  const { client, urlParam, setParam } = usePlayground();
  const id = urlParam('mcp');
  const inventory = useInventory();
  if (!client) return <ConnectFirst what="change REST API MCPs" />;
  const apis = (inventory.data || []).filter((m) => m.execution_type === 'api' || m.source === 'api');
  return (
    <div className={styles.stack}>
      <Panel
        title="REST API MCPs"
        subtitle="Change a REST API MCP after it was created: base URL, limits, access rules and which OpenAPI operations become tools. Preview a selection, test access rules and resync the OpenAPI document from its source."
      >
        <McpPicker hint="Pick an MCP created from a REST API. Other MCPs answer 409 not_api_mcp." />
        {apis.length > 0 && (
          <div className={styles.actionsRow}>
            <span className={styles.muted}>REST API MCPs:</span>
            {apis.map((m) => (
              <Btn key={m.id} variant={m.id === id ? 'primary' : undefined} onClick={() => setParam('mcp', m.id)}>
                {m.name}
              </Btn>
            ))}
          </div>
        )}
        {inventory.data && !apis.length && (
          <p className={styles.muted}>
            No REST API MCPs yet. Add one in <GoTo tab="create">Create and catalog</GoTo> (Add a REST API).
          </p>
        )}
      </Panel>
      {id ? <ApiConfig key={id} id={id} /> : <p className={styles.muted}>Select a REST API MCP to see its configuration.</p>}
      <RuleTester />
    </div>
  );
}

function blankForm(config) {
  return {
    base_url: '',
    timeout_s: config?.timeout_s != null ? String(config.timeout_s) : '',
    max_response_bytes: config?.max_response_bytes != null ? String(config.max_response_bytes) : '',
    access: pretty(config?.access || {}),
    fallback: !!config?.openapi?.enable_generic_fallback,
    ops: {},
    removed: {},
  };
}

/** The PATCH body for what changed in the form (null when nothing did). */
function patchBody(config, form) {
  if (!config || !form) return { body: null, error: null };
  const body = {};
  if (form.base_url.trim()) body.base_url = form.base_url.trim();
  for (const [name, integer] of [['timeout_s', false], ['max_response_bytes', true]]) {
    const text = form[name].trim();
    const before = config[name] != null ? String(config[name]) : '';
    if (text === before) continue;
    const value = Number(text);
    if (!text || !Number.isFinite(value) || value <= 0 || (integer && !Number.isInteger(value))) {
      return { body: null, error: `${name} must be a positive ${integer ? 'integer' : 'number'}.` };
    }
    body[name] = value;
  }
  const access = parseJson(form.access);
  if (access.error) return { body: null, error: `access: ${access.error}` };
  if (JSON.stringify(access.value || {}) !== JSON.stringify(config.access || {})) body.access = access.value || {};
  if (config.openapi) {
    const overrides = {};
    for (const [key, change] of Object.entries(form.ops)) {
      const item = {};
      if (change.enabled !== undefined) item.enabled = change.enabled;
      if (change.name !== undefined && change.name.trim()) item.name = change.name.trim();
      if (Object.keys(item).length) overrides[key] = item;
    }
    for (const key of Object.keys(form.removed)) overrides[key] = null;
    const openapi = {};
    if (Object.keys(overrides).length) openapi.overrides = overrides;
    if (form.fallback !== !!config.openapi.enable_generic_fallback) openapi.enable_generic_fallback = form.fallback;
    if (Object.keys(openapi).length) body.openapi = openapi;
  }
  return { body: Object.keys(body).length ? body : null, error: null };
}

function ApiConfig({ id }) {
  const { client } = usePlayground();
  const name = useMcpName(id);
  const [withOps, setWithOps] = useState(true);
  const cfg = useLoad(
    () => client.call({ path: mcpPath(id, '/api-config'), query: withOps ? { include_operations: 'true' } : {}, source: 'API config' }),
    [client, id, withOps],
  );
  const config = cfg.data?.api_config;
  const version = cfg.data?.version;
  const [form, setForm] = useState(null);
  useEffect(() => {
    if (config) setForm(blankForm(config));
  }, [config]);
  const save = useAction();
  const preview = useAction();
  const [previewResult, setPreviewResult] = useState(null);
  const [diff, setDiff] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setOp = (key, patch) => setForm((f) => ({ ...f, ops: { ...f.ops, [key]: { ...(f.ops[key] || {}), ...patch } } }));
  const { body, error: formError } = patchBody(config, form);
  const operations = config?.openapi?.operations || [];
  const overrides = config?.openapi?.overrides || {};

  async function runPreview() {
    await preview.run(async () => {
      const candidate = {};
      if (body?.access) candidate.access = body.access;
      if (body?.openapi?.overrides) candidate.overrides = body.openapi.overrides;
      const res = await client.call({ method: 'POST', path: mcpPath(id, '/api-config/selection-preview'), body: candidate, source: 'Selection preview' });
      setPreviewResult(res);
      return res;
    });
  }

  return (
    <>
      <Panel
        title={`Configuration of ${name}`}
        subtitle="URLs show origin and path only; fixed parameter values are listed by name. version is the If-Match for the change below."
        actions={
          <>
            <ApiChips calls={[['GET', '/mcps/{mcp_id}/api-config'], ['PATCH', '/mcps/{mcp_id}/api-config']]} />
            <Checkbox label="Include operations" checked={withOps} onChange={setWithOps} />
            <Btn onClick={cfg.reload}>
              <RefreshCw size={13} aria-hidden /> Reload
            </Btn>
          </>
        }
      >
        <ErrorBox error={cfg.error} />
        {config && (
          <KeyValue
            items={[
              ['Mode', <Pill key="m">{config.mode}</Pill>],
              ['Base URL', <span key="b"><code>{config.base_url}</code>{config.base_url_has_credentials ? <> <Pill tone="warn">has a query string or user info (kept, not shown)</Pill></> : null}</span>],
              ['Timeout (s)', fmt(config.timeout_s)],
              ['Max response bytes', fmt(config.max_response_bytes)],
              config.openapi ? ['OpenAPI source', config.openapi.source_url ? <code key="s">{config.openapi.source_url}</code> : 'uploaded document'] : null,
              config.openapi?.info ? ['Document', `${config.openapi.info.title || '-'} ${config.openapi.info.version || ''}`] : null,
              config.openapi?.totals ? ['Operations', `${config.openapi.totals.selected} selected of ${config.openapi.totals.operations}`] : null,
              ['Tools', (config.tools || []).join(', ') || '-'],
              config.remote_connector ? ['Remote connector', `${config.remote_connector.name || config.remote_connector.id} (${config.remote_connector.connected ? 'connected' : 'offline'})`] : null,
              ['Extra header names', (config.extra_header_names || []).join(', ') || '-'],
              ['API revision', fmt(config.api_revision)],
              ['Updated', when(config.updated_at)],
              ['Version', <code key="v">{version}</code>],
            ]}
          />
        )}
        {config && Object.keys(overrides).length > 0 && (
          <>
            <h3>Saved overrides</h3>
            <Table
              rows={Object.entries(overrides).map(([key, value]) => ({ key, ...value }))}
              rowKey={(r) => r.key}
              columns={[
                { label: 'Operation', render: (r) => <code>{r.key}</code> },
                { label: 'Name', render: (r) => fmt(r.name) },
                { label: 'Enabled', render: (r) => (r.enabled == null ? 'by rules' : fmt(r.enabled)) },
                { label: 'Fixed parameters', render: (r) => (r.fixed_param_names || []).join(', ') || '-' },
                {
                  label: '',
                  render: (r) => (
                    <Checkbox
                      label="Remove"
                      checked={!!form?.removed[r.key]}
                      onChange={(v) => setForm((f) => {
                        const removed = { ...f.removed };
                        if (v) removed[r.key] = true;
                        else delete removed[r.key];
                        return { ...f, removed };
                      })}
                    />
                  ),
                },
              ]}
            />
          </>
        )}
      </Panel>

      {config && form && (
        <Panel
          title="Change the configuration"
          subtitle="Only the fields you change are sent. Fixed parameter values and the hidden parts of URLs stay as saved. A new base URL, a remote connector change or nonempty fixed_params need credentials:write."
        >
          <div className={styles.formGrid}>
            <Field label="New base URL (optional)" hint="Empty keeps the saved URL, including any query string. Changing the base URL needs credentials:write (the destination receives the upstream credential).">
              <input value={form.base_url} onChange={(e) => set({ base_url: e.target.value })} placeholder={config.base_url} spellCheck="false" />
            </Field>
            <Field label="Timeout (seconds)">
              <input value={form.timeout_s} onChange={(e) => set({ timeout_s: e.target.value })} inputMode="decimal" />
            </Field>
            <Field label="Max response bytes">
              <input value={form.max_response_bytes} onChange={(e) => set({ max_response_bytes: e.target.value })} inputMode="numeric" />
            </Field>
          </div>
          <AccessEditor value={form.access} onChange={(v) => set({ access: v })} />
          {config.openapi && <Checkbox label="Also expose a generic request tool" checked={form.fallback} onChange={(v) => set({ fallback: v })} />}
          {config.openapi && operations.length > 0 && (
            <Table
              rows={operations}
              rowKey={(r) => r.key}
              columns={[
                { label: 'Operation', render: (r) => <code>{r.key}</code> },
                { label: 'Tool', render: (r) => <code>{fmt(r.tool_name)}</code> },
                { label: 'Selected', render: (r) => <Pill tone={r.selected ? 'ok' : undefined}>{r.selected ? 'yes' : 'no'}</Pill> },
                { label: 'Why', render: (r) => fmt(r.selection_reason) },
                {
                  label: 'Set',
                  render: (r) => {
                    const change = form.ops[r.key] || {};
                    const value = change.enabled === undefined ? '' : String(change.enabled);
                    return (
                      <select
                        aria-label={`Enabled for ${r.key}`}
                        value={value}
                        onChange={(e) => setOp(r.key, { enabled: e.target.value === '' ? undefined : e.target.value === 'true' })}
                      >
                        <option value="">unchanged</option>
                        <option value="true">on</option>
                        <option value="false">off</option>
                      </select>
                    );
                  },
                },
                {
                  label: 'Rename',
                  render: (r) => (
                    <input
                      aria-label={`New tool name for ${r.key}`}
                      value={form.ops[r.key]?.name || ''}
                      onChange={(e) => setOp(r.key, { name: e.target.value })}
                      placeholder={r.tool_name || ''}
                      spellCheck="false"
                    />
                  ),
                },
              ]}
            />
          )}
          {config.openapi && !operations.length && <p className={styles.muted}>Turn on Include operations to change operations one by one.</p>}
          <details>
            <summary>Request body</summary>
            <JsonView value={redactSecrets(body || {})} />
          </details>
          {formError && <p className={styles.errorText}>{formError}</p>}
          <div className={styles.actionsRow}>
            <ActionButton
              method="PATCH"
              path="/mcps/{mcp_id}/api-config"
              variant="primary"
              disabled={!body || !!formError || !version}
              onClick={() =>
                save.run(async () => {
                  const res = await client.call({ method: 'PATCH', path: mcpPath(id, '/api-config'), body, headers: { 'If-Match': ifMatch(version) }, source: 'Update API config' });
                  setDiff(res.tool_diff || null);
                  setPreviewResult(null);
                  cfg.setData(res);
                  return res;
                }, (res) => `Saved (${res.version}).`)
              }
            >
              Save changes
            </ActionButton>
            {config.openapi && (
              <ActionButton method="POST" path="/mcps/{mcp_id}/api-config/selection-preview" disabled={!!formError} onClick={runPreview}>
                Preview selection
              </ActionButton>
            )}
            <Btn onClick={() => setForm(blankForm(config))}>Reset</Btn>
          </div>
          <WriteError error={save.error} onDismiss={() => save.setError(null)} onReload={() => { save.setError(null); cfg.reload(); }} />
          <Notice tone="ok" onDismiss={() => save.setNotice('')}>{save.notice}</Notice>
          {diff && (
            <KeyValue
              items={[
                ['Tools added', (diff.added || []).join(', ') || '-'],
                ['Tools removed', (diff.removed || []).join(', ') || '-'],
                ['Tools changed', (diff.changed || []).map((c) => (typeof c === 'string' ? c : c.name || JSON.stringify(c))).join(', ') || '-'],
              ]}
            />
          )}
          <ErrorBox error={preview.error} onDismiss={() => preview.setError(null)} />
          {previewResult && (
            <div className={styles.subPanel}>
              <h3>
                Selection preview: {previewResult.totals?.selected} of {previewResult.totals?.operations} operations (nothing saved)
              </h3>
              <Table
                rows={previewResult.operations || []}
                rowKey={(r) => r.key}
                columns={[
                  { label: 'Operation', render: (r) => <code>{r.key}</code> },
                  { label: 'Tool', render: (r) => <code>{fmt(r.tool_name)}</code> },
                  { label: 'Selected', render: (r) => <Pill tone={r.selected ? 'ok' : undefined}>{r.selected ? 'yes' : 'no'}</Pill> },
                  { label: 'Why', render: (r) => fmt(r.selection_reason) },
                ]}
              />
            </div>
          )}
        </Panel>
      )}
      {config && <SavedAccessTest id={id} />}
      {config?.openapi && <Resync id={id} version={version} onApplied={cfg.reload} sourced={!!config.openapi.source_url} />}
    </>
  );
}

function AccessEditor({ value, onChange }) {
  const { client } = usePlayground();
  const presets = useLoad(() => client.call({ path: `${MCP_PREFIX}/api-access/presets`, source: 'Access presets' }), [client], !!client);
  const names = Object.keys(presets.data?.presets || {});
  return (
    <div className={styles.stack} style={{ gap: 8 }}>
      <div className={styles.inline}>
        <Field label="Start from a preset" hint="Fills the rules below; nothing is saved until you save.">
          <select value="" onChange={(e) => e.target.value && onChange(pretty(presets.data.presets[e.target.value]))} disabled={!names.length}>
            <option value="">{presets.loading ? 'Loading presets...' : names.length ? 'Choose a preset' : 'No presets'}</option>
            {names.map((n) => (
              <option key={n} value={n}>
                {n.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </Field>
        <ApiChips calls={[['GET', '/api-access/presets']]} />
      </div>
      <ErrorBox error={presets.error} />
      <JsonField
        label="Access rules"
        rows={6}
        value={value}
        onChange={onChange}
        hint='{"allow": [...], "deny": [...]}. Each rule matches methods, a path glob, keywords or OpenAPI tags. Deny wins; a nonempty allow list must match.'
      />
    </div>
  );
}

function RequestLine({ method, path, onMethod, onPath }) {
  return (
    <>
      <Field label="Method">
        <select value={method} onChange={(e) => onMethod(e.target.value)}>
          {METHODS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </Field>
      <Field label="Path">
        <input value={path} onChange={(e) => onPath(e.target.value)} placeholder="/invoices/42" spellCheck="false" />
      </Field>
    </>
  );
}

function Decision({ result }) {
  const d = result?.decision;
  if (!d) return null;
  return (
    <KeyValue
      items={[
        ['Allowed', <Pill key="a" tone={d.allowed ? 'ok' : 'err'}>{d.allowed ? 'allowed' : 'blocked'}</Pill>],
        ['Rule list', fmt(d.list)],
        ['Rule index', fmt(d.index)],
        ['Reason', fmt(d.reason)],
        d.operation ? ['Operation', <span key="o"><code>{d.operation.key}</code> (tool {fmt(d.operation.tool_name)}, {d.operation.selected ? 'selected' : 'not selected'})</span>] : null,
      ]}
    />
  );
}

function SavedAccessTest({ id }) {
  const { client } = usePlayground();
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/');
  const [result, setResult] = useState(null);
  const action = useAction();
  return (
    <Panel title="Test the saved rules" subtitle="Whether the saved access rules allow one request, and which OpenAPI operation the path maps to." actions={<ApiChips calls={[['POST', '/mcps/{mcp_id}/api-config/access-test']]} />}>
      <form
        className={styles.inline}
        onSubmit={(e) => {
          e.preventDefault();
          action.run(async () => {
            const res = await client.call({ method: 'POST', path: mcpPath(id, '/api-config/access-test'), body: { method, path }, source: 'Access test' });
            setResult(res);
            return res;
          });
        }}
      >
        <RequestLine method={method} path={path} onMethod={setMethod} onPath={setPath} />
        <Btn type="submit" variant="primary" disabled={!path.startsWith('/')}>
          Test
        </Btn>
      </form>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Decision result={result} />
    </Panel>
  );
}

function RuleTester() {
  const { client } = usePlayground();
  const [access, setAccess] = useState('{\n  "deny": [{"methods": ["DELETE"]}]\n}');
  const [method, setMethod] = useState('DELETE');
  const [path, setPath] = useState('/invoices/42');
  const [result, setResult] = useState(null);
  const action = useAction();
  const parsed = parseJson(access);
  return (
    <Panel title="Test rules before saving" subtitle="Evaluate access rules you have not saved against one request. Needs no MCP." actions={<ApiChips calls={[['POST', '/api-access/test']]} />}>
      <AccessEditor value={access} onChange={setAccess} />
      <div className={styles.inline}>
        <RequestLine method={method} path={path} onMethod={setMethod} onPath={setPath} />
        <ActionButton
          method="POST"
          path="/api-access/test"
          variant="primary"
          disabled={!!parsed.error || !path.startsWith('/')}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'POST', path: `${MCP_PREFIX}/api-access/test`, body: { access: parsed.value || {}, method, path }, source: 'Rule test' });
              setResult(res);
              return res;
            })
          }
        >
          Test
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Decision result={result} />
    </Panel>
  );
}

function Resync({ id, version, onApplied, sourced }) {
  const { client, confirm } = usePlayground();
  const [result, setResult] = useState(null);
  const action = useAction();
  const view = result;
  async function run(apply) {
    if (apply) {
      const ok = await confirm({
        title: 'Save the fetched document?',
        body: 'The OpenAPI document is downloaded again and saved. Overrides of operations that still exist are kept; new operations are saved turned off; tools of removed operations disappear.',
        confirmLabel: 'Resync and save',
        call: `POST ${mcpPath(id, '/api-config/resync')}?apply=true`,
      });
      if (!ok) return;
    }
    await action.run(async () => {
      const res = await client.call({
        method: 'POST',
        path: mcpPath(id, '/api-config/resync'),
        query: apply ? { apply: 'true' } : {},
        headers: apply ? { 'If-Match': ifMatch(version) } : {},
        body: {},
        source: apply ? 'Resync (apply)' : 'Resync (dry run)',
      });
      setResult(res);
      if (res.applied) onApplied();
      return res;
    }, (res) => (res.applied ? `Saved (${res.version}).` : 'Dry run: nothing saved.'));
  }
  return (
    <Panel
      title="Resync the OpenAPI document"
      subtitle="Download the document again from its source URL and see added and removed operations. Applying saves it (If-Match). A protected document needs fetch_headers, which need credentials:write (use the API Explorer)."
      actions={<ApiChips calls={[['POST', '/mcps/{mcp_id}/api-config/resync']]} />}
    >
      {!sourced && <Notice tone="warn">This MCP's document was uploaded, so the gateway answers 409 spec_uploaded. Send a new document with PATCH api-config instead.</Notice>}
      <div className={styles.actionsRow}>
        <ActionButton method="POST" path="/mcps/{mcp_id}/api-config/resync" onClick={() => run(false)}>
          Dry run
        </ActionButton>
        <ActionButton method="POST" path="/mcps/{mcp_id}/api-config/resync" variant="primary" disabled={!version} onClick={() => run(true)}>
          Resync and save
        </ActionButton>
      </div>
      <WriteError error={action.error} onDismiss={() => action.setError(null)} onReload={() => { action.setError(null); onApplied(); }} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>{action.notice}</Notice>
      {view && (
        <>
          <KeyValue
            items={[
              ['Applied', fmt(view.applied)],
              ['API revision', fmt(view.api_revision)],
              ['Removed operations', (view.removed_operations || []).join(', ') || '-'],
              ['Selected', view.totals ? `${view.totals.selected} of ${view.totals.operations}` : '-'],
              ['Tools added', (view.tool_diff?.added || []).join(', ') || '-'],
              ['Tools removed', (view.tool_diff?.removed || []).join(', ') || '-'],
              view.error ? ['Would fail', <Pill key="e" tone="err">{view.error.code}</Pill>] : null,
            ]}
          />
          {(view.new_operations || []).length > 0 && (
            <Table
              rows={view.new_operations}
              rowKey={(r) => r.key}
              columns={[
                { label: 'New operation', render: (r) => <code>{r.key}</code> },
                { label: 'Tool', render: (r) => <code>{fmt(r.tool_name)}</code> },
                { label: 'Summary', render: (r) => fmt(r.summary) },
              ]}
            />
          )}
          {(view.new_operations || []).length > 0 && <p className={styles.muted}>New operations are saved turned off; turn them on in Change the configuration.</p>}
        </>
      )}
    </Panel>
  );
}
