---
sidebar_position: 1
sidebar_label: "General and domains"
sidebar_custom_props:
  icon: Globe
---

# General and domains

The General page holds your organization's identity and decides what happens when users browse from a browser your organization does not manage.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'General']} />

## Organization name

The organization name as reported by the browser agent. It identifies your tenant across the console.

## Domains

The corporate domains your users sign in with. Quilr uses them to tell corporate accounts from personal ones, for example a work account versus a personal account on the same AI app.

- Add every domain your users sign in with, including subsidiaries and aliases.
- Domain changes are **saved immediately**; there is no separate save step.

## Unmanaged browsers

Settings for browsers that are not managed by your organization, where the browser extension is not enforced.

| Option | What it does | When to use it |
|---|---|---|
| **Redirect to QuilrAI page** | Sends unmanaged browsers to a QuilrAI-hosted page | You do not host your own identity page |
| **HTML for custom IdP page** (**Download**) | Gives your identity team the HTML for a page you host yourself | You need corporate branding or your own identity routing |
| **Allow bypass** | Lets users continue past the page | Only when your risk acceptance explicitly allows it |

:::warning
**Allow bypass** lets users carry on in an unmanaged browser. Leave it off unless you have a documented exception.
:::

## Related

- [Single sign-on](./single-sign-on)
- [Browser extension settings](../../browser-extension/configure/extension-settings)
