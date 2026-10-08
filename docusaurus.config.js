// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { prismLight } from './src/themes/prismLight.js';
import { prismDark } from './src/themes/prismDark.js';
import { products, crossLinks, syntheticCategories } from './src/data/products.js';
import movedPages from './src/data/redirects.json' with { type: 'json' };

// Every page that moved in the platform restructure keeps working at its old
// URL (plus the .md and legacy /docs variants).
const movedPageRedirects = Object.entries(movedPages).map(([from, to]) => ({
    from: from.startsWith('/category/') || from === '/console-v1' || from === '/console-v1/deployment'
        ? [from, `/docs${from}`]
        : [from, `${from}.md`, `/docs${from}`, `/docs${from}.md`],
    to,
}));

// Adds cross-product links and link-only categories to the generated sidebars.
// Categories are matched by the folder of the docs they contain.
function categoryFolder(item) {
    for (const child of item.items || []) {
        if (child.type === 'doc') return child.id.split('/').slice(0, -1).join('/');
        if (child.type === 'category') {
            const f = categoryFolder(child);
            if (f) return f.split('/').slice(0, -1).join('/');
        }
    }
    return null;
}
const linkItem = (l) => ({
    type: 'link',
    label: l.label,
    href: l.href,
    customProps: { crossLink: l.product },
});
async function sidebarItemsGenerator({ defaultSidebarItemsGenerator, ...args }) {
    const items = await defaultSidebarItemsGenerator(args);
    const root = args.item.dirName;
    for (const item of items) {
        if (item.type !== 'category') continue;
        const folder = categoryFolder(item);
        for (const c of crossLinks.filter((c) => c.in === folder)) {
            const links = c.links.map(linkItem);
            item.items = c.at === 'start' ? [...links, ...item.items] : [...item.items, ...links];
        }
    }
    for (const syn of syntheticCategories.filter((s) => s.root === root)) {
        const cat = {
            type: 'category',
            label: syn.label,
            collapsible: true,
            collapsed: false,
            items: syn.links.map(linkItem),
            customProps: { icon: syn.icon },
        };
        const i = syn.after ? items.findIndex((it) => it.type === 'category' && categoryFolder(it) === syn.after) : -1;
        if (i >= 0) items.splice(i + 1, 0, cat);
        else items.push(cat);
    }
    return items;
}

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
    url: 'https://docs.quilrai.dev',
    baseUrl: '/',

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

    markdown: {
        mermaid: true,
        format: 'mdx',
    },

    themes: [
        '@docusaurus/theme-mermaid',
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

    plugins: [
        ['./plugins/doc-page-markdown.js', {products}],
        // Deployment SOP pulled from quilrai/installdocs into static/sop/ (scripts/sync-install-sop.js).
        './plugins/install-sop.js',
        [
            './plugins/llms-txt.js',
            {
                products,
                // Console navigation guides for AI agents (exact on-screen labels and URLs).
                extraLinks: Object.fromEntries(products.filter((p) => p.consoleGuide).map((p) => [p.id, [{
                    title: `${p.name} console guide`,
                    url: `https://docs.quilrai.dev${p.consoleGuide}`,
                    description: `Exact labels, URLs and task-to-screen map for the ${p.name} pages of the admin console.`,
                }]])),
            },
        ],
        [
            '@docusaurus/plugin-client-redirects',
            {
                redirects: [
                    ...movedPageRedirects,
                    {
                        from: [
                            '/llm-gateway/openai-to-bedrock',
                            '/llm-gateway/openai-to-bedrock.md',
                            '/docs/llm-gateway/openai-to-bedrock',
                            '/docs/llm-gateway/openai-to-bedrock.md',
                        ],
                        to: '/llm-gateway/api-reference/unified-completions',
                    },
                    {
                        from: [
                            '/playground/llm-gateway-sdk',
                            '/playground/llm-gateway-sdk.md',
                            '/docs/playground/llm-gateway-sdk',
                            '/docs/playground/llm-gateway-sdk.md',
                        ],
                        to: '/llm-gateway-playground',
                    },
                    {
                        from: [
                            '/playground/log-export',
                            '/playground/log-export.md',
                            '/docs/playground/log-export',
                            '/docs/playground/log-export.md',
                            '/playground',
                            '/docs/playground',
                        ],
                        to: '/llm-gateway-playground',
                    },
                    {
                        from: [
                            '/llm-gateway/features/self-service',
                            '/llm-gateway/features/self-service.md',
                            '/docs/llm-gateway/features/self-service',
                            '/docs/llm-gateway/features/self-service.md',
                        ],
                        to: '/llm-gateway/self-service/overview',
                    },
                ],
                createRedirects(existingPath) {
                    // Redirect legacy /docs/* URLs to the new / root
                    if (existingPath === '/') {
                        return ['/docs'];
                    }
                    return [`/docs${existingPath}`];
                },
            },
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
                    sidebarItemsGenerator,
                },
                blog: false,
                sitemap: {
                    filename: 'sitemap.xml',
                    ignorePatterns: ['/search'],
                    lastmod: 'date',
                },
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
            docs: {
                sidebar: {
                    autoCollapseCategories: false,
                },
            },
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
                    // One tab per product (styled by src/theme/Navbar/Content).
                    ...products.map((p) => ({
                        type: 'docSidebar',
                        sidebarId: p.id,
                        position: 'left',
                        label: p.name,
                        className: `product-tab product-tab--${p.id}`,
                    })),
                    {
                        to: '/videos',
                        label: 'Videos',
                        position: 'right',
                    },
                    {
                        to: '/llm-gateway-playground',
                        label: 'Playground',
                        position: 'right',
                    },
                    {
                        to: '/health',
                        label: 'Health',
                        position: 'right',
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
                                label: 'Videos',
                                to: '/videos',
                            },
                            {
                                label: 'Open source',
                                to: '/#open-source',
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
                magicComments: [
                    {
                        className: 'theme-code-block-highlighted-line',
                        line: 'highlight-next-line',
                        block: { start: 'highlight-start', end: 'highlight-end' },
                    },
                    {
                        className: 'code-block-diff-add-line',
                        line: 'diff-add',
                    },
                    {
                        className: 'code-block-diff-remove-line',
                        line: 'diff-remove',
                    },
                ],
            },
        }),
};

export default config;
