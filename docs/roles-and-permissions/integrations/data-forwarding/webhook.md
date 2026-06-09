---
sidebar_position: 1
sidebar_label: Webhook
sidebar_custom_props:
  icon: Globe
---

# Webhook

Forwards Extension findings and audit log events to your webhook endpoint.

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

Webhook deliveries use the same outer envelope. The `eventType` tells you how to interpret the objects in `events[]`:

- `FINDING`: browser extension finding events.
- `AUDIT_LOG`: audit log events.

## Finding Events

Finding deliveries use `eventType: "FINDING"`. Each object in `events[]` is a finding event.

### Finding Envelope

```json
{
  "signature": "quilr.ai",
  "source": "quilr-ingestion",
  "eventType": "FINDING",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "11111111-1111-4111-8111-111111111111",
  "version": "1.0",
  "priority": "VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {},
  "events": [ ... ]
}
```

### Sample Finding Event

```json
{
  "name": "Browser Extension",
  "description": "Browser Extension for security",
  "type": "extensionBrowser",
  "vendor": "Quilr",
  "product": "browser.extension",
  "subProduct": "browser extension",
  "data": {
    "user": {
      "username": "Alex Example",
      "accountname": "alex.example@example.com",
      "machinename": 10000000000000001,
      "ai_app_accounts_exist": false,
      "email_label": "PRIMARY"
    },
    "application": {
      "name": "Example AI App",
      "url": "https://app.example.com/",
      "domain": "app.example.com",
      "authenticationtype": "CredsBased",
      "is_newly_introduced": false
    },
    "check": {
      "id": "CID_16",
      "name": "paste",
      "properties": {
        "context_id": "11111111-1111-4111-8111-111111111111",
        "control": "example-pasting-data",
        "resolution_channel": "browser",
        "mode": "Justify",
        "action_name": "Justification from user for pasting data",
        "outcome": "Custom Justification Provided"
      }
    }
  },
  "subscriber": "00000000-0000-4000-8000-000000000002",
  "tenant": "00000000-0000-4000-8000-000000000001",
  "timestamp": 1781012841827
}
```

### Finding Event Types

<details className="webhook-sample-details">
<summary>Paste finding</summary>

```json
{
  "source": "quilr-ingestion",
  "eventType": "FINDING",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "11111111-1111-4111-8111-111111111111",
  "priority": "MEDIUM",
  "events": [
    {
      "name": "Browser Extension",
      "description": "Browser Extension for security",
      "type": "extensionBrowser",
      "vendor": "Quilr",
      "product": "browser.extension",
      "subProduct": "browser extension",
      "data": {
        "user": {
          "username": "Alex Example",
          "accountname": "alex.example@example.com",
          "machinename": 10000000000000001,
          "ai_app_accounts_exist": false,
          "email_label": "PRIMARY"
        },
        "browser": {
          "name": "Example Browser",
          "version": "100.0.0.0",
          "os": "ExampleOS:1.0",
          "useragent": "Mozilla/5.0 (ExampleOS) AppleWebKit/537.36 (KHTML, like Gecko) ExampleBrowser/100.0.0.0 Safari/537.36"
        },
        "extension": {
          "id": "example-browser-extension",
          "version": "1.0.0"
        },
        "application": {
          "name": "Example AI App",
          "url": "https://app.example.com/",
          "domain": "app.example.com",
          "authenticationtype": "CredsBased",
          "is_newly_introduced": false
        },
        "check": {
          "id": "CID_16",
          "name": "paste",
          "properties": {
            "context_id": "11111111-1111-4111-8111-111111111111",
            "control": "example-pasting-data",
            "resolution_channel": "browser",
            "mode": "Justify",
            "action_name": "Justification from user for pasting data",
            "user_mail": "alex.example@example.com",
            "summary": {
              "header": "Data Transfer Blocked!",
              "justification_list": [
                "Needed for current project",
                "This app is approved for my team",
                "Manager approved this workflow",
                "Testing/development work",
                "One-time urgent need"
              ],
              "title": "Pasting data to this app is not allowed by company policy. <br />Provide a business reason for moving this data:",
              "description": "*Specify business justification?*",
              "acknowledgedButtons": []
            },
            "outcome": "Custom Justification Provided",
            "user_justification": "Needed for current project",
            "copiedContent": {
              "sensitive": false,
              "source": {
                "application": {}
              },
              "findings": []
            }
          }
        }
      },
      "subscriber": "00000000-0000-4000-8000-000000000002",
      "tenant": "00000000-0000-4000-8000-000000000001",
      "timestamp": 1781012841827
    }
  ]
}
```

