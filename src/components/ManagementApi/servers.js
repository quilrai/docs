// Server helpers shared by the Management and Inference API components and the
// Management API playground. Both specs publish one server, https://{region}.quilr.ai,
// with the region as a variable (enum + labels in its description). Plain JS, no JSX.

const FALLBACK = 'https://guardrails-usa-1.quilr.ai';

// The server URL with each variable at `values[name]`, else its default.
export function serverUrl(spec, values = {}) {
  const server = spec?.servers?.[0];
  if (!server) return FALLBACK;
  return server.url.replace(/\{(\w+)\}/g, (m, name) => values[name] ?? server.variables?.[name]?.default ?? m);
}

// [{value, label, url, isDefault}] for the region variable; labels come from its
// description ("`guardrails-usa-1`: USA 1 (US Central West); ...").
export function regionsOf(spec) {
  const server = spec?.servers?.[0];
  const variable = server?.variables?.region;
  if (!variable) return [];
  const labels = Object.fromEntries([...(variable.description || '').matchAll(/`([^`]+)`:\s*([^;]+)/g)].map(m => [m[1], m[2].trim()]));
  return (variable.enum || [variable.default]).map(value => ({
    value,
    label: labels[value] || value,
    url: server.url.replace('{region}', value),
    isDefault: value === variable.default,
  }));
}

export const defaultRegion = spec => spec?.servers?.[0]?.variables?.region?.default;
