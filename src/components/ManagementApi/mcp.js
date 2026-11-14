import React from 'react';
import Link from '@docusaurus/Link';
import {Activity, ArrowUpRight, BarChart3, Download, History, KeyRound, Layers, Library, Link2, ShieldCheck, SlidersHorizontal, Terminal, Workflow} from 'lucide-react';
import spec from '@site/static/openapi/mcp-gateway-management-v1.json';
import styles from './styles.module.css';
import {createApiReference} from './core';
import {serverUrl} from './servers';

// MCP Gateway Management API v1 reference: the Management API components
// (./core.js) built for static/openapi/mcp-gateway-management-v1.json.
// The pages live in docs/mcp-gateway/api-reference/.

const base = '/mcpgateway/management/v1';
const adminBase = '/mcpgateway/management-admin/v1';
const download = '/openapi/mcp-gateway-management-v1.json';
const pageFor = {
  Reference: 'management-api',
  Administration: 'management-api',
  MCPs: 'mcps-api',
  Catalog: 'mcps-api',
  Settings: 'settings-and-credentials-api',
  'Upstream credentials': 'settings-and-credentials-api',
  'Tool reviews': 'settings-and-credentials-api',
  Connections: 'connections-and-oauth-api',
  Analytics: 'analytics-and-audit-api',
  Audit: 'analytics-and-audit-api',
};
// The spec has one server, the MCP Gateway host.
const host = serverUrl(spec);
const scopeDescriptions = spec['x-scope-descriptions'] || {};
const shortPath = path => path.replace(adminBase, '/admin').replace(base, '');
const print = value => JSON.stringify(value, null, 2);
const isAdmin = op => op.path.startsWith(adminBase);

function curlFor(op, body) {
  let path = op.path;
  op.parameters.filter(p => p.in === 'path').forEach(p => {path = path.replace('{' + p.name + '}', encodeURIComponent(p.example ?? 'example'));});
  const queries = op.parameters.filter(p => p.in === 'query' && (p.required || p.name === 'limit')).map(p => `${p.name}=${encodeURIComponent(p.example ?? p.schema?.default ?? 'example')}`);
  const lines = [`curl --request ${op.method} \\`, `  '${host}${path}${queries.length ? '?' + queries.join('&') : ''}' \\`, `  --header 'Authorization: Bearer ${isAdmin(op) ? '<tenant-admin-token>' : '<management-key>'}'`];
  op.parameters.filter(p => p.in === 'header' && (p.required || p.name === 'If-Match')).forEach(p => {lines[lines.length - 1] += ' \\'; lines.push(`  --header '${p.name}: ${p.example ?? '<value>'}'`);});
  if (body !== undefined) {lines[lines.length - 1] += ' \\'; lines.push("  --header 'Content-Type: application/json' \\"); lines.push("  --data '" + print(body).replace(/'/g, "'\\''") + "'");}
  return lines.join('\n');
}

const conditional = op => (op['x-conditional-scopes'] || []);

const api = createApiReference({
  spec,
  hero: {
    eyebrow: 'MCP GATEWAY / MANAGEMENT V1',
    title: 'Manage your MCPs.',
    subtitle: 'From scripts, pipelines and code.',
    text: 'List, add, install and remove MCPs, change their settings and upstream credentials, review new tools, connect OAuth MCPs, and read usage, latency, DLP activity and the audit trail, from one tenant-scoped API.',
    actions: [
      {label: 'Start with an example', to: './management-api#quick-start', primary: true},
      {label: 'OpenAPI reference', href: download, Icon: Download, download: true},
    ],
    facts: [{label: 'Tenant-bound keys', Icon: ShieldCheck}, {label: 'Explicit scopes', Icon: SlidersHorizontal}, {label: 'Same rules as the console', Icon: Workflow}],
  },
  cardsLabel: 'MCP Gateway Management API resources',
  cards: [
    ['MCPs', 'List, inspect, add, rename, enable, disable and remove MCPs, and list their tools.', 'mcps-api', Layers],
    ['MCP Library', 'Browse the catalog and install prebuilt MCPs.', 'mcps-api#catalog', Library],
    ['Settings and overrides', 'Tools, DLP, token saving, access control, tool exposure and OneMCP settings, per MCP, user or smart group.', 'settings-and-credentials-api', SlidersHorizontal],
    ['Upstream credentials', 'Set, rotate and remove the credentials the gateway sends upstream.', 'settings-and-credentials-api#upstream-credentials', KeyRound],
    ['Tool reviews', 'Approve or reject new tools held for review.', 'settings-and-credentials-api#tool-reviews', ShieldCheck],
    ['Connections and OAuth', 'Connection state, tool refresh and single-use OAuth connect links.', 'connections-and-oauth-api', Link2],
    ['Analytics', 'Usage, latency, DLP activity, tool-call metadata and per-user activity.', 'analytics-and-audit-api', BarChart3],
    ['Audit', 'Configuration changes made in the console and through the API.', 'analytics-and-audit-api#audit', History],
    ['Authentication', 'Enable management and issue scoped management keys.', 'management-api#authentication', Activity],
  ].map(([title, desc, page, Icon]) => ({title, desc, to: './' + page, Icon})),
  shortPath,
  href: op => `./${pageFor[op.tags[0]] || 'management-api'}#${op.operationId}`,
  requirements: op => <div className={styles.scopeRow}><span>REQUIRES</span>{isAdmin(op)
    ? <code>Tenant administrator token</code>
    : op['x-scopes'].map(scope => <code key={scope} title={scopeDescriptions[scope]}>{scope}</code>)}
    {conditional(op).map(c => <code key={c.scope} title={c.when}>{'+ ' + c.scope + ' (conditional)'}</code>)}</div>,
  curl: curlFor,
  footer: () => <p className={styles.operationFoot}><Terminal size={13}/> <Link to="./management-api#conventions">Authentication, errors &amp; retry rules</Link><span aria-hidden="true">·</span><ArrowUpRight size={13}/> <Link to="./management-api#scopes">Scopes</Link></p>,
});

export const {ManagementHero, ResourceCards, EndpointDirectory, ApiReference, SchemaReference, Method} = api;
