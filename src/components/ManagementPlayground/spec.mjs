// Turns the management OpenAPI document into an operation index and builds
// request snippets. Written defensively: it accepts the bundled spec and a
// live spec fetched from a gateway, whichever shape either has.

import { ADMIN_PREFIX, MANAGEMENT_PREFIX, REDACTED, redactSecrets } from './client.mjs';

const SNIPPET_SECRET = '<set-this-secret>';

/** Snippets never carry typed secrets; each one becomes a placeholder to fill in. */
function withSecretPlaceholders(value) {
  return JSON.parse(JSON.stringify(redactSecrets(value)).split(REDACTED).join(SNIPPET_SECRET));
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const DEFAULT_TAG_ORDER = [
  'Reference',
  'Apps',
  'Providers',
  'Quota pools',
  'Credentials',
  'Prompts',
  'Budgets',
  'Catalogs',
  'History',
  'Administration',
];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compileTemplate(path) {
  const names = [];
  const parts = path.split(/(\{[^}]+\})/g);
  let source = '^';
  parts.forEach((part, i) => {
    const m = part.match(/^\{([^}]+)\}$/);
    if (m) {
      names.push(m[1]);
      // A trailing model id may contain "/" (catch-all route on the server).
      const last = i === parts.length - 1 || (i === parts.length - 2 && parts[i + 1] === '');
      source += last && /model/i.test(m[1]) ? '(.+)' : '([^/]+)';
    } else {
      source += escapeRegex(part);
    }
  });
  return { regex: new RegExp(`${source}$`), names };
}

function isAliasPath(path) {
  return path.startsWith(`${MANAGEMENT_PREFIX}/app/`) || path === `${MANAGEMENT_PREFIX}/app`;
}

export function buildIndex(spec) {
  const operations = [];
  const paths = (spec && spec.paths) || {};
  for (const [path, item] of Object.entries(paths)) {
    if (!item || typeof item !== 'object') continue;
    const shared = Array.isArray(item.parameters) ? item.parameters : [];
    for (const method of METHODS) {
      const op = item[method];
      if (!op || typeof op !== 'object') continue;
      const ownParams = Array.isArray(op.parameters) ? op.parameters : [];
      const merged = [...shared.filter((p) => !ownParams.some((o) => o.name === p.name && o.in === p.in)), ...ownParams];
      const parameters = merged.map((p) => resolveRef(spec, p)).filter((p) => p && p.name);
      const security = JSON.stringify(op.security || spec.security || []);
      const isAdmin = path.startsWith(ADMIN_PREFIX) || security.includes('TenantAdminJWT');
      const aliasOf =
        op['x-alias-of'] || (isAliasPath(path) ? op.operationId?.replace(/_query$/, '') || true : null);
      const id = op.operationId || `${method}_${path}`.replace(/[^A-Za-z0-9_]+/g, '_');
      operations.push({
        id,
        method: method.toUpperCase(),
        path,
        summary: op.summary || `${method.toUpperCase()} ${path}`,
        description: op.description || '',
        tags: Array.isArray(op.tags) && op.tags.length ? op.tags : ['Other'],
        scopes: Array.isArray(op['x-scopes']) ? op['x-scopes'] : [],
        aliasOf,
        isAdmin,
        deprecated: !!op.deprecated,
        parameters,
        requestBody: resolveRef(spec, op.requestBody),
        responses: op.responses || {},
        template: compileTemplate(path),
      });
    }
  }
  const tagNames = [];
  const declared = Array.isArray(spec?.tags) ? spec.tags.map((t) => t.name) : [];
  for (const name of [...DEFAULT_TAG_ORDER.filter((t) => declared.includes(t)), ...declared, ...DEFAULT_TAG_ORDER]) {
    if (!tagNames.includes(name) && operations.some((op) => op.tags.includes(name))) tagNames.push(name);
  }
  for (const op of operations) for (const t of op.tags) if (!tagNames.includes(t)) tagNames.push(t);
  const tagInfo = Object.fromEntries((spec?.tags || []).map((t) => [t.name, t.description || '']));
  const byId = new Map(operations.map((op) => [op.id, op]));
  return { spec, operations, byId, tagNames, tagInfo };
}

