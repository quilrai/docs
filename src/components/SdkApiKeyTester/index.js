import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import styles from './styles.module.css';

const ENDPOINTS = [
  { label: 'Nearest', value: 'https://guardrails.quilr.ai' },
  { label: 'US Central West', value: 'https://guardrails-usa-1.quilr.ai' },
  { label: 'US East', value: 'https://guardrails-usa-2.quilr.ai' },
  { label: 'India', value: 'https://guardrails-india-1.quilr.ai' },
  { label: 'Custom', value: 'custom' },
];

const SAMPLE_TEXT = {
  request: 'My SSN is 219-09-4823. Please help me update my profile.',
  response: 'I found the account owner email: jane.customer@example.com.',
};

const CODE_TABS = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
];

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || '').trim().replace(/\/+$/, '');
}

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getSafeText(result, checkType) {
  if (!result) return null;

  if (checkType === 'response') {
    return result.processed_text ?? null;
  }

  if (Array.isArray(result.messages)) {
    return result.messages
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n');
  }

  return null;
}

function getSnippetKey(apiKey, shouldReveal) {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) return 'sk-quilr-...';
  return shouldReveal ? trimmedKey : 'sk-quilr-...';
}

function getDetectedEntities(result) {
  if (!Array.isArray(result?.predictions)) return [];

  return result.predictions.flatMap((prediction) => {
    const subcategories = prediction.entity_texts_with_subcategories ?? {};
    const entityTexts = Array.isArray(prediction.sensitive_entities)
      ? prediction.sensitive_entities
      : Object.keys(subcategories);

    return entityTexts.map((entity) => ({
      entity,
      subcategory: subcategories[entity] ?? 'detected',
      ruleName: prediction.name ?? prediction.id ?? 'prediction',
      type: prediction.type ?? 'check',
    }));
  });
}

function getDecisionRows(checkType, activeAction) {
  const isRequest = checkType === 'request';

  return [
    {
      action: 'allow',
      status: 'safe',
      description: isRequest
        ? 'Send the original messages to your LLM.'
        : 'Return the original model text to the caller.',
    },
    {
      action: 'redact',
      status: 'redacted',
      description: isRequest
        ? 'Use response.messages. It contains the redacted messages array.'
        : 'Use response.processed_text. It contains the redacted text.',
    },
    {
      action: 'block',
      status: 'blocked',
      description: isRequest
        ? 'Do not call the LLM. Return your own safe fallback.'
        : 'Do not return this model output. Return your own safe fallback.',
    },
  ].map((row) => ({ ...row, isActive: row.action === activeAction }));
}

function buildCurlSnippet(requestUrl, requestPayload, snippetKey) {
  return [
    `curl --request POST ${shellQuote(requestUrl)} \\`,
    `  --header ${shellQuote(`Authorization: Bearer ${snippetKey}`)} \\`,
    `  --header ${shellQuote('Content-Type: application/json')} \\`,
    `  --data ${shellQuote(formatJson(requestPayload))}`,
  ].join('\n');
}

function buildPythonSnippet(requestUrl, requestPayload, snippetKey) {
  return `import requests

url = ${JSON.stringify(requestUrl)}
sdk_key = ${JSON.stringify(snippetKey)}

payload = ${formatJson(requestPayload)}

response = requests.post(
    url,
    headers={
        "Authorization": f"Bearer {sdk_key}",
        "Content-Type": "application/json",
    },
    json=payload,
    timeout=15,
)
response.raise_for_status()
judgement = response.json()

action = judgement.get("action")

if action == "block":
    # Stop your flow. Do not call the LLM or return the unsafe output.
    categories = judgement.get("categories_detected", [])
    raise ValueError(f"Blocked by QuilrAI: {categories}")

if action == "redact":
    if payload["type"] == "request":
        # Send these redacted messages to your LLM.
        safe_messages = judgement["messages"]
    else:
        # Return or store this redacted text.
        safe_text = judgement["processed_text"]

# Use predictions to understand what was found.
for prediction in judgement.get("predictions", []):
    entities = prediction.get("sensitive_entities", [])
    subcategories = prediction.get("entity_texts_with_subcategories", {})
    print(prediction.get("name"), entities, subcategories)
`;
}

