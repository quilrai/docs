---
sidebar_position: 2
sidebar_label: "Agent"
sidebar_custom_props:
  icon: Bot
description: "Red team a text or voice agent through its own HTTP, WebSocket, or voice endpoint."
aliases: [agent, chat agent, voice agent, websocket, http endpoint]
---

# Red team an agent

Test a text or voice agent through its own endpoint, including the MCP tools it can call.

## When to use this mode

Use this mode to test an agent by connecting to its endpoint directly. It works whether the agent is:

- protected behind the Quilr LLM Gateway,
- protected behind another vendor's gateway, or
- not behind any gateway.

It supports both **text agents**, reached over HTTP or WebSocket, and **voice agents**.

## Before you begin

- You have everything needed to connect to the agent programmatically: its API endpoint, authentication method, a test credential, and its request and response format. Get these from the agent's development team. See [Requirements and permissions](../get-started/requirements.md).
- You have approval to test the agent.
- Optional but recommended: get the agent's system prompt and the list of tools it can call.

## Start an agent assessment

On the **New assessment** page, select **Start** on the **Agent** card.

![The New assessment page with five mode cards. The Agent card is highlighted.](/img/red-teaming/agent/1-select-mode.png)

*Figure 1. Select **Agent** on the New assessment page.*

The **New agent assessment** setup opens. It has five steps: **Target**, **Coverage**, **Custom Attacks**, **Schedule**, and **Review**.

## Step 1: Target

