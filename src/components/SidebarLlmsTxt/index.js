import React, {useState, useCallback} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function IconLink(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconCheck(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
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

export default function SidebarLlmsTxt() {
  const [copied, setCopied] = useState(false);
  const {siteConfig} = useDocusaurusContext();

  const fullUrl = `${siteConfig.url}${siteConfig.baseUrl}llms.txt`;

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [fullUrl]);

  return (
    <div className="sidebar-llms-txt">
      <span className="sidebar-llms-txt__label">LLMs.txt</span>
      <button
        type="button"
        className="sidebar-llms-txt__btn"
        onClick={copyUrl}
        title="Copy LLMs.txt URL">
        {copied ? <IconCheck /> : <IconLink />}
        <span>{copied ? 'Copied' : 'Copy url'}</span>
      </button>
    </div>
  );
}
