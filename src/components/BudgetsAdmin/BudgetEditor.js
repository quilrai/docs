import React, { useEffect, useRef, useState } from 'react';
import {
  Panel,
  Field,
  Json,
  JsonEditor,
  MutationForm,
  ErrorView,
  Freshness,
  useLoad,
  LoadState,
  pretty,
} from './ui';
import styles from './styles.module.css';

const initial = {
  label: '',
  limit: '25.00',
  mode: 'enforce',
  missingId: 'skip',
  alerts: '80, 100',
  adjustable: true,
  ceiling: '100.00',
  maxDuration: '90d',
  overflow: '10',
  requestable: false,
  autoApprove: 'null',
  autoRaise: false,
  autoAddPct: '',
  autoMaxCount: '1',
  autoAtPct: '',
  autoGroups: '',
  id: '',
  metric: 'spend_usd',
  window: '{"kind":"calendar","unit":"month"}',
  per: 'user.email',
  apps: '',
  groups: '',
};
export const split = (value) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
const PER_ALIASES = [
  ['conversation', 'request.metadata.conversation_id', 'x-conversation-id'],
  ['agent', 'request.metadata.agent_id', 'x-quilr-agent-id'],
  ['agent_run', 'request.metadata.agent_run_id', 'x-quilr-agent-run-id'],
];
// Whether a per list counts by a conversation / agent / agent run id.
export const countsById = (per) =>
  (per || []).some((v) => PER_ALIASES.some(([alias, field]) => v === alias || v === field));
function wholeNumber(value, name, min, max) {
  const n = Number(value);
  if (!/^\d+$/.test(String(value).trim()) || n < min || n > max)
    throw new Error(`${name} must be a whole number from ${min} to ${max}.`);
  return n;
}
function windowKind(text) {
  try {
    return JSON.parse(text)?.kind;
  } catch {
    return undefined;
  }
}
export function amount(value, metric) {
  if (metric === 'spend_usd') {
    if (!/^\d+(\.\d{1,6})?$/.test(value))
      throw new Error(
        'USD amounts require a nonnegative decimal with up to six decimal places.',
      );
    return value;
  }
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
    throw new Error(
      'Requests and token amounts require a nonnegative safe integer.',
    );
  return Number(value);
}

