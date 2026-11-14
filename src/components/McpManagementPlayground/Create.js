import React, { useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { redactSecrets } from '../ManagementPlayground/client.mjs';
import { bodyExamples } from '../ManagementPlayground/spec.mjs';
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
  Tabs,
  fmt,
  parseJson,
  pretty,
  useAction,
  useCollection,
  usePlayground,
} from '../ManagementPlayground/ui';
import { useDetailReveal, useLoad } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX } from './routes.mjs';
import {
  ConnectLinkBox,
  GoTo,
  IdempotencyKeyField,
  OperationLookup,
  StatePill,
  Warnings,
  WriteError,
  invalidateInventory,
  useIdempotencyKey,
} from './common';

const VIEWS = [
  ['custom', 'Custom MCP'],
  ['catalog', 'MCP Library'],
  ['api', 'REST API'],
  ['operation', 'Operation lookup'],
];

export default function Create() {
  const { client, urlParam, setParam } = usePlayground();
  const view = VIEWS.some(([v]) => v === urlParam('view')) ? urlParam('view') : 'custom';
  if (!client) return <ConnectFirst what="add, install and preview MCPs" />;
  return (
    <div className={styles.stack}>
      <Tabs label="Ways to add an MCP" value={view} onChange={(v) => setParam('view', v)} tabs={VIEWS} />
      {view === 'custom' && <CustomMcp />}
      {view === 'catalog' && <Catalog />}
      {view === 'api' && <ApiMcp />}
      {view === 'operation' && (
        <Panel
          title="Operation lookup"
          subtitle="Creates return operation_id. If a create answers 503 operation_pending, look up its state here, then retry the original request with the same Idempotency-Key."
          actions={<ApiChips calls={[['GET', '/operations/{op_id}']]} />}
        >
          <OperationLookup initialId={urlParam('op_id')} />
        </Panel>
      )}
    </div>
  );
}

/** Parses an optional JSON object field; undefined when empty. */
function optionalObject(text) {
  const parsed = parseJson(text);
  if (parsed.error) return { error: parsed.error };
  if (parsed.value === undefined) return { value: undefined };
  if (!parsed.value || typeof parsed.value !== 'object' || Array.isArray(parsed.value)) return { error: 'Enter a JSON object.' };
  return { value: parsed.value };
}

const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''));

/** The 201 McpCreated response of a create or install: the MCP, its connection, warnings and connect link. */
function CreateResult({ result, onDismiss }) {
  const [connect, setConnect] = useState(result.connect || null);
  const m = result.mcp || {};
  return (
    <div className={styles.subPanel} role="status">
      <div className={styles.cardHead}>
        <h3>Created {m.name}</h3>
        <StatePill state={result.connection?.state || m.connection_state} />
        <Btn onClick={onDismiss}>Close</Btn>
      </div>
      <KeyValue
        items={[
          ['Id', <code key="i">{m.id}</code>],
          ['Endpoint', m.endpoint_urls?.mcp ? <code key="e">{m.endpoint_urls.mcp}</code> : '-'],
          ['Enabled', fmt(m.enabled)],
          ['Auth', `${fmt(result.connection?.auth_type || m.auth_type)}${result.connection?.oauth_mode ? ` (${result.connection.oauth_mode})` : ''}`],
          ['Tools', fmt(result.connection?.tool_count ?? m.tool_count)],
          ['Operation', result.operation_id ? <code key="o">{result.operation_id}</code> : '-'],
          ['Version', <code key="v">{m.version}</code>],
        ]}
      />
      <Warnings items={result.warnings} />
      <ConnectLinkBox connect={connect} onDismiss={() => setConnect(null)} />
      {m.id && (
        <p className={styles.muted}>
          Next: <GoTo tab="mcps" mcp={m.id}>open the MCP</GoTo>, <GoTo tab="settings" mcp={m.id}>change its settings</GoTo> or{' '}
          <GoTo tab="connections" mcp={m.id}>check its connection</GoTo>.
        </p>
      )}
    </div>
  );
}

