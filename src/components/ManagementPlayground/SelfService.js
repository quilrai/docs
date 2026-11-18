import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX, appRoute, seg } from './client.mjs';
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
  Pager,
  Panel,
  Pill,
  Table,
  Tabs,
  csv,
  fmt,
  parseJson,
  pretty,
  useAction,
  useCollection,
  usePlayground,
} from './ui';
import { useLoad, when } from './shared';
import { Stats, num, usd, daysAgo, isoDate } from './charts';
import styles from './styles.module.css';

// Self-service: the console's Self-service tab through the Management API.
// The API keeps the older names: access plan = profile, model option = tier,
// app template = blueprint, request = exception.

const P = MANAGEMENT_PREFIX;
const ROLE_LABEL = {
  self_service_viewer: 'Viewer access',
  settings_update_requester: 'Settings request access',
  settings_update_direct: 'Direct settings update',
  show_api_key: 'View and copy API key values',
  show_logs_for_all_users: 'All-logs visibility',
};
const roles = (list) => (list || []).map((r) => ROLE_LABEL[r] || r).join(', ') || '-';
const STATUS_TONE = { pending: 'warn', approved: 'ok', rejected: 'err', failed: 'err', revoked: 'off', cancelled: 'off', expired: 'off', active: 'ok' };

const VIEWS = [
  ['plans', 'Access plans'],
  ['evaluate', 'Check a person'],
  ['coverage', 'Coverage and key impact'],
  ['requests', 'Requests'],
  ['keys', 'Personal keys'],
  ['templates', 'Templates and owners'],
  ['usage', 'Usage report'],
];

export default function SelfService() {
  const { client, urlParam, setParam } = usePlayground();
  if (!client) return <ConnectFirst what="configure self-service: access plans, requests and personal keys" />;
  const view = VIEWS.some(([id]) => id === urlParam('view')) ? urlParam('view') : 'plans';
  return (
    <div className={styles.stack}>
      <Tabs label="Self-service" tabs={VIEWS} value={view} onChange={(id) => setParam('view', id)} />
      {view === 'plans' && <Plans />}
      {view === 'evaluate' && <Evaluate />}
      {view === 'coverage' && <Coverage />}
      {view === 'requests' && <Requests />}
      {view === 'keys' && <PersonalKeys />}
      {view === 'templates' && <TemplatesAndOwners />}
      {view === 'usage' && <UsageReport />}
    </div>
  );
}

