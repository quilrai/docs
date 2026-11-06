import React from 'react';
import Link from '@docusaurus/Link';
import {BarChart3, Lock, BookOpen, Boxes, Download, FlaskConical, HeartPulse, KeyRound, Layers, Play, Route, ShieldCheck, Siren, SlidersHorizontal, Terminal, Timer, Users, UsersRound, Wallet, Webhook, Workflow} from 'lucide-react';
import spec from '@site/static/openapi/llm-gateway-management-v1.json';
import styles from './styles.module.css';
import {createApiReference} from './core';
import {serverUrl} from './servers';

// Management API v1 reference components. The Inference API page uses the same
// components built for its own spec: ./inference.js.

const base = '/llmgateway/management/v1';
const adminBase = '/llmgateway/management-admin/v1';
const download = '/openapi/llm-gateway-management-v1.json';
const playground = '/llm-gateway-management-playground';
const tryIt = operationId => `${playground}?tab=explorer&op=${encodeURIComponent(operationId)}`;
// Operations whose scope depends on the collections they touch (batch, restore, history reads).
const scopeNote = op => op['x-scopes-per-op'] ? 'Write (or read) scope of each collection it touches' : null;
const pageFor = {Apps:'apps-and-credentials-api', Providers:'providers-and-configuration-api', 'Quota pools':'providers-and-configuration-api', Credentials:'apps-and-credentials-api', Administration:'management-api', Policy:'policy-api', Prompts:'prompts-api', Budgets:'budgets-api', Routing:'routing-and-failover-api', Limits:'rate-limits-api', Incidents:'incidents-api', Hooks:'hooks-api', Access:'gateway-features-api', 'Gateway features':'gateway-features-api', Usage:'usage-api', Monitoring:'monitoring-api', Users:'users-api', Catalogs:'providers-and-configuration-api', History:'providers-and-configuration-api', Reference:'management-api'};
// Examples use the server's default region (https://{region}.quilr.ai with region at its default).
const host = serverUrl(spec);
const scopeDescriptions = spec['x-scope-descriptions'] || {};
const shortPath = path => path.replace(adminBase,'/admin').replace(base,'');
const print = value => JSON.stringify(value, null, 2);

