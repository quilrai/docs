---
sidebar_position: 3
sidebar_label: "Access plans"
sidebar_custom_props:
  icon: Layers
description: "Create LLM Gateway self-service access plans: which Smart Groups they cover, which apps people see, each ability as Always, Only if the app allows or Never, portal sections, model options, key limits and app creation, with a live preview and an impact check before saving."
console_path: /settings/llm-gateway/self-service/access-plans
aliases: [access plans, self-service profiles, profiles, plan rank, starter app, developer key, model limits, key limits]
---

# Access plans

An access plan decides what developers in its Smart Groups see and can do in the developer portal: which apps, which abilities on them, which model options their personal keys may call, how many keys they hold, and whether they can create their own apps. In the API an access plan is a **profile**.

Open **Settings > AI Gateway > LLM Gateway > Self-service > Access plans**.

![Access plans tab listing one plan with its rank, Smart Groups, portal sections and a summary of what it gives, with edit and delete actions](/img/llm-gateway/ui/self-service/access-plans-list.jpg)

Without access plans, each app's own lists decide who sees it in the developer portal. The list shows each plan's rank, Smart Groups, portal sections and what it gives, in rank order.

## Which plan applies {#smart-groups}

- A plan matches a person who is in any of its Smart Groups.
- When several plans match, the plan whose matching group has the **lowest rank** wins. Ties go to the plan name.
- Plans **do not combine**: a person gets exactly one plan.
- People no plan matches follow the rule set on the **Overview** tab: **Keep each app's own settings** or **No self-service**. See [People without an access plan](./admin-guide#people-without-an-access-plan).

Ranks belong to the Smart Groups, not the plans. **Change Smart Group ranks** opens the Policy Engine's **Groups** page. See [Smart groups](../../console/settings-organization/smart-groups) and [rank in the Smart groups API](../api-reference/smart-groups-api#rank).

Removing someone from a Smart Group changes their plan, and possibly their keys, everywhere the group is used, within about a minute once the change reaches the gateway.

## Create an access plan

1. Select **New access plan**.
2. Fill in each section below. **What a developer sees**, on the right, updates as you edit.
3. Select **Create plan** (or **Save plan** when editing). The console first checks the impact on personal keys.

### Who it's for

Give the plan a **Name** and an optional **Description**, and pick its **Smart Groups**. Each group shows its rank and member count.

![New access plan editor with Name, Description and Smart Groups on the left and What a developer sees with a sample person on the right](/img/llm-gateway/ui/self-service/access-plan-editor-who.jpg)

### Which apps they see

| Choice | Effect |
|--------|--------|
| **All apps** | The abilities below apply on every app, including apps added later. |
| **Chosen apps** | The abilities apply only on the apps you pick. Every other app is hidden from these people. |
| **One starter app for everyone** | People get their own key in one app and see no app list. The starter app must use personal API keys. |

A starter app suits a company-wide plan. Set **Viewer access** to **Always**, or developers also need to be on the app's own list to get a key. Developers on a starter-app plan get **Issue my developer key** in the portal.

### What they can do in those apps

Set each ability to **Always**, **Only if the app allows** or **Never**.

![What they can do in those apps section with Always, Only if the app allows and Never for each of the five abilities](/img/llm-gateway/ui/self-service/access-plan-editor-abilities.jpg)

| Choice | Effect |
|--------|--------|
| **Always** | The ability on every app the plan covers. |
| **Only if the app allows** (default) | The ability where that app's own lists include them, so app owners stay in control. |
| **Never** | Blocked, even if an app's lists say yes. |

**Viewer access** cannot be **Never**: without it, a plan gives nothing. A deny on an app always wins, including over **Always**.

New plans start with every ability on **Only if the app allows**, so a new plan grants nothing beyond what each app already allows.

### Portal sections

Tick the sections of the developer portal these people see: **My usage**, **LLM Gateway**, **MCP Gateway**, **Workflow agents** and **Skills**. People without a plan see every section.

### Which models they can call

This applies to personal keys only. Shared app keys and sign-in tokens are not limited. Model options are defined on the **Model options** tab; see [Model options](./admin-guide#model-options).

![Which models they can call section with Limit models with model options on, the Fast and Balanced options ticked, Only these model names and Max reasoning effort](/img/llm-gateway/ui/self-service/access-plan-editor-models.jpg)

1. Turn on **Limit models with model options**.
2. Tick the **Model options** these people may call.
3. Choose **Only these model names**:
   - **On**: only these model names can be called or listed. Responses do not name the model that served them.
   - **Off**: other model options are refused, but models outside the list stay callable as each app allows.
4. Optionally set **Max reasoning effort** to low, medium or high (the default is **No cap**). Requests asking for more are lowered to it, never refused.

Developers call an option by its model name. The option's label is only a display name, not an alias. A request for a model the plan does not allow is refused with `self_service_model_not_allowed`.

### Keys

Per developer, per app:

- **Active keys per app**: 1 to 10.
- **Longest key lifetime (days)**: 1 to 3650, or turn on **No lifetime cap**. An app's own maximum still applies when it is shorter.

![Portal sections ticked and the Keys section with Active keys per app set to 3 and Longest key lifetime set to 90 days](/img/llm-gateway/ui/self-service/access-plan-editor-sections-keys.jpg)

### Creating their own apps {#creating-their-own-apps}

Turn on **Let them create their own apps from templates** to let these developers copy an app template into an app they own. Make an app a template on the **Apps** tab first; see [app templates](./admin-guide#let-developers-copy-an-app-app-templates).

| Field | Meaning |
|-------|---------|
| **Templates they may copy** | The templates offered to them. |
| **Apps per developer** | Live apps each developer may hold, 0 to 20. Within the limit, creating an app is immediate; past it, the developer sends you a request. 0 sends every new app to you as a request. |
| **Settings on their own app** | **Change directly**, **Ask for changes** or **Don't see settings**. |

The developer becomes the app owner of their copy. The plan's app and ability limits do not cap them on their own copy, but suspension, the no-plan rule, the app's deny list, and model and key limits still apply. Other app owners and plan grants can give other people access.

## Preview before you save

The right side of the editor runs the unsaved plan through the gateway's own evaluation.

- **What a developer sees**: pick a **Sample person** (people in the plan's Smart Groups are listed first, or type any email). It shows which plan applies to them, their apps and abilities, the models they can call, their key limits, portal sections and whether they can create apps. **Every reason, app by app** expands the details.
- **Count who it reaches**: how many people would get this plan, and how many are in its Smart Groups.
- **What this plan does, in words**: the plan as plain sentences.

When you save or delete a plan, the console checks the impact on personal keys and names the people who would lose (or get back) access to apps they hold personal keys for. When the check is incomplete, tick the acknowledgement to continue.

## Edit or delete a plan

Use the pencil or trash icon on the plan's row. Deleting a plan moves its people to the next matching plan, or to the no-plan rule, and shows the same impact check first. If someone else changed the plan meanwhile, the console loads the latest version and asks you to make your change again.

## Related

- [Admin guide](./admin-guide) - apps, model options, requests and people.
- [Overview](./overview#how-a-decision-is-made) - how one person's access is decided.
- [Self-service API](../api-reference/self-service-api#access-plans-profiles) - plans through the Management API.