function Plans() {
  const { client } = usePlayground();
  const res = useLoad(() => client.call({ path: `${P}/self-service/profiles`, source: 'Self-service profiles' }), [client]);
  const [settingsText, setSettingsText] = useState('');
  const action = useAction();
  const data = res.data;
  const settings = data?.settings;
  const draft = parseJson(settingsText);
  return (
    <>
      <Panel
        title="Access plans (profiles)"
        subtitle="Lowest matching Smart Group rank wins; plans do not combine. Create and replace plans from the API Explorer."
        actions={
          <>
            <ApiChips
              calls={[
                ['GET', '/self-service/profiles'],
                ['POST', '/self-service/profiles'],
                ['PUT', '/self-service/profiles/{profile_id}'],
              ]}
            />
            <Btn onClick={res.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
          </>
        }
      >
        <ErrorBox error={res.error} />
        <Table
          rows={data?.profiles || []}
          rowKey={(p) => p.profile_id}
          empty={res.loading ? 'Loading...' : 'No access plans. Without them, each app decides with its own lists.'}
          columns={[
            { label: 'Name', render: (p) => <strong>{p.name}</strong> },
            { label: 'Smart Groups', render: (p) => (p.smart_groups || []).map((g) => `${g} (rank ${data.groups?.[g]?.effective_priority ?? '?'})`).join(', ') },
            { label: 'Apps', render: (p) => (p.llm_apps === 'hidden' ? <Pill>starter: {p.default_app}</Pill> : 'shown') },
            { label: 'Sections', render: (p) => (p.sections || []).join(', ') || '-' },
            { label: 'Model options', render: (p) => (p.models ? (p.models.tiers || []).join(', ') || 'none' : 'not limited') },
            { label: 'Keys', render: (p) => `${p.keys?.max_active_per_person ?? '-'} per app, ${p.keys?.max_lifetime_days ?? 'no'} day cap` },
            { label: 'Revision', render: (p) => p.revision },
          ]}
        />
      </Panel>
      {data && (
        <Panel
          title="Settings, model options and app templates"
          subtitle="PUT /self-service/settings: every field but revision is optional, and an omitted field keeps its saved value."
          actions={<ApiChips calls={[['PUT', '/self-service/settings']]} />}
        >
          <KeyValue
            items={[
              ['People without a plan', settings?.deny_without_profile ? 'No self-service' : "Keep each app's own settings"],
              ['Model options (tiers)', (settings?.tiers || []).map((t) => `${t.label || t.tier_id} = ${t.model}`).join(', ') || '-'],
              ['App templates (blueprints)', (settings?.blueprints || []).map((b) => b.label || b.app_name).join(', ') || '-'],
              ['Revision', settings?.revision ?? 0],
              ['Suspended people', (data.suspensions || []).map((s) => s.email).join(', ') || '-'],
            ]}
          />
          <JsonField
            label="Body (send only what you change)"
            rows={5}
            value={settingsText}
            onChange={setSettingsText}
            hint={`For example {"deny_without_profile": false, "revision": ${settings?.revision ?? 0}}`}
          />
          <div className={styles.actionsRow}>
            <ActionButton
              method="PUT"
              path="/self-service/settings"
              scopes={['config:write']}
              variant="primary"
              disabled={!draft.value || !!draft.error}
              onClick={() =>
                action.run(async () => {
                  const out = await client.call({ method: 'PUT', path: `${P}/self-service/settings`, body: draft.value, source: 'Update self-service settings' });
                  res.reload();
                  return out;
                }, 'Settings saved.')
              }
            >
              Save settings
            </ActionButton>
          </div>
          <ErrorBox error={action.error} />
          <Notice onDismiss={() => action.setNotice('')}>{action.notice}</Notice>
          <details>
            <summary>Raw response</summary>
            <JsonView value={data} maxHeight={420} />
          </details>
        </Panel>
      )}
    </>
  );
}

function Evaluate() {
  const { client } = usePlayground();
  const [email, setEmail] = useState('');
  const [draftText, setDraftText] = useState('');
  const action = useAction();
  const [result, setResult] = useState(null);
  const draft = parseJson(draftText);
  return (
    <Panel
      title="Check a person"
      subtitle="Which access plan applies, the abilities on each app and where each comes from. With a draft plan, the result is as if it were saved; nothing is stored."
      actions={<ApiChips calls={[['POST', '/self-service/evaluate']]} />}
    >
      <form
        className={styles.filters}
        onSubmit={(e) => {
          e.preventDefault();
          action.run(async () => {
            const body = { email: email.trim(), ...(draft.value ? { draft_profile: draft.value } : {}) };
            setResult(await client.call({ method: 'POST', path: `${P}/self-service/evaluate`, body, source: 'Evaluate self-service' }));
          });
        }}
      >
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" required />
        </Field>
        <Btn type="submit" variant="primary" disabled={!email.trim() || !!draft.error}>
          Check
        </Btn>
      </form>
      <JsonField label="Draft plan (optional draft_profile)" rows={4} value={draftText} onChange={setDraftText} hint="Every profile field, as for a create." />
      <ErrorBox error={action.error} />
      {result && (
        <>
          <KeyValue
            items={[
              ['Access plan', result.profile ? `${result.profile.name} (via ${result.profile.via_group_name || result.profile.via_group}, rank ${result.profile.rank})` : 'None'],
              ['Suspended', result.suspended ? 'yes' : 'no'],
              ['Blocked', result.blocked ? 'yes' : 'no'],
              ['Sections', (result.sections || []).join(', ') || '-'],
              ['Keys', result.keys ? `${result.keys.max_active_per_person} active per app, lifetime ${result.keys.max_lifetime_days ?? 'as each app allows'}` : '-'],
            ]}
          />
          <Table
            rows={result.apps || []}
            rowKey={(a) => a.app_name}
            empty="No app gives this person any ability."
            columns={[
              { label: 'App', render: (a) => <strong>{a.app_name}</strong> },
              { label: 'Holds', render: (a) => roles(a.roles) },
              { label: 'From the app', render: (a) => roles(a.from_app) },
              { label: 'From the plan', render: (a) => roles(a.from_profile) },
              { label: 'Owner or request', render: (a) => roles([...(a.from_owner || []), ...(a.from_exception || [])]) },
              { label: 'Removed by the plan', render: (a) => (a.outside_ceiling ? 'outside the plan' : roles(a.removed_by_ceiling)) },
            ]}
          />
          <details>
            <summary>Raw response</summary>
            <JsonView value={result} maxHeight={420} />
          </details>
        </>
      )}
    </Panel>
  );
}

const BLANK_COVERAGE = { draftProfile: '', replaces: '', remove: '', deny: '', draftApps: '' };

function KeyImpactTable({ side, label }) {
  if (!side) return null;
  return (
    <>
      <h3>
        {label}: {num(side.people)} people, {num(side.apps)} apps, {num(side.personal_keys)} personal keys
        {side.truncated ? ' (list truncated)' : ''}
      </h3>
      <Table
        rows={side.entries || []}
        rowKey={(e) => `${e.email}|${e.app_name}`}
        empty="Nobody."
        columns={[
          { label: 'Email', render: (e) => e.email },
          { label: 'App', render: (e) => e.app_name },
          { label: 'Personal keys', render: (e) => num(e.personal_keys) },
        ]}
      />
    </>
  );
}

function Coverage() {
  const { client } = usePlayground();
  const [form, setForm] = useState(BLANK_COVERAGE);
  const [result, setResult] = useState(null);
  const action = useAction();
  const draftProfile = parseJson(form.draftProfile);
  const draftApps = parseJson(form.draftApps);
  const body = {
    ...(draftProfile.value ? { draft_profile: draftProfile.value } : {}),
    ...(draftProfile.value && form.replaces.trim() ? { replaces_profile_id: form.replaces.trim() } : {}),
    ...(form.remove.trim() ? { remove_profile_id: form.remove.trim() } : {}),
    ...(form.deny ? { deny_without_profile: form.deny === 'true' } : {}),
    ...(Array.isArray(draftApps.value) ? { draft_apps: draftApps.value } : {}),
  };
  const hasDraft = Object.keys(body).length > 0;
  const run = () =>
    action.run(async () =>
      setResult(
        await client.call({
          method: hasDraft ? 'POST' : 'GET',
          path: `${P}/self-service/coverage`,
          ...(hasDraft ? { body } : {}),
          source: hasDraft ? 'Coverage for a draft' : 'Coverage',
        }),
      ),
    );
  const impact = result?.key_impact;
  return (
    <Panel
      title="Coverage and key impact"
      subtitle="People per plan and what a change would cut off. With any draft input, key_impact names the people whose personal keys would stop (lost) or start (gained) working. Nothing is saved."
      actions={<ApiChips calls={[['GET', '/self-service/coverage'], ['POST', '/self-service/coverage']]} />}
    >
      <div className={styles.formGrid}>
        <Field label="Count as if this plan were deleted" hint="remove_profile_id; not with a draft plan.">
          <input value={form.remove} onChange={(e) => setForm({ ...form, remove: e.target.value })} placeholder="profile_id" />
        </Field>
        <Field label="People without a plan" hint="deny_without_profile">
          <select value={form.deny} onChange={(e) => setForm({ ...form, deny: e.target.value })}>
            <option value="">as saved</option>
            <option value="false">Keep each app's own settings</option>
            <option value="true">No self-service</option>
          </select>
        </Field>
        <Field label="Draft replaces plan" hint="replaces_profile_id, with a draft plan.">
          <input value={form.replaces} onChange={(e) => setForm({ ...form, replaces: e.target.value })} placeholder="profile_id" />
        </Field>
      </div>
      <JsonField label="Draft plan (draft_profile)" rows={4} value={form.draftProfile} onChange={(v) => setForm({ ...form, draftProfile: v })} />
      <JsonField
        label="Draft app settings (draft_apps, 1-50)"
        rows={4}
        value={form.draftApps}
        onChange={(v) => setForm({ ...form, draftApps: v })}
        hint='For example [{"app_name": "Support Bot", "enable_self_service": false}]'
      />
      <div className={styles.actionsRow}>
        <Btn variant="primary" onClick={run} disabled={!!draftProfile.error || !!draftApps.error}>
          {hasDraft ? 'Count the draft' : 'Count the saved state'}
        </Btn>
        <Btn onClick={() => setForm(BLANK_COVERAGE)}>Clear</Btn>
      </div>
      <details>
        <summary>Request body</summary>
        <JsonView value={hasDraft ? body : '(GET, no body)'} />
      </details>
      <ErrorBox error={action.error} />
      {result && (
        <>
          <Stats
            items={[
              ['People', num(result.people?.total)],
              ['With a plan', num(result.matched)],
              ['Without a plan', num(result.unmatched?.total)],
              ['Suspended', num(result.suspended)],
              ['Cut off by No self-service', num(result.deny_without_profile?.cut_off)],
            ]}
          />
          {result.exact === false && <p className={styles.muted}>Counts are partial: more active personal keys exist than one count reads.</p>}
          <Table
            rows={result.profiles || []}
            rowKey={(p) => p.profile_id}
            empty="No plans."
            columns={[
              { label: 'Plan', render: (p) => <strong>{p.name}{p.draft ? ' (draft)' : ''}</strong> },
              { label: 'Gets this plan', render: (p) => num(p.winning) },
              { label: 'In its Smart Groups', render: (p) => num(p.matching) },
            ]}
          />
          {impact ? (
            <>
              <KeyImpactTable side={impact.lost} label="Would lose access" />
              <KeyImpactTable side={impact.gained} label="Would get access back" />
            </>
          ) : (
            <p className={styles.muted}>key_impact is null: send a draft input to see whose personal keys would change.</p>
          )}
          <details>
            <summary>Raw response</summary>
            <JsonView value={result} maxHeight={420} />
          </details>
        </>
      )}
    </Panel>
  );
}

const BLANK_REQUESTS = { status: 'pending', kind: '', requester: '', app: '' };

function Requests() {
  const { client, urlParam, setParam } = usePlayground();
  const [form, setForm] = useState(BLANK_REQUESTS);
  const [applied, setApplied] = useState(BLANK_REQUESTS);
  const res = useLoad(
    () => client.call({ path: `${P}/self-service/exceptions`, query: applied, source: 'Self-service requests' }),
    [client, JSON.stringify(applied)],
  );
  const selected = urlParam('exception');
  return (
    <>
      <Panel
        title="Requests (exceptions)"
        subtitle="Developers asking for more than their access plan gives. A management key decides as an administrator; nobody decides their own request."
        actions={
          <>
            <ApiChips calls={[['GET', '/self-service/exceptions'], ['GET', '/self-service/exceptions/{exception_id}']]} />
            <Btn onClick={res.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
          </>
        }
      >
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(form);
          }}
        >
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="">any</option>
              {['pending', 'approved', 'rejected', 'cancelled', 'revoked', 'failed', 'expired'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Kind">
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="">any</option>
              {['budget_increase', 'app_access', 'tier_upgrade', 'key_lifetime', 'app_create'].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Requester">
            <input value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} placeholder="name@example.com" />
          </Field>
          <Field label="App">
            <input value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value })} />
          </Field>
          <Btn type="submit">Apply filters</Btn>
        </form>
        <ErrorBox error={res.error} />
        <Table
          rows={res.data?.exceptions || []}
          rowKey={(x) => x.exception_id}
          selected={selected}
          onRowClick={(x) => setParam('exception', x.exception_id)}
          empty={res.loading ? 'Loading...' : 'No requests match.'}
          columns={[
            { label: 'Kind', render: (x) => <strong>{x.kind}</strong> },
            { label: 'Requester', render: (x) => x.requester },
            { label: 'App', render: (x) => fmt(x.app_name) },
            { label: 'Reviewed by', render: (x) => x.reviewer_pool },
            { label: 'Until', render: (x) => fmt(x.ends_at || x.requested_until) },
            { label: 'Status', render: (x) => <Pill tone={STATUS_TONE[x.status]}>{x.status}</Pill> },
          ]}
        />
      </Panel>
      {selected && <RequestDetail key={selected} id={selected} onChanged={res.reload} onClose={() => setParam('exception', '')} />}
    </>
  );
}

