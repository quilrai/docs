import React, {useState, useEffect, useCallback, useRef} from 'react';
import {createPortal} from 'react-dom';
import {useLocation} from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import OriginalSearchBar from '@theme-original/SearchBar';
import {Search} from 'lucide-react';

function SearchModal({onClose, children}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div
      className="search-modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}>
      <div className="search-modal">
        {children}
        <div className="search-modal__footer">
          <div className="search-modal__footer-item">
            <kbd>↵</kbd>
            <span>select</span>
          </div>
          <div className="search-modal__footer-item">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>navigate</span>
          </div>
          <div className="search-modal__footer-item">
            <kbd>esc</kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function SearchBarWrapper(props) {
  const [isOpen, setIsOpen] = useState(false);
  const isBrowser = useIsBrowser();
  const location = useLocation();
  const modalSearchRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isBrowser) {
      const timer = setTimeout(() => {
        const input = modalSearchRef.current?.querySelector('input');
        if (input) {
          input.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
          input.focus();
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isBrowser]);

  const isMac =
    isBrowser && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);

  return (
    <>
      <button
        className="search-trigger"
        onClick={() => setIsOpen(true)}
        type="button"
        aria-label="Search">
        <Search size={15} strokeWidth={2.5} className="search-trigger__icon" />
        <span className="search-trigger__text">Search</span>
        <span className="search-trigger__keys">
          <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
          <kbd>K</kbd>
        </span>
      </button>

      {isOpen && isBrowser && (
        <SearchModal onClose={close}>
          <div ref={modalSearchRef}>
            <OriginalSearchBar {...props} />
          </div>
        </SearchModal>
      )}
    </>
  );
}
