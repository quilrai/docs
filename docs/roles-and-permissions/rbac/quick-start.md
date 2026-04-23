---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get up and running with Roles and Permissions in 4 steps.

<StepFlow steps={[
  {
    label: "Invite User",
    items: [
      "Settings → Manage Users",
      "Email: user@company.com",
      "Role: Analyst",
    ],
  },
  {
    label: "Assign Role",
    items: [
      "Roles: Super Admin, Admin",
      "Analyst, Viewer, No Role",
      "Permissions: auto-applied",
    ],
  },
  {
    label: "Change Role",
    items: [
      "Select user → Change Role",
      "New role: Admin",
      "User logged out on change",
    ],
  },
  {
    label: "Review Access",
    items: [
      "User list: name, role, email",
      "Last login visible",
      "Remove access anytime",
    ],
  },
]} />

## 1. Invite a User

Go to **Settings → Organizational Context → Manage Users** → **Add Users** → fill details → click **Send Invite**.

## 2. Assign a Role

Select the appropriate role when inviting the user. Permissions are applied immediately upon acceptance.

- **Super Admin** - owns the tenant and has full access including all destructive actions
- **Admin** - suitable for security operators managing day-to-day controls
- **Analyst** - suitable for security analysts reviewing findings and reports
- **Viewer** - suitable for stakeholders who need visibility without making changes
- **No Role** - revokes all permissions; the user retains their account but loses all access

## 3. Change a User's Role

Go to **Settings → Organizational Context → Manage Users**, find the user in the list, and select role from the dropdown. Choose the new role and confirm. The user will be logged out on refresh and must log back in for the new role to take effect.

Only **Super Admins** and **Admins** can change roles of other users.

## 4. Delete or Revoke Role

**To revoke a role:** Select the user, choose **No Role** from the role dropdown, and confirm. This removes the user's role without deleting their account.

**To delete a Super Admin:** The Super Admin's role must first be revoked by selecting **No Role** before the account can be deleted. A Super Admin cannot revoke their own role - another Super Admin must do it.

> The tenant must always have at least one Super Admin. The last Super Admin's role cannot be revoked.

Only **Super Admins** can delete users.

---

**Next step:** See [Roles and Permissions](./screen-permissions) for a full breakdown of what each role can do across every screen.
