---
sidebar_position: 3
sidebar_label: "Tool visibility"
sidebar_custom_props:
  icon: Wrench
---

# Tools Management

Choose which of a server's tools AI agents can call. Disabled tools are hidden from every client, so agents never see them in their tool list.

On the server card, under **Configure**, click **Tools**. You can also open **Overall analytics > Settings**, select one server and choose **Tools**. The section subtitle shows how many tools are exposed, for example **12 of 15 exposed**.

![Tools section with the Exposed to agents bar, the upstream tool changes card, and tool tables grouped into read-only, write and destructive tools with Enabled, Require confirmation and Require justification switches](/img/mcp-gateway/ui/settings-tools.png)

:::note Policy Engine
When the Policy Engine is on, tool permission policies decide which tools are available and which need confirmation. The **Tools** section turns read-only and shows **Controlled by Policy Engine**. See [MCP Gateway policies](../../console/govern/policy-engine#hiding-and-denying-a-tool).
:::

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
| **Require confirmation** | The user must approve each call before it runs. See [Tool confirmation](./human-approval). |
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

To enable a tool, or require confirmation, only for some people, add a rule in [Group & User Rules](./group-and-user-rules). A rule can set each tool's **Enabled**, **Confirmation** and **Justification** to **Inherit**, **On** or **Off** for one smart group or one user.

## Related

- [Tool confirmation](./human-approval) - what approvers see in each AI client.
- [Tool change watch](./tool-change-watch) - review upstream tool changes before agents see them.
- [Input aliases](./input-aliases) - translate mismatched tool inputs from AI clients.
- [Security guardrails](./security-guardrails) - scan tool inputs and results.
