import React, { useState } from 'react';
import { Activity, Eye, Send } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { ControlCollection, LookupForm, editableBody, scopeText, useOpen } from './Controls';
import { ApiChips, Btn, ConnectFirst, ErrorBox, Field, JsonView, KeyValue, Panel, Pill, Tabs, fmt, useAction, usePlayground } from './ui';
import styles from './styles.module.css';

const API_FAMILIES = [
  'openai.chat_completions',
  'openai.responses',
  'anthropic.messages',
  'gemini.generate_content',
  'bedrock.converse',
  'bedrock.invoke',
];

// The example hook from the API reference: observe first, then switch to enforce.
export const EXAMPLE_HOOK = {
  description: 'ACME prompt policy check',
  stage: 'pre_call',
  mode: 'observe',
  scope: { apps: ['support-bot'] },
  match: { api_families: ['openai.chat_completions', 'anthropic.messages'] },
  secrets: { api_key: 'sk_live_example', hmac_key: 'whsec_example' },
  endpoint: {
    url: 'https://guard.example.com/v1/check?app={{app.name}}',
    headers: [
      { name: 'X-Api-Key', value: '{{secret.api_key}}' },
      { name: 'X-Agent', value: '{{client.agent.name}}', omit_if_empty: true },
    ],
    signing: { secret: 'hmac_key' },
    timeout_ms: 1500,
    on_failure: 'allow',
  },
  send: { preset: 'standard', request_headers: ['user-agent', 'x-team-id'] },
};

const hostOf = (r) => {
  const url = r?.endpoint?.url || r?.export?.url || '';
  try {
    return new URL(url.replace(/\{\{[^}]*\}\}/g, 'x')).host;
  } catch {
    return '-';
  }
};

// A hook's `enabled` is part of the resource, so Replace keeps it.
const hookBody = (resource) => ({ ...editableBody(resource), ...(resource && 'enabled' in resource ? { enabled: resource.enabled } : {}) });

// A preview has no stored hook to keep secrets from, so masked values get a placeholder (the preview masks them anyway).
const previewBody = (resource) => {
  const body = hookBody(resource);
  if (body.secrets) body.secrets = Object.fromEntries(Object.keys(body.secrets).map((name) => [name, 'preview-placeholder']));
  return body;
};

const COLLECTION = {
  title: 'Hooks',
  editableBody: hookBody,
  subtitle:
    'Your own HTTPS API, called on gateway traffic. pre_call and post_call hooks allow, flag or block; on_complete hooks export finished requests in batches. Secrets read back as ********.',
  path: '/controls/hooks',
  columns: [
    { label: 'Stage', render: (r) => fmt(r.stage) },
    { label: 'Mode', render: (r) => (r.mode ? <Pill tone={r.mode === 'enforce' ? 'ok' : 'warn'}>{r.mode}</Pill> : 'export') },
    { label: 'Enabled', render: (r) => (r.enabled === false ? <Pill tone="off">off</Pill> : <Pill tone="ok">on</Pill>) },
    { label: 'Applies to', render: (r) => (r.all_apps ? 'every app' : scopeText(r.scope)) },
    { label: 'Destination', render: (r) => <code>{hostOf(r)}</code> },
  ],
};

const TABS = [
  ['hooks', 'Hooks'],
  ['field-catalog', 'Field catalog'],
  ['preview', 'Preview a draft'],
];

export default function Hooks() {
  const { client, urlParam, setParam } = usePlayground();
  const view = TABS.some(([id]) => id === urlParam('view')) ? urlParam('view') : 'hooks';
  if (!client) return <ConnectFirst what="manage external hooks, preview their calls and send test calls" />;
  return (
    <div className={styles.stack}>
      <p className={styles.noticeInline}>
        Hooks apply while the Policy Engine is on for the LLM Gateway. Writes and test calls need <code>hooks:write</code>;
        reads, the field catalog and previews need <code>read</code>. Each write publishes one policy revision. Create a
        new pre_call or post_call hook in <code>observe</code> mode first.
      </p>
      <Tabs label="Hooks area" value={view} onChange={(v) => setParam('view', v)} tabs={TABS} />
      {view === 'hooks' && <ControlCollection key={view} config={COLLECTION} extra={(id, resource) => <HookExtras id={id} resource={resource} />} />}
      {view === 'field-catalog' && <FieldCatalog />}
      {view === 'preview' && <Preview />}
    </div>
  );
}