function buildJavascriptSnippet(requestUrl, requestPayload, snippetKey) {
  return `const url = ${JSON.stringify(requestUrl)};
const sdkKey = ${JSON.stringify(snippetKey)};

const payload = ${formatJson(requestPayload)};

const response = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${sdkKey}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  throw new Error(\`QuilrAI check failed: \${response.status}\`);
}

const judgement = await response.json();

if (judgement.action === "block") {
  // Stop your flow. Do not call the LLM or return the unsafe output.
  throw new Error(
    \`Blocked by QuilrAI: \${(judgement.categories_detected ?? []).join(", ")}\`,
  );
}

if (judgement.action === "redact") {
  if (payload.type === "request") {
    // Send these redacted messages to your LLM.
    const safeMessages = judgement.messages;
  } else {
    // Return or store this redacted text.
    const safeText = judgement.processed_text;
  }
}

// Use predictions to understand what was found.
const predictions = judgement.predictions ?? [];
const sensitiveEntities = predictions.flatMap(
  (prediction) => prediction.sensitive_entities ?? [],
);
const entitySubcategories = Object.assign(
  {},
  ...predictions.map(
    (prediction) => prediction.entity_texts_with_subcategories ?? {},
  ),
);
console.log({ sensitiveEntities, entitySubcategories });
`;
}

function buildCodeSnippet(tabId, requestUrl, requestPayload, snippetKey) {
  if (tabId === 'python') {
    return buildPythonSnippet(requestUrl, requestPayload, snippetKey);
  }

  if (tabId === 'javascript') {
    return buildJavascriptSnippet(requestUrl, requestPayload, snippetKey);
  }

  return buildCurlSnippet(requestUrl, requestPayload, snippetKey);
}

function getCallerAction(result, checkType) {
  if (!result) {
    return {
      title: 'Run a check',
      body: 'The response will show whether your caller should allow, redact, or block the content.',
      tone: 'idle',
      icon: ShieldCheck,
    };
  }

  if (!result.status && !result.action) {
    return {
      title: 'Inspect response',
      body: 'The endpoint returned a non-standard payload. Review the raw response before continuing.',
      tone: 'idle',
      icon: AlertTriangle,
    };
  }

  if (result.status === 'blocked' || result.action === 'block') {
    return {
      title: 'Block before continuing',
      body:
        checkType === 'request'
          ? 'Do not call the LLM. Return your own safe fallback to the caller.'
          : 'Do not return this model output. Replace it with your own safe fallback.',
      tone: 'blocked',
      icon: ShieldAlert,
    };
  }

  if (result.status === 'redacted' || result.action === 'redact') {
    return {
      title: 'Use the redacted content',
      body:
        checkType === 'request'
          ? 'Forward the returned messages array to the LLM instead of the original messages.'
          : 'Return processed_text to the caller instead of the original model output.',
      tone: 'redacted',
      icon: AlertTriangle,
    };
  }

  return {
    title: 'Allow unchanged',
    body:
      checkType === 'request'
        ? 'Forward the original messages to the LLM.'
        : 'Return the original model output to the caller.',
    tone: 'safe',
    icon: CheckCircle2,
  };
}

