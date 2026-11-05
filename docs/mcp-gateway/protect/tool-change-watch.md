---
sidebar_position: 5
sidebar_label: "Tool change watch"
sidebar_custom_props:
  icon: History
description: "Get notified when a server adds, removes or changes tools, and approve or dismiss each change."
---

# Tool change watch

Updated on 3 November 2026.

Review new tools and changes to existing tools before they become available to AI apps. **Tool updates** in the MCP Gateway header gathers changes across servers; each server also has controls under **Configure > Tools**.

## Gateway approval for new tools

Open **Settings > AI Gateway > MCP Gateway > Tool updates**. The **New tools wait for approval** switch is the gateway default for servers that use that setting. A server can choose its own rule under **Configure > Tools**.

When approval is on, a newly offered tool is hidden from AI apps and agents until an administrator approves it. Tools present when the server was first added are not held by this new-tool gate. Review a server in the queue to inspect what it offers before deciding.

This is a tool-update setting, not a switch between classic settings and the Policy Engine. Approval does not bypass published access, confirmation or guardrail rules.

## Choose what happens

Open the server's **Configure > Tools** section to choose its update behavior. When the upstream list is watched, the **Upstream tool changes** area shows **Last checked** and **Check now**.

![Classic per-server upstream tool-change settings](/img/mcp-gateway/ui/settings-tool-changes.png)

| Update behavior | Result |
|---|---|
| **Tell me about changes** | Flag differences for an administrator to review; clients keep the previous list until approval. |
| **Update tools automatically** | Apply detected tool-list changes automatically. |
| **Don't watch this MCP** | Stop watching this server for list changes. |

Save server settings after changing their behavior. The gateway approval setting applies only to servers that use the gateway setting; check the server's own rule when its behavior differs.

## Review a change

The **Tool updates** queue distinguishes newly offered tools from **Changed upstream**: changed descriptions or input schemas, and tools that disappeared since the gateway last recorded the server's list. AI apps keep the previous list while those changes await review.

1. Open **Tool updates** in the gateway header or the review action on a server card.
2. Choose **Review** for the server.
3. Inspect the tool names, descriptions and schema differences. An AI-written **Added risk** summary can help, but review the underlying change before deciding.
4. **Approve** to apply the change, or **Dismiss** to keep the current list.

Approval and dismissal take effect immediately. Check [tool access](./tool-visibility) and [confirmation](./human-approval) before making a newly approved capability available to callers.

## Servers that can't be watched

WhiteMatter can only check servers it can reach with its own credentials. For these servers the card says why it isn't watching:

| Server | Card message |
|--------|--------------|
| OAuth servers where each user signs in | This MCP signs in per user; refresh it from the console. |
| **OAuth passthrough** servers | This MCP passes each client's own upstream token through. |
| Servers where each user brings their own API key | Connect this MCP with your own upstream API key before using it. |
| API MCPs | This API MCP's tools come from its gateway API configuration. |

For these, click **Refresh tools** in the **Tools** section to fetch the current list whenever you need it.

## Related

- [Tool visibility](./tool-visibility) - enable, disable and inspect tools.
- [Human approval](./human-approval) - ask the user before a tool runs.
- [OAuth Connect](../servers-and-connections/oauth-connect) - connect OAuth servers so their tools can be listed.
