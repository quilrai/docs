import React from 'react';
import { BarChart3, Braces, Cable, Layers, PackagePlus, ScrollText, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { ApiChips, Btn, ErrorBox, JsonView, KeyValue, Panel, Pill, Table, usePlayground } from '../ManagementPlayground/ui';
import { Stats, num } from '../ManagementPlayground/charts';
import styles from '../ManagementPlayground/styles.module.css';
import { useInventory } from './common';

// Console label of each API scope (Settings > AI Gateway > MCP Gateway > Management API).
const CONSOLE_LABELS = {
  read: 'Read',
  'mcps:write': 'Manage MCPs',
  'settings:write': 'Change settings',
  'credentials:write': 'Set credentials',
  'tool_reviews:write': 'Review tools',
};

const CARDS = [
  ['mcps', Layers, 'MCPs', 'Search the inventory, read identity, connection state and tools, rename, enable, disable or remove an MCP.'],
  ['settings', SlidersHorizontal, 'Settings', 'Tools, DLP, token saving, access control and OneMCP settings per MCP, plus per-user and per-smart-group overrides.'],
  ['create', PackagePlus, 'Create and catalog', 'Check a URL and add a remote MCP, install from the MCP Library, or turn a REST API into an MCP.'],
  ['connections', Cable, 'Connections and credentials', 'Connection state, tool refresh, upstream credentials and single-use OAuth connect links.'],
  ['tool-reviews', ShieldCheck, 'Tool reviews', 'Approve or reject new upstream tools held for review.'],
  ['analytics', BarChart3, 'Analytics', 'Tool calls, outcomes, latency, DLP activity, tool-call metadata and per-user activity.'],
  ['audit', ScrollText, 'Audit', 'Configuration changes made in the console and through the API, newest first.'],
  ['explorer', Braces, 'API Explorer', 'Every operation with its schema; send it and copy cURL, Python or JavaScript.'],
];

const list = (v) => (Array.isArray(v) && v.length ? v.map((x) => <code key={x}>{x} </code>) : '-');

export default function Overview() {
  const { capabilities, scopes, index, navigate, connection, spec } = usePlayground();
  const descriptions = spec['x-scope-descriptions'] || {};
  const allScopes = capabilities?.scopes || Object.keys(descriptions);
  const coverage = index.tagNames.map((tag) => {
    const ops = index.operations.filter((o) => o.tags.includes(tag));
    const allowed = scopes ? ops.filter((o) => !o.isAdmin && o.scopes.every((s) => scopes.includes(s))).length : null;
    return { tag, total: ops.length, allowed, admin: ops.every((o) => o.isAdmin) };
  });
  return (
    <div className={styles.stack}>
      {!connection && (
        <Panel
          title="What you can do here"
          subtitle="Everything below uses the public MCP Gateway Management API. Paste a management key issued in the console (Settings > AI Gateway > MCP Gateway > Management API), and every action shows the request it sends."
        >
          <div className={styles.cards}>
            {CARDS.map(([id, Icon, title, text]) => (
              <button key={id} type="button" className={styles.card2} onClick={() => navigate(id)}>
                <Icon size={18} aria-hidden />
                <strong>{title}</strong>
                <span>{text}</span>
              </button>
            ))}
          </div>
        </Panel>
      )}
      {capabilities && (
        <Panel
          title="Key check"
          subtitle="GET /capabilities answered for this key: its tenant, scopes and the gateway's limits."
          actions={<ApiChips calls={[['GET', '/capabilities']]} />}
        >
          <KeyValue
            items={[
              ['Tenant', <code key="t">{capabilities.tenant_id || '-'}</code>],
              ['Key id', <code key="k">{capabilities.caller?.key_id || '-'}</code>],
              ['Key scopes', list(capabilities.caller?.scopes)],
              ['API version', capabilities.api_version || '-'],
              ['Page size', capabilities.limits ? `default ${capabilities.limits.page_limit_default ?? '-'}, max ${capabilities.limits.page_limit_max ?? '-'}` : '-'],
              ['Max body', capabilities.limits?.max_body_bytes ? `${num(capabilities.limits.max_body_bytes)} bytes` : '-'],
              ['Idempotency replay', capabilities.limits?.idempotency_replay_hours ? `${capabilities.limits.idempotency_replay_hours} hours` : '-'],
              ['Settings sections', list(capabilities.settings_sections)],
              ['Auth types', list(capabilities.auth_types)],
              ['Connection states', list(capabilities.connection_states)],
            ]}
          />
          <details>
            <summary>Raw capabilities response (limits, create options, analytics dimensions)</summary>
            <JsonView value={capabilities} maxHeight={420} />
          </details>
        </Panel>
      )}
      {connection && (!scopes || scopes.includes('read')) && <InventoryTile />}
      <Panel
        title="Scopes"
        subtitle={
          connection
            ? 'Your key holds the highlighted scopes. All scopes an operation lists are required; no scope implies another.'
            : 'Management keys carry explicit scopes. All scopes an operation lists are required; no scope implies another.'
        }
      >
        <Table
          rowKey={(r) => r}
          rows={allScopes}
          columns={[
            {
              label: 'Scope',
              render: (s) => (
                <span className={styles.nowrap}>
                  <code>{s}</code> {scopes && (scopes.includes(s) ? <Pill tone="ok">held</Pill> : <Pill tone="off">not held</Pill>)}
                </span>
              ),
            },
            { label: 'Console label', render: (s) => CONSOLE_LABELS[s] || '-' },
            { label: 'Allows', render: (s) => descriptions[s] || '-' },
          ]}
        />
      </Panel>
      <Panel title="Operations by area" subtitle="Open the API Explorer for the full list.">
        <Table
          rowKey={(r) => r.tag}
          rows={coverage}
          columns={[
            { label: 'Area', render: (r) => <strong>{r.tag}</strong> },
            { label: 'Operations', render: (r) => r.total },
            {
              label: 'Your key can call',
              render: (r) => (r.admin ? 'Tenant administrator token (console)' : r.allowed === null ? '-' : `${r.allowed} of ${r.total}`),
            },
          ]}
        />
      </Panel>
    </div>
  );
}

function InventoryTile() {
  const { navigate } = usePlayground();
  const inventory = useInventory();
  const items = inventory.data || [];
  const attention = items.filter((m) => m.connection_state === 'pending_connection' || m.connection_state === 'fetch_failed');
  return (
    <Panel
      title="Inventory at a glance"
      subtitle="Every MCP of the organization, read page by page."
      actions={
        <>
          <ApiChips calls={[['GET', '/mcps']]} />
          <Btn onClick={() => navigate('mcps')}>Open MCPs</Btn>
        </>
      }
    >
      <ErrorBox error={inventory.error} />
      {inventory.loading && !inventory.data && <p className={styles.muted}>Loading...</p>}
      {inventory.data && (
        <>
          <Stats
            items={[
              ['MCPs', num(items.length)],
              ['Enabled', num(items.filter((m) => m.enabled).length)],
              ['Disabled', num(items.filter((m) => !m.enabled).length)],
              ['Ready', num(items.filter((m) => m.connection_state === 'ready').length)],
              ['Need attention', num(attention.length)],
              ['Tools', num(items.reduce((sum, m) => sum + (Number(m.tool_count) || 0), 0))],
            ]}
          />
          {attention.length > 0 && (
            <Table
              rows={attention}
              rowKey={(r) => r.id}
              onRowClick={(r) => navigate('connections', { mcp: r.id })}
              columns={[
                { label: 'Needs attention', render: (r) => <strong>{r.name}</strong> },
                { label: 'State', render: (r) => <Pill tone={r.connection_state === 'fetch_failed' ? 'err' : 'warn'}>{r.connection_state.replace(/_/g, ' ')}</Pill> },
                { label: 'Auth', render: (r) => r.auth_type },
                { label: 'Next step', render: (r) => (r.connection_state === 'pending_connection' ? 'Issue a connect link' : 'Check credentials, then refresh tools') },
              ]}
            />
          )}
        </>
      )}
    </Panel>
  );
}
