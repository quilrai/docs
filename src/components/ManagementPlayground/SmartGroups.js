import React, { useRef, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX, newIdempotencyKey, seg, versionOf } from './client.mjs';
import {
  ActionButton,
  ApiChips,
  Btn,
  Checkbox,
  ConnectFirst,
  EnabledPill,
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
import { useLoad, when } from './shared';
import styles from './styles.module.css';

const P = `${MANAGEMENT_PREFIX}/smart-groups`;
const VIRTUAL = 'virtual:';
const MAX_PRIORITY = 1000000;

export const isVirtual = (g) => g?.source === 'virtual' || String(g?.group_name || '').startsWith(VIRTUAL);

/** A group name as the console shows it: without the virtual: prefix. */
export const bareName = (name) => (String(name || '').startsWith(VIRTUAL) ? String(name).slice(VIRTUAL.length) : String(name || ''));

/** Emails from a comma, space or newline separated list. */
const emailList = (text) =>
  String(text || '')
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

function parsePriority(text) {
  const value = String(text).trim();
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n <= MAX_PRIORITY ? n : null;
}

/** Strength is the computed `rank`: #1 is the strongest; disabled groups have none. */
export function Strength({ rank }) {
  return rank === null || rank === undefined ? <Pill tone="off">Off</Pill> : <strong>#{rank}</strong>;
}

export function KindPill({ group }) {
  return isVirtual(group) ? <Pill tone="warn">Virtual</Pill> : <Pill>Synced</Pill>;
}

/** Rank is the editable `priority`; a synced group may carry an admin override. */
function RankCell({ group }) {
  const overridden = !isVirtual(group) && group.priority_override !== null && group.priority_override !== undefined;
  return (
    <>
      <strong>{fmt(group.priority)}</strong>{' '}
      {overridden && (
        <>
          <Pill tone="warn">override</Pill> <span className={styles.muted}>synced {fmt(group.synced_priority)}</span>
        </>
      )}
    </>
  );
}

/**
 * Idempotency key per request body: an identical retry (after an error or a
 * lost response) reuses the key, a changed body gets a new one, and a success
 * starts over.
 */
function useRequestKey(prefix) {
  const current = useRef(null);
  return {
    keyFor(request) {
      const fingerprint = JSON.stringify(request);
      if (!current.current || current.current.fingerprint !== fingerprint) {
        current.current = { fingerprint, key: newIdempotencyKey(prefix) };
      }
      return current.current.key;
    },
    done() {
      current.current = null;
    },
  };
}

const memberCount = (g) => g.member_count ?? (Array.isArray(g.emails) ? g.emails.length : undefined);

export default function SmartGroups() {
  const { client, urlParam, setParam } = usePlayground();
  const [creating, setCreating] = useState(false);
  const list = useCollection((cursor) => client.call({ path: P, query: { limit: 200, cursor }, source: 'Smart groups' }), [client], !!client);
  if (!client) return <ConnectFirst what="rank smart groups and manage virtual groups" />;
  const selected = urlParam('group');
  return (
    <div className={styles.stack}>
      <Panel
        title="Smart groups"
        subtitle="When a person is in several enabled groups, the group with the lowest Rank number governs them (ties by name). Strength is the resulting position: #1 is the strongest. Synced groups come from the directory sync; virtual groups have a member list you manage here."
        actions={
          <>
            <ApiChips calls={[['GET', '/smart-groups'], ['POST', '/smart-groups']]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
            <Btn variant="primary" onClick={() => setCreating((v) => !v)} aria-expanded={creating}>
              <Plus size={13} aria-hidden /> New virtual group
            </Btn>
          </>
        }
      >
        <ErrorBox error={list.error} />
        {creating && (
          <CreateVirtualGroup
            onCreated={(name) => {
              setCreating(false);
              list.reload();
              setParam('group', name);
            }}
          />
        )}
        <Table
          rows={list.data?.items || []}
          rowKey={(r) => r.group_name}
          selected={selected}
          onRowClick={(r) => setParam('group', r.group_name)}
          empty={list.loading ? 'Loading...' : 'No smart groups yet.'}
          columns={[
            { label: 'Strength', render: (r) => <Strength rank={r.rank} /> },
            {
              label: 'Group',
              render: (r) => (
                <>
                  <strong>{r.display_name || bareName(r.group_name)}</strong> <code>{r.group_name}</code>
                </>
              ),
            },
            { label: 'Kind', render: (r) => <KindPill group={r} /> },
            { label: 'Rank', render: (r) => <RankCell group={r} /> },
            { label: 'Members', render: (r) => fmt(memberCount(r)) },
            { label: 'Enabled', render: (r) => <EnabledPill value={r.enabled} /> },
          ]}
        />
        <Pager list={list} />
      </Panel>
      {selected && (
        <GroupDetail
          key={selected}
          name={selected}
          onChanged={list.reload}
          onDeleted={() => {
            setParam('group', '');
            list.reload();
          }}
        />
      )}
    </div>
  );
}

function CreateVirtualGroup({ onCreated }) {
  const { client } = usePlayground();
  const [form, setForm] = useState({ name: '', display_name: '', emails: '', enabled: true, priority: '' });
  const requestKey = useRequestKey('create-group');
  const action = useAction();
  const priority = form.priority.trim() ? parsePriority(form.priority) : undefined;
  const name = bareName(form.name.trim());
  const body = {
    name,
    ...(form.display_name.trim() ? { display_name: form.display_name.trim() } : {}),
    emails: emailList(form.emails),
    enabled: form.enabled,
    ...(priority !== undefined && priority !== null ? { priority } : {}),
  };
  return (
    <div className={styles.subPanel}>
      <h3>Create a virtual group</h3>
      <p className={styles.muted}>
        Stored as <code>virtual:{name || '<name>'}</code> (lowercased, spaces collapsed). The directory sync never changes a
        virtual group. Use the full name in policy conditions and budgets.
      </p>
      <div className={styles.formGrid}>
        <Field label="Name" hint="Without the virtual: prefix. The name priority is reserved.">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="sales leads" />
        </Field>
        <Field label="Display name" hint="Default: the name.">
          <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Sales leads" />
        </Field>
        <Field label="Rank" hint="Optional, 0 to 1000000; lower wins. Default 100.">
          <input inputMode="numeric" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} aria-invalid={priority === null} placeholder="100" />
        </Field>
      </div>
      <Field label="Member emails" hint="Comma, space or newline separated. Stored lowercase." wide>
        <textarea rows={4} value={form.emails} onChange={(e) => setForm({ ...form, emails: e.target.value })} placeholder="ana@example.com, li@example.com" />
      </Field>
      <Checkbox label="Enabled" checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} />
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/smart-groups"
          scopes={['config:write']}
          variant="primary"
          disabled={!name || priority === null}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'POST', path: P, body, headers: { 'Idempotency-Key': requestKey.keyFor(body) }, source: 'Create virtual group' });
              requestKey.done();
              onCreated(res.smart_group?.group_name || `${VIRTUAL}${name}`);
              return res;
            }, `Created ${VIRTUAL}${name}.`)
          }
        >
          Create group
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </div>
  );
}