</details>

<details className="webhook-sample-details">
<summary>Copy finding</summary>

```json
{
  "source": "quilr-ingestion",
  "eventType": "FINDING",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "22222222-2222-4222-8222-222222222222",
  "priority": "MEDIUM",
  "events": [
    {
      "name": "Browser Extension",
      "description": "Browser Extension for security",
      "type": "extensionBrowser",
      "vendor": "Quilr",
      "product": "browser.extension",
      "subProduct": "browser extension",
      "data": {
        "user": {
          "username": "Jordan Example",
          "accountname": "jordan.example@example.com",
          "machinename": 10000000000000002,
          "ai_app_accounts_exist": false,
          "email_label": "PRIMARY"
        },
        "browser": {
          "name": "Example Browser",
          "version": "100.0.0.0",
          "os": "ExampleOS:1.0",
          "useragent": "Mozilla/5.0 (ExampleOS) AppleWebKit/537.36 (KHTML, like Gecko) ExampleBrowser/100.0.0.0 Safari/537.36"
        },
        "extension": {
          "id": "example-browser-extension",
          "version": "1.0.0"
        },
        "application": {
          "name": "Example AI App",
          "url": "https://app.example.com/",
          "domain": "app.example.com",
          "authenticationtype": "CredsBased",
          "is_newly_introduced": false
        },
        "check": {
          "id": "CID_16",
          "name": "copy",
          "properties": {
            "context_id": "22222222-2222-4222-8222-222222222222",
            "control": "example---copying-data",
            "resolution_channel": "browser",
            "mode": "Block",
            "action_name": "Block user from copying data",
            "user_mail": "jordan.example@example.com",
            "summary": {
              "header": "Data Transfer Blocked!",
              "justification_list": [],
              "acknowledgedButtons": [],
              "title": "Your company's security policy does not allow copying data from this app\n<br />If you believe this is an error, contact your Security Team for assistance.\n",
              "description": "*Specify business justification?*"
            },
            "outcome": "Blocked",
            "user_justification": "",
            "copiedContent": {
              "sensitive": false,
              "source": {
                "application": {
                  "domain": "app.example.com",
                  "name": "Example AI App"
                }
              },
              "findings": []
            }
          }
        }
      },
      "subscriber": "00000000-0000-4000-8000-000000000002",
      "tenant": "00000000-0000-4000-8000-000000000001",
      "timestamp": 1781012842775
    }
  ]
}
```

</details>

<details className="webhook-sample-details">
<summary>Upload finding</summary>

