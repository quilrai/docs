---
sidebar_position: 1
sidebar_label: "Skills Library"
sidebar_custom_props:
  icon: Sparkles
---

# Skills Library

Agent Skills are packaged instructions and tools that AI coding agents and assistants load on demand. The Skills Library lets you discover the skills already in use on your endpoints, vet skills from pinned public repositories, and install approved ones for your organization.

<ConsolePath console="QuilrAI Console" path={['Settings', 'AI Gateway', 'Skills Library']} />

## Summary tiles

| Tile | Shows |
|---|---|
| Installed | Skills you have installed for the organization |
| Discovered | Skills seen on endpoints |
| High risk/critical | Skills rated high or critical risk |
| Token savings | Estimated token savings from skills |

:::note
Distribution of installed skills to devices depends on Endpoint Agent delivery. The page shows a banner while this is pending.
:::

## Installed

Skills you have installed. Each shows its source and version, audience, compression, distribution, declared capabilities and risk. Use **Settings** to change how a skill is delivered, or **Uninstall** to remove it.

## Discovered

Skills that the Endpoint Agent has seen on devices, whether or not you installed them. For each skill you see the apps using it, the devices and users, its scope, its risk, and its approval and execution state. Use this tab to find unvetted skills already in use.

## Library

Skills available from your configured sources. Each entry shows provenance, license, package tokens, compatibility, declared capabilities, security evaluation status and install state. Review a skill here before installing it.

## Sources

The repositories the library is built from. Select **Add repository** to add one. Each source is pinned to a commit and shows an import summary and its license and trust status. **Refresh** re-imports a source.

:::tip
Pinning a source to a commit means the library does not change silently when the upstream repository changes. Refresh deliberately, and review what changed.
:::

## Add a repository and install a skill

1. On **Sources**, select **Add repository** and enter the **Repository URL**, for example `https://github.com/owner/repository`. Only public github.com repositories are accepted. **Add and refresh** imports the repository and pins it to an immutable commit.
2. When the import finishes, the source shows its **Pinned commit**, **Import summary** and **License / trust**.
3. On **Library**, find the skill and review its provenance, license, declared capabilities and security status. Select **Install**.
4. In the **Install** dialog for the skill, set:
   - **Audience**: **All users** (tenant-wide) or **Smart Group** (one [Smart Group](../settings-organization/smart-groups), entered by name).
   - **Requested compression**: **Original package**, or **Text compression · pending**, which the console marks as pending.
   - If the license is not MIT, Apache or BSD, tick **I attest that this tenant has distribution rights**.
   - If the skill declares shell/Bash or wildcard tool preapproval, read the declarations under **Administrator capability review** and tick **I reviewed these exact declarations for this immutable version**. Quilr records the version and a digest of the declarations as review evidence. This does not grant Endpoint permissions.
5. Select **Install for audience**. The skill appears on **Installed**.

The install dialog warns when security has not been evaluated: installing records your intent, it does not certify the package as safe.

To change the audience or compression later, use **Settings** on the **Installed** tab (**Configure Skill**).

### Refresh and disable a source

**Refresh repository** resolves the latest repository state to a new immutable commit. Existing installations stay pinned to the version they were installed from. Refreshes run only when you start them.

**Disable repository** stops the source refreshing. Installed snapshots and audit history remain.

## Related

- [Inventory](../observe/inventory)
- [Endpoint Agent](../../endpoint-agent)
