import React, { useState } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { ControlCollection, ControlSingleton, LookupForm, scopeText, useOpen } from './Controls';
import {
  ApiChips,
  Btn,
  ConnectFirst,
  ErrorBox,
  JsonView,
  KeyValue,
  Pager,
  Panel,
  Pill,
  Table,
  Tabs,
  fmt,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { useLoad, when } from './shared';
import styles from './styles.module.css';

const target = (t) => (t ? `${t.provider_label} / ${t.model}` : '-');

const destinationText = (d) => {
  if (!d) return '-';
  if (d.ref) return `ref ${d.ref}`;
  if (d.type === 'weighted') return (d.members || []).map((m) => `${target(m)} ${m.weight}%`).join(', ');
  if (d.type === 'ordered') return (d.targets || []).map(target).join(' > ');
  return fmt(d);
};

const failoverText = (f) => (!f ? 'inherited' : f.ref ? `ref ${f.ref}` : `${f.scope || f.candidate_scope || 'same_model'}, ${f.max_attempts ?? '-'} tries`);

const COLLECTIONS = {
  routes: {
    title: 'Routes',
    subtitle:
      'Which destination serves a requested model for a scope. Higher rank wins where routes overlap; mode is active, observe (shadow) or disabled.',
    path: '/controls/routes',
    routing: true,
    columns: [
      { label: 'Models', render: (r) => fmt(r.match?.requested_models?.join(', ') || (r.view ? 'console rule' : 'any')) },
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Rank', render: (r) => fmt(r.rank) },
      { label: 'Mode', render: (r) => (r.mode ? <Pill tone={r.mode === 'active' ? 'ok' : 'warn'}>{r.mode}</Pill> : '-') },
      { label: 'Destination', render: (r) => destinationText(r.destination) },
    ],
    quickOps: (r) => [
      ['Set mode', 'POST', ':set-mode', { mode: r?.mode === 'active' ? 'observe' : 'active' }],
    ],
  },
  destinations: {
    title: 'Destinations',
    subtitle: 'Named weighted pools or ordered target lists that routes reference. Changing one changes every route that uses it.',
    path: '/controls/destinations',
    routing: true,
    columns: [
      { label: 'Type', render: (r) => fmt(r.type) },
      { label: 'Members', render: (r) => destinationText(r) },
    ],
    quickOps: (r) => {
      const members = r?.members || [];
      const ops = [];
      if (r?.type === 'weighted') ops.push(['Set weights', 'POST', ':set-weights', { members }]);
      const first = members[0] || r?.targets?.[0];
      if (first) {
        ops.push([
          'Replace member',
          'POST',
          ':replace-member',
          { from: { provider_label: first.provider_label, model: first.model }, to: { provider_label: first.provider_label, model: first.model } },
        ]);
      }
      return ops;
    },
  },
  'failover-profiles': {
    title: 'Failover profiles',
    subtitle: 'Reusable failover settings that routes and failover rules reference by id.',
    path: '/controls/failover-profiles',
    routing: true,
    columns: [
      { label: 'Tier', render: (r) => fmt(r.scope || r.candidate_scope) },
      { label: 'Max tries', render: (r) => fmt(r.max_attempts) },
      { label: 'Backups', render: (r) => (r.fallbacks || []).map(target).join(', ') || '-' },
    ],
  },
  'failover-rules': {
    title: 'Failover rules',
    subtitle: "Failover for a scope when the deciding route has none of its own. Ranks share one space with routes.",
    path: '/controls/failover-rules',
    routing: true,
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Rank', render: (r) => fmt(r.rank) },
      { label: 'Failover', render: (r) => failoverText(r.failover) },
    ],
  },
  'routing-constraints': {
    title: 'Routing constraints',
    subtitle: 'Hard limits on where requests may go (provider tags, capabilities, provider lists). Every matching constraint applies; no rank. Writes need routing:constraints.',
    path: '/controls/routing-constraints',
    routing: true,
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Tags', render: (r) => (r.match || []).map((m) => m.tag).join(', ') || '-' },
      { label: 'Providers', render: (r) => fmt(r.providers) },
    ],
  },
  'model-access': {
    title: 'Model access',
    subtitle: 'Allow and deny lists of requested models for a scope.',
    path: '/controls/model-access',
    routing: true,
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Allow', render: (r) => (r.allow || []).join(', ') || '-' },
      { label: 'Deny', render: (r) => (r.deny || []).join(', ') || '-' },
    ],
  },
};

