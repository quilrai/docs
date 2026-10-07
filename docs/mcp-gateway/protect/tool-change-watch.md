---
sidebar_position: 5
sidebar_label: "Tool change watch"
sidebar_custom_props:
  icon: History
---

# Tool change watch

MCP servers can add, remove or change tools. Quilr checks each server's tool list every hour. With the default setting, it tells you what changed so you can review new or changed tools before your users get them.

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Tools"
  note="The Upstream tool changes card sits above the tool list."
/>

![Upstream tool changes card with the When the upstream tool list changes selector, Last checked time and the Check now button](/img/mcp-gateway/ui/settings-tool-changes.png)

## Choose what happens

Pick an option in **When the upstream tool list changes**, then click **Save settings**.

| Option | What happens |
|--------|--------------|
| **Tell me about changes** (default) | Quilr checks hourly and flags changes here for you to apply. Your clients see the old tool list until you approve. |
| **Update tools automatically** | Quilr checks hourly and applies the new tool list automatically. |
| **Don't watch this MCP** | Quilr stops checking this MCP for tool changes. |

**Last checked** shows when Quilr last compared the list. Click **Check now** to compare immediately.

## Review a change

When a change is waiting, the card says **This MCP changed N tools upstream. What your clients see is unchanged until you approve it.** The change is listed in three parts.

| List | What it shows |
|------|---------------|
| **New upstream** | Tools the server added. Hover a name to read its description. |
| **Gone from upstream** | Tools the server no longer offers. |
| **Changed upstream** | Tools whose **Description** or **Input schema** changed, with the removed words struck through and the added words highlighted. |

An **Added risk** note summarizes what the change could expose. It is written by an AI model, so read the change itself before you decide.

| Button | Result |
|--------|--------|
| **Approve** | Your clients receive the new tool list immediately. |
| **Dismiss** | The tool list stays as it is. A different change is flagged again. |

Approve and Dismiss take effect immediately; you don't need to save. A newly approved tool is enabled like any other tool, so turn off or require confirmation for it in the tool list if needed.

## Servers that can't be watched

Quilr can only check servers it can reach with its own credentials. For these servers the card says why it isn't watching:

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
