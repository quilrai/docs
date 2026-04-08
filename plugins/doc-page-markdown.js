/**
 * Injects globalData.markdownByPermalink for client-side copy / view-as-markdown.
 * Also writes each doc as a static .md file to the build output so it can be
 * linked directly (e.g. from llms.txt).
 * @param {import('@docusaurus/types').LoadContext} context
 */
module.exports = function docPageMarkdownPlugin(context) {
  const {siteDir, siteConfig} = context;

  /** @type {Record<string, string>} shared between allContentLoaded and postBuild */
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

      for (const version of docsContent.loadedVersions) {
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
            markdownByPermalink[doc.permalink] = content.trimEnd();
          } catch {
            // Skip unreadable or invalid files
          }
        }
      }

      actions.setGlobalData({markdownByPermalink});
    },

    async postBuild({outDir}) {
      const fs = require('fs/promises');
      const path = require('path');

      for (const [permalink, content] of Object.entries(markdownByPermalink)) {
        const filePath = path.join(outDir, permalink + '.md');
        await fs.mkdir(path.dirname(filePath), {recursive: true});
        await fs.writeFile(filePath, content, 'utf-8');
      }
    },
  };
};
