---
sidebar_position: 7
sidebar_label: "Audit logs"
description: "Review who changed what in the console and when: search and filter audit events, see before-and-after changes, follow an actor or session, and export the results."
sidebar_custom_props:
  icon: History
console_path: /settings/organization/audit-logs
aliases: [audit logs, audit trail, change history, who changed what, activity log, sign-in history, admin activity]
---

# Audit logs

The audit log records who did what in the console, and when: sign-ins, changes to settings and access, and sensitive actions such as revealing masked data or exporting reports. Use it to review changes, investigate incidents and collect compliance evidence.

<ConsolePath console="WhiteMatter Console" path={['Settings', 'Organization', 'Audit Logs']} />

## Before you start

- To open the page, your role needs access to the **Platform access** page and the **Read audit logs** permission.
- To export events, your role also needs **Export audit logs** and access to [Export Center](../settings-data/export-center).

See [Roles and permissions](./roles-and-permissions).

## Find an event

The list shows the newest events first. The number of matching events, for example **1,240 events**, appears next to the period.

### Choose a period

Select the period button and pick **Last 24 hours**, **Last 3 days**, **Last 7 days**, **Last 30 days**, **Last 3 months**, **Last 6 months** or **Last 1 year**. The default is **Last 30 days**.

For specific dates, select **Select range**, pick a start and end day, then select **Ok**. You can go back up to one year.

### Search

There are two search boxes:

- **Search actor, session, page, target, or request ID** finds events by the person's email, session, console page, target, request ID, IP address or browser.
- **Description contains…** searches only the event description.

### Filter

Select **Filters**, or press **F**, to narrow the list.

| Filter | Narrows to |
|---|---|
| **Actor** | The people who performed the action, by email |
| **Signed in with** | How the actor signed in, for example SAML or an API key |
| **Category** | The type of activity, for example Configuration or Sensitive Access |
| **Action** | Specific actions |
| **Target type** | The kind of record that was changed or accessed, for example a user or an API key |
| **Outcome** | Whether the action succeeded |
| **Source** | The part of the platform that recorded the event |
| **IP address** | The address the request came from |

Each filter lists only the values recorded in the selected period. Choosing several values in one filter shows events that match any of them. Combining filters shows only events that match all of them.

:::tip Filter names can differ from table labels
The **Action** and **Signed in with** filters show the stored event name, which can read differently from the label in the table. For example, **Signed in with SAML** in the table is **Sign In With Saml** in the filter, and **Requested sensitive data reveal** is **Reveal Sensitive Data**.
:::

## Read the table

| Column | Shows |
|---|---|
| **Actor** | The person who performed the action. Select the name to see all of their activity. Automated events show **System**. |
| **Timestamp** | When it happened, in your organization's display timezone. Hover to see the time in UTC, or in your local time if your organization already uses UTC. |
| **Category** | The type of activity |
| **Action** | What was done. Hover over an underlined action to see its description. |
| **Outcome** | The result, for example **Success**, **Failure** or **Denied** |
| **Target** | The type and name of the record that was changed or accessed |

Use **Rows per page** to show 10, 25 or 50 events. The default is 25.

The display timezone is set in [Display](../settings-sensors/display-and-profile#display).

## Inspect an event

Select the arrow at the end of a row to open the event details. The panel title is the action, and the line below shows the actor and target.

| About | Fields |
|---|---|
| The actor | **Actor**, **Actor type** (for example Platform User or Self Service User), **Signed in with** |
| The action | **Category**, **Action**, **Target type**, **Target**, **Target ID**, **Outcome**, **Reason** (when recorded), **Description** |
| The request | **Timestamp**, **Event ID**, **Source**, **IP address**, **Session fingerprint**, **Page**, **Browser information**, **Request ID**, **HTTP request**, **HTTP status** |

Fields that weren't captured for an event show **Not recorded**.

### See what changed

**Changes (before → after)** compares the record before and after the change, line by line. Unchanged lines are folded. Select **Show N unchanged lines** to expand them.

- Select **Before** or **After** to copy one side.
- Select **Copy JSON** to copy the full event and both snapshots, for example to attach to a ticket.

Secrets in snapshots appear as `[REDACTED]`. Events that only record someone opening a record show **Recorded event** instead, with no before and after.

## Follow the trail

From the event details, you can pivot to related activity:

| Button | Shows |
|---|---|
| **Activity for this record** | Every event on the same target |
| **Activity by this actor** | Everything the same person did |
| **View session activity** | Everything done in the same sign-in session |

Each pivot keeps your period and clears other filters and searches, so related events aren't hidden. The **Target ID** or **Session** filter it adds appears under **Filters**, where you can remove it.

When an event points to a record, a button such as **Open finding**, **Open conversation**, **Open user**, **Open agent** or **Open inventory asset** takes you to it. If only the record's ID was recorded, the button searches for it instead, for example **Search for finding**.

## What gets recorded

| Activity | Examples |
|---|---|
| Sign-ins | **Signed in with password**, **Signed in with Microsoft**, **Signed in with Google**, **Signed in with SAML** |
| Access changes | **Created API key**, **Renamed API key**, **Revoked API key**, and changes to users and Smart Groups |
| Configuration changes | Changes to settings, controls, policies and integrations |
| Opening records | **Opened** followed by the record type, for example **Opened inventory asset**. Reveals and copies appear as separate actions. |
| Sensitive reads | **Requested sensitive data reveal** when someone uses **Reveal values** in a [Findings & Interactions](../observe/findings-and-interactions) drawer, **Requested conversation copy** when someone copies conversation content, and copies of LLM Gateway secrets and connector tokens |
| Exports and downloads | Exports of dashboards, red-team reports, agent output and Policy Engine workbooks, and downloads of exported files |

To review who revealed or copied sensitive data, filter **Category** to **Sensitive Access**.

Console page views and Quilr Assist questions are not listed. You can look back up to one year.

## Export audit logs

Select **Export** to open [Export Center](../settings-data/export-center) with your current period, filters and searches already filled in. From there you can run the export once or on a schedule, as **JSONL** or an **Excel workbook**.

For a ready-made export of admin activity, use the **Audit trail** quick export in Export Center.

## Related

- [Export Center](../settings-data/export-center) - custom, scheduled and quick exports of audit events
- [Syslog audit events](../../integrations/send-logs-and-alerts/syslog-audit-events) - stream audit events to your SIEM
- [Roles and permissions](./roles-and-permissions) - who can view and export audit logs
- [Single sign-on](./single-sign-on) - SAML sign-ins appear here as **Signed in with SAML**
