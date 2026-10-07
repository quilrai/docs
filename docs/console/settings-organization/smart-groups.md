---
sidebar_position: 2
sidebar_label: "Smart Groups"
sidebar_custom_props:
  icon: Layers
---

# Smart Groups

Smart Groups are named sets of people that you reuse across the console: in Policy Engine conditions, browser and endpoint controls, and access assignments in [Roles and permissions](./roles-and-permissions).

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Smart Groups']} action="Create Smart Group" />

## Create a Smart Group

Select **Create Smart Group**, enter a **Name** (for example "Finance approvers") and an optional **Description**, and select at least one user. To add more people later, open the group with **View**, or bulk add them from a CSV file.

Groups converted from a user group in your identity provider are tagged **Converted from IdP group** in the list.

## Bulk add members from a CSV

**Import from CSV** adds the people listed in a file to one or more existing Smart Groups. Create the groups first.

The file needs a column headed `email`. Other columns are ignored:

```csv
email,name
alice@example.com,Alice
bob@example.com,Bob
```

1. Select **Import from CSV**, then **Select CSV**. The modal shows how many email addresses it found and a preview of the file.
2. Select **Next** to **Choose Smart Groups**, then search for and select the groups to add the people to.
3. Select **Queue bulk add**. The add runs in the background.
4. Follow it with the **Bulk add progress** button next to **Import from CSV**. Each job shows **Queued**, **In progress**, **Completed** or **Failed**, with the error for a failed job.

One import can include at most 10,000 email addresses. Invalid addresses, people who are not in Quilr, and people already in the group are skipped. If the file has no `email` column, the modal asks you to add one and select the file again.

## The list

Search by name. Columns: **Smart Group**, **Members**, **Updated**, **Created** and **View**. Select **View** to see and edit a group's members.

## Using Smart Groups in policies

- In the [Policy Engine](../govern/policy-engine), the **Smart group** scope shortcut adds a group condition with a seeded priority of 700. That places it above an everyone default and below a rule for one person.
- Policy conditions match Smart Group names ignoring case.
- Smart Groups are distinct from the roles that grant console access.

:::tip
Prefer Smart Groups over lists of individual users in policies. When someone joins or leaves the group, every policy that uses it updates without a new revision.
:::

## Related

- [Roles and permissions](./roles-and-permissions)
- [Users](../observe/users)
