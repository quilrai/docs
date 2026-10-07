---
sidebar_position: 3
sidebar_label: "Turn an API into MCP tools"
sidebar_custom_props:
  icon: Plug
---

# Turn an API into MCP tools

Give AI apps controlled access to a REST API that has no MCP server. The gateway turns each API operation into a tool, holds the API key, and checks your access rules on every call before it contacts the API.

Open **Settings > AI Gateway > MCP Gateway**, click **Add MCP server** and choose **API** under **Where does this MCP run?** The setup has three steps: **Connection**, **Credentials** and **Tools & access**.

## When to use it

| Use | When |
|-----|------|
| **API** | The service has a REST API but no MCP server, or you want to expose only part of an API. |
| **Remote server** | The service already runs an MCP server. See [Adding MCP servers](./adding-mcp-servers). |
| **Local package (CLI MCP)** | The MCP must run on the user's own computer. See [Local MCP](../local-mcp/overview). |

## Connection

![Add MCP drawer with API selected, showing the Name, Slug and Base URL fields and a loaded OpenAPI spec summary with title, version, size and operation count](/img/mcp-gateway/ui/add-mcp-api-connection.png)

| Field | What to enter |
|-------|---------------|
| **Name** | The name people see in their AI app. |
| **Slug** | Optional. Derived from the name when left blank. Forms the gateway URL agents call. |
| **Base URL** | The full URL, including `https://`. Every tool call goes to a path under it. Private and loopback addresses are refused. |
| **Description** | Optional. Shown beside the API wherever it is listed. |

### OpenAPI spec

With a spec, each operation can become its own tool. Without one, agents get five generic HTTP tools.

| Source | How |
|--------|-----|
| **URL** | Paste the spec URL. Click **Add fetch header** if the spec requires authentication. |
| **Upload** | Select a spec file. |
| **Paste** | Paste the spec text. |
| **None** | Generic mode. No spec is used. |

The spec can be Swagger 2.0 or OpenAPI 3.x, JSON or YAML, up to 10 MiB. Click **Load spec**. The summary shows the **Title**, **Version**, **Size**, **Operations** (total and how many are supported), **Tags** and **Servers**. Nothing is saved yet. A loaded spec stays available for 30 minutes; after that, click **Reload spec**.

In generic mode agents get these tools, and your access rules decide which paths each call may reach:

| Tool | What it does |
|------|--------------|
| `api_get` | GET any path under the base URL, with query parameters |
| `api_post` | POST a JSON body to a path |
| `api_put` | PUT a JSON body to a path |
| `api_patch` | PATCH a JSON body to a path |
| `api_delete` | DELETE a path |

### API docs for the model

Optional. Paste Markdown or plain text, up to 1 MiB. This adds an `api_docs` tool the model can read before it calls anything. In generic mode, write docs so the model knows which paths exist.

### Advanced

| Setting | Default | Range |
|---------|---------|-------|
| **Timeout (seconds)** | 30 | 1 to 120 |
| **Max response size (KB)** | 64 | Longer responses are truncated. |

Click **Continue**.

## Credentials

![Credentials step with No authentication and API key options, the authentication scope, placement and value prefix fields, and the Sent on every call as preview](/img/mcp-gateway/ui/add-mcp-api-credentials.png)

Choose how the gateway signs in to the API. Agents never see the key.

| Option | When |
|--------|------|
| **No authentication** | The API is public, or it trusts the gateway's network. |
| **API key** | Store a key at the gateway. Set **Authentication scope** to **Shared by the whole tenant** or **Each user brings their own**. |

For an API key, select the **Authentication placement** (**Authorization bearer header**, **Custom header** or **Query parameter**) and an optional **Value prefix** such as `Bearer`. **Sent on every call as** previews the result, for example `Authorization: Bearer ****`. With **Each user brings their own**, the key you enter is your personal key; everyone else adds their own in the user dashboard before the tools work for them.

Under **Custom headers and query parameters**, add values sent on every call. The model never sees them.

OAuth isn't available for APIs. To change the key later, use **General > Upstream authentication** in the server's settings.

## Tools & access

### Access rules

![Access rules card with Start from preset, allow and deny rules, the path syntax hint and Test a request](/img/mcp-gateway/ui/add-mcp-api-access-rules.png)

Rules decide which operations become tools, and are checked again on every call. **Deny wins.** If there are allow rules, a request must match one. Inside a rule every field must match; values within a field are alternatives.

Select a starting point from **Start from**, then click **Add allow rule** or **Add deny rule** to adjust it.

| Preset | Rules |
|--------|-------|
| **Everything** | No rules. Every request is allowed. |
| **No deletes** | Deny `DELETE` requests. |
| **Read-only** | Allow only `GET` and `HEAD` requests. |

Each rule can match **Methods** (any method when none is selected), a **Path**, **Keywords** and, with a spec, **Tags**.

| Pattern | Matches | Example |
|---------|---------|---------|
| `*` | One path segment | `/contacts/*` matches `/contacts/123`, not `/contacts/123/notes` |
| `**` | Any number of segments | `/contacts/**` matches `/contacts/123/notes` |
| Keyword | A whole segment anywhere in the path | `orders` matches `/v2/orders/1`, not `/preorders` |

Paths are relative to the base URL and start with `/`.

**Test a request**: enter a method, a path and optional tags, then click **Test**. The result shows **Allowed** or **Blocked** with the rule that decided it, and which operation the request matches. Nothing is sent to the API.

A blocked call fails with the rule's reason and shows in **Logs** as a failed call. The API is not contacted.

### Operations

![Operations list grouped by tag with Auto, On and Off per operation, the selected count, and the Agents get N tools summary](/img/mcp-gateway/ui/add-mcp-api-operations.png)

With a spec, every operation is listed by tag with **N of N selected**. Filter by path, tool or summary, or show **All**, **Selected** or **Not selected**. Each row shows why it is or isn't a tool, for example **No rule blocks it** or **Blocked by deny[0]**.

| State | Meaning |
|-------|---------|
| **Auto** | Follows the rules. |
| **On** | Overrides the rules for this operation and makes it a tool. |
| **Off** | Overrides the rules for this operation and leaves it out. |

Use **Set all** on a tag to change a whole group. Open a row to set a **Tool name**, a **Description for the model**, or **Fixed parameters** that are sent on every call and hidden from the model.

Turn on **Also add generic HTTP tools** to add `api_get`, `api_post`, `api_put`, `api_patch` and `api_delete` for calls the spec doesn't cover. The access rules still apply.

At least one operation must be selected, or the generic tools added, before you can create the API.

### Tools summary

![Agents get 16 tools summary listing the tool names, the Also add generic HTTP tools switch, and the Create API MCP button](/img/mcp-gateway/ui/add-mcp-api-summary.png)

**Agents get N tools** lists the tool names agents will see. In OneMCP each name includes this API's prefix. Custom headers, query parameters and fixed parameters are never shown to the model.

Click **Create API MCP**. The server's settings open so you can choose who can reach it and which tools need confirmation.

## After creation

The API MCP appears under the **API** tab of the server list. In the server's settings:

| Section | What you do there |
|---------|-------------------|
| **API** | Review the base URL, timeout, spec, access rules and the tools each operation became. |
| **Tools** | Turn tools on or off and require confirmation. See [Tools management](../protect/tool-visibility). |
| **General > Upstream authentication** | Change the API key. |

## Related

- [Tool confirmation](../protect/human-approval) - ask the user before a write call runs.
- [Security guardrails](../protect/security-guardrails) - scan tool inputs and API responses.
- [OneMCP](../get-started/onemcp) - one endpoint for every MCP, including APIs.
