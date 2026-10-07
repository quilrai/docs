// "QuilrAI for Open Source" on the homepage. One card per project.
export const openSourceProjects = [
  {
    name: 'AgentGuard',
    tagline: 'Local guardrails and token saving for coding agents.',
    desc: 'A desktop app that hooks into your coding agents on your machine. It blocks secrets and PII from leaving in prompts and tool calls, stops installs of compromised or vulnerable packages, and compresses file reads and shell output to cut token spend. No proxy, no cloud relay.',
    features: ['Sensitive data guard', 'Dependency guard', 'Token Saver', 'Local logs and analytics'],
    works: ['Claude Code', 'Codex CLI', 'Cursor'],
    platforms: 'macOS (Apple silicon), Ubuntu x86_64',
    stack: 'Rust, Tauri',
    site: 'https://agentguard.quilrai.dev/',
    repo: 'https://github.com/quilrai/agentguard',
  },
];
