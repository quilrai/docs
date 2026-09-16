import React, {useState} from 'react';
import {Play} from 'lucide-react';
import styles from './styles.module.css';

/**
 * Host-agnostic video embed.
 *
 * <VideoEmbed
 *   src="/video/local-mcp-explainer.mp4"   // or a YouTube/Vimeo embed URL
 *   poster="/img/local-mcp/explainer-poster.jpg"
 *   title="What is Local MCP?"
 *   duration="1:28"
 * />
 *
 * Nothing loads until the reader clicks, so the page stays fast and the
 * video host can change later without touching any page that uses this.
 */
export default function VideoEmbed({
  src,
  poster,
  title,
  description,
  duration,
  // treat as an iframe embed when the host is a known player
  iframe: iframeProp,
}) {
  const [active, setActive] = useState(false);

  const isIframe =
    iframeProp ??
    /(?:youtube\.com|youtu\.be|vimeo\.com|player\.|iframe)/i.test(src || '');

  if (!src) return null;

  return (
    <div className={`${styles.wrap} not-prose`}>
      {(title || duration) && (
        <div className={styles.head}>
          {title && <span className={styles.title}>{title}</span>}
          {duration && <span className={styles.duration}>{duration}</span>}
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
              src={src}
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

      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