/** Runs a create with the Idempotency-Key; keeps the key on failure so a retry cannot duplicate. */
function useCreate(idem, source) {
  const { client } = usePlayground();
  const action = useAction();
  const [result, setResult] = useState(null);
  const run = (path, body) =>
    action.run(async () => {
      setResult(null);
      const res = await client.call({ method: 'POST', path, body, headers: { 'Idempotency-Key': idem.key }, source });
      setResult(res);
      idem.regenerate();
      invalidateInventory(client);
      return res;
    }, (res) => `Created ${res.mcp?.name || 'the MCP'}.`);
  return { action, result, setResult, run };
}

const AUTH_TYPES = [
  ['none', 'none: no upstream credential'],
  ['static', 'static: API key or token'],
  ['oauth_dcr', 'oauth_dcr: OAuth with dynamic client registration'],
  ['oauth_login', 'oauth_login: OAuth with your registered client'],
  ['oauth_passthrough', 'oauth_passthrough: each client brings its own token'],
];
const BLANK_CUSTOM = {
  name: '',
  transport: '',
  slug: '',
  description: '',
  type: 'none',
  token: '',
  header_name: '',
  query_param: '',
  scheme: '',
  client_id: '',
  client_secret: '',
  extra_headers: '',
  extra_query_params: '',
  remote_connector_id: '',
  enabled: true,
  settings: '',
};

