#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.resolve(__dirname, "../docs");
const ICON_MAP_FILE = path.resolve(
  __dirname,
  "../src/utils/sidebarIcons.js"
);

const stagedOnly = process.argv.includes("--staged");

function getRegisteredIcons() {
  const content = fs.readFileSync(ICON_MAP_FILE, "utf8");
  const mapMatch = content.match(/const iconMap\s*=\s*\{([^}]+)\}/);
  if (!mapMatch) {
    console.error("Could not parse iconMap from sidebarIcons.js");
    process.exit(2);
  }
  return mapMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getStagedDocsFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
    encoding: "utf8",
  });
  return output
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => f.startsWith("docs/"))
    .map((f) => path.resolve(__dirname, "..", f));
}

function walkDir(dir, pattern) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const iconMatch = yaml.match(/^\s*icon:\s*(.+)$/m);
  const hasSidebarCustomProps = /sidebar_custom_props:/.test(yaml);

  return {
    hasSidebarCustomProps,
    icon: iconMatch ? iconMatch[1].trim() : null,
  };
}

const registeredIcons = getRegisteredIcons();
const errors = [];

let mdFiles;
let categoryFiles;

if (stagedOnly) {
  const staged = getStagedDocsFiles();
  mdFiles = staged.filter((f) => /\.mdx?$/.test(f));
  categoryFiles = staged.filter((f) => f.endsWith("_category_.json"));
} else {
  mdFiles = walkDir(DOCS_DIR, /\.mdx?$/);
  categoryFiles = walkDir(DOCS_DIR, /^_category_\.json$/);
}

for (const file of mdFiles) {
  const content = fs.readFileSync(file, "utf8");
  const fm = extractFrontmatter(content);
  const rel = path.relative(process.cwd(), file);

  if (!fm) {
    errors.push(`${rel}: missing frontmatter entirely`);
    continue;
  }
  if (!fm.hasSidebarCustomProps || !fm.icon) {
    errors.push(`${rel}: missing sidebar_custom_props.icon in frontmatter`);
    continue;
  }
  if (!registeredIcons.includes(fm.icon)) {
    errors.push(
      `${rel}: icon "${fm.icon}" is not registered in src/utils/sidebarIcons.js`
    );
  }
}

for (const file of categoryFiles) {
  const rel = path.relative(process.cwd(), file);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    errors.push(`${rel}: invalid JSON`);
    continue;
  }
  if (!json.customProps?.icon) {
    errors.push(`${rel}: missing customProps.icon`);
    continue;
  }
  if (!registeredIcons.includes(json.customProps.icon)) {
    errors.push(
      `${rel}: icon "${json.customProps.icon}" is not registered in src/utils/sidebarIcons.js`
    );
  }
}

if (errors.length > 0) {
  console.error("\n  Sidebar icon check failed:\n");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  console.error(
    "\n  Every doc page and category must have an icon from src/utils/sidebarIcons.js.\n" +
      "  See .cursor/rules/docs-icons.mdc for details.\n"
  );
  process.exit(1);
} else {
  const scope = stagedOnly ? "staged" : "all";
  console.log(`  All ${scope} doc pages and categories have valid sidebar icons.`);
}
