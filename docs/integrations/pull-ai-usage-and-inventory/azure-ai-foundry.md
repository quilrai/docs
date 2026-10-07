---
sidebar_position: 4
sidebar_label: "Azure AI Foundry"
sidebar_custom_props:
  icon: Cloud
---

# Azure AI Foundry

The Azure AI Foundry integration discovers agents, projects, models, access, and governed activity in your Azure subscriptions. The connector performs read-only discovery and monitoring; it does not perform Foundry write actions.

| | |
|---|---|
| **Capabilities** | Pull inventory, Pull compliance data |
| **Direction** | Into Quilr |
| **Category** | Cloud agent platform |

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library', 'Azure AI Foundry']} />

**Status:** delivers data from the current console.

## Where it shows up

- **Overview › Agentic estate**: the **Azure AI Foundry** tab under **Connected platforms**.
- **Agents**: the **Azure AI Foundry** source coverage chip; Foundry agents appear in the agent list.
- **Graph**: the **Foundry** sensor chip.
- **Settings › Organization › Data sources**: an **Included in console** toggle. See [Data sources](../../console/settings-organization/data-sources).

## Set it up

Setup is a four-step drawer. You use a service principal that you own; no Quilr-owned Entra application or redirect URI is needed.

### 1. Prepare the Azure account

1. In Microsoft Entra ID, create an app registration for accounts in this organization only. Record its **Directory (tenant) ID** and **Application (client) ID**.
2. Under **Certificates & secrets**, create a client secret and copy the secret **Value** (not the secret ID).
3. For every subscription Quilr should monitor, assign these roles to the app's service principal at subscription scope:

| Role | Why Quilr needs it |
|------|--------------------|
| **Reader** | Discover subscriptions and Azure AI resources. |
| **Foundry User** | Read Foundry agent and project data-plane resources. |
| **Log Analytics Reader** | Read connected Azure Monitor and Log Analytics telemetry. |

The drawer shows the role definition IDs and an Azure CLI template for the role assignments. Repeat the assignments for each subscription.

:::note
The Foundry User role includes broad Foundry data-plane actions and permission to list Cognitive Services account keys. Quilr uses it for read-only discovery and monitoring only.
:::

### 2. Connect the service principal

Enter **Connection name**, **Directory (tenant) ID**, **Application (client) ID**, and **Client secret value**, then click **Check credentials**. The secret is encrypted for your Quilr tenant and is never returned.

### 3. Choose subscriptions

Quilr lists the Azure subscriptions it can see, with the effective access for **Management**, **Foundry**, and **Log Analytics**. Select the subscriptions to monitor. **Check Azure access** re-checks permissions. Click **Save subscriptions**.

### 4. Configure project monitoring

For each discovered project, the table shows its generation (for example foundry or foundry classic), an **Inventory** and a **Conversations** checkbox, and a status with counts of agents, deployments, and threads. Choose what to monitor and click **Save monitoring**. **Refresh projects** re-runs discovery; projects that fail show an inline error.

## Related

- [How integrations work](../get-started/how-integrations-work)
