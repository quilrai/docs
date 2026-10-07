import React from "react";

function IconChatGPT(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function IconClaude(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M17.303 7.028l-4.98 12.461a.575.575 0 01-.534.394.569.569 0 01-.575-.497l-.721-5.46-4.85-2.597a.569.569 0 01-.093-.958l10.5-7.2a.575.575 0 01.816.144.575.575 0 01 .437.713zM4.878 9.645L2.1 11.55a.575.575 0 00.32 1.05h3.065zM10.834 4.06l-1.69 4.23L7.96 3.86a.575.575 0 01.516-.81h1.842a.575.575 0 01.516.32zm3.834 15.33l1.65-4.127 1.178 4.48a.575.575 0 01-.553.73H15.22a.575.575 0 01-.553-.393zm4.76-3.264l2.473-1.69a.575.575 0 00-.32-1.05h-2.76z" />
    </svg>
  );
}

function IconPerplexity(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M12 1.5L5.5 6v5.5H2v7h3.5V24h5V18.5h3V24h5v-5.5H22v-7h-3.5V6zM7.5 7.14L12 4.02l4.5 3.12V11h-2.75V7.25h-3.5V11H7.5zm-3.5 6h2.5v3H4zm3.5 0h3v4.85H7.5zm5 0h3v4.85h-3zm5 0h2.5v3h-2.5zm-9-6.89V11H9v-3h-.75z" />
    </svg>
  );
}

function IconGemini(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
    </svg>
  );
}

/**
 * Shared AI assistant deep-link builders (sidebar + doc copy dropdown).
 * @typedef {{ name: string; buildUrl: (message: string) => string; icon: React.ComponentType }} AiProvider
 */

/** @type {AiProvider[]} */
export const AI_PROVIDERS = [
  {
    name: "ChatGPT",
    icon: IconChatGPT,
    buildUrl: (msg) => `https://chatgpt.com/?q=${encodeURIComponent(msg)}`,
  },
  {
    name: "Claude",
    icon: IconClaude,
    buildUrl: (msg) => `https://claude.ai/new?q=${encodeURIComponent(msg)}`,
  },
  {
    name: "Perplexity",
    icon: IconPerplexity,
    buildUrl: (msg) =>
      `https://www.perplexity.ai/search?q=${encodeURIComponent(msg)}`,
  },
  {
    name: "Gemini",
    icon: IconGemini,
    buildUrl: (msg) =>
      `https://gemini.google.com/app?q=${encodeURIComponent(msg)}`,
  },
];

// Prompts point assistants at markdown sources generated from the docs at
// build time (plugins/llms-txt.js), so answers use the current docs.
function productSources(site, product) {
  if (!product) return [`- All QuilrAI docs (index): ${site}/llms.txt`];
  const out = [
    `- ${product.name} docs, full text in one file: ${site}/llms/${product.slug}-full.txt`,
    `- ${product.name} docs index (page list with links): ${site}/llms/${product.slug}.txt`,
  ];
  if (product.consoleGuide) {
    out.push(`- ${product.name} admin console guide (exact screen labels and URLs): ${site}${product.consoleGuide}`);
  }
  return out;
}

const ANSWER_RULES =
  'Answer from these sources, quote exact console labels, and link the docs page you used. If the docs do not cover something, say so instead of guessing.';

/**
 * @param {string} pageTitle
 * @param {string} pageMarkdownUrl  the page URL with a .md suffix (a .txt twin
 *   with the same content is published next to it)
 * @param {{site: string, product?: object}} ctx
 */
export function buildDocPageAiPrompt(pageTitle, pageMarkdownUrl, {site, product} = {}) {
  const lines = [
    `I have questions about this QuilrAI documentation page: "${pageTitle}".`,
    '',
    'Read it first:',
    `- ${pageMarkdownUrl.replace(/\.md$/, '.txt')} (plain text)`,
    `- ${pageMarkdownUrl.replace(/\.md$/, '')} (the same page on the web)`,
  ];
  // Management API pages render their reference from the OpenAPI file
  // (not Unified Completions or Log Export, which are separate APIs).
  if (site && /\/llm-gateway\/api-reference\/(management|apps-and-credentials|providers-and-configuration|prompts|policy)-api\b/.test(pageMarkdownUrl)) {
    lines.push(`- OpenAPI definition (every operation and schema): ${site}/openapi/llm-gateway-management-v1.json`);
  }
  if (site) lines.push('', 'For related context:', ...productSources(site, product));
  lines.push('', ANSWER_RULES);
  return lines.join('\n');
}

/**
 * @param {string} docsName  e.g. "QuilrAI MCP Gateway"
 * @param {{site: string, product?: object}} ctx
 */
export function buildProductIndexAiPrompt(docsName, {site, product} = {}) {
  return [
    `I have questions about the ${docsName} documentation.`,
    '',
    'Read these first:',
    ...productSources(site, product),
    '',
    ANSWER_RULES,
  ].join('\n');
}
