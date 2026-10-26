import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { appRoute, seg, versionOf } from './client.mjs';
import {
  ActionButton,
  ApiChips,
  Btn,
  Checkbox,
  ConnectFirst,
  ErrorBox,
  Field,
  Notice,
  Panel,
  Table,
  fmt,
  useAction,
  usePlayground,
} from './ui';
import { AppPicker, fetchAllPages, idOf, useLoad, when } from './shared';
import styles from './styles.module.css';

const sub = (app, s) => {
  const r = appRoute(app, s);
  return { path: r.path, query: r.query };
};

export default function Prompts() {
  const { client, urlParam } = usePlayground();
  if (!client) return <ConnectFirst what="manage the Prompt Store" />;
  const app = urlParam('app');
  return (
    <div className={styles.stack}>
      <Panel title="Prompt Store" subtitle="Stored prompts per app, plus the universal system prompt the gateway prepends to every request.">
        <AppPicker />
      </Panel>
      {app && <AppPrompts key={app} app={app} />}
    </div>
  );
}

function AppPrompts({ app }) {
  const { client, confirm } = usePlayground();
  const list = useLoad(
    () =>
      fetchAllPages((cursor) =>
        client.call({ ...sub(app, '/prompts'), query: { ...sub(app, '').query, limit: 200, cursor }, source: 'Prompts' }),
      ),
    [client, app],
  );
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({ id: '', content: '' });
  const action = useAction();
  const etag = versionOf(list.data);
  const pid = (r) => idOf(r, 'prompt_id', 'id', 'name');

  async function open(id) {
    await action.run(async () => {
      const res = await client.call({ ...sub(app, `/prompts/${seg(id)}`), source: 'Read prompt' });
      const prompt = res.prompt || res;
      setSelected(id);
      setDraft({ id, content: prompt.content ?? '' });
      return res;
    });
  }
  async function save() {
    await action.run(async () => {
      const res = await client.call({
        method: 'PUT',
        ...sub(app, `/prompts/${seg(draft.id.trim())}`),
        body: { content: draft.content },
        headers: { 'If-Match': etag },
        source: 'Save prompt',
      });
      setSelected(draft.id.trim());
      list.reload();
      return res;
    }, `Saved ${draft.id.trim()}.`);
  }
  async function remove(id) {
    if (!(await confirm({ title: `Delete prompt ${id}?`, body: 'Apps that require stored system prompts can no longer use it.', confirmLabel: 'Delete prompt', tone: 'danger' }))) return;
    await action.run(async () => {
      const res = await client.call({ method: 'DELETE', ...sub(app, `/prompts/${seg(id)}`), headers: { 'If-Match': etag }, source: 'Delete prompt' });
      if (selected === id) {
        setSelected(null);
        setDraft({ id: '', content: '' });
      }
      list.reload();
      return res;
    }, `Deleted ${id}.`);
  }
  const validId = /^[A-Za-z0-9_-]+$/.test(draft.id.trim());

  return (
    <>
      <Panel
        title={`Prompts for ${app}`}
        subtitle="Writes use the app version as If-Match and leave other prompts and settings untouched."
        actions={
          <>
            <ApiChips
              calls={[
                ['GET', '/apps/{app_name}/prompts'],
                ['GET', '/apps/{app_name}/prompts/{prompt_id}'],
                ['PUT', '/apps/{app_name}/prompts/{prompt_id}'],
                ['DELETE', '/apps/{app_name}/prompts/{prompt_id}'],
              ]}
            />
            <Btn onClick={list.reload}>
              <RefreshCw size={13} aria-hidden /> Refresh
            </Btn>
          </>
        }
      >
        <ErrorBox error={list.error} />
        <Table
          rows={list.data?.items || []}
          rowKey={pid}
          selected={selected}
          onRowClick={(r) => open(pid(r))}
          empty={list.loading ? 'Loading...' : 'No stored prompts.'}
          columns={[
            { label: 'Prompt id', render: (r) => <code>{pid(r)}</code> },
            { label: 'Preview', render: (r) => (r.content ? `${String(r.content).slice(0, 90)}${String(r.content).length > 90 ? '...' : ''}` : fmt(r.length ?? r.size)) },
            { label: 'Updated', render: (r) => when(idOf(r, 'updated_at', 'created_at')) },
            {
              label: 'Actions',
              render: (r) => (
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                  <ActionButton method="DELETE" path="/apps/{app_name}/prompts/{prompt_id}" scopes={['config:write']} variant="danger" onClick={() => remove(pid(r))}>
                    Delete
                  </ActionButton>
                </span>
              ),
            },
          ]}
        />
        <div className={styles.subPanel}>
          <div className={styles.cardHead}>
            <h3>{selected ? `Edit ${selected}` : 'New prompt'}</h3>
            {selected && (
              <Btn
                onClick={() => {
                  setSelected(null);
                  setDraft({ id: '', content: '' });
                }}
              >
                New prompt instead
              </Btn>
            )}
          </div>
          <Field label="Prompt id" hint="Letters, digits, _ or -.">
            <input value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} disabled={!!selected} aria-invalid={!!draft.id && !validId} />
          </Field>
          <Field label="Content" wide>
            <textarea rows={8} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          </Field>
          <div className={styles.actionsRow}>
            <ActionButton method="PUT" path="/apps/{app_name}/prompts/{prompt_id}" scopes={['config:write']} variant="primary" disabled={!validId} onClick={save}>
              {selected ? 'Save prompt' : 'Create prompt'}
            </ActionButton>
            <small className={styles.muted}>
              If-Match <code>{etag || 'none'}</code>
            </small>
          </div>
        </div>
        <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
        <Notice tone="ok" onDismiss={() => action.setNotice('')}>
          {action.notice}
        </Notice>
      </Panel>
      <UniversalPrompt app={app} />
    </>
  );
}

function UniversalPrompt({ app }) {
  const { client } = usePlayground();
  const route = appRoute(app);
  const detail = useLoad(() => client.call({ path: route.path, query: route.query, source: 'Read app' }), [client, app]);
  const current = detail.data?.app?.prompts?.universal_system_prompt;
  const [form, setForm] = useState({ enabled: false, content: '' });
  const action = useAction();
  useEffect(() => {
    if (current) setForm({ enabled: !!current.enabled, content: current.content || '' });
  }, [current?.enabled, current?.content]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel
      title="Universal system prompt"
      subtitle="When enabled, the gateway prepends this text to the system prompt of every request to the app. It is an app setting, not a stored prompt."
      actions={<ApiChips calls={[['PATCH', '/apps/{app_name}']]} />}
    >
      <ErrorBox error={detail.error} />
      <Checkbox label="Enabled" checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} />
      <Field label="Content" hint="Up to 100,000 characters. Enabling with blank content is rejected." wide>
        <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </Field>
      <ActionButton
        method="PATCH"
        path="/apps/{app_name}"
        scopes={['config:write']}
        variant="primary"
        disabled={!detail.data}
        onClick={() =>
          action.run(async () => {
            const res = await client.call({
              method: 'PATCH',
              path: route.path,
              query: route.query,
              body: { prompts: { universal_system_prompt: form } },
              headers: { 'If-Match': versionOf(detail.data) },
              source: 'Universal system prompt',
            });
            detail.reload();
            return res;
          }, 'Universal system prompt saved.')
        }
      >
        Save
      </ActionButton>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      <Notice tone="ok" onDismiss={() => action.setNotice('')}>
        {action.notice}
      </Notice>
    </Panel>
  );
}