function CustomMcp() {
  const { client } = usePlayground();
  const [form, setForm] = useState(BLANK_CUSTOM);
  const [probe, setProbe] = useState(null);
  const probeAction = useAction();
  const idem = useIdempotencyKey('create-mcp');
  const create = useCreate(idem, 'Create MCP');
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const headers = optionalObject(form.extra_headers);
  const queryParams = optionalObject(form.extra_query_params);
  const settings = optionalObject(form.settings);
  const jsonError = headers.error || queryParams.error || settings.error;
  const transport = form.transport.trim();

  const auth = compact({
    type: form.type,
    ...(form.type === 'static' ? { token: form.token, header_name: form.header_name.trim(), query_param: form.query_param.trim(), scheme: form.scheme.trim() } : {}),
    ...(form.type === 'oauth_dcr' || form.type === 'oauth_login' ? { client_id: form.client_id.trim(), client_secret: form.client_secret } : {}),
    extra_headers: headers.value,
    extra_query_params: queryParams.value,
  });
  const body = compact({
    name: form.name.trim(),
    transport,
    slug: form.slug.trim(),
    description: form.description.trim(),
    auth,
    remote_connector_id: form.remote_connector_id.trim(),
    enabled: form.enabled ? undefined : false,
    settings: settings.value,
  });
  const probeBody = compact({ transport, extra_headers: headers.value, extra_query_params: queryParams.value, remote_connector_id: form.remote_connector_id.trim() });
  const probed = probe && probe.transport === transport;
  const needs = [
    'mcps:write',
    (form.token || form.client_id || form.client_secret || headers.value || queryParams.value || /\?|@/.test(transport.replace(/^https?:\/\//, ''))) && 'credentials:write',
    settings.value && 'settings:write',
  ].filter(Boolean);

  return (
    <Panel
      title="Add a remote MCP"
      subtitle="Check the URL first: the probe reports the transport, OAuth discovery and whether a credential is required, without saving anything. Then create the MCP with the auth type it needs."
      actions={<ApiChips calls={[['POST', '/mcps:probe'], ['POST', '/mcps']]} />}
    >
      <div className={styles.formGrid}>
        <Field label="MCP URL (transport)" hint="Streamable HTTP or SSE endpoint. A query string or user:password in the URL counts as a credential.">
          <input type="url" value={form.transport} onChange={(e) => set({ transport: e.target.value })} placeholder="https://files.example.com/mcp" spellCheck="false" />
        </Field>
        <Field label="Remote connector id (optional)" hint="For servers on a private network.">
          <input value={form.remote_connector_id} onChange={(e) => set({ remote_connector_id: e.target.value })} spellCheck="false" />
        </Field>
      </div>
      <details>
        <summary>Extra headers and query parameters (optional, sent upstream)</summary>
        <div className={styles.formGrid}>
          <JsonField label="extra_headers" rows={3} value={form.extra_headers} onChange={(v) => set({ extra_headers: v })} hint='For example {"X-Tenant": "acme"}. Values are write-only and masked in activity.' />
          <JsonField label="extra_query_params" rows={3} value={form.extra_query_params} onChange={(v) => set({ extra_query_params: v })} />
        </div>
      </details>
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/mcps:probe"
          disabled={!transport || !!headers.error || !!queryParams.error}
          onClick={() =>
            probeAction.run(async () => {
              const res = await client.call({ method: 'POST', path: `${MCP_PREFIX}/mcps:probe`, body: probeBody, source: 'Probe MCP URL' });
              setProbe({ transport, data: res.probe });
              return res;
            }, 'Probe finished.')
          }
        >
          <Search size={13} aria-hidden /> 1. Check URL
        </ActionButton>
        {probed && <Pill tone="ok">checked</Pill>}
      </div>
      <ErrorBox error={probeAction.error} onDismiss={() => probeAction.setError(null)} />
      {probe && (
        <div className={styles.subPanel}>
          <h3>Probe result</h3>
          {probe.data?.requires_auth != null && (
            <p>
              {probe.data.requires_auth ? <Pill tone="warn">requires auth</Pill> : <Pill tone="ok">no credential required</Pill>}{' '}
              {probe.data.requires_auth && 'Choose static (an API key) or an OAuth type below.'}
            </p>
          )}
          <JsonView value={probe.data} maxHeight={280} />
        </div>
      )}

      <h3>2. Create</h3>
      <div className={styles.formGrid}>
        <Field label="Name">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Files" />
        </Field>
        <Field label="Slug (optional)" hint="Sets the endpoint path /<slug>/mcp; derived from the name when empty.">
          <input value={form.slug} onChange={(e) => set({ slug: e.target.value })} spellCheck="false" />
        </Field>
        <Field label="Description (optional)">
          <input value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label="Upstream auth (auth.type)">
          <select value={form.type} onChange={(e) => set({ type: e.target.value })}>
            {AUTH_TYPES.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        {form.type === 'static' && (
          <>
            <Field label="Token" hint="Write-only: never returned, masked in activity and snippets.">
              <input type="password" autoComplete="off" value={form.token} onChange={(e) => set({ token: e.target.value })} />
            </Field>
            <Field label="Header name (optional)" hint="Default: Authorization bearer.">
              <input value={form.header_name} onChange={(e) => set({ header_name: e.target.value })} placeholder="X-Api-Key" />
            </Field>
            <Field label="Query parameter (optional)" hint="Send the token as a query parameter instead.">
              <input value={form.query_param} onChange={(e) => set({ query_param: e.target.value })} />
            </Field>
            <Field label="Scheme (optional)">
              <input value={form.scheme} onChange={(e) => set({ scheme: e.target.value })} placeholder="Bearer" />
            </Field>
          </>
        )}
        {(form.type === 'oauth_dcr' || form.type === 'oauth_login') && (
          <>
            <Field label="OAuth client id (optional)" hint="With your own client, oauth_dcr skips registration and is saved like oauth_login.">
              <input value={form.client_id} onChange={(e) => set({ client_id: e.target.value })} autoComplete="off" />
            </Field>
            <Field label="OAuth client secret (optional)">
              <input type="password" autoComplete="off" value={form.client_secret} onChange={(e) => set({ client_secret: e.target.value })} />
            </Field>
          </>
        )}
      </div>
      <Checkbox label="Enabled after create" checked={form.enabled} onChange={(enabled) => set({ enabled })} />
      <JsonField
        label="settings (optional; needs settings:write)"
        rows={4}
        value={form.settings}
        onChange={(v) => set({ settings: v })}
        hint='For example {"dlp": {"data_risk_action": "redact"}}. A create with settings adds the MCP disabled, applies them, then sets the requested state.'
      />
      {(form.type === 'oauth_dcr' || form.type === 'oauth_login') && (
        <Notice>OAuth MCPs are created pending_connection with a single-use connect link (15 minutes) in the response.</Notice>
      )}
      <IdempotencyKeyField idem={idem} />
      <details>
        <summary>Request body (secrets masked)</summary>
        <JsonView value={redactSecrets(body)} />
      </details>
      <p className={styles.muted}>
        This body needs {needs.map((s) => <code key={s}>{s} </code>)}
        {!probed && transport && ' Check the URL first (step 1) to create.'}
      </p>
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/mcps"
          variant="primary"
          disabled={!body.name || !transport || !!jsonError || !probed}
          onClick={() => create.run(`${MCP_PREFIX}/mcps`, body)}
        >
          Create MCP
        </ActionButton>
        <Btn
          onClick={() => {
            setForm(BLANK_CUSTOM);
            setProbe(null);
          }}
        >
          Clear form
        </Btn>
      </div>
      <WriteError error={create.action.error} onDismiss={() => create.action.setError(null)} />
      {create.result && <CreateResult result={create.result} onDismiss={() => create.setResult(null)} />}
    </Panel>
  );
}

function Catalog() {
  const { client } = usePlayground();
  const [filters, setFilters] = useState({ query: '', install_status: '', auth_type: '' });
  const [applied, setApplied] = useState(filters);
  const [selected, setSelected] = useState(null);
  const detailRef = useDetailReveal(selected);
  const list = useCollection(
    (cursor) => client.call({ path: `${MCP_PREFIX}/catalog`, query: { ...applied, limit: 50, cursor }, source: 'Catalog' }),
    [client, JSON.stringify(applied)],
  );
  return (
    <Panel
      title="MCP Library"
      subtitle="Prebuilt MCPs with your organization's install state. Each installs once per organization."
      actions={
        <>
          <ApiChips calls={[['GET', '/catalog'], ['GET', '/catalog/{catalog_id}'], ['POST', '/catalog/{catalog_id}/install']]} />
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
          setApplied(filters);
        }}
      >
        <Field label="Search">
          <input value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} placeholder="GitHub" />
        </Field>
        <Field label="Install status">
          <select value={filters.install_status} onChange={(e) => setFilters({ ...filters, install_status: e.target.value })}>
            <option value="">All</option>
            <option value="installed">installed</option>
            <option value="not_installed">not installed</option>
          </select>
        </Field>
        <Field label="Auth type">
          <select value={filters.auth_type} onChange={(e) => setFilters({ ...filters, auth_type: e.target.value })}>
            <option value="">All</option>
            {['oauth', 'api_key', 'passthrough', 'oauth_passthrough', 'no_auth', 'none'].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Btn type="submit" variant="primary">
          Search
        </Btn>
      </form>
      <ErrorBox error={list.error} />
      <div className={`${styles.split} ${styles.masterDetail}`}>
        <div>
          <Table
            rows={list.data?.items || []}
            rowKey={(r) => r.id}
            selected={selected}
            onRowClick={(r) => setSelected(r.id)}
            empty={list.loading ? 'Loading...' : 'No catalog MCPs match.'}
            columns={[
              { label: 'Name', render: (r) => <strong>{r.name}</strong> },
              { label: 'Category', render: (r) => fmt(r.category) },
              { label: 'Auth', render: (r) => fmt(r.auth_type) },
              { label: 'State', render: (r) => (r.installed ? <Pill tone="ok">installed</Pill> : <Pill>not installed</Pill>) },
            ]}
          />
          <Pager list={list} />
        </div>
        <div ref={detailRef}>
          {selected ? (
            <CatalogDetail key={selected} id={selected} onInstalled={list.reload} />
          ) : (
            <p className={styles.muted}>Select a catalog MCP to read what it needs and install it.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function CatalogDetail({ id, onInstalled }) {
  const { client, index, spec } = usePlayground();
  const entry = useLoad(() => client.call({ path: `${MCP_PREFIX}/catalog/${encodeURIComponent(id)}`, source: 'Catalog entry' }), [client, id]);
  const examples = useMemo(() => {
    const op = index.byId.get('Install_catalog_mcp');
    return op ? bodyExamples(spec, op) : [];
  }, [index, spec]);
  const [bodyText, setBodyText] = useState('{}');
  const idem = useIdempotencyKey('install-mcp');
  const create = useCreate(idem, 'Install catalog MCP');
  const e = entry.data?.catalog_entry;
  const parsed = optionalObject(bodyText);
  const body = parsed.value || {};
  return (
    <div className={styles.subPanel}>
      <ErrorBox error={entry.error} />
      {entry.loading && !e && <p className={styles.muted}>Loading...</p>}
      {e && (
        <>
          <div className={styles.cardHead}>
            <h3>{e.name}</h3>
            {e.installed ? <Pill tone="ok">installed</Pill> : <Pill>not installed</Pill>}
          </div>
          {e.description && <p>{e.description}</p>}
          <KeyValue
            items={[
              ['Id', <code key="i">{e.id}</code>],
              ['Auth', fmt(e.auth_type)],
              ['Transport', e.transport ? <code key="t">{e.transport}</code> : '-'],
              ['Needs configuration', fmt(e.requires_configuration)],
              ['Needs your own OAuth client', fmt(e.custom_oauth_credentials_required)],
              ['OAuth with login', fmt(e.oauth_with_login)],
              e.installed ? ['Installed as', e.mcp_id ? <GoTo key="m" tab="mcps" mcp={e.mcp_id}>{e.mcp_id}</GoTo> : '-'] : null,
              e.installed ? ['MCP status', fmt(e.mcp_status)] : null,
            ]}
          />
          {Array.isArray(e.install_requirements) && e.install_requirements.length > 0 && (
            <details open>
              <summary>Install requirements</summary>
              <JsonView value={e.install_requirements} maxHeight={240} />
            </details>
          )}
          {!e.installed && (
            <>
              <h3>Install</h3>
              {examples.length > 0 && (
                <div className={styles.inline}>
                  <span className={styles.muted}>Start from:</span>
                  {examples.map(([name, value]) => (
                    <Btn key={name} onClick={() => setBodyText(pretty(value))}>
                      {name}
                    </Btn>
                  ))}
                </div>
              )}
              <JsonField
                label="Install body"
                rows={6}
                value={bodyText}
                onChange={setBodyText}
                hint="Supply the values listed in install_requirements (auth_token, oauth_client_id and oauth_client_secret, transport_values, upstream_auth_*). Missing ones answer 422 install_input_required."
              />
              <IdempotencyKeyField idem={idem} />
              <details>
                <summary>Request body (secrets masked)</summary>
                <JsonView value={redactSecrets(body)} />
              </details>
              <ActionButton
                method="POST"
                path="/catalog/{catalog_id}/install"
                variant="primary"
                disabled={!!parsed.error}
                onClick={async () => {
                  const res = await create.run(`${MCP_PREFIX}/catalog/${encodeURIComponent(e.id)}/install`, body);
                  if (res) {
                    entry.reload();
                    onInstalled();
                  }
                }}
              >
                Install {e.name}
              </ActionButton>
            </>
          )}
          <WriteError error={create.action.error} onDismiss={() => create.action.setError(null)} />
          {create.result && <CreateResult result={create.result} onDismiss={() => create.setResult(null)} />}
        </>
      )}
    </div>
  );
}

const BLANK_API = {
  sourceMode: 'url',
  source_url: '',
  spec_text: '',
  fetch_headers: '',
  access: '',
  name: '',
  base_url: '',
  description: '',
  upstream_auth_type: '',
  auth_token: '',
  upstream_auth_header_name: '',
  upstream_auth_query_param: '',
  upstream_auth_scheme: '',
  enabled: true,
  settings: '',
  extra: '',
};

function ApiMcp() {
  const { client } = usePlayground();
  const [form, setForm] = useState(BLANK_API);
  const [preview, setPreview] = useState(null);
  const previewAction = useAction();
  const idem = useIdempotencyKey('create-api-mcp');
  const create = useCreate(idem, 'Create API MCP');
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const fetchHeaders = optionalObject(form.fetch_headers);
  const access = optionalObject(form.access);
  const settings = optionalObject(form.settings);
  const extra = optionalObject(form.extra);

  const previewBody = compact({
    ...(form.sourceMode === 'url' ? { source_url: form.source_url.trim() } : { spec_text: form.spec_text }),
    fetch_headers: fetchHeaders.value,
    access: access.value,
  });
  const p = preview?.preview;
  const body = compact({
    name: form.name.trim(),
    base_url: form.base_url.trim(),
    description: form.description.trim(),
    openapi: p?.preview_token ? { preview_token: p.preview_token } : undefined,
    access: access.value,
    upstream_auth_type: form.upstream_auth_type || undefined,
    ...(form.upstream_auth_type
      ? compact({
          auth_token: form.auth_token,
          upstream_auth_header_name: form.upstream_auth_header_name.trim(),
          upstream_auth_query_param: form.upstream_auth_query_param.trim(),
          upstream_auth_scheme: form.upstream_auth_scheme.trim(),
        })
      : {}),
    enabled: form.enabled ? undefined : false,
    settings: settings.value,
    ...(extra.value || {}),
  });
  const ops = Array.isArray(p?.operations) ? p.operations : [];

  return (
    <Panel
      title="Add a REST API as an MCP"
      subtitle="Preview the OpenAPI document first: nothing is saved, and the returned preview_token lets the create reuse the parsed document."
      actions={<ApiChips calls={[['POST', '/mcps/api:preview'], ['POST', '/mcps/api']]} />}
    >
      <h3>1. Preview</h3>
      <Tabs
        label="OpenAPI source"
        value={form.sourceMode}
        onChange={(sourceMode) => set({ sourceMode })}
        tabs={[
          ['url', 'From a URL'],
          ['text', 'Paste the document'],
        ]}
      />
      {form.sourceMode === 'url' ? (
        <Field label="OpenAPI URL (source_url)">
          <input type="url" value={form.source_url} onChange={(e) => set({ source_url: e.target.value })} placeholder="https://billing.example.com/openapi.json" spellCheck="false" />
        </Field>
      ) : (
        <Field label="OpenAPI document (spec_text, JSON or YAML)" wide>
          <textarea className={styles.code} rows={8} value={form.spec_text} onChange={(e) => set({ spec_text: e.target.value })} spellCheck="false" />
        </Field>
      )}
      <details>
        <summary>Fetch headers and access rules (optional)</summary>
        <div className={styles.formGrid}>
          <JsonField label="fetch_headers" rows={3} value={form.fetch_headers} onChange={(v) => set({ fetch_headers: v })} hint="Headers used to fetch the document; needs credentials:write." />
          <JsonField label="access" rows={3} value={form.access} onChange={(v) => set({ access: v })} hint='Allow and deny rules, for example {"allow": [{"methods": ["GET"]}]}. Also sent with the create.' />
        </div>
      </details>
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/mcps/api:preview"
          disabled={(form.sourceMode === 'url' ? !form.source_url.trim() : !form.spec_text.trim()) || !!fetchHeaders.error || !!access.error}
          onClick={() =>
            previewAction.run(async () => {
              const res = await client.call({ method: 'POST', path: `${MCP_PREFIX}/mcps/api:preview`, body: previewBody, source: 'Preview API spec' });
              setPreview(res);
              const server = res.preview?.servers?.[0];
              const url = typeof server === 'string' ? server : server?.url;
              setForm((f) => ({
                ...f,
                base_url: f.base_url || (url && /^https?:\/\//.test(url) ? url : ''),
                name: f.name || res.preview?.info?.title || '',
              }));
              return res;
            }, 'Preview ready.')
          }
        >
          <Search size={13} aria-hidden /> Preview
        </ActionButton>
      </div>
      <ErrorBox error={previewAction.error} onDismiss={() => previewAction.setError(null)} />
      {p && (
        <div className={styles.subPanel}>
          <div className={styles.cardHead}>
            <h3>
              {p.info?.title || 'Preview'} {p.info?.version && <span className={styles.muted}>{p.info.version}</span>}
            </h3>
            <Pill>
              {fmt(p.totals?.selected)} of {fmt(p.totals?.operations)} operations selected
            </Pill>
          </div>
          <p className={styles.muted}>
            preview_token is valid for {fmt(p.preview_expires_in_seconds)} seconds from {new Date().toLocaleTimeString()}; the create below sends it.
          </p>
          <Warnings items={p.warnings} />
          {ops.length > 0 && (
            <Table
              rows={ops.slice(0, 200)}
              rowKey={(r) => JSON.stringify(r)}
              columns={[
                { label: 'Method', render: (r) => <code>{fmt(r.method)}</code> },
                { label: 'Path', render: (r) => <code>{fmt(r.path)}</code> },
                { label: 'Tool', render: (r) => fmt(r.tool_name || r.name || r.operation_id) },
                { label: 'Selected', render: (r) => (r.selected === undefined ? '-' : r.selected ? <Pill tone="ok">yes</Pill> : <Pill tone="off">no</Pill>) },
              ]}
            />
          )}
          <details>
            <summary>Raw preview</summary>
            <JsonView value={redactSecrets(preview)} maxHeight={360} />
          </details>
        </div>
      )}

      <h3>2. Create</h3>
      <div className={styles.formGrid}>
        <Field label="Name">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Billing API" />
        </Field>
        <Field label="Base URL" hint="Where tool calls are sent.">
          <input type="url" value={form.base_url} onChange={(e) => set({ base_url: e.target.value })} placeholder="https://billing.example.com/v1" spellCheck="false" />
        </Field>
        <Field label="Description (optional)">
          <input value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label="Upstream auth">
          <select value={form.upstream_auth_type} onChange={(e) => set({ upstream_auth_type: e.target.value })}>
            <option value="">none</option>
            <option value="bearer">bearer</option>
            <option value="header">header</option>
            <option value="query">query</option>
          </select>
        </Field>
        {form.upstream_auth_type && (
          <>
            <Field label="Token (auth_token)" hint="Write-only; masked in activity and snippets.">
              <input type="password" autoComplete="off" value={form.auth_token} onChange={(e) => set({ auth_token: e.target.value })} />
            </Field>
            {form.upstream_auth_type === 'header' && (
              <Field label="Header name">
                <input value={form.upstream_auth_header_name} onChange={(e) => set({ upstream_auth_header_name: e.target.value })} placeholder="X-Api-Key" />
              </Field>
            )}
            {form.upstream_auth_type === 'query' && (
              <Field label="Query parameter">
                <input value={form.upstream_auth_query_param} onChange={(e) => set({ upstream_auth_query_param: e.target.value })} placeholder="api_key" />
              </Field>
            )}
            {form.upstream_auth_type === 'bearer' && (
              <Field label="Scheme (optional)">
                <input value={form.upstream_auth_scheme} onChange={(e) => set({ upstream_auth_scheme: e.target.value })} placeholder="Bearer" />
              </Field>
            )}
          </>
        )}
      </div>
      <Checkbox label="Enabled after create" checked={form.enabled} onChange={(enabled) => set({ enabled })} />
      <details>
        <summary>Settings and other fields (optional)</summary>
        <JsonField label="settings (needs settings:write)" rows={3} value={form.settings} onChange={(v) => set({ settings: v })} />
        <JsonField
          label="Additional fields merged into the body"
          rows={3}
          value={form.extra}
          onChange={(v) => set({ extra: v })}
          hint='For example {"timeout_s": 30, "max_response_bytes": 200000} or {"openapi": {"preview_token": "...", "enable_generic_fallback": true}}.'
        />
      </details>
      {!p && <Notice>Preview first to send openapi.preview_token, or create a generic request tool restricted by access rules.</Notice>}
      <IdempotencyKeyField idem={idem} />
      <details>
        <summary>Request body (secrets masked)</summary>
        <JsonView value={redactSecrets(body)} />
      </details>
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/mcps/api"
          variant="primary"
          disabled={!body.name || !body.base_url || !!(settings.error || extra.error || access.error)}
          onClick={() => create.run(`${MCP_PREFIX}/mcps/api`, body)}
        >
          Create API MCP
        </ActionButton>
        <Btn
          onClick={() => {
            setForm(BLANK_API);
            setPreview(null);
          }}
        >
          Clear form
        </Btn>
      </div>
      <WriteError error={create.action.error} onDismiss={() => create.action.setError(null)} />
      {create.result && <CreateResult result={create.result} onDismiss={() => create.setResult(null)} />}
    </Panel>
  );
}
