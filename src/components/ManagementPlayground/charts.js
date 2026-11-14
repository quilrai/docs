import React from 'react';
import styles from './styles.module.css';

// Number formats, stat tiles and the dependency-free bar chart shared by the
// LLM Gateway workspaces (Usage, Monitoring, Overview) and the MCP Gateway
// Analytics workspace. Usage.js re-exports them for existing imports.

export const num = (v) => (v === null || v === undefined ? '-' : Number(v).toLocaleString());
export const usd = (v) =>
  v === null || v === undefined
    ? '-'
    : `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: Number(v) < 1 && Number(v) > 0 ? 4 : 2 })}`;
export const isoDate = (d) => d.toISOString().slice(0, 10);
export const daysAgo = (n) => isoDate(new Date(Date.now() - n * 86400 * 1000));
export const monthStart = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
};

export function Stats({ items }) {
  return (
    <div className={styles.stats}>
      {items.filter(Boolean).map(([label, value]) => (
        <div key={label} className={styles.stat}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

/** A dependency-free bar chart: points = [{label, value, title}]. */
export function BarChart({ points, format = num, label }) {
  if (!points.length) return null;
  const max = Math.max(...points.map((p) => p.value), 0) || 1;
  return (
    <figure aria-label={label} style={{ margin: 0 }}>
      <div className={styles.chart} role="img" aria-label={`${label}: ${points.length} periods, peak ${format(max)}`}>
        {points.map((p) => (
          <div key={p.label} className={styles.chartBar} title={`${p.label}: ${format(p.value)}`}>
            <span style={{ height: `${Math.max((p.value / max) * 100, p.value > 0 ? 1 : 0)}%` }} />
          </div>
        ))}
      </div>
      <div className={styles.chartAxis}>
        <span>{points[0].label}</span>
        <span>peak {format(max)}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </figure>
  );
}
