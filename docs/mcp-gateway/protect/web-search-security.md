---
sidebar_position: 7
sidebar_label: "Web search security"
sidebar_custom_props:
  icon: Globe
description: "Connect Zscaler Internet Access and apply its URL decisions, URL overrides and group domain exclusions to QuilrAI Web Search."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Web search security

Updated on 3 November 2026.

Apply your Zscaler Internet Access (ZIA) URL policy to the [QuilrAI Web Search](../quilr-provided-mcps/web-search) MCP, so agents can only open web pages your users are allowed to visit.

<VideoEmbed id="mcp-web-security" />

Setup has two parts: connect ZIA once for your tenant, then set the policy on the **QuilrAI Web Search** server.

:::note
This policy applies only to the built-in **QuilrAI Web Search** server. Other MCP servers are not affected.
:::

## Connect ZIA

<ConsolePath
  console="WhiteMatter console"
  path={['Settings', 'AI Gateway', 'MCP Gateway', '...']}
  action="ZIA integration"
/>

![ZIA integration panel with Not connected status, ZIA base URL, API key, Admin username, Admin password and Connect ZIA](/img/mcp-gateway/ui/zia-integration.png)

1. Enter the **ZIA base URL**, for example `https://zsapi.zscaler.net`.
2. Enter the **API key**, **Admin username** and **Admin password** of a ZIA admin account.
3. Click **Connect ZIA**.

The status changes to **Connected** and shows how many ZIA groups and departments are available. Credentials are not displayed again. To change them, enter new values and connect again.

Choose the instructions for the mode that governs your MCP Gateway. See [Switching from classic settings](../../console/govern/switching-from-classic-settings) for what happens to stored settings when the engine is on.

<Tabs groupId="gateway-configuration-mode" defaultValue="policy">
<TabItem value="classic" label="Classic settings">

## Set the policy

<ConsolePath
  console="WhiteMatter console"
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

</TabItem>
<TabItem value="policy" label="Policy Engine">

## Going further with the Policy Engine

Open **Govern > Policy Engine > MCP Gateway > Controls > Web Search Security**. ZIA credentials remain managed through **ZIA integration**; policy rules decide the search restrictions.

| Section | Use it for | How matching rules combine |
|---|---|---|
| **Excluded domains** | Domains to exclude from web search. | Matching lists combine; priority is not used. |
| **Result domains** | Allow or deny results by their domains. | Highest numeric priority wins; Deny wins ties. |
| **URL overrides and timeout** | Explicit URL decisions and the ZIA check timeout. | Each setting combines separately; the timeout uses the smallest positive value. |

1. Choose a recipe or start a blank rule in the section.
2. Select callers, groups, agents or the Web Search server under **Applies to**, then set the domains, outcome or timeout.
3. Check **Reads as**, **Save to draft**, then [test and publish](../../console/govern/author-simulate-and-publish).

With no matching rule, no domains are excluded, result domains are allowed, and ZIA decides without an override. The default check timeout is 10 seconds per batch. Use a specific outcome and caller scope rather than assuming all overlapping rules are restrictive in the same way.

</TabItem>
</Tabs>

## How it works

1. An agent asks QuilrAI Web Search to open one or more web pages.
2. The gateway looks up the person's ZIA groups and department and checks each URL with ZIA, applying your **ZIA URL overrides** first.
3. URLs ZIA blocks for that person are removed. The rest are fetched and returned.

Because the check uses the person's own ZIA identity, web search results follow the same ZIA URL policy that applies to that person.

## Related

- [QuilrAI Web Search](../quilr-provided-mcps/web-search) - the MCP this policy applies to.
- [Server access](./server-access) - limit who can use QuilrAI Web Search.
- [Security guardrails](./security-guardrails) - scan search results for sensitive data.
- [Tool visibility](./tool-visibility) - turn individual web search tools on or off.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
