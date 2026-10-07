---
sidebar_position: 6
sidebar_label: "Action requests"
sidebar_custom_props:
  icon: Handshake
---

# Action requests

When a browser extension control stops a user from doing something, such as uploading a file or visiting a site, the user can submit a justification and ask for the action to be allowed. Those requests land here for an admin to approve or reject.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Action Request']} />

The page title is **Extension Action Requests**.

## Find a request

- **Search** by requester or application.
- Sort by **Newest first**.
- Change the period (default **Last 7 days**).
- Narrow the list with **Filters**.

## Columns

| Column | Shows |
|---|---|
| Requester | The user who asked |
| Application | The app or site the action was on |
| Action | What was stopped, for example Upload or Visit |
| Justification | The reason the user gave |
| Status | For example PENDING, or the decision once made |
| Decision | **Approve** and **Reject** buttons |
| Requested at | When the user asked |
| Decided by | The admin who decided |
| Decided at | When the decision was made |

## Decide a request

1. Read the **Justification** and check the requester and application.
2. Select **Approve** to allow the action, or **Reject** to keep it blocked.
3. The status updates and **Decided by** and **Decided at** record who decided and when.

:::tip
If you keep approving the same kind of request, the control may be too strict. Review it in [Browser controls](../../browser-extension/configure/browser-controls) instead of approving case by case.
:::

## Related

- [End-user popups](../settings-sensors/end-user-popups) - word the justification prompt users see
- [Policy Engine](./policy-engine) - Browser Extension controls
