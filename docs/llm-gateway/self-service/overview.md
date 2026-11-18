---
sidebar_position: 1
sidebar_label: "Self-service overview"
sidebar_custom_props:
  icon: UserCog
description: "How LLM Gateway self-service works: developers get their own keys, apps and model options in a developer portal, and admins decide who can use it, what they get and what they can ask for."
console_path: []
aliases: [self-service, developer portal, personal keys, access plans, self service overview]
---

# Overview

Self-service is a developer portal on top of the LLM Gateway. Developers get their own API keys, open the apps they are allowed to use, copy app templates into apps they own, and ask for more when they need it. You set the limits once, instead of minting a key for every person.

| If you are a... | Read |
|-----------------|------|
| Platform admin setting self-service up | [Admin guide](./admin-guide), then [Access plans](./access-plans) |
| Developer using the portal | [Developer guide](./developer-guide) |
| Automating it | [Self-service API](../api-reference/self-service-api) |

## The three questions you answer

Everything you configure answers one of three questions. The console's **How self-service works** panel uses the same structure.

![How self-service works panel explaining what a developer gets and the three questions: who can use it, what they get, and what they can ask for](/img/llm-gateway/ui/self-service/how-self-service-works.jpg)

| Question | You decide | Where |
|----------|-----------|-------|
| **Who can use it** | Which apps give each person their own key, which people get which access plan, and what happens to everyone without a plan. | **Apps**, **Access plans**, **Overview** |
| **What they get** | For each access plan: which apps people see, which abilities they have there, which model options their personal keys may call, how many keys they hold and how long keys last, and whether they can create their own apps. | **Access plans**, **Model options** |
| **What they can ask for** | Who reviews requests for more budget, access to an app, a better model, a longer key or one more app. | **Apps** (app owners), **Requests** |

## Concepts

| Term on screen | What it is |
|----------------|------------|
| **Personal API keys** | An app setting: each person creates named keys of their own, so every call is logged under their name. The other choice, **Shared application key**, gives everyone with access the app's keys. |
| **Access plan** | What a group of people get, matched by Smart Group: apps, abilities, model options, key limits and app creation. |
| **Abilities** | What a person can do on an app: **Viewer access**, **Settings request access**, **Direct settings update**, **View and copy API key values** and **All-logs visibility**. |
| **App owner** | Someone who answers requests about one app. The person who copies an app template owns the copy. |
| **App template** | An existing app that developers may copy into an app of their own. |
| **Model option** | A model name your routing already serves, with a label developers see. Access plans choose which options personal keys may call. |
| **Request** | A developer asking for more than their access plan gives. Each approval ends on a date, except a new app. |

### Names in the API and the developer portal

The admin screens were renamed. The API keeps its names, and the developer portal still uses some of the older words.

| Admin screen | API and developer portal |
|--------------|--------------------------|
| Access plan | Profile |
| App template | Blueprint |
| Model option | Model tier (API: tier) |
| Request | Exception (portal: request) |
| App owner | Owner |

### Abilities

| Ability | Lets a person |
|---------|---------------|
| **Viewer access** | Open the app in the developer portal and create personal keys for it. Every other ability needs it. |
| **Settings request access** | Submit settings changes. An administrator approves each one; app owners do not. |
| **Direct settings update** | Change the app's settings with no approval. Every change is logged in the app's change history. |
| **View and copy API key values** | See key values: the app's shared keys, or the values of their own personal keys. |
| **All-logs visibility** | See all of the app's logs and usage, not only their own calls. |

Each app has its own allow and deny list for every ability, by email or Smart Group. An access plan then sets each ability to **Always**, **Only if the app allows** or **Never**.

## How a decision is made

The gateway decides one person's access to one app in this order, on every portal page and on every call made with a personal key.

<StepFlow steps={[
  {label: "Suspended?", items: ["Yes: nothing", "No: continue"]},
  {label: "Find the access plan", items: ["Smart Groups", "Lowest rank wins", "No plan: the no-plan rule"]},
  {label: "Add up the yeses", items: ["Plan: Always", "App's own lists", "Approved requests", "Apps they own"]},
  {label: "Remove the noes", items: ["App's deny lists", "A deny always wins"]},
  {label: "Apply the plan's limit", items: ["Never: dropped", "Apps outside the plan: dropped"]},
]} />

