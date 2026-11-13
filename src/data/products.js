// The products the docs are organised around. One sidebar per product
// (sidebars.js), one tab per product in the navbar, one landing page per
// product (docs/<slug>/overview.mdx renders <ProductLanding product="<id>" />).
//
// `navLabel` (optional) is a shorter name for the navbar tab, so all eight tabs
// fit on a laptop screen.
//
// Plain data only: this file is imported by docusaurus.config.js (Node) and by
// theme components (browser).

export const products = [
  {
    id: 'console',
    slug: 'console',
    name: 'Console',
    icon: 'LayoutGrid',
    sub: 'Observe, govern and configure everything',
    tagline:
      'See every AI interaction across your organization, decide what is allowed, and prove it. The docs follow the console menu, so each page here matches a page there.',
    shot: '/img/products/console-overview.jpg',
    shotCaption: 'Console › Observe › Overview, Adoption tab',
    primary: {label: 'Console tour', to: '/console/get-started/console-tour'},
    consolePath: 'Observe > Overview',
    mirror:
      'Groups mirror the console sidebar: Observe, Govern, Assessments, Settings. Settings pages owned by a product (gateways, sensors, integrations) live in that product and are linked here.',
    tasks: [
      {title: 'Take the console tour', desc: 'How Observe, Govern and Settings fit together', to: '/console/get-started/console-tour'},
      {title: 'Triage findings', desc: 'Close noise in bulk and tune detections', to: '/console/observe/triage-center'},
      {title: 'Publish your first policy', desc: 'Draft, test a situation, review and publish', to: '/console/govern/author-simulate-and-publish'},
      {title: 'Give your team access', desc: 'Roles, Smart Groups and single sign-on', to: '/console/settings-organization/roles-and-permissions'},
    ],
  },
  {
    id: 'llm',
    slug: 'llm-gateway',
    name: 'LLM Gateway',
    icon: 'Cpu',
    sub: 'One endpoint for every model provider',
    tagline:
      'Point your apps at one OpenAI-compatible endpoint. Every request gets guardrails, routing, limits and cost tracking, whichever provider serves it.',
    shot: '/img/gateway-updates-2026-11/llm-gateway-applications.jpg',
    shotCaption: 'Console › Settings › AI Gateway › LLM Gateway',
    primary: {label: 'Quick start', to: '/llm-gateway/get-started/quick-start'},
    consolePath: 'Settings > AI Gateway > LLM Gateway',
    // Navigation guide for AI agents: console labels and task destinations.
    consoleGuide: '/llmgateway_guide_for_admin_console.txt',
    tasks: [
      {title: 'Send your first request', desc: 'Create an app, copy its key, call the gateway', to: '/llm-gateway/get-started/quick-start'},
      {title: 'Connect a provider', desc: 'OpenAI, Anthropic, Azure, Bedrock, Vertex, OCI', to: '/llm-gateway/apps-and-providers/providers-and-models'},
      {title: 'Any-to-any formats', desc: 'Compare client formats and provider support, and see how requests are converted', to: '/llm-gateway/api-reference/any-to-any-formats'},
      {title: 'Turn on guardrails', desc: 'Block or redact sensitive data and attacks', to: '/llm-gateway/protect/security-guardrails'},
      {title: 'Automate apps and keys', desc: 'Manage apps, keys and configuration with the Management API', to: '/llm-gateway/api-reference/management-api'},
    ],
  },
  {
    id: 'mcp',
    slug: 'mcp-gateway',
    name: 'MCP Gateway',
    icon: 'Network',
    sub: 'Governed tool access for AI agents',
    tagline:
      'Give AI agents governed access to tools. Register MCP servers once, decide who can call which tool, and log every call.',
    shot: '/img/gateway-updates-2026-11/mcp-gateway-servers.jpg',
    shotCaption: 'Console › Settings › AI Gateway › MCP Gateway',
    primary: {label: 'Quick start', to: '/mcp-gateway/get-started/quick-start'},
    consolePath: 'Settings > AI Gateway > MCP Gateway',
    consoleGuide: '/mcpgateway_guide_for_admin_console.txt',
    tasks: [
      {title: 'Connect your first client', desc: 'Claude, Cursor, ChatGPT and other MCP clients', to: '/mcp-gateway/get-started/quick-start'},
      {title: 'Add an MCP server', desc: 'From the library, a URL, or your own API', to: '/mcp-gateway/servers-and-connections/adding-mcp-servers'},
      {title: 'Set up OneMCP', desc: 'One endpoint with dynamic tool calling', to: '/mcp-gateway/get-started/onemcp'},
      {title: 'Lock down tools', desc: 'Who can call what, and what needs approval', to: '/mcp-gateway/protect/server-access'},
    ],
  },
  {
    id: 'a2a',
    slug: 'a2a-gateway',
    name: 'A2A Gateway',
    navLabel: 'A2A',
    icon: 'Handshake',
    sub: 'Governed agent-to-agent calls',
    tagline:
      'Put your Agent2Agent (A2A) agents behind one governed endpoint. Callers get keys and grants, every message is scanned for sensitive data, and agent cards stay pinned to the version you approved.',
    shot: '/img/a2a-gateway/agent-page.jpg',
    shotCaption: 'Console › Settings › AI Gateway › A2A Gateway › agent page',
    primary: {label: 'Quick start', to: '/a2a-gateway/get-started/quick-start'},
    tasks: [
      {title: 'Register an agent', desc: 'Card URL, uploaded card or a wrapped platform agent', to: '/a2a-gateway/configure/agents'},
      {title: 'Create callers and keys', desc: 'Keys are shown once; grants decide what each caller reaches', to: '/a2a-gateway/configure/callers'},
      {title: 'Monitor traffic', desc: 'Logs, tasks, data protection and delegation chains', to: '/a2a-gateway/monitor/logs-tasks-insights'},
      {title: 'Handle errors', desc: 'Gateway error codes and what they mean', to: '/a2a-gateway/get-started/a2a-gateway#error-codes'},
    ],
  },
  {
    id: 'agents',
    slug: 'workflow-agents',
    name: 'Workflow Agents',
    icon: 'Workflow',
    sub: 'Build and run governed AI agents',
    tagline:
      'Build AI agents on your own models and tools, share them with your teams, and run them from the console, chat, Slack or a schedule. Every model call and tool call goes through your gateways.',
    shot: '/img/products/workflow-agents.jpg',
    shotCaption: 'Console › Settings › AI Gateway › Workflow Agents',
    primary: {label: 'Quick start', to: '/workflow-agents/get-started/quick-start'},
    consolePath: 'Settings > AI Gateway > Workflow Agents',
    tasks: [
      {title: 'Build your first agent', desc: 'Describe it, pick a model and tools, publish', to: '/workflow-agents/get-started/quick-start'},
      {title: 'Start from a template', desc: 'Research, support, code review and more', to: '/workflow-agents/build/library-templates'},
      {title: 'Chat with it in Slack', desc: 'Connect a Socket Mode Slack app to an agent', to: '/workflow-agents/slack/chat-from-slack'},
      {title: 'Share and schedule', desc: 'Groups, approvals, recurring runs, versions', to: '/workflow-agents/run-and-share/share-and-manage'},
    ],
  },
  // Assessments mirrors the console's Assessments menu. Each module is a
  // folder under docs/assessments/ (red-teaming, drift-and-bias, ...).
  // The id stays 'red' so existing accents and references keep working.
  {
    id: 'red',
    slug: 'assessments',
    name: 'Assessments',
    icon: 'Target',
    sub: 'Test and monitor your AI',
    tagline:
      'Red Teaming attacks your AI apps, agents, workflows and models before others do. Drift & Bias watches your LLMs and ML models for drift, performance loss and unfair outcomes.',
    shot: '/img/products/red-teaming.jpg',
    shotCaption: 'Console › Assessments › Red Teaming',
    primary: {label: 'Get started with Red Teaming', to: '/assessments/red-teaming/get-started/overview'},
    consolePath: 'Assessments',
    tasks: [
      {title: 'Red team an AI app or agent', desc: 'Attack any HTTP, WebSocket, or voice endpoint', to: '/assessments/red-teaming/configure-and-run/agent'},
      {title: 'Red team an AI workflow', desc: 'Hide attacks in documents, images or data records', to: '/assessments/red-teaming/configure-and-run/ai-workflow'},
      {title: 'Monitor an ML model', desc: 'Drift, performance and fairness from your pipeline', to: '/assessments/drift-and-bias/connect-models/pipeline-push'},
      {title: 'Connect an MLflow registry', desc: 'Pick which registered models to monitor', to: '/assessments/drift-and-bias/connect-models/mlflow'},
    ],
  },
  {
    id: 'browser',
    slug: 'browser-extension',
    name: 'Browser Extension',
    navLabel: 'Browser',
    icon: 'Globe',
    sub: 'AI governance where people work',
    tagline:
      'See which AI apps people use in the browser, stop sensitive data at the prompt, and guide users at the moment they need it.',
    shot: '/img/products/browser-extension.jpg',
    shotCaption: 'Console › Settings › Browser Extension',
    primary: {label: 'Deploy with Intune', to: '/browser-extension/deploy/microsoft-intune'},
    consolePath: 'Settings > Browser Extension',
    tasks: [
      {title: 'Deploy with Intune', desc: 'Or Jamf Pro and Group Policy', to: '/browser-extension/deploy/microsoft-intune'},
      {title: 'Choose what to monitor', desc: 'All domains or work domains only', to: '/browser-extension/configure/extension-settings'},
      {title: 'Write a browser control', desc: 'Monitor or act when a use case happens', to: '/browser-extension/policy-engine/browser-controls'},
      {title: 'Handle action requests', desc: 'Approve or reject user justifications', to: '/console/govern/action-requests'},
    ],
  },
  {
    id: 'endpoint',
    slug: 'endpoint-agent',
    name: 'Endpoint Agent',
    navLabel: 'Endpoint',
    icon: 'Laptop',
    sub: 'Desktop AI, coding agents and local models',
    tagline:
      'See and govern AI on company devices: desktop chat apps, coding agents, local models and the MCP servers they run.',
    shot: '/img/products/endpoint-agent.jpg',
    shotCaption: 'Console › Govern › Policy Engine › Endpoint Agent',
    primary: {label: 'Requirements', to: '/endpoint-agent/get-started/requirements'},
    consolePath: 'Settings > Endpoint Agent',
    tasks: [
      {title: 'Check requirements', desc: 'Operating systems, network and permissions', to: '/endpoint-agent/get-started/requirements'},
      {title: 'Roll out the agent', desc: 'Deploy and watch coverage', to: '/endpoint-agent/deploy-and-operate/deployment-and-status'},
      {title: 'Set app policies', desc: 'Per-app monitoring and guardrails', to: '/endpoint-agent/policy-engine/overview'},
      {title: 'Turn the agent off fast', desc: 'Per device or tenant-wide', to: '/endpoint-agent/deploy-and-operate/agent-kill-switch'},
    ],
  },
  {
    id: 'integ',
    slug: 'integrations',
    name: 'Integrations',
    icon: 'Plug',
    sub: 'Connect the platforms you already run',
    tagline:
      'Pull AI usage from SaaS and agent platforms into QuilrAI, and send findings and audit events to your SIEM.',
    shot: '/img/products/integrations.jpg',
    shotCaption: 'Console › Settings › Integrations',
    primary: {label: 'How integrations work', to: '/integrations/get-started/how-integrations-work'},
    consolePath: 'Settings > Integrations',
    tasks: [
      {title: 'Browse integrations', desc: 'Installed and library, by capability', to: '/integrations/get-started/how-integrations-work'},
      {title: 'Monitor Claude.ai', desc: 'Anthropic Compliance API', to: '/integrations/pull-ai-usage-and-inventory/claude-compliance-api'},
      {title: 'Forward to syslog', desc: 'Findings and audit events', to: '/integrations/send-logs-and-alerts/syslog'},
      {title: 'Send webhooks', desc: 'Push events to your own endpoint', to: '/integrations/send-logs-and-alerts/webhook'},
    ],
  },
];

