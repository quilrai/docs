import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
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
  pretty,
  useAction,
  usePlayground,
} from '../ManagementPlayground/ui';
import { useLoad, when } from '../ManagementPlayground/shared';
import { redactSecrets } from '../ManagementPlayground/client.mjs';
import styles from '../ManagementPlayground/styles.module.css';
import { customToolPath as toolPath, ifMatch, mcpPath } from './routes.mjs';
import { McpPicker, WriteError, useMcpName } from './common';

// Custom tools: an admin-written Python script over one MCP's own tools,
// listed and called like any other tool of that MCP. List, read, edit, validate,
// save (If-Match with the MCP version), enable or disable, delete, list the
// functions a script can call, and test-run a saved tool or the unsaved draft.
// Test runs are real calls made as the key owner.

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const STATUS_TONES = { active: 'ok', disabled: undefined, shadowed: 'warn' };
const OUTCOME_TONES = { ok: 'ok', error: 'err', approval_required: 'warn', refused: 'err' };

const EXAMPLE = {
  name: 'recent_unread_summary',
  description: 'Unread emails in a folder: sender and subject only.',
  input_schema: {
    type: 'object',
    properties: { folder: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 50 } },
    additionalProperties: false,
  },
  defaults: { folder: 'inbox', limit: 25 },
  annotations: { readOnlyHint: true },
  code:
    'msgs = await list_messages(folder=args["folder"], top=args["limit"])\n' +
    'unread = [m for m in msgs["value"] if not m["isRead"]]\n' +
    '{"unread": len(unread), "items": [{"from": m["from"], "subject": m["subject"]} for m in unread]}',
};

export default function CustomTools() {
  const { client, urlParam } = usePlayground();
  const id = urlParam('mcp');
  if (!client) return <ConnectFirst what="manage custom tools" />;
  return (
    <div className={styles.stack}>
      <Panel
        title="Custom tools"
        subtitle="Add your own tools to an MCP: a short Python script that calls the MCP's tools with default parameters and simple logic. Users and agents see it as one more tool of the MCP, on its endpoint and in OneMCP. Every tool the script calls runs as the caller, with the usual policies, approvals, DLP and logging."
      >
        <McpPicker hint="Custom tools belong to one MCP and can call only that MCP's tools." />
      </Panel>
      {id ? <Workspace key={id} id={id} /> : <p className={styles.muted}>Select an MCP to see its custom tools.</p>}
    </div>
  );
}

function blankForm(tool) {
  const t = tool || {};
  return {
    name: t.name || '',
    description: t.description || '',
    input_schema: pretty(t.input_schema || { type: 'object', properties: {}, additionalProperties: false }),
    defaults: pretty(t.defaults || {}),
    annotations: pretty(t.annotations || {}),
    code: t.code || '',
    enabled: t.enabled !== false,
    timeout_s: t.limits?.timeout_s != null ? String(t.limits.timeout_s) : '',
    max_tool_calls: t.limits?.max_tool_calls != null ? String(t.limits.max_tool_calls) : '',
  };
}

/** The definition (PUT body) the form describes, or an error message. */
function definitionOf(form) {
  const body = { description: form.description, code: form.code, enabled: form.enabled };
  for (const key of ['input_schema', 'defaults', 'annotations']) {
    const parsed = parseJson(form[key]);
    if (parsed.error) return { body: null, error: `${key}: ${parsed.error}` };
    if (parsed.value !== undefined) body[key] = parsed.value;
  }
  const limits = {};
  for (const [key, max] of [['timeout_s', 60], ['max_tool_calls', 50]]) {
    const text = form[key].trim();
    if (!text) continue;
    const value = Number(text);
    if (!Number.isInteger(value) || value < 1 || value > max) return { body: null, error: `${key} must be an integer from 1 to ${max}.` };
    limits[key] = value;
  }
  if (Object.keys(limits).length) body.limits = limits;
  if (!form.description.trim()) return { body, error: 'A description is required: models read it to pick the tool.' };
  if (!form.code.trim()) return { body, error: 'The script is empty.' };
  return { body, error: null };
}

