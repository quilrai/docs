// HTTP client for the LLM Gateway Management API playground.
// Credentials live only in memory here. The Authorization header is never
// recorded in activity entries, snippets or errors.

export const MANAGEMENT_PREFIX = '/llmgateway/management/v1';
export const ADMIN_PREFIX = '/llmgateway/management-admin/v1';
export const LIVE_SPEC_PATH = '/llmgateway_management_apis/v1/openapi.json';

export class ApiError extends Error {
  constructor(message, { code, status, payload, requestId } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.payload = payload;
    this.requestId = requestId;
  }
}

/** Validates a gateway origin and strips a pasted management prefix. */
export function normalizeBaseUrl(raw) {
  let parsed;
  try {
    parsed = new URL(String(raw || '').trim());
  } catch {
    throw new Error('Enter a full gateway URL, for example https://gateway.example.com.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('Enter an http or https gateway URL without embedded credentials.');
  }
  parsed.search = '';
  parsed.hash = '';
  let base = parsed.href.replace(/\/+$/, '');
  for (const prefix of [MANAGEMENT_PREFIX, ADMIN_PREFIX]) {
    if (base.endsWith(prefix)) base = base.slice(0, -prefix.length);
  }
  return base.replace(/\/+$/, '');
}

export function newIdempotencyKey(prefix = 'playground') {
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

/** Encodes one path segment. Use for app names, labels and ids. */
export const seg = (value) => encodeURIComponent(String(value));

/**
 * App routes: names containing "/" or "%" use the query locator alias
 * (/app?app_name=...), which survives proxies that decode paths.
 */
export function appRoute(appName, sub = '') {
  const name = String(appName);
  if (/[/%]/.test(name)) {
    return { path: `${MANAGEMENT_PREFIX}/app${sub}`, query: { app_name: name } };
  }
  return { path: `${MANAGEMENT_PREFIX}/apps/${seg(name)}${sub}`, query: {} };
}

/** Returns the quoted ETag for a resource payload, or null. */
export function versionOf(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (typeof payload.etag === 'string' && payload.etag) return payload.etag;
  const version =
    payload.version ||
    payload.app?.version ||
    payload.provider?.version ||
    payload.pool?.version ||
    payload.key?.version;
  return version ? `"${version}"` : null;
}

export const REDACTED = '[redacted in activity]';

// Field names that always carry secret material (provider credentials, gateway
// and management key secrets, webhook targets). Matched case-insensitively.
const SECRET_FIELD_NAMES = new Set([
  'api_key',
  'quilr_api_key',
  'service_account_json',
  'aws_access_key',
  'aws_secret_key',
  'aws_session_token',
  'aws_role_arn',
  'aws_external_id',
  'aws_bedrock_api_key',
  'oci_private_key',
  'oci_private_key_passphrase',
  'oci_session_token',
  'private_key_pem',
  'client_secret',
  'webhook_url',
  'webhook_secret',
  'signing_secret',
  'log_export_key',
  'all_apps_log_export_key',
  'secret',
  'token',
  'jwt',
  'authorization',
  'cookie',
  'set-cookie',
]);

// Words that make a field secret wherever they appear in its name.
const SECRET_WORDS = new Set([
  'secret',
  'secrets',
  'password',
  'passwd',
  'passphrase',
  'credential',
  'credentials',
  'signature',
  'authorization',
  'cookie',
  'cookies',
  'bearer',
]);
// Words that are secret only as the last word (aws_session_token, access_token),
// so names like token_saving or max_tokens stay readable.
const SECRET_LAST_WORDS = new Set(['token', 'key']);
// "<prefix>_key" names that are identifiers, not secrets.
const NON_SECRET_KEY_PREFIXES = new Set(['idempotency', 'cache', 'sort', 'partition', 'group', 'routing', 'quota', 'budget', 'subject', 'lookup', 'prompt']);
// Trailing words that mark metadata about a secret rather than the secret itself.
const METADATA_LAST_WORDS = new Set([
  'id', 'ids', 'name', 'names', 'fingerprint', 'prefix', 'suffix', 'hint', 'at', 'count', 'type', 'types', 'kind',
  'field', 'fields', 'mode', 'source', 'configured', 'present', 'set', 'length', 'last4', 'preview', 'status',
  'version', 'expires', 'expiry', 'required', 'enabled', 'updated', 'rotated', 'ttl',
]);
// Secret pairs that would otherwise read as metadata (aws_external_id).
const SECRET_WORD_PAIRS = [['service', 'account'], ['external', 'id'], ['role', 'arn'], ['private', 'key']];
// Fields that are secrets only when they hold a URL (budget alert destination
// target, a webhook url).
const SECRET_URL_FIELDS = new Set(['target', 'url', 'webhook', 'callback_url', 'hook_url']);

let specSecretFields = new Set();

/** Collects string properties the spec marks writeOnly or format: password. */
export function secretFieldsFromSpec(spec) {
  const names = new Set();
  const seen = new Set();
  const walk = (node, depth) => {
    if (!node || typeof node !== 'object' || depth > 60 || seen.has(node)) return;
    seen.add(node);
    if (node.properties && typeof node.properties === 'object') {
      for (const [name, prop] of Object.entries(node.properties)) {
        if (!prop || typeof prop !== 'object') continue;
        const types = [].concat(prop.type || []);
        const stringish = !types.length || types.includes('string');
        if (stringish && (prop.writeOnly === true || prop.format === 'password')) names.add(name.toLowerCase());
      }
    }
    for (const value of Object.values(node)) walk(value, depth + 1);
  };
  walk(spec, 0);
  return names;
}

/** Adds the spec's writeOnly / password fields to the redaction rule. */
export function setSpecSecretFields(spec) {
  specSecretFields = spec ? secretFieldsFromSpec(spec) : new Set();
}

function words(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** True when a field with this name carries secret material. */
export function isSecretField(name) {
  const lower = String(name).toLowerCase();
  if (SECRET_FIELD_NAMES.has(lower) || specSecretFields.has(lower)) return true;
  const parts = words(name);
  if (!parts.length) return false;
  for (const [a, b] of SECRET_WORD_PAIRS) {
    const i = parts.indexOf(a);
    if (i >= 0 && parts[i + 1] === b) return true;
  }
  const last = parts[parts.length - 1];
  if (METADATA_LAST_WORDS.has(last)) return false;
  if (parts.some((p) => SECRET_WORDS.has(p))) return true;
  if (SECRET_LAST_WORDS.has(last)) {
    if (last === 'key' && parts.length === 1) return false;
    if (parts.length > 1 && NON_SECRET_KEY_PREFIXES.has(parts[parts.length - 2])) return false;
    return true;
  }
  return false;
}

const URL_LIKE = /^[a-z][a-z0-9+.-]*:\/\//i;

function redactString(text, depth) {
  const trimmed = text.trim();
  // JSON-encoded objects (a pasted service account file, for example).
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') return JSON.stringify(redactSecrets(parsed, depth + 1));
    } catch {
      /* Not JSON; keep the text. */
    }
  }
  // Credentials embedded in a URL (user:pass@host or a token query string).
  if (URL_LIKE.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      let changed = false;
      if (url.username || url.password) {
        url.username = '';
        url.password = '';
        changed = true;
      }
      for (const key of [...url.searchParams.keys()]) {
        if (isSecretField(key) || /^(sig|sv|se|code|access_token|auth)$/i.test(key)) {
          url.searchParams.set(key, 'redacted');
          changed = true;
        }
      }
      if (changed) return url.href;
    } catch {
      /* Not a URL. */
    }
  }
  return text;
}

