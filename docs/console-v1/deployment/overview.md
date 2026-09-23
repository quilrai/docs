---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
description: "Tenant configuration, enterprise prerequisites, deployment choices, and the Endpoint Agent package boundary."
---

# Deployment Prerequisites

Deploy the QuilrAI Browser Extension and native Browser Agent manually or centrally through Group Policy, Microsoft Intune, or Jamf Pro.

**Central deployment:** Open **Settings > Browser Extension > Deployment** to obtain the tenant-specific configuration. Complete deployment in Group Policy Management, Microsoft Intune, or Jamf Pro.

**Manual installation and prerequisites:** Follow the [QuilrAI installation instructions](https://installdocs.quilrai.dev/sop/).

**Configuration and options:** Choose a computer-side GPO, Intune device policy, or Jamf computer policy. Keep the tenant ID, extension ID, manifest URL, package architecture, Full Disk Access profile, assignment scope, retries, and detection rules under change control.

**Role-specific value:** Security Administrators own deployment configuration and scope; endpoint and directory administrators implement GPO or MDM assignments; Security Engineers validate policy, process, connectivity, and telemetry.

**Verification:** Targeted devices receive the extension and native agent, show enterprise-managed policy, run the native process, and appear active in QuilrAI Deployment Status.

## Enterprise deployment prerequisites

| Requirement | GPO | Intune or Jamf |
| --- | --- | --- |
| Tenant ID | Required in the native-agent argument and extension manifest URL. | Required in the Windows command or macOS pre-install configuration; portal-generated extension profiles are tenant-specific. |
| Administrative access | Group Policy Management plus permission to link a computer GPO. | Intune Administrator or equivalent; Jamf Pro administrator for macOS deployment. |
| Package access | UNC file share readable by target computer accounts. | Current EXE/PKG and portal-generated JSON or mobileconfig. |
| Browser policy templates | Chrome or Edge ADMX/ADML templates available in the policy store. | Not required when importing the portal-generated policy/profile. |
| Network | HTTPS 443 to the approved tenant, extension-update, authentication, and DLP endpoints. | Same network requirement on every managed endpoint. |
| macOS | Not applicable. | Correct Intel/Apple Silicon PKG; deploy Full Disk Access before the PKG. |

The enterprise deployment examples use extension ID `piajhjohgigijkddhdpgbjdcfhmammbk` and manifest URL `https://quilr-extensions.quilr.ai/<TENANT_ID>/manifest.xml`. Obtain the tenant ID from QuilrAI support or the provisioning administrator. Confirm the current tenant configuration and package URLs before production deployment.

![Settings > Browser Extension > Deployment with MDM provider, browser, operating system, deployment instructions, and tenant-specific configuration download.](/img/console-v1/browser-extension-deployment.png)

*Settings > Browser Extension > Deployment with MDM provider, browser, operating system, deployment instructions, and tenant-specific configuration download.*

## Choose a deployment method

| Method | Coverage | Procedure |
| --- | --- | --- |
| Group Policy | Windows browser policies and native Browser Agent installation | [Deploy with Group Policy](./group-policy) |
| Microsoft Intune | Windows and macOS packages and tenant extension profiles | [Deploy with Microsoft Intune](./microsoft-intune) |
| Jamf Pro | macOS native package, Full Disk Access, and extension profile | [Deploy with Jamf Pro](./jamf-pro) |

## Endpoint Agent deployment boundary

The GPO and MDM procedures in this guide cover the Browser Extension and native Browser Agent. For the standalone Endpoint Agent, use the tenant-provided package and platform deployment instructions, then configure it in **Settings > Endpoint**. The guide does not provide a standalone Endpoint Agent silent-install command. Confirm the package with QuilrAI before reusing any Browser Agent commands. See the [Endpoint Agent prerequisites](../../endpoint-agent/requisites/quick-start).

![Endpoint Deployment Management controls used after the tenant-approved Endpoint Agent package is deployed.](/img/console-v1/endpoint-deployment-management.png)

*Endpoint Deployment Management controls used after the tenant-approved Endpoint Agent package is deployed.*

**Expected result:** The enterprise deployment is assigned through GPO, Intune, or Jamf with tenant-specific configuration and documented scope.

**Verification:** Confirm management-platform success, local files and processes, browser policy, QuilrAI Deployment Status, and a safe telemetry event before expanding the assignment.

Continue with [deployment validation](./validation) before expanding the assignment.
