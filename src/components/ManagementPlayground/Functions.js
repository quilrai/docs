import React, { useState } from 'react';
import { FlaskConical, ShieldCheck } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { ControlCollection, scopeText, useOpen } from './Controls';
import { ApiChips, Btn, ConnectFirst, ErrorBox, JsonView, Panel, Pill, Table, Tabs, fmt, useAction, useCollection, usePlayground } from './ui';
import { useDetailReveal } from './shared';
import styles from './styles.module.css';

// The example function from the guide: adds the customer's plan in front of the latest user turn.
export const EXAMPLE_FUNCTION = {
  display_name: 'Add account context',
  description: 'Adds the customer plan in front of the latest user message.',
  code: [
    'email = (request.get("user") or {}).get("email")',
    'plans = await data.get("support/plans", {})',
    'plan = plans.get(email, "free")',
    'await conv.add_context("Customer plan: " + plan + ". Follow the support policy for this plan.")',
    '{"plan": plan}',
  ].join('\n'),
  timeout_ms: 2000,
};

// Mocks answer every outside call, so a test run sends nothing anywhere and stores nothing.
const EXAMPLE_TEST = {
  function: EXAMPLE_FUNCTION,
  request: { user: { email: 'ana@example.com' } },
  mocks: {
    data: { 'support/plans': { 'ana@example.com': 'enterprise' } },
    conv: { messages: [{ role: 'user', text: 'Where is my invoice?' }] },
  },
};

const ids = (list) => (Array.isArray(list) && list.length ? list.map((item) => item.id).join(', ') : '-');

const BINDINGS = {
  title: 'Function bindings',
  subtitle:
    'Which functions run on which requests: before the model call (functions), as tools the model can call (tools), on the answer (post_call) and after the request (on_complete). Console policy rules that attach functions are listed read-only.',
  path: '/controls/functions',
  columns: [
    { label: 'Enabled', render: (r) => (r.enabled === false ? <Pill tone="off">off</Pill> : <Pill tone="ok">on</Pill>) },
    { label: 'Order', render: (r) => fmt(r.order) },
    { label: 'Applies to', render: (r) => scopeText(r.scope) },
    { label: 'Before the model', render: (r) => ids(r.functions) },
    { label: 'Tools', render: (r) => ids(r.tools) },
    { label: 'On the answer', render: (r) => ids(r.post_call) },
    { label: 'After the request', render: (r) => ids(r.on_complete) },
  ],
};

const TABS = [
  ['functions', 'Functions'],
  ['bindings', 'Bindings'],
  ['background', 'Background runs'],
];

export default function Functions() {
  const { client, urlParam, setParam } = usePlayground();
  const view = TABS.some(([id]) => id === urlParam('view')) ? urlParam('view') : 'functions';
  if (!client) return <ConnectFirst what="list gateway functions, check and test-run a script, and manage function bindings" />;
  return (
    <div className={styles.stack}>
      <p className={styles.noticeInline}>
        A function does nothing until a binding or a console policy rule attaches it. Reads need <code>read</code>;
        saving, checking, test runs and bindings need <code>functions:write</code>. Each binding write publishes one
        policy revision. Checks and test runs store nothing.
      </p>
      <Tabs label="Functions area" value={view} onChange={(v) => setParam('view', v)} tabs={TABS} />
      {view === 'functions' && <FunctionList />}
      {view === 'bindings' && <ControlCollection key={view} config={BINDINGS} />}
      {view === 'background' && <BackgroundRuns />}
    </div>
  );
}

function FunctionList() {
  const { client } = usePlayground();
  const open = useOpen();
  const [detail, setDetail] = useState(null);
  const detailRef = useDetailReveal(detail?.id);
  const action = useAction();
  const list = useCollection(() => client.call({ path: `${MANAGEMENT_PREFIX}/functions`, source: 'Functions' }), [client]);
  async function read(id) {
    await action.run(async () => {
      const res = await client.call({ path: `${MANAGEMENT_PREFIX}/functions/${seg(id)}`, source: 'Function detail' });
      setDetail({ id, data: res });
      return res;
    });
  }
  return (
    <Panel
      title="Functions"
      subtitle="Python scripts and remote MCP servers the gateway can run on a request. The list leaves the code out; select a row to read it. Secrets read back as ********."
      actions={
        <>
          <ApiChips calls={[['GET', '/functions'], ['GET', '/functions/{function_id}'], ['POST', '/functions/_validate'], ['POST', '/functions/_test']]} />
          <Btn onClick={() => open('POST', '/functions/_validate', { body: { function: EXAMPLE_FUNCTION } })}>
            <ShieldCheck size={13} aria-hidden /> Check the example
          </Btn>
          <Btn variant="primary" onClick={() => open('POST', '/functions/_test', { body: EXAMPLE_TEST })}>
            <FlaskConical size={13} aria-hidden /> Test-run the example
          </Btn>
        </>
      }
    >
      <ErrorBox error={list.error} />
      <div className={`${styles.split} ${styles.masterDetail}`}>
        <div>
          <Table
            rows={list.data?.functions || []}
            rowKey={(r) => r.id}
            selected={detail?.id}
            onRowClick={(r) => read(r.id)}
            empty={list.loading ? 'Loading...' : 'No functions yet. Create one with PUT /functions/{function_id}.'}
            columns={[
              { label: 'Id', render: (r) => <code>{fmt(r.id)}</code> },
              { label: 'Kind', render: (r) => fmt(r.kind) },
              { label: 'Version', render: (r) => fmt(r.version) },
              { label: 'If a run fails', render: (r) => fmt(r.on_failure) },
              { label: 'Time limit (ms)', render: (r) => fmt(r.timeout_ms) },
              { label: 'Updated', render: (r) => fmt(r.updated_at) },
            ]}
          />
        </div>
        <div ref={detailRef}>
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          {detail ? <JsonView value={detail.data} maxHeight={560} /> : <p className={styles.muted}>Select a row to read it.</p>}
        </div>
      </div>
    </Panel>
  );
}

function BackgroundRuns() {
  const { client } = usePlayground();
  const status = useCollection(
    () => client.call({ path: `${MANAGEMENT_PREFIX}/functions/_on_complete/status`, source: 'Background runs' }),
    [client],
  );
  return (
    <Panel
      title="Background runs"
      subtitle="Functions that run after a request is finished: what is waiting and, per function, how many runs succeeded, failed or were dropped. The numbers are those of the gateway server that answered."
      actions={
        <>
          <ApiChips calls={[['GET', '/functions/_on_complete/status']]} />
          <Btn onClick={status.reload}>Refresh</Btn>
        </>
      }
    >
      <ErrorBox error={status.error} />
      <Table
        rows={status.data?.functions || []}
        rowKey={(r) => r.id}
        empty={status.loading ? 'Loading...' : 'No background function has run on this server yet.'}
        columns={[
          { label: 'Function', render: (r) => <code>{fmt(r.id)}</code> },
          { label: 'Waiting', render: (r) => fmt(r.queued) },
          { label: 'Running', render: (r) => fmt(r.running) },
          { label: 'Succeeded', render: (r) => fmt(r.succeeded) },
          { label: 'Failed', render: (r) => fmt(r.failed) },
          { label: 'Dropped', render: (r) => fmt(r.dropped) },
          { label: 'Last error', render: (r) => fmt(r.last_error) },
        ]}
      />
    </Panel>
  );
}
