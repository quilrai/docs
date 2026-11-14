import React, { useMemo, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  ActionButton,
  ApiChips,
  Btn,
  ConnectFirst,
  EnabledPill,
  ErrorBox,
  Field,
  JsonField,
  JsonView,
  Notice,
  Panel,
  Pill,
  Table,
  parseJson,
  pretty,
  useAction,
  usePlayground,
} from '../ManagementPlayground/ui';
import { jsonContent, sampleFromSchema } from '../ManagementPlayground/spec.mjs';
import SchemaTree from '../ManagementPlayground/Schema';
import { useLoad, when } from '../ManagementPlayground/shared';
import styles from '../ManagementPlayground/styles.module.css';
import { SETTINGS_SECTIONS, ifMatch, mcpPath } from './routes.mjs';
import { McpPicker, Warnings, WriteError, useMcpName } from './common';

const MERGE_SECTIONS = new Set(['tools', 'dlp', 'token_saving', 'access_control', 'tool_sync', 'tool_exposure', 'onemcp']);

/** Request body schema of one operation, from the live or bundled spec. */
function useBodySchema(opId) {
  const { index, spec } = usePlayground();
  return useMemo(() => {
    const op = index.byId.get(opId);
    return op ? jsonContent(spec, op.requestBody)?.schema || null : null;
  }, [index, spec, opId]);
}

export default function Settings() {
  const { client, urlParam } = usePlayground();
  const id = urlParam('mcp');
  // Settings, overrides and credentials share one MCP version: a write in one panel
  // makes the other stale, so each write reloads both.
  const [generation, setGeneration] = useState(0);
  if (!client) return <ConnectFirst what="read and change MCP settings" />;
  return (
    <div className={styles.stack}>
      <Panel
        title="Settings"
        subtitle="Sectioned settings of one MCP and its per-user and per-smart-group overrides. Changes reach the MCP's own endpoint and OneMCP immediately."
      >
        <McpPicker hint="Settings, overrides, credentials and the MCP itself share one version (r<N>); a change to any of them changes the ETag of all." />
      </Panel>
      {id ? (
        <>
          <SectionedSettings key={`s-${id}`} id={id} generation={generation} onWritten={() => setGeneration((g) => g + 1)} />
          <ScopedSettings key={`o-${id}`} id={id} generation={generation} onWritten={() => setGeneration((g) => g + 1)} />
        </>
      ) : (
        <p className={styles.muted}>Select an MCP to read its settings.</p>
      )}
    </div>
  );
}

function SectionedSettings({ id, generation, onWritten }) {
  const { client, capabilities } = usePlayground();
  const name = useMcpName(id);
  const settings = useLoad(() => client.call({ path: mcpPath(id, '/settings'), source: 'MCP settings' }), [client, id, generation]);
  const [drafts, setDrafts] = useState({});
  const schema = useBodySchema('Update_mcp_settings');
  const data = settings.data;
  const sections = useMemo(() => {
    const listed = Array.isArray(capabilities?.settings_sections) && capabilities.settings_sections.length ? capabilities.settings_sections : SETTINGS_SECTIONS;
    // Sections the response carries that the list does not (a newer gateway) still show.
    return [...listed, ...Object.keys(data?.settings || {}).filter((s) => !listed.includes(s))];
  }, [capabilities, data]);

  return (
    <Panel
      title={`Settings of ${name}`}
      subtitle="Edit one section at a time. Each save is a PATCH with only that section and If-Match set to the version of your last read."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/settings'], ['PATCH', '/mcps/{mcp_id}/settings']]} />
          <Btn onClick={settings.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
        </>
      }
    >
      <ErrorBox error={settings.error} />
      {settings.loading && !data && <p className={styles.muted}>Loading...</p>}
      {data && (
        <>
          <p className={styles.muted}>
            Version <code>{data.version}</code> (sent as <code>If-Match: {ifMatch(data.version)}</code>).{' '}
            {data.policy_authority?.mode === 'quilrql' && <Pill tone="warn">QuilrQL: saved but not enforced</Pill>}
          </p>
          <Warnings items={data.warnings} />
          {Object.keys(drafts).length > 0 && (
            <Notice tone="warn">
              Unsaved drafts: {Object.keys(drafts).join(', ')}. Reloading keeps your drafts; compare them with the new values before saving.
            </Notice>
          )}
          {sections.map((section) => (
            <SectionEditor
              key={section}
              id={id}
              section={section}
              value={data.settings?.[section]}
              version={data.version}
              schema={schema?.properties?.[section]}
              draft={drafts[section]}
              setDraft={(text) =>
                setDrafts((d) => {
                  const next = { ...d };
                  if (text === undefined) delete next[section];
                  else next[section] = text;
                  return next;
                })
              }
              onSaved={(res) => {
                if (res?.settings) settings.setData(res);
                setDrafts((d) => {
                  const next = { ...d };
                  delete next[section];
                  return next;
                });
                onWritten();
              }}
              onReload={settings.reload}
            />
          ))}
          <details>
            <summary>Raw settings response</summary>
            <JsonView value={data} maxHeight={420} />
          </details>
        </>
      )}
    </Panel>
  );
}

