import React from 'react';
import {ChevronRight, ExternalLink, MousePointerClick, Navigation} from 'lucide-react';
import styles from './styles.module.css';

export default function ConsolePath({
  console: consoleName,
  href,
  path = [],
  action,
  note,
  tone = 'quilr',
  label = 'Go to',
}) {
  const segments = Array.isArray(path) ? path : [path];

  return (
    <div className={`${styles.wrap} ${styles[tone] ?? ''} not-prose`}>
      <div className={styles.trail}>
        <span className={styles.eyebrow}>
          <Navigation size={13} strokeWidth={2.2} aria-hidden="true" />
          {label}
        </span>

        {consoleName &&
          (href ? (
            <a
              className={`${styles.crumb} ${styles.console}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer">
              {consoleName}
              <ExternalLink size={12} strokeWidth={2.1} aria-hidden="true" />
            </a>
          ) : (
            <span className={`${styles.crumb} ${styles.console}`}>{consoleName}</span>
          ))}

        {segments.map((segment, i) => (
          <React.Fragment key={`${segment}-${i}`}>
            {(consoleName || i > 0) && (
              <ChevronRight className={styles.sep} size={14} strokeWidth={2.2} aria-hidden="true" />
            )}
            <span className={styles.crumb}>{segment}</span>
          </React.Fragment>
        ))}

        {action && (
          <>
            <ChevronRight className={styles.sep} size={14} strokeWidth={2.2} aria-hidden="true" />
            <span className={styles.action}>
              <MousePointerClick size={13} strokeWidth={2.1} aria-hidden="true" />
              {action}
            </span>
          </>
        )}
      </div>

      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
