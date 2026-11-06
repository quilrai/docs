import React, { useState } from 'react';
import { amount, split } from './BudgetEditor';
import {
  Panel,
  Field,
  Table,
  Json,
  JsonEditor,
  Badge,
  ErrorView,
  Freshness,
  useLoad,
  LoadState,
  format,
} from './ui';
import styles from './styles.module.css';

const RESOLVE_TEXT = {
  strongest:
    "Strongest: the person's best-ranked group's budget applies. Only that budget is checked and charged.",
  strictest:
    "Strictest: every group's budget applies; the tightest wins.",
};
const VIRTUAL = 'virtual:';
const bareName = (name) =>
  String(name || '').startsWith(VIRTUAL)
    ? `${String(name).slice(VIRTUAL.length)} (virtual)`
    : String(name || '');

function windowText(w) {
  if (!w || typeof w !== 'object') return format(w);
  if (w.kind === 'calendar' && w.unit) return `per calendar ${w.unit}`;
  if (w.kind === 'lifetime') return 'lifetime';
  return format(w);
}
const limitText = (value, metric) =>
  value == null ? '–' : `${metric === 'spend_usd' ? '$' : ''}${value}`;

/** Loads every smart group (for Strength); null when the key lacks read. */
async function loadRanks(api) {
  const ranks = new Map();
  let cursor;
  for (let page = 0; page < 20; page += 1) {
    const res = await api.listSmartGroups({ limit: 200, cursor });
    for (const g of res.items || [])
      ranks.set(String(g.group_name).toLowerCase(), g);
    cursor = res.next_cursor;
    if (!cursor) break;
  }
  return ranks;
}

function GroupName({ name, ranks }) {
  const group = ranks?.get(String(name).toLowerCase());
  return (
    <>
      <strong>{bareName(name)}</strong>{' '}
      {group && (
        <small>
          {group.rank == null
            ? 'Strength: off (disabled)'
            : `Strength #${group.rank} · Rank ${group.priority}`}
        </small>
      )}
    </>
  );
}

/** One group's budget amounts, joined from the budget inventory. */
function amountsOf(ids, byId) {
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((b) => `${limitText(b.base_limit, b.metric)} ${windowText(b.window)}`)
    .join(' + ');
}

export default function BudgetSets({
  api,
  run,
  version,
  budgets,
  canEditPolicy,
}) {
  const sets = useLoad(() => api.listSets(), [api, version]);
  const ranks = useLoad(
    () => loadRanks(api).catch(() => null),
    [api, version],
  );
  const [selected, setSelected] = useState('');
  const [creating, setCreating] = useState(false);
  const byId = new Map((budgets.data?.items || []).map((b) => [b.id, b]));
  const rows = sets.data?.items || [];
  return (
    <>
      <Panel
        title="Group budget sets"
        actions={
          <button
            type="button"
            disabled={!canEditPolicy}
            onClick={() => {
              setCreating(true);
              setSelected('');
            }}
          >
            Create budget set
          </button>
        }
      >
        <p className={styles.muted}>
          A set is one budget per smart group, for example $50 a month for
          employees and $500 for executives. It decides what happens to someone
          in several of its groups.
        </p>
        <ul className={styles.muted}>
          <li>{RESOLVE_TEXT.strongest}</li>
          <li>{RESOLVE_TEXT.strictest}</li>
        </ul>
        <p className={styles.muted}>
          Best-ranked means the lowest smart-group Rank number (Strength #1).
          Per-group budgets written before sets existed are listed as inferred
          strictest sets; nothing changes until you switch one.
        </p>
        <LoadState state={sets} />
        {ranks.data === null && !ranks.loading && (
          <p className={styles.notice}>
            Group strength is unavailable: reading smart groups needs the read
            scope.
          </p>
        )}
        <Table
          rows={rows}
          empty={sets.loading ? 'Loading…' : 'No group budget sets yet.'}
          columns={[
            {
              label: 'Set',
              render: (s) => (
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setSelected(s.id);
                    setCreating(false);
                  }}
                >
                  <strong>{s.label || s.id}</strong>
                  <small>{s.id}</small>
                </button>
              ),
            },
            {
              label: 'Groups and budgets',
              render: (s) =>
                (s.groups || []).map((g) => (
                  <div key={g.group}>
                    <GroupName name={g.group} ranks={ranks.data} />
                    <small>{amountsOf(g.budget_ids || [], byId) || '–'}</small>
                  </div>
                )),
            },
            {
              label: 'Resolve',
              render: (s) => <Badge>{s.resolve}</Badge>,
            },
            {
              label: 'Managed by',
              render: (s) => (
                <>
                  <Badge>
                    {s.managed_by === 'management_api' ? 'API' : 'Console'}
                  </Badge>
                  {s.inferred && (
                    <>
                      {' '}
                      <Badge state="alerting">Inferred</Badge>
                      <small>Legacy per-group budgets</small>
                    </>
                  )}
                </>
              ),
            },
            {
              label: 'Metric / per',
              render: (s) => (
                <>
                  {format(s.metric)}
                  <small>{s.per?.join(', ') || 'Shared budget'}</small>
                </>
              ),
            },
          ]}
        />
      </Panel>
      {creating && (
        <CreateSet
          api={api}
          run={run}
          ranks={ranks.data}
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            if (id) setSelected(id);
          }}
        />
      )}
      {selected && (
        <SetDetail
          key={selected}
          id={selected}
          api={api}
          run={run}
          version={version}
          byId={byId}
          ranks={ranks.data}
          canEditPolicy={canEditPolicy}
          onClose={() => setSelected('')}
        />
      )}
    </>
  );
}

