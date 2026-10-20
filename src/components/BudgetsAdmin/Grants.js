import React, { useEffect, useRef, useState } from 'react';
import {
  Badge,
  ErrorView,
  Field,
  Json,
  JsonEditor,
  LoadState,
  MutationForm,
  Pager,
  Panel,
  Table,
  format,
  pretty,
  useLoad,
} from './ui';
import styles from './styles.module.css';

function inputError(message) {
  const error = new Error(message);
  error.code = 'invalid_input';
  return error;
}

function utcInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 19);
}

function utcDate(value, name) {
  if (!value) throw inputError(`${name} is required.`);
  const date = new Date(`${value}Z`);
  if (Number.isNaN(date.getTime()))
    throw inputError(`${name} must be a valid UTC date and time.`);
  return date.toISOString();
}

function amount(value, metric) {
  const text = String(value).trim();
  if (metric === 'spend_usd') {
    if (!/^\d+(\.\d{1,6})?$/.test(text))
      throw inputError(
        'Spend limits must be non-negative USD decimals with at most 6 decimal places.',
      );
    return text;
  }
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text)))
    throw inputError(
      'Request and token limits must be non-negative safe integers.',
    );
  return Number(text);
}

function parseSubject(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw inputError('Subject must be a JSON object.');
  }
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    !Object.keys(value).length
  )
    throw inputError('Subject must be a non-empty JSON object.');
  return value;
}

function timeFields(form) {
  const expires_at = utcDate(form.expires, 'Expiry');
  const starts_at = form.starts ? utcDate(form.starts, 'Start') : undefined;
  if (
    new Date(expires_at).getTime() <=
    (starts_at ? new Date(starts_at).getTime() : Date.now())
  ) {
    throw inputError(
      'Expiry must be after the start time (or now when no start is supplied).',
    );
  }
  return { expires_at, ...(starts_at ? { starts_at } : {}) };
}

function GrantTimes({ form, setForm }) {
  return (
    <div className={styles.grid}>
      <Field label="Expiry (UTC, required)">
        <input
          type="datetime-local"
          step="1"
          required
          value={form.expires}
          onChange={(e) => setForm((v) => ({ ...v, expires: e.target.value }))}
        />
      </Field>
      <Field label="Start (UTC, optional)" hint="Leave empty to start now.">
        <input
          type="datetime-local"
          step="1"
          value={form.starts}
          onChange={(e) => setForm((v) => ({ ...v, starts: e.target.value }))}
        />
      </Field>
    </div>
  );
}

function BudgetOption({ budget }) {
  return (
    <option value={budget.id}>
      {budget.label || budget.id} · {budget.id} · {budget.metric}
    </option>
  );
}

function GrantResult({ result }) {
  if (!result) return null;
  const bulk = Array.isArray(result.items);
  return (
    <Panel title={bulk ? 'Bulk grant result' : 'Last grant change'}>
      {bulk ? (
        <>
          <p role="status">
            {result.items.length} grants created; {result.errors?.length || 0}{' '}
            item errors. Item indexes start at 0.
          </p>
          {result.errors?.length > 0 && (
            <>
              <h3>Item errors</h3>
              <Table
                rows={result.errors}
                columns={[
                  { label: 'Index', key: 'index' },
                  { label: 'Code', key: 'code' },
                  { label: 'Message', key: 'message' },
                ]}
              />
            </>
          )}
          <h3>Successful items</h3>
          <Table
            rows={result.items}
            columns={[
              { label: 'Index', key: 'index' },
              {
                label: 'Grant / subject',
                render: (r) => (
                  <>
                    <strong>{r.grant?.id}</strong>
                    {format(r.grant?.subject)}
                  </>
                ),
              },
              {
                label: 'Limit / expiry',
                render: (r) => (
                  <>
                    {format(r.grant?.limit)}
                    <small>{r.grant?.expires_at}</small>
                  </>
                ),
              },
              {
                label: 'Superseded grant',
                render: (r) => r.superseded?.id || 'None',
              },
            ]}
          />
        </>
      ) : (
        <>
          <p>
            Grant {result.grant?.id}: {result.grant?.status}.{' '}
            {result.superseded
              ? `Superseded grant ${result.superseded.id}.`
              : ''}
          </p>
          <Json value={result} />
        </>
      )}
      {bulk && (
        <details>
          <summary>Full API response</summary>
          <Json value={result} />
        </details>
      )}
    </Panel>
  );
}

