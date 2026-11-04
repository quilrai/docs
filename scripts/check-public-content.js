#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'build'));
const textExtensions = new Set(['.html', '.js', '.json', '.md', '.txt', '.xml', '.css', '.svg']);
const consoleOrigin = /\b(?:web|console)\.quilr\.(?:ai|dev)\b/i;
const privateArtifacts = ['reviews', '.trail', 'evidence', 'screenshot-ocr.json', 'capture-notes.json'];
const problems = [];

if (!fs.existsSync(root)) {
  console.error('Build the site before checking its public content.');
  process.exit(1);
}

for (const name of privateArtifacts) {
  if (fs.existsSync(path.join(root, name))) problems.push(`Private audit artifact: ${name}`);
}

function visit(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    // Installation docs are maintained upstream and excluded from this check.
    if (directory === root && entry.name === 'sop' && entry.isDirectory()) continue;
    if (entry.isDirectory()) visit(file);
    else if (textExtensions.has(path.extname(file))) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const line = lines.findIndex((value) => consoleOrigin.test(value));
      if (line !== -1) problems.push(`Console address: ${path.relative(root, file)}:${line + 1}`);
    }
  }
}

visit(root);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Public content check passed: no console addresses or private audit artifacts (installation SOP excluded).');
