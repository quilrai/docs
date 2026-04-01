/**
 * Injects globalData.markdownByPermalink for client-side copy / view-as-markdown.
 * @param {import('@docusaurus/types').LoadContext} context
 */
module.exports = function docPageMarkdownPlugin(context) {
  const {siteDir, siteConfig} = context;

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

      /** @type {Record<string, string>} */
      const markdownByPermalink = {};

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
  };
};
