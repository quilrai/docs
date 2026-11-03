#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'build'));
const textExtensions = new Set(['.html', '.js', '.json', '.md', '.txt', '.xml', '.css', '.svg']);
const consoleOrigin = /\b(?:web|console)\.quilr\.(?:ai|dev)\b/i;
const uuid = /\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i;
const roleContacts = new Set(['support', 'sales', 'docs', 'security', 'info', 'hello']);
const technicalIdentifiers = new Set(['firefox-extension@quilr.ai']);
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
    if (entry.isDirectory()) visit(file);
    else if (textExtensions.has(path.extname(file))) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const line = lines.findIndex((value) => consoleOrigin.test(value));
      if (line !== -1) problems.push(`Console address: ${path.relative(root, file)}:${line + 1}`);
      if (path.relative(root, file).startsWith(`sop${path.sep}`) && path.extname(file) === '.html') {
        const personalEmail = [...content.matchAll(/\b([a-z0-9._%+-]+)@quilr\.ai\b/gi)]
          .some((match) => !roleContacts.has(match[1].toLowerCase())
            && !technicalIdentifiers.has(match[0].toLowerCase()));
        const tenantInAlt = [...content.matchAll(/\balt\s*=\s*(["'])([\s\S]*?)\1/gi)]
          .some((match) => uuid.test(match[2]));
        if (personalEmail || tenantInAlt) {
          problems.push(`Identifying SOP example: ${path.relative(root, file)}`);
        }
      }
    }
  }
}

visit(root);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Public content check passed: no console addresses, identifying SOP examples, or private audit artifacts.');