export default function BudgetEditor({
  api,
  id,
  run,
  version,
  onClose,
  canEditPolicy = false,
}) {
  const state = useLoad(
    () => (id ? api.getBudget(id) : Promise.resolve(null)),
    [api, id],
  );
  const [draft, setDraft] = useState(initial);
  const previewGeneration = useRef(0);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const budget = state.data?.budget;
  const etag = state.data?.etag || budget?.etag;
  useEffect(() => {
    if (!budget) return;
    previewGeneration.current += 1;
    setDraft({
      ...initial,
      label: budget.label || '',
      limit: String(budget.base_limit),
      mode: budget.mode || 'enforce',
      missingId: budget.missing_id || 'skip',
      alerts: (budget.alerts || []).map((a) => a.at_pct).join(', '),
      adjustable: !!budget.adjustments,
      ceiling: String(budget.adjustments?.ceiling ?? budget.base_limit),
      maxDuration: budget.adjustments?.max_duration || '366d',
      overflow: String(budget.adjustments?.overflow?.add_pct || ''),
      requestable: budget.adjustments?.requestable || false,
      autoApprove: pretty(budget.adjustments?.auto_approve || null),
      autoRaise: budget.adjustments?.auto_raise?.enabled === true,
      autoAddPct: String(budget.adjustments?.auto_raise?.add_pct ?? ''),
      autoMaxCount: String(budget.adjustments?.auto_raise?.max_count ?? 1),
      autoAtPct: String(budget.adjustments?.auto_raise?.at_pct ?? ''),
      autoGroups: (budget.adjustments?.auto_raise?.smart_groups || []).join(
        ', ',
      ),
      metric: budget.metric,
    });
    setPreview(null);
  }, [budget]);
  const change = (name, value) => {
    previewGeneration.current += 1;
    setDraft((v) => ({ ...v, [name]: value }));
    setPreview(null);
    setError(null);
    setDeleting(false);
  };
  function body() {
    const metric = id ? budget.metric : draft.metric;
    const thresholds = split(draft.alerts).map(Number);
    if (
      thresholds.some((v) => !Number.isInteger(v) || v < 1 || v > 100) ||
      thresholds.length > 5
    )
      throw new Error(
        'Alerts must contain up to five whole percentages from 1 to 100.',
      );
    const adjustment = draft.adjustable
      ? {
          ...(budget?.adjustments || {}),
          ceiling: amount(draft.ceiling, metric),
          max_duration: draft.maxDuration,
          requestable: draft.requestable,
        }
      : null;
    if (adjustment) {
      delete adjustment.overflow;
      delete adjustment.auto_approve;
      if (draft.overflow) {
        const pct = Number(draft.overflow);
        if (!Number.isInteger(pct) || pct < 1 || pct > 1000)
          throw new Error(
            'Overflow percentage must be a whole number from 1 to 1000.',
          );
        adjustment.overflow = { add_pct: pct };
      }
      const auto = JSON.parse(draft.autoApprove);
      if (auto) adjustment.auto_approve = auto;
      delete adjustment.auto_raise;
      // Keep a disabled configuration (enabled false) so it can be re-enabled.
      if (draft.autoRaise || draft.autoAddPct.trim()) {
        if (!draft.autoAddPct.trim())
          throw new Error('Automatic raises need a raise percentage.');
        const groups = split(draft.autoGroups);
        if (groups.length > 32)
          throw new Error('Automatic raises accept up to 32 Smart groups.');
        adjustment.auto_raise = {
          enabled: draft.autoRaise,
          add_pct: wholeNumber(draft.autoAddPct, 'Raise percentage', 1, 1000),
          max_count: wholeNumber(
            draft.autoMaxCount || '1',
            'Raises per window',
            1,
            100,
          ),
          ...(draft.autoAtPct.trim()
            ? {
                at_pct: wholeNumber(draft.autoAtPct, 'Raise at percent', 1, 100),
              }
            : {}),
          ...(groups.length ? { smart_groups: groups } : {}),
        };
      }
    }
    const output = {
      label: draft.label || null,
      limit: amount(draft.limit, metric),
      mode: draft.mode,
      alerts: thresholds.map((at_pct) => ({ at_pct })),
      adjustments: adjustment,
    };
    if (countsById(id ? budget?.per : split(draft.per))) {
      output.missing_id = draft.missingId;
    }
    if (!id) {
      Object.assign(output, {
        ...(draft.id ? { id: draft.id } : {}),
        metric,
        window: JSON.parse(draft.window),
        per: split(draft.per),
        applies_to: {
          apps: split(draft.apps),
          smart_groups: split(draft.groups),
        },
      });
    }
    return output;
  }
  async function dryRun(remove = false) {
    if (!canEditPolicy) return;
    const generation = ++previewGeneration.current;
    setError(null);
    setPreview(null);
    setBusy(true);
    try {
      const payload = remove ? null : body();
      const response = id
        ? remove
          ? await api.deleteBudget(id, { etag, dryRun: true })
          : await api.patchBudget(id, payload, { etag, dryRun: true })
        : await api.createBudget(payload, { dryRun: true });
      if (generation !== previewGeneration.current) return;
      setDeleting(remove);
      setPreview({ response, payload, etag });
    } catch (e) {
      if (generation === previewGeneration.current) setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (!canEditPolicy) return;
    const result = await run(
      () =>
        id
          ? deleting
            ? api.deleteBudget(id, { etag: preview.etag })
            : api.patchBudget(id, preview.payload, { etag: preview.etag })
          : api.createBudget(preview.payload),
      deleting ? 'Budget deleted.' : 'Budget policy published.',
    );
    if (result) {
      setPreview(null);
      if (deleting || !id) onClose();
      else state.reload();
    }
  }
  const canEdit = canEditPolicy && (!id || !!budget);
  const kind = id ? budget?.window?.kind : windowKind(draft.window);
  const unlimited = draft.maxDuration === 'unlimited';
  const addPer = (alias) => {
    const current = split(draft.per);
    if (!current.includes(alias)) change('per', [...current, alias].join(', '));
  };
  return (
    <Panel
      title={
        id
          ? `${canEditPolicy ? 'Edit' : 'View'} budget · ${id}`
          : 'Create API-managed budget'
      }
      actions={
        <div className={styles.actions}>
          {id && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                previewGeneration.current += 1;
                setPreview(null);
                state.reload();
              }}
            >
              Reload budget & reset draft
            </button>
          )}
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      {id && <LoadState state={state} />}
      <ErrorView error={error} />
      {!canEditPolicy && (
        <>
          <p className={styles.notice}>
            This management key cannot edit budget policy.
          </p>
          {budget && <Json value={budget} />}
        </>
      )}
      {canEdit && (
        <>
          <p className={styles.muted}>
            {id
              ? `Changes publish a policy revision. Version: ${etag}. Identity fields cannot change.`
              : 'Creates an API-managed budget and publishes a policy revision. Spend is in USD; token and request limits are whole numbers.'}
          </p>
          <MutationForm
            onSubmit={() => dryRun(false)}
            submitLabel={busy ? 'Preparing preview…' : 'Preview policy change'}
            disabled={busy}
          >
            <div className={styles.grid}>
              <Field label="Label">
                <input
                  maxLength="120"
                  value={draft.label}
                  onChange={(e) => change('label', e.target.value)}
                />
              </Field>
              <Field label="Base limit">
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
              {countsById(id ? budget?.per : split(draft.per)) && (
                <Field
                  label="Requests without an id"
                  hint="skip: not counted. refuse: 400 quota_id_required, listing the accepted ids."
                >
                  <select
                    value={draft.missingId}
                    onChange={(e) => change('missingId', e.target.value)}
                  >
                    {['skip', 'refuse'].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field
                label="Alert thresholds (%)"
                hint="Comma-separated, up to five thresholds."
              >
                <input
                  value={draft.alerts}
                  onChange={(e) => change('alerts', e.target.value)}
                />
              </Field>
            </div>
            {!id && (
              <>
                <div className={styles.grid}>
                  <Field label="Budget ID">
                    <input
                      required
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
                  <Field
                    label="Per dimensions"
                    hint="Comma-separated; empty for shared budget."
                  >
                    <input
                      value={draft.per}
                      onChange={(e) => change('per', e.target.value)}
                    />
                  </Field>
                </div>
                <div className={styles.toolbar}>
                  <span className={styles.muted}>Count per:</span>
                  {PER_ALIASES.map(([alias]) => (
                    <button
                      type="button"
                      key={alias}
                      disabled={split(draft.per).includes(alias)}
                      onClick={() => addPer(alias)}
                    >
                      + {alias}
                    </button>
                  ))}
                </div>
                <small className={styles.muted}>
                  Per-conversation and per-agent caps count the id the caller
                  sends:{' '}
                  {PER_ALIASES.map(([alias, field, header], i) => (
                    <React.Fragment key={alias}>
                      {i ? '; ' : ''}
                      {alias} = {field} (header {header})
                    </React.Fragment>
                  ))}
                  . Body metadata.conversation_id, metadata.agent_id and
                  metadata.agent_run_id also work. Without one, the session and
                  agent ids that Claude Code, Codex, OpenCode, Copilot Studio
                  and other clients send count. Requests with no id are not
                  counted, or refused when missing_id is refuse. Lifetime windows ({'{"kind":"lifetime"}'}) suit
                  conversations and agent runs; keep user.email beside the id
                  so two callers that reuse an id do not share a counter.
                </small>
                <JsonEditor
                  label="Window (JSON)"
                  rows={3}
                  value={draft.window}
                  onChange={(v) => change('window', v)}
                />
                <div className={styles.grid}>
                  <Field
                    label="App scope"
                    hint="Comma-separated app names; empty for all apps."
                  >
                    <input
                      value={draft.apps}
                      onChange={(e) => change('apps', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Smart group scope"
                    hint="Comma-separated group names."
                  >
                    <input
                      value={draft.groups}
                      onChange={(e) => change('groups', e.target.value)}
                    />
                  </Field>
                </div>
              </>
            )}
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={draft.adjustable}
                onChange={(e) => change('adjustable', e.target.checked)}
              />
              Allow time-boxed adjustments
            </label>
            {draft.adjustable && (
              <>
                <div className={styles.grid}>
                  <Field label="Adjustment ceiling">
                    <input
                      required
                      value={draft.ceiling}
                      onChange={(e) => change('ceiling', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Maximum grant duration"
                    hint="1h through 366d, for example 90d, or unlimited."
                  >
                    <input
                      required
                      pattern="[0-9]+[hd]|unlimited"
                      disabled={unlimited}
                      value={draft.maxDuration}
                      onChange={(e) => change('maxDuration', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Overflow (%)"
                    hint="Empty to disable; extends the hard stop."
                  >
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={draft.overflow}
                      onChange={(e) => change('overflow', e.target.value)}
                    />
                  </Field>
                </div>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={unlimited}
                    onChange={(e) =>
                      change('maxDuration', e.target.checked ? 'unlimited' : '366d')
                    }
                  />
                  Allow grants with no end date (maximum duration unlimited)
                </label>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={draft.requestable}
                    onChange={(e) => change('requestable', e.target.checked)}
                  />
                  Requestable (reserved for future self-service)
                </label>
                <fieldset className={styles.fieldset}>
                  <legend>Automatic raises</legend>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={draft.autoRaise}
                      onChange={(e) => change('autoRaise', e.target.checked)}
                    />
                    Raise the limit automatically
                  </label>
                  {kind && kind !== 'calendar' && (
                    <p className={styles.notice}>
                      Automatic raises apply only to calendar windows. This
                      budget's window is {kind}.
                    </p>
                  )}
                  <div className={styles.grid}>
                    <Field
                      label="Raise by (% of base)"
                      hint="Each raise adds this percent of the base limit, never above the ceiling."
                    >
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={draft.autoAddPct}
                        onChange={(e) => change('autoAddPct', e.target.value)}
                      />
                    </Field>
                    <Field label="Raises per window" hint="Per subject; 1 to 100.">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={draft.autoMaxCount}
                        onChange={(e) => change('autoMaxCount', e.target.value)}
                      />
                    </Field>
                    <Field
                      label="Raise at (% used, optional)"
                      hint="Empty: raise when the limit is reached; the refused request is then admitted."
                    >
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={draft.autoAtPct}
                        onChange={(e) => change('autoAtPct', e.target.value)}
                      />
                    </Field>
                    <Field
                      label="Only these Smart groups (optional)"
                      hint="Comma-separated, up to 32. Empty: everyone."
                    >
                      <input
                        value={draft.autoGroups}
                        onChange={(e) => change('autoGroups', e.target.value)}
                      />
                    </Field>
                  </div>
                  <small className={styles.muted}>
                    Calendar windows only. Each raise is a grant with source
                    auto that ends at the window reset. Automatic raises
                    supersede only earlier automatic ones, so an admin grant
                    applies again at the reset, and a subject whose limit an
                    admin lowered is never raised. Clear the percentage and
                    untick to remove the rule.
                  </small>
                </fieldset>
                <JsonEditor
                  label="Auto-approve rules (JSON or null)"
                  rows={4}
                  value={draft.autoApprove}
                  onChange={(v) => change('autoApprove', v)}
                />
                <small className={styles.muted}>
                  Example:{' '}
                  {`{"up_to_pct":25,"max_count":2,"per":"month","smart_groups":[]}`}
                  . Self-service requests and approval execution are deferred by
                  the API.
                </small>
              </>
            )}
          </MutationForm>
          {id && (
            <div className={styles.actions}>
              <button
                type="button"
                disabled={!budget.managed || busy}
                onClick={() => dryRun(true)}
              >
                Preview delete budget
              </button>
              <small className={styles.muted}>
                {budget.managed
                  ? 'Deleting publishes a policy revision.'
                  : 'Only API-managed budgets can be deleted.'}
              </small>
            </div>
          )}
          {preview && (
            <section className={styles.notice}>
              <h3>{deleting ? 'Deletion preview' : 'Policy preview'}</h3>
              <p>
                Publishing uses this exact request and its captured version. Any
                field edit invalidates the preview.
              </p>
              <pre className={styles.json}>
                {preview.response.diff || 'No source changes.'}
              </pre>
              <h3>Impact on current usage</h3>
              <Freshness data={preview.response.impact} />
              <Json
                value={
                  preview.response.impact ?? {
                    note: 'Impact is unavailable for this operation.',
                  }
                }
              />
              <details>
                <summary>Diagnostics and full preview</summary>
                <Json value={preview.response} />
              </details>
              <button
                type="button"
                className={styles.primary}
                disabled={!preview.response.would_publish || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await publish();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {deleting ? 'Publish deletion' : 'Publish policy change'}
              </button>
            </section>
          )}
        </>
      )}
    </Panel>
  );
}
