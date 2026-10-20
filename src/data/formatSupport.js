/**
 * Data for <FormatExplorer data={formatSupport} /> (src/components/FormatExplorer).
 *
 * Any-to-any format support in the LLM Gateway: which client format reaches
 * which provider, and how. Page: docs/llm-gateway/api-reference/any-to-any-formats.mdx.
 * plugins/ai-markdown.js also evaluates this file (plain JS: no imports) to
 * print the matrix as a markdown table in the .md / llms output.
 *
 * Feature limits on converted pairs (what returns an error, what is coming
 * soon) live in ONE table on the any-to-any page ("Limits and coming soon", #limits).
 * Cell notes here only point at it, so a limit can change without editing
 * this file.
 *
 * Schema
 * ------
 * formats:   [{ id, label, endpoint }]
 *            Client formats (what the caller sends). `endpoint` is the client
 *            path shown on the left of the wire line, e.g. "POST /v1/responses".
 * providers: [{ id, label, group? }]
 *            Provider rows in the matrix. Consecutive rows that share `group`
 *            are shown under one group heading.
 * modes:     { native, switch, adapter, translate, none, soon }, each
 *            { label, tone, description }
 *            tone: success | info | accent | warning | danger | neutral
 *            (DecisionLadder tones). The matrix legend and cell colours use them.
 * ladder:    [{ id: 'native'|'switch'|'adapter'|'translate', question, yes: { label, tone } }]
 *            The ordered checks, first match wins. Step ids must match mode ids.
 * fallback:  { label, tone }   Reached when every step says no (mode 'none').
 * cells:     { [providerId]: { [formatId]: Cell } }
 *            Cell = { mode, wire, notes?: [string], gated?: bool, preview?: bool,
 *                     variants?: [{ when, mode, wire, notes? }] }
 *            mode:    one of the `modes` keys ('soon' allowed, same as soon: true).
 *            soon:    true = not supported yet, coming soon. Shown dashed with a
 *                     "Soon" badge in the matrix; the ladder lands on the fallback
 *                     row but reads modes.soon.label instead of the 400 text.
 *            wire:    the upstream request actually sent, e.g. "Bedrock Converse".
 *            notes:   short lines; start with "✓ " (kept / works) or "✗ " (lost /
 *                     rejected) to get a coloured mark, anything else is a plain bullet.
 *            gated:   true = off by default (needs a flag or provider setting).
 *            preview: true = preview / not yet live-verified.
 *            variants: model-dependent behaviour. When present the explorer shows
 *                     one chip per variant (`when` is the chip text, e.g. "Claude
 *                     models") and the selected variant's mode/wire/notes replace
 *                     the cell's. The cell's own `mode` is what the matrix shows.
 *            A missing cell is treated as mode 'none'. Variants may also carry
 *            soon: true / mode 'soon'.
 */

// Shared note lines.
const NATIVE = '✓ Forwarded as sent. Nothing is converted.';
const SWITCH = '✓ Same credential. Only the endpoint changes; the body is not converted.';
const KEPT = '✓ Text, system prompt, history, tools and tool calls, streaming, images and inline files';
const BILLING = '✓ Billed on the provider’s own token usage';
const PARAMS = 'Parameters without an equivalent are dropped. See “Parameters when converting” on this page.';
const LIMITS =
  'Provider-only features (stored state, hosted tools, provider file ids) are not converted. See “Limits and coming soon” on this page.';
const ADAPTER = [
  '✓ Text, tools and tool calls, streaming, structured output (per provider)',
  'Unknown parameters are rejected, not dropped. See “Chat Completions adapters” on this page.',
];
const TEXT_ONLY = '✗ Images and files: this adapter is text only';
// Bedrock (boto3) clients reach a non-Bedrock provider only when the gateway
// picks it: a routing group member, a provider selector, or the only provider
// on the app that lists the model.
const BEDROCK_PICK =
  'Used when this provider is picked by a routing group, an X-Provider-Name / X-Provider-Label selector, or because it is the only provider with the model.';
const INVOKE_PICK =
  'Used when this provider is picked by a provider selector or is the only provider with the model. InvokeModel requests cannot use routing groups.';
