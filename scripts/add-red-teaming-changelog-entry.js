#!/usr/bin/env node
// Adds one entry to the top of the Red Teaming changelog. Run by
// .github/workflows/red-teaming-changelog.yml when quilrbusiness/quilr-console
// merges a PR labelled `changelog` into quilr-preprod.
//
// The note is the PR's "Release note" section: its first line is the entry's
// heading, the rest its body. It comes from another repo and lands on a public
// site, so it is MDX-escaped here and the workflow builds the site before
// opening a PR; nothing is pushed to main.
//
// Usage: NOTE=... DATE=YYYY-MM-DD node scripts/add-red-teaming-changelog-entry.js

const fs = require('fs');
const path = require('path');

const page = path.resolve(__dirname, '../docs/red-teaming/release-notes/changelog.md');
const MAX_NOTE = 4000;

function fail(message) {
  console.error(message);
  process.exit(1);
}

// `{` and `<` start MDX expressions and JSX; leave code spans alone.
function escapeMdx(line) {
  return line
    .split('`')
    .map((part, i) => (i % 2 ? part : part.replace(/[{}]/g, '\\$&').replace(/</g, '&lt;')))
    .join('`');
}

const note = (process.env.NOTE || '').replace(/\r/g, '').replace(/\u2014/g, '-').trim();
const date = process.env.DATE || '';
if (!note) fail('NOTE is empty.');
if (note.length > MAX_NOTE) fail(`NOTE is longer than ${MAX_NOTE} characters.`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`DATE must be YYYY-MM-DD, got "${date}".`);

const [first, ...rest] = note.split('\n');
const heading = escapeMdx(first.replace(/^[#*\-\s]+/, '').trim());
if (!heading) fail('The release note has no heading line.');
const body = rest.map(escapeMdx).join('\n').trim();
const entry = `## ${heading} (${date})\n\n${body ? `${body}\n\n` : ''}`;

const text = fs.readFileSync(page, 'utf8');
const firstEntry = text.search(/^## /m);
const updated =
  firstEntry === -1
    ? `${text.trimEnd()}\n\n${entry.trimEnd()}\n`
    : text.slice(0, firstEntry) + entry + text.slice(firstEntry);
fs.writeFileSync(page, updated);
console.log(`Added "${heading} (${date})" to ${path.relative(process.cwd(), page)}`);