function SectionEditor({ id, section, value, version, schema, draft, setDraft, onSaved, onReload }) {
  const { client, spec } = usePlayground();
  const action = useAction();
  const isSet = value !== undefined;
  const serverText = isSet ? pretty(value) : '';
  const text = draft ?? serverText;
  const parsed = parseJson(text);
  const dirty = draft !== undefined && draft !== serverText;
  const example = schema ? sampleFromSchema(spec, schema) : null;
  return (
    <details className={styles.subPanel} open={dirty || undefined}>
      <summary>
        <code>{section}</code> {isSet ? <Pill tone="ok">set</Pill> : <Pill>default</Pill>} {dirty && <Pill tone="warn">edited</Pill>}{' '}
        <span className={styles.muted}>{MERGE_SECTIONS.has(section) ? 'merges by key' : 'replaces the stored value'}</span>
      </summary>
      <JsonField
        label={`${section} (JSON)`}
        rows={Math.min(18, Math.max(3, text.split('\n').length + 1))}
        value={text}
        onChange={(v) => setDraft(v === serverText ? undefined : v)}
        hint={isSet ? undefined : `Not set: the default applies. For example ${JSON.stringify(example ?? null)}`}
      />
      <div className={styles.actionsRow}>
        <ActionButton
          method="PATCH"
          path="/mcps/{mcp_id}/settings"
          variant="primary"
          disabled={!dirty || !!parsed.error || parsed.value === undefined}
          onClick={() =>
            action.run(async () => {
              const res = await client.call({
                method: 'PATCH',
                path: mcpPath(id, '/settings'),
                body: { [section]: parsed.value },
                headers: { 'If-Match': ifMatch(version) },
                source: `Update settings (${section})`,
              });
              onSaved(res);
              return res;
            }, `Saved ${section}.`)
          }
        >
          Save {section}
        </ActionButton>
        <Btn onClick={() => setDraft(undefined)} disabled={!dirty}>
          Revert
        </Btn>
        {dirty && (
          <small className={styles.muted}>
            PATCH body <code>{JSON.stringify({ [section]: parsed.value ?? null }).slice(0, 120)}</code>
          </small>
        )}
      </div>
      <WriteError error={action.error} onDismiss={() => action.setError(null)} onReload={() => { action.setError(null); onReload(); }} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {schema && (
        <details>
          <summary>{section} schema</summary>
          <SchemaTree spec={spec} schema={schema} />
        </details>
      )}
    </details>
  );
}

const BLANK_OVERRIDE = { scope_type: 'user', scope_value: '', enabled: '', settings: '{\n  "dlp": {"data_risk_action": "block"}\n}' };

