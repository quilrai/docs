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
  alerts: '80, 100',
  adjustable: true,
  ceiling: '100.00',
  maxDuration: '90d',
  overflow: '10',
  requestable: false,
  autoApprove: 'null',
  id: '',
  metric: 'spend_usd',
  window: '{"kind":"calendar","unit":"month"}',
  per: 'user.email',
  apps: '',
  groups: '',
};
const split = (value) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
function amount(value, metric) {
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
      alerts: (budget.alerts || []).map((a) => a.at_pct).join(', '),
      adjustable: !!budget.adjustments,
      ceiling: String(budget.adjustments?.ceiling ?? budget.base_limit),
      maxDuration: budget.adjustments?.max_duration || '366d',
      overflow: String(budget.adjustments?.overflow?.add_pct || ''),
      requestable: budget.adjustments?.requestable || false,
      autoApprove: pretty(budget.adjustments?.auto_approve || null),
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
    }
    const output = {
      label: draft.label || null,
      limit: amount(draft.limit, metric),
      mode: draft.mode,
      alerts: thresholds.map((at_pct) => ({ at_pct })),
      adjustments: adjustment,
    };
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
              : 'Creates a budget in quilr_managed_budgets. Each scope creates a managed rule. Spend is in USD; token and request limits are whole numbers.'}
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
                    hint="1h through 366d; for example 90d."
                  >
                    <input
                      required
                      pattern="[0-9]+[hd]"
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
                    checked={draft.requestable}
                    onChange={(e) => change('requestable', e.target.checked)}
                  />
                  Requestable (reserved for future self-service)
                </label>
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
