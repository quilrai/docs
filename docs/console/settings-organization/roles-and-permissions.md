---
sidebar_position: 3
sidebar_label: "Roles and permissions"
sidebar_custom_props:
  icon: ShieldCheck
---

# Roles and permissions

Roles and permissions control who can open which console pages and which data they see. Access is defined by one versioned access policy: roles hold permissions, and people and Smart Groups hold roles.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Roles & Permissions']} />

## How access is decided

The **How access is decided** drawer on the page summarizes the rules:

- **The access policy is the only thing that grants access.** Legacy Console V1 roles and Access Groups no longer apply.
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

1. Edit roles or assignments. Changes go into the shared draft.
2. Review the draft. Check that no one loses access they need, and that at least one person keeps full access.
3. Publish. The change takes effect as a new revision.

:::warning
Because anyone without a role is denied everything, removing someone's last role locks them out of the console. Keep more than one Super Admin.
:::

## Related

- [Smart Groups](./smart-groups)
- [Single sign-on](./single-sign-on)
- [Audit logs](./audit-logs)
