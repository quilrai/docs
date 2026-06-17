import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Send,
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

const PLAYGROUND_MODES = [
  { id: 'llm', label: 'Provider API key' },
  { id: 'sdk', label: 'SDK check' },
];

const LLM_SURFACES = [
  {
    id: 'chat',
    label: 'Unified chat completions',
    path: '/openai_compatible/v1/chat/completions',
    auth: 'bearer',
    supportsProviderSelector: true,
    description:
      'OpenAI-compatible chat for OpenAI, Azure OpenAI, Bedrock Converse, Vertex Gemini, Anthropic Messages, DeepSeek, Gemini, and general LLM providers configured on the key.',
    samplePayload: {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Write a one sentence greeting from the QuilrAI gateway playground.',
        },
      ],
      temperature: 0.2,
      max_tokens: 256,
      stream: false,
    },
  },
  {
    id: 'completions',
    label: 'OpenAI text completions',
    path: '/openai_compatible/v1/completions',
    auth: 'bearer',
    description:
      'Classic OpenAI-compatible text completions for provider keys whose upstream supports the legacy /v1/completions shape.',
    samplePayload: {
      model: 'gpt-3.5-turbo-instruct',
      prompt: 'Write one sentence from the QuilrAI gateway playground.',
      temperature: 0.2,
      max_tokens: 128,
      stream: false,
    },
  },
  {
    id: 'responses',
    label: 'OpenAI Responses',
    path: '/openai_responses/v1/responses',
    auth: 'bearer',
    supportsProviderSelector: true,
    description:
      'Responses API for keys with an OpenAI Responses or Azure OpenAI Responses provider.',
    samplePayload: {
      model: 'gpt-5',
      instructions: 'You are a concise assistant.',
      input: [
        {
          role: 'user',
          content: 'Write a one sentence greeting from the QuilrAI gateway playground.',
        },
      ],
      max_output_tokens: 256,
    },
  },
  {
    id: 'embeddings',
    label: 'Embeddings',
    path: '/openai_compatible/v1/embeddings',
    auth: 'bearer',
    supportsProviderSelector: true,
    description:
      'OpenAI embeddings shape translated by the gateway for OpenAI, Azure OpenAI, or Bedrock embedding providers.',
    samplePayload: {
      model: 'text-embedding-3-small',
      input: 'The quick brown fox jumps over the lazy dog.',
    },
  },
  {
    id: 'rerank',
    label: 'Rerank',
    path: '/rerank/v2/rerank',
    auth: 'bearer',
    supportsProviderSelector: true,
    description:
      'Cohere-compatible rerank shape for Cohere, Bedrock rerank, Jina, Voyage, and general rerank providers.',
    samplePayload: {
      model: 'rerank-english-v3.0',
      query: 'What is the capital of France?',
      documents: [
        'Paris is the capital of France.',
        'Berlin is the capital of Germany.',
        'The Eiffel Tower is in Paris.',
      ],
      top_n: 2,
    },
  },
  {
    id: 'anthropic',
    label: 'Anthropic Messages',
    path: '/anthropic_messages/v1/messages',
    auth: 'anthropic',
    supportsProviderSelector: true,
    description:
      'Native Anthropic Messages shape for Anthropic, Bedrock Anthropic, or Azure Anthropic providers.',
    samplePayload: {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: 'Write a one sentence greeting from the QuilrAI gateway playground.',
        },
      ],
    },
  },
  {
    id: 'tts',
    label: 'Text to speech',
    path: '/openai_compatible/v1/audio/speech',
    auth: 'bearer',
    responseType: 'binary',
    description:
      'OpenAI-compatible text-to-speech for OpenAI or Azure OpenAI keys with TTS enabled. The playground shows returned audio metadata and a preview player.',
    samplePayload: {
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: 'Hello from the QuilrAI gateway playground.',
      response_format: 'mp3',
    },
  },
];

