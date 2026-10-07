---
sidebar_position: 7
sidebar_label: "Audit logs"
sidebar_custom_props:
  icon: History
---

# Audit logs

The audit log records who changed or accessed what in the console, and when. Use it for change review, incident investigation and compliance evidence.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Audit Logs']} />

## Find an event

- **Search** with "Description contains...".
- Change the period (default **Last 30 days**).
- Narrow with **Filters**.
- **Export** the current result set.

## Columns

| Column | Shows |
|---|---|
| Actor | Who performed the action |
| Timestamp | When it happened |
| Category | The area of the console |
| Action | What was done |
| Outcome | Whether it succeeded |
| Target | What was changed or accessed |

## Related

- [Export Center](../settings-data/export-center) - the Audit trail quick export
- [Syslog audit events](../../integrations/send-logs-and-alerts/syslog-audit-events) - stream audit events to your SIEM
