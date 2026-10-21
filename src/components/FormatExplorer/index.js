import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import DecisionLadder from '@site/src/components/DecisionLadder';
import styles from './styles.module.css';

/**
 * Any-to-any format explorer: "I send <format> to <provider>", the decision
 * ladder for that pair, and a providers x formats matrix.
 *
 *   <FormatExplorer data={formatSupport} />
 *
 * Schema: see src/data/formatSupport.js. Deep link: ?from=<formatId>&to=<providerId>
 * (also accepted in the hash, #from=...&to=...).
 */
const SYMBOLS = {
  native: '●',
  switch: '⇄',
  adapter: '◆',
  translate: '↻',
  none: '–',
  soon: '◌',
};

const DEFAULT_SOON = {
  label: 'Coming soon',
  tone: 'neutral',
  description: 'Not supported yet. Support for this pair is planned.',
};

// `soon: true` on a cell (or mode 'soon') means "not supported yet, coming soon".
function modeOf(c) {
  if (!c) return 'none';
  if (c.soon || c.mode === 'soon') return 'soon';
  return c.mode || 'none';
}

const TONES = new Set(['success', 'info', 'accent', 'warning', 'danger', 'neutral']);

function toneOf(modes, mode) {
  const tone = modes?.[mode]?.tone;
  return TONES.has(tone) ? tone : 'neutral';
}

function withSoon(modes) {
  return modes.soon ? modes : { ...modes, soon: DEFAULT_SOON };
}

function getCell(data, providerId, formatId) {
  return data.cells?.[providerId]?.[formatId] || { mode: 'none', wire: '' };
}

function defaultSelection(data) {
  const formats = data.formats || [];
  const providers = data.providers || [];
  const hasFormat = (id) => formats.some((f) => f.id === id);
  const bedrock = providers.find((p) => /bedrock/i.test(p.id) || /bedrock/i.test(p.label));
  if (hasFormat('responses') && bedrock) return { from: 'responses', to: bedrock.id };
  return { from: formats[0]?.id, to: providers[0]?.id };
}

