---
sidebar_position: 3
sidebar_label: "Roles and permissions"
sidebar_custom_props:
  icon: ShieldCheck
description: "Migrating from V1 roles, how the V2 access policy decides access, roles and assignments, and publishing access changes safely."
---

# Roles and permissions

Roles and permissions control who can open which console pages and which data they see. Access is defined by one versioned access policy: roles hold permissions, and people and Smart Groups hold roles.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Roles & Permissions']} />

:::warning Check which model your tenant is on
Everything below the next section applies **after** your tenant migrates to Access Control V2. Until then, V1 roles decide access and this page is read-only, with a **Review the migration** banner. Migration is optional and permanent.
:::

## Before you migrate

The **Review the migration** banner (or **Continue in read-only mode** to dismiss it) is shown until your tenant migrates. Starting the migration needs an Admin, Super Admin, or a user with an RBAC_ADMIN write grant.

1. Select **Review the migration**, then generate the read-only plan. It shows **Roles V2 creates**, **Users keep access**, **Users denied**, **Recovery admins** and **Unmapped permissions**, and compares each V1 role with its console, data and change access after migration.
2. Resolve every unmapped permission, and make sure at least one recovery administrator remains. Activation is blocked until both are true.
3. Under **Verify and make V2 authoritative**, activate. Activation rereads V1 and stops if anything changed since the preview; run a new preview if so.
4. Confirm by typing `ACTIVATE RBAC V2`, then **Activate irreversibly**. The tenant can never return to V1 authorization, and users without an imported role are denied immediately.

If another administrator activates while you have the migration page open, it asks you to **Reload session**.

## How access is decided

The **How access is decided** drawer on the page summarizes the rules:

- **The access policy is the only thing that grants access.** After migration, legacy Console V1 roles and Access Groups no longer apply.
- **No role means no access.** Anyone without a role assignment is denied everything.
- **Deny beats allow.** When rules conflict, an explicit deny beats every allow.
- **Pages and data are separate decisions.** Opening a page and seeing its data are decided separately. Every narrowed data choice applies together, so a role that sees **All data** cannot widen another role that narrows it.
- **Shared draft, then publish.** Edits autosave into one shared draft. Nothing changes for anyone until the draft is published, and publishing creates the next numbered revision. The version selector shows the live one, for example **Active v51**.

## People and Group

Who holds which roles. Switch between **People** and **Smart Groups**.

| Column | Shows |
|---|---|
| User | The person |
| Status | Account status |
| Roles | Roles held directly or through a group |
| Smart Groups | Group memberships |
| Last login | Most recent console sign-in |

Actions: **Give access** (assign a role), **Add user**, and per row **View**, **Remove Role** and **Remove User**.

:::tip
Assign roles to [Smart Groups](./smart-groups) rather than to individuals where you can. New joiners get the right access as soon as they are added to the group.
:::

## Roles

All roles, with **+ New role** to create one.

| Column | Shows |
|---|---|
| Role | Name and description |
| Holders | How many people and groups hold the role |
| Access | Permissions granted out of the total (for example 57/107), with a count of explicit denies |
| Sees | **All data**, or **Narrowed** when the role limits which data is visible |

Expand a role to see its permission counts per area: Pages, Overview, Users, Graph, Agents, Inventory, Dashboards, Costs, Policy, LLM Gateway, MCP Gateway, Endpoint, Browser, Skills, Secrets, Integrations, Data, Outputs, Audit and Administration. From there, **Edit permissions** or **View users**.

Built-in roles include **Super Admin** (full access), **Admin**, **Analyst** and **Viewer**. Use them as starting points and create narrower roles for specific teams, for example an AI Gateway admin or a findings reviewer.

## Change access safely

1. Edit roles or assignments. Changes autosave into the shared draft, and a bar at the bottom of the page shows how many changes are not in effect yet.
2. Select **Review changes**. The draft drawer compares the active revision with the draft, with a **Summary** tab and a **Raw** difference. Check that no one loses access they need, and that at least one person keeps full access.
3. Select **Publish v52** (the button names the next revision). The first step lists exactly what will publish and, when roles narrow data, an estimate of the access added and removed per role. **Continue**, enter a **Reason** (recorded in the audit log), confirm material changes when asked, then **Publish**. The change takes effect immediately as the next revision.

Without permission to manage roles you can still edit the draft; it takes effect when an administrator publishes it. The draft drawer can also discard the draft.

### History

Select the **Active v51** version button to open **Policy history**. It lists every published revision with its number, who published it, when, and the reason. The newest is tagged **Active**. Select **Diff** on a revision to see what it changed from the one before. **Audit events** at the bottom lists the configuration actions taken on the policy. History is read-only: to undo a change, edit the draft back and publish a new revision.

:::warning
Because anyone without a role is denied everything, removing someone's last role locks them out of the console. Keep more than one Super Admin.
:::

## Related

- [Smart Groups](./smart-groups)
- [Single sign-on](./single-sign-on)
- [Audit logs](./audit-logs)
