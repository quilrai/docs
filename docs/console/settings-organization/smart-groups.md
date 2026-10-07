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

You can build a group three ways:

| Method | How |
|---|---|
| Manually | **Create Smart Group**, name it and add members |
| From a file | **Import from CSV** |
| From your identity provider | Convert an existing IdP group into a Smart Group |

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