function redactAll(value, depth) {
  if (depth > 40 || value === null || value === undefined) return value;
  if (typeof value === 'string') return value ? REDACTED : value;
  if (Array.isArray(value)) return value.map((v) => redactAll(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = redactAll(v, depth + 1);
    return out;
  }
  return value;
}

/**
 * Copies a JSON value with secrets replaced: every string under a secret-named
 * field (nested objects and arrays included), URL-valued webhook targets, URL
 * credentials, and secrets inside JSON-encoded strings.
 */
export function redactSecrets(value, depth = 0) {
  if (depth > 40 || value === null || value === undefined) return value;
  if (typeof value === 'string') return redactString(value, depth);
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redactSecrets(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (isSecretField(k)) out[k] = redactAll(v, depth + 1);
    else if (typeof v === 'string' && SECRET_URL_FIELDS.has(k.toLowerCase()) && URL_LIKE.test(v.trim())) out[k] = REDACTED;
    else out[k] = redactSecrets(v, depth + 1);
  }
  return out;
}

/** Copies a header map with credential headers replaced. */
export function redactHeaders(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers || {})) {
    out[k] = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key|api-key)$/i.test(k) || isSecretField(k) ? REDACTED : v;
  }
  return out;
}

function parseBody(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

let activitySeq = 0;

/**
 * createClient({ baseUrl, token, tokenKind, onActivity })
 * tokenKind is 'management' or 'admin'; it only labels activity entries.
 */
export function createClient({ baseUrl, token, tokenKind = 'management', onActivity, fetchImpl } = {}) {
  const origin = normalizeBaseUrl(baseUrl);
  const doFetch = fetchImpl || ((...args) => globalThis.fetch(...args));

  function buildUrl(path, query = {}) {
    const url = new URL(`${origin}${path}`);
    for (const [name, value] of Object.entries(query || {})) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (v !== undefined && v !== null && v !== '') url.searchParams.append(name, String(v));
      }
    }
    return url;
  }

  /** Sends a request and resolves with the outcome. Never throws for HTTP errors. */
  async function send({ method = 'GET', path, query, body, rawBody, headers = {}, signal, source } = {}) {
    const url = buildUrl(path, query);
    const requestHeaders = { Accept: 'application/json', ...headers };
    let serialized;
    if (rawBody !== undefined && rawBody !== null && rawBody !== '') serialized = String(rawBody);
    else if (body !== undefined) serialized = JSON.stringify(body);
    if (serialized !== undefined) requestHeaders['Content-Type'] = 'application/json';
    for (const [k, v] of Object.entries(requestHeaders)) {
      if (v === undefined || v === null || v === '') delete requestHeaders[k];
    }
    const wire = { ...requestHeaders };
    if (token) wire.Authorization = `Bearer ${String(token).trim()}`;
    const started =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = () =>
      Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - started);
    const entry = {
      id: ++activitySeq,
      at: new Date().toISOString(),
      origin,
      method,
      path: url.pathname + url.search,
      tokenKind,
      source,
      requestHeaders: redactHeaders(requestHeaders),
      requestBody: redactSecrets(parseBody(serialized)),
    };
    let response;
    try {
      response = await doFetch(url.href, {
        method,
        headers: wire,
        body: serialized,
        signal,
        credentials: 'omit',
        cache: 'no-store',
        mode: 'cors',
      });
    } catch (error) {
      const aborted = error?.name === 'AbortError';
      const message = aborted
        ? 'Request cancelled.'
        : `Could not reach ${origin}. Check the URL, your network, and that the gateway allows browser requests from this site. (${error?.message || 'network error'})`;
      const result = {
        ok: false,
        status: 0,
        latencyMs: elapsed(),
        data: null,
        headers: {},
        error: message,
      };
      onActivity?.({ ...entry, status: 0, latencyMs: result.latencyMs, error: message });
      return result;
    }
    const raw = await response.text().catch(() => '');
    const data = parseBody(raw);
    const responseHeaders = {};
    response.headers.forEach((v, k) => {
      responseHeaders[k] = v;
    });
    const result = {
      ok: response.ok && !(data && typeof data === 'object' && data.error),
      status: response.status,
      latencyMs: elapsed(),
      data,
      headers: responseHeaders,
      etag: responseHeaders.etag || versionOf(data),
      requestId:
        (data && typeof data === 'object' && data.request_id) || responseHeaders['x-request-id'] || null,
    };
    onActivity?.({
      ...entry,
      status: result.status,
      latencyMs: result.latencyMs,
      responseHeaders: redactHeaders(responseHeaders),
      response: redactSecrets(data),
    });
    return result;
  }

  /** Sends a request and throws ApiError unless it succeeded. */
  async function call(options) {
    const result = await send(options);
    if (!result.ok) {
      const err = result.data?.error;
      throw new ApiError(
        result.error || err?.message || (typeof result.data === 'string' && result.data) || `HTTP ${result.status}`,
        {
          code: result.status === 0 ? 'network_error' : err?.code || `http_${result.status}`,
          status: result.status,
          payload: result.data,
          requestId: result.requestId,
        },
      );
    }
    const data = result.data && typeof result.data === 'object' ? result.data : { value: result.data };
    Object.defineProperty(data, '_meta', { value: result, enumerable: false });
    return data;
  }

  return { origin, tokenKind, send, call, buildUrl };
}
