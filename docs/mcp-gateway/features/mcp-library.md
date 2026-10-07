---
sidebar_position: 1
sidebar_custom_props:
  icon: LibraryBig
---

# MCP Library

Install ready-made MCP servers and local packages without entering URLs. The MCP Library includes provider-native servers and MCPs built by Quilr across productivity, developer tools, data, communication, cloud, security and web search.

Go to **Settings > AI Gateway > MCP Gateway** and click **Library**.

![MCP Library drawer with the search box, Status, Type and Sign-in filters, and catalog rows with Install and Set up buttons](/img/mcp-gateway/ui/library.png)

## Find an MCP

Type in **Search by name or what it does**, or filter:

| Filter | Options |
|--------|---------|
| **Status** | Installed, Not installed |
| **Type** | Remote (HTTP), Local package (stdio) |
| **Sign-in** | OAuth, API key, OAuth passthrough, No sign-in |

Each row shows whether it is a **Remote server** or a local package (with its runtime and version), how it signs in, and an **Installed** or **Inactive** tag once installed.

For what each Quilr-built MCP can do, see [Quilr-Provided MCPs](../../quilr-provided-mcps/overview).

## Install

| Button | What it does |
|--------|--------------|
| **Install** | Installs at once. Shown when the MCP needs no key and no custom OAuth app. |
| **Set up** | Opens the required setup fields. Complete them, then click **Install**. |
| **Review** | Opens a local package for review and approval. See [Local MCP: Administrator Setup](../local-mcp/admin-setup). |
| **Continue setup** | Opens the settings of an installed MCP that requires further setup. |
| **Settings** | Opens the settings of a configured MCP. |
| **Uninstall** | Removes the MCP and its configuration, after you confirm. |

**Set up** asks for one of:

- **API key**: the **Upstream API key**, **Authentication scope** (**Shared by the whole tenant** or **Each user brings their own**), placement and prefix. The key is stored at the gateway and never shown again.
- **Custom OAuth app**: register the **OAuth callback URL** shown in the provider's OAuth app, then enter the **OAuth client ID** and **OAuth client secret**. See [MCP Provider Setup](../mcp-provider-setup/overview) for provider steps.

After you install, the MCP appears in the server list. Enable its tools in **Settings > Tools**. If it uses OAuth, connect it once as an administrator (see [Adding MCP Servers](../adding-mcp-servers#connect-an-oauth-server-as-an-administrator)).

## Install requests from users

People who can't install MCPs see **Request** instead of **Install**. Their requests:

- Show as a count on the **Library** button and in the **Library queue** row of the **Tools reachable** tile.
- Are listed under **Requested by your team** at the top of the MCP Library, with the requester and request time.

Install the requested MCP from its row, or click **Dismiss** to clear the request.

## Add your own MCP server

To add an MCP that is not in the MCP Library, click **Add MCP server** to register a server by its URL, a REST API or a local package. See [Adding MCP Servers](../adding-mcp-servers).

## Internal MCPs

To register an MCP server hosted inside your private network, allowlist these Quilr gateway IPs on your firewall, VPC security group or reverse proxy so the gateway can reach it:

```
132.226.119.116
```

```
80.225.216.37
```

Once the URL is reachable from these IPs, add it with **Add MCP server** like any other remote server. Probing and tool calls come from the same addresses.

## Related

- [Adding MCP Servers](../adding-mcp-servers) - remote servers and sign-in modes.
- [OAuth Connect](./oauth-connect) - how admins and users connect OAuth servers.
- [Quilr-Provided MCPs](../../quilr-provided-mcps/overview) - what each Quilr-built MCP does.