function GroupDetail({ name, onChanged, onDeleted }) {
  const { client } = usePlayground();
  const path = `${P}/${seg(name)}`;
  const state = useLoad(() => client.call({ path, source: 'Smart group detail' }), [client, name]);
  const group = state.data?.smart_group;
  const etag = state.data?._meta?.headers?.etag || versionOf(state.data);
  const reload = () => {
    state.reload();
    onChanged();
  };
  const virtual = isVirtual(group || { group_name: name });
  return (
    <Panel
      title={group?.display_name || bareName(name)}
      subtitle={`${virtual ? 'Virtual' : 'Synced'} group ${name}`}
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', '/smart-groups/{group_name}'],
              ['PATCH', '/smart-groups/{group_name}'],
              ...(virtual ? [['POST', '/smart-groups/{group_name}/members'], ['DELETE', '/smart-groups/{group_name}']] : []),
            ]}
          />
          <Btn onClick={state.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={state.error} />
      {group && (
        <div className={styles.split}>
          <div>
            <KeyValue
              items={[
                ['Strength', <Strength key="s" rank={group.rank} />],
                ['Rank', <RankCell key="r" group={group} />],
                !virtual && ['Synced rank', fmt(group.synced_priority)],
                !virtual &&
                  group.priority_override_updated_at && [
                    group.priority_override === null || group.priority_override === undefined ? 'Override reset' : 'Override set',
                    `${when(group.priority_override_updated_at)} by ${fmt(group.priority_override_updated_by)}`,
                  ],
                ['Kind', <KindPill key="k" group={group} />],
                ['Enabled', <EnabledPill key="e" value={group.enabled} />],
                ['Members', fmt(memberCount(group))],
                ['Version (ETag)', <code key="v">{etag || '-'}</code>],
              ]}
            />
            <h3>Members</h3>
            {Array.isArray(group.emails) && group.emails.length ? (
              <JsonView value={group.emails} maxHeight={220} />
            ) : (
              <p className={styles.muted}>No members listed.</p>
            )}
            <details>
              <summary>Raw group</summary>
              <JsonView value={group} />
            </details>
          </div>
          <div>
            <RankEditor key={`rank-${etag}`} group={group} path={path} etag={etag} onSaved={reload} />
            {virtual ? (
              <>
                <VirtualDetails key={`details-${etag}`} group={group} path={path} etag={etag} onSaved={reload} />
                <MembersEditor key={`members-${etag}`} group={group} path={path} etag={etag} onSaved={reload} />
                <DeleteGroup group={group} path={path} etag={etag} onDeleted={onDeleted} />
              </>
            ) : (
              <p className={styles.muted}>
                Name, members and enabled state come from the directory sync. Only the rank can be overridden here; the
                override survives later syncs.
              </p>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

/**
 * Rank change: preview who changes governing group (and governing budget in a
 * strongest group budget set) first, then save the exact previewed value.
 */
function RankEditor({ group, path, etag, onSaved }) {
  const { client } = usePlayground();
  const virtual = isVirtual(group);
  const [draft, setDraft] = useState(String(group.priority ?? ''));
  const [preview, setPreview] = useState(null);
  const action = useAction();
  const parsed = parsePriority(draft);
  // Bumped by every preview and edit: a preview answering after the rank was
  // edited is dropped, so Save never sends a value other than the shown one.
  const generation = useRef(0);
  const discard = () => {
    generation.current += 1;
    setPreview(null);
  };

  async function runPreview(priority) {
    const current = ++generation.current;
    setPreview(null);
    await action.run(async () => {
      const res = await client.call({
        method: 'POST',
        path: `${P}/_priority-preview`,
        body: { changes: [{ group_name: group.group_name, priority }] },
        source: 'Preview rank change',
      });
      if (current === generation.current) setPreview({ priority, result: res, etag });
      return res;
    });
  }

  return (
    <div className={styles.subPanel}>
      <h3>Rank</h3>
      <p className={styles.muted}>
        Lower number wins. {virtual ? 'A virtual group always has its own rank.' : 'Saving sets an admin override of the synced rank.'}{' '}
        Preview first: nothing is saved until you save the previewed value.
      </p>
      <div className={styles.inline}>
        <Field label="New rank" hint="0 to 1000000.">
          <input
            inputMode="numeric"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              discard();
            }}
            aria-invalid={!!draft && parsed === null}
          />
        </Field>
        <ActionButton method="POST" path="/smart-groups/_priority-preview" scopes={['read']} disabled={parsed === null} onClick={() => runPreview(parsed)}>
          Preview
        </ActionButton>
        {!virtual && group.priority_override !== null && group.priority_override !== undefined && (
          <ActionButton method="POST" path="/smart-groups/_priority-preview" scopes={['read']} onClick={() => runPreview(null)}>
            Preview reset to synced ({fmt(group.synced_priority)})
          </ActionButton>
        )}
      </div>
      {preview && (
        <>
          <PriorityPreview result={preview.result} />
          <div className={styles.actionsRow}>
            <ActionButton
              method="PATCH"
              path="/smart-groups/{group_name}"
              scopes={['config:write']}
              variant="primary"
              onClick={() =>
                action.run(async () => {
                  const res = await client.call({
                    method: 'PATCH',
                    path,
                    body: { priority: preview.priority },
                    headers: { 'If-Match': preview.etag },
                    source: preview.priority === null ? 'Reset smart group rank' : 'Save smart group rank',
                  });
                  setPreview(null);
                  onSaved();
                  return res;
                }, preview.priority === null ? 'Rank reset to the synced value.' : `Rank saved: ${preview.priority}.`)
              }
            >
              {preview.priority === null ? 'Save reset' : `Save rank ${preview.priority}`}
            </ActionButton>
            <Btn onClick={discard}>Discard preview</Btn>
          </div>
        </>
      )}
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </div>
  );
}

const limitText = (value, metric) =>
  value === null || value === undefined ? '' : metric === 'spend_usd' ? `$${value}` : `${value}${metric ? ` ${metric.replace(/_/g, ' ')}` : ''}`;

const groupText = (name) => (name ? bareName(name) : 'none');

/** Renders a POST /smart-groups/_priority-preview response. */
export function PriorityPreview({ result }) {
  const affected = result?.affected_users || [];
  const moves = result?.budget_moves || [];
  const ties = result?.ties || [];
  const nothing = !affected.length && !moves.length && !ties.length && !result?.budget_moves_unavailable;
  return (
    <div className={styles.stack}>
      {nothing && <Notice tone="ok">Nobody changes governing group or budget, and the change creates no ties.</Notice>}
      {ties.map((t) => (
        <Notice key={t.priority} tone="warn">
          New tie at rank {t.priority}: {t.groups.map(groupText).join(', ')} share {t.shared_members} member
          {t.shared_members === 1 ? '' : 's'}. Tied groups are ordered by name; give them distinct ranks to be explicit.
        </Notice>
      ))}
      {affected.length > 0 && (
        <>
          <h3>
            Governing group changes: {fmt(result.affected_count)}
            {result.truncated ? ` (first ${affected.length} shown)` : ''}
          </h3>
          <Table
            rows={affected}
            rowKey={(r) => r.email}
            columns={[
              { label: 'Person', render: (r) => r.email },
              { label: 'From', render: (r) => groupText(r.from_group) },
              { label: 'To', render: (r) => groupText(r.to_group) },
            ]}
          />
        </>
      )}
      {result?.budget_moves_unavailable && (
        <Notice tone="warn">Budget moves could not be computed ({result.budget_moves_unavailable}). Group changes above are still accurate.</Notice>
      )}
      {moves.length > 0 && (
        <>
          <h3>
            Budget moves: {fmt(result.budget_moves_count ?? moves.length)}
            {result.budget_moves_truncated ? ` (first ${moves.length} shown)` : ''}
          </h3>
          <p className={styles.muted}>
            In group budget sets where the strongest group&apos;s budget applies. The new budget counts from its own counter;
            earlier usage stays on the old one.
          </p>
          <Table
            rows={moves}
            rowKey={(r) => `${r.email}|${r.set_id}|${(r.apps || []).join(',')}`}
            columns={[
              { label: 'Person', render: (r) => r.email },
              { label: 'Budget set', render: (r) => <strong>{r.set_label || r.set_id}</strong> },
              {
                label: 'From',
                render: (r) =>
                  `${r.conditional && r.from_groups ? r.from_groups.map(groupText).join(' or ') : groupText(r.from_group)} ${limitText(r.from_limit, r.metric)}`,
              },
              {
                label: 'To',
                render: (r) =>
                  `${r.conditional && r.to_groups ? r.to_groups.map(groupText).join(' or ') : groupText(r.to_group)} ${limitText(r.to_limit, r.metric)}`,
              },
              {
                label: 'Where',
                render: (r) => (
                  <>
                    {r.apps ? r.apps.map((a) => (a === '*' ? 'other apps' : a)).join(', ') : 'Every request'}{' '}
                    {r.conditional && <Pill tone="warn">depends on request</Pill>}
                  </>
                ),
              },
            ]}
          />
        </>
      )}
      <details>
        <summary>Raw preview</summary>
        <JsonView value={result} maxHeight={320} />
      </details>
    </div>
  );
}

function VirtualDetails({ group, path, etag, onSaved }) {
  const { client } = usePlayground();
  const [form, setForm] = useState({ display_name: group.display_name || '', enabled: !!group.enabled });
  const action = useAction();
  const body = {};
  if (form.display_name.trim() && form.display_name.trim() !== group.display_name) body.display_name = form.display_name.trim();
  if (form.enabled !== !!group.enabled) body.enabled = form.enabled;
  const changed = Object.keys(body).length > 0;
  return (
    <div className={styles.subPanel}>
      <h3>Details</h3>
      <div className={styles.inline}>
        <Field label="Display name">
          <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </Field>
        <Checkbox label="Enabled" checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} />
      </div>
      {form.enabled !== !!group.enabled && (
        <p className={styles.muted}>
          {form.enabled ? 'Enabling' : 'Disabling'} changes who the group governs. Disabled groups never govern anyone and
          have no Strength.
        </p>
      )}
      <div className={styles.actionsRow}>
        <ActionButton
          method="PATCH"
          path="/smart-groups/{group_name}"
          scopes={['config:write']}
          variant="primary"
          disabled={!changed}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ method: 'PATCH', path, body, headers: { 'If-Match': etag }, source: 'Update virtual group' });
              onSaved();
              return res;
            }, 'Group saved.')
          }
        >
          Save details
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </div>
  );
}

