---
sidebar_position: 1
sidebar_label: "Claude Compliance API"
description: "Bring Claude.ai activity, chats, files and projects into QuilrAI with an Anthropic Compliance Access Key: prerequisites, key registration, sync and verification."
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

<ConsolePath console="QuilrAI console V1" path={['Settings', 'Compliance', 'Claude']} />

:::note Where to set it up
Install the **Claude Compliance** card from **Settings › Integrations › Library**, and register the Compliance Access Key under **Settings › Compliance › Claude** in [Console V1](../../console/legacy-v1/overview).
:::

## Before you start

You need a Claude Enterprise organization with the Compliance API turned on, and an Anthropic **Compliance Access Key**:

1. The primary owner turns on the Compliance API in claude.ai under **Organization settings › API**.
2. In the **Keys** section of the same page, the primary owner (or an organization owner, for that organization only) clicks **Create key**.
3. Select the read scopes QuilrAI uses: `read:compliance_activities`, `read:compliance_user_data` and `read:compliance_org_data`. QuilrAI does not need `delete:compliance_user_data`.
4. Copy the key (it starts with `sk-ant-api01-`). Anthropic shows it only once.

A key created for the parent organization covers every linked organization. Admin API keys (`sk-ant-admin01-`) and Claude API keys (`sk-ant-api03-`) do not work. See Anthropic's [Set up the Compliance API](https://platform.claude.com/docs/en/manage-claude/compliance-api-access).

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

1. **Register a Compliance Access Key.** Your `sk-ant-api01-…` key is validated and stored securely. The plaintext key is never exposed after registration.
2. **Data syncs automatically.** Organizations, users, chats, projects, and activities are fetched from the Compliance API about every 5 minutes.
3. **Inputs are scanned for DLP.** User message text, file attachments, and project content are scanned and classified by severity.
4. **Findings are surfaced** and can be filtered by time, severity, user, and more.

## Register a key

In Console V1, open **Settings › Compliance › Claude**, click **Add Key** and enter the Compliance Access Key.

The key is validated immediately with a live call to the Compliance API. If it cannot authenticate, registration is rejected with "Compliance API key validation failed", and nothing is stored. If the Compliance API cannot be reached, the error is "Could not reach compliance API"; try again later. A key that is already registered shows "This API key is already registered." Once registered, the key is encrypted at rest and the plaintext is never returned or logged.

## Sync and verification

After registration, Quilr automatically:

- **Syncs data** about every 5 minutes: the latest organizations, users, chats, projects, and activity events. Organizations covered by the key are discovered automatically.
- **Runs DLP scans** on all new user inputs since the last pass.
- **Tracks sync state** per key. Each key keeps its own sync timestamp.

Failed calls to Anthropic are retried with backoff. To verify the first sync, check that the key shows **Active** and that Claude activity appears in [Findings and interactions](../../console/observe/findings-and-interactions) within a few sync cycles. As long as the key stays valid with Anthropic, data continues to be fetched and scanned.

| Key status | Meaning |
|------------|---------|
| **Active** | Registered and syncing. |
| **Revoked** | Removed and no longer synced. |

If data stops arriving, check in claude.ai that the key still exists and that the Compliance API is still on. While the Compliance API is off, Anthropic records no activity, and that activity cannot be recovered later.

## Revoke a key

In **Settings › Compliance › Claude** (Console V1), find the key and click **Revoke**. A revoked key is removed from all future sync and DLP passes. Data already fetched and scanned stays in the system unless it is explicitly deleted.

:::note
Revoking a key in QuilrAI does **not** invalidate it with Anthropic. To fully disable access, delete the key in claude.ai under **Organization settings › API**.
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
