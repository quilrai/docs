import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Sparkles, X, Copy, Check, ArrowUpRight} from 'lucide-react';
import {
  AI_PROVIDERS,
  buildDocPageAiPrompt,
  buildProductIndexAiPrompt,
} from '@site/src/data/aiProviders';
import {productForPath} from '@site/src/data/products';

// Other components (the homepage "Ask AI" button) open the panel with
// window.dispatchEvent(new Event(ASK_AI_EVENT)).
export const ASK_AI_EVENT = 'qd:ask-ai';

function pageTitle() {
  const h1 = document.querySelector('.theme-doc-markdown h1, main h1');
  if (h1 && h1.textContent) return h1.textContent.trim();
  return document.title.replace(/\s*\|\s*QuilrAI Docs$/, '');
}

export default function AskAiLauncher() {
  const {pathname} = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const pluginData = usePluginData('docusaurus-plugin-doc-page-markdown', 'default');
  const path = pathname.replace(/\/$/, '') || '/';
  const markdown = pluginData?.markdownByPermalink?.[path] ?? '';
  const isDoc = Boolean(markdown.trim());
  const product = productForPath(pathname);

  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState('page');
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('');
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  const effectiveScope = isDoc ? scope : 'docs';
  const site = siteConfig.url.replace(/\/$/, '');
  const docsName = product ? `QuilrAI ${product.name}` : 'QuilrAI';
  const prompt =
    effectiveScope === 'page'
      ? buildDocPageAiPrompt(title || 'QuilrAI docs page', `${site}${path}.md`)
      : buildProductIndexAiPrompt(docsName, `${site}/llms.txt`);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const onAsk = () => {
      setTitle(pageTitle());
      setOpen(true);
    };
    window.addEventListener(ASK_AI_EVENT, onAsk);
    return () => window.removeEventListener(ASK_AI_EVENT, onAsk);
  }, []);

  useEffect(() => {
    setOpen(false);
    setCopied(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const first = panelRef.current?.querySelector('button, a');
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    const onDown = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        close(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open, close]);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked; nothing to do
    }
  };

  return (
    <div className="qd-askai" data-open={open}>
      {open && (
        <div
          className="qd-askai__panel"
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label="Ask AI about the docs">
          <div className="qd-askai__head">
            <b>
              <Sparkles size={15} aria-hidden="true" /> Ask AI
            </b>
            <button
              type="button"
              className="qd-askai__close"
              onClick={() => close()}
              aria-label="Close Ask AI">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {isDoc && (
            <div className="qd-askai__seg" role="group" aria-label="What to ask about">
              <button
                type="button"
                aria-pressed={effectiveScope === 'page'}
                onClick={() => setScope('page')}>
                This page
              </button>
              <button
                type="button"
                aria-pressed={effectiveScope === 'docs'}
                onClick={() => setScope('docs')}>
                {product ? `${product.name} docs` : 'All docs'}
              </button>
            </div>
          )}
          <p className="qd-askai__hint">
            {effectiveScope === 'page'
              ? 'Opens your assistant with a link to this page, ready for questions.'
              : `Opens your assistant with the ${docsName} docs index (llms.txt).`}
          </p>
          <ul className="qd-askai__list">
            {AI_PROVIDERS.map(({name, icon: BrandIcon, buildUrl}) => (
              <li key={name}>
                <a href={buildUrl(prompt)} target="_blank" rel="noopener noreferrer">
                  <span className="qd-askai__ico">
                    <BrandIcon />
                  </span>
                  <span className="qd-askai__lbl">Open in {name}</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          {isDoc && (
            <button type="button" className="qd-askai__copy" onClick={copyMarkdown}>
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy page as Markdown'}
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        ref={buttonRef}
        className="qd-askai__fab"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          if (open) {
            close(false);
          } else {
            setTitle(pageTitle());
            setOpen(true);
          }
        }}>
        <Sparkles size={16} aria-hidden="true" />
        <span>Ask AI</span>
      </button>
    </div>
  );
}
