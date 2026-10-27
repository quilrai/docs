import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { ControlCollection, LookupForm, scopeText, useOpen } from './Controls';
import { ApiChips, Btn, ConnectFirst, ErrorBox, JsonView, KeyValue, Pill, Table, Tabs, fmt, useAction, usePlayground } from './ui';
import { when } from './shared';
import styles from './styles.module.css';

const windowText = (w) => (!w ? '-' : w.kind === 'calendar' ? `calendar ${w.unit}${w.timezone ? ` (${w.timezone})` : ''}` : `rolling ${w.size || 1} ${w.unit}`);

// Grant subjects are named by the rate limit's grouping fields.
const SUBJECT_KEY = {
  'user.email': 'user',
  user: 'user',
  'application.group_key': 'app',
  app: 'app',
  'user.active_smart_group': 'smart_group',
  smart_group: 'smart_group',
  'gateway.actual_model': 'model',
  model: 'model',
};

function subjectTemplate(groupBy = []) {
  const subject = {};
  for (const field of groupBy) {
    const key = SUBJECT_KEY[field] || field;
    subject[key] = key === 'user' ? 'alex@example.com' : '';
  }
  return Object.keys(subject).length ? subject : { user: 'alex@example.com' };
}

const COLLECTIONS = {
  'rate-limits': {
    title: 'Rate limits',
    subtitle:
      'Request and token counters over rolling or calendar windows, one counter per group_by combination. metric, group_by and window identify the counter and never change in place.',
    path: '/controls/rate-limits',
    columns: [
      { label: 'Metric', render: (r) => fmt(r.metric) },
      { label: 'Limit', render: (r) => fmt(r.limit) },
      { label: 'Window', render: (r) => windowText(r.window) },
      { label: 'Per', render: (r) => (r.group_by || []).join(', ') || 'shared' },
      { label: 'Mode', render: (r) => (r.mode ? <Pill tone={r.mode === 'enforce' ? 'ok' : 'warn'}>{r.mode}</Pill> : '-') },
    ],
  },
  'request-guards': {
    title: 'Request guards',
    subtitle: 'Per-request caps for a scope: maximum total tokens per request and a request timeout. The strictest value wins.',
    path: '/controls/request-guards',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Max tokens / request', render: (r) => fmt(r.max_tokens_per_request) },
      { label: 'Timeout (s)', render: (r) => fmt(r.timeout_s) },
    ],
  },
  'model-limits': {
    title: 'Model limits',
    subtitle: 'Per-model request caps (tokens per request, timeout), optionally for one provider label. Window limits per model are rate limits grouped by model.',
    path: '/controls/model-limits',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Models', render: (r) => (r.limits || []).map((l) => l.model).join(', ') || '-' },
    ],
  },
  'limit-exemptions': {
    title: 'Limit exemptions',
    subtitle: 'Skip rate limits for some users, apps or smart groups until an expiry. Budget exemptions use the Budgets API.',
    path: '/controls/limit-exemptions',
    columns: [
      { label: 'Scope', render: (r) => scopeText(r.scope) },
      { label: 'Quotas', render: (r) => (Array.isArray(r.quotas) ? r.quotas.join(', ') : fmt(r.quotas)) },
      { label: 'Expires', render: (r) => when(r.expires_at) },
    ],
  },
  'limit-responses': {
    title: 'Limit responses',
    subtitle: 'The message, help link and retry hint clients get when a limit blocks them, per app scope.',
    path: '/controls/limit-responses',
    columns: [
      { label: 'Apps', render: (r) => (r.scope?.apps || []).join(', ') || 'every app' },
      { label: 'Message', render: (r) => fmt(r.message) },
      { label: 'Retry', render: (r) => fmt(r.retry) },
    ],
  },
};

const TABS = [
  ['rate-limits', 'Rate limits'],
  ['request-guards', 'Request guards'],
  ['model-limits', 'Model limits'],
  ['limit-exemptions', 'Exemptions'],
  ['limit-responses', 'Limit responses'],
  ['effective', 'Effective limits'],
];

export default function Limits() {
  const { client, urlParam, setParam } = usePlayground();
  const view = TABS.some(([id]) => id === urlParam('view')) ? urlParam('view') : 'rate-limits';
  if (!client) return <ConnectFirst what="manage rate limits, request guards and temporary raises" />;
  return (
    <div className={styles.stack}>
      <p className={styles.noticeInline}>
        Limits apply while the Policy Engine is on for the LLM Gateway. Counters are shared by every gateway in a region,
        so usage is per region. Each write publishes one policy revision; temporary raises do not.
      </p>
      <Tabs label="Limits area" value={view} onChange={(v) => setParam('view', v)} tabs={TABS} />
      {view === 'rate-limits' && (
        <ControlCollection key={view} config={COLLECTIONS[view]} extra={(id, resource) => <RateLimitExtras id={id} resource={resource} />} />
      )}
      {COLLECTIONS[view] && view !== 'rate-limits' && <ControlCollection key={view} config={COLLECTIONS[view]} />}
      {view === 'effective' && <Effective />}
    </div>
  );
}