function RequestDetail({ id, onChanged, onClose }) {
  const { client, confirm } = usePlayground();
  const res = useLoad(() => client.call({ path: `${P}/self-service/exceptions/${seg(id)}`, source: 'Self-service request' }), [client, id]);
  const [endsAt, setEndsAt] = useState('');
  const [text, setText] = useState('');
  const action = useAction();
  const x = res.data?.exception;
  const decide = async (verb, body) => {
    if (verb === 'revoke' && !(await confirm({ title: 'Revoke this approval?', body: 'Its effect stops now.', confirmLabel: 'Revoke', tone: 'danger', call: `POST /self-service/exceptions/${id}/revoke` }))) return;
    await action.run(async () => {
      const out = await client.call({ method: 'POST', path: `${P}/self-service/exceptions/${seg(id)}/${verb}`, body, source: `${verb} request` });
      res.reload();
      onChanged();
      return out;
    }, `Request ${verb === 'approve' ? 'approved' : verb === 'reject' ? 'rejected' : 'revoked'}.`);
  };
  return (
    <Panel title={x ? `${x.kind} from ${x.requester}` : id} subtitle={x?.justification} actions={<Btn onClick={onClose}>Close</Btn>}>
      <ErrorBox error={res.error} />
      {x && (
        <>
          <KeyValue
            items={[
              ['Status', <Pill tone={STATUS_TONE[x.status]}>{x.status}</Pill>],
              ['App', fmt(x.app_name)],
              ['Reviewed by', x.reviewer_pool],
              ['Asked until', fmt(x.requested_until)],
              ['Ends', fmt(x.ends_at)],
              ['Decided by', fmt(x.decided_by)],
              ['Payload', <code>{pretty(x.payload)}</code>],
            ]}
          />
          <div className={styles.formGrid}>
            <Field label="Approved until (ends_at)" hint="At most 365 days away; empty = the requested date. Ignored for app_create.">
              <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </Field>
            <Field label="Comment or reason" hint="Required to reject. The requester sees it.">
              <input value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
          </div>
          <div className={styles.actionsRow}>
            <ActionButton method="POST" path="/self-service/exceptions/{exception_id}/approve" scopes={['config:write']} variant="primary" onClick={() => decide('approve', { ...(endsAt ? { ends_at: endsAt } : {}), ...(text ? { comment: text } : {}) })}>
              Approve
            </ActionButton>
            <ActionButton method="POST" path="/self-service/exceptions/{exception_id}/reject" scopes={['config:write']} disabled={!text.trim()} onClick={() => decide('reject', { reason: text.trim() })}>
              Reject
            </ActionButton>
            <ActionButton method="POST" path="/self-service/exceptions/{exception_id}/revoke" scopes={['config:write']} onClick={() => decide('revoke', text ? { reason: text } : {})}>
              Revoke approval
            </ActionButton>
          </div>
          {action.error?.code === 'self_service_exception_not_pending' && (
            <Notice tone="warn">This request was decided meanwhile (409). Its current status is loaded above.</Notice>
          )}
          <ErrorBox error={action.error} />
          <Notice onDismiss={() => action.setNotice('')}>{action.notice}</Notice>
        </>
      )}
    </Panel>
  );
}

