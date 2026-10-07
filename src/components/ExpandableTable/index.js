import React, { useEffect, useId, useRef, useState } from 'react';
import { Maximize2, X, MoveHorizontal } from 'lucide-react';

function TableView(props) {
  return <table {...props} />;
}

// Copies each column heading onto its cells as data-label, so the expanded
// view can show the table as stacked records on narrow screens (CSS reads it
// with attr()) while keeping column identity visible.
function labelCells(root) {
  const table = root?.querySelector('table');
  if (!table) return;
  const heads = Array.from(table.querySelectorAll('thead th')).map((th) =>
    th.textContent.trim(),
  );
  table.querySelectorAll('tbody tr').forEach((tr) => {
    Array.from(tr.children).forEach((cell, i) => {
      if (heads[i]) cell.setAttribute('data-label', heads[i]);
    });
  });
}

// Marks a scroll container with data-overflow="true" while its content is
// wider than the box, so CSS can show a "scroll sideways" cue.
function useOverflowFlag(ref, active = true) {
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return undefined;
    const update = () => setOverflow(el.scrollWidth > el.clientWidth + 1);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [ref, active]);
  return overflow;
}

export default function ExpandableTable(props) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const inlineRef = useRef(null);
  const viewportRef = useRef(null);
  const inlineOverflow = useOverflowFlag(inlineRef);
  const expandedOverflow = useOverflowFlag(viewportRef, expanded);

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }

    labelCells(viewportRef.current);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setExpanded(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  return (
    <div className="expandable-table">
      <div className="expandable-table__toolbar">
        {inlineOverflow && (
          <span className="expandable-table__hint">
            <MoveHorizontal size={14} aria-hidden /> Scroll sideways for more columns
          </span>
        )}
        <button
          type="button"
          className="expandable-table__button"
          aria-label="Expand table"
          title="Expand table"
          onClick={() => setExpanded(true)}
        >
          <Maximize2 size={15} aria-hidden />
        </button>
      </div>
      <div
        className="table-scroll-wrapper"
        ref={inlineRef}
        data-overflow={inlineOverflow}
        tabIndex={inlineOverflow ? 0 : undefined}
        role={inlineOverflow ? 'region' : undefined}
        aria-label={inlineOverflow ? 'Table, scrolls horizontally' : undefined}
      >
        <TableView {...props} />
      </div>

      {expanded && (
        <div
          className="expandable-table__overlay"
          role="presentation"
          onMouseDown={() => setExpanded(false)}
        >
          <div
            className="expandable-table__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="expandable-table__dialog-toolbar">
              <h2 id={titleId} className="sr-only">
                Expanded table
              </h2>
              {expandedOverflow && (
                <span className="expandable-table__hint">
                  <MoveHorizontal size={14} aria-hidden /> Scroll sideways for more columns
                </span>
              )}
              <button
                type="button"
                className="expandable-table__button"
                aria-label="Close expanded table"
                title="Close"
                onClick={() => setExpanded(false)}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              >
                <X size={17} aria-hidden />
              </button>
            </div>
            <div
              className="expandable-table__viewport"
              ref={viewportRef}
              data-overflow={expandedOverflow}
              tabIndex={0}
            >
              <TableView {...props} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
