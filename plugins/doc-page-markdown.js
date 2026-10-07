/**
 * Injects globalData.markdownByPermalink for client-side copy / view-as-markdown.
 * The markdown is cleaned for AI use by ./ai-markdown.js (no MDX imports or
 * comments, final-state code, API components and product landings expanded).
 * Also serves each doc as a static .md file:
 *   - In dev: via webpack-dev-server middleware
 *   - In production: written to outDir in postBuild
 * @param {import('@docusaurus/types').LoadContext} context
 */
module.exports = function docPageMarkdownPlugin(context, options = {}) {
  const {siteDir, siteConfig} = context;
  const {products = []} = options;
  const site = siteConfig.url.replace(/\/$/, '');
  const {toAiMarkdown, landingProductId, landingMarkdown} = require('./ai-markdown');

  /** @type {Record<string, string>} shared between hooks */
  let markdownByPermalink = {};

  return {
    name: 'docusaurus-plugin-doc-page-markdown',

    async allContentLoaded({allContent, actions}) {
      const docsContent =
        allContent['docusaurus-plugin-content-docs']?.default;
      if (!docsContent?.loadedVersions) {
        actions.setGlobalData({markdownByPermalink: {}});
        return;
      }

      const {aliasedSitePathToRelativePath, parseMarkdownFile} =
        require('@docusaurus/utils');
      const fs = require('fs/promises');
      const path = require('path');
      const parseFrontMatter = siteConfig.markdown.parseFrontMatter;

      const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
      markdownByPermalink = {};
      for (const version of docsContent.loadedVersions) {
        const docsById = new Map(version.docs.map((d) => [d.id, d]));
        for (const doc of version.docs) {
          try {
            const rel = aliasedSitePathToRelativePath(doc.source);
            const absPath = path.join(siteDir, rel);
            const fileContent = await fs.readFile(absPath, 'utf-8');
            const {content} = await parseMarkdownFile({
              filePath: absPath,
              fileContent,
              parseFrontMatter,
            });
            const landing = productsById[landingProductId(content)];
            markdownByPermalink[doc.permalink] = landing
              ? landingMarkdown(landing, {
                  site,
                  sidebar: version.sidebars[landing.id] || [],
                  docsById,
                  productsById,
                })
              : toAiMarkdown(content, {site, siteDir});
          } catch {
            // Skip unreadable or invalid files
          }
        }
      }

      actions.setGlobalData({markdownByPermalink});
    },

    configureWebpack(_config, isServer) {
      if (isServer) return {};
      return {
        devServer: {
          setupMiddlewares(middlewares, devServer) {
            // <page>.md and its plain-text twin <page>.txt
            devServer.app.get(/\.(md|txt)$/, (req, res, next) => {
              const permalink = req.path.replace(/\.(md|txt)$/, '');
              const content = markdownByPermalink[permalink];
              if (content !== undefined) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.send(content);
              } else if (req.path.endsWith('.txt')) {
                next();
              } else {
                res.status(404).send('Not found');
              }
            });
            return middlewares;
          },
        },
      };
    },

    async postBuild({outDir}) {
      const fs = require('fs/promises');
      const path = require('path');

      // Each page as <page>.md and as <page>.txt. GitHub Pages serves .md
      // as text/markdown, which some AI browsing tools (e.g. ChatGPT) fail to
      // open; the .txt twin is served as text/plain and always readable.
      for (const [permalink, content] of Object.entries(markdownByPermalink)) {
        const base = path.join(outDir, permalink);
        await fs.mkdir(path.dirname(base), {recursive: true});
        await fs.writeFile(base + '.md', content, 'utf-8');
        await fs.writeFile(base + '.txt', content, 'utf-8');
      }
    },
  };
};
