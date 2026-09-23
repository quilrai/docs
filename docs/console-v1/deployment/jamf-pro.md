---
sidebar_position: 4
sidebar_custom_props:
  icon: Layers
description: "Deploy the macOS Browser Agent, Full Disk Access profile, tenant configuration, and browser extension with Jamf Pro."
---

# Deploy with Jamf Pro

Use the architecture-appropriate macOS package and the tenant-generated configuration profiles. Complete the [deployment prerequisites](./overview) first.

## Deploy the native agent and extension

1. Upload the architecture-appropriate `QuilrInstaller.pkg` under Settings > Computer Management > Packages.

2. Upload the Full Disk Access mobileconfig under Computers > Configuration Profiles and scope it to the target computers before the package policy runs.

3. Create a script that writes `tenant = <TENANT_ID>` to `/tmp/agent.conf`. Add it to the deployment policy with **Priority: Before**.

4. Create a policy with Recurring Check-in and Once per computer. Add the tenant script, then the PKG with Action: Install, and scope the policy to the approved computers or smart group.

5. For the extension, download the tenant mobileconfig from Settings > Browser Extension > Deployment. Upload it to Computers > Configuration Profiles, use Computer Level and Install Automatically, define scope, and save.

![Jamf Pro Configuration Profiles area used to upload the tenant mobileconfig and Full Disk Access profile.](/img/console-v1/jamf-configuration-profiles.png)

*Jamf Pro Configuration Profiles area used to upload the tenant mobileconfig and Full Disk Access profile.*

![Jamf Pro computer-level profile configured for automatic extension deployment.](/img/console-v1/jamf-automatic-deployment.png)

*Jamf Pro computer-level profile configured for automatic extension deployment.*

## Validate deployment

Follow the [validation procedure](./validation). Confirm that Full Disk Access and the tenant configuration were deployed before the native package.
