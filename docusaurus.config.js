// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {prismLight} from './src/themes/prismLight.js';
import {prismDark} from './src/themes/prismDark.js';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'QuilrAI Docs',
  tagline: 'Documentation for QuilrAI',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // GitHub Pages: https://docusaurus.io/docs/deployment#deploying-to-github-pages
  url: 'https://quilrai.github.io',
  baseUrl: '/docs/',

  organizationName: 'quilrai',
  projectName: 'docs',

  trailingSlash: false,

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      // @ts-ignore
      '@easyops-cn/docusaurus-search-local',
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      // @ts-ignore
      ({
        hashed: true,
        language: ['en'],
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: '/',
        explicitSearchResultPath: true,
        searchBarShortcut: true,
        searchBarShortcutHint: true,
      }),
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/QuilrAi-Open-Graph.png',
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
        disableSwitch: false,
      },
      navbar: {
        title: '',
        logo: {
          alt: 'QuilrAi',
          src: 'img/QuilrAI-light.png',
          srcDark: 'img/QuilrAI-dark.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://www.quilr.ai/resources',
            label: 'Resources',
            position: 'right',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Documentation',
                to: '/',
              },
              {
                label: 'Resources',
                href: 'https://www.quilr.ai/resources',
                target: '_blank',
                rel: 'noopener noreferrer',
              }
            ],
          },
          
        ],
        copyright: `Copyright © ${new Date().getFullYear()} QuilrAI. Built with Docusaurus.`,
      },
      prism: {
        theme: prismLight,
        darkTheme: prismDark,
      },
    }),
};

export default config;
