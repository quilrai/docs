---
sidebar_position: 2
sidebar_label: "Admin guide"
sidebar_custom_props:
  icon: ShieldCheck
description: "For QuilrAI platform admins - set up LLM Gateway self-service: personal keys, app access lists, app owners and templates, bulk changes with impact preview, model options, requests, people, providers, the usage report, a safe rollout and offboarding."
console_path: [/settings/llm-gateway/self-service/overview, /settings/llm-gateway/self-service/apps, /settings/llm-gateway/self-service/model-options, /settings/llm-gateway/self-service/requests, /settings/llm-gateway/self-service/people, /settings/llm-gateway/self-service/providers]
aliases: [self-service admin, self-service settings, personal api keys, app owners, app templates, model options, self-service requests, suspend self-service, self-service usage]
---

# Admin guide

Set up self-service for your developers: who gets their own keys, what they can do, and who answers their requests. For the concepts, start with the [Overview](./overview). Access plans have their own page: [Access plans](./access-plans).

## Where to configure it

Open **Settings > AI Gateway > LLM Gateway** and select the **Self-service** tab. It has these sub-tabs:

| Sub-tab | Use it to |
|---------|-----------|
| **Overview** | See what you have decided so far, check what one person gets, and choose what happens to people without an access plan. |
| **Access plans** | Decide what groups of developers get. See [Access plans](./access-plans). |
| **Apps** | Per app: shared or personal keys, who can do what, app owners, personal keys and templates. Change many apps at once. |
| **Model options** | Name the models access plans can offer on personal keys. |
| **Providers** | Decide who may add and change platform providers from self-service. |
| **Requests** | Answer requests for more, and settings changes developers asked for. |
| **People** | Check one person, revoke their keys, or suspend them. |

