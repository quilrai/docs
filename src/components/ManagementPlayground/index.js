import React from 'react';
import {
  BarChart3,
  Boxes,
  Braces,
  Building2,
  Gauge,
  History as HistoryIcon,
  KeyRound,
  Layers,
  Library,
  Route,
  Siren,
  Timer,
  Server,
  Wallet,
  FileText,
  HeartPulse,
  Users as UsersIcon,
  UsersRound,
  Webhook,
  SlidersHorizontal,
} from 'lucide-react';
import bundledSpec from '@site/static/openapi/llm-gateway-management-v1.json';
import { ADMIN_PREFIX, LIVE_SPEC_PATH, MANAGEMENT_PREFIX } from './client.mjs';
import { regionsOf } from '../ManagementApi/servers';
import PlaygroundShell from './Shell';
import Explorer from './Explorer';
import Overview from './Overview';
import Apps from './Apps';
import Providers from './Providers';
import QuotaPools from './QuotaPools';
import Credentials from './Credentials';
import Prompts from './Prompts';
import Budgets from './Budgets';
import Routing from './Routing';
import Limits from './Limits';
import Incidents from './Incidents';
import Hooks from './Hooks';
import Features from './Features';
import Usage from './Usage';
import Monitoring from './Monitoring';
import Users from './Users';
import SmartGroups from './SmartGroups';
import Catalogs from './Catalogs';
import HistoryWorkspace from './HistoryWorkspace';
import Administration from './Administration';

// Regions from the spec's server variable (https://{region}.quilr.ai). Ids drop the
// `guardrails-` prefix (usa-1, europe-1, ...) so remembered sessions keep working.
export const REGIONS = regionsOf(bundledSpec).map(({ value, label, url }) => ({
  id: value === 'guardrails' ? 'global' : value.replace(/^guardrails-/, ''),
  label,
  url,
}));

export const WORKSPACES = [
  { id: 'overview', label: 'Overview', Icon: Gauge, Component: Overview },
  { id: 'usage', label: 'Usage', Icon: BarChart3, Component: Usage },
  { id: 'monitoring', label: 'Monitoring', Icon: HeartPulse, Component: Monitoring },
  { id: 'apps', label: 'Apps', Icon: Layers, Component: Apps },
  { id: 'providers', label: 'Providers', Icon: Server, Component: Providers },
  { id: 'quota-pools', label: 'Quota pools', Icon: Boxes, Component: QuotaPools },
  { id: 'credentials', label: 'Credentials', Icon: KeyRound, Component: Credentials },
  { id: 'users', label: 'Users', Icon: UsersIcon, Component: Users },
  { id: 'smart-groups', label: 'Smart groups', Icon: UsersRound, Component: SmartGroups },
  { id: 'prompts', label: 'Prompts', Icon: FileText, Component: Prompts },
  { id: 'budgets', label: 'Budgets', Icon: Wallet, Component: Budgets },
  { id: 'routing', label: 'Routing', Icon: Route, Component: Routing },
  { id: 'limits', label: 'Limits', Icon: Timer, Component: Limits },
  { id: 'incidents', label: 'Incidents', Icon: Siren, Component: Incidents },
  { id: 'hooks', label: 'Hooks', Icon: Webhook, Component: Hooks },
  { id: 'features', label: 'Features and access', Icon: SlidersHorizontal, Component: Features },
  { id: 'catalogs', label: 'Catalogs', Icon: Library, Component: Catalogs },
  { id: 'history', label: 'History', Icon: HistoryIcon, Component: HistoryWorkspace },
  { id: 'administration', label: 'Administration', Icon: Building2, Component: Administration },
  { id: 'explorer', label: 'API Explorer', Icon: Braces, Component: Explorer },
];

// Keys without `read` cannot read capabilities. Probe the read call of each area
// that has its own read scope; any answer other than 401/403 (for example 409
// policy_not_enabled) proves the scope.
async function probe(client) {
  try {
    return await client.call({ path: `${MANAGEMENT_PREFIX}/capabilities`, source: 'Connect' });
  } catch (err) {
    if (err.status !== 403 || err.code !== 'insufficient_scope') throw err;
    const areas = [];
    let budgetScopes = null;
    try {
      const budgets = await client.call({ path: `${MANAGEMENT_PREFIX}/budgets`, query: { limit: 1 }, source: 'Connect (budgets)' });
      const caller = budgets.caller || {};
      areas.push('budgets');
      budgetScopes = Array.isArray(caller.scopes)
        ? caller.scopes
        : [
            caller.can_read && 'budgets:read',
            caller.can_grant && 'budgets:grant',
            caller.can_edit_policy && 'budgets:policy',
          ].filter(Boolean);
    } catch {
      /* no budget scopes */
    }
    for (const [area, path] of [
      ['routing', '/controls/_capacity'],
      ['limits', '/controls/rate-limits?limit=1'],
      ['incidents', '/incidents/status'],
    ]) {
      const res = await client.send({ path: MANAGEMENT_PREFIX + path, source: `Connect (${area})` });
      if (res.status && res.status !== 401 && res.status !== 403) areas.push(area);
    }
    if (!areas.length) throw err;
    return {
      limitedAreas: areas,
      // Write scopes are unknown unless only budgets answered; null keeps
      // buttons enabled and the gateway answers 403 for a missing scope.
      caller: { scopes: areas.length === 1 && budgetScopes ? budgetScopes : null },
    };
  }
}

function connectError(err) {
  return err.status === 401
    ? { ...err, message: 'The gateway rejected this management key. Check that it is active and belongs to this region.' }
    : err.code === 'insufficient_scope'
      ? { ...err, message: `${err.message} The key needs the read scope, or the read scope of one area (budgets:read, routing:read, limits:read or incidents:read) to use only that workspace.` }
      : err.status === 404
        ? { ...err, message: 'The management API is not available at this URL. Check the region, or ask your administrator to enable management for the tenant.' }
        : err;
}

/** The LLM Gateway product configuration of the shared playground shell (./Shell.js). */
export const LLM_PRODUCT = {
  id: 'llm',
  spec: bundledSpec,
  managementPrefix: MANAGEMENT_PREFIX,
  adminPrefix: ADMIN_PREFIX,
  apiRoot: '/llmgateway',
  liveSpecPath: LIVE_SPEC_PATH,
  regions: REGIONS,
  regionLabel: 'Region',
  regionPlaceholder: 'Select a region',
  keyPrefix: 'qlmgmt_',
  storageKey: 'quilr-management-playground-session',
  envNames: { management: 'QUILR_MANAGEMENT_KEY', admin: 'QUILR_TENANT_ADMIN_JWT' },
  workspaces: WORKSPACES,
  limitedAllowed: ['explorer', 'administration'],
  adminSupported: true,
  probe,
  connectError,
  hero: {
    eyebrow: 'LLM GATEWAY / MANAGEMENT API V1',
    title: 'Management API playground',
    text: 'Administer apps, providers, credentials, prompts, smart groups, budgets, routing, limits, incidents and hooks, review usage, guardrail activity, provider health and users, and see the exact API call behind every action.',
  },
  links: [
    { to: '/llm-gateway-playground', label: 'Gateway playground' },
    { to: '/mcp-gateway-management-playground', label: 'MCP Management playground' },
    { to: '/llm-gateway/api-reference/management-api', label: 'API reference' },
  ],
  securityNote:
    "Requests go straight from your browser to the gateway. The key stays in memory (or in this tab's session storage if you opt in) and is never shown in activity or snippets.",
};

export default function ManagementPlayground() {
  return <PlaygroundShell product={LLM_PRODUCT} />;
}
