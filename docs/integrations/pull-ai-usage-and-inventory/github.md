---
sidebar_position: 5
sidebar_label: "GitHub"
sidebar_custom_props:
  icon: GitBranch
---

# GitHub

The GitHub integration discovers repositories, AI projects, workflows, and related developer inventory, so you can see where AI is used in your engineering estate.

| | |
|---|---|
| **Capabilities** | Pull inventory, Pull compliance data |
| **Direction** | Into Quilr |
| **Category** | Developer tool |

<ConsolePath console="QuilrAI console" path={['Settings', 'Integrations', 'Library', 'GitHub']} />

You connect a GitHub App that your organization owns (the drawer asks for its slug, client ID and client secret, and shows the OAuth callback URL to register in the app), then attach the installations it can access. Quilr scans only the default-branch head and syncs on the **Synchronization interval** you choose, for example 3 hours. Stopping sync never removes existing Inventory or Findings results.

## Where it shows up

- **Inventory**: discovered repositories and related developer assets.
- **Graph**: the **GitHub** sensor chip.
- **Findings & Interactions**: the **Sensor** filter, plus GitHub-specific fields in **More filters**.
- **Settings › Organization › Data sources**: an **Included in console** toggle. See [Data sources](../../console/settings-organization/data-sources).

## Install

1. Open **Settings › Integrations › Library**.
2. Click **Install** on the **GitHub** card and follow the steps in the drawer.
3. Check the card on the **Installed** tab. If it shows an error badge instead of **INSTALLED**, open it to see the error.

## Check that it works

After the first sync, discovered repositories appear in **Inventory**, and GitHub results appear under the **Sensor** filter in [Findings and interactions](../../console/observe/findings-and-interactions).

## Related

- [How integrations work](../get-started/how-integrations-work)
