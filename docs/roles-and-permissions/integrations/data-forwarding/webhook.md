---
sidebar_position: 1
sidebar_label: Webhook
sidebar_custom_props:
  icon: Globe
---

# Webhook

Forwards all Extension findings to your webhook endpoint.

## Setup

1. Go to **Integrations** and open the **Available** tab.
2. Click **+ Add** on the **Webhook** tile.
3. Fill in the connection parameters:

| Field | Required | Description |
|-------|----------|-------------|
| Webhook URL | Yes | The HTTPS endpoint Quilr will POST events to |
| API Key | Yes | Passed as both `X-API-KEY` and `Authorization: Bearer` on every request |

4. Click **Allow**.

## Payload

Every delivery is a `POST` with the following headers:

```http
POST {your_url}
Content-Type: application/json
X-API-KEY: {api_key}
Authorization: Bearer {api_key}
```

All events share the same outer envelope:

```json
{
  "signature": "quilr.ai",
  "source": "quilr-ingestion",
  "eventType": "FINDING",
  "tenantId": "acme-corp",
  "correlationId": "ctx-abc-123",
  "version": "1.0",
  "priority": "VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {},
  "events": [ ... ]
}
```

Each object in `events[]` is a finding enriched with risk scoring and posture fields:

```json
{
  "tenant": "acme-corp",
  "subscriber": "subscriber-id",
  "subProduct": "browser extension",
  "timestamp": 1705312200000,
  "data": {
    "user": {
      "username": "jdoe",
      "accountname": "jdoe@acme.com"
    },
    "application": {
      "name": "ChatGPT",
      "url": "https://chat.openai.com"
    },
    "event": {
      "properties": {
        "control": "sensitive-data-prevention",
        "context_id": "ctx-abc-123",
        "risk_level": "HIGH",
        "action_name": "BLOCK",
        "source_app_name": "Slack",
        "destination_app_name": "ChatGPT",
        "usecase_details": "UC-001",
        "alert_type": "finding",
        "alert_status": "open",
        "detections_original": [ "..." ],
        "detections_final": [ "..." ]
      }
    }
  }
}
```
