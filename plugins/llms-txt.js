/**
 * Generates the LLM-facing docs indexes from the docs themselves, so they can
 * never drift from the site:
 *   /llms.txt                 every page, grouped by product and sidebar group
 *   /llms-full.txt            the full markdown of every page
 *   /llms/<product>.txt       one product's index (used by the Ask AI launcher)
 *   /llms/<product>-full.txt  one product's full markdown
 *   /api/v1/index.json        the same pages as JSON for Quilr Assist (product ->
 *                             group -> page, with console routes, aliases and
 *                             videos); documented in static/api/v1/openapi.json
 * Order and grouping follow the product sidebars; each entry uses the page
 * title and its description (frontmatter `description`, else the first
 * paragraph). Served by middleware in dev, written to outDir on build.
 *
 * Page frontmatter read for the JSON index (both optional):
 *   console_path: '/settings/llm-gateway'   exact route(s) from quilr-console
 *                                           frontend/src/lib/appPaths.ts; empty
 *                                           ([]) = documents no single screen
 *   aliases: [API keys, guardrails]         words admins use for the page
 * Videos come from src/data/videos.json (their `docs` links and `questions`).
 * Console V1 (docs/console/legacy-v1/) is left out of the JSON index only.
 *
 * Options: {products} from src/data/products.js, {extraLinks} per product id:
 * [{title, url, description}] for non-doc resources (e.g. console guides).
 */