export default function Grants({ api, run, version, period }) {
  const budgets = useLoad(() => api.allPages('listBudgets'), [api, version]);
  const [filter, setFilter] = useState({
    budget_id: '',
    status: 'all',
    bucket: '',
  });
  const [cursor, setCursor] = useState('');
  const query = { ...filter, cursor, limit: 50 };
  const grants = useLoad(
    () => api.listGrants(query),
    [api, version, JSON.stringify(query)],
  );
  const [budgetId, setBudgetId] = useState('');
  const [subjectMode, setSubjectMode] = useState('user');
  const [subjectValue, setSubjectValue] = useState('');
  const [subjectJson, setSubjectJson] = useState(
    pretty({ 'user.email': '', 'gateway.actual_model': '' }),
  );
  const [create, setCreate] = useState(() => ({
    limit: '',
    expires: utcInput(Date.now() + 24 * 60 * 60 * 1000),
    starts: '',
    reason: '',
  }));
  const [bulkMode, setBulkMode] = useState('json');
  const [bulkJson, setBulkJson] = useState(
    pretty([{ subject: { user: 'person@example.com' } }]),
  );
  const [group, setGroup] = useState('');
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [writing, setWriting] = useState(false);
  const [edit, setEdit] = useState({ limit: '', expires: '', reason: '' });
  const [revokeReason, setRevokeReason] = useState('');
  const readGeneration = useRef(0);

  // A collection refresh must not replace the version or draft being reviewed.
  useEffect(() => {
    readGeneration.current += 1;
    setSelected(null);
    setDetailError(null);
    setDetailLoading(false);
    setResult(null);
    return () => {
      readGeneration.current += 1;
    };
  }, [api]);

  const definitions = budgets.data?.items || [];
  const adjustable = definitions.filter((budget) => budget.adjustments != null);
  const budget = definitions.find((item) => item.id === budgetId);
  const metric = budget?.metric;
  const editMetric =
    selected?.grant?.metric ||
    definitions.find((item) => item.id === selected?.grant?.budget_id)?.metric;
  const terminal = ['revoked', 'superseded'].includes(selected?.grant?.status);

  function changeFilter(name, value) {
    setFilter((previous) => ({ ...previous, [name]: value }));
    setCursor('');
  }

  async function readGrant(id) {
    const generation = ++readGeneration.current;
    setDetailLoading(true);
    setDetailError(null);
    setSelected(null);
    try {
      const response = await api.getGrant(id);
      if (generation !== readGeneration.current) return;
      setSelected({
        grant: response.grant,
        etag: response.etag || response.grant?.etag || response._meta?.etag,
      });
      setEdit({
        limit: String(response.grant.limit),
        expires: utcInput(response.grant.expires_at),
        reason: response.grant.reason || '',
      });
      setRevokeReason('');
    } catch (error) {
      if (generation === readGeneration.current) setDetailError(error);
    } finally {
      if (generation === readGeneration.current) setDetailLoading(false);
    }
  }

  function defaults() {
    if (!budget?.adjustments) throw inputError('Choose an adjustable budget.');
    return {
      limit: amount(create.limit, budget.metric),
      ...timeFields(create),
      ...(create.reason ? { reason: create.reason } : {}),
    };
  }

  async function createGrant() {
    const response = await run(() => {
      const subject =
        subjectMode === 'json'
          ? parseSubject(subjectJson)
          : { [subjectMode]: subjectValue.trim() };
      if (subjectMode !== 'json' && !subjectValue.trim())
        throw inputError('Enter a subject value.');
      return api.createGrant(budgetId, { subject, ...defaults() });
    }, 'Grant created. Review any superseded grant below.');
    if (response) setResult(response);
  }

  async function bulkGrants() {
    const response = await run(() => {
      const body = defaults();
      if (bulkMode === 'group') {
        if (!group.trim()) throw inputError('Enter a smart-group name.');
        body.subjects_from = { smart_group: group.trim() };
      } else {
        let entries;
        try {
          entries = JSON.parse(bulkJson);
        } catch {
          throw inputError('Bulk grants must be a JSON array.');
        }
        if (!Array.isArray(entries) || !entries.length || entries.length > 1000)
          throw inputError(
            'Bulk grants must be an array of 1 to 1000 entries.',
          );
        body.grants = entries;
      }
      return api.bulkGrants(budgetId, body);
    }, 'Bulk request completed. Review successful grants and item errors below.');
    if (response) setResult(response);
  }

  async function patchGrant() {
    const pinned = selected;
    setWriting(true);
    try {
      const response = await run(() => {
        if (!pinned?.etag)
          throw inputError('Read the grant to obtain its ETag before saving.');
        return api.patchGrant(
          pinned.grant.id,
          {
            limit: amount(edit.limit, editMetric),
            expires_at: utcDate(edit.expires, 'Expiry'),
            reason: edit.reason,
          },
          { etag: pinned.etag },
        );
      }, 'Grant updated.');
      if (response) {
        setResult(response);
        setSelected({
          grant: response.grant,
          etag: response.etag || response.grant?.etag || response._meta?.etag,
        });
      }
    } finally {
      setWriting(false);
    }
  }

  async function revokeGrant() {
    const pinned = selected;
    setWriting(true);
    try {
      const response = await run(() => {
        if (!pinned?.etag)
          throw inputError(
            'Read the grant to obtain its ETag before revoking.',
          );
        return api.revokeGrant(pinned.grant.id, {
          etag: pinned.etag,
          reason: revokeReason,
        });
      }, 'Grant revoked.');
      if (response) {
        setResult(response);
        setSelected({
          grant: response.grant,
          etag: response.etag || response.grant?.etag || response._meta?.etag,
        });
      }
    } finally {
      setWriting(false);
    }
  }

  return (
    <>
      {period === 'previous' && (
        <p className={styles.notice}>
          Grants always apply to current or future time windows. Previous-period
          usage is unchanged by a grant.
        </p>
      )}
      <Panel title="Grant register">
        <div className={styles.toolbar}>
          <Field label="Budget">
            <select
              value={filter.budget_id}
              onChange={(e) => changeFilter('budget_id', e.target.value)}
            >
              <option value="">All budgets</option>
              {definitions.map((item) => (
                <BudgetOption budget={item} key={item.id} />
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={filter.status}
              onChange={(e) => changeFilter('status', e.target.value)}
            >
              {['all', 'active', 'expired', 'revoked', 'superseded'].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Canonical bucket (exact)">
            <input
              value={filter.bucket}
              onChange={(e) => changeFilter('bucket', e.target.value)}
              placeholder="Optional bucket filter"
            />
          </Field>
        </div>
        <LoadState state={grants} />
        {grants.data && (
          <>
            <Table
              rows={grants.data.items}
              columns={[
                {
                  label: 'Grant / budget',
                  render: (row) => (
                    <>
                      <strong>{row.id}</strong>
                      <small>{row.budget_id}</small>
                    </>
                  ),
                },
                {
                  label: 'Subject',
                  render: (row) => (
                    <>
                      {format(row.subject)}
                      <details>
                        <summary>Canonical bucket</summary>
                        <code>{row.bucket}</code>
                      </details>
                    </>
                  ),
                },
                {
                  label: 'Limit',
                  render: (row) => (
                    <>
                      {row.metric === 'spend_usd' ? '$' : ''}
                      {format(row.limit)}
                      <small>{row.metric}</small>
                    </>
                  ),
                },
                {
                  label: 'Status',
                  render: (row) => <Badge>{row.status}</Badge>,
                },
                {
                  label: 'Validity (UTC)',
                  render: (row) => (
                    <>
                      {row.starts_at}
                      <small>Expires {row.expires_at}</small>
                    </>
                  ),
                },
                {
                  label: 'Actor / reason',
                  render: (row) => (
                    <>
                      {row.actor}
                      <small>{row.reason || 'No reason'}</small>
                    </>
                  ),
                },
                {
                  label: 'Action',
                  render: (row) => (
                    <button
                      type="button"
                      disabled={detailLoading || writing}
                      onClick={() => readGrant(row.id)}
                    >
                      Manage grant
                    </button>
                  ),
                },
              ]}
            />
            <Pager
              data={grants.data}
              onNext={setCursor}
              onReset={() => setCursor('')}
            />
          </>
        )}
      </Panel>

      {(detailLoading || detailError || selected) && (
        <Panel
          title="Extend, change or revoke a grant"
          actions={
            <button
              type="button"
              disabled={detailLoading || writing}
              onClick={() => {
                readGeneration.current += 1;
                setSelected(null);
                setDetailError(null);
              }}
            >
              Close
            </button>
          }
        >
          {detailLoading && <p role="status">Reading grant and ETag…</p>}
          <ErrorView error={detailError} />
          {selected && (
            <>
              <p>
                <strong>{selected.grant.id}</strong> ·{' '}
                {selected.grant.budget_id} ·{' '}
                <Badge>{selected.grant.status}</Badge>
              </p>
              <p>{format(selected.grant.subject)}</p>
              <div className={styles.toolbar}>
                <span className={styles.muted}>
                  Pinned ETag: {selected.etag || 'Unavailable'}
                </span>
                <button
                  type="button"
                  disabled={writing}
                  onClick={() => readGrant(selected.grant.id)}
                >
                  Reload grant & reset draft
                </button>
              </div>
              <p className={styles.muted}>
                Saving uses this version. A concurrent edit is shown as an API
                conflict; reload explicitly to review the latest grant.
              </p>
              {terminal ? (
                <p className={styles.notice}>
                  This grant is {selected.grant.status}. Create a new grant for
                  the subject to replace it.
                </p>
              ) : (
                <div className={styles.split}>
                  <MutationForm
                    onSubmit={patchGrant}
                    submitLabel="Save grant / extend expiry"
                    disabled={!selected.etag || writing}
                  >
                    <Field
                      label={`Absolute limit (${editMetric === 'spend_usd' ? 'USD' : editMetric || 'display units'})`}
                    >
                      <input
                        required
                        inputMode={
                          editMetric === 'spend_usd' ? 'decimal' : 'numeric'
                        }
                        value={edit.limit}
                        onChange={(e) =>
                          setEdit((v) => ({ ...v, limit: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Expiry (UTC, required)">
                      <input
                        type="datetime-local"
                        step="1"
                        required
                        value={edit.expires}
                        onChange={(e) =>
                          setEdit((v) => ({ ...v, expires: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Reason">
                      <textarea
                        maxLength="1000"
                        rows="2"
                        value={edit.reason}
                        onChange={(e) =>
                          setEdit((v) => ({ ...v, reason: e.target.value }))
                        }
                      />
                    </Field>
                  </MutationForm>
                  <MutationForm
                    onSubmit={revokeGrant}
                    submitLabel="Revoke grant"
                    disabled={!selected.etag || writing}
                  >
                    <p>
                      Revoking ends the grant. The subject falls back to the
                      budget's base limit.
                    </p>
                    <Field label="Revocation reason">
                      <textarea
                        maxLength="1000"
                        rows="2"
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                      />
                    </Field>
                  </MutationForm>
                </div>
              )}
              <details>
                <summary>Grant details</summary>
                <Json value={selected.grant} />
              </details>
            </>
          )}
        </Panel>
      )}

      <Panel title="Create grants">
        <LoadState state={budgets} />
        <p className={styles.muted}>
          Grants set an absolute effective limit for one budget bucket. Creating
          another grant for the same bucket supersedes the existing active
          grant. Grant writes take effect immediately.
        </p>
        <div className={styles.form}>
          <Field label="Adjustable budget">
            <select
              required
              value={budgetId}
              onChange={(e) => setBudgetId(e.target.value)}
            >
              <option value="">Choose a budget</option>
              {adjustable.map((item) => (
                <BudgetOption budget={item} key={item.id} />
              ))}
            </select>
          </Field>
          {budgets.data && !adjustable.length && (
            <p className={styles.notice}>
              No budgets accept grants. Enable adjustment rules on a budget
              first.
            </p>
          )}
          {budget && (
            <div className={styles.notice}>
              Base: {format(budget.base_limit)} · Ceiling:{' '}
              {format(budget.adjustments?.ceiling)} · Maximum duration:{' '}
              {budget.adjustments?.max_duration || '366d'}
              <br />
              Required dimensions:{' '}
              {budget.per?.join(', ') ||
                'Shared budget (use a canonical bucket)'}
              .
            </div>
          )}
          <div className={styles.grid}>
            <Field
              label={`Absolute limit (${metric === 'spend_usd' ? 'USD' : metric || 'display units'})`}
              hint="This replaces the base limit; it is not an added amount."
            >
              <input
                required
                inputMode={metric === 'spend_usd' ? 'decimal' : 'numeric'}
                value={create.limit}
                onChange={(e) =>
                  setCreate((v) => ({ ...v, limit: e.target.value }))
                }
              />
            </Field>
            <Field label="Reason">
              <input
                maxLength="1000"
                value={create.reason}
                onChange={(e) =>
                  setCreate((v) => ({ ...v, reason: e.target.value }))
                }
              />
            </Field>
          </div>
          <GrantTimes form={create} setForm={setCreate} />
        </div>
        <div className={styles.split}>
          <div>
            <h3>One subject</h3>
            <MutationForm
              onSubmit={createGrant}
              submitLabel="Create grant"
              disabled={!budget?.adjustments}
            >
              <Field label="Subject type">
                <select
                  value={subjectMode}
                  onChange={(e) => setSubjectMode(e.target.value)}
                >
                  {[
                    ['user', 'User email'],
                    ['app', 'App name'],
                    ['smart_group', 'Active smart group'],
                    ['model', 'Model'],
                    ['bucket', 'Canonical bucket'],
                    ['json', 'Composite / raw JSON'],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              {subjectMode === 'json' ? (
                <JsonEditor
                  label="Subject object (supply every required dimension)"
                  value={subjectJson}
                  onChange={setSubjectJson}
                  rows={5}
                />
              ) : (
                <Field label="Subject value">
                  <input
                    required
                    value={subjectValue}
                    onChange={(e) => setSubjectValue(e.target.value)}
                  />
                </Field>
              )}
              <p className={styles.muted}>
                For per-key budgets use raw JSON such as{' '}
                {'{"application.key_id":"key-hash"}'}. For multi-dimension
                budgets supply all dimensions in a JSON object.
              </p>
            </MutationForm>
          </div>
          <div>
            <h3>Bulk grant</h3>
            <MutationForm
              onSubmit={bulkGrants}
              submitLabel="Create bulk grants"
              disabled={!budget?.adjustments}
            >
              <Field label="Subjects source">
                <select
                  value={bulkMode}
                  onChange={(e) => setBulkMode(e.target.value)}
                >
                  <option value="json">JSON grant array</option>
                  <option value="group">Smart-group members</option>
                </select>
              </Field>
              {bulkMode === 'json' ? (
                <JsonEditor
                  label="Grant entries (up to 1000)"
                  value={bulkJson}
                  onChange={setBulkJson}
                  rows={6}
                />
              ) : (
                <Field label="Smart-group name">
                  <input
                    required
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                  />
                </Field>
              )}
              <p className={styles.muted}>
                The limit, expiry, start and reason above are defaults. Each
                JSON entry may override them. Spend limits use USD strings;
                request and token limits use integers. The API creates valid
                items and reports each failed item separately.
              </p>
              {bulkMode === 'group' && (
                <p className={styles.muted}>
                  Expands current group members into individual user grants. Use
                  a budget grouped by user; this does not grant one shared group
                  bucket.
                </p>
              )}
            </MutationForm>
          </div>
        </div>
      </Panel>
      <GrantResult result={result} />
    </>
  );
}
