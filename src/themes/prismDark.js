/**
 * Minimal / modern dark Prism theme.
 * Desaturated tones on a deep surface — easy on the eyes.
 *
 * @type {import('prism-react-renderer').PrismTheme}
 */
export const prismDark = {
  plain: {
    color: '#d4d4d8',       // zinc-300
    backgroundColor: '#18181b', // zinc-900
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: '#71717a', fontStyle: 'italic'}, // zinc-500
    },
    {
      types: ['namespace'],
      style: {color: '#71717a'},
    },
    {
      types: ['string', 'char', 'attr-value', 'inserted'],
      style: {color: '#34d399'}, // emerald-400
    },
    {
      types: ['number', 'boolean', 'constant'],
      style: {color: '#fbbf24'}, // amber-400
    },
    {
      types: ['keyword', 'atrule', 'rule', 'important'],
      style: {color: '#a78bfa'}, // violet-400
    },
    {
      types: ['function', 'function-variable'],
      style: {color: '#60a5fa'}, // blue-400
    },
    {
      types: ['tag', 'selector', 'property'],
      style: {color: '#22d3ee'}, // cyan-400
    },
    {
      types: ['class-name', 'symbol', 'attr-name'],
      style: {color: '#facc15'}, // yellow-400
    },
    {
      types: ['regex'],
      style: {color: '#f472b6'}, // pink-400
    },
    {
      types: ['operator', 'arrow', 'spread', 'punctuation'],
      style: {color: '#a1a1aa'}, // zinc-400
    },
    {
      types: ['variable', 'maybe-class-name'],
      style: {color: '#d4d4d8'},
    },
    {
      types: ['builtin', 'entity'],
      style: {color: '#f87171'}, // red-400
    },
    {
      types: ['deleted'],
      style: {color: '#ef4444'},
    },
    {
      types: ['changed'],
      style: {color: '#2dd4bf'}, // teal-400
    },
    {
      types: ['url'],
      style: {color: '#34d399'},
    },
  ],
};