module.exports = function llmsTxtPlugin(context, options) {
  const {siteDir, siteConfig} = context;
  const {products = [], extraLinks = {}} = options;
  const SITE = siteConfig.url.replace(/\/$/, '');
  const {toAiMarkdown, firstParagraph, landingMarkdown} = require('./ai-markdown');
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  /** @type {Record<string, string>} output path -> file content */
  let files = {};

  return {
    name: 'docusaurus-plugin-llms-txt',

    async allContentLoaded({allContent}) {
      const docsContent = allContent['docusaurus-plugin-content-docs']?.default;
      const version = docsContent?.loadedVersions?.[0];
      if (!version) return;

      const fs = require('fs/promises');
      const path = require('path');
      const {aliasedSitePathToRelativePath, parseMarkdownFile} = require('@docusaurus/utils');
      const parseFrontMatter = siteConfig.markdown.parseFrontMatter;

      const docsById = new Map(version.docs.map((d) => [d.id, d]));
      const markdownCache = new Map();
      const markdown = async (doc) => {
        if (markdownCache.has(doc.id)) return markdownCache.get(doc.id);
        const abs = path.join(siteDir, aliasedSitePathToRelativePath(doc.source));
        const {content} = await parseMarkdownFile({
          filePath: abs,
          fileContent: await fs.readFile(abs, 'utf-8'),
          parseFrontMatter,
        });
        const md = toAiMarkdown(content, {site: SITE, siteDir});
        markdownCache.set(doc.id, md);
        return md;
      };
      const clean = (s) => (s || '').replace(/\s+/g, ' ').replace(/—/g, '-').trim();
      // Frontmatter description when set; otherwise the first real markdown
      // paragraph (Docusaurus' own fallback runs JSX text together).
      const describe = async (doc) =>
        clean(doc.frontMatter?.description || firstParagraph(await markdown(doc)) || doc.description);
      const entry = async (doc) => {
        const desc = await describe(doc);
        return `- [${clean(doc.title)}](${SITE}${doc.permalink}.md)${desc ? `: ${desc}` : ''}`;
      };

      const json = createJsonIndex({site: SITE, siteDir, docs: version.docs, markdown, describe, clean});

      const index = [];
      const fullAll = [];
      files = {};

      for (const product of products) {
        const sidebar = version.sidebars[product.id] || [];
        const lines = [];
        const pages = [];
        // `group` is the JSON index group of the top-level category we are in.
        const walk = async (items, depth, group) => {
          for (const item of items) {
            if (item.type === 'doc' || item.type === 'ref') {
              const doc = docsById.get(item.id);
              if (!doc || doc.permalink === `/${product.slug}`) continue;
              lines.push(await entry(doc));
              pages.push(doc);
              await json.addPage(product, group, doc);
            } else if (item.type === 'category') {
              const docs = item.items.filter((i) => i.type !== 'link');
              if (!docs.length) continue;
              lines.push('', `${'#'.repeat(Math.min(3 + depth, 4))} ${item.label}`, '');
              await walk(docs, depth + 1, group || json.group(product, item));
            }
          }
        };
        await walk(sidebar, 0);

        const extras = (extraLinks[product.id] || []).map(
          (l) => `- [${l.title}](${l.url}): ${l.description}`,
        );
        const head = [
          `## ${product.name}`,
          '',
          product.tagline,
          '',
          `- [${product.name} overview](${SITE}/${product.slug}.md): Landing page with the main tasks and every section.`,
          `- [${product.name} full docs](${SITE}/llms/${product.slug}-full.txt): Every ${product.name} page as markdown in one file.`,
          ...extras,
        ];
        const body = [...head, ...lines].join('\n');
        index.push(body);

        files[`llms/${product.slug}.txt`] = tidy(
          `# QuilrAI ${product.name} documentation\n\n> ${product.tagline}\n\n${body.replace(/^## .*\n\n.*\n\n/, '')}`,
        );

        const full = [`# QuilrAI ${product.name} documentation (full)`, '', `> ${product.tagline}`, ''];
        full.push(
          '',
          '---',
          '',
          `Source: ${SITE}/${product.slug}`,
          '',
          landingMarkdown(product, {site: SITE, sidebar, docsById, productsById}),
        );
        for (const doc of pages) {
          full.push('', '---', '', `Source: ${SITE}${doc.permalink}`, '', await markdown(doc));
        }
        files[`llms/${product.slug}-full.txt`] = tidy(full.join('\n'));
        fullAll.push(full.slice(4).join('\n'));
      }

      const intro =
        '> QuilrAI governs how an enterprise uses AI: a Console to observe and set policy, an LLM Gateway and MCP Gateway in front of models and tools, a Browser Extension and Endpoint Agent on the workforce side, Red Teaming to test AI systems, and Integrations with the platforms you already run.\n\n' +
        'Every page is available as markdown by adding `.md` to its URL, and as the same content in plain text by adding `.txt` instead (use the `.txt` form if a `.md` link cannot be opened). Each product also has its own index at /llms/<product>.txt and its full content in one plain-text file at /llms/<product>-full.txt.';
      files['llms.txt'] = tidy(`# QuilrAI Documentation\n\n${intro}\n\n${index.join('\n\n')}`);
      files['llms-full.txt'] = tidy(`# QuilrAI Documentation (full)\n\n${intro}\n${fullAll.join('\n')}`);
      files['api/v1/index.json'] = json.build();
    },

    configureWebpack(_config, isServer) {
      if (isServer) return {};
      return {
        devServer: {
          setupMiddlewares(middlewares, devServer) {
            devServer.app.get(/^\/llms.*\.txt$/, (req, res, next) => {
              const content = files[req.path.slice(1)];
              if (content === undefined) return next();
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.send(content);
            });
            devServer.app.get('/api/v1/index.json', (req, res, next) => {
              const content = files['api/v1/index.json'];
              if (content === undefined) return next();
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.send(content);
            });
            return middlewares;
          },
        },
      };
    },

    async postBuild({outDir}) {
      const fs = require('fs/promises');
      const path = require('path');
      for (const [rel, content] of Object.entries(files)) {
        const filePath = path.join(outDir, rel);
        await fs.mkdir(path.dirname(filePath), {recursive: true});
        await fs.writeFile(filePath, content, 'utf-8');
      }
    },
  };
};

