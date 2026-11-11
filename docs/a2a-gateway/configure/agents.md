---
sidebar_position: 1
sidebar_label: "Agents"
sidebar_custom_props:
  icon: Bot
description: "Register and manage the agents behind the A2A Gateway: card URL, uploaded card or wrapped platform agents, outbound auth, card changes, skills, testing and agent settings."
console_path: [/settings/a2a-gateway/agents, /settings/a2a-gateway/agents/new]
aliases: [a2a agents, add a2a agent, agent card, wrapped agent, agentcore, vertex agent engine, azure ai foundry agent, card drift, test a2a agent]
---

# Agents

Updated on 11 November 2026.

An agent is a target that callers reach through the gateway. Go to **Settings > AI Gateway > A2A Gateway**. The **Agents** tab shows totals for the period and one card per agent.

![Agents tab totals: agent calls, agents, callers, card trust and calls stopped by guardrails](/img/a2a-gateway/agents-overview.png)

Each agent card shows its gateway URL, A2A version, bindings, outbound auth, pinned card version and traffic. Use **Inspect** to open its logs or card versions, and **Configure** to jump to a section of the agent page. The switch turns the agent on or off for every caller.

![Agent card for Order Support Agent with its gateway URL, badges, traffic and the Inspect and Configure buttons](/img/a2a-gateway/agent-list-card.png)

## Add an agent

Click **Add agent**. The wizard has four steps: **Source**, **Connection & auth**, **Review card** and **Access & defaults**. The [Quick start](../get-started/quick-start) walks through it.

