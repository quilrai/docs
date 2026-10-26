import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, RefreshCw, Search, Send, ShieldCheck } from 'lucide-react';
import { newIdempotencyKey, versionOf } from './client.mjs';
import { bodyExamples, buildSnippets, jsonContent, resolveRef, successResponse } from './spec.mjs';
import SchemaTree from './Schema';
import {
  Btn,
  Checkbox,
  CopyButton,
  Field,
  JsonView,
  MethodBadge,
  Pill,
  Tabs,
  parseJson,
  pretty,
  usePlayground,
} from './ui';
import styles from './styles.module.css';

/** Renders spec prose: paragraphs, `code` and absolute links only. */
export function Prose({ text }) {
  if (!text) return null;
  const paragraphs = String(text).split(/\n{2,}/);
  return (
    <div className={styles.prose}>
      {paragraphs.map((para, i) => (
        <p key={i}>
          {para.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((part, j) => {
            if (/^`[^`]+`$/.test(part)) return <code key={j}>{part.slice(1, -1)}</code>;
            const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (link) {
              return /^https?:\/\//.test(link[2]) ? (
                <a key={j} href={link[2]} target="_blank" rel="noopener noreferrer">
                  {link[1]}
                </a>
              ) : (
                <span key={j}>{link[1]}</span>
              );
            }
            return <React.Fragment key={j}>{part}</React.Fragment>;
          })}
        </p>
      ))}
    </div>
  );
}

function paramExample(p) {
  const v = p.example ?? p.schema?.example ?? p.examples?.[Object.keys(p.examples || {})[0]]?.value;
  return v === undefined || v === null ? '' : String(v);
}

function fillPath(template, values) {
  return template.replace(/\{([^}]+)\}/g, (_, name) => {
    const raw = String(values[name] ?? '');
    return /model/i.test(name) ? raw.split('/').map(encodeURIComponent).join('/') : encodeURIComponent(raw);
  });
}

function initialForm(spec, op) {
  const path = {};
  const query = {};
  const headers = {};
  for (const p of op.parameters) {
    if (p.in === 'path') path[p.name] = paramExample(p);
    if (p.in === 'header' && !/^(authorization|content-type|accept)$/i.test(p.name)) headers[p.name] = '';
  }
  const headerName = (name) => Object.keys(headers).find((h) => h.toLowerCase() === name.toLowerCase());
  if (op.method === 'POST') headers[headerName('Idempotency-Key') || 'Idempotency-Key'] = newIdempotencyKey();
  const examples = bodyExamples(spec, op);
  return {
    path,
    query,
    headers,
    exampleName: examples[0]?.[0] || '',
    bodyText: examples.length ? pretty(examples[0][1]) : '',
  };
}

function Group({ tag, ops, selectedId, onSelect, description }) {
  return (
    <details className={styles.opGroup} open>
      <summary title={description || tag}>
        {tag} <span>{ops.length}</span>
      </summary>
      <ul>
        {ops.map((op) => (
          <li key={op.id}>
            <button
              type="button"
              className={op.id === selectedId ? styles.opActive : ''}
              aria-current={op.id === selectedId ? 'true' : undefined}
              onClick={() => onSelect(op.id)}
            >
              <MethodBadge method={op.method} small />
              <span>
                {op.summary}
                {op.aliasOf && <em> alias</em>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function Explorer() {
  const pg = usePlayground();
  const { index, spec, opParam, preset, client, adminClient, can, navigate } = pg;
  const [search, setSearch] = useState('');
  const [showAliases, setShowAliases] = useState(false);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return index.operations.filter(
      (op) =>
        (showAliases || !op.aliasOf || op.id === opParam) &&
        (!q || `${op.method} ${op.path} ${op.summary} ${op.id} ${op.tags.join(' ')}`.toLowerCase().includes(q)),
    );
  }, [index, search, showAliases, opParam]);
  const op = index.byId.get(opParam) || index.operations.find((o) => !o.aliasOf) || index.operations[0];
  const missing = opParam && !index.byId.get(opParam);

  return (
    <div className={styles.explorer}>
      <aside className={styles.opList} aria-label="Operations">
        <label className={styles.searchBox}>
          <Search size={14} aria-hidden />
          <span className={styles.srOnly}>Search operations</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search operations" />
        </label>
        <div className={styles.opListMeta}>
          <span>
            {visible.length} of {index.operations.length}
          </span>
          <Checkbox label="Show alias routes" checked={showAliases} onChange={setShowAliases} />
        </div>
        {pg.liveSpecAvailable && (
          <div className={styles.specSource}>
            <Checkbox label="Use the live spec from this gateway" checked={pg.useLiveSpec} onChange={pg.setUseLiveSpec} />
          </div>
        )}
        <div className={styles.opGroups}>
          {index.tagNames.map((tag) => {
            const ops = visible.filter((o) => o.tags[0] === tag || (!index.tagNames.includes(o.tags[0]) && o.tags.includes(tag)));
            return ops.length ? (
              <Group
                key={tag}
                tag={tag}
                ops={ops}
                description={index.tagInfo[tag]}
                selectedId={op?.id}
                onSelect={(id) => navigate('explorer', { op: id })}
              />
            ) : null;
          })}
          {!visible.length && <p className={styles.muted}>No operations match.</p>}
        </div>
      </aside>
      <div className={styles.opDetail}>
        {missing && (
          <p className={styles.noticeInline}>
            Operation <code>{opParam}</code> is not in this version of the spec. Showing the first operation instead.
          </p>
        )}
        {op ? (
          <OperationView key={op.id} op={op} spec={spec} preset={preset} client={client} adminClient={adminClient} can={can} />
        ) : (
          <p>No operations in the spec.</p>
        )}
      </div>
    </div>
  );
}

function OperationView({ op, spec, preset, client, adminClient, can }) {
  const pg = usePlayground();
  const [form, setForm] = useState(() => initialForm(spec, op));
  const [response, setResponse] = useState(null);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [snippetTab, setSnippetTab] = useState('curl');
  const [etagBusy, setEtagBusy] = useState(false);
  const consumed = useRef(null);
  const examples = useMemo(() => bodyExamples(spec, op), [spec, op]);
  const media = jsonContent(spec, op.requestBody);
  const success = successResponse(spec, op);

  useEffect(() => {
    if (!preset || preset.opId !== op.id || consumed.current === preset.nonce) return;
    consumed.current = preset.nonce;
    setForm((f) => ({
      ...f,
      path: { ...f.path, ...(preset.pathParams || {}) },
      query: { ...(preset.query || {}) },
      headers: { ...f.headers, ...(preset.headers || {}) },
      bodyText: preset.body !== undefined ? preset.body : f.bodyText,
    }));
  }, [preset, op.id]);

  const activeClient = op.isAdmin ? adminClient : client;
  const origin = activeClient?.origin || pg.adminBase || 'https://<your-gateway>';
  const allowed = can(op.scopes);

  const queryValues = useMemo(() => {
    const out = {};
    for (const p of op.parameters.filter((x) => x.in === 'query')) {
      const raw = form.query[p.name];
      if (raw === undefined || raw === '') continue;
      const schema = resolveRef(spec, p.schema) || {};
      out[p.name] = Array.isArray(raw)
        ? raw
        : schema.type === 'array'
          ? String(raw)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : raw;
    }
    for (const [k, v] of Object.entries(form.query)) {
      if (!(k in out) && !op.parameters.some((p) => p.in === 'query' && p.name === k) && v !== '') out[k] = v;
    }
    return out;
  }, [form.query, op, spec]);

  const url = useMemo(() => {
    const u = new URL(`http://x${fillPath(op.path, form.path)}`);
    for (const [k, v] of Object.entries(queryValues)) for (const item of [].concat(v)) u.searchParams.append(k, item);
    return `${origin}${u.pathname}${u.search}`;
  }, [op.path, form.path, queryValues, origin]);

  const hasBody = !!media || (op.method !== 'GET' && op.method !== 'DELETE' && form.bodyText.trim());
  const snippets = buildSnippets({
    method: op.method,
    url,
    headers: form.headers,
    bodyText: hasBody ? form.bodyText : undefined,
    tokenKind: op.isAdmin ? 'admin' : 'management',
  });

  async function fetchEtag() {
    if (!activeClient) return;
    setEtagBusy(true);
    try {
      // Try this path's GET, then each parent resource (prompts and attachments use the app ETag).
      const segments = op.path.split('/');
      for (let n = segments.length; n > 3; n -= 1) {
        const template = segments.slice(0, n).join('/');
        const getOp = pg.index.operations.find((o) => o.method === 'GET' && o.path === template);
        if (!getOp) continue;
        const names = getOp.template.names;
        if (names.some((name) => !form.path[name])) continue;
        const res = await activeClient.send({ path: fillPath(template, form.path), query: queryValues.app_name ? { app_name: queryValues.app_name } : {}, source: 'Fetch ETag' });
        const tag = res.ok && (res.headers.etag || versionOf(res.data));
        if (tag) {
          setForm((f) => ({ ...f, headers: { ...f.headers, [Object.keys(f.headers).find((h) => /^if-match$/i.test(h)) || 'If-Match']: tag } }));
          return;
        }
      }
      setFormError('Could not find a version for this resource. Read it first and copy its version.');
    } finally {
      setEtagBusy(false);
    }
  }

  async function sendRequest() {
    setFormError('');
    const missingPath = op.parameters.filter((p) => p.in === 'path' && !String(form.path[p.name] || '').trim());
    if (missingPath.length) {
      setFormError(`Fill in ${missingPath.map((p) => p.name).join(', ')}.`);
      return;
    }
    const missingQuery = op.parameters.filter((p) => p.in === 'query' && p.required && !(p.name in queryValues));
    if (missingQuery.length) {
      setFormError(`Fill in ${missingQuery.map((p) => p.name).join(', ')}.`);
      return;
    }
    if (hasBody && form.bodyText.trim() && parseJson(form.bodyText).error) {
      setFormError('The request body is not valid JSON.');
      return;
    }
    if (!activeClient) {
      setFormError(op.isAdmin ? 'Enter a tenant-admin token in the Administration workspace first.' : 'Connect with a management key first.');
      return;
    }
    setSending(true);
    const res = await activeClient.send({
      method: op.method,
      path: fillPath(op.path, form.path),
      query: queryValues,
      headers: form.headers,
      rawBody: hasBody && form.bodyText.trim() ? form.bodyText : undefined,
      source: 'API Explorer',
    });
    setSending(false);
    setResponse(res);
    if (res.ok && op.method === 'POST') {
      setForm((f) => {
        const name = Object.keys(f.headers).find((h) => /^idempotency-key$/i.test(h));
        return name ? { ...f, headers: { ...f.headers, [name]: newIdempotencyKey() } } : f;
      });
    }
  }

  const params = (where) => op.parameters.filter((p) => p.in === where);
  const extraHeaders = Object.keys(form.headers).filter((h) => !params('header').some((p) => p.name === h));

  return (
    <article className={styles.operation} aria-labelledby="op-title">
      <header className={styles.opHeader}>
        <div className={styles.opPath}>
          <MethodBadge method={op.method} />
          <code>{op.path}</code>
          <CopyButton text={op.path} label="Copy path" />
        </div>
        <h2 id="op-title">{op.summary}</h2>
        <div className={styles.opMeta}>
          <code className={styles.opId}>{op.id}</code>
          {op.tags.map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
          {op.aliasOf && <Pill tone="warn">Query-locator alias</Pill>}
          {op.deprecated && <Pill tone="off">Deprecated</Pill>}
        </div>
        <Prose text={op.description} />
        <div className={styles.scopeRow}>
          <span>Requires</span>
          {op.isAdmin ? (
            <span className={styles.scopeBadge}>
              <ShieldCheck size={12} aria-hidden /> Tenant-admin JWT
            </span>
          ) : op.scopes.length ? (
            op.scopes.map((s) => {
              const has = pg.scopes ? pg.scopes.includes(s) : null;
              return (
                <span
                  key={s}
                  className={`${styles.scopeBadge} ${has === true ? styles.scopeHave : has === false ? styles.scopeMissing : ''}`}
                  title={has === null ? 'Connect to check this scope' : has ? 'Your key has this scope' : 'Your key lacks this scope'}
                >
                  {has === false && <Lock size={11} aria-hidden />} {s}
                  {has === true ? ' (granted)' : has === false ? ' (missing)' : ''}
                </span>
              );
            })
          ) : (
            <span className={styles.scopeBadge}>Any valid key</span>
          )}
        </div>
      </header>

      <section className={styles.card} aria-label="Request">
        <h3>Request</h3>
        {['path', 'query', 'header'].map((where) =>
          params(where).filter((p) => !/^(authorization|content-type|accept)$/i.test(p.name)).length ? (
            <fieldset key={where} className={styles.paramSet}>
              <legend>{where === 'path' ? 'Path parameters' : where === 'query' ? 'Query parameters' : 'Headers'}</legend>
              {params(where)
                .filter((p) => !/^(authorization|content-type|accept)$/i.test(p.name))
                .map((p) => (
                  <ParamInput
                    key={p.name}
                    spec={spec}
                    param={p}
                    value={(where === 'path' ? form.path : where === 'query' ? form.query : form.headers)[p.name] ?? ''}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        [where === 'header' ? 'headers' : where]: {
                          ...(where === 'path' ? f.path : where === 'query' ? f.query : f.headers),
                          [p.name]: v,
                        },
                      }))
                    }
                    extra={
                      /^if-match$/i.test(p.name) ? (
                        <Btn onClick={fetchEtag} busy={etagBusy} disabled={!activeClient} title="Read the resource and copy its current version">
                          <RefreshCw size={12} aria-hidden /> Fetch current ETag
                        </Btn>
                      ) : /^idempotency-key$/i.test(p.name) ? (
                        <Btn onClick={() => setForm((f) => ({ ...f, headers: { ...f.headers, [p.name]: newIdempotencyKey() } }))}>
                          New key
                        </Btn>
                      ) : null
                    }
                  />
                ))}
              {where === 'header' &&
                extraHeaders.map((h) => (
                  <Field key={h} label={`${h} (optional)`} hint="Added automatically for POST so retries are safe. Clear it to omit.">
                    <div className={styles.inline}>
                      <input value={form.headers[h]} onChange={(e) => setForm((f) => ({ ...f, headers: { ...f.headers, [h]: e.target.value } }))} />
                    </div>
                  </Field>
                ))}
            </fieldset>
          ) : where === 'header' && extraHeaders.length ? (
            <fieldset key={where} className={styles.paramSet}>
              <legend>Headers</legend>
              {extraHeaders.map((h) => (
                <Field key={h} label={`${h} (optional)`} hint="Added automatically for POST so retries are safe. Clear it to omit.">
                  <input value={form.headers[h]} onChange={(e) => setForm((f) => ({ ...f, headers: { ...f.headers, [h]: e.target.value } }))} />
                </Field>
              ))}
            </fieldset>
          ) : null,
        )}
        {(media || hasBody) && (
          <div className={styles.bodyEditor}>
            <div className={styles.bodyToolbar}>
              <strong>JSON body</strong>
              {examples.length > 1 && (
                <label>
                  <span className={styles.srOnly}>Example</span>
                  <select
                    value={form.exampleName}
                    onChange={(e) => {
                      const chosen = examples.find(([n]) => n === e.target.value);
                      setForm((f) => ({ ...f, exampleName: e.target.value, bodyText: pretty(chosen?.[1] ?? {}) }));
                    }}
                  >
                    {examples.map(([n]) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Btn
                onClick={() => {
                  const chosen = examples.find(([n]) => n === form.exampleName) || examples[0];
                  setForm((f) => ({ ...f, bodyText: chosen ? pretty(chosen[1]) : '' }));
                }}
              >
                Reset to example
              </Btn>
              <Btn
                onClick={() => {
                  const parsed = parseJson(form.bodyText);
                  if (!parsed.error && parsed.value !== undefined) setForm((f) => ({ ...f, bodyText: pretty(parsed.value) }));
                }}
              >
                Format
              </Btn>
            </div>
            <textarea
              className={`${styles.code} ${parseJson(form.bodyText).error ? styles.invalid : ''}`}
              rows={Math.min(22, Math.max(6, form.bodyText.split('\n').length + 1))}
              spellCheck="false"
              value={form.bodyText}
              aria-label="JSON request body"
              onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
            />
            {parseJson(form.bodyText).error && <small className={styles.errorText}>Invalid JSON: {parseJson(form.bodyText).error}</small>}
          </div>
        )}
        <div className={styles.sendRow}>
          <Btn variant="primary" onClick={sendRequest} busy={sending} disabled={!activeClient}>
            <Send size={14} aria-hidden /> Send request
          </Btn>
          <code className={styles.sendUrl} title={url}>
            {op.method} {url}
          </code>
          {!activeClient && (
            <span className={styles.muted}>
              {op.isAdmin ? 'Add a tenant-admin token in Administration to send.' : 'Connect with a management key to send.'}
            </span>
          )}
          {activeClient && allowed === false && !op.isAdmin && (
            <span className={styles.warnText}>Your key lacks a required scope; the gateway will answer 403.</span>
          )}
        </div>
        {formError && <p className={styles.errorText}>{formError}</p>}
      </section>

      {response && <ResponseView response={response} />}

      <section className={styles.card} aria-label="Code">
        <div className={styles.cardHead}>
          <h3>Code</h3>
          <Tabs
            label="Snippet language"
            value={snippetTab}
            onChange={setSnippetTab}
            tabs={[
              ['curl', 'cURL'],
              ['python', 'Python'],
              ['javascript', 'JavaScript'],
            ]}
          />
          <CopyButton text={snippets[snippetTab]} />
        </div>
        <pre className={styles.snippet}>{snippets[snippetTab]}</pre>
        <small className={styles.muted}>
          The credential is read from {op.isAdmin ? 'QUILR_TENANT_ADMIN_JWT' : 'QUILR_MANAGEMENT_KEY'}; snippets never contain your key.
        </small>
      </section>

      <section className={styles.card} aria-label="Schemas">
        <h3>Request body schema</h3>
        {media ? <SchemaTree spec={spec} schema={media.schema} /> : <p className={styles.muted}>This operation takes no request body.</p>}
        <h3>Response</h3>
        {success ? (
          <>
            <p className={styles.muted}>
              <Pill tone="ok">{success.status}</Pill> {success.description}
            </p>
            {success.schema && <SchemaTree spec={spec} schema={success.schema} />}
            {success.example !== undefined && (
              <details>
                <summary>Response example</summary>
                <JsonView value={success.example} maxHeight={360} />
              </details>
            )}
          </>
        ) : (
          <p className={styles.muted}>No success response documented.</p>
        )}
        <details>
          <summary>All response codes</summary>
          <ul className={styles.statusList}>
            {Object.entries(op.responses).map(([status, r]) => (
              <li key={status}>
                <code>{status}</code> {resolveRef(spec, r)?.description || ''}
              </li>
            ))}
          </ul>
        </details>
      </section>
    </article>
  );
}

function ParamInput({ spec, param, value, onChange, extra }) {
  const schema = resolveRef(spec, param.schema) || {};
  const enumValues = Array.isArray(schema.enum) ? schema.enum : schema.type === 'boolean' ? [true, false] : null;
  const label = `${param.name}${param.required ? '' : ' (optional)'}`;
  const hint = [param.description || schema.description, schema.type === 'array' ? 'Comma separated; sent as repeated parameters.' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <Field label={label} hint={hint || undefined}>
      <div className={styles.inline}>
        {enumValues ? (
          <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
            <option value="">(not set)</option>
            {enumValues.map((v) => (
              <option key={String(v)} value={String(v)}>
                {String(v)}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={Array.isArray(value) ? value.join(',') : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={paramExample(param) || schema.type || ''}
            required={!!param.required}
            spellCheck="false"
          />
        )}
        {extra}
      </div>
    </Field>
  );
}

function ResponseView({ response }) {
  const interesting = ['etag', 'x-request-id', 'cache-control', 'content-type', 'retry-after'];
  const headers = Object.entries(response.headers || {});
  const tone = response.status === 0 ? 'err' : response.status < 300 ? 'ok' : response.status < 500 ? 'warn' : 'err';
  return (
    <section className={styles.card} aria-label="Response" aria-live="polite">
      <div className={styles.cardHead}>
        <h3>Response</h3>
        <Pill tone={tone}>{response.status || 'Network error'}</Pill>
        <span className={styles.muted}>{response.latencyMs} ms</span>
        {response.requestId && (
          <span className={styles.muted}>
            request <code>{response.requestId}</code>
          </span>
        )}
        {response.data !== null && response.data !== undefined && <CopyButton text={pretty(response.data)} />}
      </div>
      {response.error && <p className={styles.errorText}>{response.error}</p>}
      {headers.length > 0 && (
        <div className={styles.respHeaders}>
          {headers
            .filter(([k]) => interesting.includes(k))
            .map(([k, v]) => (
              <span key={k}>
                <code>{k}</code> {v}
              </span>
            ))}
          {response.etag && !response.headers.etag && (
            <span>
              <code>version</code> {response.etag}
            </span>
          )}
        </div>
      )}
      {response.data !== null && response.data !== undefined && <JsonView value={response.data} maxHeight={520} />}
      {headers.length > 0 && (
        <details>
          <summary>All readable response headers</summary>
          <JsonView value={response.headers} />
          <small className={styles.muted}>Browsers expose only the headers the gateway allows cross-origin scripts to read.</small>
        </details>
      )}
    </section>
  );
}
