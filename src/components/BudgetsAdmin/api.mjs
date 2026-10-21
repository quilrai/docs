// Browser and Node share this client so live verification exercises the page's requests.
export const MANAGEMENT_PREFIX = '/llmgateway/management/v1';

export class ApiError extends Error {
  constructor(message, { code, status, payload, requestId, meta } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.payload = payload;
    this.requestId = requestId;
    this.meta = meta;
  }
}

export function newIdempotencyKey() {
  return `budgets-playground-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function endpoint(baseUrl) {
  const parsed = new URL(baseUrl.trim());
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error(
      'Enter an http or https gateway URL without embedded credentials.',
    );
  }
  parsed.search = '';
  parsed.hash = '';
  const base = parsed.href.replace(/\/+$/, '');
  return base.endsWith(MANAGEMENT_PREFIX)
    ? base
    : `${base}${MANAGEMENT_PREFIX}`;
}

function pathSegment(value) {
  return encodeURIComponent(String(value));
}

function modelPath(value) {
  // Models such as meta-llama/Llama-3.3-70B use a catch-all route on the server.
  return String(value).split('/').map(pathSegment).join('/');
}

/** Credentials remain in memory; this module never persists or logs them. */
export function createBudgetsClient({
  baseUrl,
  key,
  fetchImpl = globalThis.fetch,
  onResponse,
} = {}) {
  const base = endpoint(baseUrl || 'http://127.0.0.1:28080');
  const pendingPosts = new Map();

  async function request(
    path,
    {
      method = 'GET',
      query = {},
      body,
      etag,
      dryRun,
      idempotencyKey,
      signal,
    } = {},
  ) {
    const url = new URL(`${base}${path}`);
    for (const [name, value] of Object.entries({
      ...query,
      ...(dryRun ? { dry_run: true } : {}),
    })) {
      if (value !== undefined && value !== null && value !== '')
        url.searchParams.set(name, String(value));
    }
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${key.trim()}`,
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (etag) headers['If-Match'] = etag;
    const serialized = body === undefined ? undefined : JSON.stringify(body);
    const fingerprint = `${method} ${url.href} ${serialized || ''}`;
    if (method === 'POST') {
      // Keep the original key after an error or lost response. A new successful
      // action, even with the same input, receives a new key.
      if (!pendingPosts.has(fingerprint))
        pendingPosts.set(fingerprint, idempotencyKey || newIdempotencyKey());
      headers['Idempotency-Key'] =
        idempotencyKey || pendingPosts.get(fingerprint);
    } else if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const started = Date.now();
    let response;
    try {
      response = await fetchImpl(url.href, {
        method,
        headers,
        body: serialized,
        signal,
        credentials: 'omit',
        cache: 'no-store',
      });
    } catch (error) {
      const meta = {
        method,
        path: url.pathname + url.search,
        status: 0,
        latencyMs: Date.now() - started,
      };
      onResponse?.({
        ...meta,
        body,
        requestHeaders: Object.fromEntries(
          Object.entries(headers).filter(([name]) => name !== 'Authorization'),
        ),
        error: error.message,
      });
      throw new ApiError(error.message, {
        code: 'network_error',
        status: 0,
        meta,
      });
    }
    const raw = await response.text();
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = { error: { code: 'invalid_response', message: raw } };
    }
    const meta = {
      method,
      path: url.pathname + url.search,
      status: response.status,
      latencyMs: Date.now() - started,
      etag:
        response.headers.get('etag') ||
        payload.etag ||
        payload.budget?.etag ||
        payload.grant?.etag,
      requestId: payload.request_id || response.headers.get('x-request-id'),
    };
    onResponse?.({
      ...meta,
      body,
      requestHeaders: Object.fromEntries(
        Object.entries(headers).filter(([name]) => name !== 'Authorization'),
      ),
      response: payload,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });
    if (!response.ok || payload.error) {
      throw new ApiError(payload.error?.message ?? raw ?? response.statusText, {
        code: payload.error?.code || `http_${response.status}`,
        status: response.status,
        payload,
        requestId: meta.requestId,
        meta,
      });
    }
    if (method === 'POST') pendingPosts.delete(fingerprint);
    Object.defineProperty(payload, '_meta', { value: meta, enumerable: false });
    return payload;
  }

  const api = {
    request,
    listBudgets: (query) => request('/budgets', { query }),
    getBudget: (id) => request(`/budgets/${pathSegment(id)}`),
    getUsage: (id, query) =>
      request(`/budgets/${pathSegment(id)}/usage`, { query }),
    getSummary: (query) => request('/budget-usage-summary', { query }),
    listSubjects: (query) => request('/budget-subjects', { query }),
    getSubject: (kind, value, query) =>
      request(`/budget-subjects/${pathSegment(kind)}/${pathSegment(value)}`, {
        query,
      }),
    listGrants: (query) => request('/budget-grants', { query }),
    getGrant: (id) => request(`/budget-grants/${pathSegment(id)}`),
    createGrant: (id, body, options) =>
      request(`/budgets/${pathSegment(id)}/grants`, {
        ...options,
        method: 'POST',
        body,
      }),
    bulkGrants: (id, body, options) =>
      request(`/budgets/${pathSegment(id)}/grants/_bulk`, {
        ...options,
        method: 'POST',
        body,
      }),
    patchGrant: (id, body, options) =>
      request(`/budget-grants/${pathSegment(id)}`, {
        ...options,
        method: 'PATCH',
        body,
      }),
    revokeGrant: (id, { reason, ...options } = {}) =>
      request(`/budget-grants/${pathSegment(id)}`, {
        ...options,
        method: 'DELETE',
        body: reason === undefined ? undefined : { reason },
      }),
    createBudget: (body, options) =>
      request('/budgets', { ...options, method: 'POST', body }),
    patchBudget: (id, body, options) =>
      request(`/budgets/${pathSegment(id)}`, {
        ...options,
        method: 'PATCH',
        body,
      }),
    deleteBudget: (id, options) =>
      request(`/budgets/${pathSegment(id)}`, { ...options, method: 'DELETE' }),
    getPricing: () => request('/budget-pricing'),
    patchPricing: (body, options) =>
      request('/budget-pricing', { ...options, method: 'PATCH', body }),
    putRate: (provider, model, body, options) =>
      request(
        `/budget-pricing/rates/${pathSegment(provider)}/${modelPath(model)}`,
        { ...options, method: 'PUT', body },
      ),
    deleteRate: (provider, model, { providerLabel, query, ...options } = {}) =>
      request(
        `/budget-pricing/rates/${pathSegment(provider)}/${modelPath(model)}`,
        {
          ...options,
          method: 'DELETE',
          query: { ...query, provider_label: providerLabel },
        },
      ),
    listExemptions: () => request('/budget-exemptions'),
    createExemption: (body, options) =>
      request('/budget-exemptions', { ...options, method: 'POST', body }),
    deleteExemption: (id, options) =>
      request(`/budget-exemptions/${pathSegment(id)}`, {
        ...options,
        method: 'DELETE',
      }),
    getDestinations: () => request('/budget-alert-destinations'),
    putDestinations: (body, options) =>
      request('/budget-alert-destinations', {
        ...options,
        method: 'PUT',
        body,
      }),
    listAlerts: (query) => request('/budget-alerts', { query }),
    listEvents: (query) => request('/budget-events', { query }),
    async allPages(methodName, args = [], query = {}) {
      const items = [];
      const seen = new Set();
      let page;
      let first;
      let cursor = query.cursor || query.after;
      do {
        if (cursor && seen.has(cursor))
          throw new Error(
            'The API repeated a pagination cursor. Refresh the collection.',
          );
        if (cursor) seen.add(cursor);
        const cursorField = methodName === 'listEvents' ? 'after' : 'cursor';
        page = await api[methodName](...args, {
          ...query,
          limit: query.limit || 500,
          [cursorField]: cursor,
        });
        first ||= page;
        items.push(...(page.items || page.alerts || []));
        cursor = page.has_more === false ? null : page.next_cursor;
      } while (cursor);
      const result = {
        ...first,
        items,
        next_cursor: null,
        ...(methodName === 'listEvents' ? { has_more: false } : {}),
      };
      Object.defineProperty(result, '_meta', {
        value: page._meta,
        enumerable: false,
      });
      return result;
    },
  };
  return api;
}
