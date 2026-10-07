---
sidebar_position: 1
sidebar_label: "Claude Compliance API"
sidebar_custom_props:
  icon: Layers
---

# Claude Compliance API

The Claude Compliance integration gives your organization visibility into Claude.ai usage through Anthropic's Compliance API. After you register a Compliance API key, Quilr continuously fetches your organization's activity and runs DLP scanning on user inputs, surfacing findings in the console.

| | |
|---|---|
| **Capabilities** | Pull compliance data, Pull inventory |
| **Direction** | Into Quilr |
| **Category** | Compliance provider |

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library', 'Claude Compliance']} />

## What it provides

| Capability | Description |
|------------|-------------|
| **Activity feed** | User actions: logins, chat interactions, file uploads, and administrative events |
| **Organizations and users** | All organizations under your parent org and their member users |
| **Chats and files** | Chat message content and file attachments from user sessions |
| **Projects** | Project names, descriptions, instructions, and attached documents |
| **DLP findings** | Automatic scanning of user inputs for sensitive data such as PII, credentials, and financial data |

## How it works

<StepFlow
  steps={[
    { label: 'Register key', items: ['Validated against the Compliance API', 'Stored encrypted'] },
    { label: 'Sync', items: ['Orgs, users, chats', 'Projects, activity'] },
    { label: 'DLP scan', items: ['Messages, files', 'Project content'] },
    { label: 'Findings', items: ['Filter by time, severity, user'] },
  ]}
/>

1. **Register a Compliance API key.** Your `sk-ant-api01-…` key is validated and stored securely. The plaintext key is never exposed after registration.
2. **Data syncs automatically.** Organizations, users, chats, projects, and activities are fetched from the Compliance API on a regular schedule.
3. **Inputs are scanned for DLP.** User message text, file attachments, and project content are scanned and classified by severity.
4. **Findings are surfaced** and can be filtered by time, severity, user, and more.

## Register a key

Install **Claude Compliance** from **Settings › Integrations › Library** and enter your Anthropic Compliance API key (`sk-ant-api01-…`).

The key is validated immediately. If it cannot authenticate with the Compliance API, registration is rejected and nothing is stored. Once registered, the key is encrypted at rest and the plaintext is never returned or logged.

## Keep keys active

After registration, Quilr automatically:

- **Syncs data** on a regular schedule: the latest organizations, users, chats, projects, and activity events.
- **Runs DLP scans** on all new user inputs since the last pass.
- **Tracks sync state** per key. Each key keeps its own sync timestamp.

No action is needed to keep a key active. As long as the key stays valid with Anthropic, data continues to be fetched and scanned.

| Key status | Meaning |
|------------|---------|
| **Active** | Registered and syncing normally. |
| **Sync error** | The last sync failed. Check that the key is still valid with Anthropic. |
| **Revoked** | Removed and no longer synced. |

## Revoke a key

Open the integration, find the key, and click **Revoke**. A revoked key is removed from all future sync and DLP passes. Data already fetched and scanned stays in the system unless it is explicitly deleted.

:::note
Revoking a key in QuilrAI does **not** invalidate it with Anthropic. To fully disable Compliance API access, contact your Anthropic representative.
:::

## DLP severity levels

| Level | Triggers |
|-------|----------|
| **CRITICAL** | SSN patterns, credit card numbers, API and secret keys, private key blocks |
| **HIGH** | Passwords shared in chat, bearer tokens |
| **MEDIUM** | Email addresses, phone numbers |
| **LOW** | IP addresses |
| **NONE** | No signals detected |

## Data sources scanned

| Source | What is scanned |
|--------|-----------------|
| `chat_message` | User turn text in a chat conversation |
| `chat_file` | Text files attached to chat messages |
| `project_description` | The description field of a project |
| `project_instruction` | The system prompt or instructions field of a project |
| `project_file` | Text files attached to a project |

## Related

- [How integrations work](../get-started/how-integrations-work)
- [OpenAI Compliance](./openai-compliance)
