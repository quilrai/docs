---
sidebar_position: 1
sidebar_label: "Agent settings"
sidebar_custom_props:
  icon: Wrench
console_path: /settings/endpoint-agent
aliases: [endpoint agent, desktop agent, endpoint sensor, fleet, device agent, remote log collection, endpoint configuration, PAC file, redirector, upstream proxy]
---

# Agent settings

Tenant-wide Endpoint Agent behavior is set on one page in the console. These settings apply to every enrolled workstation. The rules that decide what happens to prompts, files, skills, apps and accounts are set separately in the [Endpoint Agent Policy Engine](../policy-engine/overview).

<ConsolePath console="QuilrAI console" path={['Settings', 'Endpoint Agent']} />

:::note Installers
Your QuilrAI representative supplies the agent packages (MSI, PKG, macOS configuration profiles and certificates). Follow the [installation SOP](../deploy-and-operate/installation-sop) to install them, and see [Deployment and status](../deploy-and-operate/deployment-and-status) to track coverage.
:::

## Deployment

| Setting | What it does |
| --- | --- |
| **Endpoint Agent** | Turns the Endpoint Agent on or off for the whole tenant. Disabled agents stay installed but stop monitoring and enforcement. To switch off individual workstations instead, use **Users › Endpoint deployment**. |
| **Remote Log Collection** | Turns remote collection of agent logs on or off. |

Turning the agent off tenant-wide is also the fastest way to stop it everywhere during an incident. See [Agent kill switch](../deploy-and-operate/agent-kill-switch).

:::note
The **Endpoint Agent** switch is not **Pause enforcement**. Turning the agent off stops all monitoring, detection and enforcement on devices. To stop Policy Engine rules from blocking while the agent keeps monitoring and recording findings, use **Pause enforcement** in the Policy Engine. See [Turn on, turn off and pause](../policy-engine/turn-on-off-and-pause#pause-and-resume-enforcement).
:::

## Persona creation

Persona creation links activity on a workstation to a person, so findings and inventory show who did what.

| Option | What it does |
| --- | --- |
| **Enable Forced Login** | Requires the user to sign in before a persona is created. |
| **Only Allow to Read from Background** | Limits persona creation to identity read in the background. |

The console warns you if both options are off. Workstations that have no persona are counted under **Without persona** in **Users › Endpoint deployment**.

## Application Monitoring, Dependency scanning and policies

| Card | What it does |
| --- | --- |
| **Coverage & collection** | Holds **Application Monitoring**: which AI apps the Endpoint Agent monitors on devices, and in which browsers. Policies apply only to monitored apps. See [Application Monitoring is off for the app](../policy-engine/how-policies-are-evaluated#application-monitoring-is-off-for-the-app). |
| **Dependency scanning** | Checks the packages Claude Code installs for known vulnerabilities. See [Packages](../policy-engine/files-skills-packages-apps-accounts#packages). |
| **Policies** | **Open Policy Engine** opens the [Endpoint Agent Policy Engine](../policy-engine/overview), where you set rules for sensitive data and files. |

## Observed activity

The page has shortcuts to everything the agent feeds:

| Shortcut | Opens |
| --- | --- |
| **Endpoint configuration** | The **Endpoint Configuration** page, with the redirector, proxy and PAC settings that enrolled agents use. |
| **Assets** | [Inventory](../../console/observe/inventory). |
| **Findings & interactions** | [Findings and interactions](../../console/observe/findings-and-interactions). |
| **People** | [Users](../../console/observe/users). |
| **Deployment status** | Users › Endpoint deployment. See [Deployment and status](../deploy-and-operate/deployment-and-status). |
