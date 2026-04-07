---
sidebar_position: 1
sidebar_custom_props:
  icon: Layers
---

# Overview

Claude Compliance gives your organization visibility into Claude.ai usage by connecting to Anthropic's Compliance API. Once you register a Compliance API key, the platform continuously fetches your organization's activity data and runs DLP scanning on all user inputs - surfacing findings directly in the dashboard.

## What it provides

| Capability | Description |
|------------|-------------|
| **Activity feed** | Full log of user actions: logins, chat interactions, file uploads, and administrative events |
| **Organizations & users** | List of all organizations under your parent org and their member users |
| **Chats & files** | Chat message content and file attachments from user sessions |
| **Projects** | Project names, descriptions, instructions, and attached documents |
| **DLP findings** | Automatic scanning of all user inputs for sensitive data - PII, credentials, financial data, and more |

## How it works

1. **Register a Compliance API key** - your `sk-ant-api01-…` key is validated and stored securely. The plaintext key is never exposed after registration.
2. **Data is synced automatically** - organizations, users, chats, projects, and activities are fetched from the Compliance API on a regular schedule.
3. **Inputs are scanned for DLP** - user message text, file attachments, and project content are scanned and classified by severity.
4. **Findings are surfaced** - DLP results are available through the dashboard, filtered by time, severity, user, and more.

## DLP severity levels

| Level | Triggers |
|-------|----------|
| **CRITICAL** | SSN patterns, credit card numbers, API/secret keys, private key blocks |
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
| `project_instruction` | The system prompt / instructions field of a project |
| `project_file` | Text files attached to a project |

---

**Next:** See [Key Management](./key-management) to learn how to register, monitor, and revoke Compliance API keys.
