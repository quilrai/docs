#!/usr/bin/env node
/**
 * Pulls the Deployment SOP (installation runbooks) from quilrai/installdocs
 * into static/sop/, so the site serves it at /sop/ from the same origin.
 * installdocs stays the single source: edit the SOP there, never here.
 * static/sop/ is gitignored.
 *
 * Runs before `npm start` and `npm run build` (prestart / prebuild).
 *   INSTALL_SOP_SOURCE=/path/to/installdocs  use a local checkout instead of GitHub
 *   INSTALL_SOP_REF=<branch>                 branch to pull (default main)
 *   SKIP_SOP_SYNC=1                          keep whatever static/sop/ holds
 *
 * If the pull fails and a previous copy exists, it is kept with a warning, except
 * in CI, where a stale SOP must not ship. With no copy at all it always fails:
 * the docs link into /sop/ and the build checks those links.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');

const REPO = 'quilrai/installdocs';
const REF = process.env.INSTALL_SOP_REF || 'main';
const SITE_DIR = path.resolve(__dirname, '..');
const DEST = path.join(SITE_DIR, 'static', 'sop');
const VERSION_FILE = 'sop-version.json';

const log = (msg) => console.log(`[install-sop] ${msg}`);
const hasCopy = () => fs.existsSync(path.join(DEST, 'index.html'));
const git = (args, cwd) => execFileSync('git', args, {cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe']}).trim();

function fetchSource() {
  if (process.env.INSTALL_SOP_SOURCE) {
    const dir = path.resolve(process.env.INSTALL_SOP_SOURCE);
    let commit = 'local';
    try {
      commit = git(['rev-parse', 'HEAD'], dir);
    } catch {}
    return {dir, commit, cleanup: () => {}};
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'installdocs-'));
  git(['clone', '--quiet', '--depth', '1', '--branch', REF, `https://github.com/${REPO}.git`, tmp]);
  return {dir: tmp, commit: git(['rev-parse', 'HEAD'], tmp), cleanup: () => fs.rmSync(tmp, {recursive: true, force: true})};
}

function sync() {
  const {dir, commit, cleanup} = fetchSource();
  try {
    const src = path.join(dir, 'static', 'sop');
    if (!fs.existsSync(path.join(src, 'index.html'))) throw new Error(`${src}/index.html not found`);
    // Copy next to the destination, then swap, so a failed copy never leaves half a SOP.
    const staging = `${DEST}.tmp`;
    fs.rmSync(staging, {recursive: true, force: true});
    fs.cpSync(src, staging, {recursive: true});
    fs.writeFileSync(
      path.join(staging, VERSION_FILE),
      `${JSON.stringify({repo: REPO, ref: REF, commit, syncedAt: new Date().toISOString()}, null, 2)}\n`,
    );
    fs.rmSync(DEST, {recursive: true, force: true});
    fs.renameSync(staging, DEST);
    log(`synced ${REPO}@${commit.slice(0, 7)} into static/sop/`);
  } finally {
    cleanup();
  }
}

if (process.env.SKIP_SOP_SYNC) {
  log(`SKIP_SOP_SYNC set, ${hasCopy() ? 'keeping the existing copy' : 'no copy present'}`);
  process.exit(0);
}

try {
  sync();
} catch (err) {
  const reason = (err.stderr || err.message || String(err)).toString().trim();
  if (hasCopy() && !process.env.CI) {
    log(`WARNING: could not pull the SOP (${reason}). Keeping the existing static/sop/ copy.`);
  } else {
    console.error(`[install-sop] ERROR: could not pull the SOP from ${REPO}: ${reason}`);
    process.exit(1);
  }
}
