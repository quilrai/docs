import React from 'react';
import { ControlCollection, scopeText } from './Controls';
import { ConnectFirst, Pill, Tabs, fmt, usePlayground } from './ui';
import styles from './styles.module.css';

const on = (value) => (value === true ? <Pill tone="ok">on</Pill> : value === false ? 'off' : '-');
const keys = (obj) => Object.entries(obj || {}).filter(([, v]) => v === true).map(([k]) => k).join(', ') || '-';
const scopeOrAll = (r) => (r.all_apps ? 'every app (all_apps)' : scopeText(r.scope));

// One workspace for the access and gateway-feature collections; each is the
// shared resource shape {scope, rank?, settings, description?}.
const COLLECTIONS = {
  access: {
    title: 'Access controls',
    subtitle:
      'Tighten access for a scope: block, require identity, require a conversation ID, or allow only some source IPs. Controls only tighten; overlapping ones combine to the strictest. An empty scope needs all_apps: true.',
    path: '/controls/access',
    columns: [
      { label: 'Scope', render: scopeOrAll },
      { label: 'Restrictions', render: (r) => keys(r.settings) },
      { label: 'Source IPs', render: (r) => (r.settings?.allowed_source_ips || []).join(', ') || '-' },
    ],
  },
  'token-saving': {
    title: 'Token saving',
    subtitle: 'Request-body transforms that cut prompt tokens (text, JSON and tool-output methods), per scope.',
    path: '/controls/token-saving',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Methods on', render: (r) => keys(r.settings) },
      { label: 'Rank', render: (r) => fmt(r.rank) },
    ],
  },
  'response-cache': {
    title: 'Response cache',
    subtitle: 'Response cache for non-streaming requests, per scope: exact, normalized or semantic match for chat and Messages (semantic only after request guardrails pass), exact only for embeddings.',
    path: '/controls/response-cache',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Enabled', render: (r) => on(r.settings?.enabled) },
      { label: 'Match', render: (r) => r.settings?.match || '-' },
      { label: 'Rank', render: (r) => fmt(r.rank) },
    ],
  },
  'cache-warm': {
    title: 'Cache warm',
    subtitle: 'Keep provider prompt caches warm: longer cache lifetime (Anthropic, Bedrock Claude) and refresh requests (OpenAI, Azure, Gemini).',
    path: '/controls/cache-warm',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Longer lifetime', render: (r) => on(r.settings?.extend_cache_lifetime) },
      { label: 'Refresh', render: (r) => on(r.settings?.refresh_requests) },
    ],
  },
  'model-visibility': {
    title: 'Model visibility',
    subtitle: 'What model lists show (GET /v1/models and console discovery). Never what can be called.',
    path: '/controls/model-visibility',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Show only', render: (r) => (r.settings?.show_only || []).join(', ') || '-' },
      { label: 'Hide', render: (r) => (r.settings?.hide_all ? 'all' : (r.settings?.hide || []).join(', ') || '-') },
    ],
  },
  'error-messages': {
    title: 'Error messages',
    subtitle: 'Replace the human message of matching gateway or provider errors and add a help link. Status, type and code never change.',
    path: '/controls/error-messages',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Mappings', render: (r) => fmt((r.settings?.mappings || []).length) },
      { label: 'Rank', render: (r) => fmt(r.rank) },
    ],
  },
  'conversation-headers': {
    title: 'Conversation headers',
    subtitle: 'Extra request headers that carry a conversation ID for session routing and logs.',
    path: '/controls/conversation-headers',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Headers', render: (r) => (r.settings?.id_headers || []).join(', ') || '-' },
    ],
  },
  'prompt-enforcement': {
    title: 'Prompt enforcement',
    subtitle: 'Require system prompts from the Prompt Store, or add one universal system prompt, per scope.',
    path: '/controls/prompt-enforcement',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Store only', render: (r) => on(r.settings?.require_system_from_store) },
      { label: 'Universal prompt', render: (r) => (r.settings?.universal_system_prompt ? 'set' : '-') },
    ],
  },
};

const TABS = [
  ['access', 'Access'],
  ['token-saving', 'Token saving'],
  ['response-cache', 'Response cache'],
  ['cache-warm', 'Cache warm'],
  ['model-visibility', 'Model visibility'],
  ['error-messages', 'Error messages'],
  ['conversation-headers', 'Conversation headers'],
  ['prompt-enforcement', 'Prompt enforcement'],
];

export default function Features() {
  const { client, urlParam, setParam } = usePlayground();
  const view = TABS.some(([id]) => id === urlParam('view')) ? urlParam('view') : 'access';
  if (!client) return <ConnectFirst what="manage access controls and gateway features" />;
  return (
    <div className={styles.stack}>
      <p className={styles.noticeInline}>
        These controls apply while the Policy Engine is on for the LLM Gateway. Feature settings win over console Studio
        rules where they match; access controls only tighten. Each write publishes one policy revision.
      </p>
      <Tabs label="Features area" value={view} onChange={(v) => setParam('view', v)} tabs={TABS} />
      {COLLECTIONS[view] && <ControlCollection key={view} config={COLLECTIONS[view]} />}
    </div>
  );
}
