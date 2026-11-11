---
sidebar_position: 2
sidebar_label: "Quick start"
sidebar_custom_props:
  icon: Rocket
description: "Put your first A2A agent behind the A2A Gateway: register the agent, create a caller with a key and a grant, send a message, and find the call in the logs."
aliases: [a2a quick start, a2a setup, register a2a agent, a2a caller key]
---

# Quick start

Updated on 11 November 2026.

This guide puts one agent behind the A2A Gateway and calls it. It takes about five minutes.

<StepFlow steps={[
  { label: 'Add the agent', items: ['Card URL', 'Review the card'] },
  { label: 'Create a caller', items: ['Copy its key'] },
  { label: 'Grant access', items: ['Agent and skills'] },
  { label: 'Call the agent', items: ['Gateway URL + key'] },
  { label: 'Check the logs', items: ['Decision, DLP, timing'] },
]} />

**Before you start:** you need an agent that speaks A2A on an HTTPS address, and either publishes an agent card or has card JSON you can upload. For an agent that does not speak A2A (Amazon Bedrock AgentCore, Vertex AI Agent Engine, Azure AI Foundry or an HTTP API), see [Wrapped agents](../configure/agents#wrapped-agents).

## 1. Add the agent

1. Go to **Settings > AI Gateway > A2A Gateway** and click **Add agent**.
2. Keep **Agent card URL** selected and paste the agent's card URL (or its base URL). Click **Next**.

   ![Add A2A agent, Source step, with Agent card URL selected and the card URL filled in](/img/a2a-gateway/add-agent-source.jpg)

3. Under **How the gateway authenticates to the agent**, pick the credential your agent expects, or **No authentication**. Click **Next**.
4. Review the card. Untick any skill you do not want callers to use. Click **Next**.

   ![Review card step showing the agent's skills, interfaces and signature status](/img/a2a-gateway/add-agent-review.jpg)

5. Check the **Slug** (it becomes part of the agent's URL). Turn on **Skill-routed** if you want to grant callers individual skills. Click **Register agent**.

   ![Access and defaults step with the Skill-routed switch, card change handling and the Register agent button](/img/a2a-gateway/add-agent-access.jpg)

The agent page opens. Its **Endpoints** box shows the gateway URLs callers use and a ready-made `curl` example.

![Agent page with its status badges, the Endpoints box and the copyable curl example](/img/a2a-gateway/agent-page.jpg)

## 2. Create a caller and copy its key

A caller is the app, agent or partner that will call your agent.

1. Open the **Callers** tab and click **Create caller**.
2. Enter a **Name**, pick a **Type**, keep **Create a first key** on, and click **Create caller**.

   ![Create caller dialog with name, type, description, owner and the Create a first key switch](/img/a2a-gateway/create-caller.jpg)

3. Copy the key and store it somewhere safe. **It is shown only once.**

   ![Copy the key dialog warning that the key is not shown again](/img/a2a-gateway/caller-key.png)

## 3. Grant the caller access

1. On the caller's page, under **Access**, choose the agent from **Add an agent**.
2. Keep **All current and future skills**, or turn it off and tick only the skills this caller needs.
3. Click **Save access**.

![Access section granting support-portal the Order status skill only](/img/a2a-gateway/caller-access.png)

Until you save a grant, the agent does not exist for this caller.

## 4. Call the agent

Send a normal A2A request to the agent's gateway URL with the caller key. Copy the URL from the agent's **Endpoints** box.

```bash
curl -X POST 'https://<gateway-host>/a2a/<tenant-handle>/<agent-slug>' \
  -H "Authorization: Bearer $QUILR_A2A_CALLER_KEY" \
  -H 'Content-Type: application/json' \
  -H 'A2A-Version: 1.0' \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "SendMessage",
    "params": {
      "message": {
        "messageId": "msg-1",
        "role": "ROLE_USER",
        "parts": [{"text": "Where is order 4411?"}]
      }
    }
  }'
```

Any A2A client works the same way: point it at the agent card URL from the **Endpoints** box and send the key as a bearer token.

:::tip Skill-routed agents
Each message names its skill in `message.metadata.skill_id`. If the caller can use exactly one skill on the agent, it can leave the skill out and the gateway fills it in.
:::

## 5. Check the logs

Open the **Logs** tab. Each call shows the caller, agent, method, skill, task state, status and latency. Calls can take a minute or two to appear.

![Logs tab listing calls from support-portal to order-support-agent, one of them blocked because the skill was not granted](/img/a2a-gateway/logs.png)

Click a row to see the decision, what data protection found, timing, the full request and response, and the delegation chain. See [Monitor A2A traffic](../monitor/logs-tasks-insights).

## Next steps

- [Agents](../configure/agents): card changes, testing, wrapped agents and agent settings.
- [Callers and keys](../configure/callers): keys, end-user tokens, source IPs and limits.
- [Gateway settings](../configure/settings): data protection actions, defaults and signing keys.
- [How it works](./a2a-gateway): endpoints, versions, streaming, push, chains and error codes.
