import React, {useRef, useState} from 'react';
import {usePluginData} from '@docusaurus/useGlobalData';
import {ClipboardList, ExternalLink} from 'lucide-react';
import styles from './styles.module.css';

/**
 * The Deployment SOP, pulled from quilrai/installdocs into /sop/ at build time
 * (scripts/sync-install-sop.js, plugins/install-sop.js). Steps come from the
 * synced SOP, so they stay current; an unknown track or step key fails the build.
 *
 *   <InstallSop track="endpoint-agent" />                       embedded, with step tabs
 *   <InstallSop track="endpoint-agent" step="installing-using-mdm" />
 *   <SopLink track="endpoint-agent" step="enable-pac-routing" />  inline link to one step
 *
 * Plain <a> on purpose: /sop/ is static HTML, not a Docusaurus route.
 */

function resolve(manifest, trackId, stepKey) {
  const track = manifest?.tracks?.find((t) => t.id === trackId);
  if (!track) {
    throw new Error(`Unknown SOP track "${trackId}". Valid: ${manifest?.tracks?.map((t) => t.id).join(', ')}`);
  }
  const step = stepKey ? track.steps.find((s) => s.key === stepKey) : null;
  if (stepKey && !step) {
    throw new Error(`Unknown step "${stepKey}" in SOP track "${trackId}". Valid: ${track.steps.map((s) => s.key).join(', ')}`);
  }
  return {track, step};
}

export function SopLink({track: trackId, step: stepKey, children}) {
  const {track, step} = resolve(usePluginData('install-sop'), trackId, stepKey);
  const href = step ? step.url : track.steps[0].url;
  const text = children ?? (step ? `SOP step ${step.number}: ${step.label}` : `${track.title} installation SOP`);
  return (
    <a href={href} target="_blank" rel="noopener">
      {text}
    </a>
  );
}

export default function InstallSop({track: trackId, step: stepKey, title}) {
  const manifest = usePluginData('install-sop');
  const {track, step} = resolve(manifest, trackId, stepKey);
  const first = step ?? track.steps[0];
  const [src, setSrc] = useState(first.url);
  // Where the reader actually is: they can navigate inside the frame (same origin).
  const [current, setCurrent] = useState(first.url);
  const frame = useRef(null);

  const onLoad = () => {
    try {
      const loc = frame.current.contentWindow.location;
      setCurrent(loc.pathname + loc.hash);
    } catch {}
  };
  // Match on the step folder, so /Step 5 - X/, /Step 5 - X/index.html and #anchors all count.
  const stepDir = (url) => decodeURIComponent(url).replace(/\/index\.html$/, '');
  const active = track.steps.find((s) => {
    const here = decodeURIComponent(current).split('#')[0];
    return here === stepDir(s.url) || here.startsWith(`${stepDir(s.url)}/`);
  });

  return (
    <div className={`${styles.wrap} not-prose`}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>
          <ClipboardList size={13} strokeWidth={2.2} aria-hidden="true" />
          Installation SOP
        </span>
        <span className={styles.title}>{title ?? track.title}</span>
        <a className={styles.open} href={current} target="_blank" rel="noopener">
          Open full page
          <ExternalLink size={12} strokeWidth={2.1} aria-hidden="true" />
        </a>
      </div>

      <ol className={styles.steps}>
        {track.steps.map((s) => (
          <li key={s.key}>
            <a
              href={s.url}
              className={`${styles.step} ${active?.key === s.key ? styles.active : ''}`}
              aria-current={active?.key === s.key ? 'step' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                setSrc(s.url);
                setCurrent(s.url);
              }}>
              <span className={styles.num}>{s.number}</span>
              {s.label}
            </a>
          </li>
        ))}
      </ol>

      <iframe
        ref={frame}
        className={styles.frame}
        src={src}
        title={`${track.title} installation SOP`}
        loading="lazy"
        allow="clipboard-write"
        onLoad={onLoad}
      />

      {manifest.commit && (
        <div className={styles.foot}>
          Synced from quilrai/installdocs at <code>{manifest.commit.slice(0, 7)}</code> on every docs build.
        </div>
      )}
    </div>
  );
}
