import React from 'react';
import { Braces, Building2, Layers, Server, Wallet } from 'lucide-react';
import { ApiChips, JsonView, KeyValue, Panel, Pill, Table, usePlayground } from './ui';
import styles from './styles.module.css';

export const SCOPES = [
  ['read', 'Capabilities and the spec, app, provider, quota pool and key metadata, prompts, history, audit, catalogs and operation status.'],
  ['config:write', 'App settings and availability, provider attachments and conversion, prompts, configuration rollback and operation recovery.'],
  ['providers:write', 'Create, update, enable, disable and delete shared providers, manage quota pools, and run provider tests and model discovery.'],
  ['credentials:write', 'Issue gateway keys, change their expiry and revoke them. Creating an app needs this and config:write.'],
  ['credentials:read', 'Reveal the secret of one active gateway key, on explicit request.'],
  ['budgets:read', 'Budgets, usage, subjects, grants, pricing, exemptions, alerts and budget events.'],
  ['budgets:policy', 'Budget, pricing and exemption edits (each publishes a policy revision) and alert destinations.'],
  ['budgets:grant', 'Create, change and revoke time-boxed budget grants.'],
];

const yesNo = (v) => (v === undefined || v === null ? '-' : v ? 'yes' : 'no');

export default function Overview() {
  const { capabilities, scopes, index, navigate, connection } = usePlayground();
  const coverage = index.tagNames.map((tag) => {
    const ops = index.operations.filter((o) => o.tags.includes(tag) && !o.aliasOf);
    const allowed = scopes ? ops.filter((o) => !o.isAdmin && o.scopes.every((s) => scopes.includes(s))).length : null;
    return { tag, total: ops.length, allowed, admin: ops.every((o) => o.isAdmin) };
  });
  return (
    <div className={styles.stack}>
      {!connection && (
        <Panel title="What you can do here" subtitle="Everything below uses the public management API. Pick a region, paste a management key, and every action shows the request it sends.">
          <div className={styles.cards}>
            {[
              ['apps', Layers, 'Apps and credentials', 'Create apps, change settings, attach providers, issue and revoke gateway keys.'],
              ['providers', Server, 'Providers and quota pools', 'Configure shared providers, test models and discover what an upstream offers.'],
              ['budgets', Wallet, 'Budgets', 'Review spend, adjust limits and grant temporary headroom.'],
              ['administration', Building2, 'Bootstrap access', 'No management key yet? Enable management and issue one with a tenant-admin token.'],
              ['explorer', Braces, 'API Explorer', 'Browse every operation with its schema, then send it and copy cURL, Python or JavaScript.'],
            ].map(([id, Icon, title, text]) => (
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
          title="Gateway capabilities"
          subtitle="What this gateway supports for the connected tenant."
          actions={<ApiChips calls={[['GET', '/capabilities']]} />}
        >
          <KeyValue
            items={[
              ['Schema version', capabilities.schema_version ?? '-'],
              ['Writes available', yesNo(capabilities.writes_available)],
              [
                'Policy authority',
                capabilities.policy_authority ? (
                  <>
                    <Pill tone={capabilities.policy_authority.enabled ? 'ok' : 'off'}>
                      {capabilities.policy_authority.enabled ? 'QuilrQL enabled' : 'QuilrQL off'}
                    </Pill>{' '}
                    {capabilities.policy_authority.active_revision != null && <>revision {capabilities.policy_authority.active_revision}</>}
                  </>
                ) : (
                  '-'
                ),
              ],
              ['Configuration propagation', capabilities.configuration_propagation ?? '-'],
              ['Model tests available', yesNo(capabilities.model_tests_available)],
              ['Provider saves call upstream', yesNo(capabilities.provider_saves_call_upstream)],
              ['Policy updates through this API', yesNo(capabilities.policy_updates)],
              ['App modes', (capabilities.modes || []).join(', ') || '-'],
              ['Provider types', capabilities.provider_types ? `${capabilities.provider_types.length} types` : '-'],
              ['Testable provider types', (capabilities.model_test_provider_types || []).join(', ') || '-'],
            ]}
          />
          {capabilities.policy_authority?.enabled && (
            <p className={styles.noticeInline}>
              QuilrQL is enabled for this tenant. Policy-governed app settings are saved but inactive; responses say which
              paths are inactive and which revision decides them.
            </p>
          )}
          <details>
            <summary>Raw capabilities response</summary>
            <JsonView value={capabilities} maxHeight={420} />
          </details>
        </Panel>
      )}
      <Panel
        title="Scopes"
        subtitle={
          connection
            ? scopes
              ? 'Your key holds the highlighted scopes. No scope implies another.'
              : 'This gateway did not report the key scopes. Calls outside them return 403.'
            : 'Management keys carry explicit scopes. No scope implies another.'
        }
      >
        <Table
          rowKey={(r) => r[0]}
          rows={SCOPES}
          columns={[
            {
              label: 'Scope',
              render: ([s]) => (
                <span className={styles.nowrap}>
                  <code>{s}</code>{' '}
                  {scopes && (scopes.includes(s) ? <Pill tone="ok">held</Pill> : <Pill tone="off">not held</Pill>)}
                </span>
              ),
            },
            { label: 'Allows', render: ([, text]) => text },
          ]}
        />
      </Panel>
      <Panel title="Operations by area" subtitle="Counts exclude alias routes. Open the API Explorer for the full list.">
        <Table
          rowKey={(r) => r.tag}
          rows={coverage}
          columns={[
            { label: 'Area', render: (r) => <strong>{r.tag}</strong> },
            { label: 'Operations', render: (r) => r.total },
            {
              label: 'Your key can call',
              render: (r) => (r.admin ? 'Tenant-admin token' : r.allowed === null ? '-' : `${r.allowed} of ${r.total}`),
            },
          ]}
        />
      </Panel>
    </div>
  );
}