export default function SdkApiKeyTester() {
  const [endpoint, setEndpoint] = useState('https://guardrails.quilr.ai');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [checkType, setCheckType] = useState('request');
  const [content, setContent] = useState(SAMPLE_TEXT.request);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [showKeyInSnippet, setShowKeyInSnippet] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const baseUrl = normalizeBaseUrl(endpoint === 'custom' ? customEndpoint : endpoint);
  const requestUrl = baseUrl ? `${baseUrl}/sdk/v1/check` : '/sdk/v1/check';

  const requestPayload = useMemo(() => {
    if (checkType === 'response') {
      return {
        type: 'response',
        text: content,
      };
    }

    return {
      type: 'request',
      messages: [{ role: 'user', content }],
      metadata: {
        caller: 'docs-playground',
        team_id: 'sales',
        user_id: 'internal-user-1',
        end_user_id: 'customer-1',
      },
    };
  }, [checkType, content]);

  const keyLooksWrong = apiKey.trim().length > 0 && !apiKey.trim().startsWith('sk-quilr-');
  const canSubmit = Boolean(baseUrl && apiKey.trim() && content.trim() && !isLoading);
  const callerAction = getCallerAction(result, checkType);
  const CallerIcon = callerAction.icon;
  const safeText = getSafeText(result, checkType);
  const detectedEntities = getDetectedEntities(result);
  const decisionRows = getDecisionRows(checkType, result?.action);
  const snippetKey = getSnippetKey(apiKey, showKeyInSnippet);
  const activeSnippet = useMemo(
    () => buildCodeSnippet(activeCodeTab, requestUrl, requestPayload, snippetKey),
    [activeCodeTab, requestUrl, requestPayload, snippetKey],
  );

  function updateCheckType(nextType) {
    setCheckType(nextType);
    setContent(SAMPLE_TEXT[nextType]);
    setResult(null);
    setError(null);
  }

  async function runCheck(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      const responseText = await response.text();
      const responseJson = parseJson(responseText);

      if (!response.ok) {
        const detail =
          responseJson?.error?.message ||
          responseJson?.detail ||
          responseJson?.message ||
          responseText ||
          `HTTP ${response.status}`;
        const modeHint =
          response.status === 403 || String(detail).includes('sdk_mode_required')
            ? ' This page only works with keys whose provider is quilr_sdk.'
            : '';

        setError(`${detail}${modeHint}`);
        return;
      }

      setResult(responseJson ?? { raw_response: responseText });
    } catch (err) {
      const message =
        err.name === 'AbortError'
          ? 'The request timed out after 15 seconds.'
          : 'The browser could not reach the SDK endpoint. Check the endpoint, network access, and CORS policy.';
      setError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }

  async function copyActiveSnippet() {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopiedSnippet(true);
      window.setTimeout(() => setCopiedSnippet(false), 1600);
    } catch {
      setCopiedSnippet(false);
    }
  }

  return (
    <div className={`${styles.playground} not-prose`}>
      <form className={styles.form} onSubmit={runCheck}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Try your SDK key</h3>
            <p>
              Calls <code>POST /sdk/v1/check</code> with a <code>quilr_sdk</code>{' '}
              API key.
            </p>
          </div>
          <div className={styles.method}>POST</div>
        </div>

        <label className={styles.field}>
          <span>Gateway endpoint</span>
          <select value={endpoint} onChange={(event) => setEndpoint(event.target.value)}>
            {ENDPOINTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {endpoint === 'custom' && (
          <label className={styles.field}>
            <span>Custom base URL</span>
            <input
              value={customEndpoint}
              onChange={(event) => setCustomEndpoint(event.target.value)}
              placeholder="https://guardrails.example.com"
              type="url"
            />
          </label>
        )}

        <label className={styles.field}>
          <span>API key</span>
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-quilr-..."
            type="password"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
        {keyLooksWrong && (
          <div className={styles.inlineWarning}>
            SDK keys start with <code>sk-quilr-</code> and use provider{' '}
            <code>quilr_sdk</code>.
          </div>
        )}

        <div className={styles.segmented} role="group" aria-label="Check type">
          <button
            type="button"
            className={checkType === 'request' ? styles.activeSegment : undefined}
            onClick={() => updateCheckType('request')}
          >
            Request
          </button>
          <button
            type="button"
            className={checkType === 'response' ? styles.activeSegment : undefined}
            onClick={() => updateCheckType('response')}
          >
            Response
          </button>
        </div>

        <label className={styles.field}>
          <span>{checkType === 'request' ? 'User message' : 'Response text'}</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            spellCheck="true"
          />
        </label>

        <button className={styles.submit} type="submit" disabled={!canSubmit}>
          {isLoading ? <Loader2 size={16} className={styles.spinner} /> : <ShieldCheck size={16} />}
          Run check
        </button>
      </form>

      <div className={styles.output}>
        <div className={styles.snippetPanel}>
          <div className={styles.snippetHeader}>
            <div>
              <div className={styles.previewHeader}>Exact request</div>
              <p>
                Generated from the endpoint, mode, and content on the left. The key is
                masked until you reveal it.
              </p>
            </div>
            <div className={styles.snippetActions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setShowKeyInSnippet((value) => !value)}
                aria-label={showKeyInSnippet ? 'Mask API key in snippets' : 'Reveal API key in snippets'}
                title={showKeyInSnippet ? 'Mask API key' : 'Reveal API key'}
              >
                {showKeyInSnippet ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
              </button>
              <button type="button" className={styles.copyButton} onClick={copyActiveSnippet}>
                {copiedSnippet ? <Check size={15} aria-hidden /> : <Clipboard size={15} aria-hidden />}
                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className={`${styles.segmented} ${styles.codeTabs}`} role="group" aria-label="Code example">
            {CODE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeCodeTab === tab.id ? styles.activeSegment : undefined}
                onClick={() => setActiveCodeTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <pre className={styles.codeBlock}>{activeSnippet}</pre>
        </div>

        <div className={`${styles.actionPanel} ${styles[callerAction.tone]}`}>
          <CallerIcon size={18} aria-hidden />
          <div>
            <h3>{callerAction.title}</h3>
            <p>{callerAction.body}</p>
          </div>
        </div>

        <div className={styles.decisionPanel}>
          <div className={styles.previewHeader}>How to use the judgement</div>
          <div className={styles.decisionList}>
            {decisionRows.map((row) => (
              <div
                key={row.action}
                className={`${styles.decisionItem} ${row.isActive ? styles.activeDecision : ''}`}
              >
                <div>
                  <strong>{row.action}</strong>
                  <span>{row.status}</span>
                </div>
                <p>{row.description}</p>
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className={styles.summaryGrid}>
            <div>
              <span>Status</span>
              <strong>{result.status ?? 'unknown'}</strong>
            </div>
            <div>
              <span>Action</span>
              <strong>{result.action ?? 'unknown'}</strong>
            </div>
            <div>
              <span>Detected</span>
              <strong>
                {Array.isArray(result.categories_detected) && result.categories_detected.length > 0
                  ? result.categories_detected.join(', ')
                  : 'none'}
              </strong>
            </div>
          </div>
        )}

        {detectedEntities.length > 0 && (
          <div className={styles.entityPanel}>
            <div className={styles.previewHeader}>Returned entities</div>
            <div className={styles.entityList}>
              {detectedEntities.map((item, index) => (
                <div key={`${item.entity}-${index}`} className={styles.entityItem}>
                  <code>{item.entity}</code>
                  <div>
                    <strong>{item.subcategory}</strong>
                    <span>
                      {item.ruleName} - {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorPanel}>
            <AlertTriangle size={18} aria-hidden />
            <p>{error}</p>
          </div>
        )}

        <div className={styles.previewGroup}>
          <div className={styles.previewHeader}>Request payload</div>
          <pre>{formatJson(requestPayload)}</pre>
        </div>

        {safeText && (
          <div className={styles.previewGroup}>
            <div className={styles.previewHeader}>Caller-safe content</div>
            <pre>{safeText}</pre>
          </div>
        )}

        <div className={styles.previewGroup}>
          <div className={styles.previewHeader}>Raw response</div>
          <pre>{result ? formatJson(result) : 'Run a check to see the QuilrAI response.'}</pre>
        </div>
      </div>
    </div>
  );
}