```json
{
  "source": "quilr-ingestion",
  "eventType": "FINDING",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "33333333-3333-4333-8333-333333333333",
  "priority": "MEDIUM",
  "events": [
    {
      "name": "Browser Extension",
      "description": "Browser Extension for security",
      "type": "extensionBrowser",
      "vendor": "Quilr",
      "product": "browser.extension",
      "subProduct": "browser extension",
      "data": {
        "user": {
          "username": "Taylor Example",
          "accountname": "taylor.example@example.com",
          "machinename": 10000000000000003,
          "ai_app_accounts_exist": false,
          "email_label": "PRIMARY"
        },
        "browser": {
          "name": "Example Browser",
          "version": "100.0.0.0",
          "os": "ExampleOS:1.0",
          "useragent": "Mozilla/5.0 (ExampleOS) AppleWebKit/537.36 (KHTML, like Gecko) ExampleBrowser/100.0.0.0 Safari/537.36"
        },
        "extension": {
          "id": "example-browser-extension",
          "version": "1.0.0"
        },
        "application": {
          "name": "Example AI App",
          "url": "https://app.example.com/new",
          "domain": "app.example.com",
          "authenticationtype": "CredsBased",
          "is_newly_introduced": false
        },
        "check": {
          "id": "CID_22",
          "name": "upload",
          "properties": {
            "context_id": "33333333-3333-4333-8333-333333333333",
            "credentials": {
              "email": ""
            },
            "file": [
              {
                "lastModified": 1778478113315,
                "name": "example-sensitive-file.png",
                "size": 108085,
                "type": "image/png",
                "detection": [
                  {
                    "name": "example restricted content",
                    "code_name": "example restricted content",
                    "attributes": [],
                    "id": "example restricted content",
                    "detection_type": null,
                    "type": "classify",
                    "class": "example restricted content",
                    "classification": true,
                    "reason": "example restricted content found in the file"
                  }
                ],
                "path": "c:\\users\\example\\downloads\\example-sensitive-file.png",
                "label": "",
                "metadata": {
                  "file_extension": "png",
                  "mime_type": "image/png",
                  "path_extension": "png",
                  "file_path": "c:\\users\\example\\downloads\\example-sensitive-file.png",
                  "file_kind": "Image"
                }
              }
            ],
            "control": "example---upload-sensitive-data",
            "resolution_channel": "browser",
            "mode": "Ask",
            "action_name": "Prompt user about uploading sensitive data",
            "outcome": "Blocked",
            "user_justification": "Blocked"
          }
        }
      },
      "subscriber": "00000000-0000-4000-8000-000000000002",
      "tenant": "00000000-0000-4000-8000-000000000001",
      "timestamp": 1781012843289
    }
  ]
}
```

</details>

<details className="webhook-sample-details">
<summary>DLP prompt finding</summary>

