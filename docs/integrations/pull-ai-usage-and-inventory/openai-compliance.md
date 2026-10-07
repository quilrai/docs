---
sidebar_position: 2
sidebar_label: "OpenAI Compliance"
description: "Connect a ChatGPT Enterprise or Edu workspace with an OpenAI Admin key: prerequisites, fields, first sync timing and verification."
sidebar_custom_props:
  icon: ShieldCheck
---

# OpenAI Compliance

The OpenAI Compliance integration brings OpenAI organization compliance events and governed inventory into Quilr, so ChatGPT workspace activity shows up next to the activity your sensors capture.

| | |
|---|---|
| **Capabilities** | Pull compliance data, Pull inventory |
| **Direction** | Into Quilr |
| **Category** | Compliance provider |

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library', 'OpenAI Compliance']} />

QuilrAI validates your key when you connect it and then syncs on its own.

## Before you start

- A **ChatGPT Enterprise or Edu** workspace. OpenAI offers its Compliance Platform only on these plans.
- An OpenAI **Admin key** with compliance access, scoped to the workspace. See OpenAI's [Compliance Platform for Enterprise and Edu customers](https://help.openai.com/en/articles/9261474) and its guide to managing Admin keys. QuilrAI checks the key's permissions when you connect it and adapts to what is available.
- Your **Workspace ID** (a UUID) or, for the Organization scope, your **Organization ID** (it starts with `org-`).

## What it brings in

| Data | What it covers |
|------|----------------|
| **Activity** | New compliance activity, interactions, and costs |
| **Inventory** | Users, agents, skills, and organization inventory |

## Where it shows up

- **Overview › Agentic estate**: the **OpenAI** tab under **Connected platforms**.
- **Agents**: the **OpenAI Compliance** source coverage chip; OpenAI agents appear in the agent list.
- **Graph**: the **OpenAI** sensor chip.
- **Findings & Interactions**: the **Sensor** filter, plus OpenAI-specific fields in **More filters**.
- **Costs & Savings**: OpenAI appears as a source of spend and tokens.
- **Settings › Organization › Data sources**: an **Included in console** toggle for OpenAI. See [Data sources](../../console/settings-organization/data-sources).

## Connect a credential

Install **OpenAI Compliance** from the **Library** tab, or click **Manage** on the installed card and then **Add credential**.

| Field | Description |
|-------|-------------|
| **OpenAI API key** | The Admin key with compliance access. Used to validate the scope. The console never reads the stored credential back. |
| **Scope** | **Workspace** (authorize one OpenAI workspace) or **Organization** (authorize an organization and its configured workspaces). |
| **Workspace ID** or **Organization ID** | Matches the scope. A workspace ID must be a UUID; an organization ID starts with `org-`. |
| **Workspace IDs** | Organization scope only. Comma-separated workspace IDs; required when you sync inventory, optional for activity only. |
| **Data to synchronize** | **Activity**, **Inventory**, and **Enable synchronization**. A configuration with synchronization disabled keeps its historical authorization but does not sync. |

Click **Connect credential**.

## First sync and verification

| What | Timing |
|------|--------|
| First activity sync | Looks back 30 days. |
| Ongoing activity sync | About every 5 minutes. |
| Inventory | Refreshed about every 6 hours. |

To verify the first sync, check that **Manage** shows a recent last-collected time for the credential and that OpenAI activity appears under the **Sensor** filter in [Findings and interactions](../../console/observe/findings-and-interactions).

## Manage credentials and scopes

The **Manage** view lists each credential (masked) with its status, when data was last collected, and its scopes. Each scope shows its type (Organization or Workspace), what it syncs (activity, inventory), and a status: **PREPARING**, **READY** or **DISABLED**.

- **Add scope** authorizes another workspace or organization with the same credential.
- **Manage** on a scope changes what it syncs.
- **Disconnect** pauses synchronization. Historical data stays available, and you must re-enter the credential before you can reactivate it or change its scope.

The card's badge summarizes credentials, for example "2 ACTIVE · 0 DISCONNECTED".

## Related

- [How integrations work](../get-started/how-integrations-work)
- [Claude Compliance API](./claude-compliance-api)
