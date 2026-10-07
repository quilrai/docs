---
sidebar_position: 3
sidebar_label: "Agentic red teaming"
sidebar_custom_props:
  icon: Target
---

# Agentic Red Teaming

Run adaptive, multi-turn attacks against your live AI agent, including the tools it can call, and turn what breaks into actionable findings.

## The Red Teaming page

Open **Assessments → Red Teaming**. The page has four tabs:

| Tab | What it tests | Docs |
|-----|---------------|------|
| **LLM Intelligence Assessment** | Fixed adversarial and benchmark suites against a gateway app's model | [LLM Intelligence Assessment](./llm-intelligence-assessment) |
| **MCP Threat Detection** | Supply-chain scan of an MCP server (repository, dependencies, live tool surface) | [MCP Threat Detection](./mcp-threat-detection) |
| **Agentic Red Teaming** | Adaptive attacks against a live agent over HTTP or voice | This page |
| **Model Red Teaming** | The same adaptive engine pointed directly at one model, or 2-8 models side by side | [Model Red Teaming](./model-red-teaming) |

Agentic and Model Red Teaming share one sub-navigation: **New assessment**, **Runs**, **Findings**, and **Schedules**. Runs, findings, and schedules are shared between both tabs.

![Red Teaming page on the Agentic Red Teaming tab, showing the New assessment form with the Connect step and the Assessment Plan rail](/img/red-teaming/agentic-new-assessment-overview.png)

## How an assessment works

<StepFlow
  steps={[
    { label: '01 Connect', items: ['HTTP endpoint or voice agent', 'Test connection'] },
    { label: '02 Challenge', items: ['Quick scan, full library, or selected attacks', 'Optional custom objectives'] },
    { label: '03 Launch', items: ['Authorized scope', 'Depth + evaluation policy'] },
    { label: 'Engine runs', items: ['Benign recon', 'Tool-targeted objectives synthesized', 'Multi-turn attacks'] },
    { label: 'Report', items: ['Grade + findings', 'Remediation + verify'] },
  ]}
/>

The new-assessment page is one form with three steps. A sticky right rail helps you track it:

- **Assessment Plan** - a Target / Objectives / Review checklist (for example "1/3 ready"), a one-line summary such as "HTTP agent · Standard · 8 selected objectives", the connection status, and a **Go to target** button.
- **Smart Assist** - an assistant with quick prompts such as "Help me connect my agent" and "Choose the right attack coverage". Keep keys and credentials out of the chat.

## 01 Connect your agent

Give the assessment a **Name** (for example "Support Bot"), then choose **How do you reach this agent?**:

| Option | Use it when |
|--------|-------------|
| **HTTP endpoint** (default) | The agent answers over an HTTPS chat API your application already calls. |
| **Voice agent** | The agent answers over a spoken channel: a realtime voice model, a hosted voice agent, or an audio endpoint. |

### HTTP endpoint

![HTTP endpoint fields: Endpoint URL, Reply path, Session-id path, Tool-calls path, Timeout, Request body template, Custom headers, the replay-safe checkbox, and Test connection](/img/red-teaming/agentic-connect-http-endpoint.png)

| Field | Default | Notes |
|-------|---------|-------|
| **Endpoint URL** | placeholder `https://api.example.com/chat` | Your agent's HTTPS chat API. Put authentication in custom headers, not the URL. |
| **Reply path** | `reply` | Dotted path to the assistant reply in the JSON response. |
| **Session-id path** | `session_id` | Where the response returns a session id to reuse on the next turn. |
| **Tool-calls path** | `actions` | Where the response lists the tool calls the agent made, so tool abuse can be analyzed. |
| **Timeout (s)** | placeholder `240` | Per-request timeout. |
| **Request body template** | `{"message": "{{message}}", "session_id": "{{session_id}}"}` | `{{message}}` is the next attacker turn. `{{session_id}}` is a stable id per conversation. |
| **Custom headers (optional)** | One `Authorization` row | Use **+ Add header** for more. |
| **Confirmation replay is safe for this HTTP endpoint** | Off | Enable only when repeating a successful request cannot cause a harmful or duplicate side effect. Confirmation runs stay off otherwise. |

Click **Test connection** before you launch. It sends one benign message and validates the response mapping.

#### Example mapping

If your agent is called like this:

```http
POST https://agent.example.com/chat
Content-Type: application/json
Authorization: Bearer <your-key>

{ "message": "What is my balance?", "session_id": "rt-abc123" }
```

and replies:

```json
{
  "reply": "Your balance is $420.00.",
  "session_id": "rt-abc123",
  "actions": [ { "name": "get_balance", "arguments": { "account": "self" } } ]
}
```

then the defaults already match: Reply path `reply`, Session-id path `session_id`, Tool-calls path `actions`, and the default body template. Add `Authorization: Bearer <your-key>` as a custom header.

:::tip
Returning the session id keeps multi-turn attacks coherent. Exposing tool calls lets the engine detect when the agent was induced to invoke a tool.
:::

### Voice agent

![Voice agent selected with the Audio HTTP endpoint transport, Audio endpoint URL, Reply audio path, Attacker voice, and the replay-safe checkbox](/img/red-teaming/agentic-connect-voice-agent.png)

Pick a **Voice transport**:

