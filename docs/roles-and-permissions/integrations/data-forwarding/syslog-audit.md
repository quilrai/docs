---
sidebar_position: 3
sidebar_label: Syslog Audit
sidebar_custom_props:
  icon: ClipboardList
---

# Syslog Audit

Forwards audit log events to your syslog server. Supports optional filtering to control which audit events are delivered.

## Setup

1. Go to **Integrations** and open the **Available** tab.
2. Click **+ Add** on the **Syslog Audit** tile.
3. Fill in the connection parameters:

| Field | Required | Description |
|-------|----------|-------------|
| Syslog Server IP/Domain | Yes | IP address or hostname of your syslog server |
| Syslog Server Port | Yes | Port your syslog server listens on |
| Protocol | Yes | Transport protocol: `TCP`, `UDP`, or `TLS` |
| Message Format | No | `RFC 5424` (default) or `RFC 3164` |
| Message Framing | No | TCP only. `None` (default), `Octet-Count`, or `Non-Transparent` - see [Message Framing](#message-framing) below |
| Facility | No | Syslog facility to use for outgoing messages |
| Forwarding Scope | Yes | `Send All Audits` forwards every audit event. `Send Filtered Audits` activates the user condition filter below. |

4. If you selected **Send Filtered Audits**, use **Configure user condition** to add filter rules that control which audit events are forwarded.
5. Click **Save**.

## Payload

Messages are delivered using the selected wire format. RFC 5424 example:

```
<142>1 2024-01-15T10:30:00Z hostname quilr-siem-service - - - {json_body}
```

## Message Framing

TCP is a byte stream - it has no built-in way to mark where one message ends and the next begins. Message Framing controls how we mark that boundary, so your syslog server must be configured to parse the same framing you select here. This setting only applies when Protocol is `TCP`; UDP and TLS are unaffected (TLS always uses Octet-Count framing, per RFC 5425).

| Value | Wire format | Example |
|-------|-------------|---------|
| `None` (default) | No framing - raw message | `<142>1 2024-01-15T10:30:00Z hostname quilr-siem-service - - - {json_body}` |
| `Octet-Count` | RFC 6587 octet-counting: each message prefixed with its byte length and a space | `93 <142>1 2024-01-15T10:30:00Z hostname quilr-siem-service - - - {json_body}` |
| `Non-Transparent` | RFC 6587 non-transparent framing: each message ends with a trailing newline | `<142>1 2024-01-15T10:30:00Z hostname quilr-siem-service - - - {json_body}\n` |

`None` matches how this integration has always sent TCP messages - existing integrations are unaffected unless you explicitly change this setting.

The JSON body contains the audit log event:

```json
{
  "event_source": "quilr-audit",
  "event": {
    "trace_id": "uuid-v4",
    "subscriber": "subscriber-id",
    "tenant": "acme-corp",
    "service_name": "quilr-entities-service",
    "event_code": "USR-001",
    "task": "CREATE_USER",
    "category": "USER_MANAGEMENT",
    "resource_type": "USER",
    "resource": "user@acme.com",
    "status": "SUCCESS",
    "log_level": "INFO",
    "actioned_by": "admin@acme.com",
    "actioned_at": "2024-01-15T10:30:00.000Z",
    "extra_info": {},
    "error_info": {}
  }
}
```
