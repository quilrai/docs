import React, { useState } from 'react';
import { Eye, Pencil, Plus, RefreshCw, RotateCcw, Unlink } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { useOpen } from './Controls';
import {
  ActionButton,
  ApiChips,
  Btn,
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
} from './ui';
import { useLoad, when } from './shared';
import styles from './styles.module.css';

const isoIn = (hours) => new Date(Date.now() + hours * 3600 * 1000).toISOString().replace(/\.\d+Z$/, 'Z');

export default function Incidents() {
  const { client } = usePlayground();
  if (!client) return <ConnectFirst what="mark providers down during an outage and restore them" />;
  return (
    <div className={styles.stack}>
      <p className={styles.noticeInline}>
        Incident controls work whether or not the Policy Engine is on and never publish a policy revision. Every gateway
        applies a change within about a minute. Mark-downs expire on their own, at most 72 hours after they are set.
      </p>
      <Runbook />
      <MarkDowns />
      <Status />
    </div>
  );
}

function Runbook() {
  const open = useOpen();
  const example = { provider_label: 'azure-eu', model: null, apps: '*', reason: 'Provider outage', ticket: 'INC-123', expires_at: isoIn(4) };
  return (
    <Panel
      title="Outage runbook"
      subtitle="Preview what a mark-down would do, mark the provider down with an expiry, check that gateways applied it, then restore it."
      actions={
        <ApiChips
          calls={[
            ['POST', '/incidents/mark-downs:preview'],
            ['PUT', '/incidents/mark-downs/{mark_down_id}'],
            ['POST', '/incidents/reset-cooldowns'],
            ['POST', '/incidents/drop-pins'],
          ]}
        />
      }
    >
      <div className={styles.inline}>
        <Btn onClick={() => open('POST', '/incidents/mark-downs:preview', { body: example })}>
          <Eye size={13} aria-hidden /> 1. Preview a mark-down
        </Btn>
        <Btn
          variant="primary"
          onClick={() =>
            open('PUT', '/incidents/mark-downs/{mark_down_id}', {
              pathParams: { mark_down_id: 'inc-123-azure-eu' },
              body: example,
            })
          }
        >
          <Plus size={13} aria-hidden /> 2. Mark a provider down
        </Btn>
        <Btn onClick={() => open('POST', '/incidents/reset-cooldowns', { body: { apps: '*', provider_label: 'azure-eu' } })}>
          <RotateCcw size={13} aria-hidden /> Reset cooldowns
        </Btn>
        <Btn onClick={() => open('POST', '/incidents/drop-pins', { body: { apps: '*', provider_label: 'azure-eu' } })}>
          <Unlink size={13} aria-hidden /> Drop session pins
        </Btn>
      </div>
      <p className={styles.muted}>
        Each button opens the call in the API explorer with an example body. Replace <code>azure-eu</code> with your
        provider label, and name apps instead of <code>"*"</code> to limit the change.
      </p>
    </Panel>
  );
}

