import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { seg } from '../ManagementPlayground/client.mjs';
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
  Panel,
  Pill,
  Table,
  fmt,
  parseJson,
  useAction,
  usePlayground,
} from '../ManagementPlayground/ui';
import { fetchAllPages, useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { MCP_PREFIX, ifMatch } from './routes.mjs';
import { useInventory } from './common';

const FAILED = 'No data: the request failed (see the error above).';
const SMART_MODES = ['user_preference', 'force_enabled', 'force_disabled'];
const EXAMPLE_SPEC = {
  version: 1,
  kind: 'param_alias',
  tool_name: 'get_work_item',
  action: null,
  path: [],
  from: 'id',
  to: 'work_item_id',
};

export default function Tenant() {
  const { client } = usePlayground();
  if (!client) return <ConnectFirst what="change organization settings" />;
  return (
    <div className={styles.stack}>
      <Switches />
      <Aliases />
      <Requests />
    </div>
  );
}

function Switches() {
  const { client } = usePlayground();
  const settings = useLoad(() => client.call({ path: `${MCP_PREFIX}/tenant/settings`, source: 'Tenant settings' }), [client]);
  const d = settings.data;
  const [draft, setDraft] = useState(null);
  const action = useAction();
  useEffect(() => {
    if (d) setDraft({ mode: d.smart_mode?.mode, memories: d.memories?.enabled, hold: d.tool_review?.hold_new_tools });
  }, [d]);
  const patch = {};
  if (d && draft) {
    if (d.smart_mode && draft.mode !== d.smart_mode.mode) patch.smart_mode = { mode: draft.mode };
    if (d.memories && draft.memories !== d.memories.enabled) patch.memories = { enabled: draft.memories };
    if (d.tool_review && draft.hold !== d.tool_review.hold_new_tools) patch.tool_review = { hold_new_tools: draft.hold };
  }
  const dirty = Object.keys(patch).length > 0;

  async function save() {
    await action.run(async () => {
      const res = await client.call({
        method: 'PATCH',
        path: `${MCP_PREFIX}/tenant/settings`,
        body: patch,
        headers: { 'If-Match': ifMatch(d.version) },
        source: 'Update tenant settings',
      });
      settings.setData(res);
      return res;
    }, `Saved ${Object.keys(patch).join(', ')}.`);
  }

  return (
    <Panel
      title="Organization switches"
      subtitle="Tenant-wide switches. Saving sends only what changed, with the version from the last read in If-Match."
      actions={
        <>
          <ApiChips calls={[['GET', '/tenant/settings'], ['PATCH', '/tenant/settings']]} />
          <Btn onClick={settings.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={settings.error} />
      {d && draft && (
        <>
          {d.policy_authority?.mode === 'quilrql' && (
            <Notice tone="warn">QuilrQL policies govern this organization: these switches are stored but the policies decide.</Notice>
          )}
          <div className={styles.inline}>
            <Field label="Dynamic Tool Calling (OneMCP)" hint={d.smart_mode?.updated_at ? `Changed ${when(d.smart_mode.updated_at)} by ${d.smart_mode.updated_by || '-'}` : undefined}>
              <select value={draft.mode || ''} onChange={(e) => setDraft({ ...draft, mode: e.target.value })} disabled={!d.smart_mode}>
                {SMART_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className={styles.actionsRow}>
            <Checkbox label="Memories for users and OneMCP" checked={!!draft.memories} onChange={(v) => setDraft({ ...draft, memories: v })} disabled={!d.memories} />
            <Checkbox
              label={d.tool_review ? 'Hold new upstream tools for review (MCPs that inherit)' : 'New-tool review is not available on this gateway'}
              checked={!!draft.hold}
              onChange={(v) => setDraft({ ...draft, hold: v })}
              disabled={!d.tool_review}
            />
          </div>
          <KeyValue
            items={[
              ['Version', <code key="v">{d.version}</code>],
              ['Policy authority', fmt(d.policy_authority?.mode)],
              ['Data retention', `revision ${fmt(d.data_retention?.stored_revision)}, updated ${when(d.data_retention?.updated_at)} (read only; managed in the console)`],
            ]}
          />
          <div className={styles.actionsRow}>
            <ActionButton method="PATCH" path="/tenant/settings" variant="primary" disabled={!dirty} onClick={save}>
              <Save size={13} aria-hidden /> Save
            </ActionButton>
            {dirty && (
              <small className={styles.muted}>
                PATCH body <code>{JSON.stringify(patch)}</code>
              </small>
            )}
          </div>
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          {action.error?.status === 412 && (
            <Btn
              onClick={() => {
                action.setError(null);
                settings.reload();
              }}
            >
              Reload settings
            </Btn>
          )}
          <Notice tone="ok" onDismiss={() => action.setNotice('')}>
            {action.notice}
          </Notice>
          {(d.warnings || []).map((w) => (
            <Notice key={w.code} tone="warn">
              {w.message}
            </Notice>
          ))}
        </>
      )}
    </Panel>
  );
}

function Aliases() {
  const { client, confirm } = usePlayground();
  const inventory = useInventory();
  const [mcp, setMcp] = useState('');
  const list = useLoad(
    () =>
      fetchAllPages((cursor) =>
        client.call({ path: `${MCP_PREFIX}/tool-arg-aliases`, query: { limit: 200, cursor, mcp_id: mcp || undefined }, source: 'Tool-argument aliases' }),
      ).then((r) => r.items),
    [client, mcp],
  );
  const [form, setForm] = useState({ mcp_id: '', spec: JSON.stringify(EXAMPLE_SPEC, null, 2), note: '' });
  const [open, setOpen] = useState(null);
  const action = useAction();
  const mcps = inventory.data || [];
  const nameOf = (mcpId) => mcps.find((m) => m.id === mcpId)?.name || mcpId;
  const spec = parseJson(form.spec);

  async function create() {
    await action.run(async () => {
      const body = { mcp_id: form.mcp_id, spec: spec.value };
      if (form.note.trim()) body.note = form.note.trim();
      const res = await client.call({ method: 'POST', path: `${MCP_PREFIX}/tool-arg-aliases`, body, source: 'Create alias' });
      list.reload();
      return res;
    }, (res) => `Created alias ${res.alias?.alias_id}${res.alias?.schema_verified ? ' (checked against the tool schema)' : ''}.`);
  }

  async function toggle(row) {
    await action.run(async () => {
      const res = await client.call({ method: 'PATCH', path: `${MCP_PREFIX}/tool-arg-aliases/${seg(row.alias_id)}`, body: { enabled: !row.enabled }, source: row.enabled ? 'Disable alias' : 'Enable alias' });
      list.reload();
      return res;
    }, `${row.enabled ? 'Disabled' : 'Enabled'} the alias on ${row.tool_name}.`);
  }

  async function remove(row) {
    if (
      !(await confirm({
        title: `Delete the alias on ${row.tool_name}?`,
        body: 'Arguments are no longer rewritten for this tool.',
        confirmLabel: 'Delete',
        tone: 'danger',
        call: `DELETE ${MCP_PREFIX}/tool-arg-aliases/${row.alias_id}`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'DELETE', path: `${MCP_PREFIX}/tool-arg-aliases/${seg(row.alias_id)}`, source: 'Delete alias' });
      if (open === row.alias_id) setOpen(null);
      list.reload();
      return res;
    }, `Deleted the alias on ${row.tool_name}.`);
  }

  const mcpSelect = (value, onChange, any) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{any ? 'All MCPs' : 'Select an MCP'}</option>
      {mcps.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name} ({m.slug || m.id})
        </option>
      ))}
    </select>
  );

  return (
    <Panel
      title="Tool-argument aliases"
      subtitle="Rewrite the arguments clients send before a call reaches the MCP: rename a parameter (param_alias) or normalize values (value_normalization). Each alias is checked against the tool's input schema."
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', '/tool-arg-aliases'],
              ['POST', '/tool-arg-aliases'],
              ['PATCH', '/tool-arg-aliases/{alias_id}'],
              ['DELETE', '/tool-arg-aliases/{alias_id}'],
            ]}
          />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <div className={styles.inline}>
        <Field label="Filter by MCP">{mcpSelect(mcp, setMcp, true)}</Field>
      </div>
      <ErrorBox error={list.error} />
      <Table
        rows={list.data || []}
        rowKey={(r) => r.alias_id}
        selected={open}
        onRowClick={(r) => setOpen(open === r.alias_id ? null : r.alias_id)}
        empty={list.loading ? 'Loading...' : list.error ? FAILED : 'No aliases.'}
        columns={[
          { label: 'MCP', render: (r) => nameOf(r.mcp_id) },
          { label: 'Tool', render: (r) => <code>{r.tool_name}</code> },
          { label: 'Kind', render: (r) => r.kind },
          { label: 'State', render: (r) => (r.active ? <Pill tone="ok">active</Pill> : r.enabled ? <Pill tone="warn">enabled, not active</Pill> : <Pill tone="off">disabled</Pill>) },
          { label: 'Note', render: (r) => r.note || '-' },
          {
            label: 'Actions',
            render: (r) => (
              <span className={styles.actionsRow} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                <ActionButton method="PATCH" path="/tool-arg-aliases/{alias_id}" onClick={() => toggle(r)}>
                  {r.enabled ? 'Disable' : 'Enable'}
                </ActionButton>
                <ActionButton method="DELETE" path="/tool-arg-aliases/{alias_id}" variant="danger" onClick={() => remove(r)}>
                  <Trash2 size={12} aria-hidden /> Delete
                </ActionButton>
              </span>
            ),
          },
        ]}
      />
      {open && <JsonView value={(list.data || []).find((r) => r.alias_id === open)?.spec} maxHeight={280} />}
      <div className={styles.subPanel}>
        <h3>New alias</h3>
        <div className={styles.inline}>
          <Field label="MCP">{mcpSelect(form.mcp_id, (v) => setForm({ ...form, mcp_id: v }), false)}</Field>
          <Field label="Note">
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Why this alias exists" />
          </Field>
        </div>
        <JsonField label="spec" value={form.spec} onChange={(v) => setForm({ ...form, spec: v })} rows={9} hint="tool_name must be a tool of the MCP; from/to (or param/from_values/to_value) must fit its input schema." />
        <div className={styles.actionsRow}>
          <ActionButton method="POST" path="/tool-arg-aliases" variant="primary" disabled={!form.mcp_id || !!spec.error || spec.value === undefined} onClick={create}>
            <Plus size={13} aria-hidden /> Create alias
          </ActionButton>
        </div>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </Panel>
  );
}

