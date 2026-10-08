/**
 * Turns a doc's MDX source into markdown an AI assistant (or a person pasting
 * it) can use as-is. Shared by plugins/doc-page-markdown.js (the per-page .md
 * files and "Copy page") and plugins/llms-txt.js (the llms indexes).
 *
 *   - MDX import lines, {/* comments *\/} and <!-- HTML comments --> are dropped.
 *   - Code fences are rewritten to their final state: lines marked with a
 *     `diff-remove` magic comment are dropped, and every magic-comment marker
 *     (diff-add, highlight-next-line, highlight-start/end) is removed, so code
 *     copied from the markdown runs.
 *   - Management API components (<ApiReference>, <SchemaReference>, ...) that
 *     render from the OpenAPI file become a link to that file plus a compact
 *     list of the operations / fields they show.
 *   - Product landing pages (<ProductLanding product="..."/>) become a real
 *     page: name, tagline, tasks and the section map from the sidebar.
 *   - Deployment SOP components (<InstallSop>, <SopLink>) become links to the
 *     SOP pages synced into /sop/ (see plugins/install-sop.js).
 *
 * Plain CommonJS: loaded by Docusaurus plugins in Node.
 */
const fs = require('fs');
const path = require('path');

const OPENAPI_PATH = '/openapi/llm-gateway-management-v1.json';
const MAGIC = '(?:diff-add|diff-remove|highlight-next-line|highlight-start|highlight-end)';
// A line holding only a magic comment, in any comment syntax Prism uses.
const MAGIC_LINE = new RegExp(
  `^\\s*(?:(?://|#|--|%|;)\\s*${MAGIC}|/\\*\\s*${MAGIC}\\s*\\*/|<!--\\s*${MAGIC}\\s*-->|\\{/\\*\\s*${MAGIC}\\s*\\*/\\})\\s*$`,
);

let specCache;
function loadSpec(siteDir) {
  if (specCache === undefined) {
    try {
      specCache = JSON.parse(fs.readFileSync(path.join(siteDir, 'static', OPENAPI_PATH), 'utf-8'));
    } catch {
      specCache = null;
    }
  }
  return specCache;
}

function operations(spec) {
  if (!spec) return [];
  return Object.entries(spec.paths || {}).flatMap(([p, methods]) =>
    Object.entries(methods).map(([method, op]) => ({...op, path: p, method: method.toUpperCase()})),
  );
}

const opLine = (op) => `- \`${op.method} ${op.path}\`: ${op.summary || op.operationId || ''}`.trimEnd();

// Splits markdown into prose and fenced-code segments.
function segments(text) {
  const out = [];
  let buf = [];
  let fence = null;
  for (const line of text.split('\n')) {
    if (!fence) {
      const m = line.match(/^(\s*)(`{3,}|~{3,})/);
      if (m) {
        if (buf.length) out.push({code: false, lines: buf});
        buf = [line];
        fence = m[2];
        continue;
      }
      buf.push(line);
    } else {
      buf.push(line);
      const close = line.trim();
      if (close.startsWith(fence[0].repeat(fence.length)) && /^(`+|~+)$/.test(close)) {
        out.push({code: true, lines: buf});
        buf = [];
        fence = null;
      }
    }
  }
  if (buf.length) out.push({code: Boolean(fence), lines: buf});
  return out;
}

function finalStateCode(lines) {
  const out = [];
  let dropNext = false;
  for (const line of lines) {
    if (MAGIC_LINE.test(line)) {
      if (/diff-remove/.test(line)) dropNext = true;
      continue;
    }
    if (dropNext) {
      dropNext = false;
      continue;
    }
    out.push(line);
  }
  return out;
}