const PROVIDER_SELECTOR_OPTIONS = [
  { value: 'none', label: 'Auto route' },
  { value: 'provider', label: 'Provider type' },
  { value: 'provider_label', label: 'Provider label' },
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
  return JSON.stringify(value, null, 2) ?? '';
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

function parseJsonWithError(text) {
  if (!text.trim()) {
    return { value: null, error: 'Enter a JSON request body.' };
  }

  try {
    return { value: JSON.parse(text), error: null };
  } catch (error) {
    return { value: null, error: error.message || 'Request body must be valid JSON.' };
  }
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getLlmSurface(surfaceId) {
  return LLM_SURFACES.find((surface) => surface.id === surfaceId) ?? LLM_SURFACES[0];
}

function getDefaultLlmPayload(surfaceId) {
  return JSON.parse(JSON.stringify(getLlmSurface(surfaceId).samplePayload));
}

function withProviderSelector(payload, selectorType, selectorValue) {
  const trimmedSelector = selectorValue.trim();

  if (!isPlainObject(payload) || selectorType === 'none' || !trimmedSelector) {
    return payload;
  }

  return {
    ...payload,
    [selectorType]: trimmedSelector,
  };
}

function getLlmHeaders(surface, apiKey) {
  if (surface.auth === 'anthropic') {
    return {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

function getSnippetKey(apiKey, shouldReveal) {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) return 'sk-quilr-...';
  return shouldReveal ? trimmedKey : 'sk-quilr-...';
}

function buildGenericCurlSnippet(requestUrl, requestPayload, headers, surface) {
  const lines = [`curl --request POST ${shellQuote(requestUrl)} \\`];

  Object.entries(headers).forEach(([name, value]) => {
    lines.push(`  --header ${shellQuote(`${name}: ${value}`)} \\`);
  });

  const dataLine = `  --data ${shellQuote(formatJson(requestPayload))}`;

  if (surface.responseType === 'binary') {
    lines.push(`${dataLine} \\`);
    lines.push('  --output quilr-speech.mp3');
    return lines.join('\n');
  }

  lines.push(dataLine);
  return lines.join('\n');
}

function buildGenericPythonSnippet(requestUrl, requestPayload, headers, surface) {
  if (surface.responseType === 'binary') {
    return `from pathlib import Path

import requests

url = ${JSON.stringify(requestUrl)}
payload = ${formatJson(requestPayload)}
headers = ${formatJson(headers)}

response = requests.post(url, headers=headers, json=payload, timeout=60)
print(response.status_code, response.headers.get("content-type"))
response.raise_for_status()

Path("quilr-speech.mp3").write_bytes(response.content)
print(f"wrote {len(response.content)} bytes to quilr-speech.mp3")
`;
  }

  return `import requests

url = ${JSON.stringify(requestUrl)}
payload = ${formatJson(requestPayload)}
headers = ${formatJson(headers)}

response = requests.post(url, headers=headers, json=payload, timeout=60)
response_text = response.text

print(response.status_code, response_text)
response.raise_for_status()

try:
    data = response.json()
except ValueError:
    data = response_text

print(data)
`;
}

function buildGenericJavascriptSnippet(requestUrl, requestPayload, headers, surface) {
  if (surface.responseType === 'binary') {
    return `const url = ${JSON.stringify(requestUrl)};
const payload = ${formatJson(requestPayload)};
const headers = ${formatJson(headers)};

const response = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});

if (!response.ok) {
  throw new Error(\`Gateway request failed: \${response.status} \${await response.text()}\`);
}

const blob = await response.blob();
const audioUrl = URL.createObjectURL(blob);

console.log({
  contentType: response.headers.get("content-type"),
  bytes: blob.size,
  audioUrl,
});
`;
  }

  return `const url = ${JSON.stringify(requestUrl)};
const payload = ${formatJson(requestPayload)};
const headers = ${formatJson(headers)};

const response = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});

const responseText = await response.text();
let data = responseText;

try {
  data = responseText ? JSON.parse(responseText) : null;
} catch {
  // Keep non-JSON responses as text.
}

if (!response.ok) {
  throw new Error(\`Gateway request failed: \${response.status} \${responseText}\`);
}

console.log(data);
`;
}

function buildGenericCodeSnippet(tabId, requestUrl, requestPayload, headers, surface) {
  if (tabId === 'python') {
    return buildGenericPythonSnippet(requestUrl, requestPayload, headers, surface);
  }

  if (tabId === 'javascript') {
    return buildGenericJavascriptSnippet(requestUrl, requestPayload, headers, surface);
  }

  return buildGenericCurlSnippet(requestUrl, requestPayload, headers, surface);
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

function buildSdkCurlSnippet(requestUrl, requestPayload, snippetKey) {
  return [
    `curl --request POST ${shellQuote(requestUrl)} \\`,
    `  --header ${shellQuote(`Authorization: Bearer ${snippetKey}`)} \\`,
    `  --header ${shellQuote('Content-Type: application/json')} \\`,
    `  --data ${shellQuote(formatJson(requestPayload))}`,
  ].join('\n');
}

function buildSdkPythonSnippet(requestUrl, requestPayload, snippetKey) {
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

function buildSdkJavascriptSnippet(requestUrl, requestPayload, snippetKey) {
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

function buildSdkCodeSnippet(tabId, requestUrl, requestPayload, snippetKey) {
  if (tabId === 'python') {
    return buildSdkPythonSnippet(requestUrl, requestPayload, snippetKey);
  }

  if (tabId === 'javascript') {
    return buildSdkJavascriptSnippet(requestUrl, requestPayload, snippetKey);
  }

  return buildSdkCurlSnippet(requestUrl, requestPayload, snippetKey);
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

function getLlmAction(result, error) {
  if (!result && !error) {
    return {
      title: 'Send a gateway request',
      body: 'The HTTP status, parsed response, and raw response body will appear here.',
      tone: 'idle',
      icon: Send,
    };
  }

  if (result?.status >= 200 && result?.status < 300) {
    return {
      title: `Gateway returned HTTP ${result.status}`,
      body: 'Review the parsed provider response and raw JSON before copying the request into an application.',
      tone: 'safe',
      icon: CheckCircle2,
    };
  }

  if (result) {
    return {
      title: `Gateway returned HTTP ${result.status}`,
      body: 'The endpoint responded with an error payload. Check the key provider, model, request body, and selected API surface.',
      tone: 'blocked',
      icon: AlertTriangle,
    };
  }

  return {
    title: 'Request did not complete',
    body: error,
    tone: 'blocked',
    icon: AlertTriangle,
  };
}

function getHttpErrorMessage(responseBody, responseText, status) {
  if (isPlainObject(responseBody)) {
    return (
      responseBody.error?.message ||
      responseBody.detail ||
      responseBody.message ||
      responseText ||
      `HTTP ${status}`
    );
  }

  return responseText || `HTTP ${status}`;
}

function getResponseOutputText(body, surfaceId) {
  if (!body || typeof body !== 'object') return null;

  if (surfaceId === 'chat') {
    return body.choices?.[0]?.message?.content ?? body.choices?.[0]?.text ?? null;
  }

  if (surfaceId === 'completions') {
    return body.choices?.[0]?.text ?? null;
  }

  if (surfaceId === 'responses') {
    if (typeof body.output_text === 'string') return body.output_text;

    const chunks = [];
    if (Array.isArray(body.output)) {
      body.output.forEach((item) => {
        if (Array.isArray(item.content)) {
          item.content.forEach((part) => {
            if (typeof part.text === 'string') chunks.push(part.text);
          });
        }
      });
    }

    return chunks.length > 0 ? chunks.join('\n') : null;
  }

  if (surfaceId === 'anthropic' && Array.isArray(body.content)) {
    const chunks = body.content
      .map((part) => (typeof part.text === 'string' ? part.text : null))
      .filter(Boolean);
    return chunks.length > 0 ? chunks.join('\n') : null;
  }

  if (surfaceId === 'embeddings' && Array.isArray(body.data)) {
    const firstVectorLength = body.data[0]?.embedding?.length;
    return `Returned ${body.data.length} embedding item${
      body.data.length === 1 ? '' : 's'
    }${firstVectorLength ? `; first vector has ${firstVectorLength} dimensions.` : '.'}`;
  }

  if (surfaceId === 'rerank' && Array.isArray(body.results)) {
    return body.results
      .map((item) => `index ${item.index}: ${item.relevance_score}`)
      .join('\n');
  }

  if (surfaceId === 'tts' && body.binary_response) {
    const { content_type: contentType, bytes } = body.binary_response;
    return `Returned ${contentType || 'binary response'}; ${bytes} bytes.`;
  }

  return null;
}

function formatDisplayValue(value) {
  if (value == null) return '';
  return typeof value === 'string' ? value : formatJson(value);
}

export default function SdkApiKeyTester() {
  const [playgroundMode, setPlaygroundMode] = useState('llm');
  const [endpoint, setEndpoint] = useState('https://guardrails.quilr.ai');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');

  const [llmSurface, setLlmSurface] = useState('chat');
  const [providerSelectorType, setProviderSelectorType] = useState('none');
  const [providerSelector, setProviderSelector] = useState('');
  const [llmPayloadText, setLlmPayloadText] = useState(() =>
    formatJson(getDefaultLlmPayload('chat')),
  );

  const [checkType, setCheckType] = useState('request');
  const [content, setContent] = useState(SAMPLE_TEXT.request);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [showKeyInSnippet, setShowKeyInSnippet] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [binaryObjectUrl, setBinaryObjectUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (binaryObjectUrl) {
        URL.revokeObjectURL(binaryObjectUrl);
      }
    };
  }, [binaryObjectUrl]);

  const baseUrl = normalizeBaseUrl(endpoint === 'custom' ? customEndpoint : endpoint);
  const sdkRequestUrl = baseUrl ? `${baseUrl}/sdk/v1/check` : '/sdk/v1/check';
  const llmSurfaceConfig = getLlmSurface(llmSurface);
  const llmRequestUrl = baseUrl ? `${baseUrl}${llmSurfaceConfig.path}` : llmSurfaceConfig.path;

  const sdkRequestPayload = useMemo(() => {
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

  const llmPayloadParse = useMemo(() => parseJsonWithError(llmPayloadText), [llmPayloadText]);
  const llmPayloadError =
    llmPayloadParse.error ||
    (!isPlainObject(llmPayloadParse.value) ? 'Request body must be a JSON object.' : null);
  const llmRequestPayload = useMemo(
    () =>
      llmPayloadError
        ? null
        : withProviderSelector(
            llmPayloadParse.value,
            llmSurfaceConfig.supportsProviderSelector ? providerSelectorType : 'none',
            providerSelector,
          ),
    [
      llmPayloadError,
      llmPayloadParse.value,
      llmSurfaceConfig.supportsProviderSelector,
      providerSelector,
      providerSelectorType,
    ],
  );

  const requestUrl = playgroundMode === 'sdk' ? sdkRequestUrl : llmRequestUrl;
  const requestPayload = playgroundMode === 'sdk' ? sdkRequestPayload : llmRequestPayload;
  const keyLooksWrong = apiKey.trim().length > 0 && !apiKey.trim().startsWith('sk-quilr-');
  const canSubmit =
    playgroundMode === 'sdk'
      ? Boolean(baseUrl && apiKey.trim() && content.trim() && !isLoading)
      : Boolean(baseUrl && apiKey.trim() && llmRequestPayload && !isLoading);

  const sdkResult = playgroundMode === 'sdk' ? result : null;
  const llmResult = playgroundMode === 'llm' ? result : null;
  const callerAction = getCallerAction(sdkResult, checkType);
  const CallerIcon = callerAction.icon;
  const llmAction = getLlmAction(llmResult, error);
  const LlmIcon = llmAction.icon;
  const safeText = getSafeText(sdkResult, checkType);
  const detectedEntities = getDetectedEntities(sdkResult);
  const decisionRows = getDecisionRows(checkType, sdkResult?.action);
  const llmResponseText = getResponseOutputText(llmResult?.body, llmSurface);
  const snippetKey = getSnippetKey(apiKey, showKeyInSnippet);

  const activeSnippet = useMemo(() => {
    if (playgroundMode === 'sdk') {
      return buildSdkCodeSnippet(activeCodeTab, sdkRequestUrl, sdkRequestPayload, snippetKey);
    }

    if (!llmRequestPayload) {
      return '// Fix the JSON request body to generate a runnable example.';
    }

    return buildGenericCodeSnippet(
      activeCodeTab,
      llmRequestUrl,
      llmRequestPayload,
      getLlmHeaders(llmSurfaceConfig, snippetKey),
      llmSurfaceConfig,
    );
  }, [
    activeCodeTab,
    llmRequestPayload,
    llmRequestUrl,
    llmSurfaceConfig,
    playgroundMode,
    sdkRequestPayload,
    sdkRequestUrl,
    snippetKey,
  ]);

  function clearResult() {
    setResult(null);
    setError(null);
    setBinaryObjectUrl(null);
  }

  function updatePlaygroundMode(nextMode) {
    setPlaygroundMode(nextMode);
    clearResult();
  }

  function updateLlmSurface(nextSurface) {
    setLlmSurface(nextSurface);
    setLlmPayloadText(formatJson(getDefaultLlmPayload(nextSurface)));
    clearResult();
  }

  function resetLlmPayload() {
    setLlmPayloadText(formatJson(getDefaultLlmPayload(llmSurface)));
    clearResult();
  }

  function updateCheckType(nextType) {
    setCheckType(nextType);
    setContent(SAMPLE_TEXT[nextType]);
    clearResult();
  }

  async function runSdkCheck() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(sdkRequestUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sdkRequestPayload),
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
            ? ' This SDK mode only works with keys whose provider is quilr_sdk. Use Provider API key mode for normal LLM Gateway keys.'
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
    }
  }

  async function runLlmRequest() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);
    const startedAt = performance.now();

    try {
      const response = await fetch(llmRequestUrl, {
        method: 'POST',
        headers: getLlmHeaders(llmSurfaceConfig, apiKey.trim()),
        body: JSON.stringify(llmRequestPayload),
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') ?? 'unknown';
      const isBinarySuccess = llmSurfaceConfig.responseType === 'binary' && response.ok;
      let responseText = '';
      let responseJson = null;
      let responseBody;

      if (isBinarySuccess) {
        const responseBlob = await response.blob();
        const objectUrl = URL.createObjectURL(responseBlob);

        setBinaryObjectUrl(objectUrl);
        responseBody = {
          binary_response: {
            content_type: contentType,
            bytes: responseBlob.size,
          },
        };
      } else {
        responseText = await response.text();
        responseJson = parseJson(responseText);
        responseBody = responseJson ?? responseText;
      }

      const responseResult = {
        status: response.status,
        statusText: response.statusText,
        durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
        surface: llmSurfaceConfig.label,
        body: responseBody,
        headers: {
          contentType,
          requestId:
            response.headers.get('x-request-id') ??
            response.headers.get('x-quilr-request-id') ??
            response.headers.get('cf-ray') ??
            'not returned',
        },
      };

      setResult(responseResult);

      if (!response.ok) {
        setError(getHttpErrorMessage(responseJson, responseText, response.status));
      }
    } catch (err) {
      const message =
        err.name === 'AbortError'
          ? 'The request timed out after 60 seconds.'
          : 'The browser could not reach the selected gateway endpoint. Check the endpoint, network access, and CORS policy.';
      setError(message);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function runPlayground(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    clearResult();

    try {
      if (playgroundMode === 'sdk') {
        await runSdkCheck();
      } else {
        await runLlmRequest();
      }
    } finally {
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
      <form className={styles.form} onSubmit={runPlayground}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>
              {playgroundMode === 'sdk'
                ? 'Try your SDK key'
                : 'Try a provider API key'}
            </h3>
            <p>
              {playgroundMode === 'sdk' ? (
                <>
                  Calls <code>POST /sdk/v1/check</code> with a{' '}
                  <code>quilr_sdk</code> API key.
                </>
              ) : (
                <>
                  Sends a real LLM Gateway request with a standard{' '}
                  <code>sk-quilr-...</code> provider key.
                </>
              )}
            </p>
          </div>
          <div className={styles.method}>POST</div>
        </div>

        <div
          className={`${styles.segmented} ${styles.modeSegmented}`}
          role="group"
          aria-label="Playground mode"
        >
          {PLAYGROUND_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={playgroundMode === mode.id ? styles.activeSegment : undefined}
              onClick={() => updatePlaygroundMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
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
            QuilrAI gateway keys usually start with <code>sk-quilr-</code>.
          </div>
        )}

        {playgroundMode === 'llm' ? (
          <>
            <label className={styles.field}>
              <span>API surface</span>
              <select
                value={llmSurface}
                onChange={(event) => updateLlmSurface(event.target.value)}
              >
                {LLM_SURFACES.map((surface) => (
                  <option key={surface.id} value={surface.id}>
                    {surface.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.hintPanel}>
              <strong>{llmSurfaceConfig.label}</strong>
              <p>{llmSurfaceConfig.description}</p>
              <code>{llmSurfaceConfig.path}</code>
            </div>

            {llmSurfaceConfig.supportsProviderSelector && (
              <>
                <div className={styles.selectorGrid}>
                  <label className={styles.field}>
                    <span>Provider selector</span>
                    <select
                      value={providerSelectorType}
                      onChange={(event) => setProviderSelectorType(event.target.value)}
                    >
                      {PROVIDER_SELECTOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {providerSelectorType !== 'none' && (
                    <label className={styles.field}>
                      <span>
                        {providerSelectorType === 'provider'
                          ? 'Provider type'
                          : 'Provider label'}
                      </span>
                      <input
                        value={providerSelector}
                        onChange={(event) => setProviderSelector(event.target.value)}
                        placeholder={
                          providerSelectorType === 'provider'
                            ? 'bedrock'
                            : 'azure-westus'
                        }
                        spellCheck="false"
                      />
                    </label>
                  )}
                </div>

                {providerSelectorType !== 'none' && providerSelector.trim() && (
                  <div className={styles.inlineWarning}>
                    Selector is sent in the JSON body as{' '}
                    <code>{providerSelectorType}</code>.
                  </div>
                )}
              </>
            )}

            <div className={styles.field}>
              <div className={styles.payloadHeader}>
                <span>Request JSON</span>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={resetLlmPayload}
                >
                  <RefreshCw size={14} aria-hidden />
                  <span>Reset example</span>
                </button>
              </div>
              <textarea
                value={llmPayloadText}
                onChange={(event) => setLlmPayloadText(event.target.value)}
                rows={12}
                spellCheck="false"
                aria-label="Request JSON"
              />
            </div>

            {llmPayloadError && (
              <div className={styles.inlineWarning}>{llmPayloadError}</div>
            )}

            <button className={styles.submit} type="submit" disabled={!canSubmit}>
              {isLoading ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <Send size={16} />
              )}
              Send request
            </button>
          </>
        ) : (
          <>
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
              {isLoading ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <ShieldCheck size={16} />
              )}
              Run check
            </button>
          </>
        )}
      </form>

      <div className={styles.output}>
        <div className={styles.snippetPanel}>
          <div className={styles.snippetHeader}>
            <div>
              <div className={styles.previewHeader}>Exact request</div>
              <p>
                {playgroundMode === 'sdk'
                  ? 'Generated from the endpoint, mode, and content on the left. The key is masked until you reveal it.'
                  : 'Generated from the endpoint, API surface, provider selector, and JSON body on the left. The key is masked until you reveal it.'}
              </p>
            </div>
            <div className={styles.snippetActions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setShowKeyInSnippet((value) => !value)}
                aria-label={
                  showKeyInSnippet
                    ? 'Mask API key in snippets'
                    : 'Reveal API key in snippets'
                }
                title={showKeyInSnippet ? 'Mask API key' : 'Reveal API key'}
              >
                {showKeyInSnippet ? (
                  <EyeOff size={15} aria-hidden />
                ) : (
                  <Eye size={15} aria-hidden />
                )}
              </button>
              <button type="button" className={styles.copyButton} onClick={copyActiveSnippet}>
                {copiedSnippet ? (
                  <Check size={15} aria-hidden />
                ) : (
                  <Clipboard size={15} aria-hidden />
                )}
                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div
            className={`${styles.segmented} ${styles.codeTabs}`}
            role="group"
            aria-label="Code example"
          >
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

        {playgroundMode === 'llm' ? (
          <>
            <div className={`${styles.actionPanel} ${styles[llmAction.tone]}`}>
              <LlmIcon size={18} aria-hidden />
              <div>
                <h3>{llmAction.title}</h3>
                <p>{llmAction.body}</p>
              </div>
            </div>

            {llmResult && (
              <div className={styles.summaryGrid}>
                <div>
                  <span>HTTP</span>
                  <strong>
                    {llmResult.status} {llmResult.statusText}
                  </strong>
                </div>
                <div>
                  <span>Latency</span>
                  <strong>{llmResult.durationMs} ms</strong>
                </div>
                <div>
                  <span>Request ID</span>
                  <strong>{llmResult.headers.requestId}</strong>
                </div>
              </div>
            )}

            {llmResponseText && (
              <div className={styles.previewGroup}>
                <div className={styles.previewHeader}>Parsed response</div>
                <pre>{llmResponseText}</pre>
              </div>
            )}

            {binaryObjectUrl && (
              <div className={styles.audioPanel}>
                <div className={styles.previewHeader}>Audio preview</div>
                <audio controls src={binaryObjectUrl} />
              </div>
            )}

            {error && (
              <div className={styles.errorPanel}>
                <AlertTriangle size={18} aria-hidden />
                <p>{error}</p>
              </div>
            )}

            <div className={styles.previewGroup}>
              <div className={styles.previewHeader}>Effective request payload</div>
              <pre>
                {requestPayload
                  ? formatJson(requestPayload)
                  : 'Fix the request JSON to preview the payload.'}
              </pre>
            </div>

            <div className={styles.previewGroup}>
              <div className={styles.previewHeader}>Raw response</div>
              <pre>
                {llmResult
                  ? formatDisplayValue(llmResult.body)
                  : 'Send a request to see the gateway response.'}
              </pre>
            </div>
          </>
        ) : (
          <>
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
                    className={`${styles.decisionItem} ${
                      row.isActive ? styles.activeDecision : ''
                    }`}
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

            {sdkResult && (
              <div className={styles.summaryGrid}>
                <div>
                  <span>Status</span>
                  <strong>{sdkResult.status ?? 'unknown'}</strong>
                </div>
                <div>
                  <span>Action</span>
                  <strong>{sdkResult.action ?? 'unknown'}</strong>
                </div>
                <div>
                  <span>Detected</span>
                  <strong>
                    {Array.isArray(sdkResult.categories_detected) &&
                    sdkResult.categories_detected.length > 0
                      ? sdkResult.categories_detected.join(', ')
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
              <pre>
                {sdkResult
                  ? formatJson(sdkResult)
                  : 'Run a check to see the QuilrAI response.'}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
