import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight, Pause, Play, Volume2} from 'lucide-react';
import styles from './styles.module.css';

/**
 * Stepped walkthrough of a real console flow.
 *
 * <Walkthrough
 *   title="Approve a local package"
 *   audio="/audio/local-mcp/admin-narration.mp3"
 *   steps={[
 *     {label: 'Add', caption: 'Open the gateway', body: 'Longer text', image: '/img/...', code: 'npx ...'},
 *   ]}
 * />
 *
 * Steps render as a numbered rail; the active step shows its screenshot,
 * caption and optional command. Everything is plain text/images, so the
 * page stays searchable and the commands stay copy-pasteable.
 */
export default function Walkthrough({title, steps = [], audio, audioLabel = 'Play narration'}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);
  const count = steps.length;

  const step = steps[active] ?? {};

  const go = useCallback(
    (next) => {
      if (!count) return;
      setActive((prev) => {
        const target = typeof next === 'function' ? next(prev) : next;
        return Math.min(Math.max(target, 0), count - 1);
      });
    },
    [count],
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go((p) => p + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go((p) => p - 1);
      }
    },
    [go],
  );

  const toggleAudio = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;
    const onEnd = () => setPlaying(false);
    el.addEventListener('ended', onEnd);
    el.addEventListener('pause', onEnd);
    return () => {
      el.removeEventListener('ended', onEnd);
      el.removeEventListener('pause', onEnd);
    };
  }, []);

  const copyCode = useCallback(async () => {
    if (!step.code) return;
    try {
      await navigator.clipboard.writeText(step.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, [step.code]);

  const progress = useMemo(
    () => (count ? ((active + 1) / count) * 100 : 0),
    [active, count],
  );

  if (!count) return null;

  return (
    <div
      className={`${styles.wrap} not-prose`}
      role="group"
      aria-label={title || 'Walkthrough'}
      tabIndex={0}
      onKeyDown={onKeyDown}>
      <div className={styles.head}>
        <div className={styles.heading}>
          {title && <span className={styles.title}>{title}</span>}
          <span className={styles.counter}>
            Step {active + 1} of {count}
          </span>
        </div>

        {audio && (
          <button type="button" className={styles.audioBtn} onClick={toggleAudio}>
            {playing ? (
              <Pause size={13} strokeWidth={2.3} aria-hidden="true" />
            ) : (
              <Play size={13} strokeWidth={2.3} aria-hidden="true" />
            )}
            {playing ? 'Pause narration' : audioLabel}
            <Volume2 size={13} strokeWidth={2} aria-hidden="true" className={styles.audioIcon} />
          </button>
        )}
      </div>

      {audio && <audio ref={audioRef} src={audio} preload="none" />}

      <div className={styles.rail} role="tablist" aria-label="Steps">
        {steps.map((s, i) => (
          <button
            key={`${s.label}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`${styles.pill} ${i === active ? styles.pillActive : ''} ${
              i < active ? styles.pillDone : ''
            }`}
            onClick={() => go(i)}>
            <span className={styles.pillNum}>{i + 1}</span>
            <span className={styles.pillLabel}>{s.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressBar} style={{width: `${progress}%`}} />
      </div>

      <div className={styles.stage}>
        {step.image && (
          <figure className={styles.figure}>
            <img
              className={styles.shot}
              src={step.image}
              alt={step.alt || step.caption || step.label}
              loading="lazy"
            />
          </figure>
        )}

        <div className={styles.detail}>
          {step.caption && <p className={styles.caption}>{step.caption}</p>}
          {step.body && <p className={styles.body}>{step.body}</p>}

          {step.code && (
            <div className={styles.codeWrap}>
              <div className={styles.codeHead}>
                <span>{step.codeLabel || 'Run in your terminal'}</span>
                <button type="button" className={styles.copyBtn} onClick={copyCode}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className={styles.code}>
                <code>{step.code}</code>
              </pre>
            </div>
          )}

          {step.note && <p className={styles.note}>{step.note}</p>}
        </div>
      </div>

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => go((p) => p - 1)}
          disabled={active === 0}>
          <ChevronLeft size={14} strokeWidth={2.3} aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => go((p) => p + 1)}
          disabled={active === count - 1}>
          Next
          <ChevronRight size={14} strokeWidth={2.3} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
