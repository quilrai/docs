import React, { useState } from 'react';
import { CircleCheck, CircleX, RefreshCw } from 'lucide-react';
import {
  ActionButton,
  ApiChips,
  Btn,
  Checkbox,
  ConnectFirst,
  ErrorBox,
  JsonView,
  KeyValue,
  Notice,
  Panel,
  Pill,
  Table,
  fmt,
  useAction,
  usePlayground,
} from '../ManagementPlayground/ui';
import { useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { mcpPath } from './routes.mjs';
import { McpPicker, useMcpName } from './common';

const TONES = { held: 'warn', pending: 'warn', rejected: 'err', approved: 'ok' };

export default function ToolReviews() {
  const { client, urlParam } = usePlayground();
  const id = urlParam('mcp');
  if (!client) return <ConnectFirst what="review held tools" />;
  return (
    <div className={styles.stack}>
      <Panel title="Tool reviews" subtitle="When review is on, new tools detected upstream are held until someone approves them. Rejected tools stay hidden from clients.">
        <McpPicker />
      </Panel>
      {id ? <Reviews key={id} id={id} /> : <p className={styles.muted}>Select an MCP.</p>}
    </div>
  );
}

function Reviews({ id }) {
  const { client, confirm } = usePlayground();
  const name = useMcpName(id);
  const reviews = useLoad(() => client.call({ path: mcpPath(id, '/tool-reviews'), source: 'Tool reviews' }), [client, id]);
  const [heldOnly, setHeldOnly] = useState(true);
  const [picked, setPicked] = useState([]);
  const [open, setOpen] = useState(null);
  const action = useAction();
  const d = reviews.data;
  const all = d?.tools || [];
  const isHeld = (t) => t.status === 'held' || t.status === 'pending';
  const rows = heldOnly ? all.filter(isHeld) : all;
  const toggle = (toolName, on) => setPicked((p) => (on ? [...new Set([...p, toolName])] : p.filter((n) => n !== toolName)));

  async function decide(kind) {
    if (!picked.length) return;
    if (
      kind === 'reject' &&
      !(await confirm({
        title: `Reject ${picked.length} tool${picked.length > 1 ? 's' : ''}?`,
        body: `${picked.join(', ')} stay hidden from every client of ${name}.`,
        confirmLabel: 'Reject',
        tone: 'danger',
        call: `POST ${mcpPath(id, '/tool-reviews/reject')}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'POST', path: mcpPath(id, `/tool-reviews/${kind}`), body: { tools: picked }, source: kind === 'approve' ? 'Approve tools' : 'Reject tools' });
      reviews.setData(res);
      setPicked([]);
      return res;
    }, `${kind === 'approve' ? 'Approved' : 'Rejected'} ${picked.join(', ')}.`);
  }

  return (
    <Panel
      title={`Tools of ${name}`}
      subtitle="Select held tools, then approve or reject them together."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/tool-reviews'], ['POST', '/mcps/{mcp_id}/tool-reviews/approve'], ['POST', '/mcps/{mcp_id}/tool-reviews/reject']]} />
          <Btn onClick={reviews.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={reviews.error} />
      {d && (
        <>
          <KeyValue
            items={[
              ['Hold new tools (this MCP)', fmt(d.hold_new_tools)],
              ['Hold new tools (organization)', fmt(d.tenant_hold_new_tools)],
              ['Mode', fmt(d.mode)],
              ['Held now', String(all.filter(isHeld).length)],
            ]}
          />
          <div className={styles.actionsRow}>
            <Checkbox label="Held tools only" checked={heldOnly} onChange={setHeldOnly} />
            <Checkbox
              label="Select all held"
              checked={rows.filter(isHeld).length > 0 && rows.filter(isHeld).every((t) => picked.includes(t.name))}
              onChange={(on) => setPicked(on ? rows.filter(isHeld).map((t) => t.name) : [])}
            />
            <ActionButton method="POST" path="/mcps/{mcp_id}/tool-reviews/approve" variant="primary" disabled={!picked.length} onClick={() => decide('approve')}>
              <CircleCheck size={13} aria-hidden /> Approve {picked.length || ''}
            </ActionButton>
            <ActionButton method="POST" path="/mcps/{mcp_id}/tool-reviews/reject" variant="danger" disabled={!picked.length} onClick={() => decide('reject')}>
              <CircleX size={13} aria-hidden /> Reject {picked.length || ''}
            </ActionButton>
          </div>
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          <Notice tone="ok" onDismiss={() => action.setNotice('')}>
            {action.notice}
          </Notice>
          <Table
            rows={rows}
            rowKey={(r) => r.name}
            selected={open?.name}
            onRowClick={(r) => setOpen(open?.name === r.name ? null : r)}
            empty={reviews.loading ? 'Loading...' : heldOnly ? 'No tools are held for review.' : 'No reviewed tools.'}
            columns={[
              {
                label: 'Select',
                render: (r) =>
                  isHeld(r) ? (
                    <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                      <input type="checkbox" aria-label={`Select ${r.name}`} checked={picked.includes(r.name)} onChange={(e) => toggle(r.name, e.target.checked)} />
                    </span>
                  ) : null,
              },
              { label: 'Tool', render: (r) => <code>{r.name}</code> },
              { label: 'Status', render: (r) => <Pill tone={TONES[r.status]}>{r.status}</Pill> },
              { label: 'Detected', render: (r) => when(r.detected_at) },
              { label: 'Resolved', render: (r) => (r.resolved_at ? `${when(r.resolved_at)}${r.resolved_by ? ` by ${r.resolved_by}` : ''}` : '-') },
            ]}
          />
          {open && (
            <div className={styles.subPanel}>
              <h3>{open.name}</h3>
              {open.description && <p>{open.description}</p>}
              <JsonView value={open.input_schema ?? {}} maxHeight={320} />
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
