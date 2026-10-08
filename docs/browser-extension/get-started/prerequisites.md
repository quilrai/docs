---
sidebar_position: 2
sidebar_label: "Prerequisites"
sidebar_custom_props:
  icon: Rocket
description: "Tenant configuration, enterprise prerequisites, deployment choices, and the Endpoint Agent package boundary."
---

# Deployment prerequisites

Deploy the QuilrAI Browser Extension and its native Browser Agent manually or centrally through Group Policy, Microsoft Intune, or Jamf Pro. The Browser Agent is a small native process that runs beside the extension and handles device-level tasks such as [clipboard monitoring](../capabilities/clipboard-monitoring) and [file indexing](../capabilities/file-indexing).

- **Central deployment:** Get the tenant-specific extension policy (JSON for Windows, mobileconfig for macOS) from **Settings › Browser Extension** in the console or from your QuilrAI representative, then deploy it with Group Policy Management, Microsoft Intune, or Jamf Pro.
- **Manual installation:** Follow <SopLink track="browser-extension" step="manual-installation" /> in the [installation SOP](../deploy/installation-sop).
- **Change control:** Keep the tenant ID, extension ID, manifest URL, package architecture, Full Disk Access profile, assignment scope, retries, and detection rules under change control.
- **Ownership:** Security administrators own deployment configuration and scope; endpoint and directory administrators implement GPO or MDM assignments; security engineers validate policy, process, connectivity, and telemetry.

## Enterprise deployment prerequisites

| Requirement | GPO | Intune or Jamf |
| --- | --- | --- |
| Tenant ID | Required in the native-agent argument and extension manifest URL. | Required in the Windows command or macOS pre-install configuration; the extension profiles are tenant-specific. |
| Administrative access | Group Policy Management plus permission to link a computer GPO. | Intune Administrator or equivalent; Jamf Pro administrator for macOS deployment. |
| Package access | UNC file share readable by target computer accounts. | Current EXE/PKG and the tenant JSON or mobileconfig. |
| Browser policy templates | Chrome or Edge ADMX/ADML templates available in the policy store. | Not required when importing the tenant policy or profile. |
| Network | HTTPS 443 to the approved tenant, extension-update, authentication, and DLP endpoints. | Same network requirement on every managed endpoint. |
| macOS | Not applicable. | Correct Intel/Apple Silicon PKG; deploy Full Disk Access before the PKG. |

The deployment examples use extension ID `piajhjohgigijkddhdpgbjdcfhmammbk` and manifest URL `https://quilr-extensions.quilr.ai/<TENANT_ID>/manifest.xml`. Get the tenant ID from QuilrAI support or your provisioning administrator, and confirm the current tenant configuration and package URLs before production deployment.

![Browser extension deployment options with MDM provider, browser, operating system, and tenant-specific configuration download.](/img/console-v1/browser-extension-deployment.png)

## Choose a deployment method

| Method | Coverage | Procedure |
| --- | --- | --- |
| Group Policy | Windows browser policies and native Browser Agent installation | [Deploy with Group Policy](../deploy/group-policy) |
| Microsoft Intune | Windows and macOS packages and tenant extension profiles | [Deploy with Microsoft Intune](../deploy/microsoft-intune) |
| Jamf Pro | macOS native package, Full Disk Access, and extension profile | [Deploy with Jamf Pro](../deploy/jamf-pro) |

The [installation SOP](../deploy/installation-sop) walks through the same rollout step by step, and also covers Kandji, ManageEngine Endpoint Central and SCCM.

## Endpoint Agent is a separate package

These GPO and MDM procedures cover the Browser Extension and its native Browser Agent only. The standalone Endpoint Agent uses its own package, which you get from your QuilrAI representative; do not reuse Browser Agent install commands for it. See [Endpoint Agent requirements](../../endpoint-agent/get-started/requirements) and [Deployment and status](../../endpoint-agent/deploy-and-operate/deployment-and-status).

## Before you expand the rollout

Targeted devices should receive the extension and native agent, show the extension as enterprise-managed, run the native process, and report in **Users › Browser deployment**. Confirm each layer with the [deployment validation](../deploy/validate-deployment) steps on a pilot group before widening the assignment.