const BLANK_KEYS = { app_name: '', owner_email: '', status: 'active' };

function PersonalKeys() {
  const { client, confirm } = usePlayground();
  const [form, setForm] = useState(BLANK_KEYS);
  const [applied, setApplied] = useState(BLANK_KEYS);
  const action = useAction();
  const list = useCollection(
    (cursor) => client.call({ path: `${P}/self-service-keys`, query: { ...applied, limit: 50, cursor }, source: 'Personal keys' }),
    [client, JSON.stringify(applied)],
    !!client,
  );
  const changed = list.error?.code === 'collection_changed';
  async function revoke(k) {
    if (!(await confirm({ title: `Revoke ${k.key_name}?`, body: `${k.user_email}'s key on ${k.app_name} stops working at once.`, confirmLabel: 'Revoke key', tone: 'danger', call: `DELETE /apps/${k.app_name}/self-service-keys/${k.key_id}` }))) return;
    await action.run(async () => {
      const route = appRoute(k.app_name, `/self-service-keys/${seg(k.key_id)}`);
      const out = await client.call({ method: 'DELETE', path: route.path, query: route.query, source: 'Revoke personal key' });
      list.first();
      list.reload();
      return out;
    }, 'Key revoked.');
  }
  return (
    <Panel
      title="Personal keys across apps"
      subtitle="Every app's personal keys, newest first. Metadata only: never a key value. A cursor is bound to its filters; 409 collection_changed means restart from the first page."
      actions={
        <>
          <ApiChips calls={[['GET', '/self-service-keys'], ['DELETE', '/apps/{app_name}/self-service-keys/{key_id}']]} />
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
          setApplied(form);
        }}
      >
        <Field label="App" hint="404 when there is no such app.">
          <input value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} />
        </Field>
        <Field label="Owner email">
          <input value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="">any</option>
            <option>active</option>
            <option>expired</option>
            <option>revoked</option>
          </select>
        </Field>
        <Btn type="submit">Apply filters</Btn>
      </form>
      {changed ? (
        <Notice tone="warn">
          A key entered or left this listing since the previous page (409 collection_changed).{' '}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              list.first();
              list.reload();
            }}
          >
            Restart from the first page
          </button>
        </Notice>
      ) : (
        <ErrorBox error={list.error} />
      )}
      {list.data && (
        <p className={styles.muted}>
          {num(list.data.total)} keys match: {num(list.data.status_counts?.active)} active, {num(list.data.status_counts?.expired)} expired,{' '}
          {num(list.data.status_counts?.revoked)} revoked.
        </p>
      )}
      <Table
        rows={list.data?.items || []}
        rowKey={(k) => k.key_id}
        empty={list.loading ? 'Loading...' : 'No personal keys match.'}
        columns={[
          { label: 'Owner', render: (k) => k.user_email },
          { label: 'App', render: (k) => k.app_name },
          { label: 'Key', render: (k) => (<><strong>{k.key_name}</strong><br /><code>{k.key_id}</code></>) },
          { label: 'Created', render: (k) => when(k.created_at) },
          { label: 'Expires', render: (k) => (k.expires_at ? when(k.expires_at) : 'never') },
          { label: 'Last used', render: (k) => when(k.last_used_at) },
          { label: 'Status', render: (k) => <Pill tone={STATUS_TONE[k.status]}>{k.status}</Pill> },
          {
            label: '',
            render: (k) =>
              k.status === 'active' ? (
                <ActionButton method="DELETE" path="/apps/{app_name}/self-service-keys/{key_id}" scopes={['keys:write']} onClick={() => revoke(k)}>
                  Revoke
                </ActionButton>
              ) : null,
          },
        ]}
      />
      <Pager list={list} />
      <ErrorBox error={action.error} />
      <Notice onDismiss={() => action.setNotice('')}>{action.notice}</Notice>
    </Panel>
  );
}