```json
{
  "source": "quilr-ingestion",
  "eventType": "FINDING",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "44444444-4444-4444-8444-444444444444",
  "priority": "MEDIUM",
  "events": [
    {
      "name": "Browser Extension",
      "description": "Browser Extension for security",
      "type": "alerts",
      "vendor": "Quilr",
      "product": "browser.extension",
      "subProduct": "browser extension",
      "data": {
        "user": {
          "username": "Morgan Example",
          "accountname": "morgan.example@example.com",
          "machinename": 10000000000000004,
          "ai_app_accounts_exist": false,
          "email_label": "PRIMARY"
        },
        "browser": {
          "name": "Example Browser",
          "version": "100.0.0.0",
          "os": "ExampleOS:1.0",
          "useragent": "Mozilla/5.0 (ExampleOS) AppleWebKit/537.36 (KHTML, like Gecko) ExampleBrowser/100.0.0.0 Safari/537.36"
        },
        "extension": {
          "id": "example-browser-extension",
          "version": "1.0.0"
        },
        "application": {
          "name": "Example AI App",
          "url": "https://app.example.com/",
          "domain": "app.example.com",
          "authenticationtype": "Guest",
          "is_newly_introduced": false
        },
        "check": {
          "id": "CID_101",
          "name": "prompt",
          "log_type": "prompt_request",
          "properties": {
            "credentials": {
              "email": "morgan.example@example.com"
            },
            "mode": "Allow_Original_Prompt_With_Mandatory_Justification",
            "alert_type": "finding",
            "original_prompt": "\"Alex Example, born on January 1, 1990, holds a sample bank account with Example Bank. The account number is SAMPLE-ACCOUNT-0001 and the routing code is EXAMPLE0001. Alex recently updated the sample tax ID SAMPLE-TAX-0001 for demo tax records. Alex resides at 123 Example Street, Demo City, and the contact number is +1-555-0100.\"\"Jamie Example, born on February 2, 1992, has a sample savings account with account number SAMPLE-ACCOUNT-0002. The sample national ID is SAMPLE-NATIONAL-ID-0002. Jamie also holds a sample insurance record with record number SAMPLE-INSURANCE-0002 and recently updated contact details as jamie.example@example.com.\"\n",
            "final_prompt": "",
            "user_justification": "",
            "action_name": "Allow_Original_Prompt_With_Mandatory_Justification",
            "summary": "User was provided the option to remove sensitive data or provide mandatory justification to move forward",
            "outcome": "User did not submit any prompt",
            "size": 0,
            "is_initial_sensitive": true,
            "is_final_sensitive": false,
            "resolution_channel": "browser",
            "alert_status": "closed",
            "action_taken": "Blocked",
            "prompt_changed": false,
            "detections_original": [
              {
                "name": "Personally Identifiable Information (PII)",
                "code_name": "Personally Identifiable Information (PII)",
                "attributes": [
                  {
                    "attribute_name": "+1-555-0100",
                    "category": "PHONE NUMBER"
                  },
                  {
                    "attribute_name": "jamie.example@example.com",
                    "category": "EMAIL ADDRESS"
                  },
                  {
                    "attribute_name": "SAMPLE-NATIONAL-ID-0002",
                    "category": "NATIONAL ID NUMBER"
                  },
                  {
                    "attribute_name": "January 1, 1990",
                    "category": "DATE OF BIRTH"
                  },
                  {
                    "attribute_name": "February 2, 1992",
                    "category": "DATE OF BIRTH"
                  }
                ],
                "entities": [
                  "+1-555-0100",
                  "jamie.example@example.com",
                  "SAMPLE-NATIONAL-ID-0002",
                  "January 1, 1990",
                  "February 2, 1992"
                ],
                "id": "data_risk_category_pii",
                "detection_type": "pattern",
                "class": "Personally Identifiable Information (PII)",
                "classification": false,
                "reason": "Personally Identifiable Information (PII) found in the text with pattern matching"
              },
              {
                "name": "Payment and Financial Information (PFI)",
                "code_name": "Payment and Financial Information (PFI)",
                "attributes": [
                  {
                    "attribute_name": "SAMPLE-PAN-0002",
                    "category": "PAN CARD"
                  },
                  {
                    "attribute_name": "SAMPLE-ACCOUNT-0002",
                    "category": "BANK ACCOUNT NUMBER"
                  },
                  {
                    "attribute_name": "SAMPLE-TAX-0001",
                    "category": "TAX INFORMATION"
                  },
                  {
                    "attribute_name": "SAMPLE-ACCOUNT-0001",
                    "category": "BANK ACCOUNT NUMBER"
                  }
                ],
                "entities": [
                  "SAMPLE-PAN-0002",
                  "SAMPLE-ACCOUNT-0002",
                  "SAMPLE-TAX-0001",
                  "SAMPLE-ACCOUNT-0001"
                ],
                "id": "data_risk_category_pfi",
                "detection_type": "contextual",
                "class": "Payment and Financial Information (PFI)",
                "classification": false,
                "reason": "Payment and Financial Information (PFI) found in the text"
              }
            ],
            "detections_final": [],
            "control": "test--preventing-the-leakage-of-sensitive-data-via-an-ai-app",
            "context_id": "44444444-4444-4444-8444-444444444444"
          }
        }
      },
      "subscriber": "00000000-0000-4000-8000-000000000002",
      "tenant": "00000000-0000-4000-8000-000000000001",
      "timestamp": 1781012843803
    }
  ]
}
```

</details>

<details className="webhook-sample-details">
<summary>Identity login finding</summary>

