import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import {ArrowUpRight, Clapperboard, Play} from 'lucide-react';
import {videoById, embedUrl, watchUrl, KIND_LABEL} from '@site/src/data/videos';
import styles from './styles.module.css';

/**
 * Click-to-play video.
 *
 * From the catalog (src/data/videos.json), which also lists it on /videos:
 *   <VideoEmbed id="mcp-input-aliases" />
 *
 * Or ad hoc:
 *   <VideoEmbed
 *     src="/video/local-mcp-explainer.mp4"   // or a YouTube/Vimeo embed URL
 *     poster="/img/local-mcp/explainer-poster.jpg"
 *     title="What is Local MCP?"
 *     duration="1:28"
 *   />
 *
 * Nothing loads from the video host until the reader clicks, so the page
 * stays fast and no third-party requests are made on page load.
 */
export default function VideoEmbed({id, ...props}) {
  const v = id ? videoById[id] : null;
  if (id && !v) throw new Error(`<VideoEmbed id="${id}"> is not in src/data/videos.json`);
  return v ? (
    <Player
      src={embedUrl(v)}
      poster={v.poster}
      title={v.title}
      description={props.description ?? v.description}
      duration={v.duration}
      kind={KIND_LABEL[v.kind]}
      links={[
        {href: watchUrl(v), label: 'YouTube', external: true},
        {to: `/videos#${v.id}`, label: 'All videos'},
      ]}
    />
  ) : (
    <Player {...props} />
  );
}

export function Player({
  src,
  poster,
  title,
  description,
  duration,
  kind,
  links,
  // treat as an iframe embed when the host is a known player
  iframe: iframeProp,
  bare = false,
  // skip the poster (the reader already chose this video somewhere else)
  startActive = false,
}) {
  const [active, setActive] = useState(startActive);

  const isIframe =
    iframeProp ??
    /(?:youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|player\.|iframe)/i.test(src || '');

  if (!src) return null;

  // The poster click is the play intent, so start playback right away.
  const iframeSrc = /[?&]autoplay=/.test(src) ? src : `${src}${src.includes('?') ? '&' : '?'}autoplay=1`;

  return (
    <div className={`${bare ? styles.bare : styles.wrap} not-prose`}>
      {!bare && (title || duration) && (
        <div className={styles.head}>
          {title && <span className={styles.title}>{title}</span>}
          <span className={styles.meta}>
            {kind && <span className={styles.kind}>{kind}</span>}
            {duration && <span className={styles.duration}>{duration}</span>}
          </span>
        </div>
      )}

      <div className={styles.frame}>
        {!active && (
          <button
            type="button"
            className={styles.poster}
            onClick={() => setActive(true)}
            aria-label={title ? `Play: ${title}` : 'Play video'}
            style={poster ? {backgroundImage: `url(${poster})`} : undefined}>
            <span className={styles.playBadge}>
              <Play size={22} strokeWidth={2.4} aria-hidden="true" />
            </span>
          </button>
        )}

        {active &&
          (isIframe ? (
            <iframe
              className={styles.player}
              src={iframeSrc}
              title={title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              className={styles.player}
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
            />
          ))}
      </div>

      {!bare && (description || links?.length) && (
        <div className={styles.foot}>
          {description && <p className={styles.description}>{description}</p>}
          {links?.length > 0 && (
            <span className={styles.links}>
              {links.map((l) =>
                l.external ? (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                ) : (
                  <Link key={l.label} to={l.to}>
                    <Clapperboard size={12} aria-hidden="true" /> {l.label}
                  </Link>
                ),
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
