---
sidebar_position: 1
sidebar_label: "Gateway-connected"
sidebar_custom_props:
  icon: Network
description: "Red team an application or agent that is already protected behind the Quilr LLM Gateway."
aliases: [gateway app, gateway-connected, llm gateway]
---

# Red team a gateway-connected app

Test an application or agent that is already protected behind the Quilr LLM Gateway, including the MCP and native tools it uses.

## When to use this mode

Use this mode when the application or agent is already onboarded to the Quilr LLM Gateway. Attacks travel through the gateway using the application's own key and policies, so you test the application exactly as it runs in production, with its gateway protections in place. You do not need to configure an endpoint or credentials.

## Before you begin

- The application or agent is onboarded to the Quilr LLM Gateway.
- You have approval from the owning development team to test it. See [Requirements and permissions](../get-started/requirements.md).
- Optional but recommended: get the application's system prompt and the list of tools it can call from its development team.

## Start a gateway-connected assessment

On the **New assessment** page, select **Gateway-connected**, then select **Start**.

![The New assessment page with five mode cards. The Gateway-connected card is highlighted.](/img/red-teaming/gateway/1-select-mode.png)

*Figure 1. Select **Gateway-connected** on the New assessment page.*

The assessment setup opens. It has five steps: **Target**, **Coverage**, **Custom Attacks**, **Schedule**, and **Review**.

## Step 1: Target

Tell Quilr which gateway application to attack, and give the Red Team Agent context about it.

1. In **Assessment name**, enter a name that identifies the test, such as `Support Bot`.
2. In **Gateway application**, select the application from the list. These are the applications already registered on your Quilr LLM Gateway.
3. Select the provider and model the application uses.
4. Optional: in **System prompt**, paste the application's system prompt: its role, rules, and boundaries.
5. Optional: under **Tools**, add the tools the application can call:
   - **MCP Gateway**: select **Sync with MCP Gateway** to load the servers registered in your workspace, then choose which ones this target can call.
   - **Other MCP servers**: add MCP servers the application uses that are not on the MCP Gateway.
   - **Native tools**: add tools built into the application itself.
6. Select **Continue**.

![The Target step showing the Assessment name field, the Gateway application list, the optional System prompt box, and the Tools section with MCP Gateway, Other MCP servers, and Native tools tabs.](/img/red-teaming/gateway/2-target.png)

*Figure 2. The Target step. The system prompt and tools are optional.*

:::tip

The system prompt and tools are optional, but recommended. The more context you give, the more the attacks are curated to your application. With a tool list, the Red Team Agent also tries to make the application misuse those tools.

:::

The connection is configured here, then checked again by the server when the assessment starts.

## Step 2: Coverage

Choose how much of the attack library to run.

| Option | What runs | Use when |
| --- | --- | --- |
| Full library | All 73 objectives: the full OWASP LLM Top 10 and agentic-threat catalog, plus tool-targeted objectives generated live for this application. | You want the most complete assessment. |
| Quick scan | About 8 core objectives. | You want a fast first check. |
| Custom selection | Only the objectives you pick from the library. | You want to focus on specific risks. |

The library covers the main ways AI systems are attacked: prompt injection, both typed directly and hidden in content the target reads; jailbreaks that bypass safety training; system prompt leakage; sensitive data disclosure; tool misuse and privilege escalation; data exfiltration; unsafe output that downstream systems might run; harmful content; misinformation; and runaway token or cost consumption. Quilr maintains the library and adds new techniques as they are published.

Expand **Attack library** to see which objectives will run. Then select **Continue**.

![The Coverage step with three options: Full library with 73 objectives, Quick scan with about 8 core objectives, and Custom selection.](/img/red-teaming/gateway/3-coverage.png)

*Figure 3. The Coverage step.*

## Step 3: Custom Attacks

This step is optional. Add your own objectives for this application, such as business rules it must never break. Custom objectives run alongside the coverage you chose.

- Select **Add custom objective** to write a new objective now.
- Select **Add from library** to reuse an objective you saved earlier in the attack library.

Write each objective as one clear goal the attack should reach. The clearer the goal, the easier it is to tell whether the attack worked. Save objectives you want to reuse, so other assessments can add them from the library.

Select **Continue** when you are done, or to skip this step.

![The Custom Attacks step with Add custom objective and Add from library buttons.](/img/red-teaming/gateway/4-custom-attacks.png)

*Figure 4. The Custom Attacks step.*

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

Gateway-connected assessments cannot be scheduled yet, so they run once. The other schedule options are shown but not available for this mode.

:::

Select **Continue**.

![The Schedule step with Run once selected. Daily, Weekly, Monthly, On policy change, and Custom (cron) are shown but unavailable.](/img/red-teaming/gateway/5-schedule.png)

*Figure 5. The Schedule step.*

## Step 5: Review and launch

1. Check the summary: **Target**, **Coverage**, **Schedule**, and **Connection**. The connection should show **Configured**.
2. In **Authorized scope**, record what is approved: the target, a ticket or reference number, and the testing boundary.
3. Select **I authorize this assessment**. Transcripts are pattern-redacted and may be processed by the managed evaluation engine, so use only approved targets.
4. Select **Launch assessment**.

![The Review step showing the summary of target, coverage, schedule, and connection, the Authorized scope box, the authorization checkbox, and the Launch assessment button.](/img/red-teaming/gateway/6-review.png)

*Figure 6. The Review step.*

**Result:** The assessment runs against the authorized target only. You can leave the page and come back while it runs.

## Next steps

- Review the results in [Run details](../results-and-reports/run-details.md) and the [Full report](../results-and-reports/full-report.md) when the assessment finishes.
