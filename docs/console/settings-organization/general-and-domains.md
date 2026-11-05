---
sidebar_position: 1
sidebar_label: "General"
description: "Set your organization's name and work domains, copy your tenant ID, turn email and password sign-in on or off with Platform MFA, and choose what happens in unmanaged browsers."
sidebar_custom_props:
  icon: Globe
console_path: /settings/organization/general
aliases: [general settings, organization, org settings, organization name, tenant ID, domains, work domains, platform mfa, email and password sign-in, one-time passcode, Email OTP, unmanaged browsers, redirect, custom IdP page, allow bypass]
---

# General

The General page holds your organization's identity: its name, tenant ID and work domains. It also turns email and password sign-in on or off, and decides what happens when someone uses a browser your organization doesn't manage.

<ConsolePath console="WhiteMatter Console" path={['Settings', 'Organization', 'General']} />

## Before you start

- To open the page, your role needs access to the **General settings** page.
- To see the settings, it needs **Read general settings**. To change them, it needs **Manage general settings**. Without it, your changes aren't saved.
- **Platform MFA** has its own permissions: **Read Platform MFA** to see it and **Manage Platform MFA** to change it. Without them, the switch shows **Unavailable** or can't be changed.

If your organization still uses V1 roles, Platform MFA follows the **Integrations** permission: **Read** to see it and **Update** to change it. See [Roles and permissions](./roles-and-permissions).

## Organization

### Organization name

The name the WhiteMatter browser agent reports for your organization.

1. Enter the name in **Organization name**.
2. Select **Save**.

To undo an unsaved edit, select **Discard**. The name can't be empty.

### Tenant ID

The unique identifier for your organization. Select the copy icon in the field to copy it, and share it with WhiteMatter support when you need help. You can't change it.

### Domains

The domains your organization uses, for example `example.com`. WhiteMatter uses them to recognize your organization's accounts and for access control.

#### Add a domain

1. Type the domain in the field, for example `example.com`.
2. Select **Add** or press **Enter**.

To remove a domain, select the **x** on its tag. Adding and removing are saved immediately. There is no separate save step.

Add every domain people sign in with, including subsidiaries and aliases. Enter a plain domain, such as `example.com` or `eu.example.com`. Wildcards and full URLs aren't accepted.

:::note Domains and browser monitoring
When the Browser Extension monitors all domains, this list doesn't limit monitoring, and the page says so below the field. To monitor only these domains, set **Domains to monitor** to **Work domains only** in [Deployment Management](../../browser-extension/configure/extension-settings#deployment-management).
:::

### Platform MFA

Platform MFA controls email and password sign-in. When it is on, people sign in with their email and password, then enter a one-time passcode. When it is off, email and password sign-in is unavailable.

| Setting | Description |
|---|---|
| **Platform MFA** | Turns email and password sign-in, with a one-time passcode, on or off. |
| **Select factor** | How people receive the passcode. Shown only when Platform MFA is on. **Email OTP** is currently the only option. |

#### Turn Platform MFA on or off

1. Select the **Platform MFA** switch.
2. In the confirmation dialog, select **Turn on** or **Turn off**.

The change applies to everyone in your organization as soon as you confirm.

:::warning Before you turn off Platform MFA
Email and password sign-in stops working for everyone, and you can't add new email and password users. Google, Microsoft and [single sign-on](./single-sign-on) sign-in aren't affected. Make sure everyone who uses an email and password has another way to sign in.
:::

Platform MFA must be on before you can add a console user who signs in with an email and password. See [Roles and permissions](./roles-and-permissions).

## Unmanaged Browsers

An unmanaged browser is one your MDM (mobile device management) provider doesn't manage. These settings decide what WhiteMatter does when someone uses one.

| Setting | What it does |
|---|---|
| **Redirect to QuilrAI page** | **On** sends people using an unmanaged browser to the WhiteMatter sign-in page instead of letting them continue. |
| **HTML for custom IDP page** | **Download** gives you a page to host on your identity provider instead. See [Use your own page](#use-your-own-page). |
| **Allow bypass** | **Allowed** lets people dismiss the redirect and keep working in the unmanaged browser. **Not allowed** keeps them on the page. |

Each switch is saved as soon as you change it.

:::warning
**Allow bypass** lets people carry on in an unmanaged browser. Leave it at **Not allowed** unless you have a documented exception.
:::

### Use your own page

The custom page tells people that their browser isn't managed by your organization and sends them to your managed sign-in.

1. Next to **HTML for custom IDP page**, select **Download**. You get a file named `quilr-unmanaged-browser.html`.
2. Open the file and replace the two placeholders:
   - `REPLACE_WITH_YOUR_SIGN_IN_URL`: your organization's managed sign-in URL. It is used by the **Open managed sign-in** button.
   - `REPLACE_WITH_YOUR_IT_CONTACT`: who people should contact for access problems.
3. Host the page on your identity provider.

Each download is recorded in [Audit logs](./audit-logs).

## Related

- [Single sign-on](./single-sign-on)
- [Browser Extension settings](../../browser-extension/configure/extension-settings)
- [Roles and permissions](./roles-and-permissions)
- [Audit logs](./audit-logs) - changes to this page are recorded there