1. **Suspended?** A suspended person gets nothing, whatever else says yes.
2. **Find their access plan.** A plan matches when the person is in one of its Smart Groups. When several plans match, the plan whose matching group has the lowest rank wins (ties go to the plan name). Plans never combine. A person with no plan follows the rule for people without a plan: **Keep each app's own settings** (the default) or **No self-service**.
3. **Add up the yeses.** The plan's **Always** abilities, plus the app's own allow lists, plus approved requests, plus what they own.
4. **Remove the noes.** Anything the app's own lists deny them. A deny always wins; a deny on **Viewer access** removes every ability on that app.
5. **Apply the plan's limit.** Anything the plan marks **Never**, and any app outside the plan, is dropped. Without **Viewer access**, nothing is left.

An app someone copied from a template is not capped by their plan's app or ability limit. Suspension, **No self-service**, the app's own denies and the plan's model and key limits still apply.

To see the result for one person, use **Check what someone gets** on the **Overview** tab or **Check a person** on the **People** tab. See [Check what someone gets](./admin-guide#check-what-someone-gets).

## Personal and shared keys {#credential-modes}

Each app uses one of two credential modes. The mode decides which keys people receive. It does not decide who has access.

| Mode | People receive | Notes |
|------|----------------|-------|
| **Shared application key** | The app's keys | The app can have several named keys. Abilities still decide who sees the app and its key values. |
| **Personal API keys** | Named keys each person creates | Every call is logged under the key's owner. The app's main key and verified JWTs keep working. |

A personal key is a full gateway credential. Use it anywhere you would use a Quilr key:

```
sk-quilr-ss-<48 hex characters>          new personal keys
sk-quilr-<app key>:ss1.<identity>.<id>   older personal keys, still accepted
```

New keys are random and contain neither the app key nor the owner. Keys created before the new format keep working unchanged.

A personal key works only while:

- the app is on **Personal API keys** (switching an app to a shared key stops every personal key for it),
- the key is active and not past its expiry,
- its owner still holds **Viewer access** on the app and is not suspended.

When access is removed, the key stops within about a minute, once the gateway's access cache refreshes. Smart Group membership changes also take effect within about that time. A person leaving your directory does not stop their keys by itself; remove their access or suspend them. See [Offboard someone](./admin-guide#offboard-someone).

## Limitations

- **Shared keys are not personal.** Removing someone's access to an app on a shared key hides the app from them, but a key value they already copied keeps working. Rotate the app's keys.
- **Model options apply to personal keys only.** The app's main key, its shared keys and JWT sign-ins are never limited by a plan's model options.
- **Keys per person.** A person holds at most 10 active personal keys per app. An access plan can lower that, and a key's lifetime is capped by the shorter of the app's and the plan's maximum.
- **App templates need app-independent policies.** An app cannot be a template while any guardrail policy depends on its identity (its name or id), because those policies would not cover the copies. The console lists such policies.
- **The Users view and API show app lists only.** The [Users API](../api-reference/users-api) shows access granted by each app's own lists and personal keys, not access granted by an access plan. Use **Check a person** for the full answer.
- **Changes are not instant.** Saved settings reach every gateway server within a configuration sync, and personal keys then follow within the access cache lifetime (about a minute).

## Local MCP tools

The developer portal also has **MCP Gateway**, where people connect their AI app to permitted local MCP tools. See [Connect your AI app](../../mcp-gateway/local-mcp/connect-your-ai-app). When no tools are permitted, administrators get a **Manage MCP access** shortcut; see [Manage MCP access](../../mcp-gateway/local-mcp/connect-your-ai-app#manage-mcp-access-administrators).

## Related

- [Admin guide](./admin-guide) - set up self-service, step by step.
- [Access plans](./access-plans) - what each plan gives and how to roll it out.
- [Developer guide](./developer-guide) - the developer portal.
- [Smart groups](../../console/settings-organization/smart-groups) - the groups and ranks plans match on.
- [Audit Log](../monitor/app-audit-log) - review settings change requests and roll back changes.
