import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Sparkles, X, Copy, Check, ArrowUpRight, MessageSquareText} from 'lucide-react';
import {
  AI_PROVIDERS,
  buildDocPageAiPrompt,
  buildProductIndexAiPrompt,
} from '@site/src/data/aiProviders';
import {productForPath} from '@site/src/data/products';

// Other components (the homepage "Open in AI" button) open the panel with
// window.dispatchEvent(new Event(ASK_AI_EVENT)).
export const ASK_AI_EVENT = 'qd:ask-ai';

// Hiding the floating button lasts for the browser session only.
const DISMISS_KEY = 'qd-askai-dismissed';
function readDismissed() {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}
function writeDismissed() {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // storage blocked: the button stays hidden until the next page load
  }
}

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
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [title, setTitle] = useState('');
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const promptRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  const effectiveScope = isDoc ? scope : 'docs';
  const site = siteConfig.url.replace(/\/$/, '');
  const docsName = product ? `QuilrAI ${product.name}` : 'QuilrAI';
  const prompt =
    effectiveScope === 'page'
      ? buildDocPageAiPrompt(title || 'QuilrAI docs page', `${site}${path}.md`, {site, product})
      : buildProductIndexAiPrompt(docsName, {site, product});

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
    setPromptCopied(false);
    setShowPrompt(false);
  }, [pathname]);

  useEffect(() => {
    if (showPrompt) promptRef.current?.select();
  }, [showPrompt]);

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

  // Copies the same prompt the provider links send, for assistants not listed.
  // If the clipboard is blocked, show the prompt selected so it can be copied.
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 1600);
    } catch {
      setShowPrompt(true);
      promptRef.current?.select();
    }
  };

  const dismiss = () => {
    writeDismissed();
    setDismissed(true);
    setOpen(false);
  };

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
    <div className="qd-askai" data-open={open} data-dismissed={dismissed}>
      {open && (
        <div
          className="qd-askai__panel"
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label="Open these docs in your AI assistant">
          <div className="qd-askai__head">
            <b>
              <Sparkles size={15} aria-hidden="true" /> Open in your AI assistant
            </b>
            <button
              type="button"
              className="qd-askai__close"
              onClick={() => close()}
              aria-label="Close">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {isDoc && (
            <div className="qd-askai__seg" role="group" aria-label="What to open">
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
              ? 'Opens your AI assistant with a prompt that links to this page and the related docs.'
              : `Opens your AI assistant with a prompt that links to the ${docsName} docs.`}
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
          <div className="qd-askai__actions">
            <button type="button" className="qd-askai__copy" onClick={copyPrompt}>
              {promptCopied ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <MessageSquareText size={14} aria-hidden="true" />
              )}
              {promptCopied ? 'Copied' : 'Copy prompt'}
            </button>
            {isDoc && (
              <button type="button" className="qd-askai__copy" onClick={copyMarkdown}>
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy page as Markdown'}
              </button>
            )}
          </div>
          {showPrompt && (
            <textarea
              ref={promptRef}
              className="qd-askai__prompt"
              readOnly
              rows={5}
              value={prompt}
              aria-label="Prompt to copy into your AI assistant"
            />
          )}
          <span className="qd-askai__status" role="status" aria-live="polite">
            {promptCopied ? 'Prompt copied' : copied ? 'Page copied as Markdown' : ''}
          </span>
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
        <span>Open in AI</span>
      </button>
      {!dismissed && (
        <button
          type="button"
          className="qd-askai__dismiss"
          onClick={dismiss}
          aria-label="Hide the Open in AI button for this session"
          title="Hide for this session">
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
