import React, { useCallback, useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  AI_PROVIDERS,
  buildProductIndexAiPrompt,
} from "@site/src/data/aiProviders";
import {
  Sparkles,
  Copy,
  Check,
  ArrowUpRight,
  Server,
} from "lucide-react";

export default function AskAiBanner({ productName }) {
  const llmsTxtUrl = useBaseUrl("/llms.txt");
  const llmsTxtAbsoluteUrl = useBaseUrl("/llms.txt", { absolute: true });
  const aiMessage = buildProductIndexAiPrompt(productName, llmsTxtAbsoluteUrl);

  const [llmsTxt, setLlmsTxt] = useState("");
  const [copied, setCopied] = useState(false);
  const hasMarkdown = Boolean(llmsTxt?.trim());

  useEffect(() => {
    let cancelled = false;
    fetch(llmsTxtUrl)
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        if (!cancelled) setLlmsTxt(text);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [llmsTxtUrl]);

  const copyLlmsTxt = useCallback(async () => {
    if (!hasMarkdown) return;
    try {
      await navigator.clipboard.writeText(llmsTxt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }, [hasMarkdown, llmsTxt]);

  return (
    <aside
      className="relative not-prose font-sans my-8 overflow-hidden rounded-2xl border border-[#c7b99f] dark:border-[#30343b] bg-[#f3ead9] dark:bg-[#171a1f]"
      aria-label={`Talk to your AI about ${productName}`}
    >
      {/* Soft gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(16,185,129,0.10), transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(16,185,129,0.06), transparent 55%)",
        }}
      />
      {/* Dot grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-neutral-900 dark:text-neutral-100 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative p-6 sm:p-8">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] pl-2 pr-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300 font-mono">
          <Sparkles size={11} aria-hidden />
          <span>Talk to your AI</span>
        </div>

        {/* Heading */}
        <h3 className="mt-3.5 m-0 text-2xl sm:text-[28px] leading-[1.15] font-semibold tracking-tight text-[#252018] dark:text-neutral-50">
          Talk to your AI about{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            {productName}
          </span>
        </h3>
        <p className="mt-2 m-0 text-sm sm:text-[15px] leading-relaxed text-[#554c3f] dark:text-neutral-400 max-w-xl">
          Open the {productName} docs in your favorite assistant and get instant
          answers, code samples, and integration help grounded in the latest
          guides.
        </p>

        {/* Provider cards - primary action */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AI_PROVIDERS.map(({ name, icon: BrandIcon, buildUrl }) => (
            <a
              key={name}
              href={buildUrl(aiMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-between gap-2 rounded-xl border border-[#c7b99f] dark:border-[#30343b] bg-[#ebe1cf] dark:bg-[#1f232a] px-3.5 py-3 no-underline! text-[#252018] dark:text-neutral-50 hover:border-emerald-500/60 hover:shadow-[0_1px_0_rgba(16,185,129,0.06),0_8px_24px_-12px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_1px_0_rgba(16,185,129,0.08),0_8px_24px_-12px_rgba(16,185,129,0.4)] hover:-translate-y-px transition-all"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex shrink-0 items-center justify-center size-9 rounded-lg bg-[#f3ead9] dark:bg-[#171a1f] text-[#554c3f] dark:text-neutral-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 group-hover:bg-emerald-500/10 ring-1 ring-transparent group-hover:ring-emerald-500/20 transition-colors">
                  <BrandIcon />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-500 leading-none">
                    Open in
                  </span>
                  <span className="mt-1 text-sm font-semibold truncate leading-none">
                    {name}
                  </span>
                </span>
              </span>
              <ArrowUpRight
                size={15}
                aria-hidden
                className="shrink-0 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-px group-hover:-translate-y-px transition-transform"
              />
            </a>
          ))}
        </div>

        {/* Enterprise / internal-LLM secondary action */}
        <div className="mt-5 flex items-center justify-between gap-4 flex-wrap rounded-xl border border-dashed border-[#b7a68b]/80 dark:border-[#3a3f48] bg-[#ebe1cf]/80 dark:bg-[#1f232a]/70 px-4 py-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="inline-flex shrink-0 items-center justify-center size-7 rounded-md bg-[#f3ead9] dark:bg-[#171a1f] border border-[#c7b99f] dark:border-[#30343b] text-[#554c3f] dark:text-neutral-400">
              <Server size={14} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[13px] font-medium text-[#252018] dark:text-neutral-200">
                Using an internal or self-hosted LLM?
              </p>
              <p className="m-0 mt-0.5 text-[12.5px] text-[#706653] dark:text-neutral-500 leading-snug">
                Copy our{" "}
                <code className="font-mono text-[11.5px] px-1 py-px rounded bg-[#f3ead9] dark:bg-[#171a1f] text-[#554c3f] dark:text-neutral-300 border border-[#c7b99f] dark:border-[#30343b]">
                  llms.txt
                </code>{" "}
                and paste it into any private chat.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyLlmsTxt}
            disabled={!hasMarkdown}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-[#b7a68b] dark:border-[#30343b] bg-[#f3ead9] dark:bg-[#171a1f] px-3 py-1.5 text-[12.5px] font-medium text-[#252018] dark:text-neutral-200 hover:border-emerald-500/60 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:border-[#b7a68b] dark:disabled:hover:border-[#30343b] disabled:hover:text-[#252018] dark:disabled:hover:text-neutral-200 cursor-pointer"
            title={
              hasMarkdown
                ? "Copy llms.txt to clipboard"
                : "llms.txt not available"
            }
          >
            {copied ? (
              <Check size={14} aria-hidden />
            ) : (
              <Copy size={14} aria-hidden />
            )}
            <span>{copied ? "Copied!" : "Copy llms.txt"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
