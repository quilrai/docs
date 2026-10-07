---
sidebar_position: 2
sidebar_custom_props:
  icon: Globe
description: "Configure organization identity, corporate domains, timezone, acceptable-use policies, profile, and unmanaged-browser behavior."
---

# Organizational Context

Give QuilrAI the organization's own identity and policy language so coaching and justification prompts quote your rules, not generic guidance, and so console access is granted by role.

**Navigation:** Settings > Organizational Context. Tabs: General, Organizational Policies, Profile, and Manage Users (sub-tabs Users and Groups).

**Configuration and options:** General holds identity, display, and unmanaged-browser settings. Organizational Policies holds the List of Policies. Profile is read-only and synced from your identity provider. Manage Users holds console accounts, groups, and roles.

## Set the organization identity and domains

1. Open Settings > Organizational Context. The General tab opens first.

2. Under Organization, select Edit next to Name and enter the organization's display name. This name is used across the Quilr workspace and in end-user prompts.

3. Under Domains, type your corporate domain in the Domain field and select Add. Repeat for every domain your users sign in with. Domains identify which accounts are corporate and which are personal.

4. Under Display, set Timezone display to the timezone your security team works in. Every timestamp in the console is rendered in this timezone.

5. Under Unmanaged Browsers, select Redirect to QuilrAI Page to send browsers that your MDM does not manage to a QuilrAI landing page. Select Allow Bypass only if users may dismiss that page.

6. Select Download under HTML for Custom IDP page if you want to host your own version of that page.

![Organizational Context, General: organization name, domains, timezone display, and unmanaged-browser handling. Example tenant.](/img/console-v1/organizational-context-general.png)

*Organizational Context, General: organization name, domains, timezone display, and unmanaged-browser handling. Example tenant.*

**Expected result:** The organization name and domains appear in end-user prompts, and every console timestamp uses the selected timezone.

### Unmanaged-browser options

| Option | Behavior | When to use it |
| --- | --- | --- |
| Redirect to Quilr Page | Uses the Quilr-hosted experience for an unmanaged-browser path. | When the organization does not host a custom identity page. |
| Download HTML for Custom IDP Page | Provides the HTML used by the identity team for a custom identity-provider experience. | When corporate branding or identity routing requires a customer-hosted page. |
| Allow Bypass | Permits continuation from the unmanaged-browser experience. | Only when risk acceptance and policy explicitly allow it. |

## Add the AI acceptable-use policy

1. Select Organizational Policies. The List of Policies shows POLICY NAME, POLICY CREATION METHOD, CREATED BY, and FIRST UPLOADED for every policy already held.

2. Select + Add New Policy.

3. Keep **Upload Policy** selected, then select **Browse** and choose the approved policy document. The guide references `Organization_AI_Acceptable_Use_Policy.docx` as a starting template; obtain it from your administrator if needed.

4. To draft a policy instead, select **Generate Policy**, enter a **Policy Name**, add optional guidance in **Inputs to generate the policy**, and select **Generate**. Read the generated text in full and edit it before saving.

5. Select Save.

![List of Policies with the policy inventory and the + Add New Policy control. Example tenant.](/img/console-v1/organizational-policy-list.png)

*List of Policies with the policy inventory and the + Add New Policy control. Example tenant.*

![Add Organizational Policy in Upload Policy mode, with drag-and-drop and Browse. Example tenant.](/img/console-v1/organizational-policy-upload.png)

*Add Organizational Policy in Upload Policy mode, with drag-and-drop and Browse. Example tenant.*

![Add Organizational Policy in Generate Policy mode, with Policy Name and optional generation inputs. Example tenant.](/img/console-v1/organizational-policy-generation.png)

*Add Organizational Policy in Generate Policy mode, with Policy Name and optional generation inputs. Example tenant.*

**Expected result:** The policy appears in the List of Policies, and coaching messages can quote it.

**Verification:** Trigger an approved browser test with synthetic data and confirm the policy is available to coaching. Keep the control in Monitor while validating findings; validate the visible coaching prompt only when the staged control is configured to show it.

## Check your own console profile

Profile is read-only. The banner states that the profile is created through an integration with Microsoft and that details are synced directly and are not editable here. The tab shows Name, Email, and Notifications. Change these values in your identity provider, not in QuilrAI.

![Profile Settings, showing the identity-provider-synced name, email, and notification channel. Example tenant.](/img/console-v1/console-profile.png)

*Profile Settings, showing the identity-provider-synced name, email, and notification channel. Example tenant.*

## Verify the baseline

**Expected result:** Organization-wide configuration is reviewed under change control before policies or enforcement depend on it.

**Verification:** Confirm the saved state, affected workflow, audit evidence when available, and rollback path. Treat a missing page or disabled field as an access or tenant-edition question, not proof that the capability does not exist.

Manage invitations and group assignments through [Console Access Control](./access-control).
