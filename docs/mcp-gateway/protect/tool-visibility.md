---
sidebar_position: 3
sidebar_label: "Tool visibility"
sidebar_custom_props:
  icon: Wrench
description: "Turn individual tools on or off per server, review read-only, write and destructive tools, and view input schemas."
---

# Tool visibility

Choose which of a server's tools AI agents can call. Disabled tools are hidden from every client, so agents never see them in their tool list.

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Tools"
/>

You can also open **Overall analytics > Settings**, select one server and choose **Tools**. The section subtitle shows how many tools are exposed, for example **12 of 15 exposed**.

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

## Going further with the Policy Engine

When the Policy Engine is on for the MCP Gateway, the **Tools** section turns read-only and shows **Controlled by Policy Engine**. Tool availability then comes from two cards in **Govern > Policy Engine > MCP Gateway**:

| Card | Stage | What a deny does |
|------|-------|------------------|
| **Discovery Visibility** | 2, Discovery | Removes the tool from the list the agent is offered. |
| **Invocation** | 3, Request | Refuses the call if the agent calls the tool anyway. |

Use both. An agent that cached an earlier tool list can still attempt a call, so hiding a tool alone is not enough. Edits join a shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

Scenarios the cards support that the **Tools** switches cannot:

- **Hide tools by what they do, across servers.** Match the tool's `read_only`, `destructive`, `idempotent` or `open_world` annotations, its tags or its risk, instead of switching tools off one by one.
- **Hide tools from some callers only.** Combine a tool condition with **smart groups**, **user email** or **agent name**, for example hide write tools from one AI client.
- **Hide resources and prompts.** Besides tools, Discovery Visibility can deny MCP resources (by URI, template, name or MIME type) and prompts (by name), which have no switch in server settings.

<PolicyCard
  name="hide_destructive_github_tools"
  priority={850}
  rules={[
    {
      label: "Rule 1 - runs on discovery",
      when: [
        { field: "MCP name", op: "is", value: "GitHub" },
        { field: "Tool is destructive", op: "is", value: "true" },
      ],
      then: [{ effect: "Tool call access", value: "deny" }],
    },
    {
      label: "Rule 2 - runs on request",
      when: [
        { field: "MCP name", op: "is", value: "GitHub" },
        { field: "Tool is destructive", op: "is", value: "true" },
      ],
      then: [{ effect: "Tool call access", value: "deny" }],
    },
  ]}
/>

## Related

- [Human approval](./human-approval) - what approvers see in each AI client.
- [Tool change watch](./tool-change-watch) - review upstream tool changes before agents see them.
- [Input aliases](./input-aliases) - translate mismatched tool inputs from AI clients.
- [Security guardrails](./security-guardrails) - scan tool inputs and results.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