function TemplatesAndOwners() {
  const { client } = usePlayground();
  const [apps, setApps] = useState('');
  const [result, setResult] = useState(null);
  const check = useAction();
  const [ownersApp, setOwnersApp] = useState('');
  const [owners, setOwners] = useState('');
  const save = useAction();
  return (
    <>
      <Panel
        title="Can these apps be app templates?"
        subtitle="An app is eligible when it exists and no policy could match it by its identity. app_scoped_policy_names names every policy that blocks it."
        actions={<ApiChips calls={[['GET', '/self-service/blueprint_eligibility'], ['GET', '/apps']]} />}
      >
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault();
            check.run(async () => setResult(await client.call({ path: `${P}/self-service/blueprint_eligibility`, query: { app: csv(apps) }, source: 'Blueprint eligibility' })));
          }}
        >
          <Field label="Apps" hint="Comma separated, 1-50.">
            <input value={apps} onChange={(e) => setApps(e.target.value)} />
          </Field>
          <Btn type="submit" variant="primary" disabled={!csv(apps).length}>
            Check
          </Btn>
        </form>
        <ErrorBox error={check.error} />
        {result && (
          <Table
            rows={result.apps || []}
            rowKey={(a) => a.app_name}
            columns={[
              { label: 'App', render: (a) => <strong>{a.app_name}</strong> },
              { label: 'Found', render: (a) => (a.found ? 'yes' : <Pill tone="err">no</Pill>) },
              { label: 'Eligible', render: (a) => <Pill tone={a.eligible ? 'ok' : 'warn'}>{a.eligible ? 'yes' : 'no'}</Pill> },
              { label: 'Policies that depend on its identity', render: (a) => (a.app_scoped_policy_names || []).join(', ') || '-' },
            ]}
          />
        )}
        <p className={styles.muted}>
          Apps people already created from templates: <code>GET /apps?origin=blueprint</code> (add <code>created_by</code> for one person), on the Apps workspace.
        </p>
      </Panel>
      <Panel
        title="App owners"
        subtitle="Who reviews an app's requests (at most 20). An empty list removes every owner."
        actions={<ApiChips calls={[['PUT', '/apps/{app_name}/self-service-owners']]} />}
      >
        <div className={styles.formGrid}>
          <Field label="App">
            <input value={ownersApp} onChange={(e) => setOwnersApp(e.target.value)} />
          </Field>
          <Field label="Owners" hint="Comma-separated emails.">
            <input value={owners} onChange={(e) => setOwners(e.target.value)} />
          </Field>
        </div>
        <div className={styles.actionsRow}>
          <ActionButton
            method="PUT"
            path="/apps/{app_name}/self-service-owners"
            scopes={['config:write']}
            variant="primary"
            disabled={!ownersApp.trim()}
            onClick={() =>
              save.run(
                () => {
                  const route = appRoute(ownersApp.trim(), '/self-service-owners');
                  return client.call({ method: 'PUT', path: route.path, query: route.query, body: { owners: csv(owners) }, source: 'Set app owners' });
                },
                (out) => `Owners of ${out?.app_name ?? ownersApp}: ${(out?.owners || []).join(', ') || 'none'}.`,
              )
            }
          >
            Set owners
          </ActionButton>
        </div>
        <ErrorBox error={save.error} />
        <Notice onDismiss={() => save.setNotice('')}>{save.notice}</Notice>
      </Panel>
    </>
  );
}

