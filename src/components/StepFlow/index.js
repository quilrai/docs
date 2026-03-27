import React from 'react';
import styles from './styles.module.css';

function Chevron() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 4.5l5.5 5.5-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderLine(text) {
  const parts = text.split(/(✓|✗)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part === '✓') return <span key={i} className={styles.check}>✓</span>;
    if (part === '✗') return <span key={i} className={styles.cross}>✗</span>;
    return <span key={i}>{part}</span>;
  });
}

export default function StepFlow({ steps = [] }) {
  return (
    <div className={`${styles.wrapper} not-prose`}>
      <div className={styles.flow}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className={styles.connector} aria-hidden="true">
                <Chevron />
              </div>
            )}
            <div className={styles.card}>
              <div className={styles.cardHeader} data-step={i}>
                {step.label}
              </div>
              <div className={styles.cardBody}>
                {(step.items || []).map((item, j) => (
                  <div key={j} className={styles.line}>
                    {renderLine(item)}
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className={styles.brand}>
        <span className={styles.brandDot} />
        QuilrAI
      </div>
    </div>
  );
}