/** "Syntax error on line N" for a 400 that carries the script line. */
function SyntaxLine({ error }) {
  const line = error?.payload?.error?.line;
  if (line == null) return null;
  return <p className={styles.errorText}>The script has an error on line {line}.</p>;
}

function Workspace({ id }) {
  const { client } = usePlayground();
  const name = useMcpName(id);
  const list = useLoad(() => client.call({ path: mcpPath(id, '/custom-tools'), source: 'Custom tools' }), [client, id]);
  const tools = list.data?.custom_tools || [];
  const version = list.data?.version;
  // undefined: nothing open; null: a new tool; string: a saved tool.
  const [selected, setSelected] = useState(undefined);
  const current = typeof selected === 'string' ? tools.find((t) => t.name === selected) : null;
  const [functionsOpen, setFunctionsOpen] = useState(false);
  const [notice, setNotice] = useState('');

  return (
    <>
      <Panel
        title={`Custom tools of ${name}`}
        subtitle={`version is the If-Match for saves, enable or disable and deletes; any change to the MCP changes it.${list.data?.limit ? ` An MCP can have up to ${list.data.limit} custom tools.` : ''}`}
        actions={
          <>
            <ApiChips calls={[['GET', '/mcps/{mcp_id}/custom-tools']]} />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Reload
            </Btn>
            <Btn variant="primary" onClick={() => {
              setNotice('');
              setSelected(null);
            }}>
              <Plus size={13} aria-hidden /> New custom tool
            </Btn>
          </>
        }
      >
        <ErrorBox error={list.error} />
        <Notice tone="ok" onDismiss={() => setNotice('')}>{notice}</Notice>
        {list.data && (
          <KeyValue items={[['Custom tools', `${tools.length}${list.data.limit ? ` of ${list.data.limit}` : ''}`], ['Version', <code key="v">{version}</code>]]} />
        )}
        {list.data && (
          <Table
            rows={tools}
            rowKey={(r) => r.name}
            selected={typeof selected === 'string' ? selected : undefined}
            onRowClick={(r) => {
              setNotice('');
              setSelected(r.name);
            }}
            empty="No custom tools on this MCP yet. Click New custom tool to write one."
            columns={[
              { label: 'Name', render: (r) => <code>{r.name}</code> },
              { label: 'Status', render: (r) => <Pill tone={STATUS_TONES[r.status]}>{fmt(r.status)}</Pill> },
              { label: 'Calls', render: (r) => (r.uses_tools || []).join(', ') || '-' },
              { label: 'Warnings', render: (r) => ((r.warnings || []).length ? <Pill tone="warn">{r.warnings.length}</Pill> : '-') },
              { label: 'Tool version', render: (r) => fmt(r.tool_version) },
              { label: 'Updated', render: (r) => `${when(r.updated_at)}${r.updated_by ? ` by ${r.updated_by}` : ''}` },
            ]}
          />
        )}
      </Panel>
      {list.data && (selected === null || current) && (
        <Editor
          key={selected === null ? '(new)' : selected}
          id={id}
          tool={current}
          isNew={selected === null}
          version={version}
          taken={tools.map((t) => t.name)}
          onSaved={(saved, message) => {
            setNotice(message);
            setSelected(saved);
            list.reload();
          }}
          onDeleted={(message) => {
            setNotice(message);
            setSelected(undefined);
            list.reload();
          }}
          onReload={list.reload}
          onShowFunctions={() => setFunctionsOpen(true)}
        />
      )}
      <Functions id={id} open={functionsOpen} onOpen={() => setFunctionsOpen(true)} />
    </>
  );
}

