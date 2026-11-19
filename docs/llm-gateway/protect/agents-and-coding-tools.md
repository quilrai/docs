---
sidebar_position: 7.5
sidebar_label: "Agents and coding tools"
sidebar_custom_props:
  icon: Bot
description: "See which agents and coding tools send LLM Gateway traffic, declare and group agents on the Agents tab, and block, cap or budget coding tools such as Claude Code and Codex with policy rules."
console_path: /policy/engine/llm-gateway/agents
aliases: [agents tab, llm gateway agents, agent groups, agent registry, declare agent, coding tools, coding agent controls, block claude code, claude code budget, subagents, client app, agent families]
---

# Agents and coding tools

Updated on 20 November 2026.

The LLM Gateway works out which agent or coding tool sent each request. The **Agents** tab lists every agent seen in the last 30 days, lets you declare the ones you know and gather them into agent groups. Policy rules then block, cap or budget coding tools and agents.

<ConsolePath
  console="QuilrAI console"
  path={['Govern', 'Policy Engine', 'LLM Gateway']}
  action="Agents"
/>

:::warning Agent identity is a label, not authentication
Every agent signal is sent by the client. A caller can send any agent id, copy another agent's id or leave the headers out. Use agents to see and govern normal traffic. Use gateway keys, [identity and network trust](./identity-and-network-trust) and [gateway access](./gateway-access-and-allowed-models) when you need to know who called.
:::

## What counts as an agent {#what-is-an-agent}

The gateway sorts what it finds into three levels:

| Level | What it is | Example key |
|---|---|---|
| **Family** | The kind of client: your own agents (`custom`), a coding tool or an agent platform. | `claude_code`, `codex`, `custom`, `copilot_studio` |
| **Agent** | One named agent within a family. | `custom/agent_7xC`, `claude_code/subagent` |
| **Run** | One run of an agent. Runs are logged, not listed. | A run id from `x-quilr-agent-run-id` |

Every agent has a **key**, `<family>/<id>`. Your own agents use `custom/<id>`, for example `custom/agent_7xC`. Characters other than letters, digits, `-`, `.` and `_` are percent-encoded in the key, which is at most 320 characters. A very long id gets a hashed key, `<family>/~h.<hash>`.

A request from a coding tool that names no agent shows as a **family row**, `<family>/~<surface>`: for example `claude_code/~cli` for Claude Code in the terminal or `claude_code/~desktop` for the desktop app. A family row is a detected client, not an agent. You cannot declare it, but you can list it in an agent group.

## How the gateway identifies agents {#how-agents-are-identified}

The gateway checks these sources in order and uses the first id it finds:

| Order | Source | Family |
|---|---|---|
| 1 | `x-quilr-agent-id` header, or `metadata.agent_id` in the request body. The header wins. Name: `x-quilr-agent-name` / `metadata.agent_name`; type: `x-quilr-agent-type`. | `custom` |
| 2 | W3C `baggage` entry `agent.id` or `gen_ai.agent.id` (name: `agent.name` or `gen_ai.agent.name`). | `custom` |
| 3 | `x-agent-id` header. | `custom` |
| 4 | LiteLLM `x-litellm-agent-id` header. | `litellm` |
| 5 | Microsoft Copilot Studio agent metadata. | `copilot_studio` |
| 6 | OpenClaw cron jobs. | `openclaw` |
| 7 | A coding tool's subagent marker: Claude Code `x-claude-code-agent-id`, Codex `x-openai-subagent`. | `claude_code/subagent`, `codex/subagent` |
| 8 | The coding tool itself, detected from its client headers (Claude Code, Codex, OpenCode, Cline, Gemini CLI and others). | Family row such as `claude_code/~cli` |

- The id `ephemeral` in the `x-quilr-agent-*` headers means "no agent": the gateway moves on to the next source.
- A declared id wins over a detected tool. An agent that sends `x-quilr-agent-id: agent_7xC` from inside Claude Code is `custom/agent_7xC`.
- Subagent instance ids change on every spawn, so all Claude Code subagents share the key `claude_code/subagent` and their instance ids are logged as runs.
- A run id comes from `x-quilr-agent-run-id`, `metadata.agent_run_id` or baggage `agent.run_id`, among others. See [Agent monitoring](../monitor/agent-monitoring) for every tracing signal the gateway logs.

## The Agents tab {#agents-tab}

The tab has four views: **All agents**, **Review**, **Agent groups** and **Families**. Use **Search name, key, owner or tag** to filter a list.

New traffic shows up within about 5 minutes, because the list is cached.

### All agents {#all-agents}

Agents seen in the last 30 days and every declared agent, most recently active first.

![All agents view listing Claude Code cli, Codex cli, declared custom agents and subagent rows with family, status, groups, people, requests and last seen](/img/llm-gateway/ui/agents-all.png)

| Column | Meaning |
|---|---|
| **Agent** | The display name and the key. |
| **Family** | Custom agent, Claude Code, Codex, Copilot Studio and so on. |
| **Status** | **observed** (seen in traffic) or **declared** (an administrator declared it). |
| **Groups** | The agent groups it is in now. |
| **People 30d** | Distinct people who sent its requests in the last 30 days. |
| **Requests 30d** | Its requests in the last 30 days. |
| **Last seen** | Its most recent request. |

