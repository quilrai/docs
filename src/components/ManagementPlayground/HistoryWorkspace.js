import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import {
  ActionButton,
  ApiChips,
  Btn,
  ConnectFirst,
  ErrorBox,
  Field,
  JsonView,
  KeyValue,
  Notice,
  Pager,
  Panel,
  Pill,
  Table,
  fmt,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { idOf, when } from './shared';
import styles from './styles.module.css';

export default function HistoryWorkspace() {
  const { client } = usePlayground();
  if (!client) return <ConnectFirst what="read the audit log and recover operations" />;
  return (
    <div className={styles.stack}>
      <Operations />
      <Audit />
    </div>
  );
}

function Audit() {
  const { client } = usePlayground();
  const [open, setOpen] = useState(null);
  const list = useCollection((cursor) => client.call({ path: `${MANAGEMENT_PREFIX}/audit`, query: { limit: 50, cursor }, source: 'Audit' }), [client]);
  const rows = list.data?.items || [];
  return (
    <Panel
      title="Audit log"
      subtitle="Management events for the tenant, newest first. Events recorded after the first page appear on a fresh listing."
      actions={
        <>
          <ApiChips calls={[['GET', '/audit']]} />
          <Btn onClick={list.first}>
            <RefreshCw size={13} aria-hidden /> Newest
          </Btn>
        </>
      }
    >
      <ErrorBox error={list.error} />
      <Table
        rows={rows}
        rowKey={(r) => idOf(r, 'event_id', 'id') || JSON.stringify(r)}
        onRowClick={(r) => setOpen(r)}
        empty={list.loading ? 'Loading...' : 'No audit events.'}
        columns={[
          { label: 'When', render: (r) => when(idOf(r, 'created_at', 'timestamp')) },
          { label: 'Operation', render: (r) => <code>{fmt(idOf(r, 'operation', 'action'))}</code> },
          { label: 'Resource', render: (r) => fmt(idOf(r, 'resource', 'resource_id', 'target')) },
          { label: 'Result', render: (r) => <Pill tone={/fail|error|denied/i.test(String(r.result)) ? 'err' : 'ok'}>{fmt(r.result ?? r.outcome)}</Pill> },
          { label: 'Actor key', render: (r) => <code>{fmt(idOf(r, 'actor_key_id', 'actor'))}</code> },
        ]}
      />
      <Pager list={list} />
      {open && (
        <div className={styles.subPanel}>
          <div className={styles.cardHead}>
            <h3>Event</h3>
            <Btn onClick={() => setOpen(null)}>Close</Btn>
          </div>
          <JsonView value={open} />
        </div>
      )}
    </Panel>
  );
}

function Operations() {
  const { client, confirm } = usePlayground();
  const [id, setId] = useState('');
  const [operation, setOperation] = useState(null);
  const action = useAction();
  const path = `${MANAGEMENT_PREFIX}/operations/${seg(id.trim())}`;
  return (
    <Panel
      title="Operations"
      subtitle="A write that fails after part of it was stored returns 503 operation_pending with an operation id. Look it up here, and recover configuration writes instead of assuming the 503 undid the save."
      actions={<ApiChips calls={[['GET', '/operations/{operation_id}'], ['POST', '/operations/{operation_id}/recover']]} />}
    >
      <form
        className={styles.inline}
        onSubmit={(e) => {
          e.preventDefault();
          action.run(async () => {
            const res = await client.call({ path, source: 'Operation lookup' });
            setOperation(res);
            return res;
          });
        }}
      >
        <Field label="Operation id">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="op_..." spellCheck="false" />
        </Field>
        <Btn type="submit" variant="primary" disabled={!id.trim()}>
          Look up
        </Btn>
        <ActionButton
          method="POST"
          path="/operations/{operation_id}/recover"
          scopes={['config:write']}
          disabled={!id.trim()}
          onClick={async () => {
            if (
              !(await confirm({
                title: `Recover operation ${id.trim()}?`,
                body: 'The gateway retries the saved write and audit record with the original validated payload. It refuses to overwrite a later, different configuration. Creation operations are recovered by retrying the original request instead.',
                confirmLabel: 'Recover',
                tone: 'danger',
              }))
            )
              return;
            await action.run(async () => {
              const res = await client.call({ method: 'POST', path: `${path}/recover`, source: 'Recover operation' });
              setOperation(res);
              return res;
            }, 'Recovery finished.');
          }}
        >
          Recover
        </ActionButton>
      </form>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {operation && (
        <>
          <KeyValue
            items={[
              ['State', <Pill key="s" tone={operation.state === 'complete' ? 'ok' : 'warn'}>{fmt(operation.state || operation.operation?.state)}</Pill>],
              ['Created', when(operation.created_at || operation.operation?.created_at)],
            ]}
          />
          <JsonView value={operation} />
        </>
      )}
    </Panel>
  );
}