function UsageReport() {
  const { client } = usePlayground();
  const [form, setForm] = useState({ from_date: daysAgo(30), to_date: isoDate(new Date()), include_all_apps: false });
  const [applied, setApplied] = useState(form);
  const res = useLoad(
    () => client.call({ path: `${P}/self-service/usage`, query: { ...applied, include_all_apps: applied.include_all_apps ? 'true' : undefined }, source: 'Self-service usage' }),
    [client, JSON.stringify(applied)],
  );
  const data = res.data;
  const all = data?.summary?.usage?.all;
  return (
    <Panel
      title="Usage report"
      subtitle="Who can do what in each app, and whether they use it. Costs are estimates; unpriced models count 0."
      actions={<ApiChips calls={[['GET', '/self-service/usage']]} />}
    >
      <form
        className={styles.filters}
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(form);
        }}
      >
        <Field label="From">
          <input type="date" value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })} />
        </Field>
        <Field label="To" hint="At most 366 days.">
          <input type="date" value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })} />
        </Field>
        <Checkbox label="Include every active app" checked={form.include_all_apps} onChange={(v) => setForm({ ...form, include_all_apps: v })} />
        <Btn type="submit" variant="primary">
          Run
        </Btn>
      </form>
      <ErrorBox error={res.error} />
      {res.loading && <p className={styles.muted}>Loading...</p>}
      {data && (
        <>
          <Stats
            items={[
              ['Requests', num(all?.request_count)],
              ['Estimated cost', usd(all?.estimated_cost_usd)],
              ['Active personal keys', num(data.summary?.api_keys?.active)],
              ['Keys used in window', num(data.summary?.api_keys?.used_in_window)],
            ]}
          />
          <Table
            rows={data.apps || []}
            rowKey={(a) => a.app_name}
            empty="No apps in the report."
            columns={[
              { label: 'App', render: (a) => <strong>{a.app_name}</strong> },
              { label: 'Keys', render: (a) => (a.credential_mode === 'user_api_key' ? <Pill tone="ok">Personal keys</Pill> : 'Main app key') },
              { label: 'Active personal keys', render: (a) => num(a.api_keys?.active) },
              { label: 'Requests', render: (a) => num(a.usage?.all?.request_count) },
              { label: 'Cost', render: (a) => usd(a.usage?.all?.estimated_cost_usd) },
            ]}
          />
          {data.models_without_pricing?.length ? <p className={styles.muted}>Models without pricing: {data.models_without_pricing.join(', ')}.</p> : null}
          <details>
            <summary>Raw response</summary>
            <JsonView value={data} maxHeight={420} />
          </details>
        </>
      )}
    </Panel>
  );
}
