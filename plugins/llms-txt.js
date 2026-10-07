/**
 * Generates the LLM-facing docs indexes from the docs themselves, so they can
 * never drift from the site:
 *   /llms.txt                 every page, grouped by product and sidebar group
 *   /llms-full.txt            the full markdown of every page
 *   /llms/<product>.txt       one product's index (used by the Ask AI launcher)
 *   /llms/<product>-full.txt  one product's full markdown
 * Order and grouping follow the product sidebars; each entry uses the page
 * title and its description (frontmatter `description`, else the first
 * paragraph). Served by middleware in dev, written to outDir on build.
 *
 * Options: {products} from src/data/products.js, {extraLinks} per product id:
 * [{title, url, description}] for non-doc resources (e.g. console guides).
 */
module.exports = function llmsTxtPlugin(context, options) {
  const {siteDir, siteConfig} = context;
  const {products = [], extraLinks = {}} = options;
  const SITE = siteConfig.url;

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
      const markdown = async (doc) => {
        const abs = path.join(siteDir, aliasedSitePathToRelativePath(doc.source));
        const {content} = await parseMarkdownFile({
          filePath: abs,
          fileContent: await fs.readFile(abs, 'utf-8'),
          parseFrontMatter,
        });
        return content.replace(/^import .*$/gm, '').trim();
      };
      const clean = (s) => (s || '').replace(/\s+/g, ' ').replace(/—/g, '-').trim();
      const entry = (doc) => {
        const desc = clean(doc.description);
        return `- [${clean(doc.title)}](${SITE}${doc.permalink}.md)${desc ? `: ${desc}` : ''}`;
      };

      const index = [];
      const fullAll = [];
      files = {};

      for (const product of products) {
        const sidebar = version.sidebars[product.id] || [];
        const lines = [];
        const pages = [];
        const walk = (items, depth) => {
          for (const item of items) {
            if (item.type === 'doc' || item.type === 'ref') {
              const doc = docsById.get(item.id);
              if (!doc || doc.permalink === `/${product.slug}`) continue;
              lines.push(entry(doc));
              pages.push(doc);
            } else if (item.type === 'category') {
              const docs = item.items.filter((i) => i.type !== 'link');
              if (!docs.length) continue;
              lines.push('', `${'#'.repeat(Math.min(3 + depth, 4))} ${item.label}`, '');
              walk(docs, depth + 1);
            }
          }
        };
        walk(sidebar, 0);

        const extras = (extraLinks[product.id] || []).map(
          (l) => `- [${l.title}](${l.url}): ${l.description}`,
        );
        const head = [
          `## ${product.name}`,
          '',
          product.tagline,
          '',
          `- [${product.name} overview](${SITE}/${product.slug}): Landing page with the main tasks and every section.`,
          `- [${product.name} full docs](${SITE}/llms/${product.slug}-full.txt): Every ${product.name} page as markdown in one file.`,
          ...extras,
        ];
        const body = [...head, ...lines].join('\n');
        index.push(body);

        files[`llms/${product.slug}.txt`] = tidy(
          `# QuilrAI ${product.name} documentation\n\n> ${product.tagline}\n\n${body.replace(/^## .*\n\n.*\n\n/, '')}`,
        );

        const full = [`# QuilrAI ${product.name} documentation (full)`, '', `> ${product.tagline}`, ''];
        for (const doc of pages) {
          full.push('', '---', '', `Source: ${SITE}${doc.permalink}`, '', await markdown(doc));
        }
        files[`llms/${product.slug}-full.txt`] = tidy(full.join('\n'));
        fullAll.push(full.slice(4).join('\n'));
      }

      const intro =
        '> QuilrAI governs how an enterprise uses AI: a Console to observe and set policy, an LLM Gateway and MCP Gateway in front of models and tools, a Browser Extension and Endpoint Agent on the workforce side, Red Teaming to test AI systems, and Integrations with the platforms you already run.\n\n' +
        'Every page is available as markdown by adding `.md` to its URL. Each product also has its own index at /llms/<product>.txt and full content at /llms/<product>-full.txt.';
      files['llms.txt'] = tidy(`# QuilrAI Documentation\n\n${intro}\n\n${index.join('\n\n')}`);
      files['llms-full.txt'] = tidy(`# QuilrAI Documentation (full)\n\n${intro}\n${fullAll.join('\n')}`);
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
