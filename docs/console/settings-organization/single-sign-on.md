---
sidebar_position: 4
sidebar_label: "Single sign-on"
description: "Set up SAML single sign-on with Microsoft Entra ID, Okta, OneLogin or another identity provider so people sign in to the console with their work account."
sidebar_custom_props:
  icon: KeyRound
console_path: /settings/organization/single-sign-on
aliases: [single sign on, SSO, SAML, identity provider, IdP, Okta, Entra ID, OneLogin, enforce SSO, signing certificate]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Single sign-on

Single sign-on (SSO) lets people sign in to the console with their work account. You connect Quilr to your SAML identity provider (IdP), such as Microsoft Entra ID, Okta or OneLogin.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Single sign-on']} />

## Before you start

- You need admin access to your IdP, so you can create a SAML application.
- You need permission to manage organization settings in Quilr. Without it, the page opens but saving fails.
- Make sure at least one admin can also sign in with Google or Microsoft. That admin can get everyone back in if SAML ever breaks.

## How setup works

<StepFlow steps={[
  { label: "Copy from Quilr", items: ["Entity ID", "ACS URL"] },
  { label: "Create the IdP app", items: ["Paste the Quilr values", "Send the user's email", "Assign users"] },
  { label: "Paste into Quilr", items: ["IdP entity ID", "IdP SSO URL", "IdP signing certificate"] },
  { label: "Turn on and test", items: ["Save and turn on", "Sign in from a private window ✓"] },
]} />

## Step 1: Copy the Quilr values

The **Service provider details** card on the Single sign-on page shows the values your IdP needs. Click **Copy** next to each one instead of typing it.

| Quilr value | What your IdP may call it |
|---|---|
| **Entity ID** | Identifier, Audience URI, SP entity ID |
| **ACS URL** | Reply URL, Single sign-on URL, Assertion Consumer Service URL |
| **Metadata URL** | Metadata URL. Same value as the Entity ID |

The values look like this. Your Entity ID ends with your own tenant ID:

- Entity ID: `https://web.quilr.ai/platformadminapis/v2/auth/saml/metadata/<tenant-id>`
- ACS URL: `https://web.quilr.ai/platformadminapis/v2/auth/saml/callback`

:::note First-time setup
The **Metadata URL** only works after single sign-on is turned on. For your first setup, enter the **Entity ID** and **ACS URL** in your IdP by hand.
:::

## Step 2: Create a SAML app in your identity provider

Pick your IdP. Each tab ends with the values you bring back to Quilr in Step 3.

<Tabs>
<TabItem value="entra" label="Microsoft Entra ID" default>

1. In the Microsoft Entra admin center, go to **Enterprise applications** and click **New application**.
2. Click **Create your own application**, name it (for example, "Quilr"), and choose the non-gallery option.
3. Open **Single sign-on** and select **SAML**.
4. Under **Basic SAML Configuration**, set:
   - **Identifier (Entity ID)** to the Quilr **Entity ID**.
   - **Reply URL** to the Quilr **ACS URL**.
5. Under **Attributes & Claims**, check that the email address claim maps to the user's email (`user.mail`). If some users have no `mail` value, set **Unique User Identifier** (Name ID) to their email instead.
6. Under **SAML Certificates**, download **Certificate (Base64)**.
7. Under **Users and groups**, assign the people or groups who should sign in.

**Bring these values back to Quilr:**

| Entra value | Quilr field |
|---|---|
| **Microsoft Entra Identifier** | **IdP entity ID** |
| **Login URL** | **IdP SSO URL** |
| **Certificate (Base64)** file contents | **IdP signing certificate** |

Microsoft's guide: [Enable SAML single sign-on for an enterprise application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/add-application-portal-setup-sso).

</TabItem>
<TabItem value="okta" label="Okta">

1. In the Okta Admin Console, go to **Applications › Applications** and click **Create App Integration**.
2. Select **SAML 2.0**, click **Next**, name the app (for example, "Quilr"), and click **Next**.
3. On **Configure SAML**, set:

   | Okta field | Value |
   |---|---|
   | **Single sign-on URL** | The Quilr **ACS URL** |
   | **Use this for Recipient URL and Destination URL** | Checked |
   | **Audience URI (SP Entity ID)** | The Quilr **Entity ID** |
   | **Default RelayState** | Leave empty |
   | **Name ID format** | **EmailAddress** |
   | **Application username** | **Email** |