function Editor({ id, tool, isNew, version, taken, onSaved, onDeleted, onReload, onShowFunctions }) {
  const { client, confirm } = usePlayground();
  const [form, setForm] = useState(() => blankForm(tool));
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const save = useAction();
  const validate = useAction();
  const [validation, setValidation] = useState(null);
  const { body, error: formError } = definitionOf(form);
  const nameOk = NAME_PATTERN.test(form.name);
  const nameTaken = isNew && taken.includes(form.name);
  const ready = !!body && !formError && nameOk;
  useEffect(() => setValidation(null), [form]);
  // A save, enable or disable reloads the list: show the saved values.
  useEffect(() => {
    if (tool) setForm(blankForm(tool));
  }, [tool?.tool_version, tool?.enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  async function runSave() {
    if (nameTaken) {
      const ok = await confirm({
        title: `Replace ${form.name}?`,
        body: 'A custom tool with this name already exists. Saving replaces its whole definition.',
        confirmLabel: 'Replace',
        tone: 'danger',
      });
      if (!ok) return;
    }
    const res = await save.run(
      async () =>
        client.call({ method: 'PUT', path: toolPath(id, form.name), body, headers: { 'If-Match': ifMatch(version) }, source: 'Save custom tool' }),
    );
    if (res) {
      const warnings = (res.custom_tool?.warnings || []).length;
      onSaved(res.custom_tool?.name || form.name, `Saved ${res.custom_tool?.name || form.name} (tool version ${res.custom_tool?.tool_version}, MCP ${res.version}).${warnings ? ' The script calls names that are not tools of this MCP: see Warnings.' : ''} Clients see the change within a few seconds.`);
    }
  }

  async function setEnabled(enabled) {
    const res = await save.run(
      async () =>
        client.call({ method: 'PATCH', path: toolPath(id, tool.name), body: { enabled }, headers: { 'If-Match': ifMatch(version) }, source: enabled ? 'Enable custom tool' : 'Disable custom tool' }),
    );
    if (res) onSaved(tool.name, `${enabled ? 'Enabled' : 'Disabled'} ${tool.name} (MCP ${res.version}).`);
  }

  async function remove() {
    const ok = await confirm({
      title: `Delete ${tool.name}?`,
      body: 'Clients stop seeing this custom tool within seconds. The script is not kept.',
      confirmLabel: 'Delete custom tool',
      tone: 'danger',
      call: `DELETE ${toolPath(id, tool.name)}`,
    });
    if (!ok) return;
    const res = await save.run(
      async () => client.call({ method: 'DELETE', path: toolPath(id, tool.name), headers: { 'If-Match': ifMatch(version) }, source: 'Delete custom tool' }),
    );
    if (res) onDeleted(`Deleted ${tool.name} (MCP ${res.version}).`);
  }

  const shown = validation?.custom_tool || tool;

  return (
    <>
      <Panel
        title={isNew ? 'New custom tool' : `Edit ${tool?.name}`}
        subtitle="Save sends the whole definition (PUT). Validate runs every save check without saving. Names the script calls that are not tools of the MCP come back as warnings and do not block a save."
        actions={
          <ApiChips
            calls={[
              ['PUT', '/mcps/{mcp_id}/custom-tools/{name}'],
              ['PATCH', '/mcps/{mcp_id}/custom-tools/{name}'],
              ['DELETE', '/mcps/{mcp_id}/custom-tools/{name}'],
              ['POST', '/mcps/{mcp_id}/custom-tools:validate'],
            ]}
          />
        }
      >
        {tool && (
          <KeyValue
            items={[
              ['Status', <Pill key="s" tone={STATUS_TONES[tool.status]}>{fmt(tool.status)}</Pill>],
              tool.status === 'shadowed' ? ['Shadowed', 'The MCP now has its own tool with this name, which clients see instead. Rename or delete this custom tool.'] : null,
              ['Tool version', fmt(tool.tool_version)],
              ['Created', `${when(tool.created_at)}${tool.created_by ? ` by ${tool.created_by}` : ''}`],
              ['Updated', `${when(tool.updated_at)}${tool.updated_by ? ` by ${tool.updated_by}` : ''}`],
            ]}
          />
        )}
        {isNew && (
          <div className={styles.actionsRow}>
            <span className={styles.muted}>Start from:</span>
            <Btn onClick={() => setForm(blankForm(EXAMPLE))}>Example: unread email summary</Btn>
          </div>
        )}
        <div className={styles.formGrid}>
          <Field label="Name" hint={nameOk || !form.name ? 'A letter, then letters, digits, _ or - (at most 64). Must not be a name the MCP\'s own tools use.' : 'Invalid name.'}>
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} readOnly={!isNew} placeholder="recent_unread_summary" spellCheck="false" />
          </Field>
          <Field label="Timeout (seconds)" hint="1 to 60. Empty: 60.">
            <input value={form.timeout_s} onChange={(e) => set({ timeout_s: e.target.value })} inputMode="numeric" />
          </Field>
          <Field label="Max tool calls per run" hint="1 to 50. Empty: 50.">
            <input value={form.max_tool_calls} onChange={(e) => set({ max_tool_calls: e.target.value })} inputMode="numeric" />
          </Field>
        </div>
        <Field label="Description" hint="What the tool does and when to use it. Models read this to pick the tool." wide>
          <textarea rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <JsonField
          label="Input schema"
          rows={6}
          value={form.input_schema}
          onChange={(v) => set({ input_schema: v })}
          hint='type: object with typed top-level properties, required and additionalProperties (default false). At most 50 properties.'
        />
        <JsonField
          label="Defaults"
          rows={3}
          value={form.defaults}
          onChange={(v) => set({ defaults: v })}
          hint="Clients see each default as default and do not have to send it; values a call sends replace it."
        />
        <Field
          label="Script (Python)"
          hint='args holds the arguments. Call a tool as await tool_name(...) or await call_tool("name", {...}). The last expression is the result. 60 s, 50 tool calls, 64 KiB; no files, network or environment.'
          wide
        >
          <textarea className={styles.code} rows={12} value={form.code} onChange={(e) => set({ code: e.target.value })} spellCheck="false" />
        </Field>
        <div className={styles.actionsRow}>
          <Btn onClick={onShowFunctions}>Show the functions a script can call</Btn>
        </div>
        <JsonField
          label="Annotations"
          rows={2}
          value={form.annotations}
          onChange={(v) => set({ annotations: v })}
          hint="title and the booleans readOnlyHint, destructiveHint, idempotentHint, openWorldHint."
        />
        <Checkbox label="Enabled (shown to clients)" checked={form.enabled} onChange={(v) => set({ enabled: v })} />
        <details>
          <summary>Request body</summary>
          <JsonView value={redactSecrets(body || {})} />
        </details>
        {formError && <p className={styles.errorText}>{formError}</p>}
        {nameTaken && <p className={styles.warnText}>A custom tool named {form.name} exists; saving replaces it.</p>}
        <div className={styles.actionsRow}>
          <ActionButton
            method="POST"
            path="/mcps/{mcp_id}/custom-tools:validate"
            disabled={!ready}
            onClick={() =>
              validate.run(async () => {
                const res = await client.call({ method: 'POST', path: mcpPath(id, '/custom-tools:validate'), body: { name: form.name, ...body }, source: 'Validate custom tool' });
                setValidation(res);
                return res;
              }, (r) => ((r.custom_tool?.warnings || []).length ? 'Valid, with warnings.' : 'Valid. Nothing was saved.'))
            }
          >
            Validate
          </ActionButton>
          <ActionButton method="PUT" path="/mcps/{mcp_id}/custom-tools/{name}" variant="primary" disabled={!ready || !version} onClick={runSave}>
            {isNew && !nameTaken ? 'Create' : 'Save'}
          </ActionButton>
          {!isNew && tool && (
            <ActionButton method="PATCH" path="/mcps/{mcp_id}/custom-tools/{name}" disabled={!version} onClick={() => setEnabled(!tool.enabled)}>
              {tool.enabled ? 'Disable' : 'Enable'}
            </ActionButton>
          )}
          {!isNew && tool && (
            <ActionButton method="DELETE" path="/mcps/{mcp_id}/custom-tools/{name}" disabled={!version} onClick={remove}>
              Delete
            </ActionButton>
          )}
          <Btn onClick={() => setForm(blankForm(tool))}>Reset</Btn>
        </div>
        <ErrorBox error={validate.error} onDismiss={() => validate.setError(null)} />
        <SyntaxLine error={validate.error} />
        <Notice tone="ok" onDismiss={() => validate.setNotice('')}>{validate.notice}</Notice>
        <WriteError error={save.error} onDismiss={() => save.setError(null)} onReload={() => { save.setError(null); onReload(); }} />
        <SyntaxLine error={save.error} />
        {shown && (
          <div className={styles.subPanel}>
            <h3>{validation ? 'Validated definition (not saved)' : 'Saved definition'}</h3>
            <KeyValue
              items={[
                ['Calls', (shown.uses_tools || []).join(', ') || '-'],
                ['Warnings', (shown.warnings || []).length ? <span key="w" className={styles.warnText}>{shown.warnings.join('; ')}</span> : '-'],
              ]}
            />
            {shown.listed_as && (
              <details>
                <summary>How clients see it (listed tool)</summary>
                <JsonView value={shown.listed_as} />
              </details>
            )}
          </div>
        )}
      </Panel>
      <TestRun id={id} name={form.name} draft={body} draftReady={ready} saved={!isNew || nameTaken} />
    </>
  );
}

function Functions({ id, open, onOpen }) {
  const { client } = usePlayground();
  const fns = useLoad(() => client.call({ path: mcpPath(id, '/custom-tools:functions'), source: 'Script functions' }), [client, id], !!client && open);
  const data = fns.data;
  return (
    <Panel
      title="Functions a script can call"
      subtitle="One async function per tool of this MCP, with a Python signature built from the tool's input schema, plus the globals every script has and the run limits."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps/{mcp_id}/custom-tools:functions']]} />
          {open ? (
            <Btn onClick={fns.reload}>
              <RefreshCw size={13} aria-hidden /> Reload
            </Btn>
          ) : (
            <Btn variant="primary" onClick={onOpen}>
              Load functions
            </Btn>
          )}
        </>
      }
    >
      <ErrorBox error={fns.error} />
      {data && (
        <>
          <Table
            rows={data.functions || []}
            rowKey={(r) => r.tool}
            empty="This MCP lists no tools you can see."
            columns={[
              { label: 'Signature', render: (r) => <code>{r.signature}</code> },
              { label: 'Tool', render: (r) => (r.function !== r.tool ? <span>call_tool(<code>{JSON.stringify(r.tool)}</code>, ...)</span> : <code>{r.tool}</code>) },
              { label: 'Summary', render: (r) => fmt(r.summary) },
            ]}
          />
          <KeyValue
            items={[
              ...Object.entries(data.globals || {}).map(([k, v]) => [<code key={k}>{k}</code>, String(v)]),
              ...Object.entries(data.limits || {}).map(([k, v]) => [k.replace(/_/g, ' '), fmt(v)]),
            ]}
          />
        </>
      )}
    </Panel>
  );
}

