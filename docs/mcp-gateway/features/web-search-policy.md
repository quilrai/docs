---
sidebar_position: 8
sidebar_custom_props:
  icon: Globe
---

# Web Search Policy

Apply your Zscaler Internet Access (ZIA) URL policy to the QuilrAI Web Search MCP, so agents can only open web pages your users are allowed to visit.

Setup has two parts: connect ZIA once for your tenant, then set the policy on the **QuilrAI Web Search** server.

:::note
This policy applies only to the built-in **QuilrAI Web Search** server. Other MCP servers are not affected.
:::

## Connect ZIA

Go to **Settings > AI Gateway > MCP Gateway**, open the **...** menu in the header and choose **ZIA integration**.

![ZIA integration panel with Not connected status, ZIA base URL, API key, Admin username, Admin password and Connect ZIA](/img/mcp-gateway/ui/zia-integration.png)

1. Enter the **ZIA base URL**, for example `https://zsapi.zscaler.net`.
2. Enter the **API key**, **Admin username** and **Admin password** of a ZIA admin account.
3. Click **Connect ZIA**.

The status changes to **Connected** and shows how many ZIA groups and departments are available. Credentials are not displayed again. To change them, enter new values and connect again.

## Set the policy

On the **QuilrAI Web Search** server card, click **Configure > General** and scroll to **Web Search policy** ("Apply ZIA-backed group policy and explicit URL overrides to web-search results").

![Web Search policy card with ZIA check timeout, ZIA URL overrides and Groups with domain exclusions switches](/img/mcp-gateway/ui/settings-web-search-policy.png)

| Setting | What it does |
|---------|--------------|
| **ZIA check timeout** | Maximum seconds to wait for a ZIA decision before assuming the URL is allowed. |
| **ZIA URL overrides** | One URL or domain per line. These values override the ZIA lookup. |
| **Groups with domain exclusions** | A switch per smart group. Turn it on for the groups that receive domain exclusions in their search results. |

Click **Save settings** in the footer to apply your changes.

## How it works

1. An agent asks QuilrAI Web Search to open one or more web pages.
2. The gateway looks up the person's ZIA groups and department and checks each URL with ZIA, applying your **ZIA URL overrides** first.
3. URLs ZIA blocks for that person are removed. The rest are fetched and returned.

Because the check uses the person's own ZIA identity, web search results follow the same ZIA URL policy that applies to that person.

## Related

- [Access control](./access-control) - limit who can use QuilrAI Web Search.
- [Security Guardrails](./security-guardrails) - scan search results for sensitive data.
- [Tools Management](./tools-management) - turn individual web search tools on or off.