function RateLimitExtras({ id, resource }) {
  const { client } = usePlayground();
  const open = useOpen();
  const [usage, setUsage] = useState(null);
  const [grants, setGrants] = useState(null);
  const action = useAction();
  const base = `${MANAGEMENT_PREFIX}/controls/rate-limits/${seg(id)}`;
  const adjustable = !!resource?.adjustments;
  return (
    <div className={styles.subPanel}>
      <div className={styles.cardHead}>
        <h3>Usage and temporary raises</h3>
        <ApiChips
          calls={[
            ['GET', '/controls/rate-limits/{resource_id}/usage'],
            ['GET', '/controls/rate-limits/{resource_id}/grants'],
            ['POST', '/controls/rate-limits/{resource_id}/grants'],
            ['DELETE', '/controls/rate-limits/{resource_id}/grants/{grant_id}'],
          ]}
        />
      </div>
      <div className={styles.inline}>
        <Btn
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ path: `${base}/usage`, query: { top: 20 }, source: 'Rate limit usage' });
              setUsage(res);
              return res;
            })
          }
        >
          <RefreshCw size={13} aria-hidden /> Busiest buckets
        </Btn>
        <Btn
          onClick={() =>
            action.run(async () => {
              const res = await client.call({ path: `${base}/grants`, source: 'Rate limit grants' });
              setGrants(res);
              return res;
            })
          }
        >
          <RefreshCw size={13} aria-hidden /> Grants
        </Btn>
        <Btn
          variant="primary"
          disabled={!adjustable}
          title={adjustable ? undefined : 'Add adjustments (a ceiling) to this rate limit before it takes grants'}
          onClick={() =>
            open('POST', '/controls/rate-limits/{resource_id}/grants', {
              pathParams: { resource_id: id },
              body: {
                subject: subjectTemplate(resource?.group_by),
                extra: Math.max(1, Math.round((resource?.limit || 10) / 2)),
                expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace(/\.\d+Z$/, 'Z'),
                reason: 'Temporary raise',
              },
            })
          }
        >
          <Plus size={13} aria-hidden /> Grant a raise
        </Btn>
      </div>
      {!adjustable && <p className={styles.muted}>This rate limit has no adjustments, so it takes no grants (409 rate_limit_not_adjustable).</p>}
      <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
      {usage && (
        <>
          <KeyValue
            items={[
              ['Counted', `${fmt(usage.metric)} per ${(usage.group_by || []).join(', ') || 'tenant'}`],
              ['Counter scope', fmt(usage.scope)],
              ['Observed', when(usage.observed_at)],
            ]}
          />
          <JsonView value={usage.buckets} maxHeight={260} />
        </>
      )}
      {grants && (
        <Table
          rows={grants.items || []}
          rowKey={(g) => g.id}
          empty="No grants."
          columns={[
            { label: 'Subject', render: (g) => fmt(g.subject) },
            { label: 'Limit', render: (g) => fmt(g.limit) },
            { label: 'Until', render: (g) => when(g.expires_at) },
            { label: 'Status', render: (g) => <Pill tone={g.status === 'active' ? 'ok' : 'off'}>{fmt(g.status)}</Pill> },
            {
              label: '',
              render: (g) =>
                g.status === 'active' ? (
                  <Btn
                    variant="danger"
                    onClick={() =>
                      open('DELETE', '/controls/rate-limits/{resource_id}/grants/{grant_id}', {
                        pathParams: { resource_id: id, grant_id: g.id },
                        query: { reason: 'Ended early' },
                        headers: { 'If-Match': g.etag },
                      })
                    }
                  >
                    Revoke
                  </Btn>
                ) : null,
            },
          ]}
        />
      )}
    </div>
  );
}

function Effective() {
  return (
    <LookupForm
      title="Effective limits"
      subtitle="Every rate limit, request guard and model limit that applies to an app, user and model, which one binds first, exemptions and grants, with live counters."
      path="/limits/effective"
      calls={[
        ['GET', '/limits/effective'],
        ['POST', '/controls/rate-limits:migrate-legacy'],
      ]}
      fields={[
        ['app', 'App', 'App name'],
        ['user', 'User', 'User email'],
        ['requested_model', 'Requested model', 'The model the client sends'],
        ['model', 'Served model', 'The model that serves it'],
        ['provider_label', 'Provider label', 'Optional'],
        ['include_usage', 'Include usage', 'Live counters (default true)', ['true', 'false']],
      ]}
      summary={(res) => (
        <KeyValue
          items={[
            ['Binding limit', fmt(res.tightest?.id || res.tightest?.quota_id || res.tightest)],
            ['Max tokens per request', fmt(res.tightest_tokens_per_request)],
            ['Rate limits', fmt((res.quotas || []).length)],
            ['Exemptions', fmt((res.exempt || []).length)],
            ['Grants', fmt((res.grants || []).length)],
            ['Unknown facts', (res.unknown_facts || []).join(', ') || '-'],
          ]}
        />
      )}
    />
  );
}
