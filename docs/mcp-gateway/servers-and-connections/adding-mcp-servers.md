---
sidebar_position: 1
sidebar_label: "Adding MCP servers"
sidebar_custom_props:
  icon: Plug
---

# Adding MCP Servers

Register a remote MCP server by its URL, install one from the MCP Library, or add a local package or a REST API.

Go to **Settings > AI Gateway > MCP Gateway** and click **Add MCP server**. The drawer asks **Where does this MCP run?**

![Add MCP drawer with Remote server selected, the Name, Slug and Transport URL fields, the Quilr gateway endpoint preview and the How the gateway signs in choices](/img/mcp-gateway/ui/add-mcp-remote.png)

| Choice | Use it for | Next |
|--------|------------|------|
| **Remote server** | An MCP server you reach by URL. Always on. | Steps below |
| **Local package (CLI MCP)** | A Python or Node MCP that runs on each user's computer, version pinned | [Local MCP: Administrator Setup](../local-mcp/admin-setup) |
| **API** | A REST API turned into tools, from its OpenAPI spec or as generic HTTP calls | [API to MCP](./api-to-mcp) |

The **MCP Gateway Smart Assist** panel at the bottom of the drawer answers setup questions, such as which sign-in method to choose or why a connection check failed. Keep keys and credentials out of the chat.

## Add a remote server

The drawer walks through **Connection > Credentials > Registered**.

1. Enter a **Name**. This is what users see in their AI app.
2. Optionally enter a **Slug**. It is derived from the name when left blank. The **Quilr gateway endpoint** preview shows the URL agents will call.
3. Enter the **Transport URL**: the server's Streamable HTTP or SSE endpoint, including `https://`.
4. Optionally add a **Description**. It is shown beside the server wherever it is listed.
5. Under **How the gateway signs in**, choose a mode (see below).
6. Optionally open **Custom headers & query parameters (optional)**.
7. Click **Probe and continue** (or **Continue** if you chose a mode yourself).
8. Finish the **Credentials** step if one appears, then click **Create MCP**.

The server is registered and its settings open. Its tools stay off until you enable them in **Tools**.

### How the gateway signs in

![How the gateway signs in, with Auto-detect (recommended) selected and OAuth passthrough and Upstream API key as the other choices](/img/mcp-gateway/ui/add-mcp-remote-auth.png)

| Mode | What happens |
|------|--------------|
| **Auto-detect (recommended)** | The gateway probes the server once and follows what it reports. No sign-in: the server is created. OAuth: the **Connect with OAuth** step opens. A key without OAuth: the **Upstream API key** step opens. |
| **OAuth passthrough** | Each client's own bearer token is forwarded to the server unchanged. The gateway holds no credential. Passthrough servers are direct-connection only and are not available through [OneMCP](../get-started/onemcp). |
| **Upstream API key** | The gateway holds a key and attaches it to every call it forwards. |

**Connect with OAuth** shows the **OAuth callback URL** to register in your OAuth app. If the server registers its own client, **OAuth client ID** and **OAuth client secret** are optional. Otherwise enter them from an OAuth app you created with the provider. See [MCP Provider Setup](../provider-setup/overview) for provider steps.

**Upstream API key** fields:

| Field | Options |
|-------|---------|
| **Upstream API key** | The key value |
| **Authentication scope** | **Shared by the whole tenant** (one key serves every user) or **Each user brings their own** (each user enters their own key on the user dashboard or in OneMCP) |
| **Authentication placement** | **Authorization bearer header**, **Custom header** or **Query parameter** |
| **Value prefix** | Optional scheme placed before the key, for example `Bearer` |

To change the sign-in later, open the server's **Settings > General > Upstream authentication**.

### Custom headers and query parameters

Static values sent on every call to this server, regardless of its sign-in method. Agents never see them, and their values can't be read back after saving. Use them for a tenant ID, a region or a header the server needs before it will answer.

For a server inside your private network, allowlist the gateway IPs listed in [MCP Library: Internal MCPs](./mcp-library#internal-mcps).

## Connect an OAuth server as an administrator

An OAuth server can't list its tools until an administrator signs in to it once. Until then it shows **Awaiting connection**, and the page shows a banner.

1. Click **Review all** on the banner (or **Connect** and the server name when only one is waiting), or **Connect OAuth** on the server card.
2. In **General**, under **Connect OAuth to discover tools**, click **Connect to fetch capabilities** and sign in.
3. If you signed in already, click **Already connected? Refresh**.

General then reads **OAuth is connected and the gateway has discovered N tools.** This sign-in is administrator-only. Users still connect their own accounts. See [OAuth Connect](./oauth-connect).

## Install from the Library

Click **Library** to browse ready-made remote servers and local packages.

![MCP Library drawer with the search box, Status, Type and Sign-in filters, and catalog rows with Install and Set up buttons](/img/mcp-gateway/ui/library.png)

| Button | When |
|--------|------|
| **Install** | The MCP needs no setup. It installs at once. |
| **Set up** | The MCP needs an API key or a custom OAuth app. Enter the key, or the **OAuth client ID** and **OAuth client secret** (register the **OAuth callback URL** shown), then click **Install**. |

Users who can't install can click **Request**. Their requests appear under **Requested by your team** at the top of the MCP Library, and the **Library** button shows a count. See [MCP Library](./mcp-library).

## Related

- [MCP Library](./mcp-library) - filters, requests and uninstalling.
- [API to MCP](./api-to-mcp) - add a REST API.
- [Local MCP](../local-mcp/overview) - run an approved package on the user's computer.
- [Tool visibility](../protect/tool-visibility) - enable the tools after you add a server.
