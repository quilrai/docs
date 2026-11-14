import React, { useState } from 'react';
import { Link2, RefreshCw, Trash2 } from 'lucide-react';
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
  fmt,
  useAction,
  usePlayground,
} from '../ManagementPlayground/ui';
import { useLoad, when } from '../ManagementPlayground/shared';
import { redactSecrets } from '../ManagementPlayground/client.mjs';
import styles from '../ManagementPlayground/styles.module.css';
import { ifMatch, mcpPath } from './routes.mjs';
import { ConnectLinkBox, McpPicker, StatePill, WriteError, invalidateInventory, useMcpName } from './common';

export default function Connections() {
  const { client, urlParam } = usePlayground();
  const id = urlParam('mcp');
  if (!client) return <ConnectFirst what="manage connections and upstream credentials" />;
  return (
    <div className={styles.stack}>
      <Panel title="Connections and credentials" subtitle="How the gateway reaches the upstream server of one MCP: connection state, tool refresh, the static credential and OAuth connect links.">
        <McpPicker />
      </Panel>
      {id ? <McpConnections key={id} id={id} /> : <p className={styles.muted}>Select an MCP.</p>}
    </div>
  );
}

function McpConnections({ id }) {
  const { client } = usePlayground();
  const name = useMcpName(id);
  const conn = useLoad(() => client.call({ path: mcpPath(id, '/connection'), source: 'MCP connection' }), [client, id]);
  const c = conn.data;
  const oauthManaged = c && c.auth_type === 'oauth' && c.oauth_mode !== 'passthrough';
  return (
    <>
      <ConnectionPanel name={name} id={id} conn={conn} />
      <UpstreamAuth id={id} onChanged={conn.reload} />
      <ConnectLinks id={id} oauthManaged={oauthManaged} conn={c} />
    </>
  );
}