/** Finds the operation for a concrete request path (pathname, no query). */
export function matchOperation(index, method, pathname) {
  if (!index) return null;
  let best = null;
  for (const op of index.operations) {
    if (op.method !== method.toUpperCase()) continue;
    const m = pathname.match(op.template.regex);
    if (!m) continue;
    const score = op.template.names.length + (op.aliasOf ? 0.5 : 0);
    if (!best || score < best.score) {
      const pathParams = {};
      op.template.names.forEach((name, i) => {
        try {
          pathParams[name] = decodeURIComponent(m[i + 1]);
        } catch {
          pathParams[name] = m[i + 1];
        }
      });
      best = { op, pathParams, score };
    }
  }
  return best;
}

export function findOperation(index, method, path) {
  return index?.operations.find((op) => op.method === method && op.path === path) || null;
}

export function resolveRef(spec, schema, seen = 0) {
  if (!schema || typeof schema !== 'object' || seen > 20) return schema;
  if (typeof schema.$ref === 'string' && schema.$ref.startsWith('#/')) {
    const target = schema.$ref
      .slice(2)
      .split('/')
      .reduce((node, key) => (node ? node[key.replace(/~1/g, '/').replace(/~0/g, '~')] : undefined), spec);
    if (!target) return schema;
    const rest = Object.fromEntries(Object.entries(schema).filter(([k]) => k !== '$ref'));
    return { ...resolveRef(spec, target, seen + 1), ...rest, _refName: schema.$ref.split('/').pop() };
  }
  return schema;
}

export function jsonContent(spec, holder) {
  const content = holder?.content;
  if (!content) return null;
  const media = content['application/json'] || Object.values(content)[0];
  return media ? { ...media, schema: resolveRef(spec, media.schema) } : null;
}

/** Builds a sample value from a schema when the spec has no example. */
export function sampleFromSchema(spec, original, depth = 0) {
  const schema = resolveRef(spec, original);
  if (!schema || depth > 6) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  const variants = schema.oneOf || schema.anyOf;
  if (variants) {
    const firstNonNull = variants.map((v) => resolveRef(spec, v)).find((v) => v && v.type !== 'null');
    return sampleFromSchema(spec, firstNonNull, depth + 1);
  }
  const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== 'null') : schema.type;
  if (type === 'object' || schema.properties) {
    const out = {};
    const required = schema.required || [];
    for (const [name, prop] of Object.entries(schema.properties || {})) {
      if (required.length && !required.includes(name)) continue;
      out[name] = sampleFromSchema(spec, prop, depth + 1);
    }
    return out;
  }
  if (type === 'array') return [];
  if (type === 'integer' || type === 'number') return schema.minimum ?? 0;
  if (type === 'boolean') return false;
  if (type === 'string') return schema.format === 'date-time' ? '2030-01-01T00:00:00Z' : '';
  return null;
}

/** Returns [[name, value], ...] request body examples for an operation. */
export function bodyExamples(spec, op) {
  const media = jsonContent(spec, op?.requestBody);
  if (!media) return [];
  if (media.examples && typeof media.examples === 'object') {
    const list = Object.entries(media.examples)
      .map(([name, ex]) => {
        const resolved = resolveRef(spec, ex);
        return [resolved?.summary || name, resolved?.value !== undefined ? resolved.value : resolved];
      })
      .filter(([, v]) => v !== undefined);
    if (list.length) return list;
  }
  if (media.example !== undefined) return [['Example', media.example]];
  if (media.schema?.example !== undefined) return [['Example', media.schema.example]];
  return [['From schema', sampleFromSchema(spec, media.schema) ?? {}]];
}

export function successResponse(spec, op) {
  const entry = Object.entries(op?.responses || {}).find(([status]) => /^2/.test(status));
  if (!entry) return null;
  const [status, raw] = entry;
  const response = resolveRef(spec, raw);
  const media = jsonContent(spec, response);
  let example = media?.example;
  if (example === undefined && media?.examples) {
    const first = Object.values(media.examples)[0];
    example = resolveRef(spec, first)?.value;
  }
  return { status, description: response?.description || '', schema: media?.schema, example };
}

