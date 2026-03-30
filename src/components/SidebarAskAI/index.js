import React, {useState, useCallback} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function IconCopy(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={10}
      height={10}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={10}
      height={10}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconExternal(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={9}
      height={9}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

const AI_PROVIDERS = [
  {
    name: 'ChatGPT',
    buildUrl: (msg) =>
      `https://chatgpt.com/?q=${encodeURIComponent(msg)}`,
  },
  {
    name: 'Claude',
    buildUrl: (msg) =>
      `https://claude.ai/new?q=${encodeURIComponent(msg)}`,
  },
  {
    name: 'Gemini',
    buildUrl: (msg) =>
      `https://gemini.google.com/app?q=${encodeURIComponent(msg)}`,
  },
];

export default function SidebarAskAI() {
  const [showOther, setShowOther] = useState(false);
  const [copied, setCopied] = useState(false);
  const {siteConfig} = useDocusaurusContext();

  const llmsTxtUrl = `${siteConfig.url}${siteConfig.baseUrl}llms.txt`;
  const message = `Here is the LLMs.txt for QuilrAI LLM and MCP Gateways: ${llmsTxtUrl}\n\nUnderstand this and answer any related questions.`;

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [message]);

  return (
    <div className="sidebar-ask-ai">
      <span className="sidebar-ask-ai__label">Ask about QuilrAI Gateway</span>
      <div className="sidebar-ask-ai__buttons">
        {AI_PROVIDERS.map(({name, buildUrl}) => (
          <a
            key={name}
            className="sidebar-ask-ai__btn"
            href={buildUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            title={`Ask ${name}`}>
            {name}
            <IconExternal />
          </a>
        ))}
        <button
          type="button"
          className="sidebar-ask-ai__btn sidebar-ask-ai__btn--other"
          onClick={() => setShowOther((v) => !v)}
          title="Use any other AI">
          Any AI
        </button>
      </div>
      {showOther && (
        <div className="sidebar-ask-ai__other-panel">
          <p className="sidebar-ask-ai__other-hint">
            Copy and paste this into your AI:
          </p>
          <div className="sidebar-ask-ai__other-msg">
            <span>{message}</span>
          </div>
          <button
            type="button"
            className="sidebar-ask-ai__copy-btn"
            onClick={copyMessage}>
            {copied ? <IconCheck /> : <IconCopy />}
            <span>{copied ? 'Copied!' : 'Copy message'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
