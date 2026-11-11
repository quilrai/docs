---
sidebar_position: 1
sidebar_label: "Logs, tasks and insights"
sidebar_custom_props:
  icon: Activity
description: "Monitor A2A Gateway traffic: search every call in Logs, inspect the decision, data protection and delegation chain of each one, follow tasks, and see who calls whom in Insights."
console_path: [/settings/a2a-gateway/logs, /settings/a2a-gateway/tasks, /settings/a2a-gateway/insights]
aliases: [a2a logs, a2a tasks, a2a insights, a2a monitoring, agent to agent logs, delegation chain, blocked a2a calls]
---

# Logs, tasks and insights

Updated on 11 November 2026.

Every call through the A2A Gateway is logged with its decision, what data protection found, timing and the full request and response. Go to **Settings > AI Gateway > A2A Gateway** and use the **Logs**, **Tasks** and **Insights** tabs. New calls can take a minute or two to appear.

## Logs

The top row shows requests, blocked calls, errors, data protection blocks, p95 latency and the deepest hop seen for the period.

![Logs tab filters and one row per call](/img/a2a-gateway/logs.png)

Filter by **Agent**, **Caller**, **Method**, **Status** or **Task id**. **Event kind** switches between **Calls**, **Stream events**, **Push received**, **Push delivered** and **Card fetches**. A blocked row shows the error code under its status, for example `a2a_forbidden` (`-31403`) when the caller's grant does not cover the skill. The **Decision** tab gives the exact reason.

Click a row to open its details:

| Tab | Shows |
|---|---|
| **Overview** | Caller, key, agent, method, skill, protocol, task, context, user, chain and latency. A skill the gateway filled in is marked **(inferred)**. |
| **Decision** | Each check and why the call was allowed or refused. |
| **Data protection** | What was scanned in the request and the response, what was found, and the action taken. |
| **Timing** | Where the time went. |
| **Request**, **Response** | The full messages as the caller and the agent saw them. |
| **Chain** | The delegation chain this call belongs to. |
| **Raw** | The complete log entry. |

![Log detail Overview tab showing the caller, key, agent, the inferred order_status skill, task and chain](/img/a2a-gateway/log-overview.png)

![Data protection tab: a Social Security number found and flagged in the request](/img/a2a-gateway/log-data-protection.png)

With **Responses to callers** set to **Redact**, the same number is masked in the response the caller gets back.

**Copy link** copies a link to the entry. Every gateway response also carries an `X-Quilr-Request-Id` header: quote it when you contact support.

**Audit log** at the top of the page shows every configuration change: who added, changed or deleted an agent, caller, key or setting.

## Tasks

**Tasks** lists each A2A task as the gateway last observed it, from the calls, stream events and push updates it logged. Filter by **Agent**, **Caller** or **Last observed state**.

![Tasks tab listing tasks with their agent, caller, last observed state, requests, hops and last update](/img/a2a-gateway/tasks.png)

Click a task to open every log entry for it: calls, stream events and push updates.

## Insights

**Insights** shows who calls whom, why calls were stopped, what data protection did, and the deepest delegation chains.

![Insights: calls, blocked calls and errors by agent and by caller](/img/a2a-gateway/insights-calls.png)

![Insights: why calls were blocked, data protection outcomes, and the deepest delegation chains](/img/a2a-gateway/insights-blocks.png)

Click an agent or caller name to open its logs.
