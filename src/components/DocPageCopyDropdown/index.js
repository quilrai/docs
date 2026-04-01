import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { usePluginData } from "@docusaurus/useGlobalData";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { AI_PROVIDERS, buildDocPageAiPrompt } from "@site/src/data/aiProviders";

function IconCopy(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
      {...props}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconChevron(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconMarkdown(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function IconLink(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const menuItemCls =
  "flex w-full items-center group gap-3 rounded-md px-2.5 py-2 text-left no-underline! cursor-pointer border-none bg-transparent text-inherit font-inherit hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-45 disabled:cursor-not-allowed";

const ListItem = ({ icon, title, description, asLink = false, ...props }) => {
  const Component = asLink ? "a" : "button";
  return (
    <li role="none" className="list-none m-0 p-0">
      <Component
        {...(!asLink && { type: "button" })}
        role="menuitem"
        className={menuItemCls}
        {...props}
      >
        <div className="group-hover:text-emerald-500">{icon}</div>
        <div>
          <p className="font-medium! font-sans text-sm m-0 text-neutral-950 dark:text-neutral-50">
            {title}
          </p>
          <p className="text-xs m-0 font-sans text-neutral-500 leading-snug">
            {description}
          </p>
        </div>
      </Component>
    </li>
  );
};

export default function DocPageCopyDropdown() {
  const { metadata } = useDoc();
  const pluginData = usePluginData(
    "docusaurus-plugin-doc-page-markdown",
    "default",
  );
  const markdown = pluginData?.markdownByPermalink?.[metadata.permalink] ?? "";
  const hasMarkdown = Boolean(markdown?.trim());

  const pageUrl = useBaseUrl(metadata.permalink, { absolute: true });
  const aiMessage = buildDocPageAiPrompt(metadata.title, pageUrl);

  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const wrapRef = useRef(null);
  const menuId = useId();

  const copyMarkdown = useCallback(async () => {
    if (!hasMarkdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 1500);
    } catch {
      // ignore
    }
  }, [hasMarkdown, markdown]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      setMenuOpen(false);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      // ignore
    }
  }, [pageUrl]);

  const viewAsMarkdown = useCallback(() => {
    if (!hasMarkdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setMenuOpen(false);
  }, [hasMarkdown, markdown]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const dropdownItems = [
    {
      icon: <IconCopy />,
      title: "Copy page as Markdown",
      description: "Copy page as Markdown for LLMs",
      onClick: copyMarkdown,
    },
    {
      icon: <IconMarkdown />,
      title: "View as Markdown",
      description: "View this page as plain text",
      onClick: viewAsMarkdown,
    },
    ...AI_PROVIDERS.map(({ name, icon: BrandIcon, buildUrl }) => ({
      icon: <BrandIcon />,
      title: `Open in ${name}`,
      description: "Ask questions about this page",
      href: buildUrl(aiMessage),
      target: "_blank",
      rel: "noopener noreferrer",
    })),
    {
      icon: <IconLink />,
      title: "Copy link",
      description: "Copy page URL to clipboard",
      onClick: copyLink,
    },
  ];

  return (
    <div
      className="relative shrink-0 not-prose font-sans"
      ref={wrapRef}
      data-doc-copy-dropdown
    >
      {/* Split button */}
      <div className="inline-flex items-stretch rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
        <button
          type="button"
          className="inline-flex font-sans items-center gap-1.5 px-2.5 py-1.5 text-[0.8125rem] font-medium leading-tight text-neutral-800 dark:text-neutral-100 bg-transparent border-none cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-45 disabled:cursor-not-allowed"
          onClick={copyMarkdown}
          disabled={!hasMarkdown}
          title={
            hasMarkdown
              ? "Copy page as Markdown"
              : "Markdown not available for this page"
          }
        >
          {copiedMd ? <IconCheck /> : <IconCopy />}
          <span>{copiedMd ? "Copied!" : "Copy page"}</span>
        </button>
        <span
          className="w-px self-stretch bg-neutral-200 dark:bg-neutral-800"
          aria-hidden
        />
        <button
          type="button"
          className="inline-flex items-center justify-center px-1.5 min-w-7 border-none bg-transparent text-neutral-600 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-controls={menuId}
          onClick={() => setMenuOpen((o) => !o)}
          title="More actions"
        >
          <IconChevron
            style={{
              transform: menuOpen ? "rotate(180deg)" : undefined,
              transition: "transform 0.15s ease",
            }}
          />
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <ul
          id={menuId}
          className="absolute z-20 pl-1! right-0 top-[calc(100%+0.35rem)] min-w-[16rem] p-1 m-0 list-none rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.06)] dark:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.4),0_2px_4px_-2px_rgb(0_0_0/0.3)]"
          role="menu"
        >
          {dropdownItems.map(
            ({ icon, title, description, href, target, rel, onClick }) => (
              <ListItem
                key={title}
                icon={icon}
                title={title}
                description={description}
                asLink={!!href}
                {...(href ? { href, target, rel } : { onClick })}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
}