function HookExtras({ id, resource }) {
  const { client } = usePlayground();
  const open = useOpen();
  const [stats, setStats] = useState(null);
  const action = useAction();
  const family = resource?.match?.api_families?.[0] || 'openai.chat_completions';
  return (
    <div className={styles.subPanel}>
      <div className={styles.cardHead}>
        <h3>Test and status</h3>
        <ApiChips
          calls={[
            ['POST', '/controls/hooks/{resource_id}/test'],
            ['GET', '/controls/hooks/{resource_id}/stats'],
            ['POST', '/controls/hooks/preview'],
          ]}
        />
      </div>
      <div className={styles.inline}>
        <Btn
          variant="primary"
          onClick={() => open('POST', '/controls/hooks/{resource_id}/test', { pathParams: { resource_id: id }, body: { api_family: family } })}
        >
          <Send size={13} aria-hidden /> Send a test call
        </Btn>
        <Btn
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ path: `${MANAGEMENT_PREFIX}/controls/hooks/${seg(id)}/stats`, source: 'Hook stats' });
              setStats(res);
              return res;
            })
          }
        >
          <Activity size={13} aria-hidden /> Status on this server
        </Btn>
        <Btn onClick={() => open('POST', '/controls/hooks/preview', { body: { hook: previewBody(resource), api_family: family } })}>
          <Eye size={13} aria-hidden /> Preview the call
        </Btn>
      </div>
      <p className={styles.muted}>
        A test sends one sample request to your endpoint with the saved hook and shows the status, latency and parsed decision.
        Previews and tests are limited to 10 a minute. Previews always mask secrets, so the preview body uses placeholder
        secret values.
      </p>
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      {stats && (
        <>
          <KeyValue
            items={[
              ['Stage', fmt(stats.stage)],
              ['Circuit breaker', stats.breaker_open ? <Pill tone="warn">open</Pill> : <Pill tone="ok">closed</Pill>],
              ['Export queue', stats.export ? `${fmt(stats.export.queued)} queued, ${stats.export.healthy ? 'healthy' : 'unhealthy'}` : '-'],
            ]}
          />
          <JsonView value={stats} maxHeight={260} />
        </>
      )}
    </div>
  );
}

function FieldCatalog() {
  return (
    <LookupForm
      title="Field catalog"
      subtitle="Every field a hook can send, its type, the stages that have it, the presets that include it, and whether it is sensitive (sensitive fields are sent only when named exactly)."
      path="/controls/hooks/field-catalog"
      fields={[['stage', 'Stage', 'Leave empty for every stage', ['pre_call', 'post_call', 'on_complete']]]}
      summary={(res) => (
        <KeyValue
          items={[
            ['Fields', fmt((res.fields || []).length)],
            ['Sensitive', (res.fields || []).filter((f) => f.sensitive).map((f) => f.path).join(', ') || '-'],
            ['Presets', Object.keys(res.presets || {}).join(', ') || '-'],
          ]}
        />
      )}
    />
  );
}

function Preview() {
  const open = useOpen();
  const [family, setFamily] = useState('openai.chat_completions');
  return (
    <Panel
      title="Preview a draft"
      subtitle="Validate a hook before saving it and see the exact HTTP call it would make for a sample request: method, URL, headers and body, with secrets masked. Nothing is saved or sent."
      actions={<ApiChips calls={[['POST', '/controls/hooks/preview'], ['PUT', '/controls/hooks/{resource_id}']]} />}
    >
      <div className={styles.formGrid}>
        <Field label="Sample request format" hint="The client API the sample request uses">
          <select value={family} onChange={(e) => setFamily(e.target.value)}>
            {API_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className={styles.inline}>
        <Btn variant="primary" onClick={() => open('POST', '/controls/hooks/preview', { body: { hook: EXAMPLE_HOOK, api_family: family } })}>
          <Eye size={13} aria-hidden /> Preview the example hook
        </Btn>
        <Btn
          onClick={() =>
            open('PUT', '/controls/hooks/{resource_id}', {
              pathParams: { resource_id: 'acme-guard' },
              query: { dry_run: 'true' },
              headers: { 'If-None-Match': '*' },
              body: EXAMPLE_HOOK,
            })
          }
        >
          Create it (dry run)
        </Btn>
      </div>
      <p className={styles.muted}>Both open in the API explorer, where you can edit the body before sending.</p>
    </Panel>
  );
}
