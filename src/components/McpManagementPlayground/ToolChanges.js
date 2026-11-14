import React, { useState } from 'react';
import { CircleCheck, EyeOff, RefreshCw, Search } from 'lucide-react';
import { ActionButton, ApiChips, Btn, Checkbox, ConnectFirst, ErrorBox, JsonView, KeyValue, Notice, Panel, Pill, Table, fmt, useAction, usePlayground } from '../ManagementPlayground/ui';
import { fetchAllPages, useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX, mcpPath } from './routes.mjs';
import { McpPicker, useMcpName } from './common';

const FAILED = 'No data: the request failed (see the error above).';
const TONES = { pending: 'warn', clean: 'ok', applied: 'ok', dismissed: 'off', error: 'err', skipped: 'off', off: 'off' };
const StatusPill = ({ status }) => <Pill tone={TONES[status]}>{status || 'unknown'}</Pill>;

export default function ToolChanges() {
  const { client, urlParam } = usePlayground();
  const id = urlParam('mcp');
  if (!client) return <ConnectFirst what="review upstream tool changes" />;
  return (
    <div className={styles.stack}>
      <Overview />
      <Panel title="One MCP" subtitle="The change detected upstream, and the OAuth permission options of OAuth MCPs.">
        <McpPicker />
      </Panel>
      {id && <Change key={id} id={id} />}
      {id && <ScopeOptions key={`scopes-${id}`} id={id} />}
    </div>
  );
}

