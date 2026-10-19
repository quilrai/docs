#!/usr/bin/env node
// Checks the frontmatter that feeds /api/v1/index.json, the docs index Quilr
// Assist reads (CLAUDE.md rule 9):
//   - every page: a one-sentence `description`
//   - console screen pages (docs/console/, except get-started/, legacy-v1/
//     and the landing): `console_path` (exact route from quilr-console
//     frontend/src/lib/appPaths.ts) and `aliases`. `console_path` may be empty
//     (`console_path: []`) when the page documents no single screen; the key
//     still has to be there, so the choice is explicit.
//   - wherever they are set: `console_path` is empty, a "/" route or a list of
//     them; `aliases` is a list of strings
//
// Usage:
//   --staged           pre-commit: pages added in this commit must pass
//   <file> [<file>...] check these pages as if they were new
//   (no arguments)     report on every page; fails only on invalid values,
//                      lists missing fields on existing pages as to-dos

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const {DEFAULT_PARSE_FRONT_MATTER} = require('@docusaurus/utils');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const stagedOnly = args.includes('--staged');
const explicitFiles = args.filter((a) => !a.startsWith('--'));
const newPagesMode = stagedOnly || explicitFiles.length > 0;

const isDoc = (rel) => /^docs\/.+\.mdx?$/.test(rel) && !rel.split('/').some((part) => part.startsWith('_'));
const isLanding = (rel) => /^docs\/[^/]+\/overview\.mdx$/.test(rel);
// docs/console/ pages match console screens one to one, except these.
const isConsoleScreenPage = (rel) =>
  rel.startsWith('docs/console/') && !/^docs\/console\/(get-started|legacy-v1)\//.test(rel) && !isLanding(rel);

const isStringList = (v) => Array.isArray(v) && v.length > 0 && v.every((s) => typeof s === 'string' && s.trim());
const isRouteList = (v) => isStringList(typeof v === 'string' ? [v] : v) && [].concat(v).every((s) => s.startsWith('/'));
// `console_path:`, `console_path: ''` and `console_path: []` all mean "no single screen".
const isEmpty = (v) => v === null || v === '' || (Array.isArray(v) && v.length === 0);

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [path.relative(ROOT, full)];
  });
}

function pagesToCheck() {
  if (explicitFiles.length) return explicitFiles.map((f) => path.relative(ROOT, path.resolve(f)));
  if (stagedOnly) {
    return execSync('git diff --cached --name-only --diff-filter=A', {cwd: ROOT, encoding: 'utf8'})
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  }
  return walk(path.join(ROOT, 'docs'));
}

// [invalid values, missing fields, notes] for one page.
function check(rel, fm, body) {
  const invalid = [];
  const missing = [];
  const notes = [];

  if (fm.description !== undefined && (typeof fm.description !== 'string' || !fm.description.trim())) {
    invalid.push('`description` must be a non-empty string');
  } else if (fm.description === undefined) {
    missing.push('add a one-sentence `description` (it feeds llms.txt and /api/v1/index.json)');
  }
  if (fm.console_path !== undefined && !isEmpty(fm.console_path) && !isRouteList(fm.console_path)) {
    invalid.push('`console_path` must be empty, a console route starting with "/", or a list of them');
  }
  if (fm.aliases !== undefined && !isStringList(fm.aliases)) {
    invalid.push('`aliases` must be a non-empty list of strings (quote numbers, e.g. "429")');
  }

  if (isConsoleScreenPage(rel)) {
    if (fm.console_path === undefined) {
      missing.push(
        'add `console_path`: the exact route of this screen from quilr-console frontend/src/lib/appPaths.ts, e.g. `console_path: /settings/organization/audit-logs`, or `console_path: []` if the page documents no single screen',
      );
    }
    if (fm.aliases === undefined) {
      missing.push('add `aliases`: words admins use for this screen, e.g. `aliases: [audit logs, audit trail]`');
    }
  } else if (fm.console_path === undefined && /<ConsolePath\b/.test(body)) {
    notes.push('shows a <ConsolePath> but has no `console_path`; add one if this page documents a whole console screen');
  }
  return {invalid, missing, notes};
}

async function main() {
  const pages = pagesToCheck().filter((rel) => isDoc(rel) && !isLanding(rel));
  const errors = [];
  const todos = [];
  const notes = [];

  for (const rel of pages) {
    const filePath = path.join(ROOT, rel);
    let parsed;
    try {
      parsed = await DEFAULT_PARSE_FRONT_MATTER({filePath, fileContent: fs.readFileSync(filePath, 'utf8')});
    } catch (e) {
      errors.push(`${rel}: frontmatter is not valid YAML (${e.message.split('\n')[0]})`);
      continue;
    }
    const result = check(rel, parsed.frontMatter || {}, parsed.content);
    errors.push(...result.invalid.map((m) => `${rel}: ${m}`));
    (newPagesMode ? errors : todos).push(...result.missing.map((m) => `${rel}: ${m}`));
    if (newPagesMode) notes.push(...result.notes.map((m) => `${rel}: ${m}`));
  }

  for (const note of notes) console.log(`  note: ${note}`);
  if (todos.length) {
    console.log(`\n  ${todos.length} fields missing on existing pages (required only when a page is added):\n`);
    for (const todo of todos) console.log(`  - ${todo}`);
  }
  if (errors.length) {
    console.error('\n  Doc frontmatter check failed:\n');
    for (const err of errors) console.error(`  - ${err}`);
    console.error(
      '\n  These fields feed /api/v1/index.json, which Quilr Assist reads. See CLAUDE.md rule 9\n' +
        '  and .cursor/rules/docs-frontmatter.mdc.\n',
    );
    process.exit(1);
  }
  const scope = stagedOnly ? 'new staged' : explicitFiles.length ? 'given' : 'all';
  console.log(`  Doc frontmatter OK for ${scope} pages (${pages.length} checked).`);
}

main();
