import React, { useState } from 'react';
import {
  Badge,
  Field,
  Freshness,
  LoadState,
  Pager,
  Panel,
  Percent,
  Table,
  format,
  useLoad,
} from './ui';
import styles from './styles.module.css';

const isCalendar = (budget) => budget?.window?.kind === 'calendar';

function BudgetCell({ budget }) {
  if (!budget) return '–';
  return (
    <>
      <strong>{budget.label || budget.id}</strong>
      <small>
        {budget.id} · {budget.metric}
        {budget.mode ? ` · ${budget.mode}` : ''}
      </small>
    </>
  );
}

function SubjectCell({ row }) {
  return (
    <>
      <strong>{format(row.subject)}</strong>
      {row.grant?.members_of && (
        <small>Smart group grant: members of {row.grant.members_of}</small>
      )}
      {row.grant?.source === 'auto' && <Badge>automatic raise</Badge>}
      <details>
        <summary>Bucket</summary>
        <code>{row.bucket}</code>
      </details>
    </>
  );
}

function ForecastCell({ forecast }) {
  if (!forecast) return '–';
  return (
    <>
      {forecast.exhausted ? (
        <Badge state="blocked">At limit</Badge>
      ) : forecast.exhausts_at ? (
        <strong>Runs out {forecast.exhausts_at}</strong>
      ) : (
        <span>Not before the reset</span>
      )}
      <small>
        {format(forecast.rate_per_hour)} per hour over{' '}
        {format(forecast.lookback_hours)}h
      </small>
    </>
  );
}

const columns = (withBudget, onBudget) => [
  ...(withBudget
    ? [
        {
          label: 'Budget',
          render: (r) =>
            onBudget ? (
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => onBudget(r.budget?.id)}
              >
                <BudgetCell budget={r.budget} />
              </button>
            ) : (
              <BudgetCell budget={r.budget} />
            ),
        },
      ]
    : []),
  { label: 'Subject', render: (r) => <SubjectCell row={r} /> },
  {
    label: 'Used / effective limit',
    render: (r) => (
      <>
        {format(r.used)} / {format(r.effective_limit)}
        {r.grant && (
          <small>
            Grant {format(r.grant.limit)} ·{' '}
            {r.grant.expires_at
              ? `ends ${r.grant.expires_at}`
              : 'no end date'}
          </small>
        )}
      </>
    ),
  },
  { label: 'Used %', render: (r) => <Percent value={r.pct} /> },
  {
    label: 'State',
    render: (r) => <Badge state={r.state}>{r.state || '–'}</Badge>,
  },
  { label: 'Runs out', render: (r) => <ForecastCell forecast={r.forecast} /> },
  {
    label: 'Projected at reset',
    render: (r) => (
      <>
        <strong>{format(r.forecast?.projected_total)}</strong>
        <small>
          {r.forecast?.projected_pct == null
            ? 'No percent'
            : `${r.forecast.projected_pct}% of the limit`}
        </small>
      </>
    ),
  },
];

function PageInfo({ data }) {
  if (!data) return null;
  return (
    <p className={styles.muted}>
      Lookback {data.lookback || '–'}
      {data.within ? ` · within ${data.within}` : ''}
      {data.method ? ` · ${data.method}` : ''}
      {data.truncated ? ' · results truncated' : ''}
    </p>
  );
}

function TenantForecast({ api, version, definitions, onBudget }) {
  const [filter, setFilter] = useState({
    within: '7d',
    lookback: '24h',
    budget_id: '',
    include_exhausted: true,
  });
  const [cursor, setCursor] = useState('');
  const query = {
    within: filter.within,
    lookback: filter.lookback,
    budget_id: filter.budget_id,
    // The API includes exhausted subjects by default; send only the opt-out.
    include_exhausted: filter.include_exhausted ? undefined : 'false',
    cursor,
    limit: 50,
  };
  const state = useLoad(
    () => api.getForecast(query),
    [api, version, JSON.stringify(query)],
  );
  function change(name, value) {
    setFilter((v) => ({ ...v, [name]: value }));
    setCursor('');
  }
  return (
    <Panel title="Who runs out soon">
      <p className={styles.muted}>
        Subjects of every calendar budget that are already at their limit or,
        at their rate over the lookback, reach it within the chosen time and
        before the window resets. Soonest first. Grants and Smart group grants
        are included in the effective limit.
      </p>
      <div className={styles.toolbar}>
        <Field label="Runs out within" hint="Duration such as 12h or 7d.">
          <input
            value={filter.within}
            pattern="[0-9]+[hd]"
            onChange={(e) => change('within', e.target.value)}
          />
        </Field>
        <Field label="Rate lookback" hint="Default 24h, at most 31d.">
          <input
            value={filter.lookback}
            pattern="[0-9]+[hd]"
            onChange={(e) => change('lookback', e.target.value)}
          />
        </Field>
        <Field label="Budget">
          <select
            value={filter.budget_id}
            onChange={(e) => change('budget_id', e.target.value)}
          >
            <option value="">All calendar budgets</option>
            {definitions.filter(isCalendar).map((b) => (
              <option key={b.id} value={b.id}>
                {b.label || b.id} · {b.id}
              </option>
            ))}
          </select>
        </Field>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={filter.include_exhausted}
            onChange={(e) => change('include_exhausted', e.target.checked)}
          />
          Include subjects already at their limit
        </label>
      </div>
      <LoadState state={state} />
      <Freshness data={state.data} />
      <PageInfo data={state.data} />
      {state.data?.not_forecast?.length > 0 && (
        <p className={styles.notice}>
          Not forecast (rolling or lifetime window):{' '}
          {state.data.not_forecast.join(', ')}
        </p>
      )}
      {state.data && (
        <>
          <Table
            rows={state.data.items}
            columns={columns(true, onBudget)}
            empty="No subject is at its limit or projected to reach it in this time."
          />
          <Pager
            data={state.data}
            onNext={setCursor}
            onReset={() => setCursor('')}
          />
        </>
      )}
    </Panel>
  );
}

