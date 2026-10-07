---
sidebar_position: 2
sidebar_label: "OpenAI Compliance"
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
| **OpenAI API key** | Used to validate the scope. The console never reads the stored credential back. |
| **Scope** | **Workspace** (authorize one OpenAI workspace) or **Organization** (authorize an organization and its configured workspaces). |
| **Workspace ID** | Required for the Workspace scope. |
| **Data to synchronize** | **Activity**, **Inventory**, and **Enable synchronization**. A configuration with synchronization disabled keeps its historical authorization but does not sync. |

Click **Connect credential**.

## Manage credentials and scopes

The **Manage** view lists each credential (masked) with its status, when data was last collected, and its scopes. Each scope shows its type (Organization or Workspace), what it syncs (activity, inventory), and a status such as **READY** or **DISABLED**.

- **Add scope** authorizes another workspace or organization with the same credential.
- **Manage** on a scope changes what it syncs.
- **Disconnect** pauses synchronization. Historical data stays available, and you must re-enter the credential before you can reactivate it or change its scope.

The card's badge summarizes credentials, for example "2 ACTIVE · 0 DISCONNECTED".

## Related

- [How integrations work](../get-started/how-integrations-work)
- [Claude Compliance API](./claude-compliance-api)
