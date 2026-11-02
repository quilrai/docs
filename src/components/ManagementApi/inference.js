import React, {useId, useState} from 'react';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {ArrowLeftRight, Bot, Boxes, Cloud, Download, FileJson, FlaskConical, Globe, Languages, ListOrdered, MessagesSquare, Play, Plug, Radio, Route, Scale, Search, ShieldCheck, Sparkles, Terminal, Wind, Zap} from 'lucide-react';
import spec from '@site/static/openapi/llm-gateway-inference-v1.json';
import familyData from '@site/src/data/inferenceApiFamilies';
import styles from './styles.module.css';
import {createApiReference} from './core';

// Inference API v1 reference: the Management API components (./core.js) built
// for static/openapi/llm-gateway-inference-v1.json, plus the tables only this
// spec has (error codes, gateway response headers, credentials, downloads).
// Families and playground links: src/data/inferenceApiFamilies.js.

const page = './inference-api';
const download = '/openapi/llm-gateway-inference-v1.json';
const familyDownload = key => `/openapi/llm-gateway-inference-v1-${key}.json`;
const liveSpecPath = '/llmgateway_inference_apis/v1/openapi.json';
const playground = '/llm-gateway-playground';
const icons = {openai_compatible: MessagesSquare, openai_responses: Sparkles, azure_openai: Cloud, openai_realtime: Radio, openai_assistants: Bot, anthropic_messages: ArrowLeftRight, bedrock_runtime: Boxes, google_gemini: Globe, rerank: ListOrdered, mistral: Wind, xai: Zap, sarvam: Languages, typesafe: Scale, specification: FileJson, other: Route};

// The base URL with each server variable at its default (https://{region}.quilr.ai -> the default region).
export const serverUrl = (server = spec.servers?.[0]) => server ? server.url.replace(/\{(\w+)\}/g, (m, name) => server.variables?.[name]?.default ?? m) : 'https://guardrails-usa-1.quilr.ai';
const host = serverUrl();

const families = familyData.families;
const familyByTag = Object.fromEntries(families.flatMap(f => f.tags.map(t => [t, f])));
const familyOf = op => familyByTag[op.tags[0]] || familyData.other;
const methodPath = (method, path) => `${method} ${path}`;

const schemeHeader = (name, scheme = spec.components.securitySchemes[name] || {}) =>
  name === 'AwsSigV4' ? 'Authorization: AWS4-HMAC-SHA256 (SigV4)'
    : scheme.type === 'http' && scheme.scheme === 'bearer' ? 'Authorization: Bearer'
      : scheme.name || name;
const schemesOf = op => (op.security || []).flatMap(req => Object.keys(req));