| Source | Use it when |
|---|---|
| **Agent card URL** | The agent publishes an A2A agent card. The gateway reads the card and keeps checking it for changes. If the card URL itself needs a credential, set it under **Card fetch credentials**; it is used only to read the card. |
| **Upload card** | The agent does not publish a card. Paste or upload the card JSON and enter the endpoint the agent serves. |
| **Wrapped (non-A2A) agent** | The agent does not speak A2A. See [Wrapped agents](#wrapped-agents). |

### Outbound auth

**How the gateway authenticates to the agent** sets the credential the gateway adds to every call. The caller's key is never forwarded. Secrets are write-only: once saved, they are never shown again.

![Outbound auth options: No authentication, Bearer token, API key header, OAuth 2.0 client credentials, AWS Signature Version 4, Mutual TLS and On-behalf-of token exchange](/img/a2a-gateway/add-agent-auth.jpg)

| Option | Use for |
|---|---|
| **No authentication** | Agents with no auth |
| **Bearer token** | A static token sent in `Authorization` |
| **API key header** | A static key in a header you name |
| **OAuth 2.0 client credentials** | A token from your identity provider, cached until shortly before it expires |
| **AWS Signature Version 4** | Agents behind AWS IAM |
| **Mutual TLS (client certificate)** | Agents that require a client certificate |
| **On-behalf-of token exchange** | Agents that must act as the end user. Needs a caller that sends an [end-user token](./callers#end-user-token). |

There is also an option that forwards the caller's verified end-user token as is. It is not recommended; use token exchange instead.

### Access & defaults

| Setting | What it does |
|---|---|
| **Slug** | Part of every gateway URL for this agent. Lowercase letters, digits and hyphens. |
| **Skill-routed** | The gateway checks the skill on every message. Needed to grant callers individual skills. |
| **When the agent publishes a new card** | What happens when the card changes. See [Card changes](#card-changes). |
| **Card signature** | **Use the tenant default** (your organization's setting), **Require a verified signature** or **Accept unsigned cards**. |
| **Public card** | Anyone can read a minimal card with the agent's name and the skills you mark public. Calls still need a caller key. |
| **Grant to callers** | Grants existing callers the skills kept on the review step. You can also do this later from each caller. |

## The agent page

Click an agent's name to open its page. The links under the title jump to each section.

- **Endpoints:** the agent's gateway URL (for both JSON-RPC and HTTP+JSON), its agent card URL, and a `curl` example you can copy. On a skill-routed agent, the example includes the skill.
- **Card versions:** the pinned card and any versions waiting for review.
- **Skills:** the pinned card's skills (disabled ones are marked), the agent's own interfaces and the signature check.
- **Callers with access:** every caller with a grant on this agent. **Manage callers** opens the callers list.
- **Test:** run a call as a chosen caller. See [Test an agent](#test-an-agent).
- **Settings:** everything from the wizard, plus timeout, hop depth, limits and re-entry. See [Agent settings](#agent-settings).
- **Audit log:** who changed what on this agent.

The **...** menu has **Refresh card** (check the card now) and **Delete agent**.

## Card changes

Callers always get the card version you approved, called the pinned card. The gateway never fetches a card while handling a call.

The gateway checks each card-URL agent's card every 15 minutes. When the card changes, the new version waits under **Card versions** with a summary of what changed, for example "1 skill added". Click **Approve** to pin it or **Reject** to keep the current one.

![Card versions section with the pinned v1.0.0 card, its skills, interfaces and the Trust panel](/img/a2a-gateway/agent-card-versions.jpg)

Choose what happens while a change waits with **When the agent publishes a new card**:

| Option | Effect |
|---|---|
| **Keep serving the pinned card and ask for review** (default) | Callers keep the approved card until you approve the change. |
| **Block the agent until the change is reviewed** | Calls to this agent are refused while a card change waits. |
| **Approve minor changes automatically** | Wording changes and removed skills are approved. New skills, security and endpoint changes wait for review. |

A new skill is never callable until you approve the version that adds it. Callers with **All current and future skills** then get it; callers granted a list of skills do not.

If the gateway cannot read an agent's card, the agent stays usable on its pinned card, and the Agents tab lists it under **Needs attention**.

## Test an agent

Use **Test this agent** to check a caller's access before you share an agent.

1. Pick a mode:
   - **Simulate** checks access, limits and data protection. The agent is not contacted and nothing is logged.
   - **Send a real message** calls the agent for real, so it can have side effects such as payments or tickets. It needs a separate permission and is logged as an admin test.
2. Choose the caller under **As caller**, the **Skill**, and type a **Message**.
3. Click **Run simulation** (or send the message).

The result shows each check: caller, grant, method, skill, the agent endpoint the gateway would use, limits and data protection. **View raw** shows the full response.

![Test this agent with Simulate selected, the support-portal caller, and an ALLOW result listing each check](/img/a2a-gateway/agent-test.png)

## Agent settings

| Setting | What it does |
|---|---|
| **Timeout (seconds)** | How long the gateway waits for the agent, 1 to 600 seconds. Default 60. |
| **Max hop depth** | The deepest delegation chain allowed into this agent. Blank uses your organization's default. |
| **Requests per minute**, **Max concurrent calls** | Limits across all callers of this agent. Blank means no limit. |
| **Allow re-entry** | Lets a chain call this agent again even if it is already in the chain. Off by default, which stops loops. |
| **Public skills** | The skills shown on the public card, when **Public card** is on. |

Skills you untick on the **Review card** step are disabled: hidden from every caller and refused.

## Wrapped agents

A wrapped agent is one that does not speak A2A. The gateway acts as the A2A server for it: callers see a normal A2A agent, and the gateway calls the platform for them.

1. In **Add agent**, choose **Wrapped (non-A2A) agent** and pick the **Platform**.
2. Fill in the **Connection** fields. The wizard lists what you need and the minimum permissions for the platform you picked.
3. Under **Agent card**, enter the name, description and skills callers will see.
4. Finish the wizard as for any agent.

![Wrapped agent source with Amazon Bedrock AgentCore selected, showing what you need and the minimum permissions](/img/a2a-gateway/wrapped-agent.png)

| Platform | What you need | Minimum permissions |
|---|---|---|
| **Amazon Bedrock AgentCore** | The agent runtime ARN (and the endpoint name if not `DEFAULT`). AWS access keys, or the gateway's own AWS identity; optionally a role to assume and its external ID. | `bedrock-agentcore:InvokeAgentRuntime` on the runtime ARN and its endpoints. `bedrock-agentcore:StopRuntimeSession`, so callers can cancel a task. `sts:AssumeRole` on the role, when you set one. |
| **Vertex AI Agent Engine** | Project ID, location and reasoning engine ID; whether it is an ADK agent or a custom agent; a service account key (JSON). | Vertex AI User (`roles/aiplatform.user`) for the service account on the project. |
| **Azure AI Foundry agent** | The project endpoint and the agent ID; an Entra app registration (tenant ID, client ID and a client secret). | Azure AI User on the Foundry project (or resource) for the app's service principal. |
| **HTTP or OpenAI-style endpoint** | The URL and the credential it expects (set under outbound auth). | Whatever the endpoint requires of that credential. |

The HTTP option has three presets:

| Preset | How it works |
|---|---|
| **OpenAI Responses** | Sends an OpenAI Responses request. Conversations continue with `previous_response_id`. Use the `/v1/responses` URL. |
| **OpenAI Chat Completions** | Sends an OpenAI Chat Completions request and resends the conversation history (last 40 messages). Use the `/v1/chat/completions` URL. |
| **Plain JSON POST** | Sends your request template and reads the answer from the response text path. One message in, one answer out; no streaming. |

Good to know:

- Wrapped agents are always skill-routed. A caller granted one skill can leave the skill out; the gateway fills it in.
- Each skill can use its own platform settings.
- Wrapped agents accept text and data parts. File parts are refused.
- Streaming works on AgentCore, Vertex AI, Azure AI Foundry and the two OpenAI presets. Cancel works on Azure AI Foundry, and on AgentCore as best effort.