function tidy(text) {
  return text.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

/**
 * Collects /api/v1/index.json during the sidebar walk: group() opens a
 * top-level sidebar category, addPage() adds a doc to it, build() returns the
 * file. Throws on bad console_path / aliases frontmatter and on video links to
 * pages that do not exist, so a broken index fails the build.
 */
function createJsonIndex({site, siteDir, docs, markdown, describe, clean}) {
  const fs = require('fs');
  const path = require('path');
  // Read fresh (not require) so the dev server picks up edits.
  const {videos} = JSON.parse(fs.readFileSync(path.join(siteDir, 'src/data/videos.json'), 'utf-8'));

  const permalinks = new Set(docs.map((d) => d.permalink));
  const videosByPermalink = {};
  for (const v of videos) {
    for (const {to} of v.docs || []) {
      if (!permalinks.has(to)) {
        throw new Error(`src/data/videos.json: video "${v.id}" links to ${to}, which is not a doc page`);
      }
      (videosByPermalink[to] ||= []).push(v.id);
    }
  }

  // Console V1 (legacy) stays on the site and in llms.txt, but Quilr Assist
  // serves the V2 console only, so its pages are left out of the JSON index.
  const excluded = (docId) => docId.startsWith('console/legacy-v1/');

  const products = {};
  const noDescription = [];
  let pageCount = 0;

  const productEntry = (p) =>
    (products[p.id] ||= {
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      url: `${site}/${p.slug}`,
      markdown: `${site}/${p.slug}.md`,
      consoleGuide: p.consoleGuide ? `${site}${p.consoleGuide}` : undefined,
      groups: {},
    });

  return {
    // null for an excluded category; its docs are skipped by addPage.
    group(product, category) {
      const firstId = firstDocId(category);
      if (firstId && excluded(firstId)) return null;
      const key = firstId?.split('/')[1] || category.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return (productEntry(product).groups[key] ||= {label: category.label, pages: []});
    },

    async addPage(product, group, doc) {
      const fm = doc.frontMatter || {};
      const where = doc.source.replace(/^@site\//, '');
      if (!fm.description) noDescription.push(where); // llms.txt falls back for every page
      if (excluded(doc.id)) return;
      const target = group || (productEntry(product).groups.general ||= {label: 'General', pages: []});
      // An empty console_path (`[]`, '' or blank) means "no single screen": omitted.
      const emptyRoute = fm.console_path === '' || (Array.isArray(fm.console_path) && !fm.console_path.length);
      const consolePaths = emptyRoute ? undefined : stringList(fm.console_path, `${where}: console_path`);
      if (consolePaths?.some((route) => !route.startsWith('/'))) {
        throw new Error(`${where}: console_path must be console routes starting with "/"`);
      }
      const aliases = stringList(fm.aliases, `${where}: aliases`);

      target.pages.push({
        id: doc.id,
        title: clean(fm.sidebar_label || doc.title),
        description: await describe(doc),
        url: `${site}${doc.permalink}`,
        markdown: `${site}${doc.permalink}.md`,
        sections: sections(await markdown(doc)),
        consolePaths,
        aliases,
        videos: videosByPermalink[doc.permalink] || [],
      });
      pageCount++;
    },

    build() {
      if (noDescription.length) {
        console.warn(
          `[llms-txt] ${noDescription.length} pages have no frontmatter description; ` +
            `llms.txt and /api/v1/index.json use their first paragraph:\n  ${noDescription.join('\n  ')}`,
        );
      }
      const content = {
        products,
        videos: videos.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          kind: v.kind,
          duration: v.duration,
          published: v.published,
          youtube: v.youtube,
          watch: `https://www.youtube.com/watch?v=${v.youtube}`,
          // Privacy-enhanced host, as on the site; add autoplay=1 when loading on click.
          embed: `https://www.youtube-nocookie.com/embed/${v.youtube}?rel=0&modestbranding=1`,
          poster: v.poster ? `${site}${v.poster}` : undefined,
          products: v.products,
          questions: v.questions || [],
          pages: (v.docs || []).map((d) => `${site}${d.to}`),
        })),
      };
      // Changes only when the content does, unlike generatedAt (daily builds),
      // so consumers can keep cached pages across rebuilds of unchanged docs.
      const contentHash = require('crypto').createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0, 16);
      const index = {version: 'v1', generatedAt: new Date().toISOString(), contentHash, site, pageCount, ...content};
      return `${JSON.stringify(index, null, 2)}\n`;
    },
  };
}

// Id of the first doc in a category (its second segment is the category's
// folder: `get-started` for mcp-gateway/get-started/quick-start).
function firstDocId(category) {
  for (const item of category.items || []) {
    if (item.type === 'doc' || item.type === 'ref') return item.id;
    if (item.type === 'category') {
      const id = firstDocId(item);
      if (id) return id;
    }
  }
  return null;
}

function stringList(value, what) {
  if (value === undefined || value === null) return undefined;
  const list = Array.isArray(value) ? value : [value];
  if (!list.length || list.some((s) => typeof s !== 'string' || !s.trim())) {
    throw new Error(`${what} must be a string or a list of strings (quote numbers, e.g. "429")`);
  }
  return list.map((s) => s.trim());
}

// H2 headings of a page's markdown, without code blocks or {#custom-id}s.
function sections(markdown) {
  return [...markdown.replace(/```[\s\S]*?```/g, '').matchAll(/^## (.+)$/gm)].map((m) =>
    m[1].replace(/\s*\{#[^}]*\}\s*$/, '').trim(),
  );
}