Select **Open** to see an agent, or **Declare** on an observed agent.

### Review {#review}

Observed agents first seen in the last 7 days that nobody has declared. Declare them one by one with **Declare**, or all at once with **Declare all**.

![Review view with four new undeclared agents and the Declare all 4 button](/img/llm-gateway/ui/agents-review.png)

### Declare an agent {#declare-an-agent}

Declaring records what an agent is and who owns it. It does not change how its requests are handled.

1. In **All agents** or **Review**, select **Declare** (or **Open** on a declared agent).
2. Fill in the drawer:
   - **Display name**: shown instead of the name the client sends.
   - **Owner**: a label only. It never changes who a request is charged to.
   - **Description**.
   - **Tags**: comma separated. Agent group rules can match tags.
3. Select **Save**.

**Remove declaration** turns the agent back into an observed one. It stays listed while it appears in traffic.

![Agent drawer for the declared KYC Reviewer agent with key, status, groups, apps, requests, people, last seen and the display name, owner, description and tags fields](/img/llm-gateway/ui/agents-drawer-declared.png)

The drawer of a family row such as **Claude Code · cli** shows the same activity but has nothing to declare, since the client named no agent.

![Drawer of the Claude Code cli family row, a detected client that named no agent](/img/llm-gateway/ui/agents-drawer-family.png)

### Agent groups {#agent-groups}

Agent groups collect agents so that you can find and review them together. Membership is worked out on every request, so a new agent joins on its first request.

![Agent groups view with the built-in All agents, Undeclared agents and Coding tools groups and two custom groups](/img/llm-gateway/ui/agents-groups.png)

**Built-in groups** are kept up to date by the gateway and can't be edited:

| Group | Members |
|---|---|
| **All agents** | Every request that names an agent. Family rows are not members. |
| **Undeclared agents** | Agents seen in traffic that nobody has declared. |
| **Coding tools** | Detected coding tools such as Claude Code, Codex and OpenCode, including their family rows and subagents. |

![Coding tools built-in group drawer with its five current members](/img/llm-gateway/ui/agents-group-builtin.png)

To create a group, select **New agent group** and fill in:

- **Group id**: lower-case letters, digits, `-` and `_`. It can't be changed later.
- **Name** and an optional **Description**.
- **Agents in this group**: agent keys, one per line or comma separated, for example `custom/agent_7xC` or `claude_code/subagent`. Family rows such as `claude_code/~cli` may be listed.
- **Never in this group**: keys that never join, even when they match. An exclusion always wins.
- **Match rules**: add an agent automatically when it matches.

| Match rule | Matches |
|---|---|
| **Families** | A family (`claude_code`, `custom`) or a family and surface (`claude_code/desktop`). |
| **Agent names** | Name patterns such as `KYC *`. Case-insensitive; `*` and `?` are wildcards. |
| **Agent ids** | Id patterns such as `agent_*`. |
| **Apps** | Applications the agent was seen under (patterns allowed). |
| **App tags** | Tags of those applications. |
| **Agent tags** | Tags set when the agent was declared. |
| **At most this many people in 30 days** | Agents used by few people, for example personal experiments. An agent with no people figure yet never matches. |
| **Declared** | **Any**, **Declared** or **Not declared**. |

Every rule you fill in must match (AND). Within one rule, any value may match (OR). A group with no listed keys and no rules has no members.

![Small experiments group drawer: custom/support_triage under Never in this group and the custom family under Match rules](/img/llm-gateway/ui/agents-group-custom.png)

Select **Create group** (**Save** when editing). To delete a group, open it and select **Delete**, then **Delete group**.

![Delete agent group confirmation dialog](/img/llm-gateway/ui/agents-group-delete-confirm.png)

Limits: 200 groups per organization, 5,000 listed keys per group, 50 name and id patterns per group, and an agent counts in at most 64 groups.

### Families {#families}

Every family seen in the last 30 days, with its surfaces and their request counts, and the number of agents and requests per family.

![Families view: Claude Code with subagent, cli and desktop surfaces, Custom agent, Codex, Copilot Studio and OpenClaw](/img/llm-gateway/ui/agents-families.png)

### Permissions {#permissions}

Viewing the tab needs LLM Gateway read access. Declaring agents and creating or editing groups needs update access. Removing a declaration or deleting a group needs delete access.

## Control coding tools and agents {#control-coding-tools-and-agents}

Controls are policy rules. Add them in **Govern > Policy Engine > LLM Gateway > Policies > Add rule**, or write them in **Edit technical source**. Rules save as an unpublished change. **Review & publish** shows the change and its safety check, and the gateway applies a published revision within about a minute. See [Author, simulate and publish](../../console/govern/author-simulate-and-publish).

These fields carry agent identity:

