---
sidebar_position: 2
sidebar_label: "Smart Groups"
description: "Create Smart Groups of people, add or remove members by hand or from a CSV file, and reuse the groups in policies, gateway access rules and role assignments."
sidebar_custom_props:
  icon: Layers
console_path: [/settings/organization/groups, /settings/organization/groups/smart-groups, /settings/organization/groups/access-groups]
aliases: [smart groups, groups, create smart group, import from CSV, bulk add members, group membership, remove from group, delete smart group, access groups, converted from IdP group]
---

# Smart Groups

Smart Groups are named sets of people that you reuse across Quilr: in Policy Engine rules, gateway access settings, role assignments and sharing. When you change a group's members, every rule that uses the group follows.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Smart Groups']} action="Create Smart Group" />

## Before you start

- To see Smart Groups, your role needs access to the **Platform access** page and the **Read Smart Groups** permission.
- To create, change or delete groups, it also needs **Manage Smart Groups**. Choosing people also needs **Read users**.
- Without manage permission, the page is view only: the buttons, checkboxes and **Actions** menu are hidden.

If your organization still uses V1 roles, the **Smart Groups** permission controls this page: **Read** to view and **Update** to make changes. See [Roles and permissions](./roles-and-permissions).

## Find a group

Search by Smart Group name or description. The list is sorted by name.

| Column | Shows |
|---|---|
| **Smart Group** | The name, with the description below it. Groups created from your identity provider show a **Converted from IdP group** tag. |
| **Members** | How many people are in the group |
| **Updated** | When the group last changed, and who changed it |
| **Created** | When the group was created, and who created it |

Select **View** on a row to open the group.

## Create a Smart Group

1. Select **Create Smart Group**.
2. Enter a **Name**, for example "Finance approvers".
3. Optionally, enter a **Description** of what the group is for.
4. Under **Users**, search by name or email and select at least one person. Use the **Department** filter to narrow the list. Your selection is kept while you search and change pages.
5. Select **Create**.

You see **Smart Group created**, and the group appears in the list.

:::note Choose the name carefully
You can't rename a Smart Group or change its description after you create it. Names must be unique, ignoring case, and policy rules match Smart Group names ignoring case.
:::

## View a group's members

Select **View** to open the group. The panel shows the name, the description, and when and by whom the group was last updated.

The members table shows each person's **Name**, **Departments**, other **Smart groups**, **IdP user groups**, **IdP user status**, **User risk** and **Total apps**. Search members by name or email.

If your organization uses Access Control V2, the panel also shows:

- **Assigned V2 roles:** the roles this group holds.
- **Effective V2 access:** the roles and capabilities those assignments grant.

To change a group's roles, use **Give access** in [Roles and permissions](./roles-and-permissions).

## Add people to a group

### Choose people

1. Open the group with **View**.
2. Select **Actions**, then **Add users to group**.
3. Select the people to add. People who are already in the group show **Already a member** and can't be selected.
4. Select **Add users**, then **Add users** again to confirm.

You see **Users added**. Policies and access rules that target the group now apply to these people.

### Import from a CSV file

Use a CSV file to add many people at once. The file needs a column headed `email`. Other columns are ignored:

```csv
email,name
alice@example.com,Alice
bob@example.com,Bob
```

**To add people to one group:**

1. Open the group with **View**.
2. Select **Actions**, then **Import from CSV**.
3. Select **Select CSV** and choose your file. The dialog shows how many email addresses it found and a preview of the first rows.
4. Select **Queue bulk add**.

**To add people to several groups:**

1. On the Smart Groups list, select **Import from CSV**.
2. Select **Select CSV** and choose your file, then select **Next**.
3. Under **Choose Smart Groups**, search for and select the groups.
4. Select **Queue bulk add**.

The import runs in the background, so you can close the dialog. To check on it, select **Bulk add progress**, the circular arrow button next to **Import from CSV**. Each import shows **Queued**, **In progress**, **Completed** or **Failed**. A completed import shows how many people were added and how many were skipped. If you stay on the Smart Groups page, a notification also tells you when it finishes.

The import skips:

- Invalid email addresses.
- People who aren't in Quilr.
- People who are already in every group you chose.

An import only adds people. It never removes anyone, so importing the same file again changes nothing. To make a group match a list exactly, [remove](#remove-people-from-a-group) the extra members.

## Remove people from a group

1. Open the group with **View**.
2. Select the checkboxes next to the people to remove.
3. Select **Actions**, then **Remove users from group**.
4. Select **Remove users** to confirm.

You see **Users removed**. Policies and access rules that target the group no longer apply to these people. If you remove everyone, the group stays, with no members.

## Delete a Smart Group

1. Open the group with **View**.
2. Select **Delete Smart Group**, then **Delete Smart Group** again to confirm.

Everyone is removed from the group and the group is deleted.

:::warning
Deleting can't be undone, and Quilr doesn't check whether a policy or access rule still uses the group. Rules that name the group stop matching anyone. Update those rules before you delete the group.
:::

## Groups converted from your identity provider

A **Converted from IdP group** tag in the list means the Smart Group was converted from a user group in your identity provider. On this page, these groups work like any other Smart Group.

## Access Groups (V1 roles only)

If your organization still uses V1 roles, an **Access Groups** tab may appear next to **Smart Groups**. It lists your platform access groups, with their **Status**, **Members** and **Configured roles**. The tab is view only.

When your organization moves to Access Control V2, Access Groups no longer apply and the tab is removed. Assign roles to people or Smart Groups in [Roles and permissions](./roles-and-permissions) instead.

## Where you can use Smart Groups

| Where | What you can do |
|---|---|
| [Policy Engine](../govern/author-simulate-and-publish) | Scope a rule to a Smart Group, or add a **Smart groups** condition |
| [Roles and permissions](./roles-and-permissions) | Give a role to everyone in a group, including people who join later |
| [MCP Gateway server access](../../mcp-gateway/protect/server-access) and [Group & User Rules](../../mcp-gateway/protect/group-and-user-rules) | Allow or deny a group on a server, or give it different tool and guardrail settings |
| [LLM Gateway self-service](../../llm-gateway/self-service/admin-guide#smart-groups) | Allow or deny self-service access for a group |
| [Browser controls](../../browser-extension/configure/browser-controls) | Narrow a control to a group |
| [Export Center](../settings-data/export-center) | Share an export with a group. Access follows current membership. |

Membership changes reach the AI gateways' policy checks within about a minute.

:::tip
Use Smart Groups instead of lists of individual people in policies. When someone joins or leaves the group, every policy that uses it updates without a new revision.
:::

## Limits

| Item | Limit |
|---|---|
| Name | Up to 120 characters, unique ignoring case. `-` and `not available` are reserved. |
| Description | Up to 1,000 characters |
| People per change | Up to 1,000 when you create a group or add people, and up to 500 when you remove people |
| CSV import | Up to 10,000 email addresses and 50 Smart Groups per import |

## Related

- [Roles and permissions](./roles-and-permissions)
- [Users](../observe/users)
- [Audit logs](./audit-logs) - Smart Group changes are recorded there