4. Keep Okta's default signing settings: response and assertion signed with **RSA-SHA256**, and assertions unencrypted.
5. Click **Next**, then **Finish**.
6. On the **Assignments** tab, assign the people or groups who should sign in.

**Bring these values back to Quilr.** On the **Sign On** tab, click **View SAML setup instructions**:

| Okta value | Quilr field |
|---|---|
| **Identity Provider Issuer** | **IdP entity ID** |
| **Identity Provider Single Sign-On URL** | **IdP SSO URL** |
| **X.509 Certificate** | **IdP signing certificate** |

Okta's guide: [Create SAML app integrations](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm).

</TabItem>
<TabItem value="onelogin" label="OneLogin">

1. In the OneLogin admin portal, go to **Applications** and click **Add App**.
2. Search for **SAML Custom Connector (Advanced)**, select it, name it (for example, "Quilr"), and click **Save**.
3. On the **Configuration** tab, set:

   | OneLogin field | Value |
   |---|---|
   | **Audience (EntityID)** | The Quilr **Entity ID** |
   | **Recipient** | The Quilr **ACS URL** |
   | **ACS (Consumer) URL Validator** | The ACS URL as a regular expression, with dots escaped. For example, `^https://web\.quilr\.ai/platformadminapis/v2/auth/saml/callback$` |
   | **ACS (Consumer) URL** | The Quilr **ACS URL** |
   | **Single Logout URL** | Leave empty |

4. Set **SAML nameID format** to **Email** and **SAML signature element** to **Both**.
5. On the **Parameters** tab, make sure **NameID** sends the user's email.
6. On the **SSO** tab, set **SAML Signature Algorithm** to **SHA-256**.
7. On the **Access** tab, assign the users or roles who should sign in.

**Bring these values back to Quilr.** They are on the **SSO** tab:

| OneLogin value | Quilr field |
|---|---|
| **Issuer URL** | **IdP entity ID** |
| **SAML 2.0 Endpoint** | **IdP SSO URL** |
| **X.509 Certificate** (click **View Details**) | **IdP signing certificate** |

</TabItem>
<TabItem value="other" label="Other SAML 2.0 IdP">

Any SAML 2.0 identity provider works if its app meets these requirements:

- **ACS URL and audience match exactly.** Send responses to the Quilr **ACS URL**, with the Quilr **Entity ID** as the audience.
- **The user's email is included.** Send it as the Name ID in email address format, or in an `email`, `mail` or `emailaddress` attribute.
- **Responses are signed.** Sign the response, the assertion, or both, with RSA-SHA256, RSA-SHA384, RSA-SHA512 or ECDSA-SHA256. SHA-1 signatures are rejected.
- **Clocks are in sync.** Quilr allows up to 2 minutes of clock difference.

**Bring these values back to Quilr:** the IdP's issuer (entity ID), its SAML sign-in URL, and its X.509 signing certificate.

</TabItem>
</Tabs>

## Step 3: Enter your IdP details in Quilr

Go back to the **Identity provider** card on the Single sign-on page and fill in:

| Field | What to enter |
|---|---|
| **IdP entity ID** | The issuer your IdP shows for the app |
| **IdP SSO URL** | Where sign-in requests are sent. Must start with `https://` |
| **IdP SLO URL** | Optional. You can leave it empty |
| **IdP signing certificate** | The full X.509 certificate, as PEM or base64. The `-----BEGIN CERTIFICATE-----` lines are optional |

Leave **Enforce single sign-on** set to **Not enforced** for now. You can enforce it after your first test passes.

## Step 4: Save and turn on

1. Click **Save and turn on**. The button stays greyed out until the required fields are filled in correctly.
2. You see **Single sign-on saved**, and the **SAML single sign-on** switch shows **On**.

People can now sign in with SAML or with any Google or Microsoft option they already use. Stay signed in to your current session until you finish testing.

## Step 5: Test sign-in

1. Open a private or incognito browser window and go to the console sign-in page.
2. Click **Continue with single sign-on**.
3. Enter your **Work email** and click **Continue with SSO**.
4. Sign in at your IdP.

You land back in the console, signed in. People can also sign in from the Quilr tile in their IdP's app dashboard.

