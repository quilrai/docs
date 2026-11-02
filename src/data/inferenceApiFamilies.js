/**
 * API families of the LLM Gateway Inference API (static/openapi/llm-gateway-inference-v1.json).
 *
 * Page: docs/llm-gateway/api-reference/inference-api.mdx, rendered by
 * src/components/ManagementApi/inference.js. plugins/ai-markdown.js also
 * evaluates this file (plain JS: no imports) for the .md / llms output.
 *
 * The OpenAPI document does not name the family of an operation, so this file
 * groups its tags into the families the spec endpoint serves with `?family=<key>`
 * (and the per-family downloads in static/openapi/llm-gateway-inference-v1-<key>.json).
 * Operations whose tags are in no family are shown under "Other", so a refreshed
 * spec with a new tag still renders everything.
 *
 * key:      the `family` query value and download file suffix
 * anchor:   the heading id of the family's section on the page
 * playground: canonical "METHOD path" -> LLM Gateway Playground surface id
 *           (src/components/LlmGatewayStudio SURFACES), for "Try it in the playground"
 */
export default {
  families: [
    {key: 'openai_compatible', anchor: 'openai-compatible', label: 'OpenAI-compatible', desc: 'Chat, completions, embeddings, audio, images, moderations, OCR, files, batches, videos, decisions and models.', tags: ['OpenAI Chat and Completions', 'OpenAI Embeddings', 'OpenAI Audio', 'OpenAI Images', 'OpenAI Moderations and OCR', 'OpenAI Files', 'OpenAI Batches', 'OpenAI Videos', 'OpenAI Decisions', 'OpenAI Models', 'OpenAI Quota Usage']},
    {key: 'openai_responses', anchor: 'openai-responses', label: 'OpenAI Responses', desc: 'Create, stream, retrieve, cancel and delete model responses.', tags: ['OpenAI Responses']},
    {key: 'azure_openai', anchor: 'azure-openai', label: 'Azure OpenAI', desc: 'Deployment-style paths for the Azure OpenAI SDK.', tags: ['Azure OpenAI']},
    {key: 'openai_realtime', anchor: 'openai-realtime', label: 'OpenAI Realtime', desc: 'WebSocket sessions relayed to an OpenAI or Azure OpenAI realtime upstream.', tags: ['OpenAI Realtime']},
    {key: 'openai_assistants', anchor: 'openai-assistants', label: 'OpenAI Assistants', desc: 'Assistants v2: assistants, threads, messages, runs and run steps.', tags: ['OpenAI Assistants']},
    {key: 'anthropic_messages', anchor: 'anthropic-messages', label: 'Anthropic Messages', desc: 'Messages, token counting and models for the Anthropic SDK and Claude Code.', tags: ['Anthropic Messages']},
    {key: 'bedrock_runtime', anchor: 'bedrock-runtime', label: 'AWS Bedrock Runtime', desc: 'Converse, ConverseStream, InvokeModel and InvokeModelWithResponseStream.', tags: ['AWS Bedrock Runtime']},
    {key: 'google_gemini', anchor: 'google-gemini', label: 'Gemini and Vertex AI', desc: 'generateContent, streaming, token counting, embeddings and predict.', tags: ['Google Gemini and Vertex AI']},
    {key: 'rerank', anchor: 'rerank', label: 'Rerank', desc: 'Cohere-compatible document reranking for every rerank provider.', tags: ['Rerank']},
    {key: 'mistral', anchor: 'mistral', label: 'Mistral', desc: "Mistral's own OCR and fill-in-the-middle APIs.", tags: ['Mistral']},
    {key: 'xai', anchor: 'xai', label: 'xAI', desc: 'Images, videos, batches and Responses with xAI server-side tools.', tags: ['xAI Images and Videos', 'xAI Batches', 'xAI Responses']},
    {key: 'sarvam', anchor: 'sarvam', label: 'Sarvam', desc: 'Speech to text, text to speech, translation, transliteration and language identification.', tags: ['Sarvam']},
    {key: 'typesafe', anchor: 'typesafe', label: 'TypeSafe System One', desc: 'Decision models answering typed questions with probabilities.', tags: ['TypeSafe System One']},
    {key: 'cohere', anchor: 'cohere', label: 'Cohere', desc: 'Cohere embed, rerank, parse, tokenize, batches, embed jobs and datasets in Cohere\'s own format.', tags: ['Cohere Embed and Rerank', 'Cohere Parse and Tokenize', 'Cohere Batches, Embed Jobs and Datasets']},
    {key: 'perplexity', anchor: 'perplexity', label: 'Perplexity', desc: 'pplx-decider decisions and pplx-embed embeddings in Perplexity\'s own format.', tags: ['Perplexity Decisions', 'Perplexity Embeddings']},
    {key: 'specification', anchor: 'specification', label: 'Specification', desc: 'Fetch this OpenAPI document from the gateway.', tags: ['Specification'], noDownload: true},
  ],
  other: {key: 'other', anchor: 'other-operations', label: 'Other'},
  // x-quilr-gateway-features keys -> public names, in display order. Unknown keys show as-is.
  features: {
    request_dlp: 'Request guardrails',
    response_dlp: 'Response guardrails (non-streaming)',
    guardian: 'Guardian checks',
    hallucination: 'Hallucination check (non-streaming)',
    attachments: 'Attachment scanning',
    model_access: 'Model access rules',
    group_routing: 'Routing groups',
    context_routing: 'Content routing',
    failover: 'Failover',
    limits: 'Limits, quotas and budgets',
    token_saving: 'Token saving',
    prompt_store: 'Prompt Store',
    universal_system_prompt: 'Universal system prompt',
    response_cache: 'Response cache',
  },
  // Short column headings for the coverage table.
  featureShort: {
    request_dlp: 'Request guardrails', response_dlp: 'Response guardrails', guardian: 'Guardian', hallucination: 'Hallucination',
    attachments: 'Attachments', model_access: 'Model access', group_routing: 'Routing groups', context_routing: 'Content routing',
    failover: 'Failover', limits: 'Limits', token_saving: 'Token saving', prompt_store: 'Prompt Store',
    universal_system_prompt: 'Universal prompt', response_cache: 'Response cache',
  },
  playground: {
    'POST /openai_compatible/v1/chat/completions': 'chat',
    'POST /openai_responses/v1/responses': 'responses',
    'POST /anthropic_messages/v1/messages': 'anthropic',
    'POST /openai_assistants/v1/threads/{thread_id}/runs': 'assistants',
    'POST /openai_compatible/v1/completions': 'completions',
    'POST /openai_compatible/v1/embeddings': 'embeddings',
    'POST /openai_compatible/v1/moderations': 'moderations',
    'POST /openai_compatible/v1/images/generations': 'images',
    'POST /openai_compatible/v1/ocr': 'ocr',
    'POST /rerank/v1/rerank': 'rerank',
    'POST /rerank/v2/rerank': 'rerank',
    'POST /openai_compatible/v1/audio/speech': 'tts',
  },
};
