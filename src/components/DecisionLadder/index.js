import React from 'react';
import styles from './styles.module.css';

/**
 * "Ordered checks, first match wins" diagram.
 *
 *   <DecisionLadder
 *     steps={[{ id, question, hint?, yes: { label, detail?, tone } }]}
 *     fallback={{ label, detail?, tone }}
 *     active="stepId" | "fallback"     // optional: light one path
 *     activeDetail={node | string}      // optional: extra panel on the lit outcome
 *     compact yesLabel="yes" noLabel="no"
 *   />
 *
 * tone: success | info | accent | warning | danger | neutral
 *
 * With `active`, steps before it read "no", the active step's yes-branch is
 * lit and everything after it is dimmed. Without `active` it is a static
 * diagram.
 */
const TONES = new Set(['success', 'info', 'accent', 'warning', 'danger', 'neutral']);

function toneClass(tone) {
  return styles[`tone_${TONES.has(tone) ? tone : 'neutral'}`];
}

function Outcome({ outcome, lit, children }) {
  if (!outcome) return null;
  return (
    <div className={`${styles.outcome} ${toneClass(outcome.tone)} ${lit ? styles.outcomeLit : ''}`}>
      <span className={styles.outcomeLabel}>{outcome.label}</span>
      {outcome.detail ? <span className={styles.outcomeDetail}>{outcome.detail}</span> : null}
      {lit && children ? <div className={styles.activeDetail}>{children}</div> : null}
    </div>
  );
}

export default function DecisionLadder({
  steps = [],
  fallback,
  active,
  activeDetail,
  compact = false,
  yesLabel = 'yes',
  noLabel = 'no',
  label,
}) {
  const hasActive = active !== undefined && active !== null && active !== '';
  let activeIndex = -1;
  if (hasActive) {
    activeIndex = active === 'fallback' ? steps.length : steps.findIndex((s) => s.id === active);
  }

  const stateFor = (index) => {
    if (!hasActive || activeIndex < 0) return 'static';
    if (index < activeIndex) return 'passed';
    if (index === activeIndex) return 'active';
    return 'skipped';
  };

  const fallbackState = stateFor(steps.length);

  return (
    <div
      className={`${styles.wrapper} ${compact ? styles.compact : ''} ${hasActive ? styles.hasActive : ''} not-prose`}
    >
      <ol className={styles.ladder} aria-label={label || 'Checks in order, first match wins'}>
        {steps.map((step, index) => {
          const state = stateFor(index);
          return (
            <li
              key={step.id || index}
              className={`${styles.row} ${styles[state]}`}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <span className={styles.num} aria-hidden="true">
                {index + 1}
              </span>
              <div className={styles.question}>
                <span className={styles.questionText}>{step.question}</span>
                {step.hint && !compact ? <span className={styles.hint}>{step.hint}</span> : null}
              </div>
              <span className={styles.yes} aria-hidden="true">
                <span className={styles.yesLabel}>{yesLabel}</span>
                <svg className={styles.yesLine} viewBox="0 0 48 10" preserveAspectRatio="none">
                  <line x1="0" y1="5" x2="42" y2="5" />
                  <path d="M40 1.5 L46 5 L40 8.5" />
                </svg>
              </span>
              <span className={styles.srOnly}>{`${yesLabel}: `}</span>
              <Outcome outcome={step.yes} lit={state === 'active'}>
                {activeDetail}
              </Outcome>
              <span className={styles.no} aria-hidden="true">
                {noLabel}
              </span>
            </li>
          );
        })}
        {fallback ? (
          <li
            className={`${styles.row} ${styles.fallbackRow} ${styles[fallbackState]}`}
            aria-current={fallbackState === 'active' ? 'step' : undefined}
          >
            <span className={`${styles.num} ${styles.numEnd}`} aria-hidden="true" />
            <div className={styles.question}>
              <span className={styles.questionText}>
                {steps.length > 0 ? `None of the above` : 'Otherwise'}
              </span>
            </div>
            <span className={styles.yes} aria-hidden="true">
              <svg className={styles.yesLine} viewBox="0 0 48 10" preserveAspectRatio="none">
                <line x1="0" y1="5" x2="42" y2="5" />
                <path d="M40 1.5 L46 5 L40 8.5" />
              </svg>
            </span>
            <Outcome outcome={fallback} lit={fallbackState === 'active'}>
              {activeDetail}
            </Outcome>
          </li>
        ) : null}
      </ol>
      <div className={styles.brand}>
        <span className={styles.brandDot} />
        QuilrAI
      </div>
    </div>
  );
}