If sign-in fails, see [Troubleshooting](#troubleshooting).

## Enforce single sign-on

When single sign-on is enforced, Google and Microsoft sign-ins are sent to your IdP instead. Use this when everyone must sign in through your IdP.

1. Set **Enforce single sign-on** to **Enforced**.
2. Click **Save**.

:::warning
While enforced, Google and Microsoft sign-ins also go through SAML. If SAML breaks, admins can't use them to get back in. Test sign-in before you enforce.
:::

## Who can sign in

- **Your IdP decides who can authenticate.** Only people assigned to the app in your IdP can sign in.
- **Quilr matches people by email.** The email your IdP sends must match the person's email in Quilr.
- **Roles decide what people see.** SSO only signs people in. Their role in [Roles and permissions](./roles-and-permissions) sets their access. When you add a user there, choose **SAML SSO** as their sign-in method.
- **People without a console role go to Self Service.** They sign in, but land in Self Service instead of the console.

SAML sign-ins show in [Audit logs](./audit-logs) as **Signed in with SAML**. Changes to this page are recorded there too.

## Rotate the signing certificate

Quilr holds one IdP signing certificate at a time. When your IdP switches to a new certificate:

1. In your IdP, create the new certificate without activating it, if your IdP allows that.
2. Activate it in your IdP. Straight away, paste it into **IdP signing certificate** in Quilr and click **Save**.
3. Test sign-in from a private window.

Sign-ins fail until both sides use the same certificate, so do step 2 in one go.

## Turn off single sign-on

1. Set the **SAML single sign-on** switch to **Off**.
2. In **Turn off single sign-on?**, click **Turn off**.

SAML sign-in stops, but people can still use any Google or Microsoft option with their existing account. Your IdP details are kept. To turn SAML back on, set the switch to **On**. It saves straight away.

## Troubleshooting

| Problem | Possible reason | Fix |
|---|---|---|
| **Save and turn on** is greyed out | A required field is empty, or a URL doesn't start with `https://` | Fill in **IdP entity ID**, **IdP SSO URL** and **IdP signing certificate**. Check the fields marked **Required** or **Must be an https URL** |
| Saving shows `idpSigningCert is not a valid X.509 certificate` | The pasted text isn't the certificate, or part of it is missing | Copy the full certificate again from your IdP (for Entra, **Certificate (Base64)**) |
| The sign-in page says **Single sign-on isn't available for your account** | SAML is off, or your email domain isn't linked to your organization | Check that the **SAML single sign-on** switch is **On**. If it is, contact your QuilrAI representative |
| The sign-in page says **We couldn't complete sign-in with your identity provider** | Quilr rejected the IdP's response. See the list below | Check each value against the Single sign-on page, then test again |
| Your IdP says the user isn't assigned to the app | The person isn't assigned in your IdP | Assign them, or a group they belong to, to the app |
| The **Metadata URL** shows an error | Single sign-on isn't turned on yet | Enter the **Entity ID** and **ACS URL** by hand, or import the metadata after you turn SSO on |
| Someone lands in Self Service instead of the console | They have no console role | Give them a role in [Roles and permissions](./roles-and-permissions) |

**Why "We couldn't complete sign-in" appears.** Check these in order:

1. The certificate in Quilr doesn't match the one your IdP signs with. This often happens after the IdP rotates it.
2. **IdP entity ID** in Quilr doesn't exactly match your IdP's issuer.
3. The audience or reply URL in your IdP doesn't exactly match the Quilr **Entity ID** or **ACS URL**.
4. Your IdP signs with SHA-1. Switch it to SHA-256.
5. The response doesn't include the user's email.
6. Your IdP's clock is more than 2 minutes off.

## If SAML sign-in breaks

1. Sign in with Google or Microsoft as an admin.
2. Fix the values on the Single sign-on page, or turn SAML off while you fix your IdP.
3. Test from a private window, then turn SAML back on.

If single sign-on is enforced, Google and Microsoft sign-ins also go to your IdP, so step 1 won't work. If no admin can sign in, contact your QuilrAI representative.

## Related

- [Roles and permissions](./roles-and-permissions) - decide what people can see after they sign in
- [General](./general-and-domains) - your organization's domains
- [Smart Groups](./smart-groups) - assign roles to groups instead of individuals
- [Audit logs](./audit-logs) - review sign-ins and SSO changes