const TABS = [
  ['routes', 'Routes'],
  ['destinations', 'Destinations'],
  ['failover-profiles', 'Failover profiles'],
  ['failover-rules', 'Failover rules'],
  ['failover-default', 'Failover default'],
  ['routing-constraints', 'Constraints'],
  ['model-access', 'Model access'],
  ['references', 'References'],
  ['revisions', 'Revisions'],
  ['diagnostics', 'Diagnostics'],
];

const SURFACES = ['chat_completion', 'responses', 'vertex_ai', 'bedrock_runtime'];

export default function Routing() {
  const { client, urlParam, setParam } = usePlayground();
  const view = TABS.some(([id]) => id === urlParam('view')) ? urlParam('view') : 'routes';
  if (!client) return <ConnectFirst what="manage routes, destinations, failover and constraints" />;
  return (
    <div className={styles.stack}>
      <p className={styles.noticeInline}>
        Routing controls apply while the Policy Engine is on for the LLM Gateway; otherwise every call answers{' '}
        <code>409 policy_not_enabled</code>. Each write publishes one policy revision. Existing conversations keep their
        target unless a write sends <code>repin=drop</code>.
      </p>
      <Tabs label="Routing area" value={view} onChange={(v) => setParam('view', v)} tabs={TABS} />
      {COLLECTIONS[view] && <ControlCollection key={view} config={COLLECTIONS[view]} />}
      {view === 'failover-default' && (
        <ControlSingleton
          title="Failover default"
          subtitle="Tenant-wide failover for requests whose route and failover rules set none. Reset returns to the built-in default."
          path="/controls/failover-default"
        />
      )}
      {view === 'references' && <References />}
      {view === 'revisions' && <Revisions />}
      {view === 'diagnostics' && <Diagnostics />}
    </div>
  );
}

function References() {
  return (
    <LookupForm
      title="Find everything that uses a provider"
      subtitle="Every route, destination, failover profile or rule, constraint, model access entry and limit that names the provider label (or one of its models), following references, plus console rules."
      path="/controls/references"
      fields={[
        ['provider_label', 'Provider label', 'Required'],
        ['model', 'Model', 'Optional: one model of the label'],
      ]}
      summary={(res) => (
        <Table
          rows={res.items || []}
          rowKey={(r) => `${r.collection}:${r.id}`}
          empty="Nothing references this provider."
          columns={[
            { label: 'Collection', render: (r) => fmt(r.collection) },
            { label: 'Id', render: (r) => <code>{fmt(r.id)}</code> },
            { label: 'Source', render: (r) => fmt(r.source) },
            { label: 'Fields', render: (r) => (r.fields || []).join(', ') },
          ]}
        />
      )}
    />
  );
}

