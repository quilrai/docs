import React, { useState } from 'react';
import { RefreshCw, UserX } from 'lucide-react';
import { seg } from '../ManagementPlayground/client.mjs';
import { ActionButton, ApiChips, Btn, ConnectFirst, ErrorBox, Notice, Panel, Pill, Table, Tabs, fmt, useAction, usePlayground } from '../ManagementPlayground/ui';
import { fetchAllPages, useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX, mcpPath } from './routes.mjs';
import { McpPicker, useMcpName } from './common';

const FAILED = 'No data: the request failed (see the error above).';
const TONES = {
  signed_in: 'ok',
  available: 'ok',
  needs_sign_in: 'warn',
  sign_in_not_finished: 'warn',
  not_signed_in_yet: undefined,
  turned_off_by_user: 'off',
  blocked_by_access_rules: 'err',
  mcp_turned_off: 'off',
};
const StatePill = ({ state }) => <Pill tone={TONES[state]}>{String(state || 'unknown').replace(/_/g, ' ')}</Pill>;

export default function Users() {
  const { client, urlParam, setParam } = usePlayground();
  const [view, setView] = useState(urlParam('mcp') ? 'mcp' : 'users');
  if (!client) return <ConnectFirst what="see users' connections" />;
  return (
    <div className={styles.stack}>
      <Panel
        title="User connections"
        subtitle="Who has set up which MCP and in what state, computed from stored sign-ins and preferences (may be a few minutes old). Revoking deletes one user's stored credentials for an MCP; they must connect again."
      >
        <Tabs
          tabs={[
            ['users', 'By user'],
            ['mcp', 'By MCP'],
          ]}
          value={view}
          onChange={(v) => {
            setView(v);
            if (v === 'users') setParam('mcp', '');
          }}
          label="View"
        />
      </Panel>
      {view === 'users' ? <ByUser /> : <ByMcp />}
    </div>
  );
}

