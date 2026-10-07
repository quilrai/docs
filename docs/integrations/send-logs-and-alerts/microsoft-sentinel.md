---
sidebar_position: 4
sidebar_label: "Microsoft Sentinel"
description: "The Microsoft Sentinel card stores configuration only; what it asks for and how to get events into a SIEM today."
sidebar_custom_props:
  icon: ShieldCheck
---

# Microsoft Sentinel

The Microsoft Sentinel card is meant to send Quilr activity and findings into a Sentinel security workspace, so your SOC can investigate AI risk alongside other security events.

- **Capabilities:** Send logs, Alerts & notifications
- **Direction:** From Quilr
- **Category:** Observability

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library', 'Microsoft Sentinel']} />

:::warning Configuration only
The card does not deliver events to Sentinel yet. Its drawer reads: "Installing it records management state; provider authentication and data transfer begin only when the corresponding connector supports activation." It asks for no workspace ID, credentials or Azure permissions, so it cannot authenticate to your workspace. Contact your QuilrAI representative before you plan around it.

To get QuilrAI events into a SIEM today, use [Webhook](./webhook) or [Syslog](./syslog) forwarding from Console V1, or export data from [Export Center](../../console/settings-data/export-center).
:::

## Set it up

Click **Install** on the **Microsoft Sentinel** card. Setup has three steps: **Connection**, **Data access**, and **Review**.

### Connection

| Field | Description |
|-------|-------------|
| **Integration name** | A tenant-visible name for this installation. |
| **Sentinel workspace label** | A friendly label for the workspace. |
| **Workspace region** | The event delivery region. |

### Data access

Choose the capabilities (data flows) to enable for this installation:

| Capability | Use |
|------------|-----|
| **Send logs** | Primary use for this integration. |
| **Alerts & notifications** | Additional supported use. |

### Review

Check the settings and save. The configuration is encrypted and stored for your tenant.

To change the settings later, click **Configure** on the installed card. **Uninstall** removes it.

## Related

- [How integrations work](../get-started/how-integrations-work)
- [Webhook](./webhook) and [Syslog](./syslog) for other ways to send events out
