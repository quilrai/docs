---
sidebar_position: 6
sidebar_label: "Action requests"
description: "Approve, reject or revoke the justification requests people raise when a Browser Extension control blocks an action, and optionally email them your reason."
sidebar_custom_props:
  icon: Handshake
console_path: /requests/extension-action-request
aliases: [action request, action requests, extension action request, justification request, access request, unblock request, pending requests, approve request, reject request, bulk approve, bulk reject, blocked action, grant access, revoke access, revoke approval, remove approval, rejection reason, justification email]
---

# Action requests

When a Browser Extension control asks for a justification, the person can explain why they need to continue and request access. Those requests appear on this page, where you approve or reject them. You can revoke an approval later.

<ConsolePath console="WhiteMatter Console" path={['Govern', 'Action Requests']} />

## Before you start

- To view the page, your role needs access to the **Policy** page and the **Read Browser Extension** permission. To decide requests, it also needs **Manage Browser Extension**. Without it, the page is view only.
- Justifications are visible only if your role can see conversation content. Otherwise the column shows **You don't have permission to view this**.
- You can't decide your own requests. Your rows show **Your request** or **Your grant** instead of buttons.
- Requests come only from the Browser Extension. If Browser Extension is turned off in [Data Sources](../settings-organization/data-sources), the page shows no requests.

See [Roles and permissions](../settings-organization/roles-and-permissions).

## How decisions work

| Decision | What it covers | What the person experiences |
|---|---|---|
| **Approve** | The requester, application and action together. It resolves every pending request for that combination and covers future ones too. | They can do the action again. The approval doesn't expire. It lasts until you revoke it. No email is sent. |
| **Reject** | Only the requests you select | The action stays blocked, and they can submit a new request. They get an email with your reason if you choose. |
| **Revoke** | An approval you gave earlier | The action is blocked again, and they must submit a new request. They get an email if you choose. |

A rejection can't be undone. To change your mind after rejecting, wait for the person to submit a new request.

## Find a request

The page has three tabs:

| Tab | Shows |
|---|---|
| **Pending** | Requests waiting for a decision |
| **Rejected** | Rejected requests, including requests closed by a revoke |
| **Approved** | Current approvals, one row for each requester, application and action |

Use the toolbar to narrow the list:

- **Period:** the default is **Last 7 days**. On **Pending**, the period is measured from when the request was made. On **Approved** and **Rejected**, it is measured from when it was decided.
- **Search:** finds requests by the requester's email, the application name or the justification.
- **Sort:** **Newest first** or **Oldest first**.
- **Filters:** narrow by **Application**, **Requester** (by email) or **Action** (**Login**, **Signup**, **Prompt**, **Copy**, **Paste**, **Upload** or **Visit**).

:::tip Can't find an approval?
The **Approved** tab uses the decision date, so an approval given more than 7 days ago is hidden by default. Choose a longer period, up to **Last 1 year**.
:::

## Read the table

| Column | Shows | Tabs |
|---|---|---|
| **Requester** | The person's name, with their email below | All |
| **Application** | The app name, with its domain below | All |
| **Action** | What was blocked, for example **Upload** or **Visit** | All |
| **Justification** | The reason the person gave. Hover to read all of it. | All |
| **Finding** | **View** opens the finding for the blocked event | All |
| **Status** | **PENDING**, **APPROVED** or **REJECTED** | All |
| **Reason** | The reason given for the rejection or revoke | Rejected |
| **Approved by** / **Rejected by** | The email of the admin who decided | Approved, Rejected |
| **Approved at** / **Rejected at** | When it was decided | Approved, Rejected |
| **Requested at** | When the person asked | All |
| **Decision** | **Approve** and **Reject** on Pending, **Revoke** on Approved | Pending, Approved |

Times are shown in your organization's display timezone. Hover over a time to see it in UTC, or in your local time if your organization already uses UTC.

## Approve or reject a request

1. On the **Pending** tab, read the **Justification**. To see what happened, select **View** in the **Finding** column.
2. In the **Decision** column, select **Approve** or **Reject**.
3. If you're rejecting, enter a **Reason (optional)** of up to 500 characters. It appears on the **Rejected** tab and in the audit log.
4. If you're rejecting, keep **Email the requester** selected to send them your reason, or clear it.
5. Select **Approve** or **Reject** to confirm.

## Decide several requests at once

1. On the **Pending** tab, select the checkbox next to each request. The header checkbox selects every request on the current page.
2. Select **Bulk approve** or **Bulk reject**.
3. If you're rejecting, enter a **Reason (optional)**. The same reason applies to every selected request.
4. Keep **Email each requester** selected to send each person one email that lists their rejected requests, or clear it.
5. Select **Approve** or **Reject** to confirm.

If some requests can't be decided, the dialog shows how many failed and why. The others are saved.

## Revoke an approval

1. Open the **Approved** tab. If you can't see the approval, choose a longer period.
2. Select **Revoke** on the row.
3. Enter a **Reason (optional)** of up to 500 characters.
4. Keep **Email the user** selected to tell them their access was revoked, or clear it.
5. Select **Revoke**.

The action is blocked again for that person. Their earlier requests for the same application and action move to the **Rejected** tab, with your name and reason.

:::tip
If you keep approving the same kind of request, the control may be too strict. Review it in [Browser controls](../../browser-extension/configure/browser-controls) instead of approving case by case.
:::

## Related

- [Browser controls](../../browser-extension/configure/browser-controls) - set a control to ask for a justification
- [User Interaction Hub](../settings-sensors/user-interaction-hub) - word the justification popup people see
- [Policy Engine](./policy-engine) - Browser Extension controls
- [Audit logs](../settings-organization/audit-logs) - every decision is recorded as **Decide Action Approval**
- [Roles and permissions](../settings-organization/roles-and-permissions)
