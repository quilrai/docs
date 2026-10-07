---
sidebar_position: 4
sidebar_label: "Microsoft Sentinel"
description: "Send Quilr activity and findings to a Microsoft Sentinel workspace: what it sends, setup fields and how to check events arrive."
sidebar_custom_props:
  icon: ShieldCheck
---

# Microsoft Sentinel

The Microsoft Sentinel integration sends Quilr activity and findings into a Sentinel security workspace, so your SOC can investigate AI risk alongside other security events.

- **Capabilities:** Send logs, Alerts & notifications
- **Direction:** From Quilr
- **Category:** Observability

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library', 'Microsoft Sentinel']} />

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

Check the settings and save. The configuration is encrypted and stored for your tenant, and the card moves to **Installed**.

## Check that it works

- The card shows **INSTALLED** on the **Installed** tab. An error badge means it needs attention; open it to see the error.
- Confirm that Quilr activity and findings arrive in the Sentinel workspace you named.
- To change the settings later, click **Configure** on the installed card. **Uninstall** removes it.

## Related

- [How integrations work](../get-started/how-integrations-work)
- [Webhook](./webhook) and [Syslog](./syslog) for other ways to send events out
