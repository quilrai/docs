---
sidebar_position: 4
sidebar_label: "Single sign-on"
description: "Connect a SAML identity provider such as Microsoft Entra ID or Okta: values to copy, email mapping, certificate rotation and recovery."
sidebar_custom_props:
  icon: KeyRound
---

# Single sign-on

Connect a SAML identity provider (IdP) so people sign in to the console with their work account.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Single sign-on']} />

## Before you start

- Admin access to your IdP to create a SAML application.
- An admin role in Quilr that can edit organization settings.
- An admin who can also sign in with Google or Microsoft, to recover if SAML breaks. See [If SAML sign-in breaks](#if-saml-sign-in-breaks).

## Values to copy into your IdP

**Service provider details** on the Single sign-on page lists:

| Quilr value | Format | IdP field |
|---|---|---|
| **Entity ID** | `https://web.quilr.ai/platformadminapis/v2/auth/saml/metadata/<tenant-id>` | Audience, SP entity ID or identifier |
| **ACS URL** | `https://web.quilr.ai/platformadminapis/v2/auth/saml/callback` | Assertion Consumer Service URL, reply URL or single sign-on URL |
| **Metadata URL** | Same as the Entity ID | Import it instead of entering values by hand, if your IdP supports it |

Use **Copy** next to each value rather than typing it.

**Email mapping.** Quilr identifies the person by email. It reads the first attribute named `email`, `mail`, `emailaddress`, `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` or `urn:oid:0.9.2342.19200300.100.1.3`, and otherwise the NameID. Send the user's primary email in one of these, or set the NameID format to email address. The email must match the person's email in Quilr.

**Signing.** Sign assertions with RSA-SHA256, RSA-SHA384, RSA-SHA512 or ECDSA-SHA256. Quilr allows up to 2 minutes of clock difference between the IdP and Quilr.

### Microsoft Entra ID

1. In the Microsoft Entra admin center, open **Enterprise applications › New application › Create your own application** and choose a non-gallery application.
2. Open **Single sign-on**, select **SAML**, and under **Basic SAML Configuration** set **Identifier (Entity ID)** to the Quilr **Entity ID** and **Reply URL** to the Quilr **ACS URL**.
3. Under **Attributes & Claims**, check that the email address claim (`.../claims/emailaddress`) maps to the user's email, or set the **Unique User Identifier** (NameID) to `user.mail` with the email address format.
4. Under **SAML Certificates**, download **Certificate (Base64)**.
5. Copy **Microsoft Entra Identifier** and **Login URL** (and **Logout URL** if you use it).
6. Assign the users or groups who should sign in.

See Microsoft's [Enable SAML single sign-on for an enterprise application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/add-application-portal-setup-sso).

### Okta

1. In the Okta Admin Console, open **Applications › Create App Integration** and choose **SAML 2.0**.
2. Set **Single sign-on URL** to the Quilr **ACS URL** and **Audience URI (SP Entity ID)** to the Quilr **Entity ID**.
3. Set **Name ID format** to **EmailAddress** and **Application username** to **Email**.
4. Finish, then open the app's **Sign On** tab and view the SAML setup instructions to copy the **Identity Provider Issuer**, **Identity Provider Single Sign-On URL** and **X.509 Certificate**.
5. Assign the users or groups who should sign in.

See Okta's [Create SAML app integrations](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm).

## Enter the IdP values in Quilr

| Field | What to enter |
|---|---|
| **IdP entity ID** | The issuer your IdP advertises (Entra: Microsoft Entra Identifier; Okta: Identity Provider Issuer) |
| **IdP SSO URL** | Where sign-in requests are sent (Entra: Login URL; Okta: Identity Provider Single Sign-On URL) |
| **IdP SLO URL** | Optional. Where sign-out requests are sent |
| **IdP signing certificate** | The X.509 certificate your IdP signs assertions with, as PEM or base64 |

Turn on the **SAML single sign-on** toggle, then test sign-in from a private browser window before you sign out of your current session.

The page notes that people can use SAML or any available Google or Microsoft sign-in option. Signing in only proves who someone is: what they can see is set by their role in [Roles and permissions](./roles-and-permissions).

## Rotate the signing certificate

Quilr holds one IdP signing certificate. When your IdP rolls over to a new certificate:

1. Create or download the new certificate in your IdP without activating it yet, if your IdP allows that.
2. Activate it in the IdP and, straight away, paste it into **IdP signing certificate** in Quilr.
3. Test sign-in from a private window.

Sign-ins signed with a certificate that Quilr does not hold fail until both sides match, so do the two steps together.

## If SAML sign-in breaks

Typical causes are an expired or rotated certificate, a changed ACS URL or entity ID in the IdP, or an email attribute that no longer matches. To recover:

1. Sign in with Google or Microsoft as an admin.
2. Fix the IdP values on the Single sign-on page, or turn the **SAML single sign-on** toggle off while you fix the IdP.
3. Test from a private window, then turn SAML back on.

If no admin can sign in, contact your QuilrAI representative.

## Related

- [Roles and permissions](./roles-and-permissions) - SSO signs people in; roles decide what they can see
- [Smart Groups](./smart-groups)
- [Audit logs](./audit-logs)
