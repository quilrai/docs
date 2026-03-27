import React from 'react';
import styles from './styles.module.css';

function DownArrow({ small }) {
  if (small) {
    return (
      <div className={`${styles.arrow} ${styles.arrowSmall}`} aria-hidden="true">
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="6" y1="2" x2="6" y2="14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 13l4 5 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className={styles.arrow} aria-hidden="true">
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="2" x2="8" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 20l5 6 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Chevron() {
  return (
    <div className={styles.chevron} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function ArchitectureDiagram({ source, gateway, destination }) {
  return (
    <div className={`${styles.wrapper} not-prose`}>
      {/* Source */}
      <div className={styles.externalBox}>
        <div className={styles.externalHeader}>{source.label}</div>
        <pre className={styles.codeBlock}><code>{source.code}</code></pre>
      </div>

      <DownArrow />

      {/* Gateway */}
      <div className={styles.gatewayBox}>
        <div className={styles.gatewayHeader}>{gateway.label}</div>
        <div className={styles.gatewayBody}>
          {gateway.phases.map((phase, pi) => (
            <React.Fragment key={pi}>
              {pi > 0 && <DownArrow small />}
              <div className={styles.phase}>
                {phase.label && (
                  <div className={styles.phaseLabel}>{phase.label}</div>
                )}
                <div className={styles.phaseStages}>
                  {phase.stages.map((stage, si) => (
                    <React.Fragment key={si}>
                      {si > 0 && <Chevron />}
                      <div className={styles.stage} data-phase={pi}>
                        <div className={styles.stageName}>{stage.label}</div>
                        <div className={styles.stageBody}>
                          {(stage.items || []).map((item, k) => (
                            <div key={k} className={styles.stageItem}>{item}</div>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ))}
          {gateway.footer && (
            <div className={styles.gatewayFooter}>{gateway.footer}</div>
          )}
        </div>
      </div>

      <DownArrow />

      {/* Destination */}
      <div className={styles.externalBox}>
        <div className={styles.externalHeader}>{destination.label}</div>
        <div className={styles.destGrid}>
          {destination.items.map((item, i) => (
            <span key={i} className={styles.destPill}>{item}</span>
          ))}
        </div>
      </div>

      <div className={styles.brand}>
        <span className={styles.brandDot} />
        QuilrAI
      </div>
    </div>
  );
}
