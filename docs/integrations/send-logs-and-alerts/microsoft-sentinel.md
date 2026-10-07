---
sidebar_position: 4
sidebar_label: "Microsoft Sentinel"
sidebar_custom_props:
  icon: ShieldCheck
---

# Microsoft Sentinel

The Microsoft Sentinel integration sends Quilr activity and findings into a Sentinel security workspace, so your SOC can investigate AI risk alongside other security events.

| | |
|---|---|
| **Capabilities** | Send logs, Alerts & notifications |
| **Direction** | From Quilr |
| **Category** | Observability |

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

Check the settings and save. The configuration is encrypted and stored for your tenant.

:::note
Installing records the integration's management state for your tenant. Provider authentication and data transfer begin only when the connector supports activation. Contact Quilr support to confirm delivery to your workspace.
:::

To change the settings later, click **Configure** on the installed card. **Uninstall** removes it.

## Related

- [How integrations work](../get-started/how-integrations-work)
- [Webhook](./webhook) and [Syslog](./syslog) for other ways to send events out