function useRevoke(onDone) {
  const { client, confirm } = usePlayground();
  const action = useAction();
  async function revoke(mcpId, mcpName, email) {
    const path = mcpPath(mcpId, `/users/${seg(email)}/connection`);
    if (
      !(await confirm({
        title: `Revoke ${email} on ${mcpName}?`,
        body: "Deletes the user's stored sign-in, gateway session token and personal upstream credential for this MCP. The user must connect again. Access rules are unchanged: to block the user, add them to access_control.denied_users in the MCP settings.",
        confirmLabel: 'Revoke',
        tone: 'danger',
        call: `DELETE ${path}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'DELETE', path, source: 'Revoke user connection' });
      onDone();
      return res;
    }, (res) => (res.revoked ? `Revoked ${email} on ${mcpName}.` : `${email} had nothing stored for ${mcpName}.`));
  }
  return { action, revoke };
}

function ByUser() {
  const { client } = usePlayground();
  const users = useLoad(
    () => fetchAllPages((cursor) => client.call({ path: `${MCP_PREFIX}/user-connections`, query: { limit: 200, cursor }, source: 'User connections' })).then((r) => r.items),
    [client],
  );
  const [open, setOpen] = useState(null);
  const [tick, setTick] = useState(0);
  const detail = useLoad(
    () => fetchAllPages((cursor) => client.call({ path: `${MCP_PREFIX}/user-connections/${seg(open)}`, query: { limit: 200, cursor }, source: 'User MCP connections' })),
    [client, open, tick],
    !!open,
  );
  const { action, revoke } = useRevoke(() => {
    setTick((t) => t + 1);
    users.reload();
  });
  return (
    <Panel
      title="Users"
      subtitle="Every known user of the organization with how many MCPs are in each state. Select a user for their MCPs."
      actions={
        <>
          <ApiChips calls={[['GET', '/user-connections'], ['GET', '/user-connections/{email}'], ['DELETE', '/mcps/{mcp_id}/users/{email}/connection']]} />
          <Btn onClick={users.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={users.error} />
      <Table
        rows={users.data || []}
        rowKey={(r) => r.email}
        selected={open}
        onRowClick={(r) => setOpen(open === r.email ? null : r.email)}
        empty={users.loading ? 'Loading...' : users.error ? FAILED : 'No users yet.'}
        columns={[
          { label: 'Email', render: (r) => r.email },
          { label: 'Type', render: (r) => (r.user_types || []).join(', ') || '-' },
          { label: 'Registered', render: (r) => when(r.registered_at) },
          {
            label: 'MCP states',
            render: (r) =>
              Object.keys(r.mcp_states || {}).length
                ? Object.entries(r.mcp_states).map(([s, n]) => (
                    <span key={s}>
                      <StatePill state={s} /> {n}{' '}
                    </span>
                  ))
                : '-',
          },
        ]}
      />
      {open && (
        <div className={styles.subPanel}>
          <h3>MCPs of {open}</h3>
          <ErrorBox error={detail.error} />
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          <Notice tone="ok" onDismiss={() => action.setNotice('')}>
            {action.notice}
          </Notice>
          <PairTable
            rows={detail.data?.items || []}
            loading={detail.loading}
            failed={!!detail.error}
            first={{ label: 'MCP', render: (r) => r.name || r.mcp_id }}
            onRevoke={(r) => revoke(r.mcp_id, r.name || r.mcp_id, open)}
          />
        </div>
      )}
    </Panel>
  );
}

function ByMcp() {
  const { client, urlParam } = usePlayground();
  const id = urlParam('mcp');
  return (
    <>
      <Panel title="MCP" subtitle="Pick an MCP to see each user's connection state.">
        <McpPicker />
      </Panel>
      {id ? <McpUsers key={id} id={id} client={client} /> : <p className={styles.muted}>Select an MCP.</p>}
    </>
  );
}

function McpUsers({ id, client }) {
  const name = useMcpName(id);
  const users = useLoad(
    () => fetchAllPages((cursor) => client.call({ path: mcpPath(id, '/users'), query: { limit: 200, cursor }, source: 'MCP users' })),
    [client, id],
  );
  const { action, revoke } = useRevoke(() => users.reload());
  const d = users.data;
  return (
    <Panel
      title={`Users of ${name}`}
      subtitle={d ? `Sign-in required: ${fmt(d.sign_in_required)}. Renews automatically: ${fmt(d.renews_automatically)}. Computed ${when(d.generated_at)}.` : undefined}
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/users'], ['DELETE', '/mcps/{mcp_id}/users/{email}/connection']]} />
          <Btn onClick={users.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={users.error} />
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      <PairTable
        rows={d?.items || []}
        loading={users.loading}
        failed={!!users.error}
        first={{ label: 'Email', render: (r) => r.email }}
        onRevoke={(r) => revoke(id, name, r.email)}
      />
    </Panel>
  );
}

function PairTable({ rows, loading, failed, first, onRevoke }) {
  return (
    <Table
      rows={rows}
      rowKey={(r) => r.mcp_id || r.email}
      empty={loading ? 'Loading...' : failed ? FAILED : 'No connections.'}
      columns={[
        first,
        { label: 'State', render: (r) => <StatePill state={r.state} /> },
        { label: 'Set up', render: (r) => when(r.set_up_at) },
        { label: 'Signed in until', render: (r) => when(r.signed_in_until) },
        { label: 'Renews', render: (r) => fmt(r.can_renew) },
        { label: 'Turned on', render: (r) => fmt(r.preference_enabled) },
        { label: 'Access', render: (r) => (r.access_allowed ? <Pill tone="ok">allowed</Pill> : <Pill tone="err">blocked</Pill>) },
        {
          label: 'Actions',
          render: (r) => (
            <ActionButton method="DELETE" path="/mcps/{mcp_id}/users/{email}/connection" variant="danger" onClick={() => onRevoke(r)}>
              <UserX size={12} aria-hidden /> Revoke
            </ActionButton>
          ),
        },
      ]}
    />
  );
}