function TestRun({ id, name, draft, draftReady, saved }) {
  const { client, confirm } = usePlayground();
  const [args, setArgs] = useState('{}');
  const [useDraft, setUseDraft] = useState(!saved);
  const [result, setResult] = useState(null);
  const action = useAction();
  const parsed = parseJson(args);
  useEffect(() => {
    if (!saved) setUseDraft(true);
  }, [saved]);
  const canRun = NAME_PATTERN.test(name) && !parsed.error && (!useDraft || draftReady) && (useDraft || saved);

  async function run() {
    const ok = await confirm({
      title: `Run ${name} now?`,
      body: 'The test run is real: it runs as you (the key owner) with your connection to the MCP, and every tool the script calls has its real effects, checked by policies and approvals and logged.',
      confirmLabel: 'Run',
      call: `POST ${mcpPath(id, '/custom-tools:test')}`,
    });
    if (!ok) return;
    await action.run(async () => {
      const body = { name, arguments: parsed.value || {} };
      if (useDraft && draft) body.draft = draft;
      const res = await client.call({ method: 'POST', path: mcpPath(id, '/custom-tools:test'), body, source: useDraft ? 'Test run (draft)' : 'Test run' });
      setResult(res);
      return res;
    });
  }

  const r = result;
  return (
    <Panel
      title="Test run"
      subtitle="Runs the saved tool, or the unsaved draft above, as the key owner through the same path a client call takes. Needs tools:write. Not available for MCPs where each user signs in with their own token (409 test_run_unavailable)."
      actions={<ApiChips calls={[['POST', '/mcps/{mcp_id}/custom-tools:test']]} />}
    >
      <Notice tone="warn">Test runs make real tool calls with real effects. Use arguments that are safe to run.</Notice>
      <JsonField label="Arguments" rows={4} value={args} onChange={setArgs} hint="As a client would send them. Omitted arguments take the defaults." />
      <Checkbox label="Test the unsaved draft (sends the form above as draft)" checked={useDraft} disabled={!saved} onChange={setUseDraft} />
      {useDraft && !draftReady && <p className={styles.muted}>Complete the definition above (name, description, script, valid JSON) to test it.</p>}
      <div className={styles.actionsRow}>
        <ActionButton method="POST" path="/mcps/{mcp_id}/custom-tools:test" variant="primary" disabled={!canRun} onClick={run}>
          Run test
        </ActionButton>
      </div>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      {r && (
        <div className={styles.subPanel}>
          <KeyValue
            items={[
              ['Outcome', <Pill key="o" tone={OUTCOME_TONES[r.outcome]}>{fmt(r.outcome)}</Pill>],
              ['Draft', fmt(r.draft)],
              r.error ? ['Error', <span key="e" className={styles.errorText}>{r.error}</span>] : null,
              r.run?.error_kind ? ['Error kind', <code key="k">{r.run.error_kind}</code>] : null,
              r.run?.ms != null ? ['Run time', `${r.run.ms} ms`] : null,
              r.run?.run_id ? ['Run id', <code key="r">{r.run.run_id}</code>] : null,
            ]}
          />
          {r.outcome === 'approval_required' && (
            <p className={styles.warnText}>A tool the script called needs approval. After it is approved, run the custom tool again.</p>
          )}
          {r.run?.calls && (
            <>
              <h3>Tool calls</h3>
              <Table
                rows={r.run.calls}
                rowKey={(c) => `${c.tool}:${r.run.calls.indexOf(c)}`}
                empty="The script made no tool calls."
                columns={[
                  { label: '#', render: (c) => r.run.calls.indexOf(c) + 1 },
                  { label: 'Tool', render: (c) => <code>{c.tool}</code> },
                  { label: 'Result', render: (c) => <Pill tone={c.ok ? 'ok' : 'err'}>{c.ok ? 'ok' : 'failed'}</Pill> },
                  { label: 'Time', render: (c) => (c.ms != null ? `${c.ms} ms` : '-') },
                ]}
              />
            </>
          )}
          {r.run?.approval_required && (
            <details open>
              <summary>Waiting for approval</summary>
              <JsonView value={redactSecrets(r.run.approval_required)} />
            </details>
          )}
          {r.run && 'result' in r.run && (
            <details open>
              <summary>Script result</summary>
              <JsonView value={redactSecrets(r.run.result ?? null)} maxHeight={320} />
            </details>
          )}
          {r.run?.logs ? (
            <details open>
              <summary>Logs (print output)</summary>
              <pre className={styles.json}>{r.run.logs}</pre>
            </details>
          ) : null}
          {r.client_result && (
            <details>
              <summary>What a client gets</summary>
              <JsonView value={redactSecrets(r.client_result)} maxHeight={320} />
            </details>
          )}
          {(r.run?.unfinished_calls || []).length > 0 && (
            <details>
              <summary>Unfinished calls</summary>
              <JsonView value={redactSecrets(r.run.unfinished_calls)} />
            </details>
          )}
        </div>
      )}
    </Panel>
  );
}