function Overview() {
  const { client, setParam } = usePlayground();
  const [pendingOnly, setPendingOnly] = useState(false);
  const list = useLoad(
    () =>
      fetchAllPages((cursor) =>
        client.call({ path: `${MCP_PREFIX}/tool-changes`, query: { limit: 200, cursor, pending_only: pendingOnly ? 'true' : undefined }, source: 'Tool changes' }),
      ).then((r) => r.items),
    [client, pendingOnly],
  );
  return (
    <Panel
      title="Tool changes"
      subtitle="The tool watch compares each MCP's upstream tool list with the cached one. A pending change waits until you adopt or dismiss it (tool_sync mode notify)."
      actions={
        <>
          <ApiChips calls={[['GET', '/tool-changes']]} />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <Checkbox label="Pending changes only" checked={pendingOnly} onChange={setPendingOnly} />
      <ErrorBox error={list.error} />
      <Table
        rows={list.data || []}
        rowKey={(r) => r.mcp_id}
        onRowClick={(r) => setParam('mcp', r.mcp_id)}
        empty={list.loading ? 'Loading...' : list.error ? FAILED : pendingOnly ? 'No change is awaiting review.' : 'No MCPs.'}
        columns={[
          { label: 'MCP', render: (r) => r.name || r.mcp_id },
          { label: 'Status', render: (r) => <StatusPill status={r.status} /> },
          { label: 'Mode', render: (r) => fmt(r.mode) },
          { label: 'Changes', render: (r) => String(r.change_count ?? 0) },
          { label: 'Checked', render: (r) => when(r.checked_at) },
          { label: 'Reason', render: (r) => (r.reason_code ? <code>{r.reason_code}</code> : '-') },
        ]}
      />
    </Panel>
  );
}

function Change({ id }) {
  const { client, confirm } = usePlayground();
  const name = useMcpName(id);
  const change = useLoad(() => client.call({ path: mcpPath(id, '/tool-changes'), source: 'Tool change' }), [client, id]);
  const action = useAction();
  const c = change.data?.tool_changes;

  async function act(kind) {
    const labels = { check: 'Check now', apply: 'Adopt upstream list', dismiss: 'Dismiss change' };
    if (kind !== 'check') {
      const ok = await confirm({
        title: kind === 'apply' ? `Adopt the upstream tool list of ${name}?` : `Dismiss this change on ${name}?`,
        body:
          kind === 'apply'
            ? 'The cached tool list is replaced by the upstream one. New tools may still be held for review.'
            : 'The cached tool list stays as it is. A different upstream list opens a new change.',
        confirmLabel: kind === 'apply' ? 'Adopt' : 'Dismiss',
        tone: kind === 'apply' ? undefined : 'danger',
        call: `POST ${mcpPath(id, `/tool-changes/${kind}`)}`,
      });
      if (!ok) return;
    }
    await action.run(async () => {
      const res = await client.call({ method: 'POST', path: mcpPath(id, `/tool-changes/${kind}`), source: labels[kind] });
      change.setData(res);
      return res;
    }, (res) => `${labels[kind]}: status ${res.tool_changes?.status}.`);
  }

  const rows = c
    ? [
        ...(c.added || []).map((t) => ({ kind: 'added', tool: t })),
        ...(c.removed || []).map((t) => ({ kind: 'removed', tool: t })),
        ...(c.modified || []).map((t) => ({ kind: 'modified', tool: t })),
      ]
    : [];
  const [open, setOpen] = useState(null);
  return (
    <Panel
      title={`Tool change of ${name}`}
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', '/mcps/{mcp_id}/tool-changes'],
              ['POST', '/mcps/{mcp_id}/tool-changes/check'],
              ['POST', '/mcps/{mcp_id}/tool-changes/apply'],
              ['POST', '/mcps/{mcp_id}/tool-changes/dismiss'],
            ]}
          />
          <Btn onClick={change.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={change.error} />
      {c && (
        <>
          <KeyValue
            items={[
              ['Status', <StatusPill key="s" status={c.status} />],
              ['Mode', fmt(c.mode)],
              ['Changes', String(c.change_count ?? 0)],
              ['Checked', when(c.checked_at)],
              ['Detected', when(c.detected_at)],
              ['Resolved', c.resolved_at ? `${when(c.resolved_at)}${c.resolved_by ? ` by ${c.resolved_by}` : ''}` : '-'],
              c.reason_code && ['Reason', <code key="r">{c.reason_code}</code>],
            ]}
          />
          <div className={styles.actionsRow}>
            <ActionButton method="POST" path="/mcps/{mcp_id}/tool-changes/check" onClick={() => act('check')}>
              <Search size={13} aria-hidden /> Check now
            </ActionButton>
            <ActionButton method="POST" path="/mcps/{mcp_id}/tool-changes/apply" variant="primary" disabled={c.status !== 'pending'} onClick={() => act('apply')}>
              <CircleCheck size={13} aria-hidden /> Adopt upstream list
            </ActionButton>
            <ActionButton method="POST" path="/mcps/{mcp_id}/tool-changes/dismiss" variant="danger" disabled={c.status !== 'pending'} onClick={() => act('dismiss')}>
              <EyeOff size={13} aria-hidden /> Dismiss
            </ActionButton>
          </div>
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          <Notice tone="ok" onDismiss={() => action.setNotice('')}>
            {action.notice}
          </Notice>
          <Table
            rows={rows}
            rowKey={(r) => `${r.kind}:${r.tool?.name}`}
            selected={open}
            onRowClick={(r) => setOpen(open === `${r.kind}:${r.tool?.name}` ? null : `${r.kind}:${r.tool?.name}`)}
            empty="No differences recorded."
            columns={[
              { label: 'Change', render: (r) => <Pill tone={r.kind === 'removed' ? 'err' : r.kind === 'added' ? 'ok' : 'warn'}>{r.kind}</Pill> },
              { label: 'Tool', render: (r) => <code>{r.tool?.name || '-'}</code> },
            ]}
          />
          {open && <JsonView value={rows.find((r) => `${r.kind}:${r.tool?.name}` === open)?.tool} maxHeight={320} />}
        </>
      )}
    </Panel>
  );
}

function ScopeOptions({ id }) {
  const { client } = usePlayground();
  const options = useLoad(() => client.call({ path: mcpPath(id, '/oauth-scope-options'), source: 'OAuth scope options' }), [client, id]);
  const d = options.data;
  return (
    <Panel
      title="OAuth permission options"
      subtitle="Permission bundles the provider offers for this OAuth MCP. Select bundles with the oauth_scopes setting (Settings workspace)."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/oauth-scope-options']]} />
          <Btn onClick={options.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={options.error} />
      {d && (
        <>
          <KeyValue
            items={[
              ['Available', fmt(d.available)],
              ['Selected', d.selected ? d.selected.join(', ') || 'none' : 'not set'],
            ]}
          />
          {d.available ? <JsonView value={{ options: d.options, always_available_tools: d.always_available_tools, cross_area_tools: d.cross_area_tools }} maxHeight={360} /> : <p className={styles.muted}>This MCP publishes no permission bundles.</p>}
        </>
      )}
    </Panel>
  );
}