const INVOKE_BODIES =
  'Claude (Anthropic) request bodies only. Nova, Llama and Cohere bodies to non-Bedrock providers: coming soon.';
const CACHE = '✓ Prompt-cache breakpoints are added automatically';

const native = (wire, ...notes) => ({ mode: 'native', wire, notes: [NATIVE, ...notes] });
const sw = (wire, ...notes) => ({ mode: 'switch', wire, notes: [SWITCH, ...notes] });
const adapter = (wire, ...notes) => ({ mode: 'adapter', wire, notes: [...ADAPTER, ...notes] });
const tr = (wire, ...notes) => ({ mode: 'translate', wire, notes: [KEPT, BILLING, ...notes, PARAMS, LIMITS] });
const soon = (wire, ...notes) => ({ mode: 'soon', soon: true, wire, notes });

// Converse / InvokeModel clients to a non-Bedrock provider.
const trConverse = (wire, ...notes) => tr(wire, ...notes, BEDROCK_PICK);
const trInvoke = (wire, ...notes) => tr(wire, ...notes, INVOKE_BODIES, INVOKE_PICK);
const swInvoke = (wire) =>
  sw(wire, '✓ Only the Bedrock envelope changes; streams come back as Bedrock chunk events', INVOKE_BODIES, INVOKE_PICK);

// A model-dependent cell: the matrix shows the first variant's mode.
const byModel = (variants) => {
  const { when, ...first } = variants[0];
  return { ...first, variants };
};

// OpenAI: most models on Chat; Responses-only models (gpt-5-pro, Codex, deep
// research) on Responses.
const openaiCross = (make) =>
  byModel([
    { when: 'Most models', ...make('OpenAI Chat Completions') },
    { when: 'Responses-only models', ...make('OpenAI Responses') },
  ]);

const OCI_SOON = 'Converting other formats to Oracle OCI is coming soon. Native OCI requests work today.';
const SARVAM_SOON = 'Converting other formats to Sarvam is coming soon. Native Sarvam Chat Completions work today.';
const VERTEX_CLAUDE_SOON = 'Claude models on Vertex AI are coming soon for every client format.';
const MISTRAL_RULES =
  'seed is sent as random_seed, OpenAI-only fields (user, logit_bias, store) are dropped and tool call ids are rewritten to Mistral’s 9-character format.';
const XAI_RULES = 'logit_bias is dropped; reasoning effort is fitted to what the Grok model accepts.';
const MANTLE_SOON = 'Claude models served only through Bedrock Mantle (such as Claude Mythos) are coming soon.';