const exampleValue = p => p.example ?? p.schema?.example ?? p.schema?.default ?? p.schema?.enum?.[0];
const shellQuote = s => "'" + String(s).replace(/'/g, "'\\''") + "'";
const print = value => JSON.stringify(value, null, 2);
const isWebSocket = op => Boolean(op['x-quilr-websocket']);
const streamOnly = op => {
  const types = Object.keys(op.responses?.['200']?.content || {});
  return types.length > 0 && types.every(t => t === 'text/event-stream' || t === 'application/vnd.amazon.eventstream');
};

let api;

// A minimal body from the schema's required fields, for operations whose spec has no example.
function sampleFor(schema, depth = 0, name = 'value') {
  const s = api.resolve(schema);
  if (s.example !== undefined) return s.example;
  if (s.const !== undefined) return s.const;
  if (s.enum) return s.enum[0];
  if (s.default !== undefined) return s.default;
  if (s.oneOf || s.anyOf) return sampleFor((s.oneOf || s.anyOf).find(v => api.resolve(v).type !== 'null') || {}, depth + 1, name);
  const type = Array.isArray(s.type) ? s.type.find(t => t !== 'null') : s.type;
  if (type === 'object' || s.properties) {
    if (depth > 4) return {};
    let keys = (s.required || []).filter(k => s.properties?.[k]);
    // A nested object with no required fields: show its text field, or its first one.
    if (!keys.length && depth > 0 && s.properties) keys = [s.properties.text ? 'text' : Object.keys(s.properties)[0]].filter(Boolean);
    return Object.fromEntries(keys.map(k => [k, sampleFor(s.properties[k], depth + 1, k)]));
  }
  if (type === 'array') return depth > 4 ? [] : [sampleFor(s.items || {}, depth + 1, name)];
  if (type === 'integer' || type === 'number') return s.minimum ?? 1;
  if (type === 'boolean') return false;
  return s.format === 'binary' ? '@file' : name === 'text' || name === 'content' || name === 'input' ? 'Hello' : `<${name}>`;
}

function curlFor(op, body, mediaType) {
  let path = op.path;
  op.parameters.filter(p => p.in === 'path').forEach(p => { path = path.replace('{' + p.name + '}', exampleValue(p) ?? `<${p.name}>`); });
  const queries = op.parameters.filter(p => p.in === 'query' && p.required).map(p => `${p.name}=${encodeURIComponent(exampleValue(p) ?? `<${p.name}>`)}`);
  const lines = [`curl --request ${op.method}${streamOnly(op) ? ' --no-buffer' : ''} \\`, `  ${shellQuote(host + path + (queries.length ? '?' + queries.join('&') : ''))} \\`, '  --header "Authorization: Bearer $QUILR_API_KEY"'];
  const add = line => { lines[lines.length - 1] += ' \\'; lines.push(line); };
  op.parameters.filter(p => p.in === 'header' && (p.required || p.name === 'anthropic-version')).forEach(p => add(`  --header ${shellQuote(`${p.name}: ${exampleValue(p) ?? '<value>'}`)}`));
  if (body !== undefined && mediaType === 'multipart/form-data') {
    Object.entries(body || {}).forEach(([k, v]) => add(`  --form ${shellQuote(`${k}=${v === '@file' ? '@' + k : typeof v === 'string' ? v : JSON.stringify(v)}`)}`));
  } else if (body !== undefined) {
    add(`  --header 'Content-Type: ${mediaType === '*/*' ? 'application/json' : mediaType}'`);
    add('  --data ' + shellQuote(print(body)));
  }
  return lines.join('\n');
}

function webSocketExample(op) {
  const query = op.parameters.filter(p => p.in === 'query' && (p.required || p.name === 'model')).map(p => `${p.name}=${encodeURIComponent(exampleValue(p) ?? `<${p.name}>`)}`);
  return [
    '# WebSocket upgrade (any client that sends headers on the handshake)',
    'websocat \\',
    '  --header "Authorization: Bearer $QUILR_API_KEY" \\',
    `  ${shellQuote(host.replace(/^http/, 'ws') + op.path + (query.length ? '?' + query.join('&') : ''))}`,
  ].join('\n');
}

const playgroundSurface = op => familyData.playground[methodPath(op.method, op.path)];
const headerAnchor = name => 'header-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

api = createApiReference({
  spec,
  hero: {
    eyebrow: 'LLM GATEWAY / INFERENCE V1',
    title: 'Call any model with the SDK you already use.',
    subtitle: 'One gateway, every provider format.',
    text: 'The client-facing model APIs of the LLM Gateway, in each provider\'s own wire format: OpenAI, Azure OpenAI, Anthropic, AWS Bedrock, Gemini and Vertex AI, and more. Browse every operation and what the gateway adds to it, or import the OpenAPI document into your API gateway.',
    actions: [
      {label: 'Import into Kong', to: page + '#import-into-your-api-gateway-kong', primary: true},
      {label: 'Open the playground', to: playground, Icon: Play},
      {label: 'OpenAPI reference', href: download, Icon: Download, download: true},
    ],
    facts: [{label: 'Provider wire formats', Icon: ArrowLeftRight}, {label: 'Guardrails on every call', Icon: ShieldCheck}, {label: 'Routing and failover headers', Icon: Route}],
  },
  cardsLabel: 'Inference API families',
  cards: operations => [...families, familyData.other]
    .map(f => ({f, n: operations.filter(op => familyOf(op).key === f.key).length}))
    .filter(({n}) => n > 0)
    .map(({f, n}) => ({title: f.label, desc: f.desc || 'Operations whose tag is in no API family.', to: `${page}#${f.key === 'other' ? 'endpoint-reference' : f.anchor}`, Icon: icons[f.key] || Plug, footer: `${n} operation${n === 1 ? '' : 's'}`})),
  aliasOf: op => op['x-quilr-alias-of'] && methodPath(op.method, op['x-quilr-alias-of']),
  opKey: op => methodPath(op.method, op.path),
  allLabel: 'All API families',
  filters: [
    {label: 'API family', options: [...families, familyData.other].filter(f => f.key === 'other' ? Object.values(spec.paths).some(ms => Object.values(ms).some(o => !familyByTag[o.tags[0]])) : true).map(f => ({label: f.label, value: 'family:' + f.key}))},
    {label: 'Resource', options: spec.tags.map(t => ({label: t.name, value: 'tag:' + t.name}))},
  ],
  matchFilter: (op, value) => value.startsWith('family:') ? familyOf(op).key === value.slice(7) : op.tags.includes(value.slice(4)),
  searchText: (op, aliases) => [op.summary, op.path, op.method, op.operationId, familyOf(op).label, ...op.tags, ...aliases.map(a => a.path), isWebSocket(op) ? 'websocket realtime' : ''].join(' '),
  directoryNote: ({aliasCount}) => aliasCount > 0 && <> (plus {aliasCount} <Link to={page + '#aliases'}>alias paths</Link>, listed under each operation)</>,
  rowExtra: (op, aliases) => (aliases.length > 0 || isWebSocket(op)) && <span className={styles.rowBadges}>{isWebSocket(op) && <em>WebSocket</em>}{aliases.length > 0 && <em>+{aliases.length} alias{aliases.length === 1 ? '' : 'es'}</em>}</span>,
  href: op => `${page}#${op.operationId}`,
  requirements: op => <div className={styles.scopeRow}><span>ACCEPTS</span>{schemesOf(op).map(name => <code key={name} title={spec.components.securitySchemes[name]?.description}>{schemeHeader(name)}</code>)}{isWebSocket(op) && <><span className={styles.rowGap}>PROTOCOL</span><code>WebSocket (101)</code></>}</div>,
  aliasNote: (op, aliases) => <details className={styles.aliasList}><summary>Also served at {aliases.length} alias path{aliases.length === 1 ? '' : 's'}</summary><ul>{aliases.map(a => <li key={a.operationId}><api.Method method={a.method}/><code>{a.path}</code></li>)}</ul></details>,
  requestContent: op => {
    const content = op.requestBody?.content;
    if (!content) return [undefined, undefined];
    const type = content['application/json'] ? 'application/json' : Object.keys(content)[0];
    return [type, content[type]];
  },
  examples: (op, content, mediaType) => {
    if (!content) return [['Example', undefined]];
    if (content.examples) return Object.entries(content.examples).map(([name, e]) => [name, e.value]);
    if (content.example !== undefined) return [['Example', content.example]];
    if (!content.schema || (mediaType !== 'application/json' && mediaType !== 'multipart/form-data')) return [['Example', undefined]];
    return [['Example', sampleFor(content.schema)]];
  },
  tabs: (op, {mediaType}) => isWebSocket(op) ? ['WebSocket'] : ['cURL', ...(mediaType === 'application/json' ? ['JSON body'] : [])],
  tabCode: (op, tab) => isWebSocket(op) ? {language: 'bash', code: webSocketExample(op)} : null,
  curl: curlFor,
  responsesPanel: true,
  lazyPanels: true,
  headerHref: name => spec.components.headers?.[name] ? `${page}#${headerAnchor(name)}` : undefined,
  footer: op => {
    const surface = playgroundSurface(op);
    return <p className={styles.operationFoot}><Terminal size={13}/> <Link to={page + '#authentication'}>Authentication</Link><span aria-hidden="true">·</span><Link to={page + '#errors-and-error-codes'}>Errors &amp; error codes</Link>{surface && <><span aria-hidden="true">·</span><FlaskConical size={13}/> <Link to={`${playground}?surface=${surface}`}>Try it in the playground</Link></>}</p>;
  },
  select: (op, {family, tags}) => family ? familyOf(op).key === family : op.tags.some(t => (tags || []).includes(t)),
});

export const {ManagementHero, ResourceCards, EndpointDirectory, ApiReference, SchemaReference, Method} = api;

// Every header in components.headers, with where the gateway sends it.
export function ResponseHeaderTable() {
  const collect = useBrokenLinks().collectAnchor;
  const seen = {};
  for (const op of api.allOperations) {
    for (const [status, raw] of Object.entries(op.responses || {})) {
      const response = api.resolveIn('responses', raw);
      for (const h of Object.keys(response.headers || {})) (seen[h] ||= new Set()).add(status.startsWith('2') || status === '101' ? 'success' : 'error');
    }
  }
  const where = name => {
    const s = seen[name];
    if (!s) return 'Not referenced';
    return s.has('success') && s.has('error') ? 'Success and errors' : s.has('success') ? 'Success' : 'Errors';
  };
  const headers = Object.entries(spec.components.headers || {});
  headers.forEach(([name]) => collect(headerAnchor(name)));
  return <table className={styles.specTable}><thead><tr><th>Header</th><th>Sent on</th><th>Meaning</th></tr></thead><tbody>
    {headers.map(([name, h]) => <tr key={name} id={headerAnchor(name)}><td><code>{name}</code></td><td>{where(name)}</td><td><Inline text={h.description}/></td></tr>)}
  </tbody></table>;
}

// Credential headers from components.securitySchemes, in the order operations list them.
export function CredentialTable() {
  const rank = {};
  const famsFor = {};
  for (const op of api.operations) {
    schemesOf(op).forEach((name, i) => {
      rank[name] = Math.min(rank[name] ?? Infinity, i + (name === 'AwsSigV4' ? 0.5 : 0));
      (famsFor[name] ||= new Set()).add(familyOf(op).label);
    });
  }
  const schemes = Object.entries(spec.components.securitySchemes || {}).sort(([a], [b]) => (rank[a] ?? 99) - (rank[b] ?? 99) || a.localeCompare(b));
  const all = new Set(api.operations.map(op => familyOf(op).label));
  return <table className={styles.specTable}><thead><tr><th>Header</th><th>Accepted on</th><th>Details</th></tr></thead><tbody>
    {schemes.map(([name, s]) => {
      const fams = [...(famsFor[name] || [])];
      return <tr key={name}><td><code>{schemeHeader(name)}</code></td><td>{fams.length === all.size ? 'Every family' : fams.join(', ') || 'None'}</td><td><Inline text={s.description}/></td></tr>;
    })}
  </tbody></table>;
}

// The x-quilr-error-codes catalog, searchable and filterable by group and source.
export function ErrorCodeTable() {
  const codes = spec['x-quilr-error-codes'] || [];
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All groups');
  const id = useId();
  const groups = ['All groups', ...[...new Set(codes.map(c => c.group))].sort()];
  const q = search.toLowerCase();
  const shown = codes.filter(c => (group === 'All groups' || c.group === group) && `${c.code} ${c.description} ${c.status} ${c.source} ${c.group}`.toLowerCase().includes(q));
  return <section className={styles.directory} aria-label="Gateway error codes">
    <div className={styles.directoryTools}><label className={styles.search}><Search size={17}/><span className={styles.srOnly}>Search error codes</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find an error code..."/></label><label htmlFor={id} className={styles.srOnly}>Group</label><select id={id} value={group} onChange={e => setGroup(e.target.value)}>{groups.map(g => <option key={g}>{g}</option>)}</select></div>
    <p className={styles.resultCount} role="status">{shown.length} of {codes.length} codes</p>
    <table className={styles.specTable}><thead><tr><th>Code</th><th>Source</th><th>Status</th><th>Group</th><th>Description</th></tr></thead><tbody>
      {shown.map(c => <tr key={c.code + c.source}><td><code>{c.code}</code></td><td>{c.source}</td><td>{c.status}</td><td>{c.group}</td><td><Inline text={c.description}/>{c.failover_class && <> Failover class: <code>{c.failover_class}</code>.</>}{c.also_sent_by_providers && <> Also sent by providers: read <code>X-Quilr-Error-Source</code>.</>}</td></tr>)}
    </tbody></table>
  </section>;
}

// Combined and per-family OpenAPI documents. Families come from the spec endpoint's `family` enum.
export function SpecDownloads() {
  const specOp = api.operations.find(op => op.path === liveSpecPath);
  const keys = specOp?.parameters.find(p => p.name === 'family')?.schema?.enum || families.filter(f => !f.noDownload).map(f => f.key);
  const countFor = key => api.allOperations.filter(op => familyOf(op).key === key).length;
  const label = key => families.find(f => f.key === key)?.label || key;
  return <table className={styles.specTable}><thead><tr><th>Family</th><th>Download</th><th>Live from your gateway</th><th>Paths</th></tr></thead><tbody>
    <tr><td><strong>All families</strong></td><td><a href={download} download>llm-gateway-inference-v1.json</a></td><td><code>GET {liveSpecPath}</code></td><td>{api.allOperations.length}</td></tr>
    {keys.map(key => <tr key={key}><td>{label(key)}</td><td><a href={familyDownload(key)} download>{`llm-gateway-inference-v1-${key}.json`}</a></td><td><code>?family={key}</code></td><td>{countFor(key)}</td></tr>)}
  </tbody></table>;
}

// Regions from the server variable (https://{region}.quilr.ai).
export function RegionTable() {
  const server = spec.servers?.[0];
  const variable = server?.variables?.region;
  if (!variable) return <p><code>{host}</code></p>;
  const labels = Object.fromEntries([...(variable.description || '').matchAll(/`([^`]+)`:\s*([^;]+)/g)].map(m => [m[1], m[2].trim()]));
  return <table className={styles.specTable}><thead><tr><th>Region</th><th>Base URL</th><th><code>region</code> value</th></tr></thead><tbody>
    {(variable.enum || [variable.default]).map(v => <tr key={v}><td>{labels[v] || v}{v === variable.default ? ' (default)' : ''}</td><td><code>{server.url.replace('{region}', v)}</code></td><td><code>{v}</code></td></tr>)}
  </tbody></table>;
}

// Renders `code` spans in spec descriptions.
function Inline({text = ''}) {
  return <>{String(text).split(/(`[^`]+`)/).map((part, i) => part.startsWith('`') && part.endsWith('`') && part.length > 1 ? <code key={i}>{part.slice(1, -1)}</code> : part)}</>;
}
