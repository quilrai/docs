import React from 'react';
import {
  BarChart3,
  Braces,
  Building2,
  Cable,
  GitCompare,
  KeyRound,
  Gauge,
  History as HistoryIcon,
  Layers,
  Webhook,
  Code,
  PackagePlus,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Users as UsersIcon,
} from 'lucide-react';
import bundledSpec from '@site/static/openapi/mcp-gateway-management-v1.json';
import PlaygroundShell from '../ManagementPlayground/Shell';
import Explorer from '../ManagementPlayground/Explorer';
import { serverUrl } from '../ManagementApi/servers';
import { MCP_ADMIN_PREFIX, MCP_KEY_PREFIX, MCP_LIVE_SPEC_PATH, MCP_PREFIX, MCP_SECRET_FIELDS } from './routes.mjs';
import Overview from './Overview';
import Mcps from './Mcps';
import Settings from './Settings';
import Create from './Create';
import Connections from './Connections';
import ToolReviews from './ToolReviews';
import ToolChanges from './ToolChanges';
import ClientAccess from './ClientAccess';
import RestApi from './RestApi';
import CustomTools from './CustomTools';
import Users from './Users';
import Tenant from './Tenant';
import Analytics from './Analytics';
import Audit from './Audit';
import History from './History';

// The MCP Gateway Management API playground: the shared playground shell
// (../ManagementPlayground/Shell.js) configured for the MCP Gateway spec.

export const WORKSPACES = [
  { id: 'overview', label: 'Overview', Icon: Gauge, Component: Overview },
  { id: 'mcps', label: 'MCPs', Icon: Layers, Component: Mcps },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal, Component: Settings },
  { id: 'create', label: 'Create and catalog', Icon: PackagePlus, Component: Create },
  { id: 'connections', label: 'Connections and credentials', Icon: Cable, Component: Connections },
  { id: 'rest-api', label: 'REST API MCPs', Icon: Webhook, Component: RestApi },
  { id: 'custom-tools', label: 'Custom tools', Icon: Code, Component: CustomTools },
  { id: 'tool-reviews', label: 'Tool reviews', Icon: ShieldCheck, Component: ToolReviews },
  { id: 'tool-changes', label: 'Tool changes', Icon: GitCompare, Component: ToolChanges },
  { id: 'client-access', label: 'Client access', Icon: KeyRound, Component: ClientAccess },
  { id: 'users', label: 'Users', Icon: UsersIcon, Component: Users },
  { id: 'tenant', label: 'Organization', Icon: Building2, Component: Tenant },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3, Component: Analytics },
  { id: 'audit', label: 'Audit', Icon: ScrollText, Component: Audit },
  { id: 'history', label: 'History', Icon: HistoryIcon, Component: History },
  { id: 'explorer', label: 'API Explorer', Icon: Braces, Component: Explorer },
];

// The spec publishes one server, the QuilrAI MCP Gateway; regional or self-hosted
// gateways use Custom URL.
const DEFAULT_HOST = serverUrl(bundledSpec);
export const REGIONS = [{ id: 'default', label: `QuilrAI MCP Gateway (${new URL(DEFAULT_HOST).host})`, url: DEFAULT_HOST }];

async function probe(client) {
  return client.call({ path: `${MCP_PREFIX}/capabilities`, source: 'Connect' });
}

function connectError(err) {
  if (err.status === 401) {
    return { ...err, message: 'The gateway rejected this management key. Check that it is an MCP Gateway management key (qmcpmgmt_...), still active, and issued for this gateway.' };
  }
  if (err.code === 'management_disabled_for_tenant') {
    return { ...err, message: 'Management is turned off for this organization. An administrator can turn on "Allow management keys for this organization" in Settings > AI Gateway > MCP Gateway > Management API.' };
  }
  if (err.code === 'insufficient_scope') {
    return { ...err, message: `${err.message} The playground reads GET /capabilities to connect, which needs the read scope.` };
  }
  if (err.status === 404) {
    return { ...err, message: 'The MCP Gateway Management API is not available at this URL. Check the gateway host (the one your MCP endpoint URLs use).' };
  }
  return err;
}

export const MCP_PRODUCT = {
  id: 'mcp',
  spec: bundledSpec,
  managementPrefix: MCP_PREFIX,
  adminPrefix: MCP_ADMIN_PREFIX,
  apiRoot: '/mcpgateway',
  liveSpecPath: MCP_LIVE_SPEC_PATH,
  regions: REGIONS,
  defaultRegion: 'default',
  regionLabel: 'Gateway',
  regionPlaceholder: 'Select a gateway',
  keyPrefix: MCP_KEY_PREFIX,
  keyCheck: (key) =>
    key.startsWith('qlmgmt_')
      ? 'This is an LLM Gateway management key (qlmgmt_). Use it in the LLM Gateway Management API playground; this playground needs an MCP Gateway key (qmcpmgmt_).'
      : null,
  storageKey: 'quilr-mcp-management-playground-session',
  envNames: { management: 'QUILR_MCP_MANAGEMENT_KEY', admin: 'QUILR_TENANT_ADMIN_JWT' },
  indexOptions: {
    adminPrefix: MCP_ADMIN_PREFIX,
    tagOrder: ['Reference', 'MCPs', 'Catalog', 'Settings', 'Upstream credentials', 'Connections', 'Tool reviews', 'Tool changes', 'REST API MCPs', 'Custom tools', 'Client access', 'User sign-in', 'User connections', 'Tenant', 'Analytics', 'Audit', 'Administration'],
    isAliasPath: () => false,
    subgroupOf: () => null,
  },
  redaction: { extraSecretFields: MCP_SECRET_FIELDS, redactUrlQueryValues: true },
  workspaces: WORKSPACES,
  adminSupported: false,
  probe,
  connectError,
  connectFirst: 'Choose the gateway and enter an MCP Gateway management key above',
  hero: {
    eyebrow: 'MCP GATEWAY / MANAGEMENT API V1',
    title: 'MCP Management API playground',
    text: 'List, add, install and remove MCPs, change their settings and upstream credentials, review new tools and upstream tool changes, connect OAuth MCPs, change REST API MCPs, write and test-run custom tools, hand MCPs out with client setup, sign-in links, MCP API tokens and allowed agents, rotate OAuth clients, see and revoke users\' connections, change organization switches, read usage, latency, DLP activity and the audit trail, and see the exact API call behind every action.',
  },
  links: [
    { to: '/llm-gateway-management-playground', label: 'LLM Management playground' },
    { to: '/mcp-gateway/api-reference/management-api', label: 'API reference' },
  ],
  securityNote:
    "Requests go straight from your browser to the MCP Gateway. The key stays in memory (or in this tab's session storage if you opt in) and is never shown in activity or snippets. Credentials, extra header values, URL query strings and connect links are masked in activity.",
};

export default function McpManagementPlayground() {
  return <PlaygroundShell product={MCP_PRODUCT} />;
}
