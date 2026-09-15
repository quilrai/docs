import React from 'react';
import styles from './styles.module.css';

// Severity of an effect value, using the same four tones and the same
// vocabulary as the console's policy editor. Keep these sets in step with it:
// the colour is how a reader judges blast radius at a glance.
const BLOCKED = new Set(['block', 'deny', 'critical', 'very_critical', 'required']);
const FLAGGED = new Set(['redact', 'partial-redact', 'prompt', 'high', 'medium']);
const ALLOWED = new Set(['allow', 'true']);

function toneFor(value, explicit) {
  if (explicit) return explicit;
  const normalized = String(value).trim().toLowerCase();
  if (BLOCKED.has(normalized)) return 'blocked';
  if (FLAGGED.has(normalized)) return 'flagged';
  if (ALLOWED.has(normalized)) return 'allowed';
  return 'info';
}

function Chip({ children, tone }) {
  return <span className={`${styles.chip} ${tone ? styles[tone] : ''}`}>{children}</span>;
}

function toList(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** One condition line: lead word, field, operator, then its value chips. */
function ConditionRow({ row, index, join }) {
  const lead = index === 0 ? 'When' : row.join || join || 'and';
  const isData = row.tone === 'data' || row.field === 'data found';
  const values = toList(row.values ?? row.value);

  if (row.group) {
    const label =
      row.group === 'any'
        ? 'any of the following'
        : row.group === 'none'
          ? 'none of the following'
          : 'all of the following';
    return (
      <>
        <div className={styles.row}>
          <span className={`${styles.lead} ${index === 0 ? styles.leadWhen : styles.leadJoin}`}>
            {lead}
          </span>
          <span className={styles.tokens}>
            <span className={styles.op}>{label}</span>
          </span>
        </div>
        <div className={styles.group}>
          {(row.rows || []).map((inner, innerIndex) => (
            <ConditionRow
              key={innerIndex}
              row={inner}
              index={innerIndex}
              join={row.group === 'any' ? 'or' : 'and'}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className={styles.row}>
      <span className={`${styles.lead} ${index === 0 ? styles.leadWhen : styles.leadJoin}`}>
        {index === 0 && !row.join ? 'When' : lead}
      </span>
      <span className={styles.tokens}>
        <span className={isData ? styles.dataField : styles.field}>{row.field}</span>
        {row.op ? <span className={styles.op}>{row.op}</span> : null}
        {values.map((value, valueIndex) => (
          <Chip key={valueIndex} tone={isData ? 'data' : undefined}>
            {value}
          </Chip>
        ))}
      </span>
    </div>
  );
}

/** One effect line: the setting, an arrow, then its value chips. */
function EffectRow({ effect }) {
  const values = toList(effect.values ?? effect.value);
  return (
    <>
      <div className={styles.row}>
        <span />
        <span className={styles.tokens}>
          <span className={styles.field}>{effect.effect}</span>
          <span className={styles.arrow} aria-hidden="true">
            &rarr;
          </span>
          {values.map((value, index) => (
            <Chip key={index} tone={toneFor(value, effect.tone)}>
              {value}
            </Chip>
          ))}
        </span>
      </div>
      {effect.detail ? (
        <div className={styles.detail}>
          {effect.detail.map((line, index) =>
            typeof line === 'string' ? (
              <span key={index}>{line}</span>
            ) : (
              <span key={index}>
                <b>{line.label}</b> {line.value}
              </span>
            )
          )}
        </div>
      ) : null}
    </>
  );
}

function RuleBody({ when, then, join }) {
  return (
    <>
      {(when || []).map((row, index) => (
        <ConditionRow key={index} row={row} index={index} join={join} />
      ))}
      {(when || []).length === 0 ? (
        <div className={styles.row}>
          <span className={`${styles.lead} ${styles.leadWhen}`}>When</span>
          <span className={styles.tokens}>
            <span className={styles.op}>always</span>
          </span>
        </div>
      ) : null}
      {(then || []).length > 0 ? (
        <>
          <div className={styles.thenBar}>
            <span>Then</span>
            <i />
          </div>
          {then.map((effect, index) => (
            <EffectRow key={index} effect={effect} />
          ))}
        </>
      ) : null}
    </>
  );
}

/**
 * A policy rendered the way the console's sentence editor renders it.
 *
 * Single rule:   <PolicyCard name stage priority when={[...]} then={[...]} />
 * Several data rules in one configuration: pass `rules` instead of when/then.
 */
export default function PolicyCard({
  name,
  stage,
  priority,
  note,
  when,
  then,
  rules,
  join,
}) {
  return (
    <div className={`${styles.card} not-prose`}>
      <div className={styles.head}>
        <span className={styles.name}>{name}</span>
        {stage ? <span className={styles.tag}>{stage}</span> : null}
      </div>
      {priority !== undefined || stage ? (
        <p className={styles.identity}>
          {stage ? (
            <>
              runs <span className={styles.field}>on {stage}</span>
            </>
          ) : null}
          {priority !== undefined ? (
            <>
              <span className={styles.sep} aria-hidden="true">
                &middot;
              </span>
              priority <span className={styles.field}>{priority}</span>
            </>
          ) : null}
        </p>
      ) : null}
      {note ? <p className={styles.identity}>{note}</p> : null}
      {rules
        ? rules.map((rule, index) => (
            <div className={styles.rule} key={index}>
              <span className={styles.ruleLabel}>{rule.label || `Data rule ${index + 1}`}</span>
              <RuleBody when={rule.when} then={rule.then} join={rule.join || join} />
            </div>
          ))
        : <RuleBody when={when} then={then} join={join} />}
    </div>
  );
}
