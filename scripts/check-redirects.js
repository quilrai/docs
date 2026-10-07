#!/usr/bin/env node
// Verifies every entry in src/data/redirects.json against a built site:
// the target page exists and, when the target has a #section, that the
// heading id exists on the page. The build checks target pages but not
// sections, and section ids change when headings are reworded.
//
// Usage: npm run build && node scripts/check-redirects.js [buildDir]

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const buildDir = path.resolve(root, process.argv[2] || 'build');
const redirects = require(path.join(root, 'src/data/redirects.json'));

function pageFile(route) {
  const candidates = [
    path.join(buildDir, `${route}.html`),
    path.join(buildDir, route, 'index.html'),
  ];
  return candidates.find((f) => fs.existsSync(f));
}

const problems = [];
for (const [from, to] of Object.entries(redirects)) {
  const [route, anchor] = to.split('#');
  const file = pageFile(route);
  if (!file) {
    problems.push(`${from} -> ${to}: target page does not exist`);
    continue;
  }
  if (anchor && !fs.readFileSync(file, 'utf8').includes(`id="${anchor}"`)) {
    problems.push(`${from} -> ${to}: section #${anchor} not found on the page`);
  }
  if (!pageFile(from)) {
    problems.push(`${from}: no redirect page was generated`);
  }
}

if (problems.length) {
  console.error(`\n  ${problems.length} redirect problem(s):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  process.exit(1);
}
console.log(`\n  All ${Object.keys(redirects).length} redirects point to existing pages and sections.\n`);
