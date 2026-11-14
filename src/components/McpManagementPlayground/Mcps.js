import React, { useEffect, useState } from 'react';
import { RefreshCw, Trash2, X } from 'lucide-react';
import {
  ActionButton,
  ApiChips,
  Btn,
  Checkbox,
  ConnectFirst,
  CopyButton,
  EnabledPill,
  ErrorBox,
  Field,
  JsonView,
  KeyValue,
  Notice,
  Pager,
  Panel,
  Pill,
  Table,
  Tabs,
  fmt,
  useAction,
  useCollection,
  usePlayground,
} from '../ManagementPlayground/ui';
import { useDetailReveal, useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX, ifMatch, mcpPath } from './routes.mjs';
import { GoTo, StatePill, Warnings, WriteError, invalidateInventory } from './common';

const BLANK = { name: '', slug: '', enabled: '', auth_type: '', source: '', transport_type: '' };
const AUTH_TYPES = ['api_key', 'no_auth', 'oauth', 'oauth_passthrough'];
const SOURCES = ['custom', 'catalog', 'api', 'system'];

export default function Mcps() {
  const { client, urlParam, setParam } = usePlayground();
  const [filters, setFilters] = useState(BLANK);
  const [applied, setApplied] = useState(BLANK);
  const [pageSize, setPageSize] = useState('50');
  const selected = urlParam('mcp');
  const detailRef = useDetailReveal(selected);
  const list = useCollection(
    (cursor) => client.call({ path: `${MCP_PREFIX}/mcps`, query: { ...applied, limit: pageSize, cursor }, source: 'MCPs' }),
    [client, JSON.stringify(applied), pageSize],
    !!client,
  );
  if (!client) return <ConnectFirst what="list and manage MCPs" />;
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  return (
    <div className={styles.stack}>
      <Panel
        title="MCPs"
        subtitle="Every MCP of the organization, enabled and disabled, sorted by name. Tool counts and connection states are live values."
        actions={
          <>
            <ApiChips calls={[['GET', '/mcps'], ['GET', '/mcps/{mcp_id}']]} />
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
          <Field label="Name contains">
            <input value={filters.name} onChange={(e) => set({ name: e.target.value })} placeholder="Files" />
          </Field>
          <Field label="Slug" hint="Exact.">
            <input value={filters.slug} onChange={(e) => set({ slug: e.target.value })} />
          </Field>
          <Field label="Status">
            <select value={filters.enabled} onChange={(e) => set({ enabled: e.target.value })}>
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </Field>
          <Field label="Auth type">
            <select value={filters.auth_type} onChange={(e) => set({ auth_type: e.target.value })}>
              <option value="">All</option>
              {AUTH_TYPES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select value={filters.source} onChange={(e) => set({ source: e.target.value })}>
              <option value="">All</option>
              {SOURCES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Transport type" hint="Exact, for example streamable_http or sse.">
            <input value={filters.transport_type} onChange={(e) => set({ transport_type: e.target.value })} />
          </Field>
          <Field label="Page size">
            <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
              {['10', '25', '50', '100', '200'].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Btn type="submit" variant="primary">
            Apply filters
          </Btn>
          <Btn
            onClick={() => {
              setFilters(BLANK);
              setApplied(BLANK);
            }}
          >
            Clear
          </Btn>
        </form>
        <ErrorBox error={list.error} />
        <div className={`${styles.split} ${styles.masterDetail}`}>
          <div>
            <Table
              rows={list.data?.items || []}
              rowKey={(r) => r.id}
              selected={selected}
              onRowClick={(r) => setParam('mcp', r.id)}
              empty={list.loading ? 'Loading...' : list.error ? 'No data: the request failed (see the error above).' : 'No MCPs match.'}
              columns={[
                {
                  label: 'Name',
                  render: (r) => (
                    <>
                      <strong>{r.name}</strong>
                      <br />
                      <code>{r.slug || r.id}</code>
                    </>
                  ),
                },
                { label: 'Status', render: (r) => <EnabledPill value={r.enabled} /> },
                { label: 'Connection', render: (r) => <StatePill state={r.connection_state} /> },
                { label: 'Auth', render: (r) => fmt(r.auth_type) },
                { label: 'Source', render: (r) => fmt(r.source) },
                { label: 'Tools', render: (r) => <span className={styles.num}>{fmt(r.tool_count)}</span> },
              ]}
            />
            <Pager list={list} />
          </div>
          <div ref={detailRef}>
            {selected ? (
              <McpDetail
                key={selected}
                id={selected}
                onClose={() => setParam('mcp', '')}
                onChanged={() => {
                  invalidateInventory(client);
                  list.reload();
                }}
                onDeleted={() => {
                  invalidateInventory(client);
                  setParam('mcp', '');
                  list.reload();
                }}
              />
            ) : (
              <p className={styles.muted}>Select an MCP to see its identity, connection state and tools, and to rename, enable, disable or remove it.</p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function McpDetail({ id, onClose, onChanged, onDeleted }) {
  const { client, confirm } = usePlayground();
  const [tab, setTab] = useState('identity');
  const mcp = useLoad(() => client.call({ path: mcpPath(id), source: 'MCP detail' }), [client, id]);
  const data = mcp.data?.mcp;
  return (
    <div className={styles.subPanel} aria-label="MCP detail">
      <div className={styles.cardHead}>
        <h3>{data?.name || id}</h3>
        {data && <EnabledPill value={data.enabled} />}
        {data && <StatePill state={data.connection_state} />}
        <Btn onClick={mcp.reload} title="Reload">
          <RefreshCw size={12} aria-hidden /> Reload
        </Btn>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close detail" title="Close">
          <X size={14} />
        </button>
      </div>
      <ErrorBox error={mcp.error} />
      {mcp.loading && !data && <p className={styles.muted}>Loading...</p>}
      {data && (
        <>
          <Tabs
            label="MCP detail"
            value={tab}
            onChange={setTab}
            tabs={[
              ['identity', 'Identity'],
              ['connection', 'Connection'],
              ['tools', `Tools${data.tool_count != null ? ` (${data.tool_count})` : ''}`],
              ['edit', 'Edit'],
            ]}
          />
          {tab === 'identity' && <Identity data={data} />}
          {tab === 'connection' && <ConnectionSummary id={id} />}
          {tab === 'tools' && <Tools id={id} />}
          {tab === 'edit' && (
            <EditMcp
              data={data}
              onSaved={(next) => {
                mcp.setData(next);
                onChanged();
              }}
              onReload={mcp.reload}
              onDelete={async () => {
                const ok = await confirm({
                  title: `Remove ${data.name}?`,
                  body:
                    data.source === 'catalog'
                      ? 'This uninstalls the catalog MCP with its stored credentials and settings. Clients lose access immediately.'
                      : 'This removes the MCP with its stored credentials and settings. Clients lose access immediately. It cannot be undone.',
                  confirmLabel: 'Remove MCP',
                  tone: 'danger',
                  typeToConfirm: data.slug || data.name,
                  call: `DELETE ${mcpPath(id)}  If-Match: ${ifMatch(data.version)}`,
                });
                if (!ok) return null;
                await client.call({ method: 'DELETE', path: mcpPath(id), headers: { 'If-Match': ifMatch(data.version) }, source: 'Delete MCP' });
                onDeleted();
                return true;
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function Identity({ data }) {
  const errors = Object.entries(data.last_fetch_errors || {});
  return (
    <>
      <KeyValue
        items={[
          ['Id', <code key="id">{data.id}</code>],
          ['Slug', <code key="slug">{fmt(data.slug)}</code>],
          ['Description', fmt(data.description)],
          [
            'Endpoint',
            data.endpoint_urls?.mcp ? (
              <span key="ep" className={styles.inline}>
                <code>{data.endpoint_urls.mcp}</code> <CopyButton text={data.endpoint_urls.mcp} />
              </span>
            ) : (
              '-'
            ),
          ],
          ['Upstream host', fmt(data.upstream_host)],
          ['Transport', fmt(data.transport_type)],
          ['Execution', fmt(data.execution_type)],
          ['Source', fmt(data.source)],
          ['Auth', `${fmt(data.auth_type)}${data.oauth_mode ? ` (${data.oauth_mode})` : ''}`],
          data.catalog_id ? ['Catalog entry', <code key="c">{data.catalog_id}</code>] : null,
          data.remote_connector ? ['Remote connector', `${fmt(data.remote_connector.name || data.remote_connector.id)}${data.remote_connector.connected === false ? ' (not connected)' : ''}`] : null,
          ['Created', when(data.created_at)],
          ['Version', <code key="v">{data.version}</code>],
        ]}
      />
      {errors.length > 0 && (
        <>
          <h3>Last tool-fetch errors</h3>
          <ul className={styles.bullets}>
            {errors.map(([k, v]) => (
              <li key={k}>
                <code>{k}</code>: <Pill tone="err">{v?.code}</Pill> {v?.message}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className={styles.muted}>
        Open this MCP in <GoTo tab="settings" mcp={data.id}>Settings</GoTo>, <GoTo tab="connections" mcp={data.id}>Connections and credentials</GoTo>,{' '}
        <GoTo tab="tool-reviews" mcp={data.id}>Tool reviews</GoTo> or <GoTo tab="analytics" mcp={data.id}>Analytics</GoTo>.
      </p>
    </>
  );
}

function ConnectionSummary({ id }) {
  const { client } = usePlayground();
  const conn = useLoad(() => client.call({ path: mcpPath(id, '/connection'), source: 'MCP connection' }), [client, id]);
  const c = conn.data;
  return (
    <>
      <ApiChips calls={[['GET', '/mcps/{mcp_id}/connection']]} />
      <ErrorBox error={conn.error} />
      {c && (
        <KeyValue
          items={[
            ['State', <StatePill key="s" state={c.connection_state} />],
            ['Tools', fmt(c.tool_count)],
            ['Auth', `${fmt(c.auth_type)}${c.oauth_mode ? ` (${c.oauth_mode})` : ''}`],
            ['Connected administrators', (c.connected_admins || []).join(', ') || '-'],
          ]}
        />
      )}
      <p className={styles.muted}>
        Refresh tools, set credentials or issue a connect link in <GoTo tab="connections" mcp={id}>Connections and credentials</GoTo>.
      </p>
    </>
  );
}

function Tools({ id }) {
  const { client } = usePlayground();
  const [open, setOpen] = useState(null);
  const tools = useLoad(() => client.call({ path: mcpPath(id, '/tools'), source: 'MCP tools' }), [client, id]);
  const d = tools.data;
  return (
    <>
      <ApiChips calls={[['GET', '/mcps/{mcp_id}/tools']]} />
      <ErrorBox error={tools.error} />
      {d && (
        <>
          {d.policy_authority?.mode === 'quilrql' && (
            <Notice tone="warn">QuilrQL policies govern this tenant: tool settings are saved but the active policy decides.</Notice>
          )}
          <Warnings items={d.warnings} />
          <Table
            rows={d.tools || []}
            rowKey={(r) => r.name}
            selected={open?.name}
            onRowClick={(r) => setOpen(open?.name === r.name ? null : r)}
            empty="No cached tools. Refresh tools from Connections and credentials."
            columns={[
              { label: 'Tool', render: (r) => <code>{r.name}</code> },
              { label: 'Enabled', render: (r) => <EnabledPill value={r.enabled} /> },
              { label: 'Review', render: (r) => (r.review_state ? <Pill tone={r.review_state === 'held' ? 'warn' : 'err'}>{r.review_state}</Pill> : '-') },
              { label: 'Confirm', render: (r) => (r.enforce_confirmation ? 'yes' : '-') },
              { label: 'Calls', render: (r) => <span className={styles.num}>{fmt(r.call_count)}</span> },
            ]}
          />
          <p className={styles.muted}>
            {(d.resources || []).length} resources, {(d.prompts || []).length} prompts.
          </p>
          {open && (
            <>
              <h3>{open.title || open.name}</h3>
              {open.description && <p>{open.description}</p>}
              <JsonView value={{ input_schema: open.input_schema, annotations: open.annotations }} maxHeight={320} />
            </>
          )}
        </>
      )}
    </>
  );
}

function EditMcp({ data, onSaved, onReload, onDelete }) {
  const { client } = usePlayground();
  const [form, setForm] = useState({ name: data.name, description: data.description || '', enabled: data.enabled });
  const action = useAction();
  useEffect(() => {
    setForm({ name: data.name, description: data.description || '', enabled: data.enabled });
  }, [data.version, data.name, data.description, data.enabled]);
  const body = {};
  if (form.name.trim() !== data.name) body.name = form.name.trim();
  if ((form.description || '') !== (data.description || '')) body.description = form.description || null;
  if (form.enabled !== data.enabled) body.enabled = form.enabled;
  const changed = Object.keys(body).length > 0;
  const headers = { 'If-Match': ifMatch(data.version) };
  return (
    <>
      <ApiChips calls={[['PATCH', '/mcps/{mcp_id}'], ['DELETE', '/mcps/{mcp_id}']]} />
      <div className={styles.formGrid}>
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Description" wide>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </div>
      <Checkbox
        label="Enabled (disabling stops serving the MCP to every client, direct and through OneMCP)"
        checked={form.enabled}
        onChange={(enabled) => setForm({ ...form, enabled })}
      />
      <p className={styles.muted}>
        Sends only the changed fields with <code>If-Match: {ifMatch(data.version)}</code>, the version read with this MCP.
      </p>
      {changed && (
        <details>
          <summary>Request body</summary>
          <JsonView value={body} />
        </details>
      )}
      <div className={styles.actionsRow}>
        <ActionButton
          method="PATCH"
          path="/mcps/{mcp_id}"
          variant="primary"
          disabled={!changed || !form.name.trim()}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'PATCH', path: mcpPath(data.id), body, headers, source: 'Update MCP' });
              onSaved(res);
              return res;
            }, 'Saved. The MCP has a new version.')
          }
        >
          Save changes
        </ActionButton>
        <Btn onClick={() => setForm({ name: data.name, description: data.description || '', enabled: data.enabled })} disabled={!changed}>
          Reset
        </Btn>
      </div>
      <WriteError error={action.error} onDismiss={() => action.setError(null)} onReload={() => { action.setError(null); onReload(); }} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      <div className={styles.dangerZone}>
        <div>
          <strong>Remove this MCP</strong>
          <p className={styles.muted}>
            {data.source === 'system'
              ? 'MCPs provided by Quilr cannot be removed (403 system_mcp). Disable it instead.'
              : 'Removes the MCP with its stored credentials and settings. An MCP the active QuilrQL policy references answers 409 policy_dependency.'}
          </p>
        </div>
        <ActionButton
          method="DELETE"
          path="/mcps/{mcp_id}"
          variant="danger"
          disabled={data.source === 'system'}
          onClick={() => action.run(onDelete)}
        >
          <Trash2 size={13} aria-hidden /> Remove
        </ActionButton>
      </div>
    </>
  );
}
