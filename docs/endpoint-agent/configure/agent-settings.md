---
sidebar_position: 1
sidebar_label: "Agent settings"
sidebar_custom_props:
  icon: Wrench
---

# Agent settings

Tenant-wide Endpoint Agent behavior is set on one page in the console. These settings apply to every enrolled workstation. Per-app detection and enforcement rules are set separately in [App policies](./app-policies).

<ConsolePath console="QuilrAI console" path={['Settings', 'Endpoint Agent']} />

:::note Installers
Your QuilrAI representative supplies the agent packages (MSI, PKG, macOS configuration profiles and certificates). Follow the [installation SOP](../deploy-and-operate/installation-sop) to install them, and see [Deployment and status](../deploy-and-operate/deployment-and-status) to track coverage.
:::

## Deployment

| Setting | What it does |
| --- | --- |
| **Enable / Disable** | Turns the Endpoint Agent on or off for the whole tenant. Disabled agents stay installed but stop monitoring and enforcement. To switch off individual workstations instead, use **Users › Endpoint deployment**. |
| **Remote Log Collection** | Turns remote collection of agent logs on or off. |

Turning the agent off tenant-wide is also the fastest way to stop it everywhere during an incident. See [Agent kill switch](../deploy-and-operate/agent-kill-switch).

## Persona creation

Persona creation links activity on a workstation to a person, so findings and inventory show who did what.

| Option | What it does |
| --- | --- |
| **Enable Forced Login** | Requires the user to sign in before a persona is created. |
| **Only Allow to Read from Background** | Limits persona creation to identity read in the background. |

The console warns you if both options are off. Workstations that have no persona are counted under **Without persona** in **Users › Endpoint deployment**.

## Observed activity

The page has shortcuts to everything the agent feeds:

| Shortcut | Opens |
| --- | --- |
| **Application configuration** | Policy Engine › Endpoint Agent. See [App policies](./app-policies). |
| **Endpoint configuration** | Endpoint-level configuration under Policy Engine › Endpoint Agent. |
| **Assets** | [Inventory](../../console/observe/inventory). |
| **Findings & interactions** | [Findings and interactions](../../console/observe/findings-and-interactions). |
| **People** | [Users](../../console/observe/users). |
| **Deployment status** | Users › Endpoint deployment. See [Deployment and status](../deploy-and-operate/deployment-and-status). |
