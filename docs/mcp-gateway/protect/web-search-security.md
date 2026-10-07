---
sidebar_position: 7
sidebar_label: "Web search security"
sidebar_custom_props:
  icon: Globe
description: "Connect Zscaler Internet Access and apply its URL decisions, URL overrides and group domain exclusions to QuilrAI Web Search."
---

# Web search security

Apply your Zscaler Internet Access (ZIA) URL policy to the [QuilrAI Web Search](../quilr-provided-mcps/web-search) MCP, so agents can only open web pages your users are allowed to visit.

Setup has two parts: connect ZIA once for your tenant, then set the policy on the **QuilrAI Web Search** server.

:::note
This policy applies only to the built-in **QuilrAI Web Search** server. Other MCP servers are not affected.
:::

## Connect ZIA

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', '...']}
  action="ZIA integration"
/>

![ZIA integration panel with Not connected status, ZIA base URL, API key, Admin username, Admin password and Connect ZIA](/img/mcp-gateway/ui/zia-integration.png)

1. Enter the **ZIA base URL**, for example `https://zsapi.zscaler.net`.
2. Enter the **API key**, **Admin username** and **Admin password** of a ZIA admin account.
3. Click **Connect ZIA**.

The status changes to **Connected** and shows how many ZIA groups and departments are available. Credentials are not displayed again. To change them, enter new values and connect again.

## Set the policy

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'QuilrAI Web Search card', 'Configure']}
  action="General"
/>

Scroll to **Web Search policy** ("Apply ZIA-backed group policy and explicit URL overrides to web-search results").

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

## Going further with the Policy Engine

The **Web Search Security** card (stage 4, Response) in **Govern > Policy Engine > MCP Gateway** carries the same controls as policy effects: ZIA timeout, URL overrides, excluded domains and a result domain action. Edits join a shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

Scenarios the card supports beyond the server setting:

- **Exclude domains outright.** List domains such as paste sites or raw file hosts as **excluded domains** and set **result domain action** to `block`, independent of the ZIA lookup.
- **Different rules per group or agent.** Match **smart groups**, **user email** or **agent name**, for example a stricter exclusion list for contractors.
- **Pair with token saving.** One response rule can also turn on **smart JSON compression** and **HTML to text** for search results.

<PolicyCard
  name="compress_and_fence_search"
  stage="response"
  priority={400}
  when={[{ field: "MCP name", op: "is", value: "Web Search" }]}
  then={[
    { effect: "smart JSON compression", value: "true" },
    { effect: "HTML to text", value: "true" },
    { effect: "excluded domains", values: ["pastebin.com", "raw.githubusercontent.com"], tone: "info" },
    { effect: "result domain action", value: "block" },
  ]}
/>

## Related

- [QuilrAI Web Search](../quilr-provided-mcps/web-search) - the MCP this policy applies to.
- [Server access](./server-access) - limit who can use QuilrAI Web Search.
- [Security guardrails](./security-guardrails) - scan search results for sensitive data.
- [Tool visibility](./tool-visibility) - turn individual web search tools on or off.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