function MarkDowns() {
  const { client, confirm } = usePlayground();
  const open = useOpen();
  const [selected, setSelected] = useState(null);
  const action = useAction();
  const list = useLoad(() => client.call({ path: `${MANAGEMENT_PREFIX}/incidents/mark-downs`, source: 'Mark-downs' }), [client]);
  const rows = list.data?.items || [];

  async function read(id) {
    await action.run(async () => {
      const res = await client.call({ path: `${MANAGEMENT_PREFIX}/incidents/mark-downs/${seg(id)}`, source: 'Mark-down detail' });
      setSelected({ id, data: res });
      return res;
    });
  }

  async function restore(row) {
    if (
      !(await confirm({
        title: `Restore ${row.provider_label}${row.model ? ` / ${row.model}` : ''}?`,
        body: 'The provider takes traffic again on every gateway within about a minute. Conversations that moved away during the incident stay where they are; drop pins to rebalance them.',
        call: `DELETE /incidents/mark-downs/${row.id}`,
        confirmLabel: 'Restore',
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({
        method: 'DELETE',
        path: `${MANAGEMENT_PREFIX}/incidents/mark-downs/${seg(row.id)}`,
        headers: row.version ? { 'If-Match': `"${row.version}"` } : {},
        source: 'Restore mark-down',
      });
      setSelected(null);
      list.reload();
      return res;
    }, 'Restored.');
  }

  return (
    <Panel
      title="Active mark-downs"
      subtitle="Providers taken out of routing and failover for every app or chosen apps. Per-app mark-downs set in the console are listed read only."
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', '/incidents/mark-downs'],
              ['GET', '/incidents/mark-downs/{mark_down_id}'],
              ['DELETE', '/incidents/mark-downs/{mark_down_id}'],
            ]}
          />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ErrorBox error={list.error} />
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      <Table
        rows={rows}
        rowKey={(r) => r.id}
        selected={selected?.id}
        onRowClick={(r) => (r.read_only ? setSelected({ id: r.id, data: r }) : read(r.id))}
        empty={list.loading ? 'Loading...' : 'No active mark-downs.'}
        columns={[
          { label: 'Provider', render: (r) => <code>{`${r.provider_label}${r.model ? ` / ${r.model}` : ''}`}</code> },
          { label: 'Apps', render: (r) => (r.apps === '*' ? 'every app' : (r.apps || []).join(', ')) },
          { label: 'Reason', render: (r) => fmt(r.reason) },
          { label: 'Expires', render: (r) => when(r.expires_at) },
          { label: 'Source', render: (r) => <Pill tone={r.read_only ? 'off' : 'ok'}>{fmt(r.source)}</Pill> },
          {
            label: 'Action',
            render: (r) =>
              r.read_only ? (
                <span className={styles.muted}>console</span>
              ) : (
                <span className={styles.inline} onClick={(e) => e.stopPropagation()} role="presentation">
                  <ActionButton method="DELETE" path="/incidents/mark-downs/{mark_down_id}" onClick={() => restore(r)}>
                    Restore
                  </ActionButton>
                  <Btn
                    onClick={() =>
                      open('PUT', '/incidents/mark-downs/{mark_down_id}', {
                        pathParams: { mark_down_id: r.id },
                        headers: { 'If-Match': `"${r.version}"` },
                        body: {
                          provider_label: r.provider_label,
                          model: r.model ?? null,
                          apps: r.apps,
                          reason: r.reason,
                          ticket: r.ticket ?? null,
                          expires_at: r.expires_at,
                        },
                      })
                    }
                  >
                    <Pencil size={12} aria-hidden /> Change
                  </Btn>
                </span>
              ),
          },
        ]}
      />
      {selected && <JsonView value={selected.data} maxHeight={420} />}
      {list.data?.generations && (
        <details>
          <summary>Cooldown and pin generations</summary>
          <JsonView value={list.data.generations} />
        </details>
      )}
    </Panel>
  );
}

function Status() {
  const { client } = usePlayground();
  const status = useLoad(() => client.call({ path: `${MANAGEMENT_PREFIX}/incidents/status`, source: 'Incident status' }), [client]);
  const s = status.data;
  return (
    <Panel
      title="Is it applied?"
      subtitle="Whether the latest incident change is in force on the gateway you are connected to, and by when every other gateway applies it."
      actions={
        <>
          <ApiChips calls={[['GET', '/incidents/status']]} />
          <Btn onClick={status.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ErrorBox error={status.error} />
      {s && (
        <>
          <KeyValue
            items={[
              ['Record version', fmt(s.record_version)],
              ['This gateway', s.this_server?.applied ? <Pill tone="ok">applied</Pill> : <Pill tone="warn">not yet</Pill>],
              ['Every gateway by', when(s.fleet?.applied_everywhere_by)],
              ['Bound', s.fleet?.bound_seconds != null ? `${s.fleet.bound_seconds} s after the write` : '-'],
            ]}
          />
          <details>
            <summary>Raw status</summary>
            <JsonView value={s} />
          </details>
        </>
      )}
    </Panel>
  );
}
