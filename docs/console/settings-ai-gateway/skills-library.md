---
sidebar_position: 1
sidebar_label: "Skills Library"
sidebar_custom_props:
  icon: Sparkles
description: Curate, scan and install Agent Skills for your organization, review Skills people submit, and publish installed Skills to Claude Code and Claude desktop.
console_path: [/settings/skills, /settings/skills/installed, /settings/skills/discovered, /settings/skills/library, /settings/skills/sources, /settings/skills/publishing]
aliases: [skills, skills library, skill catalog, installed skills, discovered skills, skill sources, skill repositories, upload skill, skill submissions, skill security scan, publish skills, claude code skills, claude desktop skills, skills marketplace, marketplace token]
---

# Skills Library

Agent Skills are packaged instructions, scripts and resources that AI coding tools and assistants load on demand. The Skills Library is where you curate, scan and distribute Skills: find the Skills already in use on your endpoints, import Skills from public GitHub repositories or upload your own, review what people submit, install approved Skills for an audience, and publish them to AI coding tools.

<ConsolePath console="QuilrAI Console" path={['Settings', 'AI Gateway', 'Skills Library']} />

The page has five tabs: **Installed**, **Discovered**, **Library**, **Sources** and **Publishing**. Each tab has its own address, so a link or a reload opens the same tab. **Add repository** and **Upload Skill** sit in the page header on every tab.

## Summary tiles

| Tile | Shows |
|---|---|
| Installed | Skills installed for your organization |
| Discovered | Skills seen on endpoints, from sanitized discovery evidence |
| High risk / Critical | Skills rated high or critical risk, which need administrator attention |
| Token savings | Estimated token savings from compression, or **Compression pending** |

## Skill details

Select a Skill's name on any tab to open its details: overview, security scan, capability evidence, declared tools and dependencies, compatibility requirements, instructions, file manifest and validation diagnostics. Read the instructions and the file manifest before you install or approve a Skill.

### Security scan

Every Skill is scanned in the background after it is added. The scan combines automated pattern checks with an AI review, and each finding shows its severity, category, source (**AI review** or **Pattern check**) and the file and line it came from.

| Scan result | Meaning |
|---|---|
| Not scanned | The scan has not run yet. |
| Completed | Every file in the package was reviewed. |
| Partial | Part of the package was too large to review. The files not reviewed are listed. |
| Rules only | Only the pattern checks ran. An AI review was not available. |
| Refused | The AI review declined to assess the package. Review it manually before installing. |

Skills that contain scripts are tagged with a script count, so you can see them before you review or install.

:::note
A scan, like provenance and license metadata, is evidence to weigh, not a guarantee that a Skill is safe.
:::

## Installed

Skills installed for your organization. Each row shows the Skill's source and version, audience, security scan, compression, distribution channels (Self Service and Claude Code), declared capabilities, risk and criticality. A **Required in Claude Code** tag marks Skills that install automatically.

- **Settings** opens **Configure Skill**, where you change the audience, the requested compression and whether the Skill is required in Claude Code.
- **Uninstall** records the installation as uninstalled. History and the pinned package remain.

## Discovered

Skills the Endpoint Agent has seen on devices, whether or not you installed them. For each Skill you see the applications using it, devices and users, scope, risk, criticality, what the agent reports for it (approval and execution state) and when it was last seen. Use this tab to find unvetted Skills already in use.

