---
sidebar_position: 4
sidebar_label: "Allowed agents"
sidebar_custom_props:
  icon: Bot
description: "Match AI clients by user-agent keyword, choose which MCP servers each agent can use, and add custom agents."
---

# Allowed Agents

Choose which MCP servers the gateway serves to each AI client, such as Claude, Cursor or ChatGPT.

Go to **Settings > AI Gateway > MCP Gateway** and click **Allowed Agents** in the header. The drawer reads: "Agents are matched by their User-Agent keyword. Open an agent to choose exactly which MCP servers the gateway serves to that client."

![Allowed Agents drawer listing OpenAI / ChatGPT, Claude, Cursor, Gemini and other agents, each with its User-Agent keyword and N of N servers](/img/mcp-gateway/ui/allowed-agents.png)

## How matching works

Every AI client sends a User-Agent header. When the header contains an agent's keyword, the gateway treats the request as coming from that agent and serves only the servers turned on for it. Matching ignores case.

Each row shows the agent name, its **User-Agent** keyword and how many servers it can reach, for example **12 of 40 servers**.

## Built-in agents

| Agent | User-Agent keyword |
|-------|--------------------|
| OpenAI / ChatGPT | `openai` (also matches `chatgpt`) |
| Claude | `claude` |
| Cursor | `cursor` |
| Gemini | `gemini` |
| OpenAI Codex | `codex` |
| VS Code IDE | `vscode` (also matches `visual studio code`) |
| Cortex Code | `cortex-code` (also matches `cortex code`) |
| OpenCode | `opencode` |
| Windsurf | `windsurf` |
| Kiro | `kiro` |
| Amazon Q | `amazonq` (also matches `amazon q`, `amazon-q`, `q-cli`) |
| Postman | `postman` |
| n8n | `n8n` |

New servers allow every built-in agent until you disable an agent for the server.

## Choose servers for an agent

1. Click the agent's row to expand it.
2. Turn the switch next to each server on or off.

Each switch saves immediately. Turning a server off for an agent also removes that agent from the server's **Allowed agents** list in [Access control](../protect/server-access), and vice versa. Both places edit the same setting.

## Add a custom agent

Use a custom agent for any client that is not built in, such as an internal bot.

1. Click **Add agent**.
2. Enter an **Agent name**.
3. Enter a **User-Agent keyword**. Requests whose User-Agent contains this keyword match the agent.
4. Click **Allow agent**.

Custom agents show a **Custom** tag. To remove one, click its delete icon and confirm **Delete agent**. The gateway stops matching that keyword and the agent's server selections are removed with it.

Custom agents also appear when you create an [API token](./api-tokens) or set **Allowed agents** on a server.

## Related

- [Access control](../protect/server-access) - allow or deny smart groups and users on one server.
- [API Tokens](./api-tokens) - issue a direct-connection token for an agent.
- [OneMCP](../get-started/onemcp) - one endpoint for every server an agent can reach.