function Series({ series, truncated }) {
  if (!series?.length) return null;
  const peak = Math.max(...series.map((p) => Number(p.used) || 0), 0);
  return (
    <details open>
      <summary>
        Hourly usage over the lookback ({series.length} hours
        {truncated ? ', truncated' : ''})
      </summary>
      <Table
        rows={series}
        columns={[
          { label: 'Hour (UTC)', key: 'hour' },
          {
            label: 'Used',
            render: (p) => (
              <>
                {format(p.used)}
                <div className={styles.progress}>
                  <span
                    style={{
                      width: `${peak ? ((Number(p.used) || 0) / peak) * 100 : 0}%`,
                    }}
                  />
                </div>
              </>
            ),
          },
        ]}
      />
    </details>
  );
}

function BurnRate({ api, version, definitions, budgetId, setBudgetId }) {
  const [filter, setFilter] = useState({
    lookback: '24h',
    min_projected_pct: '',
    'subject.user': '',
    include_series: true,
  });
  const [cursor, setCursor] = useState('');
  const query = {
    lookback: filter.lookback,
    min_projected_pct: filter.min_projected_pct,
    'subject.user': filter['subject.user'],
    include_series: filter.include_series ? undefined : 'false',
    cursor,
    limit: 50,
  };
  const state = useLoad(
    () =>
      budgetId ? api.getBurnRate(budgetId, query) : Promise.resolve(null),
    [api, version, budgetId, JSON.stringify(query)],
  );
  function change(name, value) {
    setFilter((v) => ({ ...v, [name]: value }));
    setCursor('');
  }
  const chosen = definitions.find((b) => b.id === budgetId);
  const unsupported = state.error?.code === 'burn_rate_not_supported';
  return (
    <Panel title="Burn rate for one budget">
      <p className={styles.muted}>
        Per subject: usage, effective limit, the rate over the lookback and a
        projection that holds that rate until the window resets. Calendar
        budgets only. Filter to one subject to see its hourly usage.
      </p>
      <div className={styles.toolbar}>
        <Field label="Budget">
          <select
            value={budgetId}
            onChange={(e) => {
              setBudgetId(e.target.value);
              setCursor('');
            }}
          >
            <option value="">Choose a budget</option>
            {definitions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label || b.id} · {b.id}
                {isCalendar(b) ? '' : ` · ${b.window?.kind || 'not calendar'}`}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rate lookback" hint="Default 24h, at most 31d.">
          <input
            value={filter.lookback}
            pattern="[0-9]+[hd]"
            onChange={(e) => change('lookback', e.target.value)}
          />
        </Field>
        <Field label="Minimum projected %">
          <input
            type="number"
            min="0"
            value={filter.min_projected_pct}
            onChange={(e) => change('min_projected_pct', e.target.value)}
          />
        </Field>
        <Field label="User email filter">
          <input
            value={filter['subject.user']}
            onChange={(e) => change('subject.user', e.target.value)}
            placeholder="dana@example.com"
          />
        </Field>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={filter.include_series}
            onChange={(e) => change('include_series', e.target.checked)}
          />
          Hourly series when one subject matches
        </label>
      </div>
      {chosen && !isCalendar(chosen) && (
        <p className={styles.notice}>
          This budget has a {chosen.window?.kind || 'non-calendar'} window. The
          API answers 422 burn_rate_not_supported: rolling totals also fall as
          charges age out, and lifetime budgets never reset.
        </p>
      )}
      {unsupported && (
        <p className={styles.notice}>
          Burn rate is not available for this budget. Only budgets with a
          calendar window are forecast.
        </p>
      )}
      {budgetId && <LoadState state={state} />}
      <Freshness data={state.data} />
      <PageInfo data={state.data} />
      {state.data && (
        <>
          <Table
            rows={state.data.items}
            columns={columns(false)}
            empty="No subject has usage in this budget."
          />
          <Pager
            data={state.data}
            onNext={setCursor}
            onReset={() => setCursor('')}
          />
          <Series
            series={state.data.series}
            truncated={state.data.series_truncated}
          />
        </>
      )}
    </Panel>
  );
}

export default function Forecast({ api, version, period, budgets }) {
  const definitions = budgets?.data?.items || [];
  const [budgetId, setBudgetId] = useState('');
  return (
    <>
      <p className={styles.muted}>
        Forecasts need budgets:read and always use the current period.
      </p>
      {period === 'previous' && (
        <p className={styles.notice}>
          The usage period switch does not apply here: forecasts project the
          current window to its reset.
        </p>
      )}
      <TenantForecast
        api={api}
        version={version}
        definitions={definitions}
        onBudget={(id) => id && setBudgetId(id)}
      />
      <BurnRate
        api={api}
        version={version}
        definitions={definitions}
        budgetId={budgetId}
        setBudgetId={setBudgetId}
      />
    </>
  );
}