function MembersEditor({ group, path, etag, onSaved }) {
  const { client } = usePlayground();
  const [form, setForm] = useState({ add: '', remove: '' });
  const requestKey = useRequestKey('group-members');
  const action = useAction();
  const add = emailList(form.add);
  const remove = emailList(form.remove);
  const body = { ...(add.length ? { add } : {}), ...(remove.length ? { remove } : {}) };
  return (
    <div className={styles.subPanel}>
      <h3>Members</h3>
      <p className={styles.muted}>Adds and removes emails without replacing the list. Emails already present or already absent are ignored.</p>
      <div className={styles.formGrid}>
        <Field label="Add">
          <textarea rows={3} value={form.add} onChange={(e) => setForm({ ...form, add: e.target.value })} placeholder="new.person@example.com" />
        </Field>
        <Field label="Remove">
          <textarea rows={3} value={form.remove} onChange={(e) => setForm({ ...form, remove: e.target.value })} placeholder="left@example.com" />
        </Field>
      </div>
      <div className={styles.actionsRow}>
        <ActionButton
          method="POST"
          path="/smart-groups/{group_name}/members"
          scopes={['config:write']}
          variant="primary"
          disabled={!add.length && !remove.length}
          onClick={() =>
            action.run(
              async () => {
                const res = await client.call({
                  method: 'POST',
                  path: `${path}/members`,
                  body,
                  headers: { 'Idempotency-Key': requestKey.keyFor([path, body]), 'If-Match': etag },
                  source: 'Change group members',
                });
                requestKey.done();
                setForm({ add: '', remove: '' });
                onSaved();
                return res;
              },
              (res) => `Added ${fmt(res?.added)}, removed ${fmt(res?.removed)}.`,
            )
          }
        >
          Apply member changes
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </div>
  );
}

