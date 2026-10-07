---
sidebar_position: 1
sidebar_label: "Syslog"
sidebar_custom_props:
  icon: Activity
---

# Syslog

Forwards the Extension findings to your syslog server based on the controls configured.

:::note Set up in Console V1
Syslog forwarding is configured only on the **Integrations** page of [Console V1](../../console/legacy-v1/overview). The current console's **Settings › Integrations** library has no Syslog card. See [How integrations work](../get-started/how-integrations-work#availability).
:::

## Setup

In Console V1:

1. Go to **Integrations** and open the **Available** tab.
2. Click **+ Add** on the **Syslog** tile.
3. Fill in the connection parameters:

| Field | Required | Description |
|-------|----------|-------------|
| Syslog Server IP/Domain | Yes | IP address or hostname of your syslog server |
| Syslog Server Port | Yes | Port your syslog server listens on |
| Protocol | Yes | Transport protocol: `TCP`, `UDP`, or `TLS` |
| Message Format | No | `RFC 5424` (default) or `RFC 3164` |
| Message Framing | No | TCP only: `None` (default), `Octet-Count`, or `Non-Transparent` |
| Facility | No | Syslog facility to use for outgoing messages |

4. Click **Allow**.

## Payload

Messages are delivered using the selected wire format. RFC 5424 example:

```
<134>1 2024-01-15T10:30:00Z hostname quilr-siem-event - - - {json_body}
```

For TCP, Message Framing marks where one message ends and the next begins - configure your syslog receiver (e.g. rsyslog, syslog-ng) to the same mode:

| Framing | Description | Example |
|---------|--------------|---------|
| `None` (default) | No framing - one message per connection | `<134>1 2024-01-15T10:30:00Z hostname quilr-siem-event - - - {json_body}` |
| `Octet-Count` | RFC 6587 octet-counting - message prefixed with its byte length | `85 <134>1 2024-01-15T10:30:00Z hostname quilr-siem-event - - - {json_body}` |
| `Non-Transparent` | RFC 6587 non-transparent - message ends with a trailing newline | `<134>1 2024-01-15T10:30:00Z hostname quilr-siem-event - - - {json_body}\n` |

The JSON body contains the raw finding with browser and endpoint context:

```json
{
  "event_source": "quilr-alert",
  "event": {
    "id": "uuid",
    "tenant": "acme-corp",
    "subscriber": "subscriber-id",
    "subProduct": "browser extension",
    "timestamp": 1705312200000,
    "data": {
      "user": {
        "username": "jdoe",
        "accountname": "jdoe@acme.com",
        "machinename": 24371751139089044,
        "email_label": "PRIMARY"
      },
      "browser": {
        "name": "Google Chrome",
        "version": "138.0.7204.101",
        "os": "macOS:14.6.0"
      },
      "application": {
        "name": "ChatGPT",
        "url": "https://chat.openai.com"
      },
      "check": {
        "id": "CID_101",
        "name": "data_leak_prevention",
        "properties": {
          "control": "sensitive-data-prevention",
          "context_id": "ctx-abc-123",
          "mode": "Allow_Original_Prompt_With_Mandatory_Justification",
          "alert_type": "finding",
          "alert_status": "open",
          "action_name": "BLOCK",
          "detections_original": [ "..." ],
          "detections_final": [ "..." ]
        }
      }
    }
  }
}
```