/* ── Snippets ─────────────────────────────────────────────────────────── */

const shellQuote = (text) => `'${String(text).replace(/'/g, `'\\''`)}'`;

function toPython(value, indent = 0) {
  const pad = '    '.repeat(indent);
  const inner = '    '.repeat(indent + 1);
  if (value === null || value === undefined) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[\n${value.map((v) => inner + toPython(v, indent + 1)).join(',\n')},\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([k, v]) => `${inner}${JSON.stringify(k)}: ${toPython(v, indent + 1)}`).join(',\n')},\n${pad}}`;
}

/**
 * request: { method, url, headers: {name: value}, bodyText, tokenKind }
 * The credential is always an environment variable placeholder.
 */
export function buildSnippets({ method, url, headers = {}, bodyText, tokenKind = 'management' }) {
  const envName = tokenKind === 'admin' ? 'QUILR_TENANT_ADMIN_JWT' : 'QUILR_MANAGEMENT_KEY';
  let parsed;
  let hasBody = bodyText !== undefined && bodyText !== null && String(bodyText).trim() !== '';
  if (hasBody) {
    try {
      parsed = withSecretPlaceholders(JSON.parse(bodyText));
    } catch {
      parsed = undefined;
    }
  }
  const extra = Object.entries(headers).filter(([, v]) => v !== undefined && v !== null && v !== '');

  const curl = [`curl -X ${method} ${shellQuote(url)}`, `  -H "Authorization: Bearer $${envName}"`];
  for (const [k, v] of extra) curl.push(`  -H ${shellQuote(`${k}: ${v}`)}`);
  if (hasBody) {
    curl.push(`  -H 'Content-Type: application/json'`);
    curl.push(`  --data ${shellQuote(parsed !== undefined ? JSON.stringify(parsed, null, 2) : bodyText)}`);
  }

  const pyHeaders = [`        "Authorization": f"Bearer {os.environ['${envName}']}",`];
  for (const [k, v] of extra) pyHeaders.push(`        ${JSON.stringify(k)}: ${JSON.stringify(String(v))},`);
  const pyBody = hasBody
    ? parsed !== undefined
      ? `    json=${toPython(parsed, 1)},\n`
      : `    data=${JSON.stringify(bodyText)},\n`
    : '';
  const python = `import os

import requests

response = requests.request(
    ${JSON.stringify(method)},
    ${JSON.stringify(url)},
    headers={
${pyHeaders.join('\n')}
    },
${pyBody}    timeout=60,
)
print(response.status_code)
print(response.json())`;

  const jsHeaders = [`    Authorization: \`Bearer \${process.env.${envName}}\`,`];
  for (const [k, v] of extra) jsHeaders.push(`    ${JSON.stringify(k)}: ${JSON.stringify(String(v))},`);
  if (hasBody) jsHeaders.push(`    'Content-Type': 'application/json',`);
  const jsBody = hasBody
    ? parsed !== undefined
      ? `  body: JSON.stringify(${JSON.stringify(parsed, null, 2).replace(/\n/g, '\n  ')}),\n`
      : `  body: ${JSON.stringify(bodyText)},\n`
    : '';
  const javascript = `const response = await fetch(${JSON.stringify(url)}, {
  method: ${JSON.stringify(method)},
  headers: {
${jsHeaders.join('\n')}
  },
${jsBody}});
console.log(response.status, await response.json());`;

  return { curl: curl.join(' \\\n'), python, javascript };
}

export function curlForActivity(entry) {
  const body = entry.requestBody;
  return buildSnippets({
    method: entry.method,
    url: `${entry.origin}${entry.path}`,
    headers: Object.fromEntries(
      Object.entries(entry.requestHeaders || {}).filter(([k]) => !/^(accept|content-type)$/i.test(k)),
    ),
    bodyText: body === null || body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    tokenKind: entry.tokenKind,
  }).curl;
}