function DeleteGroup({ group, path, etag, onDeleted }) {
  const { client, confirm } = usePlayground();
  const [force, setForce] = useState(false);
  const action = useAction();
  const references = action.error?.code === 'group_in_use' ? action.error.payload?.error?.references || [] : [];

  async function remove() {
    if (
      !(await confirm({
        title: `Delete ${group.group_name}?`,
        body: force
          ? 'The group is deleted even if the active policy, budgets, exemptions or app settings still name it. Those references stop matching anyone.'
          : 'The gateway refuses while the active policy, budgets, exemptions or app settings still name the group, and lists them.',
        confirmLabel: 'Delete group',
        tone: 'danger',
        call: `DELETE ${path}${force ? '?force=true' : ''}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({
        method: 'DELETE',
        path,
        query: force ? { force: 'true' } : {},
        headers: { 'If-Match': etag },
        source: 'Delete virtual group',
      });
      onDeleted();
      return res;
    });
  }

  return (
    <div className={styles.dangerZone}>
      <h3>Delete</h3>
      <Checkbox label="Delete even if still referenced (force)" checked={force} onChange={setForce} />
      <ActionButton method="DELETE" path="/smart-groups/{group_name}" scopes={['config:write']} variant="danger" onClick={remove}>
        Delete group
      </ActionButton>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      {references.length > 0 && (
        <ul className={styles.bullets}>
          {references.map((ref, i) => (
            <li key={i}>
              {ref.kind === 'policy'
                ? `Policy ${ref.policy}`
                : ref.kind === 'app_setting'
                  ? `App ${ref.app} (${(ref.fields || []).join(', ')})`
                  : ref.kind === 'managed_control'
                    ? 'An API-managed control'
                    : ref.kind === 'budget'
                      ? 'A budget or exemption'
                      : fmt(ref)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
