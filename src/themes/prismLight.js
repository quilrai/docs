/**
 * Minimal / modern light Prism theme.
 * Muted palette on a clean white background — lets content breathe.
 *
 * @type {import('prism-react-renderer').PrismTheme}
 */
export const prismLight = {
  plain: {
    color: '#3f3f46',       // zinc-700
    backgroundColor: '#fafafa', // neutral-50
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: '#a1a1aa', fontStyle: 'italic'}, // zinc-400
    },
    {
      types: ['namespace'],
      style: {color: '#a1a1aa'},
    },
    {
      types: ['string', 'char', 'attr-value', 'inserted'],
      style: {color: '#059669'}, // emerald-600
    },
    {
      types: ['number', 'boolean', 'constant'],
      style: {color: '#d97706'}, // amber-600
    },
    {
      types: ['keyword', 'atrule', 'rule', 'important'],
      style: {color: '#7c3aed'}, // violet-600
    },
    {
      types: ['function', 'function-variable'],
      style: {color: '#2563eb'}, // blue-600
    },
    {
      types: ['tag', 'selector', 'property'],
      style: {color: '#0891b2'}, // cyan-600
    },
    {
      types: ['class-name', 'symbol', 'attr-name'],
      style: {color: '#ca8a04'}, // yellow-600
    },
    {
      types: ['regex'],
      style: {color: '#db2777'}, // pink-600
    },
    {
      types: ['operator', 'arrow', 'spread', 'punctuation'],
      style: {color: '#71717a'}, // zinc-500
    },
    {
      types: ['variable', 'maybe-class-name'],
      style: {color: '#3f3f46'},
    },
    {
      types: ['builtin', 'entity'],
      style: {color: '#dc2626'}, // red-600
    },
    {
      types: ['deleted'],
      style: {color: '#ef4444'}, // red-500
    },
    {
      types: ['changed'],
      style: {color: '#0d9488'}, // teal-600
    },
    {
      types: ['url'],
      style: {color: '#059669'},
    },
  ],
};