function curlFor(op,body) {
  let path=op.path;
  op.parameters.filter(p=>p.in==='path').forEach(p=>{path=path.replace('{'+p.name+'}',encodeURIComponent(p.example ?? 'example'));});
  const queries=op.parameters.filter(p=>p.in==='query'&&(p.required || p.name==='limit')).map(p=>`${p.name}=${encodeURIComponent(p.example ?? 'example')}`);
  const lines=[`curl --request ${op.method} \\`, `  '${host}${path}${queries.length?'?'+queries.join('&'):''}' \\`, `  --header 'Authorization: Bearer ${op['x-scopes'].length||op['x-scopes-per-op']?'<management-key>':'<tenant-admin-token>'}'`];
  op.parameters.filter(p=>p.in==='header'&&(p.required||p.name==='If-Match')).forEach(p=>{lines[lines.length-1]+=' \\';lines.push(`  --header '${p.name}: ${p.example ?? '<value>'}'`);});
  if(body !== undefined){lines[lines.length-1]+=' \\';lines.push("  --header 'Content-Type: application/json' \\");lines.push("  --data '"+print(body).replace(/'/g,"'\\''")+"'");}
  return lines.join('\n');
}

const api = createApiReference({
  spec,
  hero: {
    eyebrow: 'LLM GATEWAY / MANAGEMENT V1',
    title: 'Configure your gateway.',
    subtitle: 'Keep every change intentional.',
    text: 'Manage apps, shared providers, quota pools, access keys, prompts, budgets, routing, rate limits, incidents and external hooks, and read usage, guardrail activity, provider health and users, from one tenant-scoped API. Start with a workflow, explore every request field, or try calls live in the playground.',
    actions: [
      {label: 'Start with an example', to: './management-api#quick-start', primary: true},
      {label: 'Open the playground', to: playground, Icon: Play},
      {label: 'OpenAPI reference', href: download, Icon: Download, download: true},
    ],
    facts: [{label: 'Tenant-bound keys', Icon: ShieldCheck}, {label: 'Explicit scopes', Icon: SlidersHorizontal}, {label: 'Central configuration', Icon: Workflow}],
  },
  cardsLabel: 'Management API resources',
  cards: [
    ['Apps','Create, read, configure and pause applications.','apps-and-credentials-api',Layers],
    ['Providers & catalogs','Configure shared credentials, test and discover models, review new models, and read catalogs and config history.','providers-and-configuration-api',SlidersHorizontal],
    ['Quota pools','Describe upstream limits that several providers or models share.','providers-and-configuration-api#quota-pools',Boxes],
    ['Budgets','Set spend, request and token budgets and group budget sets, track usage and issue grants.','budgets-api',Wallet],
    ['Smart groups','Rank groups, manage virtual groups and preview who changes governing group.','smart-groups-api',UsersRound],
    ['Routing and failover','Routes, weighted destinations, failover and constraints, with dry runs, history and restore.','routing-and-failover-api',Route],
    ['Rate limits','Request and token rate limits, request guards, temporary raises and effective limits.','rate-limits-api',Timer],
    ['Access and features','Access controls, token saving, response cache, cache warm, model visibility, error messages and prompt enforcement.','gateway-features-api',Lock],
    ['Incidents','Mark a provider down during an outage, check it applied, then restore it.','incidents-api',Siren],
    ['Hooks','Call your own API to allow, flag or block requests and responses, or export finished requests.','hooks-api',Webhook],
    ['Usage','Requests, tokens and cost by period, app, model, provider, user, key, source or outcome.','usage-api',BarChart3],
    ['Monitoring','Guardrail activity, provider health, and why one request was routed, blocked or failed over.','monitoring-api',HeartPulse],
    ['Users','Who uses the gateway: app access, personal keys, last activity and usage.','users-api',Users],
    ['Authentication','Enable access and issue scoped management keys.','management-api#authentication',ShieldCheck],
    ['Gateway credentials','Issue, rename, reveal, expire and revoke app keys.','apps-and-credentials-api#credentials',KeyRound],
    ['QuilrQL behavior','Understand app defaults and policy-governed settings.','policy-api',Workflow],
    ['Prompts','Manage Prompt Store content.','prompts-api',BookOpen],
  ].map(([title,desc,page,Icon]) => ({title, desc, to: './'+page, Icon})),
  // Query-locator aliases (/app?app_name=...) duplicate a canonical operation; list each operation once.
  aliasOf: op => op['x-alias-of'],
  shortPath,
  directoryNote: ({aliasCount}) => aliasCount>0 && <> (plus {aliasCount} <Link to="./management-api#names-and-pagination"><code>/app?app_name=</code> aliases</Link> for app names that contain <code>/</code> or <code>%</code>)</>,
  href: op => `./${shortPath(op.path).startsWith('/smart-groups') ? 'smart-groups-api' : pageFor[op.tags[0]] || 'management-api'}#${op.operationId}`,
  requirements: op => <div className={styles.scopeRow}><span>REQUIRES</span>{op['x-scopes'].length ? op['x-scopes'].map(scope=><code key={scope} title={scopeDescriptions[scope]}>{scope}</code>) : scopeNote(op) ? <code>{scopeNote(op)}</code> : <code>Verified tenant administrator</code>}</div>,
  aliasNote: (op, [alias]) => <p className={styles.aliasNote}>Also at <code>{shortPath(alias.path)}?app_name=...</code> for app names that contain <code>/</code> or <code>%</code>.</p>,
  curl: curlFor,
  footer: op => <p className={styles.operationFoot}><Terminal size={13}/> <Link to="./management-api#conventions">Authentication, errors &amp; retry rules</Link><span aria-hidden="true">·</span><FlaskConical size={13}/> <Link to={tryIt(op.operationId)}>Try it in the playground</Link></p>,
});

export const {ManagementHero, ResourceCards, EndpointDirectory, ApiReference, SchemaReference, Method} = api;