function Revisions() {
  const { client } = usePlayground();
  const open = useOpen();
  const [selected, setSelected] = useState(null);
  const action = useAction();
  const list = useCollection(
    (cursor) => client.call({ path: `${MANAGEMENT_PREFIX}/controls/revisions`, query: { limit: 50, cursor }, source: 'Revisions' }),
    [client],
  );
  const active = list.data?.active_revision;
  async function status(revision) {
    await action.run(async () => {
      const res = await client.call({ path: `${MANAGEMENT_PREFIX}/controls/revisions/${seg(revision)}/status`, source: 'Revision rollout' });
      setSelected({ revision, status: res });
      return res;
    });
  }
  return (
    <Panel
      title="Revision history and restore"
      subtitle="Every policy revision, newest first, with who made it and which control collections changed. Restore puts managed controls back to a revision in one new revision; console rules are untouched."
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', '/controls/revisions'],
              ['GET', '/controls/revisions/{revision}/status'],
              ['POST', '/controls/revisions/{revision}:restore'],
            ]}
          />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Refresh
          </Btn>
        </>
      }
    >
      <ErrorBox error={list.error} />
      {active != null && (
        <p className={styles.muted}>
          Active revision <strong>{active}</strong> · collection ETag <code>"r{active}"</code>
        </p>
      )}
      <div className={styles.split}>
        <div>
          <Table
            rows={list.data?.items || []}
            rowKey={(r) => r.revision}
            selected={selected?.revision}
            onRowClick={(r) => status(r.revision)}
            empty={list.loading ? 'Loading...' : 'No revisions yet.'}
            columns={[
              { label: 'Revision', render: (r) => <strong>{r.revision}</strong> },
              { label: 'When', render: (r) => when(r.created_at) },
              { label: 'Kind', render: (r) => <Pill>{fmt(r.kind)}</Pill> },
              { label: 'Changed', render: (r) => (r.domains_changed || []).join(', ') || '-' },
              { label: 'Actor', render: (r) => <code>{fmt(r.actor)}</code> },
            ]}
          />
          <Pager list={list} />
        </div>
        <div>
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          {selected ? (
            <>
              <h3>Revision {selected.revision}</h3>
              <KeyValue
                items={[
                  ['Rollout', selected.status.complete ? <Pill tone="ok">complete</Pill> : <Pill tone="warn">not confirmed</Pill>],
                  ['Processes reporting', fmt(selected.status.processes_reporting)],
                  ['On this revision or newer', fmt(selected.status.processes_on_rev)],
                  ['Lagging', fmt((selected.status.lagging || []).length)],
                ]}
              />
              {selected.status.processes_reporting === 0 && (
                <p className={styles.muted}>No gateway served this tenant recently, so nothing reports yet. That means no traffic, not "not applied".</p>
              )}
              {active != null && selected.revision !== active && (
                <Btn
                  onClick={() =>
                    open('POST', '/controls/revisions/{revision}:restore', {
                      pathParams: { revision: String(selected.revision) },
                      query: { dry_run: 'true' },
                      headers: { 'If-Match': `"r${active}"` },
                      body: {},
                    })
                  }
                >
                  <RotateCcw size={13} aria-hidden /> Restore to this revision (dry run)
                </Btn>
              )}
              <JsonView value={selected.status} maxHeight={360} />
            </>
          ) : (
            <p className={styles.muted}>Select a revision to see whether gateways run it.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function Diagnostics() {
  const { client } = usePlayground();
  const capacity = useLoad(() => client.call({ path: `${MANAGEMENT_PREFIX}/controls/_capacity`, source: 'Policy capacity' }), [client]);
  const caps = capacity.data?.limits;
  return (
    <>
      <LookupForm
        title="Explain the route for a request"
        subtitle="Which rule routes a sample request, its destination, who owns its failover, which rules it outranked, constraints and active mark-downs. Nothing is sent upstream."
        path="/routing/effective"
        calls={[
          ['GET', '/routing/effective'],
          ['POST', '/routing/test'],
          ['POST', '/routing/target-check'],
          ['GET', '/routing/summary'],
          ['GET', '/failover/summary'],
        ]}
        fields={[
          ['app', 'App', 'App name'],
          ['requested_model', 'Requested model', 'The model the client sends'],
          ['user', 'User', 'User email, for user and smart-group scopes'],
          ['surface', 'Surface', 'Client API family', SURFACES],
          ['session_id', 'Session id', 'Optional: report the pin state'],
        ]}
        summary={(res) => (
          <KeyValue
            items={[
              ['Route', res.route ? `${res.route.managed?.id || res.route.route_id || res.route.source} (rank ${fmt(res.route.rank)})` : 'default'],
              ['Destination', fmt(res.destination?.group || res.destination?.targets || res.destination)],
              ['Failover owner', fmt(res.failover_owner?.managed?.id ? `${res.failover_owner.kind}: ${res.failover_owner.managed.id}` : res.failover_owner?.kind)],
              ['Outranked', (res.shadowed || []).map((s) => s.managed?.id || s.route_id || s.source).join(', ') || '-'],
              ['Mark-downs applied', fmt((res.mark_downs_applied || []).length)],
              ['Revision', `${fmt(res.revision)}${res.revision_current === false ? ' (not current)' : ''}`],
            ]}
          />
        )}
      />
      <Panel
        title="Policy capacity"
        subtitle="Rules, policies and policy size used against the tenant caps. A write past them is 422 policy_capacity_exceeded."
        actions={<ApiChips calls={[['GET', '/controls/_capacity'], ['POST', '/controls/_batch']]} />}
      >
        <ErrorBox error={capacity.error} />
        {caps && (
          <KeyValue
            items={[
              ['Rules', `${caps.rules_used} of ${caps.rules_max}`],
              ['Policies', `${caps.policies_used} of ${caps.policies_max}`],
              ['Policy bytes', `${caps.source_bytes_used} of ${caps.source_bytes_max}`],
            ]}
          />
        )}
      </Panel>
    </>
  );
}