```json
{
  "source": "quilr-ingestion",
  "eventType": "FINDING",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "55555555-5555-4555-8555-555555555555",
  "priority": "MEDIUM",
  "events": [
    {
      "name": "Browser Extension",
      "description": "Browser Extension for security",
      "type": "extensionBrowser",
      "vendor": "Quilr",
      "product": "browser.extension",
      "subProduct": "browser extension",
      "data": {
        "user": {
          "username": "Casey Example",
          "accountname": "casey.example@example.com",
          "machinename": 10000000000000005,
          "ai_app_accounts_exist": true,
          "email_label": "PRIMARY"
        },
        "browser": {
          "name": "Example Browser",
          "version": "100.0.0.0",
          "os": "ExampleOS:1.0",
          "useragent": "Mozilla/5.0 (ExampleOS) AppleWebKit/537.36 (KHTML, like Gecko) ExampleBrowser/100.0.0.0 Safari/537.36"
        },
        "extension": {
          "id": "example-browser-extension",
          "version": "1.0.0"
        },
        "application": {
          "name": "Example SaaS App",
          "url": "https://saas.example.com/app/",
          "domain": "saas.example.com",
          "authenticationtype": "CredsBased",
          "is_newly_introduced": false
        },
        "check": {
          "id": "CID_16",
          "name": "login",
          "properties": {
            "context_id": "55555555-5555-4555-8555-555555555555",
            "control": "logging-into-saas-applications-using-compromised-passwords",
            "resolution_channel": "browser",
            "mode": "Ask",
            "action_name": "Prompt to change compromised password post login",
            "user_mail": "casey.example@example.com",
            "summary": {
              "header": "Warning: Compromised Password!",
              "title": "Your password may have been exposed.\n<br />Please update it to something stronger or use a password manager. Help keep your account safe!\n<br  />\n<br />Your actions matter \u2014 help keep your organization safe!\n",
              "description": "",
              "acknowledgedButtons": [
                "Using a strong password",
                "Will change my password"
              ]
            },
            "suppressed_controls": [
              "example-suppressed-control-001",
              "example-suppressed-control-002",
              "example-suppressed-control-003",
              "example-suppressed-control-004",
              "example-suppressed-control-005",
              "example-suppressed-control-006"
            ],
            "cred_fingerprint_id": "66666666-6666-4666-8666-666666666666",
            "signup": false,
            "credentials": {
              "email": "casey.example@example.com"
            },
            "credential_shared": {
              "status": false
            },
            "password_strength": 2,
            "compromised_password": {
              "status": true,
              "source": "hibp"
            },
            "credential_reused": {
              "status": false
            },
            "using_password_manager": {
              "status": true
            },
            "be_mfa_enabled": false
          }
        }
      },
      "subscriber": "00000000-0000-4000-8000-000000000002",
      "tenant": "00000000-0000-4000-8000-000000000001",
      "timestamp": 1781012844314
    }
  ]
}
```

</details>

## Audit Log Events

Audit log deliveries use `eventType: "AUDIT_LOG"`. Each object in `events[]` is an audit log event.

### Audit Log Envelope

```json
{
  "signature": "quilr.ai",
  "source": "quilr-entities-service",
  "eventType": "AUDIT_LOG",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "77777777-7777-4777-8777-777777777777",
  "version": "1.0",
  "priority": "INFO",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {},
  "events": [ ... ]
}
```

### Sample Audit Log Payload

```json
{
  "source": "quilr-entities-service",
  "eventType": "AUDIT_LOG",
  "tenantId": "00000000-0000-4000-8000-000000000001",
  "forwarderType": "WEBHOOK",
  "correlationId": "77777777-7777-4777-8777-777777777777",
  "priority": "INFO",
  "events": [
    {
      "subscriber": "00000000-0000-4000-8000-000000000002",
      "tenant": "00000000-0000-4000-8000-000000000001",
      "service_name": "quilr-entities-service",
      "event_code": "USR-001",
      "category": "USER_MANAGEMENT",
      "resource_type": "USER",
      "resource": "user@example.com",
      "task": "CREATE_USER",
      "status": "SUCCESS",
      "log_level": "INFO",
      "actioned_by": "admin@example.com",
      "actioned_at": "2024-01-15T10:30:00.000Z",
      "correlation_id": "77777777-7777-4777-8777-777777777777",
      "error_info": {},
      "extra_info": {}
    }
  ]
}
```