function Requests() {
  const { client, confirm, navigate } = usePlayground();
  const list = useLoad(
    () => fetchAllPages((cursor) => client.call({ path: `${MCP_PREFIX}/mcp-requests`, query: { limit: 200, cursor }, source: 'MCP requests' })).then((r) => r.items),
    [client],
  );
  const action = useAction();

  async function dismiss(row) {
    if (
      !(await confirm({
        title: `Dismiss ${row.user_email}'s request for ${row.catalog_name || row.catalog_id}?`,
        body: 'The request leaves the pending list. The user can request the MCP again.',
        confirmLabel: 'Dismiss',
        tone: 'danger',
        call: `POST ${MCP_PREFIX}/mcp-requests/${row.request_id}/dismiss`,
      }))
    )
      return;
    await action.run(async () => {
      const res = await client.call({ method: 'POST', path: `${MCP_PREFIX}/mcp-requests/${seg(row.request_id)}/dismiss`, source: 'Dismiss MCP request' });
      list.reload();
      return res;
    }, `Dismissed the request for ${row.catalog_name || row.catalog_id}.`);
  }

  return (
    <Panel
      title="Users' MCP requests"
      subtitle="Pending requests from users for MCP Library entries. Installing the entry (Create and catalog workspace) fulfils every pending request for it; dismiss the ones you will not install."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcp-requests'], ['POST', '/mcp-requests/{request_id}/dismiss']]} />
          <Btn onClick={() => navigate('create')}>Open the MCP Library</Btn>
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
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
        rows={list.data || []}
        rowKey={(r) => r.request_id}
        empty={list.loading ? 'Loading...' : list.error ? FAILED : 'No pending requests.'}
        columns={[
          { label: 'Catalog entry', render: (r) => `${r.catalog_name || r.catalog_id}` },
          { label: 'Requested by', render: (r) => r.user_email },
          { label: 'Requested', render: (r) => when(r.created_at) },
          { label: 'Needs configuration', render: (r) => (r.requires_configuration ? (r.install_requirements || []).map((q) => q.label || q.field).join(', ') : 'no') },
          {
            label: 'Actions',
            render: (r) => (
              <ActionButton method="POST" path="/mcp-requests/{request_id}/dismiss" variant="danger" onClick={() => dismiss(r)}>
                <X size={12} aria-hidden /> Dismiss
              </ActionButton>
            ),
          },
        ]}
      />
    </Panel>
  );
}
