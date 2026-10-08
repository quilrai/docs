/**
 * Exposes the Deployment SOP synced into static/sop/ (scripts/sync-install-sop.js)
 * to the site: its tracks and steps become global data for <InstallSop> and
 * <SopLink>, and plugins/ai-markdown.js uses the same manifest to turn those
 * components into plain links in the .md / llms.txt output.
 *
 * The manifest is read from the folder layout, so new or renumbered steps show
 * up without touching this repo:
 *   static/sop/<Track>/Step <n> - <Title>/index.html
 * Step keys are the slugged <Title> ("Step 5 - Installing using MDM" ->
 * "installing-using-mdm"), so pages keep linking the right step when the
 * number changes. Labels come from the SOP's own sidebar when present.
 */
const fs = require('fs');
const path = require('path');

const SOP_URL = '/sop/';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function navLabels(indexHtml) {
  const labels = {};
  const re = /<a[^>]*href="([^"]+\/index\.html)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const [, href, inner] of indexHtml.matchAll(re)) {
    // Only the sidebar entries (they carry a step number), not the landing cards.
    if (!inner.includes('class="step-num"')) continue;
    const text = inner.replace(/<span class="step-num">[\s\S]*?<\/span>/, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) labels[decodeURIComponent(href)] = text;
  }
  return labels;
}

/** @returns {null | {commit: string|null, url: string, tracks: Array}} */
function readManifest(siteDir) {
  const root = path.join(siteDir, 'static', 'sop');
  const indexPath = path.join(root, 'index.html');
  if (!fs.existsSync(indexPath)) return null;
  const labels = navLabels(fs.readFileSync(indexPath, 'utf-8'));
  let commit = null;
  try {
    commit = JSON.parse(fs.readFileSync(path.join(root, 'sop-version.json'), 'utf-8')).commit;
  } catch {}

  const tracks = fs
    .readdirSync(root, {withFileTypes: true})
    .filter((d) => d.isDirectory())
    .map((d) => {
      const steps = fs
        .readdirSync(path.join(root, d.name), {withFileTypes: true})
        .map((s) => ({dir: s, m: s.isDirectory() && s.name.match(/^Step\s+(\d+)\s*-\s*(.+)$/)}))
        .filter(({dir, m}) => m && fs.existsSync(path.join(root, d.name, dir.name, 'index.html')))
        .map(({dir, m}) => {
          const rel = `${d.name}/${dir.name}/index.html`;
          return {
            key: slug(m[2]),
            number: Number(m[1]),
            title: m[2].trim(),
            label: labels[rel] || m[2].trim(),
            url: SOP_URL + rel.split('/').map(encodeURIComponent).join('/'),
          };
        })
        .sort((a, b) => a.number - b.number);
      return {id: slug(d.name), title: d.name, steps};
    })
    .filter((t) => t.steps.length);

  return {commit, url: SOP_URL, tracks};
}

/** Finds a step, or throws naming the valid keys (fails the build on a stale link). */
function resolveStep(manifest, trackId, stepKey) {
  const track = manifest?.tracks.find((t) => t.id === trackId);
  if (!track) {
    throw new Error(`[install-sop] Unknown SOP track "${trackId}". Valid: ${manifest?.tracks.map((t) => t.id).join(', ')}`);
  }
  if (!stepKey) return {track, step: null};
  const step = track.steps.find((s) => s.key === stepKey);
  if (!step) {
    throw new Error(
      `[install-sop] Unknown step "${stepKey}" in SOP track "${trackId}". Valid: ${track.steps.map((s) => s.key).join(', ')}`,
    );
  }
  return {track, step};
}

function installSopPlugin(context) {
  const {siteDir} = context;
  return {
    name: 'install-sop',

    getPathsToWatch() {
      return [path.join(siteDir, 'static', 'sop', 'sop-version.json')];
    },

    async loadContent() {
      const manifest = readManifest(siteDir);
      if (!manifest) {
        throw new Error('[install-sop] static/sop/ is missing. Run `npm run sync-sop` (needs network access to GitHub).');
      }
      return manifest;
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
}

module.exports = installSopPlugin;
module.exports.readManifest = readManifest;
module.exports.resolveStep = resolveStep;
