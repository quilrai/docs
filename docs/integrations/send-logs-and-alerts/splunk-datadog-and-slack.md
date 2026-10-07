---
sidebar_position: 5
sidebar_label: "Splunk, Datadog and Slack"
sidebar_custom_props:
  icon: BarChart2
description: "Install the Splunk, Datadog and Slack cards to send Quilr activity, findings and notifications out: the fields each Install drawer asks for, the capabilities you can enable, and how to check the result."
---

# Splunk, Datadog and Slack

These Library cards send Quilr data **from** Quilr to your security and operations tools.

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library']} />

## Set it up

1. On the **Library** tab, click **Install** on the card.
2. **Connection**: enter an **Integration name** (a tenant-visible name for this installation) and the card's own fields from the table below.
3. **Data access**: choose the capabilities to enable. At least one is required.
4. **Review**: check the settings and confirm. The configuration is encrypted and stored for your tenant, and the card moves to **Installed**.

## Fields and data per card

| Card | Category | Connection fields | Capabilities | Sends |
|---|---|---|---|---|
| **Splunk** | Observability | **Splunk deployment label** (for example "Security Cloud"); **Index label**, the destination index (for example `quilr_events`) | **Send logs** (primary), **Alerts & notifications** | Governed activity and findings to a Splunk security index |
| **Datadog** | Observability | **Datadog site**, the log delivery region (US1, US5, EU1); **Service label**, the service receiving Quilr events (for example `quilr-security`) | **Send logs** (primary), **Alerts & notifications** | Quilr events, and selected alerts routed to operations teams |
| **Slack** | Workflow | **Slack workspace label**; **Channel label**, the destination for notifications (for example `#ai-security-alerts`) | **Alerts & notifications** | Findings and operational notifications to a Slack channel |

The Slack card is for Quilr notifications. It is not the same as connecting Slack as an MCP tool ([Slack MCP setup](../../mcp-gateway/provider-setup/slack)) or talking to a Workflow Agent from Slack ([Workflow Agents](../../console/settings-ai-gateway/workflow-agents#connect-slack)).

## Check that it works

- The card shows **INSTALLED** on the **Installed** tab. An error badge means it needs attention; open it to see the error.
- Confirm that events arrive in the Splunk index or the Datadog service you named, or that notifications arrive in the Slack channel.
- To change the fields or capabilities later, click **Configure** on the installed card. **Uninstall** removes it.

## Related

- [How integrations work](../get-started/how-integrations-work)
- [Microsoft Sentinel](./microsoft-sentinel), [Webhook](./webhook) and [Syslog](./syslog)