function ConnectionPanel({ name, id, conn }) {
  const { client } = usePlayground();
  const action = useAction();
  const [refresh, setRefresh] = useState(null);
  const c = conn.data;
  const errors = Object.entries(c?.last_fetch_errors || refresh?.fetch_errors || {});
  return (
    <Panel
      title={`Connection of ${name}`}
      subtitle="Live state: it never changes the MCP version."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/connection'], ['POST', '/mcps/{mcp_id}/capabilities:refresh']]} />
          <Btn onClick={conn.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
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
      {errors.length > 0 && (
        <ul className={styles.bullets}>
          {errors.map(([k, v]) => (
            <li key={k}>
              <code>{k}</code>: <Pill tone="err">{v?.code}</Pill> {v?.message}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/mcps/{mcp_id}/capabilities:refresh"
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'POST', path: mcpPath(id, '/capabilities:refresh'), source: 'Refresh tools' });
              setRefresh(res);
              invalidateInventory(client);
              conn.reload();
              return res;
            }, (res) => `Fetched ${res.tools_count} tools, ${res.resources_count ?? 0} resources and ${res.prompts_count ?? 0} prompts.`)
          }
        >
          <RefreshCw size={13} aria-hidden /> Refresh tools now
        </ActionButton>
        <span className={styles.muted}>
          Fetches as the administrator who issued the key. OAuth MCPs need that administrator's connection (409 oauth_connection_required); passthrough MCPs answer 409
          pending_first_client.
        </span>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {refresh?.held_tools?.length > 0 && (
        <Notice tone="warn">
          New tools held for review: {refresh.held_tools.join(', ')}. Approve or reject them in Tool reviews.
        </Notice>
      )}
    </Panel>
  );
}

const BLANK_AUTH = { mode: 'admin_shared', type: 'bearer', token: '', header_name: '', query_param: '', scheme: '', extra_headers: '', extra_query_params: '' };

function UpstreamAuth({ id, onChanged }) {
  const { client, confirm } = usePlayground();
  const auth = useLoad(() => client.call({ path: mcpPath(id, '/upstream-auth'), source: 'Upstream auth' }), [client, id]);
  const [form, setForm] = useState(null);
  const [keepExtras, setKeepExtras] = useState(false);
  const action = useAction();
  const a = auth.data?.upstream_auth;
  const version = auth.data?.version;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  let body = null;
  let jsonError = null;
  if (form) {
    const perUser = form.mode === 'user_required';
    body = { type: form.type };
    if (form.mode !== (a?.mode || 'admin_shared')) body.mode = form.mode;
    // Per-user keys: the shape only; each user saves their own key.
    if (form.token && !perUser) body.token = form.token;
    if (form.type === 'header' && form.header_name.trim()) body.header_name = form.header_name.trim();
    if (form.type === 'query' && form.query_param.trim()) body.query_param = form.query_param.trim();
    if (form.type === 'bearer' && form.scheme.trim()) body.scheme = form.scheme.trim();
    for (const name of ['extra_headers', 'extra_query_params']) {
      if (!form[name].trim()) continue;
      try {
        const value = JSON.parse(form[name]);
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Enter a JSON object.');
        body[name] = value;
      } catch (e) {
        jsonError = `${name}: ${e.message}`;
      }
    }
  }

  async function remove() {
    const ok = await confirm({
      title: 'Remove the upstream credential?',
      body: keepExtras
        ? 'The static credential is removed; extra headers and query parameters stay. Calls that need the credential start failing upstream.'
        : 'The static credential and the extra headers and query parameters are removed. Calls that need them start failing upstream.',
      confirmLabel: 'Remove credential',
      tone: 'danger',
      call: `DELETE ${mcpPath(id, '/upstream-auth')}${keepExtras ? '?keep_extras=true' : ''}`,
    });
    if (!ok) return;
    await action.run(async () => {
      const res = await client.call({
        method: 'DELETE',
        path: mcpPath(id, '/upstream-auth'),
        query: keepExtras ? { keep_extras: 'true' } : {},
        headers: { 'If-Match': ifMatch(version) },
        source: 'Delete upstream auth',
      });
      auth.setData(res);
      onChanged();
      return res;
    }, 'Credential removed.');
  }

  return (
    <Panel
      title="Upstream credentials"
      subtitle="The static credential and extra headers or query parameters the gateway sends upstream. Secrets are write-only: reads return metadata only. Mode admin_shared uses one key for every user; user_required makes each user save their own key from the sign-in link (Client access)."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/upstream-auth'], ['PUT', '/mcps/{mcp_id}/upstream-auth'], ['DELETE', '/mcps/{mcp_id}/upstream-auth']]} />
          <Btn onClick={auth.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={auth.error} />
      {a && (
        <>
          <KeyValue
            items={[
              ['Configured', a.configured ? <Pill key="c" tone="ok">yes</Pill> : <Pill key="c">no</Pill>],
              ['Secret stored', fmt(a.secret_configured)],
              ['Type', fmt(a.type)],
              ['Mode', a.mode === 'user_required' ? 'each user brings their own key (user_required)' : fmt(a.mode)],
              ['Users with their own key', fmt(a.user_credentials_saved ?? 0)],
              a.header_name ? ['Header', <code key="h">{a.header_name}</code>] : null,
              a.query_param ? ['Query parameter', <code key="q">{a.query_param}</code>] : null,
              a.scheme ? ['Scheme', a.scheme] : null,
              a.oauth_mode ? ['OAuth mode', a.oauth_mode] : null,
              ['Extra header names', (a.extra_header_names || []).join(', ') || '-'],
              ['Extra query parameter names', (a.extra_query_param_names || []).join(', ') || '-'],
              ['Updated', when(a.updated_at)],
              ['Version', <code key="v">{version}</code>],
            ]}
          />
          {a.credential_editable === false ? (
            <Notice>This MCP's credential is not editable through the API (OAuth MCPs connect with connect links).</Notice>
          ) : (
            <div className={styles.actionsRow}>
              <Btn variant="primary" onClick={() => setForm(form ? null : { ...BLANK_AUTH, mode: a.mode || 'admin_shared', type: a.type && ['bearer', 'header', 'query'].includes(a.type) ? a.type : 'bearer', header_name: a.header_name || '', query_param: a.query_param || '', scheme: a.scheme || '' })} aria-expanded={!!form}>
                {a.configured ? 'Rotate or change' : 'Set credential'}
              </Btn>
              {a.configured && (
                <>
                  <Checkbox label="Keep extra headers and query parameters" checked={keepExtras} onChange={setKeepExtras} />
                  <ActionButton method="DELETE" path="/mcps/{mcp_id}/upstream-auth" variant="danger" onClick={remove}>
                    <Trash2 size={13} aria-hidden /> Remove
                  </ActionButton>
                </>
              )}
            </div>
          )}
        </>
      )}
      {form && (
        <div className={styles.subPanel}>
          <h3>Set upstream credential</h3>
          {form.mode === 'user_required' && (
            <Notice>Only how the key is sent is saved (type, header or query parameter, scheme). No token is sent in this mode.</Notice>
          )}
          <div className={styles.formGrid}>
            <Field label="Type">
              <select value={form.type} onChange={(e) => set({ type: e.target.value })}>
                <option value="bearer">bearer (Authorization header)</option>
                <option value="header">header (custom header)</option>
                <option value="query">query (query parameter)</option>
              </select>
            </Field>
            <Field label="Mode" hint={form.mode === 'user_required' ? 'Switching deletes the shared key. Users save their own key after opening the sign-in link.' : a?.mode === 'user_required' ? 'Switching back needs a token. Users\' saved keys are kept but unused.' : 'One key for every user of the organization.'}>
              <select value={form.mode} onChange={(e) => set({ mode: e.target.value, token: e.target.value === 'user_required' ? '' : form.token })}>
                <option value="admin_shared">admin_shared (one shared key)</option>
                <option value="user_required">user_required (each user brings their own key)</option>
              </select>
            </Field>
            {form.mode !== 'user_required' && (
              <Field label="Token" hint={a?.mode === 'user_required' ? 'Required to switch to admin_shared.' : 'Empty keeps the stored secret (for example to change only the extras).'}>
                <input type="password" autoComplete="off" value={form.token} onChange={(e) => set({ token: e.target.value })} />
              </Field>
            )}
            {form.type === 'header' && (
              <Field label="Header name">
                <input value={form.header_name} onChange={(e) => set({ header_name: e.target.value })} placeholder="X-Api-Key" />
              </Field>
            )}
            {form.type === 'query' && (
              <Field label="Query parameter">
                <input value={form.query_param} onChange={(e) => set({ query_param: e.target.value })} placeholder="api_key" />
              </Field>
            )}
            {form.type === 'bearer' && (
              <Field label="Scheme (optional)">
                <input value={form.scheme} onChange={(e) => set({ scheme: e.target.value })} placeholder="Bearer" />
              </Field>
            )}
          </div>
          <div className={styles.formGrid}>
            <JsonField label="extra_headers (optional)" rows={3} value={form.extra_headers} onChange={(v) => set({ extra_headers: v })} hint="Omit to keep the stored ones; {} clears them." />
            <JsonField label="extra_query_params (optional)" rows={3} value={form.extra_query_params} onChange={(v) => set({ extra_query_params: v })} hint="Omit to keep the stored ones; {} clears them." />
          </div>
          <details>
            <summary>Request body (secrets masked)</summary>
            <JsonView value={redactSecrets(body)} />
          </details>
          {jsonError && <p className={styles.errorText}>{jsonError}</p>}
          <div className={styles.actionsRow}>
            <ActionButton
              method="PUT"
              path="/mcps/{mcp_id}/upstream-auth"
              variant="primary"
              disabled={!!jsonError || !version}
              onClick={() =>
                action.run(async () => {
                  const res = await client.call({ method: 'PUT', path: mcpPath(id, '/upstream-auth'), body, headers: { 'If-Match': ifMatch(version) }, source: 'Put upstream auth' });
                  auth.setData(res);
                  setForm(null);
                  onChanged();
                  return res;
                }, 'Credential saved. The token is not shown again.')
              }
            >
              Save credential
            </ActionButton>
            <Btn onClick={() => setForm(null)}>Cancel</Btn>
          </div>
        </div>
      )}
      <WriteError error={action.error} onDismiss={() => action.setError(null)} onReload={() => { action.setError(null); auth.reload(); }} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </Panel>
  );
}

function ConnectLinks({ id, oauthManaged, conn }) {
  const { client } = usePlayground();
  const [connect, setConnect] = useState(null);
  const action = useAction();
  return (
    <Panel
      title="OAuth connect link"
      subtitle="A single-use link, valid for 15 minutes, that finishes an OAuth MCP's sign-in from any browser without a Quilr sign-in. The connection is saved for the administrator who issued the management key."
      actions={<ApiChips calls={[['POST', '/mcps/{mcp_id}/connect-links']]} />}
    >
      {conn && !oauthManaged && (
        <Notice>
          {conn.oauth_mode === 'passthrough' || conn.auth_type === 'oauth_passthrough'
            ? 'This is an OAuth passthrough MCP: each client brings its own token, so it needs no connect link.'
            : 'This MCP does not use gateway-managed OAuth; the gateway answers 409 oauth_not_applicable.'}
        </Notice>
      )}
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/mcps/{mcp_id}/connect-links"
          variant={oauthManaged ? 'primary' : undefined}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'POST', path: mcpPath(id, '/connect-links'), source: 'Create connect link' });
              setConnect(res.connect || null);
              return res;
            })
          }
        >
          <Link2 size={13} aria-hidden /> Issue a connect link
        </ActionButton>
        <span className={styles.muted}>Each call issues a new link. It is shown once below and masked in API activity.</span>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <ConnectLinkBox connect={connect} onDismiss={() => setConnect(null)} />
    </Panel>
  );
}