export const productById = Object.fromEntries(products.map((p) => [p.id, p]));
export const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

/** The product a route belongs to, or null (homepage, playground, ...). */
export function productForPath(pathname) {
  const first = (pathname || '/').split('/').filter(Boolean)[0];
  // Legacy V1 category index pages keep their old /console-v1/* slugs.
  if (first === 'console-v1') return productBySlug.console;
  return productBySlug[first] || null;
}

// Sidebar items that point into another product. Injected by the
// sidebarItemsGenerator in docusaurus.config.js.
//   in:      category folder (relative to docs/) the links are added to
//   at:      'start' or 'end' of that category
//   after:   for a synthetic category: the folder it is placed after
export const crossLinks = [
  {in: 'console/settings-ai-gateway', at: 'start', links: [
    {label: 'Workflow Agents', href: '/workflow-agents', product: 'agents'},
    {label: 'LLM Gateway settings', href: '/llm-gateway', product: 'llm'},
    {label: 'MCP Gateway settings', href: '/mcp-gateway', product: 'mcp'},
    {label: 'Models', href: '/llm-gateway/apps-and-providers/providers-and-models', product: 'llm'},
  ]},
  {in: 'console/settings-sensors', at: 'start', links: [
    {label: 'Endpoint Agent settings', href: '/endpoint-agent/configure/agent-settings', product: 'endpoint'},
    {label: 'Browser Extension settings', href: '/browser-extension/configure/extension-settings', product: 'browser'},
    {label: 'Integrations', href: '/integrations', product: 'integ'},
  ]},
  {in: 'browser-extension/configure', at: 'end', links: [
    {label: 'Action requests', href: '/console/govern/action-requests', product: 'console'},
    {label: 'User Interaction Hub', href: '/console/settings-sensors/user-interaction-hub', product: 'console'},
  ]},
];

export const syntheticCategories = [
  {root: 'console', after: 'console/govern', label: 'Assessments', icon: 'Target', links: [
    {label: 'Red Teaming', href: '/assessments/red-teaming/get-started/overview', product: 'red'},
    {label: 'Drift & Bias', href: '/assessments/drift-and-bias/get-started/overview', product: 'red'},
  ]},
  {root: 'integrations', after: null, label: 'Sign-in', icon: 'KeyRound', links: [
    {label: 'SAML and Okta', href: '/console/settings-organization/single-sign-on', product: 'console'},
  ]},
];