function ScopedSettings({ id, generation, onWritten }) {
  const { client, confirm, spec } = usePlayground();
  const list = useLoad(() => client.call({ path: mcpPath(id, '/scoped-settings'), source: 'Scoped settings' }), [client, id, generation]);
  const [form, setForm] = useState(null);
  const action = useAction();
  const putSchema = useBodySchema('Put_scoped_settings');
  const data = list.data;
  const rows = data?.scoped_settings || [];
  const path = (f) => mcpPath(id, `/scoped-settings/${encodeURIComponent(f.scope_type)}/${encodeURIComponent(f.scope_value.trim())}`);
  const parsed = form ? parseJson(form.settings) : { value: undefined };
  const body = form ? { settings: parsed.value ?? {}, ...(form.enabled === '' ? {} : { enabled: form.enabled === 'true' }) } : null;

  async function remove(row) {
    const ok = await confirm({
      title: `Remove the override for ${row.scope_value}?`,
      body: `The ${row.scope_type === 'user' ? 'user' : 'smart group'} falls back to smart group overrides and the MCP settings.`,
      confirmLabel: 'Remove override',
      tone: 'danger',
      call: `DELETE .../scoped-settings/${row.scope_type}/${row.scope_value}`,
    });
    if (!ok) return;
    await action.run(async () => {
      const res = await client.call({
        method: 'DELETE',
        path: path(row),
        headers: { 'If-Match': ifMatch(data.version) },
        source: 'Delete scoped settings',
      });
      onWritten();
      return res;
    }, 'Override removed.');
  }

  return (
    <Panel
      title="Per-user and per-smart-group overrides"
      subtitle="Overrides of tools, dlp and token_saving. A user override wins over smart group overrides, which win over the MCP settings."
      actions={
        <>
          <ApiChips
            calls={[
              ['GET', '/mcps/{mcp_id}/scoped-settings'],
              ['PUT', '/mcps/{mcp_id}/scoped-settings/{scope_type}/{scope_value}'],
              ['DELETE', '/mcps/{mcp_id}/scoped-settings/{scope_type}/{scope_value}'],
            ]}
          />
          <Btn onClick={list.reload}>
            <RefreshCw size={13} aria-hidden /> Reload
          </Btn>
          <Btn variant="primary" onClick={() => setForm(form ? null : BLANK_OVERRIDE)} aria-expanded={!!form}>
            <Plus size={13} aria-hidden /> New override
          </Btn>
        </>
      }
    >
      <ErrorBox error={list.error} />
      {data && (
        <p className={styles.muted}>
          Version <code>{data.version}</code>
        </p>
      )}
      <Table
        rows={rows}
        rowKey={(r) => `${r.scope_type}:${r.scope_value}`}
        onRowClick={(r) => setForm({ scope_type: r.scope_type, scope_value: r.scope_value, enabled: r.enabled == null ? '' : String(r.enabled), settings: pretty(r.settings || {}) })}
        empty={list.loading ? 'Loading...' : list.error ? 'No data: the request failed (see the error above).' : 'No overrides. Every user gets the MCP settings.'}
        columns={[
          { label: 'Scope', render: (r) => <Pill>{r.scope_type === 'smart_group' ? 'smart group' : 'user'}</Pill> },
          { label: 'Applies to', render: (r) => <code>{r.scope_value}</code> },
          { label: 'Enabled', render: (r) => (r.enabled == null ? 'inherits' : <EnabledPill value={r.enabled} />) },
          { label: 'Overrides', render: (r) => Object.keys(r.settings || {}).join(', ') || '-' },
          { label: 'Updated', render: (r) => `${when(r.updated_at)}${r.updated_by ? ` by ${r.updated_by}` : ''}` },
          {
            label: 'Actions',
            render: (r) => (
              <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                <ActionButton method="DELETE" path="/mcps/{mcp_id}/scoped-settings/{scope_type}/{scope_value}" variant="danger" onClick={() => remove(r)}>
                  <Trash2 size={12} aria-hidden /> Remove
                </ActionButton>
              </span>
            ),
          },
        ]}
      />
      {form && (
        <div className={styles.subPanel}>
          <h3>{rows.some((r) => r.scope_type === form.scope_type && r.scope_value === form.scope_value) ? 'Change override' : 'New override'}</h3>
          <div className={styles.formGrid}>
            <Field label="Scope type">
              <select value={form.scope_type} onChange={(e) => setForm({ ...form, scope_type: e.target.value })}>
                <option value="user">user (email)</option>
                <option value="smart_group">smart_group (name)</option>
              </select>
            </Field>
            <Field label={form.scope_type === 'user' ? 'User email' : 'Smart group name'}>
              <input value={form.scope_value} onChange={(e) => setForm({ ...form, scope_value: e.target.value })} placeholder={form.scope_type === 'user' ? 'alice@example.com' : 'Engineering'} />
            </Field>
            <Field label="MCP access" hint="Empty inherits; false turns the MCP off for this user or group.">
              <select value={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.value })}>
                <option value="">inherit</option>
                <option value="true">enabled</option>
                <option value="false">disabled</option>
              </select>
            </Field>
          </div>
          <JsonField label="settings (tools, dlp, token_saving)" rows={8} value={form.settings} onChange={(v) => setForm({ ...form, settings: v })} />
          <details>
            <summary>Request body</summary>
            <JsonView value={body} />
          </details>
          <div className={styles.actionsRow}>
            <ActionButton
              method="PUT"
              path="/mcps/{mcp_id}/scoped-settings/{scope_type}/{scope_value}"
              variant="primary"
              disabled={!form.scope_value.trim() || !!parsed.error || !data}
              onClick={() =>
                action.run(async () => {
                  const res = await client.call({
                    method: 'PUT',
                    path: path(form),
                    body,
                    headers: { 'If-Match': ifMatch(data.version) },
                    source: 'Put scoped settings',
                  });
                  onWritten();
                  return res;
                }, 'Override saved.')
              }
            >
              Save override
            </ActionButton>
            <Btn onClick={() => setForm(null)}>Cancel</Btn>
          </div>
          {putSchema && (
            <details>
              <summary>Override schema</summary>
              <SchemaTree spec={spec} schema={putSchema} />
            </details>
          )}
        </div>
      )}
      <WriteError error={action.error} onDismiss={() => action.setError(null)} onReload={() => { action.setError(null); list.reload(); }} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
      {data && rows.length > 0 && (
        <details>
          <summary>Raw overrides response</summary>
          <JsonView value={data} maxHeight={360} />
        </details>
      )}
    </Panel>
  );
}