**How self-service works** (top right) opens a short explainer. **Usage report** on the **Overview** tab opens the [usage report](#track-usage).

:::note Permissions
Viewing these tabs needs LLM Gateway read access; changing them, and deciding requests, needs **LLM Gateway - Update**. If you can read only some apps, you see only the **Apps** tab.
:::

## Overview

The **Overview** tab sums up your setup in three cards that follow the three questions: **Who can use it**, **What they get** and **What they can ask for**.

![Self-service Overview tab with Check what someone gets, and the Who can use it, What they get and What they can ask for cards](/img/llm-gateway/ui/self-service/overview.jpg)

| Card | Shows |
|------|-------|
| **Who can use it** | How many apps use personal keys (**Choose apps** opens the **Apps** tab), how many people have an access plan, and the rule for people without one. |
| **What they get** | Your access plans in rank order, with links to **Manage access plans** and **Smart Groups and rank**. |
| **What they can ask for** | Requests waiting for you and for app owners, how many apps have app owners, and **Review requests**. |

People are counted from Smart Group members, your user directory and everyone who already uses self-service. When the directory cannot be read, the card says so.

### Check what someone gets

Enter an email in **Check what someone gets**, optionally pick an app, and select **Check**. The result shows which access plan applies, the portal sections, the person's key limits, their approved requests, and for each app the abilities they hold and where each one comes from: **From the app**, **From the access plan**, **App owner or request**, or **Removed by the plan's limit**.

![Check what someone gets result for one person with no access plan, listing each app's abilities and the columns From the app, From the access plan, App owner or request and Removed by the plan's limit](/img/llm-gateway/ui/self-service/check-what-someone-gets.jpg)

The **People** tab runs the same check and adds the person's keys and suspension. See [People](#people).

### People without an access plan

In the **Who can use it** card, choose what happens to everyone no access plan matches:

| Choice | Effect |
|--------|--------|
| **Keep each app's own settings** (default) | Same as before access plans existed: each app's own lists decide. Safe while you roll out. |
| **No self-service** | They lose all self-service, and their personal keys stop working within about a minute. |

Before you switch to **No self-service**, the console counts who would be cut off and names the people who would lose access to apps they hold personal keys for, with the app and the number of keys.

![Turn off self-service for people without an access plan dialog naming the people who would lose access to apps they hold personal keys for, with Cancel and Deny them buttons](/img/llm-gateway/ui/self-service/no-plan-rule-impact.jpg)

Select **Deny them** to confirm. When the count is incomplete or could not be made, you must tick an acknowledgement first.

## Apps

The **Apps** tab lists every app with its keys, app owners, whether developers can copy it, and who holds each ability. Filter by **Keys**, **Access** or **App owners**, or search by name. Select an app to open its self-service settings, or select several rows to [change them together](#change-many-apps-at-once).

![Self-service Apps tab filtered to Personal API keys, with the Keys, App owners, Developers can copy it and Who can columns](/img/llm-gateway/ui/self-service/apps-table.jpg)

The app drawer has three tabs: **Access and keys**, **Developers can copy it** and **Change history**. **All of this app's settings in LLM Gateway** opens the app's full settings. Changes on **Access and keys** apply when you select **Save settings**.

### Choose a credential mode {#choose-a-credential-mode}

Under **Credential mode**, pick:

- **Shared application key**: people with access use the app's keys. The app can have several named keys.
- **Personal API keys**: each person creates named keys tied to their account. The app's main key and JWT sign-in still work.

![App drawer Access and keys tab with the Credential mode choice between Shared application key and Personal API keys, and Maximum key lifetime](/img/llm-gateway/ui/self-service/app-drawer-access-and-keys.jpg)

**Maximum lifetime (days)** under **Maximum key lifetime** makes every new personal key for this app expire within that many days. Keys that never expire can then not be created. Existing keys keep their expiry.

:::warning Switching back to a shared key stops personal keys
An app on **Shared application key** accepts no personal key. Switching an app from personal to shared keys stops every personal key for it at once.
:::

:::note JWT clients keep working
Personal API keys change only the app's Quilr API keys. If the app also uses [JWT authentication](../protect/identity-and-network-trust#authentication-modes), clients that send a verified JWT keep working, identified by the token's email. [Allowed user domains](../protect/identity-and-network-trust#allowed-user-domains) still apply.
:::

### Decide who can do what

Each ability has its own row: **Viewer access**, **Settings request access**, **Direct settings update**, **View and copy API key values** and **All-logs visibility**.

![App drawer ability rows with the All users switch and Allow emails, Deny emails, Allow smart groups and Deny smart groups fields](/img/llm-gateway/ui/self-service/app-drawer-abilities.jpg)

| To grant | Set |
|----------|-----|
| Everyone | **All users** on |
| Specific people or groups | **Allow emails** and **Allow smart groups** |
| Everyone except some | **All users** on, plus **Deny emails** or **Deny smart groups** |
| Nobody | Leave everything empty |

A deny always wins, including over an access plan's **Always**. The tag under each ability shows the result, for example **Nobody yet**. **Settings request access** and **Direct settings update** include **Viewer access** unless a viewer deny matches the person.

Grant **Direct settings update** sparingly: nobody approves the change first. Every change is still versioned in [Config History](../monitor/app-audit-log#config-history) and can be rolled back.

An access plan whose ability is set to **Only if the app allows** uses exactly these lists, so app owners and admins stay in control app by app.

### App owners and personal keys

**App owners** (at most 20 emails) review requests about this app: access to it, and budgets that cover only it. Administrators can always review too, and nobody approves their own request. Without app owners, administrators review the app's requests. On an app copied from a template, owners may also disable or delete it. Owners gain no other role.

**Personal keys** lists every personal key people created for this app, with owner, key name and id, creation, expiry, last use and status. Filter by owner, or turn on **Show revoked and expired**. Select **Revoke** to stop a key at once; its owner sees it as revoked.

![App drawer App owners field and Personal keys table with an owner, key name, created date, expiry, last used, Active status and Revoke button](/img/llm-gateway/ui/self-service/app-drawer-owners-and-keys.jpg)

### Let developers copy an app (app templates)

On **Developers can copy it**, select **Make it a template...**, give the template a label and description, and save. Developers whose access plan allows it can then create an app from it in their portal.

An app cannot be a template while guardrail policies depend on its identity: a copy has its own name and id, so those policies would not cover it. The console lists each such policy. Change each one to match by group or tag instead, then select **Recheck**.

![Developers can copy it tab showing Developers can't copy it, the policies that depend on the app's identity, a Recheck button, and what the copy gets and what starts empty](/img/llm-gateway/ui/self-service/app-drawer-template.jpg)

| The copy gets | Starts empty |
|---------------|--------------|
| Provider and its credentials | Who can do what (its creator becomes its app owner) |
| Model routing and settings | Shared keys and budgets |
| Guardrail policies and categories | Prompt store, JWT sign-in and key expiry |

The developer who copies an app owns the copy. Their access plan decides how many copies they may make and whether they change its settings directly, ask for changes, or do not see settings. See [Creating their own apps](./access-plans#creating-their-own-apps).

To stop offering a template, open it again and stop offering it. Copies already made stay as they are.

### Change history

**Change history** shows the app's change requests waiting for approval, all requests, and its configuration versions, with rollback. It is the app's [Audit Log](../monitor/app-audit-log).

![App drawer Change history tab with the Audit Log, Change requests waiting for approval and All requests](/img/llm-gateway/ui/self-service/app-drawer-change-history.jpg)

### Change many apps at once

1. On the **Apps** tab, select the apps' checkboxes.
2. Select **Change settings...**.
3. Under **Change**, pick one setting:
   - **Add or remove people or Smart Groups on a role** (pick the role, **Add** or **Remove**, and the **Allowed** or **Denied** list)
   - **Turn "All users" on or off for a role**
   - **Set the credential mode**
   - **Set or remove the maximum key lifetime**
   - **Add or remove app owners**
4. Select **Preview changes**.

![Change self-service settings drawer for 2 applications, adding people or Smart Groups to the Viewer access allowed list](/img/llm-gateway/ui/self-service/apps-bulk-change.jpg)

Only the setting you choose changes; everything else on each app stays as it is. The preview lists what changes on each app and names the people who would lose access to apps they hold personal keys for.

![Bulk change preview switching 2 apps to the shared application key, warning that 1 person would lose access to 1 app they hold personal keys for](/img/llm-gateway/ui/self-service/apps-bulk-preview-impact.jpg)

Select **Apply to N applications**. Each app is saved on its own. An app someone else changed since the preview is skipped, and the result shows each app as **Applied**, **Already matched**, **Skipped** or **Failed**. When the impact could not be fully checked, tick the acknowledgement first.

## Model options

A model option is a model name your routing already serves (for example a [routing group](../cost-and-traffic/routing-and-fallbacks)), with a label developers see. Access plans choose which options their developers may call with personal keys. Shared app keys are not affected.

![Model options tab with two options, Fast calling auto-1 and Balanced calling auto-2, each with a label, model name and description](/img/llm-gateway/ui/self-service/model-options.jpg)

1. Select **Add model option**.
2. Enter the **label** developers see, for example `Fast` or `Most capable`.
3. Pick a routing group or type the **model** name developers call.
4. Optionally add a **description**.
5. Order the options lightest first with the arrows. An option's place is its rank, which decides what a request for a stronger option asks for.
6. Select **Save model options**.

The label is a display name, not an alias: developers still call the model name. Each option gets a fixed ID that access plans use. You can have up to 10 options. A note warns when no app routes the model name, or when the name is also an app name or a provider model. An option an access plan still uses cannot be removed.

## Requests

The **Requests** tab has two inboxes.

![Requests tab with the Waiting for you, Waiting for app owners, Active approvals and Decided views, and who answers each kind of request](/img/llm-gateway/ui/self-service/requests.jpg)

**Requests** holds developers asking for more than their access plan gives:

| View | Shows |
|------|-------|
| **Waiting for you** | Requests only admins answer (a better model, a longer key, one more app, budget shared across apps), and requests about an app with no app owners. |
| **Waiting for app owners** | Requests about one app (access to it, or budget that covers only that app). Admins can decide these too. |
| **Active approvals** | Approved requests still in force. Revoke one to end it now. |
| **Decided** | Approved, rejected, cancelled, revoked, failed and expired requests. |

| Request | Who answers |
|---------|-------------|
| More budget | The app owners, if the budget covers only their app. Otherwise you. |
| Access to an app | The app owners. You, if the app has none. |
| A better model, a longer key | You. |
| One more app | You. Permanent once approved. |

To decide, open a request and **Approve request** with an **Approved until** date (at most a year away; the approval stops at the end of that day, UTC) and an optional comment, or **Reject request** with a reason the requester sees. Nobody decides their own request. A new app has no end date.

A budget increase raises the person's own budget on that app until the end date. If the person has no such budget on that app, the approval is refused and the request stays pending: set a budget up, then approve again.

**Settings changes** lists changes developers asked for to app settings, shared keys and platform providers. Only admins approve these, never app owners. The same list opens from **Approvals** at the top of the LLM Gateway page. See [Audit Log](../monitor/app-audit-log#change-requests).

## People

The **People** tab answers "what does the gateway give this person, and why". Enter an email under **Check a person** and select **Check**.

![People tab Check a person result with a Why list giving each app's abilities and where they come from, with Open the app links](/img/llm-gateway/ui/self-service/people-check.jpg)

The result lists **Why**, with links to the access plan and each app, then the same app table as [Check what someone gets](#check-what-someone-gets). Below it:

- **Their personal keys**: every active personal key the person holds, on every app you can see. **Revoke** stops a key at once.
- **Suspend self-service**: enter a **Reason for suspending (admins only)** and suspend them. A suspended person gets no self-service at all, and their personal keys stop within about a minute. **Restore self-service** lifts it.
- **Apps they created**: apps the person copied from templates.

![Person check with the Reason for suspending field, Suspend self-service button and the Their personal keys table with a Revoke button](/img/llm-gateway/ui/self-service/people-keys-suspend.jpg)

The tab also lists everyone currently suspended.

## Providers

The **Providers** tab decides who may add and change platform providers from self-service, and shows provider changes waiting for an admin. It is the same setting as **Settings > AI Gateway > Models > Self-service access** (**Open in Models**).

![Providers tab Self-service access grid with Viewer access, Change request access and Direct change access, each with All users and allow and deny fields](/img/llm-gateway/ui/self-service/providers.jpg)

| Capability | Lets a person |
|------------|---------------|
| **Viewer access** | See the provider, its models, prices and how many apps link it (never which ones). |
| **Change request access** | Propose changes; each waits for an administrator. |
| **Direct change access** | Change it immediately, without approval. |

The tenant-wide grid also decides who may add providers. Provider secrets are write-only for everyone.

## Track usage {#track-usage}

**Usage report** on the **Overview** tab (also **Self-service usage** on the LLM Gateway page) opens a tenant-wide report of who can do what in each app, and whether they use it.

![Self-service usage Applications tab listing each app's credential mode as Personal keys or Main app key, with users per role, keys, requests and estimated cost](/img/llm-gateway/ui/self-service-usage-by-application.png)

| Tab | Shows |
|-----|-------|
| **Users** | Each person's roles, apps, keys, requests, estimated cost and last request. |
| **Applications** | Each app's credential mode, people per role (or **Everyone**), keys, requests and estimated cost. |
| **Change history** | Every settings change submitted through self-service, with requester, status and reviewer. |

The report covers the last 30 days by default (up to 366 days). Select **Include every active app** to widen it beyond apps that use self-service. Estimated cost leaves out models with no configured price.

## Roll out safely

Self-service is built so each step can be checked before it affects anyone.

1. **Start with no access plans.** Each app's own lists decide, exactly as before.
2. **Turn on personal keys** for the apps where you want per-person keys (**Apps**, **Keys** column or a bulk change). Existing integrations keep working: the app's main key and JWTs are still accepted.
3. **Add model options** if you want plans to limit personal keys to named models.
4. **Create an access plan for a pilot Smart Group.** New plans set every ability to **Only if the app allows**, so they grant nothing extra until you choose **Always**. Use **What a developer sees** with a sample person and **Count who it reaches** before saving. See [Access plans](./access-plans).
5. **Set app owners** on the apps whose requests they should answer.
6. **Widen the plans** to more groups. Check **Who can use it** on the **Overview** tab until everyone who should have a plan has one.
7. **Only then consider No self-service** for people without a plan, and read the impact list before confirming.

Before saving or deleting a plan, changing the no-plan rule or applying a bulk change, the console names everyone who would lose access to apps they hold personal keys for.

## Offboard someone {#offboard-someone}

A personal key stops working when its owner loses **Viewer access** on the app or is suspended, within about a minute. Leaving your directory alone does not stop it.

1. On **People**, check the person.
2. Select **Suspend self-service** with a reason. This removes all their self-service access and stops their personal keys.
3. Optionally **Revoke** their keys under **Their personal keys**, so the keys stay stopped even if the suspension is lifted.
4. For apps on a **Shared application key** that they could see, rotate the app's keys: they may have copied a key value.
5. Under **Apps they created**, give each app new app owners on the **Apps** tab, or disable it.

Removing the person from the Smart Groups and app lists that grant them **Viewer access** has the same effect on their keys, once group changes reach the gateway.

## Related

- [Access plans](./access-plans) - what each plan gives.
- [Overview](./overview) - concepts and how a decision is made.
- [Developer guide](./developer-guide) - what developers see.
- [Audit Log](../monitor/app-audit-log) - settings change requests, versions and rollback.
- [Self-service API](../api-reference/self-service-api) - the same setup through the Management API.
