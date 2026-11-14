// MCP Gateway Management API v1 routes and helpers for the MCP playground.
// Plain JS (no JSX) so the redaction and path helpers stay testable in Node.

import { seg } from '../ManagementPlayground/client.mjs';

export const MCP_PREFIX = '/mcpgateway/management/v1';
export const MCP_ADMIN_PREFIX = '/mcpgateway/management-admin/v1';
export const MCP_LIVE_SPEC_PATH = `${MCP_PREFIX}/openapi.json`;
export const MCP_KEY_PREFIX = 'qmcpmgmt_';

/** Full path of an MCP resource: mcpPath('a1b2', '/settings'). */
export const mcpPath = (id, sub = '') => `${MCP_PREFIX}/mcps/${seg(id)}${sub}`;

/** Path of one custom tool of an MCP: customToolPath('a1b2', 'recent_unread_summary'). */
export const customToolPath = (id, name) => mcpPath(id, `/custom-tools/${seg(name)}`);

/** The If-Match header value for a resource `version` ("r4" -> "\"r4\""). */
export function ifMatch(version) {
  if (!version) return undefined;
  const v = String(version);
  return v.startsWith('"') || v.startsWith('W/') ? v : `"${v}"`;
}

// Settings sections, in console order. GET /capabilities lists the gateway's own
// in settings_sections; this is the fallback when it does not.
export const SETTINGS_SECTIONS = [
  'tools',
  'dlp',
  'token_saving',
  'access_control',
  'web_search_policy',
  'tool_sync',
  'tool_exposure',
  'onemcp',
  'send_user_claims_header',
  'oauth_scopes',
  'upstream_session_max_concurrency',
];

// Write-only maps that carry credentials (extra headers, query parameters,
// transport values). The spec marks them writeOnly, but as objects, so the
// string-only spec rule does not pick them up.
export const MCP_SECRET_FIELDS = [
  'extra_headers',
  'extra_query_params',
  'upstream_auth_extra_headers',
  'upstream_auth_extra_query_params',
  'fetch_headers',
  'transport_values',
  'client_id',
  'oauth_client_id',
  'preview_token',
  // REST API operation overrides: values sent upstream on every call.
  'fixed_params',
];

/** Up to two group_by dimensions as the comma-separated string the API takes. */
export const groupBy = (...dims) => dims.filter(Boolean).join(',') || undefined;