function schemaMarkdown(spec, name) {
  const schema = spec?.components?.schemas?.[name];
  const lines = [`Input schema \`${name}\` (full definition in the OpenAPI file):`];
  if (!schema) return lines.join('\n');
  if (schema.description) lines.push('', schema.description.replace(/\s+/g, ' '));
  const required = new Set(schema.required || []);
  const props = Object.entries(schema.properties || {});
  if (props.length) {
    lines.push('');
    for (const [key, prop] of props) {
      const ref = prop.$ref ? prop.$ref.split('/').pop() : null;
      const type = ref || (Array.isArray(prop.type) ? prop.type.join(' | ') : prop.type) || 'object';
      const desc = (prop.description || '').replace(/\s+/g, ' ');
      lines.push(`- \`${key}\` (${type}${required.has(key) ? ', required' : ''})${desc ? `: ${desc}` : ''}`);
    }
  }
  return lines.join('\n');
}

// Replaces the Management API components with markdown.
function apiComponents(text, {site, siteDir}) {
  if (!/<(ApiReference|SchemaReference|EndpointDirectory|ResourceCards|ManagementHero)\b/.test(text)) return text;
  const spec = loadSpec(siteDir);
  const ops = operations(spec);
  const specUrl = `${site}${OPENAPI_PATH}`;
  return text
    .replace(/<ManagementHero\s*\/>/g, `OpenAPI reference for the Management API v1: ${specUrl}`)
    .replace(/<ResourceCards\s*\/>/g, () =>
      spec
        ? ['Resources in the API:', '', ...spec.tags.map((t) => `- ${t.name}${t.description ? `: ${t.description}` : ''}`)].join('\n')
        : '',
    )
    .replace(/<EndpointDirectory\s*\/>/g, () =>
      [`Every operation (full definitions: ${specUrl}):`, '', ...ops.map(opLine)].join('\n'),
    )
    .replace(/<ApiReference\s+tags=\{\[([^\]]*)\]\}\s*\/>/g, (_, list) => {
      const tags = [...list.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
      const shown = ops.filter((op) => (op.tags || []).some((t) => tags.includes(t)));
      return [
        `Operations (${tags.join(', ')}). Request and response schemas: ${specUrl}`,
        '',
        ...shown.map(opLine),
      ].join('\n');
    })
    .replace(/<SchemaReference\s+name=["']([^"']+)["']\s*\/>/g, (_, name) => schemaMarkdown(spec, name));
}

const attr = (attrs, name) => (attrs.match(new RegExp(`\\b${name}=["']([^"']+)["']`)) || [])[1];

// Replaces <InstallSop .../> and <SopLink ...>...</SopLink> with links into /sop/.
function sopComponents(text, {site, siteDir}) {
  if (!/<(InstallSop|SopLink)\b/.test(text)) return text;
  const {readManifest, resolveStep} = require('./install-sop');
  const manifest = readManifest(siteDir);
  const abs = (url) => `${site}${url}`;
  return text
    .replace(/<InstallSop\b([^>]*?)\/>/g, (_, attrs) => {
      const {track} = resolveStep(manifest, attr(attrs, 'track'));
      return [
        `${track.title} installation SOP (step-by-step runbook, ${abs(manifest.url)}):`,
        '',
        ...track.steps.map((s) => `${s.number}. [${s.label}](${abs(s.url)})`),
      ].join('\n');
    })
    .replace(/<SopLink\b([^>]*?)(?:\/>|>([\s\S]*?)<\/SopLink>)/g, (_, attrs, children) => {
      const {track, step} = resolveStep(manifest, attr(attrs, 'track'), attr(attrs, 'step'));
      const text = children?.trim() || (step ? `SOP step ${step.number}: ${step.label}` : `${track.title} installation SOP`);
      return `[${text}](${abs(step ? step.url : track.steps[0].url)})`;
    });
}

function cleanProse(text, ctx) {
  let t = text
    // MDX imports / exports of components (outside code fences only).
    .replace(/^import\s+(?:[\w*{}, \t]+\s+from\s+)?['"][^'"]+['"];?[ \t]*$/gm, '')
    // MDX comments and HTML comments (TODO and screenshot notes).
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  t = apiComponents(t, ctx);
  t = sopComponents(t, ctx);
  return t;
}

/**
 * @param {string} content  MDX body (front matter already removed)
 * @param {{site: string, siteDir: string}} ctx
 */