| Transport | What it is | Fields |
|-----------|------------|--------|
| **Realtime voice model** (default) | A speech-to-speech model over WebSocket (OpenAI Realtime or Azure). Runs your instructions and tools. | Realtime model id (`gpt-realtime`), API key, Realtime endpoint URL (optional override, `wss://` or `https://`), Agent voice (optional) |
| **ElevenLabs agent** | An ElevenLabs Conversational AI agent, addressed by its agent id. | Agent id, API key (only private agents need one; it is used to obtain a signed URL) |
| **Audio HTTP endpoint** | Your own HTTPS endpoint that accepts spoken audio and returns spoken audio. | Audio endpoint URL, Reply audio path (default `audio_base64`) |

For the audio HTTP endpoint, the engine sends each spoken turn as a WAV file in a multipart field named `audio` and reads the base64 reply audio from the **Reply audio path** in your JSON response.

All transports also have:

- **Attacker voice** (default `verse`) - the voice the assessment speaks its probes with.
- **Replay-safe checkbox** - leave it unchecked if the agent takes real actions; confirmation replays are then skipped.
- **Test connection**.

:::note
Voice assessments need speech-to-text and text-to-speech enabled for the assessment engine. If they are not, the form shows a banner asking an administrator to turn on speech access.
:::

## 02 Define the attack coverage

![Attack coverage cards: Quick scan (~8 core objectives), Full library (64 objectives), Select attacks (pick from library), the Attack library panel, and Add custom objective](/img/red-teaming/agentic-attack-coverage.png)

| Mode | Runs | Best for |
|------|------|----------|
| **Quick scan** (default) | ~8 core objectives | A fast, representative sweep across the top risk categories |
| **Full library** | All 64 objectives | A complete baseline before release |
| **Select attacks** | The objectives you tick | Focusing on the risks that matter to this agent |

Every mode also adds **tool-targeted objectives synthesized live** for the target after recon. In the example runs in [Reading a report](../get-started/reading-a-report#agentic-and-model-red-teaming-reports), recon synthesized 6, so a quick scan ran 14 objectives (8 library + 6 synthesized).

Expand **Attack library** to see every objective grouped by OWASP category, with its MITRE ATLAS technique and severity. In Quick scan mode, objectives outside the quick scan are dimmed and tagged "full only".

![Attack library expanded in Quick scan mode, with System Prompt Extraction and Multilingual Guardrail Bypass highlighted and other rows tagged full only](/img/red-teaming/agentic-attack-library-quick-scan.png)

In **Select attacks** mode, click a row to toggle it, or use **Select all** and **Clear**.

![Select attacks mode with checkboxes on each library row and Select all and Clear buttons](/img/red-teaming/agentic-select-attacks.png)

The full list is in the [Attack Library](../operate/attack-library) reference.

### Custom objectives

Click **+ Add custom objective** to test something specific to your agent. Give it a name, a severity (default `high`), and describe what the agent should be made to do or reveal that it should not. Custom objectives are reported under a **Custom** category.

![Custom objective row with Objective name, severity set to high, and a description field](/img/red-teaming/agentic-custom-objective.png)

## 03 Set the boundaries and launch

![Launch step with Authorized assessment scope, Depth set to Standard, the expanded Shared evaluation policy, the acknowledgement checkbox, and Launch assessment](/img/red-teaming/agentic-launch-evaluation-settings.png)

| Control | Default | Notes |
|---------|---------|-------|
| **Authorized assessment scope** | Empty (required) | Record the approved target, ticket or reference, and testing boundary. |
| **Depth** | **Standard** | Standard is a focused assessment with standard attack effort. **Deep** explores more persistently and may take longer. |
| **I acknowledge managed assessment analysis** | Off (required) | Pattern-redacted transcripts may be processed by the deployment-managed evaluation engine. Use only approved targets. |

Click **Show evaluation settings** to tune the **Shared evaluation policy**:

| Setting | Default | What it does |
|---------|---------|--------------|
| **Evaluation mode** | **Hybrid** | Hybrid combines deterministic evidence and model-judge consensus. **Deterministic** uses evidence detectors without model judges. **Judge** uses model judges and the consensus threshold. |
| **Judge count** | 1 | Number of model judges. |
| **Consensus threshold** | 0.67 | Agreement required among judges. |
| **Confirmation runs** | 0 | Replays of a successful attack to confirm it. Disabled until the endpoint is marked replay-safe. |
| **Deterministic evidence override** | On | Lets strong deterministic evidence override judge disagreement. |

Click **Launch assessment**. It runs against the authorized target only, and you can leave the page and come back.

:::warning
Only test agents you own or are explicitly authorized to assess. Leave the replay-safe box unchecked for any agent that takes real actions (payments, record changes, messages).
:::

## While it runs

Open the run from **Runs** to watch it live. Select an objective to see its progress and live turn-by-turn transcript. Leaving the page does not cancel the run.

:::note
Full transcripts are visible only in this live view. The completed report shows turn-referenced evidence quotes instead of embedding transcripts.
:::

## Next steps

- [Reading a report](../get-started/reading-a-report#agentic-and-model-red-teaming-reports) - grades, findings, framework mapping, remediation, and two worked example reports.
- [Findings and Schedules](../operate/runs-findings-and-schedules) - track remediation and run the same assessment on a recurring schedule.
- [Model Red Teaming](./model-red-teaming) - test a model directly, or compare up to eight.
