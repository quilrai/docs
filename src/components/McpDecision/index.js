import React from 'react';
import {ArrowRight, Building2, ShieldCheck, Sparkles} from 'lucide-react';
import styles from './styles.module.css';

function ChoiceCard({kind, eyebrow, title, children, points = []}) {
  const Icon = kind === 'quilr' ? ShieldCheck : Building2;

  return (
    <article className={`${styles.choiceCard} ${styles[kind]}`}>
      <div className={styles.cardHeader}>
        <span className={styles.iconWrap}><Icon size={18} strokeWidth={1.9} /></span>
        <span className={styles.eyebrow}>{eyebrow}</span>
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
      {points.length > 0 && (
        <ul>
          {points.map((point) => (
            <li key={point}><ArrowRight size={14} aria-hidden="true" />{point}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function McpDecision({
  officialTitle,
  official,
  officialPoints = [],
  quilrTitle,
  quilr,
  quilrPoints = [],
  verdict,
}) {
  return (
    <section className={styles.decisionBlock} aria-label="Integration decision guide">
      <div className={styles.choiceGrid}>
        <ChoiceCard kind="official" eyebrow="Provider-native" title={officialTitle} points={officialPoints}>
          {official}
        </ChoiceCard>
        <ChoiceCard kind="quilr" eyebrow="Quilr-managed" title={quilrTitle} points={quilrPoints}>
          {quilr}
        </ChoiceCard>
      </div>
      {verdict && (
        <div className={styles.verdict}>
          <span><Sparkles size={16} aria-hidden="true" /> Decision signal</span>
          <strong>{verdict}</strong>
        </div>
      )}
    </section>
  );
}

export function McpSignalGrid({items}) {
  return (
    <div className={styles.signalGrid}>
      {items.map((item) => (
        <article className={styles.signalCard} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