export default {
  formats: [
    { id: 'chat', label: 'Chat Completions', endpoint: 'POST /openai_compatible/v1/chat/completions' },
    { id: 'responses', label: 'Responses', endpoint: 'POST /openai_responses/v1/responses' },
    { id: 'messages', label: 'Anthropic Messages', endpoint: 'POST /anthropic_messages/v1/messages' },
    { id: 'gemini', label: 'Gemini generateContent', endpoint: 'POST /vertex_ai/.../models/{model}:generateContent' },
    { id: 'converse', label: 'Bedrock Converse', endpoint: 'POST /bedrock-runtime/model/{modelId}/converse' },
    { id: 'invoke', label: 'Bedrock InvokeModel', endpoint: 'POST /bedrock-runtime/model/{modelId}/invoke' },
  ],

  providers: [
    { id: 'openai', label: 'OpenAI', group: 'OpenAI and Azure OpenAI' },
    { id: 'openai_responses', label: 'OpenAI (Responses type)', group: 'OpenAI and Azure OpenAI' },
    { id: 'azureopenai', label: 'Azure OpenAI', group: 'OpenAI and Azure OpenAI' },
    { id: 'openai_responses_azure', label: 'Azure OpenAI (Responses type)', group: 'OpenAI and Azure OpenAI' },
    { id: 'anthropic_messages', label: 'Anthropic', group: 'Anthropic' },
    { id: 'anthropic', label: 'Anthropic (OpenAI-compatible)', group: 'Anthropic' },
    { id: 'anthropic_messages_azure', label: 'Anthropic on Azure AI Foundry', group: 'Anthropic' },
    { id: 'anthropic_messages_bedrock', label: 'Anthropic on AWS Bedrock', group: 'Anthropic' },
    { id: 'gemini_chatcompletions', label: 'Google Gemini API', group: 'Google' },
    { id: 'vertex_ai', label: 'Google Vertex AI', group: 'Google' },
    { id: 'bedrock', label: 'AWS Bedrock', group: 'AWS' },
    { id: 'xai', label: 'xAI', group: 'More providers' },
    { id: 'xai_responses', label: 'xAI (Responses type)', group: 'More providers' },
    { id: 'mistral', label: 'Mistral', group: 'More providers' },
    { id: 'deepseek', label: 'DeepSeek', group: 'More providers' },
    { id: 'oracle', label: 'Oracle OCI (Chat)', group: 'More providers' },
    { id: 'oracle_responses', label: 'Oracle OCI (Responses)', group: 'More providers' },
    { id: 'sarvam', label: 'Sarvam', group: 'More providers' },
    { id: 'general', label: 'Custom OpenAI-compatible', group: 'More providers' },
  ],

  modes: {
    native: {
      label: 'Native',
      tone: 'success',
      description: 'The provider speaks this format. The request is forwarded as sent, nothing converted.',
    },
    switch: {
      label: 'Endpoint switch',
      tone: 'info',
      description: 'Same provider and credential, sent to the provider’s endpoint that speaks this format.',
    },
    adapter: {
      label: 'Adapter',
      tone: 'accent',
      description: 'A purpose-built Chat Completions adapter maps the request to the provider’s own API.',
    },
    translate: {
      label: 'Translate',
      tone: 'warning',
      description: 'The gateway converts the request to the provider’s format and the response back to yours.',
    },
    none: {
      label: 'Not supported',
      tone: 'neutral',
      description: 'No path serves this format on this provider. The gateway returns an error in your client’s format.',
    },
    soon: {
      label: 'Coming soon',
      tone: 'neutral',
      description: 'Not supported yet. Support for this pair is planned.',
    },
  },

  ladder: [
    {
      id: 'native',
      question: 'Does the provider speak this format natively?',
      yes: { label: 'Forward as sent', tone: 'success' },
    },
    {
      id: 'switch',
      question: 'Does the same provider have an endpoint that speaks it?',
      yes: { label: 'Switch endpoint', tone: 'info' },
    },
    {
      id: 'adapter',
      question: 'Is there a built-in Chat Completions adapter for the provider?',
      yes: { label: 'Use the adapter', tone: 'accent' },
    },
    {
      id: 'translate',
      question: 'Can the request be converted without losing provider-held state?',
      yes: { label: 'Translate both ways', tone: 'warning' },
    },
  ],

  fallback: { label: 'Error in your client’s format', tone: 'danger' },

  cells: {
    // OpenAI and Azure OpenAI
    openai: {
      chat: byModel([
        { when: 'Most models', ...native('OpenAI Chat Completions') },
        {
          when: 'Responses-only models',
          ...tr(
            'OpenAI Responses',
            'For models OpenAI serves only on Responses (such as gpt-5-pro, Codex and deep research models), and for function tools on models that accept them only on Responses.',
          ),
        },
      ]),
      responses: native('OpenAI Responses', '✓ The same OpenAI key serves Responses; previous_response_id and hosted tools work'),
      messages: openaiCross((w) => tr(w)),
      gemini: openaiCross((w) => tr(w)),
      converse: openaiCross((w) => trConverse(w)),
      invoke: openaiCross((w) => trInvoke(w)),
    },
    openai_responses: {
      chat: native('OpenAI Chat Completions', '✓ A Responses-type key also serves Chat Completions'),
      responses: native('OpenAI Responses'),
      messages: tr('OpenAI Responses'),
      gemini: tr('OpenAI Responses'),
      converse: trConverse('OpenAI Responses'),
      invoke: trInvoke('OpenAI Responses'),
    },
    azureopenai: {
      chat: byModel([
        {
          when: 'Deployment endpoint',
          ...native(
            'Azure OpenAI Chat Completions',
            'Models that accept function tools only on Responses are sent to Azure OpenAI Responses.',
          ),
        },
        { when: 'v1 base URL', ...sw('Azure OpenAI /openai/v1 Chat Completions') },
      ]),
      responses: native('Azure OpenAI Responses', '✓ The same Azure key serves Responses'),
      messages: tr('Azure OpenAI Chat Completions'),
      gemini: tr('Azure OpenAI Chat Completions'),
      converse: trConverse('Azure OpenAI Chat Completions'),
      invoke: trInvoke('Azure OpenAI Chat Completions'),
    },
    openai_responses_azure: {
      chat: native('Azure OpenAI Chat Completions', '✓ A Responses-type key also serves Chat Completions'),
      responses: native('Azure OpenAI Responses'),
      messages: tr('Azure OpenAI Responses'),
      gemini: tr('Azure OpenAI Responses'),
      converse: trConverse('Azure OpenAI Responses'),
      invoke: trInvoke('Azure OpenAI Responses'),
    },

    // Anthropic
    anthropic_messages: {
      chat: adapter('Anthropic Messages', TEXT_ONLY),
      responses: tr('Anthropic Messages', CACHE),
      messages: native('Anthropic Messages'),
      gemini: tr('Anthropic Messages', CACHE),
      converse: trConverse('Anthropic Messages'),
      invoke: swInvoke('Anthropic Messages'),
    },
    anthropic: {
      chat: native('Anthropic OpenAI-compatible Chat Completions'),
      responses: tr('Anthropic Messages', CACHE),
      messages: native('Anthropic Messages', '✓ The same Anthropic key serves Messages'),
      gemini: tr('Anthropic Messages', CACHE),
      converse: trConverse('Anthropic Messages'),
      invoke: swInvoke('Anthropic Messages'),
    },
    anthropic_messages_azure: {
      chat: adapter('Azure AI Foundry Anthropic Messages', TEXT_ONLY),
      responses: tr('Azure AI Foundry Anthropic Messages', CACHE),
      messages: native('Azure AI Foundry Anthropic Messages'),
      gemini: tr('Azure AI Foundry Anthropic Messages', CACHE),
      converse: trConverse('Azure AI Foundry Anthropic Messages'),
      invoke: swInvoke('Azure AI Foundry Anthropic Messages'),
    },
    anthropic_messages_bedrock: {
      chat: byModel([
        { when: 'Claude models', ...adapter('Bedrock InvokeModel (Claude)', TEXT_ONLY) },
        { when: 'Mantle-only Claude', ...soon('Bedrock Mantle Messages', MANTLE_SOON) },
        {
          when: 'Other Bedrock models',
          ...tr('Bedrock Converse', 'For Nova, Llama and other non-Claude models on this credential.'),
        },
      ]),
      responses: byModel([
        { when: 'Claude models', ...tr('Bedrock InvokeModel (Claude)', CACHE) },
        { when: 'Mantle-only Claude', ...soon('Bedrock Mantle Messages', MANTLE_SOON) },
        { when: 'Other Bedrock models', ...tr('Bedrock Converse') },
      ]),
      messages: byModel([
        { when: 'Claude models', ...native('Bedrock InvokeModel (Claude)') },
        { when: 'Mantle-only Claude', ...soon('Bedrock Mantle Messages', MANTLE_SOON) },
        { when: 'Other Bedrock models', ...tr('Bedrock Converse') },
      ]),
      gemini: byModel([
        { when: 'Claude models', ...tr('Bedrock InvokeModel (Claude)', CACHE) },
        { when: 'Mantle-only Claude', ...soon('Bedrock Mantle Messages', MANTLE_SOON) },
        { when: 'Other Bedrock models', ...tr('Bedrock Converse') },
      ]),
      converse: native('Bedrock Converse', '✓ Signed passthrough, native event streams included'),
      invoke: native('Bedrock InvokeModel', '✓ Signed passthrough for every model family'),
    },

    // Google
    gemini_chatcompletions: {
      chat: native('Gemini API OpenAI-compatible Chat Completions'),
      responses: tr('Gemini API Chat Completions'),
      messages: tr('Gemini API Chat Completions'),
      gemini: sw(
        'Gemini API generateContent',
        '✓ The same Gemini API key calls generateContent directly',
        'Needs a Gemini model and Google’s default base URL; a custom base URL is reached by translation instead.',
      ),
      converse: trConverse('Gemini API Chat Completions'),
      invoke: trInvoke('Gemini API Chat Completions'),
    },
    vertex_ai: {
      chat: byModel([
        { when: 'Gemini models', ...adapter('Vertex AI generateContent', TEXT_ONLY) },
        { when: 'Model Garden open models', ...sw('Vertex AI OpenAI-compatible chat') },
        { when: 'Claude models', ...soon('Vertex AI Claude', VERTEX_CLAUDE_SOON) },
      ]),
      responses: byModel([
        { when: 'Gemini models', ...tr('Vertex AI generateContent') },
        { when: 'Model Garden open models', ...tr('Vertex AI OpenAI-compatible chat') },
        { when: 'Claude models', ...soon('Vertex AI Claude', VERTEX_CLAUDE_SOON) },
      ]),
      messages: byModel([
        { when: 'Gemini models', ...tr('Vertex AI generateContent') },
        { when: 'Model Garden open models', ...tr('Vertex AI OpenAI-compatible chat') },
        { when: 'Claude models', ...soon('Vertex AI Claude', VERTEX_CLAUDE_SOON) },
      ]),
      gemini: byModel([
        { when: 'Gemini models', ...native('Vertex AI generateContent', '✓ Multimodal and image-output models work') },
        {
          when: 'Model Garden open models',
          ...tr(
            'Vertex AI OpenAI-compatible chat',
            'On POST /vertexai/v1/generateContent only. The native Vertex SDK paths keep the resource you call.',
          ),
        },
        { when: 'Claude models', ...soon('Vertex AI Claude', VERTEX_CLAUDE_SOON) },
      ]),
      converse: byModel([
        { when: 'Gemini models', ...trConverse('Vertex AI generateContent') },
        { when: 'Model Garden open models', ...trConverse('Vertex AI OpenAI-compatible chat') },
        { when: 'Claude models', ...soon('Vertex AI Claude', VERTEX_CLAUDE_SOON) },
      ]),
      invoke: byModel([
        { when: 'Gemini models', ...trInvoke('Vertex AI generateContent') },
        { when: 'Model Garden open models', ...trInvoke('Vertex AI OpenAI-compatible chat') },
        { when: 'Claude models', ...soon('Vertex AI Claude', VERTEX_CLAUDE_SOON) },
      ]),
    },

    // AWS
    bedrock: {
      chat: byModel([
        { when: 'Nova and other models', ...adapter('Bedrock Converse', '✓ Embedded images and documents (data URLs)') },
        {
          when: 'Claude models',
          ...native(
            'Bedrock OpenAI-compatible chat',
            'Or the Converse adapter, depending on the provider’s Bedrock chat API setting.',
          ),
        },
        { when: 'OpenAI models (gpt-oss)', ...native('Bedrock OpenAI-compatible chat') },
      ]),
      responses: native(
        'Bedrock Responses',
        '✓ OpenAI models on Bedrock fall back to Bedrock’s Mantle Responses endpoint when the Runtime endpoint does not serve them',
        'For Claude from a Responses client, an Anthropic on AWS Bedrock provider is the tested path.',
      ),
      messages: byModel([
        { when: 'Claude models', ...native('Bedrock InvokeModel (Claude)') },
        { when: 'Nova and other models', ...tr('Bedrock Converse') },
        { when: 'OpenAI models (gpt-oss)', ...tr('Bedrock OpenAI-compatible chat') },
      ]),
      gemini: byModel([
        { when: 'Claude models', ...tr('Bedrock InvokeModel (Claude)') },
        { when: 'Nova and other models', ...tr('Bedrock Converse') },
        { when: 'OpenAI models (gpt-oss)', ...tr('Bedrock OpenAI-compatible chat') },
      ]),
      converse: native('Bedrock Converse', '✓ Signed passthrough, native event streams included'),
      invoke: native('Bedrock InvokeModel', '✓ Signed passthrough for every model family'),
    },

    // More providers
    xai: {
      chat: byModel([
        {
          when: 'Most models',
          ...native('xAI Chat Completions', 'Requests with PDF or file parts are sent to xAI Responses, which reads them.'),
        },
        { when: 'Multi-agent model', ...tr('xAI Responses', 'grok-4.20-multi-agent is served only on Responses.') },
      ]),
      responses: sw('xAI Responses', '✓ The same xAI key serves Responses'),
      messages: tr(
        'xAI Chat Completions',
        XAI_RULES,
        'Opt-in: send to xAI’s Anthropic-compatible endpoint instead (provider setting).',
      ),
      gemini: tr('xAI Chat Completions', XAI_RULES),
      converse: trConverse('xAI Chat Completions', XAI_RULES),
      invoke: trInvoke('xAI Chat Completions', XAI_RULES),
    },
    xai_responses: {
      chat: sw('xAI Chat Completions', '✓ A Responses-type key also serves Chat Completions'),
      responses: native('xAI Responses'),
      messages: tr('xAI Responses', XAI_RULES),
      gemini: tr('xAI Responses', XAI_RULES),
      converse: trConverse('xAI Responses', XAI_RULES),
      invoke: trInvoke('xAI Responses', XAI_RULES),
    },
    mistral: {
      chat: native('Mistral Chat Completions'),
      responses: tr(
        'Mistral Chat Completions',
        'Mistral has no Responses or Anthropic-compatible endpoint, so every other format is translated to Chat.',
        MISTRAL_RULES,
      ),
      messages: tr('Mistral Chat Completions', MISTRAL_RULES),
      gemini: tr('Mistral Chat Completions', MISTRAL_RULES),
      converse: trConverse('Mistral Chat Completions', MISTRAL_RULES),
      invoke: trInvoke('Mistral Chat Completions', MISTRAL_RULES),
    },
    deepseek: {
      chat: native('DeepSeek Chat Completions'),
      responses: tr('DeepSeek Chat Completions'),
      messages: sw('DeepSeek Anthropic-compatible endpoint', '✓ The same DeepSeek key serves Messages'),
      gemini: tr('DeepSeek Chat Completions'),
      converse: trConverse('DeepSeek Chat Completions'),
      invoke: swInvoke('DeepSeek Anthropic-compatible endpoint'),
    },
    oracle: {
      chat: native('OCI Generative AI Chat Completions'),
      responses: soon('OCI Generative AI Responses', OCI_SOON),
      messages: soon('OCI Generative AI', OCI_SOON),
      gemini: soon('OCI Generative AI', OCI_SOON),
      converse: soon('OCI Generative AI', OCI_SOON),
      invoke: soon('OCI Generative AI', OCI_SOON),
    },
    oracle_responses: {
      chat: soon('OCI Generative AI Chat Completions', OCI_SOON),
      responses: native('OCI Generative AI Responses'),
      messages: soon('OCI Generative AI', OCI_SOON),
      gemini: soon('OCI Generative AI', OCI_SOON),
      converse: soon('OCI Generative AI', OCI_SOON),
      invoke: soon('OCI Generative AI', OCI_SOON),
    },
    sarvam: {
      chat: native('Sarvam Chat Completions'),
      responses: soon('Sarvam Chat Completions', SARVAM_SOON),
      messages: soon('Sarvam Chat Completions', SARVAM_SOON),
      gemini: soon('Sarvam Chat Completions', SARVAM_SOON),
      converse: soon('Sarvam Chat Completions', SARVAM_SOON),
      invoke: soon('Sarvam Chat Completions', SARVAM_SOON),
    },
    general: {
      chat: native('{base URL}/chat/completions'),
      responses: native(
        '{base URL}/responses',
        '✓ If the server answers that it does not support Responses, the gateway retries once with translation to Chat Completions, before anything reaches your client',
      ),
      messages: tr(
        '{base URL}/chat/completions',
        'Opt-in: if the server also speaks Anthropic Messages, list it in the provider settings and requests go to {base URL}/v1/messages unconverted.',
      ),
      gemini: tr('{base URL}/chat/completions'),
      converse: trConverse('{base URL}/chat/completions'),
      invoke: trInvoke('{base URL}/chat/completions'),
    },
  },
};
