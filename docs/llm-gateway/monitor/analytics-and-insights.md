---
sidebar_position: 0
sidebar_label: "Analytics and insights"
sidebar_custom_props:
  icon: BarChart2
description: "Use LLM Gateway Insights to review model traffic, agent behavior, performance, security, attachments and users."
console_path: [/settings/llm-gateway/insights, /settings/llm-gateway/insights/overview, /settings/llm-gateway/insights/agents, /settings/llm-gateway/insights/performance, /settings/llm-gateway/insights/security, /settings/llm-gateway/insights/attachments, /settings/llm-gateway/insights/users]
aliases: [LLM analytics, LLM insights, overall analytics, model usage, agent analytics, prompt caching, performance and errors]
---

# Analytics and insights

Updated on 3 November 2026.

**LLM Gateway Insights** shows how applications use models, where time and money go, why requests fail, and what guardrails find. Open **Settings > AI Gateway > LLM Gateway**, then select **Overall analytics**.

Choose **All apps** or narrow the application scope. Select **24 hours**, **3 days**, **7 days**, **14 days**, or **30 days**; the page compares that window with the previous period of the same length. On tabs that offer **Model requests** and **Guardrail checks**, choose the traffic you want to inspect before comparing results.

## Overview

Start here to find a change worth investigating. **Worth a look** highlights signals, while the charts connect usage, caching, answer endings, model choices, failures and estimated cost.

![LLM Gateway Insights Overview with the period and application selectors above usage and investigation panels](/img/gateway-updates-2026-11/llm-insights-overview.jpg)

- **What your apps do** groups apps by their observed request patterns.
- **Prompt caching by app** helps you find traffic that benefits from provider prompt caching.
- **What changed in your apps** links configuration changes to the apps affected.
- **How answers end** distinguishes finished answers, tool calls, output-limit cutoffs and other endings.
- **Models and routing**, **Calling clients**, **Where the money goes**, and **Failed requests** show where to investigate next.

Select **Explore**, an app, or a chart entry to open its supporting details. The overview uses hashes, lengths and counts from request bodies; it does not display prompt or answer text.

## Agents & tools

Use this tab to understand runs, context growth, tool use and spend. **All agents** provides the overview; **Tools & parameters** focuses on the tools applications offer and call.

![Agents and tools showing the All agents view, investigation signals and run and spend summaries](/img/gateway-updates-2026-11/llm-insights-agents-tools.jpg)

An agent here is one application running one configuration: the same system-prompt template, or the same tool set when there is no system prompt. It is an observed grouping, not necessarily an agent registered in the console's Agents page.

Review **Your agents by spend**, **What a run costs**, **Steps against cost**, and **How runs end** to find expensive or incomplete runs. The context panels show what fills prompts, cache use by step, and where long context costs most. Tool panels compare offered tools with called tools and show timing, definition changes and what happens after tool results.

Follow a configuration or run into its details before deciding whether to change a model, prompt or tool set. Check the displayed data-through time when assessing freshness. Options shown as disabled, such as **Coding agents** when unavailable, cannot be opened.

## Performance & errors

Use this tab to separate provider time, gateway time and request failures.

![Performance and errors with Where the time goes and Why requests failed panels](/img/gateway-updates-2026-11/llm-insights-performance-errors.jpg)

**Where the time goes** compares total latency, time waiting on the provider and time added by WhiteMatter. These measurements can overlap, so the parts do not add up to the total.

Review failure causes and affected apps, then inspect streaming endings, rate limiting, output limits and reasoning tokens. **Model versions served**, **Requests by provider**, and **Same model on different deployments** help distinguish a model-wide issue from one provider connection. Select an app or failure entry for the requests behind it.

## Security

Use this tab to review what was scanned, what was found, and how findings were handled.

![Security with scan-completeness availability, result summaries, guardrail actions and application coverage](/img/gateway-updates-2026-11/llm-insights-security.jpg)

Review **Results**, **Guardrail actions**, **What was found**, and **Coverage by app** together. A monitored finding is different from a blocked or redacted request. **Found in categories you haven't turned on** helps identify findings outside your enabled protection, while **Where apps are used from** shows the observed source networks.

If **Scan completeness isn't available yet** appears, completeness is unavailable for that view. It does not mean that nothing was scanned or that every request was protected. See [Security guardrails](../protect/security-guardrails) to change the applicable controls.

## Attachments

Review files sent with model requests and the scans that ran on them.

![Attachments showing file counts and bytes, scanned requests, OCR runs and requests with files over time](/img/gateway-updates-2026-11/llm-insights-attachments.jpg)

The summary separates requests with files, file counts, attachment bytes, blocked or stripped requests, scanned requests and OCR runs. Use **File kinds**, **Detected file types**, **Scan outcomes**, **Data found in attachment text**, **Image labels**, and **Why attachments were skipped** to investigate coverage.

Select a chart or application to review related requests. Check skipped and incomplete scans as well as detections; a successful model response alone does not show that an attachment was scanned. See [Attachment scanning](../protect/attachment-scanning) for configuration and availability.

## Users

Find who uses the gateway, which applications identify their callers, and where sensitive data appears.

![Users with People and Smart groups controls, usage measures and sensitive-data views](/img/gateway-updates-2026-11/llm-insights-users.jpg)

Switch between **People** and **Smart groups**, search for a person, and compare **Requests**, **Est. cost**, **Sensitive data**, or **Redacted or blocked**. **Coverage by app** helps you assess identified usage. **Sensitive data by person** separates prompts from replies, and **People → agents → tools** connects callers with observed configurations and tools.

Identity-based views depend on the caller information supplied with requests. See [Identity and network trust](../protect/identity-and-network-trust) and [Agent monitoring](./agent-monitoring) to improve correlation.

## Read the figures in context

Costs are estimates, not a provider invoice. Agent/configuration groupings describe observed traffic, and a signal is a starting point for investigation. Read the period, scope, freshness and any unavailable-data message alongside a number.

**Overall analytics** opens Insights. To inspect individual calls directly, return to the application card and select **Logs** for **Activity > Requests**. **Interactions** groups calls into conversations and **Findings** shows guardrail detections. App settings remain under the card's **Configure** actions.

## Related

- [LLM Gateway overview](../get-started/overview) - applications, management actions and operational drawers.
- [Agent monitoring](./agent-monitoring) - correlate requests with runs, traces and workflows.
- [Token saving](../cost-and-traffic/token-saving) - content transforms and response caching.
- [Routing and failover](../cost-and-traffic/routing-and-fallbacks) - model choice and provider recovery.