To block or unblock a discovered Skill, select **Manage in Inventory**. Skill rules are managed in one place, in [Inventory](../observe/inventory) and the [Endpoint Agent Policy Engine](../../endpoint-agent/policy-engine/files-skills-packages-apps-accounts#skills).

## Library

Skills available from your sources. Each entry shows provenance, license, package tokens, compatibility, declared capabilities, security scan and state. Review a Skill here, then select **Install**. Selecting a repository on **Sources** opens the Library filtered to that repository's Skills.

## Sources

The repositories and uploads the Library is built from. Each source shows its kind, pinned commit, import summary (discovered, conformant, compatible, quarantined, imported and failed), license and trust, and refresh state.

| Action | What it does |
|---|---|
| **Review** | Shown on a Skill submitted from Self Service. Approve or reject it. See [Review a submitted Skill](#review-a-submitted-skill). |
| **Refresh** | Resolves the latest repository state to a new immutable commit. Existing installations stay pinned to the version they were installed from. Not shown for uploads. |
| **Disable** | Stops the source refreshing. Installed snapshots and audit history remain. |

:::tip
Pinning a source to a commit means the Library does not change silently when the upstream repository changes. Refresh deliberately, and review what changed.
:::

## Add Skills to the Library

### Add a public GitHub repository

1. Select **Add repository** in the page header.
2. Enter the **Repository URL**, for example `https://github.com/owner/repository`. Only public github.com repositories are accepted.
3. Select **Add and refresh**. The repository is imported and pinned to an immutable commit, and you land on **Sources**.

Refreshes run only when you start them, and never follow other hosts.

### Upload a Skill

1. Select **Upload Skill** in the page header.
2. Drop or choose a Skill package: a `.zip` with `SKILL.md` at its root or in one folder, or a single `SKILL.md`. Up to 8 MB.
3. Tick **I confirm this organization has the right to distribute this Skill to its users.**
4. Select **Upload**.

Uploading the same Skill name again adds a new version. Earlier versions stay installable, and nothing reaches users until you install it for an audience.

### Review a submitted Skill

People can propose Skills from Self Service with **Submit a Skill**. A submission waits on **Sources** with a **Review** button, and a banner shows how many are waiting. Submitted Skills stay out of the Library until approved.

1. On **Sources**, select **Review** on the submission.
2. Select **Open Skill details** and read its instructions and files. Skills that include scripts deserve a closer look.
3. Optionally add a **Note to the submitter**.
4. Select **Approve** or **Reject**.

Approving adds the Skill to the Library. It reaches people only after you install it for an audience. The submitter sees the outcome under **Your submissions** in Self Service.

## Install a Skill

1. On **Library**, find the Skill and review its provenance, license, declared capabilities and security scan. Open the Skill's details for scan findings.
2. Select **Install**.
3. In the **Install** dialog, set:
   - **Audience**: **All users** (tenant-wide) or **Smart Group**. For a Smart Group, search for and pick one of your [Smart Groups](../settings-organization/smart-groups).
   - **Requested compression**: **Text compression · pending** or **Original package**.
   - **Required in Claude Code**: install the Skill automatically for everyone in the audience instead of offering it.
   - If the license is not MIT, Apache or BSD, tick **I attest that this tenant has distribution rights**. Uploaded Skills already carry the uploader's confirmation.
   - If the Skill declares shell/Bash or wildcard tool preapproval, read the declarations under **Administrator capability review** and tick **I reviewed these exact declarations for this immutable version**. QuilrAI records the version and a digest of the declarations as review evidence. This does not grant Endpoint permissions.
   - If the scan rated the version critical, enter a **Reason for overriding the scan**. It is recorded with the installation.
4. Select **Install for audience**. The Skill appears on **Installed**.

To change the audience, compression or the Claude Code requirement later, use **Settings** on the **Installed** tab.

## Self Service

Installed Skills are available to people in Self Service under **Skills**:

- **Available to you** lists the Skills shared with everyone or with their teams. People can copy a Claude Code install command, or download a Skill to unzip into their Skills folder or upload as a custom Skill in Claude's settings.
- **Your submissions** lists the Skills they submitted and each one's state: **Awaiting review**, **Approved**, **Not approved** or **Withdrawn by an admin**.

## Publishing

Publishing sends the Skills installed in QuilrAI to AI coding tools, so they arrive on people's computers and stay up to date. Pick the tool in **AI coding tool**:

| Tool | Status | How Skills arrive |
|---|---|---|
| Claude Code | Available | Required Skills install automatically, the rest are offered under `/plugin`. |
| Claude desktop | Available | Cowork, Chat and Code list your Skills under **Plugins → Organization**. |
| Claude.ai | Coming soon | |
| Codex | Coming soon | |
| Cursor | Coming soon | |
| GitHub Copilot | Coming soon | |

Both Claude tools read the same organization Skills feed with **one organization token**. Generating it is a one-time setup. The token is shown only once, so copy it or download the deployment files right away.

**Manage token** (under **Step 1 · Access**) has two actions:

- **Rotate token**: the current token stops working immediately, for Claude Code and Claude desktop alike. Redeploy the new token so every device keeps receiving updates.
- **Revoke token**: both tools stop receiving Skill updates immediately. Skills already installed on computers stay until they are removed there.

:::note Smart Group Skills
Skills installed for a Smart Group reach people only when the deployed file or helper includes each person's work email. Turn on **Include each person's work email** in the deploy step. The page warns you when Smart Group Skills would not reach anyone with the option you picked.
:::

### Claude Code

1. Open **Publishing**, pick **Claude Code** and select **Set up Claude Code**, then **Generate**.
2. In **Step 2 · Deploy to developer machines**, pick where you manage developer machines and follow the steps:

| Target | What you deploy |
|---|---|
| Intune · Windows | A platform script. Run it as SYSTEM with the 64-bit PowerShell host. |
| Jamf · macOS | A configuration profile, scoped to developer Macs. |
| Intune · macOS | A custom macOS configuration profile. |
| Linux | A script, run as root or through your configuration tool. |
| Claude admin console | Managed settings JSON, pasted into server-managed settings. |

The scripts add a drop-in file that merges with any Claude Code managed settings you already deploy. If you already ship a Claude Code profile on macOS, add the keys to it instead of installing a second profile. Smart Group Skills need **Intune · Windows** or **Jamf · macOS** with **Include each person's work email** turned on; the other targets deliver only Skills for all users.

3. Developers receive Skills automatically after deployment. QuilrAI cannot see which devices received the file.

### Claude desktop

Claude desktop must be set up for third-party inference. A Claude desktop signed in with a claude.ai account does not read an organization marketplace.

1. Open **Publishing**, pick **Claude desktop** and select **Set up Claude desktop**, then **Generate**. If you already deployed a token for Claude Code, paste it in **Token already deployed for Claude Code?** instead. It stays in your browser and fills the installers.
2. **Step 2 · Install the QuilrAI helper on each computer.** Claude desktop runs this small helper to send the token when it fetches Skills. Pick **Jamf · macOS**, **Intune · macOS** or **Intune · Windows** and download the installer. To try it on one computer first, run it in Terminal (`sudo sh quilr-skills-claude-desktop-macos.sh`) or in PowerShell as administrator. Turn on **Include each person's work email** for Smart Group Skills; where the signed-in account isn't the work email, deploy the email script or profile too.
3. **Step 3 · Add the QuilrAI marketplace.** Either in the app (**Help → Troubleshooting → Enable Developer Mode**, then **Developer → Configure Third-Party Inference → Plugins → Add marketplace → Marketplace URL**, enter the values shown, then **Apply Changes** or **Export** a profile for every computer), or add the `allowedPluginMarketplaces` value shown to the Claude desktop device profile you already deploy.
4. **Step 4 · People install their Skills.** Restart Claude desktop on each computer. Skills appear under **Plugins → Organization** and update on their own.

If the Skills don't appear:

| Claude desktop shows | Fix |
|---|---|
| `credentialHelper non-zero-exit` | The helper isn't at the path in the marketplace entry, or can't read the token. Run the installer again on that computer instead of copying files by hand. |
| `manifest name '...' does not match expectedName` | Set **Expected name** exactly as shown on the page. |
| The marketplace isn't found, or no Skills appear | The token was rotated or revoked, or the computer has an old one. Run the installer again with the current token. |

:::note
For some organizations whose Claude desktop already uses the QuilrAI LLM Gateway for inference, the page also offers **QuilrAI LLM gateway sign-in (no token)**. Claude desktop then reuses its gateway sign-in, and no token or helper is installed on computers: you only add the marketplace and restart. Contact your QuilrAI representative to enable it.
:::

## Related

- [Inventory](../observe/inventory)
- [Endpoint Agent Policy Engine: Skills](../../endpoint-agent/policy-engine/files-skills-packages-apps-accounts#skills)
- [Smart Groups](../settings-organization/smart-groups)
- [Endpoint Agent](../../endpoint-agent)