/**
 * Dry run first, then publish the same request with the version captured at
 * preview time. Any input change discards the preview.
 */
function usePlan(run) {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  async function preview(op) {
    setError(null);
    setPlan(null);
    setBusy(true);
    try {
      const response = await op.call({ dryRun: true });
      setPlan({ ...op, response });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (!plan) return null;
    setBusy(true);
    try {
      const result = await run(() => plan.call({}), plan.message);
      if (result) setPlan(null);
      return result;
    } finally {
      setBusy(false);
    }
  }
  return {
    plan,
    error,
    busy,
    preview,
    publish,
    fail: (e) => {
      setPlan(null);
      setError(e);
    },
    clear: () => {
      setPlan(null);
      setError(null);
    },
  };
}

function PlanPreview({ planner, onPublished }) {
  const { plan, busy } = planner;
  if (!plan) return null;
  const response = plan.response || {};
  return (
    <section className={styles.notice}>
      <h3>{plan.title}</h3>
      <p>
        Publishing sends this exact request with the version captured now.
        Editing any field discards the preview.
      </p>
      <pre className={styles.json}>{response.diff || 'No source changes.'}</pre>
      {response.not_simulated?.group_sets_changed?.length > 0 && (
        <p className={styles.muted}>
          Impact is not simulated for changed sets (
          {response.not_simulated.group_sets_changed.join(', ')}): usage per
          bucket cannot show which people a switch newly blocks.
        </p>
      )}
      {response.impact && (
        <>
          <h3>Impact on current usage</h3>
          <Freshness data={response.impact} />
          <Json value={response.impact} />
        </>
      )}
      <details>
        <summary>Diagnostics and full preview</summary>
        <Json value={response} />
      </details>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          disabled={response.would_publish === false || busy}
          onClick={async () => {
            const result = await planner.publish();
            if (result) onPublished?.(result, plan);
          }}
        >
          {busy ? 'Working…' : plan.publishLabel || 'Publish'}
        </button>
        <button type="button" disabled={busy} onClick={planner.clear}>
          Discard preview
        </button>
      </div>
    </section>
  );
}

function SetDetail({
  id,
  api,
  run,
  version,
  byId,
  ranks,
  canEditPolicy,
  onClose,
}) {
  const state = useLoad(() => api.getSet(id), [api, id, version]);
  const planner = usePlan(run);
  const [resolve, setResolve] = useState('');
  const [addGroup, setAddGroup] = useState({ group: '', limit: '' });
  const set = state.data?.set;
  const etag = state.data?.etag || set?.etag;
  const members = state.data?.budgets || [];
  const recordOf = (budgetId) =>
    members.find((b) => b.id === budgetId) || byId.get(budgetId);
  const nextResolve =
    resolve || (set?.resolve === 'strongest' ? 'strictest' : 'strongest');
  const editable = canEditPolicy && !!set;
  const structural = editable && set.managed;

  function guard(fn) {
    return () => {
      try {
        return fn();
      } catch (e) {
        return planner.fail(e);
      }
    };
  }

  return (
    <Panel
      title={`Budget set · ${set?.label || id}`}
      actions={
        <div className={styles.actions}>
          <button
            type="button"
            disabled={planner.busy}
            onClick={() => {
              planner.clear();
              state.reload();
            }}
          >
            Reload set
          </button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <LoadState state={state} />
      {set && (
        <>
          <div className={styles.toolbar}>
            <Badge>{set.resolve}</Badge>
            <Badge>
              {set.managed_by === 'management_api'
                ? 'Managed by API'
                : 'Written in the console'}
            </Badge>
            {set.inferred && <Badge state="alerting">Inferred</Badge>}
            <span className={styles.muted}>
              {set.id} · {set.metric} · version {etag}
            </span>
          </div>
          <p className={styles.muted}>{RESOLVE_TEXT[set.resolve]}</p>
          {set.inferred && (
            <p className={styles.notice}>
              Inferred from per-group budgets written before sets existed. It
              behaves as strictest. Switching writes an explicit set with the
              same id and keeps the counters.
            </p>
          )}
          {set.managed_by === 'management_api' && (
            <p className={styles.muted}>
              Created through the API: the console shows it read-only, so edit
              it here or through the API.
            </p>
          )}
          <Table
            rows={(set.groups || []).flatMap((g) =>
              (g.budget_ids || []).map((budgetId) => ({
                id: budgetId,
                group: g.group,
                budget: recordOf(budgetId),
              })),
            )}
            columns={[
              {
                label: 'Group',
                render: (r) => <GroupName name={r.group} ranks={ranks} />,
              },
              {
                label: 'Budget',
                render: (r) => (
                  <>
                    <strong>{r.budget?.label || r.id}</strong>
                    <small>{r.id}</small>
                  </>
                ),
              },
              {
                label: 'Limit / window',
                render: (r) => (
                  <>
                    <strong>
                      {limitText(r.budget?.base_limit, r.budget?.metric)}
                    </strong>
                    <small>{windowText(r.budget?.window)}</small>
                  </>
                ),
              },
              {
                label: 'Mode',
                render: (r) => format(r.budget?.mode),
              },
              {
                label: '',
                render: (r) =>
                  structural && (
                    <button
                      type="button"
                      disabled={planner.busy}
                      onClick={() =>
                        planner.preview({
                          title: `Remove ${bareName(r.group)} from the set`,
                          publishLabel: 'Publish removal',
                          message: `Removed ${r.group} from ${set.id}.`,
                          call: (options) =>
                            api.removeSetGroup(set.id, r.group, {
                              ...options,
                              etag,
                            }),
                        })
                      }
                    >
                      Preview remove group
                    </button>
                  ),
              },
            ]}
          />
          {!canEditPolicy && (
            <p className={styles.notice}>
              Changing a set requires budgets:policy.
            </p>
          )}
          {editable && (
            <>
              <div className={styles.grid}>
                <Field
                  label="Resolve"
                  hint="Switching keeps every counter and grant."
                >
                  <select
                    value={nextResolve}
                    onChange={(e) => {
                      setResolve(e.target.value);
                      planner.clear();
                    }}
                  >
                    <option value="strongest">
                      strongest: best-ranked group&apos;s budget
                    </option>
                    <option value="strictest">
                      strictest: every group&apos;s budget
                    </option>
                  </select>
                </Field>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  disabled={planner.busy || nextResolve === set.resolve}
                  onClick={() =>
                    planner.preview({
                      title: `Switch to ${nextResolve}`,
                      publishLabel: `Publish switch to ${nextResolve}`,
                      message: `Set ${set.id} now resolves ${nextResolve}.`,
                      call: (options) =>
                        api.patchSet(
                          set.id,
                          { resolve: nextResolve },
                          { ...options, etag },
                        ),
                    })
                  }
                >
                  Preview switch
                </button>
              </div>
              {structural ? (
                <>
                  <h3>Add a group</h3>
                  <div className={styles.grid}>
                    <Field
                      label="Smart group"
                      hint="Full name; virtual groups start with virtual:."
                    >
                      <input
                        list={`set-groups-${set.id}`}
                        value={addGroup.group}
                        onChange={(e) => {
                          setAddGroup({ ...addGroup, group: e.target.value });
                          planner.clear();
                        }}
                      />
                      <datalist id={`set-groups-${set.id}`}>
                        {[...(ranks?.values() || [])].map((g) => (
                          <option key={g.group_name} value={g.group_name} />
                        ))}
                      </datalist>
                    </Field>
                    <Field
                      label="Limit"
                      hint="Empty: the first group's limit. Copies every window."
                    >
                      <input
                        inputMode="decimal"
                        value={addGroup.limit}
                        onChange={(e) => {
                          setAddGroup({ ...addGroup, limit: e.target.value });
                          planner.clear();
                        }}
                      />
                    </Field>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      disabled={planner.busy || !addGroup.group.trim()}
                      onClick={guard(() => {
                        const body = { group: addGroup.group.trim() };
                        if (addGroup.limit.trim())
                          body.limit = amount(addGroup.limit.trim(), set.metric);
                        return planner.preview({
                          title: `Add ${bareName(body.group)} to the set`,
                          publishLabel: 'Publish new group',
                          message: `Added ${body.group} to ${set.id}.`,
                          call: (options) =>
                            api.addSetGroup(set.id, body, { ...options, etag }),
                        });
                      })}
                    >
                      Preview add group
                    </button>
                    <button
                      type="button"
                      disabled={planner.busy}
                      onClick={() =>
                        planner.preview({
                          title: 'Delete the set and all its budgets',
                          publishLabel: 'Publish deletion',
                          message: `Deleted budget set ${set.id}.`,
                          delete: true,
                          call: (options) =>
                            api.deleteSet(set.id, { ...options, etag }),
                        })
                      }
                    >
                      Preview delete set
                    </button>
                  </div>
                </>
              ) : (
                <p className={styles.muted}>
                  This set was written in the console: this API can switch how
                  it resolves, but its groups are added, removed or deleted in
                  the console.
                </p>
              )}
            </>
          )}
          <ErrorView error={planner.error} />
          <PlanPreview
            planner={planner}
            onPublished={(result, done) => {
              // Deleting the set, or removing its last group, leaves no set.
              if (done.delete || ('set' in result && !result.set)) onClose();
            }}
          />
          <details>
            <summary>Raw set</summary>
            <Json value={set} />
          </details>
        </>
      )}
    </Panel>
  );
}

const blank = {
  label: '',
  id: '',
  metric: 'spend_usd',
  limit: '50.00',
  window: '{"kind":"calendar","unit":"month"}',
  per: 'user.email',
  mode: 'enforce',
  apps: '',
  groups: '',
  resolve: 'strongest',
};

/** "executives = 500.00" gives that group its own limit. */
function parseGroups(text, metric) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [group, limit] = line.split('=').map((v) => v.trim());
      return limit ? { group, limit: amount(limit, metric) } : group;
    });
}

