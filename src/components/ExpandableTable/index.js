import React, { useEffect, useId, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

function TableView(props) {
  return <table {...props} />;
}

export default function ExpandableTable(props) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }

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
      <div className="table-scroll-wrapper">
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
              <button
                type="button"
                className="expandable-table__button"
                aria-label="Close expanded table"
                title="Close"
                onClick={() => setExpanded(false)}
              >
                <X size={17} aria-hidden />
              </button>
            </div>
            <div className="expandable-table__viewport">
              <TableView {...props} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
