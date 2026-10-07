import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import MDXImg from '@theme-original/MDXComponents/Img';

// Markdown images (`![alt](src)`) open a full-screen view on click, Enter or
// Space. Escape, the close button or a click on the backdrop closes it and
// returns focus to the image. No dependencies beyond React.
// MDX hands markdown alt text over HTML-escaped ("Costs &amp; Savings").
function decode(text) {
  return String(text)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export default function ZoomImage(rawProps) {
  const props = rawProps.alt ? {...rawProps, alt: decode(rawProps.alt)} : rawProps;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const label = props.alt ? `Enlarge image: ${props.alt}` : 'Enlarge image';

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      } else if (e.key === 'Tab') {
        // Only one focusable control in the dialog: keep focus on it.
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="qd-zoom"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}>
        <MDXImg {...props} />
      </button>
      {open &&
        createPortal(
          <div
            className="qd-zoom__overlay"
            role="dialog"
            aria-modal="true"
            aria-label={props.alt || 'Enlarged image'}
            onClick={() => setOpen(false)}>
            <button
              type="button"
              ref={closeRef}
              className="qd-zoom__close"
              aria-label="Close enlarged image"
              onClick={() => setOpen(false)}>
              <X size={18} aria-hidden="true" />
            </button>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              className="qd-zoom__img"
              src={props.src}
              alt={props.alt || ''}
              onClick={(e) => e.stopPropagation()}
            />
            {props.alt && (
              <p className="qd-zoom__caption" onClick={(e) => e.stopPropagation()}>
                {props.alt}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