function CreateSet({ api, run, ranks, onClose, onCreated }) {
  const [draft, setDraft] = useState(blank);
  const planner = usePlan(run);
  const change = (name, value) => {
    setDraft((d) => ({ ...d, [name]: value }));
    planner.clear();
  };
  function body() {
    const groups = parseGroups(draft.groups, draft.metric);
    if (!groups.length) throw new Error('List at least one smart group.');
    const apps = split(draft.apps);
    return {
      label: draft.label.trim(),
      ...(draft.id.trim() ? { id: draft.id.trim() } : {}),
      metric: draft.metric,
      limit: amount(draft.limit.trim(), draft.metric),
      window: JSON.parse(draft.window),
      per: split(draft.per),
      mode: draft.mode,
      ...(apps.length ? { applies_to: { apps } } : {}),
      groups,
      resolve: draft.resolve,
    };
  }
  return (
    <Panel
      title="Create a group budget set"
      actions={
        <button type="button" onClick={onClose}>
          Close
        </button>
      }
    >
      <p className={styles.muted}>
        Creates one API-managed budget per group, labelled “label · group”, and
        publishes one policy revision. Sets created here are edited only
        through the API; the console shows them read-only.
      </p>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          let payload;
          try {
            payload = body();
          } catch (err) {
            planner.fail(err);
            return;
          }
          planner.preview({
            title: 'New budget set',
            publishLabel: 'Publish budget set',
            message: `Created budget set ${payload.label}.`,
            call: (options) => api.createSet(payload, options),
          });
        }}
      >
        <div className={styles.grid}>
          <Field label="Label">
            <input
              required
              maxLength="100"
              value={draft.label}
              onChange={(e) => change('label', e.target.value)}
              placeholder="Monthly AI spend"
            />
          </Field>
          <Field label="Set ID" hint="Optional; default set_<12 hex>.">
            <input
              maxLength="128"
              value={draft.id}
              onChange={(e) => change('id', e.target.value)}
            />
          </Field>
          <Field label="Metric">
            <select
              value={draft.metric}
              onChange={(e) => change('metric', e.target.value)}
            >
              {[
                'spend_usd',
                'requests',
                'total_tokens',
                'input_tokens',
                'output_tokens',
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Default limit" hint="Used by groups without their own.">
            <input
              required
              inputMode="decimal"
              value={draft.limit}
              onChange={(e) => change('limit', e.target.value)}
            />
          </Field>
          <Field label="Mode">
            <select
              value={draft.mode}
              onChange={(e) => change('mode', e.target.value)}
            >
              {['enforce', 'alert', 'paused'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Per dimensions"
            hint="Comma-separated; empty for one shared budget per group."
          >
            <input
              value={draft.per}
              onChange={(e) => change('per', e.target.value)}
            />
          </Field>
          <Field label="App scope" hint="Comma-separated; empty for all apps.">
            <input
              value={draft.apps}
              onChange={(e) => change('apps', e.target.value)}
            />
          </Field>
          <Field label="Resolve">
            <select
              value={draft.resolve}
              onChange={(e) => change('resolve', e.target.value)}
            >
              <option value="strongest">
                strongest: best-ranked group&apos;s budget (default)
              </option>
              <option value="strictest">
                strictest: every group&apos;s budget
              </option>
            </select>
          </Field>
        </div>
        <p className={styles.muted}>{RESOLVE_TEXT[draft.resolve]}</p>
        <JsonEditor
          label="Window (JSON)"
          rows={2}
          value={draft.window}
          onChange={(v) => change('window', v)}
        />
        <Field
          label="Groups"
          hint="One smart group per line (1 to 32). Add “= limit” to give a group its own limit, e.g. executives = 500.00."
        >
          <textarea
            rows={4}
            value={draft.groups}
            onChange={(e) => change('groups', e.target.value)}
            placeholder={'employees\nexecutives = 500.00'}
          />
        </Field>
        {ranks && ranks.size > 0 && (
          <small className={styles.muted}>
            Groups by strength:{' '}
            {[...ranks.values()]
              .filter((g) => g.rank != null)
              .sort((a, b) => a.rank - b.rank)
              .map((g) => `#${g.rank} ${g.group_name}`)
              .join(', ')}
          </small>
        )}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primary}
            disabled={planner.busy || !draft.label.trim()}
          >
            {planner.busy ? 'Preparing preview…' : 'Preview budget set'}
          </button>
        </div>
      </form>
      <ErrorView error={planner.error} />
      <PlanPreview
        planner={planner}
        onPublished={(result) => onCreated(result?.set?.id)}
      />
    </Panel>
  );
}