function readDeepLink(data) {
  if (typeof window === 'undefined') return null;
  const parse = (str) => new URLSearchParams(str.replace(/^[?#]/, ''));
  const candidates = [parse(window.location.search), parse(window.location.hash)];
  for (const params of candidates) {
    const from = params.get('from');
    const to = params.get('to');
    const okFrom = from && (data.formats || []).some((f) => f.id === from);
    const okTo = to && (data.providers || []).some((p) => p.id === to);
    if (okFrom || okTo) return { from: okFrom ? from : null, to: okTo ? to : null };
  }
  return null;
}

function writeDeepLink(from, to) {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    // Deep links are a convenience; never break the explorer over one.
  }
}

function Note({ text }) {
  const match = /^([✓✗])\s*(.*)$/.exec(text);
  if (!match) {
    return (
      <li>
        <span className={styles.markPlain} aria-hidden="true">
          &bull;
        </span>
        {text}
      </li>
    );
  }
  const ok = match[1] === '✓';
  return (
    <li>
      <span className={ok ? styles.markOk : styles.markNo} aria-hidden="true">
        {match[1]}
      </span>
      <span className={styles.srOnly}>{ok ? 'Supported: ' : 'Not supported: '}</span>
      {match[2]}
    </li>
  );
}

function Detail({ format, outcome, cell, modes }) {
  const mode = outcome.mode || 'none';
  return (
    <div className={styles.detail}>
      {mode !== 'none' && mode !== 'soon' && outcome.wire ? (
        <code className={styles.wire}>
          <span>{format?.endpoint || format?.label}</span>
          <span className={styles.wireArrow} aria-label="sent upstream as">
            &rarr;
          </span>
          <span>{outcome.wire}</span>
        </code>
      ) : null}
      {modes?.[mode]?.description ? <p className={styles.modeDesc}>{modes[mode].description}</p> : null}
      {cell.gated || cell.preview || mode === 'soon' ? (
        <div className={styles.badges}>
          {mode === 'soon' ? <span className={`${styles.badge} ${styles.badgeSoon}`}>soon</span> : null}
          {cell.gated ? <span className={`${styles.badge} ${styles.badgeGated}`}>off by default</span> : null}
          {cell.preview ? <span className={`${styles.badge} ${styles.badgePreview}`}>preview</span> : null}
        </div>
      ) : null}
      {outcome.notes && outcome.notes.length ? (
        <ul className={styles.notes}>
          {outcome.notes.map((note, i) => (
            <Note key={i} text={note} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function FormatExplorer({ data }) {
  const formats = data?.formats || [];
  const providers = data?.providers || [];
  const modes = useMemo(() => withSoon(data?.modes || {}), [data]);
  const uid = useId();
  const pickerRef = useRef(null);

  const [selection, setSelection] = useState(() => defaultSelection(data || {}));
  const [variantIndex, setVariantIndex] = useState(0);

  // Deep link is read after hydration so the server render stays deterministic.
  useEffect(() => {
    const link = readDeepLink(data || {});
    if (link) {
      setSelection((prev) => ({ from: link.from || prev.from, to: link.to || prev.to }));
    }
  }, [data]);

  const select = useCallback((next, { scroll = false } = {}) => {
    setSelection((prev) => {
      const merged = { ...prev, ...next };
      writeDeepLink(merged.from, merged.to);
      return merged;
    });
    setVariantIndex(0);
    if (scroll && pickerRef.current) {
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      pickerRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }, []);

  const format = formats.find((f) => f.id === selection.from);
  const provider = providers.find((p) => p.id === selection.to);
  const cell = getCell(data || {}, selection.to, selection.from);
  const variants = cell.variants || [];
  const variant = variants.length ? variants[Math.min(variantIndex, variants.length - 1)] : null;
  const outcome = variant
    ? { mode: modeOf(variant), wire: variant.wire, notes: variant.notes }
    : { mode: modeOf(cell), wire: cell.wire, notes: cell.notes };
  const isSoon = outcome.mode === 'soon';
  const activeStep = outcome.mode === 'none' || isSoon ? 'fallback' : outcome.mode;
  // A "soon" pair lands on the fallback row, but says so instead of the 400.
  const fallback = isSoon
    ? { label: modes.soon.label, tone: modes.soon.tone }
    : data.fallback;

  const groupedRows = useMemo(() => {
    const rows = [];
    let lastGroup;
    providers.forEach((p) => {
      if (p.group && p.group !== lastGroup) rows.push({ type: 'group', label: p.group });
      lastGroup = p.group;
      rows.push({ type: 'provider', provider: p });
    });
    return rows;
  }, [providers]);

  if (!formats.length || !providers.length) return null;

  return (
    <div className={`${styles.explorer} not-prose`}>
      <div className={styles.picker} ref={pickerRef}>
        <div className={styles.sentence}>
          <label htmlFor={`${uid}-from`}>I send</label>
          <select
            id={`${uid}-from`}
            className={styles.select}
            value={selection.from}
            onChange={(e) => select({ from: e.target.value })}
          >
            {formats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <label htmlFor={`${uid}-to`}>to</label>
          <select
            id={`${uid}-to`}
            className={styles.select}
            value={selection.to}
            onChange={(e) => select({ to: e.target.value })}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {variants.length > 1 ? (
          <div className={styles.variants} role="group" aria-label="Depends on the model">
            <span className={styles.variantsLabel}>Depends on the model:</span>
            {variants.map((v, i) => (
              <button
                type="button"
                key={i}
                className={`${styles.chip} ${i === variantIndex ? styles.chipOn : ''}`}
                aria-pressed={i === variantIndex}
                onClick={() => setVariantIndex(i)}
              >
                {v.when}
              </button>
            ))}
          </div>
        ) : null}

        <div aria-live="polite">
          <DecisionLadder
            label={`How ${format?.label || 'this format'} reaches ${provider?.label || 'this provider'}`}
            steps={data.ladder || []}
            fallback={fallback}
            active={activeStep}
            activeDetail={<Detail format={format} outcome={outcome} cell={cell} modes={modes} />}
          />
        </div>
      </div>

      <div className={styles.legend} aria-label="Legend">
        {Object.entries(modes).map(([id, m]) => (
          <span
            key={id}
            className={`${styles.legendItem} ${styles[`tone_${toneOf(modes, id)}`]} ${
              id === 'soon' ? styles.legendSoon : ''
            }`}
          >
            <span className={styles.sym} aria-hidden="true">
              {SYMBOLS[id] || '?'}
            </span>
            {m.label}
          </span>
        ))}
        <span className={styles.legendItem}>
          <span className={styles.varMark} aria-hidden="true">*</span>
          depends on the model
        </span>
      </div>

      <div className={styles.gridScroll} tabIndex={0} role="region" aria-label="Format support by provider">
        <table className={styles.grid}>
          <thead>
            <tr>
              <th scope="col" className={styles.corner}>
                Provider <span aria-hidden="true">\</span> you send
              </th>
              {formats.map((f) => (
                <th scope="col" key={f.id} className={f.id === selection.from ? styles.colOn : ''}>
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedRows.map((row, i) =>
              row.type === 'group' ? (
                <tr key={`g-${i}`} className={styles.groupRow}>
                  <th scope="colgroup" colSpan={formats.length + 1}>
                    {row.label}
                  </th>
                </tr>
              ) : (
                <tr key={row.provider.id}>
                  <th scope="row" className={row.provider.id === selection.to ? styles.rowOn : ''}>
                    {row.provider.label}
                  </th>
                  {formats.map((f) => {
                    const c = getCell(data, row.provider.id, f.id);
                    const mode = modeOf(c);
                    const selected = row.provider.id === selection.to && f.id === selection.from;
                    return (
                      <td key={f.id}>
                        <button
                          type="button"
                          className={`${styles.cell} ${styles[`tone_${toneOf(modes, mode)}`]} ${
                            mode === 'soon' ? styles.cellSoon : ''
                          } ${selected ? styles.cellOn : ''}`}
                          aria-pressed={selected}
                          aria-label={`${f.label} to ${row.provider.label}: ${modes[mode]?.label || mode}${
                            c.variants?.length ? ', depends on the model' : ''
                          }${c.gated ? ', off by default' : ''}${c.preview ? ', preview' : ''}`}
                          title={modes[mode]?.label || mode}
                          onClick={() => select({ from: f.id, to: row.provider.id }, { scroll: true })}
                        >
                          <span className={styles.sym} aria-hidden="true">
                            {SYMBOLS[mode] || '?'}
                          </span>
                          <span className={styles.cellLabel} aria-hidden="true">
                            {modes[mode]?.label || mode}
                          </span>
                          {mode === 'soon' ? (
                            <span className={styles.soonBadge} aria-hidden="true">Soon</span>
                          ) : null}
                          {c.variants?.length ? (
                            <span className={styles.varMark} aria-hidden="true">*</span>
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
