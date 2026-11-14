import React, { useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { newIdempotencyKey, seg } from '../ManagementPlayground/client.mjs';
import {
  ActionButton,
  ApiChips,
  Btn,
  ConnectFirst,
  CopyButton,
  ErrorBox,
  Field,
  JsonView,
  KeyValue,
  Notice,
  Panel,
  Pill,
  SecretOnce,
  Table,
  Tabs,
  fmt,
  pretty,
  useAction,
  usePlayground,
} from '../ManagementPlayground/ui';
import { fetchAllPages, useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX, ifMatch, mcpPath } from './routes.mjs';
import { McpPicker, useMcpName } from './common';

const FAILED = 'No data: the request failed (see the error above).';

// Agents of the tenant (all pages), shared by the token form and the agents panels.
function useAgents(generation = 0) {
  const { client } = usePlayground();
  return useLoad(
    () => fetchAllPages((cursor) => client.call({ path: `${MCP_PREFIX}/agents`, query: { limit: 200, cursor }, source: 'Agents' })).then((r) => r.items),
    [client, generation],
    !!client,
  );
}

export default function ClientAccess() {
  const { client, urlParam } = usePlayground();
  const id = urlParam('mcp');
  const [generation, setGeneration] = useState(0);
  if (!client) return <ConnectFirst what="hand MCPs out to clients" />;
  return (
    <div className={styles.stack}>
      <Panel
        title="Client access"
        subtitle="How clients reach an MCP: its own endpoint and OneMCP, how they authenticate, MCP API tokens for clients that cannot sign users in, and which agents may use it."
      >
        <McpPicker />
      </Panel>
      {id ? (
        <>
          <Setup key={`setup-${id}`} id={id} />
          <Tokens key={`tokens-${id}`} id={id} generation={generation} />
          <McpAgents key={`agents-${id}-${generation}`} id={id} />
        </>
      ) : (
        <p className={styles.muted}>Select an MCP to see its client setup, tokens and agents.</p>
      )}
      <TenantAgents onChanged={() => setGeneration((g) => g + 1)} />
    </div>
  );
}

function Setup({ id }) {
  const { client } = usePlayground();
  const name = useMcpName(id);
  const setup = useLoad(() => client.call({ path: mcpPath(id, '/client-setup'), source: 'Client setup' }), [client, id]);
  const [view, setView] = useState('direct');
  const d = setup.data;
  const target = d ? (view === 'onemcp' ? d.onemcp : d.direct) : null;
  const tabs = [
    ['direct', 'Own endpoint'],
    ...(d?.direct?.token_templates ? [['direct-token', 'Own endpoint with token']] : []),
    ['onemcp', 'OneMCP'],
  ];
  const templates = d ? (view === 'direct-token' ? d.direct.token_templates : target?.templates) : null;
  return (
    <Panel
      title={`Client setup for ${name}`}
      subtitle="Endpoint URLs and ready-to-paste client configuration. Placeholders stand in for tokens and user emails; no secrets are returned."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/client-setup']]} />
          <Btn onClick={setup.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={setup.error} />
      {d && (
        <>
          <KeyValue
            items={[
              ['Endpoint', <span key="u"><code>{d.direct.url}</code> <CopyButton text={d.direct.url} /></span>],
              ['Sign-in methods', (d.direct.auth_methods || []).map((m) => <Pill key={m}>{m}</Pill>)],
              ['Auth type', fmt(d.auth_type)],
              ['OAuth mode', fmt(d.oauth_mode)],
              ['OneMCP', <span key="o"><code>{d.onemcp.url}</code> <Pill tone={d.onemcp.included ? 'ok' : 'warn'}>{d.onemcp.included ? 'included' : 'hidden from OneMCP'}</Pill></span>],
              ['Allowed agents', d.allowed_agents ? d.allowed_agents.join(', ') || 'none' : 'all'],
              ['Enabled', fmt(d.enabled)],
            ]}
          />
          {d.api_token && (
            <p className={styles.muted}>
              With an MCP API token, clients send <code>{d.api_token.header}: {d.api_token.scheme} &lt;token&gt;</code> and the end user&apos;s email in{' '}
              <code>{d.api_token.user_header}</code>. A token only works for the agent it was issued for.
            </p>
          )}
          <Tabs tabs={tabs} value={view} onChange={setView} label="Configuration for" />
          {templates && (
            <div className={styles.stack}>
              {Object.entries(templates).map(([kind, value]) => (
                <div key={kind} className={styles.subPanel}>
                  <div className={styles.actionsRow}>
                    <strong>{kind}</strong>
                    <CopyButton text={typeof value === 'string' ? value : pretty(value)} />
                  </div>
                  {typeof value === 'string' ? <pre className={styles.json}>{value}</pre> : <JsonView value={value} />}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

function Tokens({ id, generation }) {
  const { client, confirm } = usePlayground();
  const name = useMcpName(id);
  const tokens = useLoad(
    () => fetchAllPages((cursor) => client.call({ path: mcpPath(id, '/tokens'), query: { limit: 200, cursor }, source: 'MCP API tokens' })).then((r) => r.items),
    [client, id],
  );
  const agents = useAgents(generation);
  const [form, setForm] = useState({ name: '', agent: '' });
  const [secret, setSecret] = useState(null);
  const action = useAction();
  const agentList = agents.data || [];

  async function issue() {
    await action.run(async () => {
      const res = await client.call({
        method: 'POST',
        path: mcpPath(id, '/tokens'),
        body: { name: form.name.trim(), agent: form.agent },
        headers: { 'Idempotency-Key': newIdempotencyKey('token') },
        source: 'Issue MCP API token',
      });
      setSecret(res.token?.secret || null);
      setForm({ name: '', agent: form.agent });
      tokens.reload();
      return res;
    }, (res) => `Issued ${res.token?.name} for ${res.token?.agent}.`);
  }

  async function revoke(row) {
    if (
      !(await confirm({
        title: `Revoke ${row.name}?`,
        body: `Clients using this token on ${name} are refused from their next request. This cannot be undone.`,
        confirmLabel: 'Revoke',
        tone: 'danger',
        call: `DELETE ${mcpPath(id, `/tokens/${seg(row.token_id)}`)}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'DELETE', path: mcpPath(id, `/tokens/${seg(row.token_id)}`), source: 'Revoke MCP API token' });
      tokens.reload();
      return res;
    }, `Revoked ${row.name}.`);
  }

  return (
    <Panel
      title="MCP API tokens"
      subtitle="For clients that cannot sign users in (CI jobs, server-side agents). Each token is bound to this MCP and one agent. OAuth MCPs do not take tokens."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/tokens'], ['POST', '/mcps/{mcp_id}/tokens'], ['DELETE', '/mcps/{mcp_id}/tokens/{token_id}']]} />
          <Btn onClick={tokens.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <SecretOnce secret={secret} title="New MCP API token" onDismiss={() => setSecret(null)} />
      <form
        className={styles.inline}
        onSubmit={(e) => {
          e.preventDefault();
          if (form.name.trim() && form.agent) issue();
        }}
      >
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CI runner" />
        </Field>
        <Field label="Agent" hint="The client's User-Agent must match this agent.">
          <select value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })}>
            <option value="">{agents.loading ? 'Loading agents...' : 'Select an agent'}</option>
            {agentList.map((a) => (
              <option key={a.keyword} value={a.keyword}>
                {a.display_name} ({a.keyword})
              </option>
            ))}
          </select>
        </Field>
        <ActionButton method="POST" path="/mcps/{mcp_id}/tokens" variant="primary" disabled={!form.name.trim() || !form.agent} onClick={issue}>
          <Plus size={13} aria-hidden /> Issue token
        </ActionButton>
      </form>
      <ErrorBox error={action.error || agents.error} onDismiss={action.error ? () => action.setError(null) : undefined} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      <ErrorBox error={tokens.error} />
      <Table
        rows={tokens.data || []}
        rowKey={(r) => r.token_id}
        empty={tokens.loading ? 'Loading...' : tokens.error ? FAILED : 'No tokens issued for this MCP.'}
        columns={[
          { label: 'Name', render: (r) => r.name },
          { label: 'Agent', render: (r) => <code>{r.agent}</code> },
          { label: 'Created', render: (r) => `${when(r.created_at)}${r.created_by ? ` by ${r.created_by}` : ''}` },
          { label: 'Last used', render: (r) => when(r.last_used_at) },
          {
            label: 'Actions',
            render: (r) => (
              <ActionButton method="DELETE" path="/mcps/{mcp_id}/tokens/{token_id}" variant="danger" onClick={() => revoke(r)}>
                <Trash2 size={12} aria-hidden /> Revoke
              </ActionButton>
            ),
          },
        ]}
      />
    </Panel>
  );
}

function McpAgents({ id }) {
  const { client } = usePlayground();
  const name = useMcpName(id);
  const view = useLoad(() => client.call({ path: mcpPath(id, '/agents'), source: 'MCP agents' }), [client, id]);
  const action = useAction();
  const d = view.data;

  async function toggle(agent, enabled) {
    const res = await action.run(async () => {
      const out = await client.call({
        method: 'PUT',
        path: mcpPath(id, `/agents/${seg(agent.keyword)}`),
        body: { enabled },
        headers: { 'If-Match': ifMatch(d.version) },
        source: `${enabled ? 'Allow' : 'Block'} agent`,
      });
      view.setData(out);
      return out;
    }, `${enabled ? 'Allowed' : 'Blocked'} ${agent.display_name} on ${name}.`);
    if (!res) view.reload();
  }

  return (
    <Panel
      title={`Agents allowed on ${name}`}
      subtitle="Allowing or blocking an agent edits the MCP's access_control.allowed_agents, so it needs settings:write and the current version in If-Match."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/agents'], ['PUT', '/mcps/{mcp_id}/agents/{agent}']]} />
          <Btn onClick={view.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={view.error} />
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {d && <p className={styles.muted}>Version <code>{d.version}</code> (sent as If-Match; a 412 reloads the list).</p>}
      <Table
        rows={d?.agents || []}
        rowKey={(r) => r.keyword}
        empty={view.loading ? 'Loading...' : view.error ? FAILED : 'No agents.'}
        columns={[
          { label: 'Agent', render: (r) => r.display_name },
          { label: 'Keyword', render: (r) => <code>{r.keyword}</code> },
          { label: 'Kind', render: (r) => (r.custom ? <Pill>custom</Pill> : <Pill>built-in</Pill>) },
          { label: 'Allowed', render: (r) => <Pill tone={r.enabled ? 'ok' : 'err'}>{r.enabled ? 'allowed' : 'blocked'}</Pill> },
          {
            label: 'Actions',
            render: (r) => (
              <ActionButton method="PUT" path="/mcps/{mcp_id}/agents/{agent}" variant={r.enabled ? 'danger' : undefined} onClick={() => toggle(r, !r.enabled)}>
                {r.enabled ? 'Block' : 'Allow'}
              </ActionButton>
            ),
          },
        ]}
      />
    </Panel>
  );
}

function TenantAgents({ onChanged }) {
  const { client, confirm } = usePlayground();
  const [generation, setGeneration] = useState(0);
  const agents = useAgents(generation);
  const [form, setForm] = useState({ keyword: '', display_name: '' });
  const [open, setOpen] = useState(null);
  const detail = useLoad(
    () => client.call({ path: `${MCP_PREFIX}/agents/${seg(open)}`, source: 'Agent' }),
    [client, open, generation],
    !!open,
  );
  const action = useAction();
  const changed = () => {
    setGeneration((g) => g + 1);
    onChanged();
  };

  async function create() {
    await action.run(async () => {
      const res = await client.call({ method: 'POST', path: `${MCP_PREFIX}/agents`, body: { keyword: form.keyword.trim(), display_name: form.display_name.trim() }, source: 'Create custom agent' });
      setForm({ keyword: '', display_name: '' });
      changed();
      return res;
    }, (res) => `Created ${res.agent?.keyword}; it is allowed on every MCP.`);
  }

  async function remove(row) {
    if (
      !(await confirm({
        title: `Delete agent ${row.keyword}?`,
        body: 'The agent is removed from every MCP. Clients identifying as this agent are no longer recognized.',
        confirmLabel: 'Delete',
        tone: 'danger',
        call: `DELETE ${MCP_PREFIX}/agents/${row.keyword}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'DELETE', path: `${MCP_PREFIX}/agents/${seg(row.keyword)}`, source: 'Delete custom agent' });
      if (open === row.keyword) setOpen(null);
      changed();
      return res;
    }, `Deleted ${row.keyword}.`);
  }

  return (
    <Panel
      title="Agents of the organization"
      subtitle="Built-in and custom agents, matched against the client User-Agent. A new custom agent is allowed on every MCP."
      actions={
        <>
          <ApiChips calls={[['GET', '/agents'], ['GET', '/agents/{keyword}'], ['POST', '/agents'], ['DELETE', '/agents/{keyword}']]} />
          <Btn onClick={agents.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <form
        className={styles.inline}
        onSubmit={(e) => {
          e.preventDefault();
          if (form.keyword.trim() && form.display_name.trim()) create();
        }}
      >
        <Field label="Keyword" hint="Letters, digits and hyphens; stored lowercase.">
          <input value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} placeholder="acme-bot" spellCheck="false" />
        </Field>
        <Field label="Display name">
          <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Acme Bot" />
        </Field>
        <ActionButton method="POST" path="/agents" variant="primary" disabled={!form.keyword.trim() || !form.display_name.trim()} onClick={create}>
          <Plus size={13} aria-hidden /> Create agent
        </ActionButton>
      </form>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      <ErrorBox error={agents.error} />
      <Table
        rows={agents.data || []}
        rowKey={(r) => r.keyword}
        selected={open}
        onRowClick={(r) => setOpen(open === r.keyword ? null : r.keyword)}
        empty={agents.loading ? 'Loading...' : agents.error ? FAILED : 'No agents.'}
        columns={[
          { label: 'Agent', render: (r) => r.display_name },
          { label: 'Keyword', render: (r) => <code>{r.keyword}</code> },
          { label: 'Kind', render: (r) => (r.custom ? <Pill>custom</Pill> : <Pill>built-in</Pill>) },
          { label: 'Created', render: (r) => when(r.created_at) },
          {
            label: 'Actions',
            render: (r) =>
              r.custom ? (
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                  <ActionButton method="DELETE" path="/agents/{keyword}" variant="danger" onClick={() => remove(r)}>
                    <Trash2 size={12} aria-hidden /> Delete
                  </ActionButton>
                </span>
              ) : null,
          },
        ]}
      />
      {open && (
        <div className={styles.subPanel}>
          <h3>MCPs for {open}</h3>
          <ErrorBox error={detail.error} />
          <Table
            rows={detail.data?.agent?.mcps || []}
            rowKey={(r) => r.mcp_id}
            empty={detail.loading ? 'Loading...' : detail.error ? FAILED : 'No MCPs.'}
            columns={[
              { label: 'MCP', render: (r) => r.name },
              { label: 'Id', render: (r) => <code>{r.mcp_id}</code> },
              { label: 'Allowed', render: (r) => <Pill tone={r.enabled ? 'ok' : 'err'}>{r.enabled ? 'allowed' : 'blocked'}</Pill> },
            ]}
          />
        </div>
      )}
    </Panel>
  );
}