| Field | Visual builder | Holds |
|---|---|---|
| `request.client.name` | **Client app** | The detected coding tool: `claude_code`, `codex`, `cline`, `gemini_cli` and so on. |
| `request.metadata.agent_id` | Code view | The declared agent id, or a Claude Code subagent id. |
| `request.metadata.agent_run_id` | Code view | The agent run id. |
| `request.metadata.conversation_id` | Code view | The conversation id. A Claude Code session id counts. |

![Client app value list in the visual rule builder: aider, claude_code, claude_desktop, cline, codex, continue, crush, gemini_cli, gemini_code_assist](/img/llm-gateway/ui/policy-client-app-values.png)

:::note Client app is not a security boundary
`request.client.name` comes from the headers the tool sends. It controls normal tool traffic, but a caller that strips those headers is not matched: the same key without Claude Code headers is allowed.
:::

In the visual builder, **Client app** conditions and **Request access** outcomes are point and click. Budget and request amounts (**Named usage quotas**) are edited in the code view.

### Block Claude Code for an app {#block-claude-code-for-an-app}

1. Select **Add rule** and give it a name, for example **Coding agents: no Claude Code on the support app**.
2. Add the condition **client app** **is any of** `claude_code`, then **application** **is any of** your app.
3. Add the outcome **Request access** → **deny**, then **Add rule**.

![New rule: client app is any of claude_code and application is any of zz-docs-support-bot, then Request access deny](/img/llm-gateway/ui/policy-rule-deny-claude-code.png)

The same rule in the technical source:

```text
policy no_claude_code_support priority 500 {
  request where
    request.client.name in ["claude_code"]
    and application.group_key in ["zz-docs-support-bot"]
  then {
    access.action = deny;
  }
}
```

A blocked request gets `403` with code `policy_access_denied` and the message "request is denied by LLM Gateway policy".

### Allow Claude Code only for one group {#claude-code-for-one-group}

Deny Claude Code to everyone outside the `engineering` smart group:

```text
policy claude_code_engineering_only priority 500 {
  request where request.client.name == "claude_code" and not arrayContains(user.smart_groups, "engineering") then { access.action = deny; }
}
```

### Give a group a Claude Code budget {#claude-code-budget}

$200 a calendar month for each person in `engineering`, for Claude Code traffic only:

```text
policy claude_code_engineering_budget priority 500 {
  request where request.client.name == "claude_code" and arrayContains(user.smart_groups, "engineering") then {
    limits.quotas = [{ id: "cc_eng_monthly", metric: spend_usd, limit: 200, group_by: ["user.email"], window: { kind: calendar, unit: month } }];
  }
}
```

- For one pool shared by the whole group, use `group_by: []`.
- Spend budgets need model prices. The safety check warns when a model has no price in **Model pricing**, and unpriced requests are blocked. See [Rate, token and budget limits](../cost-and-traffic/rate-token-and-budget-limits).

### Cap a coding tool's requests {#cap-a-coding-tools-requests}

At most 2 Codex requests a day on one app, shared by everyone:

```text
policy codex_daily_cap priority 500 {
  request where request.client.name in ["codex"] and application.group_key in ["zz-docs-support-bot"] then {
    limits.quotas = [{ id: "codex_daily", metric: requests, limit: 2, group_by: [], window: { kind: rolling, unit: day } }];
  }
}
```

Each allowed request carries `x-quilr-quota-remaining`. Once the cap is reached, the gateway answers `429` with code `quota_exceeded` ("Request limit (rolling day) reached (2 requests)...") and the headers `x-quilr-quota-blocked-by` (the quota id), `x-quilr-quota-id`, `x-quilr-quota-remaining: 0`, `x-quilr-quota-reset` and `x-ratelimit-limit`.

### More caps {#more-caps}

Use the same `limits.quotas` shape with a different condition or `group_by`:

| Cap | Condition | Quota |
|---|---|---|
| $20 per person per Claude Code session | `request.client.name == "claude_code"` | `metric: spend_usd, limit: 20, group_by: ["user.email", "request.metadata.conversation_id"], window: { kind: lifetime }` |
| Claude Code subagents only | `request.client.name == "claude_code" and request.metadata.agent_id != null` | Any metric and window |
| One declared agent | `request.metadata.agent_id == "agent_7xC"` | `group_by: ["request.metadata.agent_id"]` |

The **Budgets & Usage Limits** control also has **Each conversation**, **Each agent** and **Each agent run** budgets. See [Cap a conversation or an agent](../cost-and-traffic/budget-recipes#conversation-agent-caps).

Policy conditions name a coding tool or an agent id. They cannot name an agent group or an agent key yet.

## Manage agents with the API {#api}

The [Agents API](../api-reference/agents-api) lists agents, declares them in bulk, and creates and edits agent groups, with the `agents:write` management scope.

## Related {#related}

- [Agents API](../api-reference/agents-api)
- [Agent monitoring](../monitor/agent-monitoring)
- [Gateway access and allowed models](./gateway-access-and-allowed-models)
- [Budget recipes](../cost-and-traffic/budget-recipes)
- [Policy Engine overview](../../console/govern/policy-engine)
- [Console Agents](../../console/observe/agents) - the estate-wide agent inventory under **Observe**, separate from this tab.
