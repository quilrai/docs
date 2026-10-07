---
sidebar_position: 2
sidebar_label: "Allowed domains and patterns"
sidebar_custom_props:
  icon: Globe
---

# Allowed domains and patterns

Use the allowlist to exclude trusted sites, such as internal tools, from Browser Extension monitoring. It lives on the **Whitelist Domain & Pattern** tab of the Browser Extension settings.

<ConsolePath console="QuilrAI console" path={['Settings', 'Browser Extension', 'Whitelist Domain & Pattern']} />

## Add a domain or pattern

1. Open the **Whitelist Domain & Pattern** tab.
2. Select **Add domain or pattern**.
3. Enter the **Domain or pattern** and, optionally, a **Description** that explains why the site is trusted (for example, the owning team or the approval reference).
4. Save.

The table lists every entry with its **Domain or pattern** and **Description**, plus row actions to change or remove it. The header shows the entry count and who last updated the list. Use **Search whitelist** to find an entry.

## Good practice

- Keep the list short. Each entry is a site the extension stops watching, so prompts and uploads there are not inspected.
- Do not allowlist public AI applications to silence noisy findings. Tune the [browser control](./browser-controls) or the [detection model](../../console/govern/detection-models) instead.
- Record the reason in **Description** so reviewers can tell later whether the entry is still needed.
- Review the list on a regular schedule and remove entries that are no longer required.

## Related

- [Extension settings](./extension-settings): **Domains to monitor** decides whether the extension watches all domains or only work domains.
- [General and domains](../../console/settings-organization/general-and-domains): your organization's domains.
