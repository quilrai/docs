---
sidebar_position: 6
sidebar_label: "Users"
sidebar_custom_props:
  icon: UserCog
---

# Users

Users shows each person's AI usage and risk, and how well Quilr's sensors
cover them. Open it from **Observe > Users**. The page has five tabs: **All
users**, **Browser deployment**, **Endpoint deployment**, **Accounts** and
**Quilly**.

![Users in the console](/img/console-v2/pages/users.jpg)

## All users

One card or row per person, scoped by **Activity period**.

- **Headline tiles**: **People**, **Flagged people**, **Off-hours actors** and
  **Activity**.
- **Person cards**: the apps and topics the person uses, their product
  posture per sensor, usage, active hours, risk and origin.
- **Controls**: saved views, **Cards** or **Table** layout, **Columns**, **Add
  filter**, **Refresh users** and **Export**. See
  [Views, filters and drawers](../get-started/views-filters-and-drawers).

Click **Full profile** on a card (or a name anywhere in the console) to open
the person's profile.

### Person profile drawer

The header shows the person's sensor, directory, extension and endpoint
status, and their groups, with **Refresh profile** and **Open in
interactions**. The left navigation has:

- **Overview**, **Graph**, **Interactions**, **Inventory**, **Accounts** and
  **Origin & access**,
- **LLM Gateway**: **Connections**, **Requests**, and **Usage & cost**,
- **MCP Gateway**: **Connections** and **Tool calls**,
- **Deployment & devices**.

## Browser deployment

Browser Extension coverage across people: how many are reporting and how many
are not, which extension versions are behind the latest, which browsers are in
use, and whether the Browser Utility is on. The table lists each user's
status.

To check and fix rollout problems, see
[Validate deployment](../../browser-extension/deploy/validate-deployment).

## Endpoint deployment

Endpoint Agent coverage by workstation.

- **Headline tiles**: **Workstations**, **Enabled**, **Disabled**, **Without
  persona** and **Latest version**.
- **Table**: Workstation, User, OS, Agent version, Status and Last registered.
- **Actions**: search, and bulk **Enable** or **Disable** of the agent on
  selected workstations.

See [Deployment and status](../../endpoint-agent/deploy-and-operate/deployment-and-status).

## Accounts

The AI accounts people use, and whether they are personal or corporate.

- **Headline tiles**: **Accounts**, **Users**, **Interactions**, and open and
  total findings.
- **Table**: Account, User, Application, Source, approval of the account and
  app, **Account type** (**Personal** or **Corporate**), Risk, Activity, and
  first and last observed.

Use it to find work done in personal accounts.

Select up to 50 accounts and choose **Activate Agent** to have a Quilly agent
follow up on their findings. The same action is on **All users** for selected
people. See
[Activate an agent](./findings-and-interactions#activate-an-agent).

## Quilly

Quilly is Quilr's AI coach for end users. This tab is the feed of Quilly
conversations, split into **Findings**, **Coach** and **User initiated**. Each entry shows a summary, the user, the control, status,
the action taken, tools used and severity.
