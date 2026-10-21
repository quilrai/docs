import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  ErrorView,
  Field,
  Freshness,
  Json,
  JsonEditor,
  LoadState,
  MutationForm,
  Panel,
  Table,
  format,
  pretty,
  useLoad,
} from './ui';
import styles from './styles.module.css';

const words = (text) =>
  text
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
const dollars = (value) => (value == null ? 'Unpriced' : `$${value}`);
const rateText = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', {
        useGrouping: false,
        maximumSignificantDigits: 21,
      })
    : value;
const emptyRate = {
  provider: '',
  model: '',
  providerLabel: '',
  input: '',
  output: '',
  advanced: '{}',
};
const rateMeta = new Set([
  'provider',
  'model',
  'provider_label',
  'input_usd_per_1m',
  'output_usd_per_1m',
  'policy',
  'priority',
]);

function RateEditor({
  api,
  run,
  pricing,
  selection,
  onClose,
  canEditPolicy = false,
}) {
  const [form, setForm] = useState(emptyRate);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [readEtag, setReadEtag] = useState(pricing.etag);
  const generation = useRef(0);
  useEffect(() => {
    generation.current += 1;
    setReadEtag(selection?.etag || pricing.etag);
    setPreview(null);
    setError(null);
    if (!selection) {
      setForm(emptyRate);
      return;
    }
    const rate = selection.rate || selection;
    setForm({
      provider: selection.provider || '',
      model: selection.model || '',
      providerLabel: selection.provider_label || '',
      input: rate.input_usd_per_1m ?? selection.input_usd_per_1m ?? '',
      output: rate.output_usd_per_1m ?? selection.output_usd_per_1m ?? '',
      advanced: pretty(
        Object.fromEntries(
          Object.entries(selection.rate || {}).filter(
            ([key]) => !rateMeta.has(key),
          ),
        ),
      ),
    });
  }, [selection]);
  const change = (key, value) => {
    generation.current += 1;
    setForm((current) => ({ ...current, [key]: value }));
    setPreview(null);
    setError(null);
  };
  const makeBody = () => {
    const advanced = JSON.parse(form.advanced);
    if (!advanced || typeof advanced !== 'object' || Array.isArray(advanced))
      throw new Error('Advanced rate fields must be a JSON object.');
    const body = { ...advanced };
    if (form.input !== '') body.input_usd_per_1m = form.input;
    if (form.output !== '') body.output_usd_per_1m = form.output;
    if (form.providerLabel.trim())
      body.provider_label = form.providerLabel.trim();
    return body;
  };
  const check = async () => {
    if (!canEditPolicy) return;
    const requestGeneration = ++generation.current;
    setBusy(true);
    setError(null);
    try {
      const body = makeBody();
      const provider = form.provider.trim();
      const model = form.model.trim();
      const etag = readEtag;
      const result = await api.putRate(provider, model, body, {
        etag,
        dryRun: true,
      });
      if (generation.current === requestGeneration)
        setPreview({ body, provider, model, etag, result });
    } catch (failure) {
      if (generation.current === requestGeneration) {
        setError(failure);
        setPreview(null);
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <Panel
      title={selection ? 'Edit tenant rate' : 'Add tenant rate'}
      actions={
        selection && (
          <button type="button" onClick={onClose}>
            New rate
          </button>
        )
      }
    >
      <p>
        Rates are USD per one million tokens. A tenant rate overrides the
        matching catalog or provider price. Optional advanced fields support
        cache prices, tiers, multipliers and tool fees.
      </p>
      <MutationForm
        onSubmit={check}
        submitLabel="Preview rate change"
        disabled={busy || !canEditPolicy}
      >
        <div className={styles.grid}>
          <Field label="Provider">
            <input
              required
              value={form.provider}
              onChange={(event) => change('provider', event.target.value)}
            />
          </Field>
          <Field label="Model">
            <input
              required
              value={form.model}
              onChange={(event) => change('model', event.target.value)}
            />
          </Field>
          <Field
            label="Provider label (optional)"
            hint="Blank applies to this provider across labels."
          >
            <input
              value={form.providerLabel}
              onChange={(event) => change('providerLabel', event.target.value)}
            />
          </Field>
          <Field label="Input USD / 1M">
            <input
              inputMode="decimal"
              pattern="[0-9]{1,12}([.][0-9]{1,12})?"
              value={rateText(form.input)}
              onChange={(event) => change('input', event.target.value)}
            />
          </Field>
          <Field label="Output USD / 1M">
            <input
              inputMode="decimal"
              pattern="[0-9]{1,12}([.][0-9]{1,12})?"
              value={rateText(form.output)}
              onChange={(event) => change('output', event.target.value)}
            />
          </Field>
        </div>
        <JsonEditor
          label="Advanced rate fields (JSON)"
          value={form.advanced}
          onChange={(value) => change('advanced', value)}
          rows={5}
        />
        <small>
          Plain decimal strings preserve the amount you enter. Advanced fields
          also accept them, for example{' '}
          <code>{'{"cache_read_usd_per_1m":"0.15"}'}</code>. Token rates use
          USD / 1M; tool fees use the units in their field names.
        </small>
      </MutationForm>
      <ErrorView error={error} />
      {preview && (
        <div className={styles.notice}>
          <h3>Dry run</h3>
          <Json value={preview.result} />
          <button
            type="button"
            className={styles.primary}
            disabled={busy || !canEditPolicy || !preview.result.would_publish}
            onClick={async () => {
              if (!canEditPolicy) return;
              setBusy(true);
              const result = await run(
                () =>
                  api.putRate(preview.provider, preview.model, preview.body, {
                    etag: preview.etag,
                  }),
                'Tenant rate published.',
              );
              if (result) setPreview(null);
              setBusy(false);
            }}
          >
            Publish previewed rate
          </button>
        </div>
      )}
    </Panel>
  );
}

export function ModelsPanel({ api, run, version, canEditPolicy = false }) {
  const state = useLoad(() => api.getPricing(), [api, version]);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('');
  const [selection, setSelection] = useState(null);
  const [mode, setMode] = useState('');
  const [modePreview, setModePreview] = useState(null);
  const [modeError, setModeError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [modeEtag, setModeEtag] = useState(null);
  const modeGeneration = useRef(0);
  const pricing = state.data;
  useEffect(() => {
    if (pricing) {
      modeGeneration.current += 1;
      setMode(pricing.unpriced_models ?? '');
      setModeEtag(pricing.etag);
      setModePreview(null);
    }
  }, [pricing]);
  const effective = pricing?.effective || [];
  const rows = useMemo(
    () =>
      effective.filter(
        (row) =>
          (!source || row.source === source) &&
          [row.provider, row.provider_label, row.model, ...(row.apps || [])]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [pricing, query, source],
  );
  const rateFor = (row) => {
    const matches = (pricing?.rates || []).filter(
      (rate) => rate.provider === row.provider && rate.model === row.model,
    );
    return (
      matches.find(
        (rate) => (rate.provider_label || '') === (row.provider_label || ''),
      ) || matches.find((rate) => !rate.provider_label)
    );
  };
  return (
    <>
      <Panel
        title="Models and costs"
        actions={
          <button type="button" onClick={state.reload}>
            Refresh prices
          </button>
        }
      >
        <LoadState state={state} />
        {pricing && (
          <>
            <p>
              {effective.length} configured model routes,{' '}
              {effective.filter((row) => row.source === 'unpriced').length}{' '}
              unpriced. Policy revision {pricing.revision}. Prices below include
              every configured model returned by the gateway.
            </p>
            <div className={styles.toolbar}>
              <Field label="Search models, providers or apps">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </Field>
              <Field label="Price source">
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                >
                  <option value="">All sources</option>
                  {[...new Set(effective.map((row) => row.source))]
                    .sort()
                    .map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                </select>
              </Field>
              <small>{rows.length} matching model routes</small>
            </div>
            <Table
              rows={rows}
              columns={[
                {
                  label: 'Provider / model',
                  render: (row) => (
                    <>
                      <strong>{row.model}</strong>
                      {row.provider}
                      <small>
                        {row.provider_label || 'All provider labels'}
                      </small>
                    </>
                  ),
                },
                {
                  label: 'USD / 1M tokens',
                  render: (row) => (
                    <>
                      Input: {dollars(row.input_usd_per_1m)}
                      <small>Output: {dollars(row.output_usd_per_1m)}</small>
                    </>
                  ),
                },
                {
                  label: 'Source',
                  render: (row) => (
                    <>
                      <Badge
                        state={row.source === 'unpriced' ? 'alerting' : 'ok'}
                      >
                        {row.source}
                      </Badge>
                      <small>{row.policy}</small>
                      {row.rate_sources && (
                        <details>
                          <summary>Rate sources</summary>
                          <Json value={row.rate_sources} />
                        </details>
                      )}
                    </>
                  ),
                },
                { label: 'Apps', render: (row) => format(row.apps) },
                {
                  label: 'Tenant rate',
                  render: (row) => (
                    <>
                      <button
                        type="button"
                        disabled={!canEditPolicy}
                        onClick={() => {
                          if (!canEditPolicy) return;
                          const rate = rateFor(row);
                          setSelection({
                            ...row,
                            provider_label: rate
                              ? rate.provider_label
                              : row.provider_label,
                            rate,
                            etag: pricing.etag,
                          });
                        }}
                      >
                        Edit rate
                      </button>
                      {rateFor(row) && (
                        <button
                          type="button"
                          disabled={!canEditPolicy}
                          onClick={() =>
                            canEditPolicy &&
                            run(
                              () =>
                                api.deleteRate(row.provider, row.model, {
                                  providerLabel: rateFor(row).provider_label,
                                  etag: pricing.etag,
                                }),
                              'Tenant rate removed; fallback pricing now applies.',
                            )
                          }
                        >
                          Remove tenant rate
                        </button>
                      )}
                    </>
                  ),
                },
              ]}
            />
            {pricing.open_ended?.length > 0 && (
              <details>
                <summary>
                  Providers that accept additional model IDs (
                  {pricing.open_ended.length})
                </summary>
                <p>
                  These providers can route models beyond the configured list.
                  New model IDs follow the unpriced-model setting unless another
                  price source covers them.
                </p>
                <Json value={pricing.open_ended} />
              </details>
            )}
            {pricing.conditional_rates_present && (
              <div className={styles.notice}>
                Conditional policy rates also exist. This table edits
                tenant-wide rates; conditional rates can change the price for a
                specific request.
              </div>
            )}
            <details>
              <summary>
                All tenant policy rate definitions ({pricing.rates?.length || 0}
                )
              </summary>
              <Table
                rows={pricing.rates || []}
                columns={[
                  {
                    label: 'Provider / model',
                    render: (row) => (
                      <>
                        {row.provider} / {row.model}
                        <small>
                          {row.provider_label || 'All provider labels'}
                        </small>
                      </>
                    ),
                  },
                  {
                    label: 'Definition',
                    render: (row) => <Json value={row} />,
                  },
                  {
                    label: 'Actions',
                    render: (row) => (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          disabled={!canEditPolicy}
                          onClick={() =>
                            canEditPolicy &&
                            setSelection({
                              ...row,
                              rate: row,
                              etag: pricing.etag,
                            })
                          }
                        >
                          Edit rate
                        </button>
                        <button
                          type="button"
                          disabled={!canEditPolicy}
                          onClick={() =>
                            canEditPolicy &&
                            run(
                              () =>
                                api.deleteRate(row.provider, row.model, {
                                  providerLabel: row.provider_label,
                                  etag: pricing.etag,
                                }),
                              'Tenant rate removed.',
                            )
                          }
                        >
                          Remove tenant rate
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
            </details>
          </>
        )}
      </Panel>
      {pricing && canEditPolicy && (
        <>
          <RateEditor
            api={api}
            run={run}
            pricing={pricing}
            selection={selection}
            onClose={() => setSelection(null)}
            canEditPolicy={canEditPolicy}
          />
          <Panel title="Unpriced models">
            <p>
              Choose whether requests to unpriced models cost zero or are
              blocked. Inherit removes the explicit tenant-wide setting.
            </p>
            <MutationForm
              disabled={busy || !canEditPolicy}
              submitLabel="Preview unpriced-model setting"
              onSubmit={async () => {
                if (!canEditPolicy) return;
                const requestGeneration = ++modeGeneration.current;
                setBusy(true);
                setModeError(null);
                setModePreview(null);
                try {
                  const body = { unpriced_models: mode || null };
                  const etag = modeEtag;
                  const result = await api.patchPricing(body, {
                    etag,
                    dryRun: true,
                  });
                  if (requestGeneration === modeGeneration.current)
                    setModePreview({ body, etag, result });
                } catch (error) {
                  if (requestGeneration === modeGeneration.current)
                    setModeError(error);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="When a model has no price">
                <select
                  disabled={busy}
                  value={mode}
                  onChange={(event) => {
                    modeGeneration.current += 1;
                    setMode(event.target.value);
                    setModePreview(null);
                  }}
                >
                  <option value="block">Block requests</option>
                  <option value="zero">Treat as zero cost</option>
                  <option value="">Inherit gateway default</option>
                </select>
              </Field>
            </MutationForm>
            <ErrorView error={modeError} />
            {modePreview && (
              <>
                <Json value={modePreview.result} />
                <button
                  type="button"
                  className={styles.primary}
                  disabled={
                    busy || !canEditPolicy || !modePreview.result.would_publish
                  }
                  onClick={async () => {
                    if (!canEditPolicy) return;
                    setBusy(true);
                    const result = await run(
                      () =>
                        api.patchPricing(modePreview.body, {
                          etag: modePreview.etag,
                        }),
                      'Unpriced-model setting published.',
                    );
                    if (result) setModePreview(null);
                    setBusy(false);
                  }}
                >
                  Publish previewed setting
                </button>
              </>
            )}
          </Panel>
        </>
      )}
    </>
  );
}

export function ExemptionsPanel({ api, run, version, canEditPolicy = false }) {
  const state = useLoad(() => api.listExemptions(), [api, version]);
  const [query, setQuery] = useState('');
  const [conflict, setConflict] = useState('');
  const [form, setForm] = useState({
    users: '',
    apps: '',
    groups: '',
    quotas: 'all',
    kinds: '',
    families: '',
    reason: '',
    expires: '',
  });
  const change = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const rows = (state.data?.items || []).filter((row) =>
    JSON.stringify(row).toLowerCase().includes(query.toLowerCase()),
  );
  const publish = (write, message) => {
    if (!canEditPolicy || state.loading || !state.data?.etag) return;
    setConflict('');
    return run(async () => {
      try {
        return await write(state.data.etag);
      } catch (failure) {
        if (failure.status === 412) {
          setConflict(
            'Exemptions changed since this list was loaded. Your change was not published. Reloading the latest list; review it before submitting again.',
          );
          state.reload();
        }
        throw failure;
      }
    }, message);
  };
  return (
    <>
      <Panel
        title="Budget exemptions"
        actions={
          <button type="button" onClick={state.reload}>
            Refresh exemptions
          </button>
        }
      >
        <LoadState state={state} />
        {conflict && (
          <p className={styles.notice} role="alert">{conflict}</p>
        )}
        <p>
          Review every policy exemption. Only API-managed exemptions can be
          removed here.
        </p>
        <div className={styles.toolbar}>
          <Field label="Search exemptions">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Field>
        </div>
        <Table
          rows={rows}
          columns={[
            {
              label: 'Scope',
              render: (row) => (
                <>
                  <strong>{row.exemption_id}</strong>
                  {format(row.applies_to?.text || row.applies_to)}
                  {row.applies_to?.conditional && (
                    <small>Conditional scope</small>
                  )}
                </>
              ),
            },
            {
              label: 'Coverage',
              render: (row) => (
                <>
                  Budgets: {format(row.quotas)}
                  <small>
                    Kinds: {format(row.kinds)} / Families:{' '}
                    {format(row.families)}
                  </small>
                </>
              ),
            },
            {
              label: 'Reason / expiry',
              render: (row) => (
                <>
                  {row.reason}
                  <small>{row.expires_at || 'No expiry'}</small>
                </>
              ),
            },
            {
              label: 'Policy',
              render: (row) => (
                <>
                  {row.policy}
                  <small>
                    {row.managed ? 'API managed' : 'Policy managed'}
                  </small>
                </>
              ),
            },
            {
              label: 'Actions',
              render: (row) => (
                <button
                  type="button"
                  disabled={
                    !row.managed || !canEditPolicy || state.loading || !state.data?.etag
                  }
                  onClick={() =>
                    publish(
                      (etag) => api.deleteExemption(row.exemption_id, { etag }),
                      'Exemption removed.',
                    )
                  }
                >
                  Remove exemption
                </button>
              ),
            },
          ]}
        />
      </Panel>
      {canEditPolicy && (
        <Panel title="Add exemption">
          <p>
            Subject lists are comma separated. Leaving all three subject lists
            empty applies the exemption to everyone.
          </p>
          <MutationForm
            submitLabel="Create exemption"
            disabled={state.loading || !state.data?.etag || !canEditPolicy}
            onSubmit={() =>
              publish((etag) => {
                const appliesTo = {};
                if (words(form.users).length) appliesTo.users = words(form.users);
                if (words(form.apps).length) appliesTo.apps = words(form.apps);
                if (words(form.groups).length)
                  appliesTo.smart_groups = words(form.groups);
                const body = {
                  quotas:
                    form.quotas.trim().toLowerCase() === 'all'
                      ? 'all'
                      : words(form.quotas),
                  reason: form.reason.trim(),
                };
                if (Object.keys(appliesTo).length) body.applies_to = appliesTo;
                if (form.kinds) body.kinds = [form.kinds];
                if (words(form.families).length)
                  body.families = words(form.families);
                if (form.expires)
                  body.expires_at = new Date(form.expires).toISOString();
                return api.createExemption(body, { etag });
              }, 'Exemption created.')
            }
          >
            <div className={styles.grid}>
              <Field label="Users">
                <input
                  placeholder="alice@example.com, bob@example.com"
                  value={form.users}
                  onChange={(event) => change('users', event.target.value)}
                />
              </Field>
              <Field label="Apps">
                <input
                  placeholder="App names"
                  value={form.apps}
                  onChange={(event) => change('apps', event.target.value)}
                />
              </Field>
              <Field label="Smart groups">
                <input
                  value={form.groups}
                  onChange={(event) => change('groups', event.target.value)}
                />
              </Field>
              <Field label="Budget IDs or all">
                <input
                  required
                  value={form.quotas}
                  onChange={(event) => change('quotas', event.target.value)}
                />
              </Field>
              <Field label="Kinds">
                <select
                  value={form.kinds}
                  onChange={(event) => change('kinds', event.target.value)}
                >
                  <option value="">All kinds</option>
                  <option value="budget">budget</option>
                  <option value="rate">rate</option>
                </select>
              </Field>
              <Field label="Families (optional)">
                <input
                  value={form.families}
                  onChange={(event) => change('families', event.target.value)}
                />
              </Field>
              <Field label="Expires (local time, optional)">
                <input
                  type="datetime-local"
                  step="0.001"
                  value={form.expires}
                  onChange={(event) => change('expires', event.target.value)}
                />
              </Field>
            </div>
            <Field label="Reason">
              <input
                required
                maxLength={300}
                value={form.reason}
                onChange={(event) => change('reason', event.target.value)}
              />
            </Field>
          </MutationForm>
        </Panel>
      )}
    </>
  );
}

function Destinations({ api, run, version, canEditPolicy = false }) {
  const state = useLoad(() => api.getDestinations(), [api, version]);
  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [conflict, setConflict] = useState('');
  useEffect(() => {
    if (state.data) {
      setRows(
        (state.data.destinations || []).map((row, index) => ({
          ...row,
          target: '',
          redacted: row.target,
          stored: true,
          localKey: row.id || index,
        })),
      );
      setDirty(false);
    }
  }, [state.data]);
  const change = (index, key, value) => {
    setRows((current) =>
      current.map((row, position) =>
        position === index ? { ...row, [key]: value } : row,
      ),
    );
    setDirty(true);
  };
  return (
    <Panel
      title="Alert destinations"
      actions={
        <button type="button" onClick={state.reload}>
          Reload destinations
        </button>
      }
    >
      <LoadState state={state} />
      {conflict && (
        <p className={styles.notice} role="alert">{conflict}</p>
      )}
      <p>
        Webhook targets are write only. Leave an existing target blank to
        preserve its secret. Publishing replaces the destination list; removing
        a row deletes that destination.
      </p>
      {state.data && (
        <MutationForm
          submitLabel="Publish destinations"
          disabled={!dirty || !canEditPolicy || state.loading || !state.data.etag}
          onSubmit={() => {
            if (!canEditPolicy || state.loading || !state.data.etag) return;
            setConflict('');
            return run(async () => {
              try {
                return await api.putDestinations(
                  {
                    destinations: rows.map((row) => ({
                      id: row.id,
                      kind: 'webhook',
                      enabled: row.enabled,
                      ...(row.target.trim() ? { target: row.target.trim() } : {}),
                    })),
                  },
                  { etag: state.data.etag },
                );
              } catch (failure) {
                if (failure.status === 412) {
                  setConflict(
                    'Alert destinations changed since they were loaded. Your draft was not published. Reloading the latest destinations; review them and re-enter any changes before publishing.',
                  );
                  state.reload();
                }
                throw failure;
              }
            }, 'Alert destinations updated.');
          }}
        >
          {rows.map((row, index) => (
            <div key={row.localKey} className={styles.panel}>
              <div className={styles.grid}>
                <Field
                  label={`Webhook ${index + 1}`}
                  hint={
                    row.stored
                      ? `ID: ${row.id}. Current: ${row.redacted}`
                      : `New destination ${row.id}; provide a full https URL.`
                  }
                >
                  <input
                    type="password"
                    autoComplete="new-password"
                    required={!row.stored}
                    disabled={!canEditPolicy}
                    value={row.target}
                    placeholder={
                      row.stored
                        ? 'Keep existing target'
                        : 'https://alerts.example.com/webhook'
                    }
                    onChange={(event) =>
                      change(index, 'target', event.target.value)
                    }
                  />
                </Field>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    disabled={!canEditPolicy}
                    checked={row.enabled}
                    onChange={(event) =>
                      change(index, 'enabled', event.target.checked)
                    }
                  />
                  Enabled
                </label>
                <div className={styles.actions}>
                  <button
                    type="button"
                    disabled={!canEditPolicy}
                    onClick={() => {
                      if (!canEditPolicy) return;
                      setRows((current) =>
                        current.filter((_, position) => position !== index),
                      );
                      setDirty(true);
                    }}
                  >
                    Remove destination
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!rows.length && (
            <p className={styles.empty}>No destinations configured.</p>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              disabled={!canEditPolicy || rows.length >= 20}
              onClick={() => {
                if (!canEditPolicy) return;
                const id = `webhook-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
                setRows((current) => [
                  ...current,
                  {
                    kind: 'webhook',
                    id,
                    enabled: true,
                    target: '',
                    localKey: id,
                  },
                ]);
                setDirty(true);
              }}
            >
              Add webhook
            </button>
            <small>{rows.length} / 20 destinations</small>
          </div>
        </MutationForm>
      )}
    </Panel>
  );
}

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function changedFields(before, after, path = []) {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  const objects = (isRecord(before) || before == null) &&
    (isRecord(after) || after == null);
  const keys = objects
    ? [...new Set([
        ...Object.keys(isRecord(before) ? before : {}),
        ...Object.keys(isRecord(after) ? after : {}),
      ])].filter((key) => !['truncated', 'changed'].includes(key) || path.length)
    : [];
  if (keys.length)
    return keys.flatMap((key) =>
      changedFields(before?.[key], after?.[key], [...path, key]),
    );
  return [{ field: path.join(' / ') || 'Record', before, after }];
}

function ChangeDiff({ before, after }) {
  const truncated = before?.truncated || after?.truncated;
  const rows = truncated ? [] : changedFields(before, after);
  const value = (item) =>
    item == null ? (
      <small>Not set</small>
    ) : isRecord(item) || Array.isArray(item) ? (
      <Json value={item} />
    ) : (
      <span>{String(item)}</span>
    );
  return (
    <>
      {truncated ? (
        <>
          <p>
            The API omitted field values because this change exceeded its diff
            size limit.
          </p>
          {(after?.changed || before?.changed) && (
            <>
              <strong>Changed entries</strong>
              <Json value={after?.changed || before?.changed} />
            </>
          )}
        </>
      ) : (
        <Table
          rows={rows}
          empty="No field values were recorded for this event."
          columns={[
            { label: 'Field', key: 'field' },
            { label: 'Before', render: (row) => value(row.before) },
            { label: 'After', render: (row) => value(row.after) },
          ]}
        />
      )}
      <details>
        <summary>Raw before / after</summary>
        <Json value={{ before, after }} />
      </details>
    </>
  );
}

function History({ api, version, events = false }) {
  const [draft, setDraft] = useState({
    subject: '',
    budget: '',
    since: '',
    until: '',
    after: '',
    type: '',
    grant: '',
    limit: '50',
  });
  const [filters, setFilters] = useState({ limit: 50 });
  const [cursors, setCursors] = useState([null]);
  const [pagingError, setPagingError] = useState(null);
  const cursor = cursors[cursors.length - 1];
  const state = useLoad(
    () =>
      events
        ? api.listEvents({ ...filters, ...(cursor ? { after: cursor } : {}) })
        : api.listAlerts({ ...filters, ...(cursor ? { cursor } : {}) }),
    [api, version, filters, cursor, events],
  );
  const data = state.data;
  const repeatedPage =
    events && cursor && data?.next_cursor === cursor && data?.items?.length > 0;
  const rows = repeatedPage ? [] : data?.items || data?.alerts || [];
  useEffect(() => {
    if (repeatedPage)
      setPagingError({
        code: 'pagination_did_not_advance',
        message:
          'The API returned the same event cursor and repeated records. Pagination stopped to avoid showing duplicate records.',
      });
  }, [repeatedPage]);
  const change = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const next = () => {
    const value = data?.next_cursor;
    if (!value) return;
    if (cursors.includes(value)) {
      setPagingError({
        code: 'pagination_did_not_advance',
        message:
          'The API returned a cursor already used for this view. Pagination stopped to avoid repeating records.',
      });
      return;
    }
    setCursors((current) => [...current, value]);
  };
  return (
    <Panel
      title={events ? 'Change log' : 'Alert history'}
      actions={
        <button type="button" onClick={state.reload}>
          Refresh history
        </button>
      }
    >
      <p>
        {events
          ? 'Events are ordered oldest first. Before and after values explain policy edits and grant changes.'
          : 'Fired alerts are ordered newest first. By default, the API searches its recent lookback window.'}
      </p>
      <MutationForm
        submitLabel="Apply history filters"
        onSubmit={async () => {
          const query = { limit: Number(draft.limit) };
          if (draft.subject.trim()) query.subject = draft.subject.trim();
          if (draft.budget.trim())
            query[events ? 'budget_id' : 'quota_id'] = draft.budget.trim();
          if (events) {
            if (draft.after.trim()) query.after = draft.after.trim();
            if (draft.type.trim()) query.type = draft.type.trim();
            if (draft.grant.trim()) query.grant_id = draft.grant.trim();
          } else {
            if (draft.since) query.since = new Date(draft.since).toISOString();
            if (draft.until) query.until = new Date(draft.until).toISOString();
          }
          setFilters(query);
          setCursors([null]);
          setPagingError(null);
        }}
      >
        <div className={styles.grid}>
          <Field label="Subject">
            <input
              value={draft.subject}
              onChange={(event) => change('subject', event.target.value)}
            />
          </Field>
          <Field label="Budget ID">
            <input
              value={draft.budget}
              onChange={(event) => change('budget', event.target.value)}
            />
          </Field>
          {events ? (
            <>
              <Field label="After (ISO timestamp or feed cursor)">
                <input
                  value={draft.after}
                  onChange={(event) => change('after', event.target.value)}
                />
              </Field>
              <Field label="Event type">
                <input
                  placeholder="grant.created"
                  value={draft.type}
                  onChange={(event) => change('type', event.target.value)}
                />
              </Field>
              <Field label="Grant ID">
                <input
                  value={draft.grant}
                  onChange={(event) => change('grant', event.target.value)}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Since (local time)">
                <input
                  type="datetime-local"
                  value={draft.since}
                  onChange={(event) => change('since', event.target.value)}
                />
              </Field>
              <Field label="Until (local time)">
                <input
                  type="datetime-local"
                  value={draft.until}
                  onChange={(event) => change('until', event.target.value)}
                />
              </Field>
            </>
          )}
          <Field label="Rows per page">
            <select
              value={draft.limit}
              onChange={(event) => change('limit', event.target.value)}
            >
              {[25, 50, 100, 250, 500].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
        </div>
      </MutationForm>
      <LoadState state={state} />
      <Freshness data={data} />
      <ErrorView error={pagingError} />
      {data?.available === false && (
        <div className={styles.notice}>
          The API reports that alert history is unavailable. Empty results here
          do not confirm that no alerts fired.
        </div>
      )}
      <Table
        rows={rows}
        columns={
          events
            ? [
                {
                  label: 'Occurred / type',
                  render: (row) => (
                    <>
                      <strong>{row.type}</strong>
                      {row.occurred_at}
                      <small>{row.event_id}</small>
                    </>
                  ),
                },
                {
                  label: 'Subject / budget',
                  render: (row) => (
                    <>
                      {format(row.subject || row.bucket)}
                      <small>Budget: {row.budget_id || 'None'}</small>
                      <small>Grant: {row.grant_id || 'None'}</small>
                    </>
                  ),
                },
                { label: 'Actor', render: (row) => format(row.actor) },
                {
                  label: 'Change',
                  render: (row) => (
                    <ChangeDiff before={row.before} after={row.after} />
                  ),
                },
              ]
            : [
                {
                  label: 'Fired / budget',
                  render: (row) => (
                    <>
                      <strong>{row.quota?.label || row.quota?.id}</strong>
                      {row.fired_at}
                      <small>
                        {row.quota?.metric} / {row.quota?.mode}
                      </small>
                    </>
                  ),
                },
                {
                  label: 'Subject',
                  render: (row) => (
                    <>
                      {format(row.subject)}
                      <small>{format(row.bucket)}</small>
                    </>
                  ),
                },
                {
                  label: 'Usage / threshold',
                  render: (row) => (
                    <>
                      {row.used} / {row.limit}
                      <small>
                        {row.pct}% used; {row.threshold_pct}% threshold
                      </small>
                    </>
                  ),
                },
                {
                  label: 'Delivery',
                  render: (row) => (
                    <>
                      {row.deliveries?.delivered ?? 0} delivered /{' '}
                      {row.deliveries?.attempted ?? 0} attempted
                      <details>
                        <summary>Full alert</summary>
                        <Json value={row} />
                      </details>
                    </>
                  ),
                },
              ]
        }
      />
      <div className={styles.actions}>
        <span>Page {cursors.length}</span>
        <button
          type="button"
          disabled={cursors.length < 2 || state.loading}
          onClick={() => {
            setCursors((current) => current.slice(0, -1));
            setPagingError(null);
          }}
        >
          Previous page
        </button>
        <button
          type="button"
          disabled={
            state.loading ||
            !data?.next_cursor ||
            (events && !data?.has_more) ||
            !!pagingError
          }
          onClick={next}
        >
          Next page
        </button>
        <button
          type="button"
          onClick={() => {
            setCursors([null]);
            setPagingError(null);
          }}
        >
          First page
        </button>
      </div>
    </Panel>
  );
}

export function AlertsPanel(props) {
  return (
    <>
      <Destinations {...props} />
      <History {...props} />
      <History {...props} events />
    </>
  );
}

export default function Settings({ tab, ...props }) {
  if (tab === 'models') return <ModelsPanel {...props} />;
  if (tab === 'exemptions') return <ExemptionsPanel {...props} />;
  return <AlertsPanel {...props} />;
}
