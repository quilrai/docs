---
sidebar_position: 4
sidebar_label: "Single sign-on"
sidebar_custom_props:
  icon: KeyRound
---

# Single sign-on

Connect a SAML identity provider (IdP) so admins sign in to the console through your IdP.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Single sign-on']} />

## Before you start

- Admin access to your IdP to create a SAML application.
- An admin role in Quilr that can edit organization settings.

## Set up SAML

1. In Quilr, open **Single sign-on** and copy the **Service provider details**:
   - **Entity ID**
   - **ACS URL**
2. In your IdP, create a SAML application and paste the Entity ID and ACS URL.
3. From your IdP, copy its SAML details and enter them in Quilr:

| Field | What to enter |
|---|---|
| **IdP entity ID** | The identity provider's entity ID (issuer) |
| **SSO URL** | The IdP sign-in URL |
| **SLO URL** | The IdP sign-out URL |
| **Signing certificate** | The IdP's signing certificate |

4. Turn on the **SAML** toggle.
5. Test sign-in from a private browser window before you sign out of your current session.

:::note
Google and Microsoft sign-in remain available alongside SAML.
:::

## Related

- [Roles and permissions](./roles-and-permissions) - SSO signs people in; roles decide what they can see
- [Audit logs](./audit-logs)