function toAiMarkdown(content, ctx) {
  const out = segments(content).map((seg) =>
    seg.code ? finalStateCode(seg.lines).join('\n') : cleanProse(seg.lines.join('\n'), ctx),
  );
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const LANDING = /^\s*<ProductLanding\s+product=["']([\w-]+)["']\s*\/>\s*$/;

/** The product id when a doc's body is only <ProductLanding product="..."/>. */
function landingProductId(content) {
  const m = String(content || '').match(LANDING);
  return m ? m[1] : null;
}

/**
 * Markdown for a product landing page, built from the product data and the
 * product's sidebar, mirroring what src/components/ProductLanding renders.
 */
function landingMarkdown(product, {site, sidebar = [], docsById, productsById = {}}) {
  const permalinks = new Set([...docsById.values()].map((d) => d.permalink));
  const url = (href) => {
    if (!href) return href;
    if (/^https?:/.test(href)) return href;
    const [p, hash] = href.split('#');
    const clean = p.replace(/\/$/, '');
    return `${site}${clean}${permalinks.has(clean) ? '.md' : ''}${hash ? `#${hash}` : ''}`;
  };
  const lines = [`# ${product.name}`, '', product.tagline, ''];
  if (product.primary) lines.push(`Start here: [${product.primary.label}](${url(product.primary.to)})`);
  if (product.consoleUrl) lines.push(`Open in the console: ${product.consoleUrl}`);
  lines.push('', '## Get going', '');
  for (const t of product.tasks || []) lines.push(`- [${t.title}](${url(t.to)}): ${t.desc}`);
  lines.push('', `## Everything in ${product.name}`, '');
  if (product.mirror) lines.push(product.mirror, '');

  const itemLine = (item, depth) => {
    const pad = '  '.repeat(depth);
    if (item.type === 'doc' || item.type === 'ref') {
      const doc = docsById.get(item.id);
      if (!doc || doc.permalink === `/${product.slug}`) return [];
      return [`${pad}- [${item.label || doc.title}](${site}${doc.permalink}.md)`];
    }
    if (item.type === 'link') {
      const cross = productsById[item.customProps?.crossLink];
      return [`${pad}- [${item.label}](${url(item.href)})${cross ? ` (in ${cross.name})` : ''}`];
    }
    if (item.type === 'category') {
      const head = item.link?.type === 'doc' && docsById.get(item.link.id)
        ? `${pad}- [${item.label}](${site}${docsById.get(item.link.id).permalink}.md)`
        : `${pad}- ${item.label}`;
      return [head, ...item.items.flatMap((c) => itemLine(c, depth + 1))];
    }
    return [];
  };

  const loose = sidebar.filter((i) => i.type !== 'category');
  const looseLines = loose.flatMap((i) => itemLine(i, 0));
  if (looseLines.length) lines.push('### Pages', '', ...looseLines, '');
  for (const group of sidebar.filter((i) => i.type === 'category')) {
    lines.push(`### ${group.label}`, '', ...group.items.flatMap((c) => itemLine(c, 0)), '');
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * A one-line description from the first real markdown paragraph: skips
 * headings, JSX/HTML blocks, imports, admonitions, tables, lists and code.
 */
function firstParagraph(markdown) {
  for (const seg of segments(markdown)) {
    if (seg.code) continue;
    const blocks = seg.lines.join('\n').split(/\n\s*\n/);
    for (const block of blocks) {
      const b = block.trim();
      if (!b) continue;
      if (/^(#|<|\{|import\s|export\s|:::|\||[-*+]\s|\d+\.\s|!\[|>)/.test(b)) continue;
      const text = b
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/[*_`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length <= 20) continue;
      if (text.length <= 300) return text;
      // Long paragraph: keep whole sentences up to ~300 characters.
      const cut = text.slice(0, 300);
      const end = cut.lastIndexOf('. ');
      return end > 80 ? cut.slice(0, end + 1) : `${cut.replace(/\s+\S*$/, '')}...`;
    }
  }
  return '';
}

module.exports = {toAiMarkdown, landingProductId, landingMarkdown, firstParagraph, OPENAPI_PATH};
