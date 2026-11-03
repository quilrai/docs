---
sidebar_position: 3
sidebar_label: "Tool visibility"
sidebar_custom_props:
  icon: Wrench
description: "Turn individual tools on or off per server, review read-only, write and destructive tools, and view input schemas."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tool visibility

Updated on 3 November 2026.

Choose what AI agents can discover and call on an MCP server. Classic settings use per-tool switches; the Policy Engine can decide listing, calling, and returning results separately.

Choose the instructions for the mode that governs your MCP Gateway. See [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what happens to stored settings when the engine is on.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Tools"
/>

Open **Configure > Tools** on the server card. The section subtitle shows how many tools are exposed, for example **12 of 15 exposed**.

![Tools section with the Exposed to agents bar, the upstream tool changes card, and tool tables grouped into read-only, write and destructive tools with Enabled, Require confirmation and Require justification switches](/img/mcp-gateway/ui/settings-tools.png)

## Tool groups

Tools are grouped by what they do to the upstream system.

| Group | What the tools do |
|-------|-------------------|
| **Read-only tools** | Only read data. |
| **Write tools** | Create or change data. |
| **Destructive tools** | Delete data or make irreversible changes. |

The **Exposed to agents** bar at the top shows how many tools in each group are enabled, for example **Write 3 / 4**.

## Per-tool controls

| Column | What it does |
|--------|--------------|
| **Tool** | Name and description. Click **View input schema** to see the inputs the tool accepts. |
| **Calls** | How many calls the tool has received. |
| **Enabled** | Off hides the tool from every client. |
| **Require confirmation** | The user must approve each call before it runs. See [Human approval](./human-approval). |
| **Require justification** | The user must type a reason to approve. Only available with confirmation on. |

Changes are drafts. Click **Save settings** in the footer to apply them.

## Find a tool

| Control | Use |
|---------|-----|
| **Search tools** | Filter by tool name or description. |
| **All / Read-only / Write / Destructive** | Show one group. Each tab shows its tool count. |

## Refresh the tool list

Click **Refresh tools** to fetch the server's current tool list. If the list is empty, the gateway hasn't fetched the tools yet; refresh, or connect OAuth first if the server needs it.

The **Upstream tool changes** card above the tool list watches for tools the server adds, removes or changes. See [Tool change watch](./tool-change-watch).

## Per group and per user

To enable a tool, or require confirmation, only for some people, add a rule in [Group and user rules](./group-and-user-rules). A rule can set each tool's **Enabled**, **Confirmation** and **Justification** to **Inherit**, **On** or **Off** for one smart group or one user.

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine

Open **Govern > Policy Engine > MCP Gateway > Controls > Invocation & Discovery**. This single panel replaces the separate Discovery Visibility and Invocation entry points. Its sections are **Tool calls**, **Resource reads**, and **Prompt fetches**.

Each configuration can decide one or more access steps:

| Step | What it decides |
|---|---|
| **Listed** | Whether the capability appears in discovery results. |
| **Callable** | Whether a tool call, resource read, or prompt fetch can run. |
| **Result** | Whether its result can return to the client. |

The **What happens at each step** table shows the steps each rule sets. **Unset** means that rule does not decide the step. A step is denied unless a matching rule allows it. For each decision, the highest numeric priority wins and **Deny** wins ties.

### Allow or block tools

1. Choose a recipe such as **Allow tools on a server**, **Allow selected tools**, **Block a tool**, or **Block destructive tools**.
2. Set **Applies to** and choose the server, tools, and caller conditions you need.
3. Check the steps the rule changes and its **Reads as** summary.
4. **Save to draft**, test the situation in **Test**, and [review and publish](../../console/govern/author-simulate-and-publish).

**Hide from listings only** changes discovery, not permission to call by name. An AI app may cache an old list, so use **Block a tool** when both listing and calling must stop. Argument-dependent recipes refuse matching calls; arguments are not available when a tool list is built.

Use **Read-only tools, confirm the rest** or **Allow and require confirmation** when tools should remain callable with user confirmation. The separate [Human Confirmation](./human-approval) control manages confirmation rules and exemptions.

### Resources, prompts and results

Resource recipes can match URI, template, name or MIME type; prompt recipes can match a prompt name. Result recipes can withhold unsuccessful or oversized results. A condition on the returned result belongs to the result step, rather than discovery.

Open **Activity** to investigate observed matches. Use **Test > Try a situation** or **Replay activity** to check the candidate rules before publishing.

</TabItem>
</Tabs>

## Related

- [Human approval](./human-approval) - what approvers see in each AI client.
- [Tool change watch](./tool-change-watch) - review upstream tool changes before agents see them.
- [Input aliases](./input-aliases) - translate mismatched tool inputs from AI clients.
- [Security guardrails](./security-guardrails) - scan tool inputs and results.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