1. In **Assessment name**, enter a name that identifies the test, such as `Support Bot`.
2. In **Agent URL**, enter the agent's programmatic API endpoint, starting with `https://` or `wss://`, such as `https://agent.example.com/api/chat`.
3. In **Authorized scope**, record what is approved: the target, a ticket or reference number, and the testing boundary.
4. Select **Advanced / configure manually** to set up the connection. See [Configure the connection](#configure-the-connection) below.

![The New agent assessment Target step with the Assessment name, Agent URL, and Authorized scope fields, the Detect button, and the Advanced / configure manually link.](/img/red-teaming/agent/2-target.png)

*Figure 2. The Target step for an agent.*

:::danger

Enter the URL that software uses to call the agent, not the web page people use to chat with it. For example, use `https://agent.example.com/api/chat`, not `https://agent.example.com/`. A human-facing page cannot be tested reliably.

:::

:::note

The **Detect** button *(Preview)* reads the host's API description and pages, then sends the agent a few test requests, which can include a short spoken clip. Confirm the host is approved for testing before you use it. Detect fills in the connection settings for you; review them before you continue. It saves setup time, but you still need to confirm the authentication method, the test account's permissions, and the testing scope with the development team.

:::

### Configure the connection

Choose the settings that match how your agent works. The development team can confirm each one.

1. Select the agent type:
   - **HTTP endpoint**: a text agent with an HTTPS chat API.
   - **WebSocket endpoint**: a text agent that streams over a WebSocket connection.
   - **Voice agent**: an agent that takes spoken input.
2. In **Endpoint URL**, confirm the agent's API endpoint.
3. Under **Authentication**, add the headers the agent needs, such as `Authorization` with its token value. Select **Add header** for each extra header. Use a test account whose permissions match what the development team approved.
4. Under **Request & response mapping**, check the defaults against the agent's real request and response:

   | Field | What to enter | Default |
   | --- | --- | --- |
   | Reply path | The response field that holds the agent's answer. | `reply` |
   | Session-id path | The response field that holds the conversation or session ID. | `session_id` |
   | Tool-calls path | The response field that lists the tools or actions the agent called. | `actions` |
   | Timeout (s) | How long to wait for a reply, in seconds. | `240` |
   | Request body template | The body Quilr sends. `{{message}}` is replaced with each attack, and `{{session_id}}` with the session ID. | `{"message": "{{message}}", "session_id": "{{session_id}}"}` |

5. Select **Test connection** and confirm the agent replies.

![Manual connection settings with HTTP endpoint, WebSocket endpoint, and Voice agent tabs, the Endpoint URL field, Authentication custom headers, Request and response mapping fields, and the Test connection button highlighted.](/img/red-teaming/agent/3-manual-config.png)

*Figure 3. Manual connection settings. Select **Test connection** before you continue.*

### Add context (optional)

As with gateway-connected apps, you can add the agent's system prompt and the tools it can call: MCP Gateway servers, other MCP servers, and native tools. These are optional but recommended. The more context you give, the more the attacks are curated to your agent, and a tool list lets the Red Team Agent try to make the agent misuse those tools.

Select **Continue**.

## Step 2: Coverage

Choose how much of the attack library to run.

| Option | What runs | Use when |
| --- | --- | --- |
| Full library | All 73 objectives: the full OWASP LLM Top 10 and agentic-threat catalog, plus tool-targeted objectives generated live for this agent. | You want the most complete assessment. |
| Quick scan | About 8 core objectives. | You want a fast first check. |
| Custom selection | Only the objectives you pick from the library. | You want to focus on specific risks. |

The library covers the main ways AI systems are attacked: prompt injection, both typed directly and hidden in content the target reads; jailbreaks that bypass safety training; system prompt leakage; sensitive data disclosure; tool misuse and privilege escalation; data exfiltration; unsafe output that downstream systems might run; harmful content; misinformation; and runaway token or cost consumption. Quilr maintains the library and adds new techniques as they are published.

Expand **Attack library** to see which objectives will run. Then select **Continue**.

![The Coverage step with three options: Full library with 73 objectives, Quick scan with about 8 core objectives, and Custom selection.](/img/red-teaming/gateway/3-coverage.png)

*Figure 4. The Coverage step.*

## Step 3: Custom Attacks

This step is optional. Add your own objectives for this agent, such as business rules it must never break. Custom objectives run alongside the coverage you chose.

- Select **Add custom objective** to write a new objective now.
- Select **Add from library** to reuse an objective you saved earlier in the attack library.

Write each objective as one clear goal the attack should reach. The clearer the goal, the easier it is to tell whether the attack worked. Save objectives you want to reuse, so other assessments can add them from the library.

Select **Continue** when you are done, or to skip this step.

![The Custom Attacks step with Add custom objective and Add from library buttons.](/img/red-teaming/gateway/4-custom-attacks.png)

*Figure 5. The Custom Attacks step.*

:::note

Managing saved objectives in the attack library is covered in a separate topic *(Coming soon)*.

:::

## Step 4: Schedule

Choose when the assessment runs. A recurring schedule catches regressions caused by model upgrades, prompt edits, new tools, and newly published attack techniques, so a fix that worked last month is checked again.

| Option | Runs |
| --- | --- |
| Run once | Now, with no repeats. |
| Daily | Every day at a set time. |
| Weekly | On the days you pick. |
| Monthly | One day each month. |
| Custom (cron) | On a cron expression, for advanced schedules. For example, `0 2 * * 1` runs at 02:00 every Monday. |
| On policy change *(Coming soon)* | When a gateway policy is edited. |

:::warning

Every scheduled run against a production target uses model tokens and tool quota. Use a dedicated test account so the usage is easy to attribute, and agree on the schedule with the development team.

:::

Select **Continue**.

![The Schedule step with Run once, Daily, Weekly, Monthly, On policy change, and Custom (cron) options.](/img/red-teaming/gateway/5-schedule.png)

*Figure 6. The Schedule step.*

## Step 5: Review and launch

1. Check the summary: **Target**, **Coverage**, **Schedule**, and **Connection**. The connection should show **Configured**.
2. Confirm the **Authorized scope**: the target, a ticket or reference number, and the testing boundary.
3. Select **I authorize this assessment**. Transcripts are pattern-redacted and may be processed by the managed evaluation engine, so use only approved targets.
4. Select **Launch assessment**.

![The Review step showing the summary of target, coverage, schedule, and connection, the Authorized scope box, the authorization checkbox, and the Launch assessment button.](/img/red-teaming/gateway/6-review.png)

*Figure 7. The Review step.*

**Result:** The assessment runs against the authorized target only. You can leave the page and come back while it runs.

## Next steps

- Review the results in [Run details](../results-and-reports/run-details.md) and the [Full report](../results-and-reports/full-report.md) when the assessment finishes.
