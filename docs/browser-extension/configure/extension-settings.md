---
sidebar_position: 1
sidebar_label: "Extension settings"
sidebar_custom_props:
  icon: Wrench
---

# Extension settings

Tenant-wide settings for the Browser Extension live in the console under Settings › Browser Extension. The page has two tabs: **Deployment Management** (this page) and **Whitelist Domain & Pattern** (see [Allowed domains and patterns](./allowed-domains-and-patterns)).

<ConsolePath console="QuilrAI console" path={['Settings', 'Browser Extension', 'Deployment Management']} />

These settings apply to every deployed extension in the tenant. Install the extension first (see [Prerequisites](../get-started/prerequisites)); the settings take effect on extensions that are already reporting.

## Deployment Management

| Setting | What it controls |
| --- | --- |
| **Extension on/off** | Turns the extension on or off for the tenant. The card also shows the **Authentication mode** (for example `ENFORCED`). |
| **Force Update** | Pushes the current configuration to managed browsers right away. |
| **Domains to monitor** | **All domains** monitors AI use on every domain. **Work domains only** limits monitoring to your organization's work domains. |
| **Show icon on prompt** | Shows the QuilrAI icon on AI prompt boxes. |
| **Persona creation** | How the extension links browser activity to a person. Options: **Force login** and **Allow background tabs**. |
| **Persona creation exclusions** | Conditions under which persona creation is skipped. Use **Add** to define one, then **Save**. |

:::tip
Your organization's work domains are set in Settings › Organization › General. The same page controls what happens in **unmanaged browsers**. See [General and domains](../../console/settings-organization/general-and-domains).
:::

## Check the effect

After you change a setting, open **Users › Browser deployment** to confirm extensions are still reporting and on the latest version. See [Users](../../console/observe/users). Changes to these settings are recorded in [Audit logs](../../console/settings-organization/audit-logs).

## Related

- [Allowed domains and patterns](./allowed-domains-and-patterns): exclude trusted sites from monitoring.
- [Browser controls](./browser-controls): decide what the extension does when it sees risky AI use.
- [End-user popups](../../console/settings-sensors/end-user-popups): brand and word the popups the extension shows.
